import {computed} from 'vue'
import {useWorkspace} from './store'
import {useWorkflowStore} from '@/stores/workflow'
import {currentApprovalStep} from './approval-workflow'
import {endedStages,type Package} from './model'
export interface PackageStep{id:string;label:string;status:string}
// 顶部流程条与侧边栏流程速览共用这一份计算，避免两处判断逻辑漂移。
export function usePackageProgress(){
 const {workflowPackages,role,page}=useWorkspace();const definitions=useWorkflowStore()
 return computed<PackageStep[]>(()=>{
  const stepsFor=(p:Package):PackageStep[]=>{
  const early=['资料整理','并行协作'].includes(p.stage)
  const parsingView=page.value==='parse'
  // 技术确认只能在销售确认之后完成；旧数据偶尔只留有 techConfirmed，展示上仍应把销售节点标为已完成。
  const tech=p.techConfirmed===p.version;const sales=p.salesConfirmed===p.version||tech
  const technicalViewAfterHandoff=role.value==='技术'&&p.stage==='财务核价'
  const salesViewAfterHandoff=role.value==='销售'&&p.stage==='财务核价'
  const financial=p.stage==='财务核价'&&!technicalViewAfterHandoff&&!salesViewAfterHandoff;const published=['已出具','客户议价中',...endedStages].includes(p.stage)
  const result:PackageStep[]=[
   {id:'parse',label:'资料解析',status:parsingView||p.stage==='资料整理'?'current':'done'},
   {id:'sales',label:'销售需求确认',status:salesViewAfterHandoff?'current':sales?'done':p.stage==='并行协作'&&role.value==='销售'?'current':'pending'},
   {id:'tech',label:'技术选项确认',status:technicalViewAfterHandoff?'current':tech?'done':sales&&p.stage==='并行协作'&&role.value==='技术'?'current':'pending'},
   {id:'finance',label:'成本核算与方案选择',status:financial?'current':technicalViewAfterHandoff||salesViewAfterHandoff?'pending':early?'pending':'done'}
  ]
  const run=p.approvalRun;const current=currentApprovalStep(run)
  if(run){for(const task of run.steps)result.push({id:task.id,label:task.name+(task.status==='skipped'?(task.role==='董事长'?'（历史节点已取消）':'（未触发）'):''),status:task.status==='done'?'done':task.status==='skipped'?'skipped':!financial&&current?.id===task.id?'current':'pending'})}
  else result.push({id:'approval',label:'审批签发'+(definitions.activeRecord?' · '+definitions.activeRecord.name:''),status:'pending'})
  result.push({id:'send',label:'销售外发',status:p.stage==='已出具'?'current':published?'done':'pending'},{id:'track',label:'成交追踪',status:p.stage==='客户议价中'?'current':endedStages.includes(p.stage)?'done':'pending'})
  // 流程条当前节点跟随用户正在查看的页面；业务状态仍由上面的 done/pending 计算保留。
  const viewTarget=page.value==='parse'?'parse':page.value==='finance'?'finance':page.value==='bom'?'finance':page.value==='quotes'?(p.stage==='客户议价中'?'track':'send'):page.value==='collaboration'?(role.value==='销售'?'sales':role.value==='技术'?'tech':'finance'):''
  if(viewTarget){
   const progressedBeyondParallel=['财务核价','审批签发','董事长审批','可出具报价','已出具','客户议价中',...endedStages].includes(p.stage)
   result.forEach(step=>{
    if(step.id===viewTarget)step.status='current'
    else if(step.status==='current')step.status=progressedBeyondParallel?'done':'pending'
   })
  }
  return result
  }
  const targets=workflowPackages.value
  const lists=targets.map(stepsFor)
  if(lists.length<2)return lists[0]||[]
  return lists[0].map(step=>{
   const matches=lists.map(list=>list.find(item=>item.id===step.id))
   const done=matches.filter(item=>item?.status==='done'||item?.status==='skipped').length
   return {...step,label:`${step.label}（${done}/${targets.length}）`,status:done===targets.length?'done':matches.some(item=>item?.status==='current')?'current':'pending'}
  })
 })
}
