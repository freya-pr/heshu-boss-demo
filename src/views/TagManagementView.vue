<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, RefreshRight, Search } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'

type TagObject = '客户' | '线索' | '订单'
type TagSource = '系统' | 'BOSS人工' | '企业微信' | '外部SCRM' | '规则' | 'AI'
type TagStatus = '启用' | '停用' | '已同步'
type TabKey = 'library' | 'groups'

type TagRow = {
  id: number
  name: string
  code: string
  object: TagObject
  category: string
  source: TagSource
  generation: string
  coverage: number
  validity: string
  status: TagStatus
  description: string
  event: string
  basis: string
  permission: string
  updatedAt: string
}

type TagGroup = {
  id: number
  name: string
  tags: string[]
  status: '启用' | '停用'
  updatedAt: string
}

const STORAGE_KEY = 'heshu_boss_tag_center_v1'
const GROUP_STORAGE_KEY = 'heshu_boss_tag_groups_v1'
const tabs: Array<{ key: TabKey; label: string; note: string }> = [
  { key: 'library', label: '标签库', note: '统一查看全部来源标签' },
  { key: 'groups', label: '标签组', note: '按业务主题组织标签' }
]

const seedTags: TagRow[] = [
  { id: 1, name: '0824数学营', code: 'TAG-SYS-0824', object: '客户', category: '业务归属 / 营期', source: '系统', generation: '营期关系自动生成', coverage: 8642, validity: '历史保留', status: '启用', description: '客户与0824数学营建立归属关系后自动生成。', event: '客户加微识别成功', basis: '活码绑定营期 = 0824数学营', permission: '系统只读', updatedAt: '2026-08-24 02:10' },
  { id: 2, name: '正式课客户', code: 'TAG-SYS-ORDER-01', object: '客户', category: '客户阶段', source: '系统', generation: '正式课订单支付成功', coverage: 32103, validity: '动态', status: '启用', description: '用于标记已支付正式课程的客户。', event: '订单支付成功', basis: '商品类型 = 正式课', permission: '系统只读', updatedAt: '2026-08-25 01:08' },
  { id: 4, name: '重点客户', code: 'wx_tag_6519', object: '客户', category: '企微客户标签', source: '企业微信', generation: '企微侧人工打标', coverage: 4328, validity: '跟随企微', status: '已同步', description: '企业微信客户联系标签，同步后在BOSS只读展示。', event: '企微标签变更回调', basis: 'CorpID + external_userid', permission: '外部来源只读', updatedAt: '2026-08-25 08:16' },
  { id: 8, name: '退款客户', code: 'TAG-SYS-REFUND', object: '客户', category: '订单事实', source: '系统', generation: '客户订单退款成功自动生成', coverage: 987, validity: '永久', status: '启用', description: '客户存在退款完成订单后生成的事实标签。', event: '退款成功', basis: 'refund_status = SUCCESS', permission: '系统只读', updatedAt: '2026-08-25 05:30' }
]

const saved = localStorage.getItem(STORAGE_KEY)
const tags = ref<TagRow[]>((saved ? JSON.parse(saved) : seedTags).filter((item: TagRow) => ['系统', '企业微信'].includes(item.source)))
const allowedSources: TagSource[] = ['系统', '企业微信']
const activeTab = ref<TabKey>('library')
const query = reactive({ keyword: '', source: '' as '' | TagSource, status: '' as '' | TagStatus })
const detailVisible = ref(false)
const coverageVisible = ref(false)
const activeTag = ref<TagRow | null>(null)
const groupEditorVisible = ref(false)
const groupEditingId = ref<number | null>(null)
const groupForm = reactive({ name: '', tags: [] as string[], status: '启用' as '启用' | '停用' })

const seedGroups: TagGroup[] = [
  { id: 1, name: '客户阶段', tags: ['正式课客户'], status: '启用' as const, updatedAt: '2026-08-24 18:20' },
  { id: 2, name: '重点跟进', tags: ['重点客户'], status: '启用' as const, updatedAt: '2026-08-23 15:42' },
  { id: 3, name: '业务归属', tags: ['0824数学营'], status: '启用' as const, updatedAt: '2026-08-22 11:06' }
]
const savedGroups = localStorage.getItem(GROUP_STORAGE_KEY)
const validTagNames = new Set(tags.value.map(item => item.name))
const parsedGroups: TagGroup[] = savedGroups ? JSON.parse(savedGroups) : seedGroups
const groups = ref<TagGroup[]>(parsedGroups.map(group => ({ ...group, tags: group.tags.filter(name => validTagNames.has(name)) })))
const coverageSamples = computed(() => {
  if (!activeTag.value) return []
  if (activeTag.value.object === '客户') return [
    { code: 'CUS202608240018', name: '王女士', owner: '李士文', matchedAt: '2026-08-24 21:32', evidence: activeTag.value.generation },
    { code: 'CUS202608230126', name: '陈先生', owner: '王老师', matchedAt: '2026-08-24 18:05', evidence: activeTag.value.generation },
    { code: 'CUS202608220369', name: '刘女士', owner: '陈老师', matchedAt: '2026-08-23 09:48', evidence: activeTag.value.generation }
  ]
  if (activeTag.value.object === '线索') return [
    { code: 'DY20260824192518', name: '抖音订单线索', owner: '李士文', matchedAt: '2026-08-24 19:31', evidence: activeTag.value.generation },
    { code: 'YZ20260824008931', name: '有赞订单线索', owner: '王老师', matchedAt: '2026-08-24 16:12', evidence: activeTag.value.generation }
  ]
  return [{ code: 'ORD202608240089', name: '教育规划陪跑营6.0', owner: '李士文', matchedAt: '2026-08-24 20:18', evidence: activeTag.value.generation }]
})

watch(tags, value => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)), { deep: true })
watch(groups, value => localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(value)), { deep: true })

const filteredTags = computed(() => {
  const keyword = query.keyword.trim().toLowerCase()
  return tags.value.filter(tag => allowedSources.includes(tag.source) && (!keyword || `${tag.name}${tag.code}${tag.source}`.toLowerCase().includes(keyword))
    && (!query.source || tag.source === query.source)
    && (!query.status || tag.status === query.status))
})
const summary = computed(() => ({
  total: filteredTags.value.length,
  enabled: filteredTags.value.filter(item => item.status !== '停用').length,
  disabled: filteredTags.value.filter(item => item.status === '停用').length,
  system: filteredTags.value.filter(item => item.source === '系统').length,
  external: filteredTags.value.filter(item => item.source === '企业微信').length,
  coverage: filteredTags.value.reduce((sum, item) => sum + item.coverage, 0)
}))
const sourceType = (source: TagSource) => ({ 系统: 'primary', BOSS人工: 'warning', 企业微信: 'success', 外部SCRM: 'info', 规则: 'primary', AI: 'danger' }[source] as any)
const editable = (_tag: TagRow) => false
const groupNamesForTag = (tagName: string) => groups.value.filter(group => group.tags.includes(tagName)).map(group => group.name)

function resetQuery() { Object.assign(query, { keyword: '', source: '', status: '' }) }
function openDetail(tag: TagRow) { activeTag.value = tag; detailVisible.value = true }
function openCoverage(tag: TagRow) { activeTag.value = tag; coverageVisible.value = true }
function syncWecomTags() {
  const now = new Date().toLocaleString('zh-CN', { hour12: false })
  const candidates: TagRow[] = [
    { id: Date.now(), name: '企微重点跟进', code: 'wx_tag_8826', object: '客户', category: '企微客户标签', source: '企业微信', generation: '企微侧创建后同步', coverage: 1268, validity: '跟随企微', status: '已同步', description: '由企业微信客户联系标签同步进入。', event: '手动同步企微标签', basis: 'CorpID + external_tag_id', permission: '外部来源只读', updatedAt: now },
    { id: Date.now() + 1, name: '企微已加群', code: 'wx_tag_9103', object: '客户', category: '企微客户标签', source: '企业微信', generation: '企微侧创建后同步', coverage: 856, validity: '跟随企微', status: '已同步', description: '由企业微信客户联系标签同步进入。', event: '手动同步企微标签', basis: 'CorpID + external_tag_id', permission: '外部来源只读', updatedAt: now }
  ]
  const additions = candidates.filter(candidate => !tags.value.some(item => item.code === candidate.code || item.name === candidate.name))
  if (!additions.length) return ElMessage.info('企业微信标签已是最新')
  tags.value.unshift(...additions)
  ElMessage.success(`已同步 ${additions.length} 个企业微信标签`)
}
const groupTagOptions = computed(() => tags.value.map(item => item.name))
function openGroupEditor(group?: typeof groups.value[number]) {
  groupEditingId.value = group?.id || null
  Object.assign(groupForm, group ? { name: group.name, tags: [...group.tags], status: group.status as '启用' | '停用' } : { name: '', tags: [], status: '启用' })
  groupEditorVisible.value = true
}
function saveGroup() {
  const name = groupForm.name.trim()
  if (!name) return ElMessage.warning('请输入标签组名称')
  if (groups.value.some(item => item.id !== groupEditingId.value && item.name.trim().toLowerCase() === name.toLowerCase())) return ElMessage.warning('标签组名称已存在')
  if (!groupForm.tags.length) return ElMessage.warning('请至少选择一个标签')
  const updatedAt = new Date().toLocaleString('zh-CN', { hour12: false })
  if (groupEditingId.value) Object.assign(groups.value.find(item => item.id === groupEditingId.value)!, groupForm, { name, tags: [...groupForm.tags], updatedAt })
  else groups.value.unshift({ id: Date.now(), ...groupForm, name, tags: [...groupForm.tags], updatedAt })
  groupEditorVisible.value = false
  ElMessage.success(groupEditingId.value ? '标签组已更新' : '标签组已创建')
}
</script>

<template>
  <div class="page tag-page">
    <PageHeader eyebrow="CUSTOMER · TAG MANAGEMENT" title="标签管理中心" description="统一管理系统标签与企业微信标签，标签来源固定且不可扩展。" />

    <section class="metrics-grid">
      <article><span>标签总数</span><strong>{{ summary.total }}</strong><small>启用 {{ summary.enabled }} · 停用 {{ summary.disabled }}</small></article>
      <article><span>系统标签</span><strong>{{ summary.system }}</strong><small>营期 / 客户阶段 / 订单事实</small></article>
      <article><span>企业微信标签</span><strong>{{ summary.external }}</strong><small>由企业微信同步进入标签库</small></article>
    </section>

    <nav class="tag-tabs" aria-label="标签管理模块">
      <button v-for="tab in tabs" :key="tab.key" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
        <b>{{ tab.label }}</b><small>{{ tab.note }}</small>
      </button>
    </nav>

    <section v-if="activeTab === 'library'" class="surface content-card">
      <header class="section-head library-head">
        <div><h2>统一标签库</h2><p>同一页面管理不同来源标签，但编辑权限和生命周期按来源严格隔离。</p></div>
        <div class="library-actions"><el-button type="primary" :icon="RefreshRight" @click="syncWecomTags">同步企微</el-button></div>
        <div class="filters">
          <el-input v-model="query.keyword" clearable :prefix-icon="Search" placeholder="搜索标签名称 / ID / 来源系统" />
          <el-select v-model="query.source" clearable placeholder="全部来源"><el-option v-for="item in ['系统','企业微信']" :key="item" :label="item" :value="item" /></el-select>
          <el-select v-model="query.status" clearable placeholder="全部状态"><el-option v-for="item in ['启用','停用','已同步']" :key="item" :label="item" :value="item" /></el-select>
          <el-button :icon="RefreshRight" circle title="重置筛选" @click="resetQuery" />
        </div>
      </header>
      <el-table :data="filteredTags" row-key="id">
        <el-table-column label="标签名称" min-width="190"><template #default="{ row }"><button class="tag-name" @click="openDetail(row)">{{ row.name }}</button><small class="cell-sub">{{ row.code }}</small></template></el-table-column>
        <el-table-column label="目前覆盖客户数" width="150" align="right"><template #default="{ row }"><el-button class="number-link" link type="primary" @click="openCoverage(row)">{{ row.coverage.toLocaleString() }}</el-button></template></el-table-column>
        <el-table-column label="标签组" min-width="150"><template #default="{ row }"><template v-if="groupNamesForTag(row.name).length"><el-tag v-for="name in groupNamesForTag(row.name)" :key="name" effect="plain">{{ name }}</el-tag></template><span v-else>—</span></template></el-table-column>
        <el-table-column label="来源" width="125"><template #default="{ row }"><el-tag :type="sourceType(row.source)" effect="light" round>{{ row.source }}</el-tag></template></el-table-column>
        <el-table-column label="状态" width="100"><template #default="{ row }"><span :class="['status-dot', row.status === '停用' ? 'off' : 'on']">{{ row.status }}</span></template></el-table-column>
        <el-table-column label="操作" width="125" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openDetail(row)">查看</el-button><el-button link disabled>只读</el-button></template></el-table-column>
      </el-table>
      <footer class="table-footer"><span>共 {{ filteredTags.length }} 个标签 · 覆盖关系 {{ summary.coverage.toLocaleString() }} 条</span><el-pagination background layout="prev,pager,next,sizes" :total="filteredTags.length" :page-size="10" /></footer>
    </section>

    <section v-else-if="activeTab === 'groups'" class="surface content-card">
      <header class="section-head"><div><h2>标签组</h2><p>标签组用于页面筛选、客户画像分区和批量打标，不改变标签自身来源。</p></div><el-button type="primary" :icon="Plus" @click="openGroupEditor()">新增标签组</el-button></header>
      <el-table :data="groups"><el-table-column prop="name" label="标签组名称" min-width="180"/><el-table-column label="包含标签" min-width="360"><template #default="{row}"><el-tag v-for="tag in row.tags" :key="tag" class="group-tag" effect="plain">{{ tag }}</el-tag></template></el-table-column><el-table-column prop="status" label="状态" width="100"/><el-table-column prop="updatedAt" label="更新时间" width="165"/><el-table-column label="操作" width="90"><template #default="{ row }"><el-button link type="primary" @click="openGroupEditor(row)">编辑</el-button></template></el-table-column></el-table>
    </section>


    <el-drawer v-model="detailVisible" size="560px" :title="`${activeTag?.source || ''}标签详情 · ${activeTag?.name || ''}`">
      <template v-if="activeTag">
        <el-alert v-if="!editable(activeTag)" :title="activeTag.source === '系统' ? '该标签由业务事件生成，不允许人工修改。' : '该标签来自外部系统，BOSS仅展示和使用，修改请前往来源系统或调整映射。'" type="warning" :closable="false" />
        <div class="detail-grid">
          <label>标签来源<strong>{{ activeTag.source }}</strong></label><label>标签ID<strong>{{ activeTag.code }}</strong></label>
          <label>当前覆盖<strong>{{ activeTag.coverage.toLocaleString() }} {{ activeTag.object }}</strong></label><label>使用权限<strong>{{ activeTag.permission }}</strong></label>
        </div>
      </template>
      <template #footer><el-button @click="detailVisible=false">关闭</el-button></template>
    </el-drawer>

    <el-dialog v-model="groupEditorVisible" :title="groupEditingId ? '编辑标签组' : '新增标签组'" width="620px">
      <el-form label-position="top" class="tag-form">
        <el-form-item label="标签组名称" required><el-input v-model="groupForm.name" maxlength="30" placeholder="请输入标签组名称" /></el-form-item>
        <el-form-item label="包含标签" required><el-select v-model="groupForm.tags" multiple filterable collapse-tags placeholder="请选择标签"><el-option v-for="item in groupTagOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="groupForm.status"><el-radio value="启用">启用</el-radio><el-radio value="停用">停用</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="groupEditorVisible=false">取消</el-button><el-button type="primary" @click="saveGroup">保存标签组</el-button></template>
    </el-dialog>


    <el-dialog v-model="coverageVisible" :title="`标签覆盖明细 · ${activeTag?.name || ''}`" width="820px">
      <el-alert :title="`当前显示权限范围内的${activeTag?.object || '对象'}样例；完整结果共 ${activeTag?.coverage.toLocaleString() || 0} 条。`" type="info" :closable="false" />
      <el-table :data="coverageSamples" class="coverage-table"><el-table-column prop="code" label="对象编号" min-width="190"/><el-table-column prop="name" label="对象名称" min-width="160"/><el-table-column prop="owner" label="当前负责人" width="130"/><el-table-column prop="matchedAt" label="命中时间" width="165"/><el-table-column prop="evidence" label="命中依据" min-width="190" show-overflow-tooltip/></el-table>
      <template #footer><el-button @click="coverageVisible=false">关闭</el-button><el-button type="primary" @click="ElMessage.success('已按当前权限范围创建导出任务')">导出当前结果</el-button></template>
    </el-dialog>
  </div>
</template>

<style scoped>
.library-head{flex-wrap:wrap}.library-actions{display:flex;gap:8px;white-space:nowrap}.library-actions+.filters{flex:1 0 100%;width:100%;min-width:0}
.tag-page{--tag-violet:#5968ff;--tag-violet-soft:#eef0ff}.metrics-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;margin-bottom:20px}.metrics-grid article{padding:18px 20px;border:1px solid var(--line);border-radius:14px;background:#fff;box-shadow:0 8px 24px rgba(28,55,90,.04)}.metrics-grid span,.metrics-grid strong,.metrics-grid small{display:block}.metrics-grid span{color:var(--secondary);font-size:12px}.metrics-grid strong{margin:10px 0 8px;color:var(--text);font-size:28px;line-height:1;font-variant-numeric:tabular-nums}.metrics-grid small{color:var(--muted);font-size:11px}.metrics-grid .risk-card strong{color:#d58700}.tag-tabs{width:max-content;max-width:100%;display:flex;gap:3px;margin-bottom:18px;padding:5px;border:1px solid var(--line);border-radius:12px;background:#fff;overflow:auto}.tag-tabs button{min-width:108px;padding:10px 14px;border:0;border-radius:9px;background:transparent;color:var(--secondary);text-align:left;cursor:pointer;transition:.18s ease}.tag-tabs button:hover{background:#f5f7fb}.tag-tabs button.active{background:var(--tag-violet-soft);color:var(--tag-violet)}.tag-tabs b,.tag-tabs small{display:block}.tag-tabs b{font-size:13px}.tag-tabs small{display:none;margin-top:3px;font-size:10px}.content-card{overflow:hidden}.section-head{min-height:84px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;gap:20px;border-bottom:1px solid var(--line)}.section-head h2{margin:0 0 5px;font-size:18px}.section-head p{margin:0;color:var(--secondary);font-size:12px}.filters{display:grid;grid-template-columns:minmax(230px,1.5fr) repeat(3,minmax(118px,.75fr)) auto;gap:8px;min-width:min(760px,65vw)}.tag-name{padding:0;border:0;background:transparent;color:var(--text);font:inherit;font-weight:700;cursor:pointer}.tag-name:hover{color:var(--brand)}.cell-sub{display:block;margin-top:5px;color:var(--muted);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.number-link{font-weight:700;font-variant-numeric:tabular-nums}.status-dot{display:inline-flex;align-items:center;gap:6px;font-weight:600;font-size:12px}.status-dot:before{content:"";width:7px;height:7px;border-radius:50%;background:#24bd93;box-shadow:0 0 0 3px #e6f8f2}.status-dot.off{color:var(--muted)}.status-dot.off:before{background:#adb8c7;box-shadow:0 0 0 3px #edf0f4}.table-footer{min-height:64px;padding:12px 20px;display:flex;align-items:center;justify-content:flex-end;gap:18px;border-top:1px solid var(--line);color:var(--secondary);font-size:12px}.group-tag{margin:3px 5px 3px 0}.governance-card .governance-summary{margin:18px 20px;padding:15px 18px;display:flex;align-items:flex-start;gap:12px;border:1px solid #f1d490;border-radius:10px;background:#fff8e8;color:#9a6508}.governance-summary svg{width:20px;margin-top:2px}.governance-summary b,.governance-summary p{display:block;margin:0}.governance-summary p{margin-top:4px;font-size:12px}.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px}.detail-grid label{min-height:78px;padding:13px 15px;border:1px solid var(--line);border-radius:10px;background:#fbfcfe;color:var(--muted);font-size:11px}.detail-grid label.wide{grid-column:1/-1}.detail-grid strong{display:block;margin-top:9px;color:var(--text);font-size:14px;line-height:1.5}.tag-form,.mapping-form{margin-top:20px}.tag-form :deep(.el-select),.mapping-form :deep(.el-select){width:100%}.coverage-table{margin-top:18px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}@media(max-width:1100px){.metrics-grid{grid-template-columns:repeat(3,1fr)}.filters{min-width:0;grid-template-columns:1fr 1fr}.section-head{align-items:flex-start;flex-direction:column}}@media(max-width:720px){.metrics-grid{grid-template-columns:1fr 1fr}.metrics-grid article:last-child{grid-column:1/-1}.tag-tabs{width:100%}.section-head{padding:16px}.filters{width:100%;grid-template-columns:1fr}.detail-grid,.form-grid{grid-template-columns:1fr}.detail-grid label.wide{grid-column:auto}}
</style>
