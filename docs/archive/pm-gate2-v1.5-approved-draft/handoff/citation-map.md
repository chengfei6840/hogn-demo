# 本轮证据映射

|证据|结论|来源|状态|
|---|---|---|---|
|F01 [FOUND]|国网金具串为本轮业务范围，固定模块按合同分期。|D04；合同第47至68段|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F01] |
|F02 [FOUND]|客户确认PDF列三条主路径和一条补充路径；单串号不决定匹配。|S02第2页“前3种为主要检索路径”及D04|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F02] |
|F03 [FOUND]|PDF保留原始值/规范值/查找结果/确认值；缺U9等不按相似记录补齐。|S02第3页“出现多条结果时不自动选择第一条”|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F03] |
|F04 [FOUND]|财务签发、销售提供，董事长角色与单项调价为用户已确认决定。|D05/D07；S13第3.5节“财务加系数后人工签发”|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F04] |
|F05 [FOUND]|多文件混析完成；ZIP处理仍未完成且本轮不检查。|evidence/user-decisions.md D03原话|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F05] |
|F06 [FOUND]|源码注册/v1/parse/batch、batch/stream及关联审查入口；REST可传batchRelations策略。|S26 v1_batch/_response/review_batch；S05末尾include_router|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F06] |
|F07 [FOUND]|原型仍只登记上传文件名并使用预置货物项，没有调用真实解析服务。|S11 start/files命令；SourcesView.vue parse|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F07] |
|F08 [FOUND]|行业插件以Schema生成字段字典，同义词和风险规则库显示not_configured。|S07 buildFieldSchemaIndustryPlugin；S15 industryPlugin|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F08] |
|F09 [FOUND]|客户BOM主表23列，平行挂板9列；两个数量列分别用于串采购和子件。|S20两表首行；S03第5.4节；D06|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F09] |
|F10 [FOUND]|三份2024版PDF可读取页树及首页；旧知识库“无法打开”现状已过时。|S16/S17/S18首页；S04第4.5节|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F10] |
|F11 [FOUND]|C13源行69906的G/H/I为历史分册名称、图5-13、图5-013。|S09 金具最新分解G69906:I69906；evidence/catalog-sample.json|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F11] |
|F12 [FOUND]|C21/C22源行71453/105637对应规范编码及66kV/300/40记录。|S09对应行A至I；evidence/catalog-sample.json|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F12] |
|F13 [FOUND]|原型BOM仅从已采用串输出，缺业务字段留空，平行挂板只有表头。|S21 projectBom；S22 createBomWorkbook|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F13] |
|F14 [FOUND]|董事长调价后回财务；一致方案沿用确认，变更价格/成本/税率/说明/配置会重审。|S11 bossAdjust/approveFinance；S12 pricingBasis/bossReviewRequired|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F14] |
|F15 [FOUND]|当前签发命令限定财务；销售下载已签发CSV，旧快照保留。|S11 issue/revision；S25 download|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F15] |
|F16 [FOUND]|合同列抽取≥95%且20份样本、时效20份回测、零错价20份、并发≥15、出图≥98%全自动20份。|S01第74至94、300至345段|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F16] |
|F17 [FOUND]|一期覆盖≥80%与标准串命中≥80%分别位于正文和附件；二期品类扩充另列。|S01第56、83至85、306至309段|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F17] |
|F18 [FOUND]|合同要求内网、ERP/MES只读、阶段三POC书面门禁和资料依赖。|S01第41、67至68、139至143、363段|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F18] |
|F19 [FOUND]|原型关键条件校验仍依赖导线非空及字符串比较，没有完整电压必填/地线对象和子件必要字段门禁。|S12 candidateAdoptionIssues/candidateDifferences/technicalReadiness|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F19] |
|F20 [CALCULATED]|输入含34条FR加8条NFR共42条要求，39组、124分支、17项OPEN。|S23；34+8=42，场景group去重39，scenarios长度124|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F20] |
|F21 [FOUND]|当前PRD包含历史证据定位与旧“单文件为主”表述，需用本轮来源更新。|S19第9/15章及附录；F05/F06|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F21] |
|F22 [INFERRED]|主要任务是刷新事实状态和跨角色/数据/验收一致性，无需重建已确认业务方向。|F01至F21|exists：../evidence-ledger.json；原文件见../source-register.json [L1: ../evidence-ledger.json F22] |
