const origin = new URL(process.env.ORIGIN || 'https://httpbingo.org');
const configuredPorts = [
  Number(process.env.PORT),
  Number(process.env.APP_PORT || 3000)
].filter((value) => Number.isInteger(value) && value > 0);
const ports = [...new Set(configuredPorts.length ? configuredPorts : [3000])];

const hopByHopHeaders = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'alt-svc'
]);

function buildTargetUrl(req) {
  const incoming = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const target = new URL(origin);
  target.pathname = joinPath(origin.pathname, incoming.pathname);
  target.search = incoming.search;
  return target;
}

function joinPath(basePath, requestPath) {
  const base = basePath.replace(/\/+$/, '');
  const path = requestPath.startsWith('/') ? requestPath : `/${requestPath}`;
  return `${base}${path}` || '/';
}

function copyRequestHeaders(req) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (!value || hopByHopHeaders.has(name.toLowerCase())) continue;
    headers.set(name, Array.isArray(value) ? value.join(', ') : value);
  }
  headers.set('host', origin.host);
  headers.set('x-forwarded-host', req.headers.host || '');
  headers.set('x-forwarded-proto', 'https');
  return headers;
}

function rewriteLocation(value) {
  try {
    const locationUrl = new URL(value, origin);
    if (locationUrl.origin === origin.origin) {
      return `${locationUrl.pathname}${locationUrl.search}${locationUrl.hash}`;
    }
  } catch {
    return value;
  }
  return value;
}

function copyResponseHeaders(upstream) {
  const headers = new Headers();
  upstream.headers.forEach((value, name) => {
    const lower = name.toLowerCase();
    if (hopByHopHeaders.has(lower)) return;
    if (lower === 'set-cookie') {
      headers.append(name, value.replace(/;\s*domain=[^;]*/gi, ''));
      return;
    }
    if (lower === 'location') {
      headers.set(name, rewriteLocation(value));
      return;
    }
    headers.set(name, value);
  });
  headers.set('x-proxy-platform-test', 'railway');
  return headers;
}

async function handler(req) {
  const incomingUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (incomingUrl.pathname === '/health') {
    return new Response('ok', {
      status: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
        'x-proxy-platform-test': 'railway'
      }
    });
  }

  const targetUrl = buildTargetUrl(req);
  const method = req.method || 'GET';
  const hasBody = !['GET', 'HEAD'].includes(method);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers: copyRequestHeaders(req),
      body: hasBody ? req : undefined,
      duplex: hasBody ? 'half' : undefined,
      redirect: 'manual',
      signal: controller.signal
    });

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: copyResponseHeaders(upstream)
    });
  } catch (error) {
    const incident = `RWP-${Date.now().toString(36)}`;
    console.error(incident, error);
    return new Response(`Proxy unavailable. Incident: ${incident}`, {
      status: 502,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store'
      }
    });
  } finally {
    clearTimeout(timeout);
  }
}

const http = await import('node:http');

function createProxyServer(port) {
  const server = http.createServer(async (req, res) => {
    try {
      const response = await handler(req);
      res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
      if (response.body) {
        for await (const chunk of response.body) res.write(chunk);
      }
      res.end();
    } catch (error) {
      const incident = `RWP-${Date.now().toString(36)}`;
      console.error(incident, error);
      res.writeHead(500, {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store'
      });
      res.end(`Proxy internal error. Incident: ${incident}`);
    }
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`Railway proxy test listening on ${port}, origin=${origin.origin}`);
  });

  server.on('error', (error) => {
    console.error(`Railway proxy failed to listen on ${port}`, error);
    process.exitCode = 1;
  });

  return server;
}

for (const port of ports) {
  createProxyServer(port);
}
