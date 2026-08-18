<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import http from '../api/http'
import PageHeader from '../components/PageHeader.vue'
import StatePanel from '../components/StatePanel.vue'
import BusinessScopeFilter, { type BusinessScopeValue } from '../components/BusinessScopeFilter.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const rows = ref<any[]>([])
const organizations = ref<any[]>([])
const employees = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const grade = ref('')
const status = ref('')
const keyword = ref('')
const dialog = ref(false)
const form = ref({ name: '', mobile: '', unionId: '', ownerName: '王老师' })
const scopeFilters = ref<BusinessScopeValue>({ viewScope: 'AUTHORIZED', organizationId: null, ownerId: null, ownerStatus: '' })
const permissionLabel = computed(() => auth.user?.role === 'ADMIN' ? '当前公司全部数据' : '本人数据')
const gradeType: any = { S: 'danger', A: 'warning', B: 'primary', C: 'info', UNRATED: 'info' }
const customerStatusLabels: Record<string, string> = { ACTIVE: '正常', PENDING_HANDOVER: '待移交', INACTIVE: '停用' }

function organizationScopeIds(id: number | null) {
  if (!id) return organizations.value.map(item => Number(item.id))
  const ids = [Number(id)]
  for (let index = 0; index < ids.length; index += 1) {
    organizations.value.filter(item => Number(item.parent_id) === ids[index]).forEach(item => ids.push(Number(item.id)))
  }
  return ids
}

const displayedRows = computed(() => rows.value.filter(row => {
  const owner = employees.value.find(item => Number(item.id) === Number(row.owner_id))
  const ownerOrganizationId = Number(owner?.organization_id || row.owner_organization_id || 0)
  const normalizedOwnerStatus = !owner ? 'UNASSIGNED' : owner.employment_status === 'DEPARTED' ? 'DEPARTED' : owner.account_status === 'INACTIVE' ? 'INACTIVE' : owner.employment_status || 'ACTIVE'
  const canViewAuthorizedScope = auth.user?.role === 'ADMIN' && scopeFilters.value.viewScope === 'AUTHORIZED'
  const text = `${row.customer_no || ''} ${row.name || ''} ${row.mobile || ''} ${row.union_id || ''}`.toLowerCase()
  return (!grade.value || row.grade === grade.value)
    && (!status.value || row.status === status.value)
    && (!keyword.value.trim() || text.includes(keyword.value.trim().toLowerCase()))
    && (canViewAuthorizedScope || row.owner_name === auth.user?.displayName)
    && (!scopeFilters.value.organizationId || organizationScopeIds(scopeFilters.value.organizationId).includes(ownerOrganizationId))
    && (!scopeFilters.value.ownerId || Number(row.owner_id) === Number(scopeFilters.value.ownerId))
    && (!scopeFilters.value.ownerStatus || normalizedOwnerStatus === scopeFilters.value.ownerStatus)
}))

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [customerResult, organizationResult, employeeResult]: any = await Promise.all([
      http.get('/customers'), http.get('/system/organizations'), http.get('/system/employees')
    ])
    rows.value = customerResult.data
    organizations.value = organizationResult.data
    employees.value = employeeResult.data
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function create() {
  await http.post('/customers', form.value)
  dialog.value = false
  form.value = { name: '', mobile: '', unionId: '', ownerName: '王老师' }
  await load()
}

function resetFilters() {
  grade.value = ''
  status.value = ''
  keyword.value = ''
  scopeFilters.value = { viewScope: auth.user?.role === 'ADMIN' ? 'AUTHORIZED' : 'SELF', organizationId: null, ownerId: null, ownerStatus: '' }
}

onMounted(load)
</script>

<template>
  <section class="page customer-list-page">
    <PageHeader eyebrow="CUSTOMER MASTER DATA" title="客户列表" description="按授权组织与客户负责人管理唯一身份、等级和客户关系历史。">
      <el-button type="primary" @click="dialog = true">新建客户</el-button>
    </PageHeader>
    <div class="surface table-shell">
      <div class="customer-search-panel">
        <BusinessScopeFilter
          v-model="scopeFilters"
          :organizations="organizations"
          :employees="employees"
          owner-label="客户负责人"
          :permission-label="permissionLabel"
          :role="auth.user?.role"
        />
        <div class="customer-basic-filters">
          <el-input v-model="keyword" clearable placeholder="客户编号、姓名、手机号或 UnionID" />
          <el-select v-model="grade" placeholder="客户等级" clearable><el-option v-for="g in ['S','A','B','C','UNRATED']" :key="g" :label="g === 'UNRATED' ? '未定级' : `${g} 级`" :value="g" /></el-select>
          <el-select v-model="status" placeholder="客户状态" clearable><el-option label="正常" value="ACTIVE" /><el-option label="待移交" value="PENDING_HANDOVER" /><el-option label="停用" value="INACTIVE" /></el-select>
          <el-button type="primary">查询</el-button><el-button @click="resetFilters">重置</el-button>
          <span>共 {{ displayedRows.length }} 位客户</span>
        </div>
      </div>
      <StatePanel :loading="loading" :error="error" :empty="!displayedRows.length" empty-text="当前条件下暂无客户" @retry="load">
        <el-table :data="displayedRows">
          <el-table-column prop="customer_no" label="客户编号" width="180" fixed="left" />
          <el-table-column prop="name" label="客户称呼" min-width="120" />
          <el-table-column prop="mobile" label="手机号" width="140"><template #default="{ row }">{{ row.mobile?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') || '—' }}</template></el-table-column>
          <el-table-column prop="grade" label="等级" width="90"><template #default="{ row }"><el-tag :type="gradeType[row.grade]">{{ row.grade === 'UNRATED' ? '未定级' : row.grade }}</el-tag></template></el-table-column>
          <el-table-column label="客户负责人" min-width="150"><template #default="{ row }"><b>{{ row.owner_name || '待分配' }}</b><small class="cell-sub">{{ row.owner_employee_no || '—' }}</small></template></el-table-column>
          <el-table-column label="归属组织" min-width="170"><template #default="{ row }">{{ row.owner_organization_name || '—' }}</template></el-table-column>
          <el-table-column prop="status" label="客户状态" width="110"><template #default="{ row }">{{ customerStatusLabels[row.status] || row.status }}</template></el-table-column>
          <el-table-column prop="created_at" label="建档时间" width="168" />
          <el-table-column label="操作" width="170" fixed="right"><template #default><el-button link type="primary">客户档案</el-button><el-button link>登记跟进</el-button></template></el-table-column>
        </el-table>
      </StatePanel>
    </div>
    <el-dialog v-model="dialog" title="新建唯一客户" width="520px">
      <el-alert title="手机号或 UnionID 任一有效即可创建；分别命中不同客户时将阻断创建并进入异常记录。" type="info" :closable="false" />
      <el-form label-position="top" style="margin-top:16px"><el-form-item label="客户称呼" required><el-input v-model="form.name" /></el-form-item><el-form-item label="手机号"><el-input v-model="form.mobile" /></el-form-item><el-form-item label="UnionID"><el-input v-model="form.unionId" /></el-form-item><el-form-item label="负责人"><el-input v-model="form.ownerName" /></el-form-item></el-form>
      <template #footer><el-button @click="dialog = false">取消</el-button><el-button type="primary" @click="create">创建客户</el-button></template>
    </el-dialog>
  </section>
</template>

<style scoped>
.customer-search-panel{padding:16px;border-bottom:1px solid var(--line)}.customer-basic-filters{display:flex;align-items:center;gap:10px;margin-top:12px}.customer-basic-filters .el-input{width:310px}.customer-basic-filters .el-select{width:150px}.customer-basic-filters>span{margin-left:auto;color:var(--muted);font-size:12px}.cell-sub{display:block;margin-top:3px;color:var(--muted);font-size:11px;font-weight:400}
</style>
