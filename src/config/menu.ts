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
      { name: '线索概览', path: '/leads/analytics', description: '作为合数BOSS默认首页，按引流期次概览线索从加微、问卷、直播到成交退款的全链路经营表现。', features: ['日期/期次筛选', '店铺筛选', 'IP渠道筛选', 'IP名称筛选', '期次经营报表', '转化漏斗', '渠道分析', 'IP渠道分析', '商品分析', 'GMV与退款', '团队效能', '指标口径', '关键指标下钻', '本期报表导出'] }
    ]
  },
  {
    name: '线索中心', code: 'LEAD', children: [
      { name: '引流线索', path: '/leads/drainage', description: '引流业务线索列表，统一处理订单匹配、状态流转、所属期次与批量任务。', features: ['详情', '旅程', '变更期次', '标记', '改派负责人', '批量分配', '批量变更期次', '短信群发', '按平台顺序同步订单', '导入解密数据', '导出非解密数据'] },
      { name: '引流期次', path: '/leads/periods', description: '维护线索接量、转化和追单的运营期次，支持按固定周期批量生成、启停、引用校验和日志追溯。', features: ['期次列表', '接量期/转化期/追单期', '按月批量创建', '按年批量创建', '固定周期天数', '编辑', '启停', '活码引用校验', '业务数据校验', '日志'] },
      { name: '线索配置', path: '/leads/rules', description: '分类管理活码分配、营期名单流转和问卷等级规则，并支持试算、冲突检测和版本发布。', features: ['规则分类', '活码分配规则', '营期名单流转规则', '等级规则', '问卷指标与分数区间', '规则试算', '冲突检测', '发布停用', '版本回退'] },
      { name: '活码管理', path: '/leads/qr-codes', description: '按分组及可选的引流期次、班级、接量日期管理员工活码、标签与轮询容量。', features: ['活码分组', '列表', '新增', '编辑', '详情', '创建人', '企微标签', '内部标签', '所属期次（选填）', '所属班级（选填）', '接量日期区间（选填）', '员工轮询上限', '启停', '下载'] },
      { name: '渠道管理', path: '/leads/channels', description: '通过渠道列表和数据分析两个页签，统一管理渠道主数据、归因规则及转化效果。', features: ['渠道列表', '数据分析', '新增', '编辑', '详情', '启停', '渠道/时间/组织筛选', '转化漏斗', '下钻', '导出'] },
      { name: '店铺管理', path: '/leads/stores', description: '按平台类型和第三方店铺ID统一管理店铺、负责人、访问权限及经营归因。', features: ['店铺列表', '平台类型', '店铺名称', '第三方店铺ID', '店铺负责人', '创建/更新/启停日期', '新增', '编辑', '启停', '店铺权限'] },
      { name: 'IP列表', path: '/leads/ip', description: '管理老师IP主档、IP大类与稳定编码、带编号的归因渠道及其关联商品和投放平台。', features: ['IP名称（老师名称）', 'IP大类（字典）', '大类编码', 'IP渠道', '渠道编号', '自增IP编号', '关联商品', '商品列表下钻', '关联平台'] },
      { name: '商品列表', path: '/leads/products', description: '查看第三方商品、店铺归属、活码分配状态和IP关联，支持全部平台或指定平台顺序同步、筛选、导出与修改备注。', features: ['创建时间', '更新时间', '商品名称', '商品ID', '商品状态', '是否分配活码', '店铺名称', '店铺类型', '关联IP', '同步所有商品', '分平台同步', '同步任务记录', '修改备注'] },
      { name: '短信配置', path: '/leads/sms-config', description: '按商品与活码配置购买后、授权后和手动提醒策略；短信签名、模板及发送回执复用业务配置中的短信管理。', features: ['短信分组', '商品绑定', '活码绑定', '购买后提醒', '授权后提醒', '手动提醒', '批量设置', '新增', '编辑', '启停'] }
    ]
  },
  {
    name: '客户中心', code: 'CUSTOMER', children: [
      { name: '客户总览', path: '/customers/overview', description: '在当前数据权限范围内查看客户规模、生命周期、等级、来源与添加方式分布，并下钻客户明细。', features: ['组织筛选', '来源筛选', '等级筛选', '添加方式筛选', '生命周期分布', '负责人负载', '进入明细'] },
      { name: '客户列表', path: '/customers/list', description: '以唯一客户编码管理家长客户档案；区分首次来源和添加方式，建档时继承线索等级，之后可在客户操作中独立调整并保留历史。', features: ['查看360档案', '添加方式', '首次来源', '负责人', '标签', '继承线索等级', '编辑客户等级', '等级变更历史'] },
      { name: '撞单管理', path: '/customers/collisions', description: '手机号与 UnionID 分别命中不同客户时阻断自动建档，通过证据核验完成身份划归并保留完整审计链路。', features: ['冲突自动建案', '待处理队列', '强身份证据对比', '领取处理', '合并至指定主档', '确认不同人', '审计记录', '历史保留'] },
      { name: '标签管理', path: '/customers/tags', description: '统一管理系统、BOSS人工、企业微信、外部SCRM、规则和AI标签，并按来源隔离编辑权限。', features: ['标签库', '标签组', '自动规则', '外部标签映射', '标签治理', '新增BOSS标签', '编辑', '停用', '覆盖统计', '历史保留'] }
    ]
  },
  {
    name: '问卷管理', code: 'QUESTIONNAIRE', children: [
      { name: '问卷列表', path: '/questionnaires/list', description: '统一管理问卷结构、企微标签、二维码、答卷与线索评级输入。', features: ['列表', '新建编辑', '题目分组', '二维码', '答卷统计', '数据导出', 'SABC评级输入'] }
    ]
  },
  {
    name: '业务配置', code: 'BUSINESS_CONFIG', children: [
      { name: '异常中心', path: '/system/exceptions', description: '统一展示企微回调、数据同步和核心业务异常。', features: ['查询', '详情', '重试', '忽略', '转人工', '关闭'] },
      { name: '短信管理', description: '复用历史短信服务，统一管理短信签名、模板和发送结果。', features: ['签名管理', '短信模板', '发送结果'], children: [
        { name: '签名管理', path: '/system/sms/signatures', description: '管理短信签名。', features: ['新增','审核状态','启停'] },
        { name: '短信模板', path: '/system/sms/templates', description: '管理短信模板。', features: ['新增','变量校验','启停'] },
        { name: '发送结果', path: '/system/sms/results', description: '查询供应商回执和送达结果。', features: ['查询','详情'] }
      ] },
      { name: '应用管理', path: '/system/applications', description: '管理接入合数BOSS的外部应用。', features: ['新增', '编辑', '启停', '连接校验', '凭证轮换'] },
      { name: '配置管理', description: '管理企微、小程序、店铺和落地页配置。', features: ['新增', '编辑', '校验', '发布', '启停', '版本回退'], children: [
        { name: '企微配置', path: '/system/configurations/wecom', description: '维护企业微信接入配置。', features: ['校验','发布','轮换'] },
        { name: '小程序配置', path: '/system/configurations/mini', description: '维护小程序接入配置。', features: ['校验','发布','轮换'] },
        { name: '店铺配置', path: '/system/configurations/stores', description: '维护店铺和组织关联。', features: ['新增','编辑','启停'] },
        { name: '落地页配置', path: '/system/configurations/landing', description: '维护落地页及回传配置。', features: ['新增','校验','启停'] }
      ] },
      { name: '微信客服管理', path: '/system/wecom-customer-service', description: '管理企业微信客服接入。', features: ['客服列表', '客服事件消息', '客服消息'] }
    ]
  },
  {
    name: '系统管理', code: 'SYSTEM', children: [
      { name: '组织管理', path: '/system/organizations', description: '管理公司、部门和小组三级组织树。', features: ['查询', '新增下级', '编辑', '移动', '启停', '删除拦截', '导出'] },
      { name: '员工管理', path: '/system/employees', description: '统一维护员工身份、组织、权限和企业微信绑定，账号与企微身份一对一，同步过程全程可追踪。', features: ['新增员工并开通企微', '账号企微唯一绑定', '换绑历史', '同步记录', '同步至企微', '每日差异扫描', '业务角色绑定', '数据岗位绑定', '启停'] },
      { name: '岗位管理', path: '/system/positions', description: '配置本人、小组、部门、跨部门及公司级数据可见范围。', features: ['岗位列表', '数据范围', '指定组织', '员工关联', '影响预览', '启停'] },
      { name: '角色管理', path: '/system/roles', description: '按运营、客服、规划师等业务角色配置菜单、操作和字段权限。', features: ['角色列表', '菜单授权', '操作授权', '字段脱敏', '关联员工', '影响预览'] },
      { name: '菜单管理', path: '/system/menus', description: '配置合数BOSS动态菜单、路由和操作权限。', features: ['目录', '页面', '操作权限', '路由', '排序', '状态'] },
      { name: '系统参数', path: '/system/parameters', description: '作为全局设置中心，统一维护影响合数BOSS运行行为的参数、密钥引用和版本记录。', features: ['参数分组', '类型校验', '敏感值保护', '新增', '编辑', '启停', '版本历史', '审计'] },
      { name: '字典管理', path: '/system/dictionaries', description: '统一管理业务枚举类型与字典项，保证页面展示、接口值和历史数据口径一致。', features: ['字典类型', '字典项', '排序', '显示标签', '新增', '编辑', '启停', '历史兼容'] },
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
