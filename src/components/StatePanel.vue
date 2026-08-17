<script setup lang="ts">
defineProps<{
  loading?: boolean
  error?: string
  empty?: boolean
  emptyText?: string
}>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div v-if="loading" class="state-panel"><div class="skeleton-line wide"></div><div class="skeleton-line"></div><div class="skeleton-line medium"></div></div>
  <div v-else-if="error" class="state-panel error"><b>数据加载失败</b><span>{{ error }}</span><el-button @click="$emit('retry')">重新加载</el-button></div>
  <div v-else-if="empty" class="state-panel empty"><b>{{ emptyText || '暂无数据' }}</b><span>调整筛选条件，或创建第一条记录。</span></div>
  <slot v-else/>
</template>
