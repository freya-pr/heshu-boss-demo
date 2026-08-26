<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, EditPen, Folder, FolderOpened, Plus, Search, View } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'

type Employee = { id: number; name: string; no: string; role: string; limit: number; received: number }
type IpBinding = { ipNo: string; name: string; category: string; channelCode: string; channelName?: string; status: '启用' | '停用' }
type LiveCode = {
  id: number; codeNo: string; name: string; type: '多人活码' | '单人活码'; campId?: number; campName?: string;
  groupId: number; groupName: string;
  ipNo?: string; ipName?: string; ipChannelCode?: string; ipChannelName?: string;
  classId?: number; className?: string; receptionStart: string; receptionEnd: string; status: '启用' | '停用' | '待生效' | '已结束';
  employees: Employee[]; wecomTags: string[]; internalTags: string[]; scans: number; added: number; creatorName: string; createdAt: string
}

type LiveCodeGroup = { id: number; name: string }

const camps = [
  { id: 301, name: '2026 暑期第 3 营', status: '进行中' },
  { id: 302, name: '2026 暑期第 2 营', status: '已结束' },
  { id: 303, name: '2026 秋季体验营', status: '未开始' }
]
const classes = [
  { id: 501, campId: 301, name: '暑期三营 · 一转一班' }, { id: 502, campId: 301, name: '暑期三营 · 一转二班' },
  { id: 503, campId: 302, name: '暑期二营 · 体验班' }, { id: 504, campId: 303, name: '秋季体验营 · A班' }
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
  { id: 1, codeNo: 'QR20260818001', name: '暑期三营 · 抖音一转', type: '多人活码', groupId: 2, groupName: '一转活码', ipNo: 'IP000001', ipName: '阿留皮皮', ipChannelCode: 'CH000002', ipChannelName: '阿留专属', campId: 301, campName: '2026 暑期第 3 营', classId: 501, className: '暑期三营 · 一转一班', receptionStart: '2026-08-12', receptionEnd: '2026-08-31', status: '启用', employees: employeePool.slice(0, 4).map(item => ({ ...item })), wecomTags: ['暑期三营', '抖音新客'], internalTags: ['一转', '重点跟进'], scans: 2846, added: 1972, creatorName: '张铭钰', createdAt: '2026-08-10 10:20' },
  { id: 2, codeNo: 'QR20260818002', name: '暑期三营 · 有赞承接', type: '多人活码', groupId: 2, groupName: '一转活码', ipNo: 'IP000001', ipName: '阿留皮皮', ipChannelCode: 'CH000002', ipChannelName: '阿留专属', campId: 301, campName: '2026 暑期第 3 营', receptionStart: '2026-08-15', receptionEnd: '2026-09-05', status: '启用', employees: employeePool.slice(1, 4).map(item => ({ ...item, limit: item.limit + 5 })), wecomTags: ['暑期三营'], internalTags: ['有赞', '一转'], scans: 1638, added: 1024, creatorName: '陈庆焕', createdAt: '2026-08-12 14:08' },
  { id: 3, codeNo: 'QR20260818003', name: '秋季体验营 · 预热', type: '多人活码', groupId: 4, groupName: '体验课班主任活码', ipNo: 'IP000002', ipName: '周老师', ipChannelCode: 'CH000001', ipChannelName: '店播', campId: 303, campName: '2026 秋季体验营', classId: 504, className: '秋季体验营 · A班', receptionStart: '2026-09-01', receptionEnd: '2026-09-20', status: '待生效', employees: employeePool.slice(0, 2).map(item => ({ ...item, received: 0 })), wecomTags: ['秋季体验营'], internalTags: ['预热', '班主任'], scans: 0, added: 0, creatorName: '张铭钰', createdAt: '2026-08-17 09:30' },
  { id: 4, codeNo: 'QR20260715001', name: '暑期二营 · 历史承接', type: '单人活码', groupId: 1, groupName: '默认分组', ipNo: 'IP000002', ipName: '周老师', ipChannelCode: 'CH000001', ipChannelName: '店播', campId: 302, campName: '2026 暑期第 2 营', classId: 503, className: '暑期二营 · 体验班', receptionStart: '2026-07-15', receptionEnd: '2026-08-10', status: '已结束', employees: [{ ...employeePool[4], limit: 60, received: 54 }], wecomTags: ['暑期二营'], internalTags: ['历史营期'], scans: 1240, added: 886, creatorName: '系统迁移', createdAt: '2026-07-12 16:45' }
])

const query = reactive({ keyword: '', campId: '', status: '' })
const selectedGroupId = ref<'all' | number>('all')
const drawerVisible = ref(false)
const detailVisible = ref(false)
const editingId = ref<number | null>(null)
const activeRow = ref<LiveCode | null>(null)
const form = reactive({ name: '', type: '多人活码' as LiveCode['type'], groupId: 1, ipNo: '' as string, campId: undefined as number | undefined, classId: undefined as number | undefined, receptionRange: [] as string[], employeeIds: [] as number[], wecomTags: [] as string[], internalTags: [] as string[], status: '启用' as LiveCode['status'] })

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

const filteredRows = computed(() => rows.value.filter(row => {
  const keyword = query.keyword.trim().toLowerCase()
  return (!keyword || `${row.name}${row.codeNo}${row.ipName || ''}${row.ipNo || ''}${row.ipChannelName || ''}${row.employees.map(item => item.name).join('')}`.toLowerCase().includes(keyword))
    && (selectedGroupId.value === 'all' || row.groupId === selectedGroupId.value)
    && (!query.campId || row.campId === Number(query.campId)) && (!query.status || row.status === query.status)
}))
const classOptions = computed(() => classes.filter(item => item.campId === form.campId))
const activeIpOptions = computed(() => ipOptions.value.filter(item => item.status === '启用' || item.ipNo === form.ipNo))
const selectedIp = computed(() => ipOptions.value.find(item => item.ipNo === form.ipNo))
const selectedEmployees = computed(() => form.employeeIds.map(id => employeePool.find(item => item.id === id)).filter(Boolean) as Employee[])
const summary = computed(() => ({
  total: rows.value.length,
  active: rows.value.filter(item => item.status === '启用').length,
  capacity: rows.value.filter(item => item.status === '启用').reduce((sum, row) => sum + row.employees.reduce((n, item) => n + item.limit, 0), 0),
  received: rows.value.reduce((sum, row) => sum + row.employees.reduce((n, item) => n + item.received, 0), 0)
}))

function resetForm() { Object.assign(form, { name: '', type: '多人活码', groupId: selectedGroupId.value === 'all' ? 1 : selectedGroupId.value, ipNo: '', campId: undefined, classId: undefined, receptionRange: [], employeeIds: [], wecomTags: [], internalTags: [], status: '启用' }) }
function openCreate() { loadIpBindings(); editingId.value = null; resetForm(); drawerVisible.value = true }
function openEdit(row: LiveCode) {
  loadIpBindings()
  editingId.value = row.id
  Object.assign(form, { name: row.name, type: row.type, groupId: row.groupId, ipNo: row.ipNo || '', campId: row.campId, classId: row.classId, receptionRange: [row.receptionStart, row.receptionEnd].filter(Boolean), employeeIds: row.employees.map(item => item.id), wecomTags: [...row.wecomTags], internalTags: [...row.internalTags], status: row.status })
  drawerVisible.value = true
}
function onCampChange() { if (!classOptions.value.some(item => item.id === form.classId)) form.classId = undefined }
function updateLimit(employeeId: number, value: number | undefined) { const item = employeePool.find(employee => employee.id === employeeId); if (item) item.limit = Number(value || 0) }
function save() {
  if (!form.name.trim()) return ElMessage.warning('请输入活码名称')
  if (!form.groupId) return ElMessage.warning('请选择活码分组')
  if (!form.employeeIds.length) return ElMessage.warning('请至少选择一名接待员工')
  const camp = camps.find(item => item.id === form.campId)
  const group = groups.value.find(item => item.id === form.groupId)!
  const classItem = classes.find(item => item.id === form.classId)
  const ip = selectedIp.value
  const ipBinding = { ipNo: ip?.ipNo, ipName: ip?.name, ipChannelCode: ip?.channelCode, ipChannelName: ip?.channelName || (ip ? ipChannelNames[ip.channelCode] : undefined) }
  const employees = selectedEmployees.value.map(item => ({ ...item }))
  const today = new Date().toISOString().slice(0, 10)
  const hasReceptionRange = form.receptionRange.length === 2
  const dateStatus: LiveCode['status'] = !hasReceptionRange ? '启用' : form.receptionRange[1] < today ? '已结束' : form.receptionRange[0] > today ? '待生效' : '启用'
  if (editingId.value) {
    const target = rows.value.find(item => item.id === editingId.value)!
    Object.assign(target, { ...form, ...ipBinding, status: target.status === '停用' ? '停用' : dateStatus, groupName: group.name, campName: camp?.name, className: classItem?.name, receptionStart: form.receptionRange[0] || '', receptionEnd: form.receptionRange[1] || '', employees })
    ElMessage.success('活码配置已更新')
  } else {
    rows.value.unshift({ id: Date.now(), codeNo: `QR${Date.now().toString().slice(-11)}`, name: form.name, type: form.type, groupId: group.id, groupName: group.name, ...ipBinding, campId: camp?.id, campName: camp?.name, classId: classItem?.id, className: classItem?.name, receptionStart: form.receptionRange[0] || '', receptionEnd: form.receptionRange[1] || '', status: dateStatus, employees, wecomTags: [...form.wecomTags], internalTags: [...form.internalTags], scans: 0, added: 0, creatorName: '林校长', createdAt: new Date().toLocaleString('zh-CN', { hour12: false }) })
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
function groupCount(groupId: number) { return rows.value.filter(item => item.groupId === groupId).length }
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
</script>

<template>
  <section class="page qr-page">
    <PageHeader title="活码管理" description="统一控制轮询名单、员工容量，以及 IP 与渠道维度的扫码加微归因。">
      <el-button :icon="Download">导出接量情况</el-button><el-button type="primary" :icon="Plus" @click="openCreate">新建活码</el-button>
    </PageHeader>

    <div class="summary-strip surface">
      <div><span>活码总数</span><b>{{ summary.total }}</b></div><div><span>启用中</span><b>{{ summary.active }}</b></div>
      <div><span>轮询容量</span><b>{{ summary.capacity }}</b><small>仅约束自动轮询</small></div><div><span>当前已接量</span><b>{{ summary.received }}</b><small>未转化线索</small></div>
      <p><i></i><span>人工指定不受营期名单和接量上限限制；接量上限仅用于轮询资格判断。</span></p>
    </div>

    <div class="filter-bar surface">
      <el-input v-model="query.keyword" clearable :prefix-icon="Search" placeholder="搜索活码、IP、渠道或员工" />
      <el-select v-model="query.campId" clearable filterable placeholder="所属营期"><el-option v-for="item in camps" :key="item.id" :label="item.name" :value="item.id"><span>{{ item.name }}</span><small class="option-status">{{ item.status }}</small></el-option></el-select>
      <el-select v-model="query.status" clearable placeholder="活码状态"><el-option v-for="item in ['启用','待生效','停用','已结束']" :key="item" :label="item" :value="item" /></el-select>
      <el-button type="primary">查询</el-button><el-button @click="resetQuery">重置</el-button>
    </div>

    <div class="management-layout">
    <aside class="group-panel surface">
      <header><div><el-icon><FolderOpened /></el-icon><h3>活码分组</h3></div><el-button link type="primary" :icon="Plus" @click="addGroup">新增分组</el-button></header>
      <nav aria-label="活码分组筛选">
        <button :class="{ active: selectedGroupId === 'all' }" @click="selectedGroupId = 'all'"><el-icon><FolderOpened /></el-icon><span>全部活码</span><em>{{ rows.length }}</em></button>
        <button v-for="group in groups" :key="group.id" :class="{ active: selectedGroupId === group.id }" @click="selectedGroupId = group.id"><el-icon><Folder /></el-icon><span>{{ group.name }}</span><em>{{ groupCount(group.id) }}</em></button>
      </nav>
      <p>选择分组后，右侧仅展示该分组下的活码。</p>
    </aside>

    <article class="code-list surface">
      <header><div><h3>活码列表</h3><span>共 {{ filteredRows.length }} 条</span></div></header>
      <el-table :data="filteredRows" row-key="id">
        <el-table-column label="活码" width="94"><template #default="{ row }"><div class="qr-thumb"><i></i><em>{{ row.type === '多人活码' ? '多' : '单' }}</em></div></template></el-table-column>
        <el-table-column label="活码信息" min-width="220"><template #default="{ row }"><div class="code-name"><b>{{ row.name }}</b><span>{{ row.codeNo }} · {{ row.type }}</span><small><el-tag size="small" effect="plain">{{ row.groupName }}</el-tag></small></div></template></el-table-column>
        <el-table-column label="关联IP / IP渠道" min-width="190"><template #default="{ row }"><div class="ip-binding-cell"><b>{{ row.ipName || '未关联IP' }}</b><code v-if="row.ipNo">{{ row.ipNo }}</code><span>{{ row.ipChannelName || '未自动带出渠道' }}<template v-if="row.ipChannelCode"> · {{ row.ipChannelCode }}</template></span></div></template></el-table-column>
        <el-table-column label="所属营期 / 班级" min-width="230"><template #default="{ row }"><div class="camp-cell"><b>{{ row.campName || '通用活码' }}</b><span>{{ row.className || '未关联班级' }}</span></div></template></el-table-column>
        <el-table-column label="接量日期区间" width="190"><template #default="{ row }"><div v-if="row.receptionStart && row.receptionEnd" class="date-cell"><b>{{ row.receptionStart }}</b><i></i><b>{{ row.receptionEnd }}</b></div><span v-else class="long-term">长期有效</span></template></el-table-column>
        <el-table-column label="接待员工 / 容量" min-width="230"><template #default="{ row }"><div class="capacity-cell"><div><span>{{ row.employees.slice(0, 3).map((item: Employee) => item.name).join('、') }}<template v-if="row.employees.length > 3"> 等{{ row.employees.length }}人</template></span><b>{{ row.employees.reduce((n: number, item: Employee) => n + item.received, 0) }} / {{ row.employees.reduce((n: number, item: Employee) => n + item.limit, 0) }}</b></div><el-progress :percentage="capacityRate(row)" :show-text="false" :stroke-width="6" /></div></template></el-table-column>
        <el-table-column label="活码标签" min-width="230"><template #default="{ row }"><div class="tag-cell"><div><span>企微</span><p><el-tag v-for="tag in row.wecomTags" :key="`wecom-${tag}`" size="small" type="success" effect="light">{{ tag }}</el-tag><em v-if="!row.wecomTags.length">未配置</em></p></div><div><span>内部</span><p><el-tag v-for="tag in row.internalTags" :key="`internal-${tag}`" size="small" effect="plain">{{ tag }}</el-tag><em v-if="!row.internalTags.length">未配置</em></p></div></div></template></el-table-column>
        <el-table-column label="创建人" width="115"><template #default="{ row }"><div class="creator-cell"><b>{{ row.creatorName }}</b><span>{{ row.createdAt.slice(0, 10) }}</span></div></template></el-table-column>
        <el-table-column label="扫码 / 加微" width="125"><template #default="{ row }"><div class="result-cell"><b>{{ row.scans.toLocaleString() }}</b><span>{{ row.added.toLocaleString() }}</span></div></template></el-table-column>
        <el-table-column label="状态" width="95"><template #default="{ row }"><el-tag :type="statusType(row.status)" effect="light">{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="235" fixed="right"><template #default="{ row }"><el-button link type="primary" :icon="View" @click="showDetail(row)">详情</el-button><el-button link type="primary" :icon="EditPen" @click="openEdit(row)">编辑</el-button><el-button link type="primary" :icon="Download" @click="download(row)">下载</el-button><el-dropdown trigger="click"><el-button link type="primary">更多⌄</el-button><template #dropdown><el-dropdown-menu><el-dropdown-item @click="toggleStatus(row)">{{ row.status === '启用' ? '停用活码' : '启用活码' }}</el-dropdown-item><el-dropdown-item @click="ElMessage.success('短链已复制')">复制短链</el-dropdown-item><el-dropdown-item @click="ElMessage.info('已进入使用明细')">使用明细</el-dropdown-item></el-dropdown-menu></template></el-dropdown></template></el-table-column>
      </el-table>
      <el-empty v-if="!filteredRows.length" description="没有符合条件的活码，可调整筛选条件或新建活码" />
    </article>
    </div>

    <el-drawer v-model="drawerVisible" :title="editingId ? '编辑活码' : '新建活码'" size="760px" class="qr-config-drawer">
      <div class="drawer-lead"><b>活码接量配置</b><span>营期、班级和接量日期均用于限定业务归属与轮询范围，可按实际场景选填。</span></div>
      <el-form label-position="top" class="qr-form">
        <div class="form-section"><h4>基础信息</h4><div class="form-grid">
          <el-form-item label="活码名称" required><el-input v-model="form.name" maxlength="30" show-word-limit placeholder="例如：暑期三营 · 抖音一转" /></el-form-item>
          <el-form-item label="活码类型" required><el-radio-group v-model="form.type"><el-radio-button value="多人活码">多人活码</el-radio-button><el-radio-button value="单人活码">单人活码</el-radio-button></el-radio-group></el-form-item>
          <el-form-item label="活码分组" required><el-select v-model="form.groupId" placeholder="选择活码分组"><el-option v-for="item in groups" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
          <el-form-item><template #label>关联IP <em class="optional">选填</em></template><el-select v-model="form.ipNo" clearable filterable placeholder="搜索IP名称或IP编号"><el-option v-for="item in activeIpOptions" :key="item.ipNo" :label="`${item.name} · ${item.ipNo}`" :value="item.ipNo"><span>{{ item.name }}</span><small class="option-status">{{ item.ipNo }}</small></el-option></el-select><small>数据来源：线索中心－IP列表－IP配置；未关联时按通用活码保存。</small></el-form-item>
          <el-form-item label="IP渠道"><el-input :model-value="selectedIp ? `${selectedIp.channelName || ipChannelNames[selectedIp.channelCode] || '未配置渠道'} · ${selectedIp.channelCode}` : ''" readonly placeholder="选择关联IP后自动带出" /><small>由IP配置自动带出，活码内不可单独修改，避免归因口径不一致。</small></el-form-item>
          <el-form-item><template #label>所属营期 <em class="optional">选填</em></template><el-select v-model="form.campId" clearable filterable placeholder="从营期库选择" @change="onCampChange"><el-option v-for="item in camps" :key="item.id" :label="item.name" :value="item.id" /></el-select><small>不选择时按通用活码保存；V1.0 使用外部/历史系统同步的只读营期库，V2.0 后由交付中心统一维护。</small></el-form-item>
          <el-form-item><template #label>所属班级 <em class="optional">选填</em></template><el-select v-model="form.classId" clearable filterable :disabled="!form.campId" placeholder="选择所属营期后可选班级"><el-option v-for="item in classOptions" :key="item.id" :label="item.name" :value="item.id" /></el-select><small>不选择班级时，活码仅归属营期。</small></el-form-item>
          <el-form-item class="span-2"><template #label>接量日期区间 <em class="optional">选填</em></template><el-date-picker v-model="form.receptionRange" clearable type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始接量日期" end-placeholder="结束接量日期" /><small>不设置时长期有效；设置后仅在该区间内参与轮询，结束后自动标记“已结束”。</small></el-form-item>
        </div></div>
        <div class="form-section"><h4>接待员工与轮询容量</h4><el-form-item label="接待员工" required><el-select v-model="form.employeeIds" multiple filterable collapse-tags :max-collapse-tags="3" placeholder="搜索员工姓名或员工编号"><el-option v-for="item in employeePool" :key="item.id" :label="`${item.name} · ${item.no}`" :value="item.id" /></el-select></el-form-item>
          <div class="employee-config-list"><div v-for="item in selectedEmployees" :key="item.id" class="employee-config"><i>{{ item.name.slice(0,1) }}</i><span><b>{{ item.name }}</b><small>{{ item.no }} · {{ item.role }}</small></span><label>轮询接量上限<el-input-number :model-value="item.limit" :min="1" :max="999" controls-position="right" @change="(value: number | undefined) => updateLimit(item.id, value)" /></label><em>当前 {{ item.received }}</em></div><el-empty v-if="!selectedEmployees.length" :image-size="58" description="选择员工后可配置每人的轮询接量上限" /></div>
          <el-alert :closable="false" type="info" show-icon title="容量规则" description="达到接量上限的员工自动退出本营期轮询；管理员人工指定仍可选择该员工。" />
        </div>
        <div class="form-section"><h4>客户标记</h4><div class="form-grid"><el-form-item label="企微标签"><el-select v-model="form.wecomTags" multiple allow-create filterable default-first-option placeholder="选择或输入企微标签"><el-option v-for="item in ['暑期三营','秋季体验营','抖音新客','已加微']" :key="item" :label="item" :value="item" /></el-select><small>客户扫码添加成功后同步写入企业微信。</small></el-form-item><el-form-item label="内部标签"><el-select v-model="form.internalTags" multiple allow-create filterable default-first-option placeholder="选择或输入内部标签"><el-option v-for="item in ['一转','重点跟进','有赞','班主任','历史营期']" :key="item" :label="item" :value="item" /></el-select><small>仅在合数 BOSS 内用于筛选、运营与数据分析。</small></el-form-item></div></div>
      </el-form>
      <template #footer><el-button @click="drawerVisible=false">取消</el-button><el-button type="primary" @click="save">{{ editingId ? '保存修改' : '创建活码' }}</el-button></template>
    </el-drawer>

    <el-drawer v-model="detailVisible" title="活码详情" size="680px">
      <template v-if="activeRow"><div class="detail-hero"><div class="qr-large"><i></i><em>合</em></div><div><el-tag :type="statusType(activeRow.status)">{{ activeRow.status }}</el-tag><h2>{{ activeRow.name }}</h2><p>{{ activeRow.codeNo }} · {{ activeRow.type }}</p><el-button type="primary" :icon="Download" @click="download(activeRow)">下载活码</el-button></div></div>
      <el-descriptions :column="2" border><el-descriptions-item label="活码分组">{{ activeRow.groupName }}</el-descriptions-item><el-descriptions-item label="创建人">{{ activeRow.creatorName }}</el-descriptions-item><el-descriptions-item label="关联IP">{{ activeRow.ipName ? `${activeRow.ipName} · ${activeRow.ipNo}` : '未关联' }}</el-descriptions-item><el-descriptions-item label="IP渠道">{{ activeRow.ipChannelName ? `${activeRow.ipChannelName} · ${activeRow.ipChannelCode}` : '未配置' }}</el-descriptions-item><el-descriptions-item label="所属营期">{{ activeRow.campName || '未关联（通用活码）' }}</el-descriptions-item><el-descriptions-item label="所属班级">{{ activeRow.className || '未关联' }}</el-descriptions-item><el-descriptions-item label="接量开始">{{ activeRow.receptionStart || '长期有效' }}</el-descriptions-item><el-descriptions-item label="接量结束">{{ activeRow.receptionEnd || '长期有效' }}</el-descriptions-item><el-descriptions-item label="企微标签">{{ activeRow.wecomTags.join('、') || '未配置' }}</el-descriptions-item><el-descriptions-item label="内部标签">{{ activeRow.internalTags.join('、') || '未配置' }}</el-descriptions-item><el-descriptions-item label="扫码数">{{ activeRow.scans.toLocaleString() }}</el-descriptions-item><el-descriptions-item label="加微数">{{ activeRow.added.toLocaleString() }}</el-descriptions-item></el-descriptions>
      <h3 class="detail-title">接待员工</h3><el-table :data="activeRow.employees"><el-table-column prop="name" label="姓名"/><el-table-column prop="no" label="员工编号"/><el-table-column prop="role" label="岗位"/><el-table-column prop="received" label="已接量"/><el-table-column prop="limit" label="轮询上限"/></el-table></template>
    </el-drawer>
  </section>
</template>

<style scoped>
.qr-page{--qr-ink:#142541;--qr-blue:#2875e6;--qr-mint:#26b99a}.summary-strip{display:grid;grid-template-columns:repeat(4,150px) 1fr;align-items:center;gap:18px;padding:17px 20px;margin-bottom:14px}.summary-strip>div{padding-right:18px;border-right:1px solid var(--line)}.summary-strip span,.summary-strip b,.summary-strip small{display:block}.summary-strip span{font-size:11px;color:var(--muted)}.summary-strip b{margin-top:4px;font:700 23px Inter,"PingFang SC",sans-serif;color:var(--qr-ink)}.summary-strip small{margin-top:2px;font-size:9px;color:#93a0b1}.summary-strip p{display:flex;align-items:center;gap:9px;justify-self:end;margin:0;color:#647690;font-size:11px}.summary-strip p i{width:7px;height:7px;border-radius:50%;background:var(--qr-mint);box-shadow:0 0 0 5px #26b99a18}.filter-bar{display:grid;grid-template-columns:1.5fr 1fr .8fr auto auto;gap:10px;padding:14px 16px;margin-bottom:14px}.option-status{float:right;color:#97a5b7}.management-layout{display:grid;grid-template-columns:230px minmax(0,1fr);align-items:start;gap:14px}.group-panel{position:sticky;top:12px;overflow:hidden}.group-panel header{height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;border-bottom:1px solid var(--line)}.group-panel header>div{display:flex;align-items:center;gap:8px;color:var(--qr-ink)}.group-panel h3{margin:0;font-size:15px}.group-panel nav{display:grid;gap:4px;padding:10px}.group-panel nav button{width:100%;display:grid;grid-template-columns:20px minmax(0,1fr) auto;align-items:center;gap:8px;padding:11px 10px;border:0;border-radius:7px;background:transparent;color:#5f718a;text-align:left;cursor:pointer;transition:background .18s,color .18s,transform .18s}.group-panel nav button:hover{background:#f2f6fc;color:var(--qr-blue);transform:translateX(2px)}.group-panel nav button:focus-visible{outline:2px solid var(--qr-blue);outline-offset:1px}.group-panel nav button.active{background:#eaf2ff;color:var(--qr-blue);font-weight:600}.group-panel nav button span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.group-panel nav button em{min-width:24px;padding:2px 6px;border-radius:10px;background:#f0f3f8;color:#8492a5;font-size:10px;font-style:normal;text-align:center}.group-panel nav button.active em{background:#fff;color:var(--qr-blue)}.group-panel>p{margin:0;padding:12px 14px 16px;border-top:1px solid var(--line);color:#98a4b5;font-size:10px;line-height:1.6}.code-list{padding:0 18px 18px;min-width:0}.code-list>header{height:64px;display:flex;align-items:center;justify-content:space-between}.code-list>header div{display:flex;align-items:baseline;gap:10px}.code-list h3{margin:0;color:var(--qr-ink)}.code-list header span{font-size:11px;color:var(--muted)}.qr-thumb,.qr-large{position:relative;overflow:hidden;background:repeating-conic-gradient(#1b3151 0 8%,transparent 0 16%) 0 0/12px 12px,#fff;border:5px solid #fff;box-shadow:0 0 0 1px #cfdaea}.qr-thumb{width:52px;height:52px}.qr-large{width:150px;height:150px;flex:0 0 150px}.qr-thumb i,.qr-large i{position:absolute;inset:25%;background:#fff;border:5px solid var(--qr-blue)}.qr-thumb em,.qr-large em{position:absolute;inset:38%;display:grid;place-items:center;background:var(--qr-blue);color:#fff;font-style:normal;font-weight:700}.code-name b,.code-name>span,.camp-cell b,.camp-cell span{display:block}.code-name b,.camp-cell b{color:var(--qr-ink)}.code-name>span,.camp-cell span{margin-top:5px;color:#8492a5;font-size:11px}.code-name small{display:flex;gap:5px;margin-top:8px}.date-cell{display:flex;align-items:center;gap:7px;font-size:11px;color:#435773}.date-cell i{width:12px;height:1px;background:#a8b7ca}.long-term{color:#76879d;font-size:11px}.capacity-cell>div{display:flex;justify-content:space-between;gap:8px;margin-bottom:8px;font-size:11px}.capacity-cell b{color:var(--qr-blue)}.tag-cell{display:grid;gap:7px}.tag-cell>div{display:grid;grid-template-columns:32px minmax(0,1fr);gap:7px;align-items:start}.tag-cell>div>span{padding-top:3px;color:#8492a5;font-size:9px}.tag-cell p{display:flex;flex-wrap:wrap;gap:4px;margin:0}.tag-cell p em{padding-top:3px;color:#a4afbd;font-size:9px;font-style:normal}.creator-cell b,.creator-cell span{display:block}.creator-cell b{color:var(--qr-ink);font-size:12px}.creator-cell span{margin-top:5px;color:#96a3b4;font-size:9px}.result-cell{display:grid;grid-template-columns:1fr 1fr;gap:4px}.result-cell b{color:var(--qr-ink)}.result-cell span{color:var(--qr-mint)}.drawer-lead{display:flex;flex-direction:column;gap:6px;padding:14px 16px;margin-bottom:18px;border-radius:8px;background:#f4f8fe}.drawer-lead b{color:var(--qr-ink)}.drawer-lead span{font-size:12px;color:#6e8099}.form-section{padding:0 0 20px;margin-bottom:22px;border-bottom:1px solid var(--line)}.form-section h4{margin:0 0 16px;padding-left:10px;border-left:3px solid var(--qr-blue);color:var(--qr-ink)}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}.span-2{grid-column:1/-1}.qr-form :deep(.el-select),.qr-form :deep(.el-date-editor){width:100%}.qr-form :deep(.el-form-item__content>small){margin-top:6px;color:#93a0b1;font-size:10px}.optional{padding:2px 6px;margin-left:6px;border-radius:8px;background:#eef2f7;color:#7b899c;font-size:9px;font-style:normal}.employee-config-list{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}.employee-config{display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:10px;padding:12px;border:1px solid #dce6f4;border-radius:8px}.employee-config>i{width:38px;height:38px;display:grid;place-items:center;border-radius:8px;background:#eaf2ff;color:var(--qr-blue);font-style:normal;font-weight:700}.employee-config span b,.employee-config span small{display:block}.employee-config span small{margin-top:3px;color:#8a99ac;font-size:9px}.employee-config label{display:grid;grid-template-columns:auto auto;align-items:center;gap:8px;color:#75859a;font-size:10px}.employee-config label :deep(.el-input-number){width:88px}.employee-config>em{grid-column:2/4;color:#8c9bad;font-size:9px;font-style:normal}.detail-hero{display:flex;gap:24px;align-items:center;padding:24px;margin-bottom:22px;border-radius:12px;background:#f3f7fd}.detail-hero h2{margin:10px 0 5px;color:var(--qr-ink)}.detail-hero p{margin:0 0 18px;color:#7b8ca2}.detail-title{margin:26px 0 12px;color:var(--qr-ink)}@media(max-width:1300px){.summary-strip{grid-template-columns:repeat(4,1fr)}.summary-strip p{grid-column:1/-1;justify-self:start}.management-layout{grid-template-columns:190px minmax(0,1fr)}.employee-config-list{grid-template-columns:1fr}}@media(max-width:980px){.management-layout{grid-template-columns:1fr}.group-panel{position:static}.group-panel nav{display:flex;overflow-x:auto}.group-panel nav button{min-width:150px}.group-panel>p{display:none}}
.ip-binding-cell b,.ip-binding-cell code,.ip-binding-cell span{display:block}.ip-binding-cell b{color:var(--qr-ink)}.ip-binding-cell code{width:max-content;margin-top:4px;padding:2px 6px;border-radius:4px;background:#edf3fc;color:#57708f;font-size:9px}.ip-binding-cell span{margin-top:6px;color:var(--qr-blue);font-size:10px}
</style>
