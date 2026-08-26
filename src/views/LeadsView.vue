<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Setting } from '@element-plus/icons-vue'
import http from '../api/http'
import PageHeader from '../components/PageHeader.vue'
import StatePanel from '../components/StatePanel.vue'
import BusinessScopeFilter, { type BusinessScopeValue } from '../components/BusinessScopeFilter.vue'
import { useAuthStore } from '../stores/auth'

const rows = ref<any[]>([])
const selectedRows = ref<any[]>([])
const route = useRoute()
const assignees = ref<any[]>([])
const organizations = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const currentActionFilter = ref('')
const assignmentFilter = ref('')
const decryptFilter = ref('')
const smsFilter = ref('')
const wechatStatusFilter = ref('')
const questionnaireFilter = ref('')
const assessmentFilter = ref('')
const leadMark = ref('')
const leadGradeFilter = ref('')
const demandMinedFilter = ref('')
const conversionStatus = ref('')
const keyword = ref('')
const sourceFilter = ref('')
const orderStatusFilter = ref('')
const entryMethodFilter = ref('')
const wechatFilter = ref('')
const campFilter = ref('')
const shopFilter = ref('')
const dateField = ref('created_at')
const createdRange = ref<string[]>([])
const advancedSearch = ref(false)
const detailVisible = ref(false)
const journeyVisible = ref(false)
const journeyLoading = ref(false)
const journeyRows = ref<any[]>([])
const activeLead = ref<any>(null)
const columnSettingVisible = ref(false)
const batchDialogVisible = ref(false)
const batchAction = ref('')
const batchSubtype = ref('')
const syncPlatformOptions = ['抖店', '百家号', '有赞', '小鹅通', '小红书', '快手', '视频号']
const selectedSyncPlatforms = ref<string[]>([])
const smsBroadcastTemplate = ref('')
const smsBroadcastContent = ref('')
const smsTemplateOptions = [
  { label: '未加微提醒', value: 'WECHAT_PENDING', content: '您提交的课程咨询已受理，请及时添加专属老师微信。' },
  { label: '直播预约提醒', value: 'LIVE_BOOKING', content: '您的专属直播课程已开放预约，请及时完成预约。' },
  { label: '问卷填写提醒', value: 'QUESTIONNAIRE_PENDING', content: '请完成学习需求问卷，以便老师为您提供更准确的规划建议。' }
]
const decryptImportFileName = ref('')
const decryptImportRows = ref<Array<{ orderNo: string; mobile: string }>>([])
const decryptImportErrors = ref<string[]>([])
const selectedOrganizationId = ref<number | null>(null)
const selectedAssigneeId = ref<number | null>(null)
const assigneeKeyword = ref('')
const auth = useAuthStore()
const scopeFilters = ref<BusinessScopeValue>({ viewScope: 'AUTHORIZED', organizationId: null, ownerId: null })
const permissionLabel = computed(() => auth.user?.role === 'ADMIN' ? '当前公司全部数据' : '本人数据')
const sourceType = computed(() => route.path === '/leads/third-party' ? 'THIRD_PRODUCT' : 'DRAINAGE')
const pageTitle = computed(() => sourceType.value === 'THIRD_PRODUCT' ? '三方品线索' : '引流线索')
const pageDescription = computed(() => sourceType.value === 'THIRD_PRODUCT' ? '统一处理合作类及三方品线索，保留三方业务扩展字段与同步历史。' : '统一处理广告、直播、活动等引流线索，保留来源、分配依据和状态变化。')
const mandatoryColumns = ['order_no', 'lead_source', 'operation']
const defaultColumns = ['order_no','lead_source','lead_grade','demand_mined','third_party_product_id','source_type','order_status','related_customer','wechat_nickname','decrypted_mobile','first_product_name','paid_amount','owner','current_action_status','assignment_status','decrypt_status','sms_status','lead_mark','conversion_status','follow_status','created_at','wechat_added_at','camp_name','remark','operation']
const columnOptions = [
  { value: 'order_no', label: '订单编号', mandatory: true }, { value: 'source_type', label: '线索类型' },
  { value: 'order_status', label: '订单状态' }, { value: 'related_customer', label: '关联客户' }, { value: 'wechat_nickname', label: '微信昵称' },
  { value: 'original_mobile', label: '原始手机号' }, { value: 'decrypted_mobile', label: '解密后手机号' }, { value: 'lead_source', label: '线索来源', mandatory: true },
  { value: 'third_party_product_id', label: '第三方商品ID' }, { value: 'lead_grade', label: '线索等级' }, { value: 'demand_mined', label: '是否挖需' },
  { value: 'first_product_name', label: '首单商品名称' }, { value: 'product_remark', label: '商品名称备注' }, { value: 'shop_name', label: '店铺名称' },
  { value: 'paid_amount', label: '实付金额' }, { value: 'owner', label: '当前负责人/员工编号' }, { value: 'current_action_status', label: '当前待办状态' },
  { value: 'assignment_status', label: '分配状态' }, { value: 'decrypt_status', label: '解密状态' }, { value: 'sms_status', label: '短信状态' },
  { value: 'wechat_status', label: '加微状态' }, { value: 'questionnaire_status', label: '问卷状态' }, { value: 'assessment_status', label: '测评状态' },
  { value: 'lead_mark', label: '线索标记' }, { value: 'conversion_status', label: '转化状态' }, { value: 'follow_status', label: '跟进状态' },
  { value: 'first_follow_at', label: '首次跟进时间' }, { value: 'created_at', label: '线索创建时间' }, { value: 'assigned_at', label: '线索分配时间' },
  { value: 'wechat_added_at', label: '加微时间' }, { value: 'decrypted_at', label: '解密时间' }, { value: 'questionnaire_at', label: '问卷填写时间' },
  { value: 'assessment_at', label: '测评时间' }, { value: 'customer_linked_at', label: '客户建档时间' }, { value: 'converted_at', label: '转化时间' },
  { value: 'after_sale_at', label: '售后时间' }, { value: 'entry_method', label: '添加方式' }, { value: 'wechat_method', label: '加微方式' },
  { value: 'camp_name', label: '所属营期' }, { value: 'sms_send_count', label: '短信发送次数' }, { value: 'remark', label: '线索备注' },
  { value: 'operation', label: '操作', mandatory: true }
]
const columnStorageKey = 'heshu_boss_lead_table_columns_v6'
function loadColumnPreference() {
  try {
    const saved = JSON.parse(localStorage.getItem(columnStorageKey) || '[]')
    return Array.isArray(saved) && saved.length ? [...new Set([...saved, ...mandatoryColumns])] : [...defaultColumns]
  } catch { return [...defaultColumns] }
}
const visibleColumns = ref<string[]>(loadColumnPreference())
const showColumn = (key: string) => mandatoryColumns.includes(key) || visibleColumns.value.includes(key)
function resetColumns() { visibleColumns.value = [...defaultColumns] }

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [leadRes, employeeRes, organizationRes]: any = await Promise.all([
      http.get('/leads', { params: { sourceType: sourceType.value } }),
      http.get('/leads/assignees'),
      http.get('/system/organizations')
    ])
    rows.value = leadRes.data.map(normalizeLeadState)
    assignees.value = employeeRes.data
    organizations.value = organizationRes.data
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function assign(row: any) {
  const options = assignees.value.map(item => ({ value: item.id, label: `${item.name}（已分配 ${item.load ?? 0}/${item.assignment_limit ?? '未配置'}）` }))
  const result: any = await ElMessageBox.prompt(`可选员工：${options.map(item => `${item.value}-${item.label}`).join('；')}`, '人工指定分配', {
    confirmButtonText: '确认分配', cancelButtonText: '取消', inputValue: String(options[0]?.value || 2), inputPattern: /^\d+$/, inputErrorMessage: '请输入有效员工 ID'
  })
  await http.post(`/leads/${row.id}/assign`, { employeeId: Number(result.value) })
  ElMessage.success('分配完成，已关联员工活码')
  await load()
}

async function convert(row: any) {
  try {
    await ElMessageBox.confirm('系统将使用手机号或 UnionID 匹配唯一客户。两项身份分别命中不同客户时将阻断自动建档，并生成撞单案件进入客户中心处理。', '转为正式客户', { confirmButtonText: '确认转客户', cancelButtonText: '取消', type: 'warning' })
    const result: any = await http.post(`/leads/${row.id}/convert`)
    ElMessage.success(`转客户成功：${result.data.customerNo || '已关联存量客户'}`)
    await load()
  } catch (e: any) {
    if (e !== 'cancel' && e !== 'close') ElMessage.error(e.message || '转客户失败')
  }
}

function resetFilters() {
  currentActionFilter.value = ''
  assignmentFilter.value = ''
  decryptFilter.value = ''
  smsFilter.value = ''
  wechatStatusFilter.value = ''
  questionnaireFilter.value = ''
  assessmentFilter.value = ''
  leadMark.value = ''
  leadGradeFilter.value = ''
  demandMinedFilter.value = ''
  conversionStatus.value = ''
  keyword.value = ''
  sourceFilter.value = ''
  orderStatusFilter.value = ''
  entryMethodFilter.value = ''
  wechatFilter.value = ''
  scopeFilters.value = { viewScope: auth.user?.role === 'ADMIN' ? 'AUTHORIZED' : 'SELF', organizationId: null, ownerId: null }
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
    CREATE_CUSTOMER: '建立客户档案', CHANGE_MARK: '变更线索标记', REASSIGN: '改派负责人',
    SMS_REMINDER: '短信提醒', REMARK: '备注'
  }
  if (command === 'CREATE_CUSTOMER') return convert(row)
  ElMessage.success(`${operationLabels[command] || command}：已为订单 ${row.order_no || '未关联订单'} 创建处理任务`)
}

async function markDemandMined(row: any, checked: string | number | boolean) {
  if (checked !== true || row.demand_mined) return
  try {
    await ElMessageBox.confirm(
      `确认将订单 ${row.order_no || '未关联订单'} 标记为“已挖需”？确认后不能在列表取消。`,
      '确认标记已挖需',
      { confirmButtonText: '确认标记', cancelButtonText: '取消', type: 'warning' }
    )
    const result: any = await http.post(`/leads/${row.id}/demand-mined`)
    row.demand_mined = true
    row.demand_mined_at = result.data?.demandMinedAt
    row.demand_mined_by = result.data?.demandMinedBy
    ElMessage.success('已标记为已挖需，列表中不可取消')
  } catch (e: any) {
    if (e !== 'cancel' && e !== 'close') ElMessage.error(e.message || '标记失败')
  }
}

function operationFor(row: any) {
  return (command: string) => handleOperation(command, row)
}

function handleSelectionChange(selection: any[]) { selectedRows.value = selection }

const batchActionLabels: Record<string, string> = {
  ASSIGN: '批量分配', SYNC_ORDER: '批量同步订单',
  SMS_BROADCAST: '短信群发', IMPORT_DECRYPTED: '导入解密数据', EXPORT_UNDECRYPTED: '导出非解密数据'
}
const batchSubtypeOptions = computed(() => ({
  ASSIGN: ['人工指定', '轮询分配']
}[batchAction.value] || []))
const organizationTree = computed(() => {
  const byParent = new Map<any, any[]>()
  organizations.value.forEach(item => { const key = item.parent_id ?? null; byParent.set(key, [...(byParent.get(key) || []), { ...item, label: item.name }]) })
  const build = (parentId: any): any[] => (byParent.get(parentId) || []).map(item => ({ ...item, children: build(item.id) }))
  return build(null)
})
function organizationScopeIds(id: number | null) {
  if (!id) return organizations.value.map(item => item.id)
  const ids = [id]
  for (let index = 0; index < ids.length; index++) organizations.value.filter(item => item.parent_id === ids[index]).forEach(item => ids.push(item.id))
  return ids
}
const visibleAssignees = computed(() => {
  const scope = organizationScopeIds(selectedOrganizationId.value)
  const query = assigneeKeyword.value.trim().toLowerCase()
  return assignees.value.filter(item => {
    if (!scope.includes(item.organization_id)) return false
    if (!query) return true
    return String(item.name || '').toLowerCase().includes(query) || String(item.employee_no || '').toLowerCase().includes(query)
  })
})
const latestCampName = computed(() => assignees.value.find(item => item.qr_camp_name)?.qr_camp_name || '最新营期')
const latestCampEligibleCount = computed(() => assignees.value.filter(item => item.qr_camp_name === latestCampName.value && Number(item.load || 0) < Number(item.assignment_limit || 0)).length)
function selectOrganization(node: any) { selectedOrganizationId.value = node.id; selectedAssigneeId.value = null }
function chooseAssignee(item: any) {
  selectedAssigneeId.value = item.id
}
function openBatchAction(command: string) {
  if (['ASSIGN','SYNC_ORDER','SMS_BROADCAST'].includes(command) && !selectedRows.value.length) {
    return ElMessage.warning('请先勾选需要处理的线索')
  }
  batchAction.value = command
  batchSubtype.value = command === 'ASSIGN' ? '人工指定' : ''
  selectedSyncPlatforms.value = []
  smsBroadcastTemplate.value = ''
  smsBroadcastContent.value = ''
  selectedOrganizationId.value = null
  selectedAssigneeId.value = null
  assigneeKeyword.value = ''
  decryptImportFileName.value = ''
  decryptImportRows.value = []
  decryptImportErrors.value = []
  batchDialogVisible.value = true
}

function toggleSyncPlatform(platform: string, checked: boolean) {
  if (checked && !selectedSyncPlatforms.value.includes(platform)) selectedSyncPlatforms.value.push(platform)
  if (!checked) selectedSyncPlatforms.value = selectedSyncPlatforms.value.filter(item => item !== platform)
}

function applySmsTemplate(value: string) {
  smsBroadcastTemplate.value = value
  smsBroadcastContent.value = smsTemplateOptions.find(item => item.value === value)?.content || ''
}

function csvCell(value: unknown) {
  const text = String(value ?? '')
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function downloadCsv(fileName: string, headers: string[], data: unknown[][]) {
  const csv = '\uFEFF' + [headers, ...data].map(row => row.map(csvCell).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

function downloadDecryptTemplate() {
  downloadCsv('引流线索解密数据导入模板.csv', ['订单编号', '手机号'], [['示例：DY202608240001', '13800000000']])
}

function parseCsvLine(line: string) {
  const cells: string[] = []
  let current = ''
  let quoted = false
  for (let index = 0; index < line.length; index++) {
    const char = line[index]
    if (char === '"' && quoted && line[index + 1] === '"') { current += '"'; index++; continue }
    if (char === '"') { quoted = !quoted; continue }
    if (char === ',' && !quoted) { cells.push(current.trim()); current = ''; continue }
    current += char
  }
  cells.push(current.trim())
  return cells
}

async function handleDecryptImportFile(uploadFile: any) {
  const file = uploadFile?.raw as File | undefined
  if (!file) return
  decryptImportFileName.value = file.name
  decryptImportRows.value = []
  decryptImportErrors.value = []
  const lines = (await file.text()).replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.trim())
  if (!lines.length) { decryptImportErrors.value = ['文件为空']; return }
  const headers = parseCsvLine(lines[0])
  const orderIndex = headers.findIndex(item => ['订单编号', 'order_no', 'orderNo'].includes(item))
  const mobileIndex = headers.findIndex(item => ['手机号', 'mobile'].includes(item))
  if (orderIndex < 0 || mobileIndex < 0) { decryptImportErrors.value = ['模板表头必须包含“订单编号、手机号”']; return }
  const seen = new Set<string>()
  lines.slice(1).forEach((line, index) => {
    const cells = parseCsvLine(line)
    const orderNo = String(cells[orderIndex] || '').trim()
    const mobile = String(cells[mobileIndex] || '').replace(/\s+/g, '')
    if (!orderNo) return decryptImportErrors.value.push(`第 ${index + 2} 行：订单编号不能为空`)
    if (!/^1\d{10}$/.test(mobile)) return decryptImportErrors.value.push(`第 ${index + 2} 行：手机号格式错误`)
    if (seen.has(orderNo)) return decryptImportErrors.value.push(`第 ${index + 2} 行：订单编号重复`)
    seen.add(orderNo)
    decryptImportRows.value.push({ orderNo, mobile })
  })
}

const undecryptedExportRows = computed(() => displayedRows.value.filter(row => row.decrypt_status === 'PENDING' && row.order_no))

function exportUndecryptedData() {
  if (!undecryptedExportRows.value.length) return ElMessage.warning('当前列表中没有解密状态为“未解密”且存在订单编号的线索')
  downloadCsv(
    `引流线索_待解密订单_${new Date().toISOString().slice(0, 10)}.csv`,
    ['订单编号', '线索来源', '店铺名称', '原始手机号', '解密状态'],
    undecryptedExportRows.value.map(row => [row.order_no, row.lead_source || row.channel_name, row.shop_name, maskedMobile(row.original_mobile), '未解密'])
  )
  ElMessage.success(`已按当前列表导出 ${undecryptedExportRows.value.length} 条未解密线索订单`)
}

async function confirmBatchAction() {
  const scopeCount = selectedRows.value.length || displayedRows.value.length
  if (batchAction.value === 'ASSIGN' && batchSubtype.value === '人工指定' && !selectedAssigneeId.value) return ElMessage.warning('请从组织架构中选择接收线索的员工')
  if (batchAction.value === 'ASSIGN' && batchSubtype.value === '轮询分配' && !latestCampEligibleCount.value) return ElMessage.warning('最新营期暂无可接待人员，请先维护活码人员名单和分配上限')
  if (batchAction.value === 'ASSIGN' && batchSubtype.value === '人工指定') {
    await Promise.all(selectedRows.value.map(row => http.post(`/leads/${row.id}/assign`, { employeeId: selectedAssigneeId.value })))
  }
  if (batchAction.value === 'SYNC_ORDER') {
    if (!selectedSyncPlatforms.value.length) return ElMessage.warning('请至少选择一个同步平台')
    ElMessage.success(`已按勾选顺序创建 ${selectedSyncPlatforms.value.length} 个后台任务：${selectedSyncPlatforms.value.map((item, index) => `${index + 1}.${item}`).join(' → ')}`)
    batchDialogVisible.value = false
    return
  }
  if (batchAction.value === 'SMS_BROADCAST') {
    if (!smsBroadcastTemplate.value) return ElMessage.warning('请选择短信模板')
    if (!smsBroadcastContent.value.trim()) return ElMessage.warning('短信内容不能为空')
    ElMessage.success(`短信群发任务已创建，共 ${scopeCount} 条线索；发送结果将在任务记录中更新`)
    batchDialogVisible.value = false
    return
  }
  if (batchAction.value === 'IMPORT_DECRYPTED') {
    if (!decryptImportRows.value.length) return ElMessage.warning('请上传包含有效数据的固定模板')
    if (decryptImportErrors.value.length) return ElMessage.warning('请先修正模板中的校验错误')
    const result: any = await http.post('/leads/import-decrypted', { records: decryptImportRows.value })
    const data = result.data
    ElMessage.success(`导入完成：成功覆盖 ${data.successCount} 条，失败 ${data.failureCount} 条`)
    batchDialogVisible.value = false
    await load()
    return
  }
  if (batchAction.value === 'EXPORT_UNDECRYPTED') {
    exportUndecryptedData()
    batchDialogVisible.value = false
    return
  }
  ElMessage.success(`${batchActionLabels[batchAction.value]} · ${batchSubtype.value}任务已创建，共 ${scopeCount} 条数据`)
  batchDialogVisible.value = false
  if (batchAction.value === 'ASSIGN' && batchSubtype.value === '人工指定') await load()
}

watch(() => route.path, () => load())
watch(visibleColumns, value => localStorage.setItem(columnStorageKey, JSON.stringify([...new Set([...value, ...mandatoryColumns])])), { deep: true })
onMounted(() => load())

function normalizeLeadState(source: any) {
  const row = { ...source }
  row.demand_mined = Boolean(row.demand_mined || row.demand_mined_at)
  row.lead_grade ||= row.questionnaire_at ? (row.customer_no === 'C202608160003' ? 'S' : 'B') : 'UNRATED'
  row.grade_source ||= row.questionnaire_at ? 'QUESTIONNAIRE_AUTO' : ''
  row.assignment_status ||= row.owner_id ? 'ASSIGNED' : 'PENDING'
  row.decrypt_status ||= row.decrypted_at || row.decrypted_mobile ? 'DECRYPTED' : 'PENDING'
  row.sms_status ||= row.sms_clicked_at ? 'CLICKED' : Number(row.sms_send_count || 0) > 0 ? 'SENT_NOT_CLICKED' : 'NOT_SENT'
  row.wechat_status ||= row.wechat_added_at ? 'ADDED' : 'NOT_ADDED'
  row.questionnaire_status ||= row.questionnaire_at ? 'FILLED' : row.questionnaire_sent_at ? 'SENT_NOT_FILLED' : 'NOT_SENT'
  row.assessment_status ||= row.assessment_at ? 'COMPLETED' : row.assessment_booked_at ? 'BOOKED_NOT_COMPLETED' : 'NOT_BOOKED'
  if (['INVALID', 'DUPLICATE'].includes(row.lead_mark) || row.conversion_status === 'CONVERTED') row.current_action_status = 'NO_ACTION'
  else if (['PENDING', 'FAILED'].includes(row.assignment_status)) row.current_action_status = 'PENDING_ASSIGNMENT'
  else if (row.questionnaire_status === 'FILLED') row.current_action_status = row.assessment_status === 'COMPLETED' ? 'NURTURE_COMPLETED' : 'PENDING_ASSESSMENT'
  else if (row.wechat_status === 'ADDED') row.current_action_status = 'PENDING_QUESTIONNAIRE'
  else if (['PENDING', 'PROCESSING', 'FAILED'].includes(row.decrypt_status)) row.current_action_status = 'PENDING_DECRYPTION'
  else if (['NOT_SENT', 'FAILED'].includes(row.sms_status)) row.current_action_status = 'PENDING_OUTREACH'
  else if (row.sms_status === 'SENT_NOT_CLICKED') row.current_action_status = 'PENDING_SMS_CLICK'
  else row.current_action_status = 'PENDING_WECHAT'
  return row
}

const displayedRows = computed(() => rows.value.filter(row => {
  const matchesCurrentAction = !currentActionFilter.value || row.current_action_status === currentActionFilter.value
  const matchesAssignment = !assignmentFilter.value || row.assignment_status === assignmentFilter.value
  const matchesDecrypt = !decryptFilter.value || row.decrypt_status === decryptFilter.value
  const matchesSms = !smsFilter.value || row.sms_status === smsFilter.value
  const matchesWechatStatus = !wechatStatusFilter.value || row.wechat_status === wechatStatusFilter.value
  const matchesQuestionnaire = !questionnaireFilter.value || row.questionnaire_status === questionnaireFilter.value
  const matchesAssessment = !assessmentFilter.value || row.assessment_status === assessmentFilter.value
  const matchesMark = !leadMark.value || row.lead_mark === leadMark.value
  const matchesGrade = !leadGradeFilter.value || row.lead_grade === leadGradeFilter.value
  const matchesDemandMined = !demandMinedFilter.value || (demandMinedFilter.value === 'YES' ? row.demand_mined : !row.demand_mined)
  const matchesConversion = !conversionStatus.value || row.conversion_status === conversionStatus.value
  const matchesSource = !sourceFilter.value || row.lead_source === sourceFilter.value
  const matchesOrderStatus = !orderStatusFilter.value || row.order_status === orderStatusFilter.value
  const matchesEntryMethod = !entryMethodFilter.value || row.entry_method === entryMethodFilter.value
  const matchesWechat = !wechatFilter.value || row.wechat_method === wechatFilter.value
  const owner = assignees.value.find(item => Number(item.id) === Number(row.owner_id))
  const ownerOrganizationId = Number(owner?.organization_id || row.owner_organization_id || 0)
  const canViewAuthorizedScope = auth.user?.role === 'ADMIN' && scopeFilters.value.viewScope === 'AUTHORIZED'
  const matchesScopeView = canViewAuthorizedScope || row.owner_name === auth.user?.displayName
  const matchesOrganization = !scopeFilters.value.organizationId || organizationScopeIds(scopeFilters.value.organizationId).includes(ownerOrganizationId)
  const matchesOwner = !scopeFilters.value.ownerId || Number(row.owner_id) === Number(scopeFilters.value.ownerId)
  const matchesCamp = !campFilter.value.trim() || String(row.camp_name || '').toLowerCase().includes(campFilter.value.trim().toLowerCase())
  const matchesShop = !shopFilter.value.trim() || String(row.shop_name || '').toLowerCase().includes(shopFilter.value.trim().toLowerCase())
  const selectedDate = String(row[dateField.value] || '').slice(0, 10)
  const matchesDate = createdRange.value.length !== 2 || (!!selectedDate && selectedDate >= createdRange.value[0] && selectedDate <= createdRange.value[1])
  const text = [row.order_no, row.third_party_product_id, row.name, row.mobile, row.original_mobile, row.decrypted_mobile, row.wechat_nickname, row.customer_no, row.customer_name].join(' ').toLowerCase()
  const matchesKeyword = !keyword.value.trim() || text.includes(keyword.value.trim().toLowerCase())
  return matchesCurrentAction && matchesAssignment && matchesDecrypt && matchesSms && matchesWechatStatus && matchesQuestionnaire && matchesAssessment && matchesMark && matchesGrade && matchesDemandMined && matchesConversion && matchesSource && matchesOrderStatus && matchesEntryMethod && matchesWechat && matchesScopeView && matchesOrganization && matchesOwner && matchesCamp && matchesShop && matchesDate && matchesKeyword
}))
const campOptions = computed(() => [...new Set(rows.value.map(row => String(row.camp_name || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-CN')))
const currentActionLabels: any = {
  PENDING_ASSIGNMENT: '待分配', PENDING_DECRYPTION: '待解密', PENDING_OUTREACH: '待触达', PENDING_SMS_CLICK: '待客户点击',
  PENDING_WECHAT: '待加微', PENDING_QUESTIONNAIRE: '待填问卷', PENDING_ASSESSMENT: '待测评', NURTURE_COMPLETED: '已完成培育', NO_ACTION: '无需处理'
}
const assignmentLabels: any = { PENDING: '待分配', ASSIGNED: '已分配', FAILED: '分配失败', REASSIGNED: '已改派' }
const decryptLabels: any = { NOT_REQUIRED: '无需解密', PENDING: '未解密', PROCESSING: '解密中', DECRYPTED: '已解密', FAILED: '解密失败' }
const smsLabels: any = { NOT_SENT: '未发送', SENDING: '发送中', SENT_NOT_CLICKED: '已发送未点击', CLICKED: '已点击', FAILED: '发送失败' }
const wechatStatusLabels: any = { NOT_ADDED: '未加微', ADDED: '已加微', DELETED: '已删除' }
const questionnaireLabels: any = { NOT_SENT: '未发送', SENT_NOT_FILLED: '已发送未填写', FILLED: '已填写' }
const assessmentLabels: any = { NOT_BOOKED: '未预约', BOOKED_NOT_COMPLETED: '已预约未测评', COMPLETED: '已测评' }
const journeyStatusLabels: any = {
  ...currentActionLabels, ASSIGNED: '已分配', DECRYPTED: '已解密', SMS_NOT_CLICKED: '已发送未点击', SMS_CLICKED: '已点击',
  WECHAT_NOT_ADDED: '未加微', WECHAT_ADDED: '已加微', QUESTIONNAIRE_NOT_FILLED: '未填问卷', QUESTIONNAIRE_FILLED: '已填问卷',
  ASSESSMENT_NOT_COMPLETED: '未测评', ASSESSMENT_COMPLETED: '已测评', NOT_MINED: '未挖需', MINED: '已挖需'
}
const leadMarkLabels: any = { VALID: '有效线索', INVALID: '无效线索', DUPLICATE: '重复线索' }
const leadMarkTagTypes: any = { VALID: 'success', INVALID: 'danger', DUPLICATE: 'warning' }
const conversionLabels: any = { UNCONVERTED: '未转化', CONVERTED: '已转化' }
const conversionTagTypes: any = { UNCONVERTED: 'info', CONVERTED: 'success' }
const gradeLabels: any = { S: 'S级', A: 'A级', B: 'B级', C: 'C级', UNRATED: '未定级' }
const gradeTagTypes: any = { S: 'danger', A: 'warning', B: 'success', C: 'info', UNRATED: 'info' }
const gradeSourceLabels: any = { QUESTIONNAIRE_AUTO: '问卷自动评级', MANUAL: '人工调整', LEAD_INHERITED: '线索继承' }
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
    <PageHeader eyebrow="LEAD TO CUSTOMER" :title="pageTitle" :description="pageDescription" />

    <div class="closure-strip">
      <span class="done">线索接入</span><i></i><span>分配员工活码</span><i></i><span>客户扫码加微</span><i></i><span>唯一客户建档</span>
    </div>

    <div class="surface table-shell">
      <div class="search-panel">
        <BusinessScopeFilter
          v-model="scopeFilters"
          :organizations="organizations"
          :employees="assignees"
          owner-label="当前线索负责人"
          :permission-label="permissionLabel"
          :role="auth.user?.role"
        />
        <div class="search-grid">
          <el-input v-model="keyword" clearable placeholder="订单/商品/客户/手机号/微信昵称"/>
          <el-select v-model="currentActionFilter" placeholder="当前待办状态" clearable><el-option v-for="(label, value) in currentActionLabels" :key="value" :label="label" :value="value"/></el-select>
          <el-select v-model="leadMark" placeholder="线索标记" clearable><el-option v-for="(label, value) in leadMarkLabels" :key="value" :label="label" :value="value"/></el-select>
          <el-select v-model="conversionStatus" placeholder="转化状态" clearable><el-option v-for="(label, value) in conversionLabels" :key="value" :label="label" :value="value"/></el-select>
        </div>
        <el-collapse-transition>
          <div v-show="advancedSearch" class="search-grid advanced-search">
            <el-select v-model="assignmentFilter" placeholder="分配状态" clearable><el-option v-for="(label, value) in assignmentLabels" :key="value" :label="label" :value="value"/></el-select>
            <el-select v-model="decryptFilter" placeholder="解密状态" clearable><el-option v-for="(label, value) in decryptLabels" :key="value" :label="label" :value="value"/></el-select>
            <el-select v-model="smsFilter" placeholder="短信状态" clearable><el-option v-for="(label, value) in smsLabels" :key="value" :label="label" :value="value"/></el-select>
            <el-select v-model="wechatStatusFilter" placeholder="加微状态" clearable><el-option v-for="(label, value) in wechatStatusLabels" :key="value" :label="label" :value="value"/></el-select>
            <el-select v-model="questionnaireFilter" placeholder="问卷状态" clearable><el-option v-for="(label, value) in questionnaireLabels" :key="value" :label="label" :value="value"/></el-select>
            <el-select v-model="assessmentFilter" placeholder="测评状态" clearable><el-option v-for="(label, value) in assessmentLabels" :key="value" :label="label" :value="value"/></el-select>
            <el-select v-model="leadGradeFilter" placeholder="线索等级" clearable><el-option v-for="(label, value) in gradeLabels" :key="value" :label="label" :value="value"/></el-select>
            <el-select v-if="sourceType === 'DRAINAGE'" v-model="demandMinedFilter" placeholder="是否挖需" clearable><el-option label="是" value="YES"/><el-option label="否" value="NO"/></el-select>
            <el-select v-model="sourceFilter" placeholder="线索来源" clearable filterable><el-option v-for="item in leadSourceOptions" :key="item" :label="item" :value="item"/></el-select>
            <el-select v-model="orderStatusFilter" placeholder="订单状态" clearable><el-option v-for="(label, value) in orderLabels" :key="value" :label="label" :value="value"/></el-select>
            <el-select v-model="entryMethodFilter" placeholder="添加方式" clearable><el-option v-for="(label, value) in entryLabels" :key="value" :label="label" :value="value"/></el-select>
            <el-select v-model="wechatFilter" placeholder="加微方式" clearable><el-option label="企业微信" value="WECOM"/><el-option label="个人微信" value="PERSONAL_WECHAT"/></el-select>
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
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-dropdown trigger="click" @command="openBatchAction">
            <el-button type="primary">批量操作⌄</el-button>
            <template #dropdown><el-dropdown-menu>
              <el-dropdown-item command="ASSIGN">分配</el-dropdown-item>
              <el-dropdown-item command="SYNC_ORDER">同步订单</el-dropdown-item>
              <el-dropdown-item command="SMS_BROADCAST">短信群发</el-dropdown-item>
              <el-dropdown-item divided command="IMPORT_DECRYPTED">导入解密数据</el-dropdown-item>
              <el-dropdown-item command="EXPORT_UNDECRYPTED">导出非解密数据</el-dropdown-item>
            </el-dropdown-menu></template>
          </el-dropdown>
          <span>已选择 {{ selectedRows.length }} 条</span>
        </div>
        <el-popover v-model:visible="columnSettingVisible" placement="bottom-end" :width="420" trigger="click">
          <template #reference><el-button circle aria-label="表格设置" title="表格设置"><el-icon><Setting/></el-icon></el-button></template>
          <div class="column-setting-head"><strong>设置展示字段</strong><el-button link type="primary" @click="resetColumns">恢复默认</el-button></div>
          <p class="column-setting-tip">订单编号、线索来源和操作为固定展示列，其他字段可自由设置并自动记忆。</p>
          <el-checkbox-group v-model="visibleColumns" class="column-setting-grid">
            <el-checkbox v-for="item in columnOptions" :key="item.value" :value="item.value" :disabled="item.mandatory">{{ item.label }}</el-checkbox>
          </el-checkbox-group>
        </el-popover>
      </div>
      <StatePanel :loading="loading" :error="error" :empty="!rows.length" empty-text="暂无线索" @retry="load">
        <el-table :data="displayedRows" row-key="id" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="48" fixed="left"/>
          <el-table-column prop="order_no" label="订单编号" width="180" fixed="left"><template #default="{ row }"><strong>{{ textOrDash(row.order_no) }}</strong></template></el-table-column>
          <el-table-column v-if="showColumn('lead_source')" prop="lead_source" label="线索来源" width="110" fixed="left"><template #default="{ row }">{{ textOrDash(row.lead_source || row.channel_name) }}</template></el-table-column>
          <el-table-column v-if="showColumn('lead_grade')" label="线索等级" width="116"><template #default="{ row }"><el-tag :type="gradeTagTypes[row.lead_grade] || 'info'">{{ gradeLabels[row.lead_grade] || row.lead_grade }}</el-tag><small class="cell-sub">{{ gradeSourceLabels[row.grade_source] || '尚未评级' }}</small></template></el-table-column>
          <el-table-column v-if="sourceType === 'DRAINAGE' && showColumn('demand_mined')" label="是否挖需" width="118" align="center"><template #default="{ row }">
            <div class="demand-mined-cell">
              <el-checkbox :model-value="Boolean(row.demand_mined)" :disabled="Boolean(row.demand_mined)" aria-label="标记已挖需" @change="markDemandMined(row, $event)"/>
              <span :class="{ done: row.demand_mined }">{{ row.demand_mined ? '已挖需' : '未挖需' }}</span>
            </div>
          </template></el-table-column>
          <el-table-column v-if="showColumn('third_party_product_id')" prop="third_party_product_id" label="第三方商品ID" width="170"><template #default="{ row }">{{ textOrDash(row.third_party_product_id) }}</template></el-table-column>
          <el-table-column v-if="showColumn('source_type')" prop="source_type" label="线索类型" width="110"><template #default="{ row }">{{ sourceLabels[row.source_type] || row.source_type }}</template></el-table-column>
          <el-table-column v-if="showColumn('order_status')" label="订单状态" width="100"><template #default="{ row }">{{ orderLabels[row.order_status] || textOrDash(row.order_status) }}</template></el-table-column>
          <el-table-column v-if="showColumn('related_customer')" label="关联客户" width="170"><template #default="{ row }"><strong>{{ textOrDash(row.customer_name) }}</strong><small class="cell-sub">{{ textOrDash(row.customer_no) }}</small></template></el-table-column>
          <el-table-column v-if="showColumn('wechat_nickname')" prop="wechat_nickname" label="微信昵称" width="130"><template #default="{ row }">{{ textOrDash(row.wechat_nickname) }}</template></el-table-column>
          <el-table-column v-if="showColumn('original_mobile')" label="原始手机号" width="128"><template #default="{ row }">{{ maskedMobile(row.original_mobile) }}</template></el-table-column>
          <el-table-column v-if="showColumn('decrypted_mobile')" label="解密后手机号" width="128"><template #default="{ row }">{{ maskedMobile(row.decrypted_mobile || row.mobile) }}</template></el-table-column>
          <el-table-column v-if="showColumn('first_product_name')" prop="first_product_name" label="首单商品名称" width="160"><template #default="{ row }">{{ textOrDash(row.first_product_name) }}</template></el-table-column>
          <el-table-column v-if="showColumn('product_remark')" prop="product_remark" label="商品名称备注" width="160"><template #default="{ row }">{{ textOrDash(row.product_remark) }}</template></el-table-column>
          <el-table-column v-if="showColumn('shop_name')" prop="shop_name" label="店铺名称" width="160"><template #default="{ row }">{{ textOrDash(row.shop_name) }}</template></el-table-column>
          <el-table-column v-if="showColumn('paid_amount')" label="实付金额" width="110"><template #default="{ row }">{{ Number(row.paid_amount || 0) ? `¥${Number(row.paid_amount).toFixed(2)}` : '—' }}</template></el-table-column>
          <el-table-column v-if="showColumn('owner')" label="当前线索负责人/员工编号" width="190"><template #default="{ row }"><strong>{{ textOrDash(row.owner_name) }}</strong><small class="cell-sub">{{ textOrDash(row.owner_employee_no) }}</small></template></el-table-column>
          <el-table-column v-if="showColumn('follow_status')" label="跟进状态" width="100"><template #default="{ row }">{{ followLabels[row.follow_status] || textOrDash(row.follow_status) }}</template></el-table-column>
          <el-table-column v-if="showColumn('first_follow_at')" prop="first_follow_at" label="首次跟进时间" width="168"><template #default="{ row }">{{ textOrDash(row.first_follow_at) }}</template></el-table-column>
          <el-table-column v-if="showColumn('created_at')" prop="created_at" label="线索创建时间" width="168"/>
          <el-table-column v-if="showColumn('assigned_at')" prop="assigned_at" label="线索分配时间" width="168"><template #default="{ row }">{{ textOrDash(row.assigned_at) }}</template></el-table-column>
          <el-table-column v-if="showColumn('wechat_added_at')" prop="wechat_added_at" label="加微时间" width="168"><template #default="{ row }">{{ textOrDash(row.wechat_added_at) }}</template></el-table-column>
          <el-table-column v-if="showColumn('decrypted_at')" prop="decrypted_at" label="解密时间" width="168"><template #default="{ row }">{{ textOrDash(row.decrypted_at) }}</template></el-table-column>
          <el-table-column v-if="showColumn('questionnaire_at')" prop="questionnaire_at" label="问卷填写时间" width="168"><template #default="{ row }">{{ textOrDash(row.questionnaire_at) }}</template></el-table-column>
          <el-table-column v-if="showColumn('assessment_at')" prop="assessment_at" label="测评时间" width="168"><template #default="{ row }">{{ textOrDash(row.assessment_at) }}</template></el-table-column>
          <el-table-column v-if="showColumn('customer_linked_at')" prop="customer_linked_at" label="客户建档时间" width="168"><template #default="{ row }">{{ textOrDash(row.customer_linked_at) }}</template></el-table-column>
          <el-table-column v-if="showColumn('converted_at')" prop="converted_at" label="转化时间" width="168"><template #default="{ row }">{{ textOrDash(row.converted_at) }}</template></el-table-column>
          <el-table-column v-if="showColumn('after_sale_at')" prop="after_sale_at" label="售后时间" width="168"><template #default="{ row }">{{ textOrDash(row.after_sale_at) }}</template></el-table-column>
          <el-table-column v-if="showColumn('entry_method')" label="添加方式" width="120"><template #default="{ row }">{{ entryLabels[row.entry_method] || textOrDash(row.entry_method) }}</template></el-table-column>
          <el-table-column v-if="showColumn('wechat_method')" label="加微方式" width="100"><template #default="{ row }">{{ wechatLabels[row.wechat_method] || textOrDash(row.wechat_method) }}</template></el-table-column>
          <el-table-column v-if="showColumn('camp_name')" prop="camp_name" label="所属营期" width="150"><template #default="{ row }">{{ textOrDash(row.camp_name) }}</template></el-table-column>
          <el-table-column v-if="showColumn('sms_send_count')" prop="sms_send_count" label="短信发送次数" width="120"/>
          <el-table-column v-if="showColumn('remark')" prop="remark" label="线索备注" width="220" show-overflow-tooltip/>
          <el-table-column v-if="showColumn('current_action_status')" label="当前待办" width="120"><template #default="{ row }"><el-tag>{{ currentActionLabels[row.current_action_status] || row.current_action_status }}</el-tag></template></el-table-column>
          <el-table-column v-if="showColumn('assignment_status')" label="分配状态" width="105"><template #default="{ row }">{{ assignmentLabels[row.assignment_status] || row.assignment_status }}</template></el-table-column>
          <el-table-column v-if="showColumn('decrypt_status')" label="解密状态" width="105"><template #default="{ row }">{{ decryptLabels[row.decrypt_status] || row.decrypt_status }}</template></el-table-column>
          <el-table-column v-if="showColumn('sms_status')" label="短信状态" width="130"><template #default="{ row }">{{ smsLabels[row.sms_status] || row.sms_status }}</template></el-table-column>
          <el-table-column v-if="showColumn('wechat_status')" label="加微状态" width="105"><template #default="{ row }">{{ wechatStatusLabels[row.wechat_status] || row.wechat_status }}</template></el-table-column>
          <el-table-column v-if="showColumn('questionnaire_status')" label="问卷状态" width="130"><template #default="{ row }">{{ questionnaireLabels[row.questionnaire_status] || row.questionnaire_status }}</template></el-table-column>
          <el-table-column v-if="showColumn('assessment_status')" label="测评状态" width="130"><template #default="{ row }">{{ assessmentLabels[row.assessment_status] || row.assessment_status }}</template></el-table-column>
          <el-table-column v-if="showColumn('lead_mark')" label="线索标记" width="110"><template #default="{ row }"><el-tag :type="leadMarkTagTypes[row.lead_mark] || 'info'">{{ leadMarkLabels[row.lead_mark] || row.lead_mark }}</el-tag></template></el-table-column>
          <el-table-column v-if="showColumn('conversion_status')" label="转化状态" width="112"><template #default="{ row }"><el-tag :type="conversionTagTypes[row.conversion_status] || 'info'">{{ conversionLabels[row.conversion_status] || row.conversion_status }}</el-tag></template></el-table-column>
          <el-table-column label="操作" width="240" fixed="right"><template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button link type="primary" @click="openJourney(row)">旅程</el-button>
            <el-dropdown trigger="click" @command="operationFor(row)">
              <el-button link type="primary">更多⌄</el-button>
              <template #dropdown><el-dropdown-menu>
                <el-dropdown-item v-if="row.wechat_status === 'ADDED' && !row.customer_no" command="CREATE_CUSTOMER">建立客户档案</el-dropdown-item>
                <el-dropdown-item command="CHANGE_MARK">变更线索标记</el-dropdown-item><el-dropdown-item command="REASSIGN">改派负责人</el-dropdown-item>
                <el-dropdown-item divided command="SMS_REMINDER">短信提醒</el-dropdown-item>
                <el-dropdown-item divided command="REMARK">备注</el-dropdown-item>
              </el-dropdown-menu></template>
            </el-dropdown>
          </template></el-table-column>
        </el-table>
      </StatePanel>
    </div>

    <el-dialog v-model="batchDialogVisible" :title="batchActionLabels[batchAction]" :width="batchAction === 'ASSIGN' ? '860px' : batchAction === 'SYNC_ORDER' ? '720px' : batchAction === 'SMS_BROADCAST' ? '640px' : '560px'" class="batch-dialog">
      <div class="batch-dialog-content">
        <el-alert v-if="!['IMPORT_DECRYPTED','EXPORT_UNDECRYPTED'].includes(batchAction)" :closable="false" type="info" show-icon :title="selectedRows.length ? `将处理已勾选的 ${selectedRows.length} 条线索` : `将处理当前查询结果的 ${displayedRows.length} 条线索`"/>
        <el-form v-if="batchSubtypeOptions.length" label-position="top">
          <el-form-item label="操作类型" required>
            <el-radio-group v-model="batchSubtype" class="batch-subtype-list">
              <el-radio v-for="item in batchSubtypeOptions" :key="item" :value="item" border>{{ item }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <div v-if="batchAction === 'ASSIGN' && batchSubtype === '人工指定'" class="assignee-picker">
          <aside class="organization-pane">
            <div class="picker-title"><strong>选择组织</strong><span>公司 / 部门 / 小组</span></div>
            <el-tree :data="organizationTree" node-key="id" default-expand-all highlight-current :expand-on-click-node="false" @node-click="selectOrganization"/>
          </aside>
          <section class="employee-pane">
            <div class="picker-title"><strong>选择员工</strong><span>{{ visibleAssignees.length }} 人</span></div>
            <el-input v-model="assigneeKeyword" class="employee-search" clearable placeholder="搜索员工姓名或员工编号" :prefix-icon="Search"/>
            <div class="employee-grid">
              <button v-for="item in visibleAssignees" :key="item.id" type="button" class="employee-card" :class="{ selected: selectedAssigneeId === item.id }" @click="chooseAssignee(item)">
                <i>{{ item.name.slice(0, 1) }}</i><span><b>{{ item.name }}</b><small>{{ item.employee_no }} · {{ item.position_name }}</small><em>当前负责 {{ item.load || 0 }} 条未转化线索</em></span><u>{{ selectedAssigneeId === item.id ? '已选择' : '可指定' }}</u>
              </button>
            </div>
            <el-empty v-if="!visibleAssignees.length" :image-size="52" :description="assigneeKeyword ? '未找到匹配的员工，请更换姓名或员工编号' : '当前组织暂无可分配员工'"/>
          </section>
        </div>
        <el-alert v-if="batchAction === 'ASSIGN' && batchSubtype === '轮询分配'" :closable="false" type="info" show-icon title="根据最新营期配置的活码人员名单轮询分配" :description="`当前按“${latestCampName}”活码配置执行，共 ${latestCampEligibleCount} 名未达到分配上限的接待人员。`"/>
        <div v-if="batchAction === 'ASSIGN'" class="capacity-note"><b>{{ batchSubtype === '人工指定' ? '人工指定说明' : '轮询上限说明' }}</b><span>{{ batchSubtype === '人工指定' ? '人工指定不受营期活码人员名单和最大分配人数限制，可选择当前组织范围内任意在职、启用员工。' : '轮询员工最大可分配人数在活码配置中维护。达到上限、账号停用或未进入最新营期活码名单的员工，不参与轮询。' }}</span></div>
        <section v-if="batchAction === 'SYNC_ORDER'" class="sync-platform-panel">
          <div class="panel-heading"><div><b>选择同步平台</b><span>按点击勾选的先后顺序执行，每个平台创建一个独立后台任务。</span></div><em>已选 {{ selectedSyncPlatforms.length }} 个</em></div>
          <div class="platform-order-grid">
            <button v-for="platform in syncPlatformOptions" :key="platform" type="button" :class="{ selected: selectedSyncPlatforms.includes(platform) }" @click="toggleSyncPlatform(platform, !selectedSyncPlatforms.includes(platform))">
              <i>{{ selectedSyncPlatforms.indexOf(platform) + 1 || '' }}</i><span>{{ platform }}</span><small>{{ selectedSyncPlatforms.includes(platform) ? '已加入执行队列' : '点击选择' }}</small>
            </button>
          </div>
          <div class="task-order-preview"><b>任务执行顺序</b><span v-if="selectedSyncPlatforms.length"><template v-for="(platform, index) in selectedSyncPlatforms" :key="platform"><em>{{ index + 1 }}. {{ platform }}</em><i v-if="index < selectedSyncPlatforms.length - 1">→</i></template></span><span v-else class="empty-order">尚未选择平台</span></div>
          <el-alert type="info" :closable="false" show-icon title="平台任务独立留痕" description="任务记录保存平台、执行顺序、进度、成功数、失败数和失败原因；单个平台失败不阻断后续平台，可对失败任务单独重试。" />
        </section>
        <section v-if="batchAction === 'SMS_BROADCAST'" class="sms-broadcast-panel">
          <div class="panel-heading"><div><b>短信群发设置</b><span>仅向本次已勾选线索发送，发送前校验有效手机号、退订名单和黑名单。</span></div><em>{{ selectedRows.length }} 人</em></div>
          <el-form label-position="top">
            <el-form-item label="短信模板" required><el-select :model-value="smsBroadcastTemplate" placeholder="选择已审核且启用的短信模板" style="width:100%" @change="applySmsTemplate"><el-option v-for="item in smsTemplateOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
            <el-form-item label="发送内容预览" required><el-input v-model="smsBroadcastContent" type="textarea" :rows="4" maxlength="300" show-word-limit /></el-form-item>
          </el-form>
          <div class="sms-meta"><span><b>短信签名</b>【合数教育】</span><span><b>发送方式</b>后台异步任务</span><span><b>结果记录</b>成功 / 失败 / 供应商回执</span></div>
        </section>
        <section v-if="batchAction === 'IMPORT_DECRYPTED'" class="decrypt-import-panel">
          <div class="import-rule-head"><div><b>固定模板导入</b><span>只按订单编号匹配已有引流线索，仅覆盖手机号，不创建新线索。</span></div><el-button type="primary" plain @click="downloadDecryptTemplate">下载固定模板</el-button></div>
          <el-upload drag accept=".csv,text/csv" :auto-upload="false" :limit="1" :on-change="handleDecryptImportFile">
            <div class="upload-copy"><b>选择或拖入 CSV 文件</b><span>必填列：订单编号、手机号</span></div>
          </el-upload>
          <el-alert v-if="decryptImportErrors.length" type="error" :closable="false" show-icon :title="`发现 ${decryptImportErrors.length} 项错误`" :description="decryptImportErrors.slice(0, 3).join('；')"/>
          <div v-if="decryptImportRows.length" class="import-preview"><div><b>{{ decryptImportFileName }}</b><span>校验通过 {{ decryptImportRows.length }} 条，仅预览前 5 条</span></div><el-table :data="decryptImportRows.slice(0,5)" size="small"><el-table-column prop="orderNo" label="订单编号"/><el-table-column label="手机号"><template #default="{row}">{{ maskedMobile(row.mobile) }}</template></el-table-column></el-table></div>
          <p class="import-security-note">手机号将在服务端校验后加密保存；未命中订单、一个订单命中多条线索或格式错误的数据不会覆盖，并保留失败原因与审计记录。</p>
        </section>
        <section v-if="batchAction === 'EXPORT_UNDECRYPTED'" class="undecrypted-export-panel">
          <div class="export-count"><span>当前列表</span><b>{{ displayedRows.length }}</b><i>条</i><em>→</em><span>可导出的未解密线索订单</span><b>{{ undecryptedExportRows.length }}</b><i>条</i></div>
          <el-alert type="info" :closable="false" show-icon title="导出范围固定为当前列表查询结果" description="系统只导出解密状态为“未解密”且存在订单编号的引流线索；导出文件包含订单编号、来源、店铺、原始脱敏手机号和解密状态。"/>
        </section>
        <p v-if="!['IMPORT_DECRYPTED','EXPORT_UNDECRYPTED'].includes(batchAction)" class="batch-warning">系统将生成可追踪的批量任务，执行进度、成功数量和失败原因会保留在任务记录中。</p>
      </div>
      <template #footer><el-button @click="batchDialogVisible = false">取消</el-button><el-button type="primary" @click="confirmBatchAction">{{ batchAction === 'IMPORT_DECRYPTED' ? '确认导入并覆盖' : batchAction === 'EXPORT_UNDECRYPTED' ? '确认导出' : '确认创建任务' }}</el-button></template>
    </el-dialog>

    <el-drawer v-model="detailVisible" size="620px" :title="`${activeLead?.order_no || '未关联订单'} · 线索详情`">
      <el-descriptions v-if="activeLead" :column="2" border>
        <el-descriptions-item label="客户称呼">{{ textOrDash(activeLead.name) }}</el-descriptions-item>
        <el-descriptions-item label="微信昵称">{{ textOrDash(activeLead.wechat_nickname) }}</el-descriptions-item>
        <el-descriptions-item label="当前待办">{{ currentActionLabels[activeLead.current_action_status] || activeLead.current_action_status }}</el-descriptions-item>
        <el-descriptions-item label="分配状态">{{ assignmentLabels[activeLead.assignment_status] || activeLead.assignment_status }}</el-descriptions-item>
        <el-descriptions-item label="解密状态">{{ decryptLabels[activeLead.decrypt_status] || activeLead.decrypt_status }}</el-descriptions-item>
        <el-descriptions-item label="短信状态">{{ smsLabels[activeLead.sms_status] || activeLead.sms_status }}</el-descriptions-item>
        <el-descriptions-item label="加微状态">{{ wechatStatusLabels[activeLead.wechat_status] || activeLead.wechat_status }}</el-descriptions-item>
        <el-descriptions-item label="问卷/测评">{{ questionnaireLabels[activeLead.questionnaire_status] }} / {{ assessmentLabels[activeLead.assessment_status] }}</el-descriptions-item>
        <el-descriptions-item label="线索等级"><el-tag :type="gradeTagTypes[activeLead.lead_grade] || 'info'">{{ gradeLabels[activeLead.lead_grade] }}</el-tag> · {{ gradeSourceLabels[activeLead.grade_source] || '尚未评级' }}</el-descriptions-item>
        <el-descriptions-item label="是否挖需">{{ activeLead.demand_mined ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="挖需标记记录">{{ activeLead.demand_mined ? `${textOrDash(activeLead.demand_mined_by)} · ${textOrDash(activeLead.demand_mined_at)}` : '—' }}</el-descriptions-item>
        <el-descriptions-item label="转化状态">{{ conversionLabels[activeLead.conversion_status] || activeLead.conversion_status }}</el-descriptions-item>
        <el-descriptions-item label="线索来源">{{ textOrDash(activeLead.lead_source) }}</el-descriptions-item>
        <el-descriptions-item label="第三方商品ID">{{ textOrDash(activeLead.third_party_product_id) }}</el-descriptions-item>
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

    <el-drawer v-model="journeyVisible" size="560px" :title="`${activeLead?.order_no || '未关联订单'} · 线索生命旅程`">
      <div class="journey-summary" v-if="activeLead">
        <el-tag>{{ currentActionLabels[activeLead.current_action_status] || activeLead.current_action_status }}</el-tag>
        <el-tag type="info">{{ assignmentLabels[activeLead.assignment_status] }}</el-tag>
        <el-tag type="info">{{ decryptLabels[activeLead.decrypt_status] }}</el-tag>
        <el-tag :type="leadMarkTagTypes[activeLead.lead_mark] || 'info'">{{ leadMarkLabels[activeLead.lead_mark] }}</el-tag>
        <el-tag :type="gradeTagTypes[activeLead.lead_grade] || 'info'">{{ gradeLabels[activeLead.lead_grade] }}</el-tag>
        <el-tag :type="conversionTagTypes[activeLead.conversion_status] || 'info'">{{ conversionLabels[activeLead.conversion_status] }}</el-tag>
      </div>
      <StatePanel :loading="journeyLoading" :empty="!journeyRows.length" empty-text="暂无旅程日志">
        <el-timeline>
          <el-timeline-item v-for="item in journeyRows" :key="item.id" :timestamp="item.occurred_at" placement="top" type="primary">
            <div class="journey-card"><strong>{{ item.event_name }}</strong><p>{{ item.detail || '—' }}</p>
              <div class="journey-change" v-if="item.from_status || item.to_status"><span>{{ journeyStatusLabels[item.from_status] || item.from_status || '开始' }}</span><b>→</b><span>{{ journeyStatusLabels[item.to_status] || item.to_status || '—' }}</span></div>
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
.business-scope-filter + .search-grid { margin-top: 12px; }
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
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #e7edf5;
  background: #fff;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
}
.column-setting-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.column-setting-tip {
  margin: 8px 0 14px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}
.column-setting-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  max-height: 420px;
  overflow-y: auto;
}
.batch-dialog-content {
  display: grid;
  gap: 18px;
}
.batch-subtype-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
}
.batch-subtype-list :deep(.el-radio) {
  margin-right: 0;
}
.batch-warning {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}
.decrypt-import-panel,
.undecrypted-export-panel {
  display: grid;
  gap: 14px;
}
.import-rule-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid #d9e7fb;
  border-radius: 10px;
  background: #f6f9ff;
}
.import-rule-head div,
.upload-copy,
.import-preview > div {
  display: grid;
  gap: 5px;
}
.import-rule-head b,
.upload-copy b,
.import-preview b { color: #24324a; }
.import-rule-head span,
.upload-copy span,
.import-preview span { color: #718198; font-size: 12px; }
.upload-copy { padding: 12px 0; }
.import-preview { overflow: hidden; border: 1px solid #e4ebf4; border-radius: 10px; }
.import-preview > div { padding: 12px 14px; border-bottom: 1px solid #e4ebf4; background: #f8fafc; }
.import-security-note { margin: 0; color: #64748b; font-size: 12px; line-height: 1.7; }
.export-count {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 20px;
  border: 1px solid #d9e7fb;
  border-radius: 12px;
  background: linear-gradient(135deg, #f7faff 0%, #eef5ff 100%);
  color: #64748b;
}
.export-count b { color: #206de0; font-size: 26px; }
.export-count i { font-style: normal; }
.export-count em { margin: 0 8px; color: #9db3d1; font-size: 20px; font-style: normal; }
.sync-platform-panel,.sms-broadcast-panel{display:grid;gap:14px}.panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.panel-heading>div{display:grid;gap:5px}.panel-heading b{color:#24324a}.panel-heading span{color:#718198;font-size:12px}.panel-heading>em{padding:5px 9px;border-radius:999px;background:#edf5ff;color:#2875e6;font-size:11px;font-style:normal;white-space:nowrap}.platform-order-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.platform-order-grid button{display:grid;grid-template-columns:28px 1fr;gap:2px 8px;align-items:center;padding:12px;border:1px solid #dfe8f3;border-radius:9px;background:#fff;color:#24324a;text-align:left;cursor:pointer}.platform-order-grid button:hover{border-color:#9fc2f2;background:#f8fbff}.platform-order-grid button.selected{border-color:#2875e6;background:#eef5ff;box-shadow:0 0 0 1px #2875e6}.platform-order-grid button i{grid-row:span 2;width:28px;height:28px;display:grid;place-items:center;border-radius:8px;background:#edf3fb;color:#8192a9;font-style:normal;font-weight:700}.platform-order-grid button.selected i{background:#2875e6;color:#fff}.platform-order-grid button span{font-weight:600}.platform-order-grid button small{color:#8a99ad}.task-order-preview{display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:9px;background:#f7f9fc}.task-order-preview>b{color:#475569;font-size:12px;white-space:nowrap}.task-order-preview>span{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.task-order-preview em{padding:4px 7px;border-radius:6px;background:#fff;color:#2875e6;font-size:11px;font-style:normal}.task-order-preview i{color:#a7b6ca;font-style:normal}.task-order-preview .empty-order{color:#94a3b8;font-size:12px}.sms-meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.sms-meta span{display:grid;gap:3px;padding:10px;border-radius:8px;background:#f7f9fc;color:#718198;font-size:11px}.sms-meta b{color:#475569;font-size:12px}
.assignee-picker{display:grid;grid-template-columns:250px 1fr;min-height:286px;border:1px solid #e4ebf4;border-radius:10px;overflow:hidden;background:#fff}.organization-pane{padding:16px;border-right:1px solid #e4ebf4;background:#f8fafc}.employee-pane{padding:16px}.picker-title{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:13px}.picker-title strong{color:#24324a}.picker-title span{color:#94a3b8;font-size:11px}.employee-search{margin-bottom:12px}.employee-search :deep(.el-input__wrapper){border-radius:8px;box-shadow:0 0 0 1px #dbe5f1 inset}.employee-search :deep(.el-input__wrapper.is-focus){box-shadow:0 0 0 1px #2875e6 inset}.organization-pane :deep(.el-tree){background:transparent;color:#53657e}.organization-pane :deep(.el-tree-node__content){height:34px;border-radius:6px}.organization-pane :deep(.el-tree-node__content:hover),.organization-pane :deep(.is-current>.el-tree-node__content){background:#eaf2ff;color:#2875e6}.employee-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;max-height:202px;overflow:auto;padding-right:3px}.employee-card{min-height:86px;padding:11px;border:1px solid #e4ebf4;border-radius:9px;background:#fff;display:grid;grid-template-columns:36px 1fr auto;gap:9px;align-items:start;text-align:left;color:#24324a;cursor:pointer}.employee-card:hover{border-color:#9fc2f2;background:#f8fbff}.employee-card.selected{border-color:#2875e6;background:#eef5ff;box-shadow:0 0 0 1px #2875e6}.employee-card>i{width:36px;height:36px;display:grid;place-items:center;border-radius:9px;background:#eaf2ff;color:#2875e6;font-style:normal;font-weight:700}.employee-card span b,.employee-card span small,.employee-card span em{display:block}.employee-card span small{margin-top:4px;color:#708097;font-size:10px}.employee-card span em{margin-top:8px;color:#5c7190;font-size:10px;font-style:normal}.employee-card u{color:#2875e6;font-size:10px;text-decoration:none}.capacity-note{display:flex;gap:12px;padding:12px 14px;border-radius:8px;background:#fff8ec;color:#79551f;font-size:12px;line-height:1.6}.capacity-note b{white-space:nowrap}.capacity-note span{color:#8b6a36}
.cell-sub {
  display: block;
  margin-top: 4px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 400;
}
.demand-mined-cell { display: inline-flex; align-items: center; gap: 7px; color: #64748b; white-space: nowrap; }
.demand-mined-cell span.done { color: #0f9f6e; font-weight: 600; }
.demand-mined-cell :deep(.el-checkbox.is-disabled .el-checkbox__inner) { border-color: #27b58a; background: #27b58a; }
.demand-mined-cell :deep(.el-checkbox.is-disabled.is-checked .el-checkbox__inner::after) { border-color: #fff; }
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
  .assignee-picker { grid-template-columns: 1fr; }
  .organization-pane { border-right: 0; border-bottom: 1px solid #e5edf7; }
  .platform-order-grid,.sms-meta { grid-template-columns: 1fr 1fr; }
}
</style>
