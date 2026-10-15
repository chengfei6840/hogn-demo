# 指标执行与含义

[CONSTRUCTED] 本轮首要指标只计算已批准37组的可验收定义完整性。独立评审的coverage-review.json决定分子；脚本只核对记录和分母，不判断需求是否正确。未完成评审时显示PENDING，不能把未评审分子当业务失败率。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

[CONSTRUCTED] 在handoff目录执行下列命令；等价tool/argv在success-metrics.json，可直接由后续验收工具读取。本轮时间窗口为Gate 1至Gate 2；没有上线日期，因此周/月/季度生产评价明确不适用，后续上线任务重新定义。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]

```bash
python3 -c 'import json,pathlib,sys; p=pathlib.Path(sys.argv[1]); x=json.loads((p/'"'"'coverage-review.json'"'"').read_text()); s=json.loads((p/'"'"'acceptance-scenarios.json'"'"').read_text()); groups={a['"'"'group'"'"'] for a in s}; rows={a['"'"'id'"'"']:a for a in x['"'"'groups'"'"']}; assert groups==set(rows) and len(groups)==37; passed=sum(rows[g]['"'"'verdict'"'"']=='"'"'PASS'"'"' and set(rows[g]['"'"'reviewed_branch_ids'"'"'])=={a['"'"'id'"'"'] for a in s if a['"'"'group'"'"']==g} for g in groups); print(json.dumps({'"'"'qualified_groups'"'"':passed,'"'"'total_groups'"'"':len(groups),'"'"'definition_coverage_percent'"'"':passed/len(groups)*100,'"'"'review_status'"'"':x['"'"'review_status'"'"'],'"'"'execution_status'"'"':'"'"'not_run'"'"'},ensure_ascii=False))' .
```

[CONSTRUCTED] 成功及上限均为100%；只有独立审查每组所有必要分支，且组内没有未解决逻辑缺陷，才计入分子。原型执行和合同验收另有记录，本次所有运行场景execution_status仍为not_run。 [L1: /Users/1ovepingu/Desktop/Projects/hogn_quotation_agent_prototype/docs/pm-run-2026-09-08/p3_product_spec.md]
