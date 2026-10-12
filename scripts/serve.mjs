import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = path.join(root, 'dist');
const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535.');
try { await stat(path.join(directory, 'index.html')); }
catch { console.error('No build found. Run npm run build first.'); process.exit(1); }
const config = JSON.parse(await readFile(path.join(root, 'vercel.json'), 'utf8'));
const securityHeaders = Object.fromEntries(config.headers.flatMap(({ headers }) => headers).map(({ key, value }) => [key, value]));
// Local HTTP has no TLS; upgrading local requests would prevent development.
securityHeaders['Content-Security-Policy'] = securityHeaders['Content-Security-Policy'].replace('; upgrade-insecure-requests', '');
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.webmanifest': 'application/manifest+json',
};
const server = createServer(async (request, response) => {
  const send = (status, message) => { response.writeHead(status, { ...securityHeaders, 'Content-Type': 'text/plain; charset=utf-8' }); response.end(message); };
  if (!['GET', 'HEAD'].includes(request.method)) { response.setHeader('Allow', 'GET, HEAD'); return send(405, 'Method not allowed'); }
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { return send(400, 'Invalid URL'); }
  if (pathname.includes('\0') || pathname.includes('\\') || pathname.split('/').includes('..')) return send(400, 'Invalid path');
  const requested = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const candidates = [requested];
  if (!path.extname(requested)) candidates.push(`${requested}.html`, path.join(requested, 'index.html'));
  let file;
  let info;
  for (const candidate of candidates) {
    const resolved = path.resolve(directory, candidate);
    if (!resolved.startsWith(`${directory}${path.sep}`)) continue;
    try { const result = await stat(resolved); if (result.isFile()) { file = resolved; info = result; break; } }
    catch (error) { if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') return send(500, 'Unable to read file'); }
  }
  let status = 200;
  if (!file) {
    status = 404;
    file = path.join(directory, '404.html');
    try { info = await stat(file); } catch { return send(404, 'Page not found'); }
  }
  response.writeHead(status, { ...securityHeaders, 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Content-Length': info.size, 'Cache-Control': 'no-store' });
  if (request.method === 'HEAD') return response.end();
  const stream = createReadStream(file);
  stream.on('error', () => response.destroy());
  stream.pipe(response);
});
server.on('error', (error) => { console.error(`Preview server failed: ${error.message}`); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${port}`));
