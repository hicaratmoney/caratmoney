// Vercel Routing Middleware: runs at the edge BEFORE the CDN cache.
// Why: the vercel.json host redirects work on uncached paths, but a cached copy of "/"
// (x-vercel-cache: HIT) was served to karatmoney.com / .in without the redirect running.
// Middleware sees every page request first, so the brand-typo domains always 301 to
// carat.money with their UTM tags. carat.money requests pass straight through untouched.
const TYPO = { 'karatmoney.com': 'karatmoney_com', 'karatmoney.in': 'karatmoney_in' };

export const config = {
  // every path except built JS/CSS assets and the API
  matcher: ['/', '/((?!assets/|api/).*)'],
};

export default function middleware(request) {
  try {
    const host = (request.headers.get('host') || '').toLowerCase().split(':')[0].replace(/^www\./, '');
    const src = TYPO[host];
    if (!src) return; // carat.money and everything else: continue as normal
    const to = `https://carat.money/?utm_source=${src}&utm_medium=typo_domain&utm_campaign=brand_typo`;
    return new Response(null, { status: 301, headers: { Location: to, 'Cache-Control': 'no-store' } });
  } catch {
    return; // never block the site on a middleware error
  }
}
