# 主库与U9只读约定

[CONSTRUCTED] 查询输入为授权账套、物料或项目标识、字段范围及需要的版本/日期。返回源记录标识、物料描述、单位、价格及税口径（如有）、源时间和匹配状态。实际字段列表及鉴权方式由客户IT确认，未授权字段不得假设存在。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

[CONSTRUCTED] 未找到、无权限、多个匹配、网络失败、缓存过期分别输出；多个匹配不选首条；源记录有料号不意味着能直接核价。历史缓存可展示但必须带源时间和过期状态，正式核价依有效期规则判定。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

[CONSTRUCTED] 只允许读操作，报价系统不得创建或修改ERP/MES物料、价格或订单。主库导入写入本系统的待审核快照；原Excel不回写；发布异常按组隔离，快照发布范围明确，历史引用保留。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]
