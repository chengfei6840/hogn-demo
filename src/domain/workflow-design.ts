export interface DesignNode { id:string; type:string; x:number; y:number; text?:string|{value:string;x?:number;y?:number}; properties:Record<string,any> }
export interface DesignEdge { id:string; type:string; sourceNodeId:string; targetNodeId:string; text?:string|{value:string}; properties?:Record<string,any> }
export interface DesignGraph {nodes:DesignNode[];edges:DesignEdge[]}
export interface WorkflowRecord {
 id:string; name:string; version:number; status:'draft'|'enabled'|'disabled'; updatedAt:string; graph:DesignGraph
}
export const labelOf=(item:DesignNode|DesignEdge)=>typeof item.text==='string'?item.text:item.text?.value||''
export function defaultGraph():DesignGraph {
 const task=(id:string,y:number,name:string,assignee:string,action='approve',condition='always',role='财务'):DesignNode=>({id,type:'rect',x:260,y,text:name,properties:{kind:'task',role,assignee,action,condition}})
 const nodes:DesignNode[]=[
  {id:'start',type:'circle',x:260,y:70,text:'审批开始',properties:{kind:'start'}},
  task('review',190,'核价复核','财务 · 张会计'),
  task('manager',310,'财务审批','财务 · 李经理'),
  task('issue',430,'报价签发','财务 · 王总监','issue'),
  {id:'end',type:'circle',x:260,y:550,text:'签发完成',properties:{kind:'end'}}
 ]
 return {nodes,edges:nodes.slice(1).map((n,i)=>({id:'edge-'+i,type:'polyline',sourceNodeId:nodes[i].id,targetNodeId:n.id}))}
}
// Execution follows connections, never canvas positions or labels.
export function orderedTasks(graph:DesignGraph):DesignNode[] {
 const start=graph.nodes.find(n=>n.properties.kind==='start');const result:DesignNode[]=[];const seen=new Set<string>();let node=start
 while(node&&!seen.has(node.id)){
  seen.add(node.id);if(node.properties.kind==='task')result.push(node)
  const edge=graph.edges.find(e=>e.sourceNodeId===node!.id)
  node=graph.nodes.find(n=>n.id===edge?.targetNodeId)
 }
 return result
}
export function validateGraph(graph:DesignGraph):string[] {
 const errors:string[]=[];const ids=new Set(graph.nodes.map(n=>n.id));const starts=graph.nodes.filter(n=>n.properties.kind==='start');const ends=graph.nodes.filter(n=>n.properties.kind==='end')
 if(ids.size!==graph.nodes.length)errors.push('节点编号不能重复')
 if(starts.length!==1||ends.length!==1)errors.push('需要一个审批开始节点和一个签发完成节点')
 if(graph.edges.some(e=>!ids.has(e.sourceNodeId)||!ids.has(e.targetNodeId)))errors.push('存在悬空连线')
 for(const n of graph.nodes){
  if(!labelOf(n).trim())errors.push('节点名称不能为空')
  if(!['start','end','task'].includes(n.properties.kind))errors.push('审批签发流程仅支持按顺序处理的人工作业节点')
  const incoming=graph.edges.filter(e=>e.targetNodeId===n.id).length;const outgoing=graph.edges.filter(e=>e.sourceNodeId===n.id).length
  if(incoming!==(n.properties.kind==='start'?0:1)||outgoing!==(n.properties.kind==='end'?0:1))errors.push('请将节点连接为从开始到签发完成的一条有序流程')
  if(n.properties.kind==='task'){
   if(n.properties.role!=='财务')errors.push(labelOf(n)+'请选择财务角色')
   if(typeof n.properties.assignee!=='string'||!n.properties.assignee.trim()||!n.properties.assignee.startsWith(n.properties.role+' · '))errors.push(labelOf(n)+'请填写与角色对应的具体处理人')
   if(!['approve','issue'].includes(n.properties.action))errors.push(labelOf(n)+'请指定审批或签发动作')
   if(n.properties.condition!=='always')errors.push(labelOf(n)+'只支持每次均执行')
   if(n.properties.action==='issue'&&(n.properties.role!=='财务'||n.properties.condition!=='always'))errors.push('最终签发必须由指定财务人员执行')
  }
 }
 const tasks=orderedTasks(graph);const allTasks=graph.nodes.filter(n=>n.properties.kind==='task')
 const seen=new Set<string>();let id=starts[0]?.id
 while(id&&!seen.has(id)){seen.add(id);id=graph.edges.find(e=>e.sourceNodeId===id)?.targetNodeId}
 if(seen.size!==graph.nodes.length||!ends.every(n=>seen.has(n.id))||tasks.length!==allTasks.length)errors.push('存在断开的节点或循环连线')
 if(!tasks.some(n=>n.properties.action==='approve'))errors.push('至少配置一位审批人')
 if(tasks.filter(n=>n.properties.action==='issue').length!==1||tasks.at(-1)?.properties.action!=='issue')errors.push('最后一个处理节点必须是唯一的报价签发节点')
 if(tasks.some(n=>n.properties.role==='董事长'||n.properties.condition==='chairman'))errors.push('审批流程仅配置财务审批与签发节点')
 return [...new Set(errors)]
}
export function recordPeople(graph:DesignGraph){
 const tasks=graph.nodes.filter(n=>n.properties.kind==='task')
 return {regular:new Set(tasks.filter(n=>n.properties.condition!=='chairman').map(n=>n.properties.assignee).filter(Boolean)).size,conditional:tasks.filter(n=>n.properties.condition==='chairman').length}
}
