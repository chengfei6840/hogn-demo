import { canHandleTechnicalWork, packageProcessParticipant, technicalDirector, type Package, type Role } from './model.ts'

/** 批次原始选择由总监保留，员工的展示、导出和提交只使用本人任务范围。 */
export function technicalWorkflowScope(packages: Package[], role: Role, person: string): Package[] {
  return role === '技术' && person !== technicalDirector
    ? packages.filter(pkg => canHandleTechnicalWork(pkg, person))
    : packages
}

export function canAssignTechnicalPackage(pkg: Package, person: string): boolean {
  return person === technicalDirector && packageProcessParticipant(pkg, 'technicalConfirmation') === person
    && !pkg.archivedAt && pkg.stage === '并行协作'
    && pkg.salesConfirmed === pkg.version && pkg.techConfirmed !== pkg.version
}

export function technicalAssignmentTargets(packages: Package[], ids: string[], person: string): Package[] {
  if (!ids.length) throw Error('请至少选择一个报价包')
  const targets = [...new Set(ids)].map(id => packages.find(pkg => pkg.id === id))
  if (targets.some(pkg => !pkg)) throw Error('所选包不在本次任务范围内')
  if (targets.some(pkg => !canAssignTechnicalPackage(pkg!, person))) throw Error('所选包存在无权指派或已完成技术确认的任务')
  return targets as Package[]
}
