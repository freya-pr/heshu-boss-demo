import { createRouter, createWebHashHistory, createWebHistory, type RouteRecordRaw } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import { menuLeaves } from '../config/menu'

const specificComponents: Record<string, () => Promise<any>> = {
  '/dashboard': () => import('../views/DashboardView.vue'),
  '/leads/drainage': () => import('../views/LeadsView.vue'),
  '/leads/analytics': () => import('../views/LeadAnalyticsView.vue'),
  '/leads/qr-codes': () => import('../views/QrCodeManagementView.vue'),
  '/leads/rules': () => import('../views/LeadRuleManagementView.vue'),
  '/leads/channels': () => import('../views/ChannelManagementView.vue'),
  '/leads/stores': () => import('../views/StoreManagementView.vue'),
  '/leads/ip': () => import('../views/IpListView.vue'),
  '/customers/list': () => import('../views/CustomersView.vue'),
  '/orders/formal': () => import('../views/FormalOrdersView.vue'),
  '/system/organizations': () => import('../views/SystemView.vue'),
  '/system/employees': () => import('../views/EmployeeManagementView.vue'),
  '/system/positions': () => import('../views/PositionManagementView.vue'),
  '/system/roles': () => import('../views/RoleView.vue'),
  '/system/menus': () => import('../views/AdminConfigView.vue'),
  '/system/parameters': () => import('../views/SystemParameterView.vue'),
  '/system/dictionaries': () => import('../views/DictionaryManagementView.vue'),
  '/system/exceptions': () => import('../views/AdminConfigView.vue'),
  '/system/sms': () => import('../views/SystemToolsView.vue'),
  '/system/sms/orders': () => import('../views/SystemToolsView.vue'),
  '/system/sms/signatures': () => import('../views/SystemToolsView.vue'),
  '/system/sms/templates': () => import('../views/SystemToolsView.vue'),
  '/system/sms/results': () => import('../views/SystemToolsView.vue'),
  '/system/configurations': () => import('../views/SystemToolsView.vue'),
  '/system/configurations/wecom': () => import('../views/SystemToolsView.vue'),
  '/system/configurations/mini': () => import('../views/SystemToolsView.vue'),
  '/system/configurations/stores': () => import('../views/SystemToolsView.vue'),
  '/system/configurations/landing': () => import('../views/SystemToolsView.vue'),
  '/system/payments': () => import('../views/SystemToolsView.vue'),
  '/system/regions': () => import('../views/SystemToolsView.vue')
}

const menuRoutes: RouteRecordRaw[] = menuLeaves.map(item => ({
  path: item.path!.slice(1),
  component: specificComponents[item.path!] || (() => import('../views/ModulePlaceholderView.vue')),
  meta: { title: item.name, groupName: item.groupName, groupCode: item.groupCode, description: item.description, features: item.features }
}))

menuRoutes.push({ path: 'leads/channel-analysis', redirect: '/leads/channels?tab=analysis' })
menuRoutes.push({ path: 'orders/diagnosis', redirect: '/orders/formal' })

menuRoutes.push({
  path: 'profile',
  component: () => import('../views/ProfileView.vue'),
  meta: { title: '个人中心', groupName: '个人中心', description: '维护个人资料、登录密码和社交账号绑定。' }
})

const router = createRouter({
  history: location.protocol === 'file:' || import.meta.env.VITE_SHARE_MODE === 'true'
    ? createWebHashHistory()
    : createWebHistory(),
  routes: [
    { path: '/login', component: () => import('../views/LoginView.vue') },
    { path: '/', component: AppLayout, redirect: '/dashboard', children: menuRoutes },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
  ]
})

router.beforeEach(to => {
  if (to.path !== '/login' && !localStorage.getItem('scrm_token')) return '/login'
  if (to.path === '/login' && localStorage.getItem('scrm_token')) return '/dashboard'
})

export default router
