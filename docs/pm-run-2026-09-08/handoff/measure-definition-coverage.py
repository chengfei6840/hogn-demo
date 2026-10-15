from pathlib import Path
import json,hashlib
p=Path(__file__).resolve().parent
s=json.loads((p/'acceptance-scenarios.json').read_text())
r=json.loads((p/'coverage-review.json').read_text())
assert r['independent_review']=='PASS', '独立复核未通过'
for name,digest in r['artifact_hashes'].items():
 assert hashlib.sha256((p/name).read_bytes()).hexdigest()==digest, '复核后文件改变: '+name
groups={a['group'] for a in s}
assert len(groups)==39
assert {x['id'] for x in r['groups']}==groups
passed=0
for g in groups:
 row=next(x for x in r['groups'] if x['id']==g)
 expected={a['id'] for a in s if a['group']==g}
 if row['verdict']=='PASS' and set(row['reviewed_branch_ids'])==expected: passed+=1
print(json.dumps({'qualified_groups':passed,'total_groups':39,'coverage_percent':round(passed/39*100,2),'production_execution_pass_rate':None},ensure_ascii=False))
assert passed==39
