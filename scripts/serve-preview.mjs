import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'dist', 'client');
const port = Number(process.env.PORT || 4321);
const types = { '.css': 'text/css', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2' };
const contentSecurityPolicy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.tiktok.com https://plausible.io https://giscus.app; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://giscus.app; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://plausible.io https://*.tiktok.com https://*.tiktokw.us https://*.analytics.tiktok.com https://formspree.io; frame-src 'self' https://*.tiktok.com https://giscus.app; frame-ancestors 'self'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'";

const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || '/', `http://${request.headers.host}`).pathname);
  const safePath = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
  const candidates = [join(root, safePath), join(root, safePath, 'index.html')];
  const file = candidates.find(candidate => existsSync(candidate) && statSync(candidate).isFile());

  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'SAMEORIGIN');
  response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.setHeader('Content-Security-Policy', contentSecurityPolicy);

  if (!file) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(response);
});

server.listen(port, '127.0.0.1', () => console.log(`Preview server listening on http://127.0.0.1:${port}`));
