<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import {useWorkspace} from '@/domain/store'
import {demoMaterialsForPackage} from '@/domain/demo-materials'
import {Button} from '@/components/ui/button'
import AppIcon from './AppIcon.vue'
import ParseRunPanel from './ParseRunPanel.vue'
import { packageCategory } from '@/domain/batch-packages'
import StatusBadge from './StatusBadge.vue'
import { canHandlePackageProcess, packageProcessParticipant, type Package } from '@/domain/model'
const {package:p,project,packages,batchPackageIds,batchFiles,batchSession,parseBatch,loadBatchDemo,addBatchFiles,role,person,act,page,workflowBusy}=useWorkspace()
const isBatch=computed(()=>batchPackageIds.value.length>0)
const targets=computed(()=>isBatch.value?batchPackageIds.value.map(id=>packages.value.find(pkg=>pkg.id===id)).filter((pkg):pkg is Package=>!!pkg):[p as Package])
const inputFiles=computed(()=>isBatch.value?batchFiles.value:p.files)
const accessDenied=computed(()=>role.value!=='销售'||targets.value.some(pkg=>!canHandlePackageProcess(pkg,'dataParsing',person.value)))
const parsingOwner=computed(()=>packageProcessParticipant(p as Package,'dataParsing'))
const runIndex=ref(-1),selected=ref(-1),startOpen=ref(false)
const canEdit=computed(()=>!accessDenied.value&&targets.value.every(pkg=>!pkg.archivedAt&&['资料整理','并行协作'].includes(pkg.stage)))
const parsed=computed(()=>targets.value.length>0&&targets.value.every(pkg=>pkg.items.length>0))
const demoBundle=computed(()=>targets.value.flatMap(pkg=>demoMaterialsForPackage(pkg)))
const demoLoaded=computed(()=>!!demoBundle.value.length&&demoBundle.value.every(file=>inputFiles.value.some(existing=>existing.name===file.name)))
const running=computed(()=>runIndex.value>=0&&runIndex.value<=inputFiles.value.length)
const packageLabel=computed(()=>`${targets.value.length} 个报价包 · ${new Set(targets.value.map(pkg=>packageCategory(pkg,project.materialWorksheets||[]))).size} 个类别`)
const fileState=computed(()=>{
 const n=inputFiles.value.length
 return (i:number)=>runIndex.value<0||runIndex.value>n?'':runIndex.value===n||i<runIndex.value?'已完成':i===runIndex.value?'解析中':'等待'
})
let runContext:{ids:string[];session:number;files:Package['files']}|undefined
watch(startOpen,open=>{if(open)runContext={ids:[...batchPackageIds.value],session:batchSession.value,files:JSON.parse(JSON.stringify(inputFiles.value))}})
function completeParsing(){
 if(isBatch.value&&runContext)parseBatch(runContext.ids,runContext.session,runContext.files)
 else if(!runContext?.ids.length)act('start')
 runIndex.value=-1
}
function files(event:Event){
 const input=event.target as HTMLInputElement
 if(canEdit.value&&!running.value){
  const list=Array.from(input.files||[])
  if(isBatch.value)addBatchFiles(list.map(file=>({name:file.name,type:file.name.split('.').pop()?.toUpperCase()||'文件',status:'待解析 · 统一上传资料'})))
  else act('files',list.map(file=>({name:file.name})))
 }
 input.value=''
}
function loadDemo(){if(isBatch.value)loadBatchDemo();else act('demoFiles')}
watch(()=>[runIndex.value,inputFiles.value.length] as const,([r,n])=>{if(!n)selected.value=-1;else if(r>=n||selected.value>=n)selected.value=n-1})
watch(runIndex,value=>{workflowBusy.value=value>=0&&value<=inputFiles.value.length},{immediate:true})
watch(batchSession,()=>{runIndex.value=-1;startOpen.value=false;runContext=undefined})
onUnmounted(()=>{workflowBusy.value=false;runContext=undefined})
</script>
<template><section v-if="accessDenied" class="panel parse-access-denied" aria-live="polite"><AppIcon name="lock-key" :size="40"/><h2>你无权访问该页面</h2><p>本包“资料解析”已指定由 {{ parsingOwner }} 处理。</p><p>当前人员：{{ person }}</p></section><section v-else class="panel parse-block">
  <div class="parse-intake"><h2>需求资料输入</h2><p class="muted">统一上传本次处理所需资料，系统按所选包的信息匹配解析范围</p><p v-if="project.materialListFile" class="material-inherited">项目物料清单已自动带入：{{project.materialListFile.name}}</p><div class="parse-intake-actions"><label class="upload-label"><AppIcon name="folder-simple-plus" :size="17"/>文件上传<input type="file" multiple :disabled="!canEdit||running" @change="files" aria-label="选择询价资料"/></label><Button variant="outline" :disabled="!canEdit||running||!demoBundle.length||demoLoaded" @click="loadDemo"><AppIcon name="folder-simple-plus"/>{{demoLoaded?'已载入演示资料':'载入演示资料'}}</Button><Button :disabled="!canEdit||running||!inputFiles.length" @click="startOpen=true"><AppIcon name="play"/>{{parsed?'重新解析':'开始解析'}}</Button></div><p v-if="!demoBundle.length" class="muted">所选范围暂无额外演示技术资料，可统一上传文件后解析。</p><p v-if="parsed &amp;&amp; canEdit" class="muted">重新解析将重建本次所选包的演示货物项，并清除对应版本确认；仅首包保留待确认项，其余包预填完整。</p></div>
  <ParseRunPanel v-model:run-index="runIndex" v-model:selected="selected" v-model:confirming="startOpen" :files="inputFiles" :parsed="parsed" :package-label="packageLabel" :packages="targets" :sheets="project.materialWorksheets||[]" @done="completeParsing"/>
  <div class="parse-list"><div class="panel-heading"><h2>资料清单 <span class="count">{{inputFiles.length}}</span></h2><StatusBadge v-if="inputFiles.length" :text="running?'解析中':parsed?'已解析':'待解析'"/></div><div v-if="!inputFiles.length" class="parse-dropzone"><AppIcon name="folder-open" :size="22"/><p>点击上方「文件上传」或「载入演示资料」添加资料</p></div><template v-else><button v-for="(f,n) in inputFiles" :key="n" type="button" class="file-row parse-file-row" :class="{active:selected===n}" :aria-pressed="selected===n" @click="selected=n"><span class="parse-file-tile"><AppIcon :name="f.type==='ZIP'?'file-zip':'file-text'" :size="17"/></span><div class="grow"><b>{{f.name}}</b><small>{{f.type}} · 资料批次 B01</small></div><StatusBadge :text="fileState(n)||f.status"/></button><small class="parse-local-note">仅在本机演示；文件不会发送到外部服务</small></template></div>
  </section>
  <div class="parse-foot"><Button :disabled="!parsed" @click="page='collaboration'">进入需求确认<AppIcon name="arrow-right"/></Button></div>
 </template>
<style scoped>
.parse-block{display:grid;grid-template-columns:minmax(0,1.62fr) minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);flex:1;min-height:420px;margin-bottom:0}
.parse-intake{grid-column:1;grid-row:1;padding:20px 23px;border-bottom:1px solid #eef0f4}
.material-inherited{margin:8px 0 0;color:#267053;font-size:12px;overflow-wrap:anywhere}
.parse-intake-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:16px}
.parse-intake-actions>button:last-child{margin-left:auto}
.upload-label{display:inline-flex;align-items:center;gap:7px}
.parse-side{grid-column:2;grid-row:1/3;border-left:1px solid #eef0f4}
.parse-list{grid-column:1;grid-row:2;display:flex;flex-direction:column;min-width:0;overflow-y:auto}
.parse-list .file-row{padding:13px 23px;gap:12px}
.parse-dropzone{flex:1;min-height:180px;margin:22px 23px 23px;border:1px dashed #cfdae5;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:11px;color:#8b96a3;text-align:center}
.parse-dropzone p{margin:0;font-size:13px}
.parse-file-row{width:100%;text-align:left;font:inherit;color:inherit;background:#fff;border:0;border-bottom:1px solid #edf0f4;cursor:pointer}
.parse-file-row:hover{background:#fafcfe}
.parse-file-row.active,.parse-file-row.active:hover{background:#f1f7fb;box-shadow:inset 3px 0 #064975}
.parse-file-tile{width:32px;height:32px;display:grid;place-items:center;border-radius:8px;background:#f8fafc;border:1px solid #e4eaf0;color:#5b7d99;flex-shrink:0}
.parse-local-note{display:block;padding:12px 23px}
.parse-foot{display:flex;justify-content:flex-end;flex-shrink:0;margin-top:22px}
@media(max-width:1024px){.parse-block{grid-template-columns:1fr;grid-template-rows:auto auto auto}.parse-intake,.parse-list,.parse-side{grid-column:1}.parse-intake{grid-row:1}.parse-side{grid-row:2;border-left:0;border-bottom:1px solid #eef0f4}.parse-list{grid-row:3}}
.parse-access-denied{min-height:360px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;color:#587083}.parse-access-denied :deep(svg){color:#b7791f}.parse-access-denied h2{margin:6px 0 0;color:#18324a;font-size:22px}.parse-access-denied p{margin:0}.parse-access-denied p:last-child{font-size:13px;color:#7a8d9d}:global(body:has(.parse-access-denied) .parse-block),:global(body:has(.parse-access-denied) .parse-foot){display:none}
</style>
