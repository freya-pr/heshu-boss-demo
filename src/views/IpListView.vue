<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Box, Plus, Search } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'

type Product = {
  id: number
  name: string
  thirdPartyId: string
  platform: string
  store: string
  status: '在售' | '停用'
}

type IpRow = {
  id: number
  ipNo: string
  name: string
  category: string
  channelCode: string
  description: string
  platforms: string[]
  products: Product[]
  creator: string
  createdAt: string
  status: '启用' | '停用'
}

const platformMeta: Record<string, { code: string; color: string }> = {
  抖音: { code: 'DY', color: '#162443' },
  有赞: { code: 'YZ', color: '#f04452' },
  小鹅通: { code: 'XET', color: '#2676e8' },
  小红书: { code: 'XHS', color: '#ff2442' },
  视频号: { code: 'WX', color: '#18a874' },
  百家号: { code: 'BJH', color: '#4d77df' },
  快手: { code: 'KS', color: '#ff6b21' }
}

const rows = ref<IpRow[]>([
  {
    id: 1, ipNo: 'IP000001', name: '阿留皮皮', category: 'EDUCATION_PLANNING', channelCode: 'CH000002', description: '面向家庭教育与亲子关系的老师IP',
    platforms: ['抖音', '有赞', '小鹅通', '视频号', '小红书'], creator: '林校长', createdAt: '2026-08-01 09:20', status: '启用',
    products: [
      { id: 1, name: '教育规划陪跑营6.0', thirdPartyId: 'DY-EDU-6001', platform: '抖音', store: '合数教育官方旗舰店', status: '在售' },
      { id: 2, name: '家庭教育直播体验课', thirdPartyId: 'YZ-LIVE-0822', platform: '有赞', store: '合数精品课程店', status: '在售' },
      { id: 3, name: '亲子沟通训练营', thirdPartyId: 'XET-PARENT-03', platform: '小鹅通', store: '合数成长课堂', status: '在售' },
      { id: 4, name: '家庭学习力测评', thirdPartyId: 'WX-ASSESS-12', platform: '视频号', store: '合数教育视频号', status: '在售' },
      { id: 5, name: '父母成长公开课', thirdPartyId: 'XHS-PARENT-06', platform: '小红书', store: '合数教育体验课', status: '停用' }
    ]
  },
  {
    id: 2, ipNo: 'IP000002', name: '周老师', category: 'EDUCATION_PLANNING', channelCode: 'CH000001', description: '聚焦青少年学习习惯与学习能力提升',
    platforms: ['抖音', '小鹅通', '视频号'], creator: '李士文', createdAt: '2026-08-05 14:10', status: '启用',
    products: [
      { id: 6, name: '学习力诊断课', thirdPartyId: 'DY-STUDY-100', platform: '抖音', store: '合数教育官方旗舰店', status: '在售' },
      { id: 7, name: '高效学习训练营', thirdPartyId: 'XET-STUDY-21', platform: '小鹅通', store: '合数成长课堂', status: '在售' },
      { id: 8, name: '学习习惯测评', thirdPartyId: 'WX-STUDY-08', platform: '视频号', store: '合数教育视频号', status: '在售' }
    ]
  },
  {
    id: 3, ipNo: 'IP000003', name: '王老师', category: 'EDUCATION_PLANNING', channelCode: 'CH000001', description: '升学规划、选科与家庭决策内容IP',
    platforms: ['小红书', '百家号', '抖音', '快手'], creator: '王老师', createdAt: '2026-08-10 11:45', status: '停用',
    products: [
      { id: 9, name: '1V1升学诊断', thirdPartyId: 'XHS-PLAN-01', platform: '小红书', store: '合数教育体验课', status: '在售' },
      { id: 10, name: '升学规划公开课', thirdPartyId: 'BJH-PLAN-02', platform: '百家号', store: '合数内容中心', status: '停用' }
    ]
  }
])

const dictionaryStorageKey = 'heshu_boss_dictionaries_v1'
const ipBindingStorageKey = 'heshu_boss_ip_bindings_v1'
const router = useRouter()
const fallbackCategories = [{ label: '教育规划', value: 'EDUCATION_PLANNING' }]
const ipChannels = [
  { code: 'CH000001', name: '店播' },
  { code: 'CH000002', name: '阿留专属' }
]
const categoryOptions = ref([...fallbackCategories])
const query = reactive({ keyword: '', category: '', channelCode: '', platform: '', status: '' })
const platformDialogVisible = ref(false)
const configVisible = ref(false)
const editorVisible = ref(false)
const activeRow = ref<IpRow | null>(null)
const editingRow = ref<IpRow | null>(null)
const form = reactive({ name: '', category: 'EDUCATION_PLANNING', channelCode: 'CH000001', description: '', platforms: [] as string[] })

const filteredRows = computed(() => {
  const term = query.keyword.trim().toLowerCase()
  return rows.value.filter(row => (!term || `${row.ipNo}${row.name}${row.creator}`.toLowerCase().includes(term))
    && (!query.category || row.category === query.category)
    && (!query.channelCode || row.channelCode === query.channelCode)
    && (!query.platform || row.platforms.includes(query.platform))
    && (!query.status || row.status === query.status))
})

const totalProducts = computed(() => filteredRows.value.reduce((sum, row) => sum + row.products.length, 0))
const totalPlatforms = computed(() => new Set(filteredRows.value.flatMap(row => row.platforms)).size)

function loadIpCategories() {
  try {
    const dictionaries = JSON.parse(localStorage.getItem(dictionaryStorageKey) || '[]')
    const items = dictionaries.find((item: any) => item.code === 'ip_category' && item.status === 'ACTIVE')?.items
    categoryOptions.value = Array.isArray(items) && items.some((item: any) => item.status === 'ACTIVE') ? items.filter((item: any) => item.status === 'ACTIVE').sort((a: any, b: any) => a.sort - b.sort).map((item: any) => ({ label: item.label, value: item.value })) : [...fallbackCategories]
  } catch { categoryOptions.value = [...fallbackCategories] }
}
function persistIpBindings() {
  localStorage.setItem(ipBindingStorageKey, JSON.stringify(rows.value.map(row => ({ ipNo: row.ipNo, name: row.name, category: row.category, channelCode: row.channelCode, status: row.status }))))
}
onMounted(() => { loadIpCategories(); persistIpBindings() })
function categoryLabel(value: string) { return categoryOptions.value.find(item => item.value === value)?.label || value }
function channelInfo(code: string) { return ipChannels.find(item => item.code === code) || { code, name: '未配置' } }
function resetQuery() { Object.assign(query, { keyword: '', category: '', channelCode: '', platform: '', status: '' }) }
function openPlatforms(row: IpRow) { activeRow.value = row; platformDialogVisible.value = true }
function openProducts(row: IpRow) { router.push({ path: '/leads/products', query: { ipNo: row.ipNo } }) }
function openEditor(row?: IpRow) {
  loadIpCategories(); editingRow.value = row || null
  Object.assign(form, row ? { name: row.name, category: row.category, channelCode: row.channelCode, description: row.description, platforms: [...row.platforms] } : { name: '', category: categoryOptions.value[0]?.value || 'EDUCATION_PLANNING', channelCode: ipChannels[0].code, description: '', platforms: [] })
  editorVisible.value = true
}
function saveIp() {
  if (!form.name.trim()) return ElMessage.warning('请输入IP名称')
  if (!form.category) return ElMessage.warning('请选择IP大类')
  if (!form.channelCode) return ElMessage.warning('请选择IP渠道')
  if (editingRow.value) { Object.assign(editingRow.value, { name: form.name.trim(), category: form.category, channelCode: form.channelCode, description: form.description.trim(), platforms: [...form.platforms] }); persistIpBindings(); editorVisible.value = false; ElMessage.success('IP配置已更新'); return }
  const sequence = Math.max(0, ...rows.value.map(row => Number(row.ipNo.replace(/\D/g, '')))) + 1
  rows.value.unshift({ id: Date.now(), ipNo: `IP${String(sequence).padStart(6, '0')}`, name: form.name.trim(), category: form.category, channelCode: form.channelCode, description: form.description.trim(), platforms: [...form.platforms], products: [], creator: '林校长', createdAt: '2026-08-20 10:30', status: '启用' })
  persistIpBindings()
  editorVisible.value = false
  ElMessage.success('IP主档已创建')
}
function toggleStatus(row: IpRow) { row.status = row.status === '启用' ? '停用' : '启用'; persistIpBindings(); ElMessage.success(`IP已${row.status}`) }
function meta(name: string) { return platformMeta[name] || { code: name.slice(0, 2), color: '#70839e' } }
</script>

<template>
  <section class="page ip-page">
    <PageHeader title="IP管理" description="统一维护IP名称、IP大类与IP渠道的绑定关系，以及IP与商品、投放平台之间的关联关系。">
      <el-button @click="configVisible = true">IP配置</el-button><el-button type="primary" :icon="Plus" @click="openEditor()">新增IP</el-button>
    </PageHeader>

    <div class="ip-summary">
      <article><i>IP</i><span><small>当前IP</small><b>{{ filteredRows.length }}</b></span></article>
      <article><el-icon><Box /></el-icon><span><small>关联商品</small><b>{{ totalProducts }}</b></span></article>
      <article><i class="platform-mark">↗</i><span><small>覆盖平台</small><b>{{ totalPlatforms }}</b></span></article>
    </div>

    <div class="ip-filter surface">
      <el-input v-model="query.keyword" clearable :prefix-icon="Search" placeholder="IP名称、IP编号或创建人" />
      <el-select v-model="query.category" clearable filterable placeholder="IP大类"><el-option v-for="item in categoryOptions" :key="item.value" :label="`${item.label} · ${item.value}`" :value="item.value" /></el-select>
      <el-select v-model="query.channelCode" clearable placeholder="IP渠道"><el-option v-for="item in ipChannels" :key="item.code" :label="`${item.name} · ${item.code}`" :value="item.code" /></el-select>
      <el-select v-model="query.platform" clearable placeholder="关联平台"><el-option v-for="name in Object.keys(platformMeta)" :key="name" :label="name" :value="name" /></el-select>
      <el-select v-model="query.status" clearable placeholder="IP状态"><el-option label="启用" value="启用"/><el-option label="停用" value="停用"/></el-select>
      <el-button type="primary">查询</el-button><el-button @click="resetQuery">重置</el-button>
    </div>

    <article class="ip-ledger surface">
      <header><div><h3>IP主档</h3><span>共 {{ filteredRows.length }} 条</span></div><p>IP编号创建后保持不变，名称调整不影响历史关联</p></header>
      <el-table :data="filteredRows" row-key="id">
        <el-table-column label="IP大类" width="205"><template #default="{ row }"><div class="category-cell"><el-tag type="primary" effect="plain">{{ categoryLabel(row.category) }}</el-tag><code>{{ row.category }}</code></div></template></el-table-column>
        <el-table-column label="IP渠道" width="145"><template #default="{ row }"><div class="channel-cell"><b>{{ channelInfo(row.channelCode).name }}</b><code>{{ channelInfo(row.channelCode).code }}</code></div></template></el-table-column>
        <el-table-column label="IP名称" min-width="250"><template #default="{ row }"><div class="ip-name"><b>{{ row.name }}</b><code>{{ row.ipNo }}</code><small>{{ row.description }}</small></div></template></el-table-column>
        <el-table-column label="关联商品" width="130" align="center"><template #default="{ row }"><button class="count-link" @click="openProducts(row)"><b>{{ row.products.length }}</b><span>个商品</span><i>查看列表 →</i></button></template></el-table-column>
        <el-table-column label="关联平台" min-width="290"><template #default="{ row }"><button class="platform-stack" @click="openPlatforms(row)"><span v-for="name in row.platforms.slice(0, 3)" :key="name" class="platform-pill"><i :style="{ background: meta(name).color }">{{ meta(name).code }}</i>{{ name }}</span><em v-if="row.platforms.length > 3">+{{ row.platforms.length - 3 }}</em><small v-if="!row.platforms.length">暂未关联</small></button></template></el-table-column>
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="150" />
        <el-table-column label="状态" width="85"><template #default="{ row }"><el-tag :type="row.status === '启用' ? 'success' : 'info'">{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="185" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openProducts(row)">详情</el-button><el-button link type="primary" @click="openEditor(row)">编辑</el-button><el-button link type="primary" @click="toggleStatus(row)">{{ row.status === '启用' ? '停用' : '启用' }}</el-button></template></el-table-column>
      </el-table>
    </article>

    <el-dialog v-model="platformDialogVisible" :title="`${activeRow?.name || ''} · 关联平台`" width="560px">
      <div v-if="activeRow" class="platform-dialog-list">
        <article v-for="name in activeRow.platforms" :key="name"><i :style="{ background: meta(name).color }">{{ meta(name).code }}</i><div><b>{{ name }}</b><span>已关联至 {{ activeRow.name }}</span></div><el-tag type="success" effect="plain">已关联</el-tag></article>
      </div>
      <el-empty v-if="activeRow && !activeRow.platforms.length" description="暂未关联平台" />
      <template #footer><el-button type="primary" @click="platformDialogVisible = false">我知道了</el-button></template>
    </el-dialog>

    <el-drawer v-model="configVisible" title="IP配置" size="760px">
      <div class="editor-note"><b>IP主档关系配置</b><span>每个IP名称绑定一个IP大类和一个IP渠道；活码选择IP后自动继承这里配置的渠道。</span></div>
      <div class="config-toolbar"><div><b>当前配置</b><span>共 {{ rows.length }} 条</span></div><el-button type="primary" :icon="Plus" @click="configVisible = false; openEditor()">新增配置</el-button></div>
      <el-table :data="rows" row-key="id">
        <el-table-column label="IP名称" min-width="170"><template #default="{ row }"><div class="ip-name compact"><b>{{ row.name }}</b><code>{{ row.ipNo }}</code></div></template></el-table-column>
        <el-table-column label="IP大类" min-width="190"><template #default="{ row }"><div class="category-cell"><el-tag effect="plain">{{ categoryLabel(row.category) }}</el-tag><code>{{ row.category }}</code></div></template></el-table-column>
        <el-table-column label="IP渠道" min-width="150"><template #default="{ row }"><div class="channel-cell"><b>{{ channelInfo(row.channelCode).name }}</b><code>{{ row.channelCode }}</code></div></template></el-table-column>
        <el-table-column label="状态" width="82"><template #default="{ row }"><el-tag :type="row.status === '启用' ? 'success' : 'info'">{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="80"><template #default="{ row }"><el-button link type="primary" @click="configVisible = false; openEditor(row)">编辑</el-button></template></el-table-column>
      </el-table>
      <template #footer><el-button type="primary" @click="configVisible = false">完成</el-button></template>
    </el-drawer>

    <el-drawer v-model="editorVisible" :title="editingRow ? '编辑IP' : '新增IP'" size="600px">
      <div class="editor-note"><b>IP编号将自动生成</b><span>保存后系统按当前最大编号顺序生成，编号不可修改。</span></div>
      <el-form label-position="top">
        <el-form-item label="IP名称" required><el-input v-model="form.name" maxlength="40" show-word-limit placeholder="例如：阿留皮皮" /><small>IP名称使用老师对外名称或老师姓名。</small></el-form-item>
        <el-form-item label="IP大类" required><el-select v-model="form.category" filterable placeholder="请选择IP大类"><el-option v-for="item in categoryOptions" :key="item.value" :label="`${item.label} · ${item.value}`" :value="item.value" /></el-select><small>选项来自系统管理—字典管理—IP大类。</small></el-form-item>
        <el-form-item label="大类编码"><el-input :model-value="form.category" readonly placeholder="选择IP大类后自动带出" /><small>取自IP大类字典项值，作为接口、筛选和历史归因的稳定编码，不允许在此处单独修改。</small></el-form-item>
        <el-form-item label="IP渠道" required><el-select v-model="form.channelCode" filterable placeholder="请选择渠道名称或编号"><el-option v-for="item in ipChannels" :key="item.code" :label="`${item.name} · ${item.code}`" :value="item.code" /></el-select><small>渠道编号用于稳定归因，渠道更名不影响历史数据。</small></el-form-item>
        <el-form-item label="IP说明"><el-input v-model="form.description" type="textarea" :rows="3" maxlength="120" show-word-limit placeholder="简要说明该IP的定位和内容方向" /></el-form-item>
        <el-form-item label="关联平台"><el-select v-model="form.platforms" multiple filterable placeholder="可选择多个平台"><el-option v-for="name in Object.keys(platformMeta)" :key="name" :label="name" :value="name" /></el-select></el-form-item>
      </el-form>
      <template #footer><el-button @click="editorVisible = false">取消</el-button><el-button type="primary" @click="saveIp">{{ editingRow ? '保存修改' : '创建IP' }}</el-button></template>
    </el-drawer>
  </section>
</template>

<style scoped>
.ip-page{--ip-ink:#142541;--ip-blue:#2875e6;--ip-mint:#1daf91}.ip-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px}.ip-summary article{display:flex;align-items:center;gap:12px;padding:15px 18px;border:1px solid #e0e8f2;border-radius:10px;background:#fff}.ip-summary article>i,.ip-summary article>.el-icon{width:36px;height:36px;display:grid;place-items:center;border-radius:9px;background:#edf4ff;color:var(--ip-blue);font-style:normal;font-weight:800}.ip-summary article>.platform-mark{background:#ebf8f5;color:var(--ip-mint)}.ip-summary small,.ip-summary b{display:block}.ip-summary small{color:#8795a8;font-size:10px}.ip-summary b{margin-top:3px;color:var(--ip-ink);font:700 21px Inter,"PingFang SC",sans-serif}.ip-filter{display:grid;grid-template-columns:1.5fr .75fr .65fr auto auto;gap:9px;padding:14px 16px;margin-bottom:14px}.ip-ledger{padding:0 18px 18px}.ip-ledger>header{height:62px;display:flex;align-items:center;justify-content:space-between}.ip-ledger header>div{display:flex;align-items:baseline;gap:9px}.ip-ledger h3{margin:0;color:var(--ip-ink)}.ip-ledger header span,.ip-ledger header p{color:#8b99ab;font-size:10px}.ip-ledger code,.relation-head code,.el-drawer code{padding:5px 7px;border:1px solid #dce5f0;border-radius:6px;background:#f3f7fc;color:#3e6491;font:700 10px "SFMono-Regular",Consolas,monospace}.ip-name b,.ip-name small{display:block}.ip-name b{color:var(--ip-ink)}.ip-name code{display:block;width:max-content;margin-top:5px;padding:2px 5px!important;font-size:8px!important}.ip-name small{overflow:hidden;margin-top:5px;color:#8b99ab;font-size:10px;text-overflow:ellipsis;white-space:nowrap}.count-link{min-width:86px;padding:7px 9px;border:1px solid #d7e5f8;border-radius:8px;background:#f5f9ff;color:var(--ip-blue);cursor:pointer}.count-link b{font-size:17px}.count-link span{margin-left:3px;font-size:10px}.count-link i{display:block;margin-top:3px;font-size:8px;font-style:normal;opacity:.75}.count-link:hover,.count-link:focus-visible{border-color:#7cacec;background:#edf5ff}.count-link:focus-visible,.platform-stack:focus-visible{outline:2px solid var(--ip-blue);outline-offset:2px}.platform-stack{display:flex;width:100%;align-items:center;gap:6px;padding:4px 0;border:0;background:none;text-align:left;cursor:pointer}.platform-pill{display:flex;align-items:center;gap:5px;padding:3px 7px 3px 4px;border-radius:12px;background:#f1f5fa;color:#536982;font-size:9px;white-space:nowrap}.platform-pill i{min-width:20px;height:20px;display:grid;place-items:center;padding:0 3px;border-radius:7px;color:#fff;font-size:7px;font-style:normal;font-weight:800}.platform-stack em{padding:4px 7px;border-radius:10px;background:#e6f0ff;color:var(--ip-blue);font-size:9px;font-style:normal;font-weight:700}.platform-stack small{color:#9ba7b6}.relation-head{display:flex;align-items:center;gap:12px;padding:15px;margin-bottom:16px;border:1px solid #dce7f5;border-radius:9px;background:linear-gradient(105deg,#f3f8ff,#fff)}.relation-head div b,.relation-head div span{display:block}.relation-head div b{color:var(--ip-ink)}.relation-head div span{margin-top:3px;color:#8795a8;font-size:10px}.platform-dialog-list{display:grid;gap:9px}.platform-dialog-list article{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid #e0e7f0;border-radius:9px}.platform-dialog-list article>i{width:38px;height:32px;display:grid;place-items:center;border-radius:8px;color:#fff;font-size:9px;font-style:normal;font-weight:800}.platform-dialog-list article>div{flex:1}.platform-dialog-list b,.platform-dialog-list span{display:block}.platform-dialog-list b{color:var(--ip-ink)}.platform-dialog-list span{margin-top:3px;color:#8b99ab;font-size:9px}.editor-note{display:flex;flex-direction:column;gap:4px;padding:14px 16px;margin-bottom:20px;border-left:3px solid var(--ip-blue);border-radius:7px;background:#f2f7ff}.editor-note b{color:var(--ip-ink)}.editor-note span{color:#71839b;font-size:10px}.config-toolbar{height:58px;display:flex;align-items:center;justify-content:space-between}.config-toolbar>div{display:flex;align-items:baseline;gap:9px}.config-toolbar span{color:#8b99ab;font-size:10px}.el-drawer :deep(.el-select){width:100%}@media(max-width:1100px){.ip-filter{grid-template-columns:1fr 1fr}.ip-summary{grid-template-columns:1fr}.ip-filter .el-button{margin:0}}
.channel-cell{display:flex;flex-direction:column;gap:4px}.channel-cell b{color:var(--ip-ink);font-size:12px}.channel-cell code{width:max-content;padding:2px 5px!important;font-size:8px!important}.ip-filter{grid-template-columns:1.35fr .62fr .72fr .62fr .55fr auto auto}
.category-cell{display:flex;align-items:flex-start;flex-direction:column;gap:6px}.category-cell code{max-width:180px;padding:2px 5px!important;overflow:hidden;font-size:8px!important;text-overflow:ellipsis;white-space:nowrap}
</style>
