export interface MenuLeaf {
  name: string
  path?: string
  description: string
  features: string[]
  children?: MenuLeaf[]
}

export interface MenuGroup {
  name: string
  code: string
  children: MenuLeaf[]
}

export const v1Menus: MenuGroup[] = [
  {
    name: '首页', code: 'HOME', children: [
      { name: '首页', path: '/dashboard', description: '合数BOSS 默认首页，集中展示待办、核心指标和异常提醒。', features: ['待办', '核心指标', '异常提醒', '快捷入口'] }
    ]
  },
  {
    name: '线索中心', code: 'LEAD', children: [
      { name: '数据分析', path: '/leads/analytics', description: '分析线索从加微、问卷、直播到成交退款的全链路经营表现。', features: ['营期/日期/渠道/团队筛选', '转化漏斗', 'GMV与退款', '团队效能', '指标口径', '下钻与导出'] },
      { name: '引流线索', path: '/leads/drainage', description: '引流业务线索列表，使用公共主模型和引流扩展字段。', features: ['导入', '同步', '新增', '编辑', '无效', '跟进', '导出', '批量分配'] },
      { name: '线索配置', path: '/leads/rules', description: '按线索类型、地区、渠道、员工和业务维度管理分配规则。', features: ['新增规则', '规则试算', '发布', '版本回退'] },
      { name: '活码管理', path: '/leads/qr-codes', description: '按营期、班级和接量日期管理员工活码及轮询容量。', features: ['列表', '新增', '编辑', '详情', '所属营期', '所属班级（选填）', '接量日期区间', '员工轮询上限', '启停', '下载'] },
      { name: '渠道管理', path: '/leads/channels', description: '管理渠道基础信息和线索归因规则。', features: ['新增', '编辑', '详情', '启停'] },
      { name: '渠道分析', path: '/leads/channel-analysis', description: '分析渠道从线索到客户的转化效果。', features: ['渠道筛选', '时间筛选', '组织筛选', '下钻', '导出'] },
      { name: '店铺管理', path: '/leads/stores', description: '管理店铺、主体、渠道及线索来源映射。', features: ['列表', '新增', '编辑', '变更', '权限'] },
      { name: 'IP 管理', path: '/leads/ip', description: '管理业务 IP、品牌归属及线索来源映射。', features: ['列表', '新增', '编辑', '启停'] }
    ]
  },
  {
    name: '客户中心', code: 'CUSTOMER', children: [
      { name: '客户总览', path: '/customers/overview', description: '客户经营数据概览。', features: ['组织筛选', '来源筛选', '等级筛选', '归属筛选', '进入明细'] },
      { name: '客户列表', path: '/customers/list', description: '以唯一客户编码管理身份和客户档案。', features: ['查看', '编辑', '身份补录', '负责人', '标签', '跟进', '商机关联'] },
      { name: '跟进记录', path: '/customers/follow-ups', description: '客户跟进时间轴和待办。', features: ['新增跟进', '跟进结果', '下次跟进', '查看历史'] },
      { name: '标签管理', path: '/customers/tags', description: '管理客户标签及规则。', features: ['新增', '编辑', '停用', '手动打标', '规则打标', '历史'] },
      { name: '等级管理', path: '/customers/grades', description: '配置 S/A/B/C 等级及问卷指标评分规则。', features: ['等级定义', '问卷指标', '评分规则', '试算', '发布', '版本历史'] },
      { name: '商机管理', path: '/customers/opportunities', description: '管理基础商机、阶段、负责人和状态。', features: ['新增', '编辑', '负责人', '阶段', '状态', '跟进'] },
      { name: '离职继承', path: '/customers/inheritance', description: '将离职员工名下客户等业务数据移交给明确继承人。', features: ['指定继承人', '范围预览', '执行', '失败补偿', '反向恢复'] }
    ]
  },
  {
    name: '订单中心', code: 'ORDER', children: [
      { name: '正式课订单', path: '/orders/formal', description: '正式课程订单列表和客户关联。', features: ['列表', '详情', '客户关联', '产品关联', '负责人', '支付状态'] },
      { name: '诊断订单', path: '/orders/diagnosis', description: '诊断类订单列表及问卷、诊断服务关联。', features: ['列表', '详情', '客户关联', '问卷关联', '诊断服务'] }
    ]
  },
  {
    name: '交付中心', code: 'DELIVERY', children: [
      { name: '营期管理', path: '/delivery/periods', description: '管理营期基础信息并供分配、活码和问卷规则引用。', features: ['列表', '新增', '编辑', '启停', '规则引用'] },
      { name: '班级管理', path: '/delivery/classes', description: '管理班级、营期及客户关系。', features: ['列表', '新增', '编辑', '营期关联', '客户关联'] }
    ]
  },
  {
    name: '问卷管理', code: 'QUESTIONNAIRE', children: [
      { name: '问卷列表', path: '/questionnaires/list', description: '统一管理问卷、答卷及线索/客户关联。', features: ['详情', '发送', '回收', '同步', '答卷', '对象关联', '异常处理'] }
    ]
  },
  {
    name: '系统管理', code: 'SYSTEM', children: [
      { name: '组织管理', path: '/system/organizations', description: '管理公司、部门和小组三级组织树。', features: ['查询', '新增下级', '编辑', '移动', '启停', '删除拦截', '导出'] },
      { name: '员工管理', path: '/system/employees', description: '管理自有员工主数据及企微/飞书外部身份。', features: ['飞书初始化', '企微/飞书同步', '编辑', '启停', '离职触发'] },
      { name: '角色管理', path: '/system/roles', description: '管理合数BOSS菜单、操作、字段和数据权限。', features: ['角色列表', '菜单授权', '操作授权', '字段脱敏', '数据范围', '影响预览'] },
      { name: '菜单管理', path: '/system/menus', description: '配置合数BOSS动态菜单、路由和操作权限。', features: ['目录', '页面', '操作权限', '路由', '排序', '状态'] },
      { name: '异常中心', path: '/system/exceptions', description: '统一展示企微回调、数据同步和核心业务异常。', features: ['查询', '详情', '重试', '忽略', '转人工', '关闭'] },
      { name: '短信管理', description: '复用历史短信服务配置和发送结果。', features: ['下单短信', '签名', '短信模板', '发送结果'], children: [
        { name: '下单短信', path: '/system/sms/orders', description: '查询短信发送任务。', features: ['查询','详情'] },
        { name: '签名管理', path: '/system/sms/signatures', description: '管理短信签名。', features: ['新增','审核状态','启停'] },
        { name: '短信模板', path: '/system/sms/templates', description: '管理短信模板。', features: ['新增','变量校验','启停'] },
        { name: '发送结果', path: '/system/sms/results', description: '查询供应商回执和送达结果。', features: ['查询','详情'] }
      ] },
      { name: '应用管理', path: '/system/applications', description: '管理接入合数BOSS的外部应用。', features: ['新增', '编辑', '启停', '连接校验', '凭证轮换'] },
      { name: '群机器人', path: '/system/group-bots', description: '复用历史群机器人服务。', features: ['配置', '测试', '启停', '调用日志'] },
      { name: '配置管理', description: '管理企微、小程序、店铺和落地页配置。', features: ['新增', '编辑', '校验', '发布', '启停', '版本回退'], children: [
        { name: '企微配置', path: '/system/configurations/wecom', description: '维护企业微信接入配置。', features: ['校验','发布','轮换'] },
        { name: '小程序配置', path: '/system/configurations/mini', description: '维护小程序接入配置。', features: ['校验','发布','轮换'] },
        { name: '店铺配置', path: '/system/configurations/stores', description: '维护店铺和组织关联。', features: ['新增','编辑','启停'] },
        { name: '落地页配置', path: '/system/configurations/landing', description: '维护落地页及回传配置。', features: ['新增','校验','启停'] }
      ] },
      { name: '微信客服管理', path: '/system/wecom-customer-service', description: '管理企业微信客服接入。', features: ['客服列表', '客服事件消息', '客服消息'] },
      { name: '支付管理', path: '/system/payments', description: '管理历史支付服务配置和退款凭据。', features: ['支付配置', 'SM2 密钥', '连接测试', '默认切换', '退款凭据'] },
      { name: '日志查询', path: '/system/logs', description: '查询登录、操作、权限、配置和接口日志。', features: ['查询', '详情', '审批导出', '归档'] },
      { name: '地区管理', path: '/system/regions', description: '管理国家、省、市、区县标准地区树。', features: ['导入', '新增', '编辑', '启停', '差异更新'] }
    ]
  }
]

export const menuLeaves = v1Menus.flatMap(group => {
  const flatten=(items:MenuLeaf[]):any[]=>items.flatMap(item=>item.children?.length?flatten(item.children):[{...item,groupName:group.name,groupCode:group.code}])
  return flatten(group.children)
})
export const menuByPath = new Map(menuLeaves.map(item => [item.path, item]))
