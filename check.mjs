import fs from 'node:fs'
const base = 'http://localhost:3456'
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ['/', '/other']
let bad = 0
for (const route of routes) {
  const html = await (await fetch(base + route)).text()
  const urls = [...new Set([...html.matchAll(/\/_next\/static\/[^"\\ ]+?\.(?:js|css)/g)].map((m) => m[0]))]
  for (const u of urls) {
    const r = await fetch(base + u)
    if (r.status !== 200) { bad++; console.log(route, r.status, u) }
  }
  console.log(`${route}: ${urls.length} assets referenced in SSR HTML`)
}
for (const p of ['index', 'other']) {
  const f = `.next/dev/server/pages/${p}/react-loadable-manifest.json`
  if (fs.existsSync(f)) console.log(p, JSON.stringify(Object.values(JSON.parse(fs.readFileSync(f, 'utf8'))).map((e) => e.files)))
}
console.log(bad ? `FAIL: ${bad} 404s` : 'OK')
process.exit(bad ? 1 : 0)
