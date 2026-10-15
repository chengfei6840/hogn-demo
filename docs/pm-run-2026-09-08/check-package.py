from pathlib import Path
import json,re,hashlib
p=Path(__file__).resolve().parent;h=p/'handoff';prd=p.parent/'正式项目需求文档_红光金具智能报价系统_2026-09-08.md'
s=prd.read_text();req=json.loads((h/'requirements.json').read_text());cases=json.loads((h/'acceptance-scenarios.json').read_text());sl=json.loads((h/'slices.json').read_text())['slices'];opens=json.loads((h/'open-items.json').read_text());issues=[]
def ck(v,msg):
 if not v:issues.append(msg)
ck(len(req)==42 and len({r['id'] for r in req})==42,'要求编号不唯一或不是42')
ck(len(cases)==124 and len({c['id'] for c in cases})==124,'分支不是124或重复')
ck(len({c['group'] for c in cases})==39,'组数不是39')
for r in req:
 ck(any(re.match(r'^\| '+re.escape(r['id'])+r' \|',line) and r['acceptance'] in line for line in s.splitlines()),r['id']+'缺FR/AC行')
 ck(any(line.startswith('| '+r['acceptance']+' |') and r['id'] in line for line in s.splitlines()),r['id']+'缺反向AC行')
 ck(set(r['groups'])=={c['group'] for c in cases if c['requirement']==r['id']},r['id']+'组映射不一致')
 ck(r['id'] in next(x for x in sl if x['id']==r['slice'])['requirements'],r['id']+'slice映射错误')
for c in cases:
 line=next((line for line in s.splitlines() if line.startswith('| '+c['id']+' / ')),None)
 ck(line is not None,c['id']+'缺文档行')
 if line:
  cols=[x.strip() for x in line.split('|')[1:-1]]
  ck(cols==[c['id']+' / '+c['group'],c['actor'],c['given'],c['when'],c['expected'],c['evidence']],c['id']+'正文与JSON不同')
 ck(c['execution_status']=='not_run',c['id']+'错误执行状态')
 ck('### '+c['id']+' / '+c['group'] in (h/'spec.md').read_text(),c['id']+'缺spec投影')
ck(len(opens)==17 and all(o['ruling']=='accepted-open' for o in opens),'OPEN状态不一致')
ck(json.loads((h/'design-gate.json').read_text())['approved'] is False,'越过最终人工批准')
seen=set();active=set();graph={x['id']:x['depends_on'] for x in sl}
def visit(v):
 ck(v not in active,'slice依赖环');
 if v in active or v in seen:return
 active.add(v)
 for n in graph[v]:visit(n)
 active.remove(v);seen.add(v)
for v in graph:visit(v)
for f in ['HANDOFF.md','spec.md','plan.md','data-model.md','slices.json','case-contract.md','design-gate.json','inference-confirmed.json','requirements.json','acceptance-scenarios.json','open-items.json','citation-map.md','success-metrics.json','measure-definition-coverage.py','contracts/parsing.md','contracts/outputs.md','contracts/master-data-u9.md','contracts/workflow.md']:ck((h/f).is_file(),'缺产物'+f)
for f in [prd,*h.rglob('*.md')]:
 ck(not re.search(r'\bE\d{2}\b',f.read_text()),str(f)+'含旧E引用')
 ck(not f.read_bytes().startswith(b'\xef\xbb\xbf'),str(f)+'含BOM')
drift=[]
for x in json.loads((p/'source-register.json').read_text()):
 f=Path(x['path'])
 if not f.exists() or hashlib.sha256(f.read_bytes()).hexdigest()!=x['sha256']:drift.append(x['id'])
report={'structural_check':'PASS' if not issues else 'REVISE','requirements':len(req),'scenario_groups':39,'branches':len(cases),'accepted_open':len(opens),'issues':issues,'source_drift':drift,'note':'结构校验不代替独立定义审查或功能测试；来源变化不静默更新哈希','formal_validator_count_note':'通用SRS正则未包含FR-P2/P3且将历史AC计数；本检查按精确表格核对42条要求与42个当前AC'}
(p/'mechanical-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False,indent=2));raise SystemExit(bool(issues))
