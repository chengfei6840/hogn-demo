<script setup lang="ts">
import {onMounted,onBeforeUnmount,shallowRef} from 'vue'
import LogicFlow from '@logicflow/core'
import '@logicflow/core/dist/index.css'
import type {DesignGraph} from '@/domain/workflow-design'
const props=defineProps<{graph:DesignGraph;readonly?:boolean}>()
const emit=defineEmits<{select:[id:string,kind:'node'|'edge'];change:[]}>()
const container=shallowRef<HTMLDivElement>();let lf:LogicFlow|undefined;let observer:ResizeObserver|undefined
onMounted(()=>{if(!container.value)return;lf=new LogicFlow({container:container.value,grid:{size:20,type:'dot'},background:{backgroundColor:'#f7f9fc'},keyboard:{enabled:false},stopScrollGraph:true,adjustNodePosition:!props.readonly,adjustEdge:!props.readonly,hideAnchors:props.readonly,nodeTextEdit:false,edgeTextEdit:false});lf.setTheme({rect:{width:150,height:56,radius:10,stroke:'#80a3bb',fill:'#fff'},circle:{r:32,stroke:'#438569',fill:'#edf7f1'},diamond:{rx:70,ry:36,stroke:'#c39a58',fill:'#fff8eb'},polyline:{stroke:'#8da4b5'},nodeText:{fontSize:12},edgeText:{fontSize:11}});lf.render(JSON.parse(JSON.stringify(props.graph)));lf.fitView(40,40);lf.on('node:click',({data})=>emit('select',data.id,'node'));lf.on('edge:click',({data})=>emit('select',data.id,'edge'));lf.on('node:add,node:delete,node:drop,edge:add,edge:delete,edge:adjust,text:update',()=>emit('change'));observer=new ResizeObserver(()=>lf?.resize());observer.observe(container.value)})
onBeforeUnmount(()=>{observer?.disconnect();lf?.destroy()})
defineExpose({data:()=>lf?.getGraphRawData() as DesignGraph,render:(data:DesignGraph)=>{lf?.render(JSON.parse(JSON.stringify(data)));lf?.fitView(40,40)},add:(type:string,name:string,kind:string)=>{const position=lf?.getPointByClient(container.value!.getBoundingClientRect().left+container.value!.clientWidth/2,container.value!.getBoundingClientRect().top+container.value!.clientHeight/2);const node=lf?.addNode({type,x:position?.canvasOverlayPosition.x||300,y:position?.canvasOverlayPosition.y||300,text:name,properties:{kind,role:kind==='task'?'财务':'',completion:'all',returnPolicy:'reapprove'}});if(node)emit('select',node.id,'node')},remove:(id:string,kind:string)=>{if(kind==='edge')lf?.deleteEdge(id);else lf?.deleteNode(id)},update:(id:string,text:string,properties:Record<string,any>)=>{lf?.updateText(id,text);lf?.setProperties(id,properties);emit('change')},zoom:(value:boolean)=>lf?.zoom(value),fit:()=>lf?.fitView(40,40)})
</script>
<template><div ref="container" class="workflow-graph" aria-label="流程画布：拖动节点移动，拖动节点锚点连接后续节点"/></template>
<style scoped>.workflow-graph{width:100%;height:100%;min-height:500px}</style>
