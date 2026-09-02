<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Download, Search } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'

type ChannelStatus = '启用' | '停用'
type ChannelRow = {
  id: number
  code: string
  name: string
  type: string
  owner: string
  source: string
  rule: string
  status: ChannelStatus
  leads: number
  valid: number
  wechat: number
  customers: number
  paid: number
  netGmv: number
}

const route = useRoute()
const router = useRouter()
const activeTab = ref(route.query.tab === 'analysis' ? 'analysis' : 'list')
const query = reactive({ keyword: '', type: '', status: '' as '' | ChannelStatus, dateRange: ['2026-08-01', '2026-08-18'] })
const rows = ref<ChannelRow[]>([
  { id: 1, code: 'DY-LIVE', name: '抖音直播', type: '平台渠道', owner: '陈老师', source: '抖音店 / 直播间', rule: '平台 + 店铺 + 直播间', status: '启用', leads: 12846, valid: 11320, wechat: 7894, customers: 6428, paid: 1128, netGmv: 3049800 },
  { id: 2, code: 'YZ-STORE', name: '有赞店铺', type: '平台渠道', owner: '李士文', source: '有赞 / 商品订单', rule: '店铺ID + 商品ID', status: '启用', leads: 6820, valid: 5986, wechat: 3926, customers: 3158, paid: 596, netGmv: 1627000 },
  { id: 3, code: 'XET-COURSE', name: '小鹅通课程', type: 'IP渠道', owner: '刘老师', source: '小鹅通 / 课程', rule: '店铺ID + 课程ID', status: '启用', leads: 4215, valid: 3882, wechat: 2864, customers: 2340, paid: 528, netGmv: 1456300 },
  { id: 4, code: 'XHS-CONTENT', name: '小红书内容', type: 'IP渠道', owner: '陈老师', source: '小红书 / 笔记', rule: '账号 + 笔记ID', status: '停用', leads: 2168, valid: 1820, wechat: 986, customers: 748, paid: 126, netGmv: 317800 }
])

const filteredRows = computed(() => {
  const term = query.keyword.trim().toLowerCase()
  return rows.value.filter(item => (!term || `${item.code}${item.name}${item.owner}${item.source}`.toLowerCase().includes(term))
    && (!query.type || item.type === query.type)
    && (!query.status || item.status === query.status))
})
const totals = computed(() => filteredRows.value.reduce((result, item) => ({
  leads: result.leads + item.leads,
  valid: result.valid + item.valid,
  wechat: result.wechat + item.wechat,
  customers: result.customers + item.customers,
  paid: result.paid + item.paid,
  netGmv: result.netGmv + item.netGmv
}), { leads: 0, valid: 0, wechat: 0, customers: 0, paid: 0, netGmv: 0 }))
const stages = computed(() => [
  { name: '线索', value: totals.value.leads },
  { name: '有效线索', value: totals.value.valid },
  { name: '加微', value: totals.value.wechat },
  { name: '转客户', value: totals.value.customers },
  { name: '支付客户', value: totals.value.paid }
])

watch(activeTab, tab => router.replace({ query: tab === 'analysis' ? { tab: 'analysis' } : {} }))
function percentage(value: number, total: number) { return total ? `${(value / total * 100).toFixed(1)}%` : '—' }
function formatMoney(value: number) { return `¥${(value / 10000).toFixed(1)}万` }
function resetQuery() { Object.assign(query, { keyword: '', type: '', status: '', dateRange: ['2026-08-01', '2026-08-18'] }) }
function toggle(row: ChannelRow) { row.status = row.status === '启用' ? '停用' : '启用'; ElMessage.success(`渠道已${row.status}`) }
</script>

<template>
  <section class="page channel-page">
    <PageHeader title="渠道管理" description="在一个入口维护渠道主数据，并核对渠道从线索进入到成交的转化质量。">
      <el-button v-if="activeTab === 'analysis'" :icon="Download" @click="ElMessage.success('渠道分析正在导出')">导出分析</el-button>
    </PageHeader>

    <div class="channel-workspace surface">
      <el-tabs v-model="activeTab" class="channel-tabs">
        <el-tab-pane label="渠道列表" name="list" />
        <el-tab-pane label="数据分析" name="analysis" />
      </el-tabs>
      <span class="workspace-note">管理和分析共用渠道编码、归因规则与数据权限</span>
    </div>

    <div class="channel-filter surface">
      <el-input v-model="query.keyword" clearable :prefix-icon="Search" placeholder="渠道名称、编码、负责人或来源" />
      <el-select v-model="query.type" clearable placeholder="渠道类型"><el-option v-for="item in ['平台渠道','IP渠道']" :key="item" :label="item" :value="item" /></el-select>
      <el-select v-model="query.status" clearable placeholder="渠道状态"><el-option label="启用" value="启用"/><el-option label="停用" value="停用"/></el-select>
      <el-date-picker v-if="activeTab === 'analysis'" v-model="query.dateRange" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
      <el-button type="primary">查询</el-button><el-button @click="resetQuery">重置</el-button>
    </div>

    <article v-if="activeTab === 'list'" class="channel-list surface">
      <header><div><h3>渠道列表</h3><span>{{ filteredRows.length }} 个渠道</span></div><p>渠道编码作为稳定身份，名称变更不影响历史归因</p></header>
      <el-table :data="filteredRows" row-key="id">
        <el-table-column prop="code" label="渠道编码" width="145"><template #default="{ row }"><code>{{ row.code }}</code></template></el-table-column>
        <el-table-column prop="name" label="渠道名称" min-width="160" />
        <el-table-column prop="type" label="渠道类型" width="120" />
        <el-table-column label="状态" width="90"><template #default="{ row }"><el-tag :type="row.status === '启用' ? 'success' : 'info'">{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="210" fixed="right"><template #default="{ row }"><el-button link type="primary">详情</el-button><el-button link type="primary">编辑</el-button><el-button link type="primary" @click="toggle(row)">{{ row.status === '启用' ? '停用' : '启用' }}</el-button></template></el-table-column>
      </el-table>
    </article>

    <template v-else>
      <section class="channel-funnel surface">
        <header><div><span>CHANNEL JOURNEY</span><h3>渠道转化漏斗</h3></div><p>{{ query.dateRange[0] }} 至 {{ query.dateRange[1] }} · 当前筛选渠道</p></header>
        <div class="funnel-rail">
          <button v-for="(stage, index) in stages" :key="stage.name"><small>{{ stage.name }}</small><b>{{ stage.value.toLocaleString() }}</b><span>{{ index ? `环节转化 ${percentage(stage.value, stages[index - 1].value)}` : '归因起点' }}</span><i v-if="index < stages.length - 1">→</i></button>
        </div>
      </section>
      <div class="analysis-grid">
        <section class="channel-ranking surface">
          <header><div><h3>渠道效果对比</h3><span>同一口径横向比较</span></div></header>
          <el-table :data="filteredRows" row-key="id">
            <el-table-column prop="name" label="渠道" min-width="150" />
            <el-table-column prop="leads" label="线索" width="90" align="right" />
            <el-table-column prop="wechat" label="加微" width="90" align="right" />
            <el-table-column label="加微率" width="100" align="right"><template #default="{ row }"><b class="rate">{{ percentage(row.wechat, row.valid) }}</b></template></el-table-column>
            <el-table-column prop="paid" label="支付客户" width="100" align="right" />
            <el-table-column label="最终转化" width="100" align="right"><template #default="{ row }"><b class="rate">{{ percentage(row.paid, row.leads) }}</b></template></el-table-column>
            <el-table-column label="净GMV" width="115" align="right"><template #default="{ row }"><b>{{ formatMoney(row.netGmv) }}</b></template></el-table-column>
          </el-table>
        </section>
        <aside class="analysis-note surface"><span>分析口径</span><h3>渠道数据不与渠道配置混算</h3><p>渠道列表负责定义“是谁”；数据分析负责回答“效果如何”。两者共用渠道身份、权限和归因版本，但启停渠道不会改写历史数据。</p><button @click="ElMessage.info('已打开指标口径说明')">查看指标口径 →</button></aside>
      </div>
    </template>

  </section>
</template>

<style scoped>
.channel-page{--ink:#142541;--blue:#2875e6;--mint:#20ad91}.channel-workspace{position:relative;padding:0 18px;margin-bottom:10px}.channel-tabs :deep(.el-tabs__header){margin:0}.channel-tabs :deep(.el-tabs__item){height:52px;font-weight:700}.workspace-note{position:absolute;right:18px;top:19px;color:#8b99ab;font-size:10px}.channel-filter{display:grid;grid-template-columns:1.5fr .7fr .6fr 1.25fr auto auto;gap:9px;padding:14px 16px;margin-bottom:14px}.channel-filter :deep(.el-date-editor){width:100%}.channel-list,.channel-ranking{padding:0 18px 18px}.channel-list>header,.channel-ranking>header,.channel-funnel>header{display:flex;align-items:center;justify-content:space-between;height:62px}.channel-list header>div,.channel-ranking header>div{display:flex;align-items:baseline;gap:9px}.channel-list h3,.channel-ranking h3,.channel-funnel h3{margin:0;color:var(--ink)}.channel-list header span,.channel-list header p,.channel-ranking header span,.channel-funnel header p{color:#8b99ab;font-size:10px}.channel-list code{padding:5px 7px;border-radius:6px;background:#f0f5fc;color:#3e6594;font-weight:700}.channel-funnel{padding:0 20px 20px;margin-bottom:14px}.channel-funnel header>div>span{color:var(--blue);font:700 9px Inter,sans-serif;letter-spacing:.14em}.channel-funnel h3{margin-top:5px}.funnel-rail{display:grid;grid-template-columns:repeat(5,1fr);gap:9px}.funnel-rail button{position:relative;min-height:105px;padding:15px;border:1px solid #dce7f5;border-radius:9px;background:#f8fbff;text-align:left;cursor:pointer}.funnel-rail button:focus-visible{outline:2px solid var(--blue);outline-offset:2px}.funnel-rail small,.funnel-rail b,.funnel-rail span{display:block}.funnel-rail small{color:#71839b}.funnel-rail b{margin:9px 0 5px;color:var(--ink);font:700 22px Inter,sans-serif}.funnel-rail span{color:#8b99ab;font-size:9px}.funnel-rail i{position:absolute;right:-10px;top:40px;z-index:2;color:#8eb3e4;font-style:normal}.analysis-grid{display:grid;grid-template-columns:1fr 280px;gap:14px}.analysis-note{padding:21px;border-top:3px solid var(--blue)}.analysis-note>span{color:var(--blue);font:700 9px Inter,sans-serif;letter-spacing:.12em}.analysis-note h3{margin:10px 0;color:var(--ink);line-height:1.45}.analysis-note p{color:#718198;font-size:11px;line-height:1.8}.analysis-note button{padding:0;border:0;background:none;color:var(--blue);font-weight:700;cursor:pointer}.rate{color:var(--blue)}@media(max-width:1200px){.channel-filter{grid-template-columns:repeat(3,1fr)}.analysis-grid{grid-template-columns:1fr}.funnel-rail{grid-template-columns:repeat(3,1fr)}}
</style>
