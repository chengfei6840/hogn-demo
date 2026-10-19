import type { Item, MaterialWorksheetMeta, Package } from './model.ts'
import { packageCategory } from './batch-packages.ts'

export const ALL_FILTER = '__all__'
export type WorkflowItemRow = { packageId: string; itemId: string; packageName: string; categoryName: string; categoryKey: string; pkg: Package; item: Item }
export type WorkflowItemFilter = { categoryKey: string; packageId: string; query: string; status: 'all' | 'resolved' | 'pending' }

export function categoryKey(pkg: Package): string {
  return pkg.materialWorksheetId || `legacy:${pkg.materialSummary?.sourceWorksheetName || '未分类'}`
}

export function collectWorkflowItems(packages: Package[], sheets: MaterialWorksheetMeta[]): WorkflowItemRow[] {
  return packages.flatMap(pkg => pkg.items.map(item => ({
    packageId: pkg.id,
    itemId: String(item.id),
    packageName: pkg.packageName,
    categoryName: packageCategory(pkg, sheets),
    categoryKey: categoryKey(pkg),
    pkg,
    item,
  })))
}

export function filterWorkflowItems(
  rows: WorkflowItemRow[],
  filter: WorkflowItemFilter,
  statusFor: (row: WorkflowItemRow) => string,
): WorkflowItemRow[] {
  const query = filter.query.trim().toLocaleLowerCase()
  return rows.filter(row => {
    if (filter.categoryKey !== ALL_FILTER && row.categoryKey !== filter.categoryKey) return false
    if (filter.packageId !== ALL_FILTER && row.packageId !== filter.packageId) return false
    const status = statusFor(row)
    if (filter.status === 'resolved' && !['已解决', '不纳入本次报价'].includes(status)) return false
    if (filter.status === 'pending' && ['已解决', '不纳入本次报价'].includes(status)) return false
    if (!query) return true
    const item = row.item
    const searchable = [item.name, item.model, item.spec, item.id, item.conductor, item.voltage,
      ...Object.entries(item.goodsList || {}).filter(([key]) => /编码|编号|物料码|code|id/i.test(key)).map(([, value]) => value),
    ].filter(Boolean).join('\n').toLocaleLowerCase()
    return searchable.includes(query)
  })
}
