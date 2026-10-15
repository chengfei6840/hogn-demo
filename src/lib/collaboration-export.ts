import type { Candidate, Item, Package, Part } from '@/domain/model'
import { goodsColumns } from '@/data/goodsList'

const exportedGoodsColumns = goodsColumns.filter(column => !['包名称', '分包编号'].includes(column))
const parentHeaders = [
  '序号', '货物名称', '串型号', '数量', '单位', '适用导线', '电压等级', ...exportedGoodsColumns, '技术结果'
]
const partHeaders = ['子件名称', '子件型号', '子件用量', '子件单位', '子件材质', '子件U9料号', '子件图号']

export async function downloadCollaborationItems(options: {
  pkg: Package
  role: '销售' | '技术'
  items: Item[]
  catalog: Candidate[]
  statusFor: (item: Item) => string
}) {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(options.role === '销售' ? '销售确认' : '技术确认', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })
  const headers = options.role === '技术' ? [...parentHeaders, ...partHeaders] : parentHeaders
  sheet.addRow(headers)

  for (const item of options.items) {
    const parentValues: (string | number | null)[] = [
      String(item.id), item.name, item.model || item.spec || (item.kind === '独立物资' ? '独立物资' : ''),
      item.quantity, item.unit, item.conductor, item.voltage,
      ...exportedGoodsColumns.map(column => item.goodsList?.[column] || ''), options.statusFor(item),
    ]
    if (options.role === '销售') {
      sheet.addRow(parentValues)
      continue
    }

    const candidate = options.catalog.find(entry => entry.id === item.selected)
    const parts: Part[] = item.partOverrides || candidate?.parts || []
    if (!parts.length) {
      sheet.addRow([...parentValues, ...partHeaders.map(() => '')])
      continue
    }
    parts.forEach((part, index) => {
      const partValues = [part.name, part.model, part.qty, part.unit, part.material, part.u9, part.drawing]
      sheet.addRow([...(index === 0 ? parentValues : parentValues.map(() => '')), ...partValues])
    })
  }

  sheet.columns.forEach((column, index) => {
    column.width = index === 0 ? 12 : index === 1 || index === 2 ? 28 : index >= parentHeaders.length ? 22 : 20
  })
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF064975' } }
  sheet.eachRow(row => { row.alignment = { vertical: 'top', wrapText: true } })
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: Math.max(1, sheet.rowCount), column: sheet.columnCount } }

  const buffer = await workbook.xlsx.writeBuffer()
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${options.pkg.packageName}-${options.role}确认清单.xlsx`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
