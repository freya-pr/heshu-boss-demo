<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Calendar, Clock, Message, Phone, Postcard, User } from '@element-plus/icons-vue'
import http from '../api/http'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const activeTab = ref<'basic' | 'password' | 'social'>('basic')
const loading = ref(false)
const saving = ref(false)
const profile = reactive({
  username: 'admin', userNo: 'U000001', displayName: '林校长', mobile: '13800000001', email: 'admin@heshu.com',
  gender: 'MALE', roleName: '系统管理员', departmentName: '集团管理中心', positionName: '集团管理员',
  hireDate: '2021-01-05', createdAt: '2026-08-16 09:00:00', loginAt: new Date().toLocaleString('zh-CN', { hour12: false })
})
const password = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const bindings = ref<any[]>([])

async function load() {
  loading.value = true
  try {
    const [profileRes, bindingRes]: any[] = await Promise.all([http.get('/auth/profile'), http.get('/auth/bindings')])
    Object.assign(profile, profileRes.data)
    bindings.value = bindingRes.data || []
  } catch (error: any) {
    ElMessage.error(error.message || '个人信息加载失败')
  } finally { loading.value = false }
}

async function saveProfile() {
  if (!profile.displayName.trim() || !profile.mobile.trim() || !profile.email.trim()) return ElMessage.warning('请完整填写昵称、手机号和邮箱')
  saving.value = true
  try {
    await http.put('/auth/profile', { displayName: profile.displayName, mobile: profile.mobile, email: profile.email, gender: profile.gender })
    await auth.loadMe()
    ElMessage.success('个人信息已更新')
  } catch (error: any) { ElMessage.error(error.message || '更新失败') }
  finally { saving.value = false }
}

async function changePassword() {
  if (!password.oldPassword || !password.newPassword || !password.confirmPassword) return ElMessage.warning('请填写全部密码项')
  if (password.newPassword.length < 8) return ElMessage.warning('新密码至少需要 8 位')
  if (password.newPassword !== password.confirmPassword) return ElMessage.warning('两次输入的新密码不一致')
  saving.value = true
  try {
    await http.put('/auth/password', password)
    Object.assign(password, { oldPassword: '', newPassword: '', confirmPassword: '' })
    ElMessage.success('密码已修改')
  } catch (error: any) { ElMessage.error(error.message || '密码修改失败') }
  finally { saving.value = false }
}

onMounted(load)
</script>

<template>
  <div class="page profile-page" v-loading="loading">
    <div class="profile-page-title"><span>账户与安全</span><h1>个人中心</h1><p>管理个人资料、登录密码和外部账号绑定。</p></div>
    <div class="profile-layout">
      <section class="surface profile-info-card">
        <h3>个人信息</h3>
        <div class="profile-portrait">{{ profile.displayName.slice(0, 1) }}<i></i></div>
        <b class="profile-display-name">{{ profile.displayName }}</b>
        <span class="profile-role">{{ profile.roleName }}</span>
        <div class="profile-facts">
          <div><el-icon><User/></el-icon><span>用户名称</span><b>{{ profile.displayName }}</b></div>
          <div><el-icon><Postcard/></el-icon><span>用户编号</span><b>{{ profile.userNo }}</b></div>
          <div><el-icon><Postcard/></el-icon><span>所属角色</span><b>{{ profile.roleName }}</b></div>
          <div><el-icon><Phone/></el-icon><span>手机号码</span><b>{{ profile.mobile }}</b></div>
          <div><el-icon><Message/></el-icon><span>用户邮箱</span><b>{{ profile.email }}</b></div>
          <div><el-icon><User/></el-icon><span>所属部门</span><b>{{ profile.departmentName }}</b></div>
          <div><el-icon><Postcard/></el-icon><span>所属岗位</span><b>{{ profile.positionName }}</b></div>
          <div><el-icon><Calendar/></el-icon><span>入职日期</span><b>{{ profile.hireDate }}</b></div>
          <div><el-icon><Calendar/></el-icon><span>创建时间</span><b>{{ profile.createdAt }}</b></div>
          <div><el-icon><Clock/></el-icon><span>本次登录</span><b>{{ profile.loginAt }}</b></div>
        </div>
      </section>

      <section class="surface profile-settings-card">
        <div class="profile-tabs">
          <button :class="{ active: activeTab === 'basic' }" @click="activeTab = 'basic'">基本设置</button>
          <button :class="{ active: activeTab === 'password' }" @click="activeTab = 'password'">密码设置</button>
          <button :class="{ active: activeTab === 'social' }" @click="activeTab = 'social'">社交绑定</button>
        </div>

        <el-form v-if="activeTab === 'basic'" class="profile-form" label-width="96px">
          <el-form-item label="用户名称" required><el-input v-model="profile.displayName" maxlength="32"/></el-form-item>
          <el-form-item label="用户手机" required><el-input v-model="profile.mobile" maxlength="20"/></el-form-item>
          <el-form-item label="用户邮箱" required><el-input v-model="profile.email" maxlength="80"/></el-form-item>
          <el-form-item label="用户性别" required><el-radio-group v-model="profile.gender"><el-radio-button value="MALE">男</el-radio-button><el-radio-button value="FEMALE">女</el-radio-button></el-radio-group></el-form-item>
          <el-form-item><el-button type="primary" :loading="saving" @click="saveProfile">更新信息</el-button></el-form-item>
        </el-form>

        <el-form v-else-if="activeTab === 'password'" class="profile-form" label-width="96px">
          <el-form-item label="旧密码" required><el-input v-model="password.oldPassword" type="password" show-password placeholder="请输入当前密码"/></el-form-item>
          <el-form-item label="新密码" required><el-input v-model="password.newPassword" type="password" show-password placeholder="至少 8 位"/></el-form-item>
          <el-form-item label="确认密码" required><el-input v-model="password.confirmPassword" type="password" show-password placeholder="再次输入新密码"/></el-form-item>
          <el-form-item><el-button type="primary" :loading="saving" @click="changePassword">修改密码</el-button></el-form-item>
        </el-form>

        <div v-else class="social-bindings">
          <el-table :data="bindings" border>
            <el-table-column prop="platform" label="绑定平台" min-width="180"/>
            <el-table-column prop="identifier" label="标识" min-width="220"/>
            <el-table-column prop="nickname" label="昵称" min-width="180"/>
            <el-table-column label="操作" width="120"><template #default><el-button link type="danger">解绑</el-button></template></el-table-column>
            <template #empty><el-empty description="暂无绑定账号" :image-size="72"/></template>
          </el-table>
        </div>
      </section>
    </div>
  </div>
</template>
