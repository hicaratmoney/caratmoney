// api/social.js — OG meta tag injector for blog article URLs
const fs   = require('fs');
const path = require('path');

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
  {
    slug:    'how-is-gold-valued-step-by-step',
    title:   'How is gold valued? A simple step-by-step guide',
    excerpt: 'Walk through exactly how a buyer values your gold — and the four points where they quietly cheat you.',
  },
  {
    slug:    'why-gold-buyers-pay-less-than-spot',
    title:   'Why gold buyers pay less than today\'s rate',
    excerpt: 'Every buyer pays below the market rate. Here\'s exactly where the gap comes from — and the margin we keep, published.',
  },
];

export default function handler(req, res) {
  const reqPath   = (req.url || '').split('?')[0];
  const slugMatch = reqPath.match(/\/blog\/([^/?#]+)/);
  const slug      = slugMatch ? slugMatch[1] : null;
  const article   = slug ? ARTICLES.find(a => a.slug === slug) : null;

  // A slug was requested but doesn't exist — don't fabricate meta tags
  // for a page that isn't real. Serve the plain SPA shell and let the
  // client-side router show its 404 state.
  if (slug && !article) {
    const html = fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

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
  const ogType = article ? 'article' : 'website';

  // Pull the real built SPA shell so we inherit its <script> bundle tag,
  // fonts, and anything else the build injects — we only override <head>
  // metadata, we don't hand-roll a second shell that can drift from the
  // real one.
  const shell = fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf8');

  const metaBlock = `
  <title>${title}</title>
  <meta name="description" content="${desc}"/>
  <meta property="og:type"         content="${ogType}"/>
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
  <link rel="canonical"            href="${url}"/>`;

  // Replace the shell's build-time <title> and inject our meta block
  // right after it. Also strip any hardcoded canonical/og tags the
  // shell already carries, so we don't end up with two of each.
  const html = shell
    .replace(/<title>.*?<\/title>/is, '')
    .replace(/<link rel="canonical"[^>]*>/i, '')
    .replace(/<meta property="og:[^>]*>/gi, '')
    .replace(/<meta name="description"[^>]*>/i, '')
    .replace(/<meta name="twitter:[^>]*>/gi, '')
    .replace('</head>', `${metaBlock}\n</head>`);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
  res.status(200).send(html);
}
