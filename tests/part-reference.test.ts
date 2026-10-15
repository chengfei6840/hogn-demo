import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createPackage} from '../src/domain/seed.ts'
import {buildU9Data,partCostRows,costFromPartCosts,missingPartFields,itemInformationGaps,normalizePackage,type Candidate} from '../src/domain/model.ts'
import {activePartReference,referencePartCatalog,searchReferenceParts,referenceCostNote,referenceIssues,demoPartUnitCost} from '../src/domain/part-reference.ts'

const catalog=JSON.parse(readFileSync(new URL('../src/data/catalog.json',import.meta.url),'utf8')) as Candidate[]
function setup(){
  const pkg=createPackage(catalog,'REFERENCE-TEST','参考子件演示','P1'),item=pkg.items[2]
  const part=item.partOverrides!.find(part=>part.row===69907)!
  const library=referencePartCatalog(catalog,pkg.items,{candidateId:item.selected,row:part.row})
  const reference=library.find(reference=>reference.name==='均压屏蔽环'&&reference.model==='FJY-80/760/340')!
  return {pkg,item,part,library,reference}
}
test('无料号与未选择参考均不造成技术缺失，财务仍识别未核算成本',()=>{
  const {pkg,item,part}=setup()
  assert.equal(part.u9,'');assert.equal(part.reference,undefined)
  assert.deepEqual(missingPartFields(part),[])
  assert.ok(!itemInformationGaps(pkg,item,catalog).parts.some(gap=>gap.row===part.row))
  pkg.u9Data=buildU9Data(pkg,catalog);pkg.u9SyncedAt='synced'
  assert.ok(partCostRows(item,pkg,catalog).find(row=>row.part.row===part.row)?.missing)
})
test('参考子件支持名称、分段型号和料号模糊搜索，不召回自身',()=>{
  const {part,item,library,reference}=setup()
  assert.ok(reference)
  for(const query of ['均压','FJY 760','71456'])assert.ok(searchReferenceParts(library,query,part.unit).some(record=>record.id===reference.id))
  assert.ok(!library.some(record=>record.id===`${item.selected}:${part.row}`))
  assert.equal(searchReferenceParts([reference],'FJY','米').length,0)
})
test('参考成本使用参考对象单重，成本小计使用当前子件用量',()=>{
  const {pkg,item,part,reference}=setup()
  part.reference=reference;part.qty=3
  pkg.u9Data=buildU9Data(pkg,catalog);pkg.u9SyncedAt='synced'
  const row=partCostRows(item,pkg,catalog).find(row=>row.part.row===part.row)!
  assert.equal(row.source,'reference')
  assert.equal(row.unit,181.26);assert.equal(row.unit*part.qty,543.78)
  assert.notEqual(row.unit,demoPartUnitCost(part))
  assert.equal(part.u9,'');assert.equal(part.model,'FJD-80/1350/H')
  assert.equal(referenceCostNote(row.reference!),'该子件参考“均压屏蔽环 FJY-80/760/340”的成本计算')
  assert.equal(item.cost,costFromPartCosts(item,pkg,catalog).cost)
})
test('财务手工调整参考单价保留依据，清除手工价格后恢复参考成本',()=>{
  const {pkg,item,part,reference}=setup();part.reference=reference
  pkg.u9Data=buildU9Data(pkg,catalog);pkg.u9SyncedAt='synced'
  item.partCosts={[part.row]:210}
  let row=partCostRows(item,pkg,catalog).find(row=>row.part.row===part.row)!
  assert.equal(row.unit,210);assert.equal(row.synced,181.26);assert.equal(row.reference?.model,reference.model)
  delete item.partCosts[part.row]
  row=partCostRows(item,pkg,catalog).find(row=>row.part.row===part.row)!
  assert.equal(row.unit,181.26)
})
test('自有料号优先于参考关系，未选择参考时也可由财务手填价格',()=>{
  const {pkg,item,part,reference}=setup();part.reference=reference;part.u9='OWN-U9'
  assert.equal(activePartReference(part),undefined)
  pkg.u9Data=buildU9Data(pkg,catalog);pkg.u9SyncedAt='synced'
  let row=partCostRows(item,pkg,catalog).find(row=>row.part.row===part.row)!
  assert.equal(row.reference,undefined);assert.equal(row.unit,demoPartUnitCost(part))
  part.u9='';part.reference=undefined;pkg.u9Data=buildU9Data(pkg,catalog);item.partCosts={[part.row]:150}
  row=partCostRows(item,pkg,catalog).find(row=>row.part.row===part.row)!
  assert.equal(row.unit,150);assert.equal(row.missing,false)
})
test('重新载入包不会把参考成本归一化成历史归档或维护库价格',()=>{
  const {pkg,item,part,reference}=setup();part.reference=reference
  pkg.u9Data=buildU9Data(pkg,catalog);pkg.u9SyncedAt='synced'
  const restored=normalizePackage(JSON.parse(JSON.stringify(pkg)))
  const row=partCostRows(restored.items[2],restored,catalog).find(row=>row.part.row===part.row)!
  assert.equal(row.source,'reference');assert.equal(row.unit,181.26)
  assert.equal(restored.u9Data?.[`${item.selected}:${part.row}`].source,'reference')
})
test('选择参考对象会保留快照，并拒绝不完整或计价单位不一致的对象',()=>{
  const {pkg,part,reference}=setup();part.reference=reference
  pkg.items[0].partOverrides!.find(part=>part.row===71456)!.weight=999
  assert.equal(demoPartUnitCost(reference),181.26)
  assert.deepEqual(referenceIssues(part),[])
  part.reference={...reference,unit:'米'};assert.ok(referenceIssues(part).length)
  part.reference={...reference,u9:''};assert.ok(referenceIssues(part).length)
})
