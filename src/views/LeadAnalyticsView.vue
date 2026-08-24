<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import http from '../api/http'
import PageHeader from '../components/PageHeader.vue'
import StatePanel from '../components/StatePanel.vue'
import BusinessScopeFilter, { type BusinessScopeValue } from '../components/BusinessScopeFilter.vue'
import { useAuthStore } from '../stores/auth'

type DrilldownContext = { key: string; label: string; value: number; dimension?: string }

const loading = ref(true)
const error = ref('')
const data = ref<any>({ funnel: {}, finance: {}, efficiency: {}, trend: [], channels: [], ipChannels: [], products: [], details: [] })
const dateRange = ref<[string, string]>(['2026-08-12', '2026-08-18'])
const period = ref('2026 暑期第 3 营')
const channel = ref('全部渠道')
const store = ref('全部店铺')
const ipChannel = ref('全部IP渠道')
const ipName = ref('全部IP')
const auth = useAuthStore()
const organizations = ref<any[]>([])
const employees = ref<any[]>([])
const scopeFilters = ref<BusinessScopeValue>({ viewScope: 'AUTHORIZED', organizationId: null, ownerId: null })
const permissionLabel = computed(() => auth.user?.role === 'ADMIN' ? '当前公司全部数据' : '本人数据')
const definitionVisible = ref(false)
const drilldownVisible = ref(false)
const drilldown = ref<DrilldownContext>({ key: '', label: '', value: 0 })

const stages = computed(() => {
  const f = data.value.funnel || {}
  return [
    ['有效线索', f.leads, 'leads'], ['加微', f.wechat, 'wechat'], ['填写问卷', f.questionnaire, 'questionnaire'],
    ['预约直播', f.reservation, 'reservation'], ['到课', f.arrival, 'arrival'], ['完课', f.completion, 'completion'], ['成交', f.deal, 'deal']
  ].map((item: any[], index, list) => ({
    label: item[0], value: item[1] || 0, key: item[2],
    rate: index === 0 ? 100 : (item[1] || 0) / (list[index - 1][1] || 1) * 100,
    totalRate: (item[1] || 0) / (list[0][1] || 1) * 100
  }))
})

const metrics = computed(() => {
  const f = data.value.funnel || {}, e = data.value.efficiency || {}
  const lead = f.leads || 0
  return [
    { group: '过程效率', key: 'wechat', label: '加微率', value: pct(div(f.wechat, lead)), count: f.wechat, note: '加微数 / 有效线索数' },
    { group: '过程效率', key: 'questionnaire', label: '问卷填写率', value: pct(div(f.questionnaire, lead)), count: f.questionnaire, note: '问卷填写数 / 有效线索数' },
    { group: '过程效率', key: 'reservation', label: '预约率', value: pct(div(f.reservation, lead)), count: f.reservation, note: '预约数 / 有效线索数' },
    { group: '过程效率', key: 'arrival', label: '到课率', value: pct(div(f.arrival, lead)), count: f.arrival, note: '到课数 / 有效线索数' },
    { group: '过程效率', key: 'completion', label: '完课率', value: pct(div(f.completion, lead)), count: f.completion, note: '完课数 / 有效线索数' },
    { group: '结果质量', key: 'deal', label: '成交转化率', value: pct(div(f.deal, lead)), count: f.deal, note: '成交数 / 有效线索数', strong: true },
    { group: '结果质量', key: 'refund', label: '退款率', value: pct(div(f.refund, lead)), count: f.refund, note: '退款人数 / 有效线索数', warning: true },
    { group: '结果质量', key: 'finalDeal', label: '最终转化率', value: pct(div((f.deal || 0) - (f.refund || 0), lead)), count: (f.deal || 0) - (f.refund || 0), note: '(成交数 - 退款数) / 有效线索数', strong: true },
    { group: '经营效能', key: '', label: '人服比', value: String(e.peopleServiceRatio || '—'), note: '私域用户总数 / 服务人员数' },
    { group: '经营效能', key: '', label: '单人净GMV', value: money(e.perCapitaGmv), note: '净GMV / 带班人数' },
    { group: '经营效能', key: '', label: '团队转化离散率', value: `${e.conversionDispersion || 0}%`, note: '团队转化率标准差 / 平均转化率', warning: true },
    { group: '直播监控', key: 'online', label: '当前在线', value: format(f.online), count: f.online, note: '查询时点直播间在线人数' }
  ]
})

const financeCards = computed(() => {
  const f = data.value.finance || {}
  return [
    { label: '毛GMV', value: money(f.grossGmv), note: '统计期支付成功金额（含后续退款）' },
    { label: '退款金额', value: money(f.refundAmount), note: `${format(data.value.funnel?.refund)} 人退款` },
    { label: '净GMV', value: money(f.netGmv), note: '毛GMV - 退款金额', net: true },
    { label: 'GMV完成率', value: pct(div(f.netGmv, f.targetGmv)), note: `目标 ${money(f.targetGmv)}` }
  ]
})

const chartPoints = computed(() => {
  const rows = data.value.trend || [], max = Math.max(...rows.map((row: any) => row.deals), 1)
  return rows.map((row: any, index: number) => ({ ...row, x: 24 + index * (552 / Math.max(rows.length - 1, 1)), y: 152 - row.deals / max * 118 }))
})
const chartPath = computed(() => chartPoints.value.map((point: any, index: number) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' '))
const chartArea = computed(() => chartPoints.value.length ? `${chartPath.value} L ${chartPoints.value.at(-1).x} 164 L ${chartPoints.value[0].x} 164 Z` : '')
const drilldownRows = computed(() => (data.value.details || []).slice(0, Math.min(Math.max(drilldown.value.value, 1), 24)))

const definitions = [
  ['有效线索数', '去重后且标记有效、解密状态为已解密的唯一线索数', '线索中心'],
  ['加微数', '统计期内完成加微的去重客户数；支持 day1 口径', '企微事件/线索'],
  ['问卷填写数', '统计期内提交有效问卷的去重客户数；支持 day1 口径', '问卷管理'],
  ['预约/到课/完课数', '已预约；直播在线时长 > 0；直播在线时长 > 50 分钟', '直播系统'],
  ['成交数', '支付成功且能够关联线索的正式课去重付款客户数', '统一订单数据'],
  ['退款数/金额', '支付后30日内退款成功的去重客户数及退款金额', '订单/退款'],
  ['毛GMV', '统计期内支付成功订单金额之和，包含后续发生退款的订单', '统一订单数据'],
  ['净GMV', '毛GMV减去归属本统计期的退款成功金额', '订单/退款'],
  ['团队转化离散率', '各团队转化率标准差除以平均转化率', '线索/组织']
]

function format(value: number) { return new Intl.NumberFormat('zh-CN').format(value || 0) }
function div(a: number, b: number) { return b ? (a || 0) / b : Number.NaN }
function pct(value: number) { return Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : '—' }
function money(value: number) { return value >= 10000 ? `¥${(value / 10000).toFixed(1)}万` : `¥${format(value)}` }

function openDrilldown(key: string, label: string, value: number, dimension = '') {
  if (!key) return
  drilldown.value = { key, label, value: Number(value || 0), dimension }
  drilldownVisible.value = true
}

function csvCell(value: any) { return `"${String(value ?? '').replace(/"/g, '""')}"` }
function downloadCsv(filename: string, rows: any[][]) {
  const csv = '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n')
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

function reportRows() {
  const f = data.value.funnel || {}, finance = data.value.finance || {}, e = data.value.efficiency || {}
  const lead = f.leads || 0
  const rows: any[][] = [
    ['合数BOSS营期线索经营报表'], ['营期', period.value, '日期', dateRange.value.join(' 至 '), '口径版本', data.value.metricVersion],
    ['筛选', channel.value, store.value, ipChannel.value, ipName.value], [], ['指标名称', '指标值', '计算口径'],
    ['人服比', e.peopleServiceRatio, '私域用户总数 / 服务人员数'], ['有效线索数', f.leads, '有效且已解密的去重线索'],
    ['加微数', f.wechat, '已加微去重人数'], ['问卷填写数', f.questionnaire, '有效答卷去重人数'], ['预约数', f.reservation, '已订阅直播去重人数'],
    ['到课数', f.arrival, '直播在线时长>0'], ['完课数', f.completion, '直播在线时长>50分钟'], ['在线数', f.online, '查询时点在线'],
    ['成交数', f.deal, '正式课支付成功去重人数'], ['退款数', f.refund, '支付后30日内退款成功去重人数'],
    ['加微率', pct(div(f.wechat, lead)), '加微数 / 有效线索数'], ['问卷填写率', pct(div(f.questionnaire, lead)), '填写问卷数 / 有效线索数'],
    ['预约率', pct(div(f.reservation, lead)), '预约数 / 有效线索数'], ['到课率', pct(div(f.arrival, lead)), '到课数 / 有效线索数'],
    ['完课率', pct(div(f.completion, lead)), '完课数 / 有效线索数'], ['在线率', pct(div(f.online, lead)), '在线数 / 有效线索数'],
    ['转化率', pct(div(f.deal, lead)), '成交数 / 有效线索数'], ['退款率', pct(div(f.refund, lead)), '退款数 / 有效线索数'],
    ['最终转化率', pct(div(f.deal - f.refund, lead)), '(成交数-退款数) / 有效线索数'], ['2980退款率', pct(div(f.refund, f.deal)), '2980退款客户数 / 2980成交客户数'],
    ['退款金额', finance.refundAmount, '退款成功金额合计'], ['毛GMV', finance.grossGmv, '支付成功金额合计'], ['净GMV', finance.netGmv, '毛GMV-退款金额'],
    ['GMV完成率', pct(div(finance.netGmv, finance.targetGmv)), '净GMV / 营期目标'], ['单人净GMV', e.perCapitaGmv, '净GMV / 带班人数'],
    ['团队转化离散率', `${e.conversionDispersion}%`, '转化率标准差 / 平均转化率'], [], ['渠道分析'],
    ['来源渠道', '线索数', '加微数', '加微率', '问卷数', '问卷填写率', '成交数', '转化率', '净GMV']
  ]
  data.value.channels.forEach((row: any) => rows.push([row.name, row.leads, row.wechat, pct(div(row.wechat, row.leads)), row.questionnaire, pct(div(row.questionnaire, row.leads)), row.deals, `${row.conversionRate.toFixed(1)}%`, row.netGmv]))
  rows.push([], ['IP渠道分析'], ['IP渠道', '渠道编号', 'IP数', '线索数', '加微数', '问卷数', '预约数', '到课数', '完课数', '成交数', '退款数', '最终转化率', '毛GMV', '净GMV'])
  data.value.ipChannels.forEach((row: any) => rows.push([row.name, row.code, row.ipCount, row.leads, row.wechat, row.questionnaire, row.reservation, row.arrival, row.completion, row.deals, row.refunds, `${row.finalConversionRate}%`, row.grossGmv, row.netGmv]))
  rows.push([], ['商品分析'], ['商品名称', '第三方商品ID', '平台', '店铺', 'IP名称', 'IP渠道', '线索数', '加微数', '成交数', '退款数', '最终转化率', '毛GMV', '净GMV'])
  data.value.products.forEach((row: any) => rows.push([row.name, row.productId, row.platform, row.store, row.ipName, row.ipChannel, row.leads, row.wechat, row.deals, row.refunds, `${row.finalConversionRate}%`, row.grossGmv, row.netGmv]))
  return rows
}

function exportReport() {
  downloadCsv(`合数BOSS_${period.value.replace(/\s/g, '')}_线索经营报表.csv`, reportRows())
  ElMessage.success('已按当前筛选导出营期经营报表')
}
function exportChannels() {
  downloadCsv(`合数BOSS_${period.value.replace(/\s/g, '')}_渠道分析.csv`, [['来源渠道', '线索数', '加微数', '加微率', '问卷数', '问卷填写率', '成交数', '转化率', '净GMV'], ...data.value.channels.map((row: any) => [row.name, row.leads, row.wechat, pct(div(row.wechat, row.leads)), row.questionnaire, pct(div(row.questionnaire, row.leads)), row.deals, `${row.conversionRate.toFixed(1)}%`, row.netGmv])])
}
function exportIpChannels() {
  downloadCsv(`合数BOSS_${period.value.replace(/\s/g, '')}_IP渠道分析.csv`, [['IP渠道', '渠道编号', 'IP数', '线索数', '加微数', '成交数', '退款数', '最终转化率', '毛GMV', '净GMV'], ...data.value.ipChannels.map((row: any) => [row.name, row.code, row.ipCount, row.leads, row.wechat, row.deals, row.refunds, `${row.finalConversionRate}%`, row.grossGmv, row.netGmv])])
}
function exportProducts() {
  downloadCsv(`合数BOSS_${period.value.replace(/\s/g, '')}_商品分析.csv`, [['商品名称', '第三方商品ID', '平台', '店铺', 'IP名称', 'IP渠道', '线索数', '加微数', '成交数', '退款数', '最终转化率', '毛GMV', '净GMV'], ...data.value.products.map((row: any) => [row.name, row.productId, row.platform, row.store, row.ipName, row.ipChannel, row.leads, row.wechat, row.deals, row.refunds, `${row.finalConversionRate}%`, row.grossGmv, row.netGmv])])
}
function exportDrilldown() {
  downloadCsv(`${period.value.replace(/\s/g, '')}_${drilldown.value.label}_明细.csv`, [['订单编号', '客户', '手机号', '来源', '店铺', '商品', 'IP渠道', 'IP名称', '负责人', '营期', '事件时间', '当前节点'], ...drilldownRows.value.map((row: any) => [row.orderNo, row.customerName, row.mobile, row.source, row.store, row.productName, row.ipChannel, row.ipName, row.ownerName, row.period, row.eventTime, row.stage])])
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const effectiveViewScope = auth.user?.role === 'ADMIN' ? scopeFilters.value.viewScope : 'SELF'
    const result: any = await http.get('/leads/analytics', { params: { dateRange: dateRange.value, period: period.value, channel: channel.value, store: store.value, ipChannel: ipChannel.value, ipName: ipName.value, organizationId: scopeFilters.value.organizationId, ownerId: scopeFilters.value.ownerId, viewScope: effectiveViewScope } })
    data.value = result.data
  } catch (cause: any) {
    error.value = cause.message || '线索概览加载失败'
  } finally { loading.value = false }
}

onMounted(async () => {
  const [organizationResult, employeeResult]: any = await Promise.all([http.get('/system/organizations'), http.get('/system/employees')])
  organizations.value = organizationResult.data
  employees.value = employeeResult.data
  await load()
})
</script>

<template>
  <section class="page lead-analytics-page">
    <PageHeader eyebrow="LEAD PERFORMANCE · 营期经营驾驶舱" title="线索概览" description="从营期结果回看线索旅程，并继续下钻到来源渠道、IP渠道、IP名称和商品。">
      <el-button @click="definitionVisible = true">指标口径</el-button>
      <el-button @click="exportReport">导出本期报表</el-button>
      <el-button type="primary" @click="load">刷新数据</el-button>
    </PageHeader>

    <div class="analytics-filter surface">
      <BusinessScopeFilter v-model="scopeFilters" :organizations="organizations" :employees="employees" owner-label="当前线索负责人" :permission-label="permissionLabel" :role="auth.user?.role" />
      <div class="analytics-business-filter">
        <el-select v-model="period" filterable placeholder="所属营期"><el-option v-for="item in ['2026 暑期第 3 营','2026 暑期第 2 营','2026 暑期体验营']" :key="item" :label="item" :value="item" /></el-select>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
        <el-select v-model="channel" filterable placeholder="来源平台"><el-option v-for="item in ['全部渠道','抖音','有赞','小鹅通','百家号']" :key="item" :label="item" :value="item" /></el-select>
        <el-select v-model="store" filterable placeholder="店铺"><el-option v-for="item in ['全部店铺','合数教育官方旗舰店','合数精品课程店','合数成长课堂','合数教育体验课']" :key="item" :label="item" :value="item" /></el-select>
        <el-select v-model="ipChannel" filterable placeholder="IP渠道"><el-option v-for="item in ['全部IP渠道','店播','阿留专属']" :key="item" :label="item" :value="item" /></el-select>
        <el-select v-model="ipName" filterable placeholder="IP名称"><el-option v-for="item in ['全部IP','阿留皮皮','皮皮老师','周老师']" :key="item" :label="item" :value="item" /></el-select>
        <el-button type="primary" @click="load">查询</el-button>
        <span class="data-freshness"><el-tag v-if="data.dataMode === 'DEMO'" size="small" effect="plain">演示数据</el-tag>更新于 {{ data.updatedAt || '—' }}</span>
      </div>
    </div>

    <StatePanel :loading="loading" :error="error" @retry="load">
      <article class="period-strip surface">
        <div><span>当前报表期</span><strong>{{ period }}</strong><small>{{ dateRange.join(' 至 ') }} · {{ data.metricVersion }}</small></div>
        <p>所有模块共享当前筛选与数据权限；蓝色数字可查看组成该指标的线索明细。</p>
        <el-button type="primary" plain @click="exportReport">导出总览 + 渠道 + IP渠道 + 商品</el-button>
      </article>

      <article class="journey-board surface">
        <header><div><span class="section-kicker">FULL-FUNNEL SIGNAL</span><h2>营期转化主链路</h2></div><button class="live-chip" @click="openDrilldown('online', '当前在线', data.funnel?.online)"><i></i>当前在线 <b>{{ format(data.funnel?.online) }}</b></button></header>
        <div class="journey-rail">
          <template v-for="(stage, index) in stages" :key="stage.key">
            <button class="journey-stage" :class="{ final: index === stages.length - 1 }" @click="openDrilldown(stage.key, stage.label, stage.value)">
              <small>{{ stage.label }}</small><strong>{{ format(stage.value) }}</strong><span>累计 {{ stage.totalRate.toFixed(1) }}% · 查看明细</span>
            </button>
            <div v-if="index < stages.length - 1" class="journey-link"><b>{{ stages[index + 1].rate.toFixed(1) }}%</b><i></i></div>
          </template>
        </div>
        <footer><span>默认分母：有效且已解密的去重线索</span><button class="refund-signal" @click="openDrilldown('refund', '退款客户', data.funnel?.refund)">退款 <b>{{ format(data.funnel?.refund) }}</b> 人 · 查看明细</button></footer>
      </article>

      <div class="analytics-layout">
        <article class="surface efficiency-panel">
          <div class="panel-heading"><div><span class="section-kicker">PERIOD KPI MATRIX</span><h3>本期关键指标</h3></div><span>有对应人数的指标可下钻</span></div>
          <div class="metric-matrix"><button v-for="metric in metrics" :key="metric.label" :class="['analysis-metric', { strong: metric.strong, warning: metric.warning, clickable: metric.key }]" @click="openDrilldown(metric.key, metric.label, metric.count || 0)"><small>{{ metric.group }}</small><b>{{ metric.value }}</b><span>{{ metric.label }}</span><em>{{ metric.note }}</em><i v-if="metric.key">明细 {{ format(metric.count || 0) }} →</i></button></div>
        </article>
        <article class="surface finance-panel">
          <div class="panel-heading"><div><span class="section-kicker">REVENUE AFTER REFUND</span><h3>成交质量</h3></div><span>{{ data.periodName }}</span></div>
          <div class="finance-stack"><div v-for="card in financeCards" :key="card.label" :class="{ net: card.net }"><span>{{ card.label }}</span><strong>{{ card.value }}</strong><small>{{ card.note }}</small></div></div>
          <div class="target-progress"><span>净GMV目标进度</span><b>{{ financeCards[3]?.value }}</b><i><em :style="{ width: financeCards[3]?.value }"></em></i></div>
        </article>
      </div>

      <article class="surface dimension-panel source-channel-panel">
        <div class="panel-heading"><div><span class="section-kicker">SOURCE CHANNEL ANALYSIS</span><h3>渠道分析</h3><p>按来源平台比较获客规模、加微效率、问卷填写和最终成交表现。</p></div><el-button @click="exportChannels">导出渠道分析</el-button></div>
        <el-table :data="data.channels" stripe>
          <el-table-column prop="name" label="来源渠道" min-width="128" fixed><template #default="{ row }"><b>{{ row.name }}</b></template></el-table-column>
          <el-table-column label="线索数" min-width="104"><template #default="{ row }"><el-button link type="primary" @click="openDrilldown('leads', '渠道线索', row.leads, row.name)">{{ format(row.leads) }}</el-button></template></el-table-column>
          <el-table-column label="加微数" min-width="104"><template #default="{ row }"><el-button link type="primary" @click="openDrilldown('wechat', '渠道加微', row.wechat, row.name)">{{ format(row.wechat) }}</el-button></template></el-table-column>
          <el-table-column label="加微率" min-width="92"><template #default="{ row }"><b class="rate-cell">{{ pct(div(row.wechat, row.leads)) }}</b></template></el-table-column>
          <el-table-column label="问卷数" min-width="104"><template #default="{ row }"><el-button link type="primary" @click="openDrilldown('questionnaire', '渠道问卷', row.questionnaire, row.name)">{{ format(row.questionnaire) }}</el-button></template></el-table-column>
          <el-table-column label="问卷填写率" min-width="108"><template #default="{ row }">{{ pct(div(row.questionnaire, row.leads)) }}</template></el-table-column>
          <el-table-column label="成交数" min-width="96"><template #default="{ row }"><el-button link type="primary" @click="openDrilldown('deal', '渠道成交', row.deals, row.name)">{{ format(row.deals) }}</el-button></template></el-table-column>
          <el-table-column label="转化率" min-width="92"><template #default="{ row }"><b class="rate-cell">{{ row.conversionRate.toFixed(1) }}%</b></template></el-table-column>
          <el-table-column label="净GMV" min-width="116"><template #default="{ row }">{{ money(row.netGmv) }}</template></el-table-column>
        </el-table>
      </article>

      <article class="surface dimension-panel">
        <div class="panel-heading"><div><span class="section-kicker">IP CHANNEL ANALYSIS</span><h3>IP渠道分析</h3><p>对比不同IP渠道的承接规模、过程效率和最终经营结果。</p></div><el-button @click="exportIpChannels">导出IP渠道分析</el-button></div>
        <el-table :data="data.ipChannels" stripe>
          <el-table-column prop="name" label="IP渠道" min-width="132" fixed><template #default="{ row }"><b>{{ row.name }}</b><small class="cell-sub">{{ row.code }}</small></template></el-table-column>
          <el-table-column prop="ipCount" label="IP数" min-width="74" />
          <el-table-column label="线索数" min-width="100"><template #default="{ row }"><el-button link type="primary" @click="openDrilldown('leads', 'IP渠道线索', row.leads, row.name)">{{ format(row.leads) }}</el-button></template></el-table-column>
          <el-table-column label="加微数" min-width="100"><template #default="{ row }"><el-button link type="primary" @click="openDrilldown('wechat', 'IP渠道加微', row.wechat, row.name)">{{ format(row.wechat) }}</el-button></template></el-table-column>
          <el-table-column prop="questionnaire" label="问卷数" min-width="92" /><el-table-column prop="reservation" label="预约数" min-width="92" /><el-table-column prop="arrival" label="到课数" min-width="92" /><el-table-column prop="completion" label="完课数" min-width="92" />
          <el-table-column label="成交/退款" min-width="112"><template #default="{ row }"><el-button link type="primary" @click="openDrilldown('deal', 'IP渠道成交', row.deals, row.name)">{{ row.deals }}</el-button><span class="split-value">/ {{ row.refunds }}</span></template></el-table-column>
          <el-table-column label="最终转化率" min-width="104"><template #default="{ row }"><b class="rate-cell">{{ row.finalConversionRate }}%</b></template></el-table-column>
          <el-table-column label="净GMV" min-width="110"><template #default="{ row }">{{ money(row.netGmv) }}</template></el-table-column>
        </el-table>
      </article>

      <article class="surface dimension-panel product-analysis-panel">
        <div class="panel-heading"><div><span class="section-kicker">PRODUCT ATTRIBUTION</span><h3>商品分析</h3><p>从商品反查店铺、IP及IP渠道，核对获客规模与成交质量。</p></div><el-button @click="exportProducts">导出商品分析</el-button></div>
        <el-table :data="data.products" stripe>
          <el-table-column prop="name" label="商品名称" min-width="220" fixed><template #default="{ row }"><b>{{ row.name }}</b><small class="cell-sub">{{ row.productId }}</small></template></el-table-column>
          <el-table-column label="平台 / 店铺" min-width="180"><template #default="{ row }"><span>{{ row.platform }}</span><small class="cell-sub">{{ row.store }}</small></template></el-table-column>
          <el-table-column label="IP归因" min-width="138"><template #default="{ row }"><span>{{ row.ipName }}</span><small class="cell-sub">{{ row.ipChannel }}</small></template></el-table-column>
          <el-table-column label="线索数" min-width="96"><template #default="{ row }"><el-button link type="primary" @click="openDrilldown('leads', '商品线索', row.leads, row.name)">{{ format(row.leads) }}</el-button></template></el-table-column>
          <el-table-column label="加微数" min-width="96"><template #default="{ row }"><el-button link type="primary" @click="openDrilldown('wechat', '商品加微', row.wechat, row.name)">{{ format(row.wechat) }}</el-button></template></el-table-column>
          <el-table-column label="成交数" min-width="92"><template #default="{ row }"><el-button link type="primary" @click="openDrilldown('deal', '商品成交', row.deals, row.name)">{{ row.deals }}</el-button></template></el-table-column>
          <el-table-column prop="refunds" label="退款数" min-width="84" />
          <el-table-column label="最终转化率" min-width="104"><template #default="{ row }"><b class="rate-cell">{{ row.finalConversionRate }}%</b></template></el-table-column>
          <el-table-column label="毛 / 净GMV" min-width="156"><template #default="{ row }"><span>{{ money(row.grossGmv) }}</span><small class="cell-sub">净 {{ money(row.netGmv) }}</small></template></el-table-column>
        </el-table>
      </article>

      <article class="surface trend-panel bottom-trend">
        <div class="panel-heading"><div><span class="section-kicker">PERIOD PULSE</span><h3>成交趋势</h3></div><span>单位：成交人数</span></div>
        <svg class="trend-chart" viewBox="0 0 600 190" role="img" aria-label="近七日成交趋势折线图"><defs><linearGradient id="dealArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2875e6" stop-opacity=".28"/><stop offset="1" stop-color="#2875e6" stop-opacity="0"/></linearGradient></defs><path d="M24 46 H576 M24 90 H576 M24 134 H576" class="chart-grid"/><path :d="chartArea" fill="url(#dealArea)"/><path :d="chartPath" class="trend-line"/><g v-for="point in chartPoints" :key="point.label"><circle :cx="point.x" :cy="point.y" r="4"/><text :x="point.x" y="184">{{ point.label }}</text><title>{{ point.label }}：{{ point.deals }} 人</title></g></svg>
      </article>
    </StatePanel>

    <el-drawer v-model="drilldownVisible" :title="`${drilldown.label} · 线索明细`" size="78%">
      <div class="drilldown-summary"><div><span>当前指标</span><b>{{ drilldown.label }}</b></div><div><span>汇总数量</span><b>{{ format(drilldown.value) }}</b></div><div><span>分析维度</span><b>{{ drilldown.dimension || '全部' }}</b></div><div><span>筛选营期</span><b>{{ period }}</b></div><el-button type="primary" plain @click="exportDrilldown">导出当前明细</el-button></div>
      <p class="drawer-intro">明细继承打开下钻时的营期、日期、权限、组织、负责人、店铺、IP渠道和IP名称筛选快照。演示环境仅展示前 {{ drilldownRows.length }} 条。</p>
      <el-table :data="drilldownRows" border height="calc(100vh - 250px)"><el-table-column prop="orderNo" label="订单编号" min-width="150" fixed/><el-table-column prop="customerName" label="客户" width="90"/><el-table-column prop="mobile" label="手机号" width="120"/><el-table-column prop="stage" label="当前节点" width="100"/><el-table-column prop="source" label="来源" width="90"/><el-table-column prop="store" label="店铺" min-width="160"/><el-table-column prop="productName" label="商品" min-width="190"/><el-table-column prop="ipChannel" label="IP渠道" width="110"/><el-table-column prop="ipName" label="IP名称" width="110"/><el-table-column prop="ownerName" label="负责人" width="100"/><el-table-column prop="eventTime" label="事件时间" min-width="155"/></el-table>
    </el-drawer>

    <el-drawer v-model="definitionVisible" title="数据指标口径" size="620px">
      <p class="drawer-intro">所有比率沿用当前筛选条件，并以同一营期归属和去重规则计算。未接入的数据展示“待接入”，不得按0参与计算。</p>
      <el-table :data="definitions" border><el-table-column label="指标" width="120"><template #default="{ row }"><b>{{ row[0] }}</b></template></el-table-column><el-table-column label="计算口径" min-width="300"><template #default="{ row }">{{ row[1] }}</template></el-table-column><el-table-column label="数据源" width="110"><template #default="{ row }">{{ row[2] }}</template></el-table-column></el-table>
      <div class="definition-note"><b>退款归属规则</b><p>退款成功时间距下单时间不超过30日，默认回冲原销售营期；原营期无带班记录时顺延至下一营期。规则发布前由业务与财务共同确认。</p></div>
    </el-drawer>
  </section>
</template>

<style scoped>
.lead-analytics-page{--analytics-ink:#12233f;--analytics-blue:#2875e6;--analytics-cyan:#24aeb5}.analytics-filter{display:block;padding:14px 16px;margin-bottom:16px}.analytics-business-filter{display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap}.analytics-business-filter :deep(.el-date-editor){width:250px}.analytics-business-filter :deep(.el-select){width:164px}.data-freshness{display:flex;align-items:center;gap:8px;margin-left:auto;color:var(--muted);font-size:12px;white-space:nowrap}.section-kicker{color:var(--analytics-blue);font:700 10px/1 Inter,system-ui,sans-serif;letter-spacing:.14em}.period-strip{display:grid;grid-template-columns:270px 1fr auto;align-items:center;gap:22px;margin-bottom:16px;padding:14px 18px;border-left:4px solid var(--analytics-blue)}.period-strip span,.period-strip small,.period-strip strong{display:block}.period-strip span{font-size:10px;color:#8292a8}.period-strip strong{margin:3px 0;color:var(--analytics-ink);font-size:18px}.period-strip small,.period-strip p{color:var(--muted);font-size:11px}.period-strip p{margin:0}.journey-board{padding:22px 24px;margin-bottom:16px;overflow:hidden}.journey-board header,.panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}.journey-board h2,.panel-heading h3{margin:6px 0 0;color:var(--analytics-ink)}.panel-heading p{margin:7px 0 0;color:var(--muted);font-size:11px}.live-chip{display:flex;align-items:center;gap:7px;padding:7px 10px;border:0;border-radius:18px;background:#eaf9f7;color:#28766f;font-size:12px;cursor:pointer}.live-chip i{width:7px;height:7px;border-radius:50%;background:#22b98f;box-shadow:0 0 0 4px #22b98f20}.live-chip b{font-variant-numeric:tabular-nums}.journey-rail{display:flex;align-items:center;margin-top:24px}.journey-stage{min-width:112px;flex:1;padding:14px 13px;border:1px solid #dce8f8;border-radius:10px;background:#f8fbff;text-align:left;color:var(--analytics-ink);cursor:pointer;transition:transform .16s ease,box-shadow .16s ease}.journey-stage:hover{transform:translateY(-2px);box-shadow:0 8px 20px #1f5ca014}.journey-stage.final{background:var(--analytics-ink);border-color:var(--analytics-ink);color:#fff}.journey-stage small,.journey-stage strong,.journey-stage span{display:block}.journey-stage small{color:#69809f}.journey-stage.final small,.journey-stage.final span{color:#b9c9de}.journey-stage strong{margin:7px 0 4px;font:700 23px/1 Inter,"PingFang SC",sans-serif}.journey-stage span{font-size:10px;color:#8a9aaf}.journey-link{width:52px;flex:0 0 52px;display:flex;flex-direction:column;align-items:center;gap:6px}.journey-link b{font:600 10px Inter,sans-serif;color:#7589a4}.journey-link i{width:42px;height:1px;background:#9ab9e4;position:relative}.journey-link i:after{content:"";position:absolute;right:-1px;top:-3px;border-left:5px solid #79a4dd;border-top:3px solid transparent;border-bottom:3px solid transparent}.journey-board footer{display:flex;justify-content:space-between;margin-top:15px;padding-top:13px;border-top:1px solid var(--line);font-size:11px;color:var(--muted)}.refund-signal{border:0;background:transparent;color:#a76620;cursor:pointer}.analytics-layout{display:grid;grid-template-columns:1.65fr .85fr;gap:16px;margin-bottom:16px}.efficiency-panel,.finance-panel,.trend-panel,.dimension-panel{padding:20px}.panel-heading>span{color:var(--muted);font-size:11px}.metric-matrix{display:grid;grid-template-columns:repeat(4,1fr);margin-top:18px;border:1px solid var(--line);border-radius:10px;overflow:hidden}.analysis-metric{min-height:132px;padding:14px;border:0;border-right:1px solid var(--line);border-bottom:1px solid var(--line);background:#fff;text-align:left}.analysis-metric:nth-child(4n){border-right:0}.analysis-metric:nth-last-child(-n+4){border-bottom:0}.analysis-metric small,.analysis-metric b,.analysis-metric span,.analysis-metric em,.analysis-metric i{display:block}.analysis-metric small{color:#8795a7;font-size:9px}.analysis-metric b{margin:12px 0 5px;color:var(--analytics-ink);font:700 23px/1 Inter,"PingFang SC",sans-serif}.analysis-metric span{font-size:12px;font-weight:600}.analysis-metric em{margin-top:6px;color:var(--muted);font-size:9px;font-style:normal}.analysis-metric i{margin-top:8px;color:var(--analytics-blue);font-size:9px;font-style:normal}.analysis-metric.clickable{cursor:pointer}.analysis-metric.clickable:hover{background:#f5f9ff}.analysis-metric.strong{background:#f6faff}.analysis-metric.strong b{color:var(--analytics-blue)}.analysis-metric.warning b{color:#b66b18}.finance-stack{margin-top:16px}.finance-stack>div{padding:13px 0;border-top:1px solid var(--line);display:grid;grid-template-columns:1fr auto;gap:4px 10px}.finance-stack span{font-size:12px;color:var(--secondary)}.finance-stack strong{grid-row:1/3;grid-column:2;font:700 21px Inter,sans-serif;color:var(--analytics-ink)}.finance-stack small{color:var(--muted);font-size:10px}.finance-stack .net{margin:0 -10px;padding:13px 10px;background:#f3f8ff;border-radius:8px}.finance-stack .net strong{color:var(--analytics-blue)}.target-progress{margin-top:15px}.target-progress>span,.target-progress>b{font-size:11px}.target-progress>b{float:right;color:var(--analytics-blue)}.target-progress>i{display:block;height:7px;margin-top:8px;border-radius:4px;background:#edf1f6;overflow:hidden}.target-progress em{display:block;height:100%;max-width:100%;border-radius:4px;background:linear-gradient(90deg,var(--analytics-cyan),var(--analytics-blue))}.dimension-panel{margin-bottom:16px;border-top:3px solid #dbe9ff}.dimension-panel :deep(.el-table){margin-top:18px}.source-channel-panel{border-top-color:#f0c879}.product-analysis-panel{border-top-color:#bfe8e3}.cell-sub{display:block;margin-top:4px;color:#8b99ac;font-size:10px}.split-value{color:#8b99ac}.rate-cell{color:var(--analytics-blue)}.bottom-trend{margin-bottom:20px}.trend-chart{width:100%;height:220px;margin-top:12px;overflow:visible}.chart-grid{stroke:#e9eef5;stroke-width:1}.trend-line{fill:none;stroke:var(--analytics-blue);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.trend-chart circle{fill:#fff;stroke:var(--analytics-blue);stroke-width:3}.trend-chart text{fill:#8997aa;font:10px Inter,sans-serif;text-anchor:middle}.drilldown-summary{display:grid;grid-template-columns:repeat(4,minmax(130px,1fr)) auto;gap:12px;margin-bottom:16px;padding:14px;border-radius:10px;background:#f4f7fb}.drilldown-summary span,.drilldown-summary b{display:block}.drilldown-summary span{font-size:10px;color:#8292a8}.drilldown-summary b{margin-top:5px;color:var(--analytics-ink);font-size:14px}.drawer-intro{margin:-4px 0 18px;color:var(--secondary);font-size:13px;line-height:1.7}.definition-note{margin-top:18px;padding:15px;border-radius:10px;background:#fff7eb;color:#79531f}.definition-note p{margin:6px 0 0;font-size:12px;line-height:1.7}@media(max-width:1300px){.period-strip{grid-template-columns:220px 1fr auto}.journey-stage{min-width:96px}.journey-link{width:34px;flex-basis:34px}.journey-link i{width:26px}.metric-matrix{grid-template-columns:repeat(3,1fr)}.analytics-layout{grid-template-columns:1fr}.drilldown-summary{grid-template-columns:repeat(2,1fr)}}@media(max-width:900px){.period-strip{grid-template-columns:1fr}.journey-rail{overflow-x:auto;padding-bottom:10px}.journey-stage{min-width:132px}.metric-matrix{grid-template-columns:repeat(2,1fr)}}@media(prefers-reduced-motion:reduce){.journey-stage{transition:none}}
</style>
