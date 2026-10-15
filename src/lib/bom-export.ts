import { selectionConfirmationReady, type Candidate, type Project } from '@/domain/model'
import { bomHeaders, plateHeaders, projectBom } from '@/domain/bom'
export async function createBomWorkbook(p:Project,catalog:Candidate[]) {
 const { default: ExcelJS }=await import('exceljs')
 const workbook=new ExcelJS.Workbook()
 const groups=projectBom(p,catalog)
 const sheet=workbook.addWorksheet('Sheet1',{views:[{state:'frozen',ySplit:1,xSplit:7}]})
 sheet.addRow(bomHeaders)
 const trace=workbook.addWorksheet('用量与来源',{views:[{state:'frozen',ySplit:1}]})
 trace.addRow(['货物项','需求版本','技术状态','子件名称','型号','采购套数','每套用量','总用量','单位','源文件','工作表','源行'])
 for(const group of groups){
  for(const row of group.rows){
   sheet.addRow(row.values)
   const r=trace.rowCount+1
    trace.addRow([group.item.id,p.version,selectionConfirmationReady(p)?'选型已确认':'待选型确认',row.part.name,row.part.model,group.item.quantity,row.part.qty,row.total===null?null:{formula:`F${r}*G${r}`,result:row.total},row.part.unit,group.candidate?.source||group.item.source,'',row.part.row])
  }
 }
 workbook.addWorksheet('平行挂板').addRow(plateHeaders)
 const notes=workbook.addWorksheet('编制说明')
  notes.addRows([['项目',p.name],['报价包',p.packageName],['需求版本',p.version],['输出性质',selectionConfirmationReady(p)&&groups.every(g=>g.candidate||g.item.kind==='独立物资')?'选型确认版（原型）':'BOM草稿（原型）'],['U9同步状态',p.u9SyncedAt?`已同步（演示） · ${p.u9SyncedAt}`:'尚未同步 U9'],['模板依据','电厂升压站－哈密北换流站750千伏线路工程Ⅰ回-含平行挂板2024.7.10-串型BOM.xlsx'],['主表数量','客户字段 + U9料号、U9子件价格；总用量另列于用量与来源'],['未确认货物项',groups.filter(g=>!g.candidate&&g.item.kind!=='独立物资').map(g=>g.item.id).join('、')||'无'],['空值说明','客户未提供的主数据、合同、订单、串料号或U9品名等字段保留为空，并记录来源。'],['平行挂板','仅保留参考表结构。当前询价未提供施工标段分配，不复制参考项目数量。'],['范围','串型和独立物资均按原货物行归属纳入BOM；排除项不计入。'],['排除项',p.items.filter(i=>i.excluded).map(i=>i.name+'：'+i.exclusionReason).join('；')],['限制','当前为原型生成的BOM，正式版由U9主数据和客户模板接口提供。']])
 for(const ws of workbook.worksheets){
  ws.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};ws.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF064975'}}
  ws.columns.forEach((col,n)=>{col.width=ws===sheet?([0,1,4,5,6,10,12,14,21].includes(n)?32:18):22})
  ws.eachRow(row=>{row.alignment={vertical:'top',wrapText:true}})
  ws.autoFilter={from:{row:1,column:1},to:{row:Math.max(1,ws.rowCount),column:ws.columnCount}}
 }
 notes.getColumn(2).width=100
 return workbook
}
export async function downloadBom(p:Project,catalog:Candidate[]){
 const workbook=await createBomWorkbook(p,catalog)
 const buffer=await workbook.xlsx.writeBuffer()
 const url=URL.createObjectURL(new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}))
 const a=document.createElement('a');a.href=url;a.download=`${p.id}-V${p.version}-BOM.xlsx`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)
}
