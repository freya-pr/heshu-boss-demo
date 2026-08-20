<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '../components/PageHeader.vue'
import '../styles/role.css'

type Role = { id:number; code:string; name:string; type:'BUILT_IN'|'CUSTOM'; description:string; members:number; status:'ACTIVE'|'INACTIVE'; permissionSummary:string; fieldSummary:string }
const keyword=ref(''), status=ref(''), drawer=ref(false), drawerMode=ref<'detail'|'member'|'permission'>('detail'), current=ref<Role|null>(null)
const roles=ref<Role[]>([
  {id:1,code:'ROLE_SYSTEM_ADMIN',name:'系统管理员',type:'BUILT_IN',description:'维护合数BOSS系统配置，不默认获得全部业务数据',members:2,status:'ACTIVE',permissionSummary:'系统管理全部操作',fieldSummary:'系统字段'},
  {id:2,code:'ROLE_OPERATION',name:'运营',type:'CUSTOM',description:'维护渠道、店铺、活码和线索运营配置',members:8,status:'ACTIVE',permissionSummary:'线索中心 36 项',fieldSummary:'业务字段'},
  {id:3,code:'ROLE_CUSTOMER_SERVICE',name:'客服',type:'CUSTOM',description:'处理客户咨询、回访及服务协同',members:12,status:'ACTIVE',permissionSummary:'客户中心 21 项',fieldSummary:'手机号脱敏'},
  {id:4,code:'ROLE_PLANNER',name:'规划师',type:'CUSTOM',description:'承接诊断规划、建群与服务交付',members:16,status:'ACTIVE',permissionSummary:'客户与交付 24 项',fieldSummary:'手机号脱敏'},
  {id:5,code:'ROLE_FIRST_CONVERSION',name:'一转老师',type:'CUSTOM',description:'跟进线索、转客户并维护一转业务信息',members:38,status:'ACTIVE',permissionSummary:'线索与客户 18 项',fieldSummary:'按操作授权'},
  {id:6,code:'ROLE_FINANCE',name:'财务专员',type:'CUSTOM',description:'查询订单并处理支付和退款业务',members:4,status:'ACTIVE',permissionSummary:'订单与支付 16 项',fieldSummary:'支付字段'}
])
const form=reactive({name:'',code:'',description:'',status:'ACTIVE'})
const visibleRoles=computed(()=>{const term=keyword.value.trim().toLowerCase();return roles.value.filter(row=>(!status.value||row.status===status.value)&&(!term||`${row.code}${row.name}${row.description}`.toLowerCase().includes(term)))})
const drawerTitle=computed(()=>drawerMode.value==='member'?'关联员工':drawerMode.value==='permission'?'功能权限':'角色详情')
function open(mode:typeof drawerMode.value,row:Role){current.value=row;drawerMode.value=mode;drawer.value=true}
function createRole(){current.value=null;Object.assign(form,{name:'',code:'保存后自动生成',description:'',status:'ACTIVE'});drawerMode.value='detail';drawer.value=true}
async function removeRole(row:Role){if(row.type==='BUILT_IN'){ElMessage.warning('系统内置角色不可删除');return}if(row.members){await ElMessageBox.alert(`该角色仍关联 ${row.members} 名员工，请先解除关联。`,'暂时无法删除',{type:'warning'});return}roles.value=roles.value.filter(item=>item.id!==row.id);ElMessage.success('角色已删除')}
</script>

<template>
  <section class="page role-page">
    <PageHeader eyebrow="HESHU BOSS · FUNCTION ACCESS" title="角色管理" description="按运营、客服、规划师等业务职责配置菜单、操作和字段权限。角色只决定能做什么，不决定能看哪些数据。">
      <el-button type="primary" @click="createRole">新增角色</el-button>
    </PageHeader>
    <div class="role-summary">
      <div><span>角色总数</span><b>{{ roles.length }}</b></div>
      <div><span>启用角色</span><b>{{ roles.filter(item=>item.status==='ACTIVE').length }}</b></div>
      <div><span>已关联员工</span><b>{{ roles.reduce((sum,item)=>sum+item.members,0) }}</b></div>
      <p><strong>权限分工</strong><span>角色配置功能权限；数据可见范围统一到“岗位管理”维护。</span></p>
    </div>
    <main class="surface role-table-shell">
      <div class="role-toolbar"><div><el-select v-model="status" clearable placeholder="角色状态"><el-option label="启用" value="ACTIVE"/><el-option label="停用" value="INACTIVE"/></el-select><el-input v-model="keyword" clearable prefix-icon="Search" placeholder="搜索角色名称、编码或描述"/></div><span>共 {{ visibleRoles.length }} 个角色</span></div>
      <el-table :data="visibleRoles" row-key="id">
        <el-table-column prop="name" label="角色名称" min-width="180"><template #default="{row}"><button class="org-name-link" @click="open('detail',row)">{{ row.name }}</button><el-tag v-if="row.type==='BUILT_IN'" class="role-built-in" size="small">内置</el-tag><small class="role-code">{{ row.code }}</small></template></el-table-column>
        <el-table-column prop="description" label="角色说明" min-width="260" show-overflow-tooltip/>
        <el-table-column prop="members" label="关联员工" width="110"><template #default="{row}"><el-button link type="primary" @click="open('member',row)">{{ row.members }} 人</el-button></template></el-table-column>
        <el-table-column label="功能权限" min-width="210"><template #default="{row}"><button class="permission-link" @click="open('permission',row)"><b>配置菜单与操作</b><span>{{ row.permissionSummary }} · {{ row.fieldSummary }}</span></button></template></el-table-column>
        <el-table-column prop="status" label="状态" width="90"><template #default="{row}"><el-tag :type="row.status==='ACTIVE'?'success':'info'">{{ row.status==='ACTIVE'?'启用':'停用' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="165" fixed="right"><template #default="{row}"><el-button link type="primary" @click="open('detail',row)">详情</el-button><el-button link type="primary" @click="open('member',row)">关联</el-button><el-button link type="danger" @click="removeRole(row)">删除</el-button></template></el-table-column>
      </el-table>
      <div class="employee-pagination"><span>角色变更只影响功能访问，并记录操作日志</span><el-pagination background layout="prev, pager, next, total" :total="visibleRoles.length" :page-size="10"/></div>
    </main>
    <el-drawer v-model="drawer" :title="drawerTitle" size="560px">
      <template v-if="drawerMode==='permission' && current"><div class="permission-explain"><b>{{ current.name }}</b><span>按菜单配置查看、新增、编辑、删除、导入、导出等操作；敏感字段明文权限单独授权。</span></div><el-alert title="这里不配置本人、小组、部门或公司数据范围；数据范围请到岗位管理维护。" type="info" :closable="false" show-icon/><el-tree :data="[{label:'线索中心',children:[{label:'线索查看 / 编辑 / 分配 / 导出'},{label:'活码与渠道配置'}]},{label:'客户中心',children:[{label:'客户查看 / 编辑 / 移交'},{label:'手机号与邮箱明文查看'}]},{label:'系统管理',children:[{label:'组织与员工管理'},{label:'岗位、角色与菜单管理'}]}]" show-checkbox default-expand-all/></template>
      <template v-else-if="drawerMode==='member' && current"><div class="permission-explain"><b>{{ current.name }} · {{ current.members }} 人</b><span>业务角色可多选；多角色功能权限取并集，显式禁用优先。</span></div><el-input prefix-icon="Search" placeholder="搜索员工编号或姓名"/><el-empty description="成员选择器演示"/></template>
      <template v-else><el-form label-position="top"><el-form-item label="角色名称"><el-input :model-value="current?.name||form.name" placeholder="如运营、客服、规划师"/></el-form-item><el-form-item label="角色编码"><el-input :model-value="current?.code||form.code" disabled/></el-form-item><el-form-item label="角色说明"><el-input :model-value="current?.description||form.description" type="textarea" :rows="3"/></el-form-item><el-form-item label="状态"><el-radio-group :model-value="current?.status||form.status"><el-radio value="ACTIVE">启用</el-radio><el-radio value="INACTIVE">停用</el-radio></el-radio-group></el-form-item></el-form></template>
    </el-drawer>
  </section>
</template>
