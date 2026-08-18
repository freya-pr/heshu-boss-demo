<script setup lang="ts">
import { computed, watch } from 'vue'
import { OfficeBuilding, User } from '@element-plus/icons-vue'

export interface BusinessScopeValue {
  viewScope: 'AUTHORIZED' | 'SELF'
  organizationId: number | null
  ownerId: number | null
  ownerStatus: '' | 'ACTIVE' | 'INACTIVE' | 'DEPARTED'
}

const props = withDefaults(defineProps<{
  modelValue: BusinessScopeValue
  organizations: any[]
  employees: any[]
  ownerLabel?: string
  permissionLabel?: string
  role?: string
}>(), {
  ownerLabel: '当前负责人',
  permissionLabel: '当前公司全部数据',
  role: 'ADMIN'
})

const emit = defineEmits<{ (event: 'update:modelValue', value: BusinessScopeValue): void }>()

const treeOptions = computed(() => {
  const children = new Map<number | null, any[]>()
  props.organizations.forEach(item => {
    const parentId = item.parent_id == null ? null : Number(item.parent_id)
    children.set(parentId, [...(children.get(parentId) || []), item])
  })
  const build = (parentId: number | null): any[] => (children.get(parentId) || []).map(item => ({
    value: Number(item.id),
    label: item.name,
    children: build(Number(item.id))
  }))
  return build(null)
})

function organizationScopeIds(id: number | null) {
  if (!id) return props.organizations.map(item => Number(item.id))
  const ids = [Number(id)]
  for (let index = 0; index < ids.length; index += 1) {
    props.organizations
      .filter(item => Number(item.parent_id) === ids[index])
      .forEach(item => ids.push(Number(item.id)))
  }
  return ids
}

const ownerOptions = computed(() => {
  const organizationIds = organizationScopeIds(props.modelValue.organizationId)
  return props.employees.filter(item => organizationIds.includes(Number(item.organization_id)))
})

function update(patch: Partial<BusinessScopeValue>) {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}

watch(() => props.modelValue.organizationId, () => {
  if (props.modelValue.ownerId && !ownerOptions.value.some(item => Number(item.id) === Number(props.modelValue.ownerId))) {
    update({ ownerId: null })
  }
})
</script>

<template>
  <div class="business-scope-filter">
    <div class="permission-context" :title="`当前角色最大可见范围：${permissionLabel}`">
      <el-icon><OfficeBuilding /></el-icon>
      <span>权限范围</span>
      <b>{{ permissionLabel }}</b>
    </div>
    <el-select
      :model-value="modelValue.viewScope"
      aria-label="数据视图"
      @update:model-value="update({ viewScope: $event })"
    >
      <el-option label="全部授权数据" value="AUTHORIZED" />
      <el-option label="我的数据" value="SELF" />
    </el-select>
    <el-tree-select
      :model-value="modelValue.organizationId"
      :data="treeOptions"
      clearable
      check-strictly
      filterable
      default-expand-all
      placeholder="归属组织（公司/部门/小组）"
      @update:model-value="update({ organizationId: $event || null })"
    />
    <el-select
      :model-value="modelValue.ownerId"
      clearable
      filterable
      :placeholder="`${ownerLabel}姓名/员工编号`"
      @update:model-value="update({ ownerId: $event || null })"
    >
      <template #prefix><el-icon><User /></el-icon></template>
      <el-option
        v-for="item in ownerOptions"
        :key="item.id"
        :label="`${item.name} · ${item.employee_no}`"
        :value="Number(item.id)"
      >
        <span>{{ item.name }}</span><small>{{ item.employee_no }} · {{ item.position_name }}</small>
      </el-option>
    </el-select>
    <el-select
      :model-value="modelValue.ownerStatus"
      clearable
      placeholder="负责人状态"
      @update:model-value="update({ ownerStatus: $event || '' })"
    >
      <el-option label="在职" value="ACTIVE" />
      <el-option label="停用" value="INACTIVE" />
      <el-option label="离职" value="DEPARTED" />
    </el-select>
  </div>
</template>

<style scoped>
.business-scope-filter{display:grid;grid-template-columns:minmax(210px,1.12fr) minmax(150px,.72fr) minmax(230px,1.2fr) minmax(230px,1.1fr) minmax(130px,.62fr);gap:10px;align-items:center}.permission-context{height:32px;padding:0 11px;display:flex;align-items:center;gap:7px;border:1px solid #d9e7f8;border-radius:7px;background:#f5f9ff;color:#657b99;font-size:11px;overflow:hidden}.permission-context .el-icon{color:#2875e6}.permission-context span{white-space:nowrap}.permission-context b{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#2875e6;font-size:11px}.el-select-dropdown__item small{float:right;margin-left:16px;color:#94a3b8;font-size:10px}@media(max-width:1400px){.business-scope-filter{grid-template-columns:repeat(3,minmax(190px,1fr))}.permission-context{grid-column:span 2}}@media(max-width:900px){.business-scope-filter{grid-template-columns:1fr}.permission-context{grid-column:auto}}
</style>
