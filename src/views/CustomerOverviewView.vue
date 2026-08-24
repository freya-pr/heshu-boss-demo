<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import http from '../api/http'
import PageHeader from '../components/PageHeader.vue'

const router=useRouter(),rows=ref<any[]>([]),loading=ref(false)
const source=ref(''),grade=ref(''),addMethod=ref(''),period=ref('本期')
const addLabels:any={LINK:'通过链接添加',BUSINESS_CARD:'名片',QR_CODE:'扫描二维码'}
const filtered=computed(()=>rows.value.filter(row=>(!source.value||row.source_name===source.value)&&(!grade.value||row.grade===grade.value)&&(!addMethod.value||row.add_method===addMethod.value)))
const total=computed(()=>filtered.value.length)
const active=computed(()=>filtered.value.filter(row=>row.status==='ACTIVE').length)
const highValue=computed(()=>filtered.value.filter(row=>['S','A'].includes(row.grade)).length)
const deal=computed(()=>filtered.value.filter(row=>row.lifecycle==='DEAL').length)
const lifecycle=computed(()=>['LEAD','INTENT','DEAL','LOST'].map((key,index)=>({key,label:['线索客户','意向客户','成交客户','流失客户'][index],count:filtered.value.filter(row=>(row.lifecycle||'LEAD')===key).length})))
const grades=computed(()=>['S','A','B','C'].map(key=>({key,count:filtered.value.filter(row=>row.grade===key).length})))
const methods=computed(()=>Object.entries(addLabels).map(([key,label])=>({key,label,count:filtered.value.filter(row=>row.add_method===key).length})))
async function load(){loading.value=true;try{const result:any=await http.get('/customers');rows.value=result.data}finally{loading.value=false}}
function drill(extra:any={}){router.push({path:'/customers/list',query:extra})}
function reset(){source.value='';grade.value='';addMethod.value='';period.value='本期'}
onMounted(load)
</script>

<template>
  <section class="page customer-overview-page" v-loading="loading">
    <PageHeader eyebrow="CUSTOMER PULSE · CURRENT OWNERSHIP" title="客户总览" description="看清当前客户规模、生命周期、等级和添加方式；所有数字只统计当前授权范围，并可下钻客户明细。"><el-button @click="load">刷新数据</el-button></PageHeader>
    <div class="overview-filter surface"><el-select v-model="period"><el-option label="本期" value="本期"/><el-option label="近30天" value="近30天"/><el-option label="全部" value="全部"/></el-select><el-select v-model="source" clearable placeholder="首次来源"><el-option v-for="item in [...new Set(rows.map(row=>row.source_name).filter(Boolean))]" :key="item" :label="item" :value="item"/></el-select><el-select v-model="grade" clearable placeholder="客户等级"><el-option v-for="item in ['S','A','B','C']" :key="item" :label="`${item} 级`" :value="item"/></el-select><el-select v-model="addMethod" clearable placeholder="添加方式"><el-option v-for="(label,key) in addLabels" :key="key" :label="label" :value="key"/></el-select><el-button type="primary">查询</el-button><el-button @click="reset">重置</el-button><span>更新时间：刚刚</span></div>
    <div class="metric-grid">
      <button class="metric-card primary" @click="drill()"><span>客户总量</span><b>{{ total }}</b><small>当前筛选范围</small></button>
      <button class="metric-card" @click="drill({status:'ACTIVE'})"><span>正常客户</span><b>{{ active }}</b><small>可继续经营</small></button>
      <button class="metric-card" @click="drill({grade:'A'})"><span>S/A高意向</span><b>{{ highValue }}</b><small>建议优先跟进</small></button>
      <button class="metric-card" @click="drill({lifecycle:'DEAL'})"><span>成交客户</span><b>{{ deal }}</b><small>生命周期结果</small></button>
    </div>
    <div class="overview-grid">
      <article class="surface journey-panel"><header><div><span>LIFECYCLE</span><h3>客户生命周期</h3></div><button @click="drill()">查看全部 →</button></header><div class="journey"><button v-for="(item,index) in lifecycle" :key="item.key" @click="drill({lifecycle:item.key})"><i>{{ index+1 }}</i><b>{{ item.count }}</b><span>{{ item.label }}</span></button></div><p>退款回退、流失和重新激活只改变生命周期，不覆盖等级、商机或订单事实。</p></article>
      <article class="surface grade-panel"><header><div><span>GRADE MIX</span><h3>SABC等级分布</h3></div></header><div v-for="item in grades" :key="item.key" class="bar-row" @click="drill({grade:item.key})"><b>{{ item.key }}</b><div><i :style="{width:`${total?Math.max(8,item.count/total*100):0}%`}"></i></div><span>{{ item.count }}</span></div></article>
      <article class="surface method-panel"><header><div><span>ENTRY BEHAVIOR</span><h3>添加方式</h3></div></header><button v-for="item in methods" :key="item.key" @click="drill({addMethod:item.key})"><span>{{ item.label }}</span><b>{{ item.count }}</b><small>{{ total?Math.round(item.count/total*100):0 }}%</small></button><p>添加方式用于描述客户如何进入；渠道、店铺和IP继续由首次来源承担归因。</p></article>
      <article class="surface owner-panel"><header><div><span>OWNER LOAD</span><h3>负责人客户量</h3></div></header><div v-for="name in [...new Set(filtered.map(row=>row.owner_name||'待分配'))]" :key="name"><span>{{ name }}</span><b>{{ filtered.filter(row=>(row.owner_name||'待分配')===name).length }} 位</b></div></article>
    </div>
  </section>
</template>

<style scoped>
.overview-filter{display:flex;align-items:center;gap:10px;padding:14px 16px;margin-bottom:16px}.overview-filter .el-select{width:150px}.overview-filter span{margin-left:auto;color:var(--muted);font-size:12px}.metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:14px}.metric-card{padding:20px;text-align:left;border:1px solid var(--line);border-radius:16px;background:#fff;cursor:pointer}.metric-card span,.metric-card small{display:block;color:var(--muted)}.metric-card b{display:block;margin:10px 0 4px;color:var(--text);font-size:30px}.metric-card.primary{border-color:#8ab9ff;background:linear-gradient(135deg,#1d6fe9,#398af5)}.metric-card.primary span,.metric-card.primary small,.metric-card.primary b{color:#fff}.overview-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:14px}.overview-grid article{padding:20px}.overview-grid header{display:flex;justify-content:space-between;align-items:start;margin-bottom:20px}.overview-grid header span{color:var(--primary);font-size:11px;letter-spacing:.14em}.overview-grid h3{margin:4px 0 0}.overview-grid header button{border:0;background:none;color:var(--primary);cursor:pointer}.journey{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.journey button{position:relative;padding:16px;border:1px solid #dfe8f6;border-radius:12px;background:#f8fbff;text-align:left;cursor:pointer}.journey i{font-style:normal;color:#7aa7e9;font-size:11px}.journey b,.journey span{display:block}.journey b{margin:10px 0 2px;font-size:24px}.journey-panel p,.method-panel p{margin:16px 0 0;color:var(--muted);font-size:12px}.bar-row{display:grid;grid-template-columns:30px 1fr 34px;align-items:center;gap:12px;margin:14px 0;cursor:pointer}.bar-row>div{height:8px;border-radius:99px;background:#edf2f8;overflow:hidden}.bar-row i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#2c7bea,#55a0ff)}.method-panel{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.method-panel header,.method-panel p{grid-column:1/-1}.method-panel button{padding:14px;border:1px solid var(--line);border-radius:12px;background:white;text-align:left;cursor:pointer}.method-panel button span,.method-panel button small{display:block;color:var(--muted);font-size:12px}.method-panel button b{display:block;margin:6px 0;font-size:22px}.owner-panel>div{display:flex;justify-content:space-between;padding:13px 0;border-bottom:1px solid var(--line)}
@media(max-width:1000px){.metric-grid,.overview-grid{grid-template-columns:1fr 1fr}.overview-filter{flex-wrap:wrap}.overview-filter span{margin-left:0}.journey{grid-template-columns:1fr 1fr}}@media(max-width:680px){.metric-grid,.overview-grid{grid-template-columns:1fr}}
</style>
