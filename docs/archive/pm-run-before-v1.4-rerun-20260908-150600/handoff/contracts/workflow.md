# 业务命令接口约定

[CONSTRUCTED] 本文件为拟建业务接口，命令名用于约束行为，实际HTTP路由由工程实现确定。所有请求从会话识别人员，拒绝信任客户端自填role；要求project_id、object_id、expected_revision、idempotency_key。成功返回新版本和事件ID，失败返回原因及当前版本；客户端不能在失败时推进阶段。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

| 命令 | 业务输入 | 成功输出 | 门禁/失败 |
| --- | --- | --- | --- |
| `assignRisk` | 风险ID、目标人员、原因 | 唯一负责人及指派事件 | [CONSTRUCTED] 目标停用/无项目权限拒绝；不解除阻断 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |
| `resolveRisk` | 结果值、证据、规则适用版本 | 待确认或已解决及有效版本 | [CONSTRUCTED] 非负责人/授权人、缺必要值、旧版本拒绝 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |
| `setRiskNotApplicable` | 规则、对象、依据、确认人 | 不适用判定及记录 | [CONSTRUCTED] 无权限或无依据拒绝；相关条件变更重评 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |
| `confirmSales / confirmTechnical` | 包范围版本；需求/各技术版本引用 | 各自独立确认记录 | [CONSTRUCTED] 范围缺项、未解适用阻断、旧版本拒绝 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |
| `submitFinance` | 双方确认ID和纳入项集合 | 财务阶段及消费的版本引用 | [CONSTRUCTED] 任何单方/旧版/未解核价前阻断拒绝 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |
| `savePricing` | 价格、成本、税费、单位、期效、来源和计算规则版本 | 不可变保存版本/核价草稿 | [CONSTRUCTED] 非法数/口径缺失不可通过审核；允许明确未完整的草稿保存但标不可审核 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |
| `submitApproval / decideApproval` | 价格版本、政策版本、触发原因；通过/退回及意见 | 审批记录、下一阶段 | [CONSTRUCTED] 未保存价格、旧政策/旧状态、无意见拒绝 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |
| `issueQuote` | 当前全部有效版本和模板ID | 唯一快照、已出具状态及待执行导出任务 | [CONSTRUCTED] 审批过期、总额不平、模板越权拒绝 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |
| `reviseQuote` | 父报价ID、变更类型、原因 | 新版本和需复审的对象集合 | [CONSTRUCTED] 直接写原快照拒绝 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |

[CONSTRUCTED] 所有调用记录失败原因但不泄露其他项目的受限数据。失败码语义至少区分权限拒绝、版本冲突、门禁未满足、输入无效、依赖不可用；工程实现可选择具体码，验收按语义与数据未改变核对。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]
