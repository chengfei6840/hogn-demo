import test from 'node:test'
import assert from 'node:assert/strict'
import {defaultGraph,validateGraph,recordPeople,orderedTasks,type WorkflowRecord} from '../src/domain/workflow-design.ts'
import {startApproval,currentApprovalStep,finishApprovalStep,canHandleApproval} from '../src/domain/approval-workflow.ts'
const record=():WorkflowRecord=>({id:'AP-1',name:'三人审批签发',version:1,status:'enabled',updatedAt:'test',graph:defaultGraph()})
test('启用记录的三个常规处理人依次执行，第三人签发',()=>{
 const r=record();assert.deepEqual(validateGraph(r.graph),[]);assert.equal(recordPeople(r.graph).regular,3)
 const run=startApproval(r,1,'price-1');assert.equal(run.steps.filter(s=>s.status!=='skipped').length,3)
 assert.equal(currentApprovalStep(run)?.assignee,'财务 · 张会计')
 assert.throws(()=>finishApprovalStep(run,'财务','财务 · 王总监','price-1','直接签发','issue'))
 finishApprovalStep(run,'财务','财务 · 张会计','price-1','通过')
 assert.equal(canHandleApproval(run,'财务','财务 · 张会计'),false)
 assert.equal(currentApprovalStep(run)?.assignee,'财务 · 李经理')
 finishApprovalStep(run,'财务','财务 · 李经理','price-1','通过')
 assert.equal(currentApprovalStep(run)?.action,'issue')
 assert.throws(()=>finishApprovalStep(run,'财务','财务 · 王总监','price-1','通过'))
 finishApprovalStep(run,'财务','财务 · 王总监','price-1','正式签发','issue')
 assert.equal(run.status,'completed');assert.equal(currentApprovalStep(run),undefined)
})
test('标准审批链不包含董事长节点，财务审批后进入签发',()=>{
 const run=startApproval(record(),1,'basis')
 assert.equal(run.steps.some(step=>step.role==='董事长'),false)
 finishApprovalStep(run,'财务','财务 · 张会计','basis','通过');finishApprovalStep(run,'财务','财务 · 李经理','basis','通过')
 assert.equal(currentApprovalStep(run)?.assignee,'财务 · 王总监')
})
test('已发起的包保持版本与人员快照，新启用记录只影响新提交',()=>{
 const r=record();const first=startApproval(r,1,'basis')
 r.graph.nodes.find(n=>n.id==='review')!.properties.assignee='财务 · 赵经理';r.name='新记录';r.version=2
 assert.equal(first.recordName,'三人审批签发');assert.equal(first.recordVersion,1);assert.equal(first.steps[0].assignee,'财务 · 张会计')
 const second=startApproval(r,1,'basis');assert.equal(second.steps[0].assignee,'财务 · 赵经理')
})
test('未启用、断连、循环和无签发人的记录均不能执行',()=>{
 assert.throws(()=>startApproval(undefined,1,'basis'))
 const r=record();r.status='draft';assert.throws(()=>startApproval(r,1,'basis'));r.status='enabled'
 r.graph.edges.pop();assert.throws(()=>startApproval(r,1,'basis'))
 const cycle=record();cycle.graph.edges.push({id:'cycle',type:'polyline',sourceNodeId:'issue',targetNodeId:'review'});assert.ok(validateGraph(cycle.graph).length)
 const blank=record();blank.graph.nodes.find(n=>n.id==='issue')!.properties.assignee='';assert.ok(validateGraph(blank.graph).length)
})
test('流程连线决定顺序，拖动位置和重命名不会改变执行语义',()=>{
 const r=record();r.graph.nodes.find(n=>n.id==='manager')!.y=10;r.graph.nodes.find(n=>n.id==='review')!.text='自定义一审'
 assert.equal(orderedTasks(r.graph)[0].id,'review');assert.equal(startApproval(r,1,'basis').steps[0].name,'自定义一审')
})
test('退回、版本变化、空意见和错误角色均拒绝审批',()=>{
 const run=startApproval(record(),1,'basis')
 assert.throws(()=>finishApprovalStep(run,'销售','财务 · 张会计','basis','通过'))
 assert.throws(()=>finishApprovalStep(run,'财务','财务 · 张会计','changed','通过'))
 assert.throws(()=>finishApprovalStep(run,'财务','财务 · 张会计','basis',' '))
 run.status='returned';assert.equal(currentApprovalStep(run),undefined);assert.throws(()=>finishApprovalStep(run,'财务','财务 · 张会计','basis','通过'))
})
test('增加人员后审批链随启用记录增长，没有写死三人',()=>{
 const r=record();const edge=r.graph.edges.find(e=>e.targetNodeId==='issue')!;edge.targetNodeId='extra'
 r.graph.nodes.push({id:'extra',type:'rect',x:300,y:500,text:'资金复核',properties:{kind:'task',action:'approve',role:'财务',assignee:'财务 · 赵会计',condition:'always'}})
 r.graph.edges.push({id:'extra-issue',type:'polyline',sourceNodeId:'extra',targetNodeId:'issue'})
 assert.equal(recordPeople(r.graph).regular,4);assert.equal(startApproval(r,1,'basis').steps.filter(s=>s.status!=='skipped').length,4)
})
