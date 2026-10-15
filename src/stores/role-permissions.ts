import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Role } from '@/domain/model'

export const permissionPages = [
  { id: 'dashboard', label: '工作台' }, { id: 'overview', label: '项目台账' },
  { id: 'packages', label: '报价包列表' }, { id: 'parse', label: '资料解析' },
  { id: 'collaboration', label: '询价协作' }, { id: 'bom', label: 'BOM' },
  { id: 'finance', label: '核价与审批' }, { id: 'quotes', label: '报价记录' },
  { id: 'data-governance', label: '资料治理' }, { id: 'archive', label: '历史库' },
  { id: 'rules', label: '规则与字典' }, { id: 'user-management', label: '用户管理' },
  { id: 'roles', label: '角色管理' }, { id: 'approval-workflow', label: '审批与流程配置' },
] as const
export const permissionActions = [
  { id: 'project.create', label: '新建项目 / 报价包' }, { id: 'project.edit', label: '编辑项目信息与流程负责人' },
  { id: 'inquiry.manage', label: '登记资料与启动解析' }, { id: 'sales.confirm', label: '销售确认需求' },
  { id: 'technical.manage', label: '处理技术确认与指派' }, { id: 'finance.manage', label: '修改成本与保存核价' },
  { id: 'approval.manage', label: '提交、处理与签发审批' }, { id: 'quote.manage', label: '外发报价与登记成交' },
  { id: 'settings.manage', label: '维护全局风险提醒' },
] as const
export type PermissionKey = typeof permissionPages[number]['id'] | typeof permissionActions[number]['id']
type PermissionMap = Record<PermissionKey, boolean>
const roles: Role[] = ['销售', '技术', '财务', '董事长', '管理员']
const keys = [...permissionPages.map(item => item.id), ...permissionActions.map(item => item.id)] as PermissionKey[]
const STORAGE = 'hogn-role-permissions-v1'
function defaults(): Record<Role, PermissionMap> {
  const allow: Record<Role, PermissionKey[]> = {
    销售: ['dashboard','overview','packages','parse','collaboration','bom','quotes','archive','project.create','project.edit','inquiry.manage','sales.confirm','quote.manage'],
    技术: ['dashboard','overview','packages','parse','collaboration','bom','technical.manage'],
    财务: ['dashboard','overview','packages','bom','finance','quotes','approval-workflow','finance.manage','approval.manage'],
    董事长: ['dashboard','overview','packages','finance','quotes','approval-workflow','settings.manage'],
    管理员: ['dashboard','overview','packages','data-governance','archive','rules','user-management','roles','approval-workflow','approval.manage'],
  }
  return Object.fromEntries(roles.map(role => [role, Object.fromEntries(keys.map(key => [key, allow[role].includes(key)]))])) as Record<Role, PermissionMap>
}
function load(): Record<Role, PermissionMap> {
  const baseline = defaults()
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE) || 'null')
    if (!saved) return baseline
    for (const role of roles) for (const key of keys) if (typeof saved?.[role]?.[key] === 'boolean') baseline[role][key] = saved[role][key]
  } catch { /* Retain the built-in demo permissions. */ }
  return baseline
}

export const useRolePermissionsStore = defineStore('role-permissions', () => {
  const permissions = ref<Record<Role, PermissionMap>>(load())
  const can = (role: Role, key: PermissionKey) => permissions.value[role][key]
  const canGrant = (role: Role, key: PermissionKey) => !permissionActions.some(action=>action.id===key) || defaults()[role][key]
  function set(role: Role, key: PermissionKey, value: boolean) {
    if(value&&!canGrant(role,key))return false
    permissions.value[role][key] = value
    try { localStorage.setItem(STORAGE, JSON.stringify(permissions.value)); return true }
    catch { permissions.value[role][key] = !value; return false }
  }
  return { permissions, can, canGrant, set }
})
