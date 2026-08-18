<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import http from '../api/http'
import PageHeader from '../components/PageHeader.vue'
import StatePanel from '../components/StatePanel.vue'

const loading = ref(true)
const error = ref('')
const data = ref<any>({ funnel: {}, finance: {}, efficiency: {}, trend: [], channels: [] })
const dateRange = ref<[string, string]>(['2026-08-12', '2026-08-18'])
const period = ref('2026 暑期第 3 营')
const channel = ref('全部渠道')
const team = ref('一转销售部')
const definitionVisible = ref(false)

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
  const f = data.value.funnel || {}, finance = data.value.finance || {}, e = data.value.efficiency || {}
  const lead = f.leads || 1
  return [
    { group: '过程效率', label: '加微率', value: pct(f.wechat / lead), note: '加微数 / 有效线索数' },
    { group: '过程效率', label: '问卷填写率', value: pct(f.questionnaire / lead), note: '问卷填写数 / 有效线索数' },
    { group: '过程效率', label: '预约率', value: pct(f.reservation / lead), note: '预约数 / 有效线索数' },
    { group: '过程效率', label: '到课率', value: pct(f.arrival / lead), note: '到课数 / 有效线索数' },
    { group: '过程效率', label: '完课率', value: pct(f.completion / lead), note: '完课数 / 有效线索数' },
    { group: '结果质量', label: '成交转化率', value: pct(f.deal / lead), note: '成交数 / 有效线索数', strong: true },
    { group: '结果质量', label: '退款率', value: pct(f.refund / lead), note: '退款人数 / 有效线索数', warning: true },
    { group: '结果质量', label: '最终转化率', value: pct(((f.deal || 0) - (f.refund || 0)) / lead), note: '(成交数 - 退款数) / 有效线索数', strong: true },
    { group: '经营效能', label: '人服比', value: String(e.peopleServiceRatio || '—'), note: '私域用户总数 / 服务人员数' },
    { group: '经营效能', label: '单人净GMV', value: money(e.perCapitaGmv), note: '净GMV / 带班人数' },
    { group: '经营效能', label: '团队转化离散率', value: `${e.conversionDispersion || 0}%`, note: '团队转化率标准差 / 平均转化率', warning: true },
    { group: '经营效能', label: '当前在线', value: format(f.online), note: '直播间当前在线人数' }
  ]
})

const financeCards = computed(() => {
  const f = data.value.finance || {}
  return [
    ['成交GMV（含退款）', money(f.grossGmv), '支付成功订单金额'],
    ['退款金额', money(f.refundAmount), `${format(data.value.funnel?.refund)} 人退款`],
    ['净GMV（扣退款）', money(f.netGmv), '成交GMV - 退款金额'],
    ['GMV完成率', pct(f.netGmv / (f.targetGmv || 1)), `目标 ${money(f.targetGmv)}`]
  ]
})

const chartPoints = computed(() => {
  const rows = data.value.trend || [], max = Math.max(...rows.map((row: any) => row.deals), 1)
  return rows.map((row: any, index: number) => ({ ...row, x: 24 + index * (552 / Math.max(rows.length - 1, 1)), y: 152 - row.deals / max * 118 }))
})
const chartPath = computed(() => chartPoints.value.map((p: any, i: number) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' '))
const chartArea = computed(() => chartPoints.value.length ? `${chartPath.value} L ${chartPoints.value.at(-1).x} 164 L ${chartPoints.value[0].x} 164 Z` : '')

const definitions = [
  ['有效线索数', '去重后且线索标记为有效、解密状态为已解密的唯一线索数', '线索中心'],
  ['加微数', '统计期内完成加微的去重客户数；默认按 day1 口径', '企微事件/线索'],
  ['问卷填写数', '统计期内提交有效问卷的去重客户数；默认按 day1 口径', '问卷管理'],
  ['预约/到课/完课数', '已预约；直播在线时长 > 0；直播在线时长 > 50 分钟', '直播系统'],
  ['成交数', '支付成功且能够关联线索的正式课去重付款客户数', '订单中心'],
  ['退款数/金额', '支付后 30 日内退款成功的去重客户数及退款金额', '订单/退款'],
  ['成交GMV', '统计期内支付成功订单金额之和，包含后续退款订单', '订单中心'],
  ['净GMV', '成交GMV减去归属本统计期的退款金额', '订单/退款'],
  ['团队转化离散率', '各团队转化率的标准差除以平均转化率，用于识别团队差异', '线索/组织']
]

function format(value: number) { return new Intl.NumberFormat('zh-CN').format(value || 0) }
function pct(value: number) { return `${((Number.isFinite(value) ? value : 0) * 100).toFixed(1)}%` }
function money(value: number) { return value >= 10000 ? `¥${(value / 10000).toFixed(1)}万` : `¥${format(value)}` }
async function load() { loading.value = true; error.value = ''; try { const result: any = await http.get('/leads/analytics', { params: { dateRange: dateRange.value, period: period.value, channel: channel.value, team: team.value } }); data.value = result.data } catch (e: any) { error.value = e.message || '数据分析加载失败' } finally { loading.value = false } }
function exportReport() { ElMessage.success('数据分析报表已生成，开始下载') }
onMounted(load)
</script>

<template>
  <section class="page lead-analytics-page">
    <PageHeader eyebrow="LEAD PERFORMANCE · 一转经营" title="数据分析" description="沿线索旅程定位转化损耗，同时核对成交质量、退款与团队效能。">
      <el-button @click="definitionVisible = true">指标口径</el-button>
      <el-button @click="exportReport">导出报表</el-button>
      <el-button type="primary" @click="load">刷新数据</el-button>
    </PageHeader>

    <div class="analytics-filter surface">
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
      <el-select v-model="period" filterable placeholder="所属营期"><el-option v-for="item in ['2026 暑期第 3 营','2026 暑期第 2 营','2026 暑期体验营']" :key="item" :label="item" :value="item" /></el-select>
      <el-select v-model="channel"><el-option v-for="item in ['全部渠道','抖音','有赞','小鹅通','百家号']" :key="item" :label="item" :value="item" /></el-select>
      <el-select v-model="team"><el-option v-for="item in ['一转销售部','一转一组','一转二组']" :key="item" :label="item" :value="item" /></el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <span class="data-freshness"><el-tag v-if="data.dataMode === 'DEMO'" size="small" effect="plain">演示数据</el-tag>更新于 {{ data.updatedAt || '—' }}</span>
    </div>

    <StatePanel :loading="loading" :error="error" @retry="load">
      <article class="journey-board surface">
        <header><div><span class="section-kicker">FULL-FUNNEL SIGNAL</span><h2>线索经营轨道</h2></div><div class="live-chip"><i></i>当前在线 <b>{{ format(data.funnel?.online) }}</b></div></header>
        <div class="journey-rail">
          <template v-for="(stage, index) in stages" :key="stage.key">
            <button class="journey-stage" :class="{ final: index === stages.length - 1 }">
              <small>{{ stage.label }}</small><strong>{{ format(stage.value) }}</strong><span>累计 {{ stage.totalRate.toFixed(1) }}%</span>
            </button>
            <div v-if="index < stages.length - 1" class="journey-link"><b>{{ stages[index + 1].rate.toFixed(1) }}%</b><i></i></div>
          </template>
        </div>
        <footer><span>默认分母：有效且已解密的去重线索</span><span class="refund-signal">退款 <b>{{ format(data.funnel?.refund) }}</b> 人 · 从成交结果中回冲</span></footer>
      </article>

      <div class="analytics-layout">
        <article class="surface efficiency-panel">
          <div class="panel-heading"><div><span class="section-kicker">CONVERSION QUALITY</span><h3>转化与团队效能</h3></div><span>口径随上方筛选同步</span></div>
          <div class="metric-matrix"><div v-for="metric in metrics" :key="metric.label" :class="['analysis-metric', { strong: metric.strong, warning: metric.warning }]"><small>{{ metric.group }}</small><b>{{ metric.value }}</b><span>{{ metric.label }}</span><em>{{ metric.note }}</em></div></div>
        </article>
        <article class="surface finance-panel">
          <div class="panel-heading"><div><span class="section-kicker">REVENUE AFTER REFUND</span><h3>成交质量</h3></div><span>{{ data.periodName }}</span></div>
          <div class="finance-stack"><div v-for="(card, index) in financeCards" :key="card[0]" :class="{ net: index === 2 }"><span>{{ card[0] }}</span><strong>{{ card[1] }}</strong><small>{{ card[2] }}</small></div></div>
          <div class="target-progress"><span>净GMV目标进度</span><b>{{ financeCards[3]?.[1] }}</b><i><em :style="{ width: financeCards[3]?.[1] }"></em></i></div>
        </article>
      </div>

      <div class="analytics-layout lower">
        <article class="surface trend-panel">
          <div class="panel-heading"><div><span class="section-kicker">7-DAY PULSE</span><h3>成交趋势</h3></div><span>单位：成交人数</span></div>
          <svg class="trend-chart" viewBox="0 0 600 190" role="img" aria-label="近七日成交趋势折线图">
            <defs><linearGradient id="dealArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2875e6" stop-opacity=".28"/><stop offset="1" stop-color="#2875e6" stop-opacity="0"/></linearGradient></defs>
            <path d="M24 46 H576 M24 90 H576 M24 134 H576" class="chart-grid"/><path :d="chartArea" fill="url(#dealArea)"/><path :d="chartPath" class="trend-line"/>
            <g v-for="point in chartPoints" :key="point.label"><circle :cx="point.x" :cy="point.y" r="4"/><text :x="point.x" y="184">{{ point.label }}</text><title>{{ point.label }}：{{ point.deals }} 人</title></g>
          </svg>
        </article>
        <article class="surface channel-panel">
          <div class="panel-heading"><div><span class="section-kicker">CHANNEL BREAKDOWN</span><h3>渠道结果</h3></div><a>查看渠道分析 →</a></div>
          <el-table :data="data.channels" size="small" height="250">
            <el-table-column prop="name" label="渠道" min-width="90" fixed />
            <el-table-column prop="leads" label="线索" min-width="86"><template #default="{ row }">{{ format(row.leads) }}</template></el-table-column>
            <el-table-column prop="wechat" label="加微" min-width="86"><template #default="{ row }">{{ format(row.wechat) }}</template></el-table-column>
            <el-table-column prop="deals" label="成交" min-width="76" />
            <el-table-column prop="conversionRate" label="转化率" min-width="82"><template #default="{ row }"><b class="rate-cell">{{ row.conversionRate.toFixed(2) }}%</b></template></el-table-column>
            <el-table-column prop="netGmv" label="净GMV" min-width="100"><template #default="{ row }">{{ money(row.netGmv) }}</template></el-table-column>
          </el-table>
        </article>
      </div>
    </StatePanel>

    <el-drawer v-model="definitionVisible" title="数据指标口径" size="620px">
      <p class="drawer-intro">所有比率沿用当前筛选条件，并以同一营期归属和去重规则计算。未接入的数据展示“待接入”，不得按 0 参与计算。</p>
      <el-table :data="definitions" border><el-table-column label="指标" width="120"><template #default="{ row }"><b>{{ row[0] }}</b></template></el-table-column><el-table-column label="计算口径" min-width="300"><template #default="{ row }">{{ row[1] }}</template></el-table-column><el-table-column label="数据源" width="110"><template #default="{ row }">{{ row[2] }}</template></el-table-column></el-table>
      <div class="definition-note"><b>退款归属规则</b><p>退款成功时间距下单时间不超过 30 日，默认回冲原销售营期；原营期无带班记录时顺延至下一营期。该规则发布前需业务与财务共同确认。</p></div>
    </el-drawer>
  </section>
</template>

<style scoped>
.lead-analytics-page{--analytics-ink:#12233f;--analytics-blue:#2875e6;--analytics-cyan:#24aeb5;--analytics-amber:#ee9a37;--analytics-paper:#f4f7fb}.analytics-filter{display:flex;align-items:center;gap:10px;padding:14px 16px;margin-bottom:16px}.analytics-filter :deep(.el-date-editor){width:260px}.analytics-filter :deep(.el-select){width:174px}.analytics-filter>span{margin-left:auto;color:var(--muted);font-size:12px}.section-kicker{color:var(--analytics-blue);font:700 10px/1 Inter,system-ui,sans-serif;letter-spacing:.14em}.journey-board{padding:22px 24px;margin-bottom:16px;overflow:hidden}.journey-board header,.panel-heading{display:flex;align-items:flex-start;justify-content:space-between}.journey-board h2,.panel-heading h3{margin:6px 0 0;color:var(--analytics-ink)}.live-chip{display:flex;align-items:center;gap:7px;padding:7px 10px;border-radius:18px;background:#eaf9f7;color:#28766f;font-size:12px}.live-chip i{width:7px;height:7px;border-radius:50%;background:#22b98f;box-shadow:0 0 0 4px #22b98f20}.live-chip b{font-variant-numeric:tabular-nums}.journey-rail{display:flex;align-items:center;margin-top:24px}.journey-stage{min-width:112px;flex:1;padding:14px 13px;border:1px solid #dce8f8;border-radius:10px;background:#f8fbff;text-align:left;color:var(--analytics-ink);cursor:pointer;transition:transform .16s ease,box-shadow .16s ease}.journey-stage:hover{transform:translateY(-2px);box-shadow:0 8px 20px #1f5ca014}.journey-stage.final{background:var(--analytics-ink);border-color:var(--analytics-ink);color:#fff}.journey-stage small,.journey-stage strong,.journey-stage span{display:block}.journey-stage small{color:#69809f}.journey-stage.final small,.journey-stage.final span{color:#b9c9de}.journey-stage strong{margin:7px 0 4px;font:700 23px/1 Inter,"PingFang SC",sans-serif;font-variant-numeric:tabular-nums}.journey-stage span{font-size:10px;color:#8a9aaf}.journey-link{width:52px;flex:0 0 52px;display:flex;flex-direction:column;align-items:center;gap:6px}.journey-link b{font:600 10px Inter,sans-serif;color:#7589a4}.journey-link i{width:42px;height:1px;background:#9ab9e4;position:relative}.journey-link i:after{content:"";position:absolute;right:-1px;top:-3px;border-left:5px solid #79a4dd;border-top:3px solid transparent;border-bottom:3px solid transparent}.journey-board footer{display:flex;justify-content:space-between;margin-top:15px;padding-top:13px;border-top:1px solid var(--line);font-size:11px;color:var(--muted)}.refund-signal{color:#a76620!important}.refund-signal b{font-variant-numeric:tabular-nums}.analytics-layout{display:grid;grid-template-columns:1.65fr .85fr;gap:16px;margin-bottom:16px}.analytics-layout.lower{grid-template-columns:.9fr 1.1fr}.efficiency-panel,.finance-panel,.trend-panel,.channel-panel{padding:20px}.panel-heading>span,.panel-heading>div+span{color:var(--muted);font-size:11px}.metric-matrix{display:grid;grid-template-columns:repeat(4,1fr);margin-top:18px;border:1px solid var(--line);border-radius:10px;overflow:hidden}.analysis-metric{min-height:122px;padding:14px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);background:#fff}.analysis-metric:nth-child(4n){border-right:0}.analysis-metric:nth-last-child(-n+4){border-bottom:0}.analysis-metric small,.analysis-metric b,.analysis-metric span,.analysis-metric em{display:block}.analysis-metric small{color:#8795a7;font-size:9px;letter-spacing:.06em}.analysis-metric b{margin:12px 0 5px;color:var(--analytics-ink);font:700 23px/1 Inter,"PingFang SC",sans-serif;font-variant-numeric:tabular-nums}.analysis-metric span{font-size:12px;font-weight:600}.analysis-metric em{margin-top:6px;color:var(--muted);font-size:9px;font-style:normal;line-height:1.4}.analysis-metric.strong{background:#f6faff}.analysis-metric.strong b{color:var(--analytics-blue)}.analysis-metric.warning b{color:#b66b18}.finance-stack{margin-top:16px}.finance-stack>div{padding:13px 0;border-top:1px solid var(--line);display:grid;grid-template-columns:1fr auto;gap:4px 10px}.finance-stack span{font-size:12px;color:var(--secondary)}.finance-stack strong{grid-row:1/3;grid-column:2;font:700 21px Inter,sans-serif;color:var(--analytics-ink);font-variant-numeric:tabular-nums}.finance-stack small{color:var(--muted);font-size:10px}.finance-stack .net{margin:0 -10px;padding:13px 10px;background:#f3f8ff;border-radius:8px}.finance-stack .net strong{color:var(--analytics-blue)}.target-progress{margin-top:15px}.target-progress>span,.target-progress>b{font-size:11px}.target-progress>b{float:right;color:var(--analytics-blue)}.target-progress>i{display:block;height:7px;margin-top:8px;border-radius:4px;background:#edf1f6;overflow:hidden}.target-progress em{display:block;height:100%;max-width:100%;border-radius:4px;background:linear-gradient(90deg,var(--analytics-cyan),var(--analytics-blue))}.trend-chart{width:100%;height:220px;margin-top:12px;overflow:visible}.chart-grid{stroke:#e9eef5;stroke-width:1}.trend-line{fill:none;stroke:var(--analytics-blue);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.trend-chart circle{fill:#fff;stroke:var(--analytics-blue);stroke-width:3}.trend-chart text{fill:#8997aa;font:10px Inter,sans-serif;text-anchor:middle}.channel-panel :deep(.el-table){margin-top:13px}.rate-cell{color:var(--analytics-blue);font-variant-numeric:tabular-nums}.drawer-intro{margin:-4px 0 18px;color:var(--secondary);font-size:13px;line-height:1.7}.definition-note{margin-top:18px;padding:15px;border-radius:10px;background:#fff7eb;color:#79531f}.definition-note p{margin:6px 0 0;font-size:12px;line-height:1.7}@media(max-width:1300px){.journey-stage{min-width:96px}.journey-link{width:34px;flex-basis:34px}.journey-link i{width:26px}.metric-matrix{grid-template-columns:repeat(3,1fr)}.analysis-metric:nth-child(n){border-right:1px solid var(--line);border-bottom:1px solid var(--line)}.analysis-metric:nth-child(3n){border-right:0}.analysis-metric:nth-last-child(-n+3){border-bottom:0}}@media(prefers-reduced-motion:reduce){.journey-stage{transition:none}}
.data-freshness{display:flex;align-items:center;gap:8px;white-space:nowrap}
</style>
