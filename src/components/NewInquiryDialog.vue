<script setup lang="ts">
import { computed, shallowRef, watch, onBeforeUnmount } from 'vue'
import { useWorkspace } from '@/domain/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import AppIcon from './AppIcon.vue'
import AppSelect from './AppSelect.vue'
import FormDialog from './FormDialog.vue'
import { defaultStageOperators, useWorkflowStore, type StageOperatorKey } from '@/stores/workflow'
import { orderedTasks } from '@/domain/workflow-design'
import { defaultPackageProcessParticipants, rolePeople, technicalDirectors, type MaterialPackageSummary, type PackageProcessParticipants } from '@/domain/model'
import { readMaterialList } from '@/domain/material-list'
import { useUsersStore } from '@/stores/users'
const { package: pkg, project, role, person, act, intakeOpen, intakeMode } = useWorkspace()
const workflowStore=useWorkflowStore()
const usersStore=useUsersStore()
const isProjectMode = computed(() => intakeMode.value === 'project')
const isPackageMode = computed(() => intakeMode.value === 'package')
const isProjectForm = computed(() => isProjectMode.value || intakeMode.value === 'editProject')
const isPackageForm = computed(() => isPackageMode.value || intakeMode.value === 'editPackage')
const createdOpen = shallowRef(false)
const createdPackageCount = shallowRef(0)
const materialListFile = shallowRef<{name:string;size:number}|null>(null)
const materialListPackages = shallowRef<MaterialPackageSummary[]>([])
const materialListLoading = shallowRef(false)
const materialListError = shallowRef('')
const materialInput = shallowRef<HTMLInputElement|null>(null)
const name = shallowRef('')
const customer = shallowRef('')
const region = shallowRef('')
const gridType = shallowRef<'国网'|'南网'>('国网')
const voltageLevel = shallowRef('')
const packageName = shallowRef('')
const packageNo = shallowRef('')
const salesOwner=shallowRef('')
const techOwner=shallowRef('')
const financeOwner=shallowRef('')
const approvalParticipants = shallowRef<Record<string,string>>({})
const processParticipants = shallowRef<PackageProcessParticipants>({ ...defaultPackageProcessParticipants })
const approvalTasks = computed(()=>workflowStore.activeRecord ? orderedTasks(workflowStore.activeRecord.graph) : [])
const processCards = [
 {key:'dataParsing' as const,label:'资料解析',role:'销售' as const,hint:'负责上传资料并发起解析'},
 {key:'salesConfirmation' as const,label:'销售需求确认',role:'销售' as const,hint:'负责确认需求和报价范围'},
 {key:'technicalConfirmation' as const,label:'技术总监确认',role:'技术' as const,hint:'总监确认技术员工提交的结果并推进流程'},
 {key:'costCalculation' as const,label:'成本核算与方案选择',role:'财务' as const,hint:'核对成本、匹配方案并完成整包核价'},
 {key:'approvalIssuance' as const,label:'审批签发',role:'财务' as const,hint:'按启用流程完成审批并签发报价'},
 {key:'salesExternal' as const,label:'销售外发',role:'销售' as const,hint:'向客户发送已签发报价并登记外发'},
 {key:'dealTracking' as const,label:'成交追踪',role:'销售' as const,hint:'记录客户跟进、议价结果和成交归档'},
]
function processPeopleFor(card:{key:string;role?:keyof typeof rolePeople}) {
 if(card.key==='technicalConfirmation')return technicalDirectors
 const key = card.key as StageOperatorKey
 return [...new Set([...(card.role ? usersStore.peopleForRole(card.role) || [] : []), processParticipants.value[key] || '', workflowStore.stageOperators[key] || ''].filter(Boolean))]
}
function peopleForTask(task:{properties:{role:string;assignee?:string}}){
 const taskRole=task.properties.role as keyof typeof rolePeople
 return [...new Set([...(usersStore.peopleForRole(taskRole)||[]),task.properties.assignee||''].filter(Boolean))]
}
const files = shallowRef<{ name: string; size: number }[]>([])
const demoMaterialName='货物清单_0711-26OTL06821011_一般线路金具与防舞金具20260608_145155_721.xlsx'
async function chooseMaterial(event:Event){
 const input=event.target as HTMLInputElement
 const file=input.files?.[0]
 input.value=''
 if(!file)return
 await loadMaterialFile(async()=>file)
}
async function loadDemoMaterial(){
 await loadMaterialFile(async()=>{
  const response=await fetch(`${import.meta.env.BASE_URL}demo-material-list.xlsx`)
  if(!response.ok)throw new Error('演示文档载入失败，请稍后重试或手动选择物料清单')
  return new File([await response.blob()],demoMaterialName,{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
 })
}
async function loadMaterialFile(getFile:()=>Promise<File>){
 if(materialListLoading.value)return
 materialListLoading.value=true
 materialListError.value=''
 try{
  const file=await getFile()
  const summaries=await readMaterialList(file)
  materialListFile.value={name:file.name,size:file.size}
  materialListPackages.value=summaries
 }catch(error){
  materialListFile.value=null
  materialListPackages.value=[]
  materialListError.value=error instanceof Error?error.message:'物料清单读取失败，请检查文件后重试'
 }finally{materialListLoading.value=false}
}
const fileInput = shallowRef<HTMLInputElement | null>(null)
const dragging = shallowRef(false)
function addFiles(list: File[]) { files.value = [...files.value, ...list.map(file => ({ name: file.name, size: file.size }))] }
function drop(event: DragEvent) { dragging.value = false; if(editable.value) addFiles(Array.from(event.dataTransfer?.files || [])) }
function sizeLabel(bytes:number) { return bytes < 1024 ? bytes+' B' : bytes < 1048576 ? (bytes/1024).toFixed(1)+' KB' : (bytes/1048576).toFixed(1)+' MB' }
function fileIcon(name:string) { return /\.zip$/i.test(name) ? 'file-zip' : /\.xlsx?$/i.test(name) ? 'file-text' : /\.pdf$/i.test(name) ? 'file-text' : 'file-text' }
const editable = computed(() => role.value === '销售' && (isProjectForm.value || isPackageForm.value || ['资料整理', '并行协作'].includes(pkg.stage)))
const inPackageEditMode = computed(() => isPackageMode.value && pkg.id && ['资料整理', '并行协作'].includes(pkg.stage))
watch(intakeOpen, open => {
  if (open) {
    if (isProjectForm.value) {
      name.value = isProjectMode.value ? '' : project.name
      customer.value = isProjectMode.value ? '' : project.customer
      region.value = isProjectMode.value ? '' : project.region || ''
      gridType.value = isProjectMode.value ? '国网' : project.gridType || '国网'
      salesOwner.value = isProjectMode.value ? person.value : project.salesOwner
      techOwner.value = isProjectMode.value ? (technicalDirectors.find(owner=>usersStore.peopleForRole('技术').includes(owner)) || '') : project.techOwner
      financeOwner.value = isProjectMode.value ? (usersStore.peopleForRole('财务')[0] || '') : project.financeOwner
      materialListFile.value = isProjectMode.value ? null : project.materialListFile || null
      materialListPackages.value = []
      materialListError.value = ''
    } else if (isPackageForm.value) {
      packageName.value = isPackageMode.value ? '' : pkg.packageName
      packageNo.value = isPackageMode.value ? '' : pkg.packageNo || ''
      voltageLevel.value = isPackageMode.value ? '' : pkg.voltageLevel || ''
      files.value = []
      const signer = approvalTasks.value.find(task => task.properties.action === 'issue')
      processParticipants.value = { ...defaultPackageProcessParticipants, ...defaultStageOperators, ...workflowStore.stageOperators, dataParsing:project.salesOwner||person.value, salesConfirmation:project.salesOwner||person.value, technicalConfirmation:project.techOwner||technicalDirector, costCalculation:project.financeOwner||workflowStore.stageOperators.costCalculation, approvalIssuance:project.financeOwner||signer?.properties.assignee||workflowStore.stageOperators.approvalIssuance, salesExternal:project.salesOwner||person.value, dealTracking:project.salesOwner||person.value, ...(isPackageMode.value ? {} : pkg.processParticipants) }
      approvalParticipants.value = Object.fromEntries(approvalTasks.value.map(task=>[task.id,isPackageMode.value ? (project.financeOwner||task.properties.assignee||'') : pkg.approvalFlowSnapshot?.tasks.find(node=>node.nodeId===task.id)?.assignee||task.properties.assignee||'']))
    } else {
      name.value = project.name
      customer.value = project.customer
      region.value = project.region || ''
      gridType.value = project.gridType || '国网'
      packageName.value = pkg.packageName
      packageNo.value = pkg.packageNo || ''
      voltageLevel.value = pkg.voltageLevel || ''
      files.value = []
    }
  }
})
function choose(event: Event) {
 const input = event.target as HTMLInputElement
 addFiles(Array.from(input.files || []))
 input.value = ''
}
const processing = shallowRef(false)
const processingStep = shallowRef(0)
const steps = ['登记询价资料', '模拟提取文件内容', '整理货物项与关联资料', '生成协作结果与风险提示']
const progress = computed(() => Math.min(100, Math.round((processingStep.value + 1) / (steps.length + 1) * 100)))
const dialogOpen = computed({ get: () => intakeOpen.value, set: value => { if (!processing.value) intakeOpen.value = value } })
let progressTimer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(progressTimer))
function advanceProcessing() {
 processingStep.value += 1
 if (processingStep.value < steps.length) {
  progressTimer = setTimeout(advanceProcessing, 700)
 } else {
  progressTimer = setTimeout(() => {
   const completed = act('start')
   processing.value = false
   if (completed) intakeOpen.value = false
  }, 400)
 }
}
function submit(parse: boolean) {
 if (processing.value || !editable.value) return

 if (isProjectMode.value) {
  createdPackageCount.value = materialListPackages.value.length
  if (!act('new', { name: name.value, customer: customer.value, region: region.value, gridType: gridType.value, salesOwner:salesOwner.value, techOwner:techOwner.value, financeOwner:financeOwner.value, materialListFile: materialListFile.value, materialPackages: materialListPackages.value })) return
  intakeOpen.value = false
  createdOpen.value = true
  return
 }
 if (intakeMode.value === 'editProject') {
  if (act('editProject',{name:name.value,customer:customer.value,region:region.value,gridType:gridType.value})) intakeOpen.value=false
  return
 }

 if (isPackageMode.value) {
  // 创建包模式：需要包名称
  if (!act('newPackage', { packageName: packageName.value, packageNo: packageNo.value, voltageLevel: voltageLevel.value, processParticipants: { dataParsing: person.value, salesConfirmation: person.value, ...processParticipants.value }, approvalParticipants: approvalParticipants.value })) return
  intakeOpen.value = false
  return
 }
 if (intakeMode.value === 'editPackage') {
  if (act('editPackage',{packageName:packageName.value,packageNo:packageNo.value,voltageLevel:voltageLevel.value,processParticipants:processParticipants.value,approvalParticipants:approvalParticipants.value})) intakeOpen.value=false
  return
 }

 // 包编辑模式：添加文件
 if (files.value.length) {
  if (!act('files', files.value)) return
  files.value = []
 }
 if (!parse) { intakeOpen.value = false; return }
 processingStep.value = 0
 processing.value = true
 progressTimer = setTimeout(advanceProcessing, 700)
}
const canSubmit = computed(() => {
  if (!editable.value) return false
  if (isProjectMode.value) return !!name.value.trim() && !!salesOwner.value && !!techOwner.value && !!financeOwner.value && !!materialListFile.value && materialListPackages.value.length > 0 && !materialListLoading.value
  if (intakeMode.value==='editProject') return !!name.value.trim()
  if (isPackageForm.value) return !!packageName.value.trim()
  return files.value.length > 0 || (inPackageEditMode.value && pkg.files.length > 0)
})
</script>
<template>
 <Dialog v-model:open="dialogOpen"><DialogContent class="inquiry-dialog" :class="{'is-processing':processing,'is-package-mode':isPackageForm}" @escape-key-down="processing && $event.preventDefault()" @interact-outside="processing && $event.preventDefault()">
  <DialogHeader class="inquiry-header"><div class="inquiry-heading-icon"><AppIcon name="folder-simple-plus" :size="26"/></div><div><p class="inquiry-eyebrow">国网金具串 · 项目询价</p><DialogTitle class="inquiry-title">{{isProjectMode?'新建项目':intakeMode==='editProject'?'编辑项目':isPackageMode?'新建报价包':intakeMode==='editPackage'?'编辑报价包':'包资料'}}</DialogTitle><DialogDescription class="inquiry-description">{{isProjectMode?'填写项目信息并上传物料清单，系统按清单中的报价包创建包并提取汇总信息。':isPackageMode?'在当前项目下创建新的报价包。':isProjectForm?'修改项目基础信息。':isPackageForm?'修改包信息与流程负责人。':'查看原始资料，补充文件后继续核对。'}}</DialogDescription></div></DialogHeader>
  <section v-if="processing" class="parse-progress" aria-label="演示解析进度" aria-busy="true">
   <div class="parse-progress-symbol"><AppIcon :name="processingStep===steps.length?'check':'spinner-gap'" :size="36" :class="{'parse-spinner':processingStep<steps.length}"/></div>
   <h2>{{processingStep===steps.length?'资料整理完成':'正在处理询价资料'}}</h2><p>{{project.name}} · {{pkg.files.length}} 份资料</p>
   <div class="parse-progress-track" role="progressbar" aria-label="演示处理完成比例" :aria-valuenow="progress" :aria-valuemin="0" :aria-valuemax="100"><span :style="{width:progress+'%'}"/></div>
   <div class="parse-progress-caption" role="status" aria-live="polite"><span>{{processingStep===steps.length?'即将进入询价协作':steps[processingStep]}}</span><b>{{progress}}%</b></div>
   <ol class="parse-steps"><li v-for="(step,index) in steps" :key="step" :class="{done:index<processingStep,current:index===processingStep}"><span><AppIcon v-if="index<processingStep" name="check" :size="14"/><template v-else>{{index+1}}</template></span>{{step}}</li></ol>
   <small>演示过渡使用预置结果，不代表真实解析服务进度。</small>
  </section>
  <div v-else class="inquiry-content">
   <!-- 创建项目模式：项目基础信息 -->
   <section v-if="isProjectForm" class="inquiry-basics"><div class="inquiry-section-heading"><span>01</span><h3>项目信息</h3></div><label for="inquiry-name">项目名称 <span class="required-label">必填</span><Input id="inquiry-name" v-model="name" placeholder="例如：新疆750千伏"/></label><label for="inquiry-customer">客户单位<Input id="inquiry-customer" v-model="customer" placeholder="填写客户或需求单位"/></label><label>项目地区<Input v-model="region" placeholder="例如：新疆"/></label><label>电网类型<AppSelect v-model="gridType" label="电网类型" :options="['国网','南网']"/></label><div v-if="isProjectMode" class="project-owners"><div class="inquiry-section-heading"><span>02</span><div><h3>项目负责人</h3><p>创建后，项目及新建报价包会按这里选择的人员进入待办。</p></div></div><div class="project-owner-grid"><label>销售负责人<AppSelect v-model="salesOwner" label="选择销售负责人" :options="usersStore.peopleForRole('销售')"/></label><label>技术负责人（总监）<AppSelect v-model="techOwner" label="选择技术负责人" :options="technicalDirectors.filter(owner=>usersStore.peopleForRole('技术').includes(owner))"/></label><label>财务负责人<AppSelect v-model="financeOwner" label="选择财务负责人" :options="usersStore.peopleForRole('财务')"/></label></div></div><div class="material-upload"><div class="inquiry-section-heading"><span>02</span><h3>物料清单 Excel</h3><small v-if="isProjectMode">必传 · 读取报价包汇总</small></div><input ref="materialInput" class="sr-only" type="file" accept=".xlsx" aria-label="选择物料清单 Excel" @change="chooseMaterial"/><div v-if="isProjectMode" class="material-upload-actions"><Button type="button" variant="outline" :disabled="materialListLoading" @click="materialInput?.click()"><AppIcon :name="materialListLoading?'spinner-gap':'folder-simple-plus'" :class="{'parse-spinner':materialListLoading}"/>{{materialListLoading?'正在读取清单':'选择物料清单'}}</Button><Button type="button" variant="outline" :disabled="materialListLoading" @click="loadDemoMaterial"><AppIcon name="file-text"/>载入演示文档</Button></div><p v-if="materialListFile"><AppIcon name="file-text"/>{{materialListFile.name}}<span>已识别 {{materialListPackages.length}} 个报价包</span><Button v-if="isProjectMode" variant="ghost" size="sm" @click="materialListFile=null;materialListPackages=[];materialListError=''">移除</Button></p><p v-if="materialListError" class="material-list-error" role="alert">{{materialListError}}</p><p v-else-if="!materialListFile" class="muted">上传后识别清单中的报价包，并汇总技术编码、数量、工程和交货地点。</p><ul v-if="materialListPackages.length" class="material-sheet-preview"><li v-for="summary in materialListPackages.slice(0,5)" :key="summary.sheetName"><b>{{summary.packageName}}<template v-if="summary.packageNo"> · {{summary.packageNo}}</template></b><span>{{summary.voltageLevels.join('、')||'电压待确认'}} · {{summary.itemCount}} 项 · {{summary.locations.length}} 个交货点</span></li><li v-if="materialListPackages.length>5" class="muted">还有 {{materialListPackages.length-5}} 个包</li></ul></div></section>
   <!-- 创建包模式：简化表单 -->
   <section v-else-if="isPackageForm" class="inquiry-package-simple"><div class="inquiry-section-heading"><span>01</span><h3>报价包信息</h3></div><label class="package-name-field">报价包名称 <span class="required-label">必填</span><Input v-model="packageName" placeholder="例如：包11 · GW100"/></label><label>分包编号<Input v-model="packageNo" placeholder="例如：GW100"/></label><label>电压等级<Input v-model="voltageLevel" placeholder="例如：750千伏"/></label><div class="package-process-section"><div class="inquiry-section-heading"><span>02</span><div><h3>本包流程负责人</h3><p>修改负责人后，报价包会从原负责人的工作列表移至新负责人。</p></div></div><div class="process-card-grid"><article v-for="(card,index) in processCards" :key="card.key" class="process-card"><div class="process-card-heading"><span class="process-card-index">{{index+1}}</span><b>{{card.label}}</b></div><AppSelect v-model="processParticipants[card.key]" :label="'选择 '+card.label+' 负责人'" :options="processPeopleFor(card)"/><small>{{card.hint}}</small></article></div></div><div class="approval-participant-section"><div class="inquiry-section-heading"><span>03</span><div><h3>本包审批参与人</h3><p>默认使用当前启用流程，也可修改本包各节点处理人。</p></div></div><div v-if="!approvalTasks.length" class="participant-empty">当前没有启用的审批流程，请先到“审批与流程配置”启用流程。</div><div v-else class="participant-list"><article v-for="(task,index) in approvalTasks" :key="task.id" class="participant-row"><span class="participant-index">{{index+1}}</span><span class="participant-meta"><b>{{task.text}}</b><small>{{task.properties.action==='issue'?'最终签发':task.properties.condition==='chairman'?'按条件进入':'审批节点'}} · 默认 {{task.properties.assignee||'待配置'}}</small></span><AppSelect v-model="approvalParticipants[task.id]" :label="'选择 '+task.text+' 处理人'" :options="peopleForTask(task)"/></article></div></div></section>
   <!-- 包编辑模式：完整表单 -->
   <section v-else class="inquiry-upload" :class="{'has-files':files.length || pkg.files.length}"><div class="inquiry-section-heading"><span>01</span><h3>询价资料</h3><small>{{files.length+pkg.files.length}} 份文件</small></div>
    <input ref="fileInput" class="sr-only" tabindex="-1" type="file" multiple aria-label="选择询价资料" :disabled="!editable" @change="choose"/>
    <button v-if="role==='销售'" :disabled="!editable" type="button" class="inquiry-dropzone" :class="{dragging}" @click="fileInput?.click()" @dragover.prevent="dragging=true" @dragleave.prevent="dragging=false" @drop.prevent="drop"><span class="upload-symbol"><AppIcon name="folder-simple-plus" :size="30"/></span><b>{{dragging?'松开以添加文件':'拖拽资料到这里，或点击选择'}}</b><span>支持一次添加多份询价资料</span><div class="file-formats"><small>Excel</small><small>Word</small><small>PDF</small><small>ZIP</small></div></button>
    <div class="inquiry-file-list" aria-label="已添加资料"><template v-if="inPackageEditMode"><div v-for="(file,index) in pkg.files" :key="'saved'+index" class="inquiry-file"><AppIcon :name="fileIcon(file.name)" :size="25"/><div><b>{{file.name}}</b><small>{{file.status}}</small></div><span class="saved-label">已登记</span></div></template><div v-for="(file,index) in files" :key="index" class="inquiry-file"><AppIcon :name="fileIcon(file.name)" :size="25"/><div><b>{{file.name}}</b><small>{{sizeLabel(file.size)}} · 待登记</small></div><Button variant="ghost" size="sm" :aria-label="'移除 '+file.name" @click="files=files.filter((_,i)=>i!==index)"><AppIcon name="x" :size="16"/></Button></div><p v-if="!files.length && (!inPackageEditMode || !pkg.files.length)" class="inquiry-file-hint">可先保存包草稿，稍后继续添加资料。</p></div>
   </section>
  </div>
  <div class="inquiry-demo-note"><AppIcon name="info" :size="16"/><span>演示仅登记文件名，解析使用预置结果；真实服务尚未接入，ZIP处理未完成。</span></div>
  <footer v-if="!processing" class="inquiry-footer"><Button variant="ghost" @click="intakeOpen=false">取消</Button><div><Button v-if="role==='销售'" :disabled="!canSubmit" @click="submit(false)">{{isProjectMode?'创建项目':isPackageMode?'创建报价包':isProjectForm||isPackageForm?'保存修改':'保存资料'}}</Button><Button v-if="role==='销售' && !isProjectForm && !isPackageForm" :disabled="!canSubmit" @click="submit(true)">运行演示解析<AppIcon name="arrow-right" :size="16"/></Button><Button v-else-if="role!=='销售'" variant="outline" @click="intakeOpen=false">完成查看</Button></div></footer>
 </DialogContent></Dialog><FormDialog v-model="createdOpen" title="已为你新建所有包" :description="`项目已创建，已根据物料清单创建 ${createdPackageCount} 个报价包并提取汇总信息。物料清单已带入各包资料，上传其他资料后可继续解析。`"><Button @click="createdOpen=false">查看报价包</Button></FormDialog>
</template>
<style scoped>
:global(.inquiry-dialog){width:calc(100vw - 40px)!important;max-width:1280px!important;height:min(900px,92dvh);max-height:92dvh;display:flex!important;flex-direction:column;gap:0!important;padding:0!important;overflow:hidden;border-radius:16px!important;border:1px solid #dce4ec;box-shadow:0 24px 90px #132f4938}
:global(.inquiry-dialog.is-package-mode){max-width:1240px!important;height:min(860px,90dvh);max-height:90dvh}
.inquiry-header{padding:18px 28px!important;display:flex!important;flex-direction:row!important;gap:16px!important;text-align:left;align-items:center;border-bottom:1px solid #e8edf2;flex-shrink:0;background:#fbfdff}
.inquiry-heading-icon{width:52px;height:52px;display:grid;place-items:center;border:1px solid #d9e6ef;border-radius:14px;background:#edf5fa;color:#064975;flex-shrink:0}.inquiry-eyebrow{font-size:11px;color:#6c8395;margin:0 0 4px;letter-spacing:1px}.inquiry-title{font-size:23px!important;letter-spacing:0!important;color:#1d3446}.inquiry-description{margin:7px 0 0!important;font-size:12px!important;color:#758391!important}
.inquiry-content{display:flex;flex-direction:column;flex:1;overflow:auto;min-height:0}.inquiry-basics,.inquiry-package-info{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:16px 28px;background:#fafbfd;border-bottom:1px solid #e8edf2;flex-shrink:0}.inquiry-basics>.inquiry-section-heading,.inquiry-package-info>.inquiry-section-heading{grid-column:1/-1}
.inquiry-package-simple{padding:24px 28px;display:flex;flex-direction:column;gap:18px}.inquiry-package-simple .inquiry-section-heading{margin-bottom:0}.package-name-field{font-size:12px;position:relative;gap:8px;margin-bottom:0}.inquiry-package-simple>label{font-size:12px;position:relative;gap:8px;margin-bottom:0}.inquiry-package-simple>label input{height:40px;font-size:12px;box-shadow:none}.package-process-section,.approval-participant-section{display:flex;flex-direction:column;gap:12px;padding-top:16px;border-top:1px solid #e8edf2}.package-process-section .inquiry-section-heading,.approval-participant-section .inquiry-section-heading{align-items:flex-start}.package-process-section .inquiry-section-heading>div,.approval-participant-section .inquiry-section-heading>div{display:flex;flex-direction:column;gap:4px}.package-process-section h3,.approval-participant-section h3{margin:0}.package-process-section p,.approval-participant-section p{font-size:11px;color:#8393a0;margin:0}.process-card-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px}.process-card{display:flex;flex-direction:column;gap:7px;min-width:0;padding:10px;border:1px solid #e1e8ee;border-radius:8px;background:#fbfdff}.process-card.fixed{background:#f4f7f9}.process-card-heading{display:flex;align-items:flex-start;gap:6px;min-height:30px}.process-card-heading b{font-size:11px;line-height:1.35;color:#344a59}.process-card-index{display:grid;place-items:center;flex:none;width:20px;height:20px;border-radius:50%;background:#edf5fa;color:#29638c;font-size:9px;font-weight:700}.process-card small,.process-owner{color:#8393a0;font-size:9px;line-height:1.4}.process-card .app-select{width:100%;height:32px}.participant-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.participant-row{display:grid!important;grid-template-columns:24px minmax(0,1fr);align-items:start;gap:8px;padding:10px;border:1px solid #e1e8ee;border-radius:8px;background:#fbfdff;font-size:12px!important}.participant-row .app-select{grid-column:1/-1;height:34px}.participant-index{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#edf5fa;color:#29638c;font-size:10px;font-weight:700}.participant-meta{min-width:0}.participant-meta b,.participant-meta small{display:block}.participant-meta small{margin-top:3px;color:#8393a0;font-size:10px}.participant-empty{padding:12px;border-radius:8px;background:#fff8ed;color:#9a6b42;font-size:11px}
.inquiry-upload{padding:18px 28px;display:flex;flex-direction:column;flex:1;min-height:230px;gap:12px}.inquiry-section-heading{display:flex;align-items:center;gap:9px;margin-bottom:0}.inquiry-section-heading>span{font-size:10px;font-weight:700;color:#64849c;border:1px solid #dce6ee;border-radius:5px;padding:2px 6px}.inquiry-section-heading h3{font-size:14px;color:#253b4b}.inquiry-section-heading>small{margin-left:auto;font-size:11px}.inquiry-basics label,.inquiry-package-info label,.package-name-field,.package-no-field{font-size:12px;position:relative;gap:8px;margin-bottom:0}.required-label{position:absolute;right:0;top:0;font-size:10px;color:#9a6b42}.inquiry-basics input,.inquiry-package-info input,.package-name-field input,.package-no-field input{height:40px;font-size:12px;box-shadow:none}
.material-upload{grid-column:1/-1;display:flex;flex-direction:column;align-items:flex-start;gap:12px;padding:18px 0 4px;border-top:1px solid #e8edf2}.material-upload .inquiry-section-heading{width:100%}.material-upload p{display:flex;align-items:center;gap:8px;max-width:100%;margin:0;color:#42627a;font-size:12px;overflow-wrap:anywhere}.material-upload p .button{flex-shrink:0}
.material-upload .material-list-error{color:#b42318}.material-sheet-preview{display:grid;grid-template-columns:1fr 1fr;gap:6px 18px;width:100%;max-height:126px;overflow:auto;margin:0;padding:10px 13px;list-style:none;border:1px solid #e1e8ee;border-radius:7px;background:#fff}.material-sheet-preview li{display:flex;justify-content:space-between;gap:10px;min-width:0;font-size:11px}.material-sheet-preview li b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.material-sheet-preview li span{flex:none;color:#788594}.material-sheet-preview li.muted{justify-content:flex-start}.material-upload .parse-spinner{animation:parse-spin 1.2s linear infinite}@media(max-width:700px){.material-sheet-preview{grid-template-columns:1fr}.material-sheet-preview li{justify-content:flex-start;flex-direction:column;gap:2px}}
.inquiry-dropzone{width:100%;flex:1;min-height:150px;justify-content:center;border:1.5px dashed #bed0df;border-radius:12px;background:#f8fbfd;display:flex;flex-direction:column;align-items:center;gap:9px;padding:24px 10px;color:#34566e;transition:background .15s,border-color .15s}.inquiry-dropzone:hover,.inquiry-dropzone.dragging{border-color:#2672a4;background:#edf6fc}.upload-symbol{background:#eaf2f8;border:1px solid #dce9f2;border-radius:12px;padding:10px;color:#29638c;margin-bottom:2px}.inquiry-dropzone b{font-size:13px}.inquiry-dropzone>span:not(.upload-symbol){font-size:11px;color:#8393a0}.file-formats{display:flex;gap:6px;margin-top:3px}.file-formats small{border:1px solid #e0e7ec;border-radius:4px;padding:1px 7px;background:white;font-size:10px}.inquiry-file-list{overflow:auto;min-height:0;flex-shrink:0}.inquiry-upload.has-files .inquiry-dropzone{flex:0 0 auto;min-height:120px;padding:14px}.inquiry-upload.has-files .inquiry-file-list{flex:1;min-height:90px;overflow:auto}.inquiry-upload.has-files .upload-symbol{display:none}.inquiry-file{display:flex;align-items:center;gap:10px;border-bottom:1px solid #edf1f5;padding:10px 0;color:#537b98}.inquiry-file>div{flex:1;min-width:0}.inquiry-file b{display:block;overflow-wrap:anywhere;font-size:12px;color:#3d4f5d}.inquiry-file small{display:block;font-size:10px;margin-top:2px}.saved-label{font-size:10px;color:#708998}.inquiry-file-hint{font-size:11px;color:#94a0aa;text-align:center;margin:12px 0 0}.inquiry-demo-note{display:flex;gap:8px;align-items:center;padding:10px 28px;background:#f6f9fb;color:#7a8a98;font-size:11px;border-top:1px solid #e8edf2;flex-shrink:0}.inquiry-footer{display:flex;justify-content:space-between;align-items:center;padding:16px 28px;border-top:1px solid #e8edf2;background:white;flex-shrink:0}.inquiry-footer>div{display:flex;gap:10px}
@media(max-width:1100px){.process-card-grid{grid-template-columns:repeat(4,minmax(0,1fr))}.participant-list{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:700px){.inquiry-basics,.inquiry-package-info{grid-template-columns:1fr;gap:12px;padding:20px}.inquiry-upload,.inquiry-package-simple{padding:20px}.inquiry-header{padding:20px!important}.inquiry-footer{padding:14px 16px}.inquiry-demo-note{padding:10px 16px}.inquiry-heading-icon{width:40px;height:40px}.inquiry-title{font-size:20px!important}.package-form-row{grid-template-columns:1fr}.process-card-grid,.participant-list{grid-template-columns:1fr}}

.process-card-grid{display:flex;flex-wrap:nowrap;align-items:stretch;gap:8px;min-width:0;overflow-x:auto;padding-bottom:4px}
.process-card{flex:1 0 0;min-width:0;min-height:128px}
.process-card.fixed{position:static}
@media(max-width:1100px){.process-card{flex-basis:180px}}
@media(max-width:700px){.process-card{flex:0 0 100%;min-width:100%}}
:global(.inquiry-dialog.is-processing>button){display:none}
.parse-progress{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px;background:#fbfdff}.parse-progress-symbol{width:76px;height:76px;border-radius:22px;display:grid;place-items:center;color:#075580;background:#eaf4fb;border:1px solid #d8e8f3;margin-bottom:20px}.parse-progress h2{font-size:23px;margin-bottom:8px}.parse-progress>p{color:#7b8a97;font-size:13px;margin-bottom:24px}.parse-progress-track{width:min(540px,100%);height:7px;border-radius:8px;background:#e7eef4;overflow:hidden}.parse-progress-track span{display:block;height:100%;background:#146895;transition:width .45s ease;border-radius:8px}.parse-progress-caption{display:flex;justify-content:space-between;width:min(540px,100%);margin:10px 0 22px;color:#587489;font-size:12px}.parse-steps{list-style:none;margin:0 0 24px;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:14px 24px;width:min(540px,100%)}.parse-steps li{display:flex;align-items:center;gap:9px;color:#94a0aa;font-size:12px}.parse-steps li>span{display:grid;place-items:center;width:23px;height:23px;border:1px solid #dce5ed;border-radius:50%;font-size:10px}.parse-steps li.current{color:#075580;font-weight:600}.parse-steps li.current>span{background:#075580;color:white;border-color:#075580}.parse-steps li.done{color:#398571}.parse-steps li.done>span{background:#eaf6f0;border-color:#cfe8dc}.parse-progress>small{font-size:11px;color:#90a0ac}.parse-spinner{animation:parse-spin 1.2s linear infinite}@keyframes parse-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.parse-spinner{animation:none}.parse-progress-track span{transition:none}}@media(max-height:650px){.parse-progress{justify-content:flex-start;padding:20px}.parse-progress-symbol{width:46px;height:46px;margin-bottom:10px}.parse-progress>p{margin-bottom:12px}.parse-progress-caption{margin-bottom:12px}.parse-steps{margin-bottom:12px}}@media(max-width:500px){.parse-steps{grid-template-columns:1fr}}
.project-owners{grid-column:1/-1;display:flex;flex-direction:column;gap:10px;padding:14px 0;border-top:1px solid #e8edf2}.project-owners .inquiry-section-heading{align-items:flex-start}.project-owners .inquiry-section-heading>div{display:flex;flex-direction:column;gap:4px}.project-owners h3{margin:0}.project-owners p{margin:0;color:#8393a0;font-size:11px}.project-owner-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.project-owner-grid label{display:flex;flex-direction:column;gap:6px;font-size:12px;color:#526777}@media(max-width:700px){.project-owner-grid{grid-template-columns:1fr}}
.material-upload-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
</style>
