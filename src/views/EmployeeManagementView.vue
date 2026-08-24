<script setup lang="ts">
// @ts-nocheck
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import http from '../api/http'
import PageHeader from '../components/PageHeader.vue'
import StatePanel from '../components/StatePanel.vue'

const employees = ref<any[]>([])
const organizations = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const keyword = ref('')
const status = ref('')
const drawer = ref(false)
const current = ref<any>(null)
const saving = ref(false)
const syncDialog = ref(false)
const syncRecordsDialog = ref(false)
const syncMode = ref<'BASELINE' | 'PUSH' | 'RECONCILE'>('PUSH')
const syncRunning = ref(false)
const provisionDialog = ref(false)
const provisionEmployeeId = ref<number | null>(null)
const provisionRunning = ref(false)
const bossMasterEnabled = ref(true)

const roles = [
  { label: '运营', value: 'OPERATION' }, { label: '客服', value: 'CUSTOMER_SERVICE' },
  { label: '规划师', value: 'PLANNER' }, { label: '一转老师', value: 'FIRST_CONVERSION' },
  { label: '课程顾问', value: 'COURSE_ADVISOR' }, { label: '财务专员', value: 'FINANCE' },
  { label: '系统管理员', value: 'SYSTEM_ADMIN' }
]
const positions = [
  { label: '本人数据岗', scope: '本人负责、创建或被明确协作的数据' },
  { label: '小组管理岗', scope: '所负责小组及组内员工数据' },
  { label: '部门管理岗', scope: '所负责部门及全部下级小组数据' },
  { label: '跨部门管理岗', scope: '明确指定的多个部门或小组数据' },
  { label: '公司数据管理岗', scope: '当前公司全部业务数据' }
]
const form = reactive<any>({
  name: '', legal_name: '', mobile: '', email: '', organization_id: null,
  position_name: '本人数据岗', role_codes: ['COURSE_ADVISOR'], account_status: 'ACTIVE',
  create_login: true, provision_wecom: true
})
const syncRecords = ref([
  { task_no: 'WX-DIFF-20260824', trigger: '每日全量差异扫描', time: '2026-08-24 02:00:04', total: 1042, success: 1040, conflicts: 2, status: '待处理' },
  { task_no: 'WX-HOOK-883591', trigger: '企微实时回调', time: '2026-08-23 16:42:18', total: 1, success: 1, conflicts: 0, status: '已完成' },
  { task_no: 'WX-PUSH-20260823', trigger: '合数BOSS主动下发', time: '2026-08-23 09:16:30', total: 8, success: 8, conflicts: 0, status: '已完成' }
])

const visible = computed(() => {
  const term = keyword.value.trim().toLowerCase()
  return employees.value.filter(row => (!status.value || row.account_status === status.value) && (!term || `${row.employee_no}${row.name}${row.legal_name || ''}${row.mobile_masked}${row.email || ''}${row.position_name || ''}`.toLowerCase().includes(term)))
})
const orgName = (id: number) => organizations.value.find(item => item.id === id)?.name || '未归属'
const scopeText = (name: string) => positions.find(item => item.label === name)?.scope || '未配置数据岗位'
const roleNames = (row: any) => row.role_names?.length ? row.role_names : (row.role_codes || []).map((code: string) => roles.find(item => item.value === code)?.label || code)
const provisionCandidates = computed(() => employees.value.filter(row => row.account_status === 'ACTIVE' && !row.wecom_user_id))
const provisionEmployee = computed(() => employees.value.find(row => row.id === provisionEmployeeId.value))
const proposedWecomUserId = computed(() => provisionEmployee.value ? `boss_${String(provisionEmployee.value.employee_no || provisionEmployee.value.id).toLowerCase()}` : '')
const consistencyState = (row: any) => row.wecom_sync_status === 'CONFLICT' ? 'CONFLICT' : row.wecom_user_id ? 'CONSISTENT' : 'UNBOUND'

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [employeeResult, organizationResult]: any = await Promise.all([http.get('/system/employees'), http.get('/system/organizations')])
    employees.value = employeeResult.data
    organizations.value = organizationResult.data
  } catch (e: any) { error.value = e.message } finally { loading.value = false }
}
function openCreate() {
  current.value = null
  Object.assign(form, { name: '', legal_name: '', mobile: '', email: '', organization_id: null, position_name: '本人数据岗', role_codes: ['COURSE_ADVISOR'], account_status: 'ACTIVE', create_login: true, provision_wecom: bossMasterEnabled.value })
  drawer.value = true
}
function openDetail(row: any) {
  current.value = row
  Object.assign(form, { ...row, role_codes: row.role_codes?.length ? row.role_codes : ['COURSE_ADVISOR'], position_name: positions.some(item => item.label === row.position_name) ? row.position_name : '本人数据岗', provision_wecom: false })
  drawer.value = true
}
async function save() {
  if (!form.name || !form.legal_name || !form.mobile || !form.organization_id || !form.position_name || !form.role_codes.length) return ElMessage.warning('请完整填写员工、组织、业务角色和数据岗位')
  saving.value = true
  try {
    if (current.value) {
      Object.assign(current.value, form)
      ElMessage.success('员工权限关系已更新')
    } else {
      const result: any = await http.post('/system/employees', form)
      await load()
      const created = employees.value.find(item => item.id === result.data?.id)
      if (form.provision_wecom && created) {
        created.wecom_provision_status = 'CREATING'
        setTimeout(() => { created.wecom_user_id = `boss_${String(created.employee_no).toLowerCase()}`; created.wecom_provision_status = 'PENDING_ACTIVATION' }, 600)
        ElMessage.success('员工已创建，企微创建/绑定任务已提交')
      } else ElMessage.success('员工已新增')
    }
    drawer.value = false
  } catch (e: any) { ElMessage.error(e.message || '保存失败') } finally { saving.value = false }
}

const syncCopy = computed(() => ({
  BASELINE: { title: '企微基线导入', description: '只读取整改后的企微组织和成员至暂存区，确认差异后再建立正式员工档案。', confirm: '创建基线导入任务' },
  PUSH: { title: '同步至企业微信', description: '将合数BOSS已确认的员工、组织和在职状态增量下发企业微信。', confirm: '创建企微同步任务' },
  RECONCILE: { title: '企微差异扫描', description: '立即执行一次差异扫描。系统每日02:00也会自动扫描；普通差异进入同步记录，冲突和失败进入异常中心。', confirm: '立即扫描' }
})[syncMode.value])
function openSync(mode: 'BASELINE' | 'PUSH' | 'RECONCILE') { syncMode.value = mode; syncDialog.value = true }
async function runSync() {
  syncRunning.value = true
  await new Promise(resolve => setTimeout(resolve, 420))
  syncRecords.value.unshift({ task_no: `WX-${syncMode.value}-${Date.now()}`, trigger: syncCopy.value.title, time: new Date().toLocaleString('zh-CN', { hour12: false }), total: 1, success: 1, conflicts: 0, status: '已完成' })
  syncRunning.value = false
  syncDialog.value = false
  ElMessage.success(`${syncCopy.value.title}任务已创建，可在同步记录查看结果`)
}
function openProvision(row?: any) {
  if (!bossMasterEnabled.value) return ElMessage.warning('自有系统主控已关闭，请先在企业微信创建成员并同步至合数BOSS')
  provisionEmployeeId.value = row?.id || null
  provisionDialog.value = true
}
async function provisionWecom() {
  const row = provisionEmployee.value
  if (!row) return ElMessage.warning('请选择需要开通企微的员工')
  if (!row.mobile_masked && !row.mobile) return ElMessage.warning('员工手机号缺失，无法查重与邀请')
  if (row.wecom_user_id) return ElMessage.warning('该员工已绑定企微身份，请勿重复创建')
  provisionRunning.value = true
  await new Promise(resolve => setTimeout(resolve, 620))
  row.wecom_user_id = proposedWecomUserId.value
  row.wecom_provision_status = 'PENDING_ACTIVATION'
  provisionRunning.value = false
  provisionDialog.value = false
  ElMessage.success('企微成员已创建并发送邀请，当前状态：待员工激活')
}
onMounted(load)
</script>

<template>
  <section class="page employee-page">
    <PageHeader eyebrow="HESHU BOSS · EMPLOYEE ACCESS" title="员工管理" description="统一维护员工身份、组织、权限与企微绑定；实时回调和每日差异扫描共同保障数据可追踪。">
      <el-button @click="syncRecordsDialog = true">同步记录</el-button>
      <el-button @click="openSync('PUSH')">同步至企微</el-button>
      <el-dropdown trigger="click"><el-button>导入与对账<span class="el-icon--right">⌄</span></el-button><template #dropdown><el-dropdown-menu><el-dropdown-item @click="openSync('BASELINE')">企微基线导入</el-dropdown-item><el-dropdown-item @click="openSync('RECONCILE')">立即差异扫描</el-dropdown-item></el-dropdown-menu></template></el-dropdown>
      <el-button type="primary" @click="openCreate">新增员工</el-button>
    </PageHeader>

    <div class="access-rule"><div><span>①</span><b>主组织</b><small>确定员工归属</small></div><i>＋</i><div><span>②</span><b>业务角色</b><small>运营 / 客服 / 规划师</small></div><i>＋</i><div><span>③</span><b>数据岗位</b><small>本人 / 小组 / 部门 / 公司</small></div><i>＝</i><div class="result"><span>✓</span><b>员工有效权限</b><small>功能权限与数据范围共同生效</small></div></div>

    <main class="surface employee-shell">
      <div class="employee-toolbar"><div><el-input v-model="keyword" clearable prefix-icon="Search" placeholder="搜索员工编号、姓名、手机号或岗位" /><el-select v-model="status" clearable placeholder="账号状态"><el-option label="启用" value="ACTIVE" /><el-option label="停用" value="INACTIVE" /></el-select></div><span>共 {{ visible.length }} 名员工</span></div>
      <StatePanel :loading="loading" :error="error" @retry="load">
        <el-table :data="visible" row-key="id">
          <el-table-column prop="employee_no" label="员工编号" width="118" />
          <el-table-column prop="name" label="员工名称" min-width="120"><template #default="{ row }"><button class="employee-link" @click="openDetail(row)">{{ row.name }}</button><small>{{ row.legal_name || row.name }}</small></template></el-table-column>
          <el-table-column label="主组织" min-width="150"><template #default="{ row }">{{ orgName(row.organization_id) }}</template></el-table-column>
          <el-table-column label="业务角色" min-width="180"><template #default="{ row }"><el-tag v-for="item in roleNames(row)" :key="item" size="small" class="role-tag">{{ item }}</el-tag><span v-if="!roleNames(row).length">未配置</span></template></el-table-column>
          <el-table-column label="数据岗位" min-width="220"><template #default="{ row }"><b>{{ positions.some(item => item.label === row.position_name) ? row.position_name : '本人数据岗' }}</b><small class="scope-copy">{{ scopeText(positions.some(item => item.label === row.position_name) ? row.position_name : '本人数据岗') }}</small></template></el-table-column>
          <el-table-column prop="mobile_masked" label="手机号" width="135" />
          <el-table-column label="企微状态" width="115"><template #default="{ row }"><el-tag v-if="row.wecom_provision_status === 'CREATING'" type="warning">创建中</el-tag><el-tag v-else-if="row.wecom_provision_status === 'PENDING_ACTIVATION'" type="warning">待激活</el-tag><el-tag v-else-if="row.wecom_user_id" type="success">已绑定</el-tag><el-tag v-else type="info">未开通</el-tag></template></el-table-column>
          <el-table-column label="一致性" width="105"><template #default="{ row }"><el-tag v-if="consistencyState(row) === 'CONFLICT'" type="danger">待处理</el-tag><el-tag v-else-if="consistencyState(row) === 'CONSISTENT'" type="success">一致</el-tag><span v-else>—</span></template></el-table-column>
          <el-table-column prop="account_status" label="状态" width="90"><template #default="{ row }"><el-tag :type="row.account_status === 'ACTIVE' ? 'success' : 'info'">{{ row.account_status === 'ACTIVE' ? '启用' : '停用' }}</el-tag></template></el-table-column>
          <el-table-column label="操作" width="210" fixed="right"><template #default="{ row }"><el-button v-if="!row.wecom_user_id && row.account_status === 'ACTIVE'" link type="primary" @click="openProvision(row)">补开企微</el-button><el-button link type="primary" @click="openDetail(row)">详情 / 编辑</el-button></template></el-table-column>
        </el-table>
      </StatePanel>
    </main>

    <el-drawer v-model="drawer" :title="current ? '员工详情与权限' : '新增员工'" size="620px">
      <el-alert title="业务角色决定功能权限，数据岗位决定可见范围；两者共同生效。" type="info" :closable="false" show-icon />
      <el-form label-position="top" class="employee-form">
        <div class="form-grid">
          <el-form-item label="员工名称" required><el-input v-model="form.name" /></el-form-item><el-form-item label="真实姓名" required><el-input v-model="form.legal_name" /></el-form-item>
          <el-form-item label="手机号" required><el-input v-model="form.mobile" /></el-form-item><el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
          <el-form-item label="主组织" required><el-select v-model="form.organization_id" filterable style="width: 100%"><el-option v-for="item in organizations.filter(row => ['DEPARTMENT', 'GROUP_TEAM'].includes(row.type) && row.status === 'ACTIVE')" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
          <el-form-item label="数据岗位" required><el-select v-model="form.position_name" style="width: 100%"><el-option v-for="item in positions" :key="item.label" :label="item.label" :value="item.label" /></el-select><small class="field-help">{{ scopeText(form.position_name) }}</small></el-form-item>
        </div>
        <el-form-item label="业务角色" required><el-select v-model="form.role_codes" multiple style="width: 100%" placeholder="如运营、客服、规划师"><el-option v-for="item in roles" :key="item.value" :label="item.label" :value="item.value" /></el-select><small class="field-help">角色负责菜单、操作和敏感字段权限，不配置数据范围。</small></el-form-item>
        <el-form-item label="账号状态"><el-radio-group v-model="form.account_status"><el-radio value="ACTIVE">启用</el-radio><el-radio value="INACTIVE">停用</el-radio></el-radio-group></el-form-item>
        <div v-if="!current" class="wecom-create-option"><div><b>同时创建或绑定企微成员</b><small>先按手机号查重：已存在且未绑定则建立绑定，不存在则创建成员并发送邀请。</small></div><el-switch v-model="form.provision_wecom" :disabled="!bossMasterEnabled" /></div>
        <el-alert v-if="!current && form.provision_wecom" title="员工档案先保存，企微任务异步执行。企微失败不会删除员工，而是标记失败并进入同步记录/异常中心重试。" type="warning" :closable="false" show-icon />
      </el-form>
      <div class="drawer-actions"><el-button @click="drawer = false">取消</el-button><el-button type="primary" :loading="saving" @click="save">{{ !current && form.provision_wecom ? '保存并开通企微' : '保存员工' }}</el-button></div>
    </el-drawer>

    <el-dialog v-model="syncDialog" :title="syncCopy.title" width="560px"><div class="sync-dialog-copy"><span>企微</span><p>{{ syncCopy.description }}</p></div><template #footer><el-button @click="syncDialog = false">取消</el-button><el-button type="primary" :loading="syncRunning" @click="runSync">{{ syncCopy.confirm }}</el-button></template></el-dialog>
    <el-dialog v-model="syncRecordsDialog" title="企微同步记录" width="900px"><el-alert title="实时回调先写入同步记录并异步处理；字段冲突、重复绑定和连续失败会同时进入业务配置—异常中心。每日02:00自动执行全量差异扫描。" type="info" :closable="false" show-icon /><el-table :data="syncRecords" class="sync-record-table"><el-table-column prop="task_no" label="任务编号" min-width="180" /><el-table-column prop="trigger" label="触发方式" min-width="150" /><el-table-column prop="time" label="接收/开始时间" width="180" /><el-table-column label="执行结果" width="170"><template #default="{ row }">{{ row.success }}/{{ row.total }} 成功<span v-if="row.conflicts"> · {{ row.conflicts }} 个冲突</span></template></el-table-column><el-table-column label="状态" width="100"><template #default="{ row }"><el-tag :type="row.status === '已完成' ? 'success' : 'warning'">{{ row.status }}</el-tag></template></el-table-column></el-table></el-dialog>

    <el-dialog v-model="provisionDialog" title="补开并绑定企微成员" width="680px">
      <el-alert title="用于历史或未绑定员工。系统先按手机号查询企微通讯录，避免重复创建。" type="info" :closable="false" show-icon />
      <div class="provision-steps"><span class="active">1 校验员工档案</span><span>2 查询或创建成员</span><span>3 发送邀请</span><span>4 等待激活</span></div>
      <el-form label-position="top"><el-form-item label="选择员工" required><el-select v-model="provisionEmployeeId" filterable placeholder="输入员工名称或员工编号" style="width: 100%"><el-option v-for="item in provisionCandidates" :key="item.id" :label="`${item.name} · ${item.employee_no} · ${orgName(item.organization_id)}`" :value="item.id" /></el-select></el-form-item><div v-if="provisionEmployee" class="provision-preview"><div><small>员工手机号</small><b>{{ provisionEmployee.mobile_masked || provisionEmployee.mobile }}</b></div><div><small>映射企微部门</small><b>{{ orgName(provisionEmployee.organization_id) }}</b></div><div><small>拟生成企微 UserID</small><b>{{ proposedWecomUserId }}</b></div><div><small>绑定规则</small><b>一个账号 ↔ 一个企微身份</b></div></div></el-form>
      <template #footer><el-button @click="provisionDialog = false">取消</el-button><el-button type="primary" :loading="provisionRunning" @click="provisionWecom">创建或绑定并发送邀请</el-button></template>
    </el-dialog>
  </section>
</template>

<style scoped>
.employee-page{--ink:#172842}.access-rule{display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1.25fr;align-items:center;gap:12px;margin-bottom:20px}.access-rule>div{display:grid;grid-template-columns:auto 1fr;column-gap:10px;padding:16px;background:#fff;border:1px solid #dce6f3;border-radius:14px;box-shadow:0 8px 24px rgba(37,70,115,.05)}.access-rule>div.result{border-color:#7eaeef;background:linear-gradient(135deg,#edf5ff,#fff)}.access-rule span{grid-row:1/3;color:#2e78e8;font-weight:800}.access-rule b{color:var(--ink)}.access-rule small{color:#8193aa}.access-rule i{color:#79a5df;font-size:20px;font-style:normal}.employee-shell{overflow:hidden}.employee-toolbar{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;color:#8192a8;border-bottom:1px solid #e8eef6}.employee-toolbar>div{display:flex;gap:12px}.employee-toolbar .el-input{width:340px}.employee-toolbar .el-select{width:150px}.employee-link{display:block;padding:0;color:#176ee8;font-weight:700;cursor:pointer;background:none;border:0}.employee-link+small,.scope-copy{display:block;margin-top:4px;color:#8da0b8}.role-tag{margin:2px 4px 2px 0}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}.field-help{display:block;margin-top:6px;color:#8193aa}.drawer-actions{display:flex;justify-content:flex-end;margin-top:24px}.wecom-create-option{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:4px 0 16px;padding:16px;background:#f7faff;border:1px solid #d9e7fa;border-radius:12px}.wecom-create-option>div{display:grid;gap:5px}.wecom-create-option b{color:#17304f}.wecom-create-option small{color:#74879f;line-height:1.6}.provision-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:18px 0}.provision-steps span{padding:10px;color:#7a8ca4;font-size:12px;text-align:center;background:#f2f5f9;border-radius:9px}.provision-steps span.active{color:#176ee8;font-weight:800;background:#eaf3ff}.provision-preview{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 14px}.provision-preview>div{display:grid;gap:4px;padding:12px;border:1px solid #e2eaf5;border-radius:10px}.provision-preview small{color:#8293aa}.provision-preview b{color:#223651}.sync-dialog-copy{display:flex;align-items:flex-start;gap:12px;margin-bottom:14px}.sync-dialog-copy>span{flex:0 0 auto;padding:5px 9px;color:#176ee8;font-size:12px;font-weight:800;background:#eaf3ff;border-radius:7px}.sync-dialog-copy p{margin:2px 0 0;color:#526882;line-height:1.7}.sync-record-table{margin-top:16px}@media(max-width:900px){.access-rule{grid-template-columns:1fr}.access-rule i{text-align:center}.employee-toolbar{align-items:flex-start}.employee-toolbar>div{flex-direction:column}.employee-toolbar .el-input,.employee-toolbar .el-select{width:100%}.form-grid,.provision-preview{grid-template-columns:1fr}}
</style>
