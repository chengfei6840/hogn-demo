import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { rolePeople, type Role } from '@/domain/model'

export interface DemoUser {
  id: string
  name: string
  account: string
  role: Role
  enabled: boolean
}

const STORAGE = 'hogn-demo-users-v1'
const roles = Object.keys(rolePeople) as Role[]
function personLabel(user: Pick<DemoUser, 'role' | 'name'>) { return user.role === '管理员' && user.name === '管理员' ? '管理员' : `${user.role} · ${user.name}` }
function seedUsers(): DemoUser[] {
  return roles.flatMap(role => rolePeople[role].map((label, index) => {
    const name = label.split(' · ').slice(1).join(' · ') || role
    return { id: `${role}-${index + 1}`, name, account: `${role.toLowerCase()}${index + 1}`, role, enabled: true }
  }))
}
function loadUsers(): DemoUser[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE) || 'null')
    if (Array.isArray(saved) && saved.every(user => user?.id && user?.name && user?.account && roles.includes(user.role) && typeof user.enabled === 'boolean')) return saved
  } catch { /* Use the demo roster when local data is unavailable. */ }
  return seedUsers()
}

export const useUsersStore = defineStore('demo-users', () => {
  const users = ref<DemoUser[]>(loadUsers())
  const enabledUsers = computed(() => users.value.filter(user => user.enabled))
  const peopleForRole = (role: Role) => enabledUsers.value.filter(user => user.role === role).map(personLabel)
  const personForId = (id: string) => { const user = users.value.find(entry => entry.id === id); return user ? personLabel(user) : '' }
  function persist() { try { localStorage.setItem(STORAGE, JSON.stringify(users.value)); return true } catch { return false } }
  function add(input: Omit<DemoUser, 'id' | 'enabled'>) {
    if (users.value.some(user => user.account.toLowerCase() === input.account.trim().toLowerCase())) return '账号已存在'
    if (users.value.some(user => personLabel(user) === `${input.role} · ${input.name.trim()}`)) return '该角色下已存在同名用户'
    users.value.unshift({ ...input, name: input.name.trim(), account: input.account.trim(), id: `user-${crypto.randomUUID().slice(0, 8)}`, enabled: true })
    return persist() ? '' : '保存失败，请检查浏览器存储空间'
  }
  function update(id: string, input: Omit<DemoUser, 'id' | 'enabled'>) {
    const user = users.value.find(entry => entry.id === id)
    if (!user) return '用户不存在'
    if (users.value.some(entry => entry.id !== id && entry.account.toLowerCase() === input.account.trim().toLowerCase())) return '账号已存在'
    if (users.value.some(entry => entry.id !== id && personLabel(entry) === `${input.role} · ${input.name.trim()}`)) return '该角色下已存在同名用户'
    Object.assign(user, { ...input, name: input.name.trim(), account: input.account.trim() })
    return persist() ? '' : '保存失败，请检查浏览器存储空间'
  }
  function setEnabled(id: string, enabled: boolean) {
    const user = users.value.find(entry => entry.id === id)
    if (!user) return '用户不存在'
    if (!enabled && enabledUsers.value.filter(entry => entry.role === user.role).length <= 1) return `至少保留一名启用的${user.role}用户`
    const previous = user.enabled
    user.enabled = enabled
    if (persist()) return ''
    user.enabled = previous
    return '保存失败，请检查浏览器存储空间'
  }
  return { users, enabledUsers, peopleForRole, personForId, add, update, setEnabled, persist }
})

export { personLabel }
