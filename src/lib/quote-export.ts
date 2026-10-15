import type { Project, Snapshot } from '@/domain/model'

const quoteHeaders = ['电网', '品名', '扩充描述', '技术ID', '单位', '串型编号', '子件型号规格', '子件名称', '分配量', '子件单位', '材质', 'U9料号', '串数量', '未税串单价', '未税串金额', '未税子件单价', '每套子件报价小计']
const widths = [8, 24, 15, 23, 7, 19, 23, 18, 9, 9, 11, 20, 9, 18, 19, 18, 20]
const numberFormat = '#,##0.0000;[Red]-#,##0.0000'

export async function createQuoteWorkbook(project: Project, snapshot: Snapshot, packageName = '') {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = '红光报价协作演示'
  workbook.subject = '已签发报价明细'
  const sheet = workbook.addWorksheet('报价明细', { views: [{ state: 'frozen', ySplit: 5, xSplit: 2, zoomScale: 100 }] })
  const band = (row: number, from: number, to: number, text: string, fill: string, size = 13, height = 32) => {
    sheet.mergeCells(row, from, row, to)
    const cell = sheet.getCell(row, from)
    cell.value = text
    cell.font = { name: '微软雅黑', bold: true, size, color: { argb: 'FF214F70' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } }
    cell.alignment = { vertical: 'middle', wrapText: true }
    sheet.getRow(row).height = height
  }
  band(1, 1, 17, '金具串报价明细', 'FFDCEBF6', 24, 44)
  band(2, 1, 17, `${project.name}${packageName ? ' / ' + packageName : ''}    报价版本：V${snapshot.version}    报价编号：${snapshot.id}`, 'FFFFFFFF', 14, 34)
  band(3, 1, 17, `已签发报价：包含本包全部串与子件，价格均为对外报价。金额单位：人民币元；税率：${snapshot.tax}%。`, 'FFF2F7FC', 12, 30)
  band(4, 1, 6, '串信息（沿用原表字段）', 'FFE5EFF7')
  band(4, 7, 12, '子件明细（沿用原表字段）', 'FFE5EFF7')
  band(4, 13, 17, '对外报价（新增）', 'FFE5EFF7')
  quoteHeaders.forEach((header, index) => {
    const cell = sheet.getCell(5, index + 1)
    cell.value = header
    cell.font = { name: '微软雅黑', bold: true, size: 12, color: { argb: 'FF214F70' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAF2F9' } }
    cell.alignment = { vertical: 'middle', wrapText: true }
  })
  sheet.getRow(5).height = 38
  const childRanges: { itemId: string; from: number; to: number; total: number }[] = []
  for (const item of snapshot.items) {
    const childLines = snapshot.quoteParts?.filter(part => part.itemId === item.id) || []
    const rows = childLines.length ? childLines : [undefined]
    const from = sheet.rowCount + 1
    rows.forEach((part, index) => {
      const first = index === 0
      const goods = item.goodsList || {}
      const standaloneModel = item.kind === '独立物资' ? item.name.split(/[,，]/).slice(1).join(',') : ''
      const row = sheet.addRow([
        project.gridType || '', item.name, goods['扩展描述'] || goods['物资描述'] || item.spec || '', goods['技术规范编码'] || '', item.unit, item.model || item.spec || standaloneModel,
        part?.model || '', part?.name || '', part?.qty ?? null, part?.unit || '', part?.material || '', part?.u9 || '',
        first ? item.quantity : null, first ? item.price : null, first ? item.price * item.quantity : null,
        part?.price ?? null, part ? (part.qty ?? 0) * part.price : null,
      ])
      row.font = { name: '微软雅黑', size: 12, color: { argb: 'FF384F64' } }
      row.alignment = { vertical: 'middle', wrapText: true }
      const lineCount = Math.max(...[2, 3, 6, 7, 8].map(column => {
        const text = String(row.getCell(column).value || '')
        const visualLength = [...text].reduce((sum, char) => sum + (/[^\x00-\xff]/.test(char) ? 2 : 1), 0)
        return Math.ceil(visualLength / widths[column - 1])
      }))
      row.height = Math.max(32, Math.min(90, lineCount * 16 + 10))
      if (!part) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F5FA' } }
      for (const column of [14, 15, 16, 17]) { row.getCell(column).numFmt = numberFormat; row.getCell(column).alignment = { vertical: 'middle', horizontal: 'right' } }
      for (const column of [9, 13]) { const cell = row.getCell(column); cell.numFmt = Number.isInteger(cell.value) ? '0' : '#,##0.0000'; cell.alignment = { vertical: 'middle', horizontal: 'right' } }
      for (const column of [4, 6, 7, 12]) row.getCell(column).numFmt = '@'
    })
    if (childLines.length) childRanges.push({ itemId: item.id, from, to: sheet.rowCount, total: childLines.reduce((sum, part) => sum + (part.qty ?? 0) * part.price, 0) })
  }
  const lastDetailRow = sheet.rowCount
  const summary = (label: string, formula: string, result: number, valueColumn = 14) => {
    const row = sheet.rowCount + 1
    band(row, 1, valueColumn - 1, label, 'FFEAF2F9')
    sheet.mergeCells(row, valueColumn, row, 17)
    const cell = sheet.getCell(row, valueColumn)
    cell.value = { formula, result }
    cell.font = { name: '微软雅黑', size: 13, bold: true, color: { argb: 'FF214F70' } }
    cell.numFmt = numberFormat
    cell.alignment = { vertical: 'middle', horizontal: 'right' }
    return row
  }
  for (const range of childRanges) summary(`货物项 ${range.itemId} · 本串每套子件报价合计（已包含在串单价中）`, `SUM(Q${range.from}:Q${range.to})`, range.total, 16)
  const untaxed = snapshot.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const untaxedRow = summary('整包未税金额', lastDetailRow >= 6 ? `SUM(O6:O${lastDetailRow})` : '0', untaxed)
  const tax = Math.round(untaxed * snapshot.tax / 100 * 10000) / 10000
  const taxRow = summary(`税额（税率 ${snapshot.tax}%）`, `ROUND(N${untaxedRow}*${snapshot.tax}/100,4)`, tax)
  summary('整包含税金额', `N${untaxedRow}+N${taxRow}`, untaxed + tax)
  band(sheet.rowCount + 1, 1, 17, '串金额只在所属串首行填写；子件金额已包含在串金额中，整包合计只汇总串金额。', 'FFFFFFFF', 12, 30)
  band(sheet.rowCount + 1, 1, 17, '子件报价小计 = 子件对外报价单价 × 每套分配量。', 'FFFFFFFF', 12, 30)
  if (snapshot.notes) band(sheet.rowCount + 1, 1, 17, `商务条款：${snapshot.notes}`, 'FFFFFFFF', 12, 40)
  sheet.columns.forEach((column, index) => { column.width = widths[index] })
  const border = { style: 'thin' as const, color: { argb: 'FFD5E2ED' } }
  sheet.eachRow(row => row.eachCell({ includeEmpty: true }, cell => { cell.border = { top: border, left: border, bottom: border, right: border } }))
  sheet.autoFilter = { from: { row: 5, column: 1 }, to: { row: Math.max(5, lastDetailRow), column: 17 } }
  sheet.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '1:5' }
  return workbook
}

export async function downloadQuoteWorkbook(project: Project, snapshot: Snapshot, packageName = '') {
  const workbook = await createQuoteWorkbook(project, snapshot, packageName)
  const buffer = await workbook.xlsx.writeBuffer()
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${snapshot.id}-报价明细.xlsx`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
