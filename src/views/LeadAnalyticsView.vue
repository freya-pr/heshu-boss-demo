<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import http, { isDemoMode } from '../api/http'
import PageHeader from '../components/PageHeader.vue'
import StatePanel from '../components/StatePanel.vue'
import BusinessScopeFilter, { type BusinessScopeValue } from '../components/BusinessScopeFilter.vue'
import { useAuthStore } from '../stores/auth'
import { loadAcquisitionPeriods } from '../data/acquisitionPeriods'

type DrilldownContext = { key: string; label: string; value: number; dimension?: string }

const loading = ref(true)
const error = ref('')
const data = ref<any>({ funnel: {}, finance: {}, efficiency: {}, trend: [], channels: [], ipChannels: [], products: [], details: [] })
const availablePeriods = loadAcquisitionPeriods().filter(item => item.status === '启用')
const today = new Date()
const nearestPeriod = availablePeriods.reduce((nearest, item) => {
  const distance = Math.min(Math.abs(today.getTime() - new Date(item.startAt).getTime()), Math.abs(today.getTime() - new Date(item.endAt).getTime()))
  return !nearest || distance < nearest.distance ? { item, distance } : nearest
}, null as null | { item: ReturnType<typeof loadAcquisitionPeriods>[number]; distance: number })?.item
const periodTimeRange = ref<[string, string]>(isDemoMode ? ['', ''] : nearestPeriod ? [nearestPeriod.startAt.slice(0, 10), nearestPeriod.endAt.slice(0, 10)] : ['', ''])
const leadCreatedRange = ref<[string, string]>(nearestPeriod ? [nearestPeriod.startAt.slice(0, 10), nearestPeriod.endAt.slice(0, 10)] : ['', ''])
const period = ref<string[]>(isDemoMode ? [] : nearestPeriod ? [nearestPeriod.name] : [])
const channel = ref<string[]>([])
const store = ref<string[]>([])
const ipChannel = ref<string[]>([])
const ipName = ref<string[]>([])
const auth = useAuthStore()
const organizations = ref<any[]>([])
const employees = ref<any[]>([])
const scopeFilters = ref<BusinessScopeValue>({ viewScope: 'AUTHORIZED', organizationId: null, ownerId: null })
const permissionLabel = computed(() => auth.user?.role === 'ADMIN' ? '当前公司全部数据' : '本人数据')
const definitionVisible = ref(false)
const drilldownVisible = ref(false)
const drilldown = ref<DrilldownContext>({ key: '', label: '', value: 0 })
const periodLabel = computed(() => period.value.join('、') || '全部期次')
const isLeadCreatedSummary = computed(() => !period.value.length && !periodTimeRange.value?.filter(Boolean).length && Boolean(leadCreatedRange.value?.filter(Boolean).length))
const reportSubjectLabel = computed(() => periodLabel.value)
const filePeriodLabel = computed(() => reportSubjectLabel.value.replace(/\s/g, ''))

const stages = computed(() => {
  const f = data.value.funnel || {}
  return [
    ['有效线索', f.leads, 'leads'], ['加微', f.wechat, 'wechat'], ['填写问卷', f.questionnaire, 'questionnaire'], ['成交', f.deal, 'deal']
  ].map((item: any[], index, list) => ({
    label: item[0], value: item[1] || 0, key: item[2],
    rate: index === 0 ? 100 : (item[1] || 0) / (list[index - 1][1] || 1) * 100,
    totalRate: (item[1] || 0) / (list[0][1] || 1) * 100
  }))
})

type PeriodMetric = { key: string; columnKey:string; label: string; value: string; sub: string; count?: number; warning?: boolean; highlight?: boolean; progress?: number }
type PeriodMetricGroup = { label: string; tone: string; metrics: PeriodMetric[] }
const operatingColumnOptions=[
  {value:'period',label:'期次',mandatory:true},{value:'validLeads',label:'有效线索数'},{value:'wechatRate',label:'加微率'},{value:'questionnaireRate',label:'问卷填写率'},
  {value:'day1ArrivalRate',label:'DAY1 到课率'},{value:'day1CompletionRate',label:'DAY1 完课率'},{value:'day2ArrivalRate',label:'DAY2 到课率'},{value:'day2CompletionRate',label:'DAY2 完课率'},{value:'day3ArrivalRate',label:'DAY3 到课率'},{value:'day3CompletionRate',label:'DAY3 完课率'},
  {value:'refundRate',label:'退款率'},{value:'finalConversionRate',label:'最终转化率'},{value:'gmvRate',label:'GMV完成率'},{value:'peopleServiceRatio',label:'人服比'},{value:'perCapitaGmv',label:'单人净GMV'},{value:'conversionDispersion',label:'团队转化离散率'},{value:'online',label:'当前在线'},{value:'grossGmv',label:'毛GMV'},{value:'refundAmount',label:'退款金额'},{value:'netGmv',label:'净GMV'}
]
const operatingColumnStorageKey='heshu_boss_analytics_operating_columns_v1'
function loadOperatingColumns(){try{const saved=JSON.parse(localStorage.getItem(operatingColumnStorageKey)||'[]');return Array.isArray(saved)&&saved.length?[...new Set([...saved,'period','validLeads'])]:operatingColumnOptions.map(item=>item.value)}catch{return operatingColumnOptions.map(item=>item.value)}}
const operatingVisibleColumns=ref<string[]>(loadOperatingColumns()),operatingColumnSettingVisible=ref(false)
const showOperatingColumn=(key:string)=>key==='period'||operatingVisibleColumns.value.includes(key)
function resetOperatingColumns(){operatingVisibleColumns.value=operatingColumnOptions.map(item=>item.value)}

function buildOperatingGroups(scale=1):PeriodMetricGroup[] {
  const f = data.value.funnel || {}, finance = data.value.finance || {}, e = data.value.efficiency || {}
  const scaled=(value:number)=>Math.round((value||0)*scale)
  const lead = scaled(f.leads)
  const wechat=scaled(f.wechat),questionnaire=scaled(f.questionnaire),refund=scaled(f.refund),deal=scaled(f.deal)
  const day1Arrival=scaled(f.arrival),day1Completion=scaled(f.completion)
  const day2Arrival=scaled((f.arrival||0)*.82),day2Completion=scaled((f.completion||0)*.86)
  const day3Arrival=scaled((f.arrival||0)*.68),day3Completion=scaled((f.completion||0)*.72)
  const grossGmv=scaled(finance.grossGmv),refundAmount=scaled(finance.refundAmount),netGmv=scaled(finance.netGmv),targetGmv=scaled(finance.targetGmv)
  const finalDeal = Math.max(deal-refund, 0)
  const gmvRate = div(netGmv,targetGmv)
  return [
    { label: '过程转化', tone: 'process', metrics: [
      { key: 'leads',columnKey:'validLeads', label: '有效线索数', value: format(lead), sub: '', count: lead },
      { key: 'wechat',columnKey:'wechatRate', label: '加微率', value: pct(div(wechat, lead)), sub: format(wechat), count: wechat },
      { key: 'questionnaire',columnKey:'questionnaireRate', label: '问卷填写率', value: pct(div(questionnaire, lead)), sub: format(questionnaire), count: questionnaire },
      { key: 'arrival',columnKey:'day1ArrivalRate',label:'DAY1 到课率',value:pct(div(day1Arrival,questionnaire)),sub:`${format(day1Arrival)} 人`,count:day1Arrival },
      { key: 'completion',columnKey:'day1CompletionRate',label:'DAY1 完课率',value:pct(div(day1Completion,day1Arrival)),sub:`${format(day1Completion)} 人`,count:day1Completion },
      { key: 'arrival',columnKey:'day2ArrivalRate',label:'DAY2 到课率',value:pct(div(day2Arrival,questionnaire)),sub:`${format(day2Arrival)} 人`,count:day2Arrival },
      { key: 'completion',columnKey:'day2CompletionRate',label:'DAY2 完课率',value:pct(div(day2Completion,day2Arrival)),sub:`${format(day2Completion)} 人`,count:day2Completion },
      { key: 'arrival',columnKey:'day3ArrivalRate',label:'DAY3 到课率',value:pct(div(day3Arrival,questionnaire)),sub:`${format(day3Arrival)} 人`,count:day3Arrival },
      { key: 'completion',columnKey:'day3CompletionRate',label:'DAY3 完课率',value:pct(div(day3Completion,day3Arrival)),sub:`${format(day3Completion)} 人`,count:day3Completion },
    ] },
    { label: '结果质量', tone: 'quality', metrics: [
      { key: 'refund',columnKey:'refundRate', label: '退款率', value: pct(div(refund, lead)), sub: `${format(refund)} 人`, count: refund, warning: true },
      { key: 'finalDeal',columnKey:'finalConversionRate', label: '最终转化率', value: pct(div(finalDeal, lead)), sub: format(finalDeal), count: finalDeal, highlight: true },
      { key: '',columnKey:'gmvRate', label: 'GMV完成率', value: pct(gmvRate), sub: `目标 ${money(targetGmv)}`, progress: Math.min(Math.max(gmvRate * 100, 0), 100) }
    ] },
    { label: '经营效能', tone: 'efficiency', metrics: [
      { key: '',columnKey:'peopleServiceRatio', label: '人服比', value: String(e.peopleServiceRatio || '—'), sub: '用户 / 服务人员' },
      { key: '',columnKey:'perCapitaGmv', label: '单人净GMV', value: money(scaled(e.perCapitaGmv)), sub: '按带班人数' },
      { key: '',columnKey:'conversionDispersion', label: '团队转化离散率', value: `${e.conversionDispersion || 0}%`, sub: '团队波动', warning: true },
      { key: 'online',columnKey:'online', label: '当前在线', value: format(scaled(f.online)), sub: '实时人数', count: scaled(f.online) }
    ] },
    { label: '成交金额', tone: 'finance', metrics: [
      { key: '',columnKey:'grossGmv', label: '毛GMV', value: money(grossGmv), sub: '含退款' },
      { key: 'refund',columnKey:'refundAmount', label: '退款金额', value: money(refundAmount), sub: `${format(refund)} 人`, count: refund, warning: true },
      { key: '',columnKey:'netGmv', label: '净GMV', value: money(netGmv), sub: '退款后', highlight: true }
    ] }
  ].map(group=>({...group,metrics:group.metrics.filter(metric=>showOperatingColumn(metric.columnKey))})).filter(group=>group.metrics.length)
}
const periodOperatingGroups = computed<PeriodMetricGroup[]>(()=>buildOperatingGroups())
const operatingRows=computed(()=>{
  if(!period.value.length)return [{label:'',groups:buildOperatingGroups()}]
  if(period.value.length===1)return [{label:period.value[0],groups:buildOperatingGroups()}]
  const weights=period.value.map((_,index)=>1+index*.08),total=weights.reduce((sum,value)=>sum+value,0)
  return [{label:'汇总',groups:buildOperatingGroups()},...period.value.map((name,index)=>({label:name,groups:buildOperatingGroups(weights[index]/total)}))]
})

const chartPoints = computed(() => {
  const rows = data.value.trend || []
  const maxDeals = Math.max(...rows.map((row: any) => row.deals), 1)
  const maxAmount = Math.max(...rows.map((row: any) => row.dealAmountWan || row.deals * 2987 / 10000), 1)
  return rows.map((row: any, index: number) => ({ ...row, dealAmountWan: row.dealAmountWan || Number((row.deals * 2987 / 10000).toFixed(2)), x: 24 + index * (552 / Math.max(rows.length - 1, 1)), orderY: 152 - row.deals / maxDeals * 118, amountY: 152 - (row.dealAmountWan || row.deals * 2987 / 10000) / maxAmount * 118 }))
})
const orderChartPath = computed(() => chartPoints.value.map((point: any, index: number) => `${index ? 'L' : 'M'} ${point.x} ${point.orderY}`).join(' '))
const amountChartPath = computed(() => chartPoints.value.map((point: any, index: number) => `${index ? 'L' : 'M'} ${point.x} ${point.amountY}`).join(' '))
const chartArea = computed(() => chartPoints.value.length ? `${orderChartPath.value} L ${chartPoints.value.at(-1).x} 164 L ${chartPoints.value[0].x} 164 Z` : '')
const drilldownRows = computed(() => (data.value.details || []).slice(0, Math.min(Math.max(drilldown.value.value, 1), 24)))

const definitions = [
  ['有效线索数', '去重后且标记有效、解密状态为已解密的唯一线索数', '线索中心'],
  ['加微数', '统计期内完成加微的去重客户数；支持 day1 口径', '企微事件/线索'],
  ['问卷填写数', '统计期内提交有效问卷的去重客户数；支持 day1 口径', '问卷管理'],
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
    ['合数BOSS经营报表'], ['期次', period.value.join('、'), '期次时间', periodTimeRange.value.join(' 至 ') || '未筛选', '线索创建时间', leadCreatedRange.value.join(' 至 '), '口径版本', data.value.metricVersion],
    ['筛选', channel.value.join('、') || '全部渠道', store.value.join('、') || '全部店铺', ipChannel.value.join('、') || '全部IP渠道', ipName.value.join('、') || '全部IP'], [], ['指标名称', '指标值', '计算口径'],
    ['人服比', e.peopleServiceRatio, '私域用户总数 / 服务人员数'], ['有效线索数', f.leads, '有效且已解密的去重线索'],
    ['加微数', f.wechat, '已加微去重人数'], ['问卷填写数', f.questionnaire, '有效答卷去重人数'], ['在线数', f.online, '查询时点在线'],
    ['成交数', f.deal, '正式课支付成功去重人数'], ['退款数', f.refund, '支付后30日内退款成功去重人数'],
    ['加微率', pct(div(f.wechat, lead)), '加微数 / 有效线索数'], ['问卷填写率', pct(div(f.questionnaire, lead)), '填写问卷数 / 有效线索数'],
    ['在线率', pct(div(f.online, lead)), '在线数 / 有效线索数'],
    ['转化率', pct(div(f.deal, lead)), '成交数 / 有效线索数'], ['退款率', pct(div(f.refund, lead)), '退款数 / 有效线索数'],
    ['最终转化率', pct(div(f.deal - f.refund, lead)), '(成交数-退款数) / 有效线索数'], ['2980退款率', pct(div(f.refund, f.deal)), '2980退款客户数 / 2980成交客户数'],
    ['退款金额', finance.refundAmount, '退款成功金额合计'], ['毛GMV', finance.grossGmv, '支付成功金额合计'], ['净GMV', finance.netGmv, '毛GMV-退款金额'],
    ['GMV完成率', pct(div(finance.netGmv, finance.targetGmv)), '净GMV / 期次目标'], ['单人净GMV', e.perCapitaGmv, '净GMV / 带班人数'],
    ['团队转化离散率', `${e.conversionDispersion}%`, '转化率标准差 / 平均转化率'], [], ['渠道分析'],
    ['来源渠道', '线索数', '加微数', '加微率', '问卷数', '问卷填写率', '成交数', '转化率', '净GMV']
  ]
  data.value.channels.forEach((row: any) => rows.push([row.name, row.leads, row.wechat, pct(div(row.wechat, row.leads)), row.questionnaire, pct(div(row.questionnaire, row.leads)), row.deals, `${row.conversionRate.toFixed(1)}%`, row.netGmv]))
  rows.push([], ['IP渠道分析'], ['IP渠道', '渠道编号', 'IP数', '线索数', '加微数', '问卷数', '成交数', '退款数', '最终转化率', '毛GMV', '净GMV'])
  data.value.ipChannels.forEach((row: any) => rows.push([row.name, row.code, row.ipCount, row.leads, row.wechat, row.questionnaire, row.deals, row.refunds, `${row.finalConversionRate}%`, row.grossGmv, row.netGmv]))
  return rows
}

function exportReport() {
  downloadCsv(`合数BOSS_${filePeriodLabel.value}_线索经营报表.csv`, reportRows())
  ElMessage.success('已按当前筛选导出期次经营报表')
}
function exportChannels() {
  downloadCsv(`合数BOSS_${filePeriodLabel.value}_渠道分析.csv`, [['来源渠道', '线索数', '加微数', '加微率', '问卷数', '问卷填写率', '成交数', '转化率', '净GMV'], ...data.value.channels.map((row: any) => [row.name, row.leads, row.wechat, pct(div(row.wechat, row.leads)), row.questionnaire, pct(div(row.questionnaire, row.leads)), row.deals, `${row.conversionRate.toFixed(1)}%`, row.netGmv])])
}
function exportIpChannels() {
  downloadCsv(`合数BOSS_${filePeriodLabel.value}_IP渠道分析.csv`, [['IP渠道', '渠道编号', 'IP数', '线索数', '加微数', '成交数', '退款数', '最终转化率', '毛GMV', '净GMV'], ...data.value.ipChannels.map((row: any) => [row.name, row.code, row.ipCount, row.leads, row.wechat, row.deals, row.refunds, `${row.finalConversionRate}%`, row.grossGmv, row.netGmv])])
}
function exportProducts() {
  downloadCsv(`合数BOSS_${filePeriodLabel.value}_商品分析.csv`, [['商品名称', '第三方商品ID', '平台', '店铺', 'IP名称', 'IP渠道', '线索数', '加微数', '成交数', '退款数', '最终转化率', '毛GMV', '净GMV'], ...data.value.products.map((row: any) => [row.name, row.productId, row.platform, row.store, row.ipName, row.ipChannel, row.leads, row.wechat, row.deals, row.refunds, `${row.finalConversionRate}%`, row.grossGmv, row.netGmv])])
}
function exportDrilldown() {
  downloadCsv(`${filePeriodLabel.value}_${drilldown.value.label}_明细.csv`, [['订单编号', '客户', '手机号', '来源', '店铺', '商品', 'IP渠道', 'IP名称', '负责人', '负责人组织', '期次', '事件时间', '当前节点'], ...drilldownRows.value.map((row: any) => [row.orderNo, row.customerName, row.mobile, row.source, row.store, row.productName, row.ipChannel, row.ipName, row.ownerName, row.ownerOrganization, row.period, row.eventTime, row.stage])])
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const effectiveViewScope = auth.user?.role === 'ADMIN' ? scopeFilters.value.viewScope : 'SELF'
    const result: any = await http.get('/leads/analytics', { params: { aggregationMode: isLeadCreatedSummary.value ? 'LEAD_CREATED' : 'PERIOD', periodTimeRange: periodTimeRange.value, leadCreatedRange: leadCreatedRange.value, period: period.value, channel: channel.value, store: store.value, ipChannel: ipChannel.value, ipName: ipName.value, organizationId: scopeFilters.value.organizationId, ownerId: scopeFilters.value.ownerId, viewScope: effectiveViewScope } })
    data.value = result.data
  } catch (cause: any) {
    error.value = cause.message || '线索概览加载失败'
  } finally { loading.value = false }
}

watch(operatingVisibleColumns,value=>localStorage.setItem(operatingColumnStorageKey,JSON.stringify([...new Set([...value,'period'])])),{deep:true})
onMounted(async () => {
  const [organizationResult, employeeResult]: any = await Promise.all([http.get('/system/organizations'), http.get('/system/employees')])
  organizations.value = organizationResult.data
  employees.value = employeeResult.data
  await load()
})
</script>

<template>
  <section class="page lead-analytics-page">
    <PageHeader eyebrow="LEAD PERFORMANCE · 线索经营驾驶舱" title="线索概览" description="按期次或线索创建时间查看转化链路，并继续下钻到来源渠道、IP渠道和IP名称。">
      <el-button @click="definitionVisible = true">指标口径</el-button>
      <el-button @click="exportReport">导出本期报表</el-button>
      <el-button type="primary" @click="load">刷新数据</el-button>
    </PageHeader>

    <div class="analytics-filter surface">
      <BusinessScopeFilter v-model="scopeFilters" :organizations="organizations" :employees="employees" owner-label="当前线索负责人" :permission-label="permissionLabel" :role="auth.user?.role" />
      <div class="analytics-business-filter">
        <el-select v-model="period" multiple collapse-tags filterable placeholder="所属期次"><el-option v-for="item in availablePeriods" :key="item.id" :label="item.name" :value="item.name" /></el-select>
        <div class="time-filter"><span>期次时间</span><el-date-picker v-model="periodTimeRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" /></div>
        <div class="time-filter"><span>线索创建时间</span><el-date-picker v-model="leadCreatedRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" /></div>
        <el-select v-model="channel" multiple collapse-tags filterable placeholder="全部渠道"><el-option v-for="item in ['抖音','有赞','小鹅通','百家号']" :key="item" :label="item" :value="item" /></el-select>
        <el-select v-model="store" multiple collapse-tags filterable placeholder="全部店铺"><el-option v-for="item in ['合数教育官方旗舰店','合数精品课程店','合数成长课堂','合数教育体验课']" :key="item" :label="item" :value="item" /></el-select>
        <el-select v-model="ipChannel" multiple collapse-tags filterable placeholder="全部IP渠道"><el-option v-for="item in ['店播','阿留专属']" :key="item" :label="item" :value="item" /></el-select>
        <el-select v-model="ipName" multiple collapse-tags filterable placeholder="全部IP"><el-option v-for="item in ['阿留皮皮','皮皮老师','周老师']" :key="item" :label="item" :value="item" /></el-select>
        <el-button type="primary" @click="load">查询</el-button>
        <span class="data-freshness"><el-tag v-if="data.dataMode === 'DEMO'" size="small" effect="plain">演示数据</el-tag>更新于 {{ data.updatedAt || '—' }}</span>
      </div>
    </div>

    <StatePanel :loading="loading" :error="error" @retry="load">
      <article class="period-strip surface">
        <div><span>当前筛选范围</span><strong>{{ periodLabel }}</strong><small>期次 {{ periodTimeRange.join(' 至 ') || '未筛选' }} · 线索创建 {{ leadCreatedRange.join(' 至 ') }} · {{ data.metricVersion }}</small></div>
        <p>所有模块共享当前筛选与数据权限；蓝色数字可查看组成该指标的线索明细。</p>
        <el-button type="primary" plain @click="exportReport">导出总览 + 渠道 + IP渠道</el-button>
      </article>

      <article class="journey-board surface">
        <header><div><span class="section-kicker">FULL-FUNNEL SIGNAL</span><h2>转化链路</h2></div><button class="live-chip" @click="openDrilldown('online', '当前在线', data.funnel?.online)"><i></i>当前在线 <b>{{ format(data.funnel?.online) }}</b></button></header>
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

      <article class="surface period-operating-panel">
        <div class="panel-heading period-operating-heading">
          <div><span class="section-kicker">OPERATING DATA</span><h3>经营数据</h3><p>单期展示期次数据，多期展示汇总及各期次数据；未选择期次时按当前筛选正常汇总。</p></div>
          <div class="period-heading-actions"><strong>{{ period.length ? periodLabel : '全部数据' }}</strong><el-popover v-model:visible="operatingColumnSettingVisible" placement="bottom-end" :width="430" trigger="click"><template #reference><el-button circle :icon="Setting" aria-label="设置经营数据表头" title="设置经营数据表头"/></template><div class="operating-column-head"><strong>设置表头字段</strong><el-button link type="primary" @click="resetOperatingColumns">恢复默认</el-button></div><p class="operating-column-tip">期次为固定列，其他经营指标可自由选择并自动记忆。</p><el-checkbox-group v-model="operatingVisibleColumns" class="operating-column-grid"><el-checkbox v-for="item in operatingColumnOptions" :key="item.value" :value="item.value" :disabled="item.mandatory">{{ item.label }}</el-checkbox></el-checkbox-group></el-popover><el-button @click="exportReport">导出数据</el-button></div>
        </div>
        <div class="period-operating-scroll">
          <table class="period-operating-table">
            <thead>
              <tr><th rowspan="2" class="period-column">期次</th><th v-for="group in periodOperatingGroups" :key="group.label" :colspan="group.metrics.length" :class="['group-head', group.tone]">{{ group.label }}</th></tr>
              <tr><template v-for="group in periodOperatingGroups" :key="`${group.label}-labels`"><th v-for="metric in group.metrics" :key="metric.label">{{ metric.label }}</th></template></tr>
            </thead>
            <tbody>
              <tr v-for="row in operatingRows" :key="row.label||'all-summary'">
                <th class="period-value">{{ row.label }}</th>
                <template v-for="group in row.groups" :key="`${row.label}-${group.label}-values`">
                  <td v-for="metric in group.metrics" :key="metric.label" :class="{ warning: metric.warning, highlight: metric.highlight }">
                    <button type="button" :class="{ clickable: metric.key }" :disabled="!metric.key" @click="metric.key && openDrilldown(metric.key, metric.label, metric.count || 0)">
                      <strong>{{ metric.value }}</strong><small v-if="metric.sub">{{ metric.sub }}</small>
                      <i v-if="metric.progress !== undefined" class="metric-progress"><em :style="{ width: `${metric.progress}%` }"></em></i>
                      <span v-if="metric.key">查看明细 →</span>
                    </button>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

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
          <el-table-column prop="questionnaire" label="问卷数" min-width="92" />
          <el-table-column label="成交/退款" min-width="112"><template #default="{ row }"><el-button link type="primary" @click="openDrilldown('deal', 'IP渠道成交', row.deals, row.name)">{{ row.deals }}</el-button><span class="split-value">/ {{ row.refunds }}</span></template></el-table-column>
          <el-table-column label="最终转化率" min-width="104"><template #default="{ row }"><b class="rate-cell">{{ row.finalConversionRate }}%</b></template></el-table-column>
          <el-table-column label="净GMV" min-width="110"><template #default="{ row }">{{ money(row.netGmv) }}</template></el-table-column>
        </el-table>
      </article>

      <article v-if="false" class="surface dimension-panel product-analysis-panel">
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
        <div class="panel-heading"><div><span class="section-kicker">PERIOD PULSE</span><h3>成交趋势</h3></div><div class="trend-legend"><span class="orders">成交订单数（个）</span><span class="amount">成交金额数（万元）</span></div></div>
        <svg class="trend-chart" viewBox="0 0 600 190" role="img" aria-label="成交订单数与成交金额趋势折线图"><defs><linearGradient id="dealArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2875e6" stop-opacity=".20"/><stop offset="1" stop-color="#2875e6" stop-opacity="0"/></linearGradient></defs><path d="M24 46 H576 M24 90 H576 M24 134 H576" class="chart-grid"/><path :d="chartArea" fill="url(#dealArea)"/><path :d="orderChartPath" class="trend-line orders"/><path :d="amountChartPath" class="trend-line amount"/><g v-for="point in chartPoints" :key="point.label"><circle class="order-point" :cx="point.x" :cy="point.orderY" r="4"/><circle class="amount-point" :cx="point.x" :cy="point.amountY" r="4"/><text :x="point.x" y="184">{{ point.label }}</text><title>{{ point.label }}：成交订单 {{ point.deals }} 个；成交金额 {{ point.dealAmountWan }} 万元</title></g></svg>
      </article>
    </StatePanel>

    <el-drawer v-model="drilldownVisible" :title="`${drilldown.label} · 线索明细`" size="78%">
      <div class="drilldown-summary"><div><span>当前指标</span><b>{{ drilldown.label }}</b></div><div><span>汇总数量</span><b>{{ format(drilldown.value) }}</b></div><div><span>分析维度</span><b>{{ drilldown.dimension || '全部' }}</b></div><div><span>筛选期次</span><b>{{ periodLabel }}</b></div><el-button type="primary" plain @click="exportDrilldown">导出当前明细</el-button></div>
      <p class="drawer-intro">明细继承打开下钻时的期次、日期、权限、组织、负责人、店铺、IP渠道和IP名称筛选快照。演示环境仅展示前 {{ drilldownRows.length }} 条。</p>
      <el-table :data="drilldownRows" border height="calc(100vh - 250px)"><el-table-column prop="orderNo" label="订单编号" min-width="150" fixed/><el-table-column prop="customerName" label="客户" width="90"/><el-table-column prop="mobile" label="手机号" width="120"/><el-table-column prop="stage" label="当前节点" width="100"/><el-table-column prop="source" label="来源" width="90"/><el-table-column prop="store" label="店铺" min-width="160"/><el-table-column prop="productName" label="商品" min-width="190"/><el-table-column prop="ipChannel" label="IP渠道" width="110"/><el-table-column prop="ipName" label="IP名称" width="110"/><el-table-column prop="ownerName" label="负责人" width="100"/><el-table-column prop="ownerOrganization" label="负责人组织" min-width="150"/><el-table-column prop="eventTime" label="事件时间" min-width="155"/></el-table>
    </el-drawer>

    <el-drawer v-model="definitionVisible" title="数据指标口径" size="620px">
      <p class="drawer-intro">所有比率沿用当前筛选条件，并以同一期次归属和去重规则计算。未接入的数据展示“待接入”，不得按0参与计算。</p>
      <el-table :data="definitions" border><el-table-column label="指标" width="120"><template #default="{ row }"><b>{{ row[0] }}</b></template></el-table-column><el-table-column label="计算口径" min-width="300"><template #default="{ row }">{{ row[1] }}</template></el-table-column><el-table-column label="数据源" width="110"><template #default="{ row }">{{ row[2] }}</template></el-table-column></el-table>
      <div class="definition-note"><b>退款归属规则</b><p>退款成功时间距下单时间不超过30日，默认回冲原销售期次；原期次无带班记录时顺延至下一期次。规则发布前由业务与财务共同确认。</p></div>
    </el-drawer>
  </section>
</template>

<style scoped>
.lead-analytics-page{--analytics-ink:#12233f;--analytics-blue:#2875e6;--analytics-cyan:#24aeb5}.analytics-filter{display:block;padding:14px 16px;margin-bottom:16px}.analytics-business-filter{display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap}.analytics-business-filter :deep(.el-date-editor){width:250px}.analytics-business-filter :deep(.el-select){width:164px}.data-freshness{display:flex;align-items:center;gap:8px;margin-left:auto;color:var(--muted);font-size:12px;white-space:nowrap}.section-kicker{color:var(--analytics-blue);font:700 10px/1 Inter,system-ui,sans-serif;letter-spacing:.14em}.period-strip{display:grid;grid-template-columns:270px 1fr auto;align-items:center;gap:22px;margin-bottom:16px;padding:14px 18px;border-left:4px solid var(--analytics-blue)}.period-strip span,.period-strip small,.period-strip strong{display:block}.period-strip span{font-size:10px;color:#8292a8}.period-strip strong{margin:3px 0;color:var(--analytics-ink);font-size:18px}.period-strip small,.period-strip p{color:var(--muted);font-size:11px}.period-strip p{margin:0}.journey-board{padding:22px 24px;margin-bottom:16px;overflow:hidden}.journey-board header,.panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}.journey-board h2,.panel-heading h3{margin:6px 0 0;color:var(--analytics-ink)}.panel-heading p{margin:7px 0 0;color:var(--muted);font-size:11px}.live-chip{display:flex;align-items:center;gap:7px;padding:7px 10px;border:0;border-radius:18px;background:#eaf9f7;color:#28766f;font-size:12px;cursor:pointer}.live-chip i{width:7px;height:7px;border-radius:50%;background:#22b98f;box-shadow:0 0 0 4px #22b98f20}.live-chip b{font-variant-numeric:tabular-nums}.journey-rail{display:flex;align-items:center;margin-top:24px}.journey-stage{min-width:112px;flex:1;padding:14px 13px;border:1px solid #dce8f8;border-radius:10px;background:#f8fbff;text-align:left;color:var(--analytics-ink);cursor:pointer;transition:transform .16s ease,box-shadow .16s ease}.journey-stage:hover{transform:translateY(-2px);box-shadow:0 8px 20px #1f5ca014}.journey-stage.final{background:var(--analytics-ink);border-color:var(--analytics-ink);color:#fff}.journey-stage small,.journey-stage strong,.journey-stage span{display:block}.journey-stage small{color:#69809f}.journey-stage.final small,.journey-stage.final span{color:#b9c9de}.journey-stage strong{margin:7px 0 4px;font:700 23px/1 Inter,"PingFang SC",sans-serif}.journey-stage span{font-size:10px;color:#8a9aaf}.journey-link{width:52px;flex:0 0 52px;display:flex;flex-direction:column;align-items:center;gap:6px}.journey-link b{font:600 10px Inter,sans-serif;color:#7589a4}.journey-link i{width:42px;height:1px;background:#9ab9e4;position:relative}.journey-link i:after{content:"";position:absolute;right:-1px;top:-3px;border-left:5px solid #79a4dd;border-top:3px solid transparent;border-bottom:3px solid transparent}.journey-board footer{display:flex;justify-content:space-between;margin-top:15px;padding-top:13px;border-top:1px solid var(--line);font-size:11px;color:var(--muted)}.refund-signal{border:0;background:transparent;color:#a76620;cursor:pointer}.analytics-layout{display:grid;grid-template-columns:1.65fr .85fr;gap:16px;margin-bottom:16px}.efficiency-panel,.finance-panel,.trend-panel,.dimension-panel{padding:20px}.panel-heading>span{color:var(--muted);font-size:11px}.metric-matrix{display:grid;grid-template-columns:repeat(4,1fr);margin-top:18px;border:1px solid var(--line);border-radius:10px;overflow:hidden}.analysis-metric{min-height:132px;padding:14px;border:0;border-right:1px solid var(--line);border-bottom:1px solid var(--line);background:#fff;text-align:left}.analysis-metric:nth-child(4n){border-right:0}.analysis-metric:nth-last-child(-n+4){border-bottom:0}.analysis-metric small,.analysis-metric b,.analysis-metric span,.analysis-metric em,.analysis-metric i{display:block}.analysis-metric small{color:#8795a7;font-size:9px}.analysis-metric b{margin:12px 0 5px;color:var(--analytics-ink);font:700 23px/1 Inter,"PingFang SC",sans-serif}.analysis-metric span{font-size:12px;font-weight:600}.analysis-metric em{margin-top:6px;color:var(--muted);font-size:9px;font-style:normal}.analysis-metric i{margin-top:8px;color:var(--analytics-blue);font-size:9px;font-style:normal}.analysis-metric.clickable{cursor:pointer}.analysis-metric.clickable:hover{background:#f5f9ff}.analysis-metric.strong{background:#f6faff}.analysis-metric.strong b{color:var(--analytics-blue)}.analysis-metric.warning b{color:#b66b18}.finance-stack{margin-top:16px}.finance-stack>div{padding:13px 0;border-top:1px solid var(--line);display:grid;grid-template-columns:1fr auto;gap:4px 10px}.finance-stack span{font-size:12px;color:var(--secondary)}.finance-stack strong{grid-row:1/3;grid-column:2;font:700 21px Inter,sans-serif;color:var(--analytics-ink)}.finance-stack small{color:var(--muted);font-size:10px}.finance-stack .net{margin:0 -10px;padding:13px 10px;background:#f3f8ff;border-radius:8px}.finance-stack .net strong{color:var(--analytics-blue)}.target-progress{margin-top:15px}.target-progress>span,.target-progress>b{font-size:11px}.target-progress>b{float:right;color:var(--analytics-blue)}.target-progress>i{display:block;height:7px;margin-top:8px;border-radius:4px;background:#edf1f6;overflow:hidden}.target-progress em{display:block;height:100%;max-width:100%;border-radius:4px;background:linear-gradient(90deg,var(--analytics-cyan),var(--analytics-blue))}.dimension-panel{margin-bottom:16px;border-top:3px solid #dbe9ff}.dimension-panel :deep(.el-table){margin-top:18px}.source-channel-panel{border-top-color:#f0c879}.product-analysis-panel{border-top-color:#bfe8e3}.cell-sub{display:block;margin-top:4px;color:#8b99ac;font-size:10px}.split-value{color:#8b99ac}.rate-cell{color:var(--analytics-blue)}.bottom-trend{margin-bottom:20px}.trend-chart{width:100%;height:220px;margin-top:12px;overflow:visible}.chart-grid{stroke:#e9eef5;stroke-width:1}.trend-line{fill:none;stroke:var(--analytics-blue);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.trend-chart circle{fill:#fff;stroke:var(--analytics-blue);stroke-width:3}.trend-chart text{fill:#8997aa;font:10px Inter,sans-serif;text-anchor:middle}.drilldown-summary{display:grid;grid-template-columns:repeat(4,minmax(130px,1fr)) auto;gap:12px;margin-bottom:16px;padding:14px;border-radius:10px;background:#f4f7fb}.drilldown-summary span,.drilldown-summary b{display:block}.drilldown-summary span{font-size:10px;color:#8292a8}.drilldown-summary b{margin-top:5px;color:var(--analytics-ink);font-size:14px}.drawer-intro{margin:-4px 0 18px;color:var(--secondary);font-size:13px;line-height:1.7}.definition-note{margin-top:18px;padding:15px;border-radius:10px;background:#fff7eb;color:#79531f}.definition-note p{margin:6px 0 0;font-size:12px;line-height:1.7}@media(max-width:1300px){.period-strip{grid-template-columns:220px 1fr auto}.journey-stage{min-width:96px}.journey-link{width:34px;flex-basis:34px}.journey-link i{width:26px}.metric-matrix{grid-template-columns:repeat(3,1fr)}.analytics-layout{grid-template-columns:1fr}.drilldown-summary{grid-template-columns:repeat(2,1fr)}}@media(max-width:900px){.period-strip{grid-template-columns:1fr}.journey-rail{overflow-x:auto;padding-bottom:10px}.journey-stage{min-width:132px}.metric-matrix{grid-template-columns:repeat(2,1fr)}}@media(prefers-reduced-motion:reduce){.journey-stage{transition:none}}
.time-filter{display:flex;align-items:center;gap:7px}.time-filter>span{color:var(--muted);font-size:11px;white-space:nowrap}.analytics-business-filter .time-filter :deep(.el-date-editor){width:250px}
.trend-legend{display:flex;gap:18px}.trend-legend span{display:flex;align-items:center;gap:6px;color:var(--muted);font-size:11px}.trend-legend span:before{content:"";width:18px;height:3px;border-radius:2px;background:#2875e6}.trend-legend .amount:before{background:#20ad91}.trend-line.amount{stroke:#20ad91}.trend-chart .order-point{fill:#fff;stroke:#2875e6;stroke-width:3}.trend-chart .amount-point{fill:#fff;stroke:#20ad91;stroke-width:3}
</style>

<style scoped>
.period-operating-panel{margin-bottom:16px;padding:20px;overflow:hidden}
.period-operating-heading{align-items:center}
.period-heading-actions{display:flex;align-items:center;gap:12px;color:var(--analytics-ink);white-space:nowrap}
.period-heading-actions strong{font-size:14px}
.operating-column-head{display:flex;align-items:center;justify-content:space-between}.operating-column-tip{margin:8px 0 14px;color:var(--muted);font-size:12px;line-height:1.6}.operating-column-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:4px 12px;max-height:360px;overflow:auto}
.period-operating-scroll{margin-top:18px;padding-bottom:8px;overflow-x:auto;scrollbar-color:#cbd7e7 #f4f7fb;scrollbar-width:thin}
.period-operating-table{width:100%;min-width:1480px;border-collapse:separate;border-spacing:0;table-layout:fixed;color:var(--analytics-ink);font-variant-numeric:tabular-nums}
.period-operating-table th,.period-operating-table td{height:72px;border-right:1px solid #dbe6f3;border-bottom:1px solid #dbe6f3;background:#fff;text-align:center;vertical-align:middle}
.period-operating-table thead th{height:52px;background:#f8fbff;font-size:12px;font-weight:650}
.period-operating-table thead tr:first-child th{border-top:1px solid #dbe6f3}
.period-operating-table th:first-child,.period-operating-table td:first-child{border-left:1px solid #dbe6f3}
.period-operating-table thead tr:first-child th:first-child{border-top-left-radius:12px}
.period-operating-table thead tr:first-child th:last-child{border-top-right-radius:12px}
.period-operating-table tbody tr:last-child th:first-child{border-bottom-left-radius:12px}
.period-operating-table tbody tr:last-child td:last-child{border-bottom-right-radius:12px}
.period-operating-table .period-column,.period-operating-table .period-value{position:sticky;left:0;width:124px;min-width:124px;z-index:3;background:#f8fbff;box-shadow:8px 0 16px -16px #17355f80}
.period-operating-table .period-column{z-index:5}
.period-operating-table .period-value{padding:0 14px;font-size:14px;line-height:1.45}
.period-operating-table .group-head{color:#2875e6;font-size:15px}
.period-operating-table .group-head.quality{color:#4d68c7}
.period-operating-table .group-head.efficiency{color:#178a83}
.period-operating-table .group-head.finance{color:#a96719}
.period-operating-table td{padding:0}
.period-operating-table td>button{display:flex;width:100%;min-height:106px;padding:14px 8px;border:0;background:transparent;align-items:center;justify-content:center;flex-direction:column;color:inherit;font:inherit}
.period-operating-table td>button:disabled{cursor:default}
.period-operating-table td>button.clickable{cursor:pointer;transition:background-color .16s ease}
.period-operating-table td>button.clickable:hover,.period-operating-table td>button.clickable:focus-visible{outline:none;background:#f2f7ff}
.period-operating-table td strong{font:700 18px/1.15 Inter,"PingFang SC",sans-serif}
.period-operating-table td small{margin-top:8px;color:#8191a8;font-size:10px}
.period-operating-table td span{margin-top:7px;color:var(--analytics-blue);font-size:9px}
.period-operating-table td.warning strong{color:#c66d08}
.period-operating-table td.highlight{background:#f3f8ff}
.period-operating-table td.highlight strong{color:var(--analytics-blue)}
.metric-progress{display:block;width:78%;height:6px;margin-top:9px;border-radius:999px;background:#e7edf5;overflow:hidden}
.metric-progress em{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#28b7aa,#2875e6)}
@media(max-width:900px){.period-operating-panel{padding:16px}.period-operating-heading{align-items:flex-start;flex-direction:column}.period-heading-actions{width:100%;justify-content:space-between}.period-operating-table{min-width:1400px}}
@media(prefers-reduced-motion:reduce){.period-operating-table td>button.clickable{transition:none}}
</style>
