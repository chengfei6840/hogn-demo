# 案例约束

FIXTURE, no downstream configured。contract drift not checked。

[FOUND] 固定范围为国网金具串，四路径三主一辅；财务签发、销售提供，董事长可审批阶段单项调价；多文件混析完成、ZIP未完成不检查。[L0: ../evidence/user-decisions.md D03至D08]

[CONSTRUCTED] 不变量：缺关键技术条件不能采用；审批不解除技术风险；等待补充保留阻断；旧快照不改写；U9只读；BOM采购数量与每套用量分开；客户文件无内部成本利润。[L1: ../p3_product_spec.md]

[CONSTRUCTED] 停止条件：无来源却宣称已核实、越权或旧版审批放行、快照被改写、BOM重复汇总、范围超合同。发生任一项阻止对应交付并返修。[L1: ../p2_strategy_rationale.md]

封存数字：42条要求、39组、124分支、17项accepted-open；Gate 2待确认，最终seal在Gate 3之前生成。当前无封存哈希，不得当作已签发包。
