import test from 'node:test'
import assert from 'node:assert/strict'
import { groupedOperationRecords } from '../src/domain/operation-records.ts'
import type { Audit, Candidate, Item, Package } from '../src/domain/model.ts'

const item: Item = { id:'01', name:'串A', quantity:26, unit:'套', model:'M1', spec:'S1', conductor:'400/50', voltage:'750kV', atlas:'', drawing:'', kind:'金具串', route:0, selected:'C1', confirmed:false, excluded:false, exclusionReason:'', source:'', original:{}, price:16593.675, cost:13274.94, margin:20 }
function pkg(audit: Audit[], name='包1'): Package { return { id:name, projectId:'PR', packageName:name, stage:'并行协作', version:1, salesConfirmed:null, techConfirmed:null, items:[{...item}], files:[], audit, snapshots:[], pricingNote:'', tax:13, manualBoss:false, settings:{amountThreshold:null,marginFloor:null}, createdAt:'' } }
const at='2026/10/19 14:20:00'

test('一次保存拆为字段行，按角色汇总且保持包内数据隔离',()=>{
 const audit:Audit={at,role:'销售',action:'修改客户需求解析信息',detail:'销售 · 王宁；01；2 项变化；依据',version:1,context:{kind:'item',itemId:'01',itemSnapshot:{...item},changes:[{field:'quantity',label:'数量',before:25,after:26},{field:'conductor',label:'导线条件',before:'',after:'400/50'}]}}
 const a=groupedOperationRecords(pkg([audit]),[])
 assert.equal(a.销售.length,2)
 assert.equal(a.销售[0].before,'25 套')
 assert.equal(a.销售[0].after,'26 套')
 assert.equal(a.销售[0].actor,'王宁')
 assert.equal(a.销售[1].before,'待确认')
 assert.deepEqual(groupedOperationRecords(pkg([],'包2'),[]),{销售:[],技术:[],财务:[]})
})

test('串和多个子件的改动各自展开对应对象，不将子件信息串用',()=>{
 const parts=[{row:1,name:'子件A',model:'PA',qty:1,unit:'件',material:'Q235',weight:1,u9:'A',drawing:'A'},{row:2,name:'子件B',model:'PB',qty:2,unit:'件',material:'Q345',weight:2,u9:'B',drawing:'B'}]
 const candidate:Candidate={id:'C1',name:'所属串名称A',description:'',spec:'',model:'M1',atlas:'',drawing:'',drawing2:'',source:'',sheet:'',row:1,parts}
 const audit:Audit={at,role:'技术',action:'修改技术子件',detail:'技术 · 李工；01；3 项变化；复核',version:1,context:{kind:'part',itemId:'01',itemSnapshot:{...item,partOverrides:parts},changes:[{field:'model',label:'串型号',before:'',after:'M1'},{field:'part.1.material',label:'子件1 material',before:'',after:'Q235'},{field:'part.2.model',label:'子件2 model',before:'旧型号',after:'PB'}]}}
 const entries=groupedOperationRecords(pkg([audit]),[candidate]).技术
 assert.deepEqual(entries.map(entry=>entry.kind),['item','part','part'])
 assert.equal(entries[1].part?.name,'子件A')
 assert.equal(entries[2].part?.name,'子件B')
 assert.equal(entries[1].label,'材质')
 assert.equal(entries[2].item?.selected,'C1')
})

test('财务展示真实前后金额与快照，不混入流程记录',()=>{
 const snapshot={...item}
 const audit:Audit={at,role:'财务',action:'财务修改货物项核价',detail:'财务 · 张会计；货物项 01：已调整',version:1,context:{kind:'finance',itemId:'01',itemSnapshot:snapshot,changes:[{field:'cost',label:'单位成本',before:13000,after:13274.94},{field:'margin',label:'毛利率',before:18,after:20}]}}
 const p=pkg([audit,{at,role:'销售',action:'销售确认',detail:'销售 · 王宁；完成',version:1},{at,role:'财务',action:'保存核价',detail:'财务 · 张会计；保存草稿',version:1}])
 p.items[0].cost=999
 const entries=groupedOperationRecords(p,[]).财务
 assert.equal(entries.length,2)
 assert.equal(entries[0].before,'¥13000.0000')
 assert.equal(entries[0].after,'¥13274.9400')
 assert.equal(entries[0].item?.cost,13274.94)
 assert.equal(entries[1].after,'20%')
 assert.equal(groupedOperationRecords(p,[]).销售.length,0)
})
