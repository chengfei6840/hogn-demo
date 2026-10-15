<script setup lang="ts">
import { computed, reactive, ref, shallowRef, watch } from 'vue'
import { useWorkspace } from '@/domain/store'
import { rolePeople, technicalDirectors } from '@/domain/model'
import { labelOf, orderedTasks } from '@/domain/workflow-design'
import { defaultStageOperators, useWorkflowStore, type StageOperatorKey } from '@/stores/workflow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AppSelect from './AppSelect.vue'
import AppIcon from './AppIcon.vue'
import { useUsersStore } from '@/stores/users'
import { useRolePermissionsStore } from '@/stores/role-permissions'

const { approvalSettings, role, act, toast } = useWorkspace()
const workflowStore = useWorkflowStore()
const usersStore=useUsersStore()
const permissions=useRolePermissionsStore()
const form = reactive({
 amountThreshold: null as number | string | null,
 marginFloor: null as number | string | null,
 stageOperators: { ...defaultStageOperators } as Record<StageOperatorKey, string>,
 approvalAssignees: {} as Record<string, string>,
})
const saving = shallowRef(false)
const taskDrafts=ref<{id:string;name:string;assignee:string;action:'approve'|'issue'}[]>([])
const canEdit = computed(() => (role.value === '董事长' || role.value === '管理员') && permissions.can(role.value,'approval.manage'))
const canEditPolicy = computed(() => role.value === '董事长')
const activeRecord = computed(() => workflowStore.activeRecord)
const tasks = computed(() => activeRecord.value ? orderedTasks(activeRecord.value.graph) : [])
const approvalCards = computed(() => taskDrafts.value.map((draft,index) => ({
 node:{id:draft.id,properties:{kind:'task',role:'财务',action:index===taskDrafts.value.length-1?'issue':'approve',assignee:draft.assignee},text:draft.name},
 level:index===taskDrafts.value.length-1?'签发':`第${index+1}级审批`,label:draft.name,
 hint:index===taskDrafts.value.length-1?'审批完成后由指定财务人员签发正式报价':'按项目审批签发流程顺序处理',
})))
const stageCards=computed<{key:StageOperatorKey;label:string;hint:string;options:string[]}[]>(()=>[
 {key:'technicalConfirmation',label:'技术总监确认',hint:'技术总监复核技术员工提交的结果并确认流转',options:technicalDirectors.filter(person=>usersStore.peopleForRole('技术').includes(person))},
 {key:'costCalculation',label:'成本核算与方案选择',hint:'核对成本、匹配方案并完成整包核价',options:usersStore.peopleForRole('财务')},
 {key:'approvalIssuance',label:'审批签发',hint:'按启用的审批流程逐节点处理并签发报价',options:usersStore.peopleForRole('财务')},
 {key:'salesExternal',label:'销售外发',hint:'向客户发送已签发报价并登记外发信息',options:usersStore.peopleForRole('销售')},
 {key:'dealTracking',label:'成交追踪',hint:'记录客户跟进、议价结果和成交归档',options:usersStore.peopleForRole('销售')},
])

function syncForm() {
 form.amountThreshold = approvalSettings.amountThreshold ?? ''
 form.marginFloor = approvalSettings.marginFloor ?? ''
 const signer = tasks.value.find(task => task.properties.action === 'issue')
 form.stageOperators = { ...defaultStageOperators, ...workflowStore.stageOperators, ...(signer?.properties.assignee ? { approvalIssuance: signer.properties.assignee } : {}) }
 form.approvalAssignees = Object.fromEntries(tasks.value.map(task => [task.id, task.properties.assignee || '']))
 taskDrafts.value=tasks.value.map(task=>({id:task.id,name:labelOf(task),assignee:task.properties.assignee||'',action:task.properties.action==='issue'?'issue':'approve'}))
}
watch([() => approvalSettings.amountThreshold, () => approvalSettings.marginFloor, activeRecord], syncForm, { immediate: true })
function optionsFor(card:{node?:{properties:Record<string, any>}}) {
 const nodeRole = card.node?.properties.role as keyof typeof rolePeople | undefined
 return [...new Set([...(nodeRole ? usersStore.peopleForRole(nodeRole) || [] : []), card.node?.properties.assignee || ''].filter(Boolean))]
}
function assigneeFor(card:{node:{id:string;properties:Record<string, any>}}) {
 return card.node.properties.action === 'issue' ? form.stageOperators.approvalIssuance : form.approvalAssignees[card.node.id]
}
function setAssignee(card:{node:{id:string;properties:Record<string, any>}},value:string) {
 if (card.node.properties.action === 'issue') form.stageOperators.approvalIssuance = value
 else form.approvalAssignees[card.node.id] = value
 const draft=taskDrafts.value.find(task=>task.id===card.node.id);if(draft)draft.assignee=value
}
function addApproval(){if(!canEdit.value)return;const id='review-'+crypto.randomUUID().slice(0,8);const assignee=usersStore.peopleForRole('财务')[0]||'';taskDrafts.value.splice(Math.max(0,taskDrafts.value.length-1),0,{id,name:'新增审批节点',assignee,action:'approve'});form.approvalAssignees[id]=assignee}
function taskName(id:string){return taskDrafts.value.find(task=>task.id===id)?.name||''}
function setTaskName(id:string,name:string){
 if(!canEdit.value)return
 const task=taskDrafts.value.find(task=>task.id===id)
 if(task)task.name=name
}
function enableRecord(id:string){
 if(!canEdit.value)return
 if(workflowStore.enable(id))toast('已启用流程版本，新报价包将使用此版本')
 else toast(workflowStore.error||'流程版本启用失败')
}
function disableRecord(id:string){
 if(!canEdit.value)return
 if(workflowStore.disable(id))toast('已停用流程版本，请启用一个有效版本后创建新报价包')
 else toast(workflowStore.error||'流程版本停用失败')
}
function removeApproval(id:string){if(taskDrafts.value.filter(task=>task.action==='approve').length<=1){toast('审批流程至少保留一位审批人');return}taskDrafts.value=taskDrafts.value.filter(task=>task.id!==id);delete form.approvalAssignees[id]}
function moveApproval(id:string,delta:number){const index=taskDrafts.value.findIndex(task=>task.id===id);const target=index+delta;if(index<0||index===taskDrafts.value.length-1||target<0||target>=taskDrafts.value.length-1)return;const next=[...taskDrafts.value];const [entry]=next.splice(index,1);next.splice(target,0,entry);taskDrafts.value=next}
function graphDraft(){
 if(!activeRecord.value)return undefined
 const graph=JSON.parse(JSON.stringify(activeRecord.value.graph)) as typeof activeRecord.value.graph
 const start=graph.nodes.find(node=>node.properties.kind==='start')!;const end=graph.nodes.find(node=>node.properties.kind==='end')!
 const old=new Map(graph.nodes.filter(node=>node.properties.kind==='task').map(node=>[node.id,node]))
 const tasks=taskDrafts.value.map((draft,index)=>{const node=old.get(draft.id)||{id:draft.id,type:'rect',x:260,y:190,properties:{}};node.x=260;node.y=190+(index*120);node.text=draft.name;node.properties={kind:'task',role:'财务',assignee:draft.id===taskDrafts.value.at(-1)?.id?form.stageOperators.approvalIssuance:form.approvalAssignees[draft.id]||draft.assignee,action:index===taskDrafts.value.length-1?'issue':'approve',condition:'always'};return node})
 graph.nodes=[start,...tasks,end];graph.edges=[...graph.nodes.slice(1).map((node,index)=>({id:`edge-${index}`,type:'polyline',sourceNodeId:graph.nodes[index].id,targetNodeId:node.id}))];return graph
}
function policyChanged() {
 return form.amountThreshold !== (approvalSettings.amountThreshold ?? '') || form.marginFloor !== (approvalSettings.marginFloor ?? '')
}
function save() {
 if (!canEdit.value || saving.value) return
 saving.value = true
 try {
  if (policyChanged()) {
   if (!canEditPolicy.value) { toast('金额阈值和毛利红线仅董事长可以保存'); return }
   const saved = act('settings', { amountThreshold: form.amountThreshold === '' ? null : Number(form.amountThreshold), marginFloor: form.marginFloor === '' ? null : Number(form.marginFloor) })
   if (!saved) return
  }
  const savedTemplate = workflowStore.saveTemplate(form.stageOperators, form.approvalAssignees, graphDraft())
  if (!savedTemplate) { toast(workflowStore.error || '审批模板保存失败'); return }
  toast('审批流程与业务参数配置已保存，新报价包将继承最新模板')
 } finally {
  saving.value = false
 }
}
</script>

<template>
 <div class="approval-template-page">
  <section class="template-hero panel">
   <div class="template-hero-copy"><div class="template-icon"><AppIcon name="sliders-horizontal" :size="20"/></div><div><h2>审批流程与业务阈值参数配置</h2><p>统一配置报价业务阈值与全流程默认操作人员；新建报价包时可基于模板单独调整审批人。</p></div></div>
   <Button v-if="canEdit" class="template-save" :disabled="saving" @click="save"><AppIcon name="check" :size="16"/>{{saving?'保存中…':'保存配置模板'}}</Button>
  </section>

  <section class="template-section panel">
   <div class="template-section-heading"><div><h3>报价风险提醒</h3><p>金额阈值和毛利红线用于提示财务与董事长关注，不增加审批节点。</p></div></div>
   <div class="threshold-grid">
    <label class="threshold-card"><span>整份报价含税金额提醒值（元）</span><small>达到后在核价页显示风险提醒</small><Input v-model="form.amountThreshold" type="number" min="0" :disabled="!canEditPolicy" placeholder="留空表示未配置"/></label>
    <label class="threshold-card"><span>毛利率提醒红线（%）</span><small>低于后在核价页显示风险提醒</small><Input v-model="form.marginFloor" type="number" min="0" max="100" :disabled="!canEditPolicy" placeholder="留空表示未配置"/></label>
   </div>
  </section>

  <section class="template-section panel">
   <div class="template-section-heading"><div><h3><AppIcon name="users-three" :size="18"/>项目流程负责人模板</h3><p>配置技术确认及后续业务阶段；资料解析和销售需求确认由创建报价包的销售本人负责，无需单独配置。</p></div><span class="template-badge">后续阶段</span></div>
   <div class="stage-card-grid">
    <article v-for="card in stageCards" :key="card.key" class="operator-card"><label>{{card.label}}</label><AppSelect v-model="form.stageOperators[card.key]" :label="'选择 '+card.label+' 负责人'" :options="card.options" :disabled="!canEdit"/><p>{{card.hint}}</p></article>
   </div>
  </section>

  <section class="template-section panel approval-template-section">
   <div class="template-section-heading"><div><h3>审批签发流程</h3><p>按顺序配置审批节点与签发人；新建报价包时可单独调整本包审批参与人。</p></div><span class="template-badge">按流程节点</span></div>
   <div v-if="!activeRecord" class="template-empty">当前没有启用的审批流程，请先启用流程模板。</div>
   <div v-else class="approval-card-grid">
    <article v-for="(card,index) in approvalCards" :key="card.node.id" class="approval-card"><div class="approval-card-heading"><label>{{card.level}}</label><span>{{card.node.properties.action==='issue'?'最终签发':'审批'}}</span></div><Input :model-value="taskName(card.node.id)" :disabled="!canEdit" aria-label="审批节点名称" @update:model-value="setTaskName(card.node.id,String($event))"/><AppSelect :model-value="assigneeFor(card)" @update:model-value="setAssignee(card,$event)" :label="'选择 '+card.label" :options="optionsFor(card)" :disabled="!canEdit"/><p>{{card.hint}}</p><div v-if="card.node.properties.action!=='issue'" class="approval-actions"><Button size="sm" variant="ghost" :disabled="!canEdit||index===0" @click="moveApproval(card.node.id,-1)">上移</Button><Button size="sm" variant="ghost" :disabled="!canEdit||index>=approvalCards.length-2" @click="moveApproval(card.node.id,1)">下移</Button><Button size="sm" variant="ghost" :disabled="!canEdit||approvalCards.filter(entry=>entry.node.properties.action==='approve').length<=1" @click="removeApproval(card.node.id)">删除</Button></div></article>
   </div>
   <div v-if="activeRecord" class="approval-editor-footer"><span>当前 {{taskDrafts.length}} 个节点 · 审批至少 1 人 · 签发固定为最后一项</span><Button variant="outline" :disabled="!canEdit" @click="addApproval">新增审批节点</Button></div>
   <div v-if="activeRecord" class="template-note"><AppIcon name="info" :size="15"/>当前模板：{{activeRecord.name}} · V{{activeRecord.version}}；保存后会生成新版本，已创建报价包的审批快照不受影响。</div>
  </section>
  <section class="template-section panel"><div class="template-section-heading"><div><h3>流程版本记录</h3><p>启用的版本用于新建报价包，已创建报价包仍沿用创建时保存的流程快照。</p></div><span class="template-badge">{{workflowStore.records.length}} 个版本</span></div><div class="workflow-record-list"><article v-for="record in workflowStore.records" :key="record.id" class="workflow-record"><div><b>{{record.name}} · V{{record.version}}</b><small>{{record.status==='enabled'?'已启用':record.status==='draft'?'草稿':'已停用'}} · {{record.updatedAt}}</small></div><Button v-if="record.status!=='enabled'" size="sm" variant="outline" :disabled="!canEdit" @click="enableRecord(record.id)">启用此版本</Button><Button v-else size="sm" variant="ghost" :disabled="!canEdit" @click="disableRecord(record.id)">停用</Button></article><p v-if="!workflowStore.records.length" class="template-empty">暂无流程记录</p></div></section>
 </div>
</template>

<style scoped>
.approval-template-page{display:flex;flex-direction:column;gap:14px;padding-bottom:24px}.panel{margin:0}.template-hero{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:18px 22px}.template-hero-copy{display:flex;align-items:center;gap:12px}.template-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:10px;background:#edf5fa;color:#075580}.template-hero h2{margin:0;color:#1f3445;font-size:19px}.template-hero p,.template-section-heading p{margin:5px 0 0;color:#758391;font-size:12px}.template-save{background:#eaf3fb!important;border-color:#cbdfea!important;color:#075580!important}.template-save:hover:not(:disabled){background:#dcecf8!important}.template-section{padding:18px 22px}.template-section-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;border-bottom:1px solid #edf1f5;padding-bottom:12px;margin-bottom:14px}.template-section-heading h3{display:flex;align-items:center;gap:7px;margin:0;color:#283c4b;font-size:15px}.template-badge{flex:none;border:1px solid #d5e3ed;border-radius:999px;background:#edf5fa;color:#075580;padding:5px 10px;font-size:10px;font-weight:700}.threshold-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.threshold-card{display:grid;grid-template-columns:minmax(0,1fr) 1.35fr;align-items:center;gap:3px 14px;padding:13px 14px;border:1px solid #e0e6eb;border-radius:9px}.threshold-card span{font-size:12px;font-weight:700;color:#344a59}.threshold-card small{grid-column:1;color:#9aa6af;font-size:10px}.threshold-card input{grid-row:1/3;grid-column:2;height:36px}.stage-card-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}.operator-card,.approval-card{padding:12px;border:1px solid #e0e6eb;border-radius:10px;background:#fbfdff}.operator-card label,.approval-card label{display:block;margin-bottom:8px;color:#344a59;font-size:12px;font-weight:700}.operator-card p,.approval-card p{margin:6px 0 0;color:#98a3ab;font-size:10px;line-height:1.5}.approval-template-section{border-color:#d5e3ed;background:linear-gradient(135deg,#f1f7fb,#fff)}.approval-card-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.approval-card{border-color:#d5e3ed;background:#fff}.approval-card-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}.approval-card-heading span{border:1px solid #d5e3ed;border-radius:999px;padding:2px 7px;color:#075580;font-size:9px}.template-note{display:flex;align-items:center;gap:6px;margin-top:12px;color:#587083;font-size:11px}.template-empty{padding:14px;border-radius:8px;background:#fff8ed;color:#9a6b42;font-size:12px}@media(max-width:1150px){.stage-card-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.approval-card-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:700px){.template-hero{align-items:flex-start;flex-direction:column}.threshold-grid,.stage-card-grid,.approval-card-grid{grid-template-columns:1fr}.template-section,.template-hero{padding:14px}.threshold-card{grid-template-columns:1fr}.threshold-card small{grid-column:1}.threshold-card input{grid-row:auto;grid-column:1}}
.approval-actions,.approval-editor-footer,.workflow-record{display:flex;align-items:center;justify-content:space-between;gap:8px}.approval-actions{margin-top:8px}.approval-editor-footer{margin-top:12px;padding-top:12px;border-top:1px solid #edf1f5;color:#758391;font-size:11px}.workflow-record-list{display:grid;gap:8px}.workflow-record{padding:12px;border:1px solid #e0e6eb;border-radius:8px;background:#fbfdff}.workflow-record b,.workflow-record small{display:block}.workflow-record b{font-size:12px;color:#344a59}.workflow-record small{margin-top:4px;color:#8393a0;font-size:10px}@media(max-width:700px){.approval-editor-footer,.workflow-record{align-items:flex-start;flex-direction:column}}</style>
