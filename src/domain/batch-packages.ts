import { canHandlePackageProcess, packageProcessParticipant, technicalDirector, type Package, type Role } from './model.ts'

export type BatchCapability = { key: string; label: string; allowed: boolean; reason?: string }

/** Resolve the actor's real next work item, since several work items share one Stage. */
export function getPackageBatchCapability(pkg: Package, role: Role, person: string): BatchCapability {
  if (pkg.archivedAt) return { key: 'readonly', label: '已归档', allowed: false, reason: '已归档包只读' }
  if (pkg.stage === '资料整理') {
    const allowed = role === '销售' && canHandlePackageProcess(pkg, 'dataParsing', person)
    return { key: 'parsing', label: '资料解析', allowed, reason: allowed ? undefined : `资料负责人：${packageProcessParticipant(pkg, 'dataParsing')}` }
  }
  if (pkg.stage === '并行协作' && pkg.salesConfirmed !== pkg.version) {
    const allowed = role === '销售' && canHandlePackageProcess(pkg, 'salesConfirmation', person)
    return { key: 'sales-confirmation', label: '销售需求确认', allowed, reason: allowed ? undefined : `销售负责人：${packageProcessParticipant(pkg, 'salesConfirmation')}` }
  }
  if (pkg.stage === '并行协作' && pkg.techConfirmed !== pkg.version) {
    const employee = person !== technicalDirector && pkg.technicalExecution?.mode === 'employee' && pkg.technicalExecution.status === 'assigned'
    const allowed = role === '技术' && ((employee && person === pkg.technicalExecution?.assignee) || person === packageProcessParticipant(pkg, 'technicalConfirmation'))
    return { key: employee ? 'technical-employee' : 'technical-director', label: employee ? '技术选项处理' : '技术总监确认', allowed, reason: allowed ? undefined : `技术负责人：${employee ? pkg.technicalExecution?.assignee : packageProcessParticipant(pkg, 'technicalConfirmation')}` }
  }
  if (pkg.stage === '财务核价') {
    const allowed = role === '财务' && canHandlePackageProcess(pkg, 'costCalculation', person)
    return { key: 'costing', label: '成本核算', allowed, reason: allowed ? undefined : `核价负责人：${packageProcessParticipant(pkg, 'costCalculation')}` }
  }
  if (pkg.stage === '审批签发' || pkg.stage === '可出具报价') {
    const step = pkg.approvalRun?.steps.find(candidate => candidate.status === 'pending')
    const allowed = !!step && step.role === role && step.assignee === person
    return { key: `approval:${step?.id || pkg.stage}`, label: step?.name || '审批处理', allowed, reason: allowed ? undefined : `当前审批人：${step?.assignee || '未配置'}` }
  }
  if (pkg.stage === '已出具') {
    const allowed = role === '销售' && canHandlePackageProcess(pkg, 'salesExternal', person)
    return { key: 'sales-external', label: '销售外发', allowed, reason: allowed ? undefined : `外发负责人：${packageProcessParticipant(pkg, 'salesExternal')}` }
  }
  if (pkg.stage === '客户议价中') {
    const allowed = role === '销售' && canHandlePackageProcess(pkg, 'dealTracking', person)
    return { key: 'deal-tracking', label: '成交跟踪', allowed, reason: allowed ? undefined : `跟踪负责人：${packageProcessParticipant(pkg, 'dealTracking')}` }
  }
  return { key: `readonly:${pkg.stage}`, label: pkg.stage, allowed: false, reason: '当前状态没有可批量处理的待办' }
}

export function batchCompatibility(capabilities: BatchCapability[]) {
  if (!capabilities.length) return { compatible: false, reason: '请至少选择一个报价包' }
  if (capabilities.some(capability => !capability.allowed)) return { compatible: false, reason: capabilities.find(capability => !capability.allowed)?.reason || '所选包包含无权处理的待办' }
  const keys = new Set(capabilities.map(capability => capability.key))
  if (keys.size !== 1) return { compatible: false, reason: [...new Set(capabilities.map(capability => capability.label))].join('、') + ' 属于不同处理环节' }
  return { compatible: true, reason: '' }
}

export const ALL_WORKSHEETS = '__all__'
export function packageCategory(pkg: Package, sheets: { id: string; name: string }[]) {
  return sheets.find(sheet => sheet.id === pkg.materialWorksheetId)?.name || pkg.materialSummary?.sourceWorksheetName || '未分类'
}

export type BatchGoodsRow = { packageId: string; packageName: string; categoryName: string; itemId: string; item: Package['items'][number] }
export function aggregateGoods(packages: Package[], sheets: { id: string; name: string }[]): BatchGoodsRow[] {
  return packages.flatMap(pkg => pkg.items.map(item => ({ packageId: pkg.id, packageName: pkg.packageName, categoryName: packageCategory(pkg, sheets), itemId: item.id, item })))
}
