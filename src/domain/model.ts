import {currentApprovalStep,canHandleApproval,type ApprovalRun,type ApprovalFlowSnapshot} from './approval-workflow.ts'
import {goodsListRows} from '../data/goodsList.ts'
import {goodsHitRowByItem} from '../data/sourceSheets.ts'
import { partSelectionIssues, type PartSelection, type PartSelectionHistory } from './part-selection.ts'
import { activePartReference, demoPartUnitCost, referenceIssues, type PartReference } from './part-reference.ts'
export type Role = '销售' | '技术' | '财务' | '董事长' | '管理员'
export type Stage = '资料整理' | '并行协作' | '财务核价' | '审批签发' | '董事长审批' | '可出具报价' | '已出具' | '客户议价中' | '已成交' | '未成交' | '已取消'
// 成交结果：已成交/未成交/已取消三者都是终态；客户议价中是外发后的在办状态。
export type DealResult = '已成交' | '未成交' | '已取消'
export interface TechnicalChange { id:string; itemId:string; actor:string; role:Role; at:string; reason:string; changes:{field:string;label:string;before:string|number|null;after:string|number|null}[] }
export interface Item { goodsList?:Record<string,string>; goodsRow?:number; id:string; name:string; quantity:number; unit:string; model:string; spec:string; conductor:string; voltage:string; atlas:string; drawing:string; kind:'金具串'|'独立物资'; route:number; selected:string; confirmed:boolean; excluded:boolean; exclusionReason:string; source:string; original:Record<string,string>; price:number; cost:number; margin?:number; partCosts?:Record<string,number>; partOverrides?:Part[]; technicalChanges?:TechnicalChange[]; assignees?:Record<string,string> }
export interface Part {name:string;model:string;qty:number|null;unit:string;material:string;weight:number|null;u9:string;drawing:string;row:number;processRoute?:string;selection?:PartSelection;reference?:PartReference;technicalChanges?:TechnicalChange[]}
export interface MaterialQuantitySummary {unit:string;quantity:number}
export interface MaterialDeliverySummary {region:string;project:string;deliveryPoint:string;itemCount:number;quantities:MaterialQuantitySummary[]}
export interface MaterialWorksheetMeta {id:string;name:string;order:number}
export interface MaterialPackageSummary {sheetName:string;sourceWorksheetId?:string;sourceWorksheetName?:string;packageName:string;packageNo:string;voltageLevels:string[];itemCount:number;technicalCodeCount:number;quantities:MaterialQuantitySummary[];locations:MaterialDeliverySummary[]}
export interface Candidate {id:string;name:string;description:string;spec:string;model:string;atlas:string;drawing:string;drawing2:string;source:string;sheet:string;row:number;parts:Part[]}
export interface AuditContext {kind:'item'|'part'|'finance';itemId:string;itemSnapshot?:Item;partRow?:number;partSnapshot?:Part;partPricesSnapshot?:Record<string,number>;changes?:TechnicalChange['changes'];priceSnapshot?:{price:number;cost:number;margin:number;tax:number}}
export interface Audit {at:string;role:Role;action:string;detail:string;version:number;context?:AuditContext}
export interface QuotePartLine {itemId:string;row:number;name:string;model:string;qty:number|null;unit:string;material:string;u9:string;price:number}
export interface Snapshot {approval?:ApprovalRun;issuedBy?:string;provenance?:{packageId:string;packageName:string;categoryName:string;worksheetId?:string}; id:string;version:number;at:string;items:Item[];quoteParts?:QuotePartLine[];total:number;cost:number;tax:number;notes:string;audit:Audit[];excluded:Item[]}
export interface PricingScheme {id:string;name:string;margin:number;total:number;taxed:number;saved:boolean}
export type PackageProcessParticipantKey='dataParsing'|'salesConfirmation'|'technicalConfirmation'|'costCalculation'|'approvalIssuance'|'salesExternal'|'dealTracking'
export type PackageProcessParticipants=Record<PackageProcessParticipantKey,string>
export interface TechnicalExecution {mode:'director'|'employee';assignee?:string;status:'assigned'|'submitted';assignedAt?:string;assignedBy?:string;submittedAt?:string;returnReason?:string;returnedBy?:string;changeIdsAtAssignment?:string[];submittedSummary?:string[]}
export type PriceSource='archive'|'maintenance'|'reference'
export const rolePeople:Record<Role,string[]> = {
 销售:['销售 · 王宁','销售 · 张建军','销售 · 刘晓玲'],
 技术:['技术 · 李工','技术 · 周工','技术 · 高振华','技术 · 李总监'],
 财务:['财务 · 张会计','财务 · 李经理','财务 · 王总监','财务 · 赵会计'],
 董事长:['董事长 · 陈总','董事长 · 刘总'],
 管理员:['管理员'],
}
export const technicalDirector='技术 · 李总监'
export const technicalDirectors=[technicalDirector]
export const technicalStaff=rolePeople.技术.filter(person=>!technicalDirectors.includes(person))
export const defaultPackageProcessParticipants:PackageProcessParticipants={dataParsing:'销售 · 王宁',salesConfirmation:'销售 · 王宁',technicalConfirmation:technicalDirector,costCalculation:'财务 · 张会计',approvalIssuance:'财务 · 王总监',salesExternal:'销售 · 王宁',dealTracking:'销售 · 王宁'}
export function packageProcessParticipant(p:Package,key:PackageProcessParticipantKey){return p.processParticipants?.[key]||defaultPackageProcessParticipants[key]}
export function canHandlePackageProcess(p:Package,key:PackageProcessParticipantKey,person:string){return packageProcessParticipant(p,key)===person}
export function canHandleTechnicalWork(p:Package,person:string){return canHandlePackageProcess(p,'technicalConfirmation',person)||(p.technicalExecution?.mode==='employee'&&p.technicalExecution.assignee===person)}
export function isPackageVisibleToPerson(p:Package,person:string,role?:Role){
 if(role==='董事长')return true
 if(role==='技术'&&person!==technicalDirector&&!canHandleTechnicalWork(p,person))return false
 if(!p.processParticipants)return true
 if(p.stage==='资料整理')return packageProcessParticipant(p,'dataParsing')===person
 if(p.stage==='并行协作')return packageProcessParticipant(p,'salesConfirmation')===person||canHandleTechnicalWork(p,person)
 if(p.stage==='财务核价')return packageProcessParticipant(p,'costCalculation')===person
 const approval=currentApprovalStep(p.approvalRun)
 if(approval)return approval.assignee===person
 return ['approvalIssuance','salesExternal','dealTracking'].some(key=>packageProcessParticipant(p,key as PackageProcessParticipantKey)===person)
}
// 阶段级驳回只覆盖三个可驳回流程：销售需求确认 → 技术选项确认 → 成本核算与方案选择。
// 顺序表独立于 Stage（Stage 含审批与终态，不是同一条线），首节点没有上一个流程，不可驳回。
export const rejectStageOrder = ['销售需求确认','技术选项确认','成本核算与方案选择'] as const
export type RejectStage = typeof rejectStageOrder[number]
export function previousStage(s:RejectStage):RejectStage|undefined {
 const n = rejectStageOrder.indexOf(s)
 return n > 0 ? rejectStageOrder[n-1] : undefined
}
// 阶段级驳回留痕：from 是发起驳回的流程，to 是被驳回的上一个流程，两者都取自 rejectStageOrder。
export interface Rejection {from:RejectStage;to:RejectStage;by:string;role:Role;at:string;reason:string}
export interface Package {demoPrefilled?:boolean;materialWorksheetId?:string;materialSummary?:MaterialPackageSummary;rejection?:Rejection;technicalExecution?:TechnicalExecution;archivedAt?:string;financeReachedAt?:string;approvalFlowSnapshot?:ApprovalFlowSnapshot;processParticipants?:PackageProcessParticipants;approvalRun?:ApprovalRun;approvalHistory?:ApprovalRun[];bossAdjustment?:{basis:string;version:number};u9SyncedAt?:string;voltageLevel?:string;u9Data?:Record<string,{price:number;processRoute:string;source?:PriceSource}>;historicalU9Data?:Record<string,{price:number;processRoute:string;source:'archive'}>;technicalReviewRequired?:boolean;packageNo?:string;externalSentAt?:string;dealStatus?:'客户议价中'|DealResult;dealNote?:string;pricingSchemes?:PricingScheme[];selectedSchemeId?:PricingScheme['id']; id:string;projectId:string;packageName:string;stage:Stage;version:number;salesConfirmed:number|null;techConfirmed:number|null;items:Item[];files:{name:string;type:string;status:string;sourceUrl?:string}[];audit:Audit[];snapshots:Snapshot[];pricingNote:string;tax:number;manualBoss:boolean;settings:{amountThreshold:number|null;marginFloor:number|null};createdAt:string}
export interface Project {id:string;name:string;customer:string;region?:string;gridType?:'国网'|'南网';materialListFile?:{name:string;size:number};materialWorksheets?:MaterialWorksheetMeta[];climateStandard?:'耐寒标准品'|'非耐寒标准品'|'待客户确认';salesOwner:string;techOwner:string;financeOwner:string;createdAt:string;packages:Package[];partSelectionHistory?:PartSelectionHistory[]}
export const stages:Stage[]=['资料整理','并行协作','财务核价','审批签发','可出具报价','已出具','客户议价中','已成交','未成交','已取消']
// 终态即归档：成交/未成交/取消都从在办列表移入历史库，archivedAt 是入库时间，stage 保留原始成交结论；
// 阶段判断已挡住全部可写动作，所以已归档的包天然只读，不需要额外加锁。
export const endedStages:Stage[]=['已成交','未成交','已取消']
export function included(p:Package) { return p.items.filter(i=>!i.excluded) }
export const defaultPricingSchemes:PricingScheme[]=[{id:'conservative',name:'保守方案',margin:25,total:0,taxed:0,saved:false},{id:'standard',name:'标准方案',margin:20,total:0,taxed:0,saved:false},{id:'competitive',name:'竞争方案',margin:15,total:0,taxed:0,saved:false},{id:'custom',name:'自定义方案',margin:10,total:0,taxed:0,saved:false}]
export const editableSchemeId='custom'
export function quoteFromCost(cost:number,margin:number,tax:number){const total=cost<=0?0:cost/(1-margin/100);return {total,taxed:total*(1+tax/100)}}
// 原型演示需要在同一张子件表中同时体现两种价格来源；奇数资料行模拟历史归档命中，偶数行模拟维护库命中。
function demoPriceSourceForRow(row:number):PriceSource{return row%2===1?'archive':'maintenance'}
// 自有料号或已选参考子件均可带出价格；两者都没有时由财务在核价页手填。
// partCosts 只存财务本次手填的核算价，不带库中价，两者要分开显示。
export function buildU9Data(p:Package,catalog:Candidate[]) {
 const data:Record<string,{price:number;processRoute:string;source:PriceSource}>={}
 for(const i of included(p)){
  i.partCosts={}
  if(i.kind==='独立物资'){const price=Math.max(1,Math.round((i.quantity*7.35+18)*10000)/10000);data['item:'+i.id]={price,processRoute:'单件工艺路线待维护',source:'maintenance'};i.cost=price;continue}
  const c=catalog.find(c=>c.id===i.selected)
  if(!c)continue
  let itemCost=0
  for(const part of i.partOverrides||c.parts){
   const reference=activePartReference(part)
   const route=reference?.processRoute||part.processRoute||'备料 → 成形 → 机加工 → 表面处理 → 检验 → 包装'
   if(!String(part.u9||'').trim()&&!reference){data[c.id+':'+part.row]={price:0,processRoute:route,source:'maintenance'};continue}
   const price=demoPartUnitCost(reference||part)
   data[c.id+':'+part.row]={price,processRoute:route,source:reference?'reference':demoPriceSourceForRow(part.row)}
   if(part.qty!==null)itemCost+=price*part.qty
  }
  i.cost=Math.round(itemCost*10000)/10000
 }
 return data
}
// 核价页展开子件表用：本次核算价优先于库中/参考单价，参考对象的说明独立保留。
export function partCostRows(i:Item,p:Package,catalog:Candidate[]) {
 const c=i.kind==='独立物资'?undefined:catalog.find(x=>x.id===i.selected)
 const parts=i.kind==='独立物资'?[]:(i.partOverrides??c?.parts??[])
 return parts.map(part=>{
  const key=c?c.id+':'+part.row:''
  const syncedRecord=p.u9SyncedAt?(key?p.u9Data?.[key]:undefined):(key?p.historicalU9Data?.[key]||p.u9Data?.[key]:undefined)
  const reference=activePartReference(part)
  const synced=reference?(syncedRecord?.source==='reference'&&syncedRecord.price>0?syncedRecord.price:demoPartUnitCost(reference)):(syncedRecord?.price??0)
  const override=i.partCosts?.[part.row]??0
  const unit=override>0?override:synced
  return {part,synced,source:reference?'reference':syncedRecord?.source||'maintenance' as PriceSource,reference,override,unit:unit>0?unit:0,missing:part.qty===null?true:part.qty>0&&unit<=0}
 })
}
// 串的单位成本 = Σ（子件单价 × 每套用量），未填价或用量为空的子件按缺项统计。
export function costFromPartCosts(i:Item,p:Package,catalog:Candidate[]) {
 let cost=0;const missing:string[]=[]
 for(const row of partCostRows(i,p,catalog)){
  if(row.part.qty===null||row.unit<=0){if(row.part.qty!==0)missing.push(row.part.row+':'+(row.part.name||'未命名子件'));continue}
  cost+=row.unit*row.part.qty
 }
 return {cost:Math.round(cost*10000)/10000,missing}
}
export function totals(p:Package) { const amount=included(p).reduce((s,i)=>s+i.price*i.quantity,0)
 const cost=included(p).reduce((s,i)=>s+i.cost*i.quantity,0)
 return {amount,cost,margin:amount>0?(amount-cost)/amount*100:0,taxed:Math.round(amount*(1+p.tax/100)*10000)/10000}
}
// 待确认清单按字段现算：逐货物项逐字段查缺失，独立物资不参与；缺什么补什么。
// 条目默认由销售先行补齐，只有被指派时才把人员写进 item.assignees[字段]。
// label 是给人看的字段中文名（field 仍作 assignees 的键，不能中文化）。
const confirmRules:{field:string;label:string;title:string;missing:(i:Item)=>boolean}[]=[
 {field:'conductor',label:'适用导线',title:'导线型号缺失',missing:i=>!i.conductor.trim()},
 // 图册版本、图号不作为演示确认缺项；由来源资料保留，流程不要求补录。
 {field:'model',label:'串型号',title:'串型号缺失',missing:i=>!i.model.trim()},
 {field:'voltage',label:'电压等级',title:'电压等级缺失',missing:i=>!i.voltage.trim()},
]
export interface ConfirmEntry {id:string;itemId:string;field:string;label:string;title:string;owner:Role;assignee:string}
function personRole(person:string):Role {return (Object.keys(rolePeople) as Role[]).find(r=>rolePeople[r].includes(person)) || person.split(' · ')[0] as Role}
export function confirmEntries(p:Package):ConfirmEntry[] {
 return included(p).filter(i=>i.kind!=='独立物资').flatMap(i=>confirmRules.filter(r=>r.missing(i)).map(r=>{
  const configured=i.assignees?.[r.field]
  const assignee=r.field==='atlas'&&(!configured||personRole(configured)==='销售')?technicalDirector:configured||rolePeople.销售[0]
  return {id:i.id+':'+r.field,itemId:i.id,field:r.field,label:r.label,title:r.title,owner:personRole(assignee),assignee}
 }))
}
export function technicalReadiness(p:Package) {
 const items=included(p)
 const pending=items.filter(i=>!i.confirmed||!i.selected)
 const blockers=confirmEntries(p).filter(e=>e.owner==='技术')
 return {items,pending,blockers,ready:items.length>0&&!pending.length&&!blockers.length}
}
// 销售可以先确认客户需求，但技术提交/总监确认必须逐条完成串型信息和子件信息。
// 不按字段当前指派人过滤：软性销售确认不能把技术阶段的完整性门禁绕过去。
export function missingPartFields(part:Part) {
 const missing:string[]=[]
 if(!(part.model||'').trim())missing.push('型号')
 if(part.qty===null||part.qty===undefined)missing.push('用量')
 if(!(part.material||'').trim())missing.push('材质')
 if(!(part.drawing||'').trim())missing.push('图号')
 if(part.selection&&!part.selection.selectedOptionId)missing.push('候选选型')
 return missing
}
export function itemInformationGaps(p:Package,item:Item,catalog:Candidate[]) {
 if(item.excluded||item.kind==='独立物资')return {serial:[] as string[],parts:[] as Array<{row:number;fields:string[]}>}
 const serial=confirmEntries(p).filter(entry=>entry.itemId===item.id).map(entry=>entry.label)
 const candidate=catalog.find(entry=>entry.id===item.selected)
 if(!item.selected||!candidate)serial.push('匹配串型')
 const parts=item.partOverrides??candidate?.parts??[]
 const partGaps=parts.map(part=>({row:part.row,fields:[...new Set([...missingPartFields(part),...partSelectionIssues(part,item),...referenceIssues(part)])]})).filter(part=>part.fields.length)
 if(!parts.length)partGaps.push({row:0,fields:['子件清单']})
 return {serial:[...new Set(serial)],parts:partGaps}
}
export function technicalCompletionIssues(p:Package,catalog:Candidate[]) {
 return included(p).flatMap(item=>{
  if(item.kind==='独立物资')return []
  const gaps=itemInformationGaps(p,item,catalog),missing=[...gaps.serial,...gaps.parts.map(part=>`子件${part.row||''}缺少${part.fields.join('、')}`)]
  return missing.length?[`货物项 ${item.id}：${[...new Set(missing)].join('、')}`]:[]
 })
}
export function requiresTechnicalReview(_p:Package){
 return true
}
export function selectionConfirmationReady(p:Package){return p.salesConfirmed===p.version&&(!requiresTechnicalReview(p)||p.techConfirmed===p.version)}
export function canFinance(p:Package) {return p.stage==='并行协作' && selectionConfirmationReady(p) && included(p).length>0 && included(p).every(i=>i.confirmed&&i.quantity>0&&i.unit)}
export function approvalReasons(p:Package) {
 const t=totals(p),reasons:string[]=[]
 if(p.settings.amountThreshold!==null&&t.taxed>=p.settings.amountThreshold) reasons.push('含税总额达到提醒阈值')
 if(p.settings.marginFloor!==null&&t.margin<p.settings.marginFloor) reasons.push('毛利率低于提醒红线')
 if(p.manualBoss)reasons.push('特殊商务事项，请财务关注')
 return reasons
}
// 传给 catalog 时连子件缺项一起校验：串里有一个子件没价，整串成本就不完整，不许提交审批。
export function pricingReadinessIssues(p:Package,catalog:Candidate[]) {
 const items=included(p),issues:string[]=[]
 if(!items.length)issues.push('至少保留一个报价货物项')
 if(!p.pricingNote.trim())issues.push('请填写计价与商务口径')
 if(!Number.isFinite(p.tax)||p.tax<0||p.tax>100)issues.push('税率需在 0–100 之间')
 const missingItems:string[]=[]
 for(const i of items){
  if(!Number.isFinite(i.price)||i.price<=0)issues.push('货物项 '+i.id+' 的报价无效')
  if(!Number.isFinite(i.cost)||i.cost<=0)issues.push('货物项 '+i.id+' 的成本未补齐')
  const missing=costFromPartCosts(i,p,catalog).missing.length
  if(missing)missingItems.push(i.id+'（'+missing+'项）')
 }
 if(missingItems.length)issues.push('以下货物项仍有子件单价待补齐：'+missingItems.join('、'))
 return issues
}
export function pricingReady(p:Package,catalog:Candidate[]) {return pricingReadinessIssues(p,catalog).length===0}
export function invalidate(p:Package,kind:'technical'|'sales'|'price') {
 if(p.approvalRun?.status==='running'){p.approvalRun.status='returned';p.approvalRun.returnReason='业务依据变更，需重新提交审批'}
 if(kind==='price'){p.stage='财务核价';return}
 if(p.approvalRun){(p.approvalHistory??=[]).unshift(JSON.parse(JSON.stringify(p.approvalRun)));p.approvalRun=undefined}
 p.bossAdjustment=undefined
 p.u9SyncedAt=undefined
 p.u9Data=undefined
 p.items.forEach(i=>{i.partCosts=undefined})
 p.version++
 p.salesConfirmed=null;p.techConfirmed=null;p.stage='并行协作'
 if(kind==='technical'&&p.technicalExecution?.mode==='employee')p.technicalExecution.status='assigned'
 if(kind==='technical')p.items.forEach(i=>{i.confirmed=false})
}
export function requireRole(role:Role,allowed:Role[]) {if(!allowed.includes(role))throw Error('当前角色无权执行此操作')}
export const money=(n:number)=>new Intl.NumberFormat('zh-CN',{style:'currency',currency:'CNY',minimumFractionDigits:4,maximumFractionDigits:4}).format(n)
// 未给出护/铝后缀时，串型基础型号可以匹配两种包缠物配置；已有后缀时必须一致。
function sameChainModel(model:string,candidateModel:string) {return model===candidateModel||(!/[护铝]$/.test(model)&&candidateModel.replace(/[护铝]$/,'')===model)}
export function candidateDifferences(i:Item,c:Candidate) {
 if(i.kind==='独立物资') return []
 const diffs:string[]=[]
 const v=i.voltage.replace(/\s/g,'').toLowerCase()
 if(v && !c.name.toLowerCase().includes(v))diffs.push('电压等级不一致')
 if(i.conductor && !c.description.includes(i.conductor))diffs.push('适用导线不一致')
 if(i.model && !sameChainModel(i.model,c.model))diffs.push('串型号不一致')
 if(i.atlas && c.atlas.replace(/\s/g,'')!==i.atlas.replace(/\s/g,''))diffs.push('图册版本不一致')
 if(i.drawing && c.drawing!==i.drawing&&c.drawing2!==i.drawing)diffs.push('图号不一致')
 return diffs
}
export function findCandidates(items:Candidate[],i:Item,route:number,query='') {
 return items.filter(c=>{
 const q=query.trim().toLowerCase()
 if(q&&!`${c.name} ${c.model} ${c.description} ${c.spec} ${c.atlas} ${c.drawing}`.toLowerCase().includes(q))return false
 if(route===0)return Boolean(i.spec&&c.spec===i.spec)
 if(route===1)return Boolean(i.model&&sameChainModel(i.model,c.model))
 if(route===2)return Boolean(i.atlas&&c.atlas===i.atlas&&(!i.drawing||c.drawing===i.drawing||c.drawing2===i.drawing))
 return q?true:c.name.includes(i.name.split(',')[0].slice(0,8))
 })
}

export function candidateAdoptionIssues(p:Package,i:Item,c:Candidate,role:Role) {
 const issues:string[]=[]
 if(requiresTechnicalReview(p)&&role!=='技术')issues.push('当前选型需要技术角色确认采用')
 if(!requiresTechnicalReview(p)&&!['销售','技术'].includes(role))issues.push('当前选型需由销售确认采用')
 if(!['资料整理','并行协作'].includes(p.stage))issues.push('当前已进入下游，请先退回或创建新版本')
 if(i.excluded)issues.push('该项已被销售排除出本次报价')
 if(i.kind!=='独立物资'){
  if(!i.conductor.trim())issues.push('适用导线待确认，请由销售补齐')
  issues.push(...candidateDifferences(i,c))
 }
 return issues
}
export function rankedCandidates(items:Candidate[],i:Item,route:number,query='') {
 return findCandidates(items,i,route,query).sort((a,b)=>candidateDifferences(i,a).length-candidateDifferences(i,b).length)
}

export function workflowSteps(p:Package) {
 const progressStage=p.stage==='董事长审批'?'审批签发':p.stage
 const path=stages
 const index=path.indexOf(progressStage)
 return path.map((stage,n)=>{
  let label:string=stage==='可出具报价'?'待财务签发':stage==='已出具'?'已签发':stage
  if(stage==='并行协作'&&p.stage===stage){
   const sales=p.salesConfirmed===p.version,tech=p.techConfirmed===p.version
   label=sales&&tech?'双确认完成':sales?'待技术确认':tech?'待销售确认':'销售与技术并行确认'
  }
  return {stage,label,status:n<index?'done':n===index?'current':'pending'}
 })
}

export function canIssueQuote(p:Package,role:Role,person=''){return p.stage==='可出具报价'&&currentApprovalStep(p.approvalRun)?.action==='issue'&&canHandleApproval(p.approvalRun,role,person)&&p.approvalRun?.basis===pricingBasis(p)}

export function pricingBasis(p:Package){return JSON.stringify({version:p.version,rows:included(p).map(i=>[i.id,i.quantity,i.price,i.cost]),tax:p.tax,note:p.pricingNote})}
// Legacy labels are normalized at the storage boundary; historical evidence stays intact.
export function normalizePackage(p: Package): Package {
 // 旧报价快照可能未保存排除项，按空列表兼容，保证报价页与历史库可读取。
 p.snapshots ??= []
 for(const snapshot of p.snapshots)snapshot.excluded ??= []
 if ((p.stage as string) === '老板审批') p.stage = '董事长审批'
 if(p.approvalFlowSnapshot)p.approvalFlowSnapshot.tasks=p.approvalFlowSnapshot.tasks.filter(task=>task.role!=='董事长'&&task.condition!=='chairman')
 if(p.approvalRun){
  for(const step of p.approvalRun.steps)if(step.role==='董事长'||step.condition==='chairman'){
   step.status='skipped';step.opinion=step.opinion||'流程调整：董事长不再作为审批节点';step.completedAt=step.completedAt||new Date().toLocaleString('zh-CN')
  }
  p.approvalRun.basis=pricingBasis(p)
 }
 if(p.stage==='董事长审批')p.stage=p.approvalRun?(currentApprovalStep(p.approvalRun)?.action==='issue'?'可出具报价':'审批签发'):'财务核价'
 else if(['可出具报价','审批签发'].includes(p.stage)&&!p.approvalRun)p.stage='财务核价'
 const previousFinance=p.audit.find(entry=>['提交财务','技术总监确认','保存核价','提交审批签发','董事长审批通过','财务审批通过','财务签发报价'].includes(entry.action))
 if(!p.financeReachedAt&&previousFinance)p.financeReachedAt=previousFinance.at
 if(!p.financeReachedAt&&(!['资料整理','并行协作'].includes(p.stage)||p.approvalRun||p.u9SyncedAt))p.financeReachedAt=p.createdAt
 if (!p.pricingSchemes?.length) p.pricingSchemes = JSON.parse(JSON.stringify(defaultPricingSchemes))
 else if (!p.pricingSchemes.some(s => s.id === editableSchemeId)) p.pricingSchemes.push(...JSON.parse(JSON.stringify(defaultPricingSchemes.filter(s => s.id === editableSchemeId))))
 if (!p.selectedSchemeId) p.selectedSchemeId = 'standard'
 const legacyMargin=p.pricingSchemes.find(s=>s.id===p.selectedSchemeId)?.margin??20
 for(const item of p.items)if(!Number.isFinite(item.margin))item.margin=legacyMargin
 p.processParticipants={...defaultPackageProcessParticipants,...p.processParticipants,technicalConfirmation:technicalDirector}
 // 兼容浏览器中已保存的演示数据，让旧包无需清缓存也能直接对比历史归档价与维护库价。
 for(const [key,record] of Object.entries(p.u9Data??{})){
  const row=Number(key.slice(key.lastIndexOf(':')+1))
  if(Number.isFinite(row)&&record.source!=='reference')record.source=demoPriceSourceForRow(row)
 }
 // Migrate the earlier prototype seed: standalone goods are quoteable items in the mixed BOM.
 for (const item of p.items) {
  delete (item as unknown as {priceSource?: string}).priceSource
  if (item.kind === '独立物资' && item.exclusionReason === '独立物资单独记录，本次串型报价不包含') {
   item.excluded = false
   item.confirmed = false
   item.selected = ''
   item.exclusionReason = '单件金具与金具串并列纳入本包报价'
  }
  // 旧本地数据没有清单列：只补空值，销售页改过的列值保留。
  item.goodsList ??= goodsListRows[item.id]
  item.goodsRow ??= goodsHitRowByItem[item.id]
  // 把旧版统一挂在货物项下的子件修改记录迁到对应子件，避免升级后历史记录消失。
  for(const record of item.technicalChanges??[]){
   const byRow=new Map<string,TechnicalChange['changes']>()
   for(const change of record.changes){
    const row=/^part\.(\d+)\./.exec(change.field)?.[1]
    if(row)byRow.set(row,[...(byRow.get(row)||[]),change])
   }
   for(const [row,changes] of byRow){
    const part=item.partOverrides?.find(entry=>String(entry.row)===row)
    if(!part||part.technicalChanges?.some(entry=>entry.id===record.id))continue
    part.technicalChanges=[...(part.technicalChanges||[]),{...record,changes}]
   }
  }
 }
 // 技术必须参与串型/子件选型与技术风险裁定。
 p.technicalReviewRequired = true
 // 历史库之前没有归档字段：已经停在终态的旧本地数据补一个入库时间，否则永远进不了库（deal 只能走一次）。
 if(!p.archivedAt && endedStages.includes(p.stage)) p.archivedAt = new Date().toLocaleString('zh-CN')
 return p
}
// 迁移旧数据：将旧的 Project 结构转换为新的 Project + Package 结构
export function migrateOldProject(oldProject: any): Project {
 const pkg: Package = {
  id: oldProject.packageNo ? `${oldProject.id}-P${oldProject.packageNo}` : `${oldProject.id}-P1`,
  projectId: oldProject.id,
  packageName: oldProject.packageName || '默认报价包',
  voltageLevel: oldProject.voltageLevel || '',
  stage: oldProject.stage,
  version: oldProject.version || 1,
  salesConfirmed: oldProject.salesConfirmed || null,
  techConfirmed: oldProject.techConfirmed || null,
  items: oldProject.items || [],
  files: oldProject.files || [],
  audit: oldProject.audit || [],
  snapshots: oldProject.snapshots || [],
  pricingNote: oldProject.pricingNote || '',
  tax: oldProject.tax ?? 13,
  manualBoss: oldProject.manualBoss || false,
  settings: oldProject.settings || {amountThreshold: null, marginFloor: null},
  createdAt: new Date().toLocaleString('zh-CN'),
  approvalRun: oldProject.approvalRun,
  approvalHistory: oldProject.approvalHistory,
  bossAdjustment: oldProject.bossAdjustment,
  u9SyncedAt: oldProject.u9SyncedAt,
  u9Data: oldProject.u9Data,
  historicalU9Data: oldProject.historicalU9Data,
  technicalReviewRequired: oldProject.technicalReviewRequired,
  packageNo: oldProject.packageNo,
  externalSentAt: oldProject.externalSentAt,
  dealStatus: oldProject.dealStatus,
  dealNote: oldProject.dealNote,
  pricingSchemes: oldProject.pricingSchemes,
  selectedSchemeId: oldProject.selectedSchemeId
 }
 normalizePackage(pkg)
 const project: Project = {
  id: oldProject.id,
  name: oldProject.name,
  customer: oldProject.customer,
  region: oldProject.region,
  gridType: oldProject.gridType,
  climateStandard: oldProject.climateStandard || '待客户确认',
  salesOwner: oldProject.salesOwner || '销售 · 王宁',
  techOwner: oldProject.techOwner || '技术 · 李工',
  financeOwner: oldProject.financeOwner || '财务 · 张会计',
  createdAt: new Date().toLocaleString('zh-CN'),
  packages: [pkg]
 }
 return project
}
export function normalizeProjectRole(p: Project): Project {
 if ((p.stage as string) === '老板审批') p.stage = '董事长审批'
 if(p.approvalFlowSnapshot)p.approvalFlowSnapshot.tasks=p.approvalFlowSnapshot.tasks.filter(task=>task.role!=='董事长'&&task.condition!=='chairman')
 if(p.approvalRun)for(const step of p.approvalRun.steps)if(step.role==='董事长'||step.condition==='chairman'){
  step.status='skipped';step.opinion=step.opinion||'流程调整：董事长不再作为审批节点';step.completedAt=step.completedAt||new Date().toLocaleString('zh-CN')
 }
 if(p.approvalRun)p.approvalRun.basis=pricingBasis(p)
 if(p.stage==='董事长审批')p.stage=p.approvalRun?(currentApprovalStep(p.approvalRun)?.action==='issue'?'可出具报价':'审批签发'):'财务核价'
 else if(['可出具报价','审批签发'].includes(p.stage)&&!p.approvalRun)p.stage='财务核价'
 const previousFinance=p.audit.find(entry=>['提交财务','技术总监确认','保存核价','提交审批签发','董事长审批通过','财务审批通过','财务签发报价'].includes(entry.action))
 if(!p.financeReachedAt&&previousFinance)p.financeReachedAt=previousFinance.at
 if(!p.financeReachedAt&&(!['资料整理','并行协作'].includes(p.stage)||p.approvalRun||p.u9SyncedAt))p.financeReachedAt=p.createdAt
 if (!p.pricingSchemes?.length) p.pricingSchemes = JSON.parse(JSON.stringify(defaultPricingSchemes))
 else if (!p.pricingSchemes.some(s => s.id === editableSchemeId)) p.pricingSchemes.push(...JSON.parse(JSON.stringify(defaultPricingSchemes.filter(s => s.id === editableSchemeId))))
 if (!p.selectedSchemeId) p.selectedSchemeId = 'standard'
 if (!p.climateStandard) p.climateStandard = '待客户确认'
 // Migrate the earlier prototype seed: standalone goods are quoteable items in the mixed BOM.
 for (const item of p.items) {
  if (item.kind === '独立物资' && item.exclusionReason === '独立物资单独记录，本次串型报价不包含') {
   item.excluded = false
   item.confirmed = false
   item.selected = ''
   item.exclusionReason = '单件金具与金具串并列纳入本包报价'
  }
  // 旧本地数据没有清单列：只补空值，销售页改过的列值保留。
  item.goodsList ??= goodsListRows[item.id]
  item.goodsRow ??= goodsHitRowByItem[item.id]
 }
 // 技术必须参与串型/子件选型与技术风险裁定。
 p.technicalReviewRequired = true
 return p
}
export function displayRoleText(text: string): string { return text.replaceAll('老板', '董事长') }
