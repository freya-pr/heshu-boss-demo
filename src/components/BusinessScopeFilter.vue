<script setup lang="ts">
import { computed, watch } from 'vue'
import { OfficeBuilding, RefreshLeft, User } from '@element-plus/icons-vue'

export interface BusinessScopeValue {
  viewScope: 'AUTHORIZED' | 'SELF'
  organizationId: number | null
  ownerId: number | null
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

const activeFilterCount = computed(() => [
  props.modelValue.organizationId,
  props.modelValue.ownerId
].filter(Boolean).length)

function update(patch: Partial<BusinessScopeValue>) {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}

function clearScopeFilters() {
  update({ organizationId: null, ownerId: null })
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
      <span class="permission-icon"><el-icon><OfficeBuilding /></el-icon></span>
      <span class="permission-copy">
        <small>当前可见范围</small>
        <b>{{ permissionLabel }}</b>
      </span>
      <em>由角色权限决定</em>
    </div>
    <div class="scope-controls">
      <label class="scope-field scope-view">
        <span>数据范围</span>
        <el-select
          :model-value="modelValue.viewScope"
          aria-label="数据范围"
          @update:model-value="update({ viewScope: $event })"
        >
          <el-option label="全部授权数据" value="AUTHORIZED" />
          <el-option label="仅看我的数据" value="SELF" />
        </el-select>
      </label>
      <label class="scope-field scope-organization">
        <span>归属组织</span>
        <el-tree-select
          :model-value="modelValue.organizationId"
          :data="treeOptions"
          clearable
          check-strictly
          filterable
          default-expand-all
          placeholder="全部组织"
          aria-label="归属组织"
          @update:model-value="update({ organizationId: $event || null })"
        />
      </label>
      <label class="scope-field scope-owner">
        <span>{{ ownerLabel }}</span>
        <el-select
          :model-value="modelValue.ownerId"
          clearable
          filterable
          placeholder="姓名或员工编号"
          :aria-label="ownerLabel"
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
      </label>
      <el-button v-if="activeFilterCount" class="clear-filter" link type="primary" :icon="RefreshLeft" @click="clearScopeFilters">
        清空 {{ activeFilterCount }} 项
      </el-button>
      <span v-else class="clear-filter-placeholder">可组合筛选</span>
    </div>
  </div>
</template>

<style scoped>
.business-scope-filter{display:grid;grid-template-columns:minmax(248px,.82fr) minmax(0,3.18fr);gap:14px;align-items:stretch}.permission-context{min-width:0;min-height:66px;padding:10px 13px;display:grid;grid-template-columns:34px minmax(0,1fr);grid-template-rows:1fr 1fr;column-gap:10px;border:1px solid #cfe0fa;border-radius:10px;background:linear-gradient(135deg,#f7faff 0%,#eef5ff 100%);box-shadow:inset 3px 0 0 #2f7bea;color:#667a98;overflow:hidden}.permission-icon{grid-row:1/3;align-self:center;width:34px;height:34px;display:grid;place-items:center;border-radius:9px;background:#fff;color:#2875e6;box-shadow:0 4px 12px rgba(41,112,218,.10)}.permission-icon .el-icon{font-size:17px}.permission-copy{min-width:0;display:flex;align-items:baseline;gap:8px}.permission-copy small{flex:none;font-size:11px;color:#71839d}.permission-copy b{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#1f65cf;font-size:13px;font-weight:700}.permission-context em{align-self:end;font-size:10px;font-style:normal;color:#91a1b8}.scope-controls{min-width:0;padding:8px 10px;display:grid;grid-template-columns:minmax(145px,.8fr) minmax(220px,1.2fr) minmax(240px,1.3fr) 76px;gap:10px;align-items:end;border:1px solid #e3eaf3;border-radius:10px;background:#fff}.scope-field{min-width:0;display:grid;gap:5px}.scope-field>span{padding-left:2px;color:#7a8ca6;font-size:10px;font-weight:600;line-height:1}.scope-field :deep(.el-select),.scope-field :deep(.el-tree-select){width:100%}.scope-field :deep(.el-select__wrapper){min-height:32px;border-radius:7px;box-shadow:0 0 0 1px #dce4ef inset}.scope-field :deep(.el-select__wrapper:hover){box-shadow:0 0 0 1px #9ebfee inset}.scope-field :deep(.el-select__wrapper.is-focused){box-shadow:0 0 0 1px #2f7bea inset}.clear-filter{align-self:end;height:32px;padding:0 4px;font-size:11px}.clear-filter-placeholder{align-self:center;text-align:center;color:#a0aec0;font-size:10px}.el-select-dropdown__item small{float:right;margin-left:16px;color:#94a3b8;font-size:10px}@media(max-width:1480px){.business-scope-filter{grid-template-columns:1fr}.scope-controls{grid-template-columns:minmax(145px,.8fr) minmax(220px,1.2fr) minmax(240px,1.3fr) 76px}.permission-context{min-height:54px;grid-template-columns:34px minmax(0,1fr) auto;grid-template-rows:1fr}.permission-icon{grid-row:auto}.permission-copy{align-self:center}.permission-context em{align-self:center}}@media(max-width:980px){.scope-controls{grid-template-columns:repeat(2,minmax(0,1fr))}.clear-filter,.clear-filter-placeholder{justify-self:start}.permission-context{grid-template-columns:34px minmax(0,1fr)}.permission-context em{display:none}}@media(max-width:640px){.scope-controls{grid-template-columns:1fr}.permission-context{padding:9px 10px}.permission-copy{display:grid;gap:2px}.permission-copy b{font-size:12px}}
</style>
