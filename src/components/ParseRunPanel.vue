<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import {Button} from '@/components/ui/button'
import AppIcon from './AppIcon.vue'
import FormDialog from './FormDialog.vue'
import PackageScopePopover from './workflow/PackageScopePopover.vue'
import type { Package, MaterialWorksheetMeta } from '@/domain/model'
type FileItem={name:string;type:string;status:string}
const props=defineProps<{files:FileItem[];parsed:boolean;packageLabel:string;packages:Package[];sheets:MaterialWorksheetMeta[]}>()
const emit=defineEmits<{done:[]}>()
// runIndex 回传解析进度：-1 未运行，0..n-1 正在解析第 n 份，n 表示全部完成。
const runIndex=defineModel<number>('runIndex',{default:-1})
// selected 由左侧清单点选回传：-1 未选中，右栏显示空态。
const selected=defineModel<number>('selected',{default:-1})

// 逐文件串行：每份 3 秒走完 6 个阶段，段边界按法拉第 10500ms 的比例等比缩放。
const PER_FILE=3000
const STAGES=[
 {name:'资料上传',start:0,end:400,wait:'等待文件上传与安全哈希存管校验',running:'正在接收文件并执行安全哈希校验…',done:'当前文件已完成安全存管与 SHA-256 签名校验'},
 {name:'文档转换',start:400,end:950,wait:'多格式转换；扫描件自动启动 OCR 增强',running:'正在进行 Word/PDF/Excel 版面转换与结构还原…',done:'文档转换完成，已生成标准化文本与图元流'},
 {name:'质量检查',start:950,end:1450,wait:'图文排版完整性校验，阻断乱码与截断',running:'正在检查字符编码、版面完整性与内容截断…',done:'质量检查通过，可进入结构化解析'},
 {name:'结构化解析',start:1450,end:2050,wait:'抽取电气与机械候选技术参数',running:'正在抽取电气、机械与商务候选参数，并绑定原文证据…',done:'结构化参数抽取完成，已绑定原文证据'},
 {name:'风险识别',start:2050,end:2550,wait:'规则引擎联合研判技术与商务阻断项',running:'正在执行规则比对、缺失项识别与冲突项检测…',done:'风险识别完成'},
 {name:'生成待确认参数',start:2550,end:PER_FILE,wait:'生成技术参数包，与原文高亮溯源',running:'正在生成该输入项的待确认参数与解析结果…',done:'当前输入项解析完成，结果已写入待确认参数区'},
]
// Package.files 不存文件大小，按类型给稳定展示值，仅用于展示，不写入数据。
const SIZE:Record<string,string>={'ZIP':'0.1 MB','Excel':'0.2 MB','Word':'0.3 MB','PDF':'0.4 MB'}
const STATUS_TEXT:Record<string,string>={completed:'已完成',in_progress:'处理中',waiting:'等待'}

const running=ref(false)
const elapsed=ref(0)
// 页面左栏「开始解析」按钮控制确认弹窗，这里双向绑定。
const confirming=defineModel<boolean>('confirming',{default:false})
let timer:ReturnType<typeof setInterval>|undefined
let handoff:ReturnType<typeof setTimeout>|undefined

const total=computed(()=>props.files.length)
const elapsedAll=computed(()=>total.value*PER_FILE)
const finished=computed(()=>running.value&&elapsed.value>=elapsedAll.value)
const currentIndex=computed(()=>Math.min(Math.max(total.value-1,0),Math.floor(elapsed.value/PER_FILE)))
const itemElapsed=computed(()=>elapsed.value-currentIndex.value*PER_FILE)
// 运行中段状态按当前文件计时推导；已完成记录整包视作全部阶段完成。
const stages=computed(()=>STAGES.map(s=>({...s,status:finished.value||!running.value?'completed':itemElapsed.value>=s.end?'completed':itemElapsed.value>=s.start?'in_progress':'waiting'})))
// 与法拉第同一口径：已完成段数 + 处理中段计 0.55，封顶 95%，跑完给 100%。
const progress=computed(()=>{
 if(!running.value)return 100
 if(finished.value)return 100
 const done=stages.value.filter(s=>s.status==='completed').length
 const run=stages.value.findIndex(s=>s.status==='in_progress')
 return Math.min(95,Math.round(((done+(run>=0?0.55:0))/STAGES.length)*100))
})
// 右栏三种状态：无资料、解析进行中、查看某份文件的解析记录。
const card=computed(()=>{
 if(running.value){
  const f=props.files[currentIndex.value]
  return {live:true,index:currentIndex.value,name:f?.name||'',type:f?.type||'',size:SIZE[f?.type||'']||'0.1 MB',progress:progress.value,stages:stages.value}
 }
 const f=props.files[selected.value]
 if(!f)return null
 return {live:false,index:selected.value,name:f.name,type:f.type,size:SIZE[f.type]||'0.1 MB',progress:100,stages:STAGES.map(s=>({...s,status:'completed' as const}))}
})

function stop(){if(timer){clearInterval(timer);timer=undefined}}
function clearHandoff(){if(handoff){clearTimeout(handoff);handoff=undefined}}
// 「开始解析」按钮在左栏，点击后弹确认框；确认才真正启动动画。
function start(){
 const n=total.value
 if(!n)return
 clearHandoff();confirming.value=false;elapsed.value=0;running.value=true;runIndex.value=0
 const t0=Date.now()
 timer=setInterval(()=>{
  const e=Date.now()-t0
  if(e>=elapsedAll.value){
   elapsed.value=elapsedAll.value;stop();runIndex.value=total.value
   handoff=setTimeout(()=>{running.value=false;emit('done')},900)
   return
  }
  elapsed.value=e
  runIndex.value=currentIndex.value
 },100)
}// 取消只中止动画：报价包数据一字不改，留在本页等待重新发起。
function cancel(){stop();clearHandoff();running.value=false;elapsed.value=0;runIndex.value=-1;confirming.value=false}
watch(total,n=>{if(!n)cancel()})
watch(()=>props.parsed,v=>{if(v){stop();clearHandoff();running.value=false;runIndex.value=-1;confirming.value=false}})
// 页面把 runIndex 置 0 表示发起解析，确认弹窗由本组件承担。
watch(runIndex,v=>{if(v<0&&running.value)cancel();else if(v===0&&!running.value)confirming.value=true})
onUnmounted(()=>{stop();clearHandoff()})
</script>
<template><aside class="panel parse-side">
 <div class="parse-side-heading">
  <h2>解析结果查看</h2>
  <p class="muted">点击左侧资料，查看该文件的解析过程记录</p>
  <div v-if="running" class="parse-runbar"><span class="parse-pill">已完成 {{currentIndex}}/{{total}} 个文件 · 当前文件解析中</span><Button size="sm" variant="outline" @click="cancel">取消解析</Button></div>
 </div>
 <div v-if="!total" class="parse-state"><span class="parse-state-icon"><AppIcon name="files" :size="24"/></span><b>等待资料</b><p>先在上方「需求资料输入」添加资料，这里会显示每份文件的解析过程记录。</p></div>
 <div v-else-if="!card" class="parse-state"><span class="parse-state-icon"><AppIcon name="file-magnifying-glass" :size="24"/></span><b>请选择资料查看解析记录</b><p>新上传资料后右栏保持清空；点击左侧「资料清单」中的文件后，再在这里查看解析过程。</p></div>
 <div v-else class="parse-body"><div class="parse-card">
  <div class="parse-card-head"><span class="parse-card-tile" :class="{live:card.live}"><AppIcon :name="card.live?'spinner-gap':'check'" :size="22"/></span><div class="grow"><div class="parse-card-eyebrow">{{card.live?'正在解析第 '+(card.index+1)+' 个文件':parsed?'解析记录 · 该文件已完成全部阶段':'解析记录 · 该文件尚未解析'}}</div><div class="parse-card-name" :title="card.name">{{card.name}}</div><div class="parse-card-meta">{{card.type}} · {{card.size}}</div></div><div v-if="card.live" class="parse-card-pct"><strong>{{card.progress}}%</strong><small>当前文件进度</small></div><div v-else class="parse-card-pct"><strong>6/6</strong><small>阶段已完成</small></div></div>
  <div v-if="card.live" class="parse-bar"><i :style="{width:card.progress+'%'}"/></div>
  <div class="parse-stages"><div v-for="(s,i) in card.stages" :key="s.name" class="parse-stage" :class="s.status"><span class="parse-stage-dot"><AppIcon v-if="s.status!=='waiting'" :name="s.status==='completed'?'check':'spinner-gap'" :size="12"/><template v-else>{{i+1}}</template></span><div class="grow"><div class="parse-stage-row"><b>{{s.name}}</b><i>{{STATUS_TEXT[s.status]}}</i></div><p>{{s.status==='completed'?s.done:s.status==='in_progress'?s.running:s.wait}}</p></div></div></div>
 </div></div>
 <FormDialog v-model="confirming" :title="parsed?'确认重新解析':'确认保存资料并开始解析'" :description="`将使用本次上传的 ${total} 份资料，为所选 ${packages.length} 个报价包启动解析。`">
  <p>您即将对当前资料启动结构化参数解析，解析过程约需 {{Math.ceil(elapsedAll/1000)}} 秒。</p>
  <p v-if="parsed">重新解析会重建演示货物项，覆盖本轮货物项修改，并清除当前版本的销售、技术确认和技术指派结果。原始资料清单及历史记录会保留。</p>
  <div class="parse-confirm-info"><div><span>输入资料数量</span><b>{{total}} 份文件</b></div><div><span>解析目标范围</span><div class="parse-scope-summary"><b>{{packageLabel}}</b><PackageScopePopover :packages="packages" :sheets="sheets" label="查看范围" :show-count="false" /></div></div></div>
  <div class="parse-confirm-actions"><Button variant="outline" @click="confirming=false">取消返回</Button><Button @click="start"><AppIcon name="play"/>确认开始解析</Button></div>
 </FormDialog>
</aside></template>
<style scoped>
.parse-side{display:flex;flex-direction:column;min-width:0;min-height:0;margin-bottom:0}
.parse-side-heading{flex-shrink:0;padding:20px 23px;border-bottom:1px solid #eef0f4}
.parse-side-heading .muted{margin:4px 0 0}
.parse-runbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px}
.parse-pill{background:#eaf2f8;color:#064975;border:1px solid #d5e3ed;border-radius:999px;padding:5px 12px;font-size:11px;font-weight:600;white-space:nowrap}
.parse-body{flex:1;min-width:0;min-height:0;overflow-y:auto;padding:20px 23px}
.parse-card{min-width:0;border:1px solid #d5e3ed;background:#f1f7fb;border-radius:12px;padding:18px}
.parse-card .grow{min-width:0}
.parse-card-head{display:flex;align-items:center;gap:12px}
.parse-card-tile{width:44px;height:44px;display:grid;place-items:center;border-radius:12px;background:#fff;border:1px solid #d5e3ed;color:#064975;flex-shrink:0}
.parse-card-tile.live :deep(svg){animation:parse-spin 1.2s linear infinite}
.parse-card-eyebrow{font-size:10px;font-weight:700;color:#315b78}
.parse-card-name{font-size:13px;font-weight:600;color:#252b32;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.parse-card-meta{font-size:10px;color:#98a2b3;margin-top:4px}
.parse-card-pct{text-align:right;flex-shrink:0}
.parse-card-pct strong{display:block;font-size:24px;font-weight:600;color:#252b32;font-variant-numeric:tabular-nums;letter-spacing:-.5px}
.parse-card-pct small{font-size:10px;color:#98a2b3}
.parse-bar{height:6px;border-radius:999px;background:#dce7ef;overflow:hidden;margin:16px 0}
.parse-bar i{display:block;height:100%;border-radius:999px;background:#064975;transition:width .4s linear}
.parse-stages{display:flex;flex-direction:column;gap:11px;margin-top:16px}
.parse-stage{display:flex;align-items:flex-start;gap:10px}
.parse-stage-dot{width:26px;height:26px;display:grid;place-items:center;border-radius:50%;flex-shrink:0;font-size:10px;font-weight:700;background:#fff;border:1px solid #e1e6ec;color:#98a2b3}
.parse-stage.completed .parse-stage-dot{background:#25724e;border-color:#25724e;color:#fff}
.parse-stage.in_progress .parse-stage-dot{background:#064975;border-color:#064975;color:#fff}
.parse-stage.in_progress .parse-stage-dot :deep(svg){animation:parse-spin 1.2s linear infinite}
.parse-stage-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
.parse-stage-row b{font-size:12px;color:#3b4c5d}
.parse-stage-row i{font-style:normal;font-size:10px;font-weight:600;color:#98a2b3}
.parse-stage.completed .parse-stage-row i{color:#25724e}
.parse-stage.in_progress .parse-stage-row i{color:#064975}
.parse-stage p{margin:2px 0 0;font-size:10px;line-height:1.6;color:#788594}
.parse-state{display:flex;flex-direction:column;align-items:center;gap:10px;padding:52px 23px;text-align:center}
.parse-state-icon{width:46px;height:46px;display:grid;place-items:center;border-radius:12px;background:#eef4f9;border:1px solid #dce7f0;color:#3f6d92}
.parse-state b{font-size:13px;color:#3b4c5d}
.parse-state p{margin:0;font-size:12px;line-height:1.8;color:#6c7989}
.parse-confirm-info{display:flex;flex-direction:column;gap:10px;background:#f8fafc;border:1px solid #e1e6ec;border-radius:8px;padding:14px 15px;font-size:12px}
.parse-confirm-info>div{display:flex;align-items:center;justify-content:space-between;gap:12px}
.parse-confirm-info span{color:#6c7989}
.parse-confirm-info b{color:#252b32}
.parse-confirm-target{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;color:#064975;background:#eaf2f8;border:1px solid #d5e3ed;border-radius:4px;padding:2px 7px}
.parse-confirm-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}
@keyframes parse-spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.parse-card-tile.live :deep(svg),.parse-stage.in_progress .parse-stage-dot :deep(svg){animation:none}}
.parse-scope-summary{display:flex;align-items:center;justify-content:flex-end;gap:12px;flex-wrap:wrap}.parse-scope-summary b{font-size:12px}
</style>

<style scoped>.parse-confirm-target{white-space:normal;overflow-wrap:anywhere;max-width:290px;text-align:right;line-height:1.6}</style>
