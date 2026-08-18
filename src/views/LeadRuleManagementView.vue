<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Aim, Connection, CopyDocument, DataAnalysis, Plus, Search, SetUp, Tickets, VideoPlay } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'

type RuleCategory = '活码分配' | '营期名单流转'
type RuleStatus = '草稿' | '已发布' | '已停用'
type Rule = {
  id: number
  code: string
  name: string
  category: RuleCategory
  trigger: string
  condition: string
  action: string
  scope: string
  priority: number
  status: RuleStatus
  version: string
  updatedBy: string
  updatedAt: string
}

const categories = [
  { key: 'all', label: '全部规则', description: '统一查看与检索', icon: Tickets },
  { key: '活码分配', label: '分配与接待', description: '活码轮询和接量资格', icon: Aim },
  { key: '营期名单流转', label: '营期名单流转', description: '跨营期员工名单同步', icon: Connection }
] as const

const rules = ref<Rule[]>([
  {
    id: 1, code: 'RULE-LIVE-001', name: '当前营期活码轮询分配', category: '活码分配',
    trigger: '客户扫码 / 批量轮询', condition: '活码启用，员工在轮询名单内且未达接量上限',
    action: '按名单顺序分配接待员工', scope: '全部一转活码', priority: 10, status: '已发布', version: 'V1.3', updatedBy: '张铭钰', updatedAt: '2026-08-19 10:30'
  },
  {
    id: 2, code: 'RULE-CAMP-001', name: '高转化员工同步下一营期', category: '营期名单流转',
    trigger: '营期结束后每日 02:00', condition: '有效分配≥30条，转化率≥18%，员工在职且启用',
    action: '加入下一营期活码轮询名单', scope: '一转事业部', priority: 20, status: '已发布', version: 'V1.1', updatedBy: '林校长', updatedAt: '2026-08-18 16:42'
  },
  {
    id: 3, code: 'RULE-CAMP-002', name: '秋季营期名单预演', category: '营期名单流转',
    trigger: '手动试算', condition: '来源营期=暑期三营，转化率≥20%',
    action: '生成秋季体验营候选名单', scope: '课程顾问岗位', priority: 30, status: '草稿', version: 'V0.2', updatedBy: '张铭钰', updatedAt: '2026-08-19 14:12'
  }
])

const query = reactive({ keyword: '', category: '', status: '', trigger: '' })
const selectedCategory = ref<'all' | RuleCategory>('all')
const drawerVisible = ref(false)
const detailVisible = ref(false)
const simulateVisible = ref(false)
const activeRule = ref<Rule | null>(null)
const editingId = ref<number | null>(null)
const currentStep = ref(0)
const form = reactive({
  name: '', category: '活码分配' as RuleCategory, description: '', scope: '全部一转活码', priority: 10,
  triggerMode: '事件触发', triggerEvent: '客户扫码', sourceCamp: '2026 暑期第 3 营', targetCamp: '2026 秋季体验营',
  minLeads: 30, conversionRate: 18, employeeStatus: true, liveCodeStatus: true, underLimit: true,
  allocationMode: '轮询分配', conflictStrategy: '命中后停止', failureStrategy: '进入异常中心', effectiveAt: '', versionNote: ''
})

const filteredRules = computed(() => rules.value.filter(rule => {
  const keyword = query.keyword.trim().toLowerCase()
  const category = selectedCategory.value === 'all' ? query.category : selectedCategory.value
  return (!keyword || `${rule.name}${rule.code}${rule.condition}${rule.action}`.toLowerCase().includes(keyword))
    && (!category || rule.category === category)
    && (!query.status || rule.status === query.status)
    && (!query.trigger || rule.trigger.includes(query.trigger))
}))

const publishedCount = computed(() => rules.value.filter(rule => rule.status === '已发布').length)
const draftCount = computed(() => rules.value.filter(rule => rule.status === '草稿').length)

function categoryCount(key: 'all' | RuleCategory) {
  return key === 'all' ? rules.value.length : rules.value.filter(rule => rule.category === key).length
}
function resetForm() {
  Object.assign(form, {
    name: '', category: selectedCategory.value === 'all' ? '活码分配' : selectedCategory.value, description: '', scope: '全部一转活码', priority: 10,
    triggerMode: '事件触发', triggerEvent: '客户扫码', sourceCamp: '2026 暑期第 3 营', targetCamp: '2026 秋季体验营',
    minLeads: 30, conversionRate: 18, employeeStatus: true, liveCodeStatus: true, underLimit: true,
    allocationMode: '轮询分配', conflictStrategy: '命中后停止', failureStrategy: '进入异常中心', effectiveAt: '', versionNote: ''
  })
}
function openCreate(category?: RuleCategory) {
  editingId.value = null
  resetForm()
  if (category) form.category = category
  currentStep.value = 0
  drawerVisible.value = true
}
function openEdit(rule: Rule) {
  editingId.value = rule.id
  resetForm()
  Object.assign(form, { name: rule.name, category: rule.category, scope: rule.scope, priority: rule.priority })
  currentStep.value = 0
  drawerVisible.value = true
  if (rule.status === '已发布') ElMessage.info('已发布规则不可直接覆盖，本次修改将生成新草稿版本')
}
function ruleCondition() {
  if (form.category === '活码分配') {
    const values = [form.liveCodeStatus && '活码启用', form.employeeStatus && '员工在职且启用', form.underLimit && '未达接量上限'].filter(Boolean)
    return values.join('，') || '无附加条件'
  }
  return `有效分配≥${form.minLeads}条，转化率≥${form.conversionRate}%，员工在职且启用`
}
function ruleTrigger() {
  if (form.category === '活码分配') return form.triggerMode === '事件触发' ? form.triggerEvent : form.triggerMode
  return form.triggerMode === '定时触发' ? '营期结束后每日 02:00' : form.triggerMode
}
function ruleAction() {
  return form.category === '活码分配' ? `${form.allocationMode}接待员工` : `加入${form.targetCamp}活码轮询名单`
}
function saveDraft(publish = false) {
  if (!form.name.trim()) return ElMessage.warning('请输入规则名称')
  if (form.category === '营期名单流转' && form.sourceCamp === form.targetCamp) return ElMessage.warning('来源营期和目标营期不能相同')
  const now = new Date().toLocaleString('zh-CN', { hour12: false })
  const status: RuleStatus = publish ? '已发布' : '草稿'
  if (editingId.value) {
    const old = rules.value.find(rule => rule.id === editingId.value)!
    Object.assign(old, { name: form.name, category: form.category, trigger: ruleTrigger(), condition: ruleCondition(), action: ruleAction(), scope: form.scope, priority: form.priority, status, version: publish ? `V${Number(old.version.slice(1) || 0) + 0.1}` : old.version, updatedBy: '林校长', updatedAt: now })
  } else {
    rules.value.unshift({ id: Date.now(), code: `RULE-${form.category === '活码分配' ? 'LIVE' : 'CAMP'}-${String(rules.value.length + 1).padStart(3, '0')}`, name: form.name, category: form.category, trigger: ruleTrigger(), condition: ruleCondition(), action: ruleAction(), scope: form.scope, priority: form.priority, status, version: publish ? 'V1.0' : 'V0.1', updatedBy: '林校长', updatedAt: now })
  }
  drawerVisible.value = false
  ElMessage.success(publish ? '规则已发布并进入生效队列' : '规则草稿已保存')
}
function showDetail(rule: Rule) { activeRule.value = rule; detailVisible.value = true }
function simulate(rule: Rule) { activeRule.value = rule; simulateVisible.value = true }
async function toggleRule(rule: Rule) {
  if (rule.status === '草稿') return ElMessage.warning('草稿需要发布后才能启用或停用')
  const next: RuleStatus = rule.status === '已发布' ? '已停用' : '已发布'
  await ElMessageBox.confirm(`确定将“${rule.name}”设为${next}吗？`, '规则状态变更', { type: 'warning' })
  rule.status = next
  ElMessage.success(`规则已${next === '已发布' ? '启用' : '停用'}`)
}
function copyRule(rule: Rule) {
  rules.value.unshift({ ...rule, id: Date.now(), code: `${rule.code}-COPY`, name: `${rule.name}（副本）`, status: '草稿', version: 'V0.1', updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }) })
  ElMessage.success('已复制为草稿，可继续编辑')
}
function resetQuery() { Object.assign(query, { keyword: '', category: '', status: '', trigger: '' }) }
function statusType(status: RuleStatus) { return status === '已发布' ? 'success' : status === '草稿' ? 'warning' : 'info' }
</script>

<template>
  <section class="page rule-page">
    <PageHeader title="线索规则中心" description="按规则域管理触发条件和业务动作，支持试算、版本发布与冲突控制。">
      <el-button :icon="DataAnalysis" @click="ElMessage.success('检测完成：当前规则无阻断冲突')">冲突检测</el-button>
      <el-button type="primary" :icon="Plus" @click="openCreate()">新建规则</el-button>
    </PageHeader>

    <div class="rule-summary surface">
      <div><span>规则总数</span><b>{{ rules.length }}</b></div>
      <div><span>已发布</span><b>{{ publishedCount }}</b></div>
      <div><span>待完善草稿</span><b>{{ draftCount }}</b></div>
      <p><i></i><span>已发布规则通过版本管理变更，不直接覆盖线上配置。</span></p>
    </div>

    <div class="rule-layout">
      <aside class="category-panel surface">
        <header><div><el-icon><SetUp /></el-icon><h3>规则分类</h3></div></header>
        <nav aria-label="规则分类">
          <button v-for="item in categories" :key="item.key" :class="{ active: selectedCategory === item.key }" @click="selectedCategory = item.key">
            <el-icon><component :is="item.icon" /></el-icon><span><b>{{ item.label }}</b><small>{{ item.description }}</small></span><em>{{ categoryCount(item.key) }}</em>
          </button>
        </nav>
        <div class="growth-note"><b>可持续扩展</b><p>后续清洗、标签、回收等规则按业务域注册，无需新增一张独立页面。</p></div>
      </aside>

      <main class="rule-main">
        <div class="filter-bar surface">
          <el-input v-model="query.keyword" clearable :prefix-icon="Search" placeholder="搜索规则名称、编号、条件或动作" />
          <el-select v-if="selectedCategory === 'all'" v-model="query.category" clearable placeholder="规则分类"><el-option label="活码分配" value="活码分配"/><el-option label="营期名单流转" value="营期名单流转"/></el-select>
          <el-select v-model="query.status" clearable placeholder="规则状态"><el-option v-for="item in ['草稿','已发布','已停用']" :key="item" :label="item" :value="item"/></el-select>
          <el-select v-model="query.trigger" clearable placeholder="触发方式"><el-option label="事件触发" value="扫码"/><el-option label="定时触发" value="02:00"/><el-option label="手动触发" value="手动"/></el-select>
          <el-button type="primary">查询</el-button><el-button @click="resetQuery">重置</el-button>
        </div>

        <article class="rule-list surface">
          <header><div><h3>{{ selectedCategory === 'all' ? '全部规则' : categories.find(item => item.key === selectedCategory)?.label }}</h3><span>共 {{ filteredRules.length }} 条</span></div><el-button v-if="selectedCategory !== 'all'" link type="primary" :icon="Plus" @click="openCreate(selectedCategory)">新增此类规则</el-button></header>
          <el-table :data="filteredRules" row-key="id">
            <el-table-column label="规则" min-width="210"><template #default="{ row }"><div class="rule-name"><b>{{ row.name }}</b><span>{{ row.code }} · {{ row.version }}</span><small>{{ row.category }}</small></div></template></el-table-column>
            <el-table-column label="规则链" min-width="500"><template #default="{ row }"><div class="rule-chain"><div><small>触发</small><b>{{ row.trigger }}</b></div><i>→</i><div class="condition"><small>判断条件</small><b>{{ row.condition }}</b></div><i>→</i><div><small>执行动作</small><b>{{ row.action }}</b></div></div></template></el-table-column>
            <el-table-column label="适用范围" min-width="135" prop="scope"/>
            <el-table-column label="优先级" width="82"><template #default="{ row }"><span class="priority">P{{ row.priority }}</span></template></el-table-column>
            <el-table-column label="状态" width="90"><template #default="{ row }"><el-tag :type="statusType(row.status)" effect="light">{{ row.status }}</el-tag></template></el-table-column>
            <el-table-column label="最后更新" width="145"><template #default="{ row }"><div class="update-cell"><b>{{ row.updatedBy }}</b><span>{{ row.updatedAt }}</span></div></template></el-table-column>
            <el-table-column label="操作" width="245" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="showDetail(row)">详情</el-button><el-button link type="primary" :icon="VideoPlay" @click="simulate(row)">试算</el-button><el-button link type="primary" @click="openEdit(row)">编辑</el-button><el-dropdown trigger="click"><el-button link type="primary">更多⌄</el-button><template #dropdown><el-dropdown-menu><el-dropdown-item :icon="CopyDocument" @click="copyRule(row)">复制为草稿</el-dropdown-item><el-dropdown-item @click="ElMessage.info(`${row.name} 当前版本：${row.version}`)">版本记录</el-dropdown-item><el-dropdown-item divided @click="toggleRule(row)">{{ row.status === '已发布' ? '停用规则' : '启用规则' }}</el-dropdown-item></el-dropdown-menu></template></el-dropdown></template></el-table-column>
          </el-table>
          <el-empty v-if="!filteredRules.length" description="暂无符合条件的规则" />
        </article>
      </main>
    </div>

    <el-drawer v-model="drawerVisible" :title="editingId ? '编辑规则并生成新版本' : '新建规则'" size="760px" class="rule-drawer">
      <el-steps :active="currentStep" finish-status="success" simple><el-step title="基础与触发"/><el-step title="条件与动作"/><el-step title="试算与发布"/></el-steps>
      <el-form label-position="top" class="rule-form">
        <template v-if="currentStep === 0">
          <section><h4>规则基本信息</h4><div class="form-grid">
            <el-form-item label="规则名称" required><el-input v-model="form.name" maxlength="40" show-word-limit placeholder="请输入可识别的业务规则名称"/></el-form-item>
            <el-form-item label="规则分类" required><el-select v-model="form.category"><el-option label="活码分配" value="活码分配"/><el-option label="营期名单流转" value="营期名单流转"/></el-select></el-form-item>
            <el-form-item label="适用范围" required><el-input v-model="form.scope" placeholder="例如：全部一转活码 / 一转事业部"/></el-form-item>
            <el-form-item label="执行优先级"><el-input-number v-model="form.priority" :min="1" :max="999"/><small>数值越小越先执行；相同对象规则按优先级依次判断。</small></el-form-item>
            <el-form-item label="规则说明" class="span-2"><el-input v-model="form.description" type="textarea" :rows="3" placeholder="说明业务目的、适用边界和负责人"/></el-form-item>
          </div></section>
          <section><h4>触发方式</h4><el-radio-group v-model="form.triggerMode" class="trigger-options"><el-radio-button value="事件触发">事件触发</el-radio-button><el-radio-button value="定时触发">定时触发</el-radio-button><el-radio-button value="手动试算">手动试算</el-radio-button></el-radio-group><div v-if="form.category === '活码分配'" class="trigger-tip"><b>推荐：事件触发</b><span>客户扫码或执行批量轮询时实时判断接待资格。</span></div><div v-else class="trigger-tip"><b>推荐：营期结束后定时执行</b><span>每日 02:00 重算，可手动补跑；同一员工不会重复加入同一目标营期。</span></div></section>
        </template>

        <template v-else-if="currentStep === 1">
          <section v-if="form.category === '活码分配'"><h4>活码分配条件</h4><div class="condition-list"><el-checkbox v-model="form.liveCodeStatus">活码状态为启用</el-checkbox><el-checkbox v-model="form.employeeStatus">员工账号在职且启用</el-checkbox><el-checkbox v-model="form.underLimit">员工当前接量未达到活码配置上限</el-checkbox></div><div class="business-note"><b>规则边界</b><span>员工接量上限仅约束自动轮询。人工指定分配不受营期活码名单和接量上限限制。</span></div></section>
          <section v-else><h4>营期名单流转条件</h4><div class="form-grid"><el-form-item label="来源营期" required><el-select v-model="form.sourceCamp" filterable><el-option label="2026 暑期第 3 营" value="2026 暑期第 3 营"/><el-option label="2026 暑期第 2 营" value="2026 暑期第 2 营"/></el-select></el-form-item><el-form-item label="目标营期" required><el-select v-model="form.targetCamp" filterable><el-option label="2026 秋季体验营" value="2026 秋季体验营"/><el-option label="2026 暑期第 3 营" value="2026 暑期第 3 营"/></el-select></el-form-item><el-form-item label="最小有效分配量"><el-input-number v-model="form.minLeads" :min="1"/><small>避免少量样本造成虚高转化率。</small></el-form-item><el-form-item label="最低转化率"><el-input-number v-model="form.conversionRate" :min="0" :max="100"><template #suffix>%</template></el-input-number><small>转化率=已转化有效线索数÷有效分配线索数。</small></el-form-item></div><el-checkbox v-model="form.employeeStatus">仅同步在职且启用的员工</el-checkbox></section>
          <section><h4>执行动作与冲突处理</h4><div class="form-grid"><el-form-item label="执行动作"><el-select v-if="form.category === '活码分配'" v-model="form.allocationMode"><el-option label="轮询分配" value="轮询分配"/><el-option label="按顺序分配" value="按顺序分配"/></el-select><el-input v-else :model-value="`加入 ${form.targetCamp} 活码轮询名单`" disabled/></el-form-item><el-form-item label="同对象规则冲突"><el-select v-model="form.conflictStrategy"><el-option label="命中后停止" value="命中后停止"/><el-option label="合并非冲突动作" value="合并非冲突动作"/><el-option label="高优先级覆盖" value="高优先级覆盖"/></el-select></el-form-item><el-form-item label="失败处理"><el-select v-model="form.failureStrategy"><el-option label="进入异常中心" value="进入异常中心"/><el-option label="自动重试3次后转人工" value="自动重试3次后转人工"/></el-select></el-form-item><el-form-item label="重复数据策略"><el-input model-value="已在目标名单则跳过，不删除人工加入人员" disabled/></el-form-item></div></section>
        </template>

        <template v-else>
          <section><h4>发布前预览</h4><div class="preview-chain"><div><small>触发</small><b>{{ ruleTrigger() }}</b></div><i>→</i><div><small>条件</small><b>{{ ruleCondition() }}</b></div><i>→</i><div><small>动作</small><b>{{ ruleAction() }}</b></div></div></section>
          <section><h4>规则试算</h4><div class="simulation-card"><div><span>模拟数据范围</span><b>{{ form.category === '活码分配' ? '近 7 日扫码线索' : form.sourceCamp }}</b></div><div><span>预计命中</span><b>{{ form.category === '活码分配' ? '1,284 条线索' : '18 名员工' }}</b></div><div><span>冲突 / 异常</span><b>0 / 2</b></div><el-button :icon="VideoPlay" @click="ElMessage.success('试算完成，明细已刷新')">重新试算</el-button></div></section>
          <section><h4>版本信息</h4><div class="form-grid"><el-form-item label="计划生效时间"><el-date-picker v-model="form.effectiveAt" type="datetime" placeholder="发布后立即生效"/></el-form-item><el-form-item label="版本说明" required><el-input v-model="form.versionNote" placeholder="说明本次新增或变更内容"/></el-form-item></div><div class="publish-note">发布后生成不可变版本；再次编辑将创建新草稿，可从版本记录回退。</div></section>
        </template>
      </el-form>
      <template #footer><div class="drawer-footer"><el-button v-if="currentStep > 0" @click="currentStep--">上一步</el-button><span></span><el-button @click="drawerVisible = false">取消</el-button><el-button v-if="currentStep < 2" type="primary" @click="currentStep++">下一步</el-button><template v-else><el-button @click="saveDraft(false)">保存草稿</el-button><el-button type="primary" @click="saveDraft(true)">发布规则</el-button></template></div></template>
    </el-drawer>

    <el-drawer v-model="detailVisible" title="规则详情与版本" size="620px"><template v-if="activeRule"><div class="detail-head"><el-tag :type="statusType(activeRule.status)">{{ activeRule.status }}</el-tag><h2>{{ activeRule.name }}</h2><p>{{ activeRule.code }} · {{ activeRule.version }}</p></div><el-descriptions :column="1" border><el-descriptions-item label="规则分类">{{ activeRule.category }}</el-descriptions-item><el-descriptions-item label="适用范围">{{ activeRule.scope }}</el-descriptions-item><el-descriptions-item label="优先级">P{{ activeRule.priority }}</el-descriptions-item><el-descriptions-item label="触发方式">{{ activeRule.trigger }}</el-descriptions-item><el-descriptions-item label="判断条件">{{ activeRule.condition }}</el-descriptions-item><el-descriptions-item label="执行动作">{{ activeRule.action }}</el-descriptions-item><el-descriptions-item label="更新信息">{{ activeRule.updatedBy }} · {{ activeRule.updatedAt }}</el-descriptions-item></el-descriptions><h3 class="history-title">版本记录</h3><el-timeline><el-timeline-item :timestamp="activeRule.updatedAt" type="primary"><b>{{ activeRule.version }} 当前版本</b><p>规则配置更新并完成冲突检测。</p></el-timeline-item><el-timeline-item timestamp="2026-08-10 09:20"><b>V1.0 首次发布</b><p>建立规则基础条件与执行动作。</p></el-timeline-item></el-timeline></template></el-drawer>

    <el-dialog v-model="simulateVisible" title="规则试算结果" width="680px"><template v-if="activeRule"><div class="simulate-result"><div><span>规则</span><b>{{ activeRule.name }}</b></div><div><span>试算范围</span><b>{{ activeRule.scope }}</b></div><div><span>命中对象</span><b>{{ activeRule.category === '活码分配' ? '1,284 条线索' : '18 名员工' }}</b></div><div><span>未命中</span><b>{{ activeRule.category === '活码分配' ? '126 条线索' : '7 名员工' }}</b></div></div><el-alert title="试算不会写入业务数据" description="结果基于当前模拟数据和规则版本生成，发布前可下载明细复核。" type="info" show-icon :closable="false"/></template><template #footer><el-button @click="simulateVisible = false">关闭</el-button><el-button type="primary" @click="ElMessage.success('试算明细已导出')">导出明细</el-button></template></el-dialog>
  </section>
</template>

<style scoped>
.rule-page{--rule-ink:#142541;--rule-blue:#2875e6;--rule-mint:#24b89b}.rule-summary{display:grid;grid-template-columns:130px 130px 150px 1fr;align-items:center;gap:18px;padding:16px 20px;margin-bottom:14px}.rule-summary>div{padding-right:18px;border-right:1px solid var(--line)}.rule-summary span,.rule-summary b{display:block}.rule-summary span{font-size:11px;color:var(--muted)}.rule-summary b{margin-top:4px;font:700 23px Inter,"PingFang SC",sans-serif;color:var(--rule-ink)}.rule-summary p{display:flex;align-items:center;gap:9px;justify-self:end;margin:0;color:#647690;font-size:11px}.rule-summary p i{width:7px;height:7px;border-radius:50%;background:var(--rule-mint);box-shadow:0 0 0 5px #24b89b18}.rule-layout{display:grid;grid-template-columns:250px minmax(0,1fr);align-items:start;gap:14px}.category-panel{position:sticky;top:12px;overflow:hidden}.category-panel header{height:62px;display:flex;align-items:center;padding:0 16px;border-bottom:1px solid var(--line)}.category-panel header>div{display:flex;gap:8px;align-items:center}.category-panel h3{margin:0;color:var(--rule-ink);font-size:15px}.category-panel nav{display:grid;gap:5px;padding:10px}.category-panel nav button{display:grid;grid-template-columns:26px 1fr auto;align-items:center;gap:9px;width:100%;padding:12px 10px;border:0;border-radius:8px;background:transparent;color:#5e7088;text-align:left;cursor:pointer;transition:.18s ease}.category-panel nav button:hover{background:#f3f7fd;color:var(--rule-blue);transform:translateX(2px)}.category-panel nav button.active{background:#eaf2ff;color:var(--rule-blue)}.category-panel nav span b,.category-panel nav span small{display:block}.category-panel nav span b{font-size:12px}.category-panel nav span small{margin-top:3px;color:#92a0b3;font-size:9px;font-weight:400}.category-panel nav em{min-width:24px;padding:2px 6px;border-radius:10px;background:#eef2f7;color:#7d8ca0;font-size:10px;font-style:normal;text-align:center}.category-panel nav button.active em{background:#fff;color:var(--rule-blue)}.growth-note{margin:4px 10px 12px;padding:13px;border:1px dashed #c9d8eb;border-radius:8px;background:#f8fbff}.growth-note b{font-size:11px;color:#3d5879}.growth-note p{margin:5px 0 0;color:#8a98aa;font-size:9px;line-height:1.65}.rule-main{min-width:0}.filter-bar{display:grid;grid-template-columns:minmax(240px,1.6fr) repeat(3,minmax(130px,.7fr)) auto auto;gap:9px;padding:13px 15px;margin-bottom:14px}.rule-list{padding:0 16px 16px}.rule-list>header{height:62px;display:flex;align-items:center;justify-content:space-between}.rule-list>header>div{display:flex;align-items:baseline;gap:9px}.rule-list h3{margin:0;color:var(--rule-ink);font-size:16px}.rule-list header span{color:#8c99aa;font-size:10px}.rule-name b,.rule-name>span,.rule-name small{display:block}.rule-name b{color:var(--rule-ink);font-size:12px}.rule-name>span{margin-top:4px;color:#8a99ac;font-size:9px}.rule-name small{width:max-content;margin-top:7px;padding:2px 6px;border-radius:9px;background:#edf4ff;color:var(--rule-blue);font-size:9px}.rule-chain{display:grid;grid-template-columns:minmax(105px,.8fr) 18px minmax(170px,1.35fr) 18px minmax(140px,1fr);align-items:center;gap:4px}.rule-chain>div{min-height:55px;padding:9px 10px;border:1px solid #dce6f3;border-radius:7px;background:#f9fbfe}.rule-chain>div.condition{border-color:#cdddf1;background:#f3f7fd}.rule-chain small,.rule-chain b{display:block}.rule-chain small{color:#94a1b2;font-size:8px}.rule-chain b{margin-top:4px;color:#40536d;font-size:10px;line-height:1.5}.rule-chain>i{color:#91b5ea;font-style:normal;text-align:center}.priority{display:inline-flex;padding:3px 7px;border-radius:10px;background:#f0f3f7;color:#687a91;font:600 10px Inter,sans-serif}.update-cell b,.update-cell span{display:block}.update-cell b{color:#40526b;font-size:11px}.update-cell span{margin-top:4px;color:#92a0b1;font-size:8px}.rule-form{padding-top:22px}.rule-form section{padding-bottom:22px;margin-bottom:22px;border-bottom:1px solid var(--line)}.rule-form section h4{margin:0 0 16px;padding-left:10px;border-left:3px solid var(--rule-blue);color:var(--rule-ink)}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}.span-2{grid-column:1/-1}.rule-form :deep(.el-select),.rule-form :deep(.el-date-editor){width:100%}.rule-form :deep(.el-form-item__content>small){margin-top:6px;color:#93a0b1;font-size:9px}.trigger-options{margin-bottom:14px}.trigger-tip,.business-note{display:flex;flex-direction:column;gap:5px;padding:13px 15px;border-radius:8px;background:#f3f7fd;color:#6e8098;font-size:11px}.trigger-tip b,.business-note b{color:#36577f}.condition-list{display:grid;gap:13px;padding:16px;border:1px solid #dce5f1;border-radius:8px;margin-bottom:13px}.business-note{background:#fff8e9;color:#876328}.business-note b{color:#79531a}.preview-chain{display:grid;grid-template-columns:1fr 24px 1.4fr 24px 1fr;align-items:center;gap:6px}.preview-chain>div{min-height:72px;padding:13px;border:1px solid #cadbf0;border-radius:8px;background:#f5f9ff}.preview-chain small,.preview-chain b{display:block}.preview-chain small{color:#8c9aad;font-size:9px}.preview-chain b{margin-top:6px;color:#294667;font-size:11px;line-height:1.6}.preview-chain i{color:#82ade9;font-style:normal;text-align:center}.simulation-card{display:grid;grid-template-columns:repeat(3,1fr) auto;align-items:center;gap:12px;padding:15px;border-radius:9px;background:#f5f8fc}.simulation-card span,.simulation-card b{display:block}.simulation-card span{color:#8b99ab;font-size:9px}.simulation-card b{margin-top:5px;color:var(--rule-ink);font-size:12px}.publish-note{padding:12px 14px;border-radius:8px;background:#fff8e8;color:#8c672b;font-size:10px}.drawer-footer{display:grid;grid-template-columns:auto 1fr auto auto auto;gap:8px}.detail-head{padding:20px;margin-bottom:18px;border-radius:10px;background:#f3f7fd}.detail-head h2{margin:12px 0 5px;color:var(--rule-ink)}.detail-head p{margin:0;color:#8190a4}.history-title{margin:26px 0 18px;color:var(--rule-ink)}.simulate-result{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}.simulate-result>div{padding:14px;border:1px solid #dce5f1;border-radius:8px}.simulate-result span,.simulate-result b{display:block}.simulate-result span{color:#8997a9;font-size:10px}.simulate-result b{margin-top:5px;color:var(--rule-ink)}@media(max-width:1300px){.filter-bar{grid-template-columns:1.4fr repeat(2,1fr) auto auto}.filter-bar .el-select:nth-of-type(3){display:none}.rule-chain{grid-template-columns:1fr 14px 1.25fr}.rule-chain>div:last-child,.rule-chain>i:last-of-type{display:none}}@media(max-width:980px){.rule-layout{grid-template-columns:1fr}.category-panel{position:static}.category-panel nav{display:flex;overflow:auto}.category-panel nav button{min-width:190px}.growth-note{display:none}.rule-summary{grid-template-columns:repeat(3,1fr)}.rule-summary p{grid-column:1/-1;justify-self:start}.filter-bar{grid-template-columns:1fr 1fr auto auto}}
@media(max-width:1300px){.rule-chain{grid-template-columns:minmax(90px,.8fr) 14px minmax(150px,1.25fr) 14px minmax(120px,1fr)}.rule-chain>div:last-child{display:block}.rule-chain>i:last-of-type{display:block}}
</style>
