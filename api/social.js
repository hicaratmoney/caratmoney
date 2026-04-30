// api/social.js — Social crawler meta tag injector
// Detects WhatsApp, Instagram, Telegram, and other social crawlers.
// Serves a lightweight HTML shell with correct OG meta tags injected.
// Real users get the normal React SPA via vercel.json rewrites.
//
// Usage: This is called via vercel.json rewrites for /blog/* paths when
// a social bot User-Agent is detected. Real users bypass this entirely.

const SITE = 'https://carat.money';

const ARTICLES = [
  {
    slug:     'is-your-gold-buyer-cheating-you',
    title:    'Is your gold buyer cheating you?',
    excerpt:  'Most gold buyers keep 10–15% above the spot rate. Here\'s exactly how to check their margin before you sell.',
  },
  {
    slug:     'what-is-gold-buyer-margin',
    title:    'What is gold buyer margin and why it matters',
    excerpt:  'Understanding the margin your buyer keeps is the single most important thing you can do before selling your gold.',
  },
  {
    slug:     'gold-selling-tips-bangalore',
    title:    'Selling gold in Bangalore: 5 things to know first',
    excerpt:  'Bangalore\'s gold buying market is active — but knowing these five things before you sell can make a significant difference.',
  },
];

// Social crawler User-Agent strings
const BOT_AGENTS = [
  'whatsapp', 'facebookexternalhit', 'twitterbot', 'telegrambot',
  'linkedinbot', 'slackbot', 'discordbot', 'instagram', 'pinterest',
  'applebot', 'googlebot', 'bingbot', 'duckduckbot', 'ia_archiver',
];

function isBot(ua = '') {
  const lower = ua.toLowerCase();
  return BOT_AGENTS.some(b => lower.includes(b));
}

export default function handler(req, res) {
  const ua   = req.headers['user-agent'] || '';
  const path = req.url || '';

  // Only intercept bot requests — real users fall through to React SPA
  if (!isBot(ua)) {
    res.setHeader('Location', path);
    return res.status(302).end();
  }

  // Extract slug from path e.g. /blog/some-slug
  const slugMatch = path.match(/\/blog\/([^/?#]+)/);
  const slug = slugMatch ? slugMatch[1] : null;

  const article = slug ? ARTICLES.find(a => a.slug === slug) : null;

  // Meta values
  const title   = article
    ? `${article.title} | Carat Money`
    : 'Gold Selling Tips & Insights | Carat Money Blog';
  const desc    = article
    ? article.excerpt
    : 'Expert articles on gold selling, buyer margins, and getting the best price for your gold in India.';
  const url     = article
    ? `${SITE}/blog/${article.slug}`
    : `${SITE}/blog`;
  const image   = article
    ? `${SITE}/api/og?slug=${article.slug}`
    : `${SITE}/api/og?slug=blog`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>

  <!-- Standard meta -->
  <meta name="description" content="${desc}"/>

  <!-- Open Graph (WhatsApp, Instagram, Facebook, Telegram) -->
  <meta property="og:type"        content="article"/>
  <meta property="og:url"         content="${url}"/>
  <meta property="og:title"       content="${title}"/>
  <meta property="og:description" content="${desc}"/>
  <meta property="og:image"       content="${image}"/>
  <meta property="og:image:width"  content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:site_name"   content="Carat Money"/>

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image"/>
  <meta name="twitter:title"       content="${title}"/>
  <meta name="twitter:description" content="${desc}"/>
  <meta name="twitter:image"       content="${image}"/>

  <!-- Redirect real users to the React SPA immediately -->
  <meta http-equiv="refresh" content="0;url=${url}"/>
</head>
<body>
  <p><a href="${url}">${title}</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
  res.status(200).send(html);
}
