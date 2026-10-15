<script setup lang="ts">
import {computed,shallowRef} from 'vue'
import {Button} from '@/components/ui/button'
import {Textarea} from '@/components/ui/textarea'
import {useWorkspace} from '@/domain/store'
import {useWorkflowStore} from '@/stores/workflow'
import {currentApprovalStep,canHandleApproval} from '@/domain/approval-workflow'
import {canIssueQuote} from '@/domain/model'
import {labelOf,orderedTasks} from '@/domain/workflow-design'
import StatusBadge from '../StatusBadge.vue'
import FormDialog from '../FormDialog.vue'
const props=defineProps<{dirty:boolean}>()
const {package:p,role,person,act,approvalReasons}=useWorkspace();const workflows=useWorkflowStore()
const run=computed(()=>p.approvalRun);const current=computed(()=>currentApprovalStep(p.approvalRun))
const assigned=computed(()=>canHandleApproval(p.approvalRun,role.value,person.value))
const issueAllowed=computed(()=>canIssueQuote(p as Project,role.value,person.value))
const preview=computed(()=>workflows.activeRecord?orderedTasks(workflows.activeRecord.graph):[])
const submitting=computed(()=>p.stage==='财务核价')
const open=shallowRef(false);const action=shallowRef('completeApproval');const reason=shallowRef('')
function show(value:string){action.value=value;reason.value='';open.value=true}
const statusText={pending:'待处理',done:'已完成',skipped:'未触发条件'}
</script>
<template>
 <section class="panel approval-tasks"><div class="panel-heading"><div><h2>审批签发</h2><p class="muted" v-if="run">已绑定 {{run.recordName}} · V{{run.recordVersion}} · {{run.startedAt}}</p><p class="muted" v-else>提交时读取流程台账中已启用的记录</p></div><StatusBadge :text="run?.status==='returned'?'已退回核价':run?.status==='completed'?'签发完成':run?'审批处理中':'待提交'"/></div>
  <div class="panel-body"><p v-if="approvalReasons.length" class="notice amber">报价风险提醒：{{approvalReasons.join('；')}}。</p>
   <template v-if="submitting"><div class="approval-target"><b>{{workflows.activeRecord?'本次将采用：'+workflows.activeRecord.name+' · V'+workflows.activeRecord.version:'尚未启用审批签发流程'}}</b><p v-if="workflows.activeRecord" class="muted">{{preview.map(n=>labelOf(n)+'（'+n.properties.assignee+'）').join(' → ')}}</p></div><p v-if="run?.status==='returned'" class="notice amber">退回原因：{{run.returnReason}}<small v-if="run.returnedBy">退回人：{{run.returnedBy}}<span v-if="run.returnedAt"> · {{run.returnedAt}}</span></small></p><div class="approval-actions"><span class="muted">{{dirty?'先保存草稿，再使用上方按钮提交审批。':'在上方按钮提交审批；提交前会校验计价口径和子件价格。'}}</span></div></template>
   <div v-else-if="current" class="current-task"><div><span class="muted">当前处理节点</span><h3>{{current.name}}</h3><p>{{current.assignee}}</p></div><div class="approval-actions"><template v-if="assigned"><Button variant="outline" @click="show('return')">退回核价</Button><Button v-if="current.action==='approve'" @click="show('completeApproval')">通过并流转</Button><Button v-if="issueAllowed" @click="act('issue')">签发正式报价</Button></template><span v-else class="muted">等待 {{current.assignee}} 处理</span></div></div>
   <div v-if="run" class="table-wrap"><table><thead><tr><th>顺序</th><th>节点名称</th><th>指定处理人</th><th>类型</th><th>状态</th><th>处理意见 / 时间</th></tr></thead><tbody><tr v-for="(step,index) in run.steps" :key="step.id" :class="{'active-task':current?.id===step.id}"><td>{{index+1}}</td><td>{{step.name}}</td><td>{{step.assignee}}</td><td>{{step.action==='issue'?'签发':step.condition==='chairman'?'历史条件审批':'审批'}}</td><td><StatusBadge :text="current?.id===step.id?'当前待处理':step.status==='skipped'&&step.role==='董事长'?'流程调整已跳过':statusText[step.status]"/></td><td>{{step.opinion||'—'}}<small>{{step.completedAt}}</small></td></tr></tbody></table></div>
  </div>
 </section>
 <FormDialog v-model="open" :title="action==='return'?'退回核价':'提交审批意见'" :description="current?.name+' · '+current?.assignee"><label>意见与依据<Textarea v-model="reason" aria-label="审批意见" placeholder="填写本节点的审核结论或退回原因"/></label><Button @click="act(action,{reason})&&(open=false)">确认提交</Button></FormDialog>
</template>
<style scoped>.approval-tasks{margin-bottom:18px}.approval-target{padding:14px 16px;background:#f4f8fc;border-radius:8px;margin-bottom:16px;line-height:1.9}.approval-target p{margin:6px 0 0}.approval-target .notice small{display:block;margin-top:4px;color:#8a6a3d}.current-task{padding:16px;background:#eef6fb;border:1px solid #d6e8f4;border-radius:8px;display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}.current-task h3{margin:7px 0}.current-task p{margin:0}.approval-actions{display:flex;gap:10px;align-items:center;justify-content:flex-end;flex-wrap:wrap}.active-task{background:#f0f7fc}.approval-tasks .table-wrap{max-height:none}@media(max-width:800px){.current-task{align-items:flex-start;flex-direction:column}}</style>
