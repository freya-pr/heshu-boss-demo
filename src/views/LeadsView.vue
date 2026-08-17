<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../api/http'
import PageHeader from '../components/PageHeader.vue'
import StatePanel from '../components/StatePanel.vue'

const rows = ref<any[]>([])
const route = useRoute()
const assignees = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const status = ref('')
const dialog = ref(false)
const form = ref({ name: '', mobile: '', unionId: '', sourceType: 'DRAINAGE', channelName: '' })
const sourceType = computed(() => route.path === '/leads/third-party' ? 'THIRD_PRODUCT' : 'DRAINAGE')
const pageTitle = computed(() => sourceType.value === 'THIRD_PRODUCT' ? '三方品线索' : '引流线索')
const pageDescription = computed(() => sourceType.value === 'THIRD_PRODUCT' ? '统一处理合作类及三方品线索，保留三方业务扩展字段与同步历史。' : '统一处理广告、直播、活动等引流线索，保留来源、分配依据和状态变化。')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [leadRes, employeeRes]: any = await Promise.all([
      http.get('/leads', { params: { status: status.value || undefined, sourceType: sourceType.value } }),
      http.get('/leads/assignees')
    ])
    rows.value = leadRes.data
    assignees.value = employeeRes.data
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function create() {
  if (!form.value.name.trim()) return ElMessage.warning('请填写客户称呼')
  await http.post('/leads', form.value)
  dialog.value = false
  form.value = { name: '', mobile: '', unionId: '', sourceType: 'DRAINAGE', channelName: '' }
  ElMessage.success('线索已创建并进入待分配队列')
  await load()
}

async function assign(row: any) {
  const options = assignees.value.map(item => ({ value: item.id, label: `${item.name}（当前负载 ${item.load ?? '-'}）` }))
  const result: any = await ElMessageBox.prompt(`可选员工：${options.map(item => `${item.value}-${item.label}`).join('；')}`, '人工指定分配', {
    confirmButtonText: '确认分配', cancelButtonText: '取消', inputValue: String(options[0]?.value || 2), inputPattern: /^\d+$/, inputErrorMessage: '请输入有效员工 ID'
  })
  await http.post(`/leads/${row.id}/assign`, { employeeId: Number(result.value) })
  ElMessage.success('分配完成，已关联员工活码')
  await load()
}

async function markWechat(row: any) {
  const result: any = await ElMessageBox.prompt('请填写企业微信 UnionID；演示时可直接确认自动生成。', '确认客户已加微', {
    confirmButtonText: '确认加微', cancelButtonText: '取消', inputValue: row.union_id || `union_demo_${row.id}`
  })
  await http.post(`/leads/${row.id}/wechat-added`, { unionId: result.value })
  ElMessage.success('加微状态已回写')
  await load()
}

async function convert(row: any) {
  try {
    await ElMessageBox.confirm('系统将使用手机号或 UnionID 匹配唯一客户，冲突数据会进入撞单管理。', '转为正式客户', { confirmButtonText: '确认转客户', cancelButtonText: '取消', type: 'warning' })
    const result: any = await http.post(`/leads/${row.id}/convert`)
    ElMessage.success(`转客户成功：${result.data.customerNo || '已关联存量客户'}`)
    await load()
  } catch (e: any) {
    if (e !== 'cancel' && e !== 'close') ElMessage.error(e.message || '转客户失败')
  }
}

watch(() => route.path, () => { form.value.sourceType = sourceType.value; load() })
onMounted(() => { form.value.sourceType = sourceType.value; load() })
const labels: any = { PENDING_ASSIGNMENT: '待分配', ASSIGNED: '已分配', WECHAT_ADDED: '已加微', CONVERTED: '已转客户' }
const sourceLabels: any = { DRAINAGE: '引流线索', THIRD_PRODUCT: '三方品线索', REFERRAL: '转介绍' }
</script>

<template>
  <section class="page">
    <PageHeader eyebrow="LEAD TO CUSTOMER" :title="pageTitle" :description="pageDescription">
      <el-button>批量导入</el-button>
      <el-button type="primary" @click="dialog = true">新增线索</el-button>
    </PageHeader>

    <div class="closure-strip">
      <span class="done">线索接入</span><i></i><span>分配员工活码</span><i></i><span>客户扫码加微</span><i></i><span>唯一客户建档</span><i></i><span>问卷 SABC 定级</span>
    </div>

    <div class="surface table-shell">
      <div class="table-tools">
        <el-select v-model="status" placeholder="全部状态" clearable @change="load">
          <el-option label="待分配" value="PENDING_ASSIGNMENT"/><el-option label="已分配" value="ASSIGNED"/><el-option label="已加微" value="WECHAT_ADDED"/><el-option label="已转客户" value="CONVERTED"/>
        </el-select>
        <el-input placeholder="搜索姓名、手机号或线索编号"/>
        <span>共 {{ rows.length }} 条</span>
      </div>
      <StatePanel :loading="loading" :error="error" :empty="!rows.length" empty-text="暂无线索" @retry="load">
        <el-table :data="rows">
          <el-table-column prop="lead_no" label="线索编号" width="168"/><el-table-column prop="name" label="客户称呼" width="110"/>
          <el-table-column prop="mobile" label="手机号" width="132"><template #default="{ row }">{{ row.mobile ? row.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '待补充' }}</template></el-table-column>
          <el-table-column prop="source_type" label="线索类型" width="120"><template #default="{ row }">{{ sourceLabels[row.source_type] || row.source_type }}</template></el-table-column>
          <el-table-column prop="channel_name" label="渠道"/><el-table-column label="状态" width="105"><template #default="{ row }"><el-tag>{{ labels[row.status] || row.status }}</el-tag></template></el-table-column>
          <el-table-column prop="owner_name" label="负责人" width="100"><template #default="{ row }">{{ row.owner_name || '—' }}</template></el-table-column>
          <el-table-column label="下一步" width="250" fixed="right"><template #default="{ row }">
            <el-button v-if="row.status === 'PENDING_ASSIGNMENT'" link type="primary" @click="assign(row)">分配活码</el-button>
            <el-button v-if="row.status === 'ASSIGNED'" link type="primary" @click="markWechat(row)">确认加微</el-button>
            <el-button v-if="row.status === 'WECHAT_ADDED'" link type="primary" @click="convert(row)">转客户</el-button>
            <el-button link>详情</el-button>
          </template></el-table-column>
        </el-table>
      </StatePanel>
    </div>

    <el-dialog v-model="dialog" title="新增线索" width="540px">
      <el-form label-position="top">
        <el-form-item label="客户称呼" required><el-input v-model="form.name"/></el-form-item>
        <div class="form-grid"><el-form-item label="手机号"><el-input v-model="form.mobile"/></el-form-item><el-form-item label="UnionID"><el-input v-model="form.unionId"/></el-form-item></div>
        <el-form-item label="线索类型" required><el-select v-model="form.sourceType"><el-option label="引流线索" value="DRAINAGE"/><el-option label="三方品线索" value="THIRD_PRODUCT"/><el-option label="转介绍" value="REFERRAL"/></el-select></el-form-item>
        <el-form-item label="渠道"><el-input v-model="form.channelName"/></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialog = false">取消</el-button><el-button type="primary" @click="create">创建线索</el-button></template>
    </el-dialog>
  </section>
</template>
