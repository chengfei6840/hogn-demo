# outputs 接口约定



[CONSTRUCTED] 报价导出请求使用quote_snapshot_id和已授权template_version，不从当前可变项目重新取价。对外白名单为客户/项目必要信息、原项关联、品名规格、数量单位、价格金额、税费、商务条款及排除范围；内部成本、毛利、底价和内部审批评论不得混入文件。 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收]

[CONSTRUCTED] 导出结果记录task_id、snapshot_id、template_version、state、file_ref、file_hash、错误原因。issueQuote事务成功是唯一签发冻结事件；文件失败不使报价退回未出具。失败任务重试仍引用原快照，后发政策不改已冻结快照；必须验证拆行合计与原项/整单一致。Excel/PDF正式版式等待模板确认，原型CSV只为演示。 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收]

[CONSTRUCTED] 报告接口使用技术文件版本、报告文件版本、适用产品和参数映射，输出一致/差异/缺失/不适用、原始单位和可验证换算依据。出图任务输入参数版本、标准件范围与双方POC书面凭证；输出自动原始图、人工修订图及两者版本分别保存。 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收]

[CONSTRUCTED] 三期自动准确率从人工修订前的原始输出计算；20份抽检按书面口径记录，人工复核后的文件正确率另列，不替代自动指标。非标超范围或POC未通过时不创建正式出图任务。 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收]

