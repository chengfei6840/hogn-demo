<script setup lang="ts">
import ApprovalTasks from './workflow/ApprovalTasks.vue'
import { displayRoleText, quoteFromCost, partCostRows, costFromPartCosts, packageProcessParticipant, technicalDirector, workflowSteps, type Package } from '@/domain/model'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { computed, nextTick, reactive, shallowRef, watch } from 'vue'
import { catalog, useWorkspace } from '@/domain/store'
import { useWorkflowStore } from '@/stores/workflow'
import { money } from '@/domain/model'
import { Button } from '@/components/ui/button'
import AppIcon from './AppIcon.vue'
import StatusBadge from './StatusBadge.vue'
import FormDialog from './FormDialog.vue'
import { currentApprovalStep } from '@/domain/approval-workflow'
import { referenceCostNote, demoMaterialRate, demoProcessingFee, type PartReference } from '@/domain/part-reference'
const {package:p,project,role,person,act,page,toast}=useWorkspace()
import { packageCategory } from '@/domain/batch-packages'
const categoryName=computed(()=>packageCategory(p as Package,project.materialWorksheets||[]))
const workflows=useWorkflowStore()
// 董事长查看所有包的阶段和核价数据；所有写操作继续由财务角色与当前审批处理人校验。
const allowed=computed(()=>role.value==='财务'||role.value==='董事长')
const rows=reactive<{id:string;name:string;quantity:number;kind:string;price:number;cost:number;margin:number}[]>([])
const tax=shallowRef(13),note=shallowRef(''),manualBoss=shallowRef(false)
const quoteSummary=computed(()=>{const amount=rows.reduce((sum,row)=>sum+row.price*row.quantity,0),cost=rows.reduce((sum,row)=>sum+row.cost*row.quantity,0);return {amount,cost,taxed:amount*(1+(Number(tax.value)||0)/100),margin:amount>0?(amount-cost)/amount*100:0}})
function recalculate(){for(const row of rows){const quote=quoteFromCost(row.cost,row.margin,tax.value);row.price=quote.total}}
function setItemMargin(id:string,event:Event){const row=rows.find(r=>r.id===id);if(!row)return;const raw=(event.target as HTMLInputElement).value.trim(),value=Number(raw);if(!raw||!Number.isFinite(value)||value<0||value>=100){toast('单项毛利率须在 0 至小于 100% 之间');const saved=p.items.find(i=>i.id===id);row.margin=saved?.margin??20;recalculate();return}row.margin=Math.round(value*10000)/10000;recalculate()}
// 财务驳回：把技术选项确认打回上一流程；与审批链的「退回」分离，走独立的 rejectStage 动作。
const rejectOpen=shallowRef(false)
const rejectReason=shallowRef('')
function submitReject(){if(!rejectReason.value.trim()){toast('请填写驳回原因');return}if(act('rejectStage',{reason:rejectReason.value})){rejectOpen.value=false;rejectReason.value=''}}
// 展开的货物项：串按子件汇总成本，独立物资自己就是成本行；单价随单项毛利率计算。
const expanded=reactive<Record<string,boolean>>({})
const highlightedReferenceRows=reactive<Record<string,number[]|undefined>>({})
const partDraft=reactive<Record<string,number|undefined>>({})
const referenceOpen=shallowRef(false)
const referenceDetail=shallowRef<{target:string;reference:PartReference;quantity:number|null;referenceUnit:number;currentUnit:number}|null>(null)
type FinancePartRow=ReturnType<typeof partCostRows>[number]
function costSourceLabel(row:FinancePartRow){
 if(row.part.qty===null)return '用量待补充'
 if(row.missing)return '待补充本次核算价'
 if(row.override>0)return row.reference?'手工核算':'财务填报本次核算价'
 if(row.reference)return '参考子件成本'
 return row.source==='archive'?'历史归档价':'维护库价'
}
function showReferenceCost(row:FinancePartRow){
 if(!row.reference)return
 referenceDetail.value={target:`${row.part.name} ${row.part.model}`,reference:row.reference,quantity:row.part.qty,referenceUnit:row.synced,currentUnit:row.unit}
 referenceOpen.value=true
}
watch(()=>[p.id,p.u9SyncedAt,p.u9Data],()=>{for(const key of Object.keys(partDraft))delete partDraft[key]},{deep:true})
function partRows(id:string){const i=p.items.find(x=>x.id===id);return i?partCostRows(i,p as never,catalog):[]}
function referenceCostSummary(id:string){
 const rows=partRows(id).filter(row=>row.reference&&row.part.qty!==null&&row.part.qty>0)
 return {count:rows.length,adjusted:rows.some(row=>row.override>0)}
}
function itemMissing(id:string){const i=p.items.find(x=>x.id===id);return i?costFromPartCosts(i,p as never,catalog).missing:[]}
function partInputKey(id:string,row:number){return id+':'+row}
// 本次核算单价：财务填过就用填的，没填就按库中价，所以库里没有价的行输入框留空。
function partUnit(id:string,row:number){return partRows(id).find(r=>r.part.row===row)?.unit??0}
function partDraftValue(id:string,row:number){const key=partInputKey(id,row);if(!(key in partDraft)){const unit=partUnit(id,row);partDraft[key]=unit>0?unit:undefined}return partDraft[key]}
function toggleRow(id:string){expanded[id]=!expanded[id];highlightedReferenceRows[id]=undefined}
async function showReferenceCosts(id:string){
 const rows=partRows(id).filter(entry=>entry.reference&&entry.part.qty!==null&&entry.part.qty>0)
 const first=rows[0]
 if(!first)return
 expanded[id]=true
 highlightedReferenceRows[id]=rows.map(row=>row.part.row)
 await nextTick()
 document.querySelector<HTMLElement>(`[data-reference-row="${id}-${first.part.row}"]`)?.scrollIntoView({behavior:'smooth',block:'center'})
}
// 脱离输入框即视为确认本次核算单价：填了用填的，清空则回退库中价。
function commitPartCost(id:string,row:number,event:Event){
 const cost=(event.target as HTMLInputElement).value.trim()===''?0:Number((event.target as HTMLInputElement).value)
 if(!Number.isFinite(cost)||cost<0){partDraft[partInputKey(id,row)]=partUnit(id,row)||undefined;return}
 partDraft[partInputKey(id,row)]=cost>0?cost:undefined
 if(act('setPartCost',{id,row,cost})){reflectCosts();partDraft[partInputKey(id,row)]=partUnit(id,row)||undefined}
}
function commitItemCost(id:string){const row=rows.find(r=>r.id===id);if(!row)return;if(act('setItemCost',{id,cost:Number(row.cost)}))reflectCosts();else{const saved=p.items.find(i=>i.id===id);if(saved)row.cost=saved.cost}}
// 子件价改动后串成本变了，各行未税单价按各自毛利率重算。
function reflectCosts(){for(const row of rows){const saved=p.items.find(i=>i.id===row.id);if(saved)row.cost=saved.cost}recalculate()}
watch(()=>[p.stage,p.version,role.value,p.u9SyncedAt,p.u9Data,p.items],()=>{rows.splice(0,rows.length,...p.items.filter(i=>!i.excluded).map(i=>({id:i.id,name:i.name,quantity:i.quantity,kind:i.kind,price:i.price,cost:i.cost,margin:i.margin??20})));tax.value=p.tax;note.value=p.pricingNote;manualBoss.value=p.manualBoss;recalculate()},{immediate:true,deep:true})
const locked=computed(()=>role.value!=='财务'||p.stage!=='财务核价')
const costLocked=locked
const marginEditable=computed(()=>!locked.value)
const missingCosts=computed(()=>p.items.filter(i=>!i.excluded&&costFromPartCosts(i,p as never,catalog).missing.length>0))
const dirty=computed(()=>tax.value!==p.tax||note.value!==p.pricingNote||manualBoss.value!==p.manualBoss||rows.some(r=>{const saved=p.items.find(i=>i.id===r.id);return !saved||r.price!==saved.price||r.cost!==saved.cost||r.margin!==(saved.margin??20)}))
const canSubmitApproval=computed(()=>!locked.value&&Boolean(workflows.activeRecord))
const chairmanPreFinance=computed(()=>role.value==='董事长'&&!p.financeReachedAt&&['资料整理','并行协作'].includes(p.stage))
const currentOwner=computed(()=>{
 if(p.stage==='资料整理')return {stage:'资料解析',person:packageProcessParticipant(p as Package,'dataParsing')}
 if(p.salesConfirmed!==p.version)return {stage:'销售需求确认',person:packageProcessParticipant(p as Package,'salesConfirmation')}
 if(p.technicalExecution?.mode==='employee')return p.technicalExecution.status==='submitted'?{stage:'技术总监确认',person:packageProcessParticipant(p as Package,'technicalConfirmation')}:{stage:'技术选项确认',person:p.technicalExecution.assignee||packageProcessParticipant(p as Package,'technicalConfirmation')}
 return {stage:'技术选项确认',person:packageProcessParticipant(p as Package,'technicalConfirmation')||technicalDirector}
})
const monitorProgress=computed(()=>workflowSteps(p as Package))
const pendingApproval=computed(()=>currentApprovalStep(p.approvalRun))
const staleFinanceData=computed(()=>role.value==='董事长'&&p.financeReachedAt&&['资料整理','并行协作'].includes(p.stage))
function fillDemoPrices(){
 if(locked.value){toast('当前阶段不能补齐演示价格');return}
 let filled=0
 const fallbackCosts:{id:string;cost:number}[]=[]
 for(const item of p.items.filter(i=>!i.excluded)){
  if(item.kind==='独立物资'){
   if(item.cost>0)continue
   const cost=Math.max(1,Math.round((item.quantity*6.8+24)*10000)/10000)
   if(act('setItemCost',{id:item.id,cost}))filled++
   continue
  }
  let itemFilled=false
  for(const part of partRows(item.id)){
   if(!part.missing||part.part.qty===null)continue
   const cost=Math.max(1,Math.round(((part.part.weight||1)*12.8+part.part.row*1.5+6)*10000)/10000)
   if(act('setPartCost',{id:item.id,row:part.part.row,cost})){
    partDraft[partInputKey(item.id,part.part.row)]=cost
    filled++
    itemFilled=true
   }
  }
  if(!itemFilled&&item.cost<=0){
   const cost=Math.max(1,Math.round((item.quantity*9.6+36)*10000)/10000)
   const row=rows.find(r=>r.id===item.id)
   if(row){row.cost=cost;fallbackCosts.push({id:item.id,cost}) ;filled++}
  }
 }
 reflectCosts()
 for(const fallback of fallbackCosts){const row=rows.find(r=>r.id===fallback.id);if(row)row.cost=fallback.cost}
 if(fallbackCosts.length)recalculate()
 if(filled)toast(`已一键补齐 ${filled} 项演示价格，请复核后保存核价`)
 else toast('当前没有待补齐的价格')
}
function save(){return act('savePrice',{rows,tax:tax.value,note:note.value,manualBoss:manualBoss.value})}
function submitApproval(){if(!save())return;act('approveFinance')}
</script>
<template><div class="page-heading"><div><p class="eyebrow">{{p.packageName}} / 需求 V{{p.version}}</p><h1>核价与审批</h1><p class="muted">可保存核价草稿稍后继续；点击提交时会先自动保存当前核价，再发起审批。</p></div><StatusBadge :text="p.stage"/></div>
 <section v-if="chairmanPreFinance" class="panel chairman-progress"><div class="panel-heading"><div><h2>报价包进度</h2><p class="muted">尚未进入成本核价，当前由对应阶段负责人处理。</p></div><StatusBadge :text="p.stage"/></div><div class="panel-body"><div class="chairman-owner"><span>当前阶段</span><b>{{currentOwner.stage}}</b><span>负责人</span><b>{{currentOwner.person}}</b></div><div class="chairman-step-list"><span v-for="step in monitorProgress" :key="step.stage" :class="step.status">{{step.label}}</span></div></div></section>
 <section v-else-if="!allowed" class="panel empty"><AppIcon name="lock-key" :size="40"/><h2>当前角色无权查看成本与利润</h2><p>销售可在报价档案中查看对外报价，技术负责串型及子件确认。</p><Button variant="outline" @click="page='quotes'">查看报价档案</Button></section>
 <template v-else><div v-if="staleFinanceData" class="notice amber"><AppIcon name="info"/>该报价包已进入过成本核价，当前已退回{{p.stage==='资料整理'?'资料整理':'销售 / 技术确认'}}；此处保留上次核价页面供查看，财务完成重新核价后数据会更新。</div><div class="stats-grid"><div class="stat"><span>U9子件成本合计</span><strong class="money-value">{{money(quoteSummary.cost)}}</strong><small>子件价格 × 分配量 × 采购数量</small></div><div class="stat"><span>总毛利率</span><strong>{{quoteSummary.margin.toFixed(4)}}<em>%</em></strong><small>按各项报价和成本加权计算</small></div><div class="stat"><span>不含税报价</span><strong class="money-value">{{money(quoteSummary.amount)}}</strong><small>逐项未税单价 × 数量</small></div><div class="stat"><span>含税报价</span><strong class="money-value">{{money(quoteSummary.taxed)}}</strong><small>不含税报价 ×（1 + 税率）</small></div></div>
 <div v-if="p.stage==='并行协作'||p.stage==='资料整理'" class="notice amber"><AppIcon name="lock-key"/>销售与技术尚未完成双确认，不能开始核价。</div>
  <div v-if="pendingApproval" class="notice"><AppIcon name="info"/>当前审批节点：{{pendingApproval.name}} · {{pendingApproval.assignee}}；董事长角色可查看进度。</div>
<section class="panel"><div class="panel-heading"><div><h2>货物项价格复核</h2><p class="muted">每项可单独设置毛利率，未税单价自动按单位成本计算；总毛利率按整包收入和成本加权汇总。点击货物项可展开子件核对与修改成本。</p></div><div class="flex gap-2"><Button size="sm" variant="outline" :disabled="locked" @click="fillDemoPrices"><AppIcon name="download-simple" :size="15"/>演示一键补齐价格</Button></div></div><div class="table-wrap price-review"><table><thead><tr><th>包名称</th><th>类别</th><th>货物项</th><th>数量</th><th>单项毛利率（%）</th><th>未税单价</th><th>单位成本<span class="lock-hint">子件汇总</span></th><th>成本明细</th></tr></thead><tbody><template v-for="r in rows" :key="r.id"><tr :class="{expanded:expanded[r.id]}"><td>{{p.packageName}}</td><td>{{categoryName}}</td><td><b>{{r.name}}</b><small>货物项 {{r.id}}</small></td><td>{{r.quantity}} {{p.items.find(i=>i.id===r.id)?.unit||'套'}}</td><td><Input :model-value="r.margin" type="number" min="0" max="99.9999" step="0.0001" :readonly="!marginEditable" :disabled="!marginEditable" :aria-label="'单项毛利率 '+r.id" class="price-input" @change="setItemMargin(r.id,$event)"/></td><td><Input :model-value="r.price.toFixed(4)" readonly :aria-label="'未税单价 '+r.id" class="price-input"/></td><td><div class="unit-cost-display"><Input v-if="r.kind==='独立物资'" v-model.number="r.cost" type="number" min="0" step="0.0001" :disabled="costLocked" :aria-label="'单位成本 '+r.id" class="price-input" @change="commitItemCost(r.id)"/><Input v-else :model-value="r.cost.toFixed(4)" readonly :aria-label="'单位成本 '+r.id" class="price-input"/><button v-if="referenceCostSummary(r.id).count" type="button" class="reference-cost-alert" @click="showReferenceCosts(r.id)" :aria-label="`${referenceCostSummary(r.id).adjusted?'参考成本已调整':'含参考子件成本'}，${referenceCostSummary(r.id).count}项，展开对应子件`"><AppIcon name="info" :size="13"/>{{referenceCostSummary(r.id).adjusted?'参考成本已调整':'含参考子件成本'}} · {{referenceCostSummary(r.id).count}}项</button></div><small v-if="itemMissing(r.id).length" class="cost-warning">{{itemMissing(r.id).length}} 项子件无库价，待补充</small></td><td><Button v-if="r.kind!=='独立物资'" size="sm" variant="outline" @click="toggleRow(r.id)">{{expanded[r.id]?'收起子件':'展开子件（'+partRows(r.id).length+'）'}}</Button><span v-else class="muted">独立物资，无子件</span></td></tr><tr v-if="expanded[r.id]&&r.kind!=='独立物资'" class="part-cost-row"><td colspan="8"><div class="part-cost-table">
<table><thead><tr><th>包名称</th><th>类别</th><th>子件</th><th>型号</th><th>每套用量</th><th>料号</th><th>库中／参考单价</th><th>本次核算单价</th><th>成本小计</th><th>成本来源／说明</th></tr></thead>
<tbody><tr v-for="pr in partRows(r.id)" :key="pr.part.row" :class="{'reference-cost-highlight':Boolean(pr.reference)&&Boolean(highlightedReferenceRows[r.id]?.includes(pr.part.row))}" :data-reference-row="pr.reference?r.id+'-'+pr.part.row:undefined">
<td>{{p.packageName}}</td><td>{{categoryName}}</td><td><b>{{pr.part.name||'未命名子件'}}</b><small>第 {{pr.part.row}} 行</small></td>
<td>{{pr.part.model||'待补充'}}</td><td>{{pr.part.qty===null?'待补充':pr.part.qty+' '+pr.part.unit}}</td><td>{{pr.part.u9||'—'}}</td>
<td>{{pr.synced>0?money(pr.synced):'无库价／参考成本'}}</td>
<td><Input :model-value="partDraftValue(r.id,pr.part.row)" :placeholder="pr.missing?'填写本次核算单价':pr.reference?'按参考子件成本':'按库中价'" type="number" min="0" step="0.0001" :disabled="costLocked" :aria-label="'本次核算单价 '+pr.part.row" class="price-input" @change="commitPartCost(r.id,pr.part.row,$event)"/></td>
<td>{{pr.part.qty===null?'—':money(partUnit(r.id,pr.part.row)*pr.part.qty)}}</td>
<td class="cost-source-cell"><StatusBadge :text="costSourceLabel(pr)"/><template v-if="pr.reference"><p class="reference-cost-note">{{referenceCostNote(pr.reference)}}</p><button type="button" class="reference-detail-link" @click="showReferenceCost(pr)">查看成本依据</button></template></td>
</tr></tbody></table>
</div></td></tr></template></tbody></table></div><div class="panel-body"><div class="two-columns"><label>税率<Input v-model.number="tax" type="number" min="0" max="100" :disabled="locked" @change="recalculate"/></label><div class="field-label">审批按当前财务流程处理</div></div><label>计价与商务口径<Textarea v-model="note" :disabled="locked" placeholder="说明币种、税费、运费、有效期等商务口径"/><small class="field-help">草稿可暂时留空；提交审批前必须填写，用于记录报价条件和商务约定。</small></label><div v-if="!p.u9SyncedAt" class="notice amber">完成技术确认后可使用上方“演示一键补齐价格”，自动填入缺失的子件核算价。</div><div v-if="missingCosts.length" class="notice amber">货物项 {{missingCosts.map(i=>i.id).join('、')}} 有子件未匹配到库中料号或价格为空，可点击上方按钮一键补齐演示价格。</div><div v-if="dirty" class="notice amber">核价有未保存的修改。</div><div class="flex justify-end gap-2"><Button v-if="role==='财务'&&p.stage==='财务核价'" variant="outline" @click="rejectReason='';rejectOpen=true">驳回到技术选项确认<AppIcon name="arrow-counter-clockwise" /></Button><Button v-if="role==='财务'&&p.stage==='财务核价'" variant="outline" :disabled="locked" @click="save">仅保存核价草稿</Button><Button v-if="role==='财务'&&p.stage==='财务核价'" :disabled="!canSubmitApproval" @click="submitApproval">提交审批签发</Button></div></div></section>
<ApprovalTasks :dirty="dirty"/>
 <FormDialog v-model="rejectOpen" title="驳回到技术选项确认" description="驳回后本包版本 +1，销售与技术已完成的确认一并作废，退回技术选项确认；技术重新确认后才能继续核价。"><label>驳回原因<Textarea v-model="rejectReason" placeholder="填写驳回的具体依据，例如：串型与图纸不一致、子件用量需要重核" /></label><Button @click="submitReject">确认驳回</Button></FormDialog>
 <section class="panel"><div class="panel-heading"><h2>审核记录</h2></div><div v-for="(a,n) in p.audit.slice(0,8)" :key="n" class="audit-row"><AppIcon name="clock-counter-clockwise"/><div><b>{{displayRoleText(a.action)}} · {{displayRoleText(a.role)}}</b><p>{{displayRoleText(a.detail)}}</p><small>{{a.at}} / V{{a.version}}</small></div></div></section></template>
<FormDialog v-model="referenceOpen" title="参考子件成本依据" description="参考单价来自选定子件的成本计算，成本小计按当前子件用量汇总。">
<template v-if="referenceDetail"><dl class="reference-cost-details"><dt>当前子件</dt><dd>{{referenceDetail.target}}</dd><dt>参考子件</dt><dd>{{referenceDetail.reference.name}} {{referenceDetail.reference.model}}</dd><dt>参考料号</dt><dd>{{referenceDetail.reference.u9}}</dd><dt>来源</dt><dd>{{referenceDetail.reference.source}} · 第 {{referenceDetail.reference.sourceRow}} 行</dd><dt>工艺路线</dt><dd>{{referenceDetail.reference.processRoute}}</dd></dl>
<div class="reference-cost-formula"><b>演示成本计算方式</b><p>参考单重 {{referenceDetail.reference.weight||1}} kg × {{demoMaterialRate}} 元/kg ＋ 加工费 {{demoProcessingFee}} 元 = {{money(referenceDetail.referenceUnit)}} / {{referenceDetail.reference.unit}}</p><p>当前子件成本小计：{{money(referenceDetail.currentUnit)}} × {{referenceDetail.quantity??'待补用量'}} = {{referenceDetail.quantity===null?'待核算':money(referenceDetail.currentUnit*referenceDetail.quantity)}}</p><small v-if="referenceDetail.currentUnit!==referenceDetail.referenceUnit">财务已调整本次核算单价，参考说明继续保留。</small></div></template>
</FormDialog>
</template>
<style scoped>
/* 展开行让出整行宽度，子件表用浅底与主表区分 */
.price-review tr.expanded{background:#f4f9fc}
.unit-cost-display{display:flex;flex-direction:column;align-items:center;gap:6px}
.unit-cost-display>.price-input{width:132px}
.reference-cost-alert{display:inline-flex;align-items:center;gap:5px;max-width:100%;padding:4px 8px;border:1px solid #edc36e;border-radius:5px;background:#fff4d8;color:#80520b;font-size:10px;line-height:1.35;white-space:nowrap;cursor:pointer}
.reference-cost-alert:hover{background:#ffebbd}
.reference-cost-alert:focus-visible{outline:2px solid #a46a10;outline-offset:2px}
.part-cost-row>td{padding:0!important;background:#fafcfd}
.part-cost-table{padding:10px 16px 16px;border-left:3px solid #9bb6ca}
.part-cost-table table{min-width:820px}
.part-cost-table th,.part-cost-table td{font-size:11px;padding:9px 10px}
.part-cost-table small{display:block;color:#8a98a4;font-size:10px}
.part-cost-table input{height:32px;padding:4px 8px;font-size:11px}
.part-cost-table button{margin-top:5px}
.part-cost-table .cost-source-cell{min-width:215px;max-width:280px;text-align:left;vertical-align:top}
.part-cost-table tr.reference-cost-highlight{background:#fff5db}
.part-cost-table tr.reference-cost-highlight>td:first-child{box-shadow:inset 3px 0 #e8a415}
.reference-cost-note{margin:6px 0 0;color:#335f80;font-size:11px;line-height:1.6;overflow-wrap:anywhere}
.reference-detail-link{border:0;background:none;padding:0;color:#075888;text-decoration:underline;text-underline-offset:3px;font-size:11px}
.reference-cost-details{display:grid;grid-template-columns:100px 1fr;gap:9px 12px;margin:0;font-size:13px}.reference-cost-details dt{color:#536a7d}.reference-cost-details dd{margin:0;overflow-wrap:anywhere}
.reference-cost-formula{margin-top:16px;padding:13px;background:#edf5fb;border-radius:6px;color:#294e6a;font-size:12px;line-height:1.8}.reference-cost-formula p{margin:4px 0}.reference-cost-formula small{color:#536f85;font-size:11px}
.lock-hint{display:block;font-weight:400;color:#8a98a4;font-size:10px}
.cost-warning{display:block;margin-top:4px;color:#9a6b22;font-size:10px}
</style>
