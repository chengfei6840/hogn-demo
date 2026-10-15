import type { Item, Part, Project } from '../domain/model.ts'
import { selectionRegion, technicalCodeFor, type PartOption, type PartSelectionHistory } from '../domain/part-selection.ts'
import { goodsListRows } from './goodsList.ts'

const clamp=(model:string,u9:string,drawing:string,weight:number)=>({name:'悬垂线夹',model,material:'ZL102',u9,drawing,weight,unit:'件'})
// 包缠物型号、材质和关联线夹按用户提供的图册附表组织。
// L3/LF10 与料号的组合只用于演示；不修改原始 U9、标准品库和图册文件。
const wrappingOptions:PartOption[]=['L3','LF10'].flatMap(material=>[
  {id:`aluminum-${material}`,model:'1×10',material,u9:'101052501002',drawing:'图5-1-2 · ⑦',
    weight:.22,unit:'件',detail:'铝包带',kind:'铝',conductor:'400/50',
    linkedPart:clamp('XG-6034','101070501053','1023933',4)},
  {id:`guard-${material}`,model:'FYH-400/50',material,u9:'101053201032',drawing:'5020842',
    weight:2.8,unit:'件',detail:'护线条',kind:'护',conductor:'400/50',
    linkedPart:clamp('XG-6046','101070501021','1023794',5.4)}
])
export const jc1Options:PartOption[]=[
  {id:'jc1-stainless',model:'JC-1,绝缘(黑)',material:'',u9:'101047201029',drawing:'6112631',weight:null,unit:'件',detail:'不锈钢螺栓，配绝缘罩'},
  {id:'jc1-galvanized',model:'JC-1,绝缘(黑)',material:'',u9:'101047201038',drawing:'6112640-00',weight:null,unit:'件',detail:'热镀锌螺栓，配绝缘罩'}
]

// 普通缺项只保留两条，避免演示中重复补录。能对应标准品库的字段使用档案值，
// 未找到档案的料号/图号用明确的 DEMO 标识补齐，不代表真实 U9 主数据。
const ordinaryDemoDefaults:Record<string,Partial<Pick<Part,'material'|'u9'|'drawing'>>>={
  'FJGY-637/28C':{material:'ZL102'},
  'FJY-80/760/340':{u9:'DEMO-U9-71456',drawing:'DEMO-DRAWING-71456'},
  'GJTW-133/10-13':{material:'Q235A',u9:'DEMO-U9-71457',drawing:'DEMO-DRAWING-71457'},
  'MGF-130/113':{u9:'101080901013',drawing:'7053020'},
  'WSJ-10145':{material:'35#',u9:'101060804002',drawing:'3010334-00'},
  'XGS-10046/400':{u9:'DEMO-U9-2792',drawing:'DEMO-DRAWING-2792'},
  'EB-21/42-120':{drawing:'3054171'},
  'FZC-30':{u9:'101053702016',drawing:'5050965'}
}
function completeOrdinaryDemoParts(item:Item,parts:Part[]):Part[] {
  return parts.map(part=>{
    if(part.selection||(item.id==='01'&&part.row===71454))return part
    if(item.id==='03'&&part.row===69907)return {...part,drawing:(part.drawing||'').trim()?part.drawing:'DEMO-DRAWING-69907'}
    const defaults=ordinaryDemoDefaults[part.model]
    if(!defaults)return part
    return {...part,material:(part.material||'').trim()?part.material:defaults.material||part.material,
      u9:(part.u9||'').trim()?part.u9:defaults.u9||part.u9,
      drawing:(part.drawing||'').trim()?part.drawing:defaults.drawing||part.drawing}
  })
}

export function demoPartOverrides(item:Item,parts:Part[]):Part[] {
  if(!item.source.startsWith('演示询价清单.xlsx')||item.kind!=='金具串')return parts
  const next=parts.map(part=>({...part}))
  if(item.id==='01'){
    const target=next.find(part=>part.row===71462&&part.name==='U型螺栓')
    if(target&&!target.technicalChanges?.length)Object.assign(target,{name:'C型线夹',model:'JC-1,绝缘(黑)',
      material:'',u9:'',drawing:'',selection:{key:'jc1',source:'standard-jc1',options:jc1Options,demo:true}})
  }
  if(item.id==='03'&&item.conductor==='400/50'&&/^7X2-4055/.test(item.model)){
    const target=next.find(part=>/护线条|铝包带/.test(part.name))
    const linked=next.find(part=>part.name==='悬垂线夹')
    if(target&&!target.technicalChanges?.length)Object.assign(target,{name:'导线包缠物',model:'',material:'',u9:'',drawing:'',qty:1,unit:'件',
      selection:{key:'wrapping',source:'wrap-atlas',options:wrappingOptions,linkedRow:linked?.row,demo:true}})
  }
  return completeOrdinaryDemoParts(item,next)
}

export function demoRecommendation(project:Pick<Project,'region'>,item:Item):PartSelectionHistory | undefined {
  if(!item.partOverrides?.some(part=>part.selection?.key==='wrapping'))return undefined
  if(technicalCodeFor(item)!==goodsListRows['03']['技术规范编码'])return undefined
  return {technicalCode:technicalCodeFor(item),region:selectionRegion(project,item),conductor:'400/50',
    selectionKey:'wrapping',optionId:'guard-LF10',model:'FYH-400/50',material:'LF10',u9:'101053201032',
    projectName:`${selectionRegion(project,item)}线路项目（示例）`,packageName:'包03',packageId:'DEMO-HISTORY-03',
    savedAt:'2026-08-05T08:00:00.000Z',demo:true}
}

// 示例历史只在样例载入时登记一次，后来改地区/技术编码时不生成一条虚构的匹配历史。
export function ensureDemoRecommendations(project:Project,items:Item[]) {
  for(const item of items){
    const record=demoRecommendation(project,item)
    if(!record)continue
    project.partSelectionHistory??=[]
    if(!project.partSelectionHistory.some(entry=>entry.demo&&entry.selectionKey===record.selectionKey&&entry.technicalCode===record.technicalCode))project.partSelectionHistory.push(record)
  }
}
