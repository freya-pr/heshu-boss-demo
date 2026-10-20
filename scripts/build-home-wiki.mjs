import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const sourcePath = path.join(root, 'docs/product/合数BOSS V1.0首页需求文档.md')
const outputMd = path.join(root, 'docs/product/合数BOSS V1.0首页需求文档（Wiki可复制图文版）.md')
const outputHtml = path.join(root, 'docs/product/合数BOSS V1.0首页需求文档（Wiki可复制图文版）.html')
const assetDir = path.join(root, 'docs/product/assets/home-wiki')
const sources = [
  ['/var/folders/jd/4wrsczz95kn1f_zyhwq_x4qm0000gn/T/codex-clipboard-d5afffdd-0545-4842-beb6-6315a78e962a.png', '01-workbench.png'],
  ['/var/folders/jd/4wrsczz95kn1f_zyhwq_x4qm0000gn/T/codex-clipboard-bad6b4cf-f65b-44a0-910f-e6232e44efea.png', '02-lead-analytics.png']
]

fs.mkdirSync(assetDir, { recursive: true })
for (const [source, name] of sources) {
  const target = path.join(assetDir, name)
  if (fs.existsSync(source)) fs.copyFileSync(source, target)
  else if (!fs.existsSync(target)) throw new Error(`缺少首页 Wiki 图片：${name}`)
}

let markdown = fs.readFileSync(sourcePath, 'utf8')
markdown = markdown.replace(
  '# 合数BOSS V1.0——首页与数据概览详细需求',
  '# 合数BOSS V1.0——首页与数据概览详细需求（Wiki可复制图文版）\n\n> Wiki 复制说明：正文、表格与业务截图均可直接复制；推荐打开同目录 HTML，点击“复制整篇”后粘贴到 Wiki。\n>\n> 本文基于 V1.17 需求评审稿生成：首页为固定直接入口，数据概览为独立一级模块，线索概览为其子模块；统计卡片按角色权限展示。'
)
markdown = markdown.replace(
  '### 3.1.1 首页（原工作台）交互',
  '### 3.1.1 首页（原工作台）交互\n\n![首页页面](./assets/home-wiki/01-workbench.png)\n\n> 图示重点：原工作台页面作为人员进入系统后的固定首页，包含欢迎区、快捷导航、最新动态与用户手册。'
)
markdown = markdown.replace(
  '### 3.2 页面区域与展示顺序',
  '### 3.2 页面区域与展示顺序\n\n![线索概览经营数据](./assets/home-wiki/02-lead-analytics.png)\n\n> 图示重点：线索概览按过程转化、结果质量、经营效能和成交金额展示经营数据，支持字段设置与指标下钻。'
)
markdown += '\n\n## 12. Wiki 图片清单\n\n| 编号 | 图片 | 对应章节 |\n|---|---|---|\n| 01 | 首页页面（原工作台） | 3.1.1 |\n| 02 | 数据概览—线索概览经营数据 | 3.2 |\n'
fs.writeFileSync(outputMd, markdown)

const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const inline = value => escape(value)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

function imageData(relativePath) {
  const file = path.resolve(path.dirname(outputMd), relativePath)
  return `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`
}

function renderMarkdown(input) {
  const lines = input.split(/\r?\n/)
  let html = ''
  let index = 0
  let listType = ''
  const closeList = () => { if (listType) { html += `</${listType}>`; listType = '' } }
  while (index < lines.length) {
    const line = lines[index]
    if (line.startsWith('```')) {
      closeList()
      const language = line.slice(3).trim()
      const body = []
      index++
      while (index < lines.length && !lines[index].startsWith('```')) body.push(lines[index++])
      html += `<pre class="code-block" data-language="${escape(language)}"><code>${escape(body.join('\n'))}</code></pre>`
    } else if (/^#{1,4} /.test(line)) {
      closeList()
      const level = line.match(/^#+/)[0].length
      html += `<h${level}>${inline(line.slice(level + 1))}</h${level}>`
    } else if (/^!\[[^\]]*\]\([^)]+\)$/.test(line)) {
      closeList()
      const match = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
      html += `<figure><img src="${imageData(match[2])}" alt="${escape(match[1])}"><figcaption>${escape(match[1])}</figcaption></figure>`
    } else if (line.startsWith('|') && index + 1 < lines.length && /^\|?\s*:?-+/.test(lines[index + 1])) {
      closeList()
      const rows = []
      const cells = value => value.replace(/^\||\|$/g, '').split('|').map(item => item.trim())
      rows.push(cells(line)); index += 2
      while (index < lines.length && lines[index].startsWith('|')) rows.push(cells(lines[index++]))
      html += '<div class="table-wrap"><table><thead><tr>' + rows[0].map(cell => `<th>${inline(cell)}</th>`).join('') + '</tr></thead><tbody>' + rows.slice(1).map(row => '<tr>' + row.map(cell => `<td>${inline(cell)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>'
      continue
    } else if (line.startsWith('>')) {
      closeList()
      const parts = []
      while (index < lines.length && (lines[index].startsWith('>') || !lines[index].trim())) {
        if (lines[index].startsWith('>')) parts.push(lines[index].replace(/^>\s?/, ''))
        index++
      }
      html += `<blockquote>${parts.map(part => part ? `<p>${inline(part)}</p>` : '').join('')}</blockquote>`
      continue
    } else if (/^- \[[ xX]\] /.test(line)) {
      closeList()
      html += `<p class="check">${/[xX]/.test(line.slice(3, 6)) ? '☑' : '☐'} ${inline(line.replace(/^- \[[ xX]\] /, ''))}</p>`
    } else if (/^[-*] /.test(line)) {
      if (listType !== 'ul') { closeList(); listType = 'ul'; html += '<ul>' }
      html += `<li>${inline(line.slice(2))}</li>`
    } else if (/^\d+\. /.test(line)) {
      if (listType !== 'ol') { closeList(); listType = 'ol'; html += '<ol>' }
      html += `<li>${inline(line.replace(/^\d+\. /, ''))}</li>`
    } else if (line.trim() === '---') {
      closeList(); html += '<hr>'
    } else if (line.trim()) {
      closeList(); html += `<p>${inline(line)}</p>`
    } else closeList()
    index++
  }
  closeList()
  return html
}

const article = renderMarkdown(markdown)
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>合数BOSS V1.0首页需求文档（Wiki可复制图文版）</title><style>*{box-sizing:border-box}body{margin:0;background:#f4f7fb;color:#1f2937;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;line-height:1.72}.toolbar{position:sticky;top:0;z-index:10;display:flex;justify-content:flex-end;gap:12px;padding:12px max(20px,calc((100vw - 1180px)/2));background:#f4f7fbf2;border-bottom:1px solid #dbe2ea}.toolbar button{border:1px solid #2f76ee;border-radius:8px;padding:9px 18px;background:#2f76ee;color:#fff;font-size:15px;cursor:pointer}.toolbar .secondary{background:#fff;color:#2f76ee}.status{align-self:center;color:#64748b;font-size:14px}article{max-width:1180px;margin:24px auto 56px;padding:48px 56px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 28px #0f172a0d}h1{font-size:30px;margin-top:0;color:#17233d}h2{font-size:24px;margin-top:42px;padding-bottom:10px;border-bottom:1px solid #e5e7eb}h3{font-size:20px;margin-top:32px}h4{font-size:17px;margin-top:26px}blockquote{margin:16px 0;padding:12px 18px;background:#eff6ff;border-left:4px solid #2f76ee;color:#475569}blockquote p{margin:4px 0}.table-wrap{max-width:100%;overflow-x:auto}table{border-collapse:collapse;width:100%;margin:16px 0;font-size:14px}th,td{border:1px solid #dbe2ea;padding:9px 11px;vertical-align:top}th{background:#f3f6fa;text-align:left}figure{margin:24px 0}img{display:block;max-width:100%;height:auto;margin:auto;border:1px solid #dbe2ea;border-radius:8px;background:#fff}figcaption{text-align:center;color:#64748b;font-size:13px;margin-top:8px}code{background:#f3f4f6;padding:2px 5px;border-radius:4px;overflow-wrap:anywhere}.code-block{overflow:auto;padding:18px;border-radius:8px;background:#13213a;color:#dbeafe}.code-block code{padding:0;background:transparent;color:inherit}ul,ol{padding-left:24px}a{color:#2563eb;text-decoration:none}.check{margin:6px 0}@media(max-width:720px){.toolbar{padding:10px}.status{display:none}article{margin:0;padding:24px 18px;border:0;border-radius:0}}@media print{.toolbar{display:none}body{background:#fff}article{margin:0;max-width:none;border:0;box-shadow:none}}</style></head><body><div class="toolbar"><span class="status" id="status">正文、表格和业务截图可复制到 Wiki</span><button class="secondary" onclick="window.print()">打印 / 导出PDF</button><button onclick="copyArticle()">复制整篇</button></div><article id="wiki-content">${article}</article><script>async function copyArticle(){const article=document.getElementById('wiki-content'),status=document.getElementById('status');try{const html=new Blob([article.outerHTML],{type:'text/html'}),text=new Blob([article.innerText],{type:'text/plain'});await navigator.clipboard.write([new ClipboardItem({'text/html':html,'text/plain':text})]);status.textContent='已复制，可粘贴到 Wiki'}catch(e){const range=document.createRange();range.selectNodeContents(article);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);document.execCommand('copy');selection.removeAllRanges();status.textContent='已复制，可粘贴到 Wiki'}}</script></body></html>`
fs.writeFileSync(outputHtml, html)
console.log(outputMd)
console.log(outputHtml)
