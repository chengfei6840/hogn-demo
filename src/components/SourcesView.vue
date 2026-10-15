<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {useWorkspace} from '@/domain/store'
import {demoMaterialsForPackage} from '@/domain/demo-materials'
import {Button} from '@/components/ui/button'
import AppIcon from './AppIcon.vue'
import ParseRunPanel from './ParseRunPanel.vue'
import StatusBadge from './StatusBadge.vue'
import { canHandlePackageProcess, packageProcessParticipant, type Package } from '@/domain/model'
const {package:p,project,role,person,act,page}=useWorkspace()
const accessDenied = computed(() => role.value === '销售' && !canHandlePackageProcess(p as Package, 'dataParsing', person.value))
const parsingOwner = computed(() => packageProcessParticipant(p as Package, 'dataParsing'))
// runIndex 由解析动画回传：-1 未运行，0..n-1 正在解析第 n 份，n 表示全部完成。
const runIndex=ref(-1)
// 清单行可点选，选中行在右栏查看该文件的解析过程记录。
const selected=ref(-1)
// 左栏「开始解析」点击后弹出确认框，确认由右栏面板承接。
const startOpen=ref(false)
const canEdit=computed(()=>role.value==='销售'&&!accessDenied.value&&['资料整理','并行协作'].includes(p.stage))
const parsed=computed(()=>p.items.length>0)
const demoBundle=computed(()=>demoMaterialsForPackage(p as Package))
const demoLoaded=computed(()=>!!demoBundle.value.length&&demoBundle.value.every(file=>p.files.some(existing=>existing.name===file.name)))
const running=computed(()=>runIndex.value>=0&&runIndex.value<p.files.length)
const fileState=computed(()=>{
 const n=p.files.length
 return (i:number)=>runIndex.value<0||runIndex.value>n?'' : runIndex.value===n||i<runIndex.value?'已完成' : i===runIndex.value?'解析中' : '等待'
})
function files(e:Event){const list=Array.from((e.target as HTMLInputElement).files||[]);act('files',list.map(f=>({name:f.name})));(e.target as HTMLInputElement).value=''}
// 文件减少或清空时收敛选中行；解析完成后默认展示最后一份文件的记录。
watch(()=>[runIndex.value,p.files.length] as const,([r,n])=>{if(!n)selected.value=-1;else if(r>=n||selected.value>=n)selected.value=n-1})
</script>
<template><section v-if="accessDenied" class="panel parse-access-denied" aria-live="polite"><AppIcon name="lock-key" :size="40"/><h2>你无权访问该页面</h2><p>本包“资料解析”已指定由 {{ parsingOwner }} 处理。</p><p>当前人员：{{ person }}</p></section><section class="panel parse-block">
  <div class="parse-intake"><h2>需求资料输入</h2><p class="muted">通过文件上传添加资料，保存后统一进入下方资料清单</p><p v-if="project.materialListFile" class="material-inherited">项目物料清单已自动带入：{{project.materialListFile.name}}</p><div class="parse-intake-actions"><label class="upload-label"><AppIcon name="folder-simple-plus" :size="17"/>文件上传<input type="file" multiple :disabled="!canEdit||running" @change="files" aria-label="选择询价资料"/></label><Button variant="outline" :disabled="!canEdit||running||!demoBundle.length||demoLoaded" @click="act('demoFiles')"><AppIcon name="folder-simple-plus"/>{{demoLoaded?'已载入演示资料':'载入演示资料'}}</Button><Button :disabled="!canEdit||running||!p.files.length" @click="startOpen=true"><AppIcon name="play"/>{{parsed?'重新解析':'开始解析'}}</Button></div><p v-if="!demoBundle.length" class="muted">当前包暂无对应的演示技术资料。可返回报价包列表选择包1等已有资料的包进行体验。</p><p v-if="parsed &amp;&amp; canEdit" class="muted">重新解析将重建演示货物项并清除当前版本的销售、技术确认，请在弹窗中确认后继续。</p></div>
  <ParseRunPanel v-model:run-index="runIndex" v-model:selected="selected" v-model:confirming="startOpen" :files="p.files" :parsed="parsed" :package-label="`${p.packageName}（${p.packageNo}）`" @done="act('start')"/>
  <div class="parse-list"><div class="panel-heading"><h2>资料清单 <span class="count">{{p.files.length}}</span></h2><StatusBadge v-if="p.files.length" :text="running?'解析中':parsed?'已解析':'待解析'"/></div><div v-if="!p.files.length" class="parse-dropzone"><AppIcon name="folder-open" :size="22"/><p>点击上方「文件上传」或「载入演示资料」添加资料</p></div><template v-else><button v-for="(f,n) in p.files" :key="n" type="button" class="file-row parse-file-row" :class="{active:selected===n}" :aria-pressed="selected===n" @click="selected=n"><span class="parse-file-tile"><AppIcon :name="f.type==='ZIP'?'file-zip':'file-text'" :size="17"/></span><div class="grow"><b>{{f.name}}</b><small>{{f.type}} · 资料批次 B01</small></div><StatusBadge :text="fileState(n)||f.status"/></button><small class="parse-local-note">仅在本机演示；文件不会发送到外部服务</small></template></div>
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
