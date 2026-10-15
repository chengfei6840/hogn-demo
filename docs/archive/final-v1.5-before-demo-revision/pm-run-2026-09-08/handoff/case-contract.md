# 案例约束

FIXTURE, no downstream configured。contract drift not checked。

[FOUND] 固定范围为国网金具串，四路径三主一辅；财务签发、销售提供，董事长可审批阶段单项调价；多文件混析完成、ZIP未完成不检查。[L0: ../evidence/user-decisions.md D03至D08]

[CONSTRUCTED] 不变量：缺关键技术条件不能采用；审批不解除技术风险；等待补充保留阻断；旧快照不改写；U9只读；BOM采购数量与每套用量分开；客户文件无内部成本利润。[L1: ../p3_product_spec.md]

[CONSTRUCTED] 停止条件：无来源却宣称已核实、越权或旧版审批放行、快照被改写、BOM重复汇总、范围超合同。发生任一项阻止对应交付并返修。[L1: ../p2_strategy_rationale.md]

封存数字：42条要求、39组、124分支、17项accepted-open；Gate 2已通过，Gate 3待确认，最终seal在Gate 3之前生成。封存哈希见下表及.seal.txt；Gate 3批准之前仍是待批准交付候选包。

## 封存哈希

以下为其他交付文件的SHA-256。本文自身哈希由外部.seal.txt和design-gate.json登记，避免自引用；design-gate.json为人工批准及哈希登记文件，不包含在自身清单中。最终验真命令：在本目录执行`shasum -a 256 -c .seal.txt`。

| 文件 | SHA-256 |
| --- | --- |
| ../../demo/领导演示脚本与问答_2026-09-08.md | `a1c506a0f11a13fe1385a5ea65d3aec1ff242d1527bcad3784a986d03f3da789` |
| ../../正式项目需求文档_红光金具智能报价系统_2026-09-08.md | `dbc36aa8ec38f35a54e848b7bd171ec3647f90e5254b3ef88cf230d47af76d0c` |
| ../evidence-ledger.json | `4068215f01722ca94bc971624f58ad5c9ba6d0fd9d1b93dbb14217228e284f29` |
| ../evidence/bom-reference.json | `5f94422f2de866f3f1060d06db39d56b20c5e9742a99ccf9fc0ec4fa5e250fe9` |
| ../evidence/catalog-sample.json | `02d239bc597beb99d7d51ceeb20861852fb222a521a2cb5bd629cc4e1d756209` |
| ../evidence/contract-paragraphs.txt | `ae34a31e2e2c3d0aea0f5fe019c2486e3ae01ecdf685a4d80c942ed5f92a53b2` |
| ../evidence/customer-search.txt | `4fa2054ec5457b48496350def4e7e22ed82227359e8555de830c989543febecd` |
| ../evidence/user-decisions.md | `9f0fa67d8c6ae6c37f47e2a4a3c63edd3fea6d28d0328fc26919e7341dea5378` |
| ../locked-decisions.json | `90986c69350aae31b362b0761ca678226f0d69511c3e47c2e98efdd7f45aa82d` |
| ../open-items.json | `46ba7aa27ee62ce742b027bde3bd667ba8fd9dfc9df9bd69422c2fd166a0cf46` |
| ../p0_context.md | `526996080e0f0d32c7ce1013082031dd4655e747657f9e1bbc73d3339188b440` |
| ../p1_research_base.md | `22043f7240b33adda9490099437032f124d2127e6e6ae6eecc2939911c54c26e` |
| ../p2_strategy_rationale.md | `861ffc7c50c954a27f6211d2654709c08b89953c92e09461e30f2cae7abe1c79` |
| ../p3_product_spec.md | `162fa862f2aca42872e0afc91e18cd531f0aeb87e7d55a14335a474d135d7b8a` |
| ../p4_handoff_package.md | `6b103f8530841388cf484bb003c9a9b93a2864570b12565d353fddc12125cd15` |
| ../review-final-content.md | `042a9d44f5c715b22168c7ac3abc75658c70d6c614ca9f86c3f8ce9e9789d1a2` |
| ../source-register.json | `085aae261e52003fae671714cd770a98f674b00c34c04da40b0a82d61dc549ae` |
| HANDOFF.md | `decfa3466fddd7151d11d25e7770aa21eace20f7d6096fee73b9ddf2f7f68247` |
| acceptance-scenarios.json | `7db69a27a374bbbc7dbf554b911ccadb6cfb9d6aebc50cdc86668ff21cdacb31` |
| citation-map.md | `12ce9cd1dbcd45791c9e8b14331ee018bad21950184528e8b160f8ca83db8c28` |
| contracts/master-data-u9.md | `b44addc4594d24db33f7fba27ad1166abbaeafb6987bf54b3fe8c49044e70895` |
| contracts/outputs.md | `da95b84b659be290a95318236fc151748842de9c09c799de22ad5652bcf237d1` |
| contracts/parsing.md | `c813100769ee16c59a7377c634bb7c06d94af686520628e329afa36d8f2baed6` |
| contracts/workflow.md | `f547611dd5d0731395805e7addaa09e2928b5479cbd55756545e2f425f538cbd` |
| coverage-review.json | `7cbd96131835d97edba9d8e65e2f3e37325887b2219a1f997d50919cf498f092` |
| data-model.md | `bc2557d9522b57db29c68c04bd235e30d3c9a6d855e8b150157d6ad1b8427b4d` |
| inference-confirmed.json | `cd8a773f30cd9af2b7fd41557c19ddae6db1c002f20deaaae217295b85dc01cf` |
| measure-definition-coverage.py | `354b60188363398207203bf8dbcf10c273777e8126c6e3c85df89629a139c9e5` |
| open-items.json | `46ba7aa27ee62ce742b027bde3bd667ba8fd9dfc9df9bd69422c2fd166a0cf46` |
| plan.md | `c7edb47cd316b44eeb659202006bef8d11255de31f699c6701c1d60e9a9cd869` |
| requirements.json | `63d6e5713479631e41ef0d90310fa13e6e68ad52ab8b45d2a3b45f2e4bdd84ef` |
| slices.json | `f523b50ecc015111b1ac7025ec9add6306ed36f5dd2b11b69fd5f75921d8fe1f` |
| spec.md | `63fff2977185b139aa51db790e1eba2624f9c0147b12b1f264e5c330f71a9790` |
| success-metrics.json | `af25c784274f9c3aaadb5f8df10d00b752979af8be6bb4b631677a3078794acd` |
