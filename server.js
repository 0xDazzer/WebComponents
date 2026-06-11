import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdir } from 'node:fs/promises';
import { serveFile, serveIndex } from './routes/static.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC_DIR = path.join(__dirname, 'static');
const SHARED_DIR = path.join(__dirname, 'shared');
const PROFILE_DIR = path.join(__dirname, 'data', 'profile');
const ROUTES_DIR = path.join(__dirname, 'routes');
const HOST = '127.0.0.1';
const PORT = 8000;

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };
const TEXT_HEADERS = { 'Content-Type': 'text/plain; charset=utf-8' };

const sendJson = (res, status, payload) => {
  res.writeHead(status, JSON_HEADERS);
  res.end(JSON.stringify(payload));
};

const parseJsonBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString();
  return JSON.parse(raw);
};

const insideProject = (candidatePath) => {
  const rel = path.relative(__dirname, candidatePath);
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel);
};

const safeJoin = (base, requestPath) => {
  const cleaned = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
  const full = path.join(base, cleaned);
  return insideProject(full) ? full : null;
};

const ctx = {
  profileDir: PROFILE_DIR,
  staticDir: STATIC_DIR,
  sendJson,
  parseJsonBody,
  serveFile,
  serveIndex,
};

const scanRouteFiles = async (dir, base = dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await scanRouteFiles(full, base)));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(path.relative(base, full));
    }
  }
  return files;
};

const toPattern = (relPath) => {
  const segments = relPath
    .replace(/\.js$/, '')
    .split(path.sep)
    .filter((s) => s !== 'index')
    .map((s) =>
      s.startsWith('[') && s.endsWith(']') ? `:${s.slice(1, -1)}` : s,
    );
  return `/${segments.join('/')}`;
};

const matchPattern = (pattern, pathname) => {
  const pp = pattern.split('/');
  const up = pathname.split('/');
  if (pp.length !== up.length) return null;
  const params = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(':')) params[pp[i].slice(1)] = up[i];
    else if (pp[i] !== up[i]) return null;
  }
  return params;
};

const loadRoutes = async () => {
  const files = (await scanRouteFiles(ROUTES_DIR)).sort();
  const table = [];
  for (const relPath of files) {
    const mod = await import(path.join(ROUTES_DIR, relPath));
    if (Array.isArray(mod.routes)) {
      table.push(...mod.routes);
    } else if (mod.default && typeof mod.default === 'object') {
      if (typeof mod.pattern === 'string') {
        const pattern = mod.pattern;
        table.push({ pattern, handlers: mod.default });
      } else {
        const pattern = toPattern(relPath);
        table.push({ pattern, handlers: mod.default });
      }
    }
  }
  return table;
};

const serveStatic = async (res, pathname) => {
  const isShared = pathname.startsWith('/shared/');
  const base = isShared ? SHARED_DIR : STATIC_DIR;
  const rel = isShared ? pathname.slice('/shared'.length) : pathname;
  const target = safeJoin(base, rel);
  if (!target) {
    res.writeHead(404, TEXT_HEADERS);
    res.end('Not found');
    return;
  }
  await serveFile(res, target);
};

const createDispatch = (routeTable) => async (req, res) => {
  if (!req.url) {
    res.writeHead(400, TEXT_HEADERS);
    res.end('Bad request');
    return;
  }

  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  const pathname = url.pathname;
  const method = req.method || 'GET';

  if (method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
    await serveIndex(res, STATIC_DIR);
    return;
  }

  for (const { pattern, handlers } of routeTable) {
    const params = matchPattern(pattern, pathname);
    if (params === null) continue;
    const handler = handlers[method];
    if (!handler) {
      res.writeHead(405, TEXT_HEADERS);
      res.end('Method not allowed');
      return;
    }
    await handler(req, res, params, ctx);
    return;
  }

  await serveStatic(res, url.pathname);
};

const routeTable = await loadRoutes();

const server = createServer(async (req, res) => {
  try {
    await createDispatch(routeTable)(req, res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { ok: false, error: 'Unexpected server error' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
