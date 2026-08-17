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
const leadMark = ref('')
const conversionStatus = ref('')
const keyword = ref('')
const sourceFilter = ref('')
const orderStatusFilter = ref('')
const entryMethodFilter = ref('')
const wechatFilter = ref('')
const ownerFilter = ref('')
const campFilter = ref('')
const shopFilter = ref('')
const dateField = ref('created_at')
const createdRange = ref<string[]>([])
const advancedSearch = ref(false)
const dialog = ref(false)
const detailVisible = ref(false)
const journeyVisible = ref(false)
const journeyLoading = ref(false)
const journeyRows = ref<any[]>([])
const activeLead = ref<any>(null)
const form = ref({ name: '', mobile: '', unionId: '', sourceType: 'DRAINAGE', channelName: '' })
const sourceType = computed(() => route.path === '/leads/third-party' ? 'THIRD_PRODUCT' : 'DRAINAGE')
const pageTitle = computed(() => sourceType.value === 'THIRD_PRODUCT' ? '三方品线索' : '引流线索')
const pageDescription = computed(() => sourceType.value === 'THIRD_PRODUCT' ? '统一处理合作类及三方品线索，保留三方业务扩展字段与同步历史。' : '统一处理广告、直播、活动等引流线索，保留来源、分配依据和状态变化。')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [leadRes, employeeRes]: any = await Promise.all([
      http.get('/leads', { params: { sourceType: sourceType.value } }),
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

function resetFilters() {
  status.value = ''
  leadMark.value = ''
  conversionStatus.value = ''
  keyword.value = ''
  sourceFilter.value = ''
  orderStatusFilter.value = ''
  entryMethodFilter.value = ''
  wechatFilter.value = ''
  ownerFilter.value = ''
  campFilter.value = ''
  shopFilter.value = ''
  dateField.value = 'created_at'
  createdRange.value = []
}

async function openJourney(row: any) {
  activeLead.value = row
  journeyVisible.value = true
  journeyLoading.value = true
  try {
    const result: any = await http.get(`/leads/${row.id}/journey`)
    journeyRows.value = result.data
  } catch (e: any) {
    ElMessage.error(e.message || '生命旅程日志加载失败')
  } finally {
    journeyLoading.value = false
  }
}

function openDetail(row: any) {
  activeLead.value = row
  detailVisible.value = true
}

function handleOperation(command: string, row: any) {
  const operationLabels: Record<string, string> = {
    ASSIGN: '分配活码', CREATE_CUSTOMER: '建立客户档案', EDIT: '编辑线索', FOLLOW_UP: '添加跟进', CHANGE_MARK: '变更线索标记', REASSIGN: '改派负责人',
    SYNC_ORDER: '同步订单', SYNC_MOBILE: '同步手机号', INPUT_ORDER_SYNC: '输入订单号同步', SYNC_CURRENT_ORDER: '同步当前订单',
    IMPORT_EXTERNAL_ORDER: '导入外部订单', IMPORT_DECRYPTED_DATA: '导入解密数据', EXPORT_DUPLICATE_ORDER: '导出重复订单',
    IMPORT_ORDER: '导入订单', IMPORT_PERSONAL_ORDER: '导入个人订单', EXPORT_UNDECRYPTED_DATA: '导出非解密数据',
    QUERY_ABNORMAL_ORDER: '查询异常订单', SMS_BATCH: '短信群发', SMS_REMINDER: '短信提醒', VOICE_REMINDER: '语音提醒',
    SYNC_ABNORMAL_ORDER: '同步异常订单', REMARK: '备注', DETAIL: '查看详情'
  }
  if (command === 'ASSIGN') return assign(row)
  if (command === 'CREATE_CUSTOMER') return convert(row)
  ElMessage.success(`${operationLabels[command] || command}：已为线索 ${row.lead_no} 创建处理任务`)
}

function operationFor(row: any) {
  return (command: string) => handleOperation(command, row)
}

watch(() => route.path, () => { form.value.sourceType = sourceType.value; load() })
onMounted(() => { form.value.sourceType = sourceType.value; load() })
const displayedRows = computed(() => rows.value.filter(row => {
  const matchesStatus = !status.value || row.status === status.value
  const matchesMark = !leadMark.value || row.lead_mark === leadMark.value
  const matchesConversion = !conversionStatus.value || row.conversion_status === conversionStatus.value
  const matchesSource = !sourceFilter.value || row.lead_source === sourceFilter.value
  const matchesOrderStatus = !orderStatusFilter.value || row.order_status === orderStatusFilter.value
  const matchesEntryMethod = !entryMethodFilter.value || row.entry_method === entryMethodFilter.value
  const matchesWechat = !wechatFilter.value || row.wechat_method === wechatFilter.value
  const matchesOwner = !ownerFilter.value.trim() || `${row.owner_name || ''} ${row.owner_employee_no || ''}`.toLowerCase().includes(ownerFilter.value.trim().toLowerCase())
  const matchesCamp = !campFilter.value.trim() || String(row.camp_name || '').toLowerCase().includes(campFilter.value.trim().toLowerCase())
  const matchesShop = !shopFilter.value.trim() || String(row.shop_name || '').toLowerCase().includes(shopFilter.value.trim().toLowerCase())
  const selectedDate = String(row[dateField.value] || '').slice(0, 10)
  const matchesDate = createdRange.value.length !== 2 || (!!selectedDate && selectedDate >= createdRange.value[0] && selectedDate <= createdRange.value[1])
  const text = [row.lead_no, row.order_no, row.name, row.mobile, row.original_mobile, row.decrypted_mobile, row.wechat_nickname, row.customer_no, row.customer_name].join(' ').toLowerCase()
  const matchesKeyword = !keyword.value.trim() || text.includes(keyword.value.trim().toLowerCase())
  return matchesStatus && matchesMark && matchesConversion && matchesSource && matchesOrderStatus && matchesEntryMethod && matchesWechat && matchesOwner && matchesCamp && matchesShop && matchesDate && matchesKeyword
}))
const campOptions = computed(() => [...new Set(rows.value.map(row => String(row.camp_name || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-CN')))
const labels: any = {
  PENDING_ASSIGNMENT: '待分配', ASSIGNED: '已分配', PENDING_DECRYPTION: '未解密', DECRYPTED: '已解密',
  SMS_NOT_CLICKED: '未点短信', SMS_CLICKED: '已点短信', WECHAT_NOT_ADDED: '未加微', WECHAT_ADDED: '已加微',
  QUESTIONNAIRE_NOT_FILLED: '未填问卷', QUESTIONNAIRE_FILLED: '已填问卷', ASSESSMENT_NOT_COMPLETED: '未测评', ASSESSMENT_COMPLETED: '已测评'
}
const leadMarkLabels: any = { VALID: '有效线索', INVALID: '无效线索', DUPLICATE: '重复线索' }
const leadMarkTagTypes: any = { VALID: 'success', INVALID: 'danger', DUPLICATE: 'warning' }
const conversionLabels: any = { UNCONVERTED: '未转化', CONVERTED: '已转化' }
const conversionTagTypes: any = { UNCONVERTED: 'info', CONVERTED: 'success' }
const orderLabels: any = { NO_ORDER: '无订单', UNPAID: '未支付', PAID: '已支付', REFUNDING: '退款中', REFUNDED: '已退款' }
const followLabels: any = { NOT_FOLLOWED: '未跟进', FOLLOWING: '跟进中', FOLLOWED: '已跟进' }
const entryLabels: any = { CHANNEL: '渠道', PRIVATE_DOMAIN: '公域', IMPORT: '导入', PARTNER_PUSH: '合作推送', REFERRAL: '转介绍' }
const wechatLabels: any = { WECOM: '企微', PERSONAL_WECHAT: '个微' }
const sourceLabels: any = { DRAINAGE: '引流线索', THIRD_PRODUCT: '三方品线索', REFERRAL: '转介绍' }
const leadSourceOptions = ['抖店','小红书','淘宝','百家号','视频号','有赞','快手','小鹅通','伴鱼','火花思维','自有系统','支付宝','公户','抖音','星橙','飞策','认证赠送','店播/阿留直播间']
const dateFieldOptions = [
  { value: 'created_at', label: '线索创建时间' }, { value: 'assigned_at', label: '线索分配时间' },
  { value: 'decrypted_at', label: '解密时间' }, { value: 'first_follow_at', label: '首次跟进时间' },
  { value: 'wechat_added_at', label: '加微时间' }, { value: 'questionnaire_at', label: '问卷填写时间' },
  { value: 'assessment_at', label: '测评时间' }, { value: 'customer_linked_at', label: '客户建档时间' },
  { value: 'converted_at', label: '转化时间' }, { value: 'after_sale_at', label: '售后时间' }
]
const maskedMobile = (value: string) => value ? value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '—'
const textOrDash = (value: any) => value === null || value === undefined || value === '' ? '—' : value
</script>

<template>
  <section class="page">
    <PageHeader eyebrow="LEAD TO CUSTOMER" :title="pageTitle" :description="pageDescription">
      <el-button>批量导入</el-button>
      <el-button type="primary" @click="dialog = true">新增线索</el-button>
    </PageHeader>

    <div class="closure-strip">
      <span class="done">线索接入</span><i></i><span>分配员工活码</span><i></i><span>客户扫码加微</span><i></i><span>唯一客户建档</span>
    </div>

    <div class="surface table-shell">
      <div class="search-panel">
        <div class="search-grid">
          <el-input v-model="keyword" clearable placeholder="线索/订单/客户/手机号/微信昵称"/>
          <el-select v-model="status" placeholder="线索生命周期" clearable><el-option v-for="(label, value) in labels" :key="value" :label="label" :value="value"/></el-select>
          <el-select v-model="leadMark" placeholder="线索标记" clearable><el-option v-for="(label, value) in leadMarkLabels" :key="value" :label="label" :value="value"/></el-select>
          <el-select v-model="conversionStatus" placeholder="转化状态" clearable><el-option v-for="(label, value) in conversionLabels" :key="value" :label="label" :value="value"/></el-select>
        </div>
        <el-collapse-transition>
          <div v-show="advancedSearch" class="search-grid advanced-search">
            <el-select v-model="sourceFilter" placeholder="线索来源" clearable filterable><el-option v-for="item in leadSourceOptions" :key="item" :label="item" :value="item"/></el-select>
            <el-select v-model="orderStatusFilter" placeholder="订单状态" clearable><el-option v-for="(label, value) in orderLabels" :key="value" :label="label" :value="value"/></el-select>
            <el-select v-model="entryMethodFilter" placeholder="添加方式" clearable><el-option v-for="(label, value) in entryLabels" :key="value" :label="label" :value="value"/></el-select>
            <el-select v-model="wechatFilter" placeholder="加微方式" clearable><el-option label="企业微信" value="WECOM"/><el-option label="个人微信" value="PERSONAL_WECHAT"/></el-select>
            <el-input v-model="ownerFilter" clearable placeholder="负责人姓名/员工编号"/>
            <el-select v-model="campFilter" placeholder="所属营期" clearable filterable><el-option v-for="item in campOptions" :key="item" :label="item" :value="item"/></el-select>
            <el-input v-model="shopFilter" clearable placeholder="店铺名称"/>
            <div class="date-filter"><el-select v-model="dateField" aria-label="日期类型"><el-option v-for="item in dateFieldOptions" :key="item.value" :label="item.label" :value="item.value"/></el-select><el-date-picker v-model="createdRange" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期"/></div>
          </div>
        </el-collapse-transition>
        <div class="search-actions">
          <span>共 {{ displayedRows.length }} 条</span>
          <el-button type="primary">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
          <el-button link type="primary" @click="advancedSearch = !advancedSearch">{{ advancedSearch ? '收起条件' : '更多条件' }}</el-button>
        </div>
      </div>
      <StatePanel :loading="loading" :error="error" :empty="!rows.length" empty-text="暂无线索" @retry="load">
        <el-table :data="displayedRows" row-key="id">
          <el-table-column type="selection" width="48" fixed="left"/>
          <el-table-column prop="lead_no" label="线索编号" width="168" fixed="left"/>
          <el-table-column prop="order_no" label="订单编号" width="160"><template #default="{ row }">{{ textOrDash(row.order_no) }}</template></el-table-column>
          <el-table-column prop="source_type" label="线索类型" width="110"><template #default="{ row }">{{ sourceLabels[row.source_type] || row.source_type }}</template></el-table-column>
          <el-table-column label="订单状态" width="100"><template #default="{ row }">{{ orderLabels[row.order_status] || textOrDash(row.order_status) }}</template></el-table-column>
          <el-table-column label="关联客户" width="170"><template #default="{ row }"><strong>{{ textOrDash(row.customer_name) }}</strong><small class="cell-sub">{{ textOrDash(row.customer_no) }}</small></template></el-table-column>
          <el-table-column prop="wechat_nickname" label="微信昵称" width="130"><template #default="{ row }">{{ textOrDash(row.wechat_nickname) }}</template></el-table-column>
          <el-table-column label="原始手机号" width="128"><template #default="{ row }">{{ maskedMobile(row.original_mobile) }}</template></el-table-column>
          <el-table-column label="解密后手机号" width="128"><template #default="{ row }">{{ maskedMobile(row.decrypted_mobile || row.mobile) }}</template></el-table-column>
          <el-table-column prop="lead_source" label="线索来源" width="110"><template #default="{ row }">{{ textOrDash(row.lead_source || row.channel_name) }}</template></el-table-column>
          <el-table-column prop="first_product_name" label="首单商品名称" width="160"><template #default="{ row }">{{ textOrDash(row.first_product_name) }}</template></el-table-column>
          <el-table-column prop="product_remark" label="商品名称备注" width="160"><template #default="{ row }">{{ textOrDash(row.product_remark) }}</template></el-table-column>
          <el-table-column prop="shop_name" label="店铺名称" width="160"><template #default="{ row }">{{ textOrDash(row.shop_name) }}</template></el-table-column>
          <el-table-column label="实付金额" width="110"><template #default="{ row }">{{ Number(row.paid_amount || 0) ? `¥${Number(row.paid_amount).toFixed(2)}` : '—' }}</template></el-table-column>
          <el-table-column label="当前线索负责人/员工编号" width="190"><template #default="{ row }"><strong>{{ textOrDash(row.owner_name) }}</strong><small class="cell-sub">{{ textOrDash(row.owner_employee_no) }}</small></template></el-table-column>
          <el-table-column label="线索状态" width="110" fixed="right"><template #default="{ row }"><el-tag>{{ labels[row.status] || row.status }}</el-tag></template></el-table-column>
          <el-table-column label="线索标记" width="110" fixed="right"><template #default="{ row }"><el-tag :type="leadMarkTagTypes[row.lead_mark] || 'info'">{{ leadMarkLabels[row.lead_mark] || row.lead_mark }}</el-tag></template></el-table-column>
          <el-table-column label="转化状态" width="112" fixed="right"><template #default="{ row }"><el-tag :type="conversionTagTypes[row.conversion_status] || 'info'">{{ conversionLabels[row.conversion_status] || row.conversion_status }}</el-tag></template></el-table-column>
          <el-table-column label="跟进状态" width="100"><template #default="{ row }">{{ followLabels[row.follow_status] || textOrDash(row.follow_status) }}</template></el-table-column>
          <el-table-column prop="first_follow_at" label="首次跟进时间" width="168"><template #default="{ row }">{{ textOrDash(row.first_follow_at) }}</template></el-table-column>
          <el-table-column prop="created_at" label="线索创建时间" width="168"/>
          <el-table-column prop="assigned_at" label="线索分配时间" width="168"><template #default="{ row }">{{ textOrDash(row.assigned_at) }}</template></el-table-column>
          <el-table-column prop="wechat_added_at" label="加微时间" width="168"><template #default="{ row }">{{ textOrDash(row.wechat_added_at) }}</template></el-table-column>
          <el-table-column prop="decrypted_at" label="解密时间" width="168"><template #default="{ row }">{{ textOrDash(row.decrypted_at) }}</template></el-table-column>
          <el-table-column prop="questionnaire_at" label="问卷填写时间" width="168"><template #default="{ row }">{{ textOrDash(row.questionnaire_at) }}</template></el-table-column>
          <el-table-column prop="assessment_at" label="测评时间" width="168"><template #default="{ row }">{{ textOrDash(row.assessment_at) }}</template></el-table-column>
          <el-table-column prop="customer_linked_at" label="客户建档时间" width="168"><template #default="{ row }">{{ textOrDash(row.customer_linked_at) }}</template></el-table-column>
          <el-table-column prop="converted_at" label="已转化时间" width="168"><template #default="{ row }">{{ textOrDash(row.converted_at) }}</template></el-table-column>
          <el-table-column prop="after_sale_at" label="售后时间" width="168"><template #default="{ row }">{{ textOrDash(row.after_sale_at) }}</template></el-table-column>
          <el-table-column label="添加方式" width="120"><template #default="{ row }">{{ entryLabels[row.entry_method] || textOrDash(row.entry_method) }}</template></el-table-column>
          <el-table-column label="加微方式" width="100"><template #default="{ row }">{{ wechatLabels[row.wechat_method] || textOrDash(row.wechat_method) }}</template></el-table-column>
          <el-table-column prop="camp_name" label="所属营期" width="150"><template #default="{ row }">{{ textOrDash(row.camp_name) }}</template></el-table-column>
          <el-table-column prop="sms_send_count" label="短信发送次数" width="120"/>
          <el-table-column prop="remark" label="线索备注" width="220" show-overflow-tooltip/>
          <el-table-column label="操作" width="240" fixed="right"><template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button link type="primary" @click="openJourney(row)">旅程</el-button>
            <el-dropdown trigger="click" @command="operationFor(row)">
              <el-button link type="primary">更多⌄</el-button>
              <template #dropdown><el-dropdown-menu>
                <el-dropdown-item v-if="row.status === 'PENDING_ASSIGNMENT'" command="ASSIGN">分配活码</el-dropdown-item>
                <el-dropdown-item v-if="['WECHAT_ADDED','QUESTIONNAIRE_NOT_FILLED','QUESTIONNAIRE_FILLED','ASSESSMENT_NOT_COMPLETED','ASSESSMENT_COMPLETED'].includes(row.status) && !row.customer_no" command="CREATE_CUSTOMER">建立客户档案</el-dropdown-item>
                <el-dropdown-item command="EDIT">编辑线索</el-dropdown-item><el-dropdown-item command="FOLLOW_UP">添加跟进</el-dropdown-item>
                <el-dropdown-item command="CHANGE_MARK">变更线索标记</el-dropdown-item><el-dropdown-item command="REASSIGN">改派负责人</el-dropdown-item>
                <el-dropdown-item command="SYNC_ORDER">同步订单</el-dropdown-item><el-dropdown-item command="SYNC_MOBILE">同步手机号</el-dropdown-item>
                <el-dropdown-item command="INPUT_ORDER_SYNC">输入订单号同步</el-dropdown-item><el-dropdown-item command="SYNC_CURRENT_ORDER">同步当前订单</el-dropdown-item>
                <el-dropdown-item command="IMPORT_EXTERNAL_ORDER">导入外部订单</el-dropdown-item><el-dropdown-item command="IMPORT_DECRYPTED_DATA">导入解密数据</el-dropdown-item>
                <el-dropdown-item command="EXPORT_DUPLICATE_ORDER">导出重复订单</el-dropdown-item><el-dropdown-item command="IMPORT_ORDER">导入订单</el-dropdown-item>
                <el-dropdown-item command="IMPORT_PERSONAL_ORDER">导入个人订单</el-dropdown-item><el-dropdown-item command="EXPORT_UNDECRYPTED_DATA">导出非解密数据</el-dropdown-item>
                <el-dropdown-item command="QUERY_ABNORMAL_ORDER">查询异常订单</el-dropdown-item><el-dropdown-item command="SYNC_ABNORMAL_ORDER">同步异常订单</el-dropdown-item>
                <el-dropdown-item divided command="SMS_BATCH">短信群发</el-dropdown-item><el-dropdown-item command="SMS_REMINDER">短信提醒</el-dropdown-item><el-dropdown-item command="VOICE_REMINDER">语音提醒</el-dropdown-item>
                <el-dropdown-item divided command="REMARK">备注</el-dropdown-item>
              </el-dropdown-menu></template>
            </el-dropdown>
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

    <el-drawer v-model="detailVisible" size="620px" :title="`${activeLead?.lead_no || ''} · 线索详情`">
      <el-descriptions v-if="activeLead" :column="2" border>
        <el-descriptions-item label="客户称呼">{{ textOrDash(activeLead.name) }}</el-descriptions-item>
        <el-descriptions-item label="微信昵称">{{ textOrDash(activeLead.wechat_nickname) }}</el-descriptions-item>
        <el-descriptions-item label="线索状态">{{ labels[activeLead.status] || activeLead.status }}</el-descriptions-item>
        <el-descriptions-item label="转化状态">{{ conversionLabels[activeLead.conversion_status] || activeLead.conversion_status }}</el-descriptions-item>
        <el-descriptions-item label="线索来源">{{ textOrDash(activeLead.lead_source) }}</el-descriptions-item>
        <el-descriptions-item label="添加方式">{{ entryLabels[activeLead.entry_method] || textOrDash(activeLead.entry_method) }}</el-descriptions-item>
        <el-descriptions-item label="当前负责人">{{ textOrDash(activeLead.owner_name) }} / {{ textOrDash(activeLead.owner_employee_no) }}</el-descriptions-item>
        <el-descriptions-item label="所属营期">{{ textOrDash(activeLead.camp_name) }}</el-descriptions-item>
        <el-descriptions-item label="订单编号">{{ textOrDash(activeLead.order_no) }}</el-descriptions-item>
        <el-descriptions-item label="关联客户">{{ textOrDash(activeLead.customer_name) }} / {{ textOrDash(activeLead.customer_no) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ textOrDash(activeLead.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="加微时间">{{ textOrDash(activeLead.wechat_added_at) }}</el-descriptions-item>
        <el-descriptions-item label="线索备注" :span="2">{{ textOrDash(activeLead.remark) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>

    <el-drawer v-model="journeyVisible" size="560px" :title="`${activeLead?.lead_no || ''} · 线索生命旅程`">
      <div class="journey-summary" v-if="activeLead">
        <el-tag>{{ labels[activeLead.status] || activeLead.status }}</el-tag>
        <el-tag :type="leadMarkTagTypes[activeLead.lead_mark] || 'info'">{{ leadMarkLabels[activeLead.lead_mark] }}</el-tag>
        <el-tag :type="conversionTagTypes[activeLead.conversion_status] || 'info'">{{ conversionLabels[activeLead.conversion_status] }}</el-tag>
      </div>
      <StatePanel :loading="journeyLoading" :empty="!journeyRows.length" empty-text="暂无旅程日志">
        <el-timeline>
          <el-timeline-item v-for="item in journeyRows" :key="item.id" :timestamp="item.occurred_at" placement="top" type="primary">
            <div class="journey-card"><strong>{{ item.event_name }}</strong><p>{{ item.detail || '—' }}</p>
              <div class="journey-change" v-if="item.from_status || item.to_status"><span>{{ labels[item.from_status] || item.from_status || '开始' }}</span><b>→</b><span>{{ labels[item.to_status] || item.to_status || '—' }}</span></div>
              <small>{{ item.operator_name || '系统' }} · {{ item.event_source || 'SYSTEM' }}</small>
              <div class="journey-change" v-if="item.from_conversion_status || item.to_conversion_status"><span>{{ conversionLabels[item.from_conversion_status] || item.from_conversion_status || '开始' }}</span><b>→</b><span>{{ conversionLabels[item.to_conversion_status] || item.to_conversion_status || '—' }}</span></div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </StatePanel>
    </el-drawer>
  </section>
</template>

<style scoped>
.search-panel {
  display: grid;
  gap: 14px;
  padding: 18px 20px;
  border-bottom: 1px solid #e7edf5;
  background: #fff;
}
.search-grid {
  display: grid;
  grid-template-columns: minmax(280px, 1.4fr) repeat(3, minmax(160px, 1fr));
  gap: 12px;
}
.advanced-search {
  grid-template-columns: repeat(5, minmax(170px, 1fr));
}
.date-filter {
  display: grid;
  grid-template-columns: 150px minmax(280px, 1fr);
  gap: 8px;
  grid-column: span 2;
}
.search-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  color: #64748b;
}
.cell-sub {
  display: block;
  margin-top: 4px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 400;
}
.journey-summary {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}
.journey-card {
  padding: 14px 16px;
  border: 1px solid #e5edf7;
  border-radius: 10px;
  background: #f8fbff;
}
.journey-card p {
  margin: 8px 0;
  color: #64748b;
}
.journey-card small {
  color: #94a3b8;
}
.journey-change {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  color: #2563eb;
}
@media (max-width: 1200px) {
  .search-grid,
  .advanced-search { grid-template-columns: repeat(2, minmax(180px, 1fr)); }
  .date-filter { grid-column: span 2; }
}
</style>
