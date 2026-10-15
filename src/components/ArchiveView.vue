<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { catalog, useWorkspace } from '@/domain/store'
import { endedStages, included, money, type Candidate, type Package, type Part, type Project } from '@/domain/model'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { downloadBom } from '@/lib/bom-export'
import AppSelect from './AppSelect.vue'
import AppIcon from './AppIcon.vue'
import StatusBadge from './StatusBadge.vue'

type ArchivedRow = Package & { projectName: string; customer: string; projectId: string }
const { archived, role, projects, openProject, openPackage, act, toast } = useWorkspace()
const query=shallowRef(''), result=shallowRef('全部结果')
const results=computed(()=>['全部结果',...endedStages])
const filtered=computed(()=>archived.value.filter(p=>(result.value==='全部结果'||p.stage===result.value)&&[p.packageName,p.packageNo||'',p.id,p.projectName,p.customer].some(v=>v.toLowerCase().includes(query.value.trim().toLowerCase()))))
// 归档记录跨项目，需先切到所属项目再切包；取消归档后包会回到客户议价中，只读状态随之解除。
function review(projectId:string,packageId:string){openProject(projectId);openPackage(packageId)}
function restore(projectId:string,packageId:string){review(projectId,packageId);act('unarchive')}

// 详情整包从归档行直接读取，不再切项目/切包，历史库页面保持不动。
const detailOpen=shallowRef(false), selected=shallowRef<ArchivedRow|null>(null), expanded=shallowRef<string[]>([]), exporting=shallowRef(false)
function openDetail(p:ArchivedRow){selected.value=p;expanded.value=[];detailOpen.value=true}
function toggleSeries(id:string){expanded.value=expanded.value.includes(id)?expanded.value.filter(x=>x!==id):[...expanded.value,id]}
const snap=computed(()=>selected.value?.snapshots[0])
const canExportBom=computed(()=>['销售','技术','财务'].includes(role.value))
const canExportQuote=computed(()=>['销售','财务'].includes(role.value))
// downloadBom 需要项目上下文：名称、客户与技术联系人取自所属项目，包体沿用归档行本身。
const bomProject=computed<Project|null>(()=>{const p=selected.value,owner=projects.value.find(x=>x.id===p?.projectId);return p&&owner?{...owner,packages:[p as Package]}:null})
// 串与子件的归属规则与 BOM 一致：串就是 kind==='金具串' 的货物项，子件取串型候选或技术改过的覆盖值。
// 归档包多数未经技术确认，item.confirmed 为 false，这里回退到 catalog 解析串型，而不是只认已确认项。
const seriesList=computed(()=>{
 const p=selected.value
 if(!p)return []
 return included(p as Package).map(item=>{
  const candidate:Candidate|undefined=catalog.find(c=>c.id===item.selected)
  if(!candidate&&item.kind==='独立物资'){
   const part={name:item.name,model:item.model||item.spec,qty:1,unit:item.unit,material:'',weight:null,u9:'',drawing:'',row:0} as Part
   const synced=p.u9Data?.['item:'+item.id]
   return {item,candidate,rows:[{part,total:item.quantity,u9Price:synced&&synced.price>0?synced.price:null,processRoute:synced?.processRoute||''}]}
  }
  return {item,candidate,rows:(item.partOverrides??candidate?.parts??[]).map(part=>{
   const synced=p.u9Data?.[(candidate?.id||item.selected)+':'+part.row]
   return {part,total:part.qty===null?null:part.qty*item.quantity,u9Price:synced&&synced.price>0?synced.price:null,processRoute:synced?.processRoute||part.processRoute||''}
  })}
 })
})
// BOM 走原本流程的 Excel 导出，报价单走原本流程的 CSV 导出，两者都是真实下载。
async function exportBom(){
 const p=bomProject.value
 if(!p||!canExportBom.value)return
 exporting.value=true
 try{await downloadBom(p,catalog);toast('BOM Excel 已生成，缺失字段保留为空')}
 catch{toast('BOM 导出失败，请重试')}
 finally{exporting.value=false}
}
function exportQuote(){
 const s=snap.value
 if(!s||!canExportQuote.value)return
 const esc=(v:unknown)=>'"'+String(v??'').replaceAll('"','""')+'"'
 const lines=[['红光金具报价单（演示）',s.id],['版本',s.version,'税率',s.tax+'%'],['货物项','产品名称','规格型号','数量','单位','未税单价','未税金额'],...s.items.map(i=>[i.id,i.name,i.model||i.spec,i.quantity,i.unit,i.price,Math.round(i.price*i.quantity*100)/100]),['含税总额',s.total],['商务条款',s.notes],['不含范围',s.excluded.map(i=>i.name+'：'+i.exclusionReason).join('；')]]
 const blob=new Blob(['﻿'+lines.map(r=>r.map(esc).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'})
 const url=URL.createObjectURL(blob)
 const a=document.createElement('a');a.href=url;a.download=s.id+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)
 toast('已请求浏览器下载 CSV；文件只包含对外报价字段')
}
</script>
<template>
 <div class="page-heading"><div><p class="eyebrow">归档与追溯</p><h1>历史库</h1><p class="muted">已成交、未成交与已取消的报价包归档在此，只读留档；需要继续处理时可取消归档退回客户议价中。</p></div></div>
 <section class="panel ledger-panel"><div class="panel-heading ledger-filters"><h2>归档报价包 <span class="count">{{archived.length}}</span></h2><Input v-model="query" aria-label="搜索归档报价包" placeholder="搜索报价包、项目、客户或编号"/><AppSelect v-model="result" label="筛选成交结果" :options="results"/></div>
 <div class="ledger-table"><table><thead><tr><th>项目 / 客户</th><th>报价包</th><th>成交结果</th><th>报价版本</th><th>归档入库时间</th><th>操作</th></tr></thead><tbody><tr v-for="p in filtered" :key="p.id"><td>{{p.projectName}}<small>{{p.customer}}</small></td><td><button class="project-name" @click="review(p.projectId,p.id)">{{p.packageName}}</button><small class="block mono">{{p.id}}</small></td><td><b>{{p.stage}}</b><small v-if="p.dealNote">{{p.dealNote}}</small></td><td>V{{p.version}} · {{p.snapshots.length}} 份快照</td><td>{{p.archivedAt}}</td><td><Button v-if="role==='董事长'" size="sm" variant="outline" @click="review(p.projectId,p.id)">查看核价<AppIcon name="arrow-right"/></Button><Button v-else size="sm" variant="outline" @click="openDetail(p)">查看留档<AppIcon name="arrow-right"/></Button><Button v-if="role==='销售'" size="sm" variant="ghost" @click="restore(p.projectId,p.id)">取消归档</Button></td></tr></tbody></table><div v-if="!filtered.length" class="empty">历史库暂无归档报价包，登记成交结果后会自动入库。</div></div>
 </section>

 <Sheet v-model:open="detailOpen"><SheetContent side="right" class="archive-sheet" aria-label="留档详情"><SheetHeader class="archive-sheet-header"><SheetTitle>{{selected?.packageName}} · 留档详情<StatusBadge :text="selected?.stage||''" /></SheetTitle><p class="muted">{{selected?.projectName}} · {{selected?.customer}} · V{{selected?.version}} · 归档入库 {{selected?.archivedAt}}</p></SheetHeader>
  <div class="archive-sheet-body">
   <section class="panel"><div class="panel-heading"><div><h2>串与子件 <span class="count">{{seriesList.length}}</span></h2><p class="muted">点击串展开该串的子件；子件归属、用量与 U9 价格取自归档时的留存数据。</p></div></div>
    <div class="table-wrap"><table class="archive-sheet-table"><thead><tr><th>串型号 / 货物名称</th><th>规格型号</th><th>数量</th><th>子件项</th><th>技术状态</th></tr></thead><tbody><template v-for="g in seriesList" :key="g.item.id"><tr class="archive-series-row" tabindex="0" @click="toggleSeries(g.item.id)" @keydown.enter.prevent="toggleSeries(g.item.id)" @keydown.space.prevent="toggleSeries(g.item.id)"><td class="archive-series-name"><span class="archive-caret" :class="{open:expanded.includes(g.item.id)}"><AppIcon name="caret-right" :size="14"/></span><b>{{g.item.name}}</b><small>{{g.item.id}} · {{g.item.kind}}{{g.item.model?' · '+g.item.model:''}}</small></td><td class="mono">{{g.candidate?.model||g.item.spec||'—'}}</td><td>{{g.item.quantity}} {{g.item.unit}}</td><td>{{g.rows.length}} 项</td><td><StatusBadge :text="g.candidate?'子件已确认':'待技术选型'"/></td></tr>
     <tr v-if="expanded.includes(g.item.id)"><td colspan="5" class="archive-parts"><div v-if="!g.rows.length" class="empty">该串没有留存子件记录，串型尚未确认。</div><div v-else class="table-wrap"><table><thead><tr><th>子件名称</th><th>型号</th><th>每套用量</th><th>总用量</th><th>U9料号</th><th>U9子件价格</th><th>图号</th><th>工艺路线</th><th>来源行</th></tr></thead><tbody><tr v-for="r in g.rows" :key="r.part.row"><td>{{r.part.name}}</td><td class="mono">{{r.part.model||'待补充'}}</td><td>{{r.part.qty??'待补充'}} {{r.part.unit}}</td><td>{{r.total??'待补充'}} {{r.part.unit}}</td><td class="mono">{{r.part.u9||'待补充'}}</td><td>{{r.u9Price===null?'待同步':'¥'+r.u9Price.toFixed(4)}}</td><td class="mono">{{r.part.drawing||'待补充'}}</td><td class="process-route">{{r.processRoute||'待同步'}}</td><td>{{r.part.row}}</td></tr></tbody></table></div></td></tr></template></tbody></table><div v-if="!seriesList.length" class="empty">该报价包没有可留档的货物项。</div></div>
   </section>

   <section class="panel archive-quote"><div class="panel-heading"><div><h2>报价单 <span v-if="snap" class="count">{{snap.id}}</span></h2><p class="muted">归档时已签发的报价单，随包一并留存，可导出 BOM 与报价单。</p></div><div class="flex gap-2"><Button variant="outline" :disabled="!canExportBom||exporting" @click="exportBom"><AppIcon name="download-simple"/>导出 BOM</Button><Button variant="outline" :disabled="!snap||!canExportQuote" @click="exportQuote"><AppIcon name="download-simple"/>导出报价单</Button></div></div>
    <div class="panel-body"><section v-if="!snap" class="panel empty"><AppIcon name="files" :size="45"/><h2>归档时尚未签发报价</h2><p>该报价包在归档前未生成签发快照，仅保留串、子件与成交记录。</p><StatusBadge :text="selected?.stage||''"/></section>
     <article v-else class="quote-paper"><div class="quote-title"><div><div class="brand-word">HOGN<span>红光</span></div><h2>金具串报价单</h2><p>演示报价 · 非正式商务承诺</p></div><StatusBadge text="已签发"/></div><div class="field-grid"><div><span>客户单位</span><b>{{selected?.customer}}</b></div><div><span>报价编号</span><b>{{snap.id}}</b></div><div><span>项目 / 包</span><b>{{selected?.projectName}} / {{selected?.packageName}}</b></div><div><span>签发人</span><b>{{snap.issuedBy||'历史演示记录未记录签发人'}}</b></div><div><span>版本 / 签发时间</span><b>V{{snap.version}} / {{snap.at}}</b></div><div v-if="selected?.externalSentAt"><span>对外提供时间</span><b>{{selected.externalSentAt}}</b></div><div><span>成交状态</span><b>{{selected?.stage}}</b></div><div v-if="selected?.archivedAt"><span>归档入库时间</span><b>{{selected.archivedAt}}</b></div></div><div class="table-wrap"><table><thead><tr><th>产品名称</th><th>型号</th><th>数量</th><th>未税单价</th><th>未税金额</th></tr></thead><tbody><tr v-for="i in snap.items" :key="i.id"><td>{{i.name}}</td><td class="mono">{{i.model||i.spec}}</td><td>{{i.quantity}} {{i.unit}}</td><td>{{money(i.price)}}</td><td>{{money(i.price*i.quantity)}}</td></tr></tbody></table></div><div class="quote-total"><span>含税总额 · 税率 {{snap.tax}}%</span><strong>{{money(snap.total)}}</strong></div><h3>商务条款</h3><p>{{snap.notes}}</p><h3 class="mt-5">本次报价不包含</h3><p v-for="i in snap.excluded" :key="i.id">{{i.name}}：{{i.exclusionReason}}</p><div v-if="selected?.dealNote" class="notice">成交记录：{{selected.dealNote}}</div><div class="quote-seal">需求版本、核价依据及审批轨迹已冻结</div></article>
    </div>
   </section>
  </div>
 </SheetContent></Sheet>
</template>
