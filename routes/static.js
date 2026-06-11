import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const TEMPLATES_PLACEHOLDER = '<!-- {{templates}} -->';

const serveFile = async (res, filePath) => {
  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    throw error;
  }
};

const serveIndex = async (res, staticDir) => {
  const componentsDir = path.join(staticDir, 'components');
  const [indexHtml, files] = await Promise.all([
    readFile(path.join(staticDir, 'index.html'), 'utf8'),
    readdir(componentsDir),
  ]);
  const htmlFiles = files.filter((f) => f.endsWith('.html')).sort();
  const parts = await Promise.all(
    htmlFiles.map((f) => readFile(path.join(componentsDir, f), 'utf8')),
  );
  const html = indexHtml.replace(TEMPLATES_PLACEHOLDER, parts.join('\n'));
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
};

export { serveFile, serveIndex };
