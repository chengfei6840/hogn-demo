# 产品规格：红光金具 v1.5

[CONSTRUCTED] 此文件从唯一整合PRD投影；定义审查不代表执行通过。[L1: ../p3_product_spec.md]

## 九字段

需求范围

| 项目 | 内容 |
| --- | --- |
| 范围 | [CONSTRUCTED] 国网金具串从询价资料接入、串型/子件确认、并行协作、核价、审批到报价快照；固定模块按合同分期。 [L1: 本轮研究证据 F01/F04/F01/F16，见附录本轮证据索引] |
| 本期排除 | [CONSTRUCTED] 独立物资保留原始项并单列；需重新设计的非标转人工。阶段一不含单品成本精算、出图和外贸，ERP/MES只读。 [L1: 本轮研究证据 F01/F18/F03/F06/F15/F18，见附录本轮证据索引] |
| 受影响用户 | [CONSTRUCTED] 销售、技术、财务、董事长和管理员；角色名称不替代具体账号与项目授权。 [L1: 本轮研究证据 F01/F04/F04/F14，见附录本轮证据索引] |
| 行为变化 | [CONSTRUCTED] 销售与技术可并行解决问题；只有当前版本双确认且阻断解除才流转财务。董事长按规则审查利润，不代替技术确认。 [L1: 本轮研究证据 F04/F14/F04/F14，见附录本轮证据索引] |
| 数据 | [CONSTRUCTED] 原件、批次、包、原货物项、字段四值、候选、子件、风险、确认、价格及报价快照分别存并关联。 [L1: 本轮研究证据 F03/F03/F06/F15/F18，见附录本轮证据索引] |
| 接口 | [CONSTRUCTED] 多文件混析已完成，可复用单文件和批次解析接口；国网业务适配仍需联调、只读U9、主库与模板输出接口约定。 [L1: 本轮研究证据 F06/F07/F05/F06/F15/F18，见附录本轮证据索引] |
| 风险 | [CONSTRUCTED] 错误归并、关键条件缺失、越权、旧版本放行、价格来源缺失、原型被误认为实际服务。 [L1: 本轮研究证据 F03/F08/F08/F19/F07/F19，见附录本轮证据索引] |
| 实施 | [CONSTRUCTED] 一期主流程细化，二三期按合同范围、输入输出、门禁和验收入口列明；正式接入按依赖清单逐项验证。 [L1: 本轮研究证据 F01/F16/F18，见附录本轮证据索引] |
| 未决事项 | [CONSTRUCTED] 审批数值、财务计算、角色到岗、完整样例、U9权限、内网资源、引用方案版本及验收口径具名追踪。 [L1: 本轮研究证据 F16/F17/F18/F18/F04/F14，见附录本轮证据索引] |

### 分期

| 阶段 | 固定模块和本轮深度 |
| --- | --- |
| 一期 | [FOUND] 统一B/S工作台、解析、标准串匹配、子件带出、规则定价、串级报价单、U9只读、报价快照、权限审批、并发验证。本轮给完整流程与异常分支。 [L1: 本轮研究证据 F01/F16/F01/F18，见附录本轮证据索引] |
| 二期 | [FOUND] 单品成本库及核算、材料实时价审批导入、品类扩充、历史/当次/中标后报价比对。本轮给独立输入、结果、异常及合同验收要求。 [L1: 本轮研究证据 F01/F16/F01/F18，见附录本轮证据索引] |
| 三期 | [FOUND] 报告参数关联、POC书面门禁、标准件及尺寸微调参数化出图与2D投影、验收移交和培训。本轮不提供工程图。 [L1: 本轮研究证据 F01/F16/F01/F18，见附录本轮证据索引] |

## 角色与行为

用户与角色

[CONSTRUCTED] 每个业务请求同时检查账号有效性、角色、项目授权、对象负责人和版本。字段级过滤在服务端执行；前端角色切换只用于演示，不是生产认证。管理员可配置权限，不因身份获得业务审批权。 [L1: 本轮研究证据 F01/F04/F04/F14/F15/F18，见附录本轮证据索引]

| 角色 | 可写动作 | 数据可见性 |
| --- | --- | --- |
| 销售 | 建询价、上传、客户确认值、范围、风险分配、销售确认、下载已签发报价对外提供 | [CONSTRUCTED] 所负责项目及对外价格；内部成本和毛利不可见 [L1: 本轮研究证据 F01/F04/F04/F14/F04/F14，见附录本轮证据索引] |
| 技术 | 检索、子件核对、技术风险处理、技术确认、退回、字典/同义词业务审核 | [CONSTRUCTED] 负责项目技术资料；内部成本/利润及最终报价金额不可见 [L1: 本轮研究证据 F01/F04/F04/F14/F04/F14，见附录本轮证据索引] |
| 财务 | 价格依据、规则核价、商务核对、财务通过/退回、报价签发冻结 | [CONSTRUCTED] 授权项目物料、价格、成本、毛利和审批依据 [L1: 本轮研究证据 F01/F04/F04/F14/F04/F14，见附录本轮证据索引] |
| 董事长 | 审批规则制度确认、金额/利润通过或退回、单项售价或目标毛利率调价 | [CONSTRUCTED] 授权项目完整审批资料 [L1: 本轮研究证据 F01/F04/F04/F14/F04/F14，见附录本轮证据索引] |
| 管理员 | 账号角色项目授权、接口与部署配置；按批准记录维护政策 | [CONSTRUCTED] 运维配置和必要审计；不默认获取内部价格或审批权 [L1: 本轮研究证据 F01/F04/F04/F14/F04/F14，见附录本轮证据索引] |

[CONSTRUCTED] 工作台进入当前询价；资料页上传后主动启动处理；协作页处理问题；检索页查看四路径；核价页处理商务与审批；档案页输出和新版本；字典页管理规则；二三期页标合同后续范围。页面具备空、加载、失败、只读、无权限和业务阻断状态；长表局部滚动并保留表头，键盘可操作对话框，状态同时有文字。 [L1: 本轮研究证据 F01/F04/F07，见附录本轮证据索引]

[CONSTRUCTED] 原型技术栈为Vue3、TypeScript、Vite、shadcn-vue、Tailwind、Iconify；配色延用已确认的官网深蓝、白灰及少量红色。这里只约束原型一致性，不新增正式部署兼容性承诺。 [L1: 本轮研究证据 F01/F04及本任务技术栈与配色确认，见附录本轮证据索引]

| 操作/数据 | 销售 | 技术 | 财务 | 董事长 | 管理员 |
| --- | --- | --- | --- | --- | --- |
| 需求上传及客户确认 | 管理 | 查看 | 查看 | 查看 | 无业务权限 |
| 串型/子件采用与技术确认 | 查看 | 确认 | 查看 | 查看 | 无 |
| 成本和毛利 | 不可见 | 不可见 | 核价 | 查看审批 | 不默认可见 |
| 最终报价金额 | 查看已授权结果 | 不可见 | 查看 | 查看 | 不可见 |
| 单项调价 | 无 | 无 | 核价阶段改价 | 审批阶段调整售价/目标毛利率 | 无 |
| 正式签发 | 无 | 无 | 签发冻结 | 无 | 无 |
| 已签发文件下载 | 对外提供 | 无最终报价访问权 | 查看下载 | 查看下载 | 无 |
| BOM查看导出 | 有 | 有 | 有 | 有 | 无 |
| 账号创建/角色分配/重置与停用 | 无 | 无 | 无 | 制度批准 | 执行授权配置 |

正式账号管理须覆盖创建、分配项目与角色、改密/找回、停用和撤销会话，纳入 FR-UM-01。审批阈值由董事长/财务确认制度，管理员依据批准记录维护；原型董事长直接配置仅用于演示。

## 流程

业务流程

[CONSTRUCTED] 资料整理 → 并行协作 → 财务核价 → 按规则董事长审批或直接待财务签发 → 财务签发 → 已签发（销售下载对外提供）。资料整理只要求可用货物项与基本包归属，不要求预先解决全部技术问题。 [L1: 本轮研究证据 F04/F14/F06/F07/F04/F14，见附录本轮证据索引]

| 进入阶段 | 输入与门禁 | 输出或退回 |
| --- | --- | --- |
| 并行协作 | 可用货物项草稿、包归属、来源；问题有规则和负责人 | [CONSTRUCTED] 销售补客户条件，技术检索与复核可同时开展 [L1: 本轮研究证据 F04/F14/F04/F14/F15/F18，见附录本轮证据索引] |
| 财务核价 | 销售确认当前范围/需求；技术确认纳入项的当前技术版本；所有核价前阻断解除 | [CONSTRUCTED] 核价保存后才能审核；无依据价格不能通过 [L1: 本轮研究证据 F04/F14/F04/F14/F15/F18，见附录本轮证据索引] |
| 董事长审批 | 财务完成；金额/毛利/特殊事项触发或审批配置缺失 | [CONSTRUCTED] 董事长有意见地通过或退回财务；技术冲突只能回有权角色解决 [L1: 本轮研究证据 F04/F14/F04/F14/F15/F18，见附录本轮证据索引] |
| 待出具 | 财务通过且所需董事长审批有效；需求、价格和政策版本仍一致 | [CONSTRUCTED] 财务签发并原子创建快照和导出任务；销售下载已签发文件对外提供 [L1: 本轮研究证据 F04/F14/F04/F14/F15/F18，见附录本轮证据索引] |
| 已出具 | issueQuote事务成功，快照与导出任务已创建，文件状态独立 | [CONSTRUCTED] 已出具指签发冻结；导出处理中或失败不改变该状态，旧版本只读，变化创建新版本 [L1: 本轮研究证据 F04/F14/F04/F14/F15/F18，见附录本轮证据索引] |

### 设计细化与变更影响

[CONSTRUCTED] 整包汇合、含税整单金额达到阈值时触发、特殊商务主动升级，以及下列版本细化均为本项目设计。Gate 1批准保留设计身份，不等于客户生产制度已配置；正式制度通过OPEN清单确认。 [L1: 本轮研究证据 F04/F14，见附录本轮证据索引]

| 变化 | 本版正式系统设计 | 保留内容 |
| --- | --- | --- |
| 导地线、电压、类别、子件或技术附件 | 重审受影响项技术；销售需求有变化时重确认；相关价格及整份金额审批失效 | [CONSTRUCTED] 未受影响项的技术确认保留版本引用 [L1: 本轮研究证据 F04/F14/F04/F14/F15/F18，见附录本轮证据索引] |
| 仅采购数量/纳入范围 | 销售重确认；重新计算总用量、金额与审批；每套构成未变且单位可换算时保留技术确认，否则转技术 | [CONSTRUCTED] 排除项原值及风险保留，恢复后重新纳入门禁 [L1: 本轮研究证据 F04/F14/F04/F14/F15/F18，见附录本轮证据索引] |
| 仅单价、折扣或商务费用 | 财务重核并重判董事长规则，技术结果未变可沿用 | [CONSTRUCTED] 旧价格和审批意见只读 [L1: 本轮研究证据 F04/F14/F04/F14/F15/F18，见附录本轮证据索引] |
| 联系人等不影响技术和商务的信息 | 仅保存审计，不重启无关技术审核 | [CONSTRUCTED] 原报价快照不原地改写 [L1: 本轮研究证据 F04/F14/F04/F14/F15/F18，见附录本轮证据索引] |
| 审批政策发布 | 已授权新版本生效后，未出具报价旧审批失效，回财务按新规则重判 | [CONSTRUCTED] 已出具报价继续引用原政策，不追改历史 [L1: 本轮研究证据 F04/F14/F04/F14/F15/F18，见附录本轮证据索引] |
| 已出具后再报价 | 新价格版本或新需求版本分别启动适用重审 | [CONSTRUCTED] 旧快照与文件哈希不变 [L1: 本轮研究证据 F04/F14/F04/F14/F15/F18，见附录本轮证据索引] |

[CONSTRUCTED] 问题状态为待处理、处理中、待确认、等待补充、已解决、不适用。指派/转交只变负责人；等待补充不解除阻断。不适用须由规则授权确认人提交依据，相关条件改变后重评。处理结果要校验必要值和来源；需复核的任务由确认人通过后才解决。问题结案与整包技术通过是独立记录。 [L1: 本轮研究证据 F04/F14/F08/F19，见附录本轮证据索引]

董事长调价后返回财务复核；方案一致可沿用确认，否则再送董事长。技术、财务退回与客户重报价均记录原因及影响范围。报价本次签发以已签发为终态，新报价通过新版本继续，旧快照保持只读。

[NEEDS-CONFIRMATION → 客户业务负责人: blocks 项目结案实施范围] 项目中标、未中标或关闭（won/lost/closed）属于后续业务结案建议；权限、状态和验收范围由客户业务负责人在 OPEN-09 确认，本版不新增结案实施要求。

## 功能与业务规则

功能需求（FR）

| 编号 | 功能/要求 | 合同阶段 | 优先级 | 风险/金额路径/统计变更 | 场景 | 验收 | 实施单元 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FR-IN-01 | 资料批次、ZIP清点及来源登记 | 1 | M | AMBER / False / False | SC-01 | AC-101 | SL-02 |
| FR-IN-02 | 单文件转换提取、质量及字段来源 | 1 | M | AMBER / False / False | SC-03 | AC-102 | SL-02 |
| FR-IN-03 | 包归属和跨文件关系及冲突 | 1 | M | AMBER / False / False | SC-04 | AC-103 | SL-02 |
| FR-IN-04 | 部分失败与幂等重试 | 1 | M | AMBER / False / False | SC-02 | AC-104 | SL-02 |
| FR-SR-01 | 技术规范编码检索 | 1 | M | RED / False / False | SC-05 | AC-205 | SL-04 |
| FR-SR-02 | 串型号组合检索 | 1 | M | RED / False / False | SC-06 | AC-206 | SL-04 |
| FR-SR-03 | 附图图册检索 | 1 | M | RED / False / False | SC-07 | AC-207 | SL-04 |
| FR-SR-04 | 品名描述补充检索 | 1 | M | RED / False / False | SC-08 | AC-208 | SL-04 |
| FR-SR-05 | 适用条件、项目差异和版本确认 | 1 | M | RED / False / False | SC-09, SC-10, SC-11 | AC-230 | SL-04 |
| FR-SC-01 | 原始货物项与报价范围变更 | 1 | M | RED / True / False | SC-12 | AC-231 | SL-03 |
| FR-BM-01 | BOM层级、用量和必要字段确认 | 1 | M | RED / True / False | SC-13 | AC-209 | SL-04 |
| FR-PR-02 | U9完整性与价格关联分别校验 | 1 | M | RED / True / False | SC-14 | AC-232 | SL-05 |
| FR-RK-01 | 风险任务指派与转交 | 1 | M | AMBER / False / False | SC-15 | AC-210 | SL-03 |
| FR-RK-02 | 等待补充、不适用和有依据的结案 | 1 | M | RED / False / False | SC-16, SC-17 | AC-211 | SL-03 |
| FR-WF-01 | 销售技术并行和当前版本双确认 | 1 | M | RED / True / False | SC-18 | AC-212 | SL-03 |
| FR-WF-02 | 技术财务退回和变更影响 | 1 | M | RED / True / False | SC-19, SC-20, SC-22 | AC-213 | SL-03 |
| FR-AP-02 | 董事长驳回、重提和审批版本一致 | 1 | M | RED / True / False | SC-21, SC-25 | AC-216 | SL-05 |
| FR-PR-01 | 可复现核价与保存后审核 | 1 | M | RED / True / False | SC-23 | AC-214 | SL-05 |
| FR-AP-01 | 金额利润规则分流与政策版本 | 1 | M | RED / True / False | SC-24, SC-25 | AC-215 | SL-05 |
| FR-QT-01 | 有效审批版本出具报价 | 1 | M | RED / True / False | SC-26 | AC-217 | SL-06 |
| FR-QT-02 | 不可变快照与新报价版本 | 1 | M | RED / True / False | SC-27 | AC-218 | SL-06 |
| FR-QT-03 | 模板拆行汇总与对外字段 | 1 | M | RED / True / False | SC-28 | AC-219 | SL-06 |
| FR-UM-01 | 账号、角色、项目与字段权限 | 1 | M | RED / True / False | SC-29 | AC-229 | SL-01 |
| FR-MD-01 | 按对象路径生效的字段字典 | 1 | M | AMBER / False / False | SC-30 | AC-220 | SL-01 |
| FR-MD-02 | 同义词建议审核发布及回归 | 1 | M | AMBER / False / False | SC-31 | AC-221 | SL-01 |
| FR-MD-03 | 主库导入审核与版本治理 | 1 | M | AMBER / False / False | SC-32 | AC-222 | SL-01 |
| FR-P2-01 | 单品成本库及核算 | 2 | M | RED / True / False | SC-34 | AC-223 | SL-08 |
| FR-P2-02 | 审批后的材料价人工导入 | 2 | M | RED / True / False | SC-34 | AC-224 | SL-08 |
| FR-P2-03 | 品类扩充与三类项目报价比对 | 2 | M | AMBER / True / False | SC-34 | AC-225 | SL-08 |
| FR-P3-01 | 报告参数与技术文件关联 | 3 | M | RED / False / False | SC-35 | AC-226 | SL-09 |
| FR-P3-02 | POC门禁和参数化出图 | 3 | M | RED / False / False | SC-36 | AC-227 | SL-09 |
| FR-P3-03 | 阶段依赖、交付资料和独立维护验收 | 跨阶段 | M | AMBER / False / False | SC-37 | AC-228 | SL-07 |
| FR-BM-02 | 项目 BOM 页面及客户模板导出 | 1 | M | RED / True / False | SC-38 | AC-233 | SL-04 |
| FR-AP-03 | 董事长单项调价与财务复核 | 1 | M | RED / True / False | SC-39 | AC-234 | SL-05 |

### 页面与交互

- 流程步骤条只在资料、协作、检索、BOM、核价、报价页面展示，按真实阶段、双确认及是否触发董事长审批展示当前节点。
- 协作页顶部固定紧凑的项目、双确认和技术进度面板；下方货物项与右侧风险任务占满剩余空间，分别局部滚动。窄屏改为纵向布局，保证最后一条可见。
- 串内子件用抽屉展示，表头与主要操作保持可见。检索结果明确每条差异、责任人及处理入口，不能只显示灰色按钮。
- 等待补充要求原因，保留人员、时间、版本和历次记录；指派、等待或补字段均不自动解除风险。
- 表单、下拉、弹窗使用现有 UI 组件，错误同时有文字；角色切换、重置及演示价格入口仅演示环境可用，正式环境移除入口。

### 项目 BOM 规格

客户参考文件为《电厂升压站－哈密北换流站750千伏线路工程Ⅰ回-含平行挂板2024.7.10-串型BOM.xlsx》。数据链路为客户货物项 → 已确认串型 → 串内子件 → 项目BOM，分别保留采购套数、每套用量与总用量。

主表依次为：U9客户单位、需求单位、合同标识符、订单编号、项目名称、工程名称、货物名称、数量、单位、技术联系人、技术问题核对、串料号、串品名、串规格、串描述、名称、型号、数量、料号、品名、规格、描述、图号。H列为采购套数、R列为每套子件用量，总用量另列于“用量与来源”。

同一子件在不同串中分别列出以保留归属；空数量不当作零，已有零原样保留并按技术规则核实。“平行挂板”列为型号、总数量(下单总数量)、施工1标、施工2标、料号、品名、规格、描述、图号。无本项目标段分配时仅保留表结构，不复制参考项目数量。

未确认候选不进明细；部分确认允许导出草稿并列未确认项；全体纳入项逐项且整体技术确认对应当前版本后标为技术确认版。未确认必要字段仍受 FR-BM-01 技术门禁约束。缺少客户主数据、合同、订单、串料号或U9品名等信息留空；候选名称/规格不等于U9主数据已核准。

导出包含主表、“用量与来源”“平行挂板”“编制说明”，标记项目、版本、草稿性质、来源、缺项与排除范围。技术确认版不等于可生产下单；生产必填规则及平行挂板录入范围仍见 OPEN-10。当前导出保持字段结构，不要求逐格复刻参考文件合并单元格。

业务规则（BR）

| 编号 | 规则 | 覆盖功能与验收 |
| --- | --- | --- |
| BR-01 | 关键条件、风险及当前版本双确认通过后才能核价 | FR-WF-01 / AC-212 |
| BR-02 | 风险结案、串型采用和整体技术确认分别记录；等待保留历史且不解除阻断 | FR-RK-02 / AC-211 |
| BR-03 | 源值、标准化值、建议值与人工确认值分开存；主数据变化不追改历史 | FR-MD-01 / AC-220 |
| BR-04 | 董事长确认方案与财务复核一致可沿用；再次变化必须重审 | FR-AP-03 / AC-234 |
| BR-05 | 财务签发冻结；销售只下载；文件失败可重试原快照 | FR-QT-01 / AC-217 |
| BR-06 | BOM按已确认串生成，采购量与每套用量分离，空值不猜填 | FR-BM-02 / AC-233 |
| BR-07 | 同义词/规则发布先审核与黄金样本回归；停用不改旧引用 | FR-MD-02 / AC-221 |

[FOUND] 客户认可三条主路径和一条补充路径；主路径优先级不表示每一项都必须跑完所有路径。串型号不能单独作为最终匹配条件，缺失与多结果须保留待确认。 [L1: 本轮研究证据 F02/F03，见附录本轮证据索引]

| 路径 | 入口、核对和输出 |
| --- | --- |
| 技术规范编码 | [FOUND] 编码→规范→串型/子件→拆解记录；仍核对类别、电压、导地线、描述与项目差异。 [L1: 本轮研究证据 F02/F03，见附录本轮证据索引] |
| 串型号组合 | [FOUND] 类别+串型号+电压+适用导线或地线+图册版本图号；展示所有相关候选和差异。 [L1: 本轮研究证据 F02/F03，见附录本轮证据索引] |
| 附图图册 | [FOUND] 技术文件引用→附图→图册名称/版本/图号→拆解资料，引用可回看，缺图或版本差异转核对。 [L1: 本轮研究证据 F02/F03，见附录本轮证据索引] |
| 品名描述补充 | [FOUND] 规范品名、扩充描述及标识召回候选；相关性不能代替技术一致。 [L1: 本轮研究证据 F02/F03，见附录本轮证据索引] |

[CONSTRUCTED] 四路径均定义准确匹配、多条记录、待确认和未找到；独立物资单独表达。未找到只说明当前数据快照范围，不断言产品不存在。导线串检查导线、地线串检查地线；电压和类别未确定时不能最终确认。 [L1: 本轮研究证据 F02/F03/F03/F06/F19，见附录本轮证据索引]

[CONSTRUCTED] 同名同序号归并技术参数组来自调研记录，属于待样本核对的实现方法。主表两列图号分别保存；技术ID、规范码、串料号和子件料号分开。每套用量与采购量分别保存，单位换算须有依据。必要字段缺失保持草稿；U9缺失可保留技术候选，正式核价仍需有效物料与价格关联。 [L1: 本轮研究证据 F08/F09/F11/F11/F12，见附录本轮证据索引]

[FOUND] 现有红光适配器用Schema生成字段字典，同义词和风险规则库均not_configured；风险面板另按关键词、字段状态和置信度形成本地提示。本版下面的持久规则治理为拟建能力。 [L1: 本轮研究证据 F08/F08/F08/F19，见附录本轮证据索引]

| 条件 | 阻断位置 | 责任与解除依据 |
| --- | --- | --- |
| 必需文件损坏/关键来源不可核实 | 受影响项技术确认 | [CONSTRUCTED] 销售补资料，技术核对可回查来源 [L1: 本轮研究证据 F03/F04/F14/F08/F19/F15/F18，见附录本轮证据索引] |
| 适用导地线、电压、类别缺失 | 最终确认，允许召回 | [CONSTRUCTED] 销售取得客户确认，技术检查匹配 [L1: 本轮研究证据 F03/F04/F14/F08/F19/F15/F18，见附录本轮证据索引] |
| 多候选、版本或项目冲突 | 技术通过 | [CONSTRUCTED] 技术核对图册/项目答复并记录裁定 [L1: 本轮研究证据 F03/F04/F14/F08/F19/F15/F18，见附录本轮证据索引] |
| 子件必要型号、用量、材质、单位缺失 | 技术确认与核价 | [CONSTRUCTED] 技术补拆解依据，保留空值直到核实 [L1: 本轮研究证据 F03/F04/F14/F08/F19/F15/F18，见附录本轮证据索引] |
| 数量无效或计价单位不明 | 核价 | [CONSTRUCTED] 销售核实采购量；换算由技术/财务确认 [L1: 本轮研究证据 F03/F04/F14/F08/F19/F15/F18，见附录本轮证据索引] |
| U9缺失 | 提示；无有效价格关联时阻断核价 | [CONSTRUCTED] 技术确认物料身份，财务核实价格来源 [L1: 本轮研究证据 F03/F04/F14/F08/F19/F15/F18，见附录本轮证据索引] |
| 价格无依据、税运费有效期不明 | 财务通过 | [CONSTRUCTED] 财务确认有效源和计算口径 [L1: 本轮研究证据 F03/F04/F14/F08/F19/F15/F18，见附录本轮证据索引] |
| 审批触发或旧版本确认 | 下游流转与正式出具 | [CONSTRUCTED] 当前审批角色处理对应版本，不能按钮忽略 [L1: 本轮研究证据 F03/F04/F14/F08/F19/F15/F18，见附录本轮证据索引] |

[CONSTRUCTED] 字典至少包括字段代码、对象、类型、单位、别名、适用类别/路径、必填阶段、确认角色、校验与来源格式。规范码只在编码路径需要时检查；采购号按网省/总部分存；串型号别名限定成套串；同义词发布必须审核适用性和已知样本，停用不改历史引用。 [L1: 本轮研究证据 F08/F08，见附录本轮证据索引]
[FOUND] 合同要求规则匹配定价可复现可审计，U9/ERP/MES只读；一期规则基准价核价与二期单品成本精算分开。 [L1: 本轮研究证据 F01/F16/F01/F18/F15/F18，见附录本轮证据索引]

[CONSTRUCTED] 未税收入=各行未税单价×采购数量之和；未税成本=同口径单位成本×数量之和；毛利率=(收入−成本)/收入。收入为零不能审核。金额以十进制计算，按财务确认的行/整单精度及舍入政策保存原值和结果；无政策不得冻结正式金额规则。 [L1: 本轮研究证据 F04/F14/F15/F18，见附录本轮证据索引]

[CONSTRUCTED] 金额按整份含税总额>=阈值、毛利率<底线或财务主动特殊商务升级时转董事长；任一配置缺失保守转董事长并显示原因。配置版本随审批保存；董事长意见必填，驳回转财务，可改价重提；更换串或子件必须回技术。 [L1: 本轮研究证据 F04/F14/F04/F14，见附录本轮证据索引]

[CONSTRUCTED] 出具的唯一事件是issueQuote事务成功：冻结需求、技术、物料主库、价格、政策、模板及审批版本，同时标已出具。文件生成状态另有处理中、成功、失败；失败重试仍使用原快照，后发政策不追改已冻结报价。报价拆行保持原客户项关联，行汇总可对账；输出名称、规格、数量/单位、单价/金额、税费与商务条款、排除范围；客户文件不含内部成本和毛利。模板授权失败、总额不平或审批过期均拒绝正式导出。 [L1: 本轮研究证据 F01/F16/F03/F06/F15/F18，见附录本轮证据索引]
### 董事长单项调价与财务签发

[CONSTRUCTED] 董事长在审批阶段，可调整纳入报价货物项的未税单价，或输入目标毛利率反算单价：售价=成本÷(1−毛利率)。原型单价保留两位小数，反算要求成本大于0、目标毛利率在0至小于100%之间，售价必须大于0；正式精度与例外制度仍按 OPEN-02/03 确认。董事长不在此修改成本。 [L0: 本任务用户已确认的签发、单项调价、BOM参考表及董事长命名要求]

[CONSTRUCTED] 保存时必须提供原因，记录调整方式、目标值、原单价、新单价、成本、操作者、时间、需求及价格版本，同时记录董事长确认的整份方案。财务复核时，比对需求版本、纳入项、数量、售价、成本、价格依据、税率、商务说明、审批配置及主动升级标记；均一致则沿用确认，任一变化重新进入董事长审批。相关技术变化按影响范围重审。 [L0: 本任务用户已确认的签发、单项调价、BOM参考表及董事长命名要求]

[CONSTRUCTED] 财务是 issueQuote 签发命令的唯一执行角色；销售、技术、董事长、管理员直接调用均拒绝。签发记录保存签发人、时间、版本及审批依据。销售下载已签发快照对外提供，下载不再签发、也不更改冻结价格。 [L0: 本任务用户已确认的签发、单项调价、BOM参考表及董事长命名要求]

## 非功能

非功能需求（NFR）

| 编号 | 功能/要求 | 合同阶段 | 优先级 | 风险/金额路径/统计变更 | 场景 | 验收 | 实施单元 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-01 | 内网部署 | 1 | M | RED / False / False | SC-33 | AC-301 | SL-07 |
| NFR-02 | ERP/MES只读 | 1 | M | RED / True / False | SC-33 | AC-302 | SL-07 |
| NFR-03 | 审计 | 1 | M | RED / True / False | SC-33 | AC-303 | SL-07 |
| NFR-04 | 备份恢复 | 1 | M | RED / True / False | SC-33 | AC-304 | SL-07 |
| NFR-05 | 至少15人并发 | 1 | M | RED / False / False | SC-33 | AC-305 | SL-07 |
| NFR-06 | 幂等重试 | 1 | M | RED / False / False | SC-33 | AC-306 | SL-07 |
| NFR-07 | 金额精度和并发版本 | 1 | M | RED / True / False | SC-33 | AC-307 | SL-07 |
| NFR-08 | 离线资源 | 1 | M | RED / False / False | SC-33 | AC-308 | SL-07 |

[CONSTRUCTED] 下表抄录合同指标的各自来源，计分分母、数据规模、舍入、时限及阶段关系需双方书面确认。文档检查或原型演示不能替代正式验收。 [L1: 本轮研究证据 F16/F16/F17/F18，见附录本轮证据索引]

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

[CONSTRUCTED] 完整依赖包括标准串总表、同一新疆750kV中标项目端到端资料、成本结构样例2至3张、U9支持/字段/只读账号、内网资源、验收口径、四类甲方分工、历史询价10至20份和授权报价模板。每项分别记已收到、待补、完整性未验或就绪；存在同类文件不能自动标完成。SC-37逐项给正常/异常条件。 [L1: 本轮研究证据 F18，见附录本轮证据索引]

## 验收场景

### FR-IN-01.1 / SC-01

[CONSTRUCTED] 角色：销售。Given：一次提交2个散文件与含2个文件的ZIP；When：登记后主动开始处理；Then：保留3个顶层文件、ZIP的2个子文件及内部路径；形成一个资料批次，不按文件数自动创建业务包。验收证据：批次文件树、文件哈希、处理记录。[L1: ../p1_research_base.md F03/F06/F05/F06]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-IN-01 → FR-IN-01.1 → SL-02。execution_status=not_run。

### FR-IN-01.2 / SC-01

[CONSTRUCTED] 角色：销售。Given：ZIP内有../越界路径或超过已配置层级/解压额度的条目；When：开始清点；Then：拒绝危险条目且不写出允许目录；显示异常及受影响文件，其余文件可继续。验收证据：异常清单、受控目录检查、批次状态。[L1: ../p1_research_base.md F03/F06/F05/F06]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-IN-01 → FR-IN-01.2 → SL-02。execution_status=not_run。

### FR-IN-04.1 / SC-02

[CONSTRUCTED] 角色：销售。Given：一文件解析失败、另一文件成功；When：补传修正文件并对失败任务重试两次；Then：保留原失败记录与成功项；同幂等键返回同次结果，不重复创建货物项。验收证据：任务ID、幂等记录、前后货物项ID。[L1: ../p1_research_base.md F06/F07/F05/F06]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-IN-04 → FR-IN-04.1 → SL-02。execution_status=not_run。

### FR-IN-04.2 / SC-02

[CONSTRUCTED] 角色：销售。Given：文件加密、损坏、零字节或转换超时；When：解析或重试；Then：分别显示原因、可采取动作；不可把部分成功显示全部完成，不可静默丢文件。验收证据：逐文件状态、异常码、成功结果保留记录。[L1: ../p1_research_base.md F06/F07/F05/F06]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-IN-04 → FR-IN-04.2 → SL-02。execution_status=not_run。

### FR-IN-02.1 / SC-03

[CONSTRUCTED] 角色：销售。Given：原文件含750KV且转换有可用来源；When：提取并人工确认750 kV；Then：原值750KV不改，规范值和确认值分别保存；原件位置可回看。验收证据：字段四值、确认人、版本、来源位置。[L1: ../p1_research_base.md F03/F06/F07]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-IN-02 → FR-IN-02.1 → SL-02。execution_status=not_run。

### FR-IN-02.2 / SC-03

[CONSTRUCTED] 角色：技术。Given：提取低质量或来源定位无法重开；When：尝试确认受影响关键字段；Then：标记待核对，保留原文及无法定位原因；补可验证依据前阻断最终技术确认。验收证据：字段质量、来源检查结果、拒绝原因。[L1: ../p1_research_base.md F03/F06/F07]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-IN-02 → FR-IN-02.2 → SL-02。execution_status=not_run。

### FR-IN-03.1 / SC-04

[CONSTRUCTED] 角色：销售。Given：同一批次清单含两个包，多个技术文件可关联其中一包；When：确认分标/包名称/分包编号；Then：保留两个包、清单顺序和多文件关系；稳定ID不只用包名称。验收证据：包与货物项清单、关联表、源序号。[L1: ../p1_research_base.md F03/F06/F05/F06]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-IN-03 → FR-IN-03.1 → SL-02。execution_status=not_run。

### FR-IN-03.2 / SC-04

[CONSTRUCTED] 角色：销售与技术。Given：清单与规范同字段不同值，或两个包名称相同但分标不同；When：自动关联后人工核对；Then：保留各来源值和歧义候选；未确定归属不跨包合并；销售登记客户结论、技术复核。验收证据：冲突清单、归属确认及原值。[L1: ../p1_research_base.md F03/F06/F05/F06]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-IN-03 → FR-IN-03.2 → SL-02。execution_status=not_run。

### FR-SR-01.1 / SC-05

[CONSTRUCTED] 角色：技术。Given：技术编码9111-500085186-00026，750 kV与400/50等项目条件齐全；When：按技术编码检索并核对子件；Then：展示源表对应候选及12条子件、U9缺口；一致后可记录技术选择，空缺仍为空。验收证据：查询条件、主库版本、源表行及选择依据。[L1: ../p1_research_base.md F02/F03]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-SR-01 → FR-SR-01.1 → SL-04。execution_status=not_run。

### FR-SR-01.2 / SC-05

[CONSTRUCTED] 角色：技术。Given：同编码候选项目条件冲突，或当前快照无该编码；When：检索并尝试采用；Then：冲突候选显示差异且不可直接通过；零结果显示未找到并保留查询，可切换路径或人工处理。验收证据：差异/零结果状态、切换路径记录。[L1: ../p1_research_base.md F02/F03]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-SR-01 → FR-SR-01.2 → SL-04。execution_status=not_run。

### FR-SR-02.1 / SC-06

[CONSTRUCTED] 角色：技术。Given：06XZ11-4000-10P(H)-1A铝与66kV、300/40、类别、2011图册、图6-1-57齐全；When：组合检索并核对；Then：可定位6条子件；同型号110kV或240/30记录不合并为已确认结果。验收证据：各条件、候选差异、6条源行。[L1: ../p1_research_base.md F02/F03]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-SR-02 → FR-SR-02.1 → SL-04。execution_status=not_run。

### FR-SR-02.2 / SC-06

[CONSTRUCTED] 角色：技术。Given：串型号已知但导地线缺失，或组合无结果；When：检索；Then：缺字段可显示候选但不能确认；零结果保持未找到，不造记录，可补条件/换路径/人工处理。验收证据：缺失提示、确认门禁、查询历史。[L1: ../p1_research_base.md F02/F03]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-SR-02 → FR-SR-02.2 → SL-04。execution_status=not_run。

### FR-SR-03.1 / SC-07

[CONSTRUCTED] 角色：技术。Given：规范引用同目录附图，附图有图册名称版本图号；When：沿引用链检索；Then：依次可回看规范、附图、图册和拆解记录；关键条件一致后进入待人工确认。验收证据：文件关系、引用链、主库记录来源。[L1: ../p1_research_base.md F02/F03]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-SR-03 → FR-SR-03.1 → SL-04。execution_status=not_run。

### FR-SR-03.2 / SC-07

[CONSTRUCTED] 角色：技术。Given：引用图样缺失或只有不同版本记录；When：检索并试图采用；Then：显示缺图或版本差异；无对应记录为未找到，转补图/人工查证；不悄用新版替代。验收证据：引用异常、候选版本、阻断原因。[L1: ../p1_research_base.md F02/F03]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-SR-03 → FR-SR-03.2 → SL-04。execution_status=not_run。

### FR-SR-04.1 / SC-08

[CONSTRUCTED] 角色：技术。Given：仅有品名、扩充描述和部分标识；When：执行补充查询；Then：显示相关候选及命中字段；须补足适用技术条件后才能进入最终确认。验收证据：路径=补充、匹配解释、确认条件。[L1: ../p1_research_base.md F02/F03]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-SR-04 → FR-SR-04.1 → SL-04。execution_status=not_run。

### FR-SR-04.2 / SC-08

[CONSTRUCTED] 角色：技术。Given：补充查询零结果；When：查看结果并继续操作；Then：显示当前快照范围内未找到，不断言产品不存在；允许补资料及人工检索，禁止生成虚构候选。验收证据：数据范围、零结果文案、后续处理入口。[L1: ../p1_research_base.md F02/F03]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-SR-04 → FR-SR-04.2 → SL-04。execution_status=not_run。

### FR-SR-05.1 / SC-09

[CONSTRUCTED] 角色：技术。Given：导线串有导线条件，地线串有地线条件，均有电压与用途；When：分别确认两条货物项；Then：按类别检查对应导线或地线，不要求地线串填写无关导线；保存确认条件快照。验收证据：类型与字段字典规则、两条确认记录。[L1: ../p1_research_base.md F03/F09/F11/F19]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-SR-05 → FR-SR-05.1 → SL-04。execution_status=not_run。

### FR-SR-05.2 / SC-09

[CONSTRUCTED] 角色：技术。Given：电压缺失或适用导线/地线缺失；When：检索后尝试确认；Then：允许召回；拒绝确认并点出缺项，不从串型号/邻行推定条件；类别未明也不得绕过。验收证据：缺失列表、原值、拒绝事件。[L1: ../p1_research_base.md F03/F09/F11/F19]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-SR-05 → FR-SR-05.2 → SL-04。execution_status=not_run。

### FR-SR-05.3 / SC-10

[CONSTRUCTED] 角色：技术。Given：多个候选均可召回且存在接口或项目差异；When：比较并记录采用依据；Then：展示每候选关键差异及依据；只在项目条件核实后选定，其余候选仍可回查。验收证据：候选集、设计答复、选择及不采用理由。[L1: ../p1_research_base.md F03/F09/F11/F19]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-SR-05 → FR-SR-05.3 → SL-04。execution_status=not_run。

### FR-SR-05.4 / SC-10

[CONSTRUCTED] 角色：销售或技术。Given：有多个未裁定候选或机械条件冲突；When：销售试选或技术无依据确认；Then：销售无确认权；技术未核实冲突不通过，不能自动采用第一条。验收证据：权限拒绝、冲突任务、候选顺序不影响结果。[L1: ../p1_research_base.md F03/F09/F11/F19]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-SR-05 → FR-SR-05.4 → SL-04。execution_status=not_run。

### FR-SR-05.5 / SC-11

[CONSTRUCTED] 角色：技术。Given：源表H/I均为分册图号，值分别图6-1-57和图6-1-057；When：导入并核对；Then：两列原值与列位置分别保留；技术可附等价依据，不直接覆盖成一个原值。验收证据：H/I原单元格、规范映射和确认依据。[L1: ../p1_research_base.md F03/F09/F11/F19]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-SR-05 → FR-SR-05.5 → SL-04。execution_status=not_run。

### FR-SR-05.6 / SC-11

[CONSTRUCTED] 角色：技术。Given：项目引用2011版但只有2024版或不同图号候选；When：尝试沿用；Then：保持版本差异与待确认，不静默合并；仅在取得明确适用依据后记录采用。验收证据：版本差异、图样引用与采用说明。[L1: ../p1_research_base.md F03/F09/F11/F19]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-SR-05 → FR-SR-05.6 → SL-04。execution_status=not_run。

### FR-SC-01.1 / SC-12

[CONSTRUCTED] 角色：销售。Given：包内含3个串与1个独立间隔棒；When：确认本次报价范围；Then：四个原项都保留；间隔棒单列不混入串结果，报价列排除范围。验收证据：原始项计数、包含/排除清单。[L1: ../p1_research_base.md F03/F06/F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-SC-01 → FR-SC-01.1 → SL-03。execution_status=not_run。

### FR-SC-01.2 / SC-12

[CONSTRUCTED] 角色：销售。Given：一串仍有技术阻断；When：尝试排除且不填依据，或排除后恢复；Then：无依据拒绝；有依据可变更范围但留痕并使范围/核价审批失效；恢复后原未解风险重新参与门禁。验收证据：范围版本、风险保留、审批失效记录。[L1: ../p1_research_base.md F03/F06/F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-SC-01 → FR-SC-01.2 → SL-03。execution_status=not_run。

### FR-BM-01.1 / SC-13

[CONSTRUCTED] 角色：技术。Given：测试串采购数量10套，每套子件2件，子件必要字段完整；When：生成BOM并确认；Then：每套2件、总用量20件分别展示，串料号与子件料号分开，不覆盖原采购量。验收证据：BOM版本、2×10计算、串/子件字段。[L1: ../p1_research_base.md F03/F06/F09/F11/F11/F12]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-BM-01 → FR-BM-01.1 → SL-04。execution_status=not_run。

### FR-BM-01.2 / SC-13

[CONSTRUCTED] 角色：技术。Given：子件用量为0/空、单位不明或适用必要材质缺失；When：提交BOM确认；Then：生成草稿和问题，未核实有效用量/单位/材质不能技术通过；参数按名称+序号分组有源位置。验收证据：草稿、必要字段规则及阻断任务。[L1: ../p1_research_base.md F03/F06/F09/F11/F11/F12]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-BM-01 → FR-BM-01.2 → SL-04。execution_status=not_run。

### FR-PR-02.1 / SC-14

[CONSTRUCTED] 角色：技术与财务。Given：子件无U9料号，但技术物料身份明确且有经财务确认的有效报价依据；When：技术核对后核价；Then：U9仍空并标待补充；价格依据绑定物料身份、版本、单位和有效期，财务可审核。验收证据：技术确认、物料映射、价格依据。[L1: ../p1_research_base.md F03/F09/F11/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-PR-02 → FR-PR-02.1 → SL-05。execution_status=not_run。

### FR-PR-02.2 / SC-14

[CONSTRUCTED] 角色：财务。Given：U9字段存在但查不到对应价格，或只有相似型号价格；When：尝试核价通过；Then：无有效关联或价格过期拒绝通过，不能按料号非空直接放行；请求有效价格。验收证据：价格关联失败记录、期效检查、拒绝原因。[L1: ../p1_research_base.md F03/F09/F11/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-PR-02 → FR-PR-02.2 → SL-05。execution_status=not_run。

### FR-RK-01.1 / SC-15

[CONSTRUCTED] 角色：销售。Given：当前技术问题未解决，有两个技术人员可分配；When：指派李工再转交周工（测试人员）；Then：只有周工为当前负责人，原指派留痕；问题仍未解决，门禁不变。验收证据：任务ID、指派链、版本与未解状态。[L1: ../p1_research_base.md F04/F14/F08/F19]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-RK-01 → FR-RK-01.1 → SL-03。execution_status=not_run。

### FR-RK-01.2 / SC-15

[CONSTRUCTED] 角色：销售。Given：试图指派停用账号、无项目权限者或未选人员；When：保存指派；Then：拒绝且原负责人不变；不能得到无人负责的处理中任务。验收证据：授权校验、原负责人、拒绝记录。[L1: ../p1_research_base.md F04/F14/F08/F19]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-RK-01 → FR-RK-01.2 → SL-03。execution_status=not_run。

### FR-RK-02.1 / SC-16

[CONSTRUCTED] 角色：当前负责人。Given：技术阻断尚未解决；When：点击等待补充；Then：可记录等待补充原因，仍计未解阻断，不能因此提交技术通过或财务。保存等待原因、操作人、时间、版本；恢复处理或解决后仍可查看历史记录。。验收证据：任务状态、阻断列表及门禁结果。[L1: ../p1_research_base.md F04/F14/F08/F19]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-RK-02 → FR-RK-02.1 → SL-03。execution_status=not_run。

### FR-RK-02.2 / SC-16

[CONSTRUCTED] 角色：规则授权确认人。Given：规则可能不适用当前对象；When：无依据尝试不适用，再提交适用性依据；Then：无依据拒绝；有权限且依据充分可标不适用并保留规则/确认人/版本；相关条件变更后重新评估。验收证据：适用性证据、不适用记录、变更重评结果。[L1: ../p1_research_base.md F04/F14/F08/F19]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-RK-02 → FR-RK-02.2 → SL-03。execution_status=not_run。

### FR-RK-02.3 / SC-17

[CONSTRUCTED] 角色：当前指派负责人。Given：问题的必要补充已具备；When：填写结果与可回查依据并提交结案；Then：检查适用规则已满足后解决；若需复核则先待确认，由规则授权确认人通过后解决。验收证据：处理值、依据、处理/确认人及版本。[L1: ../p1_research_base.md F04/F14/F08/F19]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-RK-02 → FR-RK-02.3 → SL-03。execution_status=not_run。

### FR-RK-02.4 / SC-17

[CONSTRUCTED] 角色：同角色非负责人或未授权人员。Given：他人任务未解，或仅填已处理但缺必要值；When：请求结案；Then：拒绝越权或无效内容；填写文本不能替代满足字段条件，原阻断仍保留。验收证据：接口拒绝、原任务、字段校验。[L1: ../p1_research_base.md F04/F14/F08/F19]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-RK-02 → FR-RK-02.4 → SL-03。execution_status=not_run。

### FR-WF-01.1 / SC-18

[CONSTRUCTED] 角色：销售与技术。Given：纳入项均有技术结果且销售阻断已解除；When：双方以任意先后顺序确认当前需求包；Then：保存独立确认人和版本；两者对应当前版本且核价前阻断均解除才可转财务。验收证据：双确认版本、全包门禁计算记录。[L1: ../p1_research_base.md F04/F14/F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-WF-01 → FR-WF-01.1 → SL-03。execution_status=not_run。

### FR-WF-01.2 / SC-18

[CONSTRUCTED] 角色：销售或技术。Given：仅一方确认，或另一方版本过期，或纳入项有阻断；When：提交财务；Then：三种情况均拒绝并列缺少条件；包内其他任务可继续。验收证据：版本引用、拒绝原因、并行任务状态。[L1: ../p1_research_base.md F04/F14/F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-WF-01 → FR-WF-01.2 → SL-03。execution_status=not_run。

### FR-WF-02.1 / SC-19

[CONSTRUCTED] 角色：技术。Given：可从已有图册核对图号的技术问题；When：自行核对并记录结果；Then：解决自己的技术问题，不强制退销售；仍需完成整项及整包确认。验收证据：图册依据、问题与整包确认独立记录。[L1: ../p1_research_base.md F04/F14/F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-WF-02 → FR-WF-02.1 → SL-03。execution_status=not_run。

### FR-WF-02.2 / SC-19

[CONSTRUCTED] 角色：技术与销售。Given：清单与规范导线冲突且需客户答复；When：技术退回指定字段，销售取得答复后修订；Then：技术不得改客户确认值；销售附答复，受影响技术、核价和审批失效后重审。验收证据：退回原因/字段、答复、版本变化。[L1: ../p1_research_base.md F04/F14/F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-WF-02 → FR-WF-02.2 → SL-03。execution_status=not_run。

### FR-WF-02.3 / SC-20

[CONSTRUCTED] 角色：财务与销售。Given：仅缺运费或报价有效期，技术要求未变；When：退商务事项给销售补充；Then：记录商务补充，财务重核；无需重跑未受影响技术，审批重判。验收证据：商务版本、原技术确认、核价/审批状态。[L1: ../p1_research_base.md F04/F14/F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-WF-02 → FR-WF-02.3 → SL-03。execution_status=not_run。

### FR-WF-02.4 / SC-20

[CONSTRUCTED] 角色：财务与技术。Given：BOM物料关系或子件数量不明确；When：退回技术协作；Then：失效受影响技术/价格及整份金额审批；财务不能替技术改BOM通过。验收证据：退回任务、受影响对象、原审批历史。[L1: ../p1_research_base.md F04/F14/F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-WF-02 → FR-WF-02.4 → SL-03。execution_status=not_run。

### FR-AP-02.1 / SC-21

[CONSTRUCTED] 角色：董事长与财务。Given：待董事长审批且董事长认为利润不足；When：填写利润意见退回，财务改价重提；Then：原审批意见与价格版本保留；新价格重新核价和判断触发条件后提交。验收证据：两次价格版本、退回与重提记录。[L1: ../p1_research_base.md F04/F14/F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-AP-02 → FR-AP-02.1 → SL-05。execution_status=not_run。

### FR-AP-02.2 / SC-21

[CONSTRUCTED] 角色：董事长。Given：报价仍存在技术冲突，或意见为空；When：尝试利润例外通过；Then：技术冲突不能被利润例外解除；无意见不能通过；只能退到有权处理角色。验收证据：拒绝原因、技术阻断、审批记录。[L1: ../p1_research_base.md F04/F14/F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-AP-02 → FR-AP-02.2 → SL-05。execution_status=not_run。

### FR-WF-02.5 / SC-22

[CONSTRUCTED] 角色：销售/技术/财务。Given：已核对报价分别发生技术参数、采购量、单价或联系人改变；When：保存各类独立变更；Then：技术变化重审受影响项；仅采购量变化重确认销售范围并重核价；改价重核财务；纯联系人留痕而不重审无关技术。验收证据：变更类型、影响集合及各版本。[L1: ../p1_research_base.md F04/F14/F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-WF-02 → FR-WF-02.5 → SL-03。execution_status=not_run。

### FR-WF-02.6 / SC-22

[CONSTRUCTED] 角色：任一业务人员。Given：新版本已存在但持有旧版本表单或确认；When：提交更新/确认；Then：拒绝覆盖，展示版本冲突；用户重载后重新决定，不自动覆盖新值。验收证据：expectedRevision、当前版本、冲突响应。[L1: ../p1_research_base.md F04/F14/F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-WF-02 → FR-WF-02.6 → SL-03。execution_status=not_run。

### FR-PR-01.1 / SC-23

[CONSTRUCTED] 角色：财务。Given：技术结果已确认，价格来源及规则版本有效，财务测试配置已设精度；When：保存核价并复算；Then：使用未税收入和同口径成本计算毛利；十进制及已设舍入规则得到相同结果，保存输入快照。验收证据：价格源、规则版本、复算明细及舍入配置。[L1: ../p1_research_base.md F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-PR-01 → FR-PR-01.1 → SL-05。execution_status=not_run。

### FR-PR-01.2 / SC-23

[CONSTRUCTED] 角色：财务。Given：收入为0、价格负值/非数、无依据、税运费口径未定或编辑未保存；When：申请审核；Then：拒绝对应无效输入；未保存草稿不得作为审批版本，不把演示税率当正式配置。验收证据：逐字段错误、已保存版本、审批快照。[L1: ../p1_research_base.md F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-PR-01 → FR-PR-01.2 → SL-05。execution_status=not_run。

### FR-AP-01.1 / SC-24

[CONSTRUCTED] 角色：财务。Given：仅用于测试：含税门槛T=100000、毛利底线M=20%，配置完整；When：分别提交金额T-0.01、T、T+0.01及毛利M-0.01/M/M+0.01的已核价版本；Then：金额>=T或毛利<M触发董事长；均未触发且无主动升级可待出具；同时触发保留所有原因。验收证据：六个边界输入及各触发原因；数值注明测试配置。[L1: ../p1_research_base.md F04/F14/F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-AP-01 → FR-AP-01.1 → SL-05。execution_status=not_run。

### FR-AP-01.2 / SC-24

[CONSTRUCTED] 角色：财务。Given：金额门槛或毛利红线任一未配，或主动提交特殊商务事项；When：审核通过并分流；Then：任一缺配置保守走董事长，明确未配原因；主动升级走董事长，不能自动免审。验收证据：配置完整性、主动升级原因和路由记录。[L1: ../p1_research_base.md F04/F14/F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-AP-01 → FR-AP-01.2 → SL-05。execution_status=not_run。

### FR-AP-01.3 / SC-25

[CONSTRUCTED] 角色：董事长/管理员。Given：报价提交时规则版本P1，发布已授权的新规则P2且报价未出具；When：尝试按旧政策通过或出具；Then：本设计采用未出具报价重算政策：旧审批失效，回财务按P2重判；历史已出具不改。验收证据：政策发布授权、P1/P2及失效记录。[L1: ../p1_research_base.md F04/F14/F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-AP-01 → FR-AP-01.3 → SL-05。execution_status=not_run。

### FR-AP-02.3 / SC-25

[CONSTRUCTED] 角色：董事长。Given：两审批窗口都引用同一旧报价版本，另一窗口已退回或价格改变；When：提交旧通过请求；Then：版本校验拒绝，不能复活已退回审批；同幂等键重复成功请求返回同记录。验收证据：审批修订号、幂等键、唯一审批结果。[L1: ../p1_research_base.md F04/F14/F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-AP-02 → FR-AP-02.3 → SL-05。execution_status=not_run。

### FR-QT-01.1 / SC-26

[CONSTRUCTED] 角色：财务。Given：当前需求、技术、价格及规则版本审核有效；When：出具报价；Then：仅财务可执行签发，销售、技术、董事长、管理员直接调用均拒绝。同一事务创建不可变快照与导出任务并标已出具；文件单独处于处理中/成功/失败，关联版本及纳入/排除项齐全。验收证据：快照ID、输入版本、审核链及导出任务。[L1: ../p1_research_base.md F01/F16/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-QT-01 → FR-QT-01.1 → SL-06。execution_status=not_run。

### FR-QT-01.2 / SC-26

[CONSTRUCTED] 角色：财务。Given：审批无效、未完成或出具请求重复；When：申请出具；Then：仅财务可执行签发，销售、技术、董事长、管理员直接调用均拒绝。无有效审批拒绝；重复幂等键不重复快照，生成失败保留可重试状态。验收证据：门禁响应、唯一快照、失败原因。[L1: ../p1_research_base.md F01/F16/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-QT-01 → FR-QT-01.2 → SL-06。execution_status=not_run。

### FR-QT-02.1 / SC-27

[CONSTRUCTED] 角色：销售。Given：报价Q1已出具，客户要求仅改价；When：创建价格新版本；Then：Q1不可改；技术引用未变可沿用，价格与审批重核，生成Q2独立快照。验收证据：Q1/Q2引用、核价版本、旧文件校验值。[L1: ../p1_research_base.md F04/F14/F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-QT-02 → FR-QT-02.1 → SL-06。execution_status=not_run。

### FR-QT-02.2 / SC-27

[CONSTRUCTED] 角色：销售与技术。Given：报价Q1已出具且客户改导地线或BOM；When：创建需求新版本或试图直接覆盖Q1；Then：直接改Q1拒绝；新版本失效受影响技术/价格/审批，重新流程，旧Q1原样保留。验收证据：旧快照哈希、新需求与重审范围。[L1: ../p1_research_base.md F04/F14/F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-QT-02 → FR-QT-02.2 → SL-06。execution_status=not_run。

### FR-QT-03.1 / SC-28

[CONSTRUCTED] 角色：销售下载已签发文件；财务签发。Given：一客户项拆金具串/绝缘子/附件3行且模板被批准；When：按红光模板或客户授权模板导出；Then：行与原项ID关联，金额汇总回原项，列税费商务条款及排除范围；不导内部成本毛利。验收证据：模板版本、客户文件、行汇总对账。[L1: ../p1_research_base.md F01/F16/F03/F06]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-QT-03 → FR-QT-03.1 → SL-06。execution_status=not_run。

### FR-QT-03.2 / SC-28

[CONSTRUCTED] 角色：销售下载已签发文件；财务签发。Given：未授权模板、越权看金额或错误拆行总额；When：预览/导出；Then：技术不可获取最终价格文件；未授权模板/金额不平衡拒绝正式导出，保留失败原因。验收证据：响应数据白名单、模板权限与金额检查。[L1: ../p1_research_base.md F01/F16/F03/F06]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-QT-03 → FR-QT-03.2 → SL-06。execution_status=not_run。

### FR-UM-01.1 / SC-29

[CONSTRUCTED] 角色：管理员。Given：账号在授权项目及角色内；When：创建/分配/停用角色账号并检查可见字段；执行本人改密与管理员受控找回；Then：权限变更留痕；销售只见对外价，技术不见成本/利润/最终价，管理员不自带审批；改密/找回核验身份并记录审计，旧凭证及受影响会话失效。验收证据：授权矩阵、API响应字段、权限日志。[L1: ../p1_research_base.md F01/F04/F04/F14/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-UM-01 → FR-UM-01.1 → SL-01。execution_status=not_run。

### FR-UM-01.2 / SC-29

[CONSTRUCTED] 角色：停用账号/跨项目用户/管理员。Given：持有旧页面或猜测其他包ID；When：请求读取或执行审批；Then：服务端拒绝；页面隐藏不是唯一控制；停用会话不能继续操作，管理员不能批准业务；非授权角色重置他人凭证或绕过身份核验的找回请求被拒绝。验收证据：身份状态、服务端拒绝与项目隔离证据。[L1: ../p1_research_base.md F01/F04/F04/F14/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-UM-01 → FR-UM-01.2 → SL-01。execution_status=not_run。

### FR-MD-01.1 / SC-30

[CONSTRUCTED] 角色：技术/字段管理员。Given：输入同时含网省和总部采购号、技术ID和规范码、串型号两个别名；When：按来源字典提取；Then：不同业务标识分别存；同义别名只在相应对象范围归一，保留原列和原值。验收证据：字典版本、映射结果与来源。[L1: ../p1_research_base.md F08/F08]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-MD-01 → FR-MD-01.1 → SL-01。execution_status=not_run。

### FR-MD-01.2 / SC-30

[CONSTRUCTED] 角色：技术。Given：技术规范码为空但有合法串型号组合，或项目名/工程名同时存在且不同；When：执行字段必填校验；Then：规范码不全局封锁其它路径；不同名称保留两值并标关系待确认，不静默覆盖。验收证据：按路径必填规则与冲突输出。[L1: ../p1_research_base.md F08/F08]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-MD-01 → FR-MD-01.2 → SL-01。execution_status=not_run。

### FR-MD-02.1 / SC-31

[CONSTRUCTED] 角色：销售/技术。Given：新同义词建议有来源、对象和适用范围；When：提出、技术复核样本、发布；Then：发布生成新版本，记录提出/审核人及样本结果；后续解析用新版本，历史报价不改。验收证据：建议、审核、发布版本及回归样本记录。[L1: ../p1_research_base.md F08/F08]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-MD-02 → FR-MD-02.1 → SL-01。execution_status=not_run。

### FR-MD-02.2 / SC-31

[CONSTRUCTED] 角色：技术。Given：误映射将两类采购号合并，或无样本就发布；When：发布或停用错误版本；Then：未通过适用性与已知样本检查拒绝发布；已发布错误版本可停用，已生成结果标出影响，历史引用保留。验收证据：失败样本、停用记录、影响结果列表。[L1: ../p1_research_base.md F08/F08]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-MD-02 → FR-MD-02.2 → SL-01。execution_status=not_run。

### FR-MD-03.1 / SC-32

[CONSTRUCTED] 角色：技术/主数据管理员。Given：拆解Excel含成套A-I列与子件J-X列；When：导入待审核快照并发布；Then：保留原文件、原行、两图号及空值；经分组/重复/必需字段校核后发布版本，原Excel只读。验收证据：导入报告、源文件哈希、发布记录。[L1: ../p1_research_base.md F03/F09/F11]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-MD-03 → FR-MD-03.1 → SL-01。execution_status=not_run。

### FR-MD-03.2 / SC-32

[CONSTRUCTED] 角色：技术。Given：同编码多成套、同型号不同物料或子件数量异常；When：导入并尝试自动补值；Then：不以编码当唯一成套键，不邻行补缺；异常组保持不可发布或隔离，合格组发布范围明确。验收证据：异常分组、发布范围、未改原值。[L1: ../p1_research_base.md F03/F09/F11]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-MD-03 → FR-MD-03.2 → SL-01。execution_status=not_run。

### NFR-02.1 / SC-33

[CONSTRUCTED] 角色：客户IT/财务与验收人员。Given：已授权只读U9测试账号；When：同步批准字段；Then：只读读取并记录账套、源时间和字段范围。验收证据：只读接口专项记录、输入配置、执行日志与签认结果。[L1: ../p1_research_base.md F01/F16/F18/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：NFR-02 → NFR-02.1 → SL-07。execution_status=not_run。

### NFR-02.2 / SC-33

[CONSTRUCTED] 角色：客户IT/财务与验收人员。Given：已授权只读U9测试账号，并模拟相应异常；When：同步批准字段；Then：写请求无可用业务入口且被上游权限拒绝；断连不展示旧值为实时。验收证据：只读接口异常证据、失败/不可判定原因与复测前置条件。[L1: ../p1_research_base.md F01/F16/F18/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：NFR-02 → NFR-02.2 → SL-07。execution_status=not_run。

### NFR-01.1 / SC-33

[CONSTRUCTED] 角色：客户IT/财务与验收人员。Given：应用/数据库/模型/OCR/存储在测试内网且禁止外联；When：处理样本并记录网络访问；Then：客户内容处理留在内网，无外部数据调用。验收证据：内网部署专项记录、输入配置、执行日志与签认结果。[L1: ../p1_research_base.md F01/F16/F18/F15/F18]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：NFR-01 → NFR-01.1 → SL-07。execution_status=not_run。

### NFR-01.2 / SC-33

[CONSTRUCTED] 角色：客户IT/财务与验收人员。Given：应用/数据库/模型/OCR/存储在测试内网且禁止外联，并模拟相应异常；When：处理样本并记录网络访问；Then：若任一模块依赖外部数据发送，则部署验收不通过并禁止正式导入客户文件。验收证据：内网部署异常证据、失败/不可判定原因与复测前置条件。[L1: ../p1_research_base.md F01/F16/F18/F15/F18]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：NFR-01 → NFR-01.2 → SL-07。execution_status=not_run。

### NFR-08.1 / SC-33

[CONSTRUCTED] 角色：客户IT/财务与验收人员。Given：断开外网且清理浏览器缓存；When：打开主要页面及图标；Then：本地字体、图标、脚本正常加载。验收证据：离线资源专项记录、输入配置、执行日志与签认结果。[L1: ../p1_research_base.md F01/F16/F18/F15/F18]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：NFR-08 → NFR-08.1 → SL-07。execution_status=not_run。

### NFR-08.2 / SC-33

[CONSTRUCTED] 角色：客户IT/财务与验收人员。Given：断开外网且清理浏览器缓存，并模拟相应异常；When：打开主要页面及图标；Then：任何外部CDN依赖或关键资源加载失败都记为未通过。验收证据：离线资源异常证据、失败/不可判定原因与复测前置条件。[L1: ../p1_research_base.md F01/F16/F18/F15/F18]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：NFR-08 → NFR-08.2 → SL-07。execution_status=not_run。

### NFR-03.1 / SC-33

[CONSTRUCTED] 角色：客户IT/财务与验收人员。Given：完成上传、改值、核价、审批、导出和权限变更；When：抽查日志；Then：事件能定位角色、人员、对象、版本、前后值或引用、时间与原因，不含密钥。验收证据：审计专项记录、输入配置、执行日志与签认结果。[L1: ../p1_research_base.md F01/F16/F18/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：NFR-03 → NFR-03.1 → SL-07。execution_status=not_run。

### NFR-03.2 / SC-33

[CONSTRUCTED] 角色：客户IT/财务与验收人员。Given：完成上传、改值、核价、审批、导出和权限变更，并模拟相应异常；When：抽查日志；Then：任一关键动作无日志或含密钥则该分支失败。验收证据：审计异常证据、失败/不可判定原因与复测前置条件。[L1: ../p1_research_base.md F01/F16/F18/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：NFR-03 → NFR-03.2 → SL-07。execution_status=not_run。

### NFR-04.1 / SC-33

[CONSTRUCTED] 角色：客户IT/财务与验收人员。Given：含原件、确认记录和报价的已备份项目；When：在隔离环境恢复；Then：全部被抽样报价可回查原件及版本，快照哈希一致。验收证据：恢复专项记录、输入配置、执行日志与签认结果。[L1: ../p1_research_base.md F01/F16/F18/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：NFR-04 → NFR-04.1 → SL-07。execution_status=not_run。

### NFR-04.2 / SC-33

[CONSTRUCTED] 角色：客户IT/财务与验收人员。Given：含原件、确认记录和报价的已备份项目，并模拟相应异常；When：在隔离环境恢复；Then：缺原件/审批或引用断裂则恢复不合格；恢复前不替换可用生产数据。验收证据：恢复异常证据、失败/不可判定原因与复测前置条件。[L1: ../p1_research_base.md F01/F16/F18/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：NFR-04 → NFR-04.2 → SL-07。execution_status=not_run。

### NFR-06.1 / SC-33

[CONSTRUCTED] 角色：客户IT/财务与验收人员。Given：任务中断或回调重复；When：重试同幂等键；Then：只产生一个有效结果和一次状态变更，可查旧失败原因。验收证据：失败重试专项记录、输入配置、执行日志与签认结果。[L1: ../p1_research_base.md F01/F16/F18/F15/F18]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：NFR-06 → NFR-06.1 → SL-07。execution_status=not_run。

### NFR-06.2 / SC-33

[CONSTRUCTED] 角色：客户IT/财务与验收人员。Given：任务中断或回调重复，并模拟相应异常；When：重试同幂等键；Then：不同负载复用同幂等键拒绝；不能多造货物项或重复审批。验收证据：失败重试异常证据、失败/不可判定原因与复测前置条件。[L1: ../p1_research_base.md F01/F16/F18/F15/F18]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：NFR-06 → NFR-06.2 → SL-07。execution_status=not_run。

### NFR-05.1 / SC-33

[CONSTRUCTED] 角色：客户IT/财务与验收人员。Given：目标环境、15名独立测试账号、业务样本和书面超时阈值均齐备；When：同时执行上传、检索、确认和核价并保存监控；Then：至少15人并行期间服务不宕机，关键动作在书面阈值内且无丢失/越权/重复写。验收证据：15人并发专项记录、输入配置、执行日志与签认结果。[L1: ../p1_research_base.md F01/F16/F18/F15/F18]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：NFR-05 → NFR-05.1 → SL-07。execution_status=not_run。

### NFR-05.2 / SC-33

[CONSTRUCTED] 角色：客户IT/财务与验收人员。Given：目标环境和15名账号、样本已有，但双方尚未约定关键操作超时阈值；When：申请把并发验收标为通过；Then：记不可判定并要求书面确认阈值；不得以无宕机替代超时验收，本轮未执行压测。验收证据：15人并发异常证据、失败/不可判定原因与复测前置条件。[L1: ../p1_research_base.md F01/F16/F18/F15/F18]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：NFR-05 → NFR-05.2 → SL-07。execution_status=not_run。

### NFR-07.1 / SC-33

[CONSTRUCTED] 角色：客户IT/财务与验收人员。Given：财务舍入配置已批准且存在两个旧版本编辑请求；When：复算小数金额并交错提交；Then：按十进制与约定行/整单舍入得相同金额；只有满足expectedRevision的写入成功。验收证据：金额与并发版本专项记录、输入配置、执行日志与签认结果。[L1: ../p1_research_base.md F01/F16/F18/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：NFR-07 → NFR-07.1 → SL-07。execution_status=not_run。

### NFR-07.2 / SC-33

[CONSTRUCTED] 角色：客户IT/财务与验收人员。Given：技术和价格输入完整，但财务尚未批准数量精度及行/整单舍入规则；When：申请冻结生产核价规则；Then：拒绝冻结并列明缺失配置；不使用浮点默认值或自行选择舍入方法替代。验收证据：金额与并发版本异常证据、失败/不可判定原因与复测前置条件。[L1: ../p1_research_base.md F01/F16/F18/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：NFR-07 → NFR-07.2 → SL-07。execution_status=not_run。

### FR-P2-01.1 / SC-34

[CONSTRUCTED] 角色：财务/客户IT。Given：财务提供批准的工序/工时/工价/模具分摊样例与比较口径；When：迁移并抽样复算；Then：来源及版本可回查，按财务口径记录偏差；合同目标≤±8%。验收证据：成本核算输入、计算/关联明细及版本。[L1: ../p1_research_base.md F01/F16/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-P2-01 → FR-P2-01.1 → SL-08。execution_status=not_run。

### FR-P2-01.2 / SC-34

[CONSTRUCTED] 角色：财务/客户IT。Given：已收到成本样例，但缺工时或模具分摊口径，财务比较基准未确认；When：迁移并抽样复算；Then：核算记不可判定，列缺项及财务确认责任；不得报告成本偏差已达标。验收证据：成本核算缺口/差异清单与阻断原因。[L1: ../p1_research_base.md F01/F16/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-P2-01 → FR-P2-01.2 → SL-08。execution_status=not_run。

### FR-P2-02.1 / SC-34

[CONSTRUCTED] 角色：财务/客户IT。Given：外网资料已通过甲方审批，含单位税费有效期；When：在内网人工导入；Then：保存来源、批准人、时间和价格版本，经复核生效。验收证据：材料价导入输入、计算/关联明细及版本。[L1: ../p1_research_base.md F01/F16/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-P2-02 → FR-P2-02.1 → SL-08。execution_status=not_run。

### FR-P2-02.2 / SC-34

[CONSTRUCTED] 角色：财务/客户IT。Given：以完整材料价记录为基准，每轮分别移除审批凭证、单位、税费或有效期，或将有效期改为已过期；When：在内网人工导入；Then：无批准、单位/税费缺失或已过期则不生效，不自动覆盖有效价格。验收证据：材料价导入缺口/差异清单与阻断原因。[L1: ../p1_research_base.md F01/F16/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-P2-02 → FR-P2-02.2 → SL-08。execution_status=not_run。

### FR-P2-03.1 / SC-34

[CONSTRUCTED] 角色：财务/客户IT。Given：历史、当次、中标后U9报价都含可对应客户项与价格口径；When：关联三类报价；Then：同口径项显示差额/差率及来源；无法对应的项单列不可比。验收证据：项目报价比对输入、计算/关联明细及版本。[L1: ../p1_research_base.md F01/F16/F16/F17/F18]

分类：risk_class=AMBER；money_path=true；analytics_touch=false。Trace：FR-P2-03 → FR-P2-03.1 → SL-08。execution_status=not_run。

### FR-P2-03.2 / SC-34

[CONSTRUCTED] 角色：财务/客户IT。Given：对三类报价分别构造：一项身份不对应；一项单位无换算依据；一项税口径不明；一项目未取得中标后数据；When：关联三类报价；Then：身份、单位、税费不一致时不直接比较；无中标数据不伪造第三组结果。验收证据：项目报价比对缺口/差异清单与阻断原因。[L1: ../p1_research_base.md F01/F16/F16/F17/F18]

分类：risk_class=AMBER；money_path=true；analytics_touch=false。Trace：FR-P2-03 → FR-P2-03.2 → SL-08。execution_status=not_run。

### FR-P3-01.1 / SC-35

[CONSTRUCTED] 角色：技术。Given：技术文件与适用产品的报告均可查，有参数和单位；When：关联并核对报告；Then：同单位/可验证换算后比较，保留原值和换算；按合同10份报告抽检，目标≥95%且计分口径先确认。验收证据：报告文件、参数映射、换算依据和抽检记录。[L1: ../p1_research_base.md F01/F16]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-P3-01 → FR-P3-01.1 → SL-09。execution_status=not_run。

### FR-P3-01.2 / SC-35

[CONSTRUCTED] 角色：技术。Given：报告对应产品不同、缺参数或单位不可换算；When：关联或尝试标一致；Then：显示不适用/缺失/差异，不可凭名称相似标通过；转技术核查。验收证据：适用性、差异字段及人工结论。[L1: ../p1_research_base.md F01/F16]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-P3-01 → FR-P3-01.2 → SL-09。execution_status=not_run。

### FR-P3-02.1 / SC-36

[CONSTRUCTED] 角色：技术/双方验收人员。Given：标准件及尺寸微调样本经POC演示且双方书面通过；When：启动正式出图并抽检；Then：记录POC授权；3D和2D投影关联同参数版本；20份全自动原始输出按确认口径计分，目标≥98%；人工复核另记。验收证据：POC记录、参数版本、原始输出、人工修订记录及评分。[L1: ../p1_research_base.md F01/F16/F16]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-P3-02 → FR-P3-02.1 → SL-09。execution_status=not_run。

### FR-P3-02.2 / SC-36

[CONSTRUCTED] 角色：技术。Given：POC未通过/缺书面确认，或请求超出标准件微调范围；When：启动出图；Then：拒绝正式任务；按合同协商后续，不默认把曲面非标纳入；人工修正不得算原始自动成功。验收证据：拒绝原因、范围记录、原始与修订输出分离。[L1: ../p1_research_base.md F01/F16/F16]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：FR-P3-02 → FR-P3-02.2 → SL-09。execution_status=not_run。

### FR-P3-03.1 / SC-37

[CONSTRUCTED] 角色：客户对应负责人/项目负责人。Given：提供的总表和约定一期品类清单；When：检查标准串总表；Then：按清单核对串与子件、缺项及责任人，完整性签认后将该依赖标就绪。验收证据：标准串总表清单、责任人、来源及签认记录。[L1: ../p1_research_base.md F18]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-P3-03 → FR-P3-03.1 → SL-07。execution_status=not_run。

### FR-P3-03.2 / SC-37

[CONSTRUCTED] 角色：客户对应负责人/项目负责人。Given：只收到主表节选，未收到约定一期品类清单；When：检查标准串总表；Then：仅有节选或缺清单时不能把该依赖标完成。验收证据：标准串总表缺项、阻断范围与下一确认责任人。[L1: ../p1_research_base.md F18]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-P3-03 → FR-P3-03.2 → SL-07。execution_status=not_run。

### FR-P3-03.3 / SC-37

[CONSTRUCTED] 角色：客户对应负责人/项目负责人。Given：同一中标项目清单、规范、附图、BOM及报价相关资料；When：检查750kV完整样例；Then：核对项目身份和从询价到报价的关系，形成完备性清单。验收证据：750kV完整样例清单、责任人、来源及签认记录。[L1: ../p1_research_base.md F18]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-P3-03 → FR-P3-03.3 → SL-07。execution_status=not_run。

### FR-P3-03.4 / SC-37

[CONSTRUCTED] 角色：客户对应负责人/项目负责人。Given：已有750kV清单，但缺同项目规范或BOM，尚不能建立端到端关联；When：检查750kV完整样例；Then：同目录有750kV文件不等于完整样例，缺环节列阻塞。验收证据：750kV完整样例缺项、阻断范围与下一确认责任人。[L1: ../p1_research_base.md F18]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-P3-03 → FR-P3-03.4 → SL-07。execution_status=not_run。

### FR-P3-03.5 / SC-37

[CONSTRUCTED] 角色：客户对应负责人/项目负责人。Given：财务提供2~3张单品成本结构样例；When：检查成本样例；Then：确认含工序/工时/工价/模具分摊及财务口径，签认设计依据。验收证据：成本样例清单、责任人、来源及签认记录。[L1: ../p1_research_base.md F18]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-P3-03 → FR-P3-03.5 → SL-07。execution_status=not_run。

### FR-P3-03.6 / SC-37

[CONSTRUCTED] 角色：客户对应负责人/项目负责人。Given：财务未提供成本结构样例或缺工时/分摊依据；When：检查成本样例；Then：未收到或不可核对则二期核算设计依赖未完成。验收证据：成本样例缺项、阻断范围与下一确认责任人。[L1: ../p1_research_base.md F18]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-P3-03 → FR-P3-03.6 → SL-07。execution_status=not_run。

### FR-P3-03.7 / SC-37

[CONSTRUCTED] 角色：客户对应负责人/项目负责人。Given：账套、字段清单、只读账号及接口支持凭证；When：检查U9字段权限；Then：客户IT签认可读字段和联调前置，账号不写入PRD。验收证据：U9字段权限清单、责任人、来源及签认记录。[L1: ../p1_research_base.md F18]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-P3-03 → FR-P3-03.7 → SL-07。execution_status=not_run。

### FR-P3-03.8 / SC-37

[CONSTRUCTED] 角色：客户对应负责人/项目负责人。Given：本地表有U9料号，但没有只读账号或字段授权凭证；When：检查U9字段权限；Then：文件里存在料号不等于接口已授权，未授权不得标接入就绪。验收证据：U9字段权限缺项、阻断范围与下一确认责任人。[L1: ../p1_research_base.md F18]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-P3-03 → FR-P3-03.8 → SL-07。execution_status=not_run。

### FR-P3-03.9 / SC-37

[CONSTRUCTED] 角色：客户对应负责人/项目负责人。Given：服务器/GPU/网络拓扑与内网资源清单；When：检查部署资源；Then：IT确认资源和运行依赖满足试部署，保留签认。验收证据：部署资源清单、责任人、来源及签认记录。[L1: ../p1_research_base.md F18]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-P3-03 → FR-P3-03.9 → SL-07。execution_status=not_run。

### FR-P3-03.10 / SC-37

[CONSTRUCTED] 角色：客户对应负责人/项目负责人。Given：未收到客户IT服务器/GPU/网络资源确认；When：检查部署资源；Then：无资源凭证或未能满足内网约束则部署依赖未完成。验收证据：部署资源缺项、阻断范围与下一确认责任人。[L1: ../p1_research_base.md F18]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-P3-03 → FR-P3-03.10 → SL-07。execution_status=not_run。

### FR-P3-03.11 / SC-37

[CONSTRUCTED] 角色：客户对应负责人/项目负责人。Given：双方书面准确率/覆盖率/差异率/时效/并发计算约定；When：检查指标口径；Then：逐项绑定合同条款、分母、样本与起止事件。验收证据：指标口径清单、责任人、来源及签认记录。[L1: ../p1_research_base.md F18]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-P3-03 → FR-P3-03.11 → SL-07。execution_status=not_run。

### FR-P3-03.12 / SC-37

[CONSTRUCTED] 角色：客户对应负责人/项目负责人。Given：双方尚未对验收样本分母和计算方式书面达成一致；When：检查指标口径；Then：未书面一致的对应指标工作按合同暂停，不自行推定分母。验收证据：指标口径缺项、阻断范围与下一确认责任人。[L1: ../p1_research_base.md F18]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-P3-03 → FR-P3-03.12 → SL-07。execution_status=not_run。

### FR-P3-03.13 / SC-37

[CONSTRUCTED] 角色：客户对应负责人/项目负责人。Given：总负责人、业务需求专员、供应技术部管理员、IT管理员及10~20份历史样本和模板；When：检查甲方分工与验收样本；Then：按合同核对责任角色到位、样本可读与模板授权，记录实际人员在受控项目配置 BOM参考表已提供不代表对外报价签章模板及生产必填规则全部确认。。验收证据：甲方分工与验收样本清单、责任人、来源及签认记录。[L1: ../p1_research_base.md F18]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-P3-03 → FR-P3-03.13 → SL-07。execution_status=not_run。

### FR-P3-03.14 / SC-37

[CONSTRUCTED] 角色：客户对应负责人/项目负责人。Given：仅有原型演示人员，甲方四类角色未到岗确认，或缺历史样本/模板授权；When：检查甲方分工与验收样本；Then：原型虚构人员不能替代到岗确认；缺样本/模板保留依赖 BOM参考表已提供不代表对外报价签章模板及生产必填规则全部确认。。验收证据：甲方分工与验收样本缺项、阻断范围与下一确认责任人。[L1: ../p1_research_base.md F18]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-P3-03 → FR-P3-03.14 → SL-07。execution_status=not_run。

### FR-P3-03.15 / SC-37

[CONSTRUCTED] 角色：客户对应负责人/项目负责人。Given：已交付维护/接口/部署说明和培训资料，有授权IT人员；When：检查样板移交；Then：甲方IT独立完成至少1个维护场景，留步骤、结果与验收签认。验收证据：样板移交清单、责任人、来源及签认记录。[L1: ../p1_research_base.md F18]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-P3-03 → FR-P3-03.15 → SL-07。execution_status=not_run。

### FR-P3-03.16 / SC-37

[CONSTRUCTED] 角色：客户对应负责人/项目负责人。Given：IT只观看演示，维护操作由研发人员代做；When：检查样板移交；Then：由开发代操作或只能观看演示不计独立完成。验收证据：样板移交缺项、阻断范围与下一确认责任人。[L1: ../p1_research_base.md F18]

分类：risk_class=AMBER；money_path=false；analytics_touch=false。Trace：FR-P3-03 → FR-P3-03.16 → SL-07。execution_status=not_run。

### NFR-05.3 / SC-33

[CONSTRUCTED] 角色：客户IT/验收人员。Given：15名独立账号、业务样本和书面超时阈值已齐备，运行中分别注入宕机或超过阈值的关键请求；When：执行并发验收并核对监控；Then：任一宕机、超过书面阈值、丢失/重复写均判该分支未通过；记录受影响请求与复测条件。验收证据：压力输入、时间记录、故障及一致性检查；本轮文档未运行。[L1: ../p1_research_base.md F01/F16/F18/F15/F18]

分类：risk_class=RED；money_path=false；analytics_touch=false。Trace：NFR-05 → NFR-05.3 → SL-07。execution_status=not_run。

### NFR-07.3 / SC-33

[CONSTRUCTED] 角色：财务/业务人员。Given：舍入规则已批准，两个请求使用同一旧expectedRevision，第一个写入已成功；When：提交第二个旧版本请求；Then：拒绝旧请求并返回当前版本，原成功记录不被覆盖；刷新后须重新确认输入。验收证据：两个版本请求、冲突响应和未被覆盖的数据。[L1: ../p1_research_base.md F01/F16/F18/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：NFR-07 → NFR-07.3 → SL-07。execution_status=not_run。

### FR-P2-01.3 / SC-34

[CONSTRUCTED] 角色：财务/验收人员。Given：样例和财务口径均已批准，某核算结果相对基准偏差绝对值超过8%；When：核对抽样差异；Then：该样例判未达标并输出分项差异，不能通过更改基准或漏掉该样例宣称达标。验收证据：基准、系统结果、偏差计算及固定样本名单。[L1: ../p1_research_base.md F01/F16/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-P2-01 → FR-P2-01.3 → SL-08。execution_status=not_run。

### FR-QT-01.3 / SC-26

[CONSTRUCTED] 角色：财务。Given：issueQuote成功已原子冻结Q1并记已出具，导出任务随后失败，期间审批政策由P1发布为P2；When：重试Q1导出，并另建Q2申请改价；Then：仅财务可执行签发，销售、技术、董事长、管理员直接调用均拒绝。Q1继续按冻结时有效的P1及原价生成文件，已出具状态不回退；Q2是新报价需按当前P2重新审批；政策发布与issue并发时事务校验决定单一先后次序。验收证据：Q1冻结事件、导出任务失败/重试、政策版本、Q2审核及事件顺序。[L1: ../p1_research_base.md F01/F16/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-QT-01 → FR-QT-01.3 → SL-06。execution_status=not_run。

### FR-P2-03.3 / SC-34

[CONSTRUCTED] 角色：双方验收负责人。Given：二期扩充品类清单及分类/覆盖计分口径已书面确认；When：按清单统计覆盖；Then：分别报告已覆盖和未覆盖品类，约80%目标沿合同来源展示；与一期业务覆盖率和匹配命中率分开。验收证据：品类清单版本、分子分母、各指标来源。[L1: ../p1_research_base.md F01/F16/F16/F17/F18]

分类：risk_class=AMBER；money_path=true；analytics_touch=false。Trace：FR-P2-03 → FR-P2-03.3 → SL-08。execution_status=not_run。

### FR-P2-03.4 / SC-34

[CONSTRUCTED] 角色：双方验收负责人。Given：一期覆盖率、命中率或二期扩充口径未书面区分；When：试图合并公布一个80%达标值；Then：拒绝合并达标声明，标记口径未确认，保留各自原始计数。验收证据：三个指标定义、未决口径与禁止达标记录。[L1: ../p1_research_base.md F01/F16/F16/F17/F18]

分类：risk_class=AMBER；money_path=true；analytics_touch=false。Trace：FR-P2-03 → FR-P2-03.4 → SL-08。execution_status=not_run。

### FR-BM-02.1 / SC-38

[CONSTRUCTED] 角色：技术/销售。Given：仅部分纳入串已确认；When：查看并导出项目 BOM；Then：仅已确认串进入明细；标明草稿及未确认货物项；无明细时禁止空导出。验收证据：导出文件、版本及缺项说明。[L1: ../p1_research_base.md F09/F13]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-BM-02 → FR-BM-02.1 → SL-04。execution_status=not_run。

### FR-BM-02.2 / SC-38

[CONSTRUCTED] 角色：技术/财务。Given：每套子件2件，采购10套；另含空用量及零用量；When：导出并读回 XLSX；Then：主表23列；H列10、R列2，总用量20；空值保持空，零保留零；采购与每套数量不混合。验收证据：主表列顺序、公式及读回结果。[L1: ../p1_research_base.md F09/F13]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-BM-02 → FR-BM-02.2 → SL-04。execution_status=not_run。

### FR-BM-02.3 / SC-38

[CONSTRUCTED] 角色：销售。Given：全部纳入串逐项且整体技术确认对应当前版本；When：导出技术确认版；Then：标记技术确认版并记录版本/来源；缺失U9或业务主数据保持空；不表示生产下单已验收。验收证据：编制说明、主数据空值、版本引用。[L1: ../p1_research_base.md F09/F13]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-BM-02 → FR-BM-02.3 → SL-04。execution_status=not_run。

### FR-BM-02.4 / SC-38

[CONSTRUCTED] 角色：销售/技术。Given：当前项目没有平行挂板标段分配；When：导出工作簿；Then：保留9列表结构，不复制参考工程数量；独立物资及排除项不进入串BOM。验收证据：平行挂板表、排除范围。[L1: ../p1_research_base.md F09/F13]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-BM-02 → FR-BM-02.4 → SL-04。execution_status=not_run。

### FR-BM-02.5 / SC-38

[CONSTRUCTED] 角色：管理员/无项目权限人员。Given：已生成项目BOM；When：越权查看或导出；Then：拒绝；有权业务角色查看的BOM不包含售价、成本、毛利；正式服务端执行鉴权。验收证据：接口授权与文件字段检查。[L1: ../p1_research_base.md F09/F13]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-BM-02 → FR-BM-02.5 → SL-04。execution_status=not_run。

### FR-AP-03.1 / SC-39

[CONSTRUCTED] 角色：董事长。Given：审批阶段，未税成本80，当前售价100；When：填目标毛利率25%与原因后保存；Then：单价106.67，成本80不变；记录前后值、方式、目标值、理由、人员、时间及版本；转财务复核。验收证据：调价记录及核价版本。[L1: ../p1_research_base.md F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-AP-03 → FR-AP-03.1 → SL-05。execution_status=not_run。

### FR-AP-03.2 / SC-39

[CONSTRUCTED] 角色：董事长。Given：审批阶段且有纳入报价货物项；When：直接输入有效未税单价与原因；Then：按输入单价重算该项及整单金额毛利；保存确认方案后转财务。验收证据：价格计算、确认方案指纹、审计。[L1: ../p1_research_base.md F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-AP-03 → FR-AP-03.2 → SL-05。execution_status=not_run。

### FR-AP-03.3 / SC-39

[CONSTRUCTED] 角色：销售/技术/财务/管理员或阶段错误的董事长。Given：无调价权限、阶段不符、原因空、价格非正或目标毛利率100%；When：提交调价；Then：分别拒绝，不修改成本、价格或阶段；原型反算毛利率要求成本大于0、目标值0至小于100。验收证据：拒绝响应和前后数据。[L1: ../p1_research_base.md F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-AP-03 → FR-AP-03.3 → SL-05。execution_status=not_run。

### FR-AP-03.4 / SC-39

[CONSTRUCTED] 角色：财务。Given：董事长已确认调价方案；When：复核后通过；Then：需求版本、纳入项、数量、售价、成本、价格依据、税率、商务说明和审批配置一致时沿用确认，进入待财务签发。验收证据：方案指纹及复核记录。[L1: ../p1_research_base.md F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-AP-03 → FR-AP-03.4 → SL-05。execution_status=not_run。

### FR-AP-03.5 / SC-39

[CONSTRUCTED] 角色：财务。Given：董事长调价后；When：修改任一确认方案字段或审批配置再通过；Then：重新进入董事长审批；技术变化按影响范围重新确认；不能沿用过期确认。验收证据：新旧指纹、阶段和失效记录。[L1: ../p1_research_base.md F04/F14]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-AP-03 → FR-AP-03.5 → SL-05。execution_status=not_run。

### FR-QT-01.4 / SC-26

[CONSTRUCTED] 角色：销售/技术/董事长/管理员。Given：待财务签发；When：直接调用签发命令；Then：拒绝且不创建快照；财务成功后销售只能下载对应已签发版本。验收证据：角色矩阵与快照数量。[L1: ../p1_research_base.md F01/F16/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-QT-01 → FR-QT-01.4 → SL-06。execution_status=not_run。

### FR-UM-01.3 / SC-29

[CONSTRUCTED] 角色：原型用户。Given：浏览器保留旧角色审批阶段和旧审核记录；When：升级后打开原型；Then：当前角色显示董事长、旧阶段可继续流转；历史意见和冻结快照原文不改写。验收证据：迁移前后记录、阶段及显示检查。[L1: ../p1_research_base.md F01/F04/F04/F14/F15/F18]

分类：risk_class=RED；money_path=true；analytics_touch=false。Trace：FR-UM-01 → FR-UM-01.3 → SL-01。execution_status=not_run。

