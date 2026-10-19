<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { catalog,useWorkspace } from '@/domain/store'
import { projectBom } from '@/domain/bom'
import { selectionConfirmationReady, type Project } from '@/domain/model'
import { downloadBom } from '@/lib/bom-export'
import { Button } from '@/components/ui/button'
import StatusBadge from './StatusBadge.vue'
import AppIcon from './AppIcon.vue'
const props=defineProps<{embedded?:boolean}>()
const {package:p,project,role,page,toast}=useWorkspace()
import { packageCategory } from '@/domain/batch-packages'
const categoryName=computed(()=>packageCategory(p as Project,project.materialWorksheets||[]))
const groups=computed(()=>projectBom(p as Project,catalog))
const rowCount=computed(()=>groups.value.reduce((n,g)=>n+g.rows.length,0))
const dualReady=computed(()=>selectionConfirmationReady(p as Project))
const ready=computed(()=>groups.value.length>0&&groups.value.every(g=>g.candidate||g.item.kind==='独立物资')&&dualReady.value)
const allowed=computed(()=>['销售','技术','财务','董事长'].includes(role.value))
const exporting=shallowRef(false)
async function exportFile(){if(!allowed.value||!rowCount.value)return;exporting.value=true;try{await downloadBom(p as Project,catalog);toast('BOM Excel 已生成，缺失字段保留为空')}catch{toast('BOM 导出失败，请重试')}finally{exporting.value=false}}
</script>
<template>
 <div class="page-heading" :class="{'bom-heading-embedded':props.embedded}"><div><p class="eyebrow">{{p.id}} / {{p.packageName}} / 需求 V{{p.version}}</p><h1>BOM</h1><p class="muted">销售与技术双确认后生成，关联串、单件、子件、U9 信息和来源依据。</p></div><div class="flex gap-2"><Button :disabled="!allowed||!rowCount||exporting||!dualReady" @click="exportFile">{{exporting?'正在生成…':'导出 BOM Excel'}}</Button></div></div>
 <section v-if="!dualReady" class="panel empty"><AppIcon name="lock-key" :size="40"/><h2>BOM 尚未开放</h2><p>完成销售与技术确认后，才能生成 BOM；技术确认不可省略。</p><Button variant="outline" @click="page='collaboration'">返回询价协作</Button></section>
 <template v-else>
 <div v-if="!allowed" class="panel empty">当前角色无权查看项目 BOM</div>
 <template v-else>
 <div class="notice"><StatusBadge :text="ready?'选型确认版（原型）':'BOM草稿'"/><span>{{groups.length}} 个纳入报价的货物项（含金具串与单件） · {{rowCount}} 条已确认子件。{{p.u9SyncedAt?'U9 价格与技术确认同步自动带出（'+p.u9SyncedAt+'）。':'待销售与技术双确认后自动带出 U9 价格。'}} 单件工艺路线仅保留字段，一期不计入报价；空值继续留存并标记来源。</span></div>
 <section v-for="g in groups" :key="g.item.id" class="panel"><div class="panel-heading"><div><h2>货物项 {{g.item.id}} · {{g.item.name}}</h2><p class="muted">{{g.item.quantity}} {{g.item.unit}} · {{g.candidate?.id||'串型尚未确认'}} · {{g.candidate?.model}}</p></div><StatusBadge :text="g.candidate?'子件已确认':'待技术选型'"/></div>
 <div v-if="!g.candidate&&g.item.kind!=='独立物资'" class="empty"><p>尚未确认的候选不会进入BOM明细。</p><Button variant="outline" @click="page='collaboration'">返回询价协作核对</Button></div>
 <div v-else class="table-wrap"><table><thead><tr><th>包名称</th><th>类别</th><th>名称</th><th>型号</th><th>每套用量</th><th>采购套数</th><th>总用量</th><th>U9料号</th><th>U9子件价格</th><th>图号</th><th>工艺路线</th><th>来源行</th></tr></thead><tbody><tr v-for="r in g.rows" :key="r.part.row"><td>{{p.packageName}}</td><td>{{categoryName}}</td><td>{{r.part.name}}</td><td>{{r.part.model}}</td><td>{{r.part.qty??'待补充'}} {{r.part.unit}}</td><td>{{g.item.quantity}}</td><td>{{r.total??'待补充'}} {{r.part.unit}}</td><td>{{r.part.u9||'待补充'}}</td><td>{{r.u9Price===null?'待同步':'¥'+r.u9Price.toFixed(4)}}</td><td>{{r.part.drawing||'待补充'}}</td><td class="process-route">{{r.processRoute||'待同步'}}</td><td>{{r.part.row}}</td></tr></tbody></table></div></section>
 </template>
 </template>
</template>
