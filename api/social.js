// api/social.js — OG meta tag injector for blog article URLs
const SITE = 'https://carat.money';

const ARTICLES = [
  {
    slug:    'is-your-gold-buyer-cheating-you',
    title:   'Is your gold buyer cheating you?',
    excerpt: 'Most gold buyers keep 10–15% above the spot rate. Here\'s exactly how to check their margin before you sell.',
  },
  {
    slug:    'what-is-gold-buyer-margin',
    title:   'What is gold buyer margin and why it matters',
    excerpt: 'Understanding the margin your buyer keeps is the single most important thing you can do before selling your gold.',
  },
  {
    slug:    'gold-selling-tips-bangalore',
    title:   'Selling gold in Bangalore: 5 things to know first',
    excerpt: 'Bangalore\'s gold buying market is active — but knowing these five things before you sell can make a significant difference.',
  },
];

export default function handler(req, res) {
  // Second hit — user has already seen meta tags, serve SPA
  if (req.url && req.url.includes('spa=1')) {
    const fs = require('fs');
    const path = require('path');
    const html = fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  const path      = req.url || '';
  const slugMatch = path.match(/\/blog\/([^/?#]+)/);
  const slug      = slugMatch ? slugMatch[1] : null;
  const article   = slug ? ARTICLES.find(a => a.slug === slug) : null;

  const title = article
    ? `${article.title} | Carat Money`
    : 'Gold Selling Tips & Insights | Carat Money Blog';
  const desc  = article
    ? article.excerpt
    : 'Expert articles on gold selling, buyer margins, and getting the best price for your gold in India.';
  const url   = article
    ? `${SITE}/blog/${article.slug}`
    : `${SITE}/blog`;
  const image = `${SITE}/logo.png`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <meta name="description" content="${desc}"/>
  <meta property="og:type"         content="article"/>
  <meta property="og:url"          content="${url}"/>
  <meta property="og:title"        content="${title}"/>
  <meta property="og:description"  content="${desc}"/>
  <meta property="og:image"        content="${image}"/>
  <meta property="og:image:width"  content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:site_name"    content="Carat Money"/>
  <meta name="twitter:card"        content="summary_large_image"/>
  <meta name="twitter:title"       content="${title}"/>
  <meta name="twitter:description" content="${desc}"/>
  <meta name="twitter:image"       content="${image}"/>
  <link rel="canonical"            href="${url}"/>
  <script>window.location.replace("${url}?spa=1");</script>
</head>
<body>
  <h1>${title}</h1>
  <p>${desc}</p>
  <a href="${url}">Read article</a>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
  res.status(200).send(html);
}
