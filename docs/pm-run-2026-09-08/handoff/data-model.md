# 数据模型

[CONSTRUCTED] 下列为正式业务数据约定，不声称原型已全部实现。[L1: ../p3_product_spec.md；整合PRD第8章]

数据需求

[CONSTRUCTED] 采用资料接入与业务对象分层。下面是拟建业务模型；表里的字段是产品契约，不表示现有解析服务已经返回全部字段。 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收]

| 对象 | 关键字段 | 约束 |
| --- | --- | --- |
| 资料批次/文件 | `batch_id, file_id, parent_zip_id, original_name, internal_path, content_hash, detection, state` | [CONSTRUCTED] 批次不可直接等于询价包；原件不可改写；同指纹文件可复用存储但保留各次提交与来源 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收] |
| 来源位置 | `file_id, format, sheet/cell 或 page/region 或 paragraph/table, locator_status` | [CONSTRUCTED] 保留原位置；定位失败显式记录；Markdown行号不能伪装成原PDF页码 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收] |
| 询价包 | `package_id, project_id, subdivision_id, package_name, package_no, demand_revision, scope_revision, commercial_revision, stage` | [CONSTRUCTED] 稳定ID不只使用包名称；范围变更不会删除原客户项；正式系统可多包并行 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收] |
| 原始货物项 | `item_id, package_id, original_serial, original_fields, kind, included, exclusion_reason` | [CONSTRUCTED] 原始顺序和数量保留；独立物资、非标与待分类状态单列 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收] |
| 字段值 | `field_id, object_id, field_code, raw, normalized, candidates, confirmed, source_id, confirm_actor, revision` | [CONSTRUCTED] 客户确认值由销售登记，技术只能提出修正；每层值不能互相覆盖 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收] |
| 技术结果 | `item_id, requirement_revision, technical_revision, candidate_id, catalog_version, conditions, parts` | [CONSTRUCTED] 每套子件及单位、材质、单重、串/子件U9不同字段；最终确认要有条件和依据 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收] |
| 主库候选 | `catalog_snapshot_id, assembly_id, source_rows, technical_code, series_model, atlas, drawing_h, drawing_i` | [CONSTRUCTED] 技术码不是成套唯一键；两图号保留原列；召回排序不赋予确认权 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收] |
| 风险任务 | `risk_id, item_id, field_code, rule_id, rule_version, block_stage, owner_user_id, confirm_role, status, evidence, applies_to_revision` | [CONSTRUCTED] 一个当前负责人；等待补充保持阻断；相关字段版本变化重评resolved/not_applicable，不改历史记录 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收] |
| 确认记录 | `confirmation_id, actor_id, role, package_scope_revision, item_revision_refs, result, reason, at` | [CONSTRUCTED] 销售确认范围/需求，技术确认纳入项集合和各项技术版本；旧记录只读、有效性独立计算 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收] |
| 价格版本 | `pricing_id, revision, material_refs, unit_price, cost, tax, charges, decimals_policy, rule_version, source_refs, valid_until` | [CONSTRUCTED] 金额十进制；每行收入成本税费同口径；不以U9非空代替有效价格来源 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收] |
| 审批实例 | `approval_id, target_refs, pricing_revision, policy_version, reasons, state, actor_id, result, comment, revision` | [CONSTRUCTED] 同时触发多原因均保存；通过/退回是单一原子转换；对旧审批不重复通过 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收] |
| 报价快照 | `quote_id, parent_quote_id, demand/technical/pricing/policy/template_refs, included/excluded_items, public_lines, internal_refs, file_hash` | [CONSTRUCTED] 生成后不可改；对外投影只含白名单；旧文件、金额、版本不因主数据更新变化 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收] |
| 规则配置 | `dictionary_version, synonym_version, risk_rules_version, approval_policy_version, approval_record, active_from` | [CONSTRUCTED] 草稿/审核/发布/停用状态分开；发布包含样本检查及授权；未出具报价政策变化规则见下文 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收] |
| 操作记录 | `event_id, actor_id, role, object_id, action, before_ref, after_ref, reason, at, idempotency_key` | [CONSTRUCTED] 关键读/写/导出留痕按权限访问；不记录凭据；原型localStorage不是正式审计存储 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收] |

### 有效性和事务边界

[CONSTRUCTED] 每个修改命令携带expectedRevision和幂等键；同键同负载返回原结果，同键不同负载拒绝。校验权限、版本、门禁与提交状态变更在同一事务或等效一致性边界完成；冲突返回当前版本，不自动覆盖。 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收]

[CONSTRUCTED] canSubmitFinance要求：有纳入金具串；每项数量和单位有效；销售确认引用当前需求/范围；技术确认集合覆盖当前纳入项且各技术版本一致；所有阻断到技术确认或核价的适用风险均已有效解决或经授权判不适用。提示项不当作已补齐字段。 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收]

[CONSTRUCTED] purchase_quantity仅改变采购总量时重确认销售并重算价格；若每套用量、单位换算或结构关系也改变，则相应技术版本失效。更改技术条件使受影响技术确认失效；无关项可以沿用，但整包通过需重新核对确认集合。 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收]

[CONSTRUCTED] 审批政策发布的生效规则在本版选择：所有未出具报价需按新政策重新计算并使旧审批失效；已出具快照保持旧政策。发布动作有董事长制度批准及管理员授权记录；审批/出具时再次核对当前生效政策版本。此项为保留的产品设计，本轮Gate 2已确认产品设计，正式制度仍待确认。 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收]

[CONSTRUCTED] issueQuote事务成功即原子创建快照与导出任务并标记报价已出具（签发冻结）；文件状态独立为处理中/成功/失败。导出失败不撤销签发，可重试原快照而不另造报价；之后政策发布不重算该已出具快照。文件成功后保存模板版本、文件哈希及状态；未成功冻结的issue请求仍受新政策检查。报价新版本按价格或需求变化选择重审链，旧报价只读。 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收]
新增BOM输出对象记录项目与技术版本、模板版本、确认范围、缺项、数量及来源；调价记录保存调整方式与目标值、前后价格、成本、原因、确认方案指纹和复核引用；签发快照额外保存签发人。以上对象均沿用服务端授权、唯一ID和幂等规则。
