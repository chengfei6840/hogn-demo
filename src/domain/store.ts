import { technicalWorkflowScope, technicalAssignmentTargets } from './technical-assignment'
import {useWorkflowStore} from '../stores/workflow'
import {useUsersStore} from '../stores/users'
import {useRolePermissionsStore,type PermissionKey} from '../stores/role-permissions'
import {startApproval,currentApprovalStep,assertApprovalActor,finishApprovalStep,reopenApprovalRun,buildApprovalFlowSnapshot} from './approval-workflow'
import { computed, getCurrentInstance, inject, reactive, readonly, shallowRef, watch, type InjectionKey } from 'vue'
import { collectBatchFiles, copyDemoItems } from './batch-demo'
import rawCatalog from '../data/catalog.json'
import { createPackage } from './seed'
import { ensureMaterialWorksheetOwnership } from './material-worksheets'
import { batchCompatibility, getPackageBatchCapability } from './batch-packages.ts'
import { demoMaterialsForPackage } from './demo-materials'
import { demoPartOverrides, ensureDemoRecommendations } from '../data/demoPartSelections'
import { partSelectionIssues, selectionHistoryRecord } from './part-selection'
import { referenceIssues, referenceCostNote } from './part-reference'
import { normalizePackage, migrateOldProject, pricingBasis,canIssueQuote, candidateAdoptionIssues, technicalReadiness, technicalCompletionIssues, technicalDirector, technicalDirectors, candidateDifferences, confirmEntries, approvalReasons, canFinance, endedStages, included, invalidate, pricingReady, pricingReadinessIssues, requireRole, totals, quoteFromCost, requiresTechnicalReview, buildU9Data, costFromPartCosts, partCostRows, canHandlePackageProcess, canHandleTechnicalWork, packageProcessParticipant, type Candidate, type Item, type Part, type Project, type Package, type Role, type Stage, type MaterialPackageSummary, type QuotePartLine, previousStage, rolePeople, type RejectStage } from './model'
export const catalog=rawCatalog as Candidate[]
const STORAGE='hogn-prototype-v1'
function createEmptyWorkspace(){
 const project:Project={id:'',name:'',customer:'',region:'',gridType:'国网',climateStandard:'待客户确认',salesOwner:'',techOwner:'',financeOwner:'',createdAt:'',packages:[]}
 const pkg=createPackage(catalog,'','','P1')
 pkg.id='';pkg.packageName='';pkg.packageNo='';pkg.projectId='';pkg.items=[];pkg.files=[];pkg.audit=[];pkg.snapshots=[];pkg.stage='资料整理'
 return {currentProject:project,currentPackage:pkg,otherProjects:[] as Project[],hasProject:false}
}
function withoutInitialXinjiang(projects:Project[]){return projects.filter(project=>!(project.id==='HG-20260908-001'&&project.name==='新疆750千伏'))}
function loadWorkspace(): { currentProject: Project; currentPackage: Package; otherProjects: Project[]; hasProject:boolean } {
 try {
  const x=JSON.parse(localStorage.getItem(STORAGE)||'null')
  // 新格式 schema=3: 项目-包分离结构
  if(x?.schema===3 && Array.isArray(x.projects)) {
   if(!x.projects.length)return createEmptyWorkspace()
   // schema=3 was introduced before the merged sales/technical workflow.
   // Normalize every stored package so old local data gets the new fields too.
   const projects = withoutInitialXinjiang((x.projects as any[]).map(oldProject=>{
    // 电压等级已从项目级移到包级：老数据的项目电压挂到该项目第一个包上，再从项目上摘掉。
    const {voltageLevel, ...project} = oldProject
    const packages = (project.packages || []).map((pkg:Package)=>normalizePackage(pkg))
    if(voltageLevel && packages.length && !packages[0].voltageLevel) packages[0].voltageLevel = voltageLevel
    return {...project, packages}
   }))
   if(!projects.length)return createEmptyWorkspace()
   const currentProject = projects.find((p:Project)=>p.id===x.activeProjectId) || projects[0]
   const currentPackage = currentProject.packages.find((pkg:Package)=>pkg.id===x.activePackageId) || currentProject.packages[0]
   if(!currentPackage) throw Error('本地工作空间没有可用报价包')
   return {currentProject, currentPackage, otherProjects: projects.filter((p:Project)=>p.id!==currentProject.id),hasProject:true}
  }
  // 旧格式 schema=2: 多个旧 Project，需要迁移
  if(x?.schema===2 && Array.isArray(x.projects) && x.projects.length) {
   const migratedProjects = withoutInitialXinjiang(x.projects.map((oldProj:any)=>migrateOldProject(oldProj)))
   if(!migratedProjects.length)return createEmptyWorkspace()
   const currentProject = migratedProjects[0]
   const currentPackage = currentProject.packages[0]
   return {currentProject, currentPackage, otherProjects: migratedProjects.slice(1),hasProject:true}
  }
  // 旧格式 schema=1: 单个旧 Project
  if(x?.schema===1 && x.project?.id) {
   const migratedProject = migrateOldProject(x.project)
   if(migratedProject.id==='HG-20260908-001'&&migratedProject.name==='新疆750千伏')return createEmptyWorkspace()
   return {currentProject: migratedProject, currentPackage: migratedProject.packages[0], otherProjects: [],hasProject:true}
  }
 } catch {}
 // 默认工作区为空，由销售上传项目物料清单后开始。
 return createEmptyWorkspace()
}
// 演示包的货物项 02 不再要求用户手动选择串型，旧本地数据也补齐同型号分解记录。
function ensureDemoPartBindings(projects: Project[]){
 for(const project of projects)for(const pkg of project.packages){
  if(pkg.demoPrefilled)continue
  for(const item of pkg.items){
   if(item.id!=='02'||item.selected||!item.model)continue
   const candidate=catalog.find(c=>c.model===item.model)
   if(!candidate)continue
   item.selected=candidate.id
  }
  // 只升级尚在编辑中的演示样例；已有子件修改记录的行由用户的结果决定。
  if(['资料整理','并行协作'].includes(pkg.stage))for(const item of pkg.items){
   if(!item.source.startsWith('演示询价清单.xlsx'))continue
   const candidate=catalog.find(entry=>entry.id===item.selected)
   if(!candidate)continue
   const previous=item.partOverrides||candidate.parts
   const next=demoPartOverrides(item,previous)
   if(next.some((part,index)=>part.selection!==previous[index]?.selection||
     (['material','u9','drawing'] as const).some(key=>part[key]!==previous[index]?.[key]))){
    item.partOverrides=next;item.confirmed=false;pkg.techConfirmed=null
    if(pkg.technicalExecution?.status==='submitted')pkg.technicalExecution.status='assigned'
    if(item.id==='03'&&item.model==='7X2-4055-21H护'&&!(item.technicalChanges??[]).some(record=>record.changes.some(change=>change.field==='model'))){
     item.model=item.model.replace(/护$/,'');item.name=item.name.replace(/护$/,'')
     item.goodsList={...item.goodsList,物资描述:(item.goodsList?.物资描述||'').replace(/护$/,'')}
    }
   }
  }
  ensureDemoRecommendations(project,pkg.items)
 }
}
const loaded=loadWorkspace()
for(const project of [loaded.currentProject,...loaded.otherProjects])ensureMaterialWorksheetOwnership(project)
ensureDemoPartBindings([loaded.currentProject,...loaded.otherProjects])
for(const project of [loaded.currentProject,...loaded.otherProjects])for(const pkg of project.packages){
 const latest=pkg.snapshots?.[0]
 if(!latest||latest.quoteParts||latest.version!==pkg.version||!['已出具','客户议价中'].includes(pkg.stage))continue
 latest.quoteParts=latest.items.flatMap(i=>i.kind==='独立物资'?[]:partCostRows(i,pkg,catalog).filter(r=>r.part.qty!==null).map(r=>({itemId:i.id,row:r.part.row,name:r.part.name,model:r.part.model,qty:r.part.qty,unit:r.part.unit,material:r.part.material,u9:r.part.u9,price:Math.round(quoteFromCost(r.unit,i.margin??20,latest.tax).total*10000)/10000})))
}
const currentProject=reactive(loaded.currentProject)
const state=reactive(loaded.currentPackage)
const otherProjects=shallowRef<Project[]>(loaded.otherProjects)
const hasProject=shallowRef(loaded.hasProject)
const projects=computed(()=>{
 if(!hasProject.value)return []
 const updatedCurrent = {...currentProject, packages: currentProject.packages.map(p=>p.id===state.id?state:p)}
 return [updatedCurrent,...otherProjects.value]
})
const packageListWorksheetByProject=shallowRef<Record<string,string>>({})
const selectedPackageIds=shallowRef<string[]>([])
const batchPackageIds=shallowRef<string[]>([])
const workflowBusy=shallowRef(false)
const batchFiles=shallowRef<Package['files']>([])
const batchSession=shallowRef(0)
const approvalSettings=reactive({...state.settings})
try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(saved?.approvalSettings)Object.assign(approvalSettings,saved.approvalSettings)}catch{}
for(const project of projects.value)for(const pkg of project.packages)pkg.settings={...approvalSettings}
const intakeOpen=shallowRef(false)
const intakeMode=shallowRef<'project'|'package'|'editProject'|'editPackage'>('project')
function openIntake(mode:'project'|'package'|'editProject'|'editPackage'='project'){intakeMode.value=mode;intakeOpen.value=true}
function openPackageEditor(packageId:string){switchPackage(packageId);openIntake('editPackage')}
function snapshotPackage():Package{return JSON.parse(JSON.stringify(state))}
function snapshotProject():Project{return JSON.parse(JSON.stringify({...currentProject, packages: currentProject.packages.map(p=>p.id===state.id?state:p)}))}
function replacePackage(next:Package){
 for(const key of Object.keys(state))if(!(key in next))delete (state as any)[key]
 Object.assign(state,next,{settings:{...approvalSettings}})
}
function switchPackage(packageId:string){
 if(workflowBusy.value&&state.id!==packageId){toast('当前资料解析动画运行中，请先等待完成或取消');return}
 // 先把当前包写回数组再取目标包：数组里当前包的副本可能落后于 state（如刚取消归档），先取会读到旧值。
 const synced=currentProject.packages.map(p=>p.id===state.id?snapshotPackage():p)
 const pkg=synced.find(p=>p.id===packageId)
 if(pkg){currentProject.packages=synced;replacePackage(JSON.parse(JSON.stringify(pkg)))}
}
function switchProject(projectId:string){
 if(workflowBusy.value){toast('当前资料解析动画运行中，请先等待完成或取消');return}
 selectedPackageIds.value=[];batchPackageIds.value=[]
 const next=otherProjects.value.find(p=>p.id===projectId)
 if(next){
  const savedCurrent = snapshotProject()
  otherProjects.value=[savedCurrent,...otherProjects.value.filter(p=>p.id!==projectId)]
  Object.assign(currentProject, next)
  replacePackage(JSON.parse(JSON.stringify(next.packages[0])))
 }
}
function openProject(projectId:string){
 switchProject(projectId)
 page.value='packages'
}
function createEmptyPackage(projectId:string,packageName:string,packageNo:string,index:number,materialListFile?:Project['materialListFile'],materialSummary?:MaterialPackageSummary):Package{
 const pkg=createPackage(catalog,projectId,packageName,'P'+index)
 const workflows=useWorkflowStore()
 pkg.packageNo=packageNo
 if(materialSummary){pkg.materialSummary=JSON.parse(JSON.stringify(materialSummary));pkg.voltageLevel=materialSummary.voltageLevels.join(' / ')}
 pkg.stage='资料整理'
 pkg.items=[]
 pkg.files=materialListFile?[{name:materialListFile.name,type:materialListFile.name.split('.').pop()?.toUpperCase()||'Excel',status:'待解析 · 项目物料清单'}]:[]
 pkg.processParticipants={dataParsing:person.value,salesConfirmation:person.value,...workflows.stageOperators}
 pkg.approvalFlowSnapshot=buildApprovalFlowSnapshot(workflows.activeRecord,{})
 return pkg
}
function openPackage(packageId:string){
 if(workflowBusy.value){toast('当前资料解析动画运行中，请先等待完成或取消');return}
 batchPackageIds.value=[]
 switchPackage(packageId)
 page.value=projectPageForRole(state.stage,role.value)
}
function resolvePackage(packageId:string):Package|undefined {
 if(state.id===packageId)return state
 return currentProject.packages.find(pkg=>pkg.id===packageId)
}
function enterBatch(packageIds:string[]){
 const unique=[...new Set(packageIds)]
 if(workflowBusy.value)throw Error('当前资料解析动画运行中，请先等待完成或取消')
 if(!unique.length)throw Error('请至少选择一个报价包')
 const targets=unique.map(resolvePackage)
 if(targets.some(pkg=>!pkg))throw Error('所选报价包已不存在，请刷新列表')
 if(targets.some(pkg=>pkg!.projectId!==currentProject.id))throw Error('仅支持同一项目内批量处理')
 if(targets.some(pkg=>pkg!.archivedAt))throw Error('已归档报价包只读，无法批量处理')
 const capabilities=targets.map(pkg=>getPackageBatchCapability(pkg!,role.value,person.value))
 const check=batchCompatibility(capabilities)
 if(!check.compatible)throw Error(check.reason)
 batchPackageIds.value=unique
 batchSession.value++
 batchFiles.value=collectBatchFiles(targets as Package[])
 selectedPackageIds.value=unique
 switchPackage(unique[0])
 page.value=getPackageBatchCapability(resolvePackage(unique[0])!,role.value,person.value).key==='parsing'?'parse':getPackageBatchCapability(resolvePackage(unique[0])!,role.value,person.value).key==='costing'?'finance':getPackageBatchCapability(resolvePackage(unique[0])!,role.value,person.value).key.startsWith('approval:')?'finance':getPackageBatchCapability(resolvePackage(unique[0])!,role.value,person.value).key==='sales-external'||getPackageBatchCapability(resolvePackage(unique[0])!,role.value,person.value).key==='deal-tracking'?'quotes':'collaboration'
}

const role=shallowRef<Role>('销售')
const person=shallowRef('销售 · 王宁')
watch(role,r=>{person.value=rolePeople[r][0]},{flush:'sync'})
const notice=shallowRef('')
const page=shallowRef(loaded.hasProject?'dashboard':'overview')
watch([role,person],()=>{batchSession.value++;workflowBusy.value=false},{flush:'sync'})
watch(page,next=>{if(batchPackageIds.value.length&&!['packages','parse','collaboration','bom','finance','quotes'].includes(next)){batchPackageIds.value=[];selectedPackageIds.value=[]}},{flush:'sync'})
function projectPageForRole(stage:Stage,currentRole:Role){
 if(currentRole==='董事长')return 'finance'
 if(stage==='资料整理') return 'parse'
 const downstream=['财务核价','审批签发','董事长审批','可出具报价']
 if(currentRole==='财务'&&downstream.includes(stage)) return 'finance'
 if(['销售','财务','董事长'].includes(currentRole)&&['已出具','客户议价中',...endedStages].includes(stage)) return 'quotes'
 return 'collaboration'
}
watch(role,()=>{
 if(['collaboration','bom','finance','quotes'].includes(page.value)) page.value=projectPageForRole(state.stage,role.value)
},{flush:'sync'})
let toastTimer:ReturnType<typeof setTimeout>
function toast(message:string){notice.value=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>notice.value='',6000)}
watch([state,currentProject,otherProjects,approvalSettings],()=>{try{localStorage.setItem(STORAGE,JSON.stringify({schema:3,activeProjectId:currentProject.id,activePackageId:state.id,projects:projects.value,approvalSettings}))}catch{toast('浏览器无法保存，当前数据仅在本次会话有效')}},{deep:true})
function run(action:()=>void){try{action();return true}catch(e){toast(e instanceof Error?e.message:'操作失败');return false}}
const actionPermission:Record<string,PermissionKey>={
 new:'project.create',newPackage:'project.create',editProject:'project.edit',editPackage:'project.edit',
 start:'inquiry.manage',files:'inquiry.manage',demoFiles:'inquiry.manage',confirmSales:'sales.confirm',
 assign:'technical.manage',assignTechnical:'technical.manage',returnTechnical:'technical.manage',submitTechnical:'technical.manage',confirmTech:'technical.manage',
 setPartCost:'finance.manage',setItemCost:'finance.manage',savePrice:'finance.manage',
 approveFinance:'approval.manage',completeApproval:'approval.manage',return:'approval.manage',issue:'approval.manage',
 updateQuotePrices:'quote.manage',dispatch:'quote.manage',deal:'quote.manage',revision:'quote.manage',unarchive:'quote.manage',settings:'settings.manage',
}
function act(name:string,payload:any={}) {return run(()=>performAction(state,name,payload))}
function performAction(state:Package,name:string,payload:any={}) {
function log(action:string,detail:string,context?:import('./model').AuditContext){state.audit.unshift({at:new Date().toLocaleString('zh-CN'),role:role.value,action,detail:person.value+'；'+detail,version:state.version,...(context?{context:JSON.parse(JSON.stringify(context))}: {})})}
function editable(){if(!['资料整理','并行协作'].includes(state.stage))throw Error('当前版本已进入下游，请先退回或创建新版本')}
function processOwner(key:Parameters<typeof packageProcessParticipant>[1]){const owner=packageProcessParticipant(state,key);if(person.value!==owner)throw Error('当前流程负责人为 '+owner+'，请切换到指定用户')}
function technicalEditor(){if(role.value!=='技术'||person.value===technicalDirector)return;if(state.technicalExecution?.mode==='employee'&&state.technicalExecution.status==='assigned'&&state.technicalExecution.assignee===person.value)return;throw Error('当前包技术任务未指派给你')}
function resetTechnicalSubmission(){if(state.technicalExecution?.mode==='employee')state.technicalExecution.status='assigned'}
function technicalChangeIds(){return state.items.flatMap(i=>(i.technicalChanges??[]).map(change=>change.id))}
function technicalSubmissionSummary(assignee:string,baselineIds:string[]=[]){return state.items.flatMap(i=>{const changes=(i.technicalChanges??[]).filter(change=>change.actor===assignee&&change.role==='技术'&&!baselineIds.includes(change.id)).flatMap(change=>change.changes);const serialChanged=changes.some(change=>['model','voltage','conductor','atlas','drawing','selected','route'].includes(change.field));const partRows=[...new Set(changes.map(change=>/^part\.(\d+)\./.exec(change.field)?.[1]).filter((row):row is string=>Boolean(row)))];if(!serialChanged&&!partRows.length)return[];const candidate=catalog.find(entry=>entry.id===i.selected);const parts=i.partOverrides||candidate?.parts||[];const partModels=[...new Set(partRows.map(row=>parts.find(part=>String(part.row)===row)?.model.trim()||'型号未填写'))];const areas=[serialChanged?'串型信息':'',partModels.length?'子件型号 '+partModels.join('、'):''].filter(Boolean);return[`货物项 ${i.id}「${i.name}」：${areas.join('、')}`]})}
function item(id:string){const i=state.items.find(x=>x.id===id);if(!i)throw Error('货物项不存在');return i}

 if (targetActions.has(name) && role.value==='技术' && !canHandleTechnicalWork(state,person.value)) throw Error('当前包技术任务未指派给你')
 const permission=actionPermission[name]
 if(permission&&!useRolePermissionsStore().can(role.value,permission))throw Error('当前角色没有此操作权限，请联系管理员调整角色权限')
 const roster=useUsersStore()
 const requireActivePerson=(label:string,expectedRole?:Role)=>{const user=roster.enabledUsers.find(entry=>`${entry.role} · ${entry.name}`===label||entry.role==='管理员'&&entry.name==='管理员'&&label==='管理员');if(!user||expectedRole&&user.role!==expectedRole)throw Error(`${label||'负责人'}不是已启用的${expectedRole||''}用户`)}
 if(name==='assign'){requireActivePerson(String(payload.assignee||''));if(!roster.enabledUsers.some(entry=>`${entry.role} · ${entry.name}`===payload.assignee&&['销售','技术'].includes(entry.role)))throw Error('待确认负责人只能选择已启用的销售或技术人员')}
 if(name==='assignTechnical'&&payload.mode==='employee')requireActivePerson(String(payload.assignee||''),'技术')
 if(['newPackage','editPackage'].includes(name)){
  const participantRoles:Record<string,Role>={dataParsing:'销售',salesConfirmation:'销售',technicalConfirmation:'技术',costCalculation:'财务',approvalIssuance:'财务',salesExternal:'销售',dealTracking:'销售'}
  for(const [key,label] of Object.entries(payload.processParticipants||{}))if(participantRoles[key])requireActivePerson(String(label),participantRoles[key])
  for(const label of Object.values(payload.approvalParticipants||{}))requireActivePerson(String(label),'财务')
 }
 if (['start','files','demoFiles'].includes(name)) processOwner('dataParsing')
 else if (name==='confirmSales') processOwner('salesConfirmation')
 else if (['assignTechnical','returnTechnical','confirmTech'].includes(name)) processOwner('technicalConfirmation')
 else if (['setPartCost','setItemCost','savePrice'].includes(name)) processOwner('costCalculation')
 else if (name==='dispatch') processOwner('salesExternal')
 else if (name==='deal') processOwner('dealTracking')
 switch(name){
 case 'start': requireRole(role.value,['销售']);editable();if(!(payload.batchFiles||state.files).length)throw Error('请先添加资料');{const reparse=!!state.items.length;if(reparse)invalidate(state,'technical');state.items=copyDemoItems(createPackage(catalog,currentProject.id,'默认包','P1').items,catalog,!!payload.demoPrefill);state.demoPrefilled=!!payload.demoPrefill;if(payload.batchFiles)state.files=JSON.parse(JSON.stringify(payload.batchFiles));state.technicalExecution=undefined;state.pricingNote='';state.pricingSchemes=undefined;state.selectedSchemeId=undefined;ensureDemoRecommendations(currentProject,state.items);state.files.forEach(f=>f.status='已生成演示结果');state.salesConfirmed=null;state.techConfirmed=null;state.stage='并行协作';page.value='collaboration';log(reparse?'重新演示解析':'启动演示解析','生成预置样例结果；未调用真实解析服务'+(reparse?'；已重建货物项并清除当前确认结果':''));toast('演示解析完成，请核对货物项并发起协作')}break
 case 'files':requireRole(role.value,['销售']);editable();state.files.push(...payload.map((f:{name:string})=>({name:f.name,type:f.name.split('.').pop()?.toUpperCase()||'文件',status:'待解析 · 原型仅登记文件名'})));if(state.items.length)invalidate(state,'technical');log('登记资料',payload.map((f:{name:string})=>f.name).join('、'));break
 case 'demoFiles':requireRole(role.value,['销售']);editable();{const bundle=demoMaterialsForPackage(state);if(!bundle.length)throw Error('当前包尚未提供对应的演示技术资料，请选择已有资料的报价包');const added=bundle.filter(file=>!state.files.some(existing=>existing.name===file.name));if(!added.length){toast('本包演示资料已载入');break}state.files.push(...added.map(file=>({...file,status:'待解析 · 本包技术规范书'})));if(state.items.length)invalidate(state,'technical');log('载入本包演示资料',added.map(file=>file.name).join('、'));toast(`已载入 ${added.length} 份本包技术资料，原有物料清单已保留`)}break
 case 'new':requireRole(role.value,['销售']);if(!payload.name?.trim())throw Error('请输入项目名称');if(!payload.materialListFile?.name||!/^.+\.xlsx$/i.test(payload.materialListFile.name))throw Error('请上传 .xlsx 格式的物料清单');{const roster=useUsersStore();const owners={salesOwner:String(payload.salesOwner||''),techOwner:String(payload.techOwner||''),financeOwner:String(payload.financeOwner||'')};for(const [key,ownerRole] of [['salesOwner','销售'],['techOwner','技术'],['financeOwner','财务']] as const){const user=roster.enabledUsers.find(entry=>`${entry.role} · ${entry.name}`===owners[key]);if(!user||user.role!==ownerRole)throw Error(`请选择有效的${ownerRole}负责人`)}if(!technicalDirectors.includes(owners.techOwner))throw Error('技术负责人需由技术总监承担确认责任');const materialPackages=payload.materialPackages as MaterialPackageSummary[]|undefined;if(!materialPackages?.length)throw Error('物料清单没有可用的报价包');const projectId='HG-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase();const materialListFile={name:payload.materialListFile.name,size:payload.materialListFile.size||0};const worksheets=(payload.materialWorksheets||[]) as import('./model').MaterialWorksheetMeta[];if(!worksheets.length)throw Error('请先选择并解析至少一个工作表');const worksheetIds=new Set(worksheets.map(sheet=>sheet.id));if(materialPackages.some(summary=>!summary.sourceWorksheetId||!worksheetIds.has(summary.sourceWorksheetId)))throw Error('报价包工作表归属无效，请重新解析物料清单');const packages=materialPackages.map((summary,index)=>{const next=createEmptyPackage(projectId,summary.packageName||summary.sheetName,summary.packageNo||'',index+1,materialListFile,summary);next.materialWorksheetId=summary.sourceWorksheetId;next.processParticipants={dataParsing:owners.salesOwner,salesConfirmation:owners.salesOwner,technicalConfirmation:owners.techOwner,costCalculation:owners.financeOwner,approvalIssuance:owners.financeOwner,salesExternal:owners.salesOwner,dealTracking:owners.salesOwner};if(next.approvalFlowSnapshot)for(const task of next.approvalFlowSnapshot.tasks)if(task.role==='财务')task.assignee=owners.financeOwner;return next});const newProject:Project={id:projectId,name:payload.name.trim(),customer:payload.customer||'待补充',region:payload.region||'',gridType:payload.gridType||'国网',materialListFile,materialWorksheets:worksheets,climateStandard:'待客户确认',salesOwner:owners.salesOwner,techOwner:owners.techOwner,financeOwner:owners.financeOwner,createdAt:new Date().toLocaleString('zh-CN'),packages};if(hasProject.value)otherProjects.value=[snapshotProject(),...otherProjects.value];else otherProjects.value=[];Object.assign(currentProject,newProject);replacePackage(JSON.parse(JSON.stringify(packages[0])));hasProject.value=true;person.value=owners.salesOwner;page.value='packages';toast(`已解析 ${new Set(packages.map(pkg=>pkg.materialWorksheetId)).size} 个工作表，创建 ${packages.length} 个报价包；当前演示身份已切换为 ${owners.salesOwner}`)}break
 case 'newPackage':requireRole(role.value,['销售']);if(!payload.packageName?.trim())throw Error('请输入报价包名称');{const newPkg=createEmptyPackage(currentProject.id,payload.packageName,payload.packageNo||'',currentProject.packages.length+1,currentProject.materialListFile);newPkg.voltageLevel=payload.voltageLevel||'';const worksheetId=String(payload.materialWorksheetId||currentProject.materialWorksheets?.[0]?.id||'');if(!currentProject.materialWorksheets?.some(sheet=>sheet.id===worksheetId))throw Error('请选择当前项目中的有效工作表');newPkg.materialWorksheetId=worksheetId;newPkg.processParticipants={...newPkg.processParticipants,...payload.processParticipants,technicalConfirmation:technicalDirector};newPkg.approvalFlowSnapshot=buildApprovalFlowSnapshot(useWorkflowStore().activeRecord,payload.approvalParticipants||{});currentProject.packages.push(newPkg);replacePackage(JSON.parse(JSON.stringify(newPkg)));log('新建报价包','报价包名称：'+payload.packageName+(payload.packageNo?'；包号：'+payload.packageNo:''));page.value='parse';toast('报价包已创建，请添加询价资料')}break
 case 'editProject':requireRole(role.value,['销售']);if(!payload.name?.trim())throw Error('请输入项目名称');Object.assign(currentProject,{name:payload.name.trim(),customer:payload.customer||'待补充',region:payload.region||'',gridType:payload.gridType||'国网'});toast('项目信息已更新');break
 case 'editPackage':requireRole(role.value,['销售']);if(!payload.packageName?.trim())throw Error('请输入报价包名称');{const approvalFlowSnapshot=state.approvalFlowSnapshot?JSON.parse(JSON.stringify(state.approvalFlowSnapshot)):buildApprovalFlowSnapshot(useWorkflowStore().activeRecord,{});if(approvalFlowSnapshot)for(const task of approvalFlowSnapshot.tasks)if(payload.approvalParticipants?.[task.nodeId])task.assignee=payload.approvalParticipants[task.nodeId];const next={packageName:payload.packageName.trim(),packageNo:payload.packageNo||'',voltageLevel:payload.voltageLevel||'',processParticipants:{...state.processParticipants,...payload.processParticipants,technicalConfirmation:technicalDirector},approvalFlowSnapshot};Object.assign(state,next);if(state.approvalRun)for(const step of state.approvalRun.steps)if(step.status==='pending'&&payload.approvalParticipants?.[step.id])step.assignee=payload.approvalParticipants[step.id];log('编辑报价包','报价包信息及流程负责人已更新');const saved=currentProject.packages.find(pkg=>pkg.id===state.id);if(saved)Object.assign(saved,JSON.parse(JSON.stringify(state)));toast('报价包信息已更新')}break
 case 'assign':requireRole(role.value,['销售','技术']);editable();if(!payload.assignee?.trim())throw Error('请选择负责人');{const i=item(payload.id);const targets=confirmEntries(state).filter(e=>e.itemId===i.id);if(!targets.length)throw Error('该货物项没有待确认的字段');for(const t of targets)(i.assignees??={})[t.field]=payload.assignee;log('指派待确认条目',i.id+' · '+targets.map(t=>t.title).join('、')+' → '+payload.assignee);toast('已指派 '+targets.length+' 项，已进入对方待确认清单')}break
 case 'assignTechnical':requireRole(role.value,['技术']);editable();if(person.value!==technicalDirector)throw Error('仅技术总监可以分派技术确认任务');if(state.salesConfirmed!==state.version)throw Error('请先等待销售完成需求确认');if(payload.mode==='director'){state.technicalExecution={mode:'director',status:'assigned',assignedAt:new Date().toLocaleString('zh-CN'),assignedBy:person.value};log('技术任务改为总监自行完成','技术员工将不再看到本包');toast('已改为由技术总监自行完成')}else{if(!useUsersStore().peopleForRole('技术').some(assignee=>assignee===payload.assignee&&!technicalDirectors.includes(assignee)))throw Error('请选择已启用的技术员工');state.technicalExecution={mode:'employee',assignee:payload.assignee,status:'assigned',assignedAt:new Date().toLocaleString('zh-CN'),assignedBy:person.value,changeIdsAtAssignment:technicalChangeIds()};log('指派技术确认任务','→ '+payload.assignee);toast('已指派给 '+payload.assignee+'，员工提交后由总监确认')}break
 case 'returnTechnical':requireRole(role.value,['技术']);editable();if(person.value!==technicalDirector)throw Error('仅技术总监可以退回技术任务');if(state.technicalExecution?.mode!=='employee'||state.technicalExecution.status!=='submitted')throw Error('当前没有已提交的技术员工任务');if(!payload.reason?.trim())throw Error('请填写退回原因');state.technicalExecution.status='assigned';state.technicalExecution.submittedAt=undefined;state.technicalExecution.returnReason=payload.reason.trim();state.technicalExecution.returnedBy=person.value;state.technicalExecution.changeIdsAtAssignment=technicalChangeIds();state.technicalExecution.submittedSummary=undefined;log('退回技术人员重新确认',state.technicalExecution.assignee+'；'+payload.reason.trim());toast('已退回给 '+state.technicalExecution.assignee+' 重新确认');break
 case 'submitTechnical':requireRole(role.value,['技术']);editable();if(state.technicalExecution?.mode!=='employee'||state.technicalExecution.assignee!==person.value)throw Error('当前技术任务未指派给你');if(state.technicalExecution.status!=='assigned')throw Error('技术结果已提交，等待总监确认');if(state.salesConfirmed!==state.version)throw Error('请先等待销售完成需求确认');{const check=technicalReadiness(state);if(!check.items.length)throw Error('本次报价没有纳入报价的货物项');const issues=technicalCompletionIssues(state,catalog);if(issues.length)throw Error(`技术信息未填写完整（${issues.length} 项）：${issues.slice(0,3).join('；')}`);if(check.blockers.length)throw Error('还有 '+check.blockers.length+' 项技术问题未完成，请先处理对应问题');state.technicalExecution.submittedSummary=technicalSubmissionSummary(person.value,state.technicalExecution.changeIdsAtAssignment);state.technicalExecution.status='submitted';state.technicalExecution.submittedAt=new Date().toLocaleString('zh-CN');state.technicalExecution.returnReason=undefined;state.technicalExecution.returnedBy=undefined;log('提交技术结果给总监确认','技术结果已完成，等待总监确认');toast('技术结果已提交，等待总监确认')}break
  case 'editItem':requireRole(role.value,['销售']);editable();{const i=item(payload.id);if(!payload.reason?.trim())throw Error('修改必须填写来源和原因');if(!payload.name?.trim()||!Number.isFinite(payload.quantity)||payload.quantity<=0||!payload.unit?.trim())throw Error('请填写名称、有效数量和单位');const fields:[keyof Item,string][]=[['name','货物名称'],['quantity','数量'],['unit','单位'],['conductor','导线型号'],['voltage','电压等级'],['spec','技术规范编码'],['model','串型号']];const changes:{field:string;label:string;before:string|number|null;after:string|number|null}[]=fields.filter(([field])=>i[field]!==payload[field]).map(([field,label])=>({field,label,before:(i[field] as string|number|null)??null,after:(payload[field] as string|number|null)??null}));Object.assign(i,{name:payload.name,quantity:payload.quantity,unit:payload.unit,conductor:payload.conductor,voltage:payload.voltage,spec:payload.spec,model:payload.model});if(payload.goodsList&&typeof payload.goodsList==='object'){const next=payload.goodsList as Record<string,string>;for(const [field,value] of Object.entries(next)){const before=i.goodsList?.[field]||'';if(before!==value)changes.push({field:'goodsList.'+field,label:field,before,after:value})}i.goodsList={...i.goodsList,...next}}if(Array.isArray(payload.parts)){if(i.kind!=='独立物资'&&!payload.parts.length)throw Error('至少保留一条子件');const before=i.partOverrides||catalog.find(c=>c.id===i.selected)?.parts||[];const next=payload.parts as Part[];for(const part of next){if(part.qty!==null&&(!Number.isFinite(part.qty)||part.qty<0))throw Error('子件用量需填写不小于 0 的数字');if(part.weight!==null&&(!Number.isFinite(part.weight)||part.weight<0))throw Error('子件重量需填写不小于 0 的数字');const previous=before.find(entry=>entry.row===part.row);for(const key of ['name','model','qty','unit','material','weight','u9','processRoute'] as const){if(previous?.[key]!==part[key])changes.push({field:`part.${part.row}.${key}`,label:`子件${part.row} ${key}`,before:previous?.[key]??null,after:part[key]??null})}}i.partOverrides=JSON.parse(JSON.stringify(next))}if(changes.length){invalidate(state,'technical');(i.technicalChanges??=[]).unshift({id:'TC-'+Date.now().toString(36),itemId:i.id,actor:person.value,role:role.value,at:new Date().toLocaleString('zh-CN'),reason:payload.reason,changes});log('修改客户需求解析信息',i.id+'；'+changes.length+' 项字段变化；'+payload.reason,{kind:changes.some(change=>change.field.startsWith('part.'))?'part':'item',itemId:i.id,itemSnapshot:i,changes});toast('核对信息已更新为 V'+state.version+'，销售和技术需重新确认')}else toast('没有检测到信息变化，当前版本保持不变')}break
  case 'exclude':requireRole(role.value,['销售']);editable();if(!payload.reason?.trim())throw Error('需说明不纳入本次报价的范围及依据');{const i=item(payload.id);const before=i.excluded?'不纳入本次报价':'纳入本次报价';i.excluded=!i.excluded;i.exclusionReason=payload.reason;invalidate(state,'sales');(i.technicalChanges??=[]).unshift({id:'TC-'+Date.now().toString(36),itemId:i.id,actor:person.value,role:role.value,at:new Date().toLocaleString('zh-CN'),reason:payload.reason,changes:[{field:'excluded',label:'报价范围',before,after:i.excluded?'不纳入本次报价':'纳入本次报价'},{field:'exclusionReason',label:'范围说明',before:null,after:payload.reason}]});log('调整报价范围',i.id+'：'+payload.reason,{kind:'item',itemId:i.id,itemSnapshot:i,changes:i.technicalChanges?.[0]?.changes})}break
 case 'reviewMode':requireRole(role.value,['销售']);editable();state.technicalReviewRequired=true;state.salesConfirmed=null;state.techConfirmed=null;log('确认技术参与方式','技术必须参与串型与子件选型及技术风险裁定');toast('技术必须参与选型，已保持技术确认门禁');break
 case 'select':requireRole(role.value,['销售','技术']);editable();technicalEditor();{const i=item(payload.id);const candidate=catalog.find(c=>c.id===payload.candidate);if(!candidate)throw Error('候选不存在');if(i.kind==='独立物资')throw Error('独立物资不能选择串型');if(!payload.reason?.trim())throw Error('请填写匹配条件及选定依据');const before=i.selected;const changes=before!==candidate.id?[{field:'selected',label:'匹配串型',before,after:candidate.id}]:[];i.selected=candidate.id;i.route=payload.route??i.route;i.confirmed=false;state.techConfirmed=null;resetTechnicalSubmission();if(changes.length){(i.technicalChanges??=[]).unshift({id:'TC-'+Date.now().toString(36),itemId:i.id,actor:person.value,role:role.value,at:new Date().toLocaleString('zh-CN'),reason:payload.reason,changes});log('修改技术串型',i.id+'：'+candidate.name+'；'+payload.reason,{kind:'item',itemId:i.id,itemSnapshot:i,changes})}toast('串型结果已保存，待技术确认')}break
 case 'editChainParams':requireRole(role.value,['销售','技术']);editable();technicalEditor();{
  const i=item(payload.id)
  if(i.kind==='独立物资')throw Error('独立物资没有串型参数')
  if(!payload.reason?.trim())throw Error('请填写修改原因')
  const fields:[keyof Item,string][]=[['model','串型号'],['voltage','电压等级'],['conductor','适用导线'],['atlas','图册版本'],['drawing','图号']]
  const changes:{field:string;label:string;before:string|number|null;after:string|number|null}[]=fields.filter(([field])=>i[field]!==payload.params[field]).map(([field,label])=>({field,label,before:(i[field] as string|null)??null,after:(payload.params[field] as string|null)??null}))
  const candidateId=typeof payload.candidateId==='string'?payload.candidateId:''
  if(candidateId&&candidateId!==i.selected){
   const chosen=catalog.find(entry=>entry.id===candidateId)
   if(!chosen)throw Error('候选不存在')
   changes.push({field:'selected',label:'匹配串型',before:i.selected||null,after:chosen.model||chosen.name})
   i.selected=chosen.id
   i.partOverrides=undefined
  }
  if(!changes.length)break
  const technicalContinuation=role.value==='技术'&&state.salesConfirmed===state.version
  Object.assign(i,payload.params)
  if(candidateId){const base=catalog.find(entry=>entry.id===candidateId);if(base)i.partOverrides=demoPartOverrides(i,base.parts)}
  invalidate(state,'technical')
  if(technicalContinuation)state.salesConfirmed=state.version
  ;(i.technicalChanges??=[]).unshift({id:'TC-'+Date.now().toString(36),itemId:i.id,actor:person.value,role:role.value,at:new Date().toLocaleString('zh-CN'),reason:payload.reason,changes})
  log('修改串型参数并重新匹配',i.id+'：'+changes.map(c=>c.label+' '+c.before+'→'+c.after).join('、'),{kind:'item',itemId:i.id,itemSnapshot:i,changes})
  toast('串信息及选型已更新为 V'+state.version)
 }break
 case 'updateParts':requireRole(role.value,['销售','技术']);editable();technicalEditor();{
  const i=item(payload.id)
  if(i.kind==='独立物资')throw Error('独立物资没有串内子件')
  if(!Array.isArray(payload.parts)||!payload.parts.length)throw Error('至少保留一条子件')
  if(!payload.reason?.trim())throw Error('请填写修改原因')
  const before=JSON.parse(JSON.stringify(i.partOverrides||catalog.find(c=>c.id===i.selected)?.parts||[])) as Part[]
  const changes:{field:string;label:string;before:string|number|null;after:string|number|null}[]=[]
  for(const next of payload.parts as Part[]){
   const prev=before.find(part=>part.row===next.row)
   const optionIssues=[...partSelectionIssues(next,i),...referenceIssues(next)]
   if(optionIssues.length)throw Error(optionIssues.join('；'))
   for(const key of ['name','model','qty','unit','material','u9','drawing','weight'] as const){
    if(prev?.[key]!==next[key])changes.push({field:`part.${next.row}.${key}`,label:`子件${next.row} ${key}`,before:prev?.[key]??null,after:next[key]??null})
   }
   if(prev?.selection?.selectedOptionId!==next.selection?.selectedOptionId)changes.push({field:`part.${next.row}.selection`,label:`子件${next.row} 候选选型`,before:prev?.selection?.selectedOptionId||null,after:next.selection?.selectedOptionId||null})
   if(JSON.stringify(prev?.reference)!==JSON.stringify(next.reference))changes.push({field:`part.${next.row}.reference`,label:`子件${next.row} 参考子件`,before:prev?.reference?referenceCostNote(prev.reference):null,after:next.reference?referenceCostNote(next.reference):null})
  }
  const nextParts=JSON.parse(JSON.stringify(payload.parts)) as Part[]
  i.confirmed=false;state.techConfirmed=null;resetTechnicalSubmission()
  if(changes.length){
   const changeRecord={id:'TC-'+Date.now().toString(36),itemId:i.id,actor:person.value,role:role.value,at:new Date().toLocaleString('zh-CN'),reason:payload.reason,changes}
   for(const part of nextParts){
    const partChanges=changes.filter(change=>change.field.startsWith(`part.${part.row}.`))
    if(partChanges.length)part.technicalChanges=[...(part.technicalChanges||[]),{...changeRecord,changes:partChanges}]
   }
   (i.technicalChanges??=[]).unshift(changeRecord)
   log('修改技术子件',i.id+'：'+changes.length+' 项变化；'+payload.reason,{kind:'part',itemId:i.id,itemSnapshot:{...i,partOverrides:nextParts},changes})
  }
  i.partOverrides=nextParts
  for(const part of nextParts){
   if(!changes.some(change=>change.field.startsWith(`part.${part.row}.`)))continue
   const record=selectionHistoryRecord(currentProject,state,i,part)
   if(record)(currentProject.partSelectionHistory??=[]).unshift(record)
  }
  toast('子件结果已保存，待技术确认')
 }break
 case 'confirmSingle':requireRole(role.value,['销售','技术']);editable();technicalEditor();{const i=item(payload.id);if(i.kind!=='独立物资'||i.excluded)throw Error('当前货物项不是可报价单件');if(!payload.reason?.trim())throw Error('请填写单件物料确认依据');i.selected='item:'+i.id;i.confirmed=false;if(requiresTechnicalReview(state))state.techConfirmed=null;resetTechnicalSubmission();log('确认单件金具',i.id+'；'+payload.reason);toast('单件物料结果已保存，待技术确认')}break
 case 'confirmSales':requireRole(role.value,['销售']);editable();if(!included(state).length)throw Error('本次报价没有纳入报价的货物项');if(included(state).some(i=>!i.name||i.quantity<=0||!i.unit))throw Error('请补齐货物名称、有效数量和单位');state.salesConfirmed=state.version;state.techConfirmed=null;log('销售确认','客户需求及报价范围 V'+state.version);toast('销售确认完成，已进入技术选项确认');break
 case 'confirmTech':requireRole(role.value,['技术']);editable();if(person.value!==technicalDirector)throw Error('仅技术总监可以确认并推进技术流程');if(state.salesConfirmed!==state.version)throw Error('请先等待销售完成需求确认');if(state.technicalExecution?.mode==='employee'&&state.technicalExecution.status!=='submitted')throw Error('请等待被指派的技术员工提交结果');{const check=technicalReadiness(state);if(!check.items.length)throw Error('本次报价没有纳入报价的货物项');const issues=technicalCompletionIssues(state,catalog);if(issues.length)throw Error(`技术信息未填写完整（${issues.length} 项）：${issues.slice(0,3).join('；')}`);if(check.blockers.length)throw Error('还有 '+check.blockers.length+' 项技术阻断，请先处理对应问题');check.items.forEach(i=>i.confirmed=true)}state.techConfirmed=state.version;state.financeReachedAt??=new Date().toLocaleString('zh-CN');state.stage='财务核价';state.u9Data=buildU9Data(state,catalog);state.u9SyncedAt=new Date().toLocaleString('zh-CN');log('技术总监确认','全部纳入报价的技术结果、单件及子件 V'+state.version+'；BOM 与 U9 价格已自动带出');page.value='collaboration';toast('技术总监确认完成，BOM 与 U9 价格已自动生成，已进入财务核价');break
 case 'rejectStage':{
  // 阶段级驳回：技术把已确认的需求打回销售、财务把已确认的技术选项打回技术，只覆盖这两条边。
  // 与审批链的「退回」完全分离（那条走 'return'）；首节点没有上一个流程，不可驳回。
  let from:RejectStage|undefined
  if(role.value==='技术'&&state.stage==='并行协作'&&state.salesConfirmed===state.version&&state.techConfirmed!==state.version&&(person.value===technicalDirector||(state.technicalExecution?.mode==='employee'&&state.technicalExecution.status==='assigned'&&state.technicalExecution.assignee===person.value)))from='技术选项确认'
  else if(role.value==='财务'&&state.stage==='财务核价')from='成本核算与方案选择'
  if(!from)throw Error('当前角色无权驳回');
  if(!payload.reason?.trim())throw Error('请填写驳回原因');
  const to=previousStage(from)!
  // 作废口径复用既有 primitive：版本 +1、双确认清空、U9 成本带出结果一并作废，回到并行协作。
  invalidate(state,'technical')
  state.rejection={from,to,by:person.value,role:role.value,at:new Date().toLocaleString('zh-CN'),reason:payload.reason.trim()}
  log(from==='技术选项确认'?'客户需求驳回':'技术选项驳回','驳回到 '+to+'：'+payload.reason.trim())
  toast('已驳回到 '+to+'，原确认已作废，请重新确认后继续')
 }break
 case 'finance':requireRole(role.value,['销售','技术']);if(!canFinance(state))throw Error(requiresTechnicalReview(state)?'需销售、技术确认当前版本，且核价前阻断全部解除':'需销售完成选型确认，且核价前阻断全部解除');state.stage='财务核价';state.financeReachedAt??=new Date().toLocaleString('zh-CN');log('提交财务',requiresTechnicalReview(state)?'销售与技术双确认门禁通过':'销售自行确认门禁通过');page.value='finance';break
 case 'setPartCost':requireRole(role.value,['财务']);if(state.stage!=='财务核价')throw Error('当前阶段不能改价');{const i=item(payload.id);if(i.kind==='独立物资')throw Error('独立物资没有串内子件，请直接改该项单位成本');const cost=Number(payload.cost);if(!Number.isFinite(cost)||cost<0)throw Error('本次核算单价不能为负数');const target=partCostRows(i,state,catalog).find(r=>r.part.row===payload.row);if(!target)throw Error('子件不属于该货物项');const before=i.cost;const prior=i.partCosts?.[payload.row];i.partCosts??={};if(cost>0)i.partCosts[payload.row]=cost;else delete i.partCosts[payload.row];const recost=costFromPartCosts(i,state,catalog);i.cost=recost.cost;const detail='货物项 '+i.id+' 子件 '+payload.row+'（'+target.part.name+'）：'+(prior>0?'本次核算价 '+prior:(target.reference?'按参考子件成本 ':'按库中价 ')+target.synced)+' → '+(cost>0?'本次核算价 '+cost:(target.reference?'按参考子件成本 ':'按库中价 ')+target.synced)+'；串单位成本 '+before+' → '+i.cost+(recost.missing.length?'；仍有 '+recost.missing.length+' 项待补充':'');log('财务修改子件成本',detail,{kind:'finance',itemId:i.id,itemSnapshot:i,partRow:target.part.row,partSnapshot:target.part,changes:[{field:`part.${target.part.row}.cost`,label:'核算单价',before:target.unit,after:cost>0?cost:target.synced}],partPricesSnapshot:Object.fromEntries(partCostRows(i,state,catalog).map(row=>[String(row.part.row),row.unit])),priceSnapshot:{price:i.price,cost:i.cost,margin:i.margin??20,tax:state.tax}});toast(cost>0?'本次核算单价已生效，串单位成本已重算':target.reference?'已清除本次核算价，按参考子件成本重算':'已清除本次核算价，按库中价重算')}break
 case 'setItemCost':requireRole(role.value,['财务']);if(state.stage!=='财务核价')throw Error('当前阶段不能改价');{const i=item(payload.id);if(i.kind!=='独立物资')throw Error('金具串的成本按其子件汇总，请展开子件修改');const cost=Number(payload.cost);if(!Number.isFinite(cost)||cost<=0)throw Error('单位成本必须大于0');const before=i.cost;i.cost=Math.round(cost*10000)/10000;(i.partCosts??={})['item:'+i.id]=i.cost;log('财务修改单件成本','货物项 '+i.id+'：单位成本 '+before+' → '+i.cost,{kind:'finance',itemId:i.id,itemSnapshot:i,changes:[{field:'cost',label:'单位成本',before,after:i.cost}],priceSnapshot:{price:i.price,cost:i.cost,margin:i.margin??20,tax:state.tax}});toast('单件成本已更新')}break
 case 'savePrice':requireRole(role.value,['财务']);if(state.stage!=='财务核价')throw Error('当前阶段不能改价');{const rows=payload.rows as Item[];if(rows.some(i=>!Number.isFinite(i.price)||i.price<=0||!Number.isFinite(i.cost)||i.cost<0||!Number.isFinite(i.margin)||i.margin<0||i.margin>=100))throw Error('请填写有效的单项毛利率、报价与成本');if(rows.some(i=>i.cost<=0))throw Error('有货物项成本为0，请先展开子件补充缺失的单价');if(!Number.isFinite(payload.tax)||payload.tax<0||payload.tax>100)throw Error('税率应在 0–100 之间');for(const r of rows){const target=item(r.id);const before={price:target.price,cost:target.cost,margin:target.margin??20};Object.assign(target,{price:r.price,cost:r.cost,margin:r.margin});if(before.price!==r.price||before.cost!==r.cost||before.margin!==r.margin)log('财务修改货物项核价','货物项 '+target.id+'：报价/成本/毛利率已调整',{kind:'finance',itemId:target.id,itemSnapshot:target,changes:([['price','未税单价'],['cost','单位成本'],['margin','毛利率']] as const).filter(([field])=>before[field]!==target[field]).map(([field,label])=>({field,label,before:before[field],after:target[field]??0})),partPricesSnapshot:Object.fromEntries(partCostRows(target,state,catalog).map(row=>[String(row.part.row),row.unit])),priceSnapshot:{price:target.price,cost:target.cost,margin:target.margin??20,tax:Number(payload.tax)}})}state.tax=payload.tax;state.pricingNote=payload.note;state.manualBoss=payload.manualBoss;log('保存核价','按货物项毛利率计算报价；U9子件成本为核价基础；税率 '+state.tax+'%');toast('核价草稿已保存')}break
 case 'approveFinance':requireRole(role.value,['财务']);if(state.stage!=='财务核价')throw Error('当前阶段不能提交审批');{const issues=pricingReadinessIssues(state,catalog);if(issues.length)throw Error(issues.join('；'));
  const run=startApproval(useWorkflowStore().activeRecord,state.version,pricingBasis(state),state.approvalFlowSnapshot);
  if(state.approvalRun)(state.approvalHistory??=[]).unshift(JSON.parse(JSON.stringify(state.approvalRun)));
  state.approvalRun=run;state.stage=currentApprovalStep(run)?.action==='issue'?'可出具报价':'审批签发';log('提交审批签发',run.recordName+' V'+run.recordVersion+'；实际 '+run.steps.filter(s=>s.status!=='skipped').length+' 个处理节点');toast('已交给 '+currentApprovalStep(run)?.assignee)
 }break
 case 'completeApproval':{
  if(state.stage!=='审批签发')throw Error('当前不在审批阶段');const run=state.approvalRun;if(!run)throw Error('请先提交审批签发');
  const current=currentApprovalStep(run)!;const next=finishApprovalStep(run,role.value,person.value,pricingBasis(state),payload.reason||'');
  log(current.name+'通过',current.assignee+'；'+payload.reason);state.stage=next?.action==='issue'?'可出具报价':'审批签发';toast(next?'已流转至 '+next.assignee:'审批完成')
 }break
 case 'adjustItemMargins':throw Error('董事长角色仅可查看核价信息')
 case 'approveBoss':throw Error('请在当前指定审批任务中提交意见');
 case 'return':requireRole(role.value,['技术','财务']);if(!payload.reason?.trim())throw Error('请填写具体退回原因');
 if(['审批签发','可出具报价'].includes(state.stage)){
  assertApprovalActor(state.approvalRun,role.value,person.value,pricingBasis(state));reopenApprovalRun(state.approvalRun!,payload.reason,person.value+'（'+role.value+'）');state.stage='财务核价';
 }else if(role.value==='财务'){if(state.stage!=='财务核价')throw Error('当前不能退回核价');invalidate(state,'technical')}else{editable();state.salesConfirmed=null;state.techConfirmed=null}
 log('退回处理',payload.reason);toast('已退回，原审批记录保留');break
 case 'issue':requireRole(role.value,['财务']);if(!canIssueQuote(state,role.value,person.value))throw Error('审批尚未完成，不能签发');{const t=totals(state);const snapshotItems=JSON.parse(JSON.stringify(included(state))) as Item[];const quoteParts:QuotePartLine[]=snapshotItems.flatMap(i=>i.kind==='独立物资'?[]:partCostRows(i,state,catalog).filter(r=>r.part.qty!==null).map(r=>({itemId:i.id,row:r.part.row,name:r.part.name,model:r.part.model,qty:r.part.qty,unit:r.part.unit,material:r.part.material,u9:r.part.u9,price:Math.round(quoteFromCost(r.unit,i.margin??20,state.tax).total*10000)/10000})));finishApprovalStep(state.approvalRun!,role.value,person.value,pricingBasis(state),'签发已审批报价','issue');log('财务签发报价','冻结需求、核价、子件对外报价及审批快照；销售可下载已签发版本');const categoryName=currentProject.materialWorksheets?.find(sheet=>sheet.id===state.materialWorksheetId)?.name||state.materialSummary?.sourceWorksheetName||'未分类';state.snapshots.unshift({id:state.id+'-Q'+(state.snapshots.length+1),version:state.version,at:new Date().toLocaleString('zh-CN'),issuedBy:person.value,provenance:{packageId:state.id,packageName:state.packageName,categoryName,worksheetId:state.materialWorksheetId},approval:JSON.parse(JSON.stringify(state.approvalRun)),items:snapshotItems,quoteParts,total:t.taxed,cost:t.cost,tax:state.tax,notes:state.pricingNote,audit:JSON.parse(JSON.stringify(state.audit))});state.stage='已出具';page.value='quotes';toast('财务签发完成，销售可下载已签发版本')}break
 case 'updateQuotePrices':requireRole(role.value,['销售']);if(!['已出具','客户议价中'].includes(state.stage)||state.archivedAt)throw Error('当前报价已归档或不可调整');processOwner(state.stage==='已出具'?'salesExternal':'dealTracking');{const snapshot=state.snapshots[0];if(!snapshot||snapshot.id!==payload.snapshotId)throw Error('只能调整最新签发的报价版本');if(!Array.isArray(payload.items)||payload.items.length!==snapshot.items.length)throw Error('报价明细不完整，请刷新后重试');const entries=payload.items as {id:string;price:number;partPrices:Record<string,number>}[];if(new Set(entries.map(entry=>entry.id)).size!==snapshot.items.length||entries.some(entry=>!snapshot.items.some(i=>i.id===entry.id)))throw Error('报价明细不完整，请刷新后重试');for(const entry of entries){if(!Number.isFinite(Number(entry.price))||Number(entry.price)<0)throw Error('报价单价必须为有效的非负数');for(const part of snapshot.quoteParts||[]){if(part.itemId!==entry.id)continue;const partPrice=Number(entry.partPrices?.[part.row]);if(!Number.isFinite(partPrice)||partPrice<0)throw Error('子件报价单价必须为有效的非负数')}}for(const entry of entries){const target=snapshot.items.find(i=>i.id===entry.id)!;target.price=Math.round(Number(entry.price)*10000)/10000;for(const part of snapshot.quoteParts||[]){if(part.itemId===target.id)part.price=Math.round(Number(entry.partPrices[part.row])*10000)/10000}}const untaxed=snapshot.items.reduce((sum,i)=>sum+i.price*i.quantity,0);snapshot.total=Math.round(untaxed*(1+snapshot.tax/100)*10000)/10000;const detail='报价 '+snapshot.id+'：串报价与子件对外报价已调整，未税总额 '+untaxed.toFixed(4)+'，含税总额 '+snapshot.total.toFixed(4);snapshot.audit.unshift({at:new Date().toLocaleString('zh-CN'),role:role.value,action:'销售调整已签发报价',detail:person.value+'；'+detail,version:snapshot.version});log('销售调整已签发报价',detail);toast('报价调整已保存，页面汇总和下载文件已更新')}break
 case 'dispatch':requireRole(role.value,['销售']);if(!['已出具','客户议价中'].includes(state.stage))throw Error('仅已签发报价可登记外发');state.externalSentAt=new Date().toLocaleString('zh-CN');state.dealStatus='客户议价中';state.stage='客户议价中';log('销售外发报价','登记客户、时间与已签发报价版本；进入客户议价中');toast('已登记外发，项目进入客户议价中');break
 case 'deal':requireRole(role.value,['销售']);if(state.stage!=='客户议价中')throw Error('当前不在客户议价阶段');if(!payload.status||!['已成交','未成交','已取消'].includes(payload.status)||!payload.note?.trim())throw Error('请选择成交结果并填写依据');state.dealStatus=payload.status;state.dealNote=payload.note.trim();state.stage=payload.status;state.archivedAt=new Date().toLocaleString('zh-CN');log('登记成交结果并归档入库',payload.status+'：'+state.dealNote+'；已从在办列表移入历史库');toast('成交结果已留存，该报价包已归档入库');break
 case 'unarchive':requireRole(role.value,['销售']);if(!endedStages.includes(state.stage))throw Error('当前报价包不在历史库');{const from=state.stage;state.stage='客户议价中';state.dealStatus='客户议价中';state.archivedAt=undefined;log('取消归档',from+' 报价包退回客户议价中，可继续处理；原成交记录：'+(state.dealNote||'无'));page.value='quotes';toast('已取消归档，报价包回到客户议价中')}break
 case 'revision':requireRole(role.value,['销售']);if(!['已出具','客户议价中'].includes(state.stage))throw Error('仅已签发报价可创建新版本');if(state.u9Data){state.historicalU9Data=Object.fromEntries(Object.entries(state.u9Data).filter(([,entry])=>entry.price>0).map(([key,entry])=>[key,{...entry,source:'archive' as const}]))}invalidate(state,'technical');state.pricingNote='';state.externalSentAt=undefined;state.dealStatus=undefined;state.dealNote=undefined;state.archivedAt=undefined;log('创建新版本','历史报价快照保持不变；新版本沿用历史归档价，技术确认后更新维护库价');page.value='collaboration';break
 case 'settings':requireRole(role.value,['董事长']);for(const x of [payload.amountThreshold,payload.marginFloor])if(x!==null&&(!Number.isFinite(x)||x<0))throw Error('阈值需为非负数或留空');if(payload.marginFloor>100)throw Error('毛利红线不能超过100%');Object.assign(approvalSettings,payload);for(const project of projects.value){for(const pkg of project.packages){pkg.settings={...approvalSettings};if(pkg.id!==state.id)pkg.audit.unshift({at:new Date().toLocaleString('zh-CN'),role:role.value,action:'统一风险提醒更新',detail:person.value+'；更新金额与毛利率提醒阈值，不改变审批状态',version:pkg.version})}}log('调整统一报价风险提醒','适用于全部项目；审批流程与已签发报价不变');toast('报价风险提醒已更新');break
 case 'reset':otherProjects.value=[];{const empty=createEmptyWorkspace();Object.assign(currentProject,empty.currentProject);replacePackage(JSON.parse(JSON.stringify(empty.currentPackage)));hasProject.value=false}page.value='overview';toast('演示数据已清空，请从导入项目开始');break
 }
 }
export function baseWorkspace(){
 const workflows=useWorkflowStore()
 const users=useUsersStore()
 const people=computed(()=>users.peopleForRole(role.value))
 return {people,packageListWorksheetByProject,selectedPackageIds,batchPackageIds:computed(()=>batchPackageIds.value.length?workflowPackages.value.map(pkg=>pkg.id):[]),hasBatchSelection:computed(()=>batchPackageIds.value.length>0),workflowPackages,assignTechnicalPackages,batchFiles,batchSession,workflowBusy,resolvePackage,enterBatch,actForPackage,actBatch,parseBatch,loadBatchDemo,addBatchFiles,package:readonly(state),project:readonly(currentProject),approvalSettings:readonly(approvalSettings),projects,packages:computed(()=>hasProject.value?currentProject.packages.map(pkg=>pkg.id===state.id?state:pkg):[]),archived:computed(()=>projects.value.flatMap(proj=>proj.packages.filter(pkg=>pkg.archivedAt).map(pkg=>({...pkg,projectName:proj.name,customer:proj.customer,projectId:proj.id}))).sort((a,b)=>(Date.parse(b.archivedAt!)||0)-(Date.parse(a.archivedAt!)||0))),openIntake,openPackageEditor,intakeOpen,intakeMode,switchProject,openProject,switchPackage,openPackage,role,person,page,notice,toast,act,canFinance:computed(()=>canFinance(state)),totals:computed(()=>totals(state)),approvalReasons:computed(()=>approvalReasons(state))}}

// Detail panels and native downstream forms receive a fixed source package.
// A scoped action never swaps the active object or navigation context.
export type Workspace = ReturnType<typeof baseWorkspace>
export const workspaceContextKey: InjectionKey<Workspace> = Symbol('workspace-package')
export function useWorkspace(): Workspace {
 return (getCurrentInstance() ? inject(workspaceContextKey, null) : null) || baseWorkspace()
}
export function usePackageWorkspace(packageId: string): Workspace {
 const workspace = baseWorkspace()
 const target = resolvePackage(packageId)
 if (!target) throw Error('来源报价包已不存在')
 return {...workspace, package: readonly(target), act: (name, payload = {}) => actForPackage(packageId, name, payload),
  canFinance: computed(() => canFinance(target)), totals: computed(() => totals(target)), approvalReasons: computed(() => approvalReasons(target))}
}
const targetActions = new Set(['start','files','demoFiles','assign','assignTechnical','returnTechnical','submitTechnical','editItem','exclude','reviewMode','select','editChainParams','updateParts','adjustItemMargins','approveBoss','confirmSingle','confirmSales','confirmTech','finance','rejectStage','setPartCost','setItemCost','savePrice','approveFinance','completeApproval','return','issue','updateQuotePrices','dispatch','deal','revision'])
function actForPackage(packageId: string, name: string, payload: any = {}): boolean {
 return run(() => {
  const target = resolvePackage(packageId)
  if (!target || target.projectId !== currentProject.id) throw Error('来源报价包已不存在')
  if (packageId !== state.id && !batchPackageIds.value.includes(packageId)) throw Error('该包不在本次处理范围内')
  if (!targetActions.has(name)) throw Error('此操作不支持指定报价包')
  if (target.archivedAt) throw Error('已归档报价包仅可查看')
  performAction(target, name, payload)
 })
}
function actBatch(name: string, payload: any = {}) {
 const ids = workflowPackages.value.map(pkg=>pkg.id)
 const results = ids.map(id => {
  const target = resolvePackage(id)
  const completed = !!target && (name === 'confirmSales' ? target.salesConfirmed === target.version : name === 'confirmTech' ? target.techConfirmed === target.version : name === 'submitTechnical' ? target.technicalExecution?.mode==='employee'&&target.technicalExecution.assignee===person.value&&target.technicalExecution.status==='submitted' : false)
  const ok = completed || actForPackage(id, name, payload)
  return {packageId:id, ok, reason:ok ? '已完成' : notice.value}
 })
 toast(results.map(result => `${resolvePackage(result.packageId)?.packageName} · ${resolvePackage(result.packageId)?.materialSummary?.sourceWorksheetName || '未分类'}：${result.reason}`).join('；'))
 return results
}
function assertBatchParsing(ids: string[]) {
 if (role.value !== '销售' || !useRolePermissionsStore().can(role.value,'inquiry.manage')) throw Error('当前角色没有资料解析权限')
 if (!ids.length || ids.some(id => !batchPackageIds.value.includes(id))) throw Error('本次处理范围已经变化')
 for (const id of ids) {
  const target = resolvePackage(id)
  if (!target || target.archivedAt || !['资料整理','并行协作'].includes(target.stage)) throw Error('所选包已进入下游或归档，不能重新解析')
  if (!canHandlePackageProcess(target,'dataParsing',person.value)) throw Error('所选包存在非本人负责的资料解析任务')
 }
}
function addBatchFiles(files: Package['files']) {
 return run(() => {assertBatchParsing(batchPackageIds.value);batchFiles.value=collectBatchFiles([{files:[...batchFiles.value,...files]} as Package])})
}
function loadBatchDemo() {
 return run(() => {
  assertBatchParsing(batchPackageIds.value)
  const files = batchPackageIds.value.flatMap(id => demoMaterialsForPackage(resolvePackage(id)!).map(file => ({...file,status:'待解析 · 演示技术资料'})))
  batchFiles.value=collectBatchFiles([{files:[...batchFiles.value,...files]} as Package])
  toast('已统一载入所选包的演示资料，重复文件只展示一次')
 })
}
function parseBatch(ids: string[], session: number, files: Package['files']) {
 return run(() => {
  if(session !== batchSession.value || ids.join('|') !== batchPackageIds.value.join('|'))throw Error('解析已取消或处理范围已经变化')
  assertBatchParsing(ids)
  if(!files.length)throw Error('请先上传资料')
  ids.forEach((id,index) => performAction(resolvePackage(id)!, 'start', {demoPrefill:index>0,batchFiles:files}))
  batchFiles.value=files.map(file=>({...file,status:'已生成演示结果'}))
  toast(`已为全部 ${ids.length} 个报价包生成货物项；仅首包保留待确认项，其余包已预填完整`)
 })
}

const workflowPackages = computed(() => technicalWorkflowScope(
 (batchPackageIds.value.length ? batchPackageIds.value.map(resolvePackage).filter((pkg):pkg is Package=>!!pkg) : [state]),role.value,person.value))
function assignTechnicalPackages(ids:string[], payload:{mode:'director'|'employee';assignee?:string}) {
 return run(() => {
  if(role.value!=='技术'||!useRolePermissionsStore().can(role.value,'technical.manage'))throw Error('当前角色没有指派权限')
  const targets=technicalAssignmentTargets(workflowPackages.value,ids,person.value)
  if(payload.mode!=='director'&&payload.mode!=='employee')throw Error('请选择有效的指派方式')
  if(payload.mode==='employee'&&!useUsersStore().peopleForRole('技术').some(label=>label===payload.assignee&&!technicalDirectors.includes(label)))throw Error('请选择已启用的技术员工')
  targets.forEach(target=>performAction(target,'assignTechnical',payload))
  toast(`已为 ${targets.length} 个报价包保存技术指派，其余包保持不变`)
 })
}
