<script setup lang="ts">
import {computed,shallowRef} from 'vue'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import AppSelect from '../AppSelect.vue'
import StatusBadge from '../StatusBadge.vue'
import {recordPeople,orderedTasks,labelOf,type WorkflowRecord} from '@/domain/workflow-design'
const props=defineProps<{records:WorkflowRecord[];editable:boolean}>()
const emit=defineEmits<{edit:[record:WorkflowRecord];copy:[record:WorkflowRecord];enable:[id:string];disable:[id:string];remove:[id:string]}>()
const query=shallowRef('');const status=shallowRef('全部状态')
const statusText={draft:'草稿',enabled:'已启用',disabled:'已停用'}
const rows=computed(()=>props.records.filter(r=>(status.value==='全部状态'||statusText[r.status]===status.value)&&(r.name+r.id).includes(query.value.trim())).map(r=>({...r,people:recordPeople(r.graph),path:orderedTasks(r.graph).map(n=>labelOf(n)).join(' → ')})))
</script>
<template>
 <section class="panel ledger-panel workflow-ledger">
  <div class="panel-heading ledger-filters"><h2>审批签发流程台账 <span class="count">{{records.length}} 条</span></h2><Input v-model="query" aria-label="搜索流程" placeholder="搜索流程名称或编号"/><AppSelect v-model="status" label="流程状态" :options="['全部状态','已启用','草稿','已停用']"/></div>
  <div class="ledger-table"><table><thead><tr><th>流程名称 / 编号</th><th>生效阶段</th><th>常规处理人数</th><th>处理顺序</th><th>版本</th><th>状态</th><th>更新时间</th><th>操作</th></tr></thead><tbody><tr v-for="r in rows" :key="r.id"><td><b>{{r.name}}</b><small>{{r.id}}</small></td><td>审批签发</td><td><b>{{r.people.regular}} 人</b><small>含最终签发人；董事长按条件参与</small></td><td class="path-cell">{{r.path}}</td><td>V{{r.version}}</td><td><StatusBadge :text="statusText[r.status]"/></td><td>{{r.updatedAt}}</td><td><div class="record-actions"><Button size="sm" variant="outline" @click="emit('edit',r)">{{editable&&r.status!=='enabled'?'编辑设计':'查看设计'}}</Button><template v-if="editable"><Button size="sm" variant="ghost" @click="emit('copy',r)">复制</Button><Button v-if="r.status!=='enabled'" size="sm" @click="emit('enable',r.id)">启用</Button><Button v-else size="sm" variant="outline" @click="emit('disable',r.id)">停用</Button><Button v-if="r.status!=='enabled'" size="sm" variant="ghost" @click="emit('remove',r.id)">删除</Button></template></div></td></tr></tbody></table><div v-if="!rows.length" class="empty">暂无符合条件的流程记录</div></div>
 </section>
</template>
<style scoped>.workflow-ledger{min-height:380px;margin:0}.path-cell{min-width:210px;max-width:280px;line-height:1.8}.record-actions{display:flex;justify-content:center;align-items:center;gap:6px;flex-wrap:wrap;min-width:210px}</style>
