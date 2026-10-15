# P2 修订策略与场景范围（Gate 1待确认）

## 目标与优先次序

- [FOUND] 本轮采用关键业务场景可验收覆盖率，由当前用户确认成果。[L1: p0_context.md §已锁定上下文]
- [CONSTRUCTED] 修订重点按影响排序：先修来源与合同口径，再补核心业务分支，再做需求—场景—工作单元追踪；合同后续阶段保留范围和验收入口，不提前扩为完整详设。[L1: p1_research_base.md E02—E07、E18—E24]
- [INFERRED] 当前主要风险是证据归属过强及异常验收不够具体，而不是缺少页面数量；增加页面不能消除这些缺口。[L1: review-source-v1.md §1—§4；p1_research_base.md E16—E23]
- [CONSTRUCTED] 业务模型保留原始客户项、串型、子件、风险任务、版本和报价快照各自身份，明确上游变化如何影响下游，避免重复描述互相矛盾。[L1: p1_research_base.md E06/E07/E23]

## BUILD 与 CONFLICT 两遍检查

| 项目 | 认知类型 | BUILD：拟采用的整理方式 | CONFLICT：与依据冲突检查 |
| --- | --- | --- | --- |
| 事实与建议 | extraction / synthesis | [CONSTRUCTED] 客户确认、合同规定、源码现状、产品设计、制度未决分开标记。[L1: p1_research_base.md E07/E23] | 保留并行协作；不倒推生产阈值或要求重新确认四检索路径 |
| 指标 | extraction / analysis | [CONSTRUCTED] 还原合同每个指标及样本/计分口径；同名不同分母分别列。[L1: p1_research_base.md E18/E19] | 不把人工修正结果当全自动准确率；不把文档覆盖率当生产达标率 |
| 检索 | synthesis / analysis | [CONSTRUCTED] 四路径分别写正常、缺失、多候选及冲突结果，子件分组算法另标调研来源。[L1: p1_research_base.md E04/E05/E22] | 不新增第五条主路径，不把所有路径强制串行跑完 |
| 风险与字典 | analysis / generation | [CONSTRUCTED] 定义拟建的规则编号、适用条件、责任人和阻断阶段，与现有Schema/面板实现分列。[L1: p1_research_base.md E10—E12] | 不复制其他行业“国家/地区”“阻抗”等字段，不把not_configured写成已发布规则库 |
| 版本与审批 | analysis / generation | [CONSTRUCTED] 原型设计细化保留，生产前确认规则作用版本；修改、退回、重提和重报价分别写。[L1: p1_research_base.md E07/E23] | 老板利润审批不能代替技术；按包汇合、含税口径等不冒充已存在制度 |
| 后续范围 | extraction / analysis | [CONSTRUCTED] 成本、报告、出图按合同分期；另核实附件四引用方案版本。[L1: p1_research_base.md E02/E03/E21] | 不从旧方案新增向量库、成交追踪为强制交付 |

- [CONSTRUCTED] validation由独立审查者对来源、冲突检查与场景覆盖进行复核；作者的BUILD/CONFLICT记录不替代其PASS或REVISE结论。[L2: /Users/1ovepingu/Desktop/Projects/skill/Product-to-Prod/skills/pm-requirements-v1/SKILL.md §P2]

## 场景分母提案

- [CONSTRUCTED] 以下为待Gate 1审定的37个场景组，每组同时包含正常与必要异常分支；P3逐分支细化，组内任一必要分支缺失即该组不合格。[L1: p0_context.md §指标的判定口径]
- [CONSTRUCTED] 建议目标37/37组可验收，覆盖率100%；当前只有研究与场景范围，不计算合格组数，不声明达到目标。[L1: p0_context.md §指标的判定口径]
- [CONSTRUCTED] 场景组是文档审查分母，不是运行用例数；后续阶段的组以合同范围、输入输出、异常与验收口径为本轮深度，不能与一期实现通过率混算。[L0: 用户“其他稍微粗一点没关系”与固定模块按合同要求]

| 编号 | 场景组 | P3需明确的判断与分支 | 依据 |
| --- | --- | --- | --- |
| SC-01 | 资料批次与ZIP目录 | 销售登记混合资料；完整文件清单与内部来源可查，文件批次不等于业务包 | [CONSTRUCTED] [L1: p1_research_base.md E06/E08/E09] |
| SC-02 | 异常文件与幂等重试 | 损坏、加密或部分失败可见；补传重试不重复造项，其他可用文件保留 | [CONSTRUCTED] [L1: p1_research_base.md E08/E09] |
| SC-03 | 提取来源与人工修订 | 原值、规范值、候选值、确认值分开；无来源或低质量值留待确认 | [CONSTRUCTED] [L1: p1_research_base.md E05/E08] |
| SC-04 | 包归属与跨文件冲突 | 同包多文件或一批多包保留关联；归属不明不自动合并 | [CONSTRUCTED] [L1: p1_research_base.md E06/E09] |
| SC-05 | 技术编码检索 | 编码召回后核对串型与项目条件；冲突不能直接确认；未找到保留查询及零结果状态，可转其他路径或人工处理 | [CONSTRUCTED] [L1: p1_research_base.md E04/E22] |
| SC-06 | 串型号组合检索 | 同型号不同导线、电压或类别保留多候选；确认需适用组合条件；未找到不造候选，可补条件、换路径或人工处理 | [CONSTRUCTED] [L1: p1_research_base.md E04/E05] |
| SC-07 | 附图图册检索 | 附图引用到图册版本图号可追踪；缺版本、旧新版本差异不能合并；无对应图样或记录保留未找到，提交补图或人工查证 | [CONSTRUCTED] [L1: p1_research_base.md E04/E14] |
| SC-08 | 品名描述补充检索 | 只补充召回和核对存在性；不能把相关性当最终技术匹配；未找到提示当前数据范围，不推断该产品不存在，允许补资料和人工查找 | [CONSTRUCTED] [L1: p1_research_base.md E04] |
| SC-09 | 电压及导地线缺失 | 适用字段缺失可召回；最终确认前按导线串/地线串分别满足条件 | [CONSTRUCTED] [L1: p1_research_base.md E05/E17] |
| SC-10 | 多候选与项目差异 | 技术查看关键差异，保留未采用原因；不能自动采用首条 | [CONSTRUCTED] [L1: p1_research_base.md E05] |
| SC-11 | 图册版本与两个图号 | 两列图号原值分别存；精确引用和版本冲突分别处理 | [CONSTRUCTED] [L1: p1_research_base.md E05/E13/E14] |
| SC-12 | 独立物资与报价范围 | 独立物资单独记；销售调整范围留原因，不能隐藏未处理项 | [CONSTRUCTED] [L1: p1_research_base.md E06] |
| SC-13 | BOM数量与必要字段 | 每套子件用量和采购量分开；缺必要材质/单位/用量不能作为完整BOM | [CONSTRUCTED] [L1: p1_research_base.md E06/E13/E22] |
| SC-14 | U9缺失与有效价格关联 | 缺料号保留空值与状态；可保留技术候选，不能跳过核价依据 | [CONSTRUCTED] [L1: p1_research_base.md E05/E13] |
| SC-15 | 问题指派与转交 | 单个当前负责人；转交保留历史、版本与阻断，不等同解决 | [CONSTRUCTED] [L1: p1_research_base.md E07/E12] |
| SC-16 | 暂缓与不适用判定 | 暂缓仍阻断；不适用需有权限确认和依据，不能用按钮清除问题 | [CONSTRUCTED] [L1: p1_research_base.md E07/E12] |
| SC-17 | 有权限人员处理与确认 | 处理结论有证据；非负责人或无权限者不能关闭问题 | [CONSTRUCTED] [L1: p1_research_base.md E07/E12] |
| SC-18 | 销售技术双确认汇合 | 两者可并行；单方确认、旧版本确认、未解阻断都不能进入财务 | [CONSTRUCTED] [L1: p1_research_base.md E07/E23] |
| SC-19 | 技术退回补充 | 技术能自行核实则处理，需客户答复则转销售；补充后复核相关项 | [CONSTRUCTED] [L1: p1_research_base.md E07] |
| SC-20 | 财务退回商务或技术问题 | 按原因回到责任角色；技术需求变化必须重经技术 | [CONSTRUCTED] [L1: p1_research_base.md E07/E24] |
| SC-21 | 老板利润驳回重提 | 老板意见留痕，财务改价重提；利润许可不解除技术问题 | [CONSTRUCTED] [L1: p1_research_base.md E07] |
| SC-22 | 需求变化影响范围 | 技术、数量、价格和非关键资料分别定义重审；旧确认不可用于新版本 | [CONSTRUCTED] [L1: p1_research_base.md E07/E23] |
| SC-23 | 核价保存与计算依据 | 有价格来源与同口径成本、税费；未保存变更不应被审核，舍入口径可复算 | [CONSTRUCTED] [L1: p1_research_base.md E24] |
| SC-24 | 审批触发及阈值未知 | 大额、低毛利、主动升级和普通路线分别检查；未知配置不得自动免审 | [CONSTRUCTED] [L1: p1_research_base.md E07/E23] |
| SC-25 | 审批期间并发及规则变更 | 提交版本与配置版本绑定；变更后拒绝旧审批或明确重算，不能混用 | [CONSTRUCTED] [L1: p1_research_base.md E23/E24] |
| SC-26 | 出具条件与报价快照 | 只有有效审核版本可出具；冻结需求、物料、价格、规则与审批引用 | [CONSTRUCTED] [L1: p1_research_base.md E07/E24] |
| SC-27 | 已出具报价新版本 | 需求或价格变化新建版本；旧报价与审批快照不可原地覆盖 | [CONSTRUCTED] [L1: p1_research_base.md E07/E23] |
| SC-28 | 报价模板与对外可见数据 | 按客户项汇总拆行金额，说明排除范围；客户文件不含内部成本利润 | [CONSTRUCTED] [L1: p1_research_base.md E02/E06] |
| SC-29 | 账号角色与项目数据权限 | 停用或跨项目请求受限；管理员不自带业务审批，技术不默认看内部利润 | [CONSTRUCTED] [L1: p1_research_base.md E01/E07/E24] |
| SC-30 | 字段字典与来源映射 | 字段按对象/路径/阶段生效；串型号及不同采购号不错误折叠 | [CONSTRUCTED] [L1: p1_research_base.md E10/E11] |
| SC-31 | 同义词建议发布与停用 | 技术复核适用范围与样本后发布；误映射可停用且不改历史引用 | [CONSTRUCTED] [L1: p1_research_base.md E10/E11] |
| SC-32 | 主库导入与版本质量 | 原件与检索快照分开；重复、空值、子件分组及异常清单可核对 | [CONSTRUCTED] [L1: p1_research_base.md E05/E13] |
| SC-33 | U9只读、内网与运行恢复 | 只读接口、离线资源、审计、备份与失败重试分别有验收证据；合同≥15人同时操作不宕机、关键操作不超时须定义场景及压测证据，本轮未压测 | [CONSTRUCTED] [L1: p1_research_base.md E02/E20/E24及合同并发补充条款] |
| SC-34 | 二期成本材料价报价比对 | 按合同列出成本样例、审批导价及三类报价关联；详细口径待阶段资料 | [CONSTRUCTED] [L1: p1_research_base.md E02/E20] |
| SC-35 | 三期报告关联 | 参数值、单位、适用范围及差异可核对；抽检口径按合同保留 | [CONSTRUCTED] [L1: p1_research_base.md E02] |
| SC-36 | 三期POC与出图计分 | POC书面通过后才启动；全自动准确率与人工复核输出分开统计 | [CONSTRUCTED] [L1: p1_research_base.md E02/E18] |
| SC-37 | 合同开工依赖与移交 | 每项输入有责任方和完备性证据；甲方IT独立维护场景验收 | [CONSTRUCTED] [L1: p1_research_base.md E20] |

- [CONSTRUCTED] SC-33至少分别展开接口只读、离线资源、审计、备份恢复、任务重试、15人并发六类分支；SC-34分别展开成本、材料价、报价比对；SC-37分别展开各项开工依赖和移交验证。任一必要分支缺失，该组不计入分子。[L1: 本轮独立审查者2026-09-08对P0—P2的REVISE意见]

## 修订交付方式

- [CONSTRUCTED] Gate 1通过后生成P3规格与V1.1修订稿，保持V1.0原文件可回看；每项需求标明风险等级、是否涉及金额、是否需要统计，并关联场景和实现单元。[L2: /Users/1ovepingu/Desktop/Projects/skill/Product-to-Prod/skills/pm-requirements-v1/SKILL.md §P3]
- [CONSTRUCTED] 独立模式仍提供精简交接资料：规格、实施顺序、数据对象、业务契约、切片和未批准的设计门禁记录；均为本地文档，不声明已交给工程工具链。[L2: /Users/1ovepingu/Desktop/Projects/skill/Product-to-Prod/references/eng-handoff-adapter.md §The two modes]
- [CONSTRUCTED] 文档检查包括证据标签、编号唯一、FR—场景—实现单元对应和承诺产物完整；正式SRS检查只在明确按其模板交付时运行，不用模板章节不匹配的结果假装完成通用PRD验收。[L2: /Users/1ovepingu/Desktop/Projects/skill/formal-requirements-document/SKILL.md §输出文档结构]

## 具名未决项与截止点

| 未决事项 | 谁确认 | 需要时间 | 阻断内容 |
| --- | --- | --- | --- |
| 场景分母37组及100%文档覆盖目标 | 当前用户 | Gate 1，进入P3前 | [NEEDS-CONFIRMATION → 当前用户: 阻断本轮场景分母和目标冻结] |
| 原型细化规则作为设计保留、生产制度再确认 | 当前用户；生产制度由客户老板/财务确认 | 本轮归类在Gate 1；制度生产配置前 | [NEEDS-CONFIRMATION → 当前用户/客户业务负责人: 阻断细化规则被称为客户现行制度] |
| 合同两个80%指标及阶段关系 | 双方验收负责人 | 对应正式验收口径冻结前 | [NEEDS-CONFIRMATION → 双方验收负责人: 阻断该指标的计分实施与正式达标声明] |
| 完整项目样例、成本样例、部署资源、U9权限 | 客户对应技术/财务/IT负责人 | 合同规定前置节点 | [NEEDS-CONFIRMATION → 客户技术/财务/IT负责人: 阻断相关正式接入与验证；本轮仅登记缺口] |
| 附件四引用解决方案准确版本 | 项目合同范围确认人 | 扩展固定范围前 | [NEEDS-CONFIRMATION → 项目合同范围确认人: 阻断把旧方案新增功能直接当必交模块] |

## Gate 1提议

- [CONSTRUCTED] 建议批准本轮研究与修订策略、场景范围，允许具名生产依赖以未决状态进入PRD；进入P3后逐项补细节，不以此批准最终PRD或生产上线。[L1: p0_context.md、p1_research_base.md、review-source-v1.md]
- [FOUND] 本流程须在Gate 1、Gate 2、Gate 3由人确认；作者不能替自己出具PASS，最终设计批准标志仍保持false直到用户按流程批准。[L2: /Users/1ovepingu/Desktop/Projects/skill/Product-to-Prod/skills/pm-requirements-v1/SKILL.md §The phase spine及§Gate 3]
