<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Connection, DocumentChecked, RefreshRight, Search, WarningFilled } from '@element-plus/icons-vue'
import http from '../api/http'
import PageHeader from '../components/PageHeader.vue'
import StatePanel from '../components/StatePanel.vue'

const rows = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const keyword = ref('')
const status = ref('')
const sourceType = ref('')
const dateRange = ref<string[]>([])
const detailVisible = ref(false)
const activeCase = ref<any>(null)
const submitting = ref(false)
const resolution = ref({ resolutionType: '', reason: '', confirmed: false })

const statusLabels: Record<string, string> = { PENDING: '待处理', PROCESSING: '处理中', RESOLVED: '已解决' }
const sourceLabels: Record<string, string> = { LEAD_CONVERT: '线索转客户', CUSTOMER_CREATE: '人工建档', WECOM_SYNC: '企微同步', IMPORT: '数据导入' }
const resolutionLabels: Record<string, string> = { MERGE_TO_MOBILE: '合并至手机号命中客户', MERGE_TO_UNION: '合并至 UnionID 命中客户', KEEP_SEPARATE: '确认不同人，保留独立档案' }
const statusTag: Record<string, string> = { PENDING: 'danger', PROCESSING: 'warning', RESOLVED: 'success' }

const filteredRows = computed(() => rows.value.filter(row => {
  if (!dateRange.value?.length) return true
  const value = String(row.requested_at || '').slice(0, 10).replaceAll('/', '-')
  return value >= dateRange.value[0] && value <= dateRange.value[1]
}))
const summary = computed(() => ({
  pending: rows.value.filter(item => item.status === 'PENDING').length,
  processing: rows.value.filter(item => item.status === 'PROCESSING').length,
  resolved: rows.value.filter(item => item.status === 'RESOLVED').length
}))

function maskMobile(value: string) { return value ? value.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2') : '—' }
function compactUnion(value: string) { return value?.length > 18 ? `${value.slice(0, 9)}…${value.slice(-6)}` : value || '—' }
function diff(left: any, right: any, field: string) { return String(left?.[field] || '') !== String(right?.[field] || '') }

async function load() {
  loading.value = true; error.value = ''
  try {
    const response = await http.get('/customers/collisions', { params: { keyword: keyword.value, status: status.value, sourceType: sourceType.value } })
    rows.value = response.data
  } catch (event: any) { error.value = event.message || '撞单案件加载失败' }
  finally { loading.value = false }
}
function reset() {
  keyword.value = ''; status.value = ''; sourceType.value = ''; dateRange.value = []
  load()
}
function openDetail(row: any) {
  activeCase.value = row
  resolution.value = { resolutionType: '', reason: '', confirmed: false }
  detailVisible.value = true
}
async function startCase() {
  if (!activeCase.value) return
  try {
    const response = await http.post(`/customers/collisions/${activeCase.value.id}/start`)
    activeCase.value = response.data
    const index = rows.value.findIndex(item => item.id === response.data.id)
    if (index >= 0) rows.value[index] = response.data
    ElMessage.success('案件已领取，处理过程将持续留痕')
  } catch (event: any) { ElMessage.error(event.message) }
}
async function resolveCase() {
  if (activeCase.value?.status !== 'PROCESSING') return ElMessage.warning('请先领取案件，再提交裁决')
  if (!resolution.value.resolutionType) return ElMessage.warning('请选择处理结论')
  submitting.value = true
  try {
    const response = await http.post(`/customers/collisions/${activeCase.value.id}/resolve`, resolution.value)
    activeCase.value = response.data
    const index = rows.value.findIndex(item => item.id === response.data.id)
    if (index >= 0) rows.value[index] = response.data
    ElMessage.success('撞单裁决已保存，身份和档案变更已写入审计记录')
  } catch (event: any) { ElMessage.error(event.message) }
  finally { submitting.value = false }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader eyebrow="IDENTITY COLLISION · MANUAL REVIEW" title="撞单管理" description="当手机号与 UnionID 分别命中不同客户时阻断自动建档，通过证据对比完成身份划归并保留完整审计链路。">
      <el-button :icon="RefreshRight" @click="load">刷新</el-button>
    </PageHeader>

    <section class="collision-metrics">
      <article class="danger"><span>待处理</span><b>{{ summary.pending }}</b><small>等待领取与核验</small></article>
      <article class="warning"><span>处理中</span><b>{{ summary.processing }}</b><small>已明确处理人</small></article>
      <article class="success"><span>已解决</span><b>{{ summary.resolved }}</b><small>结论与证据可复核</small></article>
    </section>

    <section class="surface filter-panel">
      <el-input v-model="keyword" :prefix-icon="Search" clearable placeholder="案件编号、手机号、UnionID、客户编号或姓名" @keyup.enter="load"/>
      <el-select v-model="sourceType" clearable placeholder="全部触发来源"><el-option v-for="(label,value) in sourceLabels" :key="value" :label="label" :value="value"/></el-select>
      <el-select v-model="status" clearable placeholder="全部状态"><el-option v-for="(label,value) in statusLabels" :key="value" :label="label" :value="value"/></el-select>
      <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="触发开始日期" end-placeholder="触发结束日期"/>
      <el-button type="primary" @click="load">查询</el-button><el-button @click="reset">重置</el-button>
    </section>

    <section class="surface table-shell collision-table">
      <header class="table-caption"><div><b>身份冲突案件</b><span>手机号与 UnionID 分别命中不同客户主档时不得静默覆盖，必须进入人工裁决。</span></div><span>共 {{ filteredRows.length }} 条</span></header>
      <StatePanel v-if="loading" mode="loading" title="正在加载撞单案件"/>
      <StatePanel v-else-if="error" mode="error" title="加载失败" :description="error" @retry="load"/>
      <el-table v-else :data="filteredRows" row-key="id">
        <el-table-column label="案件编号" width="190"><template #default="{row}"><button class="case-link" @click="openDetail(row)">{{ row.collision_no }}</button><small>{{ row.requested_at }}</small></template></el-table-column>
        <el-table-column label="本次进入身份" min-width="230"><template #default="{row}"><b>{{ row.incoming_name || '未命名客户' }}</b><small>手机 {{ maskMobile(row.mobile) }}</small><small>UnionID {{ compactUnion(row.union_id) }}</small></template></el-table-column>
        <el-table-column label="手机号命中" min-width="210"><template #default="{row}"><div class="hit-card mobile"><b>{{ row.mobile_customer?.customer_no }}</b><span>{{ row.mobile_customer?.name }}</span><small>{{ row.mobile_customer?.owner_organization_name }} · {{ row.mobile_customer?.owner_name }}</small></div></template></el-table-column>
        <el-table-column label="UnionID 命中" min-width="210"><template #default="{row}"><div class="hit-card union"><b>{{ row.union_customer?.customer_no }}</b><span>{{ row.union_customer?.name }}</span><small>{{ row.union_customer?.owner_organization_name }} · {{ row.union_customer?.owner_name }}</small></div></template></el-table-column>
        <el-table-column label="触发来源" width="150"><template #default="{row}"><span>{{ sourceLabels[row.source_type] || row.source_type }}</span><small>{{ row.source_business_no || row.source_lead_no || '—' }}</small></template></el-table-column>
        <el-table-column label="状态" width="110"><template #default="{row}"><el-tag :type="statusTag[row.status]" effect="plain">{{ statusLabels[row.status] }}</el-tag></template></el-table-column>
        <el-table-column label="处理人" width="115"><template #default="{row}">{{ row.handler_name || '待领取' }}</template></el-table-column>
        <el-table-column label="操作" width="150" fixed="right"><template #default="{row}"><el-button link type="primary" @click="openDetail(row)">{{ row.status === 'RESOLVED' ? '查看结果' : '详情' }}</el-button><el-button v-if="row.status === 'PENDING'" link type="danger" @click="openDetail(row)">开始处理</el-button></template></el-table-column>
      </el-table>
    </section>

    <el-dialog v-model="detailVisible" width="1180px" top="4vh" class="collision-dialog" destroy-on-close>
      <template #header><div class="dialog-title"><el-icon><WarningFilled/></el-icon><div><span>{{ activeCase?.collision_no }}</span><h2>身份冲突证据核验</h2></div><el-tag :type="statusTag[activeCase?.status]">{{ statusLabels[activeCase?.status] }}</el-tag></div></template>

      <div v-if="activeCase" class="collision-detail">
        <section class="source-context"><div><span>触发来源</span><b>{{ sourceLabels[activeCase.source_type] }}</b></div><div><span>业务单号</span><b>{{ activeCase.source_business_no || activeCase.source_lead_no || '—' }}</b></div><div><span>本次手机号</span><b>{{ activeCase.mobile }}</b></div><div><span>本次 UnionID</span><b>{{ activeCase.union_id }}</b></div><small>敏感身份仅对授权裁决人展示，本次查看已写入访问日志。</small></section>

        <section class="identity-compare">
          <article class="customer-evidence mobile-evidence"><header><i>M</i><div><span>手机号命中客户</span><h3>{{ activeCase.mobile_customer?.name }}</h3></div><b>{{ activeCase.mobile_customer?.customer_no }}</b></header><dl><div><dt>手机号</dt><dd>{{ activeCase.mobile_customer?.mobile || '—' }}</dd></div><div :class="{different:diff(activeCase.mobile_customer,activeCase.union_customer,'union_id')}"><dt>UnionID</dt><dd>{{ activeCase.mobile_customer?.union_id || '—' }}</dd></div><div :class="{different:diff(activeCase.mobile_customer,activeCase.union_customer,'grade')}"><dt>等级 / 生命周期</dt><dd>{{ activeCase.mobile_customer?.grade }} · {{ activeCase.mobile_customer?.lifecycle }}</dd></div><div :class="{different:diff(activeCase.mobile_customer,activeCase.union_customer,'owner_name')}"><dt>归属</dt><dd>{{ activeCase.mobile_customer?.owner_organization_name }} / {{ activeCase.mobile_customer?.owner_name }}</dd></div><div><dt>首次来源</dt><dd>{{ activeCase.mobile_customer?.source_name }}</dd></div><div><dt>业务沉淀</dt><dd>{{ activeCase.mobile_customer?.order_count }} 单 · {{ activeCase.mobile_customer?.questionnaire_count }} 份问卷</dd></div><div><dt>建档时间</dt><dd>{{ activeCase.mobile_customer?.created_at }}</dd></div></dl></article>
          <div class="conflict-axis"><el-icon><Connection/></el-icon><b>强身份交叉命中</b><span>禁止系统自动覆盖</span><i></i><small>需确认是否为同一自然人</small></div>
          <article class="customer-evidence union-evidence"><header><i>U</i><div><span>UnionID 命中客户</span><h3>{{ activeCase.union_customer?.name }}</h3></div><b>{{ activeCase.union_customer?.customer_no }}</b></header><dl><div :class="{different:diff(activeCase.mobile_customer,activeCase.union_customer,'mobile')}"><dt>手机号</dt><dd>{{ activeCase.union_customer?.mobile || '—' }}</dd></div><div><dt>UnionID</dt><dd>{{ activeCase.union_customer?.union_id || '—' }}</dd></div><div :class="{different:diff(activeCase.mobile_customer,activeCase.union_customer,'grade')}"><dt>等级 / 生命周期</dt><dd>{{ activeCase.union_customer?.grade }} · {{ activeCase.union_customer?.lifecycle }}</dd></div><div :class="{different:diff(activeCase.mobile_customer,activeCase.union_customer,'owner_name')}"><dt>归属</dt><dd>{{ activeCase.union_customer?.owner_organization_name }} / {{ activeCase.union_customer?.owner_name }}</dd></div><div><dt>首次来源</dt><dd>{{ activeCase.union_customer?.source_name }}</dd></div><div><dt>业务沉淀</dt><dd>{{ activeCase.union_customer?.order_count }} 单 · {{ activeCase.union_customer?.questionnaire_count }} 份问卷</dd></div><div><dt>建档时间</dt><dd>{{ activeCase.union_customer?.created_at }}</dd></div></dl></article>
        </section>

        <section v-if="activeCase.status !== 'RESOLVED'" class="resolution-panel">
          <header><div><span>MANUAL DECISION</span><h3>人工裁决</h3><p>只有确认同一自然人时才能合并。被合并档案不物理删除，订单、问卷、服务人和操作历史全部保留。</p></div><el-button v-if="activeCase.status === 'PENDING'" type="warning" plain @click="startCase">领取并开始处理</el-button></header>
          <div class="decision-grid">
            <button :class="{active:resolution.resolutionType === 'MERGE_TO_MOBILE'}" @click="resolution.resolutionType='MERGE_TO_MOBILE'"><b>合并至手机号档案</b><span>保留 {{ activeCase.mobile_customer?.customer_no }} 为唯一主档</span></button>
            <button :class="{active:resolution.resolutionType === 'MERGE_TO_UNION'}" @click="resolution.resolutionType='MERGE_TO_UNION'"><b>合并至 UnionID 档案</b><span>保留 {{ activeCase.union_customer?.customer_no }} 为唯一主档</span></button>
            <button :class="{active:resolution.resolutionType === 'KEEP_SEPARATE'}" @click="resolution.resolutionType='KEEP_SEPARATE'"><b>确认不同自然人</b><span>不合并，保留两个独立客户档案</span></button>
          </div>
          <el-input v-model="resolution.reason" type="textarea" :rows="3" maxlength="300" show-word-limit placeholder="必填：说明核验渠道、证据和裁决依据（至少 8 个字）"/>
          <div class="resolution-footer"><el-checkbox v-model="resolution.confirmed" :disabled="activeCase.status !== 'PROCESSING'">已核验手机号、企微身份、订单、问卷和历史服务记录</el-checkbox><el-button type="primary" :icon="DocumentChecked" :loading="submitting" :disabled="activeCase.status !== 'PROCESSING'" @click="resolveCase">确认裁决</el-button></div>
        </section>

        <section v-else class="resolved-panel"><el-result icon="success" title="撞单案件已解决" :sub-title="resolutionLabels[activeCase.resolution_type]"><template #extra><div class="result-evidence"><span>处理人：{{ activeCase.handler_name }}</span><span>处理时间：{{ activeCase.handled_at }}</span><span v-if="activeCase.target_customer">保留主档：{{ activeCase.target_customer.customer_no }}</span><p>{{ activeCase.resolution_reason }}</p></div></template></el-result></section>

        <section class="audit-panel"><h3>案件处理记录</h3><el-timeline><el-timeline-item v-for="log in activeCase.audit_logs" :key="`${log.action}-${log.occurred_at}`" :timestamp="log.occurred_at" placement="top"><b>{{ log.operator }} · {{ log.action }}</b><p>{{ log.detail }}</p></el-timeline-item></el-timeline></section>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.collision-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:16px}.collision-metrics article{position:relative;min-height:118px;padding:20px;border:1px solid var(--line);border-radius:14px;background:#fff;overflow:hidden}.collision-metrics article:after{content:"";position:absolute;inset:0 auto 0 0;width:4px;background:var(--brand)}.collision-metrics article.danger:after{background:var(--danger)}.collision-metrics article.warning:after{background:var(--warning)}.collision-metrics article.success:after{background:var(--success)}.collision-metrics span,.collision-metrics small{display:block;color:var(--secondary);font-size:12px}.collision-metrics b{display:block;margin:9px 0 5px;font-size:29px}.filter-panel{display:grid;grid-template-columns:minmax(300px,1.5fr) repeat(2,minmax(120px,.65fr)) 320px auto auto;gap:9px;padding:16px;margin-bottom:16px}.table-caption{min-height:76px;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line)}.table-caption b,.table-caption span{display:block}.table-caption b{font-size:17px}.table-caption div span,.table-caption>span{margin-top:5px;color:var(--muted);font-size:11px}.collision-table small{display:block;margin-top:5px;color:var(--muted);font-size:11px}.case-link{padding:0;border:0;background:none;color:var(--brand);font-weight:700;cursor:pointer}.hit-card{padding-left:11px;border-left:2px solid #67a2f4}.hit-card.union{border-color:#7768df}.hit-card b,.hit-card span{display:block}.hit-card span{margin-top:3px}.dialog-title{display:flex;align-items:center;gap:12px}.dialog-title>.el-icon{width:40px;height:40px;border-radius:12px;background:#fff1f1;color:var(--danger);font-size:22px}.dialog-title div{flex:1}.dialog-title span{color:var(--muted);font-size:11px}.dialog-title h2{margin:3px 0 0}.source-context{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:15px;border:1px solid #f2d8a2;border-radius:12px;background:#fff9ed}.source-context>div{padding-right:10px;border-right:1px solid #f2dfbd}.source-context span,.source-context b{display:block}.source-context span{color:#a06d13;font-size:11px}.source-context b{margin-top:6px}.source-context>small{grid-column:1/-1;color:#a06d13}.identity-compare{display:grid;grid-template-columns:1fr 150px 1fr;gap:14px;margin-top:16px;align-items:stretch}.customer-evidence{border:1px solid var(--line);border-radius:14px;background:#fff;overflow:hidden}.customer-evidence header{display:flex;align-items:center;gap:10px;padding:16px 17px;border-bottom:1px solid var(--line);background:#f8fbff}.customer-evidence header>i{width:36px;height:36px;display:grid;place-items:center;border-radius:10px;background:#e5f0ff;color:var(--brand);font-style:normal;font-weight:800}.union-evidence header>i{background:#efedff;color:#6f61d5}.customer-evidence header div{flex:1}.customer-evidence header span{color:var(--muted);font-size:11px}.customer-evidence h3{margin:3px 0 0}.customer-evidence header>b{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}.customer-evidence dl{margin:0;padding:8px 16px 15px}.customer-evidence dl>div{display:grid;grid-template-columns:105px 1fr;gap:10px;padding:10px 0;border-bottom:1px dashed var(--line)}.customer-evidence dl>div:last-child{border:0}.customer-evidence dt{color:var(--muted);font-size:11px}.customer-evidence dd{margin:0;font-size:12px;font-weight:600;word-break:break-all}.customer-evidence .different dd{color:#ce6e12}.conflict-axis{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:var(--secondary)}.conflict-axis>.el-icon{width:46px;height:46px;border:1px solid #ffd2d4;border-radius:50%;background:#fff4f4;color:var(--danger);font-size:22px}.conflict-axis b{margin-top:10px;color:var(--danger);font-size:12px}.conflict-axis span,.conflict-axis small{margin-top:4px;font-size:10px}.conflict-axis i{width:100%;height:1px;margin:14px 0;background:linear-gradient(90deg,#67a2f4,var(--danger),#7768df)}.resolution-panel,.resolved-panel,.audit-panel{margin-top:16px;padding:18px;border:1px solid var(--line);border-radius:14px;background:#fff}.resolution-panel header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}.resolution-panel header span{color:var(--brand);font-size:10px;letter-spacing:.14em}.resolution-panel h3,.audit-panel h3{margin:4px 0}.resolution-panel p{margin:4px 0 0;color:var(--secondary);font-size:11px}.decision-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px}.decision-grid button{min-height:82px;padding:14px;border:1px solid var(--line);border-radius:11px;background:#fbfcfe;text-align:left;color:var(--text);cursor:pointer}.decision-grid button:hover{border-color:#9ec3f6}.decision-grid button.active{border-color:var(--brand);background:var(--brand-soft);box-shadow:0 0 0 1px var(--brand)}.decision-grid b,.decision-grid span{display:block}.decision-grid span{margin-top:7px;color:var(--secondary);font-size:11px}.resolution-footer{display:flex;justify-content:space-between;align-items:center;margin-top:12px}.result-evidence{display:flex;justify-content:center;gap:18px;flex-wrap:wrap;color:var(--secondary);font-size:12px}.result-evidence p{flex-basis:100%;margin:4px 0 0;color:var(--text)}.audit-panel p{margin:5px 0;color:var(--secondary);font-size:12px}@media(max-width:1300px){.filter-panel{grid-template-columns:2fr repeat(2,1fr);}.filter-panel .el-date-editor{grid-column:1/3}.identity-compare{grid-template-columns:1fr 120px 1fr}}
</style>
