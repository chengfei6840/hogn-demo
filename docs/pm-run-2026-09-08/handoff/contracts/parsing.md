# parsing 接口约定



[FOUND] 当前入口及响应按本轮读取的demo_api.py定义，未向真实服务发送请求。 [L2: /Users/1ovepingu/Desktop/Projects/quotation_agent/src/parsing_core/demo_api.py:101]

| 接口 | 当前输入 | 当前返回 |
| --- | --- | --- |
| `/v1/markdown` | multipart file（单个） | [FOUND] markdown、sha256、file_type、parser_code、parser_version、needs_ocr、warnings、quality [L2: /Users/1ovepingu/Desktop/Projects/quotation_agent/src/parsing_core/demo_api.py:101及416至517] |
| `/v1/extract` | JSON markdown、schema；可选file_name、use_large_model、model_name | [FOUND] status、items、issues、warnings、notes、totals、abbreviations、risk_issues、summary；部分情况下modelChunkTraces [L2: /Users/1ovepingu/Desktop/Projects/quotation_agent/src/parsing_core/demo_api.py:101及416至517] |
| `/v1/parse` | multipart file、schema_json；可选use_large_model、model_name | [FOUND] status、markdown子对象、extraction子对象 [L2: /Users/1ovepingu/Desktop/Projects/quotation_agent/src/parsing_core/demo_api.py:101及416至517] |
| `/v1/parse/stream` | 与parse相同单文件输入 | [FOUND] SSE事件；final_response携带完整响应，错误事件不能当完整成功 [L2: /Users/1ovepingu/Desktop/Projects/quotation_agent/src/parsing_core/demo_api.py:101及416至517] |

[FOUND] 状态由merge_status/completion_status映射为blocked、partial、failed或completed；HTTP成功不等于内容完整。当前markdown响应没有返回通用DocumentIR，也没有直接暴露source_map字段。 [L2: /Users/1ovepingu/Desktop/Projects/quotation_agent/src/parsing_core/demo_api.py:416及442]

[FOUND] 多文件混析已完成；批次接口保留文件、上传记录、重复记录和关系判定结果。原型尚未调用这些接口，国网业务归属与Schema适配需单独联调。ZIP未完成，本轮不检查；ZIP相关需求保留为后续验收要求。 [L0: docs/pm-run-2026-09-08/evidence/user-decisions.md D03；L1: docs/pm-run-2026-09-08/p1_research_base.md F05/F06/F07]

[CONSTRUCTED] 业务适配输出约定：batch_id、file_id、content_hash、task_id、schema_version、status、raw_response_ref、items、field_sources、warnings。field_sources能提供原始工作表/单元格、页/区域或段落时保存；无法映射则locator_status=unavailable，保留原因并转人工核对。不能伪造原始页码。该输出是拟建适配层，不改变当前服务响应事实。 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收]

[CONSTRUCTED] 响应blocked/partial/failed分别生成可定位的阻断或异常任务；completed仍需业务条件检查。网络失败、超时和重试关联原任务及幂等键；调用身份、内网网关与凭据由正式集成配置，凭据不写入文档。 [L1: docs/pm-run-2026-09-08/p2_strategy_rationale.md；本设计细化需按第10章验收]

[FOUND] 当前示例错误包括schema/Markdown质量1003、空Markdown1005、Schema未接入2001、需OCR或不可用2003；上传为空400、过大413、格式校验失败415另由HTTP抛出，不能把所有错误统一按这四个数解析。 [L2: /Users/1ovepingu/Desktop/Projects/quotation_agent/src/parsing_core/demo_api.py:65及697至715]


[FOUND] 批次入口已在demo_api注册。REST接口接受`files`、`schema_json`、可选`groups_json`及`use_large_model`；演示接口使用`project_code`代替schema_json。此处是代码契约核对，不代表国网端到端实测通过。[L1: docs/pm-run-2026-09-08/p1_research_base.md F06]

| 批次接口 | 契约 |
| --- | --- |
| POST `/v1/parse/batch`、`/api/parse/batch` | [FOUND] 执行多文件解析与关系判定，返回batch_id、status、files、uploads、duplicate_uploads、relations、unified_items、association_status、review_status等。status的complete/partial/failed与业务确认分别处理。 [L2: docs/pm-run-2026-09-08/source-register.json S26/S27/S28] |
| POST `/v1/parse/batch/stream`、`/api/parse/batch/stream` | [FOUND] SSE progress、final_response、done；失败走error及done。仅done不能证明解析成功。 [L2: docs/pm-run-2026-09-08/source-register.json S26] |
| POST `/api/parse/batch/review` | [FOUND] JSON batch、policy、decisions重算关系；不调用模型，也不代替业务确认持久化。 [L2: docs/pm-run-2026-09-08/source-register.json S26/S28] |

[CONSTRUCTED] 适配层分别保存解析执行状态、关系审查状态和业务确认状态。REST关系策略来自Schema的batchRelations；国网身份字段及附件引用策略必须经样本验证，缺少关系证据时保留待确认，不自动合并。局部失败只重试失败文件，保留成功文件及原始上传关联。ZIP需求不纳入本轮工程验证。[L1: docs/pm-run-2026-09-08/p1_research_base.md F05/F06；第10章SC-04]

