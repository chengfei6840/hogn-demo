# PRD V1.1 独立文档交接包

FIXTURE, no downstream configured

[FOUND] 当前没有工程工具链接收方；Gate 1已批准研究、37组和文档覆盖目标，本包内容已获Gate 2确认，最终签发状态见design-gate.json。 [L1: 本任务2026-09-08用户“以上五项通过”及run-status.json]

## 1 七项任务记录

| 项目 | 记录 |
| --- | --- |
| 请求人 | [CONSTRUCTED] 当前用户，作为本轮产品确认人。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |
| 目标 | [CONSTRUCTED] 基于合同与客户检索规则完善PRD，所有37个关键场景组有可判定验收定义。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |
| 来源 | [CONSTRUCTED] P1证据台账及source-register.json，保留原始来源、版本及读取范围。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |
| 接受条件 | [CONSTRUCTED] 每组必要分支完整、独立审查通过、FR/场景/工作单元引用闭合，未知制度具名记录。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |
| 边界 | [CONSTRUCTED] 国网金具串，固定模块按合同；本轮只改文档，不改产品代码，不承诺真实服务已达标。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |
| 问题处理 | [CONSTRUCTED] 每个真实未决事项在同一任务中交对应确认人，先列影响；不把缺少数据替换成默认事实。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |
| 当前回执 | [CONSTRUCTED] 已生成规格、模型、接口、切片与未决清单；校验和独立审查结果另存，最终批准由design-gate.json单独记录。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |

## 2 交付回执

[CONSTRUCTED] 变更：补合同样本、全自动计分、分期指标与依赖；将设计细化和客户制度分开；展开37组112个验收分支。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

[CONSTRUCTED] 位置：spec.md为P3规范投影；plan.md、data-model.md、contracts/、slices.json分别说明顺序、对象、接口和依赖。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

[CONSTRUCTED] 检查：tag-lint、结构化引用和文件完整性检查；独立内容审查结果见review-gate-2.md。未运行任何产品测试或typecheck。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

[CONSTRUCTED] 人工事项：Gate 2已通过并确认OPEN-09产品设计，之后进行封存及Gate 3；未知生产制度不因此变为已解决。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

## 3 取舍与假设

| 取舍 | 理由与状态 |
| --- | --- |
| 分层对象和版本引用 | [CONSTRUCTED] 沿用客户确认对象；减少一个状态同时表示字段正确、技术确认及报价批准的混淆。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |
| 数量/价格变更沿用未受影响技术 | [CONSTRUCTED] 减轻不必要复审；结构或单位关系改变仍回技术。该具体分支已获Gate 2产品确认，客户生产制度继续在OPEN-09记录。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |
| 政策发布重算未出具报价 | [CONSTRUCTED] 选择显式统一生效规则，防止旧审批套新门槛；生产启用前由客户财务/老板确认。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |
| 按包汇合 | [CONSTRUCTED] 沿用原型设计方向；缺项不能把整包伪装完成，范围排除保留记录。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |
| 后续阶段深度 | [CONSTRUCTED] 按合同列独立场景与验收入口，尚未具备详细成本/出图资料，不写虚构接口字段或日期。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md] |

## 4 具名待确认队列

[CONSTRUCTED] Gate 1允许生产未决事项带明确阻断进入PRD；以下仍开放。OPEN-09具体版本策略已获Gate 2产品确认；17项生产事项接受开放的裁决已记录于inference-confirmed.json，对应正式工作仍受阻断。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

| 编号 | 事项 | 确认人 | 阻断/时间 | 关闭问题 |
| --- | --- | --- | --- | --- |
| OPEN-01 | 金额阈值、含税整单临界边界与特殊商务升级制度 | 老板/财务 | [NEEDS-CONFIRMATION → 老板/财务: 阻断生产审批配置；对应正式配置/阶段前确认] | 请确认正式金额规则及适用范围。 |
| OPEN-02 | 毛利底线、成本范围及利润例外 | 老板/财务 | [NEEDS-CONFIRMATION → 老板/财务: 阻断正式利润计算；对应正式配置/阶段前确认] | 请确认毛利计算和例外批准口径。 |
| OPEN-03 | 税费运费、币种/数量精度、舍入及有效期 | 财务/销售 | [NEEDS-CONFIRMATION → 财务/销售: 阻断正式核价与模板；对应正式配置/阶段前确认] | 请确认价格与舍入、期效配置。 |
| OPEN-04 | 账号、项目归属、实际审批人及代办授权 | 客户负责人/IT | [NEEDS-CONFIRMATION → 客户负责人/IT: 阻断生产账号授权；对应正式配置/阶段前确认] | 请提供角色到岗及代理授权规则。 |
| OPEN-05 | U9账套字段只读账号及项目关联 | 客户IT/财务/技术 | [NEEDS-CONFIRMATION → 客户IT/财务/技术: 阻断U9联调；对应正式配置/阶段前确认] | 请确认只读字段和授权凭证。 |
| OPEN-06 | 完整标准串数据与缺失物料信息处理 | 技术/供应 | [NEEDS-CONFIRMATION → 技术/供应: 阻断全量主库发布；对应正式配置/阶段前确认] | 请确认一期完整清单及缺失数据补齐责任。 |
| OPEN-07 | 图册页码索引与历史版本覆盖 | 技术 | [NEEDS-CONFIRMATION → 技术: 阻断原始图样定位；对应正式配置/阶段前确认] | 请确认图号索引和所需历史版本是否齐备。 |
| OPEN-08 | ZIP跨文件归属及Schema修订的真实集成 | 研发负责人 | [NEEDS-CONFIRMATION → 研发负责人: 阻断正式资料解析链路；对应正式配置/阶段前确认] | 请确认实现职责与可回测样本。 |
| OPEN-09 | 按受影响项重审、仅改数量/价格保留技术引用、issue成功即已出具且文件状态独立、政策发布重算未冻结报价 | 客户业务/财务负责人 | [NEEDS-CONFIRMATION → 客户业务/财务负责人: 产品设计已获Gate 2确认；仍阻断生产政策配置] | 请确认已批准产品设计在客户生产制度中的启用与授权。 |
| OPEN-10 | 报价/BOM模板、拆行、签章与文件格式 | 销售/技术/财务 | [NEEDS-CONFIRMATION → 销售/技术/财务: 阻断正式导出；对应正式配置/阶段前确认] | 请确认默认与客户模板及拆行口径。 |
| OPEN-11 | 指标样本分母、两个80%指标、阶段关系与并发超时 | 双方验收负责人 | [NEEDS-CONFIRMATION → 双方验收负责人: 阻断对应正式验收计分；对应正式配置/阶段前确认] | 请书面确认各指标独立定义和分母。 |
| OPEN-12 | POC样本许可证及批处理环境 | 技术/IT/研发 | [NEEDS-CONFIRMATION → 技术/IT/研发: 阻断正式三期出图；对应正式配置/阶段前确认] | 请确认POC及出图环境前置。 |
| OPEN-13 | 同一新疆750kV中标项目完整端到端资料 | 客户技术/销售 | [NEEDS-CONFIRMATION → 客户技术/销售: 阻断完整样例回测；对应正式配置/阶段前确认] | 请确认清单规范附图BOM报价关系完整。 |
| OPEN-14 | 2至3张成本样例及财务口径 | 客户财务 | [NEEDS-CONFIRMATION → 客户财务: 阻断二期核算设计；对应正式配置/阶段前确认] | 请确认成本样例是否齐备可用。 |
| OPEN-15 | 内网服务器GPU网络及运行依赖 | 客户IT | [NEEDS-CONFIRMATION → 客户IT: 阻断正式内网部署；对应正式配置/阶段前确认] | 请确认资源和拓扑。 |
| OPEN-16 | 合同四类甲方人员、历史10至20份样本与模板完备性 | 客户项目负责人 | [NEEDS-CONFIRMATION → 客户项目负责人: 阻断开工及移交依赖；对应正式配置/阶段前确认] | 请确认分工到岗和资料完备性。 |
| OPEN-17 | 合同附件四引用解决方案的准确版本与确认状态 | 项目合同范围确认人 | [NEEDS-CONFIRMATION → 项目合同范围确认人: 阻断扩大固定模块范围；对应正式配置/阶段前确认] | 请确认附件四引用哪份获认可的方案。 |

## 5 不纳入本轮的工作

[CONSTRUCTED] 不开展市场/增长研究、生产线上统计、外部任务同步或代码整改；二三期工程详设留到各阶段。相似报价向量库和成交追踪不从旧方案直接升级为合同必交模块，先核对附件四引用版本。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

## 6 自查与下一步

[CONSTRUCTED] 较完整部分是客户检索与异常门禁。最薄弱处是价格、部署和出图依赖仍缺生产配置；本版给可判定输入和失败条件，不能证明数据已就绪。建议完成最终封存确认后，按具名清单补齐正式输入。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

## 7 证据与完整性

[CONSTRUCTED] citation-map.md由P1台账生成；source-register.json记录来源存在性/读取范围，原PRD只作为待审对象，不能证明客户新制度。新的设计条目标CONSTRUCTED，依据已有规则细化，待本轮内容批准。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

## 8 可执行指标

[CONSTRUCTED] success-metrics.json给tool、argv、工作目录、时间窗口及100%目标；success-metrics.md给可复制命令。coverage-review.json保存独立逐组定义判断，任何必要分支未评审或缺失均不计入分子。week/month/quarter生产评价不适用于本次文档轮次。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]
