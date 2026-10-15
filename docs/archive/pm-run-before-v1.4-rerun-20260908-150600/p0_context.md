# P0 上下文、指标与输入准备

状态：本轮指标已确认；P0内部检查完成；等待Gate 1审定研究与修订策略。此状态不表示PRD已通过评审。

## 已锁定上下文

| 项目 | 值与来源 |
| --- | --- |
| 产品与范围 | [FOUND] 国网项目金具串；固定模块按合同，检索依据采用客户确认资料。[L0: 本任务用户初始要求“目前的项目只做国网项目的金具串”“所有的固定功能模块按照合同来”] |
| 本轮输出 | [FOUND] 修订版PRD、依据与待确认清单、审查及校验结果，写入项目docs目录。[L0: 本任务pm-start上下文表后用户“确认”] |
| 首要指标 | [FOUND] 关键业务场景可验收覆盖率，当前用户已回复“采用”。[L0: 2026-09-08 本任务上一轮指标建议及用户“采用”] |
| 成果确认人 | [FOUND] 当前用户确认本轮PRD成果。[L0: 上一轮问题“是否采用这个指标，并由你确认本轮PRD成果？”及用户“采用”] |
| 决策结构 | [INFERRED] 本轮文档单一确认人；客户业务系统中的销售、技术、财务、老板权限分别定义，不因文档确认人而合并。[L0: 本轮确认及已批准角色需求] |
| 本轮版本与周期 | [CONSTRUCTED] 2026-09-08启动的V1.0审查修订轮次，下一版建议V1.1；正式项目交付日期仍按合同里程碑和双方安排。[L0: 本轮审查请求] |
| 界面范围 | [FOUND] 当前原型导航包含工作台、资料、协作、检索、核价、档案、规则及合同后续阶段页面；未对接工程工具链注册表。[L2: ../../src/App.vue 与 ../红光金具智能报价系统_PRD_2026-09-08.md §12（待审页面清单）] |
| 上下文包 | [FOUND] pack=none，通用模式，不复制其他企业事实。[L2: /Users/1ovepingu/Desktop/Projects/skill/Product-to-Prod/config/packs.json] |
| 运行方式 | [FOUND] 必需能力python3与shasum预检通过（退出0）；未配置local.json和工程交接，采用独立文档模式。[L2: 本任务2026-09-08 preflight.sh pm-requirements-v1输出及配置检查] |

## 指标的判定口径

- [CONSTRUCTED] 分母：Gate 1审定的关键场景组登记表；拆分或合并场景必须记录变更，不可通过删除困难场景提高分数。[L0: 已采用的可验收覆盖率指标]
- [CONSTRUCTED] 分子：同一场景组下所有必要分支都写明角色、输入及前置条件、正常/异常结果、门禁和可检查证据，并经独立审查无未解决逻辑缺陷的组数；单有FR/AC编号不能计入。[L0: 已采用指标及用户强调的角色/流程/数据流转]
- [CONSTRUCTED] 计算：覆盖率=合格场景组数÷审定场景组总数×100%；目标建议100%，在Gate 1确认分母和目标；当前不报完成百分比。[L0: 本轮指标确认]
- [CONSTRUCTED] 前置指标：关键规则可回查来源覆盖率；缺少依据的规则须明确归为产品建议并有确认路径。[L2: /Users/1ovepingu/Desktop/Projects/skill/Product-to-Prod/skills/pm-requirements-v1/references/evidence-tags.md §Dual placement]
- [CONSTRUCTED] 防止指标失真：不得把仅写出文档当成生产验收通过；场景完整度、原型实现程度、正式服务验收三个结果分别记录。[L0: 用户原型范围要求]

## 来源与输入就绪情况

- [FOUND] 来源路径、修改时间、读取范围与文本/主表文件哈希已登记在source-register.json；哈希只用于识别版本，不证明内容正确。[L1: source-register.json]
- [FOUND] 合同与客户确认PDF已由独立审查者核对；合同段落又由主审读取，核查只用于产品范围和交付指标。[L1: review-source-v1.md]
- [FOUND] 红光字段Schema、行业适配器及风险面板已重读，发现现成字典和拟建风险治理能力应分别记录。[L2: /Users/1ovepingu/Desktop/Projects/quotation_agent/demo/src/adapters/industry_plugin.ts:29]
- [FOUND] 拆解主表按原型节选关联行抽样；图册完成文件可读性检查，没有完成全量图号索引、全部子件校核或价格库核验。[L1: p1_research_base.md §证据台账 E13与E14]
- [NEEDS-CONFIRMATION → 客户IT/财务/技术负责人: U9字段与账号、完整端到端资料、部署资源、成本样例、验收计分口径尚未取得本轮完备性凭证；阻断相关正式集成或验收，允许按具名缺口继续文档工作]

## 约束、冲突与排除

- [FOUND] 用户确认过销售与技术并行协作、角色统一为销售、技术和老板可驳回，金额阈值未知。[L0: 本任务用户相关原话]
- [CONSTRUCTED] 整包汇合、含税整单门槛及等号边界、特殊商务主动升级保留为本次原型设计细化；生产制度需有可回查确认，不称为客户现行制度。[L1: review-source-v1.md §2]
- [FOUND] 老知识库写图册打不开，用户已纠正为可以打开。[L0: 用户原话“知识库写的图册已经提供了现在是可以打开的”]
- [CONSTRUCTED] 不把旧解决方案的成交追踪、向量库等自动升格为合同固定模块；附件四引用方案的准确版本仍列待核实。[L1: review-source-v1.md §4]
- [CONSTRUCTED] 本轮不修改业务代码、不运行代码测试、不对接外部平台；仅进行文档机械检查和只读资料核对。[L0: 已确认本轮PRD工作范围]
- [CONSTRUCTED] 排除市场调研、线上分析、设计工具提取、Issue同步、工程自动交接等可选能力，理由是本轮没有相应已授权数据源或必需产物；必需能力栈保持required-only。[L2: /Users/1ovepingu/Desktop/Projects/skill/Product-to-Prod/skills/pm-requirements-v1/SKILL.md §Right-sizing lock]
- [CONSTRUCTED] 发布文档不复制合同联系人、电话、邮箱、银行账号、凭据；客户资料只在授权本地范围处理。[L0: 本轮资料使用范围]

## P0内部检查

| 检查 | 结果 |
| --- | --- |
| 常量有来源 | [FOUND] 范围和指标来自用户；未确认阈值保留具名缺口。[L0: 本轮范围与指标确认] |
| 演示人员不作制度依据 | [CONSTRUCTED] 原型人员姓名不进入客户正式岗位映射。[L2: ../../src/domain/seed.ts] |
| 旧稿权威边界 | [CONSTRUCTED] 原PRD及历史方案不独自证明新的客户规则，先回查合同或客户确认。[L2: /Users/1ovepingu/Desktop/Projects/skill/Product-to-Prod/skills/pm-requirements-v1/references/evidence-tags.md §The citation axis L0–L5] |
| 私密信息排除 | [CONSTRUCTED] 采用上节排除清单；独立评审同时检查。[L0: 本轮资料范围] |
| 中文与术语 | [CONSTRUCTED] 采用销售、金具串型、串内子件、资料批次和询价包；由本轮独立审查者核对中文表达与定义一致性。[L0: 用户术语修正及客户检索材料] |
