import {defineStore} from 'pinia'
import {computed,ref,shallowRef} from 'vue'
import {technicalDirector} from '../domain/model'
import {defaultGraph,validateGraph,type DesignGraph,type WorkflowRecord} from '../domain/workflow-design'
const STORAGE='hogn-approval-workflows-v1'
export type StageOperatorKey='technicalConfirmation'|'costCalculation'|'approvalIssuance'|'salesExternal'|'dealTracking'
export const defaultStageOperators:Record<StageOperatorKey,string>={technicalConfirmation:technicalDirector,costCalculation:'财务 · 张会计',approvalIssuance:'财务 · 王总监',salesExternal:'销售 · 王宁',dealTracking:'销售 · 王宁'}
function removeChairmanApproval(record:WorkflowRecord):WorkflowRecord {
 const graph=JSON.parse(JSON.stringify(record.graph)) as WorkflowRecord['graph']
 let changed=false
 for(const node of [...graph.nodes]){
  if(node.properties.kind!=='task'||(node.properties.role!=='董事长'&&node.properties.condition!=='chairman'))continue
  const incoming=graph.edges.find(edge=>edge.targetNodeId===node.id)
  const outgoing=graph.edges.find(edge=>edge.sourceNodeId===node.id)
  graph.edges=graph.edges.filter(edge=>edge.sourceNodeId!==node.id&&edge.targetNodeId!==node.id)
  graph.nodes=graph.nodes.filter(entry=>entry.id!==node.id)
  if(incoming&&outgoing)graph.edges.push({...incoming,id:'migrated-'+node.id,sourceNodeId:incoming.sourceNodeId,targetNodeId:outgoing.targetNodeId})
  changed=true
 }
 for(const node of graph.nodes)if(node.properties.kind==='task'&&node.properties.condition!=='always'){node.properties.condition='always';changed=true}
 return changed?{...record,version:record.version+1,updatedAt:'流程调整：移除董事长审批节点',graph}:record
}
function normalizeStageOperators(saved:Record<string,string>={}):Record<StageOperatorKey,string>{
 return {
  ...defaultStageOperators,
  technicalConfirmation:technicalDirector,
  costCalculation:saved.costCalculation||saved.costVerification||defaultStageOperators.costCalculation,
  approvalIssuance:saved.approvalIssuance||saved.quoteOutput||defaultStageOperators.approvalIssuance,
  salesExternal:saved.salesExternal||saved.quoteDraft||defaultStageOperators.salesExternal,
  dealTracking:saved.dealTracking||saved.dealFollowUp||defaultStageOperators.dealTracking,
 }
}
export const useWorkflowStore=defineStore('workflow',()=>{
 const records=ref<WorkflowRecord[]>([]);const stageOperators=ref<Record<StageOperatorKey,string>>({...defaultStageOperators});const error=shallowRef('')
 const activeRecord=computed(()=>records.value.find(r=>r.status==='enabled'))
 try{
  const raw=localStorage.getItem(STORAGE)
  if(raw){const saved=JSON.parse(raw);if(!Array.isArray(saved.records))throw Error();const original=saved.records as WorkflowRecord[];records.value=original.map(removeChairmanApproval);if(saved.stageOperators)stageOperators.value=normalizeStageOperators(saved.stageOperators);if(records.value.some(r=>!r.id||!r.name||!['enabled','draft','disabled'].includes(r.status)||!Array.isArray(r.graph?.nodes)||!Array.isArray(r.graph?.edges)||r.graph.nodes.some(n=>!n?.id||!n.properties)))throw Error();if(records.value.some(r=>r.status==='enabled'&&validateGraph(r.graph).length))throw Error();if(records.value.filter(r=>r.status==='enabled').length>1)throw Error();if(records.value.some((r,i)=>r!==original[i])){try{localStorage.setItem(STORAGE,JSON.stringify({records:records.value,stageOperators:stageOperators.value}))}catch{error.value='审批流程已在当前会话迁移，无法写入本地存储'}}}
  else records.value=[{id:'AP-001',name:'标准审批签发',version:1,status:'enabled',updatedAt:'初始演示配置',graph:defaultGraph()}]
 }catch{records.value=[];error.value='流程台账读取失败，请重新保存并启用有效记录'}
 function persist(next:WorkflowRecord[],nextOperators=stageOperators.value){try{localStorage.setItem(STORAGE,JSON.stringify({records:next,stageOperators:nextOperators}));records.value=next;stageOperators.value={...nextOperators};error.value='';return true}catch{error.value='保存失败，请检查浏览器存储空间';return false}}
 function save(record:WorkflowRecord){
  if(!record.name.trim()){error.value='请填写流程名称';return false}
  const previous=records.value.find(r=>r.id===record.id)
  if(previous?.status==='enabled'){error.value='已启用记录请复制为新版本后编辑';return false}
  const value=JSON.parse(JSON.stringify({...record,version:previous?.status==='disabled'?previous.version+1:record.version,name:record.name.trim(),status:'draft',updatedAt:new Date().toLocaleString('zh-CN')}))
  return persist(previous?records.value.map(r=>r.id===value.id?value:r):[value,...records.value])
 }
 function enable(id:string){
  const target=records.value.find(r=>r.id===id);if(!target){error.value='流程记录不存在';return false}
  const errors=validateGraph(target.graph);if(errors.length){error.value=errors.join('；');return false}
  return persist(records.value.map(r=>({...r,status:r.id===id?'enabled':r.status==='enabled'?'disabled':r.status})))
 }
 function disable(id:string){return persist(records.value.map(r=>r.id===id?{...r,status:'disabled'}:r))}
 function remove(id:string){if(records.value.find(r=>r.id===id)?.status==='enabled'){error.value='请先停用该记录';return false}return persist(records.value.filter(r=>r.id!==id))}
 function saveTemplate(nextOperators:Record<StageOperatorKey,string>,approvalAssignees:Record<string,string>,graphDraft?:DesignGraph){
  const active=activeRecord.value
  if(!active){error.value='当前没有启用的审批流程';return false}
  const normalizedOperators=normalizeStageOperators(nextOperators)
  const graph=JSON.parse(JSON.stringify(graphDraft||active.graph)) as WorkflowRecord['graph']
  for(const node of graph.nodes){if(node.properties.kind==='task'&&approvalAssignees[node.id])node.properties.assignee=approvalAssignees[node.id]}
  const signer=graph.nodes.find(node=>node.properties.kind==='task'&&node.properties.action==='issue')
  if(signer)signer.properties.assignee=normalizedOperators.approvalIssuance
  const errors=validateGraph(graph);if(errors.length){error.value=errors.join('；');return false}
  const next:WorkflowRecord={id:'AP-'+crypto.randomUUID().slice(0,8).toUpperCase(),name:active.name,version:active.version+1,status:'enabled',updatedAt:new Date().toLocaleString('zh-CN'),graph}
  return persist([next,...records.value.map(record=>record.status==='enabled'?{...record,status:'disabled' as const}:record)],normalizedOperators)
 }
 return {records,stageOperators,activeRecord,error,save,saveTemplate,enable,disable,remove}
})
