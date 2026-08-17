<script setup lang="ts">
import { ref } from 'vue'; import { useRouter } from 'vue-router'; import { useAuthStore } from '../stores/auth'; import http from '../api/http'
const auth=useAuthStore(),router=useRouter(),username=ref('admin'),password=ref('Scrm@2026'),loading=ref(false),error=ref(''),scanOpen=ref(false),scene=ref<any>(null)
async function login(){loading.value=true;error.value='';try{await auth.login(username.value,password.value);router.push('/dashboard')}catch(e:any){error.value=e.message}finally{loading.value=false}}
async function openScan(){const r:any=await http.post('/auth/wecom-scene');scene.value=r.data;scanOpen.value=true}
async function simulateScan(){username.value='admin';password.value='Scrm@2026';scanOpen.value=false;await login()}
</script>
<template><div class="login-page">
  <section class="login-story"><div class="story-brand"><span>合</span>合数BOSS</div><div><div class="eyebrow light">CUSTOMER RELATIONSHIP SYSTEM</div><h1>让每一条线索<br/>都有清晰的去向</h1><p>从渠道接入、员工分配到客户经营，统一身份、统一归属、全程可追溯。</p></div>
  <div class="login-flow"><span v-for="n in ['获客','识别','分配','加微','建档','跟进','转化']" :key="n">{{n}}</span></div></section>
  <section class="login-form-wrap"><div class="login-card"><div class="eyebrow">合数BOSS 1.0</div><h2>登录业务工作台</h2><p>使用账号密码，或体验企业微信模拟扫码。</p>
    <el-alert v-if="error" :title="error" type="error" :closable="false"/>
    <label>账号</label><el-input v-model="username" size="large"/>
    <label>密码</label><el-input v-model="password" type="password" show-password size="large" @keyup.enter="login"/>
    <el-button type="primary" size="large" :loading="loading" @click="login">登录</el-button>
    <div class="login-divider"><span>其他方式</span></div>
    <el-button size="large" plain @click="openScan">企业微信扫码（模拟环境）</el-button>
    <small class="demo-hint">演示账号：admin / Scrm@2026</small>
  </div></section><el-dialog v-model="scanOpen" title="企业微信扫码登录 · 模拟环境" width="420px"><div class="state-panel"><div class="brand-mark">企</div><b>等待模拟扫码</b><span>场景 {{scene?.sceneId?.slice(0,8)}}，120 秒内有效</span><el-button type="primary" @click="simulateScan">模拟扫码成功</el-button></div></el-dialog>
</div></template>
