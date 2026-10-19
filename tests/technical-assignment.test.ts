import test from 'node:test'
import assert from 'node:assert/strict'
import { technicalAssignmentTargets, technicalWorkflowScope } from '../src/domain/technical-assignment.ts'
import { batchCompatibility, getPackageBatchCapability } from '../src/domain/batch-packages.ts'
import { technicalDirector, isPackageVisibleToPerson, type Package } from '../src/domain/model.ts'

function packages() {
  return ['P1', 'P2', 'P3'].map(id => ({ id, projectId:'PR1', packageName:'包1', packageNo:'GW100', stage:'并行协作', version:1, salesConfirmed:1, techConfirmed:null, items:[], files:[], audit:[], snapshots:[], pricingNote:'', tax:13, manualBoss:false, settings:{amountThreshold:null,marginFloor:null}, createdAt:'' } satisfies Package)) as Package[]
}
test('部分包指派使用包ID，同名包与未选包保持独立', () => {
  const all = packages()
  const selected = technicalAssignmentTargets(all, ['P3', 'P3'], technicalDirector)
  assert.deepEqual(selected.map(pkg => pkg.id), ['P3'])
  selected[0].technicalExecution = { mode: 'employee', assignee: '技术 · 李工', status: 'assigned' }
  assert.equal(all[0].technicalExecution, undefined)
  assert.equal(all[1].technicalExecution, undefined)
  assert.deepEqual(technicalWorkflowScope(all, '技术', '技术 · 李工').map(pkg => pkg.id), ['P3'])
  assert.equal(technicalWorkflowScope(all, '技术', '技术 · 周工').length, 0)
  assert.equal(isPackageVisibleToPerson(all[0], '技术 · 李工', '技术'), false)
  assert.equal(isPackageVisibleToPerson(all[2], '技术 · 李工', '技术'), true)
  assert.equal(technicalWorkflowScope(all, '技术', technicalDirector).length, 3)
})
test('空选择、范围外、非总监、已归档、未销售确认与技术已确认均拒绝整批指派', () => {
  const all = packages()
  assert.throws(() => technicalAssignmentTargets(all, [], technicalDirector))
  assert.throws(() => technicalAssignmentTargets(all, ['P1', 'outside'], technicalDirector))
  assert.throws(() => technicalAssignmentTargets(all, ['P1'], '技术 · 李工'))
  for (const change of [{ archivedAt: '2026-10-19' }, { salesConfirmed: null }, { techConfirmed: 1 }, { stage: '财务核价' as const }]) {
    assert.throws(() => technicalAssignmentTargets([all[0], { ...all[1], ...change }], ['P1', 'P2'], technicalDirector))
    assert.equal(all[0].technicalExecution, undefined)
  }
})
test('转派收回旧员工范围；员工提交后仍可查看本人包，总监可批量查看混合任务', () => {
  const all = packages()
  all[1].technicalExecution = { mode: 'employee', assignee: '技术 · 李工', status: 'submitted' }
  assert.deepEqual(technicalWorkflowScope(all, '技术', '技术 · 李工').map(pkg => pkg.id), ['P2'])
  assert.equal(getPackageBatchCapability(all[1], '技术', '技术 · 李工').allowed, false)
  assert.equal(batchCompatibility(all.map(pkg => getPackageBatchCapability(pkg, '技术', technicalDirector))).compatible, true)
  all[1].technicalExecution.assignee = '技术 · 周工'
  assert.equal(technicalWorkflowScope(all, '技术', '技术 · 李工').length, 0)
  assert.equal(technicalWorkflowScope(all, '技术', '技术 · 周工').length, 1)
  all[1].technicalExecution = { mode: 'director', status: 'assigned' }
  assert.equal(technicalWorkflowScope(all, '技术', '技术 · 周工').length, 0)
})
