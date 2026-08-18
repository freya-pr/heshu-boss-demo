<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DataAnalysis, EditPen, Key, Plus, Search } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'

type Platform = '抖音' | '有赞' | '小鹅通' | '淘宝' | '小红书' | '其他'
type StoreStatus = '启用' | '停用'
type ArchiveDateType = '创建时间' | '更新时间' | '启停时间'
type AnalyticsMode = '线索归因口径' | '业务发生口径'
type AnalyticsDateType = '线索进入时间' | '加微时间' | '转客户时间' | '下单时间' | '支付时间' | '退款时间'
type StorePermission = {
  orgIds: number[]
  employeeIds: number[]
  actions: Array<'查看店铺' | '编辑店铺' | '查看线索' | '导出数据'>
}
type StoreMetrics = {
  leads: number
  validLeads: number
  wechatAdds: number
  customers: number
  orders: number
  paidOrders: number
  gmv: number
  refundOrders: number
  refundAmount: number
  anomalies: number
  updatedAt: string
}
type StoreRow = {
  id: number
  platform: Platform
  name: string
  thirdPartyStoreId: string
  ownerId: number
  ownerName: string
  status: StoreStatus
  permission: StorePermission
  metrics: StoreMetrics
  createdBy: string
  createdAt: string
  updatedAt: string
  statusChangedAt: string
}

const platforms: Array<{ name: Platform; code: string; color: string }> = [
  { name: '抖音', code: 'DY', color: '#17233d' },
  { name: '有赞', code: 'YZ', color: '#ef4d57' },
  { name: '小鹅通', code: 'XET', color: '#2b76e5' },
  { name: '淘宝', code: 'TB', color: '#ff6a00' },
  { name: '小红书', code: 'XHS', color: '#ff2442' },
  { name: '其他', code: 'OTHER', color: '#75859b' }
]
const employees = [
  { id: 1, no: 'B00001', name: '李士文', org: '一转事业部 / 销售一组' },
  { id: 2, no: 'B00126', name: '王老师', org: '一转事业部 / 销售二组' },
  { id: 3, no: 'B00135', name: '陈老师', org: '运营中心 / 渠道组' },
  { id: 4, no: 'B00208', name: '刘老师', org: '客户运营部 / 客服组' },
  { id: 5, no: 'B00236', name: '周老师', org: '集团管理中心' }
]
const organizations = [
  { id: 10, name: '一转事业部' },
  { id: 11, name: '运营中心' },
  { id: 12, name: '客户运营部' },
  { id: 13, name: '集团管理中心' }
]

const rows = ref<StoreRow[]>([
  { id: 1, platform: '抖音', name: '合数教育官方旗舰店', thirdPartyStoreId: 'DY-8849362510', ownerId: 3, ownerName: '陈老师', status: '启用', permission: { orgIds: [10, 11], employeeIds: [1, 3], actions: ['查看店铺', '编辑店铺', '查看线索', '导出数据'] }, metrics: { leads: 12846, validLeads: 11320, wechatAdds: 7894, customers: 6428, orders: 1386, paidOrders: 1128, gmv: 3268400, refundOrders: 86, refundAmount: 218600, anomalies: 12, updatedAt: '2026-08-18 09:30' }, createdBy: '张铭钰', createdAt: '2026-08-02 10:18', updatedAt: '2026-08-17 16:30', statusChangedAt: '2026-08-02 10:18' },
  { id: 2, platform: '有赞', name: '合数精品课程店', thirdPartyStoreId: 'YZ-100893572', ownerId: 1, ownerName: '李士文', status: '启用', permission: { orgIds: [10], employeeIds: [1, 2], actions: ['查看店铺', '查看线索'] }, metrics: { leads: 6820, validLeads: 5986, wechatAdds: 3926, customers: 3158, orders: 728, paidOrders: 596, gmv: 1725600, refundOrders: 41, refundAmount: 98600, anomalies: 5, updatedAt: '2026-08-18 09:30' }, createdBy: '张铭钰', createdAt: '2026-08-04 14:22', updatedAt: '2026-08-16 09:10', statusChangedAt: '2026-08-04 14:22' },
  { id: 3, platform: '小鹅通', name: '合数成长课堂', thirdPartyStoreId: 'XET-HS-2026003', ownerId: 4, ownerName: '刘老师', status: '启用', permission: { orgIds: [12], employeeIds: [4], actions: ['查看店铺', '编辑店铺', '查看线索'] }, metrics: { leads: 4215, validLeads: 3882, wechatAdds: 2864, customers: 2340, orders: 615, paidOrders: 528, gmv: 1538400, refundOrders: 34, refundAmount: 82100, anomalies: 3, updatedAt: '2026-08-18 09:30' }, createdBy: '陈庆焕', createdAt: '2026-08-06 09:45', updatedAt: '2026-08-18 08:35', statusChangedAt: '2026-08-06 09:45' },
  { id: 4, platform: '小红书', name: '合数教育体验课', thirdPartyStoreId: 'XHS-STORE-77021', ownerId: 3, ownerName: '陈老师', status: '停用', permission: { orgIds: [11], employeeIds: [3], actions: ['查看店铺'] }, metrics: { leads: 2168, validLeads: 1820, wechatAdds: 986, customers: 748, orders: 163, paidOrders: 126, gmv: 365400, refundOrders: 18, refundAmount: 47600, anomalies: 9, updatedAt: '2026-08-12 18:20' }, createdBy: '陈庆焕', createdAt: '2026-07-21 11:06', updatedAt: '2026-08-12 18:20', statusChangedAt: '2026-08-12 18:20' }
])

const query = reactive({ keyword: '', platform: '' as '' | Platform, ownerId: undefined as number | undefined, status: '' as '' | StoreStatus, dateType: '创建时间' as ArchiveDateType, dateRange: [] as string[] })
const editorVisible = ref(false)
const permissionVisible = ref(false)
const analyticsVisible = ref(false)
const editingId = ref<number | null>(null)
const activeStore = ref<StoreRow | null>(null)
const form = reactive({ platform: undefined as Platform | undefined, name: '', thirdPartyStoreId: '', ownerId: undefined as number | undefined, status: '启用' as StoreStatus })
const permissionForm = reactive<StorePermission>({ orgIds: [], employeeIds: [], actions: ['查看店铺'] })
const analyticsMode = ref<AnalyticsMode>('线索归因口径')
const analyticsDateType = ref<AnalyticsDateType>('线索进入时间')
const analyticsRange = ref(['2026-08-01', '2026-08-18'])
const analyticsCamp = ref('2026暑期第3营')

const analyticsDateOptions = computed<AnalyticsDateType[]>(() => analyticsMode.value === '线索归因口径'
  ? ['线索进入时间']
  : ['线索进入时间', '加微时间', '转客户时间', '下单时间', '支付时间', '退款时间'])
const analyticsRuleText = computed(() => analyticsMode.value === '线索归因口径'
  ? '按线索进入时间圈定同一批线索，再追踪其后续加微、转客户、下单、支付和退款结果。'
  : '按各业务事件实际发生时间统计：加微看加微时间、订单看下单时间、GMV看支付成功时间、退款看退款成功时间。')

const filteredRows = computed(() => {
  const term = query.keyword.trim().toLowerCase()
  return rows.value.filter(row => (!term || `${row.name}${row.thirdPartyStoreId}${row.ownerName}`.toLowerCase().includes(term))
    && (!query.platform || row.platform === query.platform)
    && (!query.ownerId || row.ownerId === query.ownerId)
    && (!query.status || row.status === query.status)
    && matchesArchiveDate(row))
})
const summary = computed(() => ({
  total: filteredRows.value.length,
  leads: filteredRows.value.reduce((sum, item) => sum + item.metrics.leads, 0),
  adds: filteredRows.value.reduce((sum, item) => sum + item.metrics.wechatAdds, 0),
  paidOrders: filteredRows.value.reduce((sum, item) => sum + item.metrics.paidOrders, 0),
  netGmv: filteredRows.value.reduce((sum, item) => sum + item.metrics.gmv - item.metrics.refundAmount, 0)
}))
const funnelStages = computed(() => {
  const metrics = activeStore.value?.metrics
  if (!metrics) return []
  const stages = [
    { key: 'leads', name: '线索数', value: metrics.leads },
    { key: 'valid', name: '有效线索', value: metrics.validLeads },
    { key: 'wechat', name: '加微数', value: metrics.wechatAdds },
    { key: 'customer', name: '客户数', value: metrics.customers },
    { key: 'order', name: '下单数', value: metrics.orders },
    { key: 'paid', name: '支付订单', value: metrics.paidOrders }
  ]
  return stages.map((item, index) => ({ ...item, rate: index === 0 ? 100 : percentage(item.value, stages[index - 1].value) }))
})
const trendRows = computed(() => {
  const total = activeStore.value?.metrics.leads || 0
  const factors = [.10, .13, .12, .16, .14, .18, .17]
  return factors.map((factor, index) => ({ day: `${index + 12}日`, leads: Math.round(total * factor), adds: Math.round(total * factor * (.58 + index * .018)), orders: Math.round(total * factor * (.08 + index * .005)) }))
})
const maxTrend = computed(() => Math.max(...trendRows.value.map(item => item.leads), 1))
const attributionRows = computed(() => {
  const metrics = activeStore.value?.metrics
  if (!metrics) return []
  return [
    { name: '教育规划陪跑营6.0', productId: 'SKU-2980-060', leads: Math.round(metrics.leads * .52), paid: Math.round(metrics.paidOrders * .56), gmv: Math.round(metrics.gmv * .61) },
    { name: '暑期体验课', productId: 'SKU-TRY-0822', leads: Math.round(metrics.leads * .31), paid: Math.round(metrics.paidOrders * .28), gmv: Math.round(metrics.gmv * .24) },
    { name: '诊断预约服务', productId: 'SKU-DIAG-001', leads: Math.round(metrics.leads * .17), paid: Math.round(metrics.paidOrders * .16), gmv: Math.round(metrics.gmv * .15) }
  ]
})

function matchesArchiveDate(row: StoreRow) {
  if (!query.dateRange?.length || query.dateRange.length < 2) return true
  const field = query.dateType === '创建时间' ? row.createdAt : query.dateType === '更新时间' ? row.updatedAt : row.statusChangedAt
  const value = field.slice(0, 10)
  return value >= query.dateRange[0] && value <= query.dateRange[1]
}
function resetQuery() { Object.assign(query, { keyword: '', platform: '', ownerId: undefined, status: '', dateType: '创建时间', dateRange: [] }) }
function changeAnalyticsMode(mode: AnalyticsMode) {
  analyticsMode.value = mode
  analyticsDateType.value = mode === '线索归因口径' ? '线索进入时间' : '支付时间'
}
function resetForm() { Object.assign(form, { platform: undefined, name: '', thirdPartyStoreId: '', ownerId: undefined, status: '启用' }) }
function openCreate() { editingId.value = null; resetForm(); editorVisible.value = true }
function openEdit(row: StoreRow) {
  editingId.value = row.id
  Object.assign(form, { platform: row.platform, name: row.name, thirdPartyStoreId: row.thirdPartyStoreId, ownerId: row.ownerId, status: row.status })
  editorVisible.value = true
}
function saveStore() {
  if (!form.platform) return ElMessage.warning('请选择平台类型')
  if (!form.name.trim()) return ElMessage.warning('请输入店铺名称')
  if (!form.thirdPartyStoreId.trim()) return ElMessage.warning('请输入第三方店铺ID')
  if (!form.ownerId) return ElMessage.warning('请选择店铺负责人')
  const duplicate = rows.value.some(item => item.id !== editingId.value && item.platform === form.platform && item.thirdPartyStoreId.trim().toLowerCase() === form.thirdPartyStoreId.trim().toLowerCase())
  if (duplicate) return ElMessage.warning('该平台下已存在相同的第三方店铺ID')
  const owner = employees.find(item => item.id === form.ownerId)!
  if (editingId.value) {
    const target = rows.value.find(item => item.id === editingId.value)!
    const now = new Date().toLocaleString('zh-CN', { hour12: false })
    const statusChangedAt = target.status === form.status ? target.statusChangedAt : now
    Object.assign(target, { ...form, ownerName: owner.name, thirdPartyStoreId: form.thirdPartyStoreId.trim(), name: form.name.trim(), updatedAt: now, statusChangedAt })
    ElMessage.success('店铺信息已更新')
  } else {
    const now = new Date().toLocaleString('zh-CN', { hour12: false })
    rows.value.unshift({ id: Date.now(), platform: form.platform, name: form.name.trim(), thirdPartyStoreId: form.thirdPartyStoreId.trim(), ownerId: owner.id, ownerName: owner.name, status: form.status, permission: { orgIds: [], employeeIds: [owner.id], actions: ['查看店铺', '编辑店铺', '查看线索'] }, metrics: { leads: 0, validLeads: 0, wechatAdds: 0, customers: 0, orders: 0, paidOrders: 0, gmv: 0, refundOrders: 0, refundAmount: 0, anomalies: 0, updatedAt: '等待首次归因计算' }, createdBy: '林校长', createdAt: now, updatedAt: now, statusChangedAt: now })
    ElMessage.success('店铺已新增，负责人已获得默认管理权限')
  }
  editorVisible.value = false
}
function openPermission(row: StoreRow) {
  activeStore.value = row
  Object.assign(permissionForm, { orgIds: [...row.permission.orgIds], employeeIds: [...row.permission.employeeIds], actions: [...row.permission.actions] })
  permissionVisible.value = true
}
function savePermission() {
  if (!activeStore.value) return
  if (!permissionForm.actions.includes('查看店铺')) permissionForm.actions.unshift('查看店铺')
  activeStore.value.permission = { orgIds: [...permissionForm.orgIds], employeeIds: [...permissionForm.employeeIds], actions: [...permissionForm.actions] }
  permissionVisible.value = false
  ElMessage.success('店铺权限已保存')
}
async function toggleStatus(row: StoreRow) {
  const next: StoreStatus = row.status === '启用' ? '停用' : '启用'
  await ElMessageBox.confirm(`确定${next}“${row.name}”吗？`, `${next}店铺`, { type: 'warning' })
  row.status = next
  row.updatedAt = new Date().toLocaleString('zh-CN', { hour12: false })
  row.statusChangedAt = row.updatedAt
  ElMessage.success(`店铺已${next}`)
}
function platformMeta(platform: Platform) { return platforms.find(item => item.name === platform)! }
function percentage(value: number, total: number) { return total ? Math.round(value / total * 1000) / 10 : 0 }
function netGmv(row: StoreRow) { return row.metrics.gmv - row.metrics.refundAmount }
function formatMoney(value: number) { return value >= 10000 ? `¥${(value / 10000).toFixed(1)}万` : `¥${value.toLocaleString()}` }
function openAnalytics(row: StoreRow) { activeStore.value = row; analyticsVisible.value = true }
function drillDown(name: string) { ElMessage.info(`正在打开“${name}”归因明细`) }
</script>

<template>
  <section class="page store-page">
    <PageHeader title="店铺管理" description="统一维护外部平台店铺身份、负责人及可见范围。">
      <el-button type="primary" :icon="Plus" @click="openCreate">新增店铺</el-button>
    </PageHeader>

    <div class="store-summary">
      <article><i class="metric-mark store-mark">店</i><span><small>店铺总数</small><b>{{ summary.total }}</b></span></article>
      <article><i class="metric-mark lead-mark">线</i><span><small>归因线索</small><b>{{ summary.leads.toLocaleString() }}</b></span></article>
      <article><i class="metric-mark wechat-mark">微</i><span><small>加微人数</small><b>{{ summary.adds.toLocaleString() }}</b></span></article>
      <article><i class="metric-mark money-mark">¥</i><span><small>净GMV</small><b>{{ formatMoney(summary.netGmv) }}</b></span></article>
    </div>

    <div class="store-filter surface">
      <div class="filter-heading"><span>店铺档案筛选</span><small>查询店铺自身资料，不改变经营数据的统计口径</small></div>
      <div class="filter-controls">
        <el-input v-model="query.keyword" clearable :prefix-icon="Search" placeholder="店铺名称、第三方店铺ID或负责人" />
        <el-select v-model="query.platform" clearable placeholder="平台类型"><el-option v-for="item in platforms" :key="item.name" :label="item.name" :value="item.name" /></el-select>
        <el-select v-model="query.ownerId" clearable filterable placeholder="店铺负责人"><el-option v-for="item in employees" :key="item.id" :label="`${item.name} · ${item.no}`" :value="item.id" /></el-select>
        <el-select v-model="query.status" clearable placeholder="店铺状态"><el-option label="启用" value="启用"/><el-option label="停用" value="停用"/></el-select>
        <el-select v-model="query.dateType" class="date-type-select"><el-option label="创建时间" value="创建时间"/><el-option label="更新时间" value="更新时间"/><el-option label="启停时间" value="启停时间"/></el-select>
        <el-date-picker v-model="query.dateRange" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
        <el-button type="primary">查询</el-button><el-button @click="resetQuery">重置</el-button>
      </div>
    </div>

    <div class="stats-scope surface">
      <div class="scope-heading"><span>经营统计范围</span><small>列表指标与经营详情共用当前口径</small></div>
      <el-radio-group :model-value="analyticsMode" @change="changeAnalyticsMode">
        <el-radio-button value="线索归因口径">线索归因口径</el-radio-button>
        <el-radio-button value="业务发生口径">业务发生口径</el-radio-button>
      </el-radio-group>
      <el-select v-model="analyticsDateType" class="business-date-select" placeholder="业务日期类型"><el-option v-for="item in analyticsDateOptions" :key="item" :label="item" :value="item" /></el-select>
      <el-date-picker v-model="analyticsRange" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="业务开始日期" end-placeholder="业务结束日期" />
      <el-select v-model="analyticsCamp" filterable placeholder="所属营期"><el-option label="全部营期" value="全部营期"/><el-option label="2026暑期第3营" value="2026暑期第3营"/><el-option label="2026秋季体验营" value="2026秋季体验营"/></el-select>
      <el-button type="primary" plain @click="ElMessage.success('经营指标已按当前口径刷新')">刷新</el-button>
      <div class="scope-rule"><i>口径</i><span>{{ analyticsRuleText }}</span></div>
    </div>

    <article class="store-ledger surface">
      <header><div><h3>店铺列表</h3><span>共 {{ filteredRows.length }} 家店铺</span></div><p>{{ analyticsMode }} · {{ analyticsDateType }} · {{ analyticsRange[0] }} 至 {{ analyticsRange[1] }}</p></header>
      <el-table :data="filteredRows" row-key="id">
        <el-table-column label="平台类型" width="130"><template #default="{ row }"><div class="platform-cell"><i :style="{ background: platformMeta(row.platform).color }">{{ platformMeta(row.platform).code }}</i><b>{{ row.platform }}</b></div></template></el-table-column>
        <el-table-column label="店铺名称" min-width="220"><template #default="{ row }"><div class="store-name"><b>{{ row.name }}</b><span>{{ row.status === '启用' ? '正常承接线索' : '已停止新线索归因' }}</span></div></template></el-table-column>
        <el-table-column label="第三方店铺ID" min-width="190"><template #default="{ row }"><code class="store-id">{{ row.thirdPartyStoreId }}</code></template></el-table-column>
        <el-table-column label="店铺负责人" width="165"><template #default="{ row }"><div class="owner-cell"><i>{{ row.ownerName.slice(0, 1) }}</i><span><b>{{ row.ownerName }}</b><small>{{ employees.find(item => item.id === row.ownerId)?.no }}</small></span></div></template></el-table-column>
        <el-table-column label="线索 / 加微" width="150"><template #default="{ row }"><div class="metric-pair"><p><b>{{ row.metrics.leads.toLocaleString() }}</b><span>{{ row.metrics.wechatAdds.toLocaleString() }}</span></p><small>加微率 {{ percentage(row.metrics.wechatAdds, row.metrics.validLeads) }}%</small></div></template></el-table-column>
        <el-table-column label="下单 / 支付" width="150"><template #default="{ row }"><div class="metric-pair order"><p><b>{{ row.metrics.orders.toLocaleString() }}</b><span>{{ row.metrics.paidOrders.toLocaleString() }}</span></p><small>支付率 {{ percentage(row.metrics.paidOrders, row.metrics.orders) }}%</small></div></template></el-table-column>
        <el-table-column label="净GMV" width="135"><template #default="{ row }"><div class="gmv-cell"><b>{{ formatMoney(netGmv(row)) }}</b><span>退款 {{ formatMoney(row.metrics.refundAmount) }}</span></div></template></el-table-column>
        <el-table-column label="权限范围" min-width="210"><template #default="{ row }"><div class="permission-summary"><span>{{ row.permission.orgIds.length }} 个组织</span><span>{{ row.permission.employeeIds.length }} 名员工</span><small>{{ row.permission.actions.join('、') }}</small></div></template></el-table-column>
        <el-table-column label="创建信息" width="170"><template #default="{ row }"><div class="created-cell"><b>{{ row.createdBy }}</b><span>{{ row.createdAt }}</span></div></template></el-table-column>
        <el-table-column label="状态" width="88"><template #default="{ row }"><el-tag :type="row.status === '启用' ? 'success' : 'info'">{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="285" fixed="right"><template #default="{ row }"><el-button link type="primary" :icon="DataAnalysis" @click="openAnalytics(row)">经营详情</el-button><el-button link type="primary" :icon="EditPen" @click="openEdit(row)">编辑</el-button><el-button link type="primary" :icon="Key" @click="openPermission(row)">店铺权限</el-button><el-dropdown trigger="click"><el-button link type="primary">更多⌄</el-button><template #dropdown><el-dropdown-menu><el-dropdown-item @click="toggleStatus(row)">{{ row.status === '启用' ? '停用店铺' : '启用店铺' }}</el-dropdown-item><el-dropdown-item @click="ElMessage.info(`最近更新：${row.updatedAt}`)">查看变更时间</el-dropdown-item></el-dropdown-menu></template></el-dropdown></template></el-table-column>
      </el-table>
      <el-empty v-if="!filteredRows.length" description="没有符合条件的店铺，可调整筛选条件或新增店铺" />
    </article>

    <el-drawer v-model="analyticsVisible" title="店铺经营详情" size="920px" class="store-analytics-drawer">
      <template v-if="activeStore">
        <div class="analytics-head">
          <div class="platform-cell"><i :style="{ background: platformMeta(activeStore.platform).color }">{{ platformMeta(activeStore.platform).code }}</i></div>
          <div><span>{{ activeStore.platform }} · {{ activeStore.thirdPartyStoreId }}</span><h2>{{ activeStore.name }}</h2><p>负责人 {{ activeStore.ownerName }} · 数据更新于 {{ activeStore.metrics.updatedAt }}</p></div>
          <el-tag :type="activeStore.status === '启用' ? 'success' : 'info'">{{ activeStore.status }}</el-tag>
        </div>
        <div class="analytics-filter">
          <el-radio-group :model-value="analyticsMode" @change="changeAnalyticsMode"><el-radio-button value="线索归因口径">线索归因</el-radio-button><el-radio-button value="业务发生口径">业务发生</el-radio-button></el-radio-group>
          <el-select v-model="analyticsDateType" placeholder="业务日期类型"><el-option v-for="item in analyticsDateOptions" :key="item" :label="item" :value="item" /></el-select>
          <el-date-picker v-model="analyticsRange" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
          <el-select v-model="analyticsCamp" placeholder="所属营期"><el-option label="全部营期" value="全部营期"/><el-option label="2026暑期第3营" value="2026暑期第3营"/><el-option label="2026秋季体验营" value="2026秋季体验营"/></el-select>
          <el-button type="primary" @click="ElMessage.success('经营数据已按当前范围刷新')">刷新数据</el-button>
          <el-button @click="ElMessage.success('店铺经营数据正在导出')">导出</el-button>
          <div class="analytics-rule"><b>{{ analyticsMode }}</b><span>{{ analyticsRuleText }}</span></div>
        </div>

        <section class="analytics-section funnel-section">
          <header><div><h3>{{ analyticsMode === '线索归因口径' ? '线索到成交漏斗' : '业务事件发生概览' }}</h3><p>{{ analyticsMode === '线索归因口径' ? '人数按客户身份去重；首阶段按线索编号去重' : '各指标按自身业务事件发生时间统计，不以订单时间代替全部时间' }}</p></div><el-tag effect="plain">{{ analyticsDateType }}</el-tag></header>
          <div class="store-funnel">
            <button v-for="stage in funnelStages" :key="stage.key" @click="drillDown(stage.name)"><span>{{ stage.name }}</span><b>{{ stage.value.toLocaleString() }}</b><small>{{ stage.key === 'leads' ? '归因起点' : `环节转化 ${stage.rate}%` }}</small><i :style="{ width: `${Math.max(18, stage.value / funnelStages[0].value * 100)}%` }"></i></button>
          </div>
        </section>

        <div class="analytics-grid">
          <section class="analytics-section trend-section">
            <header><div><h3>近7日转化趋势</h3><p>线索、加微与支付订单日趋势</p></div><div class="legend"><span class="lead">线索</span><span class="add">加微</span><span class="paid">支付</span></div></header>
            <div class="trend-chart"><div v-for="item in trendRows" :key="item.day" class="trend-column"><div class="bars"><i class="lead" :style="{ height: `${item.leads / maxTrend * 100}%` }" :title="`线索 ${item.leads}`"></i><i class="add" :style="{ height: `${item.adds / maxTrend * 100}%` }" :title="`加微 ${item.adds}`"></i><i class="paid" :style="{ height: `${Math.max(4, item.orders / maxTrend * 100)}%` }" :title="`支付 ${item.orders}`"></i></div><span>{{ item.day }}</span></div></div>
          </section>
          <section class="analytics-section revenue-section">
            <header><div><h3>订单与收入</h3><p>下单、支付、退款口径分开展示</p></div></header>
            <div class="revenue-list"><article><span>下单数</span><b>{{ activeStore.metrics.orders.toLocaleString() }}</b><small>支付率 {{ percentage(activeStore.metrics.paidOrders, activeStore.metrics.orders) }}%</small></article><article><span>支付GMV</span><b>{{ formatMoney(activeStore.metrics.gmv) }}</b><small>{{ activeStore.metrics.paidOrders }} 笔支付订单</small></article><article class="refund"><span>退款金额</span><b>{{ formatMoney(activeStore.metrics.refundAmount) }}</b><small>{{ activeStore.metrics.refundOrders }} 笔退款订单</small></article><article class="net"><span>净GMV</span><b>{{ formatMoney(netGmv(activeStore)) }}</b><small>支付GMV－退款金额</small></article></div>
          </section>
        </div>

        <section class="analytics-section attribution-section">
          <header><div><h3>商品归因构成</h3><p>按第三方商品ID核对线索、支付订单和GMV</p></div><el-button link type="primary" @click="drillDown('全部商品归因')">查看全部明细 →</el-button></header>
          <el-table :data="attributionRows"><el-table-column prop="name" label="商品名称" min-width="210"/><el-table-column prop="productId" label="第三方商品ID" min-width="170"><template #default="{ row }"><code class="store-id">{{ row.productId }}</code></template></el-table-column><el-table-column prop="leads" label="线索数" width="100" align="right"/><el-table-column prop="paid" label="支付订单" width="110" align="right"/><el-table-column label="GMV" width="130" align="right"><template #default="{ row }"><b>{{ formatMoney(row.gmv) }}</b></template></el-table-column></el-table>
        </section>

        <section class="analytics-section anomaly-section" :class="{ clear: activeStore.metrics.anomalies === 0 }">
          <div><i>!</i><span><b>{{ activeStore.metrics.anomalies ? `${activeStore.metrics.anomalies} 条归因异常待处理` : '当前没有归因异常' }}</b><small>包括未匹配店铺订单、线索无店铺、第三方ID冲突和重复订单。</small></span></div><el-button v-if="activeStore.metrics.anomalies" type="warning" plain @click="drillDown('归因异常')">查看异常</el-button>
        </section>
      </template>
    </el-drawer>

    <el-drawer v-model="editorVisible" :title="editingId ? '编辑店铺' : '新增店铺'" size="640px">
      <div class="drawer-note"><i></i><span><b>店铺唯一身份</b>同一平台下，第三方店铺ID不可重复；保存后可用于订单、线索和渠道归因。</span></div>
      <el-form label-position="top" class="store-form">
        <el-form-item label="平台类型" required><el-select v-model="form.platform" placeholder="选择外部平台"><el-option v-for="item in platforms" :key="item.name" :label="item.name" :value="item.name"><div class="platform-option"><i :style="{ background: item.color }">{{ item.code }}</i><span>{{ item.name }}</span></div></el-option></el-select></el-form-item>
        <el-form-item label="店铺名称" required><el-input v-model="form.name" maxlength="50" show-word-limit placeholder="请输入对内统一使用的店铺名称" /></el-form-item>
        <el-form-item label="第三方店铺ID" required><el-input v-model="form.thirdPartyStoreId" placeholder="请输入外部平台返回的店铺唯一ID" /><small>按平台原值保存，禁止使用店铺名称代替。</small></el-form-item>
        <el-form-item label="店铺负责人" required><el-select v-model="form.ownerId" filterable placeholder="搜索员工姓名或员工编号"><el-option v-for="item in employees" :key="item.id" :label="`${item.name} · ${item.no}`" :value="item.id"><div class="employee-option"><span>{{ item.name }} · {{ item.no }}</span><small>{{ item.org }}</small></div></el-option></el-select><small>新增店铺后，负责人默认获得查看、编辑和查看线索权限。</small></el-form-item>
        <el-form-item label="店铺状态" required><el-radio-group v-model="form.status"><el-radio-button value="启用">启用</el-radio-button><el-radio-button value="停用">停用</el-radio-button></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="editorVisible = false">取消</el-button><el-button type="primary" @click="saveStore">{{ editingId ? '保存修改' : '新增店铺' }}</el-button></template>
    </el-drawer>

    <el-drawer v-model="permissionVisible" title="店铺权限" size="720px">
      <template v-if="activeStore">
        <div class="permission-hero"><div class="platform-cell"><i :style="{ background: platformMeta(activeStore.platform).color }">{{ platformMeta(activeStore.platform).code }}</i></div><div><span>{{ activeStore.platform }} · {{ activeStore.thirdPartyStoreId }}</span><h3>{{ activeStore.name }}</h3><p>负责人 {{ activeStore.ownerName }} 始终保留店铺管理权限。</p></div></div>
        <el-form label-position="top" class="permission-form">
          <section><h4>可见组织</h4><p>所选组织内具备线索中心权限的员工可以查看该店铺。</p><el-select v-model="permissionForm.orgIds" multiple filterable placeholder="选择公司、部门或小组"><el-option v-for="item in organizations" :key="item.id" :label="item.name" :value="item.id" /></el-select></section>
          <section><h4>单独授权员工</h4><p>用于补充组织范围之外需要访问该店铺的人员。</p><el-select v-model="permissionForm.employeeIds" multiple filterable placeholder="搜索员工姓名或员工编号"><el-option v-for="item in employees" :key="item.id" :label="`${item.name} · ${item.no}`" :value="item.id" /></el-select></section>
          <section><h4>允许的操作</h4><p>“查看店铺”为基础权限，取消其他权限不会影响历史审计记录。</p><el-checkbox-group v-model="permissionForm.actions"><el-checkbox value="查看店铺" disabled>查看店铺</el-checkbox><el-checkbox value="编辑店铺">编辑店铺</el-checkbox><el-checkbox value="查看线索">查看关联线索</el-checkbox><el-checkbox value="导出数据">导出店铺数据</el-checkbox></el-checkbox-group></section>
        </el-form>
      </template>
      <template #footer><el-button @click="permissionVisible = false">取消</el-button><el-button type="primary" @click="savePermission">保存权限</el-button></template>
    </el-drawer>
  </section>
</template>

<style scoped>
.store-page{--store-ink:#142541;--store-blue:#2875e6;--store-mint:#20b997;--store-orange:#f4a340}.store-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}.store-summary article{display:flex;align-items:center;gap:12px;padding:16px 18px;border:1px solid #e2e9f3;border-radius:10px;background:#fff;box-shadow:0 4px 12px #1e3a5f08}.metric-mark{width:36px;height:36px;display:grid;place-items:center;border-radius:9px;background:#edf4ff;color:var(--store-blue);font-style:normal;font-weight:800}.lead-mark{background:#ecf8f5;color:#18a987}.wechat-mark{background:#eef7ff;color:#1689db}.money-mark{background:#fff5e8;color:#d98924}.store-summary article span small,.store-summary article span b{display:block}.store-summary article span small{color:#8795a8;font-size:10px}.store-summary article span b{margin-top:3px;color:var(--store-ink);font:700 22px Inter,"PingFang SC",sans-serif}.store-filter{display:grid;grid-template-columns:1.6fr .7fr 1fr .65fr auto auto;gap:10px;padding:14px 16px;margin-bottom:14px}.store-ledger{padding:0 18px 18px}.store-ledger>header{height:64px;display:flex;align-items:center;justify-content:space-between}.store-ledger>header>div{display:flex;align-items:baseline;gap:10px}.store-ledger h3{margin:0;color:var(--store-ink)}.store-ledger header span,.store-ledger header p{color:#8795a8;font-size:10px}.platform-cell{display:flex;align-items:center;gap:9px}.platform-cell i,.platform-option i{min-width:35px;height:28px;display:grid;place-items:center;padding:0 5px;border-radius:7px;color:#fff;font:700 9px Inter,sans-serif;font-style:normal;letter-spacing:.04em}.platform-cell b{color:var(--store-ink)}.store-name b,.store-name span{display:block}.store-name b{color:var(--store-ink)}.store-name span{margin-top:5px;color:#8b99ab;font-size:10px}.store-id{padding:6px 8px;border:1px solid #dce5f0;border-radius:6px;background:#f7f9fc;color:#405570;font:600 11px "SFMono-Regular",Consolas,monospace}.owner-cell{display:flex;align-items:center;gap:9px}.owner-cell>i{width:32px;height:32px;display:grid;place-items:center;border-radius:50%;background:#eaf2ff;color:var(--store-blue);font-style:normal;font-weight:700}.owner-cell span b,.owner-cell span small{display:block}.owner-cell span b{color:var(--store-ink)}.owner-cell span small{margin-top:2px;color:#96a3b3;font-size:9px}.metric-pair p{display:flex;align-items:baseline;gap:8px;margin:0}.metric-pair p b{color:var(--store-ink);font-size:14px}.metric-pair p span{color:var(--store-mint);font-weight:700}.metric-pair small{display:block;margin-top:5px;color:#8795a8;font-size:9px}.metric-pair.order p span{color:var(--store-blue)}.gmv-cell b,.gmv-cell span{display:block}.gmv-cell b{color:var(--store-ink)}.gmv-cell span{margin-top:5px;color:#d88a2a;font-size:9px}.permission-summary{display:flex;flex-wrap:wrap;gap:5px}.permission-summary>span{padding:3px 7px;border-radius:9px;background:#eef4fd;color:#527096;font-size:9px}.permission-summary small{width:100%;overflow:hidden;color:#8d9aab;font-size:9px;text-overflow:ellipsis;white-space:nowrap}.created-cell b,.created-cell span{display:block}.created-cell b{color:var(--store-ink);font-size:11px}.created-cell span{margin-top:4px;color:#96a3b3;font-size:9px}.drawer-note{display:flex;gap:10px;padding:14px 16px;margin-bottom:20px;border-radius:9px;background:#f2f7ff;color:#5d7290}.drawer-note>i{width:7px;height:7px;margin-top:7px;border-radius:50%;background:var(--store-blue);box-shadow:0 0 0 5px #2875e618}.drawer-note span{font-size:11px;line-height:1.7}.drawer-note b{display:block;color:var(--store-ink);font-size:12px}.store-form :deep(.el-select){width:100%}.store-form :deep(.el-form-item){margin-bottom:22px}.store-form :deep(.el-form-item__content>small){margin-top:6px;color:#8f9caf;font-size:10px}.platform-option,.employee-option{display:flex;align-items:center;gap:10px}.employee-option{justify-content:space-between}.employee-option small{color:#9aa6b5}.permission-hero{display:flex;align-items:center;gap:15px;padding:18px;margin-bottom:20px;border:1px solid #dce7f5;border-radius:10px;background:linear-gradient(105deg,#f4f8fe,#fff)}.permission-hero h3{margin:4px 0;color:var(--store-ink)}.permission-hero span,.permission-hero p{margin:0;color:#8291a5;font-size:10px}.permission-form section{padding:20px 0;border-bottom:1px solid #e4eaf2}.permission-form h4{margin:0;color:var(--store-ink)}.permission-form p{margin:6px 0 13px;color:#8b99ab;font-size:10px}.permission-form :deep(.el-select){width:100%}.permission-form :deep(.el-checkbox-group){display:grid;grid-template-columns:1fr 1fr;gap:10px}.permission-form :deep(.el-checkbox){height:42px;padding:0 14px;margin:0;border:1px solid #dfe7f1;border-radius:8px}.permission-form :deep(.el-checkbox.is-checked){border-color:#8cb8f4;background:#f1f6fe}.analytics-head{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px;padding:17px 18px;border:1px solid #dce6f3;border-radius:10px;background:linear-gradient(110deg,#f1f6fd,#fff)}.analytics-head h2{margin:4px 0;color:var(--store-ink);font-size:20px}.analytics-head span,.analytics-head p{margin:0;color:#8291a4;font-size:10px}.analytics-filter{display:grid;grid-template-columns:1.5fr 1fr auto auto;gap:9px;padding:14px 0}.analytics-filter :deep(.el-date-editor){width:100%}.analytics-section{margin-bottom:14px;padding:18px;border:1px solid #e0e7f0;border-radius:10px;background:#fff}.analytics-section>header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px}.analytics-section h3{margin:0;color:var(--store-ink);font-size:15px}.analytics-section header p{margin:5px 0 0;color:#8b98aa;font-size:10px}.store-funnel{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}.store-funnel button{position:relative;overflow:hidden;min-height:104px;padding:14px;border:1px solid #e0e7f1;border-radius:8px;background:#fbfcfe;text-align:left;cursor:pointer;transition:transform .18s,border-color .18s}.store-funnel button:hover{transform:translateY(-2px);border-color:#8db8f2}.store-funnel button:focus-visible{outline:2px solid var(--store-blue);outline-offset:2px}.store-funnel span,.store-funnel b,.store-funnel small{position:relative;z-index:1;display:block}.store-funnel span{color:#718198;font-size:10px}.store-funnel b{margin-top:7px;color:var(--store-ink);font-size:20px}.store-funnel small{margin-top:5px;color:#8e9bad;font-size:9px}.store-funnel i{position:absolute;bottom:0;left:0;height:4px;border-radius:0 4px 0 0;background:linear-gradient(90deg,var(--store-blue),#74aaf2)}.analytics-grid{display:grid;grid-template-columns:1.35fr 1fr;gap:14px}.legend{display:flex;gap:13px}.legend span{display:flex;align-items:center;gap:5px;color:#8492a5;font-size:9px}.legend span::before{content:"";width:7px;height:7px;border-radius:2px;background:currentColor}.legend .lead{color:var(--store-blue)}.legend .add{color:var(--store-mint)}.legend .paid{color:var(--store-orange)}.trend-chart{height:210px;display:grid;grid-template-columns:repeat(7,1fr);align-items:end;gap:10px;padding:14px 8px 0;border-bottom:1px solid #dfe6ef;background:repeating-linear-gradient(to top,#eef2f7 0 1px,transparent 1px 52px)}.trend-column{height:100%;display:grid;grid-template-rows:1fr auto;gap:7px}.bars{display:flex;align-items:end;justify-content:center;gap:3px}.bars i{width:8px;min-height:3px;border-radius:3px 3px 0 0}.bars .lead{background:var(--store-blue)}.bars .add{background:var(--store-mint)}.bars .paid{background:var(--store-orange)}.trend-column>span{text-align:center;color:#8a98aa;font-size:9px}.revenue-list{display:grid;grid-template-columns:1fr 1fr;gap:9px}.revenue-list article{padding:14px;border-radius:8px;background:#f6f8fb}.revenue-list span,.revenue-list b,.revenue-list small{display:block}.revenue-list span{color:#7d8ca0;font-size:10px}.revenue-list b{margin:7px 0 4px;color:var(--store-ink);font-size:18px}.revenue-list small{color:#94a0af;font-size:9px}.revenue-list .refund{background:#fff7ed}.revenue-list .refund b{color:#d98729}.revenue-list .net{background:#edf8f5}.revenue-list .net b{color:#169a7d}.attribution-section :deep(.el-table){border:1px solid #edf1f6;border-radius:8px}.anomaly-section{display:flex;align-items:center;justify-content:space-between;border-color:#f0d4aa;background:#fff9ef}.anomaly-section>div{display:flex;align-items:center;gap:11px}.anomaly-section>div>i{width:32px;height:32px;display:grid;place-items:center;border-radius:50%;background:#f4a340;color:#fff;font-style:normal;font-weight:800}.anomaly-section b,.anomaly-section small{display:block}.anomaly-section b{color:#885817}.anomaly-section small{margin-top:4px;color:#a07a47;font-size:9px}.anomaly-section.clear{border-color:#cfe9e1;background:#f0faf7}.anomaly-section.clear>div>i{background:var(--store-mint)}.anomaly-section.clear b{color:#177761}@media(max-width:1200px){.store-filter{grid-template-columns:1fr 1fr 1fr}.store-summary{grid-template-columns:repeat(2,1fr)}.store-funnel{grid-template-columns:repeat(3,1fr)}.analytics-grid{grid-template-columns:1fr}}
.store-filter{display:block;padding:14px 16px;margin-bottom:10px}.filter-heading,.scope-heading{display:flex;align-items:baseline;gap:10px;margin-bottom:11px}.filter-heading span,.scope-heading span{color:var(--store-ink);font-size:12px;font-weight:700}.filter-heading small,.scope-heading small{color:#8b99ab;font-size:9px}.filter-controls{display:grid;grid-template-columns:1.45fr .65fr .9fr .6fr .68fr 1.35fr auto auto;gap:9px}.filter-controls :deep(.el-date-editor),.stats-scope :deep(.el-date-editor){width:100%}.stats-scope{display:grid;grid-template-columns:auto auto .72fr 1.25fr .72fr auto;align-items:center;gap:9px;padding:14px 16px;margin-bottom:14px;border-left:3px solid var(--store-blue)}.stats-scope .scope-heading{display:block;margin:0 12px 0 0}.scope-heading span,.scope-heading small{display:block}.scope-heading small{margin-top:4px;white-space:nowrap}.scope-rule{grid-column:1/-1;display:flex;align-items:flex-start;gap:8px;padding:9px 11px;border-radius:7px;background:#f3f7fd;color:#60748f;font-size:10px;line-height:1.6}.scope-rule i{flex:none;padding:1px 6px;border-radius:8px;background:#dfeaff;color:var(--store-blue);font-style:normal;font-weight:700}.analytics-filter{grid-template-columns:auto .8fr 1.35fr .8fr auto auto}.analytics-rule{grid-column:1/-1;display:flex;gap:8px;padding:9px 11px;border-radius:7px;background:#f3f7fd;color:#697c95;font-size:10px}.analytics-rule b{color:var(--store-blue);white-space:nowrap}@media(max-width:1400px){.filter-controls{grid-template-columns:1.2fr repeat(3,.7fr) .7fr 1.2fr}.filter-controls .el-button{margin:0}.stats-scope{grid-template-columns:auto auto .8fr 1.2fr .8fr}}@media(max-width:1200px){.filter-controls{grid-template-columns:repeat(3,1fr)}.stats-scope{grid-template-columns:1fr 1fr}.stats-scope .scope-heading,.scope-rule{grid-column:1/-1}.analytics-filter{grid-template-columns:1fr 1fr}}
</style>
