<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Setting, View } from '@element-plus/icons-vue'
import http from '../api/http'
import PageHeader from '../components/PageHeader.vue'
import StatePanel from '../components/StatePanel.vue'
import BusinessScopeFilter, { type BusinessScopeValue } from '../components/BusinessScopeFilter.vue'
import { useAuthStore } from '../stores/auth'

type AddMethod = 'LINK' | 'BUSINESS_CARD' | 'QR_CODE'
const auth = useAuthStore()
const rows = ref<any[]>([]), organizations = ref<any[]>([]), employees = ref<any[]>([])
const loading = ref(false), error = ref(''), grade = ref(''), lifecycle = ref(''), keyword = ref('')
const addMethod = ref<AddMethod | ''>('')
const dialog = ref(false), gradeDialog = ref(false), detailDrawer = ref(false)
const customerSyncVisible = ref(false), customerSyncing = ref(false), customerSyncFinished = ref(false)
const customerSyncMode = ref<'FULL' | 'INCREMENTAL'>('INCREMENTAL')
const lastCustomerSyncAt = ref('2026-08-28 09:30:00')
const detailMobileVisible = ref(false)
const tagDialogVisible=ref(false),tagFilterVisible=ref(false),mobileChangeVisible=ref(false),mobilePreviewIds=ref<number[]>([])
const activeCustomer = ref<any>(null), detailTab = ref('profile')
const selectedTagFilters=ref<string[]>([]),tagSearch=ref(''),newTag=ref(''),newMobile=ref(''),mobileValidation=ref<any>(null)
const customerGradeForm = ref({ grade: 'UNRATED', reason: '' })
const form = ref({ name: '', mobile: '', unionId: '', ownerName: '王老师', addMethod: 'QR_CODE' as AddMethod })
const scopeFilters = ref<BusinessScopeValue>({ viewScope: 'AUTHORIZED', organizationId: null, ownerId: null })
const permissionLabel = computed(() => auth.user?.role === 'ADMIN' ? '当前公司全部数据' : '本人数据')
const gradeType: any = { S: 'danger', A: 'warning', B: 'primary', C: 'info', UNRATED: 'info' }
const customerStatusLabels: Record<string, string> = { ACTIVE: '正常', PENDING_HANDOVER: '待移交', INACTIVE: '停用' }
const addMethodLabels: Record<AddMethod, string> = { LINK: '通过链接添加', BUSINESS_CARD: '名片', QR_CODE: '扫描二维码' }
const lifecycleLabels: Record<string, string> = { LEAD: '线索客户', INTENT: '意向客户', DEAL: '成交客户' }
type CustomerTag={name:string;source:'系统'|'企业微信'}
const customerTags=ref<Record<number,CustomerTag[]>>({1:[{name:'重点客户',source:'企业微信'},{name:'暑期三期',source:'企业微信'},{name:'高意向',source:'系统'}],2:[{name:'有赞新客',source:'企业微信'},{name:'待跟进',source:'系统'}],3:[{name:'已成交',source:'系统'},{name:'VIP客户',source:'系统'},{name:'抖音新客',source:'企业微信'},{name:'复购潜力',source:'系统'}]})
const tagCatalog=computed(()=>{const base:CustomerTag[]=[{name:'重点客户',source:'企业微信'},{name:'暑期三期',source:'企业微信'},{name:'有赞新客',source:'企业微信'},{name:'抖音新客',source:'企业微信'},{name:'待跟进',source:'系统'},{name:'VIP客户',source:'系统'},{name:'高意向',source:'系统'},{name:'已成交',source:'系统'},{name:'复购潜力',source:'系统'}];return base.filter(tag=>!tagSearch.value||tag.name.includes(tagSearch.value))})
const tagsBySource=computed(()=>['系统','企业微信'].map(source=>({source,tags:tagCatalog.value.filter(tag=>tag.source===source)})).filter(group=>group.tags.length))
const customerProfile=computed(()=>({
  nickname: activeCustomer.value?.wechat_nickname || ['Kiyomi😊','糖糖妈妈','星辰爸'][Number(activeCustomer.value?.id || 1) % 3],
  gender: activeCustomer.value?.gender || ['女','女','男'][Number(activeCustomer.value?.id || 1) % 3],
  address: activeCustomer.value?.address || ['陕西省/西安市/长安区','浙江省/杭州市/余杭区','广东省/深圳市/南山区'][Number(activeCustomer.value?.id || 1) % 3]
}))
const customerLeadRecords=computed(()=>[
  { no: activeCustomer.value?.source_lead_no || 'DY20260824192518', source: activeCustomer.value?.source_name || '抖音直播', period: activeCustomer.value?.period_name || '20260812', status: '已转客户', createdAt: '2026-08-12 09:36:18' },
  { no: 'YZ20260718008931', source: '有赞店铺', period: '20260718', status: '已加企微', createdAt: '2026-07-18 14:22:05' },
  { no: 'XET20260609001327', source: '小鹅通课程', period: '20260609', status: '已填写问卷', createdAt: '2026-06-09 20:11:42' }
])
const customerQuestionnaires=computed(()=>[
  { no: 'QN202608120018', name: '家庭教育需求诊断', source: '引流线索', score: 86, grade: 'A', submittedAt: '2026-08-12 10:18:36' },
  { no: 'QN202607180126', name: '学习习惯与能力测评', source: '企微侧边栏', score: 92, grade: 'S', submittedAt: '2026-07-19 09:42:11' }
])
const customerTimeline=computed(()=>[
  { time: activeCustomer.value?.created_at || '2026-08-12 09:36:18', title: '创建客户档案', detail: `通过${addMethodLabels[activeCustomer.value?.add_method as AddMethod]||'未知方式'}进入，建立唯一客户编号` },
  { time: '2026-08-12 09:42:03', title: '企业微信客户关系已同步', detail: `external_userid 已关联跟进员工 ${activeCustomer.value?.owner_name||'王老师'}` },
  { time: '2026-08-12 10:18:36', title: '提交问卷测评', detail: '家庭教育需求诊断 · 86分 · A级' },
  { time: '2026-08-13 14:26:20', title: '客户标签更新', detail: '企业微信标签“重点客户”同步完成' },
  { time: '2026-08-18 20:05:12', title: '订单成交', detail: '正式课订单支付成功，客户生命周期更新为成交客户' }
])
const mandatoryColumns = ['customer_no', 'name', 'operation']
const defaultColumns = ['customer_no', 'name', 'lifecycle', 'mobile', 'tags', 'add_method', 'source_name', 'grade', 'owner', 'organization', 'status', 'created_at', 'operation']
const columnOptions = [
  { value: 'customer_no', label: '客户编号', mandatory: true },
  { value: 'name', label: '客户名称', mandatory: true },
  { value: 'lifecycle', label: '生命周期' },
  { value: 'mobile', label: '手机号' },
  { value: 'tags', label: '客户标签' },
  { value: 'add_method', label: '添加方式' },
  { value: 'source_name', label: '首次来源' },
  { value: 'grade', label: '等级' },
  { value: 'owner', label: '客户负责人' },
  { value: 'organization', label: '归属组织' },
  { value: 'status', label: '客户状态' },
  { value: 'created_at', label: '客户添加时间' },
  { value: 'operation', label: '操作', mandatory: true }
]
const columnStorageKey = 'heshu_boss_customer_table_columns_v1'
function loadColumnPreference(){try{const saved=JSON.parse(localStorage.getItem(columnStorageKey)||'[]');return Array.isArray(saved)&&saved.length?[...new Set([...saved,...mandatoryColumns])]:[...defaultColumns]}catch{return [...defaultColumns]}}
const visibleColumns=ref<string[]>(loadColumnPreference())
const columnSettingVisible=ref(false)
const showColumn=(key:string)=>mandatoryColumns.includes(key)||visibleColumns.value.includes(key)
function resetColumns(){visibleColumns.value=[...defaultColumns]}

function organizationScopeIds(id: number | null) { if (!id) return organizations.value.map(item => Number(item.id)); const ids = [Number(id)]; for (let i = 0; i < ids.length; i++) organizations.value.filter(item => Number(item.parent_id) === ids[i]).forEach(item => ids.push(Number(item.id))); return ids }
const displayedRows = computed(() => rows.value.filter(row => {
  const owner = employees.value.find(item => Number(item.id) === Number(row.owner_id))
  const organizationId = Number(owner?.organization_id || row.owner_organization_id || 0)
  const authorized = auth.user?.role === 'ADMIN' && scopeFilters.value.viewScope === 'AUTHORIZED'
  const text = `${row.customer_no || ''} ${row.name || ''} ${row.mobile || ''} ${row.union_id || ''}`.toLowerCase()
  const rowTagNames=(customerTags.value[row.id]||[]).map(tag=>tag.name)
  return (!selectedTagFilters.value.length||selectedTagFilters.value.some(tag=>rowTagNames.includes(tag))) && (!grade.value || row.grade === grade.value) && (!lifecycle.value || (row.lifecycle || 'LEAD') === lifecycle.value) && (!addMethod.value || row.add_method === addMethod.value) && (!keyword.value.trim() || text.includes(keyword.value.trim().toLowerCase())) && (authorized || row.owner_name === auth.user?.displayName) && (!scopeFilters.value.organizationId || organizationScopeIds(scopeFilters.value.organizationId).includes(organizationId)) && (!scopeFilters.value.ownerId || Number(row.owner_id) === Number(scopeFilters.value.ownerId))
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
function openDetail(row:any){activeCustomer.value=row;detailTab.value='profile';detailMobileVisible.value=false;detailDrawer.value=true}
function openTags(row:any){activeCustomer.value=row;newTag.value='';tagDialogVisible.value=true}
function toggleMobilePreview(row:any){mobilePreviewIds.value=mobilePreviewIds.value.includes(row.id)?mobilePreviewIds.value.filter(id=>id!==row.id):[...mobilePreviewIds.value,row.id]}
function openMobileChange(row:any){activeCustomer.value=row;newMobile.value='';mobileValidation.value=null;mobileChangeVisible.value=true}
function validateNewMobile(){const mobile=newMobile.value.replace(/[\s-]/g,'');if(!/^1[3-9]\d{9}$/.test(mobile))return ElMessage.warning('请输入有效的 11 位手机号');const target=rows.value.find(row=>row.id!==activeCustomer.value.id&&row.mobile===mobile);if(!target)mobileValidation.value={status:'AVAILABLE',title:'手机号可用',message:'新手机号未被其他有效客户占用'};else if(Number(target.owner_id)===Number(activeCustomer.value.owner_id))mobileValidation.value={status:'MERGE_ALLOWED',title:'命中已有客户档案',message:'双方归属于同一位一转负责人，可合并档案',target_profile:target};else mobileValidation.value={status:'BLOCKED_OWNER_CONFLICT',title:'禁止直接变更',message:'新手机号已被其他负责人名下客户占用',target_profile:target}}
async function submitMobileChange(){if(!mobileValidation.value||!['AVAILABLE','MERGE_ALLOWED'].includes(mobileValidation.value.status))return;const isMerge=mobileValidation.value.status==='MERGE_ALLOWED';try{await ElMessageBox.confirm(isMerge?'新手机号已存在且双方归属于同一位一转负责人。确认后将以新手机号对应客户为主档并合并关联数据。':'确认变更客户手机号？原手机号与变更记录将保留在审计日志中。',isMerge?'确认合并客户档案':'确认变更手机号',{type:'warning'});if(isMerge){activeCustomer.value.status='MERGED'}else activeCustomer.value.mobile=newMobile.value.replace(/[\s-]/g,'');mobileChangeVisible.value=false;ElMessage.success(isMerge?'客户档案已合并':'手机号变更成功')}catch(e:any){if(e!=='cancel'&&e!=='close')ElMessage.error(e.message||'操作失败')}}
function openGradeEditor(row:any){activeCustomer.value=row;customerGradeForm.value={grade:['S','A','B','C'].includes(row.grade)?row.grade:'',reason:''};gradeDialog.value=true}
async function saveCustomerGrade(){if(!customerGradeForm.value.grade)return ElMessage.warning('请选择 S、A、B、C 中的目标等级');if(!customerGradeForm.value.reason.trim())return ElMessage.warning('请填写客户等级调整原因');await http.post(`/customers/${activeCustomer.value.id}/grade`,customerGradeForm.value);gradeDialog.value=false;ElMessage.success('客户等级已更新，变更记录已保留');await load()}
function openCustomerSync(){customerSyncMode.value='INCREMENTAL';customerSyncFinished.value=false;customerSyncVisible.value=true}
function runCustomerSync(){customerSyncing.value=true;customerSyncFinished.value=false;window.setTimeout(()=>{customerSyncing.value=false;customerSyncFinished.value=true;lastCustomerSyncAt.value=new Date().toLocaleString('zh-CN',{hour12:false});ElMessage.success(customerSyncMode.value==='FULL'?'全量客户同步完成':'增量客户同步完成')},900)}
function resetFilters(){grade.value='';lifecycle.value='';addMethod.value='';keyword.value='';selectedTagFilters.value=[];scopeFilters.value={viewScope:auth.user?.role==='ADMIN'?'AUTHORIZED':'SELF',organizationId:null,ownerId:null}}
function maskMobile(value?:string){return value?.replace(/(\d{3})\d{4}(\d{4})/,'$1****$2')||'—'}
watch(visibleColumns,value=>localStorage.setItem(columnStorageKey,JSON.stringify([...new Set([...value,...mandatoryColumns])])),{deep:true})
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
          <el-select v-model="lifecycle" placeholder="生命周期" clearable><el-option v-for="(label,value) in lifecycleLabels" :key="value" :label="label" :value="value"/></el-select>
          <el-button class="tag-filter-trigger" @click="tagFilterVisible=true">客户标签<template v-if="selectedTagFilters.length">（{{ selectedTagFilters.length }}）</template></el-button>
          <el-button type="primary">查询</el-button><el-button @click="resetFilters">重置</el-button><span>共 {{ displayedRows.length }} 位客户</span>
        </div>
      </div>
      <div class="customer-table-toolbar">
        <span>客户列表</span>
        <div class="customer-table-actions"><el-button type="primary" plain :icon="Refresh" @click="openCustomerSync">同步客户</el-button><small>上次同步 {{ lastCustomerSyncAt }}</small><el-popover v-model:visible="columnSettingVisible" placement="bottom-end" :width="380" trigger="click">
          <template #reference><el-button circle :icon="Setting" aria-label="字段设置" title="字段设置" /></template>
          <div class="column-setting-head"><strong>设置展示字段</strong><el-button link type="primary" @click="resetColumns">恢复默认</el-button></div>
          <p class="column-setting-tip">客户编号、客户名称和操作为固定展示列，其他字段可自由选择并自动记忆。</p>
          <el-checkbox-group v-model="visibleColumns" class="column-setting-grid">
            <el-checkbox v-for="item in columnOptions" :key="item.value" :value="item.value" :disabled="item.mandatory">{{ item.label }}</el-checkbox>
          </el-checkbox-group>
        </el-popover></div>
      </div>
      <StatePanel :loading="loading" :error="error" :empty="!displayedRows.length" empty-text="当前条件下暂无客户" @retry="load">
        <el-table :data="displayedRows" height="560">
          <el-table-column prop="customer_no" label="客户编号" width="180" fixed="left"><template #default="{row}"><button class="customer-link" @click="openDetail(row)">{{ row.customer_no }}</button></template></el-table-column>
          <el-table-column prop="name" label="客户名称" min-width="120" fixed="left" />
          <el-table-column v-if="showColumn('lifecycle')" prop="lifecycle" label="生命周期" width="120"><template #default="{row}"><el-tag effect="plain">{{ lifecycleLabels[row.lifecycle]||'线索客户' }}</el-tag></template></el-table-column>
          <el-table-column v-if="showColumn('mobile')" prop="mobile" label="手机号" width="155"><template #default="{row}"><div class="mobile-cell"><span>{{ mobilePreviewIds.includes(row.id)?(row.mobile||'—'):maskMobile(row.mobile) }}</span><el-button link type="primary" :icon="View" aria-label="预览手机号" @click="toggleMobilePreview(row)"/></div></template></el-table-column>
          <el-table-column v-if="showColumn('tags')" label="客户标签" min-width="210"><template #default="{row}"><button class="customer-tags-cell" @click="openTags(row)"><el-tag v-for="tag in (customerTags[row.id]||[]).slice(0,2)" :key="tag.name" effect="plain" size="small">{{ tag.name }}</el-tag><span v-if="(customerTags[row.id]||[]).length>2">+{{ customerTags[row.id].length-2 }}</span><em v-if="!(customerTags[row.id]||[]).length">—</em></button></template></el-table-column>
          <el-table-column v-if="showColumn('add_method')" prop="add_method" label="添加方式" width="140"><template #default="{row}"><span class="method-pill">{{ addMethodLabels[row.add_method as AddMethod]||'—' }}</span></template></el-table-column>
          <el-table-column v-if="showColumn('source_name')" prop="source_name" label="首次来源" min-width="140"><template #default="{row}"><b>{{ row.source_name||'—' }}</b><small class="cell-sub">{{ row.camp_name||'未关联营期' }}</small></template></el-table-column>
          <el-table-column v-if="showColumn('grade')" prop="grade" label="等级" width="130"><template #default="{row}"><el-tag :type="gradeType[row.grade]">{{ row.grade==='UNRATED'?'未定级':row.grade }}</el-tag><small class="cell-sub">{{ row.grade_source==='CUSTOMER_MANUAL'?'客户人工调整':row.grade_source==='LEAD_INHERITED'?'继承线索等级':'系统状态' }}</small></template></el-table-column>
          <el-table-column v-if="showColumn('owner')" label="客户负责人" min-width="150"><template #default="{row}"><b>{{ row.owner_name||'待分配' }}</b><small class="cell-sub">{{ row.owner_employee_no||'—' }}</small></template></el-table-column>
          <el-table-column v-if="showColumn('organization')" label="归属组织" min-width="150"><template #default="{row}">{{ row.owner_organization_name||'—' }}</template></el-table-column>
          <el-table-column v-if="showColumn('status')" prop="status" label="客户状态" width="100"><template #default="{row}">{{ customerStatusLabels[row.status]||row.status }}</template></el-table-column>
          <el-table-column v-if="showColumn('created_at')" prop="created_at" label="客户添加时间" width="168" />
          <el-table-column label="操作" width="260" fixed="right"><template #default="{row}"><el-button link type="primary" @click="openDetail(row)">客户档案</el-button><el-button link type="primary" @click="openGradeEditor(row)">编辑等级</el-button><el-button link type="primary" @click="openMobileChange(row)">变更手机号</el-button></template></el-table-column>
        </el-table>
      </StatePanel>
    </div>

    <el-drawer v-model="detailDrawer" size="880px">
      <template #header><div class="drawer-title"><span>{{ activeCustomer?.customer_no }}</span><h2>{{ activeCustomer?.name }}</h2><el-tag :type="gradeType[activeCustomer?.grade]">{{ activeCustomer?.grade||'未定级' }} 级</el-tag></div></template>
      <div class="profile-summary"><div><span>手机号</span><b class="detail-mobile">{{ detailMobileVisible?(activeCustomer?.mobile||'—'):maskMobile(activeCustomer?.mobile) }}<el-button link type="primary" :icon="View" aria-label="预览手机号" @click="detailMobileVisible=!detailMobileVisible"/></b></div><div><span>添加方式</span><b>{{ addMethodLabels[activeCustomer?.add_method as AddMethod]||'—' }}</b></div><div><span>首次来源</span><b>{{ activeCustomer?.source_name||'—' }}</b></div><div><span>当前负责人</span><b>{{ activeCustomer?.owner_name||'待分配' }}</b></div></div>
      <el-tabs v-model="detailTab" class="customer-profile-tabs">
        <el-tab-pane label="基本档案" name="profile"><div class="profile-grid"><div><span>昵称</span><b>{{ customerProfile.nickname }}</b></div><div><span>手机号</span><b class="detail-mobile">{{ detailMobileVisible?(activeCustomer?.mobile||'—'):maskMobile(activeCustomer?.mobile) }}<el-button link type="primary" :icon="View" aria-label="预览手机号" @click="detailMobileVisible=!detailMobileVisible"/></b></div><div class="wide"><span>客户地址</span><b>{{ customerProfile.address }}</b></div><div><span>性别</span><b>{{ customerProfile.gender }}</b></div><div><span>客户编号</span><b>{{ activeCustomer?.customer_no }}</b></div></div></el-tab-pane>
        <el-tab-pane label="线索记录" name="leads"><el-table :data="customerLeadRecords" class="customer-lead-table"><el-table-column prop="no" label="线索编号" min-width="175"/><el-table-column prop="source" label="线索来源" width="120"/><el-table-column prop="period" label="所属期次" width="120"/><el-table-column prop="status" label="当前状态" width="120"><template #default="{row}"><el-tag effect="plain">{{ row.status }}</el-tag></template></el-table-column><el-table-column prop="createdAt" label="线索创建时间" width="170"/></el-table></el-tab-pane>
        <el-tab-pane label="学习交付" name="delivery"><el-empty description="暂无课程交付记录" :image-size="72"/></el-tab-pane>
        <el-tab-pane label="服务人员" name="service"><div class="timeline-card"><b>{{ activeCustomer?.owner_name||'待分配' }}</b><span>{{ activeCustomer?.owner_organization_name||'—' }} · 当前主负责人</span></div></el-tab-pane>
        <el-tab-pane label="问卷测评" name="questionnaire"><el-table :data="customerQuestionnaires" class="customer-lead-table"><el-table-column prop="no" label="答卷编号" min-width="170"/><el-table-column prop="name" label="问卷/测评名称" min-width="210"/><el-table-column prop="source" label="填写来源" width="130"/><el-table-column prop="score" label="得分" width="80"/><el-table-column label="评定等级" width="105"><template #default="{row}"><el-tag :type="gradeType[row.grade]">{{ row.grade }} 级</el-tag></template></el-table-column><el-table-column prop="submittedAt" label="提交时间" width="170"/></el-table></el-tab-pane>
        <el-tab-pane label="客户时间轴" name="timeline"><div class="customer-timeline"><div v-for="item in customerTimeline" :key="`${item.time}-${item.title}`" class="timeline-card"><time>{{ item.time }}</time><b>{{ item.title }}</b><span>{{ item.detail }}</span></div></div></el-tab-pane>
      </el-tabs>
    </el-drawer>

    <el-dialog v-model="dialog" title="新建唯一客户" width="560px"><el-alert title="一个客户只允许保存一个主手机号；手机号在全部有效客户中唯一。手机号或 UnionID 任一有效即可创建，分别命中不同客户时将阻断创建并生成撞单案件。" type="info" :closable="false" show-icon/><el-form label-position="top" style="margin-top:16px"><el-form-item label="客户称呼" required><el-input v-model="form.name"/></el-form-item><div class="dialog-grid"><el-form-item label="主手机号"><el-input v-model="form.mobile" maxlength="11" placeholder="仅填写一个 11 位手机号" inputmode="numeric"/><small class="form-help">不支持在同一客户下保存备用手机号或多个手机号。</small></el-form-item><el-form-item label="UnionID"><el-input v-model="form.unionId" placeholder="与手机号至少填写一项"/></el-form-item></div><el-form-item label="添加方式" required><el-radio-group v-model="form.addMethod"><el-radio-button v-for="(label,value) in addMethodLabels" :key="value" :value="value">{{ label }}</el-radio-button></el-radio-group><small class="form-help">只记录客户如何添加，不替代渠道、店铺或商品来源。</small></el-form-item><el-form-item label="负责人"><el-input v-model="form.ownerName"/></el-form-item></el-form><template #footer><el-button @click="dialog=false">取消</el-button><el-button type="primary" @click="create">创建客户</el-button></template></el-dialog>
    <el-dialog v-model="customerSyncVisible" title="同步企业微信客户" width="720px" :close-on-click-modal="!customerSyncing">
      <el-alert title="通过企业微信客户联系能力，同步客户档案及员工跟进关系。" type="info" :closable="false" show-icon/>
      <div class="customer-sync-modes">
        <button :class="{active:customerSyncMode==='INCREMENTAL'}" @click="customerSyncMode='INCREMENTAL';customerSyncFinished=false"><b>增量同步</b><span>同步上次完成后新增或变更的客户，用于日常补偿。</span></button>
        <button :class="{active:customerSyncMode==='FULL'}" @click="customerSyncMode='FULL';customerSyncFinished=false"><b>全量同步</b><span>遍历开通客户联系的员工及其存量客户，适用于首次接入或全量对账。</span></button>
      </div>
      <div class="customer-sync-flow"><b>同步内容</b><span>员工列表</span><i>→</i><span>external_userid 客户列表</span><i>→</i><span>客户详情与跟进关系</span><i>→</i><span>本地客户档案</span></div>
      <el-descriptions :column="2" border class="customer-sync-detail"><el-descriptions-item label="同步范围">应用可见范围内的客户联系员工</el-descriptions-item><el-descriptions-item label="唯一标识">external_userid</el-descriptions-item><el-descriptions-item label="同步字段">名称、头像、性别、企业、添加时间、add_way、state、备注、标签</el-descriptions-item><el-descriptions-item label="关系保留">同一客户可关联多个员工</el-descriptions-item></el-descriptions>
      <el-alert class="customer-sync-warning" title="企微不保证返回客户真实手机号" description="add_way=2 仅表示通过手机号搜索添加。只同步员工备注手机号 remark_mobiles；准确手机号仍需由线索、订单或表单完成绑定。" type="warning" :closable="false" show-icon/>
      <section v-if="customerSyncing" class="customer-sync-result running"><b>正在创建后台同步任务……</b><span>回调和详情查询将按 external_userid + userid 幂等处理。</span></section>
      <section v-else-if="customerSyncFinished" class="customer-sync-result"><b>{{ customerSyncMode==='FULL'?'全量':'增量' }}同步完成</b><span>员工 12 人 · 检查客户 286 人 · 新增 8 人 · 更新 21 人 · 失败 0 人</span></section>
      <template #footer><el-button :disabled="customerSyncing" @click="customerSyncVisible=false">关闭</el-button><el-button type="primary" :loading="customerSyncing" @click="runCustomerSync">开始 {{ customerSyncMode==='FULL'?'全量':'增量' }}同步</el-button></template>
    </el-dialog>
    <el-dialog v-model="gradeDialog" title="编辑客户等级" width="520px"><el-alert title="客户首次建档继承线索等级；此处人工调整后作为客户当前等级，不回写原线索。S/A/B/C 选项来自统一等级字典。" type="info" :closable="false" show-icon/><el-form label-position="top" class="grade-editor-form"><el-form-item label="客户"><el-input :model-value="`${activeCustomer?.customer_no||''} · ${activeCustomer?.name||''}`" disabled/></el-form-item><el-form-item label="目标等级" required><el-select v-model="customerGradeForm.grade" style="width:100%"><el-option v-for="g in ['S','A','B','C']" :key="g" :label="`${g} 级`" :value="g"/></el-select></el-form-item><el-form-item label="调整原因" required><el-input v-model="customerGradeForm.reason" type="textarea" :rows="3" maxlength="200" show-word-limit/></el-form-item></el-form><template #footer><el-button @click="gradeDialog=false">取消</el-button><el-button type="primary" @click="saveCustomerGrade">确认调整</el-button></template></el-dialog>
    <el-dialog v-model="tagDialogVisible" :title="`${activeCustomer?.name||''} · 全部标签`" width="620px"><div class="tag-source-section" v-for="group in ['系统','企业微信']" :key="group"><h4>{{ group }}</h4><div><el-tag v-for="tag in (customerTags[activeCustomer?.id]||[]).filter(item=>item.source===group)" :key="tag.name" effect="plain">{{ tag.name }}</el-tag><span v-if="!(customerTags[activeCustomer?.id]||[]).some(item=>item.source===group)">暂无标签</span></div></div></el-dialog>
    <el-dialog v-model="tagFilterVisible" title="选择客户标签" width="780px"><div class="selected-tag-box"><b>已选标签</b><div><el-tag v-for="tag in selectedTagFilters" :key="tag" closable @close="selectedTagFilters=selectedTagFilters.filter(item=>item!==tag)">{{ tag }}</el-tag><span v-if="!selectedTagFilters.length">暂未选择</span></div></div><el-input v-model="tagSearch" clearable placeholder="搜索标签名称" class="tag-search"/><div class="tag-filter-groups"><section v-for="group in tagsBySource" :key="group.source"><h4>{{ group.source }}</h4><el-checkbox-group v-model="selectedTagFilters"><el-checkbox-button v-for="tag in group.tags" :key="tag.name" :value="tag.name">{{ tag.name }}</el-checkbox-button></el-checkbox-group></section></div><template #footer><el-button @click="selectedTagFilters=[]">清空</el-button><el-button @click="tagFilterVisible=false">取消</el-button><el-button type="primary" @click="tagFilterVisible=false">确定</el-button></template></el-dialog>
    <el-dialog v-model="mobileChangeVisible" title="变更手机号" width="680px" @closed="mobileValidation=null"><el-alert type="info" :closable="false" show-icon title="先校验、后变更" description="系统会同时检查线索与客户主档；手机号未占用可直接变更，同一负责人名下允许合并，不同负责人时禁止覆盖。"/><div class="mobile-change-form"><label><span>当前手机号</span><strong>{{ maskMobile(activeCustomer?.mobile) }}</strong><small>{{ activeCustomer?.customer_no }} · 一转负责人 {{ activeCustomer?.owner_name||'未分配' }}</small></label><label><span>新手机号</span><el-input v-model="newMobile" maxlength="11" clearable placeholder="请输入新的 11 位手机号" @input="mobileValidation=null"><template #append><el-button @click="validateNewMobile">校验手机号</el-button></template></el-input></label></div><section v-if="mobileValidation" class="mobile-validation-card"><header><div><b>{{ mobileValidation.title }}</b><span>{{ mobileValidation.message }}</span></div><el-tag :type="mobileValidation.status==='AVAILABLE'?'success':mobileValidation.status==='MERGE_ALLOWED'?'warning':'danger'">{{ mobileValidation.status==='AVAILABLE'?'可直接变更':mobileValidation.status==='MERGE_ALLOWED'?'可合并':'禁止变更' }}</el-tag></header><p v-if="mobileValidation.target_profile">命中客户：{{ mobileValidation.target_profile.customer_no }} · {{ mobileValidation.target_profile.name }} · 负责人 {{ mobileValidation.target_profile.owner_name||'未分配' }}</p></section><template #footer><el-button @click="mobileChangeVisible=false">取消</el-button><el-button v-if="mobileValidation&&['AVAILABLE','MERGE_ALLOWED'].includes(mobileValidation.status)" type="primary" @click="submitMobileChange">{{ mobileValidation.status==='MERGE_ALLOWED'?'确认合并档案':'确认变更手机号' }}</el-button></template></el-dialog>
  </section>
</template>

<style scoped>
.customer-definition{display:flex;align-items:center;margin-bottom:16px;padding:16px 22px}.customer-definition>div{min-width:210px}.customer-definition span,.customer-definition small{display:block;color:var(--muted);font-size:12px}.customer-definition b{display:block;margin:4px 0;color:var(--text);font-size:15px}.customer-definition i{width:36px;height:1px;margin:0 18px;background:var(--line)}.customer-definition .accent b{color:var(--primary)}
.customer-search-panel{padding:16px;border-bottom:1px solid var(--line)}.customer-basic-filters{display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap}.customer-basic-filters .el-input{width:300px}.customer-basic-filters .el-select{width:142px}.customer-basic-filters>span{margin-left:auto;color:var(--muted);font-size:12px}.cell-sub{display:block;margin-top:3px;color:var(--muted);font-size:11px;font-weight:400}.method-pill{display:inline-flex;padding:5px 9px;border-radius:8px;background:#edf5ff;color:#2874de;font-size:12px}.customer-link{padding:0;border:0;background:none;color:var(--primary);font-weight:700;cursor:pointer}.grade-editor-form{margin-top:18px}.dialog-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.form-help{display:block;margin-top:7px;color:var(--muted)}
.customer-table-toolbar{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--line)}.customer-table-toolbar>span{color:var(--text);font-weight:700}.customer-table-actions{display:flex;align-items:center;gap:10px}.customer-table-actions>small{color:var(--muted);font-size:11px}.column-setting-head{display:flex;align-items:center;justify-content:space-between}.column-setting-tip{margin:8px 0 14px;color:var(--muted);font-size:12px;line-height:1.6}.column-setting-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:4px 12px}
.customer-sync-modes{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0}.customer-sync-modes button{padding:16px;border:1px solid var(--line);border-radius:12px;background:#fff;text-align:left;cursor:pointer}.customer-sync-modes button.active{border-color:var(--primary);background:#f3f8ff;box-shadow:0 0 0 2px rgba(45,121,235,.1)}.customer-sync-modes b,.customer-sync-modes span{display:block}.customer-sync-modes span{margin-top:7px;color:var(--muted);font-size:12px;line-height:1.6}.customer-sync-flow{display:flex;align-items:center;gap:8px;padding:14px;border-radius:10px;background:#f7f9fc;overflow:auto}.customer-sync-flow>b{flex:none}.customer-sync-flow span{flex:none;padding:6px 9px;border-radius:7px;background:#fff;color:var(--secondary);font-size:11px}.customer-sync-flow i{color:var(--muted);font-style:normal}.customer-sync-detail{margin-top:14px}.customer-sync-warning{margin-top:14px}.customer-sync-result{display:grid;gap:5px;margin-top:14px;padding:14px;border:1px solid #a8e2cf;border-radius:10px;background:#f0fbf7}.customer-sync-result.running{border-color:#b9d6ff;background:#f2f7ff}.customer-sync-result span{color:var(--muted);font-size:12px}
.mobile-cell{display:flex;align-items:center;gap:4px}.customer-tags-cell{display:flex;align-items:center;gap:5px;max-width:100%;padding:0;border:0;background:none;cursor:pointer}.customer-tags-cell span{flex:none;color:var(--primary);font-size:12px}.customer-tags-cell em{color:var(--muted);font-style:normal}.tag-filter-trigger{min-width:120px}.selected-tag-box{padding:14px;border:1px solid var(--line);border-radius:10px;background:#fafcff}.selected-tag-box>b{display:block;margin-bottom:10px}.selected-tag-box>div{display:flex;flex-wrap:wrap;gap:7px;color:var(--muted)}.tag-search{margin:14px 0}.tag-filter-groups{display:grid;gap:14px;max-height:390px;overflow:auto}.tag-filter-groups section,.tag-source-section{padding:14px;border:1px solid var(--line);border-radius:10px}.tag-filter-groups h4,.tag-source-section h4{margin:0 0 12px}.tag-filter-groups .el-checkbox-group,.tag-source-section>div{display:flex;flex-wrap:wrap;gap:8px}.tag-source-section{margin-bottom:10px}.tag-source-section span{color:var(--muted);font-size:12px}.add-tag-row{display:grid;grid-template-columns:1fr auto;gap:10px;margin-top:16px;padding-top:16px;border-top:1px solid var(--line)}.mobile-change-form{display:grid;grid-template-columns:1fr 1.35fr;gap:12px;margin-top:16px}.mobile-change-form label{display:grid;align-content:start;gap:7px;padding:14px;border:1px solid var(--line);border-radius:10px;background:#f8fafc}.mobile-change-form label>span,.mobile-change-form label>small{color:var(--muted);font-size:12px}.mobile-change-form label>strong{font-size:20px}.mobile-validation-card{margin-top:14px;padding:15px;border:1px solid #dce7f5;border-radius:10px;background:#f8fbff}.mobile-validation-card header{display:flex;justify-content:space-between;gap:12px}.mobile-validation-card header div{display:grid;gap:5px}.mobile-validation-card header span,.mobile-validation-card p{color:var(--muted);font-size:12px}
.drawer-title{display:flex;align-items:center;gap:12px}.drawer-title span{color:var(--muted);font-size:12px}.drawer-title h2{margin:0;color:var(--text)}.profile-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.profile-summary>div,.profile-grid>div{padding:14px;border:1px solid var(--line);border-radius:12px;background:#f8fbff}.profile-summary span,.profile-grid span{display:block;color:var(--muted);font-size:12px}.profile-summary b,.profile-grid b{display:block;margin-top:6px;color:var(--text)}.profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.profile-grid .wide{grid-column:1/-1}.detail-mobile{display:flex!important;align-items:center;gap:5px}.customer-lead-table{margin-top:4px}.customer-timeline{display:grid;gap:10px}.timeline-card{display:flex;flex-direction:column;gap:6px;padding:18px;border-left:3px solid var(--primary);border-radius:0 12px 12px 0;background:#f7faff}.timeline-card time{color:var(--muted);font-size:11px}.timeline-card span{color:var(--muted);font-size:13px}
.customer-profile-tabs{min-height:420px}.customer-profile-tabs :deep(.el-tabs__content){padding-top:18px;overflow:visible}
@media(max-width:900px){.customer-definition{overflow:auto}.profile-summary{grid-template-columns:1fr 1fr}.customer-basic-filters .el-input,.customer-basic-filters .el-select{width:100%}.dialog-grid,.profile-grid{grid-template-columns:1fr}}
</style>
