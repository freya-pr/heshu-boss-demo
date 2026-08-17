<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'

const route = useRoute()
const title = computed(() => String(route.meta.title || '功能页面'))
const group = computed(() => String(route.meta.groupName || '合数BOSS'))
const description = computed(() => String(route.meta.description || '该页面已纳入 V1.0 产品基线。'))
const features = computed(() => (route.meta.features as string[] | undefined) || [])
</script>

<template>
  <section class="page">
    <PageHeader :eyebrow="`V1.0 · ${group}`" :title="title" :description="description">
      <el-button>导出</el-button><el-button type="primary">新增{{ title.replace('管理', '') }}</el-button>
    </PageHeader>
    <div class="surface module-placeholder">
      <div class="module-status"><span>V1.0</span><div><b>{{ title }}功能范围</b><p>当前使用统一列表页框架承接，后续按模块详细需求接入真实数据和审批规则。</p></div></div>
      <div class="feature-grid"><article v-for="(feature, index) in features" :key="feature"><small>{{ String(index + 1).padStart(2, '0') }}</small><b>{{ feature }}</b><span>功能已纳入开发与验收清单</span></article></div>
      <el-empty v-if="!features.length" description="功能说明待补充"/>
    </div>
  </section>
</template>
