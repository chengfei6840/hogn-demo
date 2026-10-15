import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createPackage} from '../src/domain/seed.ts'
import {missingPartFields,technicalCompletionIssues,type Project} from '../src/domain/model.ts'
import {applyPartOption,eligiblePartOptions,findPartRecommendation,partSelectionIssues,selectionHistoryRecord} from '../src/domain/part-selection.ts'
import {demoRecommendation,demoPartOverrides,ensureDemoRecommendations} from '../src/data/demoPartSelections.ts'

const catalog=JSON.parse(readFileSync(new URL('../src/data/catalog.json',import.meta.url),'utf8'))
const setup=()=>{
  const pkg=createPackage(catalog,'TEST','包1','P1')
  const item=pkg.items[2],parts=item.partOverrides!,part=parts.find(row=>row.selection?.key==='wrapping')!
  const project:Project={id:'TEST',name:'测试项目',customer:'客户',region:'新疆',salesOwner:'销售',techOwner:'技术',financeOwner:'财务',createdAt:'',packages:[pkg]}
  return {pkg,item,parts,part,project}
}
test('四条货物项和销售导线值保留，仅在两条串中加入子件候选',()=>{
  const {pkg,item,part}=setup()
  assert.deepEqual(pkg.items.map(item=>item.id),['01','02','03','04'])
  assert.deepEqual(pkg.items.map(item=>item.quantity),[26,38,12,48])
  assert.equal(item.conductor,'400/50')
  assert.equal(pkg.items[1].conductor,'')
  assert.equal(pkg.items[3].kind,'独立物资')
  assert.equal(eligiblePartOptions(part,item).length,4)
})
test('普通必填缺失保留一条，无料号子件可选参考，两条选型候选继续待确认',()=>{
  const {pkg}=setup()
  const parts=pkg.items.flatMap(item=>item.kind==='独立物资'?[]:item.partOverrides||catalog.find(entry=>entry.id===item.selected)?.parts||[])
  const pending=parts.filter(part=>missingPartFields(part).length)
  assert.equal(pending.filter(part=>part.selection).length,2)
  assert.deepEqual(pending.filter(part=>!part.selection).map(part=>part.row),[71454])
  const unnumbered=parts.find(part=>part.row===69907)!
  assert.equal(unnumbered.u9,'');assert.deepEqual(missingPartFields(unnumbered),[])
  const item=pkg.items[0],completed=item.partOverrides!.find(part=>part.model==='MGF-130/113')!
  completed.u9='用户确认的料号';completed.drawing='用户确认的图号'
  const restored=demoPartOverrides(item,item.partOverrides!).find(part=>part.row===completed.row)!
  assert.equal(restored.u9,completed.u9);assert.equal(restored.drawing,completed.drawing)
})
test('有护或铝标记时子件候选受限，导线不符时无可用候选',()=>{
  const {item,part}=setup()
  item.model+='护'
  assert.deepEqual(eligiblePartOptions(part,item).map(option=>option.kind),['护','护'])
  item.model=item.model.replace(/护$/,'铝')
  assert.deepEqual(eligiblePartOptions(part,item).map(option=>option.kind),['铝','铝'])
  item.conductor='300/40'
  assert.equal(eligiblePartOptions(part,item).length,0)
})
test('采用包缠物配置保留行号和无关子件，并同步配套线夹和料号',()=>{
  const {item,parts,part}=setup()
  const option=eligiblePartOptions(part,item).find(option=>option.id==='aluminum-L3')!
  const next=applyPartOption(parts,part.row,option,{model:'',qty:'2',material:'L3',u9:'',drawing:''})
  const chosen=next.find(row=>row.row===part.row)!,clamp=next.find(row=>row.row===part.selection?.linkedRow)!
  assert.equal(next.length,parts.length)
  assert.equal(next[0],parts[0])
  assert.equal(parts.find(row=>row.row===part.row)?.model,'')
  assert.equal(chosen.model,'1×10');assert.equal(chosen.qty,2);assert.equal(chosen.u9,'101052501002')
  assert.equal(clamp.model,'XG-6034');assert.equal(clamp.u9,'101070501053')
  assert.deepEqual(missingPartFields(chosen),[])
  assert.deepEqual(partSelectionIssues(chosen,item),[])
})
test('候选未选或选型条件后来变化时技术确认继续阻断',()=>{
  const {pkg,item,parts,part}=setup()
  assert.ok(missingPartFields(part).includes('候选选型'))
  const guard=eligiblePartOptions(part,item).find(option=>option.id==='guard-LF10')!
  item.partOverrides=applyPartOption(parts,part.row,guard,{model:'',qty:'1',material:'LF10',u9:'',drawing:''})
  item.model+='铝'
  assert.ok(technicalCompletionIssues(pkg,catalog).some(issue=>issue.includes('候选与当前串型条件不一致')))
})
test('历史推荐匹配技术编码、地区和可用型号材质，真实保存结果可替换示例推荐',()=>{
  const {pkg,item,parts,part,project}=setup()
  const demo=demoRecommendation(project,item)!
  assert.equal(findPartRecommendation([demo],part,item,project)?.optionId,'guard-LF10')
  assert.equal(findPartRecommendation([demo],part,item,{region:'辽宁'}),undefined)
  const aluminum=eligiblePartOptions(part,item).find(option=>option.id==='aluminum-L3')!
  const chosen=applyPartOption(parts,part.row,aluminum,{model:'',qty:'1',material:'L3',u9:'',drawing:''}).find(row=>row.row===part.row)!
  const saved=selectionHistoryRecord(project,pkg,item,chosen)!
  assert.equal(findPartRecommendation([demo,saved],part,item,project)?.optionId,'aluminum-L3')
  item.model+='护'
  assert.equal(findPartRecommendation([saved],part,item,project),undefined)
})
test('JC-1 同规格不同紧固件使用对应真实料号，并保留人工填入材质',()=>{
  const {pkg}=setup(),item=pkg.items[0],parts=item.partOverrides!,part=parts.find(row=>row.selection?.key==='jc1')!
  const choices=eligiblePartOptions(part,item)
  assert.equal(choices.length,2);assert.equal(choices[0].model,choices[1].model)
  assert.notEqual(choices[0].u9,choices[1].u9)
  const chosen=applyPartOption(parts,part.row,choices[1],{model:'',qty:'2',material:'按图纸核验的材质',u9:'',drawing:''}).find(row=>row.row===part.row)!
  assert.equal(chosen.u9,'101047201038');assert.equal(chosen.drawing,'6112640-00')
  assert.equal(chosen.material,'按图纸核验的材质')
  assert.deepEqual(missingPartFields(chosen),[])
  chosen.technicalChanges=[{id:'1',itemId:item.id,actor:'技术',role:'技术',at:'',reason:'已核验',changes:[]}]
  assert.equal(demoPartOverrides(item,[chosen])[0].u9,chosen.u9)
})
test('示例历史只初始化一次，更改地区或技术编码不会伪造新的推荐',()=>{
  const {project,pkg,item,part}=setup()
  ensureDemoRecommendations(project,pkg.items)
  assert.equal(project.partSelectionHistory?.length,1)
  project.region='辽宁'
  ensureDemoRecommendations(project,pkg.items)
  assert.equal(project.partSelectionHistory?.length,1)
  assert.equal(findPartRecommendation(project.partSelectionHistory!,part,item,project),undefined)
  item.spec='不同的技术规范编码'
  assert.equal(demoRecommendation(project,item),undefined)
})
