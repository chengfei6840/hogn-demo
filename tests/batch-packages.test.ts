import test from 'node:test'
import assert from 'node:assert/strict'
import { aggregateGoods, batchCompatibility, getPackageBatchCapability, packageCategory } from '../src/domain/batch-packages.ts'
import type { Package } from '../src/domain/model.ts'

function pkg(overrides: Partial<Package> = {}): Package {
  return {
    id: 'P1', projectId: 'PR1', packageName: '包1', packageNo: 'GW100', stage: '并行协作', version: 1,
    salesConfirmed: null, techConfirmed: null, items: [], files: [], audit: [], snapshots: [], pricingNote: '',
    tax: 13, manualBoss: false, settings: { amountThreshold: null, marginFloor: null }, createdAt: '',
    processParticipants: { dataParsing: '销售 · 王宁', salesConfirmation: '销售 · 王宁', technicalConfirmation: '技术 · 李总监', costCalculation: '财务 · 张会计', approvalIssuance: '财务 · 张会计', salesExternal: '销售 · 王宁', dealTracking: '销售 · 王宁' },
    ...overrides,
  }
}

test('相同 Stage 的销售确认与技术确认是不同待办，且按负责人限制', () => {
  const sales = pkg()
  const tech = pkg({ id: 'P2', salesConfirmed: 1, technicalExecution: { mode: 'director' } as any })
  assert.equal(getPackageBatchCapability(sales, '销售', '销售 · 王宁').key, 'sales-confirmation')
  assert.equal(getPackageBatchCapability(tech, '技术', '技术 · 李总监').key, 'technical-director')
  assert.equal(batchCompatibility([getPackageBatchCapability(sales, '销售', '销售 · 王宁'), getPackageBatchCapability(tech, '销售', '销售 · 王宁')]).compatible, false)
  assert.equal(getPackageBatchCapability(sales, '销售', '销售 · 其他').allowed, false)
})

test('归档包只读，阶段完成后不提供可写批量环节', () => {
  assert.equal(getPackageBatchCapability(pkg({ archivedAt: '2026/10/19' }), '销售', '销售 · 王宁').allowed, false)
  assert.equal(getPackageBatchCapability(pkg({ stage: '已出具', salesConfirmed: 1 }), '销售', '销售 · 王宁').key, 'sales-external')
})

test('全部分类包含旧包回退分类，聚合身份由包 ID 和包内货物项 ID 组成', () => {
  const a = pkg({ id: 'A', items: [{ id: '01', name: '货物A', quantity: 2, unit: '套' } as any] })
  const b = pkg({ id: 'B', packageName: '包2', items: [{ id: '01', name: '货物B', quantity: 3, unit: '套' } as any], materialSummary: { sourceWorksheetName: '测试表' } as any })
  const rows = aggregateGoods([a, b], [{ id: 'sheet-a', name: '线路金具' }])
  assert.equal(packageCategory(a, []), '未分类')
  assert.equal(rows[0].categoryName, '未分类')
  assert.equal(rows[1].categoryName, '测试表')
  assert.deepEqual(rows.map(row => [row.packageId, row.itemId]), [['A', '01'], ['B', '01']])
})

test('只有同一可操作待办可以进入批量工作区', () => {
  const first = getPackageBatchCapability(pkg(), '销售', '销售 · 王宁')
  const second = getPackageBatchCapability(pkg({ id: 'P2' }), '销售', '销售 · 王宁')
  assert.deepEqual(batchCompatibility([first, second]), { compatible: true, reason: '' })
  assert.equal(batchCompatibility([]).compatible, false)
})
