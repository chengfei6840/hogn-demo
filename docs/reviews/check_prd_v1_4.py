from pathlib import Path
import json,re
base=Path(__file__).resolve().parent
p=base.parent/'正式项目需求文档_红光金具智能报价系统_2026-09-08.md'
t=p.read_text();d=json.loads((base/'prd-v1.4-traceability.json').read_text())
req=d['requirements'];cases=d['scenarios'];errors=[]
def check(ok,msg):
 if not ok:errors.append(msg)
for key,rows in [('需求',req),('分支',cases),('待确认项',d['open_items'])]:check(len({x['id']for x in rows})==len(rows),key+'ID重复')
check(all('## '+str(i)+'. 'in t for i in range(16)),'章节缺失')
acrows={line.split('|')[1].strip():[x.strip()for x in line.split('|')[1:-1]]for line in t.splitlines()if re.match(r'^\| AC-\d{3} \|',line)}
check(len(acrows)==len(req),'AC定义与需求数量不符')
for r in req:
 check(r['acceptance']in acrows,r['id']+'无AC定义')
 row=acrows.get(r['acceptance'],[])
 check(len(row)>2 and r['id']in row[2],r['id']+'AC反向映射缺失')
 associated=[x for x in cases if x['requirement']==r['id']]
 check(bool(associated),r['id']+'无分支')
 check(set(x['group']for x in associated)==set(r['groups']),r['id']+'场景组映射不一致')
for x in cases:
 check(any(r['id']==x['requirement']for r in req),x['id']+'孤儿分支')
 line=next((line for line in t.splitlines()if line.startswith('| '+x['id']+' / ')),None)
 check(line is not None,x['id']+'正文缺失')
 if line:
  cells=[c.strip()for c in line.split('|')[1:-1]]
  for idx,k in enumerate(['actor','given','when','expected','evidence'],1):check(cells[idx]==x[k].replace('|','／').replace('\n','<br>'),x['id']+'正文JSON不一致:'+k)
 check(x['execution_status']=='not_run',x['id']+'误标为已执行')
old=json.loads((base.parent/'archive/pm-run-before-v1.4-rerun-20260908-150600/handoff/acceptance-scenarios.json').read_text())
check({x['id']for x in old}<={x['id']for x in cases},'旧分支丢失')
report={'result':'FAIL'if errors else'PASS','requirements':len(req),'acceptance_definitions':len(acrows),'scenario_groups':len({x['group']for x in cases}),'branches':len(cases),'open_items':len(d['open_items']),'errors':errors,'scope':'章节、唯一ID、FR/AC双向映射、正文/JSON逐分支一致性、旧分支保留；不判断生产执行结果'}
(base/'prd-v1.4-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2));raise SystemExit(bool(errors))
