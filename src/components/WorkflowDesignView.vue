<script setup lang="ts">
import {computed,shallowRef} from 'vue'
import {Button} from '@/components/ui/button'
import {useWorkspace} from '@/domain/store'
import {useWorkflowStore} from '@/stores/workflow'
import {defaultGraph,type WorkflowRecord} from '@/domain/workflow-design'
import WorkflowRecordTable from './workflow/WorkflowRecordTable.vue'
import ApprovalFlowEditor from './workflow/ApprovalFlowEditor.vue'
import FormDialog from './FormDialog.vue'
const props=defineProps<{embedded?:boolean}>();const store=useWorkflowStore();const {role,toast}=useWorkspace()
const editing=shallowRef<WorkflowRecord|null>(null);const removeId=shallowRef('')
const editable=computed(()=>['管理员','董事长'].includes(role.value))
const readonly=computed(()=>!editable.value||editing.value?.status==='enabled')
function create(source?:WorkflowRecord){editing.value={id:'AP-'+crypto.randomUUID().slice(0,8).toUpperCase(),name:source?source.name+'（修订）':'新审批签发流程',version:source?source.version+1:1,status:'draft',updatedAt:'尚未保存',graph:source?JSON.parse(JSON.stringify(source.graph)):defaultGraph()}}
function save(record:WorkflowRecord){if(editable.value&&store.save(record)){editing.value=null;toast('流程草稿已保存，可在台账启用')}}
function enable(id:string){if(editable.value&&store.enable(id))toast('已启用该流程，后续提交审批的包将按本记录执行')}
</script>
<template>
 <template v-if="!editing"><div v-if="!props.embedded" class="page-heading"><div><p class="eyebrow">系统管理</p><h1>流程设计</h1><p class="muted">管理审批签发阶段的流程记录，按启用记录分派具体处理人。</p></div><Button v-if="editable" @click="create()">新建流程</Button></div><div v-else class="embedded-flow-actions"><p class="muted">管理审批签发阶段的流程记录，按启用记录分派具体处理人。</p><Button v-if="editable" @click="create()">新建流程</Button></div>
 <div class="notice"><span><b>{{store.activeRecord?'当前启用：'+store.activeRecord.name+' · V'+store.activeRecord.version:'当前没有启用的流程'}}</b><br/>每次提交审批引用当时启用的记录；审批中的包继续使用已绑定版本。</span></div>
 <WorkflowRecordTable :records="store.records" :editable="editable" @edit="editing=JSON.parse(JSON.stringify($event))" @copy="create" @enable="enable" @disable="store.disable($event)" @remove="removeId=$event"/>
 </template>
 <ApprovalFlowEditor v-else :key="editing.id" :record="editing" :readonly="readonly" @save="save" @back="editing=null"/>
 <p v-if="store.error" role="alert" class="flow-error">{{store.error}}</p>
 <FormDialog :model-value="!!removeId" title="删除流程草稿" description="删除后将从台账移除，已绑定的审批记录会保留。" @update:model-value="!$event&&(removeId='')"><Button @click="store.remove(removeId)&&(removeId='')">确认删除</Button></FormDialog>
</template>
<style scoped>.flow-error{color:#a54032;margin-top:12px;font-size:13px}.embedded-flow-actions{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}</style>
