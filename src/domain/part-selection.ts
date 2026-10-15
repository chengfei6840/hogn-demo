import type { Item, Part, Project } from './model.ts'

export interface PartOption {
  id: string
  model: string
  material: string
  u9: string
  drawing: string
  weight: number | null
  unit: string
  detail: string
  kind?: '护' | '铝'
  conductor?: string
  linkedPart?: Pick<Part, 'name' | 'model' | 'material' | 'u9' | 'drawing' | 'weight' | 'unit'>
}
export interface PartSelection {
  key: 'wrapping' | 'jc1'
  source: 'wrap-atlas' | 'standard-jc1'
  options: PartOption[]
  linkedRow?: number
  selectedOptionId?: string
  demo?: boolean
}
export interface PartSelectionHistory {
  technicalCode: string
  region: string
  conductor: string
  selectionKey: PartSelection['key']
  optionId: string
  model: string
  material: string
  u9: string
  projectName: string
  packageName: string
  packageId: string
  savedAt: string
  demo?: boolean
}
export interface PartEditDraft { model:string; qty:string; material:string; u9:string; drawing:string }

const compact = (value:string) => value.replace(/\s/g,'').toUpperCase()
export function chainWrapKind(item:Item): '护' | '铝' | undefined {
  const suffix=item.model.trim().match(/(护|铝)$/)?.[1]
  return suffix==='护'||suffix==='铝'?suffix:undefined
}
export function eligiblePartOptions(part:Part,item:Item) {
  const kind=chainWrapKind(item)
  return (part.selection?.options??[]).filter(option=>
    (!option.kind||!kind||option.kind===kind)&&
    (!option.conductor||compact(option.conductor)===compact(item.conductor)))
}
export function partSelectionIssues(part:Part,item:Item) {
  if(!part.selection?.selectedOptionId)return []
  const option=eligiblePartOptions(part,item).find(entry=>entry.id===part.selection?.selectedOptionId)
  if(!option)return ['候选与当前串型条件不一致']
  if(part.model!==option.model||part.u9!==option.u9||part.drawing!==option.drawing||
    (option.material&&part.material!==option.material))return ['候选信息待核验']
  return []
}
export function technicalCodeFor(item:Item) { return item.spec.trim()||item.goodsList?.['技术规范编码']||'' }
export function selectionRegion(project:Pick<Project,'region'>,item:Item) {
  return project.region?.trim()||item.goodsList?.['交货地点']||''
}
export function findPartRecommendation(history:readonly PartSelectionHistory[],part:Part,item:Item,project:Pick<Project,'region'>) {
  const choices=eligiblePartOptions(part,item),code=technicalCodeFor(item),region=selectionRegion(project,item)
  if(!code||!region)return undefined
  return history.filter(record=>record.technicalCode===code&&record.region===region&&
    record.selectionKey===part.selection?.key&&record.conductor===item.conductor&&
    choices.some(option=>option.id===record.optionId&&option.model===record.model&&
      (!option.material||option.material===record.material)&&option.u9===record.u9))
    .sort((a,b)=>b.savedAt.localeCompare(a.savedAt))[0]
}
// 固定行号保留核价引用和修改记录；切换包缠物只更新图册规定的关联线夹。
export function applyPartOption(parts:Part[],row:number,option:PartOption,draft:PartEditDraft):Part[] {
  const target=parts.find(part=>part.row===row)
  const selection=target?.selection
  if(!selection?.options.some(entry=>entry.id===option.id))throw Error('子件候选不存在')
  return parts.map(part=>{
    if(part.row===row)return {...part,model:option.model,material:option.material||draft.material.trim(),
      qty:Number(draft.qty),u9:option.u9,drawing:option.drawing,weight:option.weight,unit:option.unit,
      selection:{...selection,selectedOptionId:option.id}}
    if(part.row===selection.linkedRow&&option.linkedPart)return {...part,...option.linkedPart}
    return part
  })
}
export function selectionHistoryRecord(project:Project,pkg:{id:string;packageName:string},item:Item,part:Part):PartSelectionHistory | undefined {
  if(!part.selection?.selectedOptionId||partSelectionIssues(part,item).length)return undefined
  const technicalCode=technicalCodeFor(item),region=selectionRegion(project,item)
  if(!technicalCode||!region)return undefined
  return {technicalCode,region,conductor:item.conductor,selectionKey:part.selection.key,
    optionId:part.selection.selectedOptionId,model:part.model,material:part.material,u9:part.u9,
    projectName:project.name,packageName:pkg.packageName,packageId:pkg.id,savedAt:new Date().toISOString(),demo:part.selection.demo}
}
