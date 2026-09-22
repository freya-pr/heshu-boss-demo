# API 接口规范

状态：待联调双方补齐具体接口。

## 统一约定

- 路径采用 `/api/v1/` 版本前缀；
- 明确认证方式、请求参数、响应结构、错误码和追踪号；
- 写接口支持幂等键；
- 分页、时间、金额、枚举和脱敏格式统一；
- 对外接口维护 OpenAPI 文档及示例；
- 破坏性修改必须提供兼容期。

## 首期接口域

- 统一身份、组织员工和权限；
- 企业微信扫码登录、活码及回调；
- 旧 SCRM 历史活码和客户数据同步；
- CRM 线索、客户、公海、跟进、标签和商机；线索中心IP主档、渠道编号、第三方商品及IP商品关联；
- 问卷导入、客户关联、规则试算和定级；
- 工作台指标、系统入口和统一待办。
- 系统参数查询、发布、版本历史及缓存失效；
- 字典类型、字典项维护与业务端启用项/历史项解析。

## 系统参数接口基线

- `GET /api/v1/system/parameters`：按关键词、分组、类型和状态查询；敏感值仅返回掩码。
- `POST /api/v1/system/parameters`：创建参数；参数键全局唯一，参数键和类型创建后不可修改。
- `PUT /api/v1/system/parameters/{id}`：修改参数值、状态和说明；服务端按类型校验并递增版本。
- 所有写操作必须校验维护权限、记录变更前后值、操作者和原因，并触发对应缓存失效。

## 字典接口基线

- `GET /api/v1/system/dictionaries`：查询字典类型及字典项数量。
- `POST /api/v1/system/dictionaries`、`PUT /api/v1/system/dictionaries/{id}`：维护字典类型；编码创建后不可修改。
- `GET /api/v1/system/dictionaries/{id}/items`：管理端查询全部状态；业务端默认只取启用项，历史解析可取停用项。
- `POST /api/v1/system/dictionaries/{id}/items`、`PUT /api/v1/system/dictionary-items/{itemId}`：维护标签、稳定项值、排序、颜色和状态；项值创建后不可修改或复用。

## 企业微信员工与账号绑定接口基线

- `POST /api/v1/system/wecom/import-baseline`：只读取业务确认后的企业微信组织通讯录进入暂存区；未经确认的数据源不得写入该批次。
- `GET /api/v1/system/wecom/reconciliation`：按 `CorpID + UserID`、手机号和组织路径输出企微与合数BOSS差异。
- `POST /api/v1/system/wecom-bindings`：建立账号与企微身份绑定；服务端必须同时校验账号未绑定其他生效企微身份、该 `CorpID + UserID` 未绑定其他账号。
- `POST /api/v1/system/wecom-bindings/{id}/rebind`：执行换绑；必须在同一事务内归档旧关系、校验双向唯一性并建立新关系，禁止直接覆盖。
- `DELETE /api/v1/system/wecom-bindings/{id}`：解除当前绑定并记录操作者、时间和原因；解绑不删除历史身份。
- 重复账号或重复企微身份统一返回业务冲突码 `WECOM_BINDING_CONFLICT`，不得以最后写入覆盖原关系。

## 企业微信成员开通接口基线

- `POST /api/v1/system/wecom-provision-tasks`：为指定员工发起“查询成员—创建或绑定—发送邀请”任务；必须携带幂等键，且仅在自有系统主控开启时可用。
- `GET /api/v1/system/wecom-provision-tasks/{taskId}`：查询当前步骤、创建结果、邀请结果、激活状态、错误码和重试次数。
- `POST /api/v1/system/wecom-provision-tasks/{taskId}/retry-invite`：仅对已创建但邀请失败/超时的成员重发邀请，不重复调用创建成员接口。
- `POST /api/v1/system/wecom-provision-tasks/{taskId}/confirm-existing`：手机号命中已存在且未绑定的企微成员时，由有权限管理员确认建立绑定。
- 创建前必须校验员工在职、账号启用、手机号、企微部门映射及目标外部身份唯一性；同一账号允许已有其他企微绑定，目标 `CorpID + UserID` 命中其他账号时返回 `WECOM_BINDING_CONFLICT`。
- 企微创建成功但本地保存失败时返回可补偿状态 `WECOM_PROVISION_RECONCILING`，后台按请求号、UserID和手机号补建映射，禁止再次盲目创建。
- “创建成功”不得直接返回“已激活”；激活状态由企微回调或对账更新，回调按外部事件号幂等。
