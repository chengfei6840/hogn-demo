import test from 'node:test'
import assert from 'node:assert/strict'
import ExcelJS from 'exceljs'
import { discoverMaterialWorksheets, loadMaterialWorkbook, summarizeMaterialWorksheets } from '../src/domain/material-list.ts'
import { ensureMaterialWorksheetOwnership } from '../src/domain/material-worksheets.ts'

async function workbookFile(){
 const workbook=new ExcelJS.Workbook()
 const headers=['包名称','包号','工程电压等级','数量','单位','技术规范编码','工程名称','交货地点','物资名称/规格型号']
 const add=(name:string,packageName:string,packageNo:string,quantity:number,code:string,deliveryPoint:string)=>{const sheet=workbook.addWorksheet(name);sheet.addRow(headers);sheet.addRow([packageName,packageNo,'750kV',quantity,'套',code,'演示工程',deliveryPoint,'线路金具'])}
 add('线路金具','包1','GW100',12,'CODE-A','新疆乌鲁木齐市')
 add('测试1','包1','GW100',8,'CODE-B','江苏南京市')
 const empty=workbook.addWorksheet('测试2');empty.addRow(['说明','暂无物料'])
 const bytes=await workbook.xlsx.writeBuffer()
 return new File([bytes as BlobPart],'multi-sheet.xlsx',{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
}

test('工作表发现保留原顺序、隐藏状态，所选表按表独立汇总同名包',async()=>{
 const workbook=await loadMaterialWorkbook(await workbookFile())
 workbook.getWorksheet('测试2')!.state='hidden'
 const worksheets=discoverMaterialWorksheets(workbook)
 assert.deepEqual(worksheets.map(sheet=>sheet.name),['线路金具','测试1','测试2'])
 assert.equal(worksheets[2].state,'hidden')
 const results=summarizeMaterialWorksheets(workbook,[worksheets[0].id,worksheets[1].id,worksheets[2].id])
 assert.equal(results.length,3)
 assert.equal(results[0].summaries[0].packageName,'包1')
 assert.equal(results[1].summaries[0].packageName,'包1')
 assert.notEqual(results[0].summaries[0].sourceWorksheetId,results[1].summaries[0].sourceWorksheetId)
 assert.equal(results[0].summaries[0].sourceWorksheetName,'线路金具')
 assert.equal(results[1].summaries[0].quantities[0].quantity,8)
 assert.equal(results[2].summaries.length,0)
 assert.match(results[2].error||'未解析',/未识别到/)
})

test('只汇总用户选择的工作表',async()=>{
 const workbook=await loadMaterialWorkbook(await workbookFile())
 const worksheets=discoverMaterialWorksheets(workbook)
 const results=summarizeMaterialWorksheets(workbook,[worksheets[1].id])
 assert.deepEqual(results.map(result=>result.worksheet.name),['测试1'])
 assert.equal(results.flatMap(result=>result.summaries).length,1)
})

test('拒绝旧版 xls 文件并给出格式说明',async()=>{
 await assert.rejects(()=>loadMaterialWorkbook(new File(['bad'],'legacy.xls')),/暂不支持旧版/)
})

test('历史项目无工作表归属时幂等迁移到未分类，保留报价包ID',()=>{
 const project:any={id:'project-1',name:'旧项目',customer:'客户',salesOwner:'销售',techOwner:'技术',financeOwner:'财务',createdAt:'',packages:[{id:'legacy-package',projectId:'project-1',packageName:'旧包'}]}
 ensureMaterialWorksheetOwnership(project)
 ensureMaterialWorksheetOwnership(project)
 assert.deepEqual(project.materialWorksheets,[{id:'uncategorized',name:'未分类',order:0}])
 assert.equal(project.packages[0].materialWorksheetId,'uncategorized')
 assert.equal(project.packages[0].id,'legacy-package')
})
