type Row = Record<string, any>
import { v1Menus } from '../config/menu'

const STORAGE_KEY = 'heshu_scrm_demo_db_v2'
const USER_KEY = 'heshu_scrm_demo_user'
const PASSWORD_KEY = 'heshu_scrm_demo_password'

interface DemoDb {
  leads: Row[]
  customers: Row[]
  messages: Row[]
  organizations: Row[]
  employees: Row[]
}

const seed: DemoDb = {
  leads: [
    { id: 1, lead_no: 'L202608160001', name: '周女士', mobile: '13800001111', union_id: '', source_type: 'DRAINAGE', channel_name: '暑期直播', status: 'ASSIGNED', owner_id: 2, owner_name: '王老师', created_at: '2026-08-16 09:12:10' },
    { id: 2, lead_no: 'L202608160002', name: '赵先生', mobile: '', union_id: '', source_type: 'THIRD_PRODUCT', channel_name: '合作渠道A', status: 'PENDING_ASSIGNMENT', owner_id: null, owner_name: '', created_at: '2026-08-16 09:28:40' },
    { id: 3, lead_no: 'L202608160003', name: '钱女士', mobile: '13800002222', union_id: 'union_qian_002', source_type: 'DRAINAGE', channel_name: '信息流广告', status: 'WECHAT_ADDED', owner_id: 3, owner_name: '陈老师', created_at: '2026-08-16 10:02:18' },
    { id: 4, lead_no: 'L202608160004', name: '孙女士', mobile: '13700006666', union_id: '', source_type: 'REFERRAL', channel_name: '老客转介绍', status: 'PENDING_ASSIGNMENT', owner_id: null, owner_name: '', created_at: '2026-08-16 10:30:09' }
  ],
  customers: [
    { id: 1, customer_no: 'C202608160001', name: '周女士', mobile: '13800001111', union_id: 'union_zhou_001', grade: 'A', owner_name: '王老师', status: 'ACTIVE', created_at: '2026-08-16 09:40:00' },
    { id: 2, customer_no: 'C202608160002', name: '钱女士', mobile: '13800002222', union_id: 'union_qian_002', grade: 'B', owner_name: '陈老师', status: 'ACTIVE', created_at: '2026-08-16 10:15:00' },
    { id: 3, customer_no: 'C202608160003', name: '吴女士', mobile: '13800003333', union_id: 'union_wu_003', grade: 'S', owner_name: '王琴', status: 'ACTIVE', created_at: '2026-08-15 15:20:00' }
  ],
  messages: [
    { id: 1, receiver_username: 'admin', message_type: 'NEW_LEAD', title: '新线索已进入待分配队列', summary: '合作渠道 A 新增 1 条线索，请及时处理。', level: 'IMPORTANT', read_status: 'UNREAD', process_status: 'PENDING', created_at: '2026-08-16 10:30:09' },
    { id: 2, receiver_username: 'admin', message_type: 'WECOM_FRIEND_ADDED', title: '客户已添加企业微信', summary: '钱女士已通过员工活码添加陈老师。', level: 'NORMAL', read_status: 'UNREAD', process_status: 'PENDING', created_at: '2026-08-16 10:08:32' },
    { id: 3, receiver_username: 'admin', message_type: 'SYNC_RESULT', title: '第三方数据同步部分成功', summary: '本次同步 120 条，成功 116 条，失败 4 条。', level: 'WARNING', read_status: 'UNREAD', process_status: 'PENDING', created_at: '2026-08-16 09:55:12' },
    { id: 4, receiver_username: 'admin', message_type: 'ORDER_WARNING', title: '退款结果待核对', summary: '订单 O20260816018 退款回调与订单状态不一致。', level: 'WARNING', read_status: 'READ', process_status: 'PENDING', created_at: '2026-08-16 09:31:16' }
  ],
  organizations: [
    { id: 1, parent_id: null, code: 'ORG-COM-000001', name: '合数教育有限公司', type: 'COMPANY', owner_name: '林校长', status: 'ACTIVE', employee_count: 0, created_at: '2026-08-01 09:00:00' },
    { id: 2, parent_id: 1, code: 'ORG-DPT-000002', name: '一转销售部', type: 'DEPARTMENT', owner_name: '李士文', status: 'ACTIVE', employee_count: 0, created_at: '2026-08-01 09:12:00' },
    { id: 5, parent_id: 1, code: 'ORG-DPT-000003', name: '客户服务部', type: 'DEPARTMENT', owner_name: '刘老师', status: 'ACTIVE', employee_count: 0, created_at: '2026-08-02 10:20:00' },
    { id: 6, parent_id: 1, code: 'ORG-DPT-000004', name: '电商中心', type: 'DEPARTMENT', owner_name: '陈经理', status: 'ACTIVE', employee_count: 0, created_at: '2026-08-03 11:10:00' },
    { id: 7, parent_id: 1, code: 'ORG-DPT-000005', name: '财务部', type: 'DEPARTMENT', owner_name: '王经理', status: 'ACTIVE', employee_count: 0, created_at: '2026-08-03 11:30:00' },
    { id: 8, parent_id: 1, code: 'ORG-DPT-000006', name: '人力资源中心', type: 'DEPARTMENT', owner_name: '赵经理', status: 'ACTIVE', employee_count: 0, created_at: '2026-08-03 13:20:00' },
    { id: 3, parent_id: 2, code: 'ORG-TEM-000007', name: '一转一组', type: 'GROUP_TEAM', owner_name: '王老师', status: 'ACTIVE', employee_count: 2, created_at: '2026-08-05 09:00:00' },
    { id: 9, parent_id: 2, code: 'ORG-TEM-000008', name: '一转二组', type: 'GROUP_TEAM', owner_name: '陈老师', status: 'INACTIVE', employee_count: 1, created_at: '2026-08-05 09:30:00' },
  ],
  employees: [
    { id: 1, employee_no: 'B00001', name: '李士文', legal_name: '李士文', mobile_masked: '138****1201', email: 'lishiwen@heshu.com', organization_id: 2, position_name: '部门负责人', wecom_user_id: 'wx_lishiwen', feishu_user_id: 'ou_lishiwen', employment_status: 'ACTIVE', account_status: 'ACTIVE', load: 18 },
    { id: 2, employee_no: 'B00126', name: '王老师', legal_name: '王琴', mobile_masked: '139****4508', email: 'wangqin@heshu.com', organization_id: 3, position_name: '课程顾问', wecom_user_id: 'wx_wang', feishu_user_id: 'ou_wang', employment_status: 'ACTIVE', account_status: 'ACTIVE', load: 12 },
    { id: 3, employee_no: 'B00135', name: '陈老师', legal_name: '陈晨', mobile_masked: '136****8821', email: 'chenchen@heshu.com', organization_id: 9, position_name: '课程顾问', wecom_user_id: 'wx_chen', feishu_user_id: 'ou_chen', employment_status: 'ACTIVE', account_status: 'ACTIVE', load: 16 },
    { id: 4, employee_no: 'B00208', name: '刘老师', legal_name: '刘子云', mobile_masked: '157****5728', email: 'liuziyun@heshu.com', organization_id: 5, position_name: '客服专员', wecom_user_id: 'wx_liu', feishu_user_id: 'ou_liu', employment_status: 'ACTIVE', account_status: 'ACTIVE', load: 9 },
    { id: 5, employee_no: 'B00281', name: '吴老师', legal_name: '吴若燕', mobile_masked: '136****0104', email: 'wuruoyan@heshu.com', organization_id: 6, position_name: '运营专员', wecom_user_id: '', feishu_user_id: 'ou_wu', employment_status: 'ACTIVE', account_status: 'ACTIVE', load: 7 },
    { id: 6, employee_no: 'B00293', name: '李经理', legal_name: '李景', mobile_masked: '136****8265', email: 'lijing@heshu.com', organization_id: 7, position_name: '财务经理', wecom_user_id: 'wx_lijing', feishu_user_id: 'ou_lijing', employment_status: 'ACTIVE', account_status: 'ACTIVE', load: 3 },
    { id: 7, employee_no: 'B00297', name: '赵主管', legal_name: '赵梅', mobile_masked: '183****9828', email: 'zhaomei@heshu.com', organization_id: 8, position_name: '人事主管', wecom_user_id: 'wx_zhao', feishu_user_id: '', employment_status: 'ACTIVE', account_status: 'INACTIVE', load: 0 }
  ]
}

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) }
function load(): DemoDb {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return clone(seed)
  try {
    const stored = JSON.parse(raw) as DemoDb
    if (stored.organizations.some(item => ['GROUP', 'REGION', 'CAMPUS', 'PERSON'].includes(item.type) || 'sort_order' in item)) return clone(seed)
    return stored
  } catch { return clone(seed) }
}
let db = load()
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)) }
function ok(data: any) { return Promise.resolve({ code: 0, message: 'success', data, timestamp: new Date().toISOString(), traceId: crypto.randomUUID() }) }
function fail(message: string) { return Promise.reject(new Error(message)) }
function id(prefix: string) { return `${prefix}${new Date().toISOString().replace(/\D/g, '').slice(0, 17)}` }
function organizationCode(type: string) {
  const typeCode: Record<string, string> = { COMPANY: 'COM', DEPARTMENT: 'DPT', GROUP_TEAM: 'TEM' }
  const sequence = Math.max(0, ...db.organizations.map(item => Number(String(item.code || '').match(/(\d{6})$/)?.[1] || 0))) + 1
  return `ORG-${typeCode[type] || 'OTH'}-${String(sequence).padStart(6, '0')}`
}
function currentUser() {
  return JSON.parse(localStorage.getItem(USER_KEY) || '{"username":"admin","userNo":"U000001","displayName":"林校长","role":"ADMIN","mobile":"13800000001","email":"admin@heshu.com","gender":"MALE","departmentName":"集团管理中心","positionName":"集团管理员","hireDate":"2021-01-05","createdAt":"2026-08-16 09:00:00"}')
}
function menus(role: string) {
  return role === 'ADMIN' ? v1Menus : v1Menus.filter(group => group.code !== 'SYSTEM')
}

function createCustomer(body: Row) {
  const mobile = String(body.mobile || '').replace(/\s/g, '') || null
  const unionId = String(body.unionId || body.union_id || '').trim() || null
  if (!mobile && !unionId) throw new Error('手机号或 UnionID 至少填写一项')
  const byMobile = mobile ? db.customers.find(item => item.mobile === mobile) : undefined
  const byUnion = unionId ? db.customers.find(item => item.union_id === unionId) : undefined
  if (byMobile && byUnion && byMobile.id !== byUnion.id) throw new Error('手机号和 UnionID 分别命中不同客户，请进入撞单管理')
  const existing = byMobile || byUnion
  if (existing) return existing
  const customer = { id: Math.max(0, ...db.customers.map(item => item.id)) + 1, customer_no: id('C'), name: body.name, mobile, union_id: unionId, grade: 'UNRATED', owner_name: body.ownerName || body.owner_name || '', status: 'ACTIVE', created_at: new Date().toLocaleString('zh-CN', { hour12: false }) }
  db.customers.unshift(customer); save(); return customer
}

export const isDemoMode = import.meta.env.VITE_DEMO_MODE !== 'false'

export const demoHttp = {
  async get(path: string, config: any = {}) {
    await new Promise(resolve => setTimeout(resolve, 160))
    if (path === '/auth/me') { const user = currentUser(); return ok({ username: user.username, displayName: user.displayName, role: user.role, menus: menus(user.role) }) }
    if (path === '/auth/profile') {
      const user = currentUser()
      return ok({ ...user, roleName: user.role === 'ADMIN' ? '系统管理员' : '一转老师', loginAt: new Date().toLocaleString('zh-CN', { hour12: false }) })
    }
    if (path === '/auth/bindings') return ok([])
    if (path === '/dashboard') return ok({ metrics: { leads: db.leads.length, pendingAssignment: db.leads.filter(item => item.status === 'PENDING_ASSIGNMENT').length, customers: db.customers.length, unreadMessages: db.messages.filter(item => item.read_status === 'UNREAD').length, gradeAOrS: db.customers.filter(item => ['S', 'A'].includes(item.grade)).length }, flow: ['渠道获客', '统一接入', '数据清洗', '线索识别', '线索分配', '客户加微', '客户建档', '问卷定级', '业务转化'] })
    if (path === '/leads') {
      const status = config.params?.status
      const sourceType = config.params?.sourceType
      return ok(db.leads.filter(item => (!status || item.status === status) && (!sourceType || item.source_type === sourceType)))
    }
    if (path === '/leads/assignees') return ok(db.employees.filter(item => item.account_status === 'ACTIVE'))
    if (path === '/customers') { const grade = config.params?.grade; return ok(grade ? db.customers.filter(item => item.grade === grade) : db.customers) }
    if (path === '/messages') { const read = config.params?.readStatus; return ok(read ? db.messages.filter(item => item.read_status === read) : db.messages) }
    if (path === '/system/organizations') return ok(db.organizations)
    if (path === '/system/employees') return ok(db.employees)
    return fail(`演示接口未实现：GET ${path}`)
  },
  async post(path: string, body: any = {}) {
    await new Promise(resolve => setTimeout(resolve, 180))
    if (path === '/auth/login') {
      const demoPassword = localStorage.getItem(PASSWORD_KEY) || 'Scrm@2026'
      if (!['admin', 'teacher'].includes(body.username) || body.password !== demoPassword) return fail('账号或密码不正确')
      const user = body.username === 'admin'
        ? { username: 'admin', userNo: 'U000001', displayName: '林校长', role: 'ADMIN', mobile: '13800000001', email: 'admin@heshu.com', gender: 'MALE', departmentName: '集团管理中心', positionName: '集团管理员', hireDate: '2021-01-05', createdAt: '2026-08-16 09:00:00' }
        : { username: 'teacher', userNo: 'U000002', displayName: '王老师', role: 'TEACHER', mobile: '13900000002', email: 'teacher@heshu.com', gender: 'FEMALE', departmentName: '一转销售部', positionName: '一转老师', hireDate: '2024-03-18', createdAt: '2026-08-16 09:00:00' }
      localStorage.setItem(USER_KEY, JSON.stringify(user)); return ok({ accessToken: 'demo-token', user })
    }
    if (path === '/auth/wecom-scene') return ok({ sceneId: crypto.randomUUID(), status: 'WAITING_SCAN', stub: true, expiresIn: 120 })
    if (path === '/auth/logout') { localStorage.removeItem(USER_KEY); return ok(null) }
    if (path === '/leads') {
      const lead = { id: Math.max(0, ...db.leads.map(item => item.id)) + 1, lead_no: id('L'), name: body.name, mobile: body.mobile || '', union_id: body.unionId || '', source_type: body.sourceType, channel_name: body.channelName, status: 'PENDING_ASSIGNMENT', owner_id: null, owner_name: '', created_at: new Date().toLocaleString('zh-CN', { hour12: false }) }
      db.leads.unshift(lead); save(); return ok({ id: lead.id })
    }
    const assign = path.match(/^\/leads\/(\d+)\/assign$/)
    if (assign) {
      const lead = db.leads.find(item => item.id === Number(assign[1])); const employee = db.employees.find(item => item.id === Number(body.employeeId))
      if (!lead || !employee) return fail('线索或目标员工不存在')
      Object.assign(lead, { owner_id: employee.id, owner_name: employee.name, status: 'ASSIGNED' }); save(); return ok(null)
    }
    const wechat = path.match(/^\/leads\/(\d+)\/wechat-added$/)
    if (wechat) {
      const lead = db.leads.find(item => item.id === Number(wechat[1])); if (!lead) return fail('线索不存在')
      lead.status = 'WECHAT_ADDED'; lead.union_id = body.unionId || lead.union_id || `union_demo_${lead.id}`; save(); return ok(null)
    }
    const convert = path.match(/^\/leads\/(\d+)\/convert$/)
    if (convert) {
      const lead = db.leads.find(item => item.id === Number(convert[1])); if (!lead) return fail('线索不存在')
      const customer = createCustomer({ ...lead, ownerName: lead.owner_name }); lead.status = 'CONVERTED'; save(); return ok({ customerId: customer.id, customerNo: customer.customer_no })
    }
    if (path === '/customers') { const customer = createCustomer(body); return ok({ id: customer.id }) }
    if (path === '/system/organizations') {
      const parent = db.organizations.find(item => item.id === Number(body.parent_id))
      const allowedChild: Record<string, string> = { COMPANY: 'DEPARTMENT', DEPARTMENT: 'GROUP_TEAM' }
      if (parent && allowedChild[parent.type] !== body.type) return fail('组织层级必须为公司 → 部门 → 小组')
      if (parent?.type === 'GROUP_TEAM') return fail('小组节点不能新增下级')
      const organization = { ...body, code: organizationCode(body.type), id: Math.max(0, ...db.organizations.map(item => item.id)) + 1, employee_count: 0, created_at: new Date().toLocaleString('zh-CN', { hour12: false }) }
      db.organizations.push(organization); save(); return ok(organization)
    }
    const read = path.match(/^\/messages\/(\d+)\/read$/)
    if (read) { const message = db.messages.find(item => item.id === Number(read[1])); if (message) message.read_status = 'READ'; save(); return ok(null) }
    return fail(`演示接口未实现：POST ${path}`)
  },
  async put(path: string, body: any = {}) {
    await new Promise(resolve => setTimeout(resolve, 180))
    if (path === '/auth/profile') {
      const user = { ...currentUser(), ...body }
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      return ok(user)
    }
    if (path === '/auth/password') {
      const currentPassword = localStorage.getItem(PASSWORD_KEY) || 'Scrm@2026'
      if (body.oldPassword !== currentPassword) return fail('旧密码不正确')
      if (!body.newPassword || body.newPassword.length < 8) return fail('新密码至少需要 8 位')
      localStorage.setItem(PASSWORD_KEY, body.newPassword)
      return ok(null)
    }
    const organization = path.match(/^\/system\/organizations\/(\d+)$/)
    if (organization) { const target = db.organizations.find(item => item.id === Number(organization[1])); if (!target) return fail('组织不存在或已删除'); const immutableCode = target.code; Object.assign(target, body, { code: immutableCode }); save(); return ok(target) }
    return fail(`演示接口未实现：PUT ${path}`)
  },
  async delete(path: string) {
    await new Promise(resolve => setTimeout(resolve, 180))
    const organization = path.match(/^\/system\/organizations\/(\d+)$/)
    if (!organization) return fail(`演示接口未实现：DELETE ${path}`)
    const targetId = Number(organization[1]), target = db.organizations.find(item => item.id === targetId)
    if (!target) return fail('组织不存在或已删除')
    if (target.parent_id === null) return fail('公司根组织不可删除')
    if (db.organizations.some(item => item.parent_id === targetId) || target.employee_count) return fail('该组织存在下级组织或有效员工，无法删除')
    db.organizations = db.organizations.filter(item => item.id !== targetId); save(); return ok(null)
  }
}
