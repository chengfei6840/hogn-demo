import {labelOf,orderedTasks,validateGraph,type WorkflowRecord} from './workflow-design.ts'
export interface ApprovalFlowSnapshot {
 recordId:string; recordName:string; recordVersion:number
 tasks:{nodeId:string;name:string;role:'财务'|'董事长';assignee:string;action:'approve'|'issue';condition:'always'|'chairman'}[]
}
export function buildApprovalFlowSnapshot(record:WorkflowRecord|undefined,participants:Record<string,string>={}):ApprovalFlowSnapshot|undefined {
 if(!record)return undefined
 return {recordId:record.id,recordName:record.name,recordVersion:record.version,tasks:orderedTasks(record.graph).map(n=>({nodeId:n.id,name:labelOf(n),role:n.properties.role,assignee:participants[n.id]||n.properties.assignee,action:n.properties.action,condition:n.properties.condition}))}
}
export interface ApprovalStep {
 id:string; name:string; role:'财务'|'董事长'; assignee:string; action:'approve'|'issue'; condition:'always'|'chairman'
 status:'pending'|'done'|'skipped'; opinion?:string; completedAt?:string
}
export interface ApprovalRun {
 recordId:string; recordName:string; recordVersion:number; requestVersion:number; basis:string; startedAt:string
 status:'running'|'returned'|'completed'; steps:ApprovalStep[]; returnReason?:string; returnedBy?:string; returnedAt?:string
}
export function startApproval(record:WorkflowRecord|undefined,requestVersion:number,basis:string,snapshot?:ApprovalFlowSnapshot):ApprovalRun {
 if(!record&&!snapshot)throw Error('请先在流程设计台账启用一条审批签发流程')
 if(!snapshot&&record?.status!=='enabled')throw Error('请先在流程设计台账启用一条审批签发流程')
 if(!snapshot&&record){const errors=validateGraph(record.graph);if(errors.length)throw Error(errors.join('；'))}
 const source=snapshot?.tasks||(record?orderedTasks(record.graph).map(n=>({nodeId:n.id,name:labelOf(n),role:n.properties.role,assignee:n.properties.assignee,action:n.properties.action,condition:n.properties.condition})):[])
 const steps:ApprovalStep[]=source.filter(n=>n.role!=='董事长'&&n.condition!=='chairman').map(n=>({id:n.nodeId,name:n.name,role:n.role,assignee:n.assignee,action:n.action,condition:'always',status:'pending'}))
 return {recordId:snapshot?.recordId||record!.id,recordName:snapshot?.recordName||record!.name,recordVersion:snapshot?.recordVersion||record!.version,requestVersion,basis,startedAt:new Date().toLocaleString('zh-CN'),status:'running',steps}
}
export function currentApprovalStep(run?:ApprovalRun){return run?.status==='running'?run.steps.find(s=>s.status==='pending'):undefined}
// 退回核价后整条审批链要重走，已完成的节点必须回到待处理，否则明细表仍显示上一轮的完成状态与意见。
// 同时记录退回人与时间：节点意见会被清空，退回责任只能靠这两个字段留痕。
export function reopenApprovalRun(run:ApprovalRun,reason:string,actor:string){
 run.status='returned';run.returnReason=reason;run.returnedBy=actor;run.returnedAt=new Date().toLocaleString('zh-CN')
 for(const step of run.steps)if(step.status!=='skipped'){step.status='pending';step.opinion=undefined;step.completedAt=undefined}
}
export function canHandleApproval(run:ApprovalRun|undefined,role:string,person:string){const step=currentApprovalStep(run);return Boolean(step&&step.role===role&&step.assignee===person)}
export function assertApprovalActor(run:ApprovalRun|undefined,role:string,person:string,basis:string){
 const step=currentApprovalStep(run)
 if(!step||!canHandleApproval(run,role,person))throw Error('请由当前节点指定处理人执行，不能跳过前序节点')
 if(run!.basis!==basis)throw Error('核价或审批依据已变化，请重新提交审批签发')
 return step
}
export function finishApprovalStep(run:ApprovalRun,role:string,person:string,basis:string,opinion:string,action:'approve'|'issue'='approve'){
 const step=assertApprovalActor(run,role,person,basis)
 if(step.action!==action)throw Error(action==='approve'?'当前为签发节点，请执行正式签发':'前序审批尚未完成，不能签发')
 if(!opinion.trim())throw Error('请填写处理意见')
 step.status='done';step.opinion=opinion.trim();step.completedAt=new Date().toLocaleString('zh-CN')
 if(!run.steps.some(s=>s.status==='pending'))run.status='completed'
 return currentApprovalStep(run)
}
