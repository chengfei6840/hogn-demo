# 解析服务调用与业务编排边界

[FOUND] 当前入口及响应按本轮读取的demo_api.py定义，未向真实服务发送请求。 [L1: /Users/1ovepingu/Desktop/Projects/quotation_agent/src/parsing_core/demo_api.py:101]

| 接口 | 当前输入 | 当前返回 |
| --- | --- | --- |
| `/v1/markdown` | multipart file（单个） | [FOUND] markdown、sha256、file_type、parser_code、parser_version、needs_ocr、warnings、quality [L1: /Users/1ovepingu/Desktop/Projects/quotation_agent/src/parsing_core/demo_api.py:101及416至517] |
| `/v1/extract` | JSON markdown、schema；可选file_name、use_large_model、model_name | [FOUND] status、items、issues、warnings、notes、totals、abbreviations、risk_issues、summary；部分情况下modelChunkTraces [L1: /Users/1ovepingu/Desktop/Projects/quotation_agent/src/parsing_core/demo_api.py:101及416至517] |
| `/v1/parse` | multipart file、schema_json；可选use_large_model、model_name | [FOUND] status、markdown子对象、extraction子对象 [L1: /Users/1ovepingu/Desktop/Projects/quotation_agent/src/parsing_core/demo_api.py:101及416至517] |
| `/v1/parse/stream` | 与parse相同单文件输入 | [FOUND] SSE事件；final_response携带完整响应，错误事件不能当完整成功 [L1: /Users/1ovepingu/Desktop/Projects/quotation_agent/src/parsing_core/demo_api.py:101及416至517] |

[FOUND] 状态由merge_status/completion_status映射为blocked、partial、failed或completed；HTTP成功不等于内容完整。当前markdown响应没有返回通用DocumentIR，也没有直接暴露source_map字段。 [L1: /Users/1ovepingu/Desktop/Projects/quotation_agent/src/parsing_core/demo_api.py:416及442]

[CONSTRUCTED] 调用方负责批次、ZIP安全清点、文件名编码、逐文件任务、跨文件包归属和冲突。单文件格式声明包含zip不证明上述业务链路已完成。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

[CONSTRUCTED] 业务适配输出约定：batch_id、file_id、content_hash、task_id、schema_version、status、raw_response_ref、items、field_sources、warnings。field_sources能提供原始工作表/单元格、页/区域或段落时保存；无法映射则locator_status=unavailable，保留原因并转人工核对。不能伪造原始页码。该输出是拟建适配层，不改变当前服务响应事实。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

[CONSTRUCTED] 响应blocked/partial/failed分别生成可定位的阻断或异常任务；completed仍需业务条件检查。网络失败、超时和重试关联原任务及幂等键；调用身份、内网网关与凭据由正式集成配置，凭据不写入文档。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

[FOUND] 当前示例错误包括schema/Markdown质量1003、空Markdown1005、Schema未接入2001、需OCR或不可用2003；上传为空400、过大413、格式校验失败415另由HTTP抛出，不能把所有错误统一按这四个数解析。 [L1: /Users/1ovepingu/Desktop/Projects/quotation_agent/src/parsing_core/demo_api.py:65及697至715]
