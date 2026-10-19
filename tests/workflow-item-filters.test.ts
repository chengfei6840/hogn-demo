import test from 'node:test'
import assert from 'node:assert/strict'
import { ALL_FILTER, collectWorkflowItems, filterWorkflowItems } from '../src/domain/workflow-item-filters.ts'
import type { Package } from '../src/domain/model.ts'

function pkg(id: string, worksheetId: string, categoryName: string, name = '包1'): Package {
  return { id, projectId: 'project', packageName: name, packageNo: id, materialWorksheetId: worksheetId,
    materialSummary: { sourceWorksheetName: categoryName } as any, stage: '并行协作', version: 1, salesConfirmed: null,
    techConfirmed: null, items: [{ id: '01', name: '绝缘子串', model: 'X-ABC', quantity: 1, unit: '套', confirmed: false } as any],
    files: [], audit: [], snapshots: [], pricingNote: '', tax: 13, manualBoss: false,
    settings: { amountThreshold: null, marginFloor: null }, createdAt: '', processParticipants: {} as any }
}

test('类别、报价包、关键词、状态以 AND 组合且不合并同编号货物项', () => {
  const packages = [pkg('P1', 'sheet-a', '线路金具'), pkg('P2', 'sheet-b', '测试1'), pkg('P3', 'sheet-b', '测试1', '包2')]
  const rows = collectWorkflowItems(packages, [{ id: 'sheet-a', name: '线路金具' }, { id: 'sheet-b', name: '测试1' }] as any)
  const filtered = filterWorkflowItems(rows, { categoryKey: 'sheet-b', packageId: 'P3', query: ' x-abc ', status: 'pending' }, () => '缺少串信息')
  assert.deepEqual(filtered.map(row => [row.packageId, row.itemId]), [['P3', '01']])
  assert.equal(filterWorkflowItems(rows, { categoryKey: ALL_FILTER, packageId: ALL_FILTER, query: '', status: 'all' }, () => '待确认').length, 3)
})

test('已解决状态使用传入的角色业务判定，空结果不扩展到未选包', () => {
  const rows = collectWorkflowItems([pkg('P1', 'a', '线路金具')], [{ id: 'a', name: '线路金具' }] as any)
  const filter = { categoryKey: ALL_FILTER, packageId: ALL_FILTER, query: '', status: 'resolved' as const }
  assert.equal(filterWorkflowItems(rows, filter, () => '已解决').length, 1)
  assert.equal(filterWorkflowItems(rows, { ...filter, packageId: 'P2' }, () => '已解决').length, 0)
})
