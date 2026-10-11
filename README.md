# Anurag Hackday

React 19, TypeScript, and Vite, with a Flask API and a browser security baseline applied in development, preview, and the production build.

## Scripts

```bash
npm install
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt
npm run api       # http://127.0.0.1:5001
npm run dev       # http://127.0.0.1:5173
npm run build
npm run preview   # http://127.0.0.1:4173
npm run lint
npm run audit
```

## API

The Flask app lives in `backend/` and serves:

- `GET /api/health`
- `GET /api/problems`

`npm run dev` and `npm run preview` proxy `/api` to `http://127.0.0.1:5001`. Leave `VITE_API_BASE_URL` empty so the browser stays on the Vite origin and `connect-src` remains `'self'`. The home page reports whether that health check succeeds, and Support loads its incident list from `/api/problems`.

When the API is hosted on another origin, set `VITE_API_BASE_URL` to that origin (https in production) and set `FLASK_ALLOWED_ORIGINS` to a comma-separated allowlist of frontend origins. The default allowlist is the local Vite dev and preview origins. The server listens on `127.0.0.1` only.

```bash
backend/.venv/bin/pip install -r backend/requirements-dev.txt
cd backend && .venv/bin/pytest
```

## Security baseline

- Content Security Policy with per-build hashes (`vite-plugin-csp-guard`) and subresource integrity on production assets. Production policy is `default-src 'self'` with `object-src 'none'`, `script-src-attr 'none'`, and `frame-ancestors 'none'`. `upgrade-insecure-requests` is added only to the generated host header, so local HTTP preview still loads.
- Response headers on the dev and preview servers: `nosniff`, frame denial, referrer policy, a locked Permissions-Policy, COOP, and CORP. Preview also sends `Cross-Origin-Embedder-Policy: require-corp`.
- `npm run build` writes `dist/_headers` (Cloudflare Pages and Netlify), `dist/vercel.json`, and `dist/nginx-security-headers.conf`. Those files include the hashed CSP, HSTS, and COEP. Regenerate them on every build; a stale CSP will block the app.
- Dev server listens on `127.0.0.1` only, with a strict filesystem allowlist, CORS disabled, and no HSTS. HSTS on localhost can pin the browser to HTTPS.
- Source maps are off, and small assets are not inlined as `data:` URLs.
- Oxlint rejects `eval`, implied eval, `new Function`, `javascript:` URLs, `target="_blank"` without `noopener`, and `dangerouslySetInnerHTML`.
- `src/security/ExternalLink.tsx` allows only `https` links and sets `rel="noopener noreferrer"`.
- `src/security/sanitize.ts` is the HTML sanitizer (DOMPurify allowlist). Render untrusted HTML only after `sanitizeHtml`.
- Only `VITE_` variables reach the client. `VITE_API_BASE_URL` must be an http(s) origin with no credentials, and https in production. Its origin is added to `connect-src`.

GitHub Pages cannot set these response headers. The meta CSP still applies there; HSTS, `frame-ancestors`, and COEP need a host that honors `dist/_headers` or the nginx snippet.

Before submitting a domain to the HSTS preload list, confirm you control every subdomain. The generated header includes `preload`.
