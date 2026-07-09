const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const BACKEND = 'http://127.0.0.1:3001';
const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/') || req.url.startsWith('/upload')) {
    const opts = { hostname: '127.0.0.1', port: 3001, path: req.url, method: req.method, headers: { ...req.headers, host: '127.0.0.1:3001' } };
    const proxy = http.request(opts, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    proxy.on('error', () => { res.writeHead(502); res.end('Backend offline'); });
    req.pipe(proxy);
    return;
  }
  let filePath = path.join(DIST, req.url === '/' ? 'index.html' : req.url);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(DIST, 'index.html'), (e2, d2) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(d2);
      });
      return;
    }
    const ct = MIME[path.extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': ct });
    res.end(data);
  });
});

server.listen(8080, '0.0.0.0', () => {
  console.log('Economia running on http://0.0.0.0:8080 (proxy -> :3001)');
});
