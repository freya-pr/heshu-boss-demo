<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Connection, Plus, RefreshRight, Search, Setting, Warning } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'

type TagObject = '客户' | '线索' | '订单'
type TagSource = '系统' | 'BOSS人工' | '企业微信' | '外部SCRM' | '规则' | 'AI'
type TagStatus = '启用' | '停用' | '已同步'
type TabKey = 'library' | 'groups' | 'rules' | 'mapping' | 'governance'

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

const STORAGE_KEY = 'heshu_boss_tag_center_v1'
const tabs: Array<{ key: TabKey; label: string; note: string }> = [
  { key: 'library', label: '标签库', note: '统一查看全部来源标签' },
  { key: 'groups', label: '标签组', note: '按业务主题组织标签' },
  { key: 'rules', label: '自动规则', note: '配置动态计算与失效策略' },
  { key: 'mapping', label: '外部标签映射', note: '统一企微与外部SCRM口径' },
  { key: 'governance', label: '标签治理', note: '发现重复、闲置和异常标签' }
]

const seedTags: TagRow[] = [
  { id: 1, name: '0824数学营', code: 'TAG-SYS-0824', object: '客户', category: '业务归属 / 营期', source: '系统', generation: '营期关系自动生成', coverage: 8642, validity: '历史保留', status: '启用', description: '客户与0824数学营建立归属关系后自动生成。', event: '客户加微识别成功', basis: '活码绑定营期 = 0824数学营', permission: '系统只读', updatedAt: '2026-08-24 02:10' },
  { id: 2, name: '正式课客户', code: 'TAG-SYS-ORDER-01', object: '客户', category: '客户阶段', source: '系统', generation: '正式课订单支付成功', coverage: 32103, validity: '动态', status: '启用', description: '用于标记已支付正式课程的客户。', event: '订单支付成功', basis: '商品类型 = 正式课', permission: '系统只读', updatedAt: '2026-08-25 01:08' },
  { id: 3, name: '价格敏感', code: 'TAG-MAN-023', object: '客户', category: '销售判断 / 阻碍', source: 'BOSS人工', generation: '销售手工打标', coverage: 5210, validity: '30天', status: '启用', description: '客户明确表达价格顾虑时由销售标记。', event: '人工操作', basis: '业务判断', permission: '一转可查看和打标', updatedAt: '2026-08-24 16:32' },
  { id: 4, name: '重点客户', code: 'wx_tag_6519', object: '客户', category: '企微客户标签', source: '企业微信', generation: '企微侧人工打标', coverage: 4328, validity: '跟随企微', status: '已同步', description: '企业微信客户联系标签，同步后在BOSS只读展示。', event: '企微标签变更回调', basis: 'CorpID + external_userid', permission: '外部来源只读', updatedAt: '2026-08-25 08:16' },
  { id: 5, name: '试听已沟通', code: 'ext_tag_339', object: '客户', category: '私域运营', source: '外部SCRM', generation: 'SOP自动打标', coverage: 7065, validity: '跟随来源', status: '已同步', description: '外部SCRM完成试听沟通SOP后同步。', event: '外部标签同步', basis: 'external_tag_id = 339', permission: '映射后使用', updatedAt: '2026-08-24 23:45' },
  { id: 6, name: '高意向', code: 'TAG-RULE-018', object: '客户', category: '销售意向', source: '规则', generation: '近7天行为满足≥3项', coverage: 8923, validity: '14天', status: '启用', description: '综合问卷、预约、到课和主动咨询行为动态计算。', event: '客户行为变化', basis: '近7天命中行为数 ≥ 3', permission: '规则管理员维护', updatedAt: '2026-08-25 03:00' },
  { id: 7, name: '问卷高匹配', code: 'TAG-AI-011', object: '线索', category: '问卷洞察', source: 'AI', generation: '问卷语义模型识别', coverage: 3651, validity: '本营期', status: '启用', description: '根据问卷开放题内容识别需求匹配度。', event: '问卷提交', basis: '模型版本 QN-LABEL-1.2', permission: 'AI管理员维护', updatedAt: '2026-08-24 21:18' },
  { id: 8, name: '退款订单', code: 'TAG-SYS-REFUND', object: '订单', category: '订单状态', source: '系统', generation: '退款成功自动生成', coverage: 987, validity: '永久', status: '启用', description: '订单完成退款后生成的事实标签。', event: '退款成功', basis: 'refund_status = SUCCESS', permission: '系统只读', updatedAt: '2026-08-25 05:30' }
]

const saved = localStorage.getItem(STORAGE_KEY)
const tags = ref<TagRow[]>(saved ? JSON.parse(saved) : seedTags)
const activeTab = ref<TabKey>('library')
const query = reactive({ keyword: '', object: '' as '' | TagObject, source: '' as '' | TagSource, status: '' as '' | TagStatus })
const detailVisible = ref(false)
const editorVisible = ref(false)
const mappingVisible = ref(false)
const coverageVisible = ref(false)
const activeTag = ref<TagRow | null>(null)
const editingId = ref<number | null>(null)
const form = reactive({ name: '', object: '客户' as TagObject, source: 'BOSS人工' as 'BOSS人工' | '规则' | 'AI', category: '', validity: '永久', permission: '业务人员可查看和打标', description: '' })
const mappingForm = reactive({ source: '企业微信' as '企业微信' | '外部SCRM', externalName: '', externalCode: '', bossTagId: undefined as number | undefined })

const groups = ref([
  { id: 1, name: '客户阶段', object: '客户', tags: ['正式课客户', '高意向'], owner: '客户运营部', status: '启用', updatedAt: '2026-08-24 18:20' },
  { id: 2, name: '销售判断', object: '客户', tags: ['价格敏感', '重点客户'], owner: '一转事业部', status: '启用', updatedAt: '2026-08-23 15:42' },
  { id: 3, name: '问卷洞察', object: '线索', tags: ['问卷高匹配'], owner: '产品中心', status: '启用', updatedAt: '2026-08-22 11:06' }
])
const rules = ref([
  { id: 1, name: '高意向识别', target: '高意向', object: '客户', trigger: '客户行为变化', condition: '近7天命中问卷高分、预约、到课、主动咨询任意3项', validity: '14天', status: '运行中', lastRun: '2026-08-25 03:00' },
  { id: 2, name: '问卷高匹配识别', target: '问卷高匹配', object: '线索', trigger: '问卷提交', condition: '语义模型置信度 ≥ 0.82', validity: '本营期', status: '运行中', lastRun: '2026-08-25 08:12' }
])
const mappings = ref([
  { id: 1, source: '企业微信', externalName: '重点客户', externalCode: 'wx_tag_6519', bossTag: '重点客户', direction: '外部 → BOSS', status: '正常', lastSync: '2026-08-25 08:16' },
  { id: 2, source: '外部SCRM', externalName: '试听已沟通', externalCode: 'ext_tag_339', bossTag: '试听已沟通', direction: '外部 → BOSS', status: '正常', lastSync: '2026-08-24 23:45' }
])
const governanceRows = computed(() => [
  { type: '疑似重复', level: '高', object: '价格敏感 / 对价格敏感', count: 2, suggestion: '合并到“价格敏感”，保留历史关系', owner: '客户运营部' },
  { type: '长期未使用', level: '中', object: '寒假意向2024', count: 1, suggestion: '确认无历史用途后停用', owner: '运营中心' },
  { type: '映射中断', level: '高', object: '企微：家长会已预约', count: 36, suggestion: '补充BOSS目标标签或解除映射', owner: '系统管理员' }
])
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

const filteredTags = computed(() => {
  const keyword = query.keyword.trim().toLowerCase()
  return tags.value.filter(tag => (!keyword || `${tag.name}${tag.code}${tag.source}`.toLowerCase().includes(keyword))
    && (!query.object || tag.object === query.object)
    && (!query.source || tag.source === query.source)
    && (!query.status || tag.status === query.status))
})
const summary = computed(() => ({
  total: tags.value.length,
  enabled: tags.value.filter(item => item.status !== '停用').length,
  disabled: tags.value.filter(item => item.status === '停用').length,
  system: tags.value.filter(item => item.source === '系统').length,
  external: tags.value.filter(item => ['企业微信', '外部SCRM'].includes(item.source)).length,
  automation: tags.value.filter(item => ['规则', 'AI'].includes(item.source)).length,
  coverage: tags.value.reduce((sum, item) => sum + item.coverage, 0)
}))
const sourceType = (source: TagSource) => ({ 系统: 'primary', BOSS人工: 'warning', 企业微信: 'success', 外部SCRM: 'info', 规则: 'primary', AI: 'danger' }[source] as any)
const editable = (tag: TagRow) => ['BOSS人工', '规则', 'AI'].includes(tag.source)

function resetQuery() { Object.assign(query, { keyword: '', object: '', source: '', status: '' }) }
function openDetail(tag: TagRow) { activeTag.value = tag; detailVisible.value = true }
function openCoverage(tag: TagRow) { activeTag.value = tag; coverageVisible.value = true }
function openCreate(tag?: TagRow) {
  editingId.value = tag?.id || null
  Object.assign(form, tag ? { name: tag.name, object: tag.object, source: tag.source, category: tag.category, validity: tag.validity, permission: tag.permission, description: tag.description } : { name: '', object: '客户', source: 'BOSS人工', category: '', validity: '永久', permission: '业务人员可查看和打标', description: '' })
  editorVisible.value = true
}
function saveTag() {
  if (!form.name.trim()) return ElMessage.warning('请输入标签名称')
  if (!form.category.trim()) return ElMessage.warning('请选择标签分类')
  if (tags.value.some(item => item.id !== editingId.value && item.name === form.name.trim() && item.object === form.object)) return ElMessage.warning('同一对象下已存在同名标签')
  const now = new Date().toLocaleString('zh-CN', { hour12: false })
  if (editingId.value) {
    const target = tags.value.find(item => item.id === editingId.value)!
    Object.assign(target, form, { name: form.name.trim(), generation: form.source === 'BOSS人工' ? '业务人员手工打标' : form.source === '规则' ? '规则命中自动生成' : 'AI模型识别', updatedAt: now })
    ElMessage.success('标签已更新')
  } else {
    const suffix = String(Date.now()).slice(-6)
    tags.value.unshift({ id: Date.now(), ...form, name: form.name.trim(), code: `TAG-${form.source === 'BOSS人工' ? 'MAN' : form.source === '规则' ? 'RULE' : 'AI'}-${suffix}`, generation: form.source === 'BOSS人工' ? '业务人员手工打标' : form.source === '规则' ? '规则命中自动生成' : 'AI模型识别', coverage: 0, status: '启用', event: form.source === 'BOSS人工' ? '人工操作' : '待配置', basis: form.source === 'BOSS人工' ? '业务判断' : '待配置', updatedAt: now })
    ElMessage.success('BOSS标签已创建')
  }
  editorVisible.value = false
}
async function toggleTag(tag: TagRow) {
  if (!editable(tag)) return ElMessage.info('系统和外部来源标签只读，请在来源系统或映射中处理')
  const next: TagStatus = tag.status === '停用' ? '启用' : '停用'
  await ElMessageBox.confirm(next === '停用' && tag.coverage > 0 ? `该标签已覆盖 ${tag.coverage.toLocaleString()} 个对象。停用后不再新增关系，历史标签继续保留。` : `确定${next}“${tag.name}”吗？`, `${next}标签`, { type: 'warning' })
  tag.status = next
  tag.updatedAt = new Date().toLocaleString('zh-CN', { hour12: false })
  ElMessage.success(`标签已${next}`)
}
function openMapping() { Object.assign(mappingForm, { source: '企业微信', externalName: '', externalCode: '', bossTagId: undefined }); mappingVisible.value = true }
function saveMapping() {
  if (!mappingForm.externalName.trim() || !mappingForm.externalCode.trim() || !mappingForm.bossTagId) return ElMessage.warning('请完整填写外部标签和目标BOSS标签')
  const target = tags.value.find(item => item.id === mappingForm.bossTagId)!
  mappings.value.unshift({ id: Date.now(), source: mappingForm.source, externalName: mappingForm.externalName.trim(), externalCode: mappingForm.externalCode.trim(), bossTag: target.name, direction: '外部 → BOSS', status: '正常', lastSync: '等待首次同步' })
  mappingVisible.value = false
  ElMessage.success('外部标签映射已创建')
}
function handleGovernance(row: any) { ElMessage.success(`已创建治理任务：${row.type} · ${row.object}`) }
</script>

<template>
  <div class="page tag-page">
    <PageHeader eyebrow="CUSTOMER · TAG GOVERNANCE" title="标签管理中心" description="统一管理BOSS人工标签、系统业务标签、企微及外部标签、自动规则和AI标签。">
      <el-button :icon="Connection" @click="openMapping">新建映射</el-button>
      <el-button type="primary" :icon="Plus" @click="openCreate()">新建标签</el-button>
    </PageHeader>

    <section class="metrics-grid">
      <article><span>标签总数</span><strong>{{ summary.total }}</strong><small>启用 {{ summary.enabled }} · 停用 {{ summary.disabled }}</small></article>
      <article><span>系统标签</span><strong>{{ summary.system }}</strong><small>营期 / 客户阶段 / 订单事实</small></article>
      <article><span>企微及外部标签</span><strong>{{ summary.external }}</strong><small>通过映射进入统一标签库</small></article>
      <article><span>规则 / AI 标签</span><strong>{{ summary.automation }}</strong><small>动态计算并保留规则版本</small></article>
      <article class="risk-card"><span>治理异常</span><strong>{{ governanceRows.length }}</strong><small>重复、闲置或映射中断</small></article>
    </section>

    <nav class="tag-tabs" aria-label="标签管理模块">
      <button v-for="tab in tabs" :key="tab.key" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
        <b>{{ tab.label }}</b><small>{{ tab.note }}</small>
      </button>
    </nav>

    <section v-if="activeTab === 'library'" class="surface content-card">
      <header class="section-head">
        <div><h2>统一标签库</h2><p>同一页面管理不同来源标签，但编辑权限和生命周期按来源严格隔离。</p></div>
        <div class="filters">
          <el-input v-model="query.keyword" clearable :prefix-icon="Search" placeholder="搜索标签名称 / ID / 来源系统" />
          <el-select v-model="query.object" clearable placeholder="全部对象"><el-option v-for="item in ['客户','线索','订单']" :key="item" :label="item" :value="item" /></el-select>
          <el-select v-model="query.source" clearable placeholder="全部来源"><el-option v-for="item in ['系统','BOSS人工','企业微信','外部SCRM','规则','AI']" :key="item" :label="item" :value="item" /></el-select>
          <el-select v-model="query.status" clearable placeholder="全部状态"><el-option v-for="item in ['启用','停用','已同步']" :key="item" :label="item" :value="item" /></el-select>
          <el-button :icon="RefreshRight" circle title="重置筛选" @click="resetQuery" />
        </div>
      </header>
      <el-table :data="filteredTags" row-key="id">
        <el-table-column label="标签名称" min-width="190"><template #default="{ row }"><button class="tag-name" @click="openDetail(row)">{{ row.name }}</button><small class="cell-sub">{{ row.code }}</small></template></el-table-column>
        <el-table-column prop="object" label="对象" width="90" />
        <el-table-column prop="category" label="分类" min-width="170" />
        <el-table-column label="来源" width="125"><template #default="{ row }"><el-tag :type="sourceType(row.source)" effect="light" round>{{ row.source }}</el-tag></template></el-table-column>
        <el-table-column prop="generation" label="生成方式" min-width="200" show-overflow-tooltip />
        <el-table-column label="覆盖对象" width="115" align="right"><template #default="{ row }"><el-button link type="primary" class="number-link" @click="openCoverage(row)">{{ row.coverage.toLocaleString() }}</el-button></template></el-table-column>
        <el-table-column prop="validity" label="有效期" width="110" />
        <el-table-column label="状态" width="100"><template #default="{ row }"><span :class="['status-dot', row.status === '停用' ? 'off' : 'on']">{{ row.status }}</span></template></el-table-column>
        <el-table-column label="操作" width="155" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openDetail(row)">查看</el-button><el-button v-if="editable(row)" link type="primary" @click="openCreate(row)">编辑</el-button><el-button v-if="editable(row)" link :type="row.status === '停用' ? 'success' : 'danger'" @click="toggleTag(row)">{{ row.status === '停用' ? '启用' : '停用' }}</el-button><el-button v-else link disabled>只读</el-button></template></el-table-column>
      </el-table>
      <footer class="table-footer"><span>共 {{ filteredTags.length }} 个标签 · 覆盖关系 {{ summary.coverage.toLocaleString() }} 条</span><el-pagination background layout="prev,pager,next,sizes" :total="filteredTags.length" :page-size="10" /></footer>
    </section>

    <section v-else-if="activeTab === 'groups'" class="surface content-card">
      <header class="section-head"><div><h2>标签组</h2><p>标签组用于页面筛选、客户画像分区和批量打标，不改变标签自身来源。</p></div><el-button type="primary" :icon="Plus" @click="ElMessage.info('标签组新建表单已进入下一步配置')">新建标签组</el-button></header>
      <el-table :data="groups"><el-table-column prop="name" label="标签组名称" min-width="180"/><el-table-column prop="object" label="对象" width="100"/><el-table-column label="包含标签" min-width="320"><template #default="{row}"><el-tag v-for="tag in row.tags" :key="tag" class="group-tag" effect="plain">{{ tag }}</el-tag></template></el-table-column><el-table-column prop="owner" label="维护组织" min-width="160"/><el-table-column prop="status" label="状态" width="100"/><el-table-column prop="updatedAt" label="更新时间" width="165"/><el-table-column label="操作" width="120"><template #default><el-button link type="primary">编辑</el-button><el-button link>排序</el-button></template></el-table-column></el-table>
    </section>

    <section v-else-if="activeTab === 'rules'" class="surface content-card">
      <header class="section-head"><div><h2>自动规则</h2><p>规则发布后按事件触发，保存规则版本、命中证据和标签有效期。</p></div><el-button type="primary" :icon="Plus" @click="ElMessage.info('请从规则标签进入规则配置')">新建规则</el-button></header>
      <el-table :data="rules"><el-table-column prop="name" label="规则名称" min-width="170"/><el-table-column prop="target" label="目标标签" min-width="140"/><el-table-column prop="object" label="对象" width="90"/><el-table-column prop="trigger" label="触发事件" min-width="150"/><el-table-column prop="condition" label="命中条件" min-width="330"/><el-table-column prop="validity" label="有效期" width="100"/><el-table-column prop="status" label="状态" width="100"><template #default="{row}"><el-tag type="success">{{row.status}}</el-tag></template></el-table-column><el-table-column prop="lastRun" label="最近执行" width="165"/><el-table-column label="操作" width="130"><template #default><el-button link type="primary">查看</el-button><el-button link type="primary">试算</el-button></template></el-table-column></el-table>
    </section>

    <section v-else-if="activeTab === 'mapping'" class="surface content-card">
      <header class="section-head"><div><h2>外部标签映射</h2><p>外部标签保留原始ID和来源；映射只统一展示与使用口径，不覆盖来源数据。</p></div><el-button type="primary" :icon="Connection" @click="openMapping">新建映射</el-button></header>
      <el-table :data="mappings"><el-table-column prop="source" label="来源系统" width="130"/><el-table-column prop="externalName" label="外部标签" min-width="180"/><el-table-column prop="externalCode" label="外部标签ID" min-width="180"/><el-table-column prop="bossTag" label="BOSS目标标签" min-width="180"/><el-table-column prop="direction" label="同步方向" width="130"/><el-table-column prop="status" label="状态" width="100"><template #default="{row}"><el-tag type="success">{{row.status}}</el-tag></template></el-table-column><el-table-column prop="lastSync" label="最近同步" width="170"/><el-table-column label="操作" width="120"><template #default><el-button link type="primary">编辑</el-button><el-button link>同步记录</el-button></template></el-table-column></el-table>
    </section>

    <section v-else class="surface content-card governance-card">
      <header class="section-head"><div><h2>标签治理</h2><p>发现标签重复、长期未使用、映射中断和规则异常，所有处理均形成治理任务。</p></div><el-button :icon="RefreshRight" @click="ElMessage.success('治理扫描任务已创建')">重新扫描</el-button></header>
      <div class="governance-summary"><Warning/><div><b>本次扫描发现 {{ governanceRows.length }} 类问题</b><p>系统不会自动删除或合并已使用标签，需责任人确认后执行。</p></div></div>
      <el-table :data="governanceRows"><el-table-column prop="type" label="问题类型" width="140"/><el-table-column label="风险" width="90"><template #default="{row}"><el-tag :type="row.level === '高' ? 'danger' : 'warning'">{{row.level}}</el-tag></template></el-table-column><el-table-column prop="object" label="涉及标签" min-width="220"/><el-table-column prop="count" label="影响数量" width="100" align="right"/><el-table-column prop="suggestion" label="建议处理" min-width="320"/><el-table-column prop="owner" label="责任组织" min-width="150"/><el-table-column label="操作" width="120"><template #default="{row}"><el-button link type="primary" @click="handleGovernance(row)">创建任务</el-button></template></el-table-column></el-table>
    </section>

    <el-drawer v-model="detailVisible" size="560px" :title="`${activeTag?.source || ''}标签详情 · ${activeTag?.name || ''}`">
      <template v-if="activeTag">
        <el-alert v-if="!editable(activeTag)" :title="activeTag.source === '系统' ? '该标签由业务事件生成，不允许人工修改。' : '该标签来自外部系统，BOSS仅展示和使用，修改请前往来源系统或调整映射。'" type="warning" :closable="false" />
        <div class="detail-grid">
          <label>标签来源<strong>{{ activeTag.source }}</strong></label><label>标签ID<strong>{{ activeTag.code }}</strong></label>
          <label>标签对象<strong>{{ activeTag.object }}</strong></label><label>标签分类<strong>{{ activeTag.category }}</strong></label>
          <label>生成事件<strong>{{ activeTag.event }}</strong></label><label>归属依据<strong>{{ activeTag.basis }}</strong></label>
          <label>历史策略<strong>{{ activeTag.coverage ? '保留历史关系，不物理删除' : '暂无历史关系' }}</strong></label><label>当前覆盖<strong>{{ activeTag.coverage.toLocaleString() }} {{ activeTag.object }}</strong></label>
          <label class="wide">使用权限<strong>{{ activeTag.permission }}</strong></label><label class="wide">说明<strong>{{ activeTag.description }}</strong></label>
        </div>
      </template>
      <template #footer><el-button @click="detailVisible=false">关闭</el-button><el-button v-if="activeTag && editable(activeTag)" type="primary" @click="detailVisible=false;openCreate(activeTag)">编辑标签</el-button></template>
    </el-drawer>

    <el-drawer v-model="editorVisible" size="560px" :title="editingId ? '编辑 BOSS 标签' : '新建 BOSS 标签'">
      <el-alert title="这里只创建BOSS人工、规则或AI标签。系统业务标签由业务事件产生，企微和外部SCRM标签通过映射接入。" type="warning" :closable="false" />
      <el-form label-position="top" class="tag-form">
        <el-form-item label="标签名称" required><el-input v-model="form.name" maxlength="30" show-word-limit placeholder="例如：价格敏感" /></el-form-item>
        <el-form-item label="标签对象" required><el-select v-model="form.object"><el-option v-for="item in ['客户','线索','订单']" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-form-item label="标签来源" required><el-radio-group v-model="form.source"><el-radio-button value="BOSS人工">BOSS人工</el-radio-button><el-radio-button value="规则">规则</el-radio-button><el-radio-button value="AI">AI</el-radio-button></el-radio-group></el-form-item>
        <el-form-item label="标签分类" required><el-select v-model="form.category" filterable allow-create placeholder="选择或输入分类"><el-option v-for="item in ['销售判断 / 购买阻碍','销售意向','客户阶段','问卷洞察','订单状态','业务归属 / 营期']" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-form-item label="有效期"><el-select v-model="form.validity"><el-option v-for="item in ['永久','7天','14天','30天','本营期']" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-form-item label="使用权限"><el-select v-model="form.permission"><el-option v-for="item in ['业务人员可查看和打标','一转可查看和打标','仅管理员维护','规则管理员维护','AI管理员维护']" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-form-item label="说明"><el-input v-model="form.description" type="textarea" :rows="3" maxlength="160" show-word-limit /></el-form-item>
      </el-form>
      <template #footer><el-button @click="editorVisible=false">取消</el-button><el-button type="primary" @click="saveTag">保存标签</el-button></template>
    </el-drawer>

    <el-dialog v-model="mappingVisible" title="新建外部标签映射" width="640px">
      <el-alert title="映射不会删除或改写外部标签；同步失败时进入标签治理，并保留原始事件。" type="info" :closable="false" />
      <el-form label-position="top" class="mapping-form"><div class="form-grid"><el-form-item label="来源系统" required><el-select v-model="mappingForm.source"><el-option label="企业微信" value="企业微信"/><el-option label="外部SCRM" value="外部SCRM"/></el-select></el-form-item><el-form-item label="外部标签名称" required><el-input v-model="mappingForm.externalName" /></el-form-item><el-form-item label="外部标签ID" required><el-input v-model="mappingForm.externalCode" /></el-form-item><el-form-item label="BOSS目标标签" required><el-select v-model="mappingForm.bossTagId" filterable><el-option v-for="item in tags.filter(tag => editable(tag))" :key="item.id" :label="`${item.name} · ${item.object}`" :value="item.id" /></el-select></el-form-item></div></el-form>
      <template #footer><el-button @click="mappingVisible=false">取消</el-button><el-button type="primary" @click="saveMapping">创建映射</el-button></template>
    </el-dialog>

    <el-dialog v-model="coverageVisible" :title="`标签覆盖明细 · ${activeTag?.name || ''}`" width="820px">
      <el-alert :title="`当前显示权限范围内的${activeTag?.object || '对象'}样例；完整结果共 ${activeTag?.coverage.toLocaleString() || 0} 条。`" type="info" :closable="false" />
      <el-table :data="coverageSamples" class="coverage-table"><el-table-column prop="code" label="对象编号" min-width="190"/><el-table-column prop="name" label="对象名称" min-width="160"/><el-table-column prop="owner" label="当前负责人" width="130"/><el-table-column prop="matchedAt" label="命中时间" width="165"/><el-table-column prop="evidence" label="命中依据" min-width="190" show-overflow-tooltip/></el-table>
      <template #footer><el-button @click="coverageVisible=false">关闭</el-button><el-button type="primary" @click="ElMessage.success('已按当前权限范围创建导出任务')">导出当前结果</el-button></template>
    </el-dialog>
  </div>
</template>

<style scoped>
.tag-page{--tag-violet:#5968ff;--tag-violet-soft:#eef0ff}.metrics-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;margin-bottom:20px}.metrics-grid article{padding:18px 20px;border:1px solid var(--line);border-radius:14px;background:#fff;box-shadow:0 8px 24px rgba(28,55,90,.04)}.metrics-grid span,.metrics-grid strong,.metrics-grid small{display:block}.metrics-grid span{color:var(--secondary);font-size:12px}.metrics-grid strong{margin:10px 0 8px;color:var(--text);font-size:28px;line-height:1;font-variant-numeric:tabular-nums}.metrics-grid small{color:var(--muted);font-size:11px}.metrics-grid .risk-card strong{color:#d58700}.tag-tabs{width:max-content;max-width:100%;display:flex;gap:3px;margin-bottom:18px;padding:5px;border:1px solid var(--line);border-radius:12px;background:#fff;overflow:auto}.tag-tabs button{min-width:108px;padding:10px 14px;border:0;border-radius:9px;background:transparent;color:var(--secondary);text-align:left;cursor:pointer;transition:.18s ease}.tag-tabs button:hover{background:#f5f7fb}.tag-tabs button.active{background:var(--tag-violet-soft);color:var(--tag-violet)}.tag-tabs b,.tag-tabs small{display:block}.tag-tabs b{font-size:13px}.tag-tabs small{display:none;margin-top:3px;font-size:10px}.content-card{overflow:hidden}.section-head{min-height:84px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;gap:20px;border-bottom:1px solid var(--line)}.section-head h2{margin:0 0 5px;font-size:18px}.section-head p{margin:0;color:var(--secondary);font-size:12px}.filters{display:grid;grid-template-columns:minmax(230px,1.5fr) repeat(3,minmax(118px,.75fr)) auto;gap:8px;min-width:min(760px,65vw)}.tag-name{padding:0;border:0;background:transparent;color:var(--text);font:inherit;font-weight:700;cursor:pointer}.tag-name:hover{color:var(--brand)}.cell-sub{display:block;margin-top:5px;color:var(--muted);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.number-link{font-weight:700;font-variant-numeric:tabular-nums}.status-dot{display:inline-flex;align-items:center;gap:6px;font-weight:600;font-size:12px}.status-dot:before{content:"";width:7px;height:7px;border-radius:50%;background:#24bd93;box-shadow:0 0 0 3px #e6f8f2}.status-dot.off{color:var(--muted)}.status-dot.off:before{background:#adb8c7;box-shadow:0 0 0 3px #edf0f4}.table-footer{min-height:64px;padding:12px 20px;display:flex;align-items:center;justify-content:flex-end;gap:18px;border-top:1px solid var(--line);color:var(--secondary);font-size:12px}.group-tag{margin:3px 5px 3px 0}.governance-card .governance-summary{margin:18px 20px;padding:15px 18px;display:flex;align-items:flex-start;gap:12px;border:1px solid #f1d490;border-radius:10px;background:#fff8e8;color:#9a6508}.governance-summary svg{width:20px;margin-top:2px}.governance-summary b,.governance-summary p{display:block;margin:0}.governance-summary p{margin-top:4px;font-size:12px}.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px}.detail-grid label{min-height:78px;padding:13px 15px;border:1px solid var(--line);border-radius:10px;background:#fbfcfe;color:var(--muted);font-size:11px}.detail-grid label.wide{grid-column:1/-1}.detail-grid strong{display:block;margin-top:9px;color:var(--text);font-size:14px;line-height:1.5}.tag-form,.mapping-form{margin-top:20px}.tag-form :deep(.el-select),.mapping-form :deep(.el-select){width:100%}.coverage-table{margin-top:18px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}@media(max-width:1100px){.metrics-grid{grid-template-columns:repeat(3,1fr)}.filters{min-width:0;grid-template-columns:1fr 1fr}.section-head{align-items:flex-start;flex-direction:column}}@media(max-width:720px){.metrics-grid{grid-template-columns:1fr 1fr}.metrics-grid article:last-child{grid-column:1/-1}.tag-tabs{width:100%}.section-head{padding:16px}.filters{width:100%;grid-template-columns:1fr}.detail-grid,.form-grid{grid-template-columns:1fr}.detail-grid label.wide{grid-column:auto}}
</style>
