<script setup lang="ts">
import { computed, ref } from 'vue'
import { rolePeople, endedStages, type Role } from '@/domain/model'
import { useUsersStore, personLabel, type DemoUser } from '@/stores/users'
import { useWorkspace } from '@/domain/store'
import { useWorkflowStore } from '@/stores/workflow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AppSelect from '@/components/AppSelect.vue'

const users = useUsersStore()
const workflow = useWorkflowStore()
const { projects, role, toast } = useWorkspace()
const roles = Object.keys(rolePeople) as Role[]
const query = ref('')
const roleFilter = ref('全部角色')
const statusFilter = ref('全部状态')
const editorOpen = ref(false)
const editingId = ref('')
const form = ref({ name: '', account: '', role: '销售' as Role })
const selectedBlockers = ref<string[]>([])
const filtered = computed(() => users.users.filter(user => {
  const matchesText = `${user.name} ${user.account} ${personLabel(user)}`.toLowerCase().includes(query.value.trim().toLowerCase())
  return matchesText && (roleFilter.value === '全部角色' || user.role === roleFilter.value) && (statusFilter.value === '全部状态' || (statusFilter.value === '已启用') === user.enabled)
}))
function blockersFor(user: DemoUser) {
  const label = personLabel(user)
  const blockers: string[] = []
  for (const project of projects.value) {
    const openPackages = project.packages.filter(pkg => !pkg.archivedAt && !endedStages.includes(pkg.stage))
    if (!openPackages.length) continue
    const owners: [string, string][] = [['salesOwner', '销售负责人'], ['techOwner', '技术负责人'], ['financeOwner', '财务负责人']]
    for (const [key, title] of owners) if (project[key as keyof typeof project] === label) blockers.push(`${project.name} · ${title}`)
    for (const pkg of openPackages) {
      const participant = pkg.processParticipants
      if (participant) for (const [key, owner] of Object.entries(participant)) if (owner === label) {
        const names: Record<string, string> = { dataParsing:'资料解析', salesConfirmation:'销售需求确认', technicalConfirmation:'技术确认', costCalculation:'成本核算', approvalIssuance:'审批签发', salesExternal:'报价外发', dealTracking:'成交追踪' }
        blockers.push(`${project.name} / ${pkg.packageName} · ${names[key] || key}`)
      }
      if (pkg.technicalExecution?.status === 'assigned' && pkg.technicalExecution.assignee === label) blockers.push(`${project.name} / ${pkg.packageName} · 技术待办`)
      const pending = pkg.approvalRun?.status === 'running' ? pkg.approvalRun.steps.find(step => step.status === 'pending') : undefined
      if (pending?.assignee === label) blockers.push(`${project.name} / ${pkg.packageName} · ${pending.name}审批待办`)
    }
  }
  const active = workflow.activeRecord
  if (active?.graph.nodes.some(node => node.properties.kind === 'task' && node.properties.assignee === label)) blockers.push(`启用中的审批模板 · ${active.name}`)
  for(const [key,owner] of Object.entries(workflow.stageOperators))if(owner===label)blockers.push(`流程负责人模板 · ${key}`)
  return [...new Set(blockers)]
}
function openCreate() { if (role.value !== '管理员') { toast('请切换到管理员后维护用户'); return } editingId.value = ''; form.value = { name: '', account: '', role: '销售' }; editorOpen.value = true }
function openEdit(user: DemoUser) { if (role.value !== '管理员') { toast('请切换到管理员后维护用户'); return } editingId.value = user.id; form.value = { name: user.name, account: user.account, role: user.role }; editorOpen.value = true }
function save() {
  if (!form.value.name.trim() || !form.value.account.trim()) { toast('请填写姓名和账号'); return }
  const previous=users.users.find(user=>user.id===editingId.value)
  if(previous&&(previous.name!==form.value.name||previous.role!==form.value.role)&&blockersFor(previous).length){toast('该用户仍负责项目或流程，请先调整责任后再修改姓名或角色');return}
  const result = editingId.value ? users.update(editingId.value, form.value) : users.add(form.value)
  if (result) { toast(result); return }
  editorOpen.value = false; toast(editingId.value ? '用户信息已保存' : '用户已新增')
}
function toggle(user: DemoUser) {
  if (role.value !== '管理员') { toast('请切换到管理员后维护用户'); return }
  if (user.enabled) {
    const blockers = blockersFor(user)
    if (blockers.length) { selectedBlockers.value = blockers; return }
  }
  const result = users.setEnabled(user.id, !user.enabled)
  if (result) toast(result); else toast(user.enabled ? '用户已停用' : '用户已启用')
}
</script>

<template>
  <div class="page-heading"><div><p class="eyebrow">系统管理</p><h1>用户管理</h1><p class="muted">维护演示账号、角色和启用状态；项目负责人在创建项目时选择。</p></div><span class="demo-label">本地原型数据</span></div>
  <section class="panel">
    <div class="panel-heading"><div><h2>用户列表 <span class="muted">{{ filtered.length }}</span></h2><p class="muted">停用前会检查该用户负责的项目、流程任务和审批模板。</p></div><Button :disabled="role !== '管理员'" @click="openCreate">新增用户</Button></div>
    <div class="user-filters"><Input v-model="query" aria-label="搜索用户" placeholder="搜索姓名或账号"/><AppSelect v-model="roleFilter" label="按角色筛选" :options="['全部角色', ...roles]"/><AppSelect v-model="statusFilter" label="按状态筛选" :options="['全部状态','已启用','已停用']"/></div>
    <div class="table-wrap"><table><thead><tr><th>用户</th><th>账号</th><th>角色</th><th>项目责任</th><th>状态</th><th>操作</th></tr></thead><tbody>
      <tr v-for="user in filtered" :key="user.id"><td><strong>{{ personLabel(user) }}</strong></td><td>{{ user.account }}</td><td>{{ user.role }}</td><td>{{ user.role === '管理员' ? '系统管理' : projects.filter(project => [project.salesOwner, project.techOwner, project.financeOwner].includes(personLabel(user)) && project.packages.some(pkg => !pkg.archivedAt && !endedStages.includes(pkg.stage))).length + ' 个在办项目' }}</td><td><span class="status" :class="user.enabled ? 'good' : 'muted-status'"><span class="status-dot"/>{{ user.enabled ? '已启用' : '已停用' }}</span></td><td class="user-actions"><Button size="sm" variant="outline" :disabled="role !== '管理员'" @click="openEdit(user)">编辑</Button><Button size="sm" :variant="user.enabled ? 'ghost' : 'outline'" :disabled="role !== '管理员'" @click="toggle(user)">{{ user.enabled ? '停用' : '启用' }}</Button></td></tr>
      <tr v-if="!filtered.length"><td colspan="6" class="empty-row">没有符合条件的用户</td></tr>
    </tbody></table></div>
    <p v-if="role !== '管理员'" class="notice">切换到管理员角色后可新增、编辑和停用用户。</p>
  </section>
  <div v-if="editorOpen" class="user-modal-backdrop" @click.self="editorOpen=false"><section class="user-modal panel" role="dialog" aria-modal="true" :aria-label="editingId ? '编辑用户' : '新增用户'"><div class="panel-heading"><div><h2>{{ editingId ? '编辑用户' : '新增用户' }}</h2><p class="muted">账号仅用于原型识别，不代表真实登录认证。</p></div><Button variant="ghost" @click="editorOpen=false">关闭</Button></div><label>姓名<Input v-model="form.name" placeholder="例如：赵审核"/></label><label>演示账号<Input v-model="form.account" placeholder="例如：zhao.audit"/></label><label>角色<AppSelect v-model="form.role" label="选择用户角色" :options="roles"/></label><div class="user-modal-actions"><Button variant="outline" @click="editorOpen=false">取消</Button><Button @click="save">保存用户</Button></div></section></div>
  <div v-if="selectedBlockers.length" class="user-modal-backdrop" @click.self="selectedBlockers=[]"><section class="user-modal panel" role="alertdialog" aria-modal="true" aria-labelledby="disable-block-title"><div class="panel-heading"><div><h2 id="disable-block-title">该用户仍有负责事项</h2><p class="muted">先在项目或流程中调整负责人，再停用此用户。</p></div><Button variant="ghost" @click="selectedBlockers=[]">关闭</Button></div><ul class="blocker-list"><li v-for="item in selectedBlockers" :key="item">{{ item }}</li></ul><div class="user-modal-actions"><Button @click="selectedBlockers=[]">知道了</Button></div></section></div>
</template>

<style scoped>
.user-filters{display:grid;grid-template-columns:minmax(220px,1fr) 180px 160px;gap:10px;padding:0 20px 16px}.user-actions{display:flex;gap:6px;white-space:nowrap}.muted-status{color:#8393a0}.muted-status .status-dot{background:#aeb9c2}.empty-row{text-align:center;color:#8393a0;padding:28px!important}.user-modal-backdrop{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:20px;background:#14253666}.user-modal{width:min(520px,100%);padding:22px;display:flex;flex-direction:column;gap:15px;box-shadow:0 24px 70px #102b4033}.user-modal label{display:flex;flex-direction:column;gap:6px;font-size:12px;color:#526777}.user-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:6px}.blocker-list{margin:0;padding:14px 14px 14px 34px;background:#fff8ed;border-radius:8px;color:#805d36;display:grid;gap:8px;font-size:13px;max-height:250px;overflow:auto}@media(max-width:700px){.user-filters{grid-template-columns:1fr}.user-actions{flex-wrap:wrap}}
</style>
