<!-- delivery-final -->
# 红光金具智能报价系统产品需求文档

版本：V1.1 · 日期：2026-09-08 · 状态：Gate 2内容已确认；最终签发状态见handoff/design-gate.json

[FOUND] Gate 1已由本轮产品确认人回复“以上五项通过”；本轮采用37个关键场景组、100%可验收定义覆盖目标，不代表功能已实现。[L0: 2026-09-08本任务Gate 1五项确认及用户回复]

[CONSTRUCTED] 本文用于业务评审与研发交接。原V1.0保留；当前规范以本文件为P3主文档，结构化需求和验收分支来自handoff/requirements.json、acceptance-scenarios.json，交接规格为相同内容的投影。原型演示、拟建正式能力和合同验收分别表达。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E01/E02/E07/E24]

## 1 范围、对象与交付边界

| 项目 | 内容 |
| --- | --- |
| 范围 | [CONSTRUCTED] 国网金具串从询价资料接入、串型/子件确认、并行协作、核价、审批到报价快照；固定模块按合同分期。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E01/E02] |
| 本期排除 | [CONSTRUCTED] 独立物资保留原始项并单列；需重新设计的非标转人工。阶段一不含单品成本精算、出图和外贸，ERP/MES只读。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E03/E06/E24] |
| 受影响用户 | [CONSTRUCTED] 销售、技术、财务、老板和管理员；角色名称不替代具体账号与项目授权。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E01/E07] |
| 行为变化 | [CONSTRUCTED] 销售与技术可并行解决问题；只有当前版本双确认且阻断解除才流转财务。老板按规则审查利润，不代替技术确认。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23] |
| 数据 | [CONSTRUCTED] 原件、批次、包、原货物项、字段四值、候选、子件、风险、确认、价格及报价快照分别存并关联。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E06/E24] |
| 接口 | [CONSTRUCTED] 单文件Markdown/Schema提取可参考现有服务；新增业务批次编排、只读U9、主库与模板输出接口约定。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E08/E09/E24] |
| 风险 | [CONSTRUCTED] 错误归并、关键条件缺失、越权、旧版本放行、价格来源缺失、原型被误认为实际服务。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E10/E12/E16/E17] |
| 实施 | [CONSTRUCTED] 一期主流程细化，二三期按合同范围、输入输出、门禁和验收入口列明；正式接入按依赖清单逐项验证。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20] |
| 未决事项 | [CONSTRUCTED] 审批数值、财务计算、角色到岗、完整样例、U9权限、内网资源、引用方案版本及验收口径具名追踪。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E19/E20/E21/E23] |

### 分期

| 阶段 | 固定模块和本轮深度 |
| --- | --- |
| 一期 | [FOUND] 统一B/S工作台、解析、标准串匹配、子件带出、规则定价、串级报价单、U9只读、报价快照、权限审批、并发验证。本轮给完整流程与异常分支。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E03] |
| 二期 | [FOUND] 单品成本库及核算、材料实时价审批导入、品类扩充、历史/当次/中标后报价比对。本轮给独立输入、结果、异常及合同验收要求。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E03] |
| 三期 | [FOUND] 报告参数关联、POC书面门禁、标准件及尺寸微调参数化出图与2D投影、验收移交和培训。本轮不提供工程图。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E03] |

## 2 角色、权限与页面

[CONSTRUCTED] 每个业务请求同时检查账号有效性、角色、项目授权、对象负责人和版本。字段级过滤在服务端执行；前端角色切换只用于演示，不是生产认证。管理员可配置权限，不因身份获得业务审批权。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E01/E07/E24]

| 角色 | 可写动作 | 数据可见性 |
| --- | --- | --- |
| 销售 | 建询价、上传、客户确认值、范围、风险分配、销售确认、已审核报价输出 | [CONSTRUCTED] 所负责项目及对外价格；内部成本和毛利不可见 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E01/E07/E23] |
| 技术 | 检索、子件核对、技术风险处理、技术确认、退回、字典/同义词业务审核 | [CONSTRUCTED] 负责项目技术资料；内部成本/利润及最终报价金额不可见 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E01/E07/E23] |
| 财务 | 价格依据、规则核价、商务核对、财务通过/退回 | [CONSTRUCTED] 授权项目物料、价格、成本、毛利和审批依据 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E01/E07/E23] |
| 老板 | 审批规则制度确认、金额/利润通过或退回 | [CONSTRUCTED] 授权项目完整审批资料 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E01/E07/E23] |
| 管理员 | 账号角色项目授权、接口与部署配置；按批准记录维护政策 | [CONSTRUCTED] 运维配置和必要审计；不默认获取内部价格或审批权 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E01/E07/E23] |

[CONSTRUCTED] 工作台进入当前询价；资料页上传后主动启动处理；协作页处理问题；检索页查看四路径；核价页处理商务与审批；档案页输出和新版本；字典页管理规则；二三期页标合同后续范围。页面具备空、加载、失败、只读、无权限和业务阻断状态；长表局部滚动并保留表头，键盘可操作对话框，状态同时有文字。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E01/E16]

[CONSTRUCTED] 原型技术栈为Vue3、TypeScript、Vite、shadcn-vue、Tailwind、Iconify；配色延用已确认的官网深蓝、白灰及少量红色。这里只约束原型一致性，不新增正式部署兼容性承诺。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E01及本任务技术栈与配色确认]

## 3 业务流转与版本

[CONSTRUCTED] 资料整理 → 并行协作 → 财务核价 → 按规则老板审批或直接待出具 → 已出具。资料整理只要求可用货物项与基本包归属，不要求预先解决全部技术问题。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E08/E23]

| 进入阶段 | 输入与门禁 | 输出或退回 |
| --- | --- | --- |
| 并行协作 | 可用货物项草稿、包归属、来源；问题有规则和负责人 | [CONSTRUCTED] 销售补客户条件，技术检索与复核可同时开展 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23/E24] |
| 财务核价 | 销售确认当前范围/需求；技术确认纳入项的当前技术版本；所有核价前阻断解除 | [CONSTRUCTED] 核价保存后才能审核；无依据价格不能通过 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23/E24] |
| 老板审批 | 财务完成；金额/毛利/特殊事项触发或审批配置缺失 | [CONSTRUCTED] 老板有意见地通过或退回财务；技术冲突只能回有权角色解决 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23/E24] |
| 待出具 | 财务通过且所需老板审批有效；需求、价格和政策版本仍一致 | [CONSTRUCTED] 销售原子创建快照和导出任务 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23/E24] |
| 已出具 | issueQuote事务成功，快照与导出任务已创建，文件状态独立 | [CONSTRUCTED] 已出具指签发冻结；导出处理中或失败不改变该状态，旧版本只读，变化创建新版本 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23/E24] |

### 设计细化与变更影响

[CONSTRUCTED] 整包汇合、含税整单金额达到阈值时触发、特殊商务主动升级，以及下列版本细化均为本项目设计。Gate 1批准保留设计身份，不等于客户生产制度已配置；正式制度通过OPEN清单确认。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E23]

| 变化 | 本版正式系统设计 | 保留内容 |
| --- | --- | --- |
| 导地线、电压、类别、子件或技术附件 | 重审受影响项技术；销售需求有变化时重确认；相关价格及整份金额审批失效 | [CONSTRUCTED] 未受影响项的技术确认保留版本引用 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23/E24] |
| 仅采购数量/纳入范围 | 销售重确认；重新计算总用量、金额与审批；每套构成未变且单位可换算时保留技术确认，否则转技术 | [CONSTRUCTED] 排除项原值及风险保留，恢复后重新纳入门禁 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23/E24] |
| 仅单价、折扣或商务费用 | 财务重核并重判老板规则，技术结果未变可沿用 | [CONSTRUCTED] 旧价格和审批意见只读 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23/E24] |
| 联系人等不影响技术和商务的信息 | 仅保存审计，不重启无关技术审核 | [CONSTRUCTED] 原报价快照不原地改写 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23/E24] |
| 审批政策发布 | 已授权新版本生效后，未出具报价旧审批失效，回财务按新规则重判 | [CONSTRUCTED] 已出具报价继续引用原政策，不追改历史 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23/E24] |
| 已出具后再报价 | 新价格版本或新需求版本分别启动适用重审 | [CONSTRUCTED] 旧快照与文件哈希不变 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23/E24] |

[CONSTRUCTED] 问题状态为待处理、处理中、待确认、暂缓、已解决、不适用。指派/转交只变负责人；暂缓不解除阻断。不适用须由规则授权确认人提交依据，相关条件改变后重评。处理结果要校验必要值和来源；需复核的任务由确认人通过后才解决。问题结案与整包技术通过是独立记录。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E12]

## 4 检索、字段与风险规则

[FOUND] 客户认可三条主路径和一条补充路径；主路径优先级不表示每一项都必须跑完所有路径。串型号不能单独作为最终匹配条件，缺失与多结果须保留待确认。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E04/E05]

| 路径 | 入口、核对和输出 |
| --- | --- |
| 技术规范编码 | [FOUND] 编码→规范→串型/子件→拆解记录；仍核对类别、电压、导地线、描述与项目差异。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E04/E05] |
| 串型号组合 | [FOUND] 类别+串型号+电压+适用导线或地线+图册版本图号；展示所有相关候选和差异。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E04/E05] |
| 附图图册 | [FOUND] 技术文件引用→附图→图册名称/版本/图号→拆解资料，引用可回看，缺图或版本差异转核对。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E04/E05] |
| 品名描述补充 | [FOUND] 规范品名、扩充描述及标识召回候选；相关性不能代替技术一致。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E04/E05] |

[CONSTRUCTED] 四路径均定义准确匹配、多条记录、待确认和未找到；独立物资单独表达。未找到只说明当前数据快照范围，不断言产品不存在。导线串检查导线、地线串检查地线；电压和类别未确定时不能最终确认。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E04/E05/E06/E17]

[CONSTRUCTED] 同名同序号归并技术参数组来自调研记录，属于待样本核对的实现方法。主表两列图号分别保存；技术ID、规范码、串料号和子件料号分开。每套用量与采购量分别保存，单位换算须有依据。必要字段缺失保持草稿；U9缺失可保留技术候选，正式核价仍需有效物料与价格关联。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E10/E13/E22]

[FOUND] 现有红光适配器用Schema生成字段字典，同义词和风险规则库均not_configured；风险面板另按关键词、字段状态和置信度形成本地提示。本版下面的持久规则治理为拟建能力。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E10/E11/E12]

| 条件 | 阻断位置 | 责任与解除依据 |
| --- | --- | --- |
| 必需文件损坏/关键来源不可核实 | 受影响项技术确认 | [CONSTRUCTED] 销售补资料，技术核对可回查来源 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E07/E12/E24] |
| 适用导地线、电压、类别缺失 | 最终确认，允许召回 | [CONSTRUCTED] 销售取得客户确认，技术检查匹配 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E07/E12/E24] |
| 多候选、版本或项目冲突 | 技术通过 | [CONSTRUCTED] 技术核对图册/项目答复并记录裁定 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E07/E12/E24] |
| 子件必要型号、用量、材质、单位缺失 | 技术确认与核价 | [CONSTRUCTED] 技术补拆解依据，保留空值直到核实 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E07/E12/E24] |
| 数量无效或计价单位不明 | 核价 | [CONSTRUCTED] 销售核实采购量；换算由技术/财务确认 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E07/E12/E24] |
| U9缺失 | 提示；无有效价格关联时阻断核价 | [CONSTRUCTED] 技术确认物料身份，财务核实价格来源 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E07/E12/E24] |
| 价格无依据、税运费有效期不明 | 财务通过 | [CONSTRUCTED] 财务确认有效源和计算口径 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E07/E12/E24] |
| 审批触发或旧版本确认 | 下游流转与正式出具 | [CONSTRUCTED] 当前审批角色处理对应版本，不能按钮忽略 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E07/E12/E24] |

[CONSTRUCTED] 字典至少包括字段代码、对象、类型、单位、别名、适用类别/路径、必填阶段、确认角色、校验与来源格式。规范码只在编码路径需要时检查；采购号按网省/总部分存；串型号别名限定成套串；同义词发布必须审核适用性和已知样本，停用不改历史引用。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E10/E11]

## 5 核价、审批与输出

[FOUND] 合同要求规则匹配定价可复现可审计，U9/ERP/MES只读；一期规则基准价核价与二期单品成本精算分开。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E03/E24]

[CONSTRUCTED] 未税收入=各行未税单价×采购数量之和；未税成本=同口径单位成本×数量之和；毛利率=(收入−成本)/收入。收入为零不能审核。金额以十进制计算，按财务确认的行/整单精度及舍入政策保存原值和结果；无政策不得冻结正式金额规则。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E23/E24]

[CONSTRUCTED] 金额按整份含税总额>=阈值、毛利率<底线或财务主动特殊商务升级时转老板；任一配置缺失保守转老板并显示原因。配置版本随审批保存；老板意见必填，驳回转财务，可改价重提；更换串或子件必须回技术。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23]

[CONSTRUCTED] 出具的唯一事件是issueQuote事务成功：冻结需求、技术、物料主库、价格、政策、模板及审批版本，同时标已出具。文件生成状态另有处理中、成功、失败；失败重试仍使用原快照，后发政策不追改已冻结报价。报价拆行保持原客户项关联，行汇总可对账；输出名称、规格、数量/单位、单价/金额、税费与商务条款、排除范围；客户文件不含内部成本和毛利。模板授权失败、总额不平或审批过期均拒绝正式导出。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E06/E24]

## 6 合同指标与开工依赖

[CONSTRUCTED] 下表抄录合同指标的各自来源，计分分母、数据规模、舍入、时限及阶段关系需双方书面确认。文档检查或原型演示不能替代正式验收。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E18/E19/E20]

| 指标 | 合同目标与样本 | 来源及边界 |
| --- | --- | --- |
| 需求抽取准确率 | ≥95%；人工标注20份 | [FOUND] [L2: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/source-register.json S01正文2.1、附件一第1项] |
| 报价时效 | 高频品类上传至初稿半天至2小时，人工审核另计；回测20份 | [FOUND] [L2: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/source-register.json S01正文2.1段74至76；起止和规模待确认] |
| 标准件错价 | 0错价；20份标准件价格比对 | [FOUND] [L2: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/source-register.json S01正文2.1及附件一第3项] |
| 一期业务覆盖率 | 一期品类清单内高频品类≥80% | [FOUND] [L2: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/source-register.json S01正文2.1段83至85；独立分母待确认] |
| 标准串匹配命中率 | 高频品类≥80% | [FOUND] [L2: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/source-register.json S01附件一第2项段306至309；与覆盖率分开] |
| 二期品类扩充 | 高频约80% | [FOUND] [L2: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/source-register.json S01第一条1.1及二期交付，阶段关系待确认] |
| 报告关联准确率 | ≥95%；抽检10份报告核对参数 | [FOUND] [L2: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/source-register.json S01第二条2.1及附件一] |
| 并发 | ≥15人，不宕机、关键操作不超时 | [FOUND] [L2: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/source-register.json S01第二条2.1段89至91；超时阈值需书面约定] |
| 成本偏差 | ≤±8%，甲方财务口径抽样 | [FOUND] [L2: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/source-register.json S01附件一第7项] |
| 出图准确率 | ≥98%；标准件/尺寸微调；20份，全自动口径 | [FOUND] [L2: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/source-register.json S01正文2.1、附件一第8项；人工复核另记] |
| 独立维护 | 甲方IT独立维护至少1个场景 | [FOUND] [L2: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/source-register.json S01附件一第9项] |

[CONSTRUCTED] 完整依赖包括标准串总表、同一新疆750kV中标项目端到端资料、成本结构样例2至3张、U9支持/字段/只读账号、内网资源、验收口径、四类甲方分工、历史询价10至20份和授权报价模板。每项分别记已收到、待补、完整性未验或就绪；存在同类文件不能自动标完成。SC-37逐项给正常/异常条件。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E20]

## 7 现状、风险与未决事项

[FOUND] 当前原型登记文件名并生成预置样例，保存于浏览器localStorage；前端角色限制不能替代服务端授权。完整ZIP混合解析、U9、模板、正式并发与出图未在本轮接入。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E08/E09/E16]

[FOUND] 原型select当前要求导线非空，电压只有填写后才参与差异比较；没有专门地线确认对象。本版SC-09覆盖该正式需求，原型源码缺口未在本轮修复。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E17]

[CONSTRUCTED] 本版把原型整包重确认细化为受影响对象复核；仅采购量变化且每套构成/单位关系不变时保留技术引用，仅价格变化保留技术引用。该细化已获Gate 2产品设计确认，原型代码并未在本轮同步实现。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23]

[CONSTRUCTED] 未知事项集中于HANDOFF.md审查队列及inference-confirmed.json：本轮接受带明确阻断继续写文档，不把客户生产问题标已解决；新增设计取舍已获Gate 2确认；客户生产制度继续具名保留。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E19/E20/E21/E23]

## 8 功能需求与验收追踪

[CONSTRUCTED] 保留V1.0的FR及AC编号；新增FR-SR-05、FR-SC-01、FR-PR-02及AC-30至32；非功能分别对应AC-40至47。风险等级RED表示错误会影响技术正确性、金额、权限或验收；analytics_touch=false表示本轮未新增线上统计功能，审计要求仍适用。所有详细分支均为产品设计验收规格，尚未运行。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E01/E02/E07/E24]

| 需求 | 名称 | 阶段 | risk_class / money_path / analytics_touch | 场景组 | 验收 | 工作单元 | 依据 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FR-IN-01 | 资料批次、ZIP清点及来源登记 | 1 | AMBER / false / false | SC-01 | AC-01 | SL-02 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E06/E09] |
| FR-IN-02 | 单文件转换提取、质量及字段来源 | 1 | AMBER / false / false | SC-03 | AC-02 | SL-02 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E08] |
| FR-IN-03 | 包归属和跨文件关系及冲突 | 1 | AMBER / false / false | SC-04 | AC-03 | SL-02 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E06/E09] |
| FR-IN-04 | 部分失败与幂等重试 | 1 | AMBER / false / false | SC-02 | AC-04 | SL-02 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E08/E09] |
| FR-SR-01 | 技术规范编码检索 | 1 | RED / false / false | SC-05 | AC-05 | SL-04 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E04/E05] |
| FR-SR-02 | 串型号组合检索 | 1 | RED / false / false | SC-06 | AC-06 | SL-04 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E04/E05] |
| FR-SR-03 | 附图图册检索 | 1 | RED / false / false | SC-07 | AC-07 | SL-04 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E04/E05] |
| FR-SR-04 | 品名描述补充检索 | 1 | RED / false / false | SC-08 | AC-08 | SL-04 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E04/E05] |
| FR-SR-05 | 适用条件、项目差异和版本确认 | 1 | RED / false / false | SC-09, SC-10, SC-11 | AC-30 | SL-04 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E13/E17] |
| FR-SC-01 | 原始货物项与报价范围变更 | 1 | RED / true / false | SC-12 | AC-31 | SL-03 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E06/E07] |
| FR-BM-01 | BOM层级、用量和必要字段确认 | 1 | RED / true / false | SC-13 | AC-09 | SL-04 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E06/E13/E22] |
| FR-PR-02 | U9完整性与价格关联分别校验 | 1 | RED / true / false | SC-14 | AC-32 | SL-05 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E13/E24] |
| FR-RK-01 | 风险任务指派与转交 | 1 | AMBER / false / false | SC-15 | AC-10 | SL-03 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E12] |
| FR-RK-02 | 暂缓、不适用和有依据的结案 | 1 | RED / false / false | SC-16, SC-17 | AC-11 | SL-03 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E12] |
| FR-WF-01 | 销售技术并行和当前版本双确认 | 1 | RED / true / false | SC-18 | AC-12 | SL-03 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23] |
| FR-WF-02 | 技术财务退回和变更影响 | 1 | RED / true / false | SC-19, SC-20, SC-22 | AC-13 | SL-03 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23] |
| FR-AP-02 | 老板驳回、重提和审批版本一致 | 1 | RED / true / false | SC-21, SC-25 | AC-16 | SL-05 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23] |
| FR-PR-01 | 可复现核价与保存后审核 | 1 | RED / true / false | SC-23 | AC-14 | SL-05 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E24] |
| FR-AP-01 | 金额利润规则分流与政策版本 | 1 | RED / true / false | SC-24, SC-25 | AC-15 | SL-05 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23] |
| FR-QT-01 | 有效审批版本出具报价 | 1 | RED / true / false | SC-26 | AC-17 | SL-06 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E24] |
| FR-QT-02 | 不可变快照与新报价版本 | 1 | RED / true / false | SC-27 | AC-18 | SL-06 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23] |
| FR-QT-03 | 模板拆行汇总与对外字段 | 1 | RED / true / false | SC-28 | AC-19 | SL-06 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E06] |
| FR-UM-01 | 账号、角色、项目与字段权限 | 1 | RED / true / false | SC-29 | AC-29 | SL-01 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E01/E07/E24] |
| FR-MD-01 | 按对象路径生效的字段字典 | 1 | AMBER / false / false | SC-30 | AC-20 | SL-01 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E10/E11] |
| FR-MD-02 | 同义词建议审核发布及回归 | 1 | AMBER / false / false | SC-31 | AC-21 | SL-01 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E10/E11] |
| FR-MD-03 | 主库导入审核与版本治理 | 1 | AMBER / false / false | SC-32 | AC-22 | SL-01 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E13] |
| NFR-01 | 内网部署 | 1 | RED / false / false | SC-33 | AC-40 | SL-07 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24] |
| NFR-02 | ERP/MES只读 | 1 | RED / true / false | SC-33 | AC-41 | SL-07 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24] |
| NFR-03 | 审计 | 1 | RED / true / false | SC-33 | AC-42 | SL-07 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24] |
| NFR-04 | 备份恢复 | 1 | RED / true / false | SC-33 | AC-43 | SL-07 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24] |
| NFR-05 | 至少15人并发 | 1 | RED / false / false | SC-33 | AC-44 | SL-07 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24] |
| NFR-06 | 幂等重试 | 1 | RED / false / false | SC-33 | AC-45 | SL-07 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24] |
| NFR-07 | 金额精度和并发版本 | 1 | RED / true / false | SC-33 | AC-46 | SL-07 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24] |
| NFR-08 | 离线资源 | 1 | RED / false / false | SC-33 | AC-47 | SL-07 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24] |
| FR-P2-01 | 单品成本库及核算 | 2 | RED / true / false | SC-34 | AC-23 | SL-08 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20] |
| FR-P2-02 | 审批后的材料价人工导入 | 2 | RED / true / false | SC-34 | AC-24 | SL-08 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E24] |
| FR-P2-03 | 品类扩充与三类项目报价比对 | 2 | AMBER / true / false | SC-34 | AC-25 | SL-08 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E19/E21] |
| FR-P3-01 | 报告参数与技术文件关联 | 3 | RED / false / false | SC-35 | AC-26 | SL-09 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02] |
| FR-P3-02 | POC门禁和参数化出图 | 3 | RED / false / false | SC-36 | AC-27 | SL-09 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E18] |
| FR-P3-03 | 阶段依赖、交付资料和独立维护验收 | 跨阶段 | AMBER / false / false | SC-37 | AC-28 | SL-07 | [CONSTRUCTED] [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E20] |

## 9 逐分支验收场景

[CONSTRUCTED] 下列输入中的金额、数量、人员和配置示例仅用于构造验收，不是客户制度或真实报价。每个场景必须以实际记录核对：Actor角色、Given前置、When操作、Then结果、Evidence证据同时满足；证据缺失记不可判定，不能计为通过。复合组任一必要分支不完整，该组不得计入文档覆盖分子。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E07/E24]

### SC-01 资料批次与ZIP目录

#### FR-IN-01.1

[CONSTRUCTED] Trace：FR-IN-01 → FR-IN-01.1 → SL-02；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E06/E09]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售 |
| 前置输入 | 一次提交2个散文件与含2个文件的ZIP |
| 操作 | 登记后主动开始处理 |
| 预期结果 | 保留3个顶层文件、ZIP的2个子文件及内部路径；形成一个资料批次，不按文件数自动创建业务包 |
| 核对证据 | 批次文件树、文件哈希、处理记录 |

#### FR-IN-01.2

[CONSTRUCTED] Trace：FR-IN-01 → FR-IN-01.2 → SL-02；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E06/E09]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售 |
| 前置输入 | ZIP内有../越界路径或超过已配置层级/解压额度的条目 |
| 操作 | 开始清点 |
| 预期结果 | 拒绝危险条目且不写出允许目录；显示异常及受影响文件，其余文件可继续 |
| 核对证据 | 异常清单、受控目录检查、批次状态 |

### SC-02 异常文件与幂等重试

#### FR-IN-04.1

[CONSTRUCTED] Trace：FR-IN-04 → FR-IN-04.1 → SL-02；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E08/E09]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售 |
| 前置输入 | 一文件解析失败、另一文件成功 |
| 操作 | 补传修正文件并对失败任务重试两次 |
| 预期结果 | 保留原失败记录与成功项；同幂等键返回同次结果，不重复创建货物项 |
| 核对证据 | 任务ID、幂等记录、前后货物项ID |

#### FR-IN-04.2

[CONSTRUCTED] Trace：FR-IN-04 → FR-IN-04.2 → SL-02；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E08/E09]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售 |
| 前置输入 | 文件加密、损坏、零字节或转换超时 |
| 操作 | 解析或重试 |
| 预期结果 | 分别显示原因、可采取动作；不可把部分成功显示全部完成，不可静默丢文件 |
| 核对证据 | 逐文件状态、异常码、成功结果保留记录 |

### SC-03 提取来源与人工修订

#### FR-IN-02.1

[CONSTRUCTED] Trace：FR-IN-02 → FR-IN-02.1 → SL-02；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E08]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售 |
| 前置输入 | 原文件含750KV且转换有可用来源 |
| 操作 | 提取并人工确认750 kV |
| 预期结果 | 原值750KV不改，规范值和确认值分别保存；原件位置可回看 |
| 核对证据 | 字段四值、确认人、版本、来源位置 |

#### FR-IN-02.2

[CONSTRUCTED] Trace：FR-IN-02 → FR-IN-02.2 → SL-02；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E08]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 提取低质量或来源定位无法重开 |
| 操作 | 尝试确认受影响关键字段 |
| 预期结果 | 标记待核对，保留原文及无法定位原因；补可验证依据前阻断最终技术确认 |
| 核对证据 | 字段质量、来源检查结果、拒绝原因 |

### SC-04 包归属与跨文件冲突

#### FR-IN-03.1

[CONSTRUCTED] Trace：FR-IN-03 → FR-IN-03.1 → SL-02；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E06/E09]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售 |
| 前置输入 | 同一批次清单含两个包，多个技术文件可关联其中一包 |
| 操作 | 确认分标/包名称/分包编号 |
| 预期结果 | 保留两个包、清单顺序和多文件关系；稳定ID不只用包名称 |
| 核对证据 | 包与货物项清单、关联表、源序号 |

#### FR-IN-03.2

[CONSTRUCTED] Trace：FR-IN-03 → FR-IN-03.2 → SL-02；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E06/E09]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售与技术 |
| 前置输入 | 清单与规范同字段不同值，或两个包名称相同但分标不同 |
| 操作 | 自动关联后人工核对 |
| 预期结果 | 保留各来源值和歧义候选；未确定归属不跨包合并；销售登记客户结论、技术复核 |
| 核对证据 | 冲突清单、归属确认及原值 |

### SC-05 技术编码检索

#### FR-SR-01.1

[CONSTRUCTED] Trace：FR-SR-01 → FR-SR-01.1 → SL-04；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E04/E05]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 技术编码9111-500085186-00026，750 kV与400/50等项目条件齐全 |
| 操作 | 按技术编码检索并核对子件 |
| 预期结果 | 展示源表对应候选及12条子件、U9缺口；一致后可记录技术选择，空缺仍为空 |
| 核对证据 | 查询条件、主库版本、源表行及选择依据 |

#### FR-SR-01.2

[CONSTRUCTED] Trace：FR-SR-01 → FR-SR-01.2 → SL-04；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E04/E05]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 同编码候选项目条件冲突，或当前快照无该编码 |
| 操作 | 检索并尝试采用 |
| 预期结果 | 冲突候选显示差异且不可直接通过；零结果显示未找到并保留查询，可切换路径或人工处理 |
| 核对证据 | 差异/零结果状态、切换路径记录 |

### SC-06 串型号组合检索

#### FR-SR-02.1

[CONSTRUCTED] Trace：FR-SR-02 → FR-SR-02.1 → SL-04；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E04/E05]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 06XZ11-4000-10P(H)-1A铝与66kV、300/40、类别、2011图册、图6-1-57齐全 |
| 操作 | 组合检索并核对 |
| 预期结果 | 可定位6条子件；同型号110kV或240/30记录不合并为已确认结果 |
| 核对证据 | 各条件、候选差异、6条源行 |

#### FR-SR-02.2

[CONSTRUCTED] Trace：FR-SR-02 → FR-SR-02.2 → SL-04；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E04/E05]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 串型号已知但导地线缺失，或组合无结果 |
| 操作 | 检索 |
| 预期结果 | 缺字段可显示候选但不能确认；零结果保持未找到，不造记录，可补条件/换路径/人工处理 |
| 核对证据 | 缺失提示、确认门禁、查询历史 |

### SC-07 附图图册检索

#### FR-SR-03.1

[CONSTRUCTED] Trace：FR-SR-03 → FR-SR-03.1 → SL-04；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E04/E05]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 规范引用同目录附图，附图有图册名称版本图号 |
| 操作 | 沿引用链检索 |
| 预期结果 | 依次可回看规范、附图、图册和拆解记录；关键条件一致后进入待人工确认 |
| 核对证据 | 文件关系、引用链、主库记录来源 |

#### FR-SR-03.2

[CONSTRUCTED] Trace：FR-SR-03 → FR-SR-03.2 → SL-04；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E04/E05]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 引用图样缺失或只有不同版本记录 |
| 操作 | 检索并试图采用 |
| 预期结果 | 显示缺图或版本差异；无对应记录为未找到，转补图/人工查证；不悄用新版替代 |
| 核对证据 | 引用异常、候选版本、阻断原因 |

### SC-08 品名描述补充检索

#### FR-SR-04.1

[CONSTRUCTED] Trace：FR-SR-04 → FR-SR-04.1 → SL-04；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E04/E05]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 仅有品名、扩充描述和部分标识 |
| 操作 | 执行补充查询 |
| 预期结果 | 显示相关候选及命中字段；须补足适用技术条件后才能进入最终确认 |
| 核对证据 | 路径=补充、匹配解释、确认条件 |

#### FR-SR-04.2

[CONSTRUCTED] Trace：FR-SR-04 → FR-SR-04.2 → SL-04；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E04/E05]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 补充查询零结果 |
| 操作 | 查看结果并继续操作 |
| 预期结果 | 显示当前快照范围内未找到，不断言产品不存在；允许补资料及人工检索，禁止生成虚构候选 |
| 核对证据 | 数据范围、零结果文案、后续处理入口 |

### SC-09 电压及导地线缺失

#### FR-SR-05.1

[CONSTRUCTED] Trace：FR-SR-05 → FR-SR-05.1 → SL-04；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E13/E17]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 导线串有导线条件，地线串有地线条件，均有电压与用途 |
| 操作 | 分别确认两条货物项 |
| 预期结果 | 按类别检查对应导线或地线，不要求地线串填写无关导线；保存确认条件快照 |
| 核对证据 | 类型与字段字典规则、两条确认记录 |

#### FR-SR-05.2

[CONSTRUCTED] Trace：FR-SR-05 → FR-SR-05.2 → SL-04；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E13/E17]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 电压缺失或适用导线/地线缺失 |
| 操作 | 检索后尝试确认 |
| 预期结果 | 允许召回；拒绝确认并点出缺项，不从串型号/邻行推定条件；类别未明也不得绕过 |
| 核对证据 | 缺失列表、原值、拒绝事件 |

### SC-10 多候选与项目差异

#### FR-SR-05.3

[CONSTRUCTED] Trace：FR-SR-05 → FR-SR-05.3 → SL-04；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E13/E17]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 多个候选均可召回且存在接口或项目差异 |
| 操作 | 比较并记录采用依据 |
| 预期结果 | 展示每候选关键差异及依据；只在项目条件核实后选定，其余候选仍可回查 |
| 核对证据 | 候选集、设计答复、选择及不采用理由 |

#### FR-SR-05.4

[CONSTRUCTED] Trace：FR-SR-05 → FR-SR-05.4 → SL-04；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E13/E17]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售或技术 |
| 前置输入 | 有多个未裁定候选或机械条件冲突 |
| 操作 | 销售试选或技术无依据确认 |
| 预期结果 | 销售无确认权；技术未核实冲突不通过，不能自动采用第一条 |
| 核对证据 | 权限拒绝、冲突任务、候选顺序不影响结果 |

### SC-11 图册版本与两个图号

#### FR-SR-05.5

[CONSTRUCTED] Trace：FR-SR-05 → FR-SR-05.5 → SL-04；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E13/E17]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 源表H/I均为分册图号，值分别图6-1-57和图6-1-057 |
| 操作 | 导入并核对 |
| 预期结果 | 两列原值与列位置分别保留；技术可附等价依据，不直接覆盖成一个原值 |
| 核对证据 | H/I原单元格、规范映射和确认依据 |

#### FR-SR-05.6

[CONSTRUCTED] Trace：FR-SR-05 → FR-SR-05.6 → SL-04；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E13/E17]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 项目引用2011版但只有2024版或不同图号候选 |
| 操作 | 尝试沿用 |
| 预期结果 | 保持版本差异与待确认，不静默合并；仅在取得明确适用依据后记录采用 |
| 核对证据 | 版本差异、图样引用与采用说明 |

### SC-12 独立物资与报价范围

#### FR-SC-01.1

[CONSTRUCTED] Trace：FR-SC-01 → FR-SC-01.1 → SL-03；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E06/E07]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售 |
| 前置输入 | 包内含3个串与1个独立间隔棒 |
| 操作 | 确认本次报价范围 |
| 预期结果 | 四个原项都保留；间隔棒单列不混入串结果，报价列排除范围 |
| 核对证据 | 原始项计数、包含/排除清单 |

#### FR-SC-01.2

[CONSTRUCTED] Trace：FR-SC-01 → FR-SC-01.2 → SL-03；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E06/E07]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售 |
| 前置输入 | 一串仍有技术阻断 |
| 操作 | 尝试排除且不填依据，或排除后恢复 |
| 预期结果 | 无依据拒绝；有依据可变更范围但留痕并使范围/核价审批失效；恢复后原未解风险重新参与门禁 |
| 核对证据 | 范围版本、风险保留、审批失效记录 |

### SC-13 BOM数量与必要字段

#### FR-BM-01.1

[CONSTRUCTED] Trace：FR-BM-01 → FR-BM-01.1 → SL-04；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E06/E13/E22]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 测试串采购数量10套，每套子件2件，子件必要字段完整 |
| 操作 | 生成BOM并确认 |
| 预期结果 | 每套2件、总用量20件分别展示，串料号与子件料号分开，不覆盖原采购量 |
| 核对证据 | BOM版本、2×10计算、串/子件字段 |

#### FR-BM-01.2

[CONSTRUCTED] Trace：FR-BM-01 → FR-BM-01.2 → SL-04；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E06/E13/E22]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 子件用量为0/空、单位不明或适用必要材质缺失 |
| 操作 | 提交BOM确认 |
| 预期结果 | 生成草稿和问题，未核实有效用量/单位/材质不能技术通过；参数按名称+序号分组有源位置 |
| 核对证据 | 草稿、必要字段规则及阻断任务 |

### SC-14 U9缺失与有效价格关联

#### FR-PR-02.1

[CONSTRUCTED] Trace：FR-PR-02 → FR-PR-02.1 → SL-05；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E13/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术与财务 |
| 前置输入 | 子件无U9料号，但技术物料身份明确且有经财务确认的有效报价依据 |
| 操作 | 技术核对后核价 |
| 预期结果 | U9仍空并标待补充；价格依据绑定物料身份、版本、单位和有效期，财务可审核 |
| 核对证据 | 技术确认、物料映射、价格依据 |

#### FR-PR-02.2

[CONSTRUCTED] Trace：FR-PR-02 → FR-PR-02.2 → SL-05；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E13/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 财务 |
| 前置输入 | U9字段存在但查不到对应价格，或只有相似型号价格 |
| 操作 | 尝试核价通过 |
| 预期结果 | 无有效关联或价格过期拒绝通过，不能按料号非空直接放行；请求有效价格 |
| 核对证据 | 价格关联失败记录、期效检查、拒绝原因 |

### SC-15 问题指派与转交

#### FR-RK-01.1

[CONSTRUCTED] Trace：FR-RK-01 → FR-RK-01.1 → SL-03；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E12]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售 |
| 前置输入 | 当前技术问题未解决，有两个技术人员可分配 |
| 操作 | 指派李工再转交周工（测试人员） |
| 预期结果 | 只有周工为当前负责人，原指派留痕；问题仍未解决，门禁不变 |
| 核对证据 | 任务ID、指派链、版本与未解状态 |

#### FR-RK-01.2

[CONSTRUCTED] Trace：FR-RK-01 → FR-RK-01.2 → SL-03；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E12]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售 |
| 前置输入 | 试图指派停用账号、无项目权限者或未选人员 |
| 操作 | 保存指派 |
| 预期结果 | 拒绝且原负责人不变；不能得到无人负责的处理中任务 |
| 核对证据 | 授权校验、原负责人、拒绝记录 |

### SC-16 暂缓与不适用判定

#### FR-RK-02.1

[CONSTRUCTED] Trace：FR-RK-02 → FR-RK-02.1 → SL-03；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E12]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 当前负责人 |
| 前置输入 | 技术阻断尚未解决 |
| 操作 | 点击暂缓 |
| 预期结果 | 可记录暂缓原因，仍计未解阻断，不能因此提交技术通过或财务 |
| 核对证据 | 任务状态、阻断列表及门禁结果 |

#### FR-RK-02.2

[CONSTRUCTED] Trace：FR-RK-02 → FR-RK-02.2 → SL-03；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E12]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 规则授权确认人 |
| 前置输入 | 规则可能不适用当前对象 |
| 操作 | 无依据尝试不适用，再提交适用性依据 |
| 预期结果 | 无依据拒绝；有权限且依据充分可标不适用并保留规则/确认人/版本；相关条件变更后重新评估 |
| 核对证据 | 适用性证据、不适用记录、变更重评结果 |

### SC-17 有权限人员处理与确认

#### FR-RK-02.3

[CONSTRUCTED] Trace：FR-RK-02 → FR-RK-02.3 → SL-03；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E12]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 当前指派负责人 |
| 前置输入 | 问题的必要补充已具备 |
| 操作 | 填写结果与可回查依据并提交结案 |
| 预期结果 | 检查适用规则已满足后解决；若需复核则先待确认，由规则授权确认人通过后解决 |
| 核对证据 | 处理值、依据、处理/确认人及版本 |

#### FR-RK-02.4

[CONSTRUCTED] Trace：FR-RK-02 → FR-RK-02.4 → SL-03；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E12]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 同角色非负责人或未授权人员 |
| 前置输入 | 他人任务未解，或仅填已处理但缺必要值 |
| 操作 | 请求结案 |
| 预期结果 | 拒绝越权或无效内容；填写文本不能替代满足字段条件，原阻断仍保留 |
| 核对证据 | 接口拒绝、原任务、字段校验 |

### SC-18 销售技术双确认汇合

#### FR-WF-01.1

[CONSTRUCTED] Trace：FR-WF-01 → FR-WF-01.1 → SL-03；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售与技术 |
| 前置输入 | 纳入项均有技术结果且销售阻断已解除 |
| 操作 | 双方以任意先后顺序确认当前需求包 |
| 预期结果 | 保存独立确认人和版本；两者对应当前版本且核价前阻断均解除才可转财务 |
| 核对证据 | 双确认版本、全包门禁计算记录 |

#### FR-WF-01.2

[CONSTRUCTED] Trace：FR-WF-01 → FR-WF-01.2 → SL-03；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售或技术 |
| 前置输入 | 仅一方确认，或另一方版本过期，或纳入项有阻断 |
| 操作 | 提交财务 |
| 预期结果 | 三种情况均拒绝并列缺少条件；包内其他任务可继续 |
| 核对证据 | 版本引用、拒绝原因、并行任务状态 |

### SC-19 技术退回补充

#### FR-WF-02.1

[CONSTRUCTED] Trace：FR-WF-02 → FR-WF-02.1 → SL-03；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 可从已有图册核对图号的技术问题 |
| 操作 | 自行核对并记录结果 |
| 预期结果 | 解决自己的技术问题，不强制退销售；仍需完成整项及整包确认 |
| 核对证据 | 图册依据、问题与整包确认独立记录 |

#### FR-WF-02.2

[CONSTRUCTED] Trace：FR-WF-02 → FR-WF-02.2 → SL-03；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术与销售 |
| 前置输入 | 清单与规范导线冲突且需客户答复 |
| 操作 | 技术退回指定字段，销售取得答复后修订 |
| 预期结果 | 技术不得改客户确认值；销售附答复，受影响技术、核价和审批失效后重审 |
| 核对证据 | 退回原因/字段、答复、版本变化 |

### SC-20 财务退回商务或技术问题

#### FR-WF-02.3

[CONSTRUCTED] Trace：FR-WF-02 → FR-WF-02.3 → SL-03；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 财务与销售 |
| 前置输入 | 仅缺运费或报价有效期，技术要求未变 |
| 操作 | 退商务事项给销售补充 |
| 预期结果 | 记录商务补充，财务重核；无需重跑未受影响技术，审批重判 |
| 核对证据 | 商务版本、原技术确认、核价/审批状态 |

#### FR-WF-02.4

[CONSTRUCTED] Trace：FR-WF-02 → FR-WF-02.4 → SL-03；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 财务与技术 |
| 前置输入 | BOM物料关系或子件数量不明确 |
| 操作 | 退回技术协作 |
| 预期结果 | 失效受影响技术/价格及整份金额审批；财务不能替技术改BOM通过 |
| 核对证据 | 退回任务、受影响对象、原审批历史 |

### SC-21 老板利润驳回重提

#### FR-AP-02.1

[CONSTRUCTED] Trace：FR-AP-02 → FR-AP-02.1 → SL-05；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 老板与财务 |
| 前置输入 | 待老板审批且老板认为利润不足 |
| 操作 | 填写利润意见退回，财务改价重提 |
| 预期结果 | 原审批意见与价格版本保留；新价格重新核价和判断触发条件后提交 |
| 核对证据 | 两次价格版本、退回与重提记录 |

#### FR-AP-02.2

[CONSTRUCTED] Trace：FR-AP-02 → FR-AP-02.2 → SL-05；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 老板 |
| 前置输入 | 报价仍存在技术冲突，或意见为空 |
| 操作 | 尝试利润例外通过 |
| 预期结果 | 技术冲突不能被利润例外解除；无意见不能通过；只能退到有权处理角色 |
| 核对证据 | 拒绝原因、技术阻断、审批记录 |

### SC-22 需求变化影响范围

#### FR-WF-02.5

[CONSTRUCTED] Trace：FR-WF-02 → FR-WF-02.5 → SL-03；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售/技术/财务 |
| 前置输入 | 已核对报价分别发生技术参数、采购量、单价或联系人改变 |
| 操作 | 保存各类独立变更 |
| 预期结果 | 技术变化重审受影响项；仅采购量变化重确认销售范围并重核价；改价重核财务；纯联系人留痕而不重审无关技术 |
| 核对证据 | 变更类型、影响集合及各版本 |

#### FR-WF-02.6

[CONSTRUCTED] Trace：FR-WF-02 → FR-WF-02.6 → SL-03；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 任一业务人员 |
| 前置输入 | 新版本已存在但持有旧版本表单或确认 |
| 操作 | 提交更新/确认 |
| 预期结果 | 拒绝覆盖，展示版本冲突；用户重载后重新决定，不自动覆盖新值 |
| 核对证据 | expectedRevision、当前版本、冲突响应 |

### SC-23 核价保存与计算依据

#### FR-PR-01.1

[CONSTRUCTED] Trace：FR-PR-01 → FR-PR-01.1 → SL-05；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 财务 |
| 前置输入 | 技术结果已确认，价格来源及规则版本有效，财务测试配置已设精度 |
| 操作 | 保存核价并复算 |
| 预期结果 | 使用未税收入和同口径成本计算毛利；十进制及已设舍入规则得到相同结果，保存输入快照 |
| 核对证据 | 价格源、规则版本、复算明细及舍入配置 |

#### FR-PR-01.2

[CONSTRUCTED] Trace：FR-PR-01 → FR-PR-01.2 → SL-05；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 财务 |
| 前置输入 | 收入为0、价格负值/非数、无依据、税运费口径未定或编辑未保存 |
| 操作 | 申请审核 |
| 预期结果 | 拒绝对应无效输入；未保存草稿不得作为审批版本，不把演示税率当正式配置 |
| 核对证据 | 逐字段错误、已保存版本、审批快照 |

### SC-24 审批触发及阈值未知

#### FR-AP-01.1

[CONSTRUCTED] Trace：FR-AP-01 → FR-AP-01.1 → SL-05；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 财务 |
| 前置输入 | 仅用于测试：含税门槛T=100000、毛利底线M=20%，配置完整 |
| 操作 | 分别提交金额T-0.01、T、T+0.01及毛利M-0.01/M/M+0.01的已核价版本 |
| 预期结果 | 金额>=T或毛利<M触发老板；均未触发且无主动升级可待出具；同时触发保留所有原因 |
| 核对证据 | 六个边界输入及各触发原因；数值注明测试配置 |

#### FR-AP-01.2

[CONSTRUCTED] Trace：FR-AP-01 → FR-AP-01.2 → SL-05；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 财务 |
| 前置输入 | 金额门槛或毛利红线任一未配，或主动提交特殊商务事项 |
| 操作 | 审核通过并分流 |
| 预期结果 | 任一缺配置保守走老板，明确未配原因；主动升级走老板，不能自动免审 |
| 核对证据 | 配置完整性、主动升级原因和路由记录 |

### SC-25 审批期间并发及规则变更

#### FR-AP-01.3

[CONSTRUCTED] Trace：FR-AP-01 → FR-AP-01.3 → SL-05；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 老板/管理员 |
| 前置输入 | 报价提交时规则版本P1，发布已授权的新规则P2且报价未出具 |
| 操作 | 尝试按旧政策通过或出具 |
| 预期结果 | 本设计采用未出具报价重算政策：旧审批失效，回财务按P2重判；历史已出具不改 |
| 核对证据 | 政策发布授权、P1/P2及失效记录 |

#### FR-AP-02.3

[CONSTRUCTED] Trace：FR-AP-02 → FR-AP-02.3 → SL-05；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 老板 |
| 前置输入 | 两审批窗口都引用同一旧报价版本，另一窗口已退回或价格改变 |
| 操作 | 提交旧通过请求 |
| 预期结果 | 版本校验拒绝，不能复活已退回审批；同幂等键重复成功请求返回同记录 |
| 核对证据 | 审批修订号、幂等键、唯一审批结果 |

### SC-26 出具条件与报价快照

#### FR-QT-01.1

[CONSTRUCTED] Trace：FR-QT-01 → FR-QT-01.1 → SL-06；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售 |
| 前置输入 | 当前需求、技术、价格及规则版本审核有效 |
| 操作 | 出具报价 |
| 预期结果 | 同一事务创建不可变快照与导出任务并标已出具；文件单独处于处理中/成功/失败，关联版本及纳入/排除项齐全 |
| 核对证据 | 快照ID、输入版本、审核链及导出任务 |

#### FR-QT-01.2

[CONSTRUCTED] Trace：FR-QT-01 → FR-QT-01.2 → SL-06；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售 |
| 前置输入 | 审批无效、未完成或出具请求重复 |
| 操作 | 申请出具 |
| 预期结果 | 无有效审批拒绝；重复幂等键不重复快照，生成失败保留可重试状态 |
| 核对证据 | 门禁响应、唯一快照、失败原因 |

#### FR-QT-01.3

[CONSTRUCTED] Trace：FR-QT-01 → FR-QT-01.3 → SL-06；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售/财务 |
| 前置输入 | issueQuote成功已原子冻结Q1并记已出具，导出任务随后失败，期间审批政策由P1发布为P2 |
| 操作 | 重试Q1导出，并另建Q2申请改价 |
| 预期结果 | Q1继续按冻结时有效的P1及原价生成文件，已出具状态不回退；Q2是新报价需按当前P2重新审批；政策发布与issue并发时事务校验决定单一先后次序 |
| 核对证据 | Q1冻结事件、导出任务失败/重试、政策版本、Q2审核及事件顺序 |

### SC-27 已出具报价新版本

#### FR-QT-02.1

[CONSTRUCTED] Trace：FR-QT-02 → FR-QT-02.1 → SL-06；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售 |
| 前置输入 | 报价Q1已出具，客户要求仅改价 |
| 操作 | 创建价格新版本 |
| 预期结果 | Q1不可改；技术引用未变可沿用，价格与审批重核，生成Q2独立快照 |
| 核对证据 | Q1/Q2引用、核价版本、旧文件校验值 |

#### FR-QT-02.2

[CONSTRUCTED] Trace：FR-QT-02 → FR-QT-02.2 → SL-06；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E07/E23]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售与技术 |
| 前置输入 | 报价Q1已出具且客户改导地线或BOM |
| 操作 | 创建需求新版本或试图直接覆盖Q1 |
| 预期结果 | 直接改Q1拒绝；新版本失效受影响技术/价格/审批，重新流程，旧Q1原样保留 |
| 核对证据 | 旧快照哈希、新需求与重审范围 |

### SC-28 报价模板与对外可见数据

#### FR-QT-03.1

[CONSTRUCTED] Trace：FR-QT-03 → FR-QT-03.1 → SL-06；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E06]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售 |
| 前置输入 | 一客户项拆金具串/绝缘子/附件3行且模板被批准 |
| 操作 | 按红光模板或客户授权模板导出 |
| 预期结果 | 行与原项ID关联，金额汇总回原项，列税费商务条款及排除范围；不导内部成本毛利 |
| 核对证据 | 模板版本、客户文件、行汇总对账 |

#### FR-QT-03.2

[CONSTRUCTED] Trace：FR-QT-03 → FR-QT-03.2 → SL-06；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E06]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术或销售 |
| 前置输入 | 未授权模板、越权看金额或错误拆行总额 |
| 操作 | 预览/导出 |
| 预期结果 | 技术不可获取最终价格文件；未授权模板/金额不平衡拒绝正式导出，保留失败原因 |
| 核对证据 | 响应数据白名单、模板权限与金额检查 |

### SC-29 账号角色与项目数据权限

#### FR-UM-01.1

[CONSTRUCTED] Trace：FR-UM-01 → FR-UM-01.1 → SL-01；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E01/E07/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 管理员 |
| 前置输入 | 账号在授权项目及角色内 |
| 操作 | 创建/分配/停用角色账号并检查可见字段 |
| 预期结果 | 权限变更留痕；销售只见对外价，技术不见成本/利润/最终价，管理员不自带审批 |
| 核对证据 | 授权矩阵、API响应字段、权限日志 |

#### FR-UM-01.2

[CONSTRUCTED] Trace：FR-UM-01 → FR-UM-01.2 → SL-01；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E01/E07/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 停用账号/跨项目用户/管理员 |
| 前置输入 | 持有旧页面或猜测其他包ID |
| 操作 | 请求读取或执行审批 |
| 预期结果 | 服务端拒绝；页面隐藏不是唯一控制；停用会话不能继续操作，管理员不能批准业务 |
| 核对证据 | 身份状态、服务端拒绝与项目隔离证据 |

### SC-30 字段字典与来源映射

#### FR-MD-01.1

[CONSTRUCTED] Trace：FR-MD-01 → FR-MD-01.1 → SL-01；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E10/E11]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术/字段管理员 |
| 前置输入 | 输入同时含网省和总部采购号、技术ID和规范码、串型号两个别名 |
| 操作 | 按来源字典提取 |
| 预期结果 | 不同业务标识分别存；同义别名只在相应对象范围归一，保留原列和原值 |
| 核对证据 | 字典版本、映射结果与来源 |

#### FR-MD-01.2

[CONSTRUCTED] Trace：FR-MD-01 → FR-MD-01.2 → SL-01；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E10/E11]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 技术规范码为空但有合法串型号组合，或项目名/工程名同时存在且不同 |
| 操作 | 执行字段必填校验 |
| 预期结果 | 规范码不全局封锁其它路径；不同名称保留两值并标关系待确认，不静默覆盖 |
| 核对证据 | 按路径必填规则与冲突输出 |

### SC-31 同义词建议发布与停用

#### FR-MD-02.1

[CONSTRUCTED] Trace：FR-MD-02 → FR-MD-02.1 → SL-01；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E10/E11]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 销售/技术 |
| 前置输入 | 新同义词建议有来源、对象和适用范围 |
| 操作 | 提出、技术复核样本、发布 |
| 预期结果 | 发布生成新版本，记录提出/审核人及样本结果；后续解析用新版本，历史报价不改 |
| 核对证据 | 建议、审核、发布版本及回归样本记录 |

#### FR-MD-02.2

[CONSTRUCTED] Trace：FR-MD-02 → FR-MD-02.2 → SL-01；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E10/E11]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 误映射将两类采购号合并，或无样本就发布 |
| 操作 | 发布或停用错误版本 |
| 预期结果 | 未通过适用性与已知样本检查拒绝发布；已发布错误版本可停用，已生成结果标出影响，历史引用保留 |
| 核对证据 | 失败样本、停用记录、影响结果列表 |

### SC-32 主库导入与版本质量

#### FR-MD-03.1

[CONSTRUCTED] Trace：FR-MD-03 → FR-MD-03.1 → SL-01；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E13]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术/主数据管理员 |
| 前置输入 | 拆解Excel含成套A-I列与子件J-X列 |
| 操作 | 导入待审核快照并发布 |
| 预期结果 | 保留原文件、原行、两图号及空值；经分组/重复/必需字段校核后发布版本，原Excel只读 |
| 核对证据 | 导入报告、源文件哈希、发布记录 |

#### FR-MD-03.2

[CONSTRUCTED] Trace：FR-MD-03 → FR-MD-03.2 → SL-01；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E05/E13]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 同编码多成套、同型号不同物料或子件数量异常 |
| 操作 | 导入并尝试自动补值 |
| 预期结果 | 不以编码当唯一成套键，不邻行补缺；异常组保持不可发布或隔离，合格组发布范围明确 |
| 核对证据 | 异常分组、发布范围、未改原值 |

### SC-33 U9只读、内网与运行恢复

#### NFR-02.1

[CONSTRUCTED] Trace：NFR-02 → NFR-02.1 → SL-07；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户IT/财务与验收人员 |
| 前置输入 | 已授权只读U9测试账号 |
| 操作 | 同步批准字段 |
| 预期结果 | 只读读取并记录账套、源时间和字段范围 |
| 核对证据 | 只读接口专项记录、输入配置、执行日志与签认结果 |

#### NFR-02.2

[CONSTRUCTED] Trace：NFR-02 → NFR-02.2 → SL-07；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户IT/财务与验收人员 |
| 前置输入 | 已授权只读U9测试账号，并模拟相应异常 |
| 操作 | 同步批准字段 |
| 预期结果 | 写请求无可用业务入口且被上游权限拒绝；断连不展示旧值为实时 |
| 核对证据 | 只读接口异常证据、失败/不可判定原因与复测前置条件 |

#### NFR-01.1

[CONSTRUCTED] Trace：NFR-01 → NFR-01.1 → SL-07；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户IT/财务与验收人员 |
| 前置输入 | 应用/数据库/模型/OCR/存储在测试内网且禁止外联 |
| 操作 | 处理样本并记录网络访问 |
| 预期结果 | 客户内容处理留在内网，无外部数据调用 |
| 核对证据 | 内网部署专项记录、输入配置、执行日志与签认结果 |

#### NFR-01.2

[CONSTRUCTED] Trace：NFR-01 → NFR-01.2 → SL-07；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户IT/财务与验收人员 |
| 前置输入 | 应用/数据库/模型/OCR/存储在测试内网且禁止外联，并模拟相应异常 |
| 操作 | 处理样本并记录网络访问 |
| 预期结果 | 若任一模块依赖外部数据发送，则部署验收不通过并禁止正式导入客户文件 |
| 核对证据 | 内网部署异常证据、失败/不可判定原因与复测前置条件 |

#### NFR-08.1

[CONSTRUCTED] Trace：NFR-08 → NFR-08.1 → SL-07；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户IT/财务与验收人员 |
| 前置输入 | 断开外网且清理浏览器缓存 |
| 操作 | 打开主要页面及图标 |
| 预期结果 | 本地字体、图标、脚本正常加载 |
| 核对证据 | 离线资源专项记录、输入配置、执行日志与签认结果 |

#### NFR-08.2

[CONSTRUCTED] Trace：NFR-08 → NFR-08.2 → SL-07；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户IT/财务与验收人员 |
| 前置输入 | 断开外网且清理浏览器缓存，并模拟相应异常 |
| 操作 | 打开主要页面及图标 |
| 预期结果 | 任何外部CDN依赖或关键资源加载失败都记为未通过 |
| 核对证据 | 离线资源异常证据、失败/不可判定原因与复测前置条件 |

#### NFR-03.1

[CONSTRUCTED] Trace：NFR-03 → NFR-03.1 → SL-07；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户IT/财务与验收人员 |
| 前置输入 | 完成上传、改值、核价、审批、导出和权限变更 |
| 操作 | 抽查日志 |
| 预期结果 | 事件能定位角色、人员、对象、版本、前后值或引用、时间与原因，不含密钥 |
| 核对证据 | 审计专项记录、输入配置、执行日志与签认结果 |

#### NFR-03.2

[CONSTRUCTED] Trace：NFR-03 → NFR-03.2 → SL-07；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户IT/财务与验收人员 |
| 前置输入 | 完成上传、改值、核价、审批、导出和权限变更，并模拟相应异常 |
| 操作 | 抽查日志 |
| 预期结果 | 任一关键动作无日志或含密钥则该分支失败 |
| 核对证据 | 审计异常证据、失败/不可判定原因与复测前置条件 |

#### NFR-04.1

[CONSTRUCTED] Trace：NFR-04 → NFR-04.1 → SL-07；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户IT/财务与验收人员 |
| 前置输入 | 含原件、确认记录和报价的已备份项目 |
| 操作 | 在隔离环境恢复 |
| 预期结果 | 全部被抽样报价可回查原件及版本，快照哈希一致 |
| 核对证据 | 恢复专项记录、输入配置、执行日志与签认结果 |

#### NFR-04.2

[CONSTRUCTED] Trace：NFR-04 → NFR-04.2 → SL-07；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户IT/财务与验收人员 |
| 前置输入 | 含原件、确认记录和报价的已备份项目，并模拟相应异常 |
| 操作 | 在隔离环境恢复 |
| 预期结果 | 缺原件/审批或引用断裂则恢复不合格；恢复前不替换可用生产数据 |
| 核对证据 | 恢复异常证据、失败/不可判定原因与复测前置条件 |

#### NFR-06.1

[CONSTRUCTED] Trace：NFR-06 → NFR-06.1 → SL-07；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户IT/财务与验收人员 |
| 前置输入 | 任务中断或回调重复 |
| 操作 | 重试同幂等键 |
| 预期结果 | 只产生一个有效结果和一次状态变更，可查旧失败原因 |
| 核对证据 | 失败重试专项记录、输入配置、执行日志与签认结果 |

#### NFR-06.2

[CONSTRUCTED] Trace：NFR-06 → NFR-06.2 → SL-07；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户IT/财务与验收人员 |
| 前置输入 | 任务中断或回调重复，并模拟相应异常 |
| 操作 | 重试同幂等键 |
| 预期结果 | 不同负载复用同幂等键拒绝；不能多造货物项或重复审批 |
| 核对证据 | 失败重试异常证据、失败/不可判定原因与复测前置条件 |

#### NFR-05.1

[CONSTRUCTED] Trace：NFR-05 → NFR-05.1 → SL-07；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户IT/财务与验收人员 |
| 前置输入 | 目标环境、15名独立测试账号、业务样本和书面超时阈值均齐备 |
| 操作 | 同时执行上传、检索、确认和核价并保存监控 |
| 预期结果 | 至少15人并行期间服务不宕机，关键动作在书面阈值内且无丢失/越权/重复写 |
| 核对证据 | 15人并发专项记录、输入配置、执行日志与签认结果 |

#### NFR-05.2

[CONSTRUCTED] Trace：NFR-05 → NFR-05.2 → SL-07；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户IT/财务与验收人员 |
| 前置输入 | 目标环境和15名账号、样本已有，但双方尚未约定关键操作超时阈值 |
| 操作 | 申请把并发验收标为通过 |
| 预期结果 | 记不可判定并要求书面确认阈值；不得以无宕机替代超时验收，本轮未执行压测 |
| 核对证据 | 15人并发异常证据、失败/不可判定原因与复测前置条件 |

#### NFR-07.1

[CONSTRUCTED] Trace：NFR-07 → NFR-07.1 → SL-07；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户IT/财务与验收人员 |
| 前置输入 | 财务舍入配置已批准且存在两个旧版本编辑请求 |
| 操作 | 复算小数金额并交错提交 |
| 预期结果 | 按十进制与约定行/整单舍入得相同金额；只有满足expectedRevision的写入成功 |
| 核对证据 | 金额与并发版本专项记录、输入配置、执行日志与签认结果 |

#### NFR-07.2

[CONSTRUCTED] Trace：NFR-07 → NFR-07.2 → SL-07；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户IT/财务与验收人员 |
| 前置输入 | 技术和价格输入完整，但财务尚未批准数量精度及行/整单舍入规则 |
| 操作 | 申请冻结生产核价规则 |
| 预期结果 | 拒绝冻结并列明缺失配置；不使用浮点默认值或自行选择舍入方法替代 |
| 核对证据 | 金额与并发版本异常证据、失败/不可判定原因与复测前置条件 |

#### NFR-05.3

[CONSTRUCTED] Trace：NFR-05 → NFR-05.3 → SL-07；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户IT/验收人员 |
| 前置输入 | 15名独立账号、业务样本和书面超时阈值已齐备，运行中分别注入宕机或超过阈值的关键请求 |
| 操作 | 执行并发验收并核对监控 |
| 预期结果 | 任一宕机、超过书面阈值、丢失/重复写均判该分支未通过；记录受影响请求与复测条件 |
| 核对证据 | 压力输入、时间记录、故障及一致性检查；本轮文档未运行 |

#### NFR-07.3

[CONSTRUCTED] Trace：NFR-07 → NFR-07.3 → SL-07；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 财务/业务人员 |
| 前置输入 | 舍入规则已批准，两个请求使用同一旧expectedRevision，第一个写入已成功 |
| 操作 | 提交第二个旧版本请求 |
| 预期结果 | 拒绝旧请求并返回当前版本，原成功记录不被覆盖；刷新后须重新确认输入 |
| 核对证据 | 两个版本请求、冲突响应和未被覆盖的数据 |

### SC-34 二期成本材料价报价比对

#### FR-P2-01.1

[CONSTRUCTED] Trace：FR-P2-01 → FR-P2-01.1 → SL-08；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 财务/客户IT |
| 前置输入 | 财务提供批准的工序/工时/工价/模具分摊样例与比较口径 |
| 操作 | 迁移并抽样复算 |
| 预期结果 | 来源及版本可回查，按财务口径记录偏差；合同目标≤±8% |
| 核对证据 | 成本核算输入、计算/关联明细及版本 |

#### FR-P2-01.2

[CONSTRUCTED] Trace：FR-P2-01 → FR-P2-01.2 → SL-08；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 财务/客户IT |
| 前置输入 | 已收到成本样例，但缺工时或模具分摊口径，财务比较基准未确认 |
| 操作 | 迁移并抽样复算 |
| 预期结果 | 核算记不可判定，列缺项及财务确认责任；不得报告成本偏差已达标 |
| 核对证据 | 成本核算缺口/差异清单与阻断原因 |

#### FR-P2-02.1

[CONSTRUCTED] Trace：FR-P2-02 → FR-P2-02.1 → SL-08；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 财务/客户IT |
| 前置输入 | 外网资料已通过甲方审批，含单位税费有效期 |
| 操作 | 在内网人工导入 |
| 预期结果 | 保存来源、批准人、时间和价格版本，经复核生效 |
| 核对证据 | 材料价导入输入、计算/关联明细及版本 |

#### FR-P2-02.2

[CONSTRUCTED] Trace：FR-P2-02 → FR-P2-02.2 → SL-08；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E24]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 财务/客户IT |
| 前置输入 | 以完整材料价记录为基准，每轮分别移除审批凭证、单位、税费或有效期，或将有效期改为已过期 |
| 操作 | 在内网人工导入 |
| 预期结果 | 无批准、单位/税费缺失或已过期则不生效，不自动覆盖有效价格 |
| 核对证据 | 材料价导入缺口/差异清单与阻断原因 |

#### FR-P2-03.1

[CONSTRUCTED] Trace：FR-P2-03 → FR-P2-03.1 → SL-08；risk_class=AMBER，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E19/E21]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 财务/客户IT |
| 前置输入 | 历史、当次、中标后U9报价都含可对应客户项与价格口径 |
| 操作 | 关联三类报价 |
| 预期结果 | 同口径项显示差额/差率及来源；无法对应的项单列不可比 |
| 核对证据 | 项目报价比对输入、计算/关联明细及版本 |

#### FR-P2-03.2

[CONSTRUCTED] Trace：FR-P2-03 → FR-P2-03.2 → SL-08；risk_class=AMBER，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E19/E21]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 财务/客户IT |
| 前置输入 | 对三类报价分别构造：一项身份不对应；一项单位无换算依据；一项税口径不明；一项目未取得中标后数据 |
| 操作 | 关联三类报价 |
| 预期结果 | 身份、单位、税费不一致时不直接比较；无中标数据不伪造第三组结果 |
| 核对证据 | 项目报价比对缺口/差异清单与阻断原因 |

#### FR-P2-01.3

[CONSTRUCTED] Trace：FR-P2-01 → FR-P2-01.3 → SL-08；risk_class=RED，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 财务/验收人员 |
| 前置输入 | 样例和财务口径均已批准，某核算结果相对基准偏差绝对值超过8% |
| 操作 | 核对抽样差异 |
| 预期结果 | 该样例判未达标并输出分项差异，不能通过更改基准或漏掉该样例宣称达标 |
| 核对证据 | 基准、系统结果、偏差计算及固定样本名单 |

#### FR-P2-03.3

[CONSTRUCTED] Trace：FR-P2-03 → FR-P2-03.3 → SL-08；risk_class=AMBER，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E19/E21]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 双方验收负责人 |
| 前置输入 | 二期扩充品类清单及分类/覆盖计分口径已书面确认 |
| 操作 | 按清单统计覆盖 |
| 预期结果 | 分别报告已覆盖和未覆盖品类，约80%目标沿合同来源展示；与一期业务覆盖率和匹配命中率分开 |
| 核对证据 | 品类清单版本、分子分母、各指标来源 |

#### FR-P2-03.4

[CONSTRUCTED] Trace：FR-P2-03 → FR-P2-03.4 → SL-08；risk_class=AMBER，money_path=true，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E19/E21]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 双方验收负责人 |
| 前置输入 | 一期覆盖率、命中率或二期扩充口径未书面区分 |
| 操作 | 试图合并公布一个80%达标值 |
| 预期结果 | 拒绝合并达标声明，标记口径未确认，保留各自原始计数 |
| 核对证据 | 三个指标定义、未决口径与禁止达标记录 |

### SC-35 三期报告关联

#### FR-P3-01.1

[CONSTRUCTED] Trace：FR-P3-01 → FR-P3-01.1 → SL-09；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 技术文件与适用产品的报告均可查，有参数和单位 |
| 操作 | 关联并核对报告 |
| 预期结果 | 同单位/可验证换算后比较，保留原值和换算；按合同10份报告抽检，目标≥95%且计分口径先确认 |
| 核对证据 | 报告文件、参数映射、换算依据和抽检记录 |

#### FR-P3-01.2

[CONSTRUCTED] Trace：FR-P3-01 → FR-P3-01.2 → SL-09；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | 报告对应产品不同、缺参数或单位不可换算 |
| 操作 | 关联或尝试标一致 |
| 预期结果 | 显示不适用/缺失/差异，不可凭名称相似标通过；转技术核查 |
| 核对证据 | 适用性、差异字段及人工结论 |

### SC-36 三期POC与出图计分

#### FR-P3-02.1

[CONSTRUCTED] Trace：FR-P3-02 → FR-P3-02.1 → SL-09；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E18]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术/双方验收人员 |
| 前置输入 | 标准件及尺寸微调样本经POC演示且双方书面通过 |
| 操作 | 启动正式出图并抽检 |
| 预期结果 | 记录POC授权；3D和2D投影关联同参数版本；20份全自动原始输出按确认口径计分，目标≥98%；人工复核另记 |
| 核对证据 | POC记录、参数版本、原始输出、人工修订记录及评分 |

#### FR-P3-02.2

[CONSTRUCTED] Trace：FR-P3-02 → FR-P3-02.2 → SL-09；risk_class=RED，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E02/E18]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 技术 |
| 前置输入 | POC未通过/缺书面确认，或请求超出标准件微调范围 |
| 操作 | 启动出图 |
| 预期结果 | 拒绝正式任务；按合同协商后续，不默认把曲面非标纳入；人工修正不得算原始自动成功 |
| 核对证据 | 拒绝原因、范围记录、原始与修订输出分离 |

### SC-37 合同开工依赖与移交

#### FR-P3-03.1

[CONSTRUCTED] Trace：FR-P3-03 → FR-P3-03.1 → SL-07；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户对应负责人/项目负责人 |
| 前置输入 | 提供的总表和约定一期品类清单 |
| 操作 | 检查标准串总表 |
| 预期结果 | 按清单核对串与子件、缺项及责任人，完整性签认后将该依赖标就绪 |
| 核对证据 | 标准串总表清单、责任人、来源及签认记录 |

#### FR-P3-03.2

[CONSTRUCTED] Trace：FR-P3-03 → FR-P3-03.2 → SL-07；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户对应负责人/项目负责人 |
| 前置输入 | 只收到主表节选，未收到约定一期品类清单 |
| 操作 | 检查标准串总表 |
| 预期结果 | 仅有节选或缺清单时不能把该依赖标完成 |
| 核对证据 | 标准串总表缺项、阻断范围与下一确认责任人 |

#### FR-P3-03.3

[CONSTRUCTED] Trace：FR-P3-03 → FR-P3-03.3 → SL-07；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户对应负责人/项目负责人 |
| 前置输入 | 同一中标项目清单、规范、附图、BOM及报价相关资料 |
| 操作 | 检查750kV完整样例 |
| 预期结果 | 核对项目身份和从询价到报价的关系，形成完备性清单 |
| 核对证据 | 750kV完整样例清单、责任人、来源及签认记录 |

#### FR-P3-03.4

[CONSTRUCTED] Trace：FR-P3-03 → FR-P3-03.4 → SL-07；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户对应负责人/项目负责人 |
| 前置输入 | 已有750kV清单，但缺同项目规范或BOM，尚不能建立端到端关联 |
| 操作 | 检查750kV完整样例 |
| 预期结果 | 同目录有750kV文件不等于完整样例，缺环节列阻塞 |
| 核对证据 | 750kV完整样例缺项、阻断范围与下一确认责任人 |

#### FR-P3-03.5

[CONSTRUCTED] Trace：FR-P3-03 → FR-P3-03.5 → SL-07；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户对应负责人/项目负责人 |
| 前置输入 | 财务提供2~3张单品成本结构样例 |
| 操作 | 检查成本样例 |
| 预期结果 | 确认含工序/工时/工价/模具分摊及财务口径，签认设计依据 |
| 核对证据 | 成本样例清单、责任人、来源及签认记录 |

#### FR-P3-03.6

[CONSTRUCTED] Trace：FR-P3-03 → FR-P3-03.6 → SL-07；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户对应负责人/项目负责人 |
| 前置输入 | 财务未提供成本结构样例或缺工时/分摊依据 |
| 操作 | 检查成本样例 |
| 预期结果 | 未收到或不可核对则二期核算设计依赖未完成 |
| 核对证据 | 成本样例缺项、阻断范围与下一确认责任人 |

#### FR-P3-03.7

[CONSTRUCTED] Trace：FR-P3-03 → FR-P3-03.7 → SL-07；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户对应负责人/项目负责人 |
| 前置输入 | 账套、字段清单、只读账号及接口支持凭证 |
| 操作 | 检查U9字段权限 |
| 预期结果 | 客户IT签认可读字段和联调前置，账号不写入PRD |
| 核对证据 | U9字段权限清单、责任人、来源及签认记录 |

#### FR-P3-03.8

[CONSTRUCTED] Trace：FR-P3-03 → FR-P3-03.8 → SL-07；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户对应负责人/项目负责人 |
| 前置输入 | 本地表有U9料号，但没有只读账号或字段授权凭证 |
| 操作 | 检查U9字段权限 |
| 预期结果 | 文件里存在料号不等于接口已授权，未授权不得标接入就绪 |
| 核对证据 | U9字段权限缺项、阻断范围与下一确认责任人 |

#### FR-P3-03.9

[CONSTRUCTED] Trace：FR-P3-03 → FR-P3-03.9 → SL-07；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户对应负责人/项目负责人 |
| 前置输入 | 服务器/GPU/网络拓扑与内网资源清单 |
| 操作 | 检查部署资源 |
| 预期结果 | IT确认资源和运行依赖满足试部署，保留签认 |
| 核对证据 | 部署资源清单、责任人、来源及签认记录 |

#### FR-P3-03.10

[CONSTRUCTED] Trace：FR-P3-03 → FR-P3-03.10 → SL-07；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户对应负责人/项目负责人 |
| 前置输入 | 未收到客户IT服务器/GPU/网络资源确认 |
| 操作 | 检查部署资源 |
| 预期结果 | 无资源凭证或未能满足内网约束则部署依赖未完成 |
| 核对证据 | 部署资源缺项、阻断范围与下一确认责任人 |

#### FR-P3-03.11

[CONSTRUCTED] Trace：FR-P3-03 → FR-P3-03.11 → SL-07；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户对应负责人/项目负责人 |
| 前置输入 | 双方书面准确率/覆盖率/差异率/时效/并发计算约定 |
| 操作 | 检查指标口径 |
| 预期结果 | 逐项绑定合同条款、分母、样本与起止事件 |
| 核对证据 | 指标口径清单、责任人、来源及签认记录 |

#### FR-P3-03.12

[CONSTRUCTED] Trace：FR-P3-03 → FR-P3-03.12 → SL-07；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户对应负责人/项目负责人 |
| 前置输入 | 双方尚未对验收样本分母和计算方式书面达成一致 |
| 操作 | 检查指标口径 |
| 预期结果 | 未书面一致的对应指标工作按合同暂停，不自行推定分母 |
| 核对证据 | 指标口径缺项、阻断范围与下一确认责任人 |

#### FR-P3-03.13

[CONSTRUCTED] Trace：FR-P3-03 → FR-P3-03.13 → SL-07；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户对应负责人/项目负责人 |
| 前置输入 | 总负责人、业务需求专员、供应技术部管理员、IT管理员及10~20份历史样本和模板 |
| 操作 | 检查甲方分工与验收样本 |
| 预期结果 | 按合同核对责任角色到位、样本可读与模板授权，记录实际人员在受控项目配置 |
| 核对证据 | 甲方分工与验收样本清单、责任人、来源及签认记录 |

#### FR-P3-03.14

[CONSTRUCTED] Trace：FR-P3-03 → FR-P3-03.14 → SL-07；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户对应负责人/项目负责人 |
| 前置输入 | 仅有原型演示人员，甲方四类角色未到岗确认，或缺历史样本/模板授权 |
| 操作 | 检查甲方分工与验收样本 |
| 预期结果 | 原型虚构人员不能替代到岗确认；缺样本/模板保留依赖 |
| 核对证据 | 甲方分工与验收样本缺项、阻断范围与下一确认责任人 |

#### FR-P3-03.15

[CONSTRUCTED] Trace：FR-P3-03 → FR-P3-03.15 → SL-07；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户对应负责人/项目负责人 |
| 前置输入 | 已交付维护/接口/部署说明和培训资料，有授权IT人员 |
| 操作 | 检查样板移交 |
| 预期结果 | 甲方IT独立完成至少1个维护场景，留步骤、结果与验收签认 |
| 核对证据 | 样板移交清单、责任人、来源及签认记录 |

#### FR-P3-03.16

[CONSTRUCTED] Trace：FR-P3-03 → FR-P3-03.16 → SL-07；risk_class=AMBER，money_path=false，analytics_touch=false。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E20]

| 要素 | 验收定义 |
| --- | --- |
| 角色 | 客户对应负责人/项目负责人 |
| 前置输入 | IT只观看演示，维护操作由研发人员代做 |
| 操作 | 检查样板移交 |
| 预期结果 | 由开发代操作或只能观看演示不计独立完成 |
| 核对证据 | 样板移交缺项、阻断范围与下一确认责任人 |

## 10 版本与交接

[CONSTRUCTED] V1.1补充合同口径、设计/制度分类、37组112个正常与异常分支，以及角色、版本、来源和实现单元对应。数据模型、业务接口、实施顺序和待确认队列位于handoff目录；内容已获Gate 2确认，文件完整性由封存清单校验，最终签发状态以design-gate.json为准。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p1_research_base.md E01/E02/E07/E24]

[FOUND] Gate 2已由用户明确回复“以上五项通过”，包括本版变更复审、签发冻结与开放事项处理；用户确认记录见gate-decisions.md。[L0: 本任务2026-09-08 Gate 2五项及用户回复]
