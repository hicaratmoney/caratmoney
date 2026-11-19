import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const ROUTES = JSON.parse(fs.readFileSync(new URL('./src/routes.json', import.meta.url), 'utf8'));

// After the build, write one static HTML file per landing route (hi.html, reviews.html …)
// with that route's own <html lang>, title, description and canonical, so view-source and
// crawlers see the right head tags before any JavaScript runs. vercel.json rewrites each
// path to its file.
function routeHtml() {
  let outDir = 'dist';
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return {
    name: 'cm-route-html',
    apply: 'build',
    configResolved(c) { outDir = path.resolve(c.root, c.build.outDir); },
    writeBundle() {
      const shell = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
      const pages = [
        ...Object.entries(ROUTES.langPaths).map(([p, lang]) => ({ p, lang, canon: p })),
        ...Object.keys(ROUTES.sectionPaths).map(p => ({ p, lang: 'en', canon: '/' })),
      ];
      for (const { p, lang, canon } of pages) {
        const seo = ROUTES.homeSeo[lang];
        const url = ROUTES.site + canon;
        const html = shell
          .replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(seo.title)}</title>`)
          .replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(seo.desc)}"`)
          .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`)
          .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`)
          .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${esc(seo.title)}"`)
          .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(seo.desc)}"`);
        fs.writeFileSync(path.join(outDir, p.slice(1) + '.html'), html);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), routeHtml()],
});
