// api/rates.js — Carat Money Public Rate API
// Returns live 24K and 22K gold buy rates.
// Source: Augmont Spot (GOLDBLR999IND, Karnataka)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    const internal = await fetch('https://carat.money/api/rate');
    if (!internal.ok) throw new Error(`Upstream error: ${internal.status}`);
    const data = await internal.json();
    if (data.error) throw new Error(data.error);

    const raw  = Math.round(data.sellPerGram);
    const g24  = Math.round(raw * 1.03 * 0.975);
    const g22  = Math.round(g24 * 22 / 24);

    res.setHeader('Cache-Control', 's-maxage=55, stale-while-revalidate=10');
    return res.json({
      rates: {
        gold_24k: { price_per_gram: g24, unit: 'INR', purity: '24K' },
        gold_22k: { price_per_gram: g22, unit: 'INR', purity: '22K' },
      },
      note: 'GST-inclusive rates. Refreshed every 60 seconds.',
      source: 'Carat Money · carat.money',
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(503).json({ error: 'Rate temporarily unavailable', message: err.message });
  }
}
