<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Clock, Download, Refresh, Search } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'

type DownloadStatus = 'GENERATED' | 'GENERATING' | 'FAILED'
type DownloadRow = {
  id: number
  requester: string
  department: string
  fileName: string
  module: string
  requestedAt: string
  generatedAt: string
  size: string
  downloads: number
  status: DownloadStatus
}

const auth = useAuthStore()
const keyword = ref('')
const servicePerson = ref('')
const department = ref('')
const status = ref<DownloadStatus | ''>('')
const requestedRange = ref<string[]>([])
const activePreset = ref('')
const refreshing = ref(false)
const recordVisible = ref(false)
const currentRecord = ref<DownloadRow | null>(null)
const rows = ref<DownloadRow[]>([
  { id: 1, requester: '林校长', department: '集团管理中心', fileName: '引流线索_待解密订单_2026-09-10.csv', module: '线索中心', requestedAt: '2026-09-10 10:24:18', generatedAt: '2026-09-10 10:24:22', size: '18.6 KB', downloads: 0, status: 'GENERATED' },
  { id: 2, requester: '林校长', department: '集团管理中心', fileName: '客户列表_当前筛选结果_2026-09-10.xlsx', module: '客户中心', requestedAt: '2026-09-10 09:48:06', generatedAt: '', size: '—', downloads: 0, status: 'GENERATING' },
  { id: 3, requester: '张峻阁', department: '博商深圳 / 深圳三部', fileName: '合数BOSS_渠道分析_2026-09-09.csv', module: '首页', requestedAt: '2026-09-09 18:16:35', generatedAt: '2026-09-09 18:16:40', size: '42.1 KB', downloads: 2, status: 'GENERATED' },
  { id: 4, requester: '王老师', department: '课程顾问一部', fileName: '活码接量情况_2026-09-09.xlsx', module: '线索中心', requestedAt: '2026-09-09 15:02:11', generatedAt: '', size: '—', downloads: 0, status: 'FAILED' },
  { id: 5, requester: '陈老师', department: '客户运营中心', fileName: '问卷答卷明细_2026-08-30.xlsx', module: '问卷管理', requestedAt: '2026-08-30 11:36:27', generatedAt: '2026-08-30 11:36:52', size: '1.8 MB', downloads: 1, status: 'GENERATED' }
])

const people = ['林校长', '张峻阁', '王老师', '陈老师']
const departments = ['集团管理中心', '博商深圳 / 深圳三部', '课程顾问一部', '客户运营中心']
const presets = ['昨天', '今天', '本周', '上周', '本月', '上月', '本季度', '上季度', '本年', '去年']

const statusLabels: Record<DownloadStatus, string> = { GENERATED: '已生成', GENERATING: '生成中', FAILED: '生成失败' }
const statusTypes: Record<DownloadStatus, '' | 'success' | 'warning' | 'danger' | 'info'> = { GENERATED: 'success', GENERATING: 'warning', FAILED: 'danger' }
const statusLabel = (value: DownloadStatus) => statusLabels[value]
const statusType = (value: DownloadStatus) => statusTypes[value]
const visibleRows = computed(() => rows.value.filter(row => {
  const text = `${row.fileName} ${row.module} ${row.requester} ${row.department}`.toLowerCase()
  const matchesKeyword = !keyword.value.trim() || text.includes(keyword.value.trim().toLowerCase())
  const date = row.requestedAt.slice(0, 10)
  const matchesDate = requestedRange.value.length !== 2 || (date >= requestedRange.value[0] && date <= requestedRange.value[1])
  return matchesKeyword && matchesDate && (!servicePerson.value || row.requester === servicePerson.value) && (!department.value || row.department === department.value) && (!status.value || row.status === status.value)
}))

function reset() {
  keyword.value = ''
  servicePerson.value = ''
  department.value = ''
  status.value = ''
  requestedRange.value = []
  activePreset.value = ''
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function selectPreset(label: string) {
  const today = new Date(2026, 8, 10)
  let start = new Date(today)
  let end = new Date(today)
  if (label === '昨天') start.setDate(start.getDate() - 1), end = new Date(start)
  if (label === '本周') start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  if (label === '上周') { end.setDate(end.getDate() - ((end.getDay() + 6) % 7) - 1); start = new Date(end); start.setDate(start.getDate() - 6) }
  if (label === '本月') start = new Date(today.getFullYear(), today.getMonth(), 1)
  if (label === '上月') { start = new Date(today.getFullYear(), today.getMonth() - 1, 1); end = new Date(today.getFullYear(), today.getMonth(), 0) }
  if (label === '本季度') start = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)
  if (label === '上季度') { const month = Math.floor(today.getMonth() / 3) * 3 - 3; start = new Date(today.getFullYear(), month, 1); end = new Date(today.getFullYear(), month + 3, 0) }
  if (label === '本年') start = new Date(today.getFullYear(), 0, 1)
  if (label === '去年') { start = new Date(today.getFullYear() - 1, 0, 1); end = new Date(today.getFullYear() - 1, 11, 31) }
  requestedRange.value = [formatDate(start), formatDate(end)]
  activePreset.value = label
}

function showRecord(row: DownloadRow) {
  currentRecord.value = row
  recordVisible.value = true
}

function refresh() {
  refreshing.value = true
  window.setTimeout(() => {
    const generating = rows.value.find(row => row.status === 'GENERATING')
    if (generating) Object.assign(generating, { status: 'GENERATED', generatedAt: '2026-09-10 10:31:08', size: '726 KB' })
    refreshing.value = false
    ElMessage.success(generating ? '下载任务状态已更新' : '已是最新状态')
  }, 500)
}

function downloadFile(row: DownloadRow) {
  if (row.status !== 'GENERATED') return
  const content = `合数BOSS演示下载文件\n文件名称：${row.fileName}\n申请人：${auth.user?.displayName || '当前用户'}\n申请时间：${row.requestedAt}\n`
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob(['\uFEFF' + content], { type: 'text/plain;charset=utf-8' }))
  link.download = row.fileName.replace(/\.(xlsx|csv)$/i, '.txt')
  link.click()
  URL.revokeObjectURL(link.href)
  row.downloads += 1
  ElMessage.success('文件下载已开始（原型演示）')
}
</script>

<template>
  <section class="page downloads-page">
    <header class="downloads-heading"><div><span>个人中心</span><h1>我的下载</h1><p>统一查询导出任务、生成进度和下载记录。</p></div></header>

    <section class="surface downloads-surface">
      <div class="scope-filter">
        <el-select v-model="servicePerson" clearable placeholder="选择服务人"><el-option v-for="item in people" :key="item" :label="item" :value="item"/></el-select>
        <el-select v-model="department" clearable placeholder="点击选择部门"><el-option v-for="item in departments" :key="item" :label="item" :value="item"/></el-select>
        <el-input v-model="keyword" clearable :prefix-icon="Search" placeholder="搜索申请人或文件名称"/>
      </div>
      <div class="downloads-filter">
        <b>申请时间：</b>
        <button v-for="item in presets" :key="item" :class="{ active: activePreset === item }" @click="selectPreset(item)">{{ item }}</button>
        <el-date-picker v-model="requestedRange" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始时间" end-placeholder="结束时间" @change="activePreset = ''"/>
        <el-select v-model="status" clearable placeholder="生成状态">
          <el-option v-for="(label, value) in statusLabels" :key="value" :label="label" :value="value"/>
        </el-select>
        <el-button type="primary">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>

      <div class="download-notice"><el-icon><Clock/></el-icon><div><b>说明：</b><span>文件生成需要一点时间，可以点击刷新查看最新状态。</span></div><el-button :icon="Refresh" :loading="refreshing" @click="refresh">刷新</el-button></div>

      <el-table :data="visibleRows" row-key="id">
        <el-table-column prop="requester" label="申请人" width="130" sortable/>
        <el-table-column prop="department" label="所属部门" min-width="190" sortable/>
        <el-table-column prop="requestedAt" label="申请时间" width="178" sortable/>
        <el-table-column label="文件内容名称" min-width="320"><template #default="{ row }"><div class="download-file"><i><el-icon><Download/></el-icon></i><span><b>{{ row.fileName }}</b><small>{{ row.module }} · {{ row.size }}</small></span></div></template></el-table-column>
        <el-table-column prop="downloads" label="下载次数" width="110" align="center" sortable/>
        <el-table-column label="状态" width="112"><template #default="{ row }"><el-tag :type="statusType(row.status)" effect="light">{{ statusLabel(row.status) }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="126" fixed="right"><template #default="{ row }"><el-button link type="primary" :disabled="row.status !== 'GENERATED'" @click="downloadFile(row)">下载</el-button><el-button link type="primary" @click="showRecord(row)">记录</el-button></template></el-table-column>
        <template #empty><el-empty description="暂无符合条件的下载任务" :image-size="72"/></template>
      </el-table>
      <div class="downloads-footer"><span>共 {{ visibleRows.length }} 条</span><el-pagination background layout="prev, pager, next" :total="visibleRows.length" :page-size="10"/></div>
    </section>

    <el-dialog v-model="recordVisible" title="下载记录" width="560px">
      <el-descriptions v-if="currentRecord" :column="1" border>
        <el-descriptions-item label="申请人">{{ currentRecord.requester }}</el-descriptions-item>
        <el-descriptions-item label="所属部门">{{ currentRecord.department }}</el-descriptions-item>
        <el-descriptions-item label="文件名称">{{ currentRecord.fileName }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentRecord.requestedAt }}</el-descriptions-item>
        <el-descriptions-item label="生成时间">{{ currentRecord.generatedAt || '—' }}</el-descriptions-item>
        <el-descriptions-item label="下载次数">{{ currentRecord.downloads }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </section>
</template>

<style scoped>
.downloads-page{max-width:1600px;margin:0 auto}.downloads-heading{margin-bottom:18px}.downloads-heading span{color:var(--brand);font-size:11px;letter-spacing:.16em;font-weight:700}.downloads-heading h1{margin:6px 0 7px;font-size:28px}.downloads-heading p{margin:0;color:var(--secondary)}.downloads-surface{overflow:hidden}.scope-filter{display:grid;grid-template-columns:190px 220px minmax(280px,1fr);gap:10px;padding:18px 18px 12px}.scope-filter .el-input{justify-self:end;max-width:460px}.downloads-filter{display:flex;flex-wrap:wrap;gap:7px;align-items:center;padding:4px 18px 18px;border-bottom:1px solid var(--line)}.downloads-filter>b{margin-right:8px;font-size:14px}.downloads-filter>button{padding:7px 9px;border:0;border-radius:5px;background:transparent;color:#63758d;cursor:pointer}.downloads-filter>button:hover,.downloads-filter>button.active{background:var(--brand);color:#fff}.downloads-filter .el-date-editor{width:285px;margin-left:8px}.downloads-filter .el-select{width:132px}.download-notice{display:flex;gap:10px;align-items:center;margin:12px 18px;padding:12px 14px;border-radius:8px;background:#fff5f4;color:#e43e36}.download-notice>.el-icon{font-size:20px}.download-notice div{display:flex;gap:6px;align-items:center;flex:1}.download-notice span{font-size:13px}.download-file{display:flex;align-items:center;gap:10px}.download-file>i{display:grid;place-items:center;width:36px;height:36px;border-radius:9px;background:#edf4ff;color:var(--brand);font-style:normal}.download-file span{min-width:0;display:flex;flex-direction:column;gap:3px}.download-file b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.download-file small{color:var(--secondary)}.downloads-footer{display:flex;align-items:center;justify-content:flex-end;gap:16px;padding:16px 18px;color:var(--secondary);font-size:13px}@media(max-width:1100px){.scope-filter{grid-template-columns:1fr 1fr}.scope-filter .el-input{grid-column:1/-1;justify-self:stretch;max-width:none}.downloads-filter .el-date-editor{width:100%;margin-left:0}.download-notice div{align-items:flex-start;flex-direction:column;gap:3px}}
</style>
