// Zero-dependency static file server for Apple Battery LED.
// Usage: `npm start` (or `node server.js`), then open the printed URL.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.webp': 'image/webp'
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
    if (urlPath === '/') urlPath = '/index.html';

    // Prevent path traversal.
    const safePath = normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
    let filePath = join(ROOT, safePath);

    let info;
    try {
      info = await stat(filePath);
    } catch {
      filePath = join(ROOT, 'index.html');
    }
    if (info && info.isDirectory()) filePath = join(filePath, 'index.html');

    const data = await readFile(filePath);
    const type = MIME[extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
    res.end(data);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('500 Internal Server Error\n' + (err && err.message ? err.message : ''));
  }
});

server.listen(PORT, () => {
  console.log(`\n  Apple Battery LED  →  http://localhost:${PORT}\n`);
});
