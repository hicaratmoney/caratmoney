import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const ROUTES = JSON.parse(fs.readFileSync(new URL('./src/routes.json', import.meta.url), 'utf8'));
const FAQS_EN = JSON.parse(fs.readFileSync(new URL('./src/faqs-en.json', import.meta.url), 'utf8'));

// The static JSON-LD @graph in index.html (<script id="cm-schema">): read, change, write back.
const SCHEMA_RE = /(<script type="application\/ld\+json" id="cm-schema">)([\s\S]*?)(<\/script>)/;
function editSchema(html, fn) {
  const m = html.match(SCHEMA_RE);
  if (!m) throw new Error('cm-schema JSON-LD block not found in index.html');
  const data = fn(JSON.parse(m[2]));
  return html.replace(SCHEMA_RE, (_, a, __, c) => `${a}\n${JSON.stringify(data, null, 2).replace(/</g, '\\u003c')}\n${c}`);
}

// Adds the homepage FAQPage node (from src/faqs-en.json, the same list the page shows) to the
// static @graph, so crawlers see Organization + WebPage + FAQPage without running JavaScript.
function faqSchema() {
  return {
    name: 'cm-faq-schema',
    transformIndexHtml(html) {
      return editSchema(html, d => {
        d['@graph'] = d['@graph'].filter(n => n['@type'] !== 'FAQPage');
        d['@graph'].push({
          '@type': 'FAQPage',
          '@id': 'https://carat.money/#faq',
          mainEntity: FAQS_EN.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        });
        return d;
      });
    },
  };
}

// After the build, write one static HTML file per route (hi.html, reviews.html, sell.html …)
// with that route's own <html lang>, title, description, canonical and hreflang, so view-source
// and crawlers see the right head tags before any JavaScript runs. vercel.json rewrites each
// path to its file; every other path gets app.html, which carries no canonical or hreflang.
function routeHtml() {
  let outDir = 'dist';
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return {
    name: 'cm-route-html',
    apply: 'build',
    configResolved(c) { outDir = path.resolve(c.root, c.build.outDir); },
    writeBundle() {
      const shell = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
      const NO_HREFLANG = /\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*" \/>/g;
      const render = ({ lang = 'en', canon, seo, hreflang, noindex }) => {
        let html = shell
          .replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(seo.title)}</title>`)
          .replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(seo.desc)}"`)
          .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${ROUTES.site + canon}"`)
          .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${ROUTES.site + canon}"`)
          .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${esc(seo.title)}"`)
          .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(seo.desc)}"`);
        if (!hreflang) html = html.replace(NO_HREFLANG, '');
        if (noindex) html = html.replace(/(<meta name="robots" content=")[^"]*"/, '$1noindex, nofollow"');
        html = editSchema(html, d => {
          if (hreflang) d['@graph'].forEach(n => { if (n['@type'] === 'WebPage') n.url = ROUTES.site + canon; });
          else d['@graph'] = d['@graph'].filter(n => n['@type'] === 'Organization');
          return d;
        });
        return html;
      };
      const write = (file, html) => fs.writeFileSync(path.join(outDir, file), html);

      // Homepage family: language paths (self-canonical) and sitelink paths (canonical /), with hreflang
      for (const [p, lang] of Object.entries(ROUTES.langPaths))
        write(p.slice(1) + '.html', render({ lang, canon: p, seo: ROUTES.homeSeo[lang], hreflang: true }));
      for (const p of Object.keys(ROUTES.sectionPaths))
        write(p.slice(1) + '.html', render({ canon: '/', seo: ROUTES.homeSeo.en, hreflang: true }));

      // Other pages (/sell, /buy, /margin, /blog, /partner, /thank-you): self-canonical, no hreflang
      for (const [p, seo] of Object.entries(ROUTES.pages))
        write(p.slice(1) + '.html', render({ canon: p, seo, hreflang: false, noindex: seo.noindex }));

      // Catch-all shell for any other path: no canonical and no hreflang in the raw HTML
      // (the app adds the right canonical once it knows the route)
      write('app.html', editSchema(shell
        .replace(/\s*<link rel="canonical" href="[^"]*" \/>/, '')
        .replace(NO_HREFLANG, ''), d => ({ ...d, '@graph': d['@graph'].filter(n => n['@type'] === 'Organization') })));
    },
  };
}

export default defineConfig({
  plugins: [react(), faqSchema(), routeHtml()],
});
