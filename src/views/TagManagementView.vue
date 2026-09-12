<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, EditPen, MoreFilled, Plus, RefreshRight, Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'

type TagKind = '企微企业标签' | '企微个人标签'
type TagRow = { id:number; name:string; externalId:string; customers:number; creator:string; updatedAt:string }
type TagGroup = { id:number; name:string; department:string; tags:TagRow[] }
type GlobalTagRow = TagRow & { groupId:number; groupName:string; department:string }

const router = useRouter()
const activeKind = ref<TagKind>('企微企业标签')
const selectedGroupId = ref(1)
const keyword = ref('')
const groupKeyword = ref('')
const groupSearchVisible = ref(false)
const batchGroupDeleteMode = ref(false)
const selectedGroupIds = ref<number[]>([])
const globalSearchMode = ref(false)
const globalKeyword = ref('')
const addGroupVisible = ref(false)
const editGroupVisible = ref(false)
const editingGroupId = ref<number | null>(null)
const batchGroupTagsVisible = ref(false)
const addTagsVisible = ref(false)
const batchAddTagsVisible = ref(false)
const editTagVisible = ref(false)
const editingTag = ref<TagRow | null>(null)
const groupForm = reactive({ name:'', department:'不限', tagName:'', tags:[] as string[] })
const groupEditForm = reactive({ name:'', department:'不限' })
const batchGroupText = ref('')
const pendingTagNames = ref<string[]>([])
const singleTagName = ref('')
const batchAddText = ref('')
const tagForm = reactive({ name:'' })

const groups = ref<TagGroup[]>([
  { id:1, name:'客户阶段', department:'全部部门', tags:[
    { id:101, name:'试听已预约', externalId:'etKfAQAABgAA21', customers:1286, creator:'张铭钰', updatedAt:'2026-09-12 10:26' },
    { id:102, name:'正式课已支付', externalId:'etKfAQAAC91m73', customers:863, creator:'张铭钰', updatedAt:'2026-09-11 18:05' },
    { id:103, name:'续费待跟进', externalId:'etKfAQAAG339', customers:241, creator:'林校长', updatedAt:'2026-09-10 09:42' }
  ]},
  { id:2, name:'购买意向', department:'深圳二转组', tags:[
    { id:201, name:'高购买意向', externalId:'etKfAQAAX811', customers:4328, creator:'王老师', updatedAt:'2026-09-09 16:30' },
    { id:202, name:'价格敏感', externalId:'etKfAQAAH302', customers:712, creator:'王老师', updatedAt:'2026-09-08 14:16' }
  ]},
  { id:3, name:'运营跟进', department:'全部部门', tags:[{ id:301, name:'重点客户', externalId:'etKfAQAAE6519', customers:2320, creator:'陈老师', updatedAt:'2026-09-07 11:08' }]},
  { id:4, name:'课程偏好', department:'全部部门', tags:[] },
  { id:5, name:'来源渠道', department:'全部部门', tags:[] }
])
const personalGroups = ref<TagGroup[]>([
  { id:91, name:'林校长的个人标签', department:'仅本人可见', tags:[{ id:901, name:'本周优先联系', externalId:'ptKfAQAA001', customers:18, creator:'林校长', updatedAt:'2026-09-12 09:20' }]}
])

const currentGroups = computed(() => activeKind.value === '企微企业标签' ? groups.value : personalGroups.value)
const visibleGroups = computed(() => currentGroups.value.filter(group => !groupKeyword.value || group.name.includes(groupKeyword.value)))
const selectedGroup = computed(() => currentGroups.value.find(group => group.id === selectedGroupId.value) || currentGroups.value[0])
const visibleTags = computed(() => (selectedGroup.value?.tags || []).filter(tag => !keyword.value || `${tag.name}${tag.externalId}`.toLowerCase().includes(keyword.value.toLowerCase())))
const globalTags = computed<GlobalTagRow[]>(() => {
  const query=globalKeyword.value.trim().toLowerCase()
  return currentGroups.value.flatMap(group => group.tags.map(tag => ({ ...tag, groupId:group.id, groupName:group.name, department:group.department }))).filter(tag => !query || `${tag.name}${tag.externalId}${tag.groupName}`.toLowerCase().includes(query))
})
const totals = computed(() => ({ groups:currentGroups.value.length, tags:currentGroups.value.reduce((sum, group) => sum + group.tags.length, 0) }))

function switchKind(kind:TagKind){ activeKind.value=kind; selectedGroupId.value=currentGroups.value[0]?.id || 0; keyword.value=''; groupKeyword.value=''; globalSearchMode.value=false; globalKeyword.value=''; batchGroupDeleteMode.value=false; selectedGroupIds.value=[] }
function openGlobalSearch(){ globalKeyword.value=''; globalSearchMode.value=true }
function closeGlobalSearch(){ globalSearchMode.value=false; globalKeyword.value='' }
function openTagCustomers(tag:TagRow){ router.push({ path:'/customers/list', query:{ tagName:tag.name, externalTagId:tag.externalId } }) }
function toggleGroupSearch(){ groupSearchVisible.value=!groupSearchVisible.value; if(!groupSearchVisible.value) groupKeyword.value='' }
function openGroupCreator(){ Object.assign(groupForm,{name:'',department:'不限',tagName:'',tags:[]}); addGroupVisible.value=true }
function startBatchGroupDelete(){ batchGroupDeleteMode.value=true; selectedGroupIds.value=[] }
function cancelBatchGroupDelete(){ batchGroupDeleteMode.value=false; selectedGroupIds.value=[] }
function toggleGroupSelection(group:TagGroup,checked:boolean){ selectedGroupIds.value=checked?[...selectedGroupIds.value,group.id]:selectedGroupIds.value.filter(id=>id!==group.id) }
async function confirmBatchGroupDelete(){
  if(!selectedGroupIds.value.length) return ElMessage.warning('请至少选择一个空分组')
  await ElMessageBox.confirm(`确定删除选中的 ${selectedGroupIds.value.length} 个标签分组吗？`,'批量删除分组',{type:'warning'})
  const ids=new Set(selectedGroupIds.value)
  currentGroups.value.splice(0,currentGroups.value.length,...currentGroups.value.filter(group=>!ids.has(group.id)))
  selectedGroupId.value=currentGroups.value[0]?.id || 0
  cancelBatchGroupDelete(); ElMessage.success('标签分组已批量删除')
}
function handleGroupCommand(command:string,group:TagGroup){ if(command==='edit') openGroupEditor(group); if(command==='delete') removeGroup(group) }
function openGroupEditor(group:TagGroup){ editingGroupId.value=group.id; Object.assign(groupEditForm,{name:group.name,department:group.department}); editGroupVisible.value=true }
function saveGroupEdit(){
  const name=groupEditForm.name.trim()
  if(!name) return ElMessage.warning('请输入标签组名称')
  if(currentGroups.value.some(group=>group.id!==editingGroupId.value && group.name===name)) return ElMessage.warning('标签组名称已存在')
  const group=currentGroups.value.find(item=>item.id===editingGroupId.value)
  if(group) Object.assign(group,{name,department:groupEditForm.department})
  editGroupVisible.value=false; ElMessage.success('标签分组已更新')
}
async function removeGroup(group:TagGroup){
  if(group.tags.length) return ElMessage.warning('请先清空分组下内容再删除分组！')
  await ElMessageBox.confirm(`确定删除标签分组“${group.name}”吗？`,'删除标签分组',{type:'warning'})
  const index=currentGroups.value.findIndex(item=>item.id===group.id)
  if(index>=0) currentGroups.value.splice(index,1)
  selectedGroupId.value=currentGroups.value[0]?.id || 0
  ElMessage.success('标签分组已删除')
}
function createGroup(){
  const name=groupForm.name.trim()
  if(!name) return ElMessage.warning('请输入标签组名称')
  if(currentGroups.value.some(group => group.name === name)) return ElMessage.warning('标签组名称已存在')
  if(!groupForm.tags.length) return ElMessage.warning('请至少添加一个标签')
  const now=Date.now(); const tags=groupForm.tags.map((tag,index)=>({ id:now+index, name:tag, externalId:`etKfAQA${String(now+index).slice(-7)}`, customers:0, creator:'林校长', updatedAt:new Date().toLocaleString('zh-CN',{hour12:false}) }))
  currentGroups.value.unshift({ id:now, name, department:groupForm.department, tags }); selectedGroupId.value=now
  addGroupVisible.value=false; Object.assign(groupForm,{name:'',department:'不限',tagName:'',tags:[]}); ElMessage.success(`分组已创建，并新增 ${tags.length} 个标签`)
}
function addGroupTag(){ const name=groupForm.tagName.trim(); if(!name) return ElMessage.warning('请输入标签名称'); if(name.length>15) return ElMessage.warning('标签名称最多15个字'); if(groupForm.tags.includes(name)) return ElMessage.warning('标签名称不能重复'); groupForm.tags.push(name); groupForm.tagName='' }
function openBatchGroupTags(){ batchGroupText.value=''; batchGroupTagsVisible.value=true }
function confirmBatchGroupTags(){ const names=batchGroupText.value.split(/\n+/).map(item=>item.trim()).filter(Boolean); if(!names.length) return ElMessage.warning('请至少输入一个标签'); const invalid=names.find(name=>name.length>15); if(invalid) return ElMessage.warning(`“${invalid}”超过15个字`); groupForm.tags=[...new Set([...groupForm.tags,...names])]; batchGroupTagsVisible.value=false }
function removeGroupTag(index:number){ groupForm.tags.splice(index,1) }
function openTagCreator(){ pendingTagNames.value=[]; singleTagName.value=''; batchAddText.value=''; addTagsVisible.value=true }
function appendPendingTag(){ const name=singleTagName.value.trim(); if(!name){ ElMessage.warning('请输入标签名称'); return false } if(name.length>15){ ElMessage.warning('标签名称最多15个字'); return false } if(pendingTagNames.value.includes(name) || selectedGroup.value?.tags.some(tag=>tag.name===name)){ ElMessage.warning('标签名称不能重复'); return false } if(pendingTagNames.value.length>=20){ ElMessage.warning('单次最多新增20个标签'); return false } pendingTagNames.value.push(name); singleTagName.value=''; return true }
function openBatchAddTags(){ batchAddText.value=''; batchAddTagsVisible.value=true }
function confirmBatchAddTags(){ const names=batchAddText.value.split(/\n+/).map(item=>item.trim()).filter(Boolean); if(!names.length) return ElMessage.warning('请至少输入一个标签'); const invalid=names.find(name=>name.length>15); if(invalid) return ElMessage.warning(`“${invalid}”超过15个字`); const existing=new Set([...(selectedGroup.value?.tags.map(tag=>tag.name) || []),...pendingTagNames.value]); const additions=[...new Set(names)].filter(name=>!existing.has(name)); if(!additions.length) return ElMessage.warning('输入的标签均已存在'); if(pendingTagNames.value.length+additions.length>20) return ElMessage.warning('单次最多新增20个标签'); pendingTagNames.value.push(...additions); batchAddTagsVisible.value=false }
function removePendingTag(index:number){ pendingTagNames.value.splice(index,1) }
function createTags(){
  if(singleTagName.value.trim() && !appendPendingTag()) return
  if(!pendingTagNames.value.length) return ElMessage.warning('请至少添加一个标签')
  const names=[...pendingTagNames.value]
  names.forEach((name,index)=>selectedGroup.value?.tags.unshift({ id:Date.now()+index, name, externalId:`etKfAQA${String(Date.now()+index).slice(-7)}`, customers:0, creator:'林校长', updatedAt:new Date().toLocaleString('zh-CN',{hour12:false}) }))
  addTagsVisible.value=false; pendingTagNames.value=[]; ElMessage.success(`已新增并同步 ${names.length} 个企微标签`)
}
function openEdit(tag:TagRow){ editingTag.value=tag; tagForm.name=tag.name; editTagVisible.value=true }
function saveTag(){ if(!tagForm.name.trim()) return ElMessage.warning('请输入标签名称'); if(editingTag.value) editingTag.value.name=tagForm.name.trim(); editTagVisible.value=false; ElMessage.success('标签名称已更新至企业微信') }
async function removeTag(tag:TagRow){ await ElMessageBox.confirm(`确定删除标签“${tag.name}”吗？删除后将同步至企业微信。`,'删除标签',{type:'warning'}); const group=currentGroups.value.find(item=>item.tags.some(current=>current.id===tag.id)); const index=group?.tags.findIndex(item=>item.id===tag.id) ?? -1; if(group && index>=0) group.tags.splice(index,1); ElMessage.success('标签已删除') }
function syncTags(){ ElMessage.success('企微标签同步完成：新增 2 个，更新 1 个') }
</script>

<template>
  <div class="page wecom-tag-page">
    <PageHeader eyebrow="CUSTOMER · WECOM TAGS" title="企微标签" description="按企业微信标签组维护企业标签与个人标签，页面数据与当前企业主体保持同步。" />
    <section class="surface toolbar-card"><div class="kind-switch" role="tablist" aria-label="企微标签类型"><button v-for="kind in (['企微企业标签','企微个人标签'] as TagKind[])" :key="kind" :class="{active:activeKind===kind}" @click="switchKind(kind)">{{ kind }}</button></div></section>
    <section class="summary-line"><strong>共 {{ totals.groups }} 个标签组，{{ totals.tags }} 个标签</strong><el-button type="primary" :icon="RefreshRight" @click="syncTags">同步企微标签</el-button></section>
    <el-alert title="企业微信是标签主数据源；在本页新增、编辑或删除后会同步至当前企业主体。" type="info" :closable="false" show-icon/>
    <section v-if="!globalSearchMode" class="surface split-workspace">
      <aside class="group-pane"><header><div><h2>标签分组</h2><small>{{ activeKind }}</small></div><div class="group-actions"><el-button circle :type="groupSearchVisible ? 'primary' : 'default'" :icon="Search" title="搜索标签分组" aria-label="搜索标签分组" @click="toggleGroupSearch"/><el-button v-if="activeKind==='企微企业标签'" type="primary" :icon="Plus" @click="openGroupCreator">新增分组</el-button><el-button v-if="activeKind==='企微企业标签'" circle :icon="MoreFilled" title="批量删除分组" aria-label="批量删除分组" @click="startBatchGroupDelete"/></div></header><div v-if="groupSearchVisible" class="group-search"><el-input v-model="groupKeyword" clearable :prefix-icon="Search" placeholder="搜索标签分组名称" autofocus/></div><div v-if="batchGroupDeleteMode" class="batch-group-bar"><span>仅可选择空分组 · 已选 {{ selectedGroupIds.length }} 个</span><div><el-button size="small" @click="cancelBatchGroupDelete">取消</el-button><el-button size="small" type="danger" @click="confirmBatchGroupDelete">删除</el-button></div></div><div class="group-head"><span>分组名称</span><span>适用部门</span></div><div v-for="group in visibleGroups" :key="group.id" class="group-row" :class="{active:selectedGroup?.id===group.id,batch:batchGroupDeleteMode}" role="button" tabindex="0" @click="selectedGroupId=group.id" @keyup.enter="selectedGroupId=group.id"><el-checkbox v-if="batchGroupDeleteMode" :model-value="selectedGroupIds.includes(group.id)" :disabled="group.tags.length>0" :title="group.tags.length?'请先清空分组下内容再删除分组':''" @click.stop @change="toggleGroupSelection(group,Boolean($event))"/><span><b>{{ group.name }}</b><small>{{ group.tags.length }} 个标签</small></span><em>{{ group.department }}</em><el-dropdown trigger="click" @click.stop @command="handleGroupCommand($event,group)"><el-button link :icon="MoreFilled" title="分组操作" aria-label="分组操作"/><template #dropdown><el-dropdown-menu><el-dropdown-item command="edit" :icon="EditPen">编辑</el-dropdown-item><el-dropdown-item command="delete" :icon="Delete" divided>删除</el-dropdown-item></el-dropdown-menu></template></el-dropdown></div><div v-if="!visibleGroups.length" class="empty-state">未找到匹配的标签分组</div></aside>
      <main class="tag-pane"><header><div><h2>标签分组：{{ selectedGroup?.name || '—' }}</h2><small>{{ selectedGroup?.department || '' }}</small></div><div><el-button :icon="Search" @click="openGlobalSearch">搜索</el-button><el-button type="primary" :icon="Plus" @click="openTagCreator">添加标签</el-button></div></header><el-table :data="visibleTags" row-key="id" height="560"><el-table-column prop="name" label="标签" min-width="170"><template #default="{row}"><b>{{ row.name }}</b><small class="tag-id">{{ row.externalId }}</small></template></el-table-column><el-table-column prop="customers" label="使用客户" width="120" sortable align="right"><template #default="{row}"><el-button link type="primary" class="customer-count-link" @click="openTagCustomers(row)">{{ row.customers }}</el-button></template></el-table-column><el-table-column prop="creator" label="创建人" width="130"/><el-table-column prop="updatedAt" label="更新时间" width="170"/><el-table-column label="操作" width="140" fixed="right"><template #default="{row}"><el-button link type="primary" @click="openEdit(row)">编辑</el-button><el-button link type="danger" @click="removeTag(row)">删除</el-button></template></el-table-column><template #empty><el-empty description="当前分组暂无标签"><el-button type="primary" @click="openTagCreator">添加标签</el-button></el-empty></template></el-table></main>
    </section>
    <section v-else class="surface global-search-card">
      <header class="global-search-head"><div><h2>全局搜索标签</h2><small>在当前{{ activeKind }}的全部标签分组中搜索</small></div></header>
      <div class="global-search-bar"><el-input v-model="globalKeyword" size="large" clearable :prefix-icon="Search" placeholder="请输入标签名称、企微标签ID或标签分组名称" autofocus/><el-button size="large" @click="closeGlobalSearch">取消</el-button></div>
      <el-table :data="globalTags" row-key="id" height="560"><el-table-column prop="name" label="标签名称" min-width="210"><template #default="{row}"><b>{{ row.name }}</b><small class="tag-id">{{ row.externalId }}</small></template></el-table-column><el-table-column prop="groupName" label="标签分组" min-width="170"/><el-table-column prop="department" label="适用部门" min-width="150"/><el-table-column prop="customers" label="使用客户" width="130" sortable align="right"><template #default="{row}"><el-button link type="primary" class="customer-count-link" @click="openTagCustomers(row)">{{ row.customers }}</el-button></template></el-table-column><el-table-column label="操作" width="140" fixed="right"><template #default="{row}"><el-button link type="primary" @click="openEdit(row)">编辑</el-button><el-button link type="danger" @click="removeTag(row)">删除</el-button></template></el-table-column><template #empty><el-empty description="未搜索到匹配标签"/></template></el-table>
    </section>
    <el-dialog v-model="addGroupVisible" title="新增分组" width="720px" class="group-create-dialog"><el-form label-position="top"><section class="group-form-block"><el-form-item label="分组名称" required><el-input v-model="groupForm.name" maxlength="15" show-word-limit placeholder="请输入标签组名称"/></el-form-item><el-form-item label="适用范围"><el-select v-model="groupForm.department" style="width:100%"><el-option label="不限" value="不限"/><el-option label="深圳二转组" value="深圳二转组"/><el-option label="课程顾问部" value="课程顾问部"/></el-select></el-form-item></section><section class="group-form-block tag-create-block"><el-form-item label="标签" required><div class="single-tag-row"><el-input v-model="groupForm.tagName" maxlength="15" show-word-limit placeholder="请输入标签名称" @keyup.enter="addGroupTag"/><el-button circle :icon="Plus" aria-label="添加标签" @click="addGroupTag"/></div></el-form-item><el-button link type="primary" class="batch-create-link" @click="openBatchGroupTags">批量新建</el-button><div v-if="groupForm.tags.length" class="pending-tags"><el-tag v-for="(tag,index) in groupForm.tags" :key="tag" closable effect="plain" @close="removeGroupTag(index)">{{ tag }}</el-tag></div></section></el-form><template #footer><el-button @click="addGroupVisible=false">取消</el-button><el-button type="primary" @click="createGroup">保存</el-button></template></el-dialog>
    <el-dialog v-model="editGroupVisible" title="编辑标签分组" width="560px"><el-form label-position="top" class="dialog-form"><el-form-item label="分组名称" required><el-input v-model="groupEditForm.name" maxlength="15" show-word-limit placeholder="请输入标签组名称"/></el-form-item><el-form-item label="适用部门"><el-select v-model="groupEditForm.department" style="width:100%"><el-option label="不限" value="不限"/><el-option label="全部部门" value="全部部门"/><el-option label="深圳二转组" value="深圳二转组"/><el-option label="课程顾问部" value="课程顾问部"/><el-option label="仅本人可见" value="仅本人可见"/></el-select></el-form-item></el-form><template #footer><el-button @click="editGroupVisible=false">取消</el-button><el-button type="primary" @click="saveGroupEdit">确定</el-button></template></el-dialog>
    <el-dialog v-model="batchGroupTagsVisible" title="批量新建标签" width="560px" append-to-body><p class="batch-dialog-title">每行可输入一个标签，回车键可换行</p><el-input v-model="batchGroupText" type="textarea" :rows="10" maxlength="640" placeholder="每行可输入一个标签，回车键可换行"/><template #footer><el-button @click="batchGroupTagsVisible=false">取消</el-button><el-button type="primary" @click="confirmBatchGroupTags">确定</el-button></template></el-dialog>
    <el-dialog v-model="addTagsVisible" :title="`添加标签 · ${selectedGroup?.name || ''}`" width="720px" class="tag-create-dialog"><section class="tag-add-panel"><label><i>*</i> 标签</label><div class="single-tag-row"><el-input v-model="singleTagName" maxlength="15" show-word-limit placeholder="请输入标签名称" @keyup.enter="appendPendingTag"/><el-button circle :icon="Plus" aria-label="添加标签" @click="appendPendingTag"/></div><el-button link type="primary" class="batch-create-link" @click="openBatchAddTags">批量新建</el-button><div v-if="pendingTagNames.length" class="pending-tags"><el-tag v-for="(tag,index) in pendingTagNames" :key="tag" closable effect="plain" @close="removePendingTag(index)">{{ tag }}</el-tag></div><el-empty v-else :image-size="72" description="输入标签名称后点击加号添加"/></section><template #footer><el-button @click="addTagsVisible=false">取消</el-button><el-button type="primary" @click="createTags">保存</el-button></template></el-dialog>
    <el-dialog v-model="batchAddTagsVisible" title="批量新建标签" width="560px" append-to-body><p class="batch-dialog-title">每行可输入一个标签，回车键可换行</p><el-input v-model="batchAddText" type="textarea" :rows="10" maxlength="640" placeholder="每行可输入一个标签，回车键可换行"/><template #footer><el-button @click="batchAddTagsVisible=false">取消</el-button><el-button type="primary" @click="confirmBatchAddTags">确定</el-button></template></el-dialog>
    <el-dialog v-model="editTagVisible" title="编辑企微标签" width="500px"><el-form label-position="top"><el-form-item label="标签名称" required><el-input v-model="tagForm.name" maxlength="15" show-word-limit/></el-form-item></el-form><template #footer><el-button @click="editTagVisible=false">取消</el-button><el-button type="primary" @click="saveTag">保存并同步</el-button></template></el-dialog>
  </div>
</template>

<style scoped>
.wecom-tag-page{--tag-blue:#2878ef}.toolbar-card{padding:18px 20px;margin-bottom:16px}.kind-switch{display:flex;width:max-content;border:1px solid #cbd8e8;border-radius:7px;overflow:hidden}.kind-switch button{height:42px;padding:0 22px;border:0;border-right:1px solid #cbd8e8;background:#fff;color:#34465e;font:inherit;font-weight:700;cursor:pointer}.kind-switch button:last-child{border-right:0}.kind-switch button.active{background:#eaf4ff;color:var(--tag-blue);box-shadow:inset 0 -3px var(--tag-blue)}.summary-line{display:flex;align-items:center;justify-content:space-between;margin:20px 0 14px;padding:0 4px}.summary-line strong{font-size:18px}.split-workspace{display:grid;grid-template-columns:360px minmax(0,1fr);min-height:650px;margin-top:16px;overflow:hidden}.group-pane{border-right:1px solid var(--line);background:#fbfcfe}.group-pane header,.tag-pane header{height:86px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line)}h2{margin:0 0 5px;font-size:18px}header small{color:var(--muted)}.group-actions{display:flex;align-items:center;gap:8px}.group-search{padding:12px 16px;border-bottom:1px solid var(--line);background:#f7faff}.group-head{display:grid;grid-template-columns:1fr 112px;padding:14px 22px;background:#f3f6fa;color:var(--secondary);font-size:12px}.group-row{width:100%;display:grid;grid-template-columns:1fr 112px 24px;align-items:center;min-height:74px;padding:12px 18px 12px 22px;border:0;border-bottom:1px solid #edf1f6;background:transparent;color:var(--text);text-align:left;cursor:pointer}.group-row:hover{background:#f4f8fe}.group-row.active{position:relative;background:#eaf3ff;color:#1f68d4}.group-row.active:before{content:"";position:absolute;top:0;bottom:0;left:0;width:4px;background:var(--tag-blue)}.group-row b,.group-row small{display:block}.group-row small{margin-top:6px;color:#8594a7;font-size:11px}.group-row em{overflow:hidden;color:#527cb6;font-size:12px;font-style:normal;text-overflow:ellipsis;white-space:nowrap}.tag-pane{min-width:0}.tag-pane :deep(.el-table){padding:0 18px}.tag-pane :deep(.el-table th.el-table__cell){background:#f6f8fb}.tag-id{display:block;margin-top:5px;color:#93a0b0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.empty-state{padding:50px 20px;text-align:center;color:var(--muted)}.dialog-form{margin-top:18px}.group-form-block{padding:18px 20px;border:1px solid var(--line);border-radius:10px;background:#fbfcff}.group-form-block+.group-form-block{margin-top:14px}.single-tag-row{width:100%;display:grid;grid-template-columns:1fr 40px;gap:10px}.batch-create-link{margin-top:-6px}.pending-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.batch-dialog-title{margin:0 0 14px;color:var(--text);font-size:16px;font-weight:700}@media(max-width:1000px){.split-workspace{grid-template-columns:290px minmax(600px,1fr);overflow:auto}}@media(max-width:720px){.summary-line{align-items:flex-start;gap:12px;flex-direction:column}.split-workspace{display:block}.group-pane{border-right:0}.tag-pane{overflow:auto}.kind-switch{width:100%}.kind-switch button{flex:1;padding:0 8px}}
.global-search-card{min-height:650px;margin-top:16px;overflow:hidden}.global-search-head{padding:22px 24px 8px}.global-search-bar{display:grid;grid-template-columns:minmax(320px,760px) auto;gap:14px;padding:18px 24px 24px;border-bottom:1px solid var(--line)}.global-search-card :deep(.el-table){padding:16px 24px 0}.global-search-card :deep(.el-table th.el-table__cell){background:#f6f8fb}.group-row{grid-template-columns:minmax(0,1fr) 86px 32px;gap:6px;padding-right:12px}.group-row.batch{grid-template-columns:24px minmax(0,1fr) 76px 32px}.group-row :deep(.el-dropdown){justify-self:end}.group-row :deep(.el-dropdown .el-button){padding:6px}.batch-group-bar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 14px;border-bottom:1px solid #cfe0fa;background:#eef5ff;color:#3b679e;font-size:12px}.tag-add-panel{display:grid;grid-template-columns:104px minmax(0,1fr);gap:18px 14px;min-height:340px;padding:26px 12px}.tag-add-panel>label{padding-top:10px;text-align:right;font-weight:700}.tag-add-panel>label i{color:#f56c6c;font-style:normal}.tag-add-panel>.batch-create-link,.tag-add-panel>.pending-tags,.tag-add-panel>.el-empty{grid-column:2}.tag-add-panel>.batch-create-link{width:max-content;margin-top:-8px}.tag-add-panel>.pending-tags{margin-top:-4px}.tag-add-panel>.el-empty{padding:12px 0}@media(max-width:720px){.global-search-bar{grid-template-columns:1fr}.global-search-card :deep(.el-table){padding:12px}.tag-add-panel{grid-template-columns:1fr}.tag-add-panel>label{text-align:left}.tag-add-panel>.batch-create-link,.tag-add-panel>.pending-tags,.tag-add-panel>.el-empty{grid-column:1}}
</style>
