<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CopyDocument, DataAnalysis, Delete, Edit, Link, Plus, Rank, Search, UploadFilled } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'

type QuestionType = '输入框' | '文本域' | '单选组' | '多选组' | '省市区'
type Question = { id: number; title: string; type: QuestionType; required: boolean; tip: string; options: string[] }
type QuestionGroup = { id: number; title: string; description: string; expanded: boolean; questions: Question[] }
type Questionnaire = {
  id: number
  name: string
  enabled: boolean
  intro: string
  wecomTags: string[]
  createdAt: string
  headerImage: string
  footerImage: string
  groups: QuestionGroup[]
  submissions: number
}
type Submission = {
  id: number; avatar: string; nickname: string; questionnaireName: string; loginPhone: string; orderPhone: string
  answerPhone: string; historyPhone: string; logisticsNo: string; address: string; status: string; submittedAt: string; paidAt: string
}

const STORAGE_KEY = 'heshu_boss_questionnaires_v2'
const seedGroups: QuestionGroup[] = [
  { id: 1, title: '第一步：填写基本信息', description: '用于识别客户身份并关联线索档案', expanded: true, questions: [
    { id: 11, title: '请选择您所在地区', type: '省市区', required: true, tip: '请选择地区', options: [] },
    { id: 12, title: '请填写详细收件地址', type: '输入框', required: true, tip: '请输入街道、门牌号等信息', options: [] },
    { id: 13, title: '收件人姓名', type: '输入框', required: true, tip: '请输入真实姓名', options: [] },
  ] },
  { id: 2, title: '第二步：教育规划需求', description: '答案用于线索 S/A/B/C 自动评级', expanded: false, questions: [
    { id: 21, title: '目前最关注的教育规划问题', type: '多选组', required: true, tip: '最多选择 3 项', options: ['学习习惯', '学科规划', '升学路径', '亲子沟通'] },
  ] },
]
const seedRows: Questionnaire[] = [
  { id: 1, name: '【填写地址领取0-18岁教育规划避坑指南】11', enabled: true, intro: '请尽快填写收件信息，以领取纸质版资料。', wecomTags: ['已填写问卷地址'], createdAt: '2026-03-06 18:55:49', headerImage: '教育规划避坑指南', footerImage: '3天完课奖励', groups: seedGroups, submissions: 36662 },
  { id: 2, name: '阿留教育规划入营问卷', enabled: true, intro: '了解家庭现状与教育规划需求。', wecomTags: ['已填蓝皮书问卷'], createdAt: '2026-03-26 17:52:01', headerImage: '', footerImage: '', groups: seedGroups, submissions: 12846 },
  { id: 3, name: '8月21日阿留答疑会-教育规划问题收集', enabled: true, intro: '提前收集答疑问题，直播中集中解答。', wecomTags: ['8.21答疑会问卷填写'], createdAt: '2026-08-20 18:02:32', headerImage: '', footerImage: '', groups: seedGroups.slice(0, 1), submissions: 2108 },
  { id: 4, name: '火花思维家长端&阿留专属福利登记', enabled: false, intro: '', wecomTags: [], createdAt: '2025-09-10 18:11:38', headerImage: '', footerImage: '', groups: seedGroups.slice(0, 1), submissions: 0 },
  { id: 5, name: '【49-阿留教育规划避坑指南地址收集】', enabled: false, intro: '', wecomTags: ['已填写问卷地址'], createdAt: '2025-12-19 09:33:38', headerImage: '', footerImage: '', groups: seedGroups.slice(0, 1), submissions: 8912 },
  { id: 6, name: '家庭教育需求调研', enabled: true, intro: '用于完善客户画像和服务建议。', wecomTags: ['需求已收集'], createdAt: '2026-06-01 21:34:38', headerImage: '', footerImage: '', groups: seedGroups, submissions: 5621 },
  { id: 7, name: '测试问卷', enabled: false, intro: '测试生成效果', wecomTags: [], createdAt: '2026-08-24 11:52:04', headerImage: '', footerImage: '', groups: [], submissions: 0 },
]

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) }
function loadRows() {
  try { const value = localStorage.getItem(STORAGE_KEY); return value ? JSON.parse(value) as Questionnaire[] : seedRows }
  catch { return seedRows }
}
const rows = ref<Questionnaire[]>(loadRows())
watch(rows, value => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)), { deep: true })

const keyword = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const filteredRows = computed(() => rows.value.filter(row => (!keyword.value.trim() || row.name.toLowerCase().includes(keyword.value.trim().toLowerCase())) && (!statusFilter.value || String(row.enabled) === statusFilter.value)))
const pagedRows = computed(() => filteredRows.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value))

const editorVisible = ref(false)
const editingId = ref<number | null>(null)
const editor = reactive<Questionnaire>({ id: 0, name: '', enabled: false, intro: '', wecomTags: [], createdAt: '', headerImage: '', footerImage: '', groups: [], submissions: 0 })
const tagText = ref('')
const questionVisible = ref(false)
const editingQuestion = reactive<Question>({ id: 0, title: '', type: '输入框', required: true, tip: '', options: [] })
const targetGroupId = ref(0)

function openCreate() {
  editingId.value = null
  Object.assign(editor, { id: 0, name: '', enabled: false, intro: '', wecomTags: [], createdAt: '', headerImage: '', footerImage: '', groups: [{ id: Date.now(), title: '', description: '', expanded: true, questions: [] }], submissions: 0 })
  tagText.value = ''
  editorVisible.value = true
}
function openEdit(row: Questionnaire) {
  editingId.value = row.id
  Object.assign(editor, clone(row))
  tagText.value = row.wecomTags.join('、')
  editorVisible.value = true
}
function addGroup() { editor.groups.push({ id: Date.now(), title: '', description: '', expanded: true, questions: [] }) }
async function removeGroup(id: number) {
  await ElMessageBox.confirm('删除分组将同时移除其中的题目，是否继续？', '删除题目分组', { type: 'warning' })
  editor.groups = editor.groups.filter(group => group.id !== id)
}
function moveGroup(index: number, step: number) {
  const target = index + step
  if (target < 0 || target >= editor.groups.length) return
  const item = editor.groups.splice(index, 1)[0]
  editor.groups.splice(target, 0, item)
}
function openQuestion(groupId: number, question?: Question) {
  targetGroupId.value = groupId
  Object.assign(editingQuestion, question ? clone(question) : { id: 0, title: '', type: '输入框', required: true, tip: '', options: [] })
  questionVisible.value = true
}
function saveQuestion() {
  if (!editingQuestion.title.trim()) return ElMessage.warning('请输入题目名称')
  const group = editor.groups.find(item => item.id === targetGroupId.value)
  if (!group) return
  if (editingQuestion.id) {
    const target = group.questions.find(item => item.id === editingQuestion.id)
    if (target) Object.assign(target, clone(editingQuestion))
  } else group.questions.push({ ...clone(editingQuestion), id: Date.now() })
  questionVisible.value = false
}
function removeQuestion(group: QuestionGroup, id: number) { group.questions = group.questions.filter(item => item.id !== id) }
function saveQuestionnaire() {
  if (!editor.name.trim()) return ElMessage.warning('请输入问卷名称')
  if (!editor.groups.length) return ElMessage.warning('请至少创建一个题目分组')
  if (editor.enabled && !editor.groups.some(group => group.questions.length)) return ElMessage.warning('启用问卷前请至少配置一道题目')
  editor.wecomTags = tagText.value.split(/[、,，]/).map(item => item.trim()).filter(Boolean)
  if (editingId.value) {
    const target = rows.value.find(item => item.id === editingId.value)
    if (target) Object.assign(target, clone(editor))
    ElMessage.success('问卷已更新，历史答卷仍保留提交时版本')
  } else {
    rows.value.unshift({ ...clone(editor), id: Date.now(), createdAt: '2026-08-26 10:30:00' })
    ElMessage.success('问卷已创建')
  }
  editorVisible.value = false
}
async function deleteRow(row: Questionnaire) {
  if (row.submissions > 0) {
    await ElMessageBox.confirm(`该问卷已有 ${row.submissions.toLocaleString()} 份答卷，不能物理删除。是否改为停用？`, '已有历史答卷', { type: 'warning' })
    row.enabled = false
    return ElMessage.success('问卷已停用，历史答卷继续保留')
  }
  await ElMessageBox.confirm(`确认删除“${row.name}”吗？`, '删除问卷', { type: 'warning' })
  rows.value = rows.value.filter(item => item.id !== row.id)
  ElMessage.success('问卷已删除')
}

const qrVisible = ref(false)
const activeRow = ref<Questionnaire | null>(null)
const qrCells = computed(() => Array.from({ length: 441 }, (_, index) => {
  const r = Math.floor(index / 21), c = index % 21
  const finder = (x: number, y: number) => r >= x && r < x + 7 && c >= y && c < y + 7 && (r === x || r === x + 6 || c === y || c === y + 6 || (r >= x + 2 && r <= x + 4 && c >= y + 2 && c <= y + 4))
  return finder(0, 0) || finder(0, 14) || finder(14, 0) || ((r * 17 + c * 11 + (activeRow.value?.id || 1) * 7) % 5 < 2)
}))
function openQr(row: Questionnaire) { activeRow.value = row; qrVisible.value = true }
const questionnaireUrl = computed(() => `https://boss.heshu.com/questionnaire/${activeRow.value?.id || ''}`)
const wecomUrl = computed(() => `https://boss.heshu.com/wecom/questionnaire/${activeRow.value?.id || ''}`)
async function copyText(value: string) {
  try { await navigator.clipboard.writeText(value); ElMessage.success('链接已复制') }
  catch { ElMessage.info(`请复制：${value}`) }
}

const statsVisible = ref(false)
const answerVisible = ref(false)
const submissionEditVisible = ref(false)
const activeSubmission = ref<Submission | null>(null)
const statsQuery = reactive({ logisticsNo: '', address: '', status: '', nickname: '', phone: '', orderPhone: '', sold: '', follower: '', shipped: '', refund: '', afterSale: '', submittedRange: [] as string[], paidRange: [] as string[] })
const submissions = ref<Submission[]>([
  { id: 1, avatar: '月', nickname: '月池', questionnaireName: '岳池老师', loginPhone: '15933119971', orderPhone: '-', answerPhone: '15933119971', historyPhone: '-', logisticsNo: '-', address: '河北省石家庄市', status: '首次提交', submittedAt: '2026-08-24 19:31', paidAt: '2026-08-22 11:20' },
  { id: 2, avatar: '齐', nickname: 'qi', questionnaireName: '齐齐', loginPhone: '13631680158', orderPhone: '-', answerPhone: '13631680158', historyPhone: '-', logisticsNo: '-', address: '广东省深圳市', status: '首次提交', submittedAt: '2026-08-24 19:42', paidAt: '-' },
  { id: 3, avatar: '杨', nickname: '杨凡', questionnaireName: '杨凡', loginPhone: '15097752390', orderPhone: '-', answerPhone: '15097752390', historyPhone: '-', logisticsNo: 'SF14932001', address: '湖南省长沙市', status: '已修改', submittedAt: '2026-08-24 20:05', paidAt: '2026-08-23 09:12' },
  { id: 4, avatar: '范', nickname: '🌈范范🍋', questionnaireName: '范范', loginPhone: '13607922343', orderPhone: '-', answerPhone: '13607922343', historyPhone: '-', logisticsNo: '-', address: '江西省南昌市', status: '首次提交', submittedAt: '2026-08-24 20:18', paidAt: '-' },
  { id: 5, avatar: '黄', nickname: '汉堡黄🍔', questionnaireName: '黄', loginPhone: '13985320210', orderPhone: '-', answerPhone: '13985320210', historyPhone: '-', logisticsNo: '-', address: '浙江省杭州市', status: '首次提交', submittedAt: '2026-08-24 20:31', paidAt: '-' },
  { id: 6, avatar: '李', nickname: '星星之火', questionnaireName: '李宝芬', loginPhone: '13145316356', orderPhone: '-', answerPhone: '13145316356', historyPhone: '-', logisticsNo: '-', address: '湖北省武汉市', status: '首次提交', submittedAt: '2026-08-24 20:46', paidAt: '-' },
])
const filteredSubmissions = computed(() => submissions.value.filter(item =>
  (!statsQuery.logisticsNo || item.logisticsNo.includes(statsQuery.logisticsNo)) &&
  (!statsQuery.address || item.address.includes(statsQuery.address)) &&
  (!statsQuery.status || item.status === statsQuery.status) &&
  (!statsQuery.nickname || item.nickname.includes(statsQuery.nickname)) &&
  (!statsQuery.phone || item.loginPhone.includes(statsQuery.phone)) &&
  (!statsQuery.orderPhone || item.orderPhone.includes(statsQuery.orderPhone))))
function openStats(row: Questionnaire) { activeRow.value = row; statsVisible.value = true }
function resetStats() { Object.assign(statsQuery, { logisticsNo: '', address: '', status: '', nickname: '', phone: '', orderPhone: '', sold: '', follower: '', shipped: '', refund: '', afterSale: '', submittedRange: [], paidRange: [] }) }
function openSubmission(row: Submission, edit = false) { activeSubmission.value = clone(row); edit ? submissionEditVisible.value = true : answerVisible.value = true }
function saveSubmission() {
  if (!activeSubmission.value) return
  const target = submissions.value.find(item => item.id === activeSubmission.value!.id)
  if (target) Object.assign(target, clone(activeSubmission.value))
  submissionEditVisible.value = false
  ElMessage.success('答卷补充信息已保存并写入修改记录')
}
function exportCsv(type: 'all' | 'first') {
  const data = type === 'first' ? filteredSubmissions.value.filter(item => item.status === '首次提交') : filteredSubmissions.value
  const lines = ['用户昵称,问卷姓名,登录手机号,问卷手机号,物流单号,地址,提交状态,提交时间', ...data.map(item => [item.nickname, item.questionnaireName, item.loginPhone, item.answerPhone, item.logisticsNo, item.address, item.status, item.submittedAt].join(','))]
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${activeRow.value?.name || '问卷'}-${type === 'first' ? '一转数据' : '答卷数据'}.csv`; link.click(); URL.revokeObjectURL(link.href)
  ElMessage.success(`已导出 ${data.length} 条数据`)
}
</script>

<template>
  <section class="page questionnaire-page">
    <PageHeader eyebrow="QUESTIONNAIRE · 客户需求采集" title="问卷管理" description="统一维护问卷结构、企微标签、二维码与答卷数据，问卷结果可作为线索 S/A/B/C 评级输入。">
      <el-button type="primary" :icon="Plus" @click="openCreate">添加问卷</el-button>
    </PageHeader>

    <div class="filter-card surface">
      <el-input v-model="keyword" clearable :prefix-icon="Search" placeholder="请输入问卷名称" @keyup.enter="currentPage = 1" />
      <el-select v-model="statusFilter" clearable placeholder="启用状态"><el-option label="启用" value="true" /><el-option label="停用" value="false" /></el-select>
      <el-button type="primary">查询</el-button><el-button @click="keyword = ''; statusFilter = ''">重置</el-button>
    </div>

    <article class="questionnaire-ledger surface">
      <header><div><h3>问卷列表</h3><span>共 {{ filteredRows.length }} 份问卷</span></div><p>启用问卷可生成填写链接和二维码；已有答卷的问卷仅允许停用</p></header>
      <el-table :data="pagedRows" row-key="id">
        <el-table-column label="问卷名称" min-width="280"><template #default="{ row }"><div class="name-cell"><b>{{ row.name }}</b><small>{{ row.groups.length }} 个分组 · {{ row.groups.reduce((sum: number, group: QuestionGroup) => sum + group.questions.length, 0) }} 道题</small></div></template></el-table-column>
        <el-table-column label="是否启用" width="105"><template #default="{ row }"><el-tag :type="row.enabled ? 'success' : 'info'" effect="light">{{ row.enabled ? '是' : '否' }}</el-tag></template></el-table-column>
        <el-table-column label="介绍语" min-width="260" show-overflow-tooltip><template #default="{ row }">{{ row.intro || '—' }}</template></el-table-column>
        <el-table-column label="企微标签" min-width="210"><template #default="{ row }"><div class="tag-list"><el-tag v-for="tag in row.wecomTags" :key="tag" effect="plain">{{ tag }}</el-tag><span v-if="!row.wecomTags.length">—</span></div></template></el-table-column>
        <el-table-column label="答卷数" width="110"><template #default="{ row }"><el-button link type="primary" @click="openStats(row)">{{ row.submissions.toLocaleString() }}</el-button></template></el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="170" />
        <el-table-column label="操作" width="270" fixed="right"><template #default="{ row }"><el-button link type="primary" :icon="Edit" @click="openEdit(row)">编辑</el-button><el-button link type="primary" :icon="Link" @click="openQr(row)">二维码</el-button><el-button link type="primary" :icon="DataAnalysis" @click="openStats(row)">数据统计</el-button><el-button link type="danger" :icon="Delete" @click="deleteRow(row)">删除</el-button></template></el-table-column>
      </el-table>
      <footer><span>问卷启用后，结构变更保留版本快照</span><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background layout="total, sizes, prev, pager, next, jumper" :total="filteredRows.length" :page-sizes="[10, 20, 50]" /></footer>
    </article>

    <el-dialog v-model="editorVisible" :title="editingId ? '编辑问卷' : '添加问卷'" width="94vw" top="3vh" class="editor-dialog" destroy-on-close>
      <div class="editor-shell">
        <section class="identity-panel">
          <h3>问卷信息</h3>
          <el-form label-position="top">
            <el-form-item label="问卷名称" required><el-input v-model="editor.name" maxlength="80" show-word-limit placeholder="请输入问卷名称" /></el-form-item>
            <el-form-item label="介绍语"><el-input v-model="editor.intro" type="textarea" :rows="4" maxlength="200" show-word-limit placeholder="请输入问卷介绍语" /></el-form-item>
            <div class="upload-row">
              <el-form-item label="头部图片"><button class="upload-box" type="button" @click="editor.headerImage = editor.headerImage ? '' : '头图已上传'"><el-icon><UploadFilled /></el-icon><b>{{ editor.headerImage || '上传图片' }}</b><small>建议 750 × 320 px</small></button></el-form-item>
              <el-form-item label="底部图片"><button class="upload-box" type="button" @click="editor.footerImage = editor.footerImage ? '' : '底图已上传'"><el-icon><UploadFilled /></el-icon><b>{{ editor.footerImage || '上传图片' }}</b><small>支持 JPG / PNG</small></button></el-form-item>
            </div>
            <el-form-item label="问卷状态"><div class="switch-line"><span :class="{ active: !editor.enabled }">停用</span><el-switch v-model="editor.enabled" /><span :class="{ active: editor.enabled }">启用</span></div></el-form-item>
            <el-form-item label="企微标签"><el-input v-model="tagText" placeholder="多个标签用逗号分隔" /><small class="field-tip">客户提交问卷后同步命中的企微标签。</small></el-form-item>
          </el-form>
        </section>
        <section class="question-canvas">
          <header><div><h3>题目分组</h3><p>拖拽式结构在演示版中通过上下移动实现</p></div><el-button type="primary" :icon="Plus" @click="addGroup">添加分组</el-button></header>
          <div class="group-stack">
            <article v-for="(group, groupIndex) in editor.groups" :key="group.id" class="question-group">
              <div class="group-head">
                <el-icon class="drag"><Rank /></el-icon>
                <div class="group-fields"><el-input v-model="group.title" placeholder="分组标题" /><el-input v-model="group.description" placeholder="分组描述" /></div>
                <div class="group-actions"><el-button type="primary" @click="openQuestion(group.id)">添加题目</el-button><el-button type="danger" plain @click="removeGroup(group.id)">删除分组</el-button><el-button text @click="moveGroup(groupIndex, -1)">上移</el-button><el-button text @click="moveGroup(groupIndex, 1)">下移</el-button><el-button text @click="group.expanded = !group.expanded">{{ group.expanded ? '收起' : '展开' }}</el-button></div>
              </div>
              <div v-show="group.expanded" class="question-list">
                <div v-for="question in group.questions" :key="question.id" class="question-item"><el-icon><Rank /></el-icon><div><b>{{ question.title }}</b><small>{{ question.type }} · {{ question.required ? '必填' : '选填' }}</small></div><el-button link type="primary" @click="openQuestion(group.id, question)">编辑</el-button><el-button link type="danger" @click="removeQuestion(group, question.id)">删除</el-button></div>
                <div v-if="!group.questions.length" class="empty-questions"><span>该分组暂无题目</span><el-button type="primary" :icon="Plus" @click="openQuestion(group.id)">添加题目</el-button></div>
              </div>
            </article>
            <el-empty v-if="!editor.groups.length" description="暂未创建题目分组"><el-button type="primary" @click="addGroup">添加分组</el-button></el-empty>
          </div>
        </section>
      </div>
      <template #footer><el-button @click="editorVisible = false">取消</el-button><el-button type="primary" @click="saveQuestionnaire">确定</el-button></template>
    </el-dialog>

    <el-dialog v-model="questionVisible" :title="editingQuestion.id ? '编辑题目' : '添加题目'" width="720px">
      <el-form label-position="top"><el-form-item label="题目名称" required><el-input v-model="editingQuestion.title" placeholder="请输入题目名称" /></el-form-item><el-form-item label="题目类型" required><el-select v-model="editingQuestion.type" style="width:100%"><el-option v-for="type in ['输入框','文本域','单选组','多选组','省市区']" :key="type" :label="type" :value="type" /></el-select></el-form-item><el-form-item label="是否必填"><el-switch v-model="editingQuestion.required" /></el-form-item><el-form-item label="输入提示"><el-input v-model="editingQuestion.tip" placeholder="填写占位说明或限制条件" /></el-form-item><el-form-item v-if="['单选组','多选组'].includes(editingQuestion.type)" label="选项"><el-input :model-value="editingQuestion.options.join('、')" placeholder="多个选项用顿号分隔" @update:model-value="editingQuestion.options = String($event).split(/[、,，]/).filter(Boolean)" /></el-form-item><div class="preview-card"><b>{{ editingQuestion.title || '题目名称' }} <i v-if="editingQuestion.required">*</i></b><el-input :placeholder="editingQuestion.tip || '请输入'" disabled /></div></el-form>
      <template #footer><el-button @click="questionVisible = false">取消</el-button><el-button type="primary" @click="saveQuestion">确定</el-button></template>
    </el-dialog>

    <el-dialog v-model="qrVisible" title="问卷二维码" width="680px" class="qr-dialog">
      <div class="qr-content"><div class="qr-grid"><i v-for="(dark, index) in qrCells" :key="index" :class="{ dark }"></i></div><h3>{{ activeRow?.name }}</h3><div class="link-row"><span>填写链接</span><code>{{ questionnaireUrl }}</code><el-button type="primary" :icon="CopyDocument" @click="copyText(questionnaireUrl)">复制链接</el-button></div><div class="link-row"><span>企微查询链接</span><code>{{ wecomUrl }}</code><el-button type="primary" plain :icon="CopyDocument" @click="copyText(wecomUrl)">复制链接</el-button></div></div>
    </el-dialog>

    <el-dialog v-model="statsVisible" :title="activeRow?.name" width="96vw" top="2vh" class="stats-dialog">
      <div class="stats-filter">
        <el-input v-model="statsQuery.logisticsNo" placeholder="物流单号" /><el-input v-model="statsQuery.address" placeholder="地址" /><el-select v-model="statsQuery.status" clearable placeholder="提交状态"><el-option label="首次提交" value="首次提交" /><el-option label="已修改" value="已修改" /></el-select><el-input v-model="statsQuery.nickname" placeholder="用户昵称" /><el-input v-model="statsQuery.phone" placeholder="登录手机号" /><el-input v-model="statsQuery.orderPhone" placeholder="下单手机号" />
        <el-select v-model="statsQuery.sold" clearable placeholder="是否成交"><el-option label="是" value="是" /><el-option label="否" value="否" /></el-select><el-select v-model="statsQuery.follower" clearable placeholder="跟进人"><el-option label="李士文" value="李士文" /><el-option label="王老师" value="王老师" /></el-select><el-select v-model="statsQuery.shipped" clearable placeholder="是否发货"><el-option label="是" value="是" /><el-option label="否" value="否" /></el-select><el-select v-model="statsQuery.refund" clearable placeholder="是否退款"><el-option label="是" value="是" /><el-option label="否" value="否" /></el-select><el-select v-model="statsQuery.afterSale" clearable placeholder="是否售后"><el-option label="是" value="是" /><el-option label="否" value="否" /></el-select>
        <el-date-picker v-model="statsQuery.submittedRange" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="提交开始时间" end-placeholder="提交结束时间" /><el-date-picker v-model="statsQuery.paidRange" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="支付开始时间" end-placeholder="支付结束时间" />
      </div>
      <div class="stats-actions"><el-button type="primary">搜索</el-button><el-button @click="resetStats">重置</el-button><el-button plain type="primary" @click="ElMessage.info('请选择标准模板文件，演示版不写入真实答卷')">导入模板</el-button><el-button type="primary" @click="exportCsv('all')">导出数据</el-button><el-button type="primary" @click="exportCsv('first')">导出一转数据</el-button></div>
      <el-table :data="filteredSubmissions" height="500" border><el-table-column type="index" label="序号" width="70" /><el-table-column label="用户" min-width="130"><template #default="{ row }"><div class="user-cell"><i>{{ row.avatar }}</i>{{ row.nickname }}</div></template></el-table-column><el-table-column prop="questionnaireName" label="问卷姓名" min-width="130" /><el-table-column prop="loginPhone" label="登录手机号" min-width="135" /><el-table-column prop="orderPhone" label="下单手机号" min-width="135" /><el-table-column prop="answerPhone" label="问卷手机号" min-width="135" /><el-table-column prop="historyPhone" label="历史修改手机号" min-width="155" /><el-table-column prop="logisticsNo" label="物流单号" min-width="140" /><el-table-column prop="address" label="地址" min-width="180" /><el-table-column prop="status" label="提交状态" min-width="110" /><el-table-column prop="submittedAt" label="提交时间" min-width="155" /><el-table-column label="操作" width="180" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openSubmission(row, true)">编辑</el-button><el-button link type="primary" @click="openSubmission(row)">提交内容</el-button></template></el-table-column></el-table>
      <div class="stats-pager"><span>共 {{ activeRow?.submissions.toLocaleString() }} 条</span><el-pagination background layout="sizes, prev, pager, next, jumper" :total="activeRow?.submissions || 0" :page-sizes="[10,20,50]" /></div>
    </el-dialog>

    <el-dialog v-model="answerVisible" title="答卷提交内容" width="720px"><el-descriptions v-if="activeSubmission" :column="1" border><el-descriptions-item label="用户">{{ activeSubmission.nickname }}</el-descriptions-item><el-descriptions-item label="所在地区">{{ activeSubmission.address }}</el-descriptions-item><el-descriptions-item label="联系电话">{{ activeSubmission.answerPhone }}</el-descriptions-item><el-descriptions-item label="教育规划需求">学习习惯、升学路径、亲子沟通</el-descriptions-item><el-descriptions-item label="系统评级输入">问卷得分 86 分，建议线索等级 A</el-descriptions-item><el-descriptions-item label="提交时间">{{ activeSubmission.submittedAt }}</el-descriptions-item></el-descriptions></el-dialog>
    <el-dialog v-model="submissionEditVisible" title="补充答卷信息" width="620px"><el-form v-if="activeSubmission" label-position="top"><el-form-item label="问卷手机号"><el-input v-model="activeSubmission.answerPhone" /></el-form-item><el-form-item label="物流单号"><el-input v-model="activeSubmission.logisticsNo" /></el-form-item><el-form-item label="收件地址"><el-input v-model="activeSubmission.address" /></el-form-item><el-form-item label="提交状态"><el-select v-model="activeSubmission.status" style="width:100%"><el-option label="首次提交" value="首次提交" /><el-option label="已修改" value="已修改" /></el-select></el-form-item></el-form><template #footer><el-button @click="submissionEditVisible = false">取消</el-button><el-button type="primary" @click="saveSubmission">保存</el-button></template></el-dialog>
  </section>
</template>

<style scoped>
.questionnaire-page{--ink:#173052;--muted:#71829a;--line:#dfe7f2;--blue:#2f76ec;padding-bottom:48px}.surface{background:#fff;border:1px solid var(--line);border-radius:18px;box-shadow:0 10px 28px rgba(24,55,96,.06)}.filter-card{display:grid;grid-template-columns:minmax(260px,460px) 180px auto auto;gap:12px;padding:18px;margin:18px 0}.questionnaire-ledger{overflow:hidden}.questionnaire-ledger>header{display:flex;align-items:center;justify-content:space-between;padding:22px 24px;border-bottom:1px solid var(--line)}.questionnaire-ledger h3,.question-canvas h3,.identity-panel h3{margin:0;color:var(--ink);font-size:20px}.questionnaire-ledger header div{display:flex;align-items:baseline;gap:12px}.questionnaire-ledger header span,.questionnaire-ledger header p{color:var(--muted);font-size:13px;margin:0}.questionnaire-ledger>footer{display:flex;align-items:center;justify-content:space-between;padding:18px 24px;color:var(--muted);font-size:13px}.name-cell,.created-cell{display:flex;flex-direction:column;gap:5px}.name-cell b{color:var(--ink);font-size:14px}.name-cell small{color:#93a2b6}.tag-list{display:flex;gap:6px;flex-wrap:wrap}.editor-shell{display:grid;grid-template-columns:minmax(320px,38%) 1fr;gap:0;min-height:70vh;border:1px solid var(--line);border-radius:16px;overflow:hidden}.identity-panel{padding:26px;background:#fbfcff;border-right:1px solid var(--line)}.identity-panel>h3{padding-bottom:18px;border-bottom:1px solid var(--line);margin-bottom:20px}.upload-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}.upload-box{width:100%;min-height:146px;border:1px dashed #bfd0e7;border-radius:12px;background:#fff;color:#74869e;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer}.upload-box:hover{border-color:var(--blue);color:var(--blue)}.upload-box .el-icon{font-size:28px}.upload-box small,.field-tip{color:#96a5b7;font-size:12px;margin-top:7px}.switch-line{display:flex;align-items:center;gap:12px}.switch-line span{color:#8999ad}.switch-line .active{color:var(--blue);font-weight:700}.question-canvas{background:#f5f8fd;padding:24px}.question-canvas>header{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}.question-canvas header p{margin:5px 0 0;color:var(--muted);font-size:12px}.group-stack{display:flex;flex-direction:column;gap:14px;max-height:64vh;overflow:auto;padding-right:6px}.question-group{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden}.group-head{display:grid;grid-template-columns:28px minmax(280px,1fr) auto;align-items:center;gap:12px;padding:16px}.drag{color:#95a3b7;cursor:grab}.group-fields{display:grid;grid-template-columns:1fr 1fr;gap:10px}.group-actions{display:flex;align-items:center;flex-wrap:wrap;justify-content:flex-end}.question-list{border-top:1px solid var(--line);padding:12px;background:#fbfcfe}.question-item{display:grid;grid-template-columns:24px 1fr auto auto;align-items:center;gap:10px;padding:12px 14px;background:#fff;border:1px solid #e7edf6;border-radius:10px;margin-bottom:8px}.question-item>div{display:flex;flex-direction:column;gap:4px}.question-item b{color:var(--ink)}.question-item small{color:var(--muted)}.empty-questions{min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:#9aa8ba}.preview-card{padding:18px;background:#f5f8fd;border-radius:12px;display:flex;flex-direction:column;gap:12px}.preview-card i{color:#f05252}.qr-content{display:flex;flex-direction:column;align-items:center;gap:18px}.qr-grid{width:230px;height:230px;padding:14px;background:#fff;border:1px solid var(--line);display:grid;grid-template-columns:repeat(21,1fr);grid-template-rows:repeat(21,1fr);box-shadow:0 10px 30px rgba(23,48,82,.12)}.qr-grid i.dark{background:#15243a}.qr-content h3{margin:0;color:var(--ink);text-align:center}.link-row{width:100%;display:grid;grid-template-columns:96px 1fr auto;gap:12px;align-items:center;padding:12px 0;border-top:1px solid var(--line)}.link-row span{color:var(--muted)}.link-row code{white-space:normal;word-break:break-all;color:#405570}.stats-filter{display:grid;grid-template-columns:repeat(6,minmax(150px,1fr));gap:10px}.stats-filter .el-date-editor{grid-column:span 2;width:100%}.stats-actions{display:flex;gap:8px;padding:14px 0}.stats-pager{display:flex;justify-content:flex-end;align-items:center;gap:16px;padding-top:16px}.user-cell{display:flex;align-items:center;gap:8px}.user-cell i{width:34px;height:34px;border-radius:50%;background:#e9f1ff;color:var(--blue);display:grid;place-items:center;font-style:normal;font-weight:700}.el-table{--el-table-header-bg-color:#f6f8fc;--el-table-header-text-color:#405570;--el-table-row-hover-bg-color:#f5f9ff}:deep(.editor-dialog .el-dialog__body),:deep(.stats-dialog .el-dialog__body){padding-top:10px}:deep(.el-dialog){border-radius:18px}:deep(.el-dialog__header){padding:22px 24px;border-bottom:1px solid var(--line)}:deep(.el-dialog__footer){padding:16px 24px;border-top:1px solid var(--line)}
@media(max-width:1100px){.editor-shell{grid-template-columns:1fr}.identity-panel{border-right:0;border-bottom:1px solid var(--line)}.stats-filter{grid-template-columns:repeat(3,1fr)}.filter-card{grid-template-columns:1fr 180px auto auto}.group-head{grid-template-columns:24px 1fr}.group-actions{grid-column:2;justify-content:flex-start}}@media(max-width:720px){.filter-card{grid-template-columns:1fr}.upload-row,.group-fields,.stats-filter{grid-template-columns:1fr}.stats-filter .el-date-editor{grid-column:auto}.link-row{grid-template-columns:1fr}.question-canvas,.identity-panel{padding:16px}.questionnaire-ledger>header,.questionnaire-ledger>footer{align-items:flex-start;flex-direction:column;gap:12px}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
</style>
