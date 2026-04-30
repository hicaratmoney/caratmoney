// api/og.js — Dynamic OG image generator for blog articles
// Returns a 1200x630 SVG image for social sharing previews.
// Works with WhatsApp, Instagram, and Telegram.
//
// Usage: /api/og?slug=is-your-gold-buyer-cheating-you
//
// Vercel caches the response at the CDN edge for 7 days.

const ARTICLES = [
  {
    slug:     'is-your-gold-buyer-cheating-you',
    title:    'Is your gold buyer cheating you?',
    excerpt:  'Most gold buyers keep 10–15% above the spot rate. Here\'s exactly how to check their margin before you sell.',
    category: 'BUYER MARGINS',
  },
  {
    slug:     'what-is-gold-buyer-margin',
    title:    'What is gold buyer margin and why it matters',
    excerpt:  'Understanding the margin your buyer keeps is the single most important thing you can do before selling your gold.',
    category: 'GOLD BASICS',
  },
  {
    slug:     'gold-selling-tips-bangalore',
    title:    'Selling gold in Bangalore: 5 things to know first',
    excerpt:  'Bangalore\'s gold buying market is active — but knowing these five things before you sell can make a significant difference.',
    category: 'SELLING TIPS',
  },
];

// Wrap text into lines of max character width
function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

export default function handler(req, res) {
  const { slug } = req.query;

  const article = ARTICLES.find(a => a.slug === slug) || {
    slug:     'blog',
    title:    'Gold Selling Tips & Insights',
    excerpt:  'Expert articles on gold selling, buyer margins, and getting the best price for your gold in India.',
    category: 'CARAT MONEY BLOG',
  };

  const titleLines   = wrapText(article.title,   38);
  const excerptLines = wrapText(article.excerpt,  58);

  // Title text y positions
  const titleStartY  = 310;
  const titleLineH   = 58;
  // Excerpt text y positions
  const excerptStartY = titleStartY + titleLines.length * titleLineH + 28;
  const excerptLineH  = 32;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e0d38"/>
      <stop offset="100%" stop-color="#2b1450"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e0b765" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#e0b765" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Subtle top glow -->
  <ellipse cx="200" cy="0" rx="400" ry="200" fill="url(#glow)"/>

  <!-- Left gold accent bar -->
  <rect x="0" y="0" width="6" height="630" fill="#e0b765"/>

  <!-- Bottom right decorative dots -->
  <circle cx="1140" cy="580" r="3" fill="#e0b765" opacity="0.3"/>
  <circle cx="1160" cy="560" r="2" fill="#e0b765" opacity="0.2"/>
  <circle cx="1170" cy="590" r="2" fill="#e0b765" opacity="0.15"/>

  <!-- Logo mark (cm oval) — top left -->
  <g transform="translate(72, 52)">
    <!-- Outer oval -->
    <path d="M52 5 C 78 5 98 31 98 68 C 98 105 78 131 52 131 C 26 131 6 105 6 68 C 6 31 26 5 52 5 Z"
      fill="none" stroke="#e0b765" stroke-width="3.2"/>
    <!-- Inner oval -->
    <path d="M52 12 C 74 12 91 35 91 68 C 91 101 74 124 52 124 C 30 124 13 101 13 68 C 13 35 30 12 52 12 Z"
      fill="none" stroke="#e0b765" stroke-width="0.6" opacity="0.45"/>
    <!-- cm text -->
    <text x="52" y="90" text-anchor="middle"
      font-family="Georgia, serif" font-size="88" font-style="italic"
      fill="#e0b765" letter-spacing="-4">cm</text>
    <!-- Top dot -->
    <circle cx="52" cy="19" r="1.2" fill="#e0b765"/>
    <!-- Bottom dot -->
    <circle cx="52" cy="117" r="1.2" fill="#e0b765"/>
  </g>

  <!-- Wordmark -->
  <text x="190" y="98"
    font-family="Georgia, serif" font-size="38" font-weight="normal"
    fill="#e0b765" letter-spacing="-0.5">Carat Money</text>

  <!-- Category eyebrow -->
  <text x="72" y="230"
    font-family="'Courier New', monospace" font-size="18" font-weight="500"
    fill="#b8883a" letter-spacing="4">· ${article.category} ·</text>

  <!-- Gold divider line -->
  <line x1="72" y1="255" x2="480" y2="255" stroke="#e0b765" stroke-width="1" opacity="0.4"/>

  <!-- Article title -->
  ${titleLines.map((line, i) => `
  <text x="72" y="${titleStartY + i * titleLineH}"
    font-family="Georgia, serif" font-size="52" font-weight="normal"
    fill="#f1d78d" letter-spacing="-0.5">${line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`).join('')}

  <!-- Excerpt -->
  ${excerptLines.slice(0, 3).map((line, i) => `
  <text x="72" y="${excerptStartY + i * excerptLineH}"
    font-family="Arial, sans-serif" font-size="24"
    fill="#b8883a" opacity="0.9">${line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`).join('')}

  <!-- Bottom tagline -->
  <text x="72" y="598"
    font-family="'Courier New', monospace" font-size="16" font-weight="normal"
    fill="#e0b765" opacity="0.45" letter-spacing="3">· THE FAIR PRICE FOR GOLD · CARAT.MONEY ·</text>

</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 's-maxage=604800, stale-while-revalidate=86400');
  res.send(svg);
}
