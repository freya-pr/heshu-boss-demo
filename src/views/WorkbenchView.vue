<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Bell, Calendar, Document, EditPen, Promotion, Reading, Setting, Tickets, User } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'

type Shortcut = { path: string; name: string; description: string; icon: any; tone: string }

const router = useRouter()
const auth = useAuthStore()
const shortcutStorageKey = 'heshu_boss_workbench_shortcuts_v1'
const shortcutOptions: Shortcut[] = [
  { path: '/leads/drainage', name: '引流线索', description: '处理待分配与待跟进线索', icon: Promotion, tone: 'blue' },
  { path: '/leads/qr-codes', name: '活码管理', description: '查看扫码与员工接量情况', icon: Tickets, tone: 'cyan' },
  { path: '/customers/list', name: '客户列表', description: '查询客户档案与服务记录', icon: User, tone: 'indigo' },
  { path: '/questionnaires/list', name: '问卷管理', description: '维护问卷并查看答卷', icon: EditPen, tone: 'violet' },
  { path: '/leads/periods', name: '引流期次', description: '维护当前接量与转化期次', icon: Calendar, tone: 'orange' },
  { path: '/system/exceptions', name: '业务异常', description: '处理同步与核心业务异常', icon: Bell, tone: 'red' }
]

function loadShortcutPaths() {
  try {
    const stored = JSON.parse(localStorage.getItem(shortcutStorageKey) || '[]')
    return Array.isArray(stored) && stored.length ? stored.filter(path => shortcutOptions.some(item => item.path === path)) : shortcutOptions.slice(0, 4).map(item => item.path)
  } catch { return shortcutOptions.slice(0, 4).map(item => item.path) }
}

const selectedShortcutPaths = ref<string[]>(loadShortcutPaths())
const shortcutDraft = ref<string[]>([])
const shortcutDialogVisible = ref(false)
const shortcuts = computed(() => selectedShortcutPaths.value.map(path => shortcutOptions.find(item => item.path === path)).filter(Boolean) as Shortcut[])
const displayName = computed(() => auth.user?.displayName || '林校长')
const greeting = computed(() => {
  const hour = new Date().getHours()
  return hour < 6 ? '夜深了' : hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好'
})

const activities = [
  { time: '10:26', title: '有 12 条新线索等待分配', detail: '来源：抖音直播间 · 2026年8月第1期', path: '/leads/drainage', type: '线索' },
  { time: '09:48', title: '家庭教育需求问卷新增 8 份答卷', detail: '其中 3 份已完成线索等级更新', path: '/questionnaires/list', type: '问卷' },
  { time: '09:12', title: '活码“8月第1期 · 抖音一转”接量正常', detail: '今日扫码 46 次，加微 31 人', path: '/leads/qr-codes', type: '活码' },
  { time: '昨天', title: '1 条企微同步异常等待处理', detail: '可在审计管理中查看原因并重试', path: '/system/wecom-exceptions', type: '异常' }
]

const manuals = [
  { title: '新手入门', description: '了解线索、客户与问卷的基础工作流程', icon: Reading },
  { title: '线索运营手册', description: '查看分配、期次、活码与跟进操作说明', icon: Document },
  { title: '系统配置指南', description: '了解企微、短信、组织和权限配置', icon: Setting }
]

function openShortcutSettings() {
  shortcutDraft.value = [...selectedShortcutPaths.value]
  shortcutDialogVisible.value = true
}
function saveShortcuts() {
  if (!shortcutDraft.value.length) return ElMessage.warning('请至少保留一个快捷导航')
  selectedShortcutPaths.value = [...shortcutDraft.value]
  localStorage.setItem(shortcutStorageKey, JSON.stringify(selectedShortcutPaths.value))
  shortcutDialogVisible.value = false
  ElMessage.success('快捷导航已更新')
}
function openManual(title: string) { ElMessage.info(`${title}将在帮助中心开放，当前为原型演示`) }
</script>

<template>
  <section class="page workbench-page">
    <header class="welcome-panel surface">
      <div class="welcome-avatar"><span>{{ displayName.slice(0, 1) }}</span><i></i></div>
      <div class="welcome-copy">
        <small>WORKDAY · {{ new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }) }}</small>
        <h1>{{ greeting }}，{{ displayName }}！</h1>
        <p>今天也从清晰的线索和客户任务开始，祝你工作顺利。</p>
      </div>
      <div class="today-focus">
        <span>今日待办</span><strong>21</strong><small>12 条待分配 · 8 份新答卷 · 1 条异常</small>
      </div>
    </header>

    <div class="workbench-grid">
      <section class="shortcut-panel surface">
        <header class="panel-head"><div><span>QUICK ACCESS</span><h2>快捷导航</h2></div><el-button circle plain aria-label="配置快捷导航" @click="openShortcutSettings"><el-icon><Setting/></el-icon></el-button></header>
        <div class="shortcut-grid">
          <button v-for="item in shortcuts" :key="item.path" class="shortcut-card" :class="item.tone" @click="router.push(item.path)">
            <i><el-icon><component :is="item.icon"/></el-icon></i><span><b>{{ item.name }}</b><small>{{ item.description }}</small></span><em>进入 →</em>
          </button>
        </div>
        <div v-if="!shortcuts.length" class="shortcut-empty"><span>尚未配置快捷导航</span><el-button type="primary" link @click="openShortcutSettings">立即配置</el-button></div>
      </section>

      <section class="activity-panel surface">
        <header class="panel-head"><div><span>ACTIVITY STREAM</span><h2>最新动态</h2></div><small>自动更新</small></header>
        <div class="activity-list">
          <button v-for="item in activities" :key="`${item.time}-${item.title}`" @click="router.push(item.path)">
            <time>{{ item.time }}</time><i></i><span><b>{{ item.title }}</b><small>{{ item.detail }}</small></span><em>{{ item.type }}</em>
          </button>
        </div>
      </section>

      <section class="manual-panel surface">
        <header class="panel-head"><div><span>HELP CENTER</span><h2>用户手册</h2></div></header>
        <div class="manual-list">
          <button v-for="item in manuals" :key="item.title" @click="openManual(item.title)">
            <i><el-icon><component :is="item.icon"/></el-icon></i><span><b>{{ item.title }}</b><small>{{ item.description }}</small></span><em>查看</em>
          </button>
        </div>
      </section>
    </div>

    <el-dialog v-model="shortcutDialogVisible" title="配置快捷导航" width="640px" destroy-on-close>
      <p class="dialog-intro">选择常用模块，工作台最多展示 6 个快捷入口。</p>
      <el-checkbox-group v-model="shortcutDraft" :max="6" class="shortcut-selector">
        <el-checkbox v-for="item in shortcutOptions" :key="item.path" :value="item.path" border>
          <span><b>{{ item.name }}</b><small>{{ item.description }}</small></span>
        </el-checkbox>
      </el-checkbox-group>
      <template #footer><el-button @click="shortcutDialogVisible=false">取消</el-button><el-button type="primary" @click="saveShortcuts">保存配置</el-button></template>
    </el-dialog>
  </section>
</template>

<style scoped>
.workbench-page{--work-ink:#182b49;--work-blue:#2875e6;--work-cyan:#28b8c7;max-width:1720px;margin:0 auto}.welcome-panel{position:relative;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:24px;min-height:176px;padding:28px 34px;margin-bottom:16px;overflow:hidden;border-color:#d9e7f8;background:linear-gradient(115deg,#fff 0%,#f7fbff 60%,#eaf4ff 100%)}.welcome-panel:after{content:"";position:absolute;right:-70px;top:-110px;width:310px;height:310px;border:46px solid #2875e60b;border-radius:50%}.welcome-avatar{position:relative;width:86px;height:86px;display:grid;place-items:center;border-radius:28px;background:linear-gradient(145deg,#35c4d4,#2875e6);box-shadow:0 16px 34px #2875e62d;color:#fff}.welcome-avatar span{font-size:34px;font-weight:700}.welcome-avatar i{position:absolute;right:6px;bottom:8px;width:13px;height:13px;border:3px solid #fff;border-radius:50%;background:#28bd8b}.welcome-copy{position:relative;z-index:1}.welcome-copy small,.panel-head span{color:var(--work-blue);font:700 10px/1 Inter,system-ui,sans-serif;letter-spacing:.16em}.welcome-copy h1{margin:10px 0 8px;color:var(--work-ink);font-size:28px;letter-spacing:-.02em}.welcome-copy p{margin:0;color:#7c8da4;font-size:14px}.today-focus{position:relative;z-index:1;min-width:245px;padding:18px 20px;border:1px solid #d7e6f8;border-radius:12px;background:#ffffffc9;backdrop-filter:blur(8px)}.today-focus span,.today-focus strong,.today-focus small{display:block}.today-focus span{color:#6f829d;font-size:11px}.today-focus strong{margin:5px 0;color:var(--work-blue);font:700 30px/1 Inter,sans-serif}.today-focus small{color:#8796aa;font-size:10px}.workbench-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(420px,.95fr);gap:16px}.shortcut-panel,.activity-panel,.manual-panel{padding:0;overflow:hidden}.panel-head{display:flex;align-items:center;justify-content:space-between;min-height:78px;padding:0 22px;border-bottom:1px solid var(--line)}.panel-head h2{margin:6px 0 0;color:var(--work-ink);font-size:17px}.panel-head>small{color:#99a6b6;font-size:10px}.shortcut-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:20px}.shortcut-card{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;min-height:92px;padding:15px;border:1px solid #e0e8f2;border-radius:11px;background:#fff;text-align:left;cursor:pointer;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}.shortcut-card:hover{transform:translateY(-2px);border-color:#a9c9f2;box-shadow:0 10px 24px #1b5ca012}.shortcut-card>i,.manual-list>button>i{width:42px;height:42px;display:grid;place-items:center;border-radius:11px;background:#eaf3ff;color:var(--work-blue);font-size:19px}.shortcut-card span b,.shortcut-card span small,.manual-list span b,.manual-list span small,.activity-list span b,.activity-list span small{display:block}.shortcut-card span b{color:var(--work-ink);font-size:13px}.shortcut-card span small{margin-top:6px;color:#8b99aa;font-size:10px}.shortcut-card em{color:#7da5da;font-size:9px;font-style:normal}.shortcut-card.cyan>i{background:#e8fafb;color:#1ca5b2}.shortcut-card.indigo>i{background:#eef0ff;color:#5a66d6}.shortcut-card.violet>i{background:#f5edff;color:#8c58c7}.shortcut-card.orange>i{background:#fff5e8;color:#d88729}.shortcut-card.red>i{background:#fff0f0;color:#d95b5b}.activity-list{padding:8px 20px 18px}.activity-list>button{width:100%;display:grid;grid-template-columns:46px 10px 1fr auto;align-items:center;gap:12px;padding:17px 2px;border:0;border-bottom:1px solid #edf1f5;background:transparent;text-align:left;cursor:pointer}.activity-list>button:last-child{border-bottom:0}.activity-list time{color:#8493a7;font:600 10px Inter,sans-serif}.activity-list>button>i{width:8px;height:8px;border:2px solid #8eb8ef;border-radius:50%;background:#fff;box-shadow:0 0 0 4px #edf5ff}.activity-list span b{color:var(--work-ink);font-size:12px}.activity-list span small{margin-top:5px;color:#8c99aa;font-size:10px}.activity-list em{padding:4px 7px;border-radius:9px;background:#f0f5fb;color:#6680a2;font-size:9px;font-style:normal}.manual-panel{grid-column:1/2}.manual-list{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:18px 20px}.manual-list>button{min-height:132px;padding:15px;border:1px solid #e3e9f1;border-radius:10px;background:#fbfcfe;text-align:left;cursor:pointer}.manual-list>button>i{width:36px;height:36px}.manual-list span b{margin-top:12px;color:var(--work-ink);font-size:12px}.manual-list span small{min-height:32px;margin-top:6px;color:#8b99aa;font-size:9px;line-height:1.6}.manual-list em{display:block;margin-top:10px;color:var(--work-blue);font-size:9px;font-style:normal}.shortcut-empty{padding:50px;text-align:center;color:#8a98aa}.dialog-intro{margin:-5px 0 16px;color:#7d8ca0;font-size:12px}.shortcut-selector{display:grid;grid-template-columns:1fr 1fr;gap:10px}.shortcut-selector :deep(.el-checkbox){width:100%;height:70px;margin:0;padding:12px 14px}.shortcut-selector :deep(.el-checkbox__label){width:100%}.shortcut-selector span b,.shortcut-selector span small{display:block}.shortcut-selector span b{color:var(--work-ink)}.shortcut-selector span small{margin-top:5px;color:#8d9aac;font-size:10px}@media(max-width:1100px){.welcome-panel{grid-template-columns:auto 1fr}.today-focus{grid-column:1/-1}.workbench-grid{grid-template-columns:1fr}.manual-panel{grid-column:auto}}@media(max-width:720px){.welcome-panel{grid-template-columns:1fr;padding:24px}.welcome-avatar{width:68px;height:68px;border-radius:22px}.welcome-copy h1{font-size:22px}.shortcut-grid,.shortcut-selector{grid-template-columns:1fr}.manual-list{grid-template-columns:1fr}.activity-list>button{grid-template-columns:40px 8px 1fr}.activity-list em{display:none}}@media(prefers-reduced-motion:reduce){.shortcut-card{transition:none}}
</style>
