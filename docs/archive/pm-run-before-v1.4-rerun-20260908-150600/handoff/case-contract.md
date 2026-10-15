# 本轮范围与设计约定

FIXTURE, no downstream configured

[FOUND] 本轮以国网金具串、合同分期、客户已确认四路径与销售技术并行为基础；37组及100%可验收定义目标已由用户通过Gate 1。 [L1: 本任务用户“以上五项通过”及p2_strategy_rationale.md]

[CONSTRUCTED] 不变量：原始数据不覆盖；候选不等于确认；暂缓/指派不解除阻断；技术与利润权限分开；审批消费当前版本；价格来源可复算；已出具快照不可变；ERP/MES只读，客户处理留内网。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

[CONSTRUCTED] 停止条件：关键来源失效、出现与客户规则冲突、必要权限或版本分支缺失、来源被错误标成客户批准、实际接口与本契约不一致。出现问题记录REVISE并修订，不通过更换校验结果绕过。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

[CONSTRUCTED] 关键未决记录在open-items.json；生产未知项接受开放只允许继续文档工作，仍阻断相应正式配置与验收。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

## 封存状态

[CONSTRUCTED] Gate 2已批准内容与队列处理；最终签发状态见design-gate.json，文件完整性由.seal.txt校验。批准文件在最终人工决定前保持false，不作为内容文件反复封存。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]


## 哈希记录方法

[CONSTRUCTED] 每个业务与证据文件均按最终字节计算SHA-256，下方复制清单中的其他文件哈希。本文件自己的哈希只登记在外部.seal.txt和design-gate.json，避免把自身哈希写回自身导致内容改变。这是对工具包自引用顺序的可执行处理，不改变任何业务内容。[L2: /Users/1ovepingu/Desktop/Projects/skill/Product-to-Prod/skills/pm-requirements-v1/references/handoff-package.md §The seal]

[CONSTRUCTED] 顺序为：完成其他文件，生成下方哈希表，最后计算本文件哈希；最后写.seal.txt和design-gate.json。最终复核回执与批准记录位于封存清单之外，不能修改已封存内容。[L1: 本节哈希记录方法]

## Seal numbers

[CALCULATED] 以下SHA-256由shasum按最终文件字节计算；本文件自身的哈希见外部.seal.txt及design-gate.json。[L1: 本轮封存命令shasum -a 256]

| 文件 | SHA-256 |
| --- | --- |
| `HANDOFF.md` | `ebf49e2cd75d83eff46e038e759c3dd7b593a68148b463e02dae96b75e3c2137` |
| `acceptance-scenarios.json` | `01a5c538f8e974e89bb473397441c57845b9c1edc7638d0b0cc70ecd12d58bb6` |
| `citation-map.md` | `3190bc0d99835caf77a5f5a1de0ecf3bc962724169151e766bcba52ed6692a13` |
| `contracts/master-data-u9.md` | `d29553673fa2831837d3ea173a344d8b27bd3d01d445a32f62ae6ecb84503b51` |
| `contracts/outputs.md` | `8ef19a006782471a0b8f0311bf98af1b86c74697b71876bc104b8886e5fc6b33` |
| `contracts/parsing.md` | `4804fec290d82dd1f7781ca7829561b0b10995d0ab32b3da542d5936dcfbb293` |
| `contracts/workflow.md` | `17bb8b79bb3b07f30e21f60e0d0415a749338cbff450889f34b48d15aff64e68` |
| `coverage-review.json` | `7c588ef5fdfb200552e36b1aa7693993c2bd706add98ae0540767b4b376f6588` |
| `data-model.md` | `d375dab2e4aa3a4d976990db8ec01a5c213186b4e63fd403cdc97e21b9d4a4d3` |
| `final-checks.json` | `af07b972380b63c786f804131f739560c303c114364028f550804b9f19b0c8ff` |
| `gate-decisions.md` | `e01ece45faab569845c71344c3e4050c628f679fae498dba1748237bfb327ec3` |
| `inference-confirmed.json` | `1ca1590c2eadc99e07caabafefa8798716f184731de802bb45459d57671ff9d4` |
| `open-items.json` | `84c15fd2502720735d243c0d1204f5bdbdef75cee2c8d2db96d21232cb4f6679` |
| `plan.md` | `88cdebff8f18059e3748bdb0194137529b398fdc458f6bc2d80b220b61bbe560` |
| `requirements.json` | `91e15353bd7d74225de2683896a669dc58bd03a3daa728548c7967035711873a` |
| `review-final-content.md` | `b1cad0e4b576112e9dcada849f91bd2db29a634c89b7f08593d9d2d1fc3a3f8e` |
| `review-gate-2.md` | `edbe76c572823ee396ccdb47a16c1a64abb5d26faa2ddd6668fc3e5d1380e3f7` |
| `slices.json` | `e64383a28082a64c6c9a96eb3eb8d00987014ba26935bc5e29cfb0a09a2eff24` |
| `spec.md` | `12204f90191dc5f9563d835306fac1bd5c933a5c951adf2ab699e8ae16c1e3a4` |
| `structural-checks.json` | `522e738e87a25c1f09bbc6a3e2b0e55f73ee149a6e348c72c6bd45a6a5554ca9` |
| `success-metrics.json` | `1e7a577af4447d67b9d495e2a8c21c1098504c6ff2e2cd1135078aa2807e5fd3` |
| `success-metrics.md` | `278df4ee7536fe9dc1cc069dc1980315dbb4e047b683d698b8b183950724da41` |
| `../p0_context.md` | `c34fb44d5375aeaa0e3892a679342a0592d126dc4773bee44d1b093b541bac26` |
| `../p1_research_base.md` | `d3d289fc6f63278dd14792de2bd3e5eecc8cf9ec42814dc51f2d7c69a40f0686` |
| `../p2_strategy_rationale.md` | `347ba9d269e12529ac49661c8e492d2a593fac2bbb2786b5f1f4e49c6df8b92a` |
| `../p3_product_spec.md` | `12204f90191dc5f9563d835306fac1bd5c933a5c951adf2ab699e8ae16c1e3a4` |
| `../p4_handoff_package.md` | `5d8349632002f1a5717923014e6218451544ce0698832b1a8f8344c38f91fcb8` |
| `../source-register.json` | `daa3eefea15a4789cb97f042528056a21119486bed6a1f8d159f2966c5b11e9f` |
| `../review-source-v1.md` | `19cd75950dd93e0c57ceaec3e757a2a900af3f45d75ec1c720421f7d3de893f4` |
| `../review-gate-1.md` | `1a11634b43741a0b5e6eef800b24fdbab35982e6923ba6cbb72d95c5d61b5a13` |
| `../../红光金具智能报价系统_PRD_V1.1_2026-09-08.md` | `12204f90191dc5f9563d835306fac1bd5c933a5c951adf2ab699e8ae16c1e3a4` |
