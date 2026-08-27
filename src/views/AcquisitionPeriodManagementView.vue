<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '../components/PageHeader.vue'
import http, { isDemoMode } from '../api/http'
import { loadAcquisitionPeriods, saveAcquisitionPeriods, type AcquisitionPeriod, type AcquisitionPeriodStage, type AcquisitionPeriodStatus } from '../data/acquisitionPeriods'

const periods = ref<AcquisitionPeriod[]>(isDemoMode ? loadAcquisitionPeriods() : [])
const keyword = ref('')
const stageFilter = ref('')
const statusFilter = ref('')
const editVisible = ref(false)
const batchVisible = ref(false)
const logVisible = ref(false)
const editingId = ref('')
const activePeriod = ref<AcquisitionPeriod | null>(null)
const periodLogs = ref<any[]>([])
const loading = ref(false)

const form = reactive<{ name: string; stage: AcquisitionPeriodStage; startAt: string; endAt: string; status: AcquisitionPeriodStatus; remark: string }>({ name: '', stage: '接量期', startAt: '', endAt: '', status: '启用', remark: '' })
const batch = reactive({ scope: 'MONTH', month: '2026-09', year: '2026', cycleDays: 7, prefix: '', defaultStage: '接量期' as AcquisitionPeriodStage })
const stages: AcquisitionPeriodStage[] = ['接量期', '转化期', '追单期']

const filteredRows = computed(() => periods.value.filter(row => {
  const matchesKeyword = !keyword.value.trim() || `${row.name}${row.id}`.toLowerCase().includes(keyword.value.trim().toLowerCase())
  return matchesKeyword && (!stageFilter.value || row.stage === stageFilter.value) && (!statusFilter.value || row.status === statusFilter.value)
}))
const metrics = computed(() => ({
  total: periods.value.length,
  enabled: periods.value.filter(item => item.status === '启用').length,
  referenced: periods.value.filter(item => item.qrRefCount > 0 || item.businessDataCount > 0).length,
  unused: periods.value.filter(item => !item.qrRefCount && !item.businessDataCount).length
}))

function pad(value: number) { return String(value).padStart(2, '0') }
function formatDate(date: Date, end = false) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${end ? '23:59:59' : '00:00:00'}`
}
function previewBatchRows() {
  const cycle = Math.max(1, Number(batch.cycleDays || 1))
  const start = batch.scope === 'MONTH'
    ? new Date(`${batch.month}-01T00:00:00`)
    : new Date(`${batch.year}-01-01T00:00:00`)
  const limit = batch.scope === 'MONTH'
    ? new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59)
    : new Date(start.getFullYear(), 11, 31, 23, 59, 59)
  const rows: Array<{ name: string; startAt: string; endAt: string; stage: AcquisitionPeriodStage }> = []
  let cursor = new Date(start)
  let index = 1
  // 全年按日级周期生成时最多 366 条，不因月度预览上限截断。
  while (cursor <= limit && rows.length < 366) {
    const end = new Date(cursor)
    end.setDate(end.getDate() + cycle - 1)
    if (end > limit) end.setTime(limit.getTime())
    const prefix = batch.prefix.trim() || (batch.scope === 'MONTH' ? `${start.getFullYear()}年${start.getMonth() + 1}月` : `${start.getFullYear()}年`)
    rows.push({ name: `${prefix}第${index}期`, startAt: formatDate(cursor), endAt: formatDate(end, true), stage: batch.defaultStage })
    cursor = new Date(end)
    cursor.setSeconds(cursor.getSeconds() + 1)
    index += 1
  }
  return rows
}
const batchPreview = computed(previewBatchRows)

const stageToApi: Record<AcquisitionPeriodStage, string> = { '接量期': 'RECEPTION', '转化期': 'CONVERSION', '追单期': 'FOLLOW_UP' }
const stageFromApi: Record<string, AcquisitionPeriodStage> = { RECEPTION: '接量期', CONVERSION: '转化期', FOLLOW_UP: '追单期' }
function mapApiPeriod(row: any): AcquisitionPeriod {
  return { id: String(row.id), name: row.period_name, stage: stageFromApi[row.period_stage] || '接量期', startAt: String(row.start_at).replace('T', ' '), endAt: String(row.end_at).replace('T', ' '), status: row.status === 'ACTIVE' ? '启用' : '停用', remark: row.remark || '', creatorName: row.created_by, createdAt: String(row.created_at).replace('T', ' '), qrRefCount: Number(row.qr_ref_count || 0), businessDataCount: Number(row.business_data_count || 0) }
}
async function loadPeriods() {
  if (isDemoMode) { periods.value = loadAcquisitionPeriods(); return }
  loading.value = true
  try {
    const response = await http.get('/acquisition-periods', { params: { keyword: keyword.value || undefined, stage: stageFilter.value ? stageToApi[stageFilter.value as AcquisitionPeriodStage] : undefined, status: statusFilter.value ? (statusFilter.value === '启用' ? 'ACTIVE' : 'INACTIVE') : undefined } })
    periods.value = response.data.map(mapApiPeriod)
  } catch (error: any) { ElMessage.error(error.message || '期次加载失败') }
  finally { loading.value = false }
}
function persist() { if (isDemoMode) saveAcquisitionPeriods(periods.value) }
function resetFilters() { keyword.value = ''; stageFilter.value = ''; statusFilter.value = '' }
function openCreate() {
  editingId.value = ''
  Object.assign(form, { name: '', stage: '接量期', startAt: '', endAt: '', status: '启用', remark: '' })
  editVisible.value = true
}
function openEdit(row: AcquisitionPeriod) {
  editingId.value = row.id
  Object.assign(form, { name: row.name, stage: row.stage, startAt: row.startAt, endAt: row.endAt, status: row.status, remark: row.remark || '' })
  editVisible.value = true
}
async function saveEdit() {
  if (!form.name.trim() || !form.startAt || !form.endAt) return ElMessage.warning('请完整填写期次名称和起止时间')
  if (new Date(form.startAt) > new Date(form.endAt)) return ElMessage.warning('期次结束时间不能早于开始时间')
  if (!isDemoMode) {
    const body = { name: form.name.trim(), stage: stageToApi[form.stage], startAt: form.startAt.replace(' ', 'T'), endAt: form.endAt.replace(' ', 'T'), status: form.status === '启用' ? 'ACTIVE' : 'INACTIVE', remark: form.remark }
    try {
      if (editingId.value) await http.put(`/acquisition-periods/${editingId.value}`, body)
      else await http.post('/acquisition-periods', body)
      editVisible.value = false; await loadPeriods(); ElMessage.success('期次已保存')
    } catch (error: any) { ElMessage.error(error.message || '期次保存失败') }
    return
  }
  if (editingId.value) {
    const row = periods.value.find(item => item.id === editingId.value)
    if (row) Object.assign(row, form)
  } else {
    periods.value.unshift({ id: `AP-${Date.now()}`, ...form, creatorName: '林校长', createdAt: new Date().toLocaleString('zh-CN', { hour12: false }), qrRefCount: 0, businessDataCount: 0 })
  }
  persist(); editVisible.value = false; ElMessage.success('期次已保存')
}
async function createBatch() {
  if (!isDemoMode) {
    try {
      const response = await http.post('/acquisition-periods/batch', { scope: batch.scope, month: batch.scope === 'MONTH' ? batch.month : undefined, year: batch.scope === 'YEAR' ? Number(batch.year) : undefined, cycleDays: batch.cycleDays, prefix: batch.prefix, stage: stageToApi[batch.defaultStage] })
      batchVisible.value = false; await loadPeriods(); ElMessage.success(`已创建 ${response.data.createdCount} 个期次，重复名称已自动跳过`)
    } catch (error: any) { ElMessage.error(error.message || '批量创建失败') }
    return
  }
  const existingNames = new Set(periods.value.map(item => item.name))
  const additions = batchPreview.value.filter(item => !existingNames.has(item.name)).map((item, index) => ({
    id: `AP-${Date.now()}-${index + 1}`, ...item, status: '启用' as const, creatorName: '林校长', createdAt: new Date().toLocaleString('zh-CN', { hour12: false }), qrRefCount: 0, businessDataCount: 0
  }))
  if (!additions.length) return ElMessage.warning('预览期次均已存在，请调整名称前缀或生成范围')
  periods.value.push(...additions); persist(); batchVisible.value = false
  ElMessage.success(`已创建 ${additions.length} 个期次，重复名称已自动跳过`)
}
async function toggleStatus(row: AcquisitionPeriod) {
  if (!isDemoMode) {
    const next = row.status === '启用' ? 'INACTIVE' : 'ACTIVE'
    try { await http.patch(`/acquisition-periods/${row.id}/status`, { status: next }); await loadPeriods(); ElMessage.success(`期次已${next === 'ACTIVE' ? '启用' : '停用'}`) }
    catch (error: any) { ElMessage.error(error.message || '期次状态变更失败') }
    return
  }
  row.status = row.status === '启用' ? '停用' : '启用'; persist(); ElMessage.success(`期次已${row.status}`)
}
async function removePeriod(row: AcquisitionPeriod) {
  if (row.qrRefCount > 0) return ElMessage.warning(`该期次已被 ${row.qrRefCount} 个活码引用，不允许删除；可先停用并解除引用`)
  if (row.businessDataCount > 0) return ElMessage.warning(`该期次已有 ${row.businessDataCount} 条业务数据，不允许删除；可改为停用`)
  await ElMessageBox.confirm(`确认删除“${row.name}”吗？`, '删除期次', { type: 'warning' })
  if (!isDemoMode) {
    try { await http.delete(`/acquisition-periods/${row.id}`); await loadPeriods(); ElMessage.success('已删除') }
    catch (error: any) { ElMessage.error(error.message || '期次删除失败') }
    return
  }
  periods.value = periods.value.filter(item => item.id !== row.id); persist(); ElMessage.success('已删除')
}
async function openLog(row: AcquisitionPeriod) {
  activePeriod.value = row; periodLogs.value = []; logVisible.value = true
  if (!isDemoMode) {
    try { periodLogs.value = (await http.get(`/acquisition-periods/${row.id}/logs`)).data }
    catch (error: any) { ElMessage.error(error.message || '期次日志加载失败') }
  }
}
onMounted(loadPeriods)
</script>

<template>
  <div class="period-page">
    <PageHeader title="引流期次" description="统一维护线索接量、转化和追单的运营时间切片；与 V2.0 交付中心营期相互独立。" />

    <section class="metric-grid">
      <article><span>期次总数</span><b>{{ metrics.total }}</b><small>运营时间主数据</small></article>
      <article><span>启用期次</span><b>{{ metrics.enabled }}</b><small>允许被线索与活码选择</small></article>
      <article><span>已被引用</span><b>{{ metrics.referenced }}</b><small>存在活码或业务数据</small></article>
      <article><span>可安全删除</span><b>{{ metrics.unused }}</b><small>无引用且无业务数据</small></article>
    </section>

    <section class="panel filter-panel">
      <el-input v-model="keyword" placeholder="期次名称 / 期次编号" clearable />
      <el-select v-model="stageFilter" placeholder="期次阶段" clearable><el-option v-for="item in stages" :key="item" :label="item" :value="item" /></el-select>
      <el-select v-model="statusFilter" placeholder="启停状态" clearable><el-option label="启用" value="启用" /><el-option label="停用" value="停用" /></el-select>
      <el-button type="primary" @click="loadPeriods">查询</el-button><el-button @click="resetFilters(); loadPeriods()">重置</el-button>
      <div class="grow" /><el-button @click="batchVisible = true">批量创建</el-button><el-button type="primary" @click="openCreate">新建期次</el-button>
    </section>

    <section class="panel table-panel">
      <header><div><h2>期次列表</h2><p>删除前同时校验活码引用和业务数据；已使用期次只能停用，不能物理删除。</p></div><span>共 {{ filteredRows.length }} 条</span></header>
      <el-table v-loading="loading" :data="filteredRows" row-key="id">
        <el-table-column label="期次名称" min-width="190"><template #default="{ row }"><b>{{ row.name }}</b><small class="sub">{{ row.id }}</small></template></el-table-column>
        <el-table-column prop="stage" label="期次阶段" width="110"><template #default="{ row }"><el-tag effect="plain">{{ row.stage }}</el-tag></template></el-table-column>
        <el-table-column prop="startAt" label="期次开始时间" min-width="170" />
        <el-table-column prop="endAt" label="期次结束时间" min-width="170" />
        <el-table-column label="引用情况" min-width="150"><template #default="{ row }"><span>活码 {{ row.qrRefCount }} · 数据 {{ row.businessDataCount }}</span></template></el-table-column>
        <el-table-column label="创建人 / 创建时间" min-width="190"><template #default="{ row }"><span>{{ row.creatorName }}</span><small class="sub">{{ row.createdAt }}</small></template></el-table-column>
        <el-table-column prop="status" label="状态" width="90"><template #default="{ row }"><el-tag :type="row.status === '启用' ? 'success' : 'info'">{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="255" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openEdit(row)">编辑</el-button><el-button link type="primary" @click="openLog(row)">日志</el-button><el-button link @click="toggleStatus(row)">{{ row.status === '启用' ? '停用' : '启用' }}</el-button><el-button link type="danger" @click="removePeriod(row)">删除</el-button></template></el-table-column>
      </el-table>
    </section>

    <el-dialog v-model="editVisible" :title="editingId ? '编辑期次' : '新建期次'" width="620px">
      <el-form label-position="top"><el-form-item label="期次名称" required><el-input v-model="form.name" maxlength="40" show-word-limit /></el-form-item><div class="form-grid"><el-form-item label="期次阶段" required><el-select v-model="form.stage"><el-option v-for="item in stages" :key="item" :label="item" :value="item" /></el-select></el-form-item><el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio-button value="启用">启用</el-radio-button><el-radio-button value="停用">停用</el-radio-button></el-radio-group></el-form-item></div><div class="form-grid"><el-form-item label="期次开始时间" required><el-date-picker v-model="form.startAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" /></el-form-item><el-form-item label="期次结束时间" required><el-date-picker v-model="form.endAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" /></el-form-item></div><el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="3" /></el-form-item></el-form>
      <template #footer><el-button @click="editVisible = false">取消</el-button><el-button type="primary" @click="saveEdit">保存</el-button></template>
    </el-dialog>

    <el-dialog v-model="batchVisible" title="批量创建引流期次" width="880px">
      <el-alert title="先按规则生成预览，确认后一次性创建；重名期次会自动跳过。" type="info" show-icon :closable="false" />
      <el-form label-position="top" class="batch-form"><el-form-item label="生成范围"><el-radio-group v-model="batch.scope"><el-radio-button value="MONTH">按月生成</el-radio-button><el-radio-button value="YEAR">按年生成</el-radio-button></el-radio-group></el-form-item><el-form-item v-if="batch.scope === 'MONTH'" label="目标月份"><el-date-picker v-model="batch.month" type="month" value-format="YYYY-MM" /></el-form-item><el-form-item v-else label="目标年份"><el-date-picker v-model="batch.year" type="year" value-format="YYYY" /></el-form-item><el-form-item label="固定周期"><el-input-number v-model="batch.cycleDays" :min="1" :max="31" /><span class="unit">天 / 期</span></el-form-item><el-form-item label="名称前缀（选填）"><el-input v-model="batch.prefix" placeholder="默认按年月自动生成" /></el-form-item><el-form-item label="默认阶段"><el-select v-model="batch.defaultStage"><el-option v-for="item in stages" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-form>
      <div class="preview"><h3>生成预览 · {{ batchPreview.length }} 个期次</h3><el-table :data="batchPreview" max-height="280"><el-table-column prop="name" label="期次名称" /><el-table-column prop="stage" label="阶段" width="100" /><el-table-column prop="startAt" label="开始时间" /><el-table-column prop="endAt" label="结束时间" /></el-table></div>
      <template #footer><el-button @click="batchVisible = false">取消</el-button><el-button type="primary" @click="createBatch">确认批量创建</el-button></template>
    </el-dialog>

    <el-drawer v-model="logVisible" title="期次日志" size="480px"><el-timeline v-if="activePeriod"><template v-if="periodLogs.length"><el-timeline-item v-for="item in periodLogs" :key="item.id" :timestamp="String(item.created_at).replace('T', ' ')" type="primary"><b>{{ item.action }}</b><p>{{ item.operator_name }} · {{ item.detail }}</p></el-timeline-item></template><template v-else><el-timeline-item :timestamp="activePeriod.createdAt" type="primary"><b>创建期次</b><p>{{ activePeriod.creatorName }} 创建了 {{ activePeriod.name }}</p></el-timeline-item><el-timeline-item timestamp="当前状态"><b>引用校验</b><p>活码引用 {{ activePeriod.qrRefCount }} 个，业务数据 {{ activePeriod.businessDataCount }} 条，状态为{{ activePeriod.status }}。</p></el-timeline-item></template></el-timeline></el-drawer>
  </div>
</template>

<style scoped>
.period-page{padding:28px;background:#f4f7fb;min-height:100%}.panel,.metric-grid article{background:#fff;border:1px solid #e2e9f3;border-radius:16px;box-shadow:0 8px 24px rgba(29,57,95,.05)}.metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:18px 0}.metric-grid article{padding:20px}.metric-grid span,.metric-grid small{display:block;color:#7b8ba5}.metric-grid b{display:block;font-size:30px;color:#172b4d;margin:10px 0}.filter-panel{display:flex;align-items:center;gap:12px;padding:18px;margin-bottom:16px}.filter-panel .el-input{width:260px}.filter-panel .el-select{width:150px}.grow{flex:1}.table-panel{padding:0 18px 18px}.table-panel header{display:flex;justify-content:space-between;align-items:center;padding:20px 4px}.table-panel h2{margin:0;color:#172b4d}.table-panel p{margin:6px 0 0;color:#7b8ba5}.sub{display:block;color:#91a0b7;margin-top:5px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.form-grid .el-date-editor,.form-grid .el-select{width:100%}.batch-form{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:18px 0}.batch-form .el-select,.batch-form .el-date-editor{width:100%}.unit{margin-left:8px;color:#7b8ba5}.preview{border-top:1px solid #e5ebf4;padding-top:14px}.preview h3{color:#172b4d}@media(max-width:1000px){.metric-grid{grid-template-columns:1fr 1fr}.filter-panel{flex-wrap:wrap}.batch-form{grid-template-columns:1fr 1fr}}
</style>
