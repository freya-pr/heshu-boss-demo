<script setup lang="ts">
import {onMounted,ref} from 'vue';import http from '../api/http';import PageHeader from '../components/PageHeader.vue';import StatePanel from '../components/StatePanel.vue'
const loading=ref(true),error=ref(''),data=ref<any>({metrics:{},flow:[]})
async function load(){loading.value=true;error.value='';try{const r:any=await http.get('/dashboard');data.value=r.data}catch(e:any){error.value=e.message}finally{loading.value=false}}
onMounted(load)
const cards=[['今日线索','leads','较昨日 +12%','blue'],['待分配','pendingAssignment','需要及时处理','orange'],['客户总量','customers','客户主数据','green'],['未读消息','unreadMessages','跨系统提醒','violet'],['S/A 客户','gradeAOrS','高意向客户','navy']]
</script>
<template><section class="page">
<PageHeader eyebrow="HESHU BOSS · CUSTOMER OPERATIONS" title="客户经营工作台" description="追踪从渠道获客到业务转化的关键节点，优先处理影响客户体验的事项。"><el-button @click="load">刷新数据</el-button><el-button type="primary">新增线索</el-button></PageHeader>
<StatePanel :loading="loading" :error="error" @retry="load">
  <div class="process-rail"><div v-for="(step,i) in data.flow" :key="step" class="process-step" :class="{current:i===4}"><b>{{String(i+1).padStart(2,'0')}}</b><span>{{step}}</span></div></div>
  <div class="metric-grid"><article v-for="[label,key,note,tone] in cards" :key="key" class="metric-card" :class="tone"><span>{{label}}</span><strong>{{data.metrics[key]??0}}</strong><small>{{note}}</small></article></div>
  <div class="dashboard-grid">
    <article class="surface flow-panel"><div class="panel-title"><div><h3>今日业务焦点</h3><p>按紧急程度排列的经营动作</p></div><a>查看全部</a></div>
      <div class="focus-list"><div><i class="danger"></i><span><b>2 条线索等待分配</b><small>超过 15 分钟将触发主管预警</small></span><em>立即处理</em></div><div><i class="warning"></i><span><b>4 条第三方数据同步失败</b><small>字段映射缺失，可进入异常中心重试</small></span><em>查看异常</em></div><div><i class="success"></i><span><b>3 位客户完成问卷定级</b><small>1 位 S 级、2 位 A 级</small></span><em>查看客户</em></div></div>
    </article>
    <article class="surface grade-panel"><div class="panel-title"><div><h3>客户等级分布</h3><p>本周已完成定级客户</p></div></div><div class="grade-bars"><div v-for="g in [{n:'S',v:12},{n:'A',v:28},{n:'B',v:35},{n:'C',v:18},{n:'未定级',v:7}]" :key="g.n"><span>{{g.n}}</span><div><i :style="{width:g.v+'%'}"></i></div><b>{{g.v}}%</b></div></div></article>
  </div>
</StatePanel></section></template>
