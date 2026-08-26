<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import http from '../api/http'
import PageHeader from '../components/PageHeader.vue'
import StatePanel from '../components/StatePanel.vue'
import BusinessScopeFilter, { type BusinessScopeValue } from '../components/BusinessScopeFilter.vue'
import { useAuthStore } from '../stores/auth'

type AddMethod = 'LINK' | 'BUSINESS_CARD' | 'QR_CODE'
const auth = useAuthStore()
const rows = ref<any[]>([]), organizations = ref<any[]>([]), employees = ref<any[]>([])
const loading = ref(false), error = ref(''), grade = ref(''), status = ref(''), keyword = ref('')
const addMethod = ref<AddMethod | ''>('')
const dialog = ref(false), gradeDialog = ref(false), detailDrawer = ref(false)
const activeCustomer = ref<any>(null), detailTab = ref('profile')
const customerGradeForm = ref({ grade: 'UNRATED', reason: '' })
const form = ref({ name: '', mobile: '', unionId: '', ownerName: '王老师', addMethod: 'QR_CODE' as AddMethod })
const scopeFilters = ref<BusinessScopeValue>({ viewScope: 'AUTHORIZED', organizationId: null, ownerId: null })
const permissionLabel = computed(() => auth.user?.role === 'ADMIN' ? '当前公司全部数据' : '本人数据')
const gradeType: any = { S: 'danger', A: 'warning', B: 'primary', C: 'info', UNRATED: 'info' }
const customerStatusLabels: Record<string, string> = { ACTIVE: '正常', PENDING_HANDOVER: '待移交', INACTIVE: '停用' }
const addMethodLabels: Record<AddMethod, string> = { LINK: '通过链接添加', BUSINESS_CARD: '名片', QR_CODE: '扫描二维码' }
const lifecycleLabels: Record<string, string> = { LEAD: '线索客户', INTENT: '意向客户', DEAL: '成交客户', LOST: '流失客户', INVALID: '无效客户' }

function organizationScopeIds(id: number | null) { if (!id) return organizations.value.map(item => Number(item.id)); const ids = [Number(id)]; for (let i = 0; i < ids.length; i++) organizations.value.filter(item => Number(item.parent_id) === ids[i]).forEach(item => ids.push(Number(item.id))); return ids }
const displayedRows = computed(() => rows.value.filter(row => {
  const owner = employees.value.find(item => Number(item.id) === Number(row.owner_id))
  const organizationId = Number(owner?.organization_id || row.owner_organization_id || 0)
  const authorized = auth.user?.role === 'ADMIN' && scopeFilters.value.viewScope === 'AUTHORIZED'
  const text = `${row.customer_no || ''} ${row.name || ''} ${row.mobile || ''} ${row.union_id || ''}`.toLowerCase()
  return (!grade.value || row.grade === grade.value) && (!status.value || row.status === status.value) && (!addMethod.value || row.add_method === addMethod.value) && (!keyword.value.trim() || text.includes(keyword.value.trim().toLowerCase())) && (authorized || row.owner_name === auth.user?.displayName) && (!scopeFilters.value.organizationId || organizationScopeIds(scopeFilters.value.organizationId).includes(organizationId)) && (!scopeFilters.value.ownerId || Number(row.owner_id) === Number(scopeFilters.value.ownerId))
}))
async function load() { loading.value = true; error.value = ''; try { const [a,b,c]: any = await Promise.all([http.get('/customers'),http.get('/system/organizations'),http.get('/system/employees')]); rows.value=a.data;organizations.value=b.data;employees.value=c.data } catch(e:any){error.value=e.message} finally{loading.value=false} }
async function create() {
  if(!form.value.name.trim())return ElMessage.warning('请填写客户称呼')
  const mobile=form.value.mobile.replace(/[\s-]/g,'').replace(/^\+86/,'')
  if(!mobile&&!form.value.unionId.trim())return ElMessage.warning('手机号或 UnionID 至少填写一项')
  if(mobile&&!/^1[3-9]\d{9}$/.test(mobile))return ElMessage.warning('一个客户只能保存一个有效的 11 位主手机号')
  try{
    const result:any=await http.post('/customers',{...form.value,mobile})
    dialog.value=false
    form.value={name:'',mobile:'',unionId:'',ownerName:'王老师',addMethod:'QR_CODE'}
    ElMessage.success(result.data?.created===false?'该手机号或 UnionID 已有客户档案，已关联原客户':'客户已创建')
    await load()
  }catch(e:any){ElMessage.error(e.message||'客户创建失败')}
}
function openDetail(row:any){activeCustomer.value=row;detailTab.value='profile';detailDrawer.value=true}
function openGradeEditor(row:any){activeCustomer.value=row;customerGradeForm.value={grade:['S','A','B','C'].includes(row.grade)?row.grade:'',reason:''};gradeDialog.value=true}
async function saveCustomerGrade(){if(!customerGradeForm.value.grade)return ElMessage.warning('请选择 S、A、B、C 中的目标等级');if(!customerGradeForm.value.reason.trim())return ElMessage.warning('请填写客户等级调整原因');await http.post(`/customers/${activeCustomer.value.id}/grade`,customerGradeForm.value);gradeDialog.value=false;ElMessage.success('客户等级已更新，变更记录已保留');await load()}
function resetFilters(){grade.value='';status.value='';addMethod.value='';keyword.value='';scopeFilters.value={viewScope:auth.user?.role==='ADMIN'?'AUTHORIZED':'SELF',organizationId:null,ownerId:null}}
function maskMobile(value?:string){return value?.replace(/(\d{3})\d{4}(\d{4})/,'$1****$2')||'—'}
onMounted(load)
</script>

<template>
  <section class="page customer-list-page">
    <PageHeader eyebrow="CUSTOMER MASTER · UNIQUE PROFILE" title="客户列表" description="以家长客户为唯一经营主体，统一查看身份、添加方式、等级、归属和完整业务档案。"><el-button type="primary" @click="dialog=true">新建客户</el-button></PageHeader>
    <div class="customer-definition surface">
      <div><span>唯一身份</span><b>一个主手机号 / 一个 UnionID</b><small>任一有效即可建档，均为单值身份</small></div><i></i>
      <div><span>客户来源</span><b>客户从哪里来</b><small>渠道、店铺、商品与IP归因</small></div><i></i>
      <div class="accent"><span>添加方式</span><b>客户如何进入</b><small>链接 / 名片 / 二维码</small></div>
    </div>
    <div class="surface table-shell">
      <div class="customer-search-panel">
        <BusinessScopeFilter v-model="scopeFilters" :organizations="organizations" :employees="employees" owner-label="客户负责人" :permission-label="permissionLabel" :role="auth.user?.role" />
        <div class="customer-basic-filters">
          <el-input v-model="keyword" clearable placeholder="客户编号、姓名、手机号或 UnionID" />
          <el-select v-model="grade" placeholder="客户等级" clearable><el-option v-for="g in ['S','A','B','C','UNRATED']" :key="g" :label="g==='UNRATED'?'未定级':`${g} 级`" :value="g" /></el-select>
          <el-select v-model="addMethod" placeholder="添加方式" clearable><el-option v-for="(label,value) in addMethodLabels" :key="value" :label="label" :value="value" /></el-select>
          <el-select v-model="status" placeholder="客户状态" clearable><el-option label="正常" value="ACTIVE"/><el-option label="待移交" value="PENDING_HANDOVER"/><el-option label="停用" value="INACTIVE"/></el-select>
          <el-button type="primary">查询</el-button><el-button @click="resetFilters">重置</el-button><span>共 {{ displayedRows.length }} 位客户</span>
        </div>
      </div>
      <StatePanel :loading="loading" :error="error" :empty="!displayedRows.length" empty-text="当前条件下暂无客户" @retry="load">
        <el-table :data="displayedRows" height="560">
          <el-table-column prop="customer_no" label="客户编号" width="180" fixed="left"><template #default="{row}"><button class="customer-link" @click="openDetail(row)">{{ row.customer_no }}</button></template></el-table-column>
          <el-table-column prop="name" label="客户称呼" min-width="120" />
          <el-table-column prop="lifecycle" label="生命周期" width="120"><template #default="{row}"><el-tag effect="plain">{{ lifecycleLabels[row.lifecycle]||'线索客户' }}</el-tag></template></el-table-column>
          <el-table-column prop="mobile" label="主手机号" width="140"><template #default="{row}">{{ maskMobile(row.mobile) }}</template></el-table-column>
          <el-table-column prop="add_method" label="添加方式" width="140"><template #default="{row}"><span class="method-pill">{{ addMethodLabels[row.add_method as AddMethod]||'—' }}</span></template></el-table-column>
          <el-table-column prop="source_name" label="首次来源" min-width="140"><template #default="{row}"><b>{{ row.source_name||'—' }}</b><small class="cell-sub">{{ row.camp_name||'未关联营期' }}</small></template></el-table-column>
          <el-table-column prop="grade" label="等级" width="130"><template #default="{row}"><el-tag :type="gradeType[row.grade]">{{ row.grade==='UNRATED'?'未定级':row.grade }}</el-tag><small class="cell-sub">{{ row.grade_source==='CUSTOMER_MANUAL'?'客户人工调整':row.grade_source==='LEAD_INHERITED'?'继承线索等级':'系统状态' }}</small></template></el-table-column>
          <el-table-column label="客户负责人" min-width="150"><template #default="{row}"><b>{{ row.owner_name||'待分配' }}</b><small class="cell-sub">{{ row.owner_employee_no||'—' }}</small></template></el-table-column>
          <el-table-column label="归属组织" min-width="150"><template #default="{row}">{{ row.owner_organization_name||'—' }}</template></el-table-column>
          <el-table-column prop="status" label="客户状态" width="100"><template #default="{row}">{{ customerStatusLabels[row.status]||row.status }}</template></el-table-column>
          <el-table-column prop="created_at" label="建档时间" width="168" />
          <el-table-column label="操作" width="180" fixed="right"><template #default="{row}"><el-button link type="primary" @click="openDetail(row)">客户档案</el-button><el-button link type="primary" @click="openGradeEditor(row)">编辑等级</el-button></template></el-table-column>
        </el-table>
      </StatePanel>
    </div>

    <el-drawer v-model="detailDrawer" size="880px">
      <template #header><div class="drawer-title"><span>{{ activeCustomer?.customer_no }}</span><h2>{{ activeCustomer?.name }}</h2><el-tag :type="gradeType[activeCustomer?.grade]">{{ activeCustomer?.grade||'未定级' }} 级</el-tag></div></template>
      <div class="profile-summary"><div><span>主手机号</span><b>{{ maskMobile(activeCustomer?.mobile) }}</b></div><div><span>添加方式</span><b>{{ addMethodLabels[activeCustomer?.add_method as AddMethod]||'—' }}</b></div><div><span>首次来源</span><b>{{ activeCustomer?.source_name||'—' }}</b></div><div><span>当前负责人</span><b>{{ activeCustomer?.owner_name||'待分配' }}</b></div></div>
      <el-tabs v-model="detailTab" class="profile-tabs">
        <el-tab-pane label="基本档案" name="profile"><div class="profile-grid"><div><span>客户编号</span><b>{{ activeCustomer?.customer_no }}</b></div><div><span>客户称呼</span><b>{{ activeCustomer?.name }}</b></div><div><span>UnionID</span><b>{{ activeCustomer?.union_id||'—' }}</b></div><div><span>客户状态</span><b>{{ customerStatusLabels[activeCustomer?.status] }}</b></div><div><span>添加方式</span><b>{{ addMethodLabels[activeCustomer?.add_method as AddMethod]||'—' }}</b></div><div><span>建档时间</span><b>{{ activeCustomer?.created_at }}</b></div></div></el-tab-pane>
        <el-tab-pane label="线索记录" name="leads"><div class="timeline-card"><b>{{ activeCustomer?.source_lead_no||'来源线索待补充' }}</b><span>{{ activeCustomer?.source_name||'—' }} · {{ activeCustomer?.camp_name||'未关联营期' }}</span></div></el-tab-pane>
        <el-tab-pane label="学习交付" name="delivery"><el-empty description="暂无课程交付记录" :image-size="72"/></el-tab-pane>
        <el-tab-pane label="服务人员" name="service"><div class="timeline-card"><b>{{ activeCustomer?.owner_name||'待分配' }}</b><span>{{ activeCustomer?.owner_organization_name||'—' }} · 当前主负责人</span></div></el-tab-pane>
        <el-tab-pane label="问卷测评" name="questionnaire"><el-empty description="暂无问卷或测评记录" :image-size="72"/></el-tab-pane>
        <el-tab-pane label="客户时间轴" name="timeline"><div class="timeline-card"><b>创建客户档案</b><span>{{ activeCustomer?.created_at }} · 通过{{ addMethodLabels[activeCustomer?.add_method as AddMethod]||'未知方式' }}进入</span></div></el-tab-pane>
      </el-tabs>
    </el-drawer>

    <el-dialog v-model="dialog" title="新建唯一客户" width="560px"><el-alert title="一个客户只允许保存一个主手机号；手机号在全部有效客户中唯一。手机号或 UnionID 任一有效即可创建，分别命中不同客户时将阻断创建并生成撞单案件。" type="info" :closable="false" show-icon/><el-form label-position="top" style="margin-top:16px"><el-form-item label="客户称呼" required><el-input v-model="form.name"/></el-form-item><div class="dialog-grid"><el-form-item label="主手机号"><el-input v-model="form.mobile" maxlength="11" placeholder="仅填写一个 11 位手机号" inputmode="numeric"/><small class="form-help">不支持在同一客户下保存备用手机号或多个手机号。</small></el-form-item><el-form-item label="UnionID"><el-input v-model="form.unionId" placeholder="与手机号至少填写一项"/></el-form-item></div><el-form-item label="添加方式" required><el-radio-group v-model="form.addMethod"><el-radio-button v-for="(label,value) in addMethodLabels" :key="value" :value="value">{{ label }}</el-radio-button></el-radio-group><small class="form-help">只记录客户如何添加，不替代渠道、店铺或商品来源。</small></el-form-item><el-form-item label="负责人"><el-input v-model="form.ownerName"/></el-form-item></el-form><template #footer><el-button @click="dialog=false">取消</el-button><el-button type="primary" @click="create">创建客户</el-button></template></el-dialog>
    <el-dialog v-model="gradeDialog" title="编辑客户等级" width="520px"><el-alert title="客户首次建档继承线索等级；此处人工调整后作为客户当前等级，不回写原线索。S/A/B/C 选项来自统一等级字典。" type="info" :closable="false" show-icon/><el-form label-position="top" class="grade-editor-form"><el-form-item label="客户"><el-input :model-value="`${activeCustomer?.customer_no||''} · ${activeCustomer?.name||''}`" disabled/></el-form-item><el-form-item label="目标等级" required><el-select v-model="customerGradeForm.grade" style="width:100%"><el-option v-for="g in ['S','A','B','C']" :key="g" :label="`${g} 级`" :value="g"/></el-select></el-form-item><el-form-item label="调整原因" required><el-input v-model="customerGradeForm.reason" type="textarea" :rows="3" maxlength="200" show-word-limit/></el-form-item></el-form><template #footer><el-button @click="gradeDialog=false">取消</el-button><el-button type="primary" @click="saveCustomerGrade">确认调整</el-button></template></el-dialog>
  </section>
</template>

<style scoped>
.customer-definition{display:flex;align-items:center;margin-bottom:16px;padding:16px 22px}.customer-definition>div{min-width:210px}.customer-definition span,.customer-definition small{display:block;color:var(--muted);font-size:12px}.customer-definition b{display:block;margin:4px 0;color:var(--text);font-size:15px}.customer-definition i{width:36px;height:1px;margin:0 18px;background:var(--line)}.customer-definition .accent b{color:var(--primary)}
.customer-search-panel{padding:16px;border-bottom:1px solid var(--line)}.customer-basic-filters{display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap}.customer-basic-filters .el-input{width:300px}.customer-basic-filters .el-select{width:142px}.customer-basic-filters>span{margin-left:auto;color:var(--muted);font-size:12px}.cell-sub{display:block;margin-top:3px;color:var(--muted);font-size:11px;font-weight:400}.method-pill{display:inline-flex;padding:5px 9px;border-radius:8px;background:#edf5ff;color:#2874de;font-size:12px}.customer-link{padding:0;border:0;background:none;color:var(--primary);font-weight:700;cursor:pointer}.grade-editor-form{margin-top:18px}.dialog-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.form-help{display:block;margin-top:7px;color:var(--muted)}
.drawer-title{display:flex;align-items:center;gap:12px}.drawer-title span{color:var(--muted);font-size:12px}.drawer-title h2{margin:0;color:var(--text)}.profile-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.profile-summary>div,.profile-grid>div{padding:14px;border:1px solid var(--line);border-radius:12px;background:#f8fbff}.profile-summary span,.profile-grid span{display:block;color:var(--muted);font-size:12px}.profile-summary b,.profile-grid b{display:block;margin-top:6px;color:var(--text)}.profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.timeline-card{display:flex;flex-direction:column;gap:6px;padding:18px;border-left:3px solid var(--primary);border-radius:0 12px 12px 0;background:#f7faff}.timeline-card span{color:var(--muted);font-size:13px}
@media(max-width:900px){.customer-definition{overflow:auto}.profile-summary{grid-template-columns:1fr 1fr}.customer-basic-filters .el-input,.customer-basic-filters .el-select{width:100%}.dialog-grid,.profile-grid{grid-template-columns:1fr}}
</style>
