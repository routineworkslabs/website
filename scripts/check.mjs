import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const failures = [];
const pages = new Map();
const decodeHtml = (value) => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const attribute = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match ? decodeHtml(match[2]) : null;
};
const fail = (message) => failures.push(message);
const exists = async (filename) => { try { await access(filename); return true; } catch { return false; } };
const absoluteSource = (relative) => path.join(output, relative);

async function main() {
  if (!await exists(absoluteSource('index.html'))) throw new Error('Build the site first: npm run build.');
  const config = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
  const origin = `https://${config.domain}`;
  const vercel = JSON.parse(await readFile(path.join(root, 'vercel.json'), 'utf8'));
  if (vercel.framework !== 'astro' || vercel.outputDirectory !== 'dist' || vercel.buildCommand !== 'npm run build' || vercel.cleanUrls !== true) {
    fail('vercel.json must build Astro into dist with clean URLs.');
  }
  const headers = Object.fromEntries((vercel.headers ?? []).flatMap(({ headers }) => headers).map(({ key, value }) => [key.toLowerCase(), value]));
  if (!headers['content-security-policy']?.includes("script-src 'self'") || headers['content-security-policy']?.includes("'unsafe-inline'")) fail('Expected a same-origin CSP without unsafe-inline.');
  if (headers['x-content-type-options'] !== 'nosniff') fail('Missing nosniff security header.');

  async function collect(directory, relative = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const filename = path.join(relative, entry.name);
      if (entry.isDirectory()) await collect(path.join(directory, entry.name), filename);
      else if (entry.name.endsWith('.html')) {
        const html = await readFile(absoluteSource(filename), 'utf8');
        const ids = [...html.matchAll(/\bid\s*=\s*(["'])(.*?)\1/gi)].map((match) => decodeHtml(match[2]));
        if (new Set(ids).size !== ids.length) fail(`${filename}: duplicate element IDs.`);
        pages.set(filename, { html, ids: new Set(ids) });
      }
    }
  }
  await collect(output);
  for (const required of ['index.html', 'privacy.html', '404.html']) {
    if (!pages.has(required)) fail(`Missing ${required}.`);
  }

  async function validateReference(reference, filename) {
    if (!reference) return fail(`${filename}: empty href or src.`);
    if (/^(?:mailto:|tel:|data:)/i.test(reference)) return;
    let url;
    const pageUrl = filename === 'index.html' ? `${origin}/` : `${origin}/${filename.replace(/\.html$/, '')}`;
    try { url = new URL(reference, pageUrl); } catch { return fail(`${filename}: invalid link ${reference}`); }
    if (!['http:', 'https:'].includes(url.protocol)) return fail(`${filename}: unsupported link protocol ${reference}`);
    if (url.origin !== origin) return;
    let pathname;
    try { pathname = decodeURIComponent(url.pathname).replace(/^\//, ''); } catch { return fail(`${filename}: malformed URL ${reference}`); }
    const candidates = pathname ? [pathname, `${pathname}.html`, path.join(pathname, 'index.html')] : ['index.html'];
    let target;
    for (const candidate of candidates) {
      if (await exists(absoluteSource(candidate))) { target = candidate; break; }
    }
    if (!target) return fail(`${filename}: missing target ${reference}`);
    if (url.hash && pages.has(target)) {
      let id;
      try { id = decodeURIComponent(url.hash.slice(1)); } catch { return fail(`${filename}: malformed anchor ${reference}`); }
      if (!pages.get(target).ids.has(id)) fail(`${filename}: missing anchor ${reference}`);
    }
  }

  for (const [filename, { html }] of pages) {
    if (/{{|}}/.test(html)) fail(`${filename}: unresolved template token.`);
    if (!/<html\b[^>]*\blang=["']en["']/i.test(html)) fail(`${filename}: expected html lang="en".`);
    if (!/<title>[^<]+<\/title>/i.test(html)) fail(`${filename}: missing page title.`);
    const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
    if (!metaTags.some((tag) => attribute(tag, 'name') === 'description' && attribute(tag, 'content')?.trim())) fail(`${filename}: missing meta description.`);
    if (!metaTags.some((tag) => attribute(tag, 'name') === 'viewport')) fail(`${filename}: missing viewport meta tag.`);
    if (filename !== '404.html') {
      const canonical = (html.match(/<link\b[^>]*>/gi) ?? []).find((tag) => attribute(tag, 'rel') === 'canonical');
      const expected = filename === 'index.html' ? `${origin}/` : `${origin}/${filename.replace(/\.html$/, '')}`;
      if (!canonical || attribute(canonical, 'href') !== expected) fail(`${filename}: canonical URL must be ${expected}`);
    }
    if (/\bon\w+\s*=|\bstyle\s*=/i.test(html)) fail(`${filename}: inline event handlers/styles conflict with the security policy.`);
    for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
      if (/type\s*=\s*["']application\/ld\+json["']/i.test(script[1])) {
        try { JSON.parse(script[2]); } catch { fail(`${filename}: invalid JSON-LD.`); }
      } else if (!/\bsrc\s*=/.test(script[1]) || script[2].trim()) {
        fail(`${filename}: executable scripts must be external files.`);
      }
    }
    if (/https?:\/\/(?:apps\.apple\.com|itunes\.apple\.com|play\.google\.com)\b/i.test(html)) fail(`${filename}: Walk n Sit is unreleased; remove store links.`);
    const visibleText = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    if (/\b(?:download (?:now|the app|walk\s*n\s*sit)|download on the app store|get it on google play|available now on (?:the )?app store)\b/i.test(visibleText)) fail(`${filename}: remove app-download availability claims until release.`);
    for (const tag of html.match(/<(?:a|link|script|img|source|video)\b[^>]*>/gi) ?? []) {
      for (const name of ['href', 'src', 'poster']) {
        const reference = attribute(tag, name);
        if (reference !== null) await validateReference(reference, filename);
      }
      const srcset = attribute(tag, 'srcset');
      if (srcset) for (const item of srcset.split(',')) await validateReference(item.trim().split(/\s+/)[0], filename);
    }
  }
  for (const filename of ['robots.txt', 'sitemap.xml']) {
    if (!await exists(absoluteSource(filename))) fail(`Missing ${filename}.`);
  }
  if (failures.length) {
    console.error(`Site checks failed (${failures.length}):\n${failures.map((message) => `- ${message}`).join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log(`Checked ${pages.size} pages: local links, anchors, metadata, templates, app availability claims, and deployment settings passed.`);
    if (!config.email) console.warn('This is a draft check. A confirmed public email is still required for a production build.');
  }
}
main().catch((error) => { console.error(`Check failed: ${error.message}`); process.exitCode = 1; });
