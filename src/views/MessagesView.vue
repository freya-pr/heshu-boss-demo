<script setup lang="ts">
import {onMounted,ref} from 'vue';import http from '../api/http';import PageHeader from '../components/PageHeader.vue';import StatePanel from '../components/StatePanel.vue'
const rows=ref<any[]>([]),loading=ref(false),error=ref(''),filter=ref('')
async function load(){loading.value=true;try{const r:any=await http.get('/messages',{params:{readStatus:filter.value||undefined}});rows.value=r.data}catch(e:any){error.value=e.message}finally{loading.value=false}}async function read(row:any){await http.post(`/messages/${row.id}/read`);load()}onMounted(load)
const names:any={NEW_LEAD:'新线索',WECOM_FRIEND_ADDED:'企微好友',SYNC_RESULT:'同步结果',ORDER_WARNING:'订单预警'}
</script><template><section class="page">
<PageHeader eyebrow="UNIFIED NOTIFICATIONS" title="消息列表" description="业务提醒、系统任务和风险预警在这里统一处理；已读不等于业务已完成。"><el-button>全部已读</el-button></PageHeader>
<div class="message-layout"><aside class="surface message-filter"><button :class="{active:!filter}" @click="filter='';load()">全部消息 <b>{{rows.length}}</b></button><button :class="{active:filter==='UNREAD'}" @click="filter='UNREAD';load()">未读消息</button><button>重要提醒</button><button>风险预警</button></aside>
<div class="surface message-list"><StatePanel :loading="loading" :error="error" :empty="!rows.length" empty-text="暂无消息" @retry="load"><article v-for="row in rows" :key="row.id" class="message-item" :class="{unread:row.read_status==='UNREAD'}" @click="read(row)"><span class="message-icon" :class="row.level.toLowerCase()">{{names[row.message_type]||'系统'}}</span><div><div class="message-meta"><b>{{row.title}}</b><el-tag size="small" :type="row.level==='WARNING'?'warning':'info'">{{row.level==='WARNING'?'预警':'普通'}}</el-tag></div><p>{{row.summary}}</p><small>{{row.created_at}} · {{row.process_status==='PENDING'?'待处理':'已完成'}}</small></div><i v-if="row.read_status==='UNREAD'"></i></article></StatePanel></div></div>
</section></template>
