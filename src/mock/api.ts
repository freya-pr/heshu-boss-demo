type Row = Record<string, any>
import { v1Menus } from '../config/menu'

const STORAGE_KEY = 'heshu_scrm_demo_db_v11'
const USER_KEY = 'heshu_scrm_demo_user'
const PASSWORD_KEY = 'heshu_scrm_demo_password'

interface DemoDb {
  leads: Row[]
  customers: Row[]
  collisionCases: Row[]
  messages: Row[]
  organizations: Row[]
  employees: Row[]
}

const seed: DemoDb = {
  leads: [
    { id: 1, lead_no: 'L202608160001', order_no: '', order_status: 'NO_ORDER', name: '周女士', mobile: '13800001111', original_mobile: '13800001111', decrypted_mobile: '13800001111', union_id: '', wechat_nickname: '', source_type: 'DRAINAGE', lead_source: '抖音', channel_name: '暑期直播', third_party_product_id: 'DY-COURSE-10086', first_product_name: '家庭教育直播课', product_remark: '直播预约线索', shop_name: '合数家庭教育旗舰店', paid_amount: 0, status: 'ASSIGNED', lead_mark: 'VALID', follow_status: 'NOT_FOLLOWED', conversion_status: 'UNCONVERTED', owner_id: 2, owner_name: '王老师', owner_employee_no: 'B00126', history_owner_name: '', history_owner_employee_no: '', customer_no: '', customer_name: '', entry_method: 'CHANNEL', wechat_method: '', camp_name: '2026暑期第3营', sms_send_count: 1, assigned_at: '2026-08-16 09:15:20', decrypted_at: '2026-08-16 09:12:12', created_at: '2026-08-16 09:12:10', remark: '等待客户扫码加微' },
    { id: 2, lead_no: 'L202608160002', order_no: 'TP202608160021', order_status: 'PAID', name: '赵先生', mobile: '', original_mobile: '139****6721', decrypted_mobile: '', union_id: '', wechat_nickname: '', source_type: 'THIRD_PRODUCT', lead_source: '小鹅通', channel_name: '合作渠道A', third_party_product_id: 'XET-PROD-20260821', first_product_name: '家庭学习力体验营', product_remark: '', shop_name: '合作方店铺A', paid_amount: 9.9, status: 'PENDING_ASSIGNMENT', lead_mark: 'VALID', follow_status: 'NOT_FOLLOWED', conversion_status: 'UNCONVERTED', owner_id: null, owner_name: '', owner_employee_no: '', history_owner_name: '', history_owner_employee_no: '', customer_no: '', customer_name: '', entry_method: 'PARTNER_PUSH', wechat_method: '', camp_name: '2026暑期体验营', sms_send_count: 0, created_at: '2026-08-16 09:28:40', remark: '' },
    { id: 3, lead_no: 'L202608160003', order_no: '', order_status: 'NO_ORDER', name: '钱女士', mobile: '13800002222', original_mobile: '13800002222', decrypted_mobile: '13800002222', union_id: 'union_qian_002', wechat_nickname: '钱多多妈妈', source_type: 'DRAINAGE', lead_source: '有赞', channel_name: '信息流广告', first_product_name: '家庭教育问卷', product_remark: '已填写需求问卷', shop_name: '合数成长中心', paid_amount: 0, status: 'QUESTIONNAIRE_FILLED', lead_mark: 'VALID', follow_status: 'FOLLOWING', conversion_status: 'UNCONVERTED', demand_mined: true, demand_mined_at: '2026-08-16 10:25:00', demand_mined_by: '陈老师', owner_id: 3, owner_name: '陈老师', owner_employee_no: 'B00135', history_owner_name: '王老师', history_owner_employee_no: 'B00126', customer_no: 'C202608160002', customer_name: '钱女士', entry_method: 'CHANNEL', wechat_method: 'WECOM', camp_name: '2026暑期第3营', sms_send_count: 2, first_follow_at: '2026-08-16 10:08:00', assigned_at: '2026-08-16 10:03:20', wechat_added_at: '2026-08-16 10:07:35', questionnaire_at: '2026-08-16 10:20:11', customer_linked_at: '2026-08-16 10:15:00', converted_at: '', decrypted_at: '2026-08-16 10:02:21', created_at: '2026-08-16 10:02:18', remark: '已完成挖需，待预约直播' },
    { id: 4, lead_no: 'L202608160004', order_no: '', order_status: 'NO_ORDER', name: '孙女士', mobile: '13700006666', original_mobile: '13700006666', decrypted_mobile: '13700006666', union_id: '', wechat_nickname: '', source_type: 'REFERRAL', lead_source: '转介绍', channel_name: '老客转介绍', status: 'PENDING_ASSIGNMENT', lead_mark: 'VALID', follow_status: 'NOT_FOLLOWED', conversion_status: 'UNCONVERTED', owner_id: null, owner_name: '', owner_employee_no: '', customer_no: '', customer_name: '', entry_method: 'REFERRAL', camp_name: '2026暑期第3营', sms_send_count: 0, created_at: '2026-08-16 10:30:09', remark: '' },
    { id: 5, lead_no: 'L202608150008', order_no: 'O202608150088', order_status: 'PAID', name: '吴女士', mobile: '13800003333', original_mobile: '13800003333', decrypted_mobile: '13800003333', union_id: 'union_wu_003', wechat_nickname: '睿睿妈妈', source_type: 'DRAINAGE', lead_source: '抖音', channel_name: '直播间', first_product_name: '2980成长训练营', product_remark: '正式课首单', shop_name: '合数家庭教育旗舰店', paid_amount: 2980, status: 'ASSESSMENT_COMPLETED', lead_mark: 'VALID', follow_status: 'FOLLOWED', conversion_status: 'CONVERTED', owner_id: 2, owner_name: '王老师', owner_employee_no: 'B00126', history_owner_name: '陈老师', history_owner_employee_no: 'B00135', customer_no: 'C202608160003', customer_name: '吴女士', entry_method: 'CHANNEL', wechat_method: 'WECOM', camp_name: '2026暑期高年级1班', sms_send_count: 3, first_follow_at: '2026-08-15 15:25:00', assigned_at: '2026-08-15 15:21:00', wechat_added_at: '2026-08-15 15:23:00', questionnaire_at: '2026-08-15 16:10:00', assessment_at: '2026-08-15 17:20:00', customer_linked_at: '2026-08-15 15:30:00', converted_at: '2026-08-16 08:30:00', decrypted_at: '2026-08-15 15:20:05', created_at: '2026-08-15 15:20:00', remark: '已成交2980课程' },
    { id: 6, lead_no: 'L202608140015', order_no: '', order_status: 'NO_ORDER', name: '郑女士', mobile: '13600004444', original_mobile: '13600004444', decrypted_mobile: '13600004444', union_id: 'union_zheng_004', wechat_nickname: '果果妈妈', source_type: 'DRAINAGE', lead_source: '百家号', channel_name: '搜索推广', first_product_name: '家庭教育公开课', product_remark: '', shop_name: '', paid_amount: 0, status: 'WECHAT_ADDED', lead_mark: 'VALID', follow_status: 'FOLLOWED', conversion_status: 'UNCONVERTED', owner_id: 3, owner_name: '陈老师', owner_employee_no: 'B00135', customer_no: 'C202608140015', customer_name: '郑女士', entry_method: 'CHANNEL', wechat_method: 'PERSONAL_WECHAT', camp_name: '2026暑期第2营', sms_send_count: 1, first_follow_at: '2026-08-14 11:20:00', assigned_at: '2026-08-14 11:12:00', wechat_added_at: '2026-08-14 11:18:00', customer_linked_at: '2026-08-14 11:30:00', converted_at: '', decrypted_at: '2026-08-14 11:10:03', created_at: '2026-08-14 11:10:00', remark: '已加微，尚未完成转化' },
    { id: 7, lead_no: 'L202608130027', order_no: '', order_status: 'NO_ORDER', name: '测试号码', mobile: '13000000000', original_mobile: '13000000000', decrypted_mobile: '13000000000', union_id: '', wechat_nickname: '', source_type: 'DRAINAGE', lead_source: '自有系统', channel_name: '历史名单', first_product_name: '', product_remark: '', shop_name: '', paid_amount: 0, status: 'DECRYPTED', lead_mark: 'INVALID', follow_status: 'NOT_FOLLOWED', conversion_status: 'UNCONVERTED', owner_id: null, owner_name: '', owner_employee_no: '', customer_no: '', customer_name: '', entry_method: 'IMPORT', wechat_method: '', camp_name: '', sms_send_count: 0, decrypted_at: '2026-08-13 09:00:02', created_at: '2026-08-13 09:00:00', remark: '测试数据，已审核标记无效' }
  ],
  customers: [
    { id: 1, customer_no: 'C202608160001', name: '周女士', mobile: '13800001111', union_id: 'union_zhou_001', grade: 'A', grade_source: 'LEAD_INHERITED', lifecycle: 'LEAD', demand_mined: false, add_method: 'QR_CODE', source_name: '抖店 · 合数教育官方旗舰店', source_lead_no: 'L202608160001', camp_name: '2026暑期第3营', owner_id: 2, owner_name: '王老师', owner_employee_no: 'B00126', owner_organization_id: 3, owner_organization_name: '一转一组', status: 'ACTIVE', created_at: '2026-08-16 09:40:00' },
    { id: 2, customer_no: 'C202608160002', name: '钱女士', mobile: '13800002222', union_id: 'union_qian_002', grade: 'B', grade_source: 'LEAD_INHERITED', lifecycle: 'INTENT', demand_mined: true, add_method: 'LINK', source_name: '有赞 · 合数成长中心', source_lead_no: 'L202608160003', camp_name: '2026暑期第3营', owner_id: 3, owner_name: '陈老师', owner_employee_no: 'B00135', owner_organization_id: 9, owner_organization_name: '一转二组', status: 'ACTIVE', created_at: '2026-08-16 10:15:00' },
    { id: 3, customer_no: 'C202608160003', name: '吴女士', mobile: '13800003333', union_id: 'union_wu_003', grade: 'S', grade_source: 'LEAD_INHERITED', lifecycle: 'DEAL', add_method: 'BUSINESS_CARD', source_name: '抖音 · 直播间', source_lead_no: 'L202608150008', camp_name: '2026暑期高年级1班', owner_id: 2, owner_name: '王老师', owner_employee_no: 'B00126', owner_organization_id: 3, owner_organization_name: '一转一组', status: 'ACTIVE', created_at: '2026-08-15 15:20:00' }
  ],
  collisionCases: [
    { id: 1, collision_no: 'DC202608250001', source_type: 'LEAD_CONVERT', source_business_no: 'TP202608250019', source_lead_no: 'L202608250019', incoming_name: '周女士', mobile: '13800001111', union_id: 'union_qian_002', mobile_customer_id: 1, union_customer_id: 2, risk_level: 'HIGH', status: 'PENDING', requested_by: '系统', requested_at: '2026-08-25 09:18:36', handler_name: '', handled_at: '', resolution_type: '', resolution_reason: '', target_customer_id: null, audit_logs: [{ action: 'CREATE', operator: '系统', occurred_at: '2026-08-25 09:18:36', detail: '线索转客户时，手机号与 UnionID 分别命中不同客户，已阻断自动建档。' }] },
    { id: 2, collision_no: 'DC202608250002', source_type: 'WECOM_SYNC', source_business_no: 'WECOM-EVT-88261', source_lead_no: '', incoming_name: '吴女士', mobile: '13800003333', union_id: 'union_zhou_001', mobile_customer_id: 3, union_customer_id: 1, risk_level: 'HIGH', status: 'PROCESSING', requested_by: '企微回调', requested_at: '2026-08-25 10:06:12', handler_name: '林校长', started_at: '2026-08-25 10:12:08', handled_at: '', resolution_type: '', resolution_reason: '', target_customer_id: null, audit_logs: [{ action: 'CREATE', operator: '系统', occurred_at: '2026-08-25 10:06:12', detail: '企微外部联系人同步触发身份冲突。' }, { action: 'START', operator: '林校长', occurred_at: '2026-08-25 10:12:08', detail: '开始人工核验。' }] },
    { id: 3, collision_no: 'DC202608240006', source_type: 'IMPORT', source_business_no: 'IMPORT-20260824-08', source_lead_no: '', incoming_name: '钱女士', mobile: '13800002222', union_id: 'union_wu_003', mobile_customer_id: 2, union_customer_id: 3, risk_level: 'MEDIUM', status: 'RESOLVED', requested_by: '张铭钰', requested_at: '2026-08-24 16:40:21', handler_name: '林校长', handled_at: '2026-08-24 17:08:43', resolution_type: 'KEEP_SEPARATE', resolution_reason: '经手机号回访及企微头像核验，确认是两个不同自然人，保留两个独立客户档案。', target_customer_id: null, audit_logs: [{ action: 'CREATE', operator: '张铭钰', occurred_at: '2026-08-24 16:40:21', detail: '导入解密数据时触发身份冲突。' }, { action: 'RESOLVE', operator: '林校长', occurred_at: '2026-08-24 17:08:43', detail: '确认不同人，保留独立档案。' }] }
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
    { id: 1, employee_no: 'B000001', name: '李士文', legal_name: '李士文', mobile_masked: '138****1201', email: 'lishiwen@heshu.com', organization_id: 2, position_name: '部门负责人', wecom_user_id: 'wx_lishiwen', employment_status: 'ACTIVE', account_status: 'ACTIVE', load: 18, assignment_limit: 30, qr_camp_name: '2026暑期第3营' },
    { id: 2, employee_no: 'B000126', name: '王老师', legal_name: '王琴', mobile_masked: '139****4508', email: 'wangqin@heshu.com', organization_id: 3, position_name: '课程顾问', wecom_user_id: 'wx_wang', employment_status: 'ACTIVE', account_status: 'ACTIVE', load: 12, assignment_limit: 20, qr_camp_name: '2026暑期第3营' },
    { id: 3, employee_no: 'B000135', name: '陈老师', legal_name: '陈晨', mobile_masked: '136****8821', email: 'chenchen@heshu.com', organization_id: 9, position_name: '课程顾问', wecom_user_id: 'wx_chen', employment_status: 'ACTIVE', account_status: 'ACTIVE', load: 16, assignment_limit: 18, qr_camp_name: '2026暑期第3营' },
    { id: 4, employee_no: 'B000208', name: '刘老师', legal_name: '刘子云', mobile_masked: '157****5728', email: 'liuziyun@heshu.com', organization_id: 5, position_name: '客服专员', wecom_user_id: 'wx_liu', employment_status: 'ACTIVE', account_status: 'ACTIVE', load: 9, assignment_limit: 15, qr_camp_name: '2026暑期第3营' },
    { id: 5, employee_no: 'B000281', name: '吴老师', legal_name: '吴若燕', mobile_masked: '136****0104', email: 'wuruoyan@heshu.com', organization_id: 6, position_name: '运营专员', wecom_user_id: '', employment_status: 'ACTIVE', account_status: 'ACTIVE', load: 7, assignment_limit: 10, qr_camp_name: '' },
    { id: 6, employee_no: 'B000293', name: '李经理', legal_name: '李景', mobile_masked: '136****8265', email: 'lijing@heshu.com', organization_id: 7, position_name: '财务经理', wecom_user_id: 'wx_lijing', employment_status: 'ACTIVE', account_status: 'ACTIVE', load: 3, assignment_limit: 8, qr_camp_name: '' },
    { id: 7, employee_no: 'B000297', name: '赵主管', legal_name: '赵梅', mobile_masked: '183****9828', email: 'zhaomei@heshu.com', organization_id: 8, position_name: '人事主管', wecom_user_id: 'wx_zhao', employment_status: 'ACTIVE', account_status: 'INACTIVE', load: 0, assignment_limit: 0, qr_camp_name: '' }
  ]
}

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) }
function normalizeEmployeeNo(value: unknown) { const text=String(value||'');return /^B\d{5}$/.test(text)?`B0${text.slice(1)}`:text }
function normalizeDb(source: DemoDb): DemoDb {
  source.collisionCases ||= clone(seed.collisionCases)
  source.employees.forEach(item=>{item.employee_no=normalizeEmployeeNo(item.employee_no)})
  source.leads.forEach(item=>{item.owner_employee_no=normalizeEmployeeNo(item.owner_employee_no);item.history_owner_employee_no=normalizeEmployeeNo(item.history_owner_employee_no);item.demand_mined=Boolean(item.demand_mined||item.demand_mined_at);item.mobile_change_history ||= []})
  source.customers.forEach((item,index)=>{item.owner_employee_no=normalizeEmployeeNo(item.owner_employee_no);item.grade_source=item.grade_source||'LEAD_INHERITED';item.lifecycle=item.lifecycle||(item.order_count>0?'DEAL':item.demand_mined?'INTENT':'LEAD');item.add_method=item.add_method||(['QR_CODE','LINK','BUSINESS_CARD'][index%3]);item.source_name=item.source_name||'历史数据';item.source_lead_no=item.source_lead_no||'';item.camp_name=item.camp_name||''})
  return source
}
function load(): DemoDb {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return normalizeDb(clone(seed))
  try {
    const stored = JSON.parse(raw) as DemoDb
    if (stored.organizations.some(item => ['GROUP', 'REGION', 'CAMPUS', 'PERSON'].includes(item.type) || 'sort_order' in item)) return normalizeDb(clone(seed))
    return normalizeDb(stored)
  } catch { return normalizeDb(clone(seed)) }
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
function effectiveLeadGrade(lead: Row) {
  const grade = String(lead.lead_grade || '')
  if (['S', 'A', 'B', 'C', 'UNRATED'].includes(grade)) return grade
  if (!lead.questionnaire_at) return 'UNRATED'
  return lead.customer_no === 'C202608160003' ? 'S' : 'B'
}
function menus(role: string) {
  return role === 'ADMIN' ? v1Menus : v1Menus.filter(group => !['BUSINESS_CONFIG', 'SYSTEM'].includes(group.code))
}

function buildLeadJourney(lead: Row) {
  const events: Row[] = []
  const currentGrade = effectiveLeadGrade(lead)
  const add = (occurredAt: string, eventType: string, eventName: string, fromStatus: string | null, toStatus: string | null, source: string, detail: string, operator = '系统') => {
    if (!occurredAt) return
    events.push({ id: `${lead.id}-${eventType}-${occurredAt}`, event_type: eventType, event_name: eventName, from_status: fromStatus, to_status: toStatus, operator_name: operator, event_source: source, detail, occurred_at: occurredAt })
  }
  add(lead.created_at, 'LEAD_CREATED', '线索进入合数BOSS', null, 'PENDING_ASSIGNMENT', 'SYSTEM', `来源：${lead.lead_source || lead.channel_name || '未知'}`)
  add(lead.decrypted_at, 'MOBILE_DECRYPTED', '手机号完成解密', 'PENDING_DECRYPTION', 'DECRYPTED', 'SYNC', '手机号解密结果已回写')
  add(lead.assigned_at, 'LEAD_ASSIGNED', '线索完成分配', 'PENDING_ASSIGNMENT', 'ASSIGNED', 'MANUAL', `负责人：${lead.owner_name || '—'}；员工编号：${lead.owner_employee_no || '—'}`, lead.owner_name || '系统')
  if (Number(lead.sms_send_count || 0) > 0) add(lead.first_follow_at || lead.assigned_at, 'SMS_SENT', '发送跟进短信', 'SMS_NOT_CLICKED', 'SMS_NOT_CLICKED', 'SMS', `累计发送 ${lead.sms_send_count} 次`, lead.owner_name || '系统')
  add(lead.wechat_added_at, 'WECHAT_ADDED', '客户完成加微', 'WECHAT_NOT_ADDED', 'WECHAT_ADDED', 'WECOM', `加微方式：${lead.wechat_method === 'WECOM' ? '企业微信' : '个人微信'}`, lead.owner_name || '系统')
  add(lead.customer_linked_at, 'CUSTOMER_LINKED', '建立唯一客户档案', lead.status, lead.status, 'MANUAL', `关联客户：${lead.customer_no || '—'}`, lead.owner_name || '系统')
  add(lead.questionnaire_at, 'QUESTIONNAIRE_FILLED', '客户提交问卷', 'QUESTIONNAIRE_NOT_FILLED', 'QUESTIONNAIRE_FILLED', 'QUESTIONNAIRE', '有效问卷结果已回写', lead.owner_name || '系统')
  if (lead.questionnaire_at && currentGrade !== 'UNRATED') add(lead.grade_changed_at || lead.questionnaire_at, 'LEAD_GRADED', '问卷自动评定线索等级', 'UNRATED', currentGrade, 'GRADE_RULE', `规则版本：${lead.grade_rule_version || 'V1.0'}；来源：有效问卷`, '系统')
  add(lead.demand_mined_at, 'DEMAND_MINED', '标记已挖需', 'NOT_MINED', 'MINED', 'MANUAL', '业务人员确认已完成挖需；该事实标记不可在列表取消', lead.demand_mined_by || lead.owner_name || '当前用户')
  if (lead.grade_source === 'MANUAL') add(lead.grade_changed_at, 'LEAD_GRADE_CHANGED', '人工变更线索等级', lead.previous_grade || 'UNRATED', lead.lead_grade, 'MANUAL', `变更原因：${lead.grade_change_reason || '未填写'}`, lead.grade_changed_by || '系统管理员')
  ;(lead.mobile_change_history || []).forEach((item: Row) => add(item.occurred_at, item.action === 'MERGE' ? 'MOBILE_MERGED' : 'MOBILE_CHANGED', item.action === 'MERGE' ? '手机号档案完成合并' : '线索手机号完成变更', null, null, 'MANUAL', item.detail || `手机号 ${maskMobile(item.old_mobile)} → ${maskMobile(item.new_mobile)}`, item.operator_name || '系统管理员'))
  ;(lead.wechat_status_history || []).forEach((item: Row) => add(item.occurred_at, 'WECHAT_STATUS_CHANGED', '人工修改加微状态', item.from_status, item.to_status, 'MANUAL', item.detail || '人工修正加微状态', item.operator_name || '系统管理员'))
  add(lead.assessment_at, 'ASSESSMENT_COMPLETED', '客户完成测评', 'ASSESSMENT_NOT_COMPLETED', 'ASSESSMENT_COMPLETED', 'ASSESSMENT', '有效测评结果已回写', lead.owner_name || '系统')
  add(lead.converted_at, 'LEAD_CONVERTED', '线索完成转化', null, null, 'ORDER', `关联订单：${lead.order_no || '—'}`)
  return events.sort((a, b) => String(b.occurred_at).localeCompare(String(a.occurred_at)))
}

function nowText() { return new Date().toLocaleString('zh-CN', { hour12: false }) }
function maskMobile(value: unknown) {
  const mobile = String(value || '')
  return /^1\d{10}$/.test(mobile) ? `${mobile.slice(0, 3)}****${mobile.slice(-4)}` : '—'
}
function customerSnapshot(customer?: Row) {
  if (!customer) return null
  return {
    id: customer.id, customer_no: customer.customer_no, name: customer.name,
    mobile: customer.mobile, union_id: customer.union_id, grade: customer.grade,
    lifecycle: customer.lifecycle, source_name: customer.source_name,
    source_lead_no: customer.source_lead_no, camp_name: customer.camp_name,
    owner_name: customer.owner_name, owner_employee_no: customer.owner_employee_no,
    owner_organization_name: customer.owner_organization_name, status: customer.status,
    created_at: customer.created_at, order_count: customer.lifecycle === 'DEAL' ? 2 : 0,
    questionnaire_count: customer.grade_source === 'LEAD_INHERITED' ? 1 : 0
  }
}

function mobileProfile(lead: Row, customer?: Row) {
  return {
    customer_id: customer?.id || null,
    customer_no: customer?.customer_no || '',
    customer_name: customer?.name || '',
    lead_id: lead.id,
    lead_name: lead.name || '',
    order_no: lead.order_no || '',
    mobile: maskMobile(customer?.mobile || lead.decrypted_mobile || lead.mobile),
    owner_id: customer?.owner_id ?? lead.owner_id ?? null,
    owner_name: customer?.owner_name || lead.owner_name || '',
    owner_employee_no: customer?.owner_employee_no || lead.owner_employee_no || ''
  }
}

function validateLeadMobileChange(lead: Row, rawMobile: unknown) {
  const newMobile = String(rawMobile || '').replace(/[\s-]/g, '').replace(/^\+86/, '')
  if (!/^1[3-9]\d{9}$/.test(newMobile)) throw new Error('请输入有效的 11 位手机号')
  const currentMobile = String(lead.decrypted_mobile || lead.mobile || '').replace(/[\s-]/g, '')
  const currentCustomer = db.customers.find(item => item.status !== 'MERGED' && (item.customer_no === lead.customer_no || item.mobile === currentMobile))
  const currentProfile = mobileProfile(lead, currentCustomer)
  if (newMobile === currentMobile) return { status: 'BLOCKED_SAME_MOBILE', title: '新手机号与当前手机号一致', message: '无需变更，请重新输入其他手机号。', current_profile: currentProfile, target_profile: null, validation_token: '' }
  const targetCustomer = db.customers.find(item => item.status !== 'MERGED' && item.mobile === newMobile)
  const targetLead = db.leads.find(item => item.id !== lead.id && [item.decrypted_mobile, item.mobile].includes(newMobile))
  if (!targetCustomer && !targetLead) return { status: 'AVAILABLE', title: '手机号未被占用', message: '校验通过，可直接变更当前线索及关联客户的主手机号。', current_profile: currentProfile, target_profile: null, validation_token: `${lead.id}:${newMobile}:AVAILABLE` }
  const resolvedTargetLead = targetLead || db.leads.find(item => item.customer_no && item.customer_no === targetCustomer?.customer_no) || { id: null, name: targetCustomer?.name, owner_id: targetCustomer?.owner_id, owner_name: targetCustomer?.owner_name, owner_employee_no: targetCustomer?.owner_employee_no }
  const targetProfile = mobileProfile(resolvedTargetLead as Row, targetCustomer)
  const sameOwner = Boolean(currentProfile.owner_id && targetProfile.owner_id && Number(currentProfile.owner_id) === Number(targetProfile.owner_id)) || Boolean(currentProfile.owner_employee_no && targetProfile.owner_employee_no && currentProfile.owner_employee_no === targetProfile.owner_employee_no)
  if (sameOwner) return { status: 'MERGE_ALLOWED', title: '手机号已存在，可合并档案', message: `两个手机号均归属于一转负责人 ${currentProfile.owner_name || targetProfile.owner_name}，禁止直接覆盖，但允许确认后合并相关档案。`, current_profile: currentProfile, target_profile: targetProfile, validation_token: `${lead.id}:${newMobile}:MERGE_ALLOWED` }
  return { status: 'BLOCKED_OWNER_CONFLICT', title: '手机号已存在且客户归属不同', message: `当前手机号客户归属于 ${currentProfile.owner_name || '未分配'}，新手机号客户归属于 ${targetProfile.owner_name || '未分配'}，不允许变更或自动合并。`, current_profile: currentProfile, target_profile: targetProfile, validation_token: '' }
}
function enrichCollision(item: Row): Row {
  return {
    ...item,
    mobile_customer: customerSnapshot(db.customers.find(customer => customer.id === item.mobile_customer_id)),
    union_customer: customerSnapshot(db.customers.find(customer => customer.id === item.union_customer_id)),
    target_customer: customerSnapshot(db.customers.find(customer => customer.id === item.target_customer_id))
  }
}
function recordCollision(input: Row, byMobile: Row, byUnion: Row) {
  const existing = db.collisionCases.find(item => item.status !== 'RESOLVED' && item.mobile === input.mobile && item.union_id === input.unionId && item.mobile_customer_id === byMobile.id && item.union_customer_id === byUnion.id)
  if (existing) return existing
  const requestedAt = nowText()
  const nextId = Math.max(0, ...db.collisionCases.map(item => Number(item.id) || 0)) + 1
  const collision = {
    id: nextId, collision_no: `DC${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}${String(nextId).padStart(3, '0')}`,
    source_type: input.sourceType || input.source_type || (input.lead_no ? 'LEAD_CONVERT' : 'CUSTOMER_CREATE'),
    source_business_no: input.order_no || input.sourceBusinessNo || '', source_lead_no: input.lead_no || '',
    incoming_name: input.name || '', mobile: input.mobile, union_id: input.unionId,
    mobile_customer_id: byMobile.id, union_customer_id: byUnion.id,
    risk_level: 'HIGH', status: 'PENDING', requested_by: currentUser().displayName,
    requested_at: requestedAt, handler_name: '', handled_at: '', resolution_type: '',
    resolution_reason: '', target_customer_id: null,
    audit_logs: [{ action: 'CREATE', operator: '系统', occurred_at: requestedAt, detail: '手机号与 UnionID 分别命中不同客户，自动流程已阻断并创建撞单案件。' }]
  }
  db.collisionCases.unshift(collision)
  save()
  return collision
}

function createCustomer(body: Row): Row & { _reused: boolean; _match_by: string } {
  const mobile = String(body.mobile || '').replace(/[\s-]/g, '').replace(/^\+86/, '') || null
  const unionId = String(body.unionId || body.union_id || '').trim() || null
  if (!mobile && !unionId) throw new Error('手机号或 UnionID 至少填写一项')
  if (mobile && !/^1[3-9]\d{9}$/.test(mobile)) throw new Error('一个客户只能保存一个有效的 11 位主手机号')
  const byMobile = mobile ? db.customers.find(item => item.mobile === mobile) : undefined
  const byUnion = unionId ? db.customers.find(item => item.union_id === unionId) : undefined
  if (byMobile && byUnion && byMobile.id !== byUnion.id) {
    const collision = recordCollision({ ...body, mobile, unionId }, byMobile, byUnion)
    throw new Error(`手机号和 UnionID 分别命中不同客户，已阻断自动建档并生成撞单案件 ${collision.collision_no}`)
  }
  const existing = byMobile || byUnion
  if (existing) return { ...existing, _reused: true, _match_by: byMobile && byUnion ? 'BOTH' : byMobile ? 'MOBILE' : 'UNION_ID' }
  const ownerName = body.ownerName || body.owner_name || ''
  const owner = db.employees.find(item => item.name === ownerName || item.legal_name === ownerName)
  const ownerOrganization = db.organizations.find(item => Number(item.id) === Number(owner?.organization_id))
  const inheritedGrade = effectiveLeadGrade(body)
  const customer = { id: Math.max(0, ...db.customers.map(item => item.id)) + 1, customer_no: id('C'), name: body.name, mobile, union_id: unionId, grade: inheritedGrade, grade_source: 'LEAD_INHERITED', lifecycle: body.lifecycle || 'LEAD', add_method: body.addMethod || body.add_method || 'LINK', source_name: body.source_name || body.lead_source || '人工建档', source_lead_no: body.lead_no || '', camp_name: body.camp_name || '', owner_id: owner?.id || null, owner_name: ownerName, owner_employee_no: owner?.employee_no || '', owner_organization_id: owner?.organization_id || null, owner_organization_name: ownerOrganization?.name || '', status: 'ACTIVE', created_at: new Date().toLocaleString('zh-CN', { hour12: false }) }
  db.customers.unshift(customer); save(); return { ...customer, _reused: false, _match_by: 'NONE' }
}

const analyticsChannels = [
  { name: '抖音', leads: 12480, wechat: 8120, questionnaire: 5520, deals: 586, netGmv: 1688000 },
  { name: '有赞', leads: 7060, wechat: 4480, questionnaire: 3260, deals: 318, netGmv: 912000 },
  { name: '小鹅通', leads: 6240, wechat: 3610, questionnaire: 2480, deals: 236, netGmv: 694000 },
  { name: '百家号', leads: 4220, wechat: 2390, questionnaire: 1640, deals: 146, netGmv: 422000 }
]

function scaleNumber(value: number, scale: number) { return Math.max(0, Math.round(value * scale)) }

function buildLeadAnalytics(params: Row = {}) {
  const leadCreatedSummary = params.aggregationMode === 'LEAD_CREATED'
  const selectedPeriods = Array.isArray(params.period) ? params.period.filter(Boolean) : params.period ? [params.period] : []
  const periodName = leadCreatedSummary ? '线索数据汇总' : String(selectedPeriods.join('、') || '2026 暑期第 3 营')
  const selectedChannel = String(params.channel || '全部渠道')
  const selectedStore = String(params.store || '全部店铺')
  const selectedIpChannel = String(params.ipChannel || '全部IP渠道')
  const selectedIpName = String(params.ipName || '全部IP')
  const selectedTeam = String(params.team || '一转销售部')
  const createdRange = Array.isArray(params.leadCreatedRange) ? params.leadCreatedRange.filter(Boolean) : []
  const createdDays = createdRange.length === 2 ? Math.max(1, Math.round((new Date(`${createdRange[1]}T00:00:00`).getTime() - new Date(`${createdRange[0]}T00:00:00`).getTime()) / 86400000) + 1) : 7
  const periodScale = leadCreatedSummary ? createdDays / 7 : (({ '2026 暑期第 3 营': 1, '2026 暑期第 2 营': 0.86, '2026 暑期体验营': 0.62 } as Row)[periodName] || 1)
  const teamScale = ({ '一转销售部': 1, '一转一组': 0.54, '一转二组': 0.46 } as Row)[selectedTeam] || 1
  const storeScale = ({ '全部店铺': 1, '合数教育官方旗舰店': 0.43, '合数精品课程店': 0.27, '合数成长课堂': 0.19, '合数教育体验课': 0.11 } as Row)[selectedStore] || 1
  const ipChannelScale = ({ '全部IP渠道': 1, '店播': 0.61, '阿留专属': 0.39 } as Row)[selectedIpChannel] || 1
  const ipNameScale = ({ '全部IP': 1, '阿留皮皮': 0.38, '周老师': 0.34, '王老师': 0.28 } as Row)[selectedIpName] || 1
  const selectedRows = selectedChannel === '全部渠道' ? analyticsChannels : analyticsChannels.filter(item => item.name === selectedChannel)
  const totals = selectedRows.reduce((sum, item) => ({
    leads: sum.leads + item.leads,
    wechat: sum.wechat + item.wechat,
    questionnaire: sum.questionnaire + item.questionnaire,
    deals: sum.deals + item.deals,
    netGmv: sum.netGmv + item.netGmv
  }), { leads: 0, wechat: 0, questionnaire: 0, deals: 0, netGmv: 0 })
  const scale = periodScale * teamScale * storeScale * ipChannelScale * ipNameScale
  const leads = scaleNumber(totals.leads, scale)
  const wechat = scaleNumber(totals.wechat, scale)
  const questionnaire = scaleNumber(totals.questionnaire, scale)
  const reservation = scaleNumber(questionnaire, 0.733)
  const arrival = scaleNumber(reservation, 0.775)
  const completion = scaleNumber(arrival, 0.802)
  const deal = scaleNumber(totals.deals, scale)
  const refund = scaleNumber(deal, 0.0575)
  const grossGmv = scaleNumber(deal, 2987)
  const refundAmount = scaleNumber(refund, 1703)
  const netGmv = grossGmv - refundAmount
  const serviceStaff = Math.max(1, scaleNumber(252, teamScale))
  const targetGmv = scaleNumber(4200000 * (totals.leads / 30000), periodScale * teamScale)
  const trendBase = [142, 161, 178, 184, 205, 197, 219]
  const labels = ['08/12', '08/13', '08/14', '08/15', '08/16', '08/17', '08/18']
  const trendRatio = deal / 1286
  const trend = labels.map((label, index) => ({
    label,
    leads: scaleNumber([3920, 4180, 4460, 4320, 4610, 4380, 4130][index], leads / 30000),
    deals: scaleNumber(trendBase[index], trendRatio),
    dealAmountWan: Number((scaleNumber(trendBase[index], trendRatio) * 2987 / 10000).toFixed(2))
  }))
  const channels = selectedRows.map(item => {
    const channelLeads = scaleNumber(item.leads, scale)
    const channelDeals = scaleNumber(item.deals, scale)
    return {
      ...item,
      leads: channelLeads,
      wechat: scaleNumber(item.wechat, scale),
      questionnaire: scaleNumber(item.questionnaire, scale),
      deals: channelDeals,
      conversionRate: channelLeads ? channelDeals / channelLeads * 100 : 0,
      netGmv: scaleNumber(item.netGmv, scale)
    }
  })
  const ipChannelSeeds = [
    { name: '阿留专属', code: 'CH000002', ipCount: 3, leads: 12680, wechat: 8876, questionnaire: 6213, reservation: 4680, arrival: 3587, completion: 2916, deals: 718, refunds: 38, grossGmv: 2148900, refundAmount: 64600 },
    { name: '店播', code: 'CH000001', ipCount: 8, leads: 10920, wechat: 7028, questionnaire: 4696, reservation: 3420, arrival: 2635, completion: 2074, deals: 416, refunds: 25, grossGmv: 1243800, refundAmount: 42500 },
    { name: '通用投放', code: 'CH000003', ipCount: 4, leads: 6400, wechat: 2696, questionnaire: 1991, reservation: 1368, arrival: 1026, completion: 812, deals: 152, refunds: 11, grossGmv: 454600, refundAmount: 18700 }
  ]
  const ipChannels = ipChannelSeeds
    .filter(item => selectedIpChannel === '全部IP渠道' || item.name === selectedIpChannel)
    .map(item => {
      const rowScale = periodScale * teamScale * storeScale * ipNameScale
      const row = Object.fromEntries(Object.entries(item).map(([key, value]) => [key, typeof value === 'number' && key !== 'ipCount' ? scaleNumber(value, rowScale) : value])) as Row
      row.conversionRate = row.leads ? Number((row.deals / row.leads * 100).toFixed(1)) : 0
      row.finalConversionRate = row.leads ? Number(((row.deals - row.refunds) / row.leads * 100).toFixed(1)) : 0
      row.netGmv = row.grossGmv - row.refundAmount
      return row
    })
  const productSeeds = [
    { productId: '71967409586', name: '阿留教育规划3天精华课', platform: '百家号', store: '阿留洪元教育规划', ipName: '阿留皮皮', ipChannel: '阿留专属', leads: 9820, wechat: 7064, questionnaire: 5012, deals: 538, refunds: 29, grossGmv: 1609200, refundAmount: 49300 },
    { productId: '3825549661721198679', name: '阿留教育规划精华家长课-读书卡', platform: '抖店', store: '安数教育旗舰店', ipName: '阿留皮皮', ipChannel: '阿留专属', leads: 7260, wechat: 4937, questionnaire: 3378, deals: 346, refunds: 21, grossGmv: 1034700, refundAmount: 35700 },
    { productId: 'XET-HS-2026003', name: '家庭学习力体验营', platform: '小鹅通', store: '合数成长课堂', ipName: '皮皮老师', ipChannel: '店播', leads: 8460, wechat: 5521, questionnaire: 3640, deals: 294, refunds: 17, grossGmv: 879100, refundAmount: 28900 },
    { productId: 'YZ-100893572', name: '2026暑期家庭教育公开课', platform: '有赞', store: '合数精品课程店', ipName: '周老师', ipChannel: '店播', leads: 4460, wechat: 2504, questionnaire: 1670, deals: 108, refunds: 7, grossGmv: 322800, refundAmount: 11900 }
  ]
  const products = productSeeds
    .filter(item => (selectedStore === '全部店铺' || item.store === selectedStore) && (selectedIpChannel === '全部IP渠道' || item.ipChannel === selectedIpChannel) && (selectedIpName === '全部IP' || item.ipName === selectedIpName))
    .map(item => {
      const rowScale = periodScale * teamScale
      const row = Object.fromEntries(Object.entries(item).map(([key, value]) => [key, typeof value === 'number' ? scaleNumber(value, rowScale) : value])) as Row
      row.conversionRate = row.leads ? Number((row.deals / row.leads * 100).toFixed(1)) : 0
      row.finalConversionRate = row.leads ? Number(((row.deals - row.refunds) / row.leads * 100).toFixed(1)) : 0
      row.netGmv = row.grossGmv - row.refundAmount
      return row
    })
  const detailSources = ['抖店', '百家号', '小鹅通', '有赞']
  const detailOwners = ['李士文', '王老师', '陈老师', '刘老师']
  const detailOrganizations = ['一转事业部 / 阿留组', '一转事业部 / 店播组', '一转事业部 / 课程顾问组', '客户运营部 / 私域组']
  const details = Array.from({ length: 24 }, (_, index) => ({
    orderNo: `TP202608${String(180001 + index)}`,
    customerName: ['周女士', '赵先生', '钱女士', '孙女士'][index % 4],
    mobile: `13${8 + index % 2}****${String(1100 + index).slice(-4)}`,
    source: detailSources[index % detailSources.length],
    store: productSeeds[index % productSeeds.length].store,
    productName: productSeeds[index % productSeeds.length].name,
    ipChannel: index % 3 === 0 ? '阿留专属' : '店播',
    ipName: index % 3 === 0 ? '阿留皮皮' : index % 2 ? '皮皮老师' : '周老师',
    ownerName: detailOwners[index % detailOwners.length],
    ownerOrganization: detailOrganizations[index % detailOrganizations.length],
    period: periodName,
    eventTime: `2026-08-${String(12 + index % 7).padStart(2, '0')} ${String(9 + index % 10).padStart(2, '0')}:${String(10 + index).slice(-2)}:00`,
    stage: ['已加微', '已填问卷', '已预约', '已到课', '已完课', '已成交', '已退款'][index % 7]
  }))
  return {
    dataMode: 'DEMO', updatedAt: '2026-08-18 18:00:00', periodName,
    funnel: { leads, wechat, questionnaire, reservation, arrival, completion, deal, online: scaleNumber(618, scale), refund },
    finance: { grossGmv, refundAmount, netGmv, targetGmv },
    efficiency: { serviceStaff, peopleServiceRatio: Number((leads / serviceStaff).toFixed(1)), perCapitaGmv: Math.round(netGmv / serviceStaff), conversionDispersion: selectedTeam === '一转销售部' ? 12.8 : selectedTeam === '一转一组' ? 9.6 : 15.2 },
    trend,
    channels,
    ipChannels,
    products,
    details,
    metricVersion: 'LEAD-KPI-1.0.0'
  }
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
    if (path === '/dashboard') return ok({ metrics: { leads: db.leads.length, pendingAssignment: db.leads.filter(item => item.status === 'PENDING_ASSIGNMENT').length, customers: db.customers.length, unreadMessages: db.messages.filter(item => item.read_status === 'UNREAD').length, gradeAOrS: db.customers.filter(item => ['S', 'A'].includes(item.grade)).length }, flow: ['渠道获客', '统一接入', '数据清洗', '线索识别', '员工活码分配', '客户加微', '客户建档', '问卷定级', '业务转化'] })
    if (path === '/leads/analytics') return ok(buildLeadAnalytics(config.params || {}))
    if (path === '/leads') {
      const status = config.params?.status
      const sourceType = config.params?.sourceType
      return ok(db.leads.filter(item => (!status || item.status === status) && (!sourceType || item.source_type === sourceType)))
    }
    const journey = path.match(/^\/leads\/(\d+)\/journey$/)
    if (journey) {
      const lead = db.leads.find(item => item.id === Number(journey[1]))
      if (!lead) return fail('线索不存在')
      return ok(buildLeadJourney(lead))
    }
    if (path === '/leads/assignees') return ok(db.employees.filter(item => item.account_status === 'ACTIVE'))
    if (path === '/customers/collisions') {
      const keyword = String(config.params?.keyword || '').trim().toLowerCase()
      const status = String(config.params?.status || '')
      const sourceType = String(config.params?.sourceType || '')
      const riskLevel = String(config.params?.riskLevel || '')
      return ok(db.collisionCases
        .filter(item => !status || item.status === status)
        .filter(item => !sourceType || item.source_type === sourceType)
        .filter(item => !riskLevel || item.risk_level === riskLevel)
        .map(enrichCollision)
        .filter(item => !keyword || [item.collision_no, item.mobile, item.union_id, item.incoming_name, item.source_business_no, item.mobile_customer?.customer_no, item.mobile_customer?.name, item.union_customer?.customer_no, item.union_customer?.name].some(value => String(value || '').toLowerCase().includes(keyword))))
    }
    if (path === '/customers') {
      const grade = config.params?.grade
      const keyword = String(config.params?.keyword || '').trim().toLowerCase()
      return ok(db.customers
        .filter(item => !grade || item.grade === grade)
        .filter(item => !keyword || [item.customer_no, item.name, item.mobile].some(value => String(value || '').toLowerCase().includes(keyword))))
    }
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
    if (path === '/leads/import-decrypted') {
      const records = Array.isArray(body.records) ? body.records : []
      if (!records.length) return fail('请上传包含有效数据的固定模板')
      if (records.length > 5000) return fail('单次最多导入 5000 条解密数据')
      const failures: Row[] = []
      const seen = new Set<string>()
      let successCount = 0
      records.forEach((record: Row, index: number) => {
        const orderNo = String(record.orderNo || '').trim()
        const mobile = String(record.mobile || '').replace(/\s+/g, '')
        const rowNumber = index + 2
        if (!orderNo) { failures.push({ rowNumber, orderNo, reason: '订单编号不能为空' }); return }
        if (!/^1\d{10}$/.test(mobile)) { failures.push({ rowNumber, orderNo, reason: '手机号格式错误' }); return }
        if (seen.has(orderNo)) { failures.push({ rowNumber, orderNo, reason: '文件内订单编号重复' }); return }
        seen.add(orderNo)
        const matched = db.leads.filter(item => item.source_type === 'DRAINAGE' && String(item.order_no || '') === orderNo)
        if (!matched.length) { failures.push({ rowNumber, orderNo, reason: '未找到对应引流线索订单' }); return }
        if (matched.length > 1) { failures.push({ rowNumber, orderNo, reason: '订单编号匹配到多条引流线索' }); return }
        const lead = matched[0]
        const now = new Date().toLocaleString('zh-CN', { hour12: false })
        Object.assign(lead, { mobile, decrypted_mobile: mobile, decrypted_at: lead.decrypted_at || now, updated_at: now })
        successCount++
      })
      save()
      return ok({ totalCount: records.length, successCount, failureCount: failures.length, failures })
    }
    const demandMined = path.match(/^\/leads\/(\d+)\/demand-mined$/)
    if (demandMined) {
      const lead = db.leads.find(item => item.id === Number(demandMined[1]))
      if (!lead) return fail('线索不存在')
      if (lead.demand_mined) return ok({ demandMinedAt: lead.demand_mined_at, demandMinedBy: lead.demand_mined_by, idempotent: true })
      const demandMinedAt = nowText()
      const demandMinedBy = currentUser().displayName
      Object.assign(lead, { demand_mined: true, demand_mined_at: demandMinedAt, demand_mined_by: demandMinedBy, updated_at: demandMinedAt })
      save()
      return ok({ demandMinedAt, demandMinedBy })
    }
    const wechatStatusChange = path.match(/^\/leads\/(\d+)\/wechat-status$/)
    if (wechatStatusChange) {
      const lead = db.leads.find(item => item.id === Number(wechatStatusChange[1]))
      if (!lead) return fail('线索不存在')
      const nextStatus = String(body.wechatStatus || '')
      const allowedStatuses = ['NOT_ADDED', 'WECOM_ADDED', 'PERSONAL_WECHAT_ADDED']
      if (!allowedStatuses.includes(nextStatus)) return fail('加微状态无效')
      const selectedCustomer = nextStatus === 'WECOM_ADDED' ? db.customers.find(item => item.customer_no === body.customerNo && item.status !== 'MERGED') : null
      if (nextStatus === 'WECOM_ADDED' && !selectedCustomer) return fail('所选客户不存在或已失效，请重新搜索选择')
      if (nextStatus === 'WECOM_ADDED' && !selectedCustomer?.created_at) return fail('所选客户缺少添加时间，暂不能关联')
      const nextWechatAddedAt = nextStatus === 'NOT_ADDED' ? '' : nextStatus === 'WECOM_ADDED' ? String(selectedCustomer?.created_at || '') : String(body.wechatAddedAt || '')
      if (nextStatus !== 'NOT_ADDED' && !nextWechatAddedAt) return fail('请选择加微时间')
      const currentStatus = lead.wechat_status === 'ADDED' ? 'WECOM_ADDED' : lead.wechat_status === 'DELETED' ? 'NOT_ADDED' : (lead.wechat_status || (lead.wechat_added_at ? (lead.wechat_method === 'PERSONAL_WECHAT' ? 'PERSONAL_WECHAT_ADDED' : 'WECOM_ADDED') : 'NOT_ADDED'))
      if (currentStatus === nextStatus && String(lead.wechat_added_at || '') === nextWechatAddedAt && (nextStatus !== 'WECOM_ADDED' || lead.customer_no === selectedCustomer?.customer_no)) return ok({ wechatStatus: currentStatus, idempotent: true })
      const statusLabels: Record<string, string> = { NOT_ADDED: '否', WECOM_ADDED: '已加企微', PERSONAL_WECHAT_ADDED: '已加个微' }
      const occurredAt = nowText()
      const operatorName = currentUser().displayName
      lead.wechat_status_history ||= []
      lead.wechat_status_history.unshift({ from_status: currentStatus, to_status: nextStatus, operator_name: operatorName, occurred_at: occurredAt, detail: `加微状态由“${statusLabels[currentStatus] || currentStatus}”修改为“${statusLabels[nextStatus]}”${selectedCustomer ? `，线索绑定至客户 ${selectedCustomer.customer_no}` : ''}` })
      Object.assign(lead, { wechat_status: nextStatus, wechat_method: nextStatus === 'WECOM_ADDED' ? 'WECOM' : nextStatus === 'PERSONAL_WECHAT_ADDED' ? 'PERSONAL_WECHAT' : '', wechat_added_at: nextWechatAddedAt, updated_at: occurredAt })
      if (selectedCustomer) Object.assign(lead, { customer_id: selectedCustomer.id, customer_no: selectedCustomer.customer_no, customer_name: selectedCustomer.name, customer_linked_at: lead.customer_linked_at || occurredAt })
      save()
      return ok({ wechatStatus: nextStatus, occurredAt, operatorName, customerNo: selectedCustomer?.customer_no || lead.customer_no || '' })
    }
    const validateMobileChange = path.match(/^\/leads\/(\d+)\/mobile-change\/validate$/)
    if (validateMobileChange) {
      const lead = db.leads.find(item => item.id === Number(validateMobileChange[1]))
      if (!lead) return fail('线索不存在')
      return ok(validateLeadMobileChange(lead, body.newMobile))
    }
    const mobileChange = path.match(/^\/leads\/(\d+)\/mobile-change$/)
    if (mobileChange) {
      const lead = db.leads.find(item => item.id === Number(mobileChange[1]))
      if (!lead) return fail('线索不存在')
      const result = validateLeadMobileChange(lead, body.newMobile)
      const requestedAction = String(body.action || '')
      if (!['AVAILABLE', 'MERGE_ALLOWED'].includes(result.status)) return fail(result.message)
      if ((result.status === 'AVAILABLE' && requestedAction !== 'CHANGE') || (result.status === 'MERGE_ALLOWED' && requestedAction !== 'MERGE')) return fail('手机号校验结果已变化，请重新校验后提交')
      const newMobile = String(body.newMobile || '').replace(/[\s-]/g, '').replace(/^\+86/, '')
      const oldMobile = String(lead.decrypted_mobile || lead.mobile || '')
      const occurredAt = nowText()
      const operatorName = currentUser().displayName
      lead.mobile_change_history ||= []
      if (result.status === 'AVAILABLE') {
        const currentCustomer = db.customers.find(item => item.status !== 'MERGED' && (item.customer_no === lead.customer_no || item.mobile === oldMobile))
        Object.assign(lead, { mobile: newMobile, decrypted_mobile: newMobile, updated_at: occurredAt })
        if (currentCustomer) Object.assign(currentCustomer, { mobile: newMobile, updated_at: occurredAt })
        lead.mobile_change_history.unshift({ action: 'CHANGE', old_mobile: oldMobile, new_mobile: newMobile, operator_name: operatorName, occurred_at: occurredAt, detail: `手机号由 ${maskMobile(oldMobile)} 变更为 ${maskMobile(newMobile)}；原手机号与操作记录已保留审计。` })
        save()
        return ok({ action: 'CHANGE', customerNo: currentCustomer?.customer_no || lead.customer_no || '' })
      }
      const currentCustomer = db.customers.find(item => item.status !== 'MERGED' && (item.customer_no === lead.customer_no || item.mobile === oldMobile))
      const targetCustomer = db.customers.find(item => item.status !== 'MERGED' && item.mobile === newMobile)
      const targetLead = db.leads.find(item => item.id !== lead.id && [item.decrypted_mobile, item.mobile].includes(newMobile))
      if (!targetCustomer && !targetLead) return fail('目标档案已变化，请重新校验')
      const targetCustomerNo = targetCustomer?.customer_no || targetLead?.customer_no || ''
      if (currentCustomer && targetCustomer && currentCustomer.id !== targetCustomer.id) {
        const gradePriority: Record<string, number> = { S: 4, A: 3, B: 2, C: 1, UNRATED: 0 }
        if ((gradePriority[currentCustomer.grade] || 0) > (gradePriority[targetCustomer.grade] || 0)) targetCustomer.grade = currentCustomer.grade
        if (!targetCustomer.union_id && currentCustomer.union_id) targetCustomer.union_id = currentCustomer.union_id
        db.leads.filter(item => item.customer_no === currentCustomer.customer_no).forEach(item => Object.assign(item, { customer_id: targetCustomer.id, customer_no: targetCustomer.customer_no, customer_name: targetCustomer.name, updated_at: occurredAt }))
        Object.assign(currentCustomer, { mobile: null, union_id: null, status: 'MERGED', merged_into_customer_no: targetCustomer.customer_no, merged_at: occurredAt, merged_by: operatorName })
        targetCustomer.merge_history ||= []
        targetCustomer.merge_history.unshift({ source_customer_no: currentCustomer.customer_no, source_mobile: maskMobile(oldMobile), merged_at: occurredAt, merged_by: operatorName, scope: ['线索', '问卷', '订单', '服务记录', '旅程日志'] })
      }
      Object.assign(lead, { mobile: newMobile, decrypted_mobile: newMobile, customer_id: targetCustomer?.id || targetLead?.customer_id || lead.customer_id, customer_no: targetCustomerNo || lead.customer_no, customer_name: targetCustomer?.name || targetLead?.customer_name || lead.customer_name, merged_into_lead_id: targetLead?.id || null, updated_at: occurredAt })
      lead.mobile_change_history.unshift({ action: 'MERGE', old_mobile: oldMobile, new_mobile: newMobile, operator_name: operatorName, occurred_at: occurredAt, detail: `同属一转负责人 ${lead.owner_name || result.current_profile.owner_name}，以 ${targetCustomerNo || '新手机号档案'} 为主档完成合并；原手机号 ${maskMobile(oldMobile)} 保留审计映射。` })
      save()
      return ok({ action: 'MERGE', customerNo: targetCustomerNo, mergedCustomerNo: currentCustomer?.customer_no || '' })
    }
    if (path === '/leads') {
      const now = new Date().toLocaleString('zh-CN', { hour12: false })
      const lead = { id: Math.max(0, ...db.leads.map(item => item.id)) + 1, lead_no: id('L'), order_no: '', order_status: 'NO_ORDER', name: body.name, mobile: body.mobile || '', original_mobile: body.mobile || '', decrypted_mobile: body.mobile || '', decrypted_at: body.mobile ? now : '', union_id: body.unionId || '', wechat_nickname: '', source_type: body.sourceType, lead_source: body.channelName, channel_name: body.channelName, third_party_product_id: body.thirdPartyProductId || '', first_product_name: '', product_remark: '', shop_name: '', paid_amount: 0, status: 'PENDING_ASSIGNMENT', lead_mark: 'VALID', follow_status: 'NOT_FOLLOWED', conversion_status: 'UNCONVERTED', owner_id: null, owner_name: '', owner_employee_no: '', customer_no: '', customer_name: '', entry_method: 'IMPORT', wechat_method: '', camp_name: '', sms_send_count: 0, created_at: now, remark: '' }
      db.leads.unshift(lead); save(); return ok({ id: lead.id })
    }
    const assign = path.match(/^\/leads\/(\d+)\/assign$/)
    if (assign) {
      const lead = db.leads.find(item => item.id === Number(assign[1])); const employee = db.employees.find(item => item.id === Number(body.employeeId))
      if (!lead || !employee) return fail('线索或目标员工不存在')
      Object.assign(lead, { owner_id: employee.id, owner_name: employee.name, owner_employee_no: employee.employee_no, status: 'ASSIGNED', assigned_at: new Date().toLocaleString('zh-CN', { hour12: false }) }); save(); return ok(null)
    }
    const wechat = path.match(/^\/leads\/(\d+)\/wechat-added$/)
    if (wechat) {
      const lead = db.leads.find(item => item.id === Number(wechat[1])); if (!lead) return fail('线索不存在')
      lead.status = 'WECHAT_ADDED'; lead.wechat_status = 'WECOM_ADDED'; lead.follow_status = 'FOLLOWING'; lead.wechat_method = 'WECOM'; lead.wechat_added_at = new Date().toLocaleString('zh-CN', { hour12: false }); lead.first_follow_at ||= lead.wechat_added_at; lead.union_id = body.unionId || lead.union_id || `union_demo_${lead.id}`; save(); return ok(null)
    }
    const convert = path.match(/^\/leads\/(\d+)\/convert$/)
    if (convert) {
      const lead = db.leads.find(item => item.id === Number(convert[1])); if (!lead) return fail('线索不存在')
      const customer = createCustomer({ ...lead, ownerName: lead.owner_name }); Object.assign(lead, { customer_id: customer.id, customer_no: customer.customer_no, customer_name: customer.name, customer_linked_at: new Date().toLocaleString('zh-CN', { hour12: false }) }); save(); return ok({ customerId: customer.id, customerNo: customer.customer_no })
    }
    const autoGrade = path.match(/^\/leads\/(\d+)\/auto-grade$/)
    if (autoGrade) {
      const lead = db.leads.find(item => item.id === Number(autoGrade[1])); if (!lead) return fail('线索不存在')
      if (!['S', 'A', 'B', 'C'].includes(body.grade)) return fail('自动评级结果无效')
      const candidate = { grade: body.grade, score: Number(body.score || 0), questionnaire_submission_id: body.questionnaireSubmissionId || '', rule_version: body.ruleVersion || 'V1.0', calculated_at: new Date().toLocaleString('zh-CN', { hour12: false }) }
      if (lead.grade_source === 'MANUAL' || lead.customer_no) {
        Object.assign(lead, { auto_grade_candidate: candidate, grade_difference_status: 'PENDING_REVIEW' })
        save(); return ok({ applied: false, reason: lead.grade_source === 'MANUAL' ? 'MANUAL_RESULT_PROTECTED' : 'EXISTING_CUSTOMER_PROTECTED', candidate })
      }
      Object.assign(lead, { previous_grade: effectiveLeadGrade(lead), lead_grade: body.grade, grade_source: 'QUESTIONNAIRE_AUTO', grade_score: candidate.score, questionnaire_submission_id: candidate.questionnaire_submission_id, grade_rule_version: candidate.rule_version, grade_changed_at: candidate.calculated_at })
      save(); return ok({ applied: true, grade: lead.lead_grade })
    }
    const changeGrade = path.match(/^\/leads\/(\d+)\/grade$/)
    if (changeGrade) {
      const lead = db.leads.find(item => item.id === Number(changeGrade[1])); if (!lead) return fail('线索不存在')
      if (!['S', 'A', 'B', 'C'].includes(body.grade)) return fail('线索等级无效')
      if (!String(body.reason || '').trim()) return fail('人工变更必须填写原因')
      const previousGrade = effectiveLeadGrade(lead)
      Object.assign(lead, { previous_grade: previousGrade, lead_grade: body.grade, grade_source: 'MANUAL', grade_change_reason: String(body.reason).trim(), grade_changed_by: currentUser().displayName, grade_changed_at: new Date().toLocaleString('zh-CN', { hour12: false }) })
      save(); return ok({ grade: lead.lead_grade, customerSynced: false, customerGradeProtected: Boolean(lead.customer_no) })
    }
    const changeCustomerGrade = path.match(/^\/customers\/(\d+)\/grade$/)
    if (changeCustomerGrade) {
      const customer = db.customers.find(item => item.id === Number(changeCustomerGrade[1])); if (!customer) return fail('客户不存在')
      if (!['S', 'A', 'B', 'C'].includes(body.grade)) return fail('客户等级无效')
      if (!String(body.reason || '').trim()) return fail('人工变更必须填写原因')
      const changedAt = new Date().toLocaleString('zh-CN', { hour12: false })
      const history = Array.isArray(customer.grade_history) ? customer.grade_history : []
      history.unshift({ from_grade: customer.grade || 'UNRATED', to_grade: body.grade, reason: String(body.reason).trim(), changed_by: currentUser().displayName, changed_at: changedAt })
      Object.assign(customer, { previous_grade: customer.grade || 'UNRATED', grade: body.grade, grade_source: 'CUSTOMER_MANUAL', grade_change_reason: String(body.reason).trim(), grade_changed_by: currentUser().displayName, grade_changed_at: changedAt, grade_history: history })
      save(); return ok({ grade: customer.grade, source: customer.grade_source })
    }
    const startCollision = path.match(/^\/customers\/collisions\/(\d+)\/start$/)
    if (startCollision) {
      const collision = db.collisionCases.find(item => item.id === Number(startCollision[1]))
      if (!collision) return fail('撞单案件不存在')
      if (collision.status !== 'PENDING') return fail(collision.status === 'RESOLVED' ? '案件已处理完成，不能重复领取' : '案件已被领取，请刷新后查看处理人')
      const operator = currentUser().displayName
      collision.status = 'PROCESSING'; collision.handler_name = operator; collision.started_at ||= nowText()
      collision.audit_logs ||= []; collision.audit_logs.unshift({ action: 'START', operator, occurred_at: nowText(), detail: '领取案件并开始人工核验。' })
      save(); return ok(enrichCollision(collision))
    }
    const resolveCollision = path.match(/^\/customers\/collisions\/(\d+)\/resolve$/)
    if (resolveCollision) {
      const collision = db.collisionCases.find(item => item.id === Number(resolveCollision[1]))
      if (!collision) return fail('撞单案件不存在')
      if (collision.status !== 'PROCESSING') return fail(collision.status === 'RESOLVED' ? '案件已处理完成，不能重复裁决' : '请先领取案件，再提交裁决')
      const resolutionType = String(body.resolutionType || '')
      const reason = String(body.reason || '').trim()
      if (!['MERGE_TO_MOBILE', 'MERGE_TO_UNION', 'KEEP_SEPARATE'].includes(resolutionType)) return fail('请选择有效的处理结论')
      if (reason.length < 8) return fail('处理依据至少填写 8 个字')
      if (!body.confirmed) return fail('请确认身份、订单和服务记录均已核验')
      const mobileCustomer = db.customers.find(item => item.id === collision.mobile_customer_id)
      const unionCustomer = db.customers.find(item => item.id === collision.union_customer_id)
      if (!mobileCustomer || !unionCustomer) return fail('候选客户档案缺失，请转异常中心')
      const beforeSnapshot = { mobile_customer: customerSnapshot(mobileCustomer), union_customer: customerSnapshot(unionCustomer) }
      let target: Row | null = null
      if (resolutionType === 'MERGE_TO_MOBILE') {
        target = mobileCustomer
        mobileCustomer.union_id = collision.union_id
        unionCustomer.union_id = null; unionCustomer.status = 'MERGED'; unionCustomer.merged_into_customer_no = mobileCustomer.customer_no
      } else if (resolutionType === 'MERGE_TO_UNION') {
        target = unionCustomer
        unionCustomer.mobile = collision.mobile
        mobileCustomer.mobile = null; mobileCustomer.status = 'MERGED'; mobileCustomer.merged_into_customer_no = unionCustomer.customer_no
      }
      const operator = currentUser().displayName
      Object.assign(collision, { status: 'RESOLVED', handler_name: collision.handler_name || operator, handled_at: nowText(), resolution_type: resolutionType, resolution_reason: reason, target_customer_id: target?.id || null, resolution_snapshot: beforeSnapshot })
      collision.audit_logs ||= []
      collision.audit_logs.unshift({ action: 'RESOLVE', operator, occurred_at: collision.handled_at, detail: resolutionType === 'KEEP_SEPARATE' ? '确认不同自然人，保留两个独立客户档案。' : `确认同一自然人，主档保留为 ${target?.customer_no}；被合并档案保留历史映射。` })
      save(); return ok(enrichCollision(collision))
    }
    if (path === '/customers') { const customer = createCustomer(body); return ok({ id: customer.id, customerNo: customer.customer_no, created: !customer._reused, matchBy: customer._match_by }) }
    if (path === '/system/organizations') {
      const parent = db.organizations.find(item => item.id === Number(body.parent_id))
      const allowedChild: Record<string, string> = { COMPANY: 'DEPARTMENT', DEPARTMENT: 'GROUP_TEAM' }
      if (parent && allowedChild[parent.type] !== body.type) return fail('组织层级必须为公司 → 部门 → 小组')
      if (parent?.type === 'GROUP_TEAM') return fail('小组节点不能新增下级')
      const organization = { ...body, code: organizationCode(body.type), id: Math.max(0, ...db.organizations.map(item => item.id)) + 1, employee_count: 0, created_at: new Date().toLocaleString('zh-CN', { hour12: false }) }
      db.organizations.push(organization); save(); return ok(organization)
    }
    if (path === '/system/employees') {
      const organization = db.organizations.find(item => item.id === Number(body.organization_id))
      if (!organization || organization.status !== 'ACTIVE' || !['DEPARTMENT', 'GROUP_TEAM'].includes(organization.type)) return fail('主组织必须是启用的部门或小组')
      const mobile = String(body.mobile || '').trim()
      if (!/^1[3-9]\d{9}$/.test(mobile)) return fail('请输入有效的 11 位手机号')
      if (db.employees.some(item => item.mobile === mobile)) return fail('该手机号已关联员工')
      const email = String(body.email || '').trim().toLowerCase()
      if (email && db.employees.some(item => String(item.email || '').toLowerCase() === email)) return fail('该邮箱已关联员工')
      const nextNo = Math.max(0, ...db.employees.map(item => Number(String(item.employee_no || '').replace(/\D/g, '')) || 0)) + 1
      const initialPassword = body.create_login ? `Hs@${crypto.randomUUID().slice(0, 8)}` : ''
      const employee = { id: Math.max(0, ...db.employees.map(item => item.id)) + 1, employee_no: `B${String(nextNo).padStart(6, '0')}`, name: String(body.name).trim(), legal_name: String(body.legal_name).trim(), mobile, mobile_masked: `${mobile.slice(0, 3)}****${mobile.slice(-4)}`, email, organization_id: Number(body.organization_id), position_name: String(body.position_name).trim(), role_codes: body.role_codes || ['EMPLOYEE'], wecom_user_id: '', employment_status: 'ACTIVE', account_status: body.create_login ? body.account_status || 'ACTIVE' : 'INACTIVE', source: 'MANUAL', created_at: new Date().toLocaleString('zh-CN', { hour12: false }) }
      db.employees.unshift(employee); organization.employee_count = Number(organization.employee_count || 0) + 1; save(); return ok({ ...employee, initial_password: initialPassword })
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
