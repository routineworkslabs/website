import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';

const company = JSON.parse(readFileSync(new URL('./site.config.json', import.meta.url), 'utf8'));

export default defineConfig({
  site: `https://${company.domain}`,
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'never',
  },
  vite: {
    build: { assetsInlineLimit: 0 },
  },
  devToolbar: { enabled: false },
});
