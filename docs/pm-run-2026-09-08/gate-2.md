# Gate 2：规格与交接草稿确认

状态：P3/P4已完成；独立复核PASS，见review-gate-2.md。本轮用户“以上五项通过”已确认全部五项；进入最终封存准备，Gate 3待确认。

## 一页摘要

[CONSTRUCTED] 同一整合PRD已更新为v1.5，旧v1.4原字节归档；开发投影包含规格、实施顺序、数据模型、四份接口约定、需求/场景JSON和17项开放问题。[L1: p3_product_spec.md；p4_handoff_package.md]

[CALCULATED] 本轮保持42条要求、39组、124条分支；逐字段检查正文与JSON一致、AC双向对应、实施依赖无环。场景定义独立复核以coverage-review.json为准；执行状态均not_run。[L1: mechanical-checks.json；handoff/acceptance-scenarios.json]

[FOUND] 多文件混析完成，ZIP未完成且不检查；原型真实接入、国网关系策略、U9与图册映射仍需验证。[L0: evidence/user-decisions.md D03；L1: p1_research_base.md F06/F07/F10]

## 关键结论与依赖

| 结论 | 依据 | 尚存依赖 |
| --- | --- | --- |
| [CONSTRUCTED] 财务签发、销售提供、董事长调价后财务复核 | [L0: evidence/user-decisions.md D05/D07/D08] | 正式阈值、毛利与舍入制度 |
| [CONSTRUCTED] BOM主表23列、平行挂板9列，采购量与每套量分开 | [L1: p1_research_base.md F09/F13；PRD第5章] | 生产必填、项目分配与映射 |
| [CONSTRUCTED] 解析执行、关系审查、业务确认分别记状态 | [L1: handoff/contracts/parsing.md] | 国网样本联调与服务端持久化 |
| [CONSTRUCTED] 39组定义审查可复算 | [L1: handoff/measure-definition-coverage.py] | 不代表124条功能测试执行通过 |
| [FOUND] 17项继续accepted-open | [L0: evidence/user-decisions.md D08] | 对应生产配置/联调/验收仍受阻 |

## 决策简报

[CONSTRUCTED] 本轮修改把之前已认可的业务方向集中到同一PRD，补齐当前解析能力和接口事实；规格与机器数据逐项一致。最主要的风险仍是生产输入和实际实现之间的距离：原型不能证明真实权限、完整图册映射和报价格式通过。建议接受当前规格与开发交接草稿，进入最终跨文档核对与封存准备。确认后仍需Gate 3批准最终字节版本，当前design-gate.approved=false。若不同意某条规则，可按编号修改或阻止继续；开放事项责任人与关闭问题保留在open-items.json。[L1: p3_product_spec.md；handoff/HANDOFF.md]

## 五项确认

1. 以同一整合PRD v1.5为本轮规格：四路径检索、并行确认、财务签发、销售提供和董事长单项调价/财务复核保持现有设计？
2. 接受BOM参考结构、草稿/正式门禁及数量口径；生产必填和图册映射继续由对应负责人确认？
3. 接受解析接口边界：多文件混析完成，ZIP未完成且本轮不检查；原型接入与国网关系策略单独验证？
4. 接受39组124分支的验收定义及17项生产事项保持开放，文档覆盖通过不等于功能或生产验收通过？
5. 接受当前standalone交接草稿，进入最终一致性与封存检查，再单独提交Gate 3确认？

可以回复“以上五项通过”，或按编号提出修改、阻止继续或升级裁决。
