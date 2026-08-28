import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'share-dist')
let html = await readFile(resolve(dist, 'index.html'), 'utf8')
const cssMatch = html.match(/<link rel="stylesheet" crossorigin href="\.\/([^\"]+)">/)
const jsMatch = html.match(/<script type="module" crossorigin src="\.\/([^\"]+)"><\/script>/)
if (!cssMatch || !jsMatch) throw new Error('未找到构建后的 CSS 或 JavaScript 资源')
const [css, js] = await Promise.all([readFile(resolve(dist, cssMatch[1]), 'utf8'), readFile(resolve(dist, jsMatch[1]), 'utf8')])
html = html.replace(cssMatch[0], () => `<style>${css}</style>`).replace(jsMatch[0], () => `<script type="module">${js}</script>`)
html = html.replace('<title>合数 BOSS</title>', '<title>合数BOSS · 可分享演示版</title>')
const outputs = [
  resolve(root, '../preview/heshu-boss-share.html'),
  resolve(root, '../vercel-share/index.html'),
]
for (const output of outputs) {
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, html)
  console.log(output)
}
