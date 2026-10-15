import type { Candidate, Item, Part } from './model.ts'

// 保存参考对象的快照，核价时不会因为库中的另一条记录改变而丢失依据。
export interface PartReference {
  id:string
  name:string
  model:string
  material:string
  u9:string
  unit:string
  weight:number|null
  processRoute:string
  source:string
  sourceRow:number
}
export const demoMaterialRate=18.6
export const demoProcessingFee=12
export function demoPartUnitCost(part:Pick<Part,'weight'>) {
  return Math.max(1,Math.round(((part.weight||1)*demoMaterialRate+demoProcessingFee)*10000)/10000)
}
export function activePartReference(part:Part) {return (part.u9||'').trim()?undefined:part.reference}
export function referenceCostNote(reference:Pick<PartReference,'name'|'model'>) {
  return `该子件参考“${reference.name} ${reference.model}”的成本计算`
}
export function referenceIssues(part:Part) {
  const reference=part.reference
  if(!reference)return []
  if(!reference.id?.trim()||!reference.name?.trim()||!reference.model?.trim()||!reference.u9?.trim())return ['参考子件记录不完整，请重新选择或清除']
  if(reference.unit!==part.unit)return ['参考子件的计价单位与当前子件不同，请重新选择或清除']
  return []
}

type ReferencePart=Pick<Part,'name'|'model'|'material'|'u9'|'unit'|'weight'|'row'|'processRoute'> & {reference?:Readonly<PartReference>;selection?:{selectedOptionId?:string}}
type ReferenceItem=Pick<Item,'id'|'selected'> & {partOverrides?:readonly ReferencePart[]}
export function referencePartCatalog(catalog:readonly Candidate[],items:readonly ReferenceItem[],target:{candidateId:string;row:number}):PartReference[] {
  const records:PartReference[]=[],seen=new Set<string>()
  const append=(candidate:Candidate,parts:readonly ReferencePart[],source:string)=>{
    for(const part of parts){
      if(candidate.id===target.candidateId&&part.row===target.row)continue
      if(!(part.u9||'').trim()||!(part.model||'').trim()||part.reference||part.selection&&!part.selection.selectedOptionId)continue
      const key=[part.model,part.u9,part.material,part.unit,part.weight].join('|')
      if(seen.has(key))continue
      seen.add(key)
      records.push({id:`${candidate.id}:${part.row}`,name:part.name,model:part.model,material:part.material,u9:part.u9,
        unit:part.unit,weight:part.weight,processRoute:part.processRoute||'备料 → 成形 → 机加工 → 表面处理 → 检验 → 包装',
        source,sourceRow:part.row})
    }
  }
  // 先纳入本包已补齐的演示子件，再补充现有总库，FJY-80/760/340 因此可直接选用。
  for(const item of items){const candidate=catalog.find(entry=>entry.id===item.selected);if(candidate)append(candidate,item.partOverrides||candidate.parts,`本包子件库 · 货物项 ${item.id}`)}
  for(const candidate of catalog)append(candidate,candidate.parts,`${candidate.source} · ${candidate.sheet}`)
  return records
}
const normalize=(value:string)=>value.toUpperCase().replace(/[\s\-—_/()（）×]/g,'')
export function searchReferenceParts(records:PartReference[],query:string,unit:string) {
  const terms=query.trim().split(/\s+/).map(normalize).filter(Boolean)
  return records.filter(record=>record.unit===unit&&terms.every(term=>normalize(`${record.name} ${record.model} ${record.u9} ${record.material}`).includes(term)))
}
