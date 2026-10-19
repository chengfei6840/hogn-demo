import type { MaterialDeliverySummary, MaterialPackageSummary, MaterialQuantitySummary, MaterialWorksheetMeta } from './model'

export interface MaterialWorksheetInfo extends MaterialWorksheetMeta { state: 'visible' | 'hidden' | 'veryHidden' }
export interface MaterialWorksheetParseResult { worksheet: MaterialWorksheetInfo; summaries: MaterialPackageSummary[]; error?: string }

type ColumnKey = 'packageName' | 'packageNo' | 'voltage' | 'quantity' | 'unit' | 'technicalCode' | 'project' | 'deliveryPoint' | 'itemName'

const columnAliases: Record<ColumnKey, string[]> = {
  packageName: ['包名称', '报价包名称', '标包名称'],
  packageNo: ['分包编号', '包号', '分包号'],
  voltage: ['工程电压等级', '电压等级'],
  quantity: ['数量', '物资数量', '采购数量'],
  unit: ['单位', '计量单位'],
  technicalCode: ['技术规范编码', '技术规范书编码', '技术编码'],
  project: ['项目名称', '工程名称'],
  deliveryPoint: ['交货地点', '交货地址', '交货地'],
  itemName: ['物资名称', '货物名称', '物资名称/规格型号'],
}

const provinces: Array<[string, string[]]> = [
  ['新疆', ['新疆维吾尔自治区', '新疆']], ['内蒙古', ['内蒙古自治区', '内蒙古']],
  ['广西', ['广西壮族自治区', '广西']], ['宁夏', ['宁夏回族自治区', '宁夏']],
  ['西藏', ['西藏自治区', '西藏']], ['北京', ['北京市', '北京']], ['天津', ['天津市', '天津']],
  ['上海', ['上海市', '上海']], ['重庆', ['重庆市', '重庆']], ['河北', ['河北省', '河北']],
  ['山西', ['山西省', '山西']], ['辽宁', ['辽宁省', '辽宁']], ['吉林', ['吉林省', '吉林']],
  ['黑龙江', ['黑龙江省', '黑龙江']], ['江苏', ['江苏省', '江苏']], ['浙江', ['浙江省', '浙江']],
  ['安徽', ['安徽省', '安徽']], ['福建', ['福建省', '福建']], ['江西', ['江西省', '江西']],
  ['山东', ['山东省', '山东']], ['河南', ['河南省', '河南']], ['湖北', ['湖北省', '湖北']],
  ['湖南', ['湖南省', '湖南']], ['广东', ['广东省', '广东']], ['海南', ['海南省', '海南']],
  ['四川', ['四川省', '四川']], ['贵州', ['贵州省', '贵州']], ['云南', ['云南省', '云南']],
  ['陕西', ['陕西省', '陕西']], ['甘肃', ['甘肃省', '甘肃']], ['青海', ['青海省', '青海']],
  ['台湾', ['台湾省', '台湾']], ['香港', ['香港特别行政区', '香港']], ['澳门', ['澳门特别行政区', '澳门']],
]

function cellText(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    if ('text' in value && typeof value.text === 'string') return value.text.trim()
    if ('result' in value) return cellText(value.result)
    if ('richText' in value && Array.isArray(value.richText)) return value.richText.map(part => part.text || '').join('').trim()
    if ('hyperlink' in value && typeof value.text === 'string') return value.text.trim()
  }
  return String(value).trim()
}

function headerKey(value: unknown): string {
  return cellText(value).replace(/[\s\r\n（）()]/g, '')
}

function getHeaderColumns(values: unknown[]): Partial<Record<ColumnKey, number>> {
  const normalized = values.slice(1).map(headerKey)
  const result: Partial<Record<ColumnKey, number>> = {}
  for (const [key, aliases] of Object.entries(columnAliases) as Array<[ColumnKey, string[]]>) {
    const index = normalized.findIndex(value => aliases.some(alias => value === headerKey(alias)))
    if (index >= 0) result[key] = index
  }
  return result
}

function findHeader(sheet: any): { row: number; columns: Partial<Record<ColumnKey, number>> } | null {
  const scanEnd = Math.min(sheet.rowCount, 40)
  for (let rowNumber = 1; rowNumber <= scanEnd; rowNumber += 1) {
    const columns = getHeaderColumns(sheet.getRow(rowNumber).values as unknown[])
    if (columns.quantity !== undefined && columns.unit !== undefined) return { row: rowNumber, columns }
  }
  return null
}

function valueAt(row: any, index: number | undefined): string {
  return index === undefined ? '' : cellText(row.getCell(index + 1).value)
}

function numericQuantity(raw: string): number | null {
  const value = Number(raw.replace(/[，,\s]/g, ''))
  return raw && Number.isFinite(value) ? value : null
}

function provinceOf(address: string): string {
  return provinces.find(([, aliases]) => aliases.some(alias => address.includes(alias)))?.[0] || '地域待确认'
}

function addQuantity(map: Map<string, number>, unit: string, quantity: number) {
  map.set(unit, (map.get(unit) || 0) + quantity)
}

function quantityRows(values: Map<string, number>): MaterialQuantitySummary[] {
  return [...values].map(([unit, quantity]) => ({ unit, quantity: Math.round(quantity * 10000) / 10000 }))
}

function summarizeSheet(sheet: any, worksheetId = `sheet-${sheet.id}`): MaterialPackageSummary[] {
  const header = findHeader(sheet)
  if (!header) return []

  type PackageAccumulator = {
    packageName: string
    packageNo: string
    codes: Set<string>
    voltages: Set<string>
    totals: Map<string, number>
    locations: Map<string, { region: string; project: string; deliveryPoint: string; itemCount: number; quantities: Map<string, number> }>
    itemCount: number
  }
  const packages = new Map<string, PackageAccumulator>()
  const firstDataRow = header.row + 1

  for (let rowNumber = firstDataRow; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber)
    const itemName = valueAt(row, header.columns.itemName)
    if (/^(合计|总计|小计|说明|备注)/.test(itemName)) continue
    const quantity = numericQuantity(valueAt(row, header.columns.quantity))
    const unit = valueAt(row, header.columns.unit) || '单位待确认'
    const code = valueAt(row, header.columns.technicalCode)
    const project = valueAt(row, header.columns.project) || '工程名称待补充'
    const deliveryPoint = valueAt(row, header.columns.deliveryPoint) || '交货地点待补充'
    if (quantity === null && !code && project === '工程名称待补充' && deliveryPoint === '交货地点待补充' && !itemName) continue
    if (header.columns.quantity !== undefined && columnAliases.quantity.some(alias => headerKey(alias) === headerKey(valueAt(row, header.columns.quantity)))) continue

    const packageName = valueAt(row, header.columns.packageName) || sheet.name
    const packageNo = valueAt(row, header.columns.packageNo)
    const packageKey = `${packageName}\u0000${packageNo}`
    const summary = packages.get(packageKey) || {
      packageName,
      packageNo,
      codes: new Set<string>(),
      voltages: new Set<string>(),
      totals: new Map<string, number>(),
      locations: new Map<string, { region: string; project: string; deliveryPoint: string; itemCount: number; quantities: Map<string, number> }>(),
      itemCount: 0,
    }
    summary.itemCount += 1
    if (code) summary.codes.add(code)
    const voltage = valueAt(row, header.columns.voltage)
    if (voltage) summary.voltages.add(voltage)

    if (quantity !== null) addQuantity(summary.totals, unit, quantity)

    const region = provinceOf(deliveryPoint)
    const key = [region, project, deliveryPoint].join('\u0000')
    const location = summary.locations.get(key) || { region, project, deliveryPoint, itemCount: 0, quantities: new Map<string, number>() }
    location.itemCount += 1
    if (quantity !== null) addQuantity(location.quantities, unit, quantity)
    summary.locations.set(key, location)
    packages.set(packageKey, summary)
  }

  return [...packages.values()].map(summary => {
    const locationRows: MaterialDeliverySummary[] = [...summary.locations.values()].map(location => ({
      region: location.region,
      project: location.project,
      deliveryPoint: location.deliveryPoint,
      itemCount: location.itemCount,
      quantities: quantityRows(location.quantities),
    }))
    return {
      sheetName: `${sheet.name} · ${summary.packageName}${summary.packageNo ? ` · ${summary.packageNo}` : ''}`,
      sourceWorksheetId: worksheetId,
      sourceWorksheetName: sheet.name,
      packageName: summary.packageName,
      packageNo: summary.packageNo,
      voltageLevels: [...summary.voltages],
      itemCount: summary.itemCount,
      technicalCodeCount: summary.codes.size,
      quantities: quantityRows(summary.totals),
      locations: locationRows,
    }
  })
}

export async function loadMaterialWorkbook(file: File): Promise<any> {
  if (!/\.xlsx$/i.test(file.name)) throw new Error('物料清单请使用 .xlsx 格式，暂不支持旧版 .xls 文件')
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  try { await workbook.xlsx.load(await file.arrayBuffer()) }
  catch { throw new Error('Excel 文件无法读取，请确认文件未损坏且为有效的 .xlsx 文件') }
  if (!workbook.worksheets.length) throw new Error('Excel 文件中没有可读取的工作表')
  return workbook
}

export function discoverMaterialWorksheets(workbook: any): MaterialWorksheetInfo[] {
  return workbook.worksheets.map((sheet: any, index: number) => ({
    id: `sheet-${sheet.id}`,
    name: String(sheet.name),
    order: index,
    state: sheet.state === 'veryHidden' ? 'veryHidden' : sheet.state === 'hidden' ? 'hidden' : 'visible',
  }))
}

export function summarizeMaterialWorksheets(workbook: any, selectedIds: string[]): MaterialWorksheetParseResult[] {
  const selected = new Set(selectedIds)
  return discoverMaterialWorksheets(workbook)
    .filter(worksheet => selected.has(worksheet.id))
    .map(worksheet => {
      const sheet = workbook.worksheets.find((candidate: any) => `sheet-${candidate.id}` === worksheet.id)
      const summaries = summarizeSheet(sheet, worksheet.id)
      return { worksheet, summaries, error: summaries.length ? undefined : '未识别到包含有效报价包的清单数据，请检查表头及数据行' }
    })
}

export async function readMaterialList(file: File): Promise<MaterialPackageSummary[]> {
  const workbook = await loadMaterialWorkbook(file)
  const summaries = workbook.worksheets.flatMap((sheet: any) => summarizeSheet(sheet))
  if (!summaries.length) throw new Error('没有找到包含“数量”和“单位”列的包清单工作表，请检查 Excel 表头')
  return summaries
}
