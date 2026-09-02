<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, EditPen, Folder, FolderOpened, MoreFilled, Plus, Search, View } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'

type Employee = { id: number; name: string; no: string; role: string; limit: number; received: number }
type IpBinding = { ipNo: string; name: string; category: string; channelCode: string; channelName?: string; status: '启用' | '停用' }
type LiveCode = {
  id: number; codeNo: string; name: string; type: '多人活码' | '单人活码'; campId?: number; campName?: string;
  corpId: string; corpName: string;
  groupId: number; groupName: string;
  ipNo?: string; ipName?: string; ipChannelCode?: string; ipChannelName?: string;
  autoAccept: boolean; scheduleType: '全天在线' | '分时段排班'; allocationMode: '轮询' | '顺序' | '随机'; scheduledEmployeeIds: number[]; workDays: number[]; onlineTime: string[]; backupEmployeeIds: number[]; backupEnabled: boolean; sameEmployeeEnabled: boolean;
  receptionStart: string; receptionEnd: string; status: '启用' | '停用' | '待生效' | '已结束';
  employees: Employee[]; wecomTags: string[]; internalTags: string[]; scans: number; added: number; creatorName: string; createdAt: string
}

type LiveCodeGroup = { id: number; name: string }

const wecomCorps = [
  { corpId: 'ww89d89a4f1eb5d1f1', name: '光合成长教育', status: '已授权' },
  { corpId: 'ww6f218c90a733e82b', name: '合数教育', status: '已授权' }
]
const selectedCorpId = ref(wecomCorps[0].corpId)
const selectedCorp = computed(() => wecomCorps.find(item => item.corpId === selectedCorpId.value) || wecomCorps[0])

const camps = [
  { id: 301, name: '2026年8月第1期', status: '启用' },
  { id: 302, name: '2026年8月第2期', status: '启用' },
  { id: 303, name: '2026 秋季体验营', status: '未开始' }
]
const employeePool: Employee[] = [
  { id: 1, name: '李士文', no: 'B000001', role: '部门负责人', limit: 30, received: 18 },
  { id: 2, name: '王老师', no: 'B000126', role: '课程顾问', limit: 20, received: 12 },
  { id: 3, name: '陈老师', no: 'B000135', role: '课程顾问', limit: 18, received: 16 },
  { id: 4, name: '刘老师', no: 'B000208', role: '客服专员', limit: 15, received: 9 },
  { id: 5, name: '周老师', no: 'B000236', role: '课程顾问', limit: 25, received: 4 }
]
const ipBindingStorageKey = 'heshu_boss_ip_bindings_v1'
const ipChannelNames: Record<string, string> = { CH000001: '店播', CH000002: '阿留专属' }
const fallbackIpBindings: IpBinding[] = [
  { ipNo: 'IP000001', name: '阿留皮皮', category: 'EDUCATION_PLANNING', channelCode: 'CH000002', channelName: '阿留专属', status: '启用' },
  { ipNo: 'IP000002', name: '周老师', category: 'EDUCATION_PLANNING', channelCode: 'CH000001', channelName: '店播', status: '启用' },
  { ipNo: 'IP000003', name: '王老师', category: 'EDUCATION_PLANNING', channelCode: 'CH000001', channelName: '店播', status: '停用' }
]
const ipOptions = ref<IpBinding[]>([...fallbackIpBindings])

const groups = ref<LiveCodeGroup[]>([
  { id: 1, name: '默认分组' },
  { id: 2, name: '一转活码' },
  { id: 3, name: '客服交付活码' },
  { id: 4, name: '体验课班主任活码' },
  { id: 5, name: '测试' }
])

const rows = ref<LiveCode[]>([
  { id: 1, codeNo: 'QR20260818001', name: '8月第1期 · 抖音一转', type: '多人活码', corpId: wecomCorps[0].corpId, corpName: wecomCorps[0].name, groupId: 2, groupName: '一转活码', ipNo: 'IP000001', ipName: '阿留皮皮', ipChannelCode: 'CH000002', ipChannelName: '阿留专属', campId: 301, campName: '2026年8月第1期', autoAccept: true, scheduleType: '全天在线', allocationMode: '轮询', scheduledEmployeeIds: [], workDays: [1,2,3,4,5,6,7], onlineTime: ['00:00','23:59'], backupEmployeeIds: [5], backupEnabled: true, sameEmployeeEnabled: false, receptionStart: '2026-08-12', receptionEnd: '2026-08-31', status: '启用', employees: employeePool.slice(0, 4).map(item => ({ ...item })), wecomTags: ['8月第1期', '抖音新客'], internalTags: ['一转', '重点跟进'], scans: 2846, added: 1972, creatorName: '张铭钰', createdAt: '2026-08-10 10:20' },
  { id: 2, codeNo: 'QR20260818002', name: '8月第1期 · 有赞承接', type: '多人活码', corpId: wecomCorps[0].corpId, corpName: wecomCorps[0].name, groupId: 2, groupName: '一转活码', ipNo: 'IP000001', ipName: '阿留皮皮', ipChannelCode: 'CH000002', ipChannelName: '阿留专属', campId: 301, campName: '2026年8月第1期', autoAccept: true, scheduleType: '全天在线', allocationMode: '顺序', scheduledEmployeeIds: [], workDays: [1,2,3,4,5,6,7], onlineTime: ['00:00','23:59'], backupEmployeeIds: [], backupEnabled: false, sameEmployeeEnabled: true, receptionStart: '2026-08-15', receptionEnd: '2026-09-05', status: '启用', employees: employeePool.slice(1, 4).map(item => ({ ...item, limit: item.limit + 5 })), wecomTags: ['8月第1期'], internalTags: ['有赞', '一转'], scans: 1638, added: 1024, creatorName: '陈庆焕', createdAt: '2026-08-12 14:08' },
  { id: 3, codeNo: 'QR20260818003', name: '秋季体验营 · 预热', type: '多人活码', corpId: wecomCorps[1].corpId, corpName: wecomCorps[1].name, groupId: 4, groupName: '体验课班主任活码', ipNo: 'IP000002', ipName: '周老师', ipChannelCode: 'CH000001', ipChannelName: '店播', campId: 303, campName: '2026 秋季体验营', autoAccept: false, scheduleType: '分时段排班', allocationMode: '随机', scheduledEmployeeIds: [1,2], workDays: [1,2,3,4,5], onlineTime: ['09:00','18:00'], backupEmployeeIds: [3, 4], backupEnabled: true, sameEmployeeEnabled: false, receptionStart: '2026-09-01', receptionEnd: '2026-09-20', status: '待生效', employees: employeePool.slice(0, 2).map(item => ({ ...item, received: 0 })), wecomTags: ['秋季体验营'], internalTags: ['预热', '班主任'], scans: 0, added: 0, creatorName: '张铭钰', createdAt: '2026-08-17 09:30' },
  { id: 4, codeNo: 'QR20260715001', name: '8月第2期 · 历史承接', type: '单人活码', corpId: wecomCorps[1].corpId, corpName: wecomCorps[1].name, groupId: 1, groupName: '默认分组', ipNo: 'IP000002', ipName: '周老师', ipChannelCode: 'CH000001', ipChannelName: '店播', campId: 302, campName: '2026年8月第2期', autoAccept: true, scheduleType: '全天在线', allocationMode: '轮询', scheduledEmployeeIds: [], workDays: [1,2,3,4,5,6,7], onlineTime: ['00:00','23:59'], backupEmployeeIds: [], backupEnabled: false, sameEmployeeEnabled: false, receptionStart: '2026-07-15', receptionEnd: '2026-08-10', status: '已结束', employees: [{ ...employeePool[4], limit: 60, received: 54 }], wecomTags: ['8月第2期'], internalTags: ['历史期次'], scans: 1240, added: 886, creatorName: '系统迁移', createdAt: '2026-07-12 16:45' }
])

const query = reactive({ keyword: '', campId: '', status: '' })
const selectedGroupId = ref<'all' | number>('all')
const drawerVisible = ref(false)
const detailVisible = ref(false)
const editingId = ref<number | null>(null)
const activeRow = ref<LiveCode | null>(null)
const form = reactive({ name: '', type: '多人活码' as LiveCode['type'], groupId: 1, ipNo: '' as string, campId: undefined as number | undefined, autoAccept: true, scheduleType: '全天在线' as LiveCode['scheduleType'], allocationMode: '轮询' as LiveCode['allocationMode'], scheduledEmployeeIds: [] as number[], workDays: [1,2,3,4,5,6,7] as number[], onlineTime: ['00:00','23:59'] as string[], backupEmployeeIds: [] as number[], backupEnabled: false, sameEmployeeEnabled: false, receptionRange: [] as string[], employeeIds: [] as number[], wecomTags: [] as string[], internalTags: [] as string[], status: '启用' as LiveCode['status'] })
const weekdayOptions = [{ value: 1, label: '周一' }, { value: 2, label: '周二' }, { value: 3, label: '周三' }, { value: 4, label: '周四' }, { value: 5, label: '周五' }, { value: 6, label: '周六' }, { value: 7, label: '周日' }]

function loadIpBindings() {
  try {
    const stored = JSON.parse(localStorage.getItem(ipBindingStorageKey) || '[]') as IpBinding[]
    ipOptions.value = (Array.isArray(stored) && stored.length ? stored : fallbackIpBindings).map(item => ({
      ...item,
      channelName: item.channelName || ipChannelNames[item.channelCode] || '未配置渠道'
    }))
  } catch {
    ipOptions.value = [...fallbackIpBindings]
  }
}
onMounted(loadIpBindings)

const scopedRows = computed(() => rows.value.filter(row => row.corpId === selectedCorpId.value))
const filteredRows = computed(() => scopedRows.value.filter(row => {
  const keyword = query.keyword.trim().toLowerCase()
  return (!keyword || `${row.name}${row.codeNo}${row.ipName || ''}${row.ipNo || ''}${row.ipChannelName || ''}${row.employees.map(item => item.name).join('')}`.toLowerCase().includes(keyword))
    && (selectedGroupId.value === 'all' || row.groupId === selectedGroupId.value)
    && (!query.campId || row.campId === Number(query.campId)) && (!query.status || row.status === query.status)
}))
const activeIpOptions = computed(() => ipOptions.value.filter(item => item.status === '启用' || item.ipNo === form.ipNo))
const selectedIp = computed(() => ipOptions.value.find(item => item.ipNo === form.ipNo))
const selectedEmployees = computed(() => form.employeeIds.map(id => employeePool.find(item => item.id === id)).filter(Boolean) as Employee[])
const backupEmployeeOptions = computed(() => employeePool.filter(item => !form.employeeIds.includes(item.id)))
const summary = computed(() => ({
  total: scopedRows.value.length,
  active: scopedRows.value.filter(item => item.status === '启用').length,
  capacity: scopedRows.value.filter(item => item.status === '启用').reduce((sum, row) => sum + row.employees.reduce((n, item) => n + item.limit, 0), 0),
  received: scopedRows.value.reduce((sum, row) => sum + row.employees.reduce((n, item) => n + item.received, 0), 0)
}))

function resetForm() { Object.assign(form, { name: '', type: '多人活码', groupId: selectedGroupId.value === 'all' ? 1 : selectedGroupId.value, ipNo: '', campId: undefined, autoAccept: true, scheduleType: '全天在线', allocationMode: '轮询', scheduledEmployeeIds: [], workDays: [1,2,3,4,5,6,7], onlineTime: ['00:00','23:59'], backupEmployeeIds: [], backupEnabled: false, sameEmployeeEnabled: false, receptionRange: [], employeeIds: [], wecomTags: [], internalTags: [], status: '启用' }) }
function openCreate() { loadIpBindings(); editingId.value = null; resetForm(); drawerVisible.value = true }
function openEdit(row: LiveCode) {
  loadIpBindings()
  editingId.value = row.id
  Object.assign(form, { name: row.name, type: row.type, groupId: row.groupId, ipNo: row.ipNo || '', campId: row.campId, autoAccept: row.autoAccept, scheduleType: row.scheduleType, allocationMode: row.allocationMode, scheduledEmployeeIds: [...row.scheduledEmployeeIds], workDays: [...row.workDays], onlineTime: [...row.onlineTime], backupEmployeeIds: [...row.backupEmployeeIds], backupEnabled: row.backupEnabled, sameEmployeeEnabled: row.sameEmployeeEnabled, receptionRange: [row.receptionStart, row.receptionEnd].filter(Boolean), employeeIds: row.employees.map(item => item.id), wecomTags: [...row.wecomTags], internalTags: [...row.internalTags], status: row.status })
  drawerVisible.value = true
}
function updateLimit(employeeId: number, value: number | undefined) { const item = employeePool.find(employee => employee.id === employeeId); if (item) item.limit = Number(value || 0) }
function save() {
  if (!form.name.trim()) return ElMessage.warning('请输入活码名称')
  if (!form.groupId) return ElMessage.warning('请选择活码分组')
  if (!form.employeeIds.length) return ElMessage.warning('请至少选择一名接待员工')
  if (form.type === '多人活码' && form.scheduleType === '分时段排班' && !form.scheduledEmployeeIds.length) return ElMessage.warning('请选择排班员工')
  if (form.type === '多人活码' && form.scheduleType === '分时段排班' && !form.workDays.length) return ElMessage.warning('请至少选择一个工作日')
  if (form.type === '多人活码' && form.backupEnabled && !form.backupEmployeeIds.length) return ElMessage.warning('开启备用员工后，请至少选择一名备用员工')
  const camp = camps.find(item => item.id === form.campId)
  const group = groups.value.find(item => item.id === form.groupId)!
  const ip = selectedIp.value
  const ipBinding = { ipNo: ip?.ipNo, ipName: ip?.name, ipChannelCode: ip?.channelCode, ipChannelName: ip?.channelName || (ip ? ipChannelNames[ip.channelCode] : undefined) }
  const employees = selectedEmployees.value.map(item => ({ ...item }))
  const today = new Date().toISOString().slice(0, 10)
  const hasReceptionRange = form.receptionRange.length === 2
  const dateStatus: LiveCode['status'] = !hasReceptionRange ? '启用' : form.receptionRange[1] < today ? '已结束' : form.receptionRange[0] > today ? '待生效' : '启用'
  if (editingId.value) {
    const target = rows.value.find(item => item.id === editingId.value)!
    Object.assign(target, { ...form, ...ipBinding, status: target.status === '停用' ? '停用' : dateStatus, groupName: group.name, campName: camp?.name, receptionStart: form.receptionRange[0] || '', receptionEnd: form.receptionRange[1] || '', employees })
    ElMessage.success('活码配置已更新')
  } else {
    rows.value.unshift({ id: Date.now(), codeNo: `QR${Date.now().toString().slice(-11)}`, name: form.name, type: form.type, corpId: selectedCorp.value.corpId, corpName: selectedCorp.value.name, groupId: group.id, groupName: group.name, ...ipBinding, campId: camp?.id, campName: camp?.name, autoAccept: form.autoAccept, scheduleType: form.scheduleType, allocationMode: form.allocationMode, scheduledEmployeeIds: [...form.scheduledEmployeeIds], workDays: [...form.workDays], onlineTime: [...form.onlineTime], backupEmployeeIds: [...form.backupEmployeeIds], backupEnabled: form.backupEnabled, sameEmployeeEnabled: form.sameEmployeeEnabled, receptionStart: form.receptionRange[0] || '', receptionEnd: form.receptionRange[1] || '', status: dateStatus, employees, wecomTags: [...form.wecomTags], internalTags: [...form.internalTags], scans: 0, added: 0, creatorName: '林校长', createdAt: new Date().toLocaleString('zh-CN', { hour12: false }) })
    ElMessage.success('活码已创建')
  }
  drawerVisible.value = false
}
function showDetail(row: LiveCode) { activeRow.value = row; detailVisible.value = true }
function resetQuery() { Object.assign(query, { keyword: '', campId: '', status: '' }) }
async function toggleStatus(row: LiveCode) {
  if (row.status === '已结束') return ElMessage.info('接量日期已结束，不可重新启用')
  const next = row.status === '启用' ? '停用' : '启用'
  await ElMessageBox.confirm(`确定${next}“${row.name}”吗？`, `${next}活码`, { type: 'warning' })
  row.status = next
  ElMessage.success(`活码已${next}`)
}
function download(row: LiveCode) { ElMessage.success(`正在生成“${row.name}”二维码文件`) }
function statusType(status: string) { return status === '启用' ? 'success' : status === '待生效' ? 'warning' : status === '停用' ? 'danger' : 'info' }
function capacityRate(row: LiveCode) { const limit = row.employees.reduce((sum, item) => sum + item.limit, 0); const received = row.employees.reduce((sum, item) => sum + item.received, 0); return limit ? Math.min(100, Math.round(received / limit * 100)) : 0 }
function groupCount(groupId: number) { return scopedRows.value.filter(item => item.groupId === groupId).length }
function switchWecomCorp() {
  selectedGroupId.value = 'all'
  resetQuery()
  ElMessage.success(`已切换至${selectedCorp.value.name}，活码数据已刷新`)
}
async function addGroup() {
  try {
    const { value } = await ElMessageBox.prompt('请输入分组名称', '新增活码分组', { inputPlaceholder: '例如：一转活码', inputPattern: /\S+/, inputErrorMessage: '分组名称不能为空', confirmButtonText: '新增', cancelButtonText: '取消' })
    const name = value.trim()
    if (groups.value.some(item => item.name === name)) return ElMessage.warning('已存在同名分组')
    const group = { id: Date.now(), name }
    groups.value.push(group)
    selectedGroupId.value = group.id
    ElMessage.success('分组已新增')
  } catch { /* 用户取消 */ }
}
async function renameGroup(group: LiveCodeGroup) {
  try {
    const { value } = await ElMessageBox.prompt('请输入新的分组名称', '修改分组', { inputValue: group.name, inputPattern: /\S+/, inputErrorMessage: '分组名称不能为空', confirmButtonText: '保存', cancelButtonText: '取消' })
    const name = value.trim()
    if (groups.value.some(item => item.id !== group.id && item.name === name)) return ElMessage.warning('已存在同名分组')
    const previousName = group.name
    group.name = name
    rows.value.filter(row => row.groupId === group.id).forEach(row => { row.groupName = name })
    ElMessage.success(`分组“${previousName}”已修改为“${name}”`)
  } catch { /* 用户取消 */ }
}
async function deleteGroup(group: LiveCodeGroup) {
  if (group.id === 1) return ElMessage.warning('默认分组不允许删除')
  try {
    const count = groupCount(group.id)
    await ElMessageBox.confirm(count ? `该分组下有 ${count} 个活码，删除后将自动移入默认分组。` : `确定删除分组“${group.name}”吗？`, '删除分组', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' })
    rows.value.filter(row => row.groupId === group.id).forEach(row => { row.groupId = 1; row.groupName = '默认分组' })
    groups.value = groups.value.filter(item => item.id !== group.id)
    if (selectedGroupId.value === group.id) selectedGroupId.value = 'all'
    ElMessage.success('分组已删除，原活码已移入默认分组')
  } catch { /* 用户取消 */ }
}
</script>

<template>
  <section class="page qr-page">
    <PageHeader title="活码管理" description="统一控制轮询名单、员工容量，以及 IP 与渠道维度的扫码加微归因。">
      <el-button :icon="Download">导出接量情况</el-button><el-button type="primary" :icon="Plus" @click="openCreate">新建活码</el-button>
    </PageHeader>

    <div class="wecom-scope surface">
      <div class="wecom-scope-copy"><i>企</i><span><small>当前企业微信主体</small><b>{{ selectedCorp.name }}</b><code>{{ selectedCorp.corpId }}</code></span></div>
      <div class="wecom-scope-action"><span>企微ID</span><el-select v-model="selectedCorpId" @change="switchWecomCorp"><el-option v-for="item in wecomCorps" :key="item.corpId" :value="item.corpId" :label="`${item.name} · ${item.corpId}`"><div class="corp-option"><span><b>{{ item.name }}</b><small>{{ item.corpId }}</small></span><el-tag size="small" type="success">{{ item.status }}</el-tag></div></el-option></el-select><small>切换后，分组、列表、统计及新建活码均使用所选企微ID。</small></div>
    </div>

    <div class="summary-strip surface">
      <div><span>活码总数</span><b>{{ summary.total }}</b></div><div><span>启用中</span><b>{{ summary.active }}</b></div>
      <div><span>轮询容量</span><b>{{ summary.capacity }}</b><small>仅约束自动轮询</small></div><div><span>当前已接量</span><b>{{ summary.received }}</b><small>未转化线索</small></div>
      <p><i></i><span>人工指定不受期次名单和接量上限限制；接量上限仅用于轮询资格判断。</span></p>
    </div>

    <div class="filter-bar surface">
      <el-input v-model="query.keyword" clearable :prefix-icon="Search" placeholder="搜索活码、IP、渠道或员工" />
      <el-select v-model="query.campId" clearable filterable placeholder="所属期次"><el-option v-for="item in camps" :key="item.id" :label="item.name" :value="item.id"><span>{{ item.name }}</span><small class="option-status">{{ item.status }}</small></el-option></el-select>
      <el-select v-model="query.status" clearable placeholder="活码状态"><el-option v-for="item in ['启用','待生效','停用','已结束']" :key="item" :label="item" :value="item" /></el-select>
      <el-button type="primary">查询</el-button><el-button @click="resetQuery">重置</el-button>
    </div>

    <div class="management-layout">
    <aside class="group-panel surface">
      <header><div><el-icon><FolderOpened /></el-icon><h3>活码分组</h3></div><el-button link type="primary" :icon="Plus" @click="addGroup">新增分组</el-button></header>
      <nav aria-label="活码分组筛选">
        <button :class="{ active: selectedGroupId === 'all' }" @click="selectedGroupId = 'all'"><el-icon><FolderOpened /></el-icon><span>全部活码</span><em>{{ scopedRows.length }}</em></button>
        <div v-for="group in groups" :key="group.id" :class="['group-row', { active: selectedGroupId === group.id }]">
          <button @click="selectedGroupId = group.id"><el-icon><Folder /></el-icon><span>{{ group.name }}</span><em>{{ groupCount(group.id) }}</em></button>
          <span class="group-actions">
            <el-dropdown trigger="click" placement="bottom-end" @click.stop>
              <el-button circle size="small" :icon="MoreFilled" aria-label="更多分组操作" />
              <template #dropdown><el-dropdown-menu>
                <el-dropdown-item @click="renameGroup(group)">修改分组</el-dropdown-item>
                <el-dropdown-item :disabled="group.id === 1" divided @click="deleteGroup(group)">删除分组</el-dropdown-item>
              </el-dropdown-menu></template>
            </el-dropdown>
          </span>
        </div>
      </nav>
      <p>选择分组后，右侧仅展示该分组下的活码。</p>
    </aside>

    <article class="code-list surface">
      <header><div><h3>活码列表</h3><span>共 {{ filteredRows.length }} 条</span></div></header>
      <el-table :data="filteredRows" row-key="id">
        <el-table-column label="活码" width="94"><template #default="{ row }"><div class="qr-thumb"><i></i><em>{{ row.type === '多人活码' ? '多' : '单' }}</em></div></template></el-table-column>
        <el-table-column label="活码信息" min-width="220"><template #default="{ row }"><div class="code-name"><b>{{ row.name }}</b><span>{{ row.codeNo }} · {{ row.type }}</span><small><el-tag size="small" effect="plain">{{ row.groupName }}</el-tag></small></div></template></el-table-column>
        <el-table-column label="关联IP / IP渠道" min-width="190"><template #default="{ row }"><div class="ip-binding-cell"><b>{{ row.ipName || '未关联IP' }}</b><code v-if="row.ipNo">{{ row.ipNo }}</code><span>{{ row.ipChannelName || '未自动带出渠道' }}<template v-if="row.ipChannelCode"> · {{ row.ipChannelCode }}</template></span></div></template></el-table-column>
        <el-table-column label="所属期次" min-width="190"><template #default="{ row }"><div class="camp-cell"><b>{{ row.campName || '通用活码' }}</b></div></template></el-table-column>
        <el-table-column label="接量日期区间" width="190"><template #default="{ row }"><div v-if="row.receptionStart && row.receptionEnd" class="date-cell"><b>{{ row.receptionStart }}</b><i></i><b>{{ row.receptionEnd }}</b></div><span v-else class="long-term">长期有效</span></template></el-table-column>
        <el-table-column label="接待员工 / 容量" min-width="230"><template #default="{ row }"><div class="capacity-cell"><div><span>{{ row.employees.slice(0, 3).map((item: Employee) => item.name).join('、') }}<template v-if="row.employees.length > 3"> 等{{ row.employees.length }}人</template></span><b>{{ row.employees.reduce((n: number, item: Employee) => n + item.received, 0) }} / {{ row.employees.reduce((n: number, item: Employee) => n + item.limit, 0) }}</b></div><el-progress :percentage="capacityRate(row)" :show-text="false" :stroke-width="6" /></div></template></el-table-column>
        <el-table-column label="活码标签" min-width="230"><template #default="{ row }"><div class="tag-cell"><div><span>企微</span><p><el-tag v-for="tag in row.wecomTags" :key="`wecom-${tag}`" size="small" type="success" effect="light">{{ tag }}</el-tag><em v-if="!row.wecomTags.length">未配置</em></p></div><div><span>内部</span><p><el-tag v-for="tag in row.internalTags" :key="`internal-${tag}`" size="small" effect="plain">{{ tag }}</el-tag><em v-if="!row.internalTags.length">未配置</em></p></div></div></template></el-table-column>
        <el-table-column label="创建人" width="115"><template #default="{ row }"><div class="creator-cell"><b>{{ row.creatorName }}</b><span>{{ row.createdAt.slice(0, 10) }}</span></div></template></el-table-column>
        <el-table-column label="扫码 / 加微" width="125"><template #default="{ row }"><div class="result-cell"><b>{{ row.scans.toLocaleString() }}</b><span>{{ row.added.toLocaleString() }}</span></div></template></el-table-column>
        <el-table-column label="状态" width="95"><template #default="{ row }"><el-tag :type="statusType(row.status)" effect="light">{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="235" fixed="right"><template #default="{ row }"><el-button link type="primary" :icon="View" @click="showDetail(row)">详情</el-button><el-button link type="primary" :icon="EditPen" @click="openEdit(row)">编辑</el-button><el-button link type="primary" :icon="Download" @click="download(row)">下载</el-button><el-dropdown trigger="click"><el-button link type="primary">更多⌄</el-button><template #dropdown><el-dropdown-menu><el-dropdown-item @click="toggleStatus(row)">{{ row.status === '启用' ? '停用活码' : '启用活码' }}</el-dropdown-item><el-dropdown-item @click="ElMessage.success('短链已复制')">复制短链</el-dropdown-item></el-dropdown-menu></template></el-dropdown></template></el-table-column>
      </el-table>
      <el-empty v-if="!filteredRows.length" description="没有符合条件的活码，可调整筛选条件或新建活码" />
    </article>
    </div>

    <el-drawer v-model="drawerVisible" :title="editingId ? '编辑活码' : '新建活码'" size="760px" class="qr-config-drawer">
      <div class="drawer-lead"><b>活码接量配置 · {{ selectedCorp.name }}</b><span>当前企微ID：{{ selectedCorp.corpId }}。新建活码将归属当前主体；期次和接量日期可按实际场景选填。</span></div>
      <el-form label-position="top" class="qr-form">
        <div class="form-section"><h4>基础信息</h4><div class="form-grid">
          <el-form-item label="活码名称" required><el-input v-model="form.name" maxlength="30" show-word-limit placeholder="例如：暑期三营 · 抖音一转" /></el-form-item>
          <el-form-item label="活码类型" required><el-radio-group v-model="form.type"><el-radio-button value="多人活码">多人活码</el-radio-button><el-radio-button value="单人活码">单人活码</el-radio-button></el-radio-group></el-form-item>
          <el-form-item label="活码分组" required><el-select v-model="form.groupId" placeholder="选择活码分组"><el-option v-for="item in groups" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
          <el-form-item label="自动通过好友"><div class="switch-field"><el-switch v-model="form.autoAccept" /><span>{{ form.autoAccept ? '已开启' : '已关闭' }}</span></div><small>开启后，客户添加该企业微信时无需好友验证，将自动添加成功。</small></el-form-item>
          <el-form-item><template #label>关联IP <em class="optional">选填</em></template><el-select v-model="form.ipNo" clearable filterable placeholder="搜索IP名称或IP编号"><el-option v-for="item in activeIpOptions" :key="item.ipNo" :label="`${item.name} · ${item.ipNo}`" :value="item.ipNo"><span>{{ item.name }}</span><small class="option-status">{{ item.ipNo }}</small></el-option></el-select><small>数据来源：线索中心－IP列表－IP配置；未关联时按通用活码保存。</small></el-form-item>
          <el-form-item label="IP渠道"><el-input :model-value="selectedIp ? `${selectedIp.channelName || ipChannelNames[selectedIp.channelCode] || '未配置渠道'} · ${selectedIp.channelCode}` : ''" readonly placeholder="选择关联IP后自动带出" /><small>由IP配置自动带出，活码内不可单独修改，避免归因口径不一致。</small></el-form-item>
          <el-form-item><template #label>所属期次 <em class="optional">选填</em></template><el-select v-model="form.campId" clearable filterable placeholder="从引流期次库选择"><el-option v-for="item in camps" :key="item.id" :label="item.name" :value="item.id" /></el-select><small>不选择时按通用活码保存；期次来源于线索中心—引流期次。</small></el-form-item>
          <el-form-item class="span-2"><template #label>接量日期区间 <em class="optional">选填</em></template><el-date-picker v-model="form.receptionRange" clearable type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始接量日期" end-placeholder="结束接量日期" /><small>不设置时长期有效；设置后仅在该区间内参与轮询，结束后自动标记“已结束”。</small></el-form-item>
        </div></div>
        <div class="form-section"><h4>接待员工与轮询容量</h4><el-form-item label="接待员工" required><el-select v-model="form.employeeIds" multiple filterable collapse-tags :max-collapse-tags="3" placeholder="搜索员工姓名或员工编号"><el-option v-for="item in employeePool" :key="item.id" :label="`${item.name} · ${item.no}`" :value="item.id" /></el-select></el-form-item>
          <div class="employee-config-list"><div v-for="item in selectedEmployees" :key="item.id" class="employee-config"><i>{{ item.name.slice(0,1) }}</i><span><b>{{ item.name }}</b><small>{{ item.no }} · {{ item.role }}</small></span><label>轮询接量上限<el-input-number :model-value="item.limit" :min="1" :max="999" controls-position="right" @change="(value: number | undefined) => updateLimit(item.id, value)" /></label><em>当前 {{ item.received }}</em></div><el-empty v-if="!selectedEmployees.length" :image-size="58" description="选择员工后可配置每人的轮询接量上限" /></div>
          <el-alert :closable="false" type="info" show-icon title="容量规则" description="达到接量上限的员工自动退出本期次轮询；管理员人工指定仍可选择该员工。" />
        </div>
        <div class="form-section"><h4>排班与备用员工</h4>
          <template v-if="form.type === '多人活码'"><div class="form-grid">
            <el-form-item label="排班类型" required><el-radio-group v-model="form.scheduleType"><el-radio value="全天在线">全天在线</el-radio><el-radio value="分时段排班">分时段排班</el-radio></el-radio-group><small>全天在线时随时参与分配；分时段排班按员工排班时段参与。</small></el-form-item>
            <el-form-item label="排班方式" required><el-radio-group v-model="form.allocationMode"><el-radio value="轮询">轮询</el-radio><el-radio value="顺序">顺序</el-radio><el-radio value="随机">随机</el-radio></el-radio-group></el-form-item>
            <div v-if="form.scheduleType === '分时段排班'" class="schedule-editor span-2">
              <el-alert class="schedule-fallback-tip" type="info" show-icon :closable="false" title="系统将先创建一条全天在线兜底规则" description="该规则覆盖周一至周日 00:00–23:59 且不可删除；自定义时段未命中时，系统按兜底规则继续分配，保证始终有员工可承接客户。" />
              <div class="fallback-schedule">
                <header><b>全天在线兜底</b><el-tag size="small" type="success" effect="light">系统默认 · 不可删除</el-tag></header>
                <dl><div><dt>兜底员工</dt><dd>{{ selectedEmployees.map(item => item.name).join('、') || '请先选择接待员工' }}</dd></div><div><dt>工作周期</dt><dd>周一至周日</dd></div><div><dt>在线时间</dt><dd>00:00 至 23:59</dd></div></dl>
              </div>
              <h5>自定义分时段规则</h5>
              <el-form-item label="排班员工" required><el-select v-model="form.scheduledEmployeeIds" multiple filterable collapse-tags :max-collapse-tags="3" placeholder="选择员工"><el-option v-for="item in selectedEmployees" :key="item.id" :label="`${item.name} · ${item.no}`" :value="item.id" /></el-select><small>仅可选择已加入当前活码的接待员工。</small></el-form-item>
              <el-form-item label="工作周期" required><el-checkbox-group v-model="form.workDays" class="weekday-selector"><el-checkbox v-for="item in weekdayOptions" :key="item.value" :value="item.value">{{ item.label }}</el-checkbox></el-checkbox-group></el-form-item>
              <el-form-item label="在线时间" required><el-time-picker v-model="form.onlineTime" is-range range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" format="HH:mm" value-format="HH:mm" /></el-form-item>
            </div>
            <el-form-item class="span-2" label="备用员工"><el-select v-model="form.backupEmployeeIds" multiple filterable collapse-tags :max-collapse-tags="3" placeholder="选择备用员工"><el-option v-for="item in backupEmployeeOptions" :key="item.id" :label="`${item.name} · ${item.no}`" :value="item.id" /></el-select></el-form-item>
            <el-form-item label="开启备用员工"><div class="switch-field"><el-switch v-model="form.backupEnabled" /><span>{{ form.backupEnabled ? '已开启' : '已关闭' }}</span></div><small>主接待员工当日接量达到上限后，客户将添加至备用员工。</small></el-form-item>
            <el-form-item label="添加同一员工"><div class="switch-field"><el-switch v-model="form.sameEmployeeEnabled" /><span>{{ form.sameEmployeeEnabled ? '已开启' : '已关闭' }}</span></div><small>开启后，相同客户再次扫码时优先添加至同一员工。</small></el-form-item>
          </div></template>
          <el-alert v-else :closable="false" type="info" show-icon title="单人活码不支持排班" description="单人活码固定由所选接待员工承接，无需设置排班方式和备用员工。" />
        </div>
        <div class="form-section"><h4>客户标记</h4><div class="form-grid"><el-form-item label="企微标签"><el-select v-model="form.wecomTags" multiple allow-create filterable default-first-option placeholder="选择或输入企微标签"><el-option v-for="item in ['暑期三期','秋季体验期','抖音新客','已加微']" :key="item" :label="item" :value="item" /></el-select><small>客户扫码添加成功后同步写入企业微信。</small></el-form-item><el-form-item label="内部标签"><el-select v-model="form.internalTags" multiple allow-create filterable default-first-option placeholder="选择或输入内部标签"><el-option v-for="item in ['一转','重点跟进','有赞','班主任','历史期次']" :key="item" :label="item" :value="item" /></el-select><small>仅在合数 BOSS 内用于筛选、运营与数据分析。</small></el-form-item></div></div>
      </el-form>
      <template #footer><el-button @click="drawerVisible=false">取消</el-button><el-button type="primary" @click="save">{{ editingId ? '保存修改' : '创建活码' }}</el-button></template>
    </el-drawer>

    <el-drawer v-model="detailVisible" title="活码详情" size="680px">
      <template v-if="activeRow"><div class="detail-hero"><div class="qr-large"><i></i><em>合</em></div><div><el-tag :type="statusType(activeRow.status)">{{ activeRow.status }}</el-tag><h2>{{ activeRow.name }}</h2><p>{{ activeRow.codeNo }} · {{ activeRow.type }}</p><el-button type="primary" :icon="Download" @click="download(activeRow)">下载活码</el-button></div></div>
      <el-descriptions :column="2" border><el-descriptions-item label="企业微信主体">{{ activeRow.corpName }}</el-descriptions-item><el-descriptions-item label="企微ID">{{ activeRow.corpId }}</el-descriptions-item><el-descriptions-item label="活码分组">{{ activeRow.groupName }}</el-descriptions-item><el-descriptions-item label="创建人">{{ activeRow.creatorName }}</el-descriptions-item><el-descriptions-item label="关联IP">{{ activeRow.ipName ? `${activeRow.ipName} · ${activeRow.ipNo}` : '未关联' }}</el-descriptions-item><el-descriptions-item label="IP渠道">{{ activeRow.ipChannelName ? `${activeRow.ipChannelName} · ${activeRow.ipChannelCode}` : '未配置' }}</el-descriptions-item><el-descriptions-item label="所属期次">{{ activeRow.campName || '未关联（通用活码）' }}</el-descriptions-item><el-descriptions-item label="自动通过好友">{{ activeRow.autoAccept ? '开启' : '关闭' }}</el-descriptions-item><el-descriptions-item label="排班设置">{{ activeRow.type === '单人活码' ? '不适用' : `${activeRow.scheduleType} · ${activeRow.allocationMode}` }}</el-descriptions-item><el-descriptions-item v-if="activeRow.scheduleType === '分时段排班'" label="排班周期与时间">{{ activeRow.workDays.map(day => weekdayOptions.find(item => item.value === day)?.label).join('、') }} · {{ activeRow.onlineTime.join(' 至 ') }}</el-descriptions-item><el-descriptions-item label="备用员工">{{ activeRow.backupEnabled ? activeRow.backupEmployeeIds.map(id => employeePool.find(item => item.id === id)?.name).filter(Boolean).join('、') || '未选择' : '未开启' }}</el-descriptions-item><el-descriptions-item label="添加同一员工">{{ activeRow.sameEmployeeEnabled ? '开启' : '关闭' }}</el-descriptions-item><el-descriptions-item label="接量开始">{{ activeRow.receptionStart || '长期有效' }}</el-descriptions-item><el-descriptions-item label="接量结束">{{ activeRow.receptionEnd || '长期有效' }}</el-descriptions-item><el-descriptions-item label="企微标签">{{ activeRow.wecomTags.join('、') || '未配置' }}</el-descriptions-item><el-descriptions-item label="内部标签">{{ activeRow.internalTags.join('、') || '未配置' }}</el-descriptions-item><el-descriptions-item label="扫码数">{{ activeRow.scans.toLocaleString() }}</el-descriptions-item><el-descriptions-item label="加微数">{{ activeRow.added.toLocaleString() }}</el-descriptions-item></el-descriptions>
      <h3 class="detail-title">接待员工</h3><el-table :data="activeRow.employees"><el-table-column prop="name" label="姓名"/><el-table-column prop="no" label="员工编号"/><el-table-column prop="role" label="岗位"/><el-table-column prop="received" label="已接量"/><el-table-column prop="limit" label="轮询上限"/></el-table></template>
    </el-drawer>
  </section>
</template>

<style scoped>
.group-row{display:grid;border:1px solid transparent;border-radius:9px}.group-row.active{border-color:#cfe0fb;background:#f5f9ff}.group-row.active>button{background:#eaf2ff!important;color:var(--qr-blue)!important;font-weight:600}.group-row.active>button em{background:#fff;color:var(--qr-blue)}.group-actions{display:flex;justify-content:flex-end;padding:0 9px 8px}.group-actions :deep(.el-button){width:28px;height:28px;margin:0;border-color:#cbdcf4;color:var(--qr-blue);background:#fff}
.qr-page{--qr-ink:#142541;--qr-blue:#2875e6;--qr-mint:#26b99a}.summary-strip{display:grid;grid-template-columns:repeat(4,150px) 1fr;align-items:center;gap:18px;padding:17px 20px;margin-bottom:14px}.summary-strip>div{padding-right:18px;border-right:1px solid var(--line)}.summary-strip span,.summary-strip b,.summary-strip small{display:block}.summary-strip span{font-size:11px;color:var(--muted)}.summary-strip b{margin-top:4px;font:700 23px Inter,"PingFang SC",sans-serif;color:var(--qr-ink)}.summary-strip small{margin-top:2px;font-size:9px;color:#93a0b1}.summary-strip p{display:flex;align-items:center;gap:9px;justify-self:end;margin:0;color:#647690;font-size:11px}.summary-strip p i{width:7px;height:7px;border-radius:50%;background:var(--qr-mint);box-shadow:0 0 0 5px #26b99a18}.filter-bar{display:grid;grid-template-columns:1.5fr 1fr .8fr auto auto;gap:10px;padding:14px 16px;margin-bottom:14px}.option-status{float:right;color:#97a5b7}.management-layout{display:grid;grid-template-columns:260px minmax(0,1fr);align-items:start;gap:14px}.group-panel{position:sticky;top:12px;overflow:hidden}.group-panel header{height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;border-bottom:1px solid var(--line)}.group-panel header>div{display:flex;align-items:center;gap:8px;color:var(--qr-ink)}.group-panel h3{margin:0;font-size:15px}.group-panel nav{display:grid;gap:6px;padding:10px}.group-panel nav button{width:100%;display:grid;grid-template-columns:20px minmax(0,1fr) auto;align-items:start;gap:8px;padding:11px 10px;border:0;border-radius:7px;background:transparent;color:#5f718a;text-align:left;cursor:pointer;transition:background .18s,color .18s,transform .18s}.group-panel nav button:hover{background:#f2f6fc;color:var(--qr-blue);transform:translateX(2px)}.group-panel nav button:focus-visible{outline:2px solid var(--qr-blue);outline-offset:1px}.group-panel nav button.active{background:#eaf2ff;color:var(--qr-blue);font-weight:600}.group-panel nav button span{overflow-wrap:anywhere;white-space:normal;line-height:1.5}.group-panel nav button em{min-width:24px;padding:2px 6px;border-radius:10px;background:#f0f3f8;color:#8492a5;font-size:10px;font-style:normal;text-align:center}.group-panel nav button.active em{background:#fff;color:var(--qr-blue)}.group-panel>p{margin:0;padding:12px 14px 16px;border-top:1px solid var(--line);color:#98a4b5;font-size:10px;line-height:1.6}.code-list{padding:0 18px 18px;min-width:0}.code-list>header{height:64px;display:flex;align-items:center;justify-content:space-between}.code-list>header div{display:flex;align-items:baseline;gap:10px}.code-list h3{margin:0;color:var(--qr-ink)}.code-list header span{font-size:11px;color:var(--muted)}.qr-thumb,.qr-large{position:relative;overflow:hidden;background:repeating-conic-gradient(#1b3151 0 8%,transparent 0 16%) 0 0/12px 12px,#fff;border:5px solid #fff;box-shadow:0 0 0 1px #cfdaea}.qr-thumb{width:52px;height:52px}.qr-large{width:150px;height:150px;flex:0 0 150px}.qr-thumb i,.qr-large i{position:absolute;inset:25%;background:#fff;border:5px solid var(--qr-blue)}.qr-thumb em,.qr-large em{position:absolute;inset:38%;display:grid;place-items:center;background:var(--qr-blue);color:#fff;font-style:normal;font-weight:700}.code-name b,.code-name>span,.camp-cell b,.camp-cell span{display:block}.code-name b,.camp-cell b{color:var(--qr-ink)}.code-name>span,.camp-cell span{margin-top:5px;color:#8492a5;font-size:11px}.code-name small{display:flex;gap:5px;margin-top:8px}.date-cell{display:flex;align-items:center;gap:7px;font-size:11px;color:#435773}.date-cell i{width:12px;height:1px;background:#a8b7ca}.long-term{color:#76879d;font-size:11px}.capacity-cell>div{display:flex;justify-content:space-between;gap:8px;margin-bottom:8px;font-size:11px}.capacity-cell b{color:var(--qr-blue)}.tag-cell{display:grid;gap:7px}.tag-cell>div{display:grid;grid-template-columns:32px minmax(0,1fr);gap:7px;align-items:start}.tag-cell>div>span{padding-top:3px;color:#8492a5;font-size:9px}.tag-cell p{display:flex;flex-wrap:wrap;gap:4px;margin:0}.tag-cell p em{padding-top:3px;color:#a4afbd;font-size:9px;font-style:normal}.creator-cell b,.creator-cell span{display:block}.creator-cell b{color:var(--qr-ink);font-size:12px}.creator-cell span{margin-top:5px;color:#96a3b4;font-size:9px}.result-cell{display:grid;grid-template-columns:1fr 1fr;gap:4px}.result-cell b{color:var(--qr-ink)}.result-cell span{color:var(--qr-mint)}.drawer-lead{display:flex;flex-direction:column;gap:6px;padding:14px 16px;margin-bottom:18px;border-radius:8px;background:#f4f8fe}.drawer-lead b{color:var(--qr-ink)}.drawer-lead span{font-size:12px;color:#6e8099}.form-section{padding:0 0 20px;margin-bottom:22px;border-bottom:1px solid var(--line)}.form-section h4{margin:0 0 16px;padding-left:10px;border-left:3px solid var(--qr-blue);color:var(--qr-ink)}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}.span-2{grid-column:1/-1}.qr-form :deep(.el-select),.qr-form :deep(.el-date-editor){width:100%}.qr-form :deep(.el-form-item__content>small){margin-top:6px;color:#93a0b1;font-size:10px}.optional{padding:2px 6px;margin-left:6px;border-radius:8px;background:#eef2f7;color:#7b899c;font-size:9px;font-style:normal}.employee-config-list{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}.employee-config{display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:10px;padding:12px;border:1px solid #dce6f4;border-radius:8px}.employee-config>i{width:38px;height:38px;display:grid;place-items:center;border-radius:8px;background:#eaf2ff;color:var(--qr-blue);font-style:normal;font-weight:700}.employee-config span b,.employee-config span small{display:block}.employee-config span small{margin-top:3px;color:#8a99ac;font-size:9px}.employee-config label{display:grid;grid-template-columns:auto auto;align-items:center;gap:8px;color:#75859a;font-size:10px}.employee-config label :deep(.el-input-number){width:88px}.employee-config>em{grid-column:2/4;color:#8c9bad;font-size:9px;font-style:normal}.detail-hero{display:flex;gap:24px;align-items:center;padding:24px;margin-bottom:22px;border-radius:12px;background:#f3f7fd}.detail-hero h2{margin:10px 0 5px;color:var(--qr-ink)}.detail-hero p{margin:0 0 18px;color:#7b8ca2}.detail-title{margin:26px 0 12px;color:var(--qr-ink)}@media(max-width:1300px){.summary-strip{grid-template-columns:repeat(4,1fr)}.summary-strip p{grid-column:1/-1;justify-self:start}.management-layout{grid-template-columns:220px minmax(0,1fr)}.employee-config-list{grid-template-columns:1fr}}@media(max-width:980px){.management-layout{grid-template-columns:1fr}.group-panel{position:static}.group-panel nav{display:flex;overflow-x:auto}.group-panel nav button{min-width:180px}.group-panel>p{display:none}}
.wecom-scope{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:18px 20px;margin-bottom:14px;border-left:4px solid var(--qr-blue)}.wecom-scope-copy{display:flex;align-items:center;gap:13px}.wecom-scope-copy>i{width:42px;height:42px;display:grid;place-items:center;border-radius:10px;background:#eaf2ff;color:var(--qr-blue);font-style:normal;font-weight:700}.wecom-scope-copy span,.wecom-scope-copy small,.wecom-scope-copy b,.wecom-scope-copy code{display:block}.wecom-scope-copy small{color:#8a99ad}.wecom-scope-copy b{margin-top:3px;color:var(--qr-ink);font-size:16px}.wecom-scope-copy code{margin-top:3px;color:#69809d}.wecom-scope-action{display:grid;grid-template-columns:auto 360px;align-items:center;gap:5px 12px}.wecom-scope-action>span{color:#435773;font-weight:600}.wecom-scope-action>small{grid-column:2;color:#8a99ad}.corp-option{display:flex;align-items:center;justify-content:space-between;gap:20px}.corp-option span,.corp-option b,.corp-option small{display:block}.corp-option small{margin-top:2px;color:#8b99ab;font-size:10px}@media(max-width:980px){.wecom-scope{align-items:flex-start;flex-direction:column}.wecom-scope-action{width:100%;grid-template-columns:1fr}.wecom-scope-action>small{grid-column:1}.wecom-scope-action :deep(.el-select){width:100%}}
.ip-binding-cell b,.ip-binding-cell code,.ip-binding-cell span{display:block}.ip-binding-cell b{color:var(--qr-ink)}.ip-binding-cell code{width:max-content;margin-top:4px;padding:2px 6px;border-radius:4px;background:#edf3fc;color:#57708f;font-size:9px}.ip-binding-cell span{margin-top:6px;color:var(--qr-blue);font-size:10px}
.switch-field{display:flex;align-items:center;gap:10px}.switch-field span{color:#61738c;font-size:12px}
.schedule-editor{display:grid;grid-template-columns:1fr 1fr;gap:0 16px;padding:16px;margin:2px 0 18px;border:1px solid #dbe7f5;border-radius:9px;background:#f8fbff}.schedule-fallback-tip,.fallback-schedule,.schedule-editor h5,.schedule-editor .el-form-item:first-of-type{grid-column:1/-1}.schedule-fallback-tip{margin-bottom:12px}.fallback-schedule{padding:14px;margin-bottom:15px;border:1px solid #cfe4dc;border-radius:8px;background:#f4fbf8}.fallback-schedule header{display:flex;align-items:center;gap:9px;margin-bottom:12px}.fallback-schedule header b{color:#244c42}.fallback-schedule dl{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:12px;margin:0}.fallback-schedule dl div{padding:9px 10px;border-radius:7px;background:#fff}.fallback-schedule dt{margin-bottom:5px;color:#8a9b97;font-size:10px}.fallback-schedule dd{margin:0;color:#34584f;font-size:12px}.schedule-editor h5{margin:0 0 13px;color:#334a68;font-size:13px}.weekday-selector{display:flex;flex-wrap:wrap;gap:8px 14px}.weekday-selector :deep(.el-checkbox){margin-right:0}.schedule-editor :deep(.el-date-editor){width:100%}
</style>
