<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Plus, Search } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'

type PeriodStatus = '待开营' | '开营中' | '已结营' | '已关闭'
type PeriodRow = {
  id: number
  name: string
  openAt: string
  closeAt: string
  intakeStartAt: string
  intakeEndAt: string
  enabled: boolean
  createdAt: string
  creator: string
  remark: string
}

const STORAGE_KEY = 'heshu_boss_periods_v2'
const NOW = new Date('2026-08-25T10:00:00')
const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const selectedRows = ref<PeriodRow[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

const initialRows: PeriodRow[] = [
  { id: 1, name: '26.09.09', openAt: '2026-09-09 19:30:00', closeAt: '2026-09-23 21:30:00', intakeStartAt: '2026-08-24 18:00:01', intakeEndAt: '2026-09-07 18:00:00', enabled: true, createdAt: '2026-08-21 16:44:40', creator: '张铭钰', remark: '秋季第1营' },
  { id: 2, name: '26.08.26', openAt: '2026-08-26 19:30:00', closeAt: '2026-09-09 21:30:00', intakeStartAt: '2026-08-10 18:00:00', intakeEndAt: '2026-08-24 18:00:00', enabled: true, createdAt: '2026-08-10 16:11:53', creator: '张铭钰', remark: '暑期第4营' },
  { id: 3, name: '26.08.12', openAt: '2026-08-12 19:30:00', closeAt: '2026-08-26 21:30:00', intakeStartAt: '2026-07-28 19:00:01', intakeEndAt: '2026-08-10 17:59:59', enabled: true, createdAt: '2026-07-28 11:30:05', creator: '陈庆焕', remark: '暑期第3营' },
  { id: 4, name: '26.07.29', openAt: '2026-07-29 19:30:00', closeAt: '2026-08-12 21:30:00', intakeStartAt: '2026-07-13 18:00:01', intakeEndAt: '2026-07-28 19:00:00', enabled: true, createdAt: '2026-07-13 18:05:43', creator: '陈庆焕', remark: '' },
  { id: 5, name: '26.07.15', openAt: '2026-07-15 19:30:00', closeAt: '2026-07-29 21:30:00', intakeStartAt: '2026-06-29 18:00:01', intakeEndAt: '2026-07-13 18:00:00', enabled: true, createdAt: '2026-06-29 16:02:36', creator: '张铭钰', remark: '' },
  { id: 6, name: '26.07.01', openAt: '2026-07-01 19:30:00', closeAt: '2026-07-15 21:30:00', intakeStartAt: '2026-06-15 18:00:01', intakeEndAt: '2026-06-29 18:00:00', enabled: false, createdAt: '2026-06-15 14:40:17', creator: '张铭钰', remark: '历史营期，已关闭' },
  { id: 7, name: '26秋季第2营', openAt: '2026-09-23 19:30:00', closeAt: '2026-10-07 21:30:00', intakeStartAt: '2026-09-08 09:00:00', intakeEndAt: '2026-09-21 22:00:00', enabled: true, createdAt: '2026-08-24 09:20:16', creator: '张铭钰', remark: '秋季预备营期' },
]

function loadRows() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) as PeriodRow[] : initialRows
  } catch {
    return initialRows
  }
}

const rows = ref<PeriodRow[]>(loadRows())
const query = reactive({ keyword: '', status: '', openAt: '', closeAt: '' })
const form = reactive({ name: '', openRange: [] as string[], intakeRange: [] as string[], remark: '' })
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入营期名称', trigger: 'blur' },
    { min: 2, max: 30, message: '营期名称为 2—30 个字符', trigger: 'blur' },
  ],
  openRange: [{ type: 'array', required: true, min: 2, message: '请选择完整的开营与结营时间', trigger: 'change' }],
  intakeRange: [{ type: 'array', required: true, min: 2, message: '请选择完整的接量时间区间', trigger: 'change' }],
}

const toDate = (value: string) => new Date(value.replace(' ', 'T'))
function statusOf(row: PeriodRow): PeriodStatus {
  if (!row.enabled) return '已关闭'
  if (toDate(row.openAt) > NOW) return '待开营'
  if (toDate(row.closeAt) < NOW) return '已结营'
  return '开营中'
}
const statusType = (status: PeriodStatus) => status === '开营中' ? 'success' : status === '待开营' ? 'primary' : status === '已关闭' ? 'info' : 'warning'
const filteredRows = computed(() => {
  const keyword = query.keyword.trim().toLowerCase()
  return rows.value.filter(row =>
    (!keyword || `${row.name}${row.remark}`.toLowerCase().includes(keyword)) &&
    (!query.status || statusOf(row) === query.status) &&
    (!query.openAt || toDate(row.openAt) >= toDate(query.openAt)) &&
    (!query.closeAt || toDate(row.closeAt) <= toDate(query.closeAt)),
  )
})
const pagedRows = computed(() => filteredRows.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value))
const summary = computed(() => ({
  total: rows.value.length,
  active: rows.value.filter(row => statusOf(row) === '开营中').length,
  upcoming: rows.value.filter(row => statusOf(row) === '待开营').length,
}))

watch(rows, value => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)), { deep: true })
watch(() => [query.keyword, query.status, query.openAt, query.closeAt], () => { currentPage.value = 1 })

function resetQuery() {
  Object.assign(query, { keyword: '', status: '', openAt: '', closeAt: '' })
}
function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', openRange: [], intakeRange: [], remark: '' })
  dialogVisible.value = true
}
function openEdit(row: PeriodRow) {
  editingId.value = row.id
  Object.assign(form, {
    name: row.name,
    openRange: [row.openAt, row.closeAt],
    intakeRange: [row.intakeStartAt, row.intakeEndAt],
    remark: row.remark,
  })
  dialogVisible.value = true
}
async function savePeriod() {
  if (!formRef.value || !await formRef.value.validate()) return
  if (toDate(form.openRange[1]) <= toDate(form.openRange[0])) return ElMessage.warning('结营时间必须晚于开营时间')
  if (toDate(form.intakeRange[1]) <= toDate(form.intakeRange[0])) return ElMessage.warning('接量结束时间必须晚于接量开始时间')
  if (rows.value.some(row => row.id !== editingId.value && row.name.trim().toLowerCase() === form.name.trim().toLowerCase())) return ElMessage.warning('营期名称已存在，请使用其他名称')

  const values = {
    name: form.name.trim(),
    openAt: form.openRange[0],
    closeAt: form.openRange[1],
    intakeStartAt: form.intakeRange[0],
    intakeEndAt: form.intakeRange[1],
    remark: form.remark.trim(),
  }
  if (editingId.value) {
    const row = rows.value.find(item => item.id === editingId.value)
    if (row) Object.assign(row, values)
    ElMessage.success('营期信息已更新，历史业务仍使用原快照')
  } else {
    rows.value.unshift({
      id: Math.max(0, ...rows.value.map(item => item.id)) + 1,
      ...values,
      enabled: true,
      createdAt: '2026-08-25 10:00:00',
      creator: '林校长',
    })
    ElMessage.success('营期已创建')
  }
  dialogVisible.value = false
}
async function toggleEnabled(row: PeriodRow) {
  const action = row.enabled ? '关闭' : '启用'
  await ElMessageBox.confirm(`${action}后${row.enabled ? '将停止该营期后续业务使用' : '营期状态将重新按开营与结营时间计算'}。确认${action}“${row.name}”吗？`, `${action}营期`, { type: 'warning' })
  row.enabled = !row.enabled
  ElMessage.success(`已${action}营期`)
}
async function deleteRow(row: PeriodRow) {
  await ElMessageBox.confirm(`删除后无法恢复“${row.name}”的主档信息，确认删除吗？`, '删除营期', { type: 'warning' })
  rows.value = rows.value.filter(item => item.id !== row.id)
  ElMessage.success('营期已删除')
}
async function batchDelete() {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择需要删除的营期')
  await ElMessageBox.confirm(`将删除已选择的 ${selectedRows.value.length} 个营期，删除后无法恢复。是否继续？`, '批量删除', { type: 'warning' })
  const ids = new Set(selectedRows.value.map(row => row.id))
  rows.value = rows.value.filter(row => !ids.has(row.id))
  ElMessage.success(`已删除 ${ids.size} 个营期`)
}
</script>

<template>
  <section class="page period-page">
    <PageHeader eyebrow="DELIVERY PERIOD · 营期时间轴" title="营期管理" description="分别维护开营与结营时间、接量窗口和营期状态，为各业务提供统一营期维度。">
      <el-button :icon="Delete" :disabled="!selectedRows.length" @click="batchDelete">批量删除</el-button>
      <el-button type="primary" :icon="Plus" @click="openCreate">新建营期</el-button>
    </PageHeader>

    <div class="period-summary">
      <article><span>营期总数</span><b>{{ summary.total }}</b><small>历史营期完整保留</small></article>
      <article class="active"><span>当前开营中</span><b>{{ summary.active }}</b><small>按开营与结营时间判断</small></article>
      <article><span>待开营</span><b>{{ summary.upcoming }}</b><small>尚未到达开营时间</small></article>
    </div>

    <div class="period-filter surface">
      <el-input v-model="query.keyword" clearable :prefix-icon="Search" placeholder="搜索营期名称或备注" />
      <el-select v-model="query.status" clearable placeholder="营期状态">
        <el-option label="待开营" value="待开营" />
        <el-option label="开营中" value="开营中" />
        <el-option label="已结营" value="已结营" />
        <el-option label="已关闭" value="已关闭" />
      </el-select>
      <el-date-picker v-model="query.openAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="开营时间" />
      <el-date-picker v-model="query.closeAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="结营时间" />
      <el-button type="primary">查询</el-button>
      <el-button @click="resetQuery">重置</el-button>
    </div>

    <article class="period-ledger surface">
      <header>
        <div><h3>营期列表</h3><span>共 {{ filteredRows.length }} 条</span></div>
        <p>状态只由开营/结营时间与关闭状态计算，接量时间独立使用</p>
      </header>
      <el-table :data="pagedRows" row-key="id" @selection-change="selectedRows = $event">
        <el-table-column type="selection" width="50" />
        <el-table-column label="营期名称" min-width="145">
          <template #default="{ row }"><div class="period-name"><b>{{ row.name }}</b><small>{{ row.remark || '未填写备注' }}</small></div></template>
        </el-table-column>
        <el-table-column label="开营 / 结营时间" min-width="225">
          <template #default="{ row }"><div class="period-range"><span><i></i>{{ row.openAt }}</span><em></em><span><i></i>{{ row.closeAt }}</span></div></template>
        </el-table-column>
        <el-table-column label="接量时间" min-width="225">
          <template #default="{ row }"><div class="period-range intake"><span><i></i>{{ row.intakeStartAt }}</span><em></em><span><i></i>{{ row.intakeEndAt }}</span></div></template>
        </el-table-column>
        <el-table-column label="营期状态" width="105">
          <template #default="{ row }"><el-tag :type="statusType(statusOf(row))" effect="light">{{ statusOf(row) }}</el-tag></template>
        </el-table-column>
        <el-table-column label="创建信息" min-width="170">
          <template #default="{ row }"><div class="created-cell"><b>{{ row.creator }}</b><small>{{ row.createdAt }}</small></div></template>
        </el-table-column>
        <el-table-column label="操作" width="190" fixed="right">
          <template #default="{ row }"><el-button link type="primary" @click="openEdit(row)">编辑</el-button><el-button link :type="row.enabled ? 'warning' : 'success'" @click="toggleEnabled(row)">{{ row.enabled ? '关闭' : '启用' }}</el-button><el-button link type="danger" @click="deleteRow(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
      <footer><span>已选择 {{ selectedRows.length }} 条</span><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background layout="total, sizes, prev, pager, next, jumper" :total="filteredRows.length" :page-sizes="[10, 20, 50]" /></footer>
    </article>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑营期' : '新建营期'" width="760px" destroy-on-close class="period-dialog">
      <el-form ref="formRef" :model="form" :rules="formRules" label-position="top">
        <el-form-item label="营期名称" prop="name"><el-input v-model="form.name" maxlength="30" show-word-limit placeholder="例如：26.09.09" /></el-form-item>
        <el-form-item label="开营与结营时间" prop="openRange"><el-date-picker v-model="form.openRange" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" format="YYYY/MM/DD HH:mm:ss" range-separator="至" start-placeholder="开营时间" end-placeholder="结营时间" /></el-form-item>
        <el-form-item label="接量时间区间" prop="intakeRange"><el-date-picker v-model="form.intakeRange" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" format="YYYY/MM/DD HH:mm:ss" range-separator="至" start-placeholder="接量开始时间" end-placeholder="接量结束时间" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="4" maxlength="100" show-word-limit placeholder="填写营期说明或内部备注" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="savePeriod">保存</el-button></template>
    </el-dialog>
  </section>
</template>

<style scoped>
.period-page{--ink:#152640}.period-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px}.period-summary article{min-height:105px;padding:18px 20px;border:1px solid #e3eaf3;border-radius:12px;background:#fff;position:relative;overflow:hidden}.period-summary article:after{content:"";position:absolute;right:-18px;bottom:-28px;width:84px;height:84px;border:18px solid #edf3fb;border-radius:50%}.period-summary article.active{border-color:#b8d4fa;background:#f5f9ff}.period-summary article.active:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:#2875e6}.period-summary span,.period-summary small{display:block;color:#7f8fa4}.period-summary span{font-size:12px}.period-summary b{display:block;margin:7px 0 4px;color:var(--ink);font-size:27px}.period-summary small{font-size:10px}.period-filter{display:grid;grid-template-columns:1.25fr .75fr 1fr 1fr auto auto;gap:8px;padding:14px 16px;margin-bottom:14px}.period-ledger{padding:0 18px 18px;overflow:hidden}.period-ledger>header{height:62px;display:flex;align-items:center;justify-content:space-between}.period-ledger header>div{display:flex;align-items:baseline;gap:9px}.period-ledger h3{margin:0;color:var(--ink)}.period-ledger header span,.period-ledger header p{color:#8998aa;font-size:10px}.period-ledger footer{display:flex;align-items:center;justify-content:space-between;padding-top:18px}.period-ledger footer>span{color:#8b98a8;font-size:11px}.period-name b,.period-name small,.created-cell b,.created-cell small{display:block}.period-name b,.created-cell b{color:var(--ink)}.period-name small,.created-cell small{margin-top:5px;color:#8b98a8;font-size:10px}.period-range{display:grid;grid-template-columns:auto 1fr;gap:4px 8px;align-items:center;font-size:11px;color:#4d6079}.period-range span{display:flex;align-items:center;gap:7px}.period-range i{width:7px;height:7px;border:2px solid #73a9ef;border-radius:50%}.period-range.intake i{border-color:#46bda0}.period-range em{grid-row:1/3;width:1px;height:24px;margin-left:3px;background:#cfe0f6}.period-range.intake em{background:#ccebe3}.period-dialog .el-date-editor{width:100%}@media(max-width:1350px){.period-filter{grid-template-columns:repeat(3,1fr)}.period-summary{grid-template-columns:repeat(2,1fr)}}
</style>
