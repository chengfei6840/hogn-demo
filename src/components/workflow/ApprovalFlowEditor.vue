<script setup lang="ts">
import {computed,shallowRef} from 'vue'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {labelOf,orderedTasks,validateGraph,type DesignGraph,type WorkflowRecord} from '@/domain/workflow-design'
import WorkflowCanvas from './WorkflowCanvas.vue'
import WorkflowProperties from './WorkflowProperties.vue'
const props=defineProps<{record:WorkflowRecord;readonly:boolean}>()
const emit=defineEmits<{save:[record:WorkflowRecord];back:[]}>()
const name=shallowRef(props.record.name);const graph=shallowRef<DesignGraph>(JSON.parse(JSON.stringify(props.record.graph)))
const canvas=shallowRef<InstanceType<typeof WorkflowCanvas>>();const selected=shallowRef('');const kind=shallowRef<'node'|'edge'>('node');const message=shallowRef('')
const tasks=computed(()=>orderedTasks(graph.value))
const element=computed(()=>(kind.value==='node'?graph.value.nodes:graph.value.edges).find(n=>n.id===selected.value)||null)
function sync(){graph.value=JSON.parse(JSON.stringify(canvas.value?.data()||graph.value))}
function select(id:string,type:'node'|'edge'){sync();selected.value=id;kind.value=type}
function replace(data:DesignGraph){graph.value=data;canvas.value?.render(data)}
function add(){
 sync();const data=JSON.parse(JSON.stringify(graph.value)) as DesignGraph;const signer=data.nodes.find(n=>n.properties.action==='issue');const edge=data.edges.find(e=>e.targetNodeId===signer?.id)
 if(!signer||!edge){message.value='请先连接最终签发节点';return}
 const id='approval-'+crypto.randomUUID();const previous=data.nodes.find(n=>n.id===edge.sourceNodeId)!
 data.nodes.push({id,type:'rect',x:signer.x+200,y:(signer.y+previous.y)/2,text:'新增审批',properties:{kind:'task',action:'approve',role:'财务',assignee:'财务 · ',condition:'always'}})
 data.edges=data.edges.filter(e=>e.id!==edge.id);data.edges.push({...edge,targetNodeId:id},{id:'edge-'+id,type:'polyline',sourceNodeId:id,targetNodeId:signer.id})
 replace(data);selected.value=id;kind.value='node';message.value='已在签发前新增审批节点，请填写处理人并应用配置'
}
function remove(){
 sync();const data=JSON.parse(JSON.stringify(graph.value)) as DesignGraph
 if(kind.value==='edge'){data.edges=data.edges.filter(e=>e.id!==selected.value)}else{
  const n=data.nodes.find(n=>n.id===selected.value);if(n?.properties.action==='issue'){message.value='请保留最终报价签发节点';return}
  const before=data.edges.filter(e=>e.targetNodeId===selected.value);const after=data.edges.filter(e=>e.sourceNodeId===selected.value)
  data.nodes=data.nodes.filter(n=>n.id!==selected.value);data.edges=data.edges.filter(e=>e.sourceNodeId!==selected.value&&e.targetNodeId!==selected.value)
  if(before.length===1&&after.length===1)data.edges.push({...before[0],targetNodeId:after[0].targetNodeId})
 }
 replace(data);selected.value='';message.value='已删除，保存前请检查顺序'
}
function check(){sync();const errors=validateGraph(graph.value);message.value=errors.length?errors.join('；'):'检查通过，执行顺序与连线一致';return !errors.length}
function save(){sync();emit('save',{...props.record,name:name.value,graph:graph.value})}
</script>
<template>
 <div class="page-heading"><div><p class="eyebrow">审批签发流程 · V{{record.version}}</p><h1>{{readonly?'查看流程':'编辑流程'}}</h1><p class="muted">按连线顺序逐人审批，最终由指定财务人员签发。</p></div><div class="editor-actions"><Button variant="outline" @click="emit('back')">返回流程台账</Button><Button variant="outline" @click="check">检查流程</Button><Button v-if="!readonly" @click="save">保存草稿</Button></div></div>
 <label class="flow-name">流程名称<Input v-model="name" :disabled="readonly" aria-label="流程名称"/></label>
 <div class="approval-editor"><aside class="panel"><div class="panel-heading"><h2>处理顺序</h2></div><div class="node-outline"><button v-for="(node,index) in tasks" :key="node.id" :class="{selected:selected===node.id}" @click="select(node.id,'node')"><b>{{index+1}} · {{labelOf(node)}}</b><small>{{node.properties.assignee||'待配置处理人'}}</small></button><Button v-if="!readonly" variant="outline" class="add-node" @click="add">＋ 新增审批人</Button></div></aside>
  <section class="panel canvas-panel"><header><b>审批签发画布</b><div class="editor-actions"><Button size="sm" variant="ghost" @click="canvas?.zoom(false)">缩小</Button><Button size="sm" variant="ghost" @click="canvas?.zoom(true)">放大</Button><Button size="sm" variant="outline" @click="canvas?.fit()">适应画布</Button></div></header><WorkflowCanvas ref="canvas" :graph="graph" :readonly="readonly" @select="select" @change="sync"/><footer role="status">{{message||'选择节点配置处理人；拖动锚点修改连线。启用前会校验完整顺序。'}}</footer></section>
  <aside class="panel property-panel"><WorkflowProperties :element="element" :kind="kind" :readonly="readonly" @apply="(text,properties)=>canvas?.update(selected,text,properties)" @remove="remove"/></aside>
 </div>
</template>
<style scoped>.flow-name{display:flex;align-items:center;gap:14px;max-width:500px;white-space:nowrap}.editor-actions{display:flex;gap:8px;flex-wrap:wrap}.approval-editor{display:grid;grid-template-columns:200px minmax(300px,1fr) 250px;gap:14px;flex:1;min-height:600px}.approval-editor>.panel{margin:0}.node-outline>button:not(.add-node){display:block;width:100%;padding:16px;text-align:left;background:white;border:0;border-bottom:1px solid #e7edf3}.node-outline b,.node-outline small{display:block;font-size:12px}.node-outline small{margin-top:6px;font-size:11px}.node-outline>button.selected{background:#eef5fa;box-shadow:inset 3px 0 #075580}.add-node{margin:16px;width:calc(100% - 32px)}.canvas-panel{display:flex;flex-direction:column;min-width:0}.canvas-panel>header{display:flex;align-items:center;justify-content:space-between;padding:12px;border-bottom:1px solid #e6edf2;gap:8px}.canvas-panel :deep(.workflow-graph){flex:1}.canvas-panel>footer{padding:12px;color:#537286;font-size:12px;border-top:1px solid #e6edf2}.property-panel{overflow:auto}@media(max-width:1150px){.approval-editor{grid-template-columns:175px minmax(250px,1fr)}.property-panel{grid-column:1/-1}}@media(max-width:700px){.approval-editor{display:flex;flex-direction:column}.canvas-panel{min-height:550px}}</style>
