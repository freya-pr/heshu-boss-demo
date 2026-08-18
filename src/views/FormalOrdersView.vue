<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import http from '../api/http'
import PageHeader from '../components/PageHeader.vue'
import BusinessScopeFilter, { type BusinessScopeValue } from '../components/BusinessScopeFilter.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const organizations = ref<any[]>([])
const employees = ref<any[]>([])
const keyword = ref('')
const paymentStatus = ref('')
const orderRange = ref<string[]>([])
const scopeFilters = ref<BusinessScopeValue>({ viewScope: 'AUTHORIZED', organizationId: null, ownerId: null, ownerStatus: '' })
const permissionLabel = computed(() => auth.user?.role === 'ADMIN' ? '当前公司全部数据' : '本人数据')
const rows = ref([
  { orderNo: 'O202608180126', customerName: '吴女士', productName: '2980成长训练营', amount: 2980, paymentStatus: 'PAID', ownerId: 2, ownerName: '王老师', ownerNo: 'B00126', organizationName: '一转一组', orderedAt: '2026-08-18 10:26:18' },
  { orderNo: 'O202608180119', customerName: '钱女士', productName: '家庭学习力训练营', amount: 2980, paymentStatus: 'UNPAID', ownerId: 3, ownerName: '陈老师', ownerNo: 'B00135', organizationName: '一转二组', orderedAt: '2026-08-18 09:45:02' },
  { orderNo: 'O202608170088', customerName: '周女士', productName: '家庭教育正式课', amount: 6980, paymentStatus: 'REFUNDING', ownerId: 2, ownerName: '王老师', ownerNo: 'B00126', organizationName: '一转一组', orderedAt: '2026-08-17 16:18:44' }
])

function organizationScopeIds(id: number | null) {
  if (!id) return organizations.value.map(item => Number(item.id))
  const ids = [Number(id)]
  for (let index = 0; index < ids.length; index += 1) organizations.value.filter(item => Number(item.parent_id) === ids[index]).forEach(item => ids.push(Number(item.id)))
  return ids
}

const displayedRows = computed(() => rows.value.filter(row => {
  const owner = employees.value.find(item => Number(item.id) === Number(row.ownerId))
  const ownerOrganizationId = Number(owner?.organization_id || 0)
  const normalizedStatus = !owner ? 'UNASSIGNED' : owner.employment_status === 'DEPARTED' ? 'DEPARTED' : owner.account_status === 'INACTIVE' ? 'INACTIVE' : owner.employment_status || 'ACTIVE'
  const canViewAuthorizedScope = auth.user?.role === 'ADMIN' && scopeFilters.value.viewScope === 'AUTHORIZED'
  const date = row.orderedAt.slice(0, 10)
  const text = `${row.orderNo} ${row.customerName} ${row.productName}`.toLowerCase()
  return (!keyword.value.trim() || text.includes(keyword.value.trim().toLowerCase()))
    && (!paymentStatus.value || row.paymentStatus === paymentStatus.value)
    && (orderRange.value.length !== 2 || (date >= orderRange.value[0] && date <= orderRange.value[1]))
    && (canViewAuthorizedScope || row.ownerName === auth.user?.displayName)
    && (!scopeFilters.value.organizationId || organizationScopeIds(scopeFilters.value.organizationId).includes(ownerOrganizationId))
    && (!scopeFilters.value.ownerId || row.ownerId === scopeFilters.value.ownerId)
    && (!scopeFilters.value.ownerStatus || normalizedStatus === scopeFilters.value.ownerStatus)
}))

const paymentLabel: Record<string, string> = { PAID: '已支付', UNPAID: '未支付', REFUNDING: '退款中', REFUNDED: '已退款' }
const paymentType: Record<string, string> = { PAID: 'success', UNPAID: 'info', REFUNDING: 'warning', REFUNDED: 'danger' }
function resetFilters() { keyword.value = ''; paymentStatus.value = ''; orderRange.value = []; scopeFilters.value = { viewScope: auth.user?.role === 'ADMIN' ? 'AUTHORIZED' : 'SELF', organizationId: null, ownerId: null, ownerStatus: '' } }
onMounted(async () => { const [orgResult, employeeResult]: any = await Promise.all([http.get('/system/organizations'), http.get('/system/employees')]); organizations.value = orgResult.data; employees.value = employeeResult.data })
</script>

<template>
  <section class="page formal-order-page">
    <PageHeader eyebrow="FORMAL COURSE ORDER" title="正式课订单" description="按销售归属组织和销售负责人查询正式课程订单、支付及退款状态。"><el-button>导出</el-button></PageHeader>
    <div class="surface order-shell">
      <div class="order-filters">
        <BusinessScopeFilter v-model="scopeFilters" :organizations="organizations" :employees="employees" owner-label="销售负责人" :permission-label="permissionLabel" :role="auth.user?.role" />
        <div class="order-basic-filters"><el-input v-model="keyword" clearable placeholder="订单号、客户或商品名称" /><el-select v-model="paymentStatus" clearable placeholder="支付状态"><el-option v-for="(label, value) in paymentLabel" :key="value" :label="label" :value="value" /></el-select><el-date-picker v-model="orderRange" type="daterange" value-format="YYYY-MM-DD" start-placeholder="下单开始日期" end-placeholder="下单结束日期" /><el-button type="primary">查询</el-button><el-button @click="resetFilters">重置</el-button><span>共 {{ displayedRows.length }} 笔</span></div>
      </div>
      <el-table :data="displayedRows"><el-table-column prop="orderNo" label="订单编号" width="180" fixed="left" /><el-table-column prop="customerName" label="客户" width="120" /><el-table-column prop="productName" label="正式课商品" min-width="190" /><el-table-column label="实付金额" width="120"><template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template></el-table-column><el-table-column label="支付状态" width="110"><template #default="{ row }"><el-tag :type="paymentType[row.paymentStatus] as any">{{ paymentLabel[row.paymentStatus] }}</el-tag></template></el-table-column><el-table-column label="销售负责人" width="150"><template #default="{ row }"><b>{{ row.ownerName }}</b><small>{{ row.ownerNo }}</small></template></el-table-column><el-table-column prop="organizationName" label="业绩归属组织" width="150" /><el-table-column prop="orderedAt" label="下单时间" width="170" /><el-table-column label="操作" width="120" fixed="right"><template #default><el-button link type="primary">详情</el-button><el-button link>日志</el-button></template></el-table-column></el-table>
    </div>
  </section>
</template>

<style scoped>
.order-shell{overflow:hidden}.order-filters{padding:16px;border-bottom:1px solid var(--line)}.order-basic-filters{display:flex;align-items:center;gap:10px;margin-top:12px}.order-basic-filters .el-input{width:280px}.order-basic-filters .el-select{width:140px}.order-basic-filters>span{margin-left:auto;color:var(--muted);font-size:12px}.formal-order-page small{display:block;margin-top:3px;color:var(--muted);font-size:10px}
</style>
