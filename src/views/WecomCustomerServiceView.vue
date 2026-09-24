<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatDotRound, Plus, Search } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'

type Corp = { id: string; name: string; status: '已授权' | '待续期' }
type ServiceAccount = { id: string; corpId: string; name: string; code: string; department: string; staff: number; status: '启用' | '停用'; updatedAt: string }

const corps: Corp[] = [
  { id: 'ww89d89a4f1eb5d1f1', name: '光合成长教育', status: '已授权' },
  { id: 'ww62a7e418cd930b26', name: '合数教育科技', status: '已授权' },
  { id: 'ww13cf0678e523bd90', name: '一转教育服务', status: '待续期' }
]

const accounts: ServiceAccount[] = [
  { id: '1', corpId: corps[0].id, name: '课程咨询客服', code: 'KF_COURSE_01', department: '深圳二转团队', staff: 8, status: '启用', updatedAt: '2026-09-22 09:36' },
  { id: '2', corpId: corps[0].id, name: '售后服务客服', code: 'KF_AFTERSALE_01', department: '客户成功部', staff: 5, status: '启用', updatedAt: '2026-09-21 17:20' },
  { id: '3', corpId: corps[1].id, name: '直播咨询客服', code: 'KF_LIVE_01', department: '直播运营部', staff: 6, status: '启用', updatedAt: '2026-09-20 14:08' },
  { id: '4', corpId: corps[2].id, name: '续费咨询客服', code: 'KF_RENEW_01', department: '续费服务部', staff: 3, status: '停用', updatedAt: '2026-09-18 11:42' }
]

const selectedCorpId = ref(corps[0].id)
const activeTab = ref('accounts')
const keyword = ref('')

const selectedCorp = computed(() => corps.find(item => item.id === selectedCorpId.value) || corps[0])
const scopedAccounts = computed(() => accounts.filter(item => item.corpId === selectedCorpId.value))
const filteredAccounts = computed(() => scopedAccounts.value.filter(item => !keyword.value || `${item.name}${item.code}${item.department}`.includes(keyword.value.trim())))
const eventCount = computed(() => scopedAccounts.value.length * 7 + (selectedCorpId.value === corps[0].id ? 4 : 1))
const messageCount = computed(() => scopedAccounts.value.reduce((sum, item) => sum + item.staff * 12, 0))

function switchCorp() {
  keyword.value = ''
  activeTab.value = 'accounts'
  ElMessage.success(`已切换至${selectedCorp.value.name}，页面数据已更新`)
}

function createAccount() {
  ElMessage.info(`将在“${selectedCorp.value.name}”下新增微信客服账号`)
}
</script>

<template>
  <section class="page service-page">
    <PageHeader eyebrow="HESHU BOSS · WECOM SERVICE" title="微信客服管理" description="按企业微信主体管理客服账号、事件消息和服务记录。" />

    <div class="surface corp-switcher">
      <div class="switcher-mark"><ChatDotRound /></div>
      <div class="switcher-copy"><b>当前企业微信</b><span>切换后，客服账号、事件、消息统计及新增数据均归属所选企微。</span></div>
      <div class="switcher-control">
        <label>企微ID</label>
        <el-select v-model="selectedCorpId" class="corp-select" @change="switchCorp">
          <el-option v-for="corp in corps" :key="corp.id" :value="corp.id" :label="`${corp.name} · ${corp.id}`">
            <div class="corp-option"><span><b>{{ corp.name }}</b><small>{{ corp.id }}</small></span><el-tag size="small" :type="corp.status === '已授权' ? 'success' : 'warning'">{{ corp.status }}</el-tag></div>
          </el-option>
        </el-select>
      </div>
    </div>

    <div class="scope-summary">
      <span><i></i>{{ selectedCorp.name }}</span>
      <small>{{ selectedCorp.id }}</small>
      <el-tag :type="selectedCorp.status === '已授权' ? 'success' : 'warning'">{{ selectedCorp.status }}</el-tag>
      <el-button class="create-service" type="primary" :icon="Plus" :disabled="selectedCorp.status !== '已授权'" @click="createAccount">新增客服</el-button>
    </div>

    <div class="surface service-panel">
      <el-tabs v-model="activeTab" class="service-tabs">
        <el-tab-pane name="accounts"><template #label><span>客服列表 <em>{{ scopedAccounts.length }}</em></span></template>
          <div class="toolbar"><el-input v-model="keyword" clearable :prefix-icon="Search" placeholder="搜索客服名称、编码或部门"/><el-button type="primary">查询</el-button><el-button @click="keyword = ''">重置</el-button></div>
          <el-table :data="filteredAccounts" empty-text="当前企微暂无客服账号">
            <el-table-column prop="name" label="客服名称" min-width="190"><template #default="{ row }"><div class="name-cell"><b>{{ row.name }}</b><small>{{ row.code }}</small></div></template></el-table-column>
            <el-table-column prop="department" label="关联部门" min-width="170"/>
            <el-table-column prop="staff" label="接待员工" width="120"><template #default="{ row }"><a>{{ row.staff }}</a> 人</template></el-table-column>
            <el-table-column prop="status" label="状态" width="110"><template #default="{ row }"><el-tag :type="row.status === '启用' ? 'success' : 'info'">{{ row.status }}</el-tag></template></el-table-column>
            <el-table-column prop="updatedAt" label="更新时间" width="170"/>
            <el-table-column label="操作" width="150" fixed="right"><template #default><el-button link type="primary">详情</el-button><el-button link type="primary">编辑</el-button></template></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane name="events"><template #label><span>客服事件消息 <em>{{ eventCount }}</em></span></template><el-empty description="当前企微的客服事件消息将在此展示"/></el-tab-pane>
        <el-tab-pane name="messages"><template #label><span>客服消息 <em>{{ messageCount }}</em></span></template><el-empty description="当前企微的客服消息记录将在此展示"/></el-tab-pane>
      </el-tabs>
    </div>
  </section>
</template>

<style scoped>
.service-page{display:flex;flex-direction:column;gap:18px}.corp-switcher{display:grid;grid-template-columns:52px minmax(280px,1fr) minmax(520px,720px);align-items:center;gap:20px;padding:22px 26px;border:1px solid #dfe8f5}.switcher-mark{width:48px;height:48px;border-radius:14px;background:linear-gradient(145deg,#e7f1ff,#f4f8ff);color:#2878ed;display:grid;place-items:center;font-size:24px}.switcher-copy{display:flex;flex-direction:column;gap:7px}.switcher-copy b{font-size:17px;color:#1f3555}.switcher-copy span{font-size:13px;color:#8494ab;line-height:1.55}.switcher-control{display:grid;grid-template-columns:72px 1fr;align-items:center;gap:14px}.switcher-control label{font-size:16px;font-weight:700;color:#3c5272}.corp-select{width:100%}.corp-option{width:100%;display:flex;align-items:center;justify-content:space-between;gap:18px}.corp-option span{display:flex;flex-direction:column;gap:2px}.corp-option small{color:#91a0b5}.scope-summary{display:flex;align-items:center;gap:10px;padding:0 6px;color:#435976}.scope-summary span{font-weight:700}.scope-summary i{display:inline-block;width:8px;height:8px;margin-right:8px;border-radius:50%;background:#28be8b;box-shadow:0 0 0 4px #e6f8f2}.scope-summary small{color:#91a0b5}.create-service{margin-left:auto}.service-panel{padding:0 24px 24px}.service-tabs :deep(.el-tabs__header){margin:0}.service-tabs :deep(.el-tabs__item){height:64px;font-weight:650}.service-tabs em{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;margin-left:6px;padding:0 7px;border-radius:12px;background:#eef4ff;color:#3179e8;font-size:12px;font-style:normal}.toolbar{display:flex;gap:10px;padding:20px 0}.toolbar .el-input{max-width:390px}.name-cell{display:flex;flex-direction:column;gap:4px}.name-cell b{color:#243a59}.name-cell small{color:#91a0b5}.el-table a{color:#2d7cf0;font-weight:700}@media(max-width:1000px){.corp-switcher{grid-template-columns:48px 1fr}.switcher-control{grid-column:1/-1}.switcher-control{grid-template-columns:70px 1fr}}@media(max-width:640px){.corp-switcher{grid-template-columns:1fr;padding:18px}.switcher-mark{display:none}.switcher-control{grid-template-columns:1fr}.scope-summary{flex-wrap:wrap}.create-service{width:100%;margin-left:0}.toolbar{flex-wrap:wrap}.toolbar .el-input{max-width:none;width:100%}}
</style>
