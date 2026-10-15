# 实施顺序与验收出口

[CONSTRUCTED] 这是依赖顺序和交付单元划分，不是本轮已执行的工程计划。合同三阶段里程碑保留；具体日期由正式项目排期确定。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

| 单元 | 依赖 | 交付内容/不变量 | 阶段 |
| --- | --- | --- | --- |
| SL-01 | 无 | [CONSTRUCTED] 角色和字段数据范围、字典及主库版本稳定；管理员不自带审批权 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] | 1 |
| SL-02 | SL-01 | [CONSTRUCTED] 保留文件、来源和原始项；部分失败或重试不能丢项和重复造项 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] | 1 |
| SL-03 | SL-01, SL-02 | [CONSTRUCTED] 问题分配不解除阻断；销售技术确认必须对应当前版本 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] | 1 |
| SL-04 | SL-01, SL-02, SL-03 | [CONSTRUCTED] 四路径召回不等于确认；导地线/电压/类别与图册条件核对，BOM空值不猜填 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] | 1 |
| SL-05 | SL-03, SL-04 | [CONSTRUCTED] 有效技术结果才能核价，定价可复算；金额审批不解除技术阻断 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] | 1 |
| SL-06 | SL-05 | [CONSTRUCTED] 仅有效审核版本可出具；旧快照不覆盖，对外字段不含成本利润 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] | 1 |
| SL-07 | SL-01, SL-02, SL-03, SL-04, SL-05, SL-06 | [CONSTRUCTED] 只读、权限、备份、并发和幂等证据齐备才能完成对应正式验收 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] | 跨阶段 |
| SL-08 | SL-05, SL-07 | [CONSTRUCTED] 成本、材料价与报价比对口径和来源可追踪，两个覆盖率与命中率不混同 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] | 2 |
| SL-09 | SL-04, SL-07 | [CONSTRUCTED] POC书面通过后才启动正式出图，全自动计分与人工复核分开 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] | 3 |

[CONSTRUCTED] SL-07中的前置工作（只读接口授权、部署资源、样本准备）应从项目开始即推进；其依赖SL-01至06表示端到端验收出口，不能解读为等一期代码完成后才申请资源。SL-08、SL-09保留各自阶段依赖；SC-37的开工输入在对应阶段前检查，移交在阶段出口检查。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

[CONSTRUCTED] 每个单元可以在模拟接口下独立演示，但只有全部正式接口及验收前置满足才可宣布正式交付。原型已有行为作为交互参考，源码差异列表需要在工程任务中处理，本轮不改产品代码。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]
