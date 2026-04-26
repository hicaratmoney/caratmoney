module.exports = async function handler(req, res) {
  try {
    const page = await fetch('https://spot.augmont.com/liverates', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!page.ok) throw new Error(`Augmont fetch failed: ${page.status}`);
    const html = await page.text();

    // "Gold Without GST" sell value appears as a bold number in the table
    // Pattern: >151330< or similar — grab the first number after "Gold Without GST"
    const idx = html.indexOf('Gold Without GST');
    if (idx === -1) throw new Error('Gold Without GST not found in page');

    const snippet = html.slice(idx, idx + 500);
    const match = snippet.match(/>(\d{5,6})</);
    if (!match) throw new Error(`No price found near Gold Without GST. Snippet: ${snippet.slice(0, 200)}`);

    const sellPer10g = parseInt(match[1], 10);
    const sellPerGram = sellPer10g / 10;

    res.setHeader('Cache-Control', 's-maxage=55, stale-while-revalidate=10');
    return res.json({
      sellPer10g,
      sellPerGram,
      updatedAt: new Date().toISOString(),
      source: 'Gold Without GST @ spot.augmont.com/liverates',
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
