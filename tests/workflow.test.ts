import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createPackage } from '../src/domain/seed.ts'
import { pricingBasis,canIssueQuote,workflowSteps,rankedCandidates,candidateAdoptionIssues,technicalReadiness,technicalCompletionIssues,confirmEntries,approvalReasons,canFinance,candidateDifferences,findCandidates,invalidate,pricingReady,requireRole,totals,requiresTechnicalReview,selectionConfirmationReady,normalizeProjectRole,normalizePackage,endedStages,rejectStageOrder,previousStage,canHandlePackageProcess,packageProcessParticipant,isPackageVisibleToPerson } from '../src/domain/model.ts'
const catalog=JSON.parse(readFileSync(new URL('../src/data/catalog.json',import.meta.url),'utf8'))
// 出厂种子停在「资料整理」且无货物项，业务断言改用 createPackage 的完整样例包。
const seed=()=>createPackage(catalog,'HG-20260908-001','包11 · GW100','P1')
const ready=()=>{const p=seed();p.salesConfirmed=1;p.techConfirmed=1;p.items.forEach(i=>{i.confirmed=true;i.selected='C1';i.price=100;i.cost=80});p.pricingNote='同口径未税价格';return p}
test('销售与技术须同时确认当前版本',()=>{const p=ready();assert.equal(canFinance(p),true);p.techConfirmed=null;assert.equal(canFinance(p),false);p.techConfirmed=0;assert.equal(canFinance(p),false)})
test('技术确认不可绕过，缺字段按字段现算待确认条目',()=>{const p=ready();p.technicalReviewRequired=false;p.techConfirmed=null;assert.equal(requiresTechnicalReview(p),true);assert.equal(selectionConfirmationReady(p),false);assert.deepEqual(confirmEntries(p).map(e=>e.id),['01:model','02:conductor'])})
test('销售软性确认不会绕过技术信息完整性门禁',()=>{const p=seed();p.salesConfirmed=p.version;assert.equal(technicalReadiness(p).blockers.length,0);const issues=technicalCompletionIssues(p,catalog);assert.ok(issues.length>0);assert.ok(issues.some(issue=>issue.startsWith('货物项 02：')&&issue.includes('适用导线')));p.items[1].conductor='400/50';assert.ok(technicalCompletionIssues(p,catalog).length>0)})
test('条目指派给技术后归技术名下，技术就绪随即被阻断',()=>{const p=ready();assert.equal(technicalReadiness(p).blockers.length,0);p.items[1].assignees={conductor:'技术 · 李工'};const blocked=technicalReadiness(p);assert.equal(blocked.ready,false);assert.deepEqual(blocked.blockers.map(e=>e.id),['02:conductor'])})
test('正式价格不再要求价格依据字段',()=>{const p=ready();assert.equal(pricingBasis(p).includes('DEMO'),false);assert.equal(pricingBasis(p).includes('价格依据'),false)})
test('技术变更使确认失效并保留快照',()=>{const p=ready();const snap={id:'Q1'};p.snapshots.push(snap as any);invalidate(p,'technical');assert.equal(p.version,2);assert.equal(p.techConfirmed,null);assert.equal(p.salesConfirmed,null);assert.equal(p.items[0].confirmed,false);assert.equal(p.snapshots[0],snap)})
test('改价只回到财务，不伪造技术重新确认',()=>{const p=ready();p.stage='董事长审批';invalidate(p,'price');assert.equal(p.stage,'财务核价');assert.equal(p.version,1);assert.equal(p.techConfirmed,1)})
test('驳回只能打回上一个流程，首节点没有上一个流程',()=>{
 assert.deepEqual([...rejectStageOrder],['销售需求确认','技术选项确认','成本核算与方案选择'])
 assert.equal(previousStage('技术选项确认'),'销售需求确认')
 assert.equal(previousStage('成本核算与方案选择'),'技术选项确认')
 assert.equal(previousStage('销售需求确认'),undefined)
})
test('阈值和毛利红线仅生成风险提醒，不增加审批门禁',()=>{const p=ready();assert.deepEqual(approvalReasons(p),[]);p.settings={amountThreshold:totals(p).taxed,marginFloor:15};assert.deepEqual(approvalReasons(p),['含税总额达到提醒阈值'])})
test('毛利红线和特殊商务事项作为财务提醒',()=>{const p=ready();p.settings={amountThreshold:999999,marginFloor:25};assert.deepEqual(approvalReasons(p),['毛利率低于提醒红线']);p.settings.marginFloor=15;p.manualBoss=true;assert.deepEqual(approvalReasons(p),['特殊商务事项，请财务关注'])})
test('普通报价允许财务审核后出具',()=>{const p=ready();p.settings={amountThreshold:999999,marginFloor:15};assert.deepEqual(approvalReasons(p),[])})
test('金具串与单件均进入报价汇总，排除项不计入',()=>{const p=ready();p.items[3].price=1e8;assert.equal(totals(p).amount,4800007600);p.items[0].excluded=true;assert.equal(totals(p).amount,4800005000)})
test('清单图纸编号只在其他电压分册有对应记录时召回单条且电压不一致',()=>{const p=seed();const i=p.items[1];assert.equal(i.spec,'');const found=findCandidates(catalog,i,1);assert.deepEqual(found.map(c=>c.id),['C5']);assert.ok(candidateDifferences(i,found[0]).includes('电压等级不一致'))})
test('无技术编码仍能按串型号找到多候选',()=>{const p=seed();const i=p.items[2];assert.equal(i.spec,'');assert.ok(findCandidates(catalog,i,1).length>=2)})
test('同串型号导线不一致不能最终确认',()=>{const p=seed();const i=p.items[2];i.conductor='400/50';const found=findCandidates(catalog,i,1);assert.ok(found.some(c=>candidateDifferences(i,c).length===0));assert.ok(found.some(c=>candidateDifferences(i,c).includes('适用导线不一致')))})
test('角色权限不允许董事长代替技术确认',()=>{assert.throws(()=>requireRole('董事长',['技术']));assert.doesNotThrow(()=>requireRole('技术',['技术']))})
test('技术确认必须由本包指定负责人处理',()=>{
 const p=ready();p.processParticipants={dataParsing:'销售 · 王宁',salesConfirmation:'销售 · 王宁',technicalConfirmation:'技术 · 周工',costCalculation:'财务 · 张会计',approvalIssuance:'财务 · 王总监',salesExternal:'销售 · 王宁',dealTracking:'销售 · 王宁'}
 assert.equal(packageProcessParticipant(p,'technicalConfirmation'),'技术 · 周工')
 assert.equal(canHandlePackageProcess(p,'technicalConfirmation','技术 · 李工'),false)
 assert.equal(canHandlePackageProcess(p,'technicalConfirmation','技术 · 周工'),true)
})

test('三种成交结果都是归档终态，取消同样结束流程',()=>{
 assert.deepEqual(endedStages,['已成交','未成交','已取消'])
 for(const stage of endedStages){
  const p=ready();p.stage=stage;p.archivedAt='2026/9/20 10:00:00'
  const steps=workflowSteps(p)
  assert.equal(steps.find(s=>s.stage===stage)?.status,'current')
  assert.equal(steps.find(s=>s.stage==='客户议价中')?.status,'done')
 }
})
test('旧本地数据停在终态时补归档时间，在办包不补',()=>{
 const done=ready();done.stage='未成交';delete done.archivedAt
 normalizePackage(done);assert.ok(done.archivedAt)
 const live=ready();delete live.archivedAt
 normalizePackage(live);assert.equal(live.archivedAt,undefined)
 const stamped=ready();stamped.stage='已成交';stamped.archivedAt='2026/1/1 00:00:00'
 normalizePackage(stamped);assert.equal(stamped.archivedAt,'2026/1/1 00:00:00')
})
test('旧演示价格数据归一化后混合展示历史归档价与维护库价',()=>{
 const p=ready()
 p.u9Data={
  'C13:71453':{price:171.96,processRoute:'历史路线',source:'maintenance'},
  'C13:71454':{price:283.56,processRoute:'维护路线',source:'maintenance'},
 }
 normalizePackage(p)
 assert.equal(p.u9Data['C13:71453'].source,'archive')
 assert.equal(p.u9Data['C13:71454'].source,'maintenance')
})
test('演示资料按钮登记的 4 份文件与解析后可生成的货物项就绪',()=>{
 const seed=createPackage(catalog,'HG-20260908-001','包11 · GW100','P1')
 assert.deepEqual(seed.files.map(f=>f.name),['演示询价资料.zip','演示询价资料.zip / 货物清单.xlsx','演示询价资料.zip / 技术规范.docx','演示询价资料.zip / 附图.pdf'])
 assert.deepEqual(seed.files.map(f=>f.type),['ZIP','Excel','Word','PDF'])
 assert.deepEqual(seed.items.map(i=>i.id),['01','02','03','04'])
 assert.deepEqual(confirmEntries(seed).map(e=>e.id),['01:model','02:conductor'])
})

test('字段补齐前不能完成技术确认，逐项采用串型仍是技术门禁',()=>{const p=seed();p.items.forEach(i=>{i.atlas='750kV输电线路金具分册';i.drawing='图5-13'});p.items[1].conductor='400/50';const result=technicalReadiness(p);assert.equal(result.blockers.length,0);assert.equal(result.ready,false);assert.deepEqual(result.pending.map(i=>i.id),['01','02','03','04'])})
test('混合包单件纳入技术就绪，技术变更后重新核对',()=>{const p=ready();assert.equal(technicalReadiness(p).ready,true);invalidate(p,'technical');assert.equal(technicalReadiness(p).pending.length,4);assert.equal(technicalReadiness(p).ready,false)})
test('旧演示数据中的单件排除状态迁移为可确认报价项',()=>{const p=ready();p.items[3].excluded=true;p.items[3].confirmed=true;p.items[3].selected='item:04';p.items[3].exclusionReason='独立物资单独记录，本次串型报价不包含';normalizeProjectRole(p);assert.equal(p.items[3].excluded,false);assert.equal(p.items[3].confirmed,false);assert.equal(p.items[3].selected,'')})
test('旧本地数据缺清单列时按货物项补回，已填部分保留',()=>{
 const p=ready()
 p.items[0].goodsList=undefined;p.items[0].goodsRow=undefined
 p.items[1].goodsList={'包名称':'销售手改包名'}
 normalizeProjectRole(p)
 assert.equal(p.items[0].goodsList?.['分标编号'],'SG2404-1411-21006')
 assert.equal(p.items[0].goodsRow,493)
 assert.equal(p.items[1].goodsList?.['包名称'],'销售手改包名')
})
test('单件金具不按串型电压导线差异阻断，技术可确认采用',()=>{
 const p=seed()
 const item=p.items[3]
 item.confirmed=false
 item.selected=''
 const candidate={id:'item:'+item.id,name:item.name,description:'单件金具物料确认',spec:item.spec,model:item.model,atlas:item.atlas,drawing:item.drawing,drawing2:'',source:item.source,sheet:'原始货物项',row:0,parts:[]}
 assert.equal(item.kind,'独立物资')
 assert.deepEqual(candidateDifferences(item,candidate),[])
 assert.deepEqual(candidateAdoptionIssues(p,item,candidate,'技术'),[])
 assert.ok(candidateAdoptionIssues(p,item,candidate,'销售').some(x=>x.includes('技术角色')))
 assert.ok(technicalReadiness(p).pending.some(i=>i.id==='04'))
})
test('技术变更后未确认单件会挡住技术确认门禁',()=>{
 const p=ready()
 invalidate(p,'technical')
 assert.ok(technicalReadiness(p).pending.map(i=>i.id).includes('04'))
})
test('销售名下待补字段不阻断技术确认，空报价阻断',()=>{const p=ready();p.items[1].conductor='';assert.ok(confirmEntries(p).some(e=>e.id==='02:conductor'&&e.owner==='销售'));assert.equal(technicalReadiness(p).ready,true);p.items.forEach(i=>{i.excluded=true});assert.equal(technicalReadiness(p).ready,false)})

test('750kV 400/50 候选 C13 排在差异候选前，仍保留其他结果',()=>{const p=seed();const i=p.items[2];i.conductor='400/50';const result=rankedCandidates(catalog,i,2);assert.equal(result[0].id,'C13');assert.equal(result.length,findCandidates(catalog,i,2).length)})
test('销售补齐字段后技术才能采用候选，属于技术的字段仍要指派',()=>{const p=seed();const i=p.items[1];const c=catalog.find((c:any)=>c.id==='C5');assert.ok(candidateAdoptionIssues(p,i,c,'技术').some(x=>x.includes('适用导线待确认')));i.conductor='400/50';i.voltage='110 kV';i.atlas=c.atlas;i.drawing=c.drawing;assert.deepEqual(candidateAdoptionIssues(p,i,c,'技术'),['适用导线不一致']);assert.ok(candidateAdoptionIssues(p,i,c,'销售').includes('当前选型需要技术角色确认采用'))})
test('缺串型号条目指派技术后不再算销售待办',()=>{const p=seed();const i=p.items[0];assert.equal(confirmEntries(p).find(e=>e.id==='01:model')?.owner,'销售');i.assignees={model:'技术 · 李工'};assert.equal(confirmEntries(p).find(e=>e.id==='01:model')?.owner,'技术');assert.ok(technicalReadiness(p).blockers.some(e=>e.id==='01:model'))})

test('流程条随双确认状态和退回阶段变化',()=>{const p=ready();p.stage='并行协作';p.techConfirmed=null;assert.equal(workflowSteps(p).find(s=>s.status==='current')?.label,'待技术确认');p.salesConfirmed=null;p.techConfirmed=p.version;assert.equal(workflowSteps(p).find(s=>s.status==='current')?.label,'待销售确认');p.stage='财务核价';assert.equal(workflowSteps(p).find(s=>s.status==='current')?.stage,'财务核价')})
test('不需要董事长审批时实际流程不显示已完成董事长审批',()=>{const p=ready();p.stage='可出具报价';p.audit.unshift({at:'test',role:'财务',action:'财务审核通过',detail:'未触发董事长审批',version:p.version});assert.equal(workflowSteps(p).some(s=>s.stage==='董事长审批'),false);p.stage='已出具';assert.equal(workflowSteps(p).some(s=>s.stage==='董事长审批'),false)})
test('董事长审批旧阶段迁移到财务审批签发',()=>{const p=ready();p.stage='董事长审批';normalizePackage(p);assert.equal(p.stage,'财务核价')})

test('董事长角色可查看所有包但不获得业务确认权限',()=>{const p=ready();assert.equal(isPackageVisibleToPerson(p,'董事长 · 陈总','董事长'),true);assert.equal(canIssueQuote(p,'董事长'),false)})

 test('旧角色阶段兼容且保留审计原文', async()=>{
 const {normalizeProjectRole,displayRoleText}=await import('../src/domain/model.ts');
 const p=ready();p.stage='老板审批' as any;
 p.audit.unshift({at:'legacy',role:'老板' as any,action:'老板审批通过',detail:'旧意见',version:1});
 normalizeProjectRole(p);assert.equal(p.stage,'财务核价');
 assert.equal(p.audit[0].action,'老板审批通过');assert.equal(displayRoleText(p.audit[0].action),'董事长审批通过');
 p.stage='已出具';assert.equal(workflowSteps(p).some(s=>s.stage==='董事长审批'),false);
 })
