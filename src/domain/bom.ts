import type { Candidate, Project } from './model.ts'
import { included } from './model.ts'
export const bomHeaders=['U9客户单位','需求单位','合同标识符','订单编号','项目名称','工程名称','货物名称','数量','单位','技术联系人','技术问题核对','串料号','串品名','串规格','串描述','名称','型号','数量','料号','品名','规格','描述','图号','U9子件价格','工艺路线']
export const plateHeaders=['型号','总数量(下单总数量)','施工1标','施工2标','料号','品名','规格','描述','图号']
// BOM 只展示可追溯的库价：财务在核价页手填的子件价不是 U9 来源，这里继续留空。
export function projectBom(p:Project,catalog:Candidate[]) {
 return included(p).map(item=>{
  const candidate=item.confirmed?catalog.find(c=>c.id===item.selected):undefined
  if(!candidate&&item.kind==='独立物资'){
   const part={name:item.name,model:item.model||item.spec,qty:1,unit:item.unit,material:'',weight:null,u9:'',drawing:'',row:0}
   const synced=p.u9Data?.['item:'+item.id]
   const u9Price=synced&&synced.price>0?synced.price:null
   return {item,candidate,rows:[{part,total:item.quantity,u9Price,processRoute:synced?.processRoute||'',values:['','','','',p.name,'',item.name,item.quantity,item.unit,p.techOwner,'', '', '', '', '',part.name,part.model,part.qty,part.u9,'','','',part.drawing,u9Price,synced?.processRoute||''] as (string|number|null)[]}]}
  }
  return {item,candidate,rows:(item.partOverrides??candidate?.parts??[]).map(part=>{
   const synced=p.u9Data?.[candidate!.id+':'+part.row]
   const u9Price=synced&&synced.price>0?synced.price:null
   const processRoute=synced?.processRoute||part.processRoute||''
   return {part,total:part.qty===null?null:part.qty*item.quantity,u9Price,processRoute,
    values:['','','','',p.name,'',item.name,item.quantity,item.unit,p.techOwner,'','',candidate!.name,candidate!.model,candidate!.description,part.name,part.model,part.qty,part.u9,'','','',part.drawing,u9Price,processRoute] as (string|number|null)[]
   }
  })}
 })
}
