<script setup lang="ts">
import { onMounted, reactive, ref, watch, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowDown, ArrowRight, Avatar, Bell, Calendar, Clock, Close,
  Connection, DataLine, Document, DocumentChecked, House, Key, Link,
  Location, Menu as MenuIcon, Message, Notebook, OfficeBuilding, Opportunity,
  Platform, Postcard, PriceTag, Promotion, Rank, Refresh, School, Search, Service,
  SetUp, Shop, ShoppingBag, Setting, Switch, Tickets, Tools,
  User, Warning
} from '@element-plus/icons-vue'
import { useAuthStore, type MenuItem } from '../stores/auth'
import { useTabsStore } from '../stores/tabs'
import { isDemoMode } from '../api/http'
import { menuByPath } from '../config/menu'
import '../styles/nested-menu.css'

const auth = useAuthStore()
const tabs = useTabsStore()
const route = useRoute()
const router = useRouter()
const openGroups = reactive<Record<string, boolean>>({})
const profileOpen = ref(false)

const groupIcons: Record<string, Component> = {
  HOME: House,
  LEAD: Promotion,
  CUSTOMER: User,
  ORDER: ShoppingBag,
  DELIVERY: School,
  QUESTIONNAIRE: DocumentChecked,
  BUSINESS_CONFIG: Tools,
  SYSTEM: Setting
}

const leafIcons: Record<string, Component> = {
  '/dashboard': House,
  '/leads/drainage': Promotion,
  '/leads/third-party': Link,
  '/leads/rules': SetUp,
  '/leads/qr-codes': Tickets,
  '/leads/channels': Connection,
  '/leads/stores': Shop,
  '/leads/ip': PriceTag,
  '/leads/products': ShoppingBag,
  '/customers/overview': DataLine,
  '/customers/list': User,
  '/customers/conflicts': Warning,
  '/customers/pool': Refresh,
  '/customers/follow-ups': Clock,
  '/customers/tags': PriceTag,
  '/customers/grades': Rank,
  '/customers/opportunities': Opportunity,
  '/customers/inheritance': Switch,
  '/orders/formal': ShoppingBag,
  '/delivery/periods': Calendar,
  '/delivery/classes': School,
  '/questionnaires/list': Notebook,
  '/system/organizations': OfficeBuilding,
  '/system/employees': Avatar,
  '/system/positions': Postcard,
  '/system/roles': Key,
  '/system/menus': MenuIcon,
  '/system/exceptions': Warning,
  '/system/sms': Message,
  '/system/applications': Platform,
  '/system/configurations': Tools,
  '/system/wecom-customer-service': Service,
  '/system/logs': Document,
  '/system/regions': Location
}

function groupKey(group: MenuItem) { return group.code || group.name }
function groupIcon(group: MenuItem) { return groupIcons[groupKey(group)] || MenuIcon }
function leafIcon(item: MenuItem) { return item.path ? leafIcons[item.path] || Document : Document }
function itemActive(item:MenuItem):boolean { return item.path===route.path||Boolean(item.children?.some(itemActive)) }
function groupActive(group: MenuItem) { return Boolean(group.children?.some(itemActive)) }
function subKey(group:MenuItem,item:MenuItem){return `${groupKey(group)}:${item.name}`}
function isDirectGroup(group: MenuItem) { return groupKey(group) === 'HOME' }
function toggleGroup(group: MenuItem) { openGroups[groupKey(group)] = !openGroups[groupKey(group)] }
function openPage(item: MenuItem) { if (item.path) router.push(item.path) }
function handleGroupClick(group: MenuItem) {
  if (isDirectGroup(group)) openPage(group.children?.[0] || group)
  else toggleGroup(group)
}
function goProfile() { profileOpen.value = false; router.push('/profile') }
function logout() { profileOpen.value = false; auth.logout() }
function closeTab(path: string) {
  const wasActive = route.path === path
  const next = tabs.close(path)
  if (wasActive) router.push(next)
}

watch(() => route.path, path => {
  if (path === '/login') return
  const item = menuByPath.get(path)
  tabs.open({ path, title: String(route.meta.title || item?.name || '功能页'), groupName: String(route.meta.groupName || item?.groupName || '合数BOSS') })
  const code = String(route.meta.groupCode || item?.groupCode || '')
  if (code) openGroups[code] = true
}, { immediate: true })

onMounted(async () => {
  if (!auth.user) await auth.loadMe()
  const current = menuByPath.get(route.path)
  if (current) openGroups[current.groupCode] = true
})
</script>

<template>
  <div class="app-shell">
    <header class="global-header">
      <div class="brand"><div class="brand-mark">合</div><div><strong>合数BOSS</strong><small>客户关系业务主系统</small></div></div>
      <div class="header-actions">
        <div class="global-search"><el-icon><Search/></el-icon><span>搜索客户、线索</span><kbd>⌘ K</kbd></div>
        <el-badge :value="3"><el-button circle text><el-icon><Bell/></el-icon></el-button></el-badge>
        <el-button circle text><el-icon><Setting/></el-icon></el-button>
        <el-popover v-model:visible="profileOpen" placement="bottom-end" :width="320" trigger="click" popper-class="profile-popover">
          <template #reference>
            <button class="user-menu" :class="{ open: profileOpen }">
              <span class="avatar">{{ auth.user?.displayName?.slice(0, 1) || '林' }}</span>
              <div><b>{{ auth.user?.displayName || '加载中' }}</b><small>{{ auth.user?.role === 'ADMIN' ? '系统管理员' : '一转老师' }}</small></div>
              <el-icon class="user-arrow"><ArrowDown/></el-icon>
            </button>
          </template>
          <div class="profile-menu-card">
            <div class="profile-menu-head">
              <span class="profile-avatar">{{ auth.user?.displayName?.slice(0, 1) || '林' }}<i></i></span>
              <div><div class="profile-name"><b>{{ auth.user?.displayName || '林校长' }}</b><em>{{ auth.user?.username }}</em></div></div>
            </div>
            <button class="profile-menu-action" @click="goProfile"><el-icon><Postcard/></el-icon><span>个人中心</span><el-icon><ArrowRight/></el-icon></button>
            <button class="profile-menu-action logout" @click="logout"><el-icon><Switch/></el-icon><span>退出登录</span><kbd>⌥ Q</kbd></button>
          </div>
        </el-popover>
      </div>
    </header>

    <aside class="sidebar">
      <div class="menu-scroll">
        <nav class="side-menu-tree">
          <section v-for="group in auth.menus" :key="groupKey(group)" class="menu-group" :class="{ active: groupActive(group) }">
            <button class="menu-group-button" @click="handleGroupClick(group)">
              <span class="group-symbol"><el-icon><component :is="groupIcon(group)"/></el-icon></span><b>{{ group.name }}</b>
              <el-icon v-if="!isDirectGroup(group)" class="group-arrow" :class="{ open: openGroups[groupKey(group)] }"><ArrowRight/></el-icon>
            </button>
            <div v-if="!isDirectGroup(group)" v-show="openGroups[groupKey(group)]" class="menu-children">
              <template v-for="item in group.children" :key="item.path||item.name">
                <button v-if="!item.children?.length" :class="{ active: route.path === item.path }" @click="openPage(item)"><el-icon class="leaf-icon"><component :is="leafIcon(item)"/></el-icon><span>{{ item.name }}</span></button>
                <div v-else class="menu-subgroup" :class="{active:itemActive(item)}"><button class="menu-subgroup-title" @click="openGroups[subKey(group,item)]=!openGroups[subKey(group,item)]"><el-icon class="leaf-icon"><component :is="leafIcon(item)"/></el-icon><span>{{ item.name }}</span><el-icon class="sub-arrow" :class="{open:openGroups[subKey(group,item)]}"><ArrowRight/></el-icon></button><div v-show="openGroups[subKey(group,item)]||itemActive(item)" class="menu-third"><button v-for="child in item.children" :key="child.path" :class="{active:route.path===child.path}" @click="openPage(child)"><i></i><span>{{ child.name }}</span></button></div></div>
              </template>
            </div>
          </section>
        </nav>
      </div>
      <div class="system-health"><span></span><div><b>{{ isDemoMode ? '可交互演示模式' : '前后端服务正常' }}</b><small>{{ isDemoMode ? '本地数据 · 可重置' : 'Spring Boot · MySQL · Redis' }}</small></div></div>
    </aside>

    <main class="main-area">
      <div class="tabbar">
        <button v-for="tab in tabs.items" :key="tab.path" class="work-tab" :class="{ active: route.path === tab.path }" @click="router.push(tab.path)">
          <span>{{ tab.groupName === tab.title ? tab.title : `${tab.groupName} · ${tab.title}` }}</span>
          <el-icon v-if="tab.closable" class="tab-close" @click.stop="closeTab(tab.path)"><Close/></el-icon>
        </button>
      </div>
      <div class="page-scroll"><router-view/></div>
    </main>
  </div>
</template>
