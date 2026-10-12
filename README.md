# Turbopack dev: `next/dynamic` in `_app` preloads a 404 chunk (Pages Router)

Regression in `next@16.5.0-canary.8` (works in `16.4.0`).

## Steps

```sh
npm install
npm run repro   # starts `next dev` on :3456, fetches / and /other, checks every /_next/static asset in the SSR HTML
```

Manual check: run `npm run dev`, open http://localhost:3456/, and look in the DevTools Network tab for a 404 on `/_next/static/chunks/components_*._.js`.

## Setup

- `pages/_app.js` renders `dynamic(() => import('../components/Lazy'))`.
- `components/Lazy.js` imports `shared.js` (also imported by `_app`), `pageShared.js` (also imported by `pages/index.js`), and `lazyOnly.js`.
- `pages/other.js` does not import `pageShared.js`.

## Expected

Every chunk listed in `.next/dev/server/pages/*/react-loadable-manifest.json` (and preloaded in the SSR HTML) is served by the dev server.

## Actual (16.5.0-canary.8)

The same `next/dynamic` entry gets a different chunk list per page. On `/`, the chunk it lists is never emitted, so the request 404s:

```
/ 404 /_next/static/chunks/components_1_-85pdr5lo1f._.js
index [["static/chunks/components_1_-85pdr5lo1f._.js"]]
other [["static/chunks/components_0sfok57xi7y41._.js"]]
FAIL: 1 404s
```

The manifest seems to be computed with the page's already-available modules (`pageShared.js` is on `index`, so it's left out of the chunk). The client's async loader for the same dynamic entry asks for a different set of chunks, so the SSR-preloaded file doesn't exist.

## 16.4.0

```
/: 19 assets referenced in SSR HTML
/other: 19 assets referenced in SSR HTML
index []
other []
OK
```

In 16.4.0, `files` in the dev loadable manifest is empty, so nothing extra is preloaded.

## Notes

- Same result with `experimental.turbopackClientSideNestedAsyncChunking` on or off.
- Found in a large Pages Router app, where 10 `next/dynamic` entries pointed to missing chunks and 2 of them were requested on page load.
