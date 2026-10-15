<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWorkspace } from '@/domain/store'
import { permissionActions, permissionPages, useRolePermissionsStore, type PermissionKey } from '@/stores/role-permissions'
import type { Role } from '@/domain/model'
import { Button } from '@/components/ui/button'

const { role, toast } = useWorkspace()
const access = useRolePermissionsStore()
const roles: Role[] = ['销售','技术','财务','董事长','管理员']
const editable = computed(() => role.value === '管理员')
function toggle(target: Role, key: PermissionKey, event: Event) {
  if (!editable.value) { toast('切换到管理员角色后可编辑权限'); return }
  const checked = (event.target as HTMLInputElement).checked
  if (!access.set(target, key, checked)) toast('保存失败，请检查浏览器存储空间')
  else toast(`${target}权限已更新，页面访问或操作将立即生效`)
}
</script>

<template>
 <div class="page-heading"><div><p class="eyebrow">系统管理</p><h1>角色管理</h1><p class="muted">配置角色可进入的页面和可执行的关键操作，变更会立即作用于演示原型。</p></div><span class="demo-label">{{ editable ? '权限可编辑' : '当前只读 · 管理员可编辑' }}</span></div>
 <section class="panel permission-panel"><div class="panel-heading"><div><h2>页面访问</h2><p class="muted">取消勾选后，侧边栏入口仍然保留，进入页面时显示权限说明。</p></div></div><div class="table-wrap"><table class="permission-table"><thead><tr><th>页面</th><th v-for="target in roles" :key="target">{{ target }}</th></tr></thead><tbody><tr v-for="entry in permissionPages" :key="entry.id"><th scope="row">{{ entry.label }}</th><td v-for="target in roles" :key="target"><label class="permission-switch"><input type="checkbox" :checked="access.can(target, entry.id)" :disabled="!editable" @change="toggle(target, entry.id, $event)"><span class="sr-only">{{ target }}可访问{{ entry.label }}</span></label></td></tr></tbody></table></div></section>
 <section class="panel permission-panel"><div class="panel-heading"><div><h2>关键操作</h2><p class="muted">这里可以收紧预设职责中的操作权限；原有业务条件和指定负责人检查仍会继续生效。</p></div></div><div class="table-wrap"><table class="permission-table"><thead><tr><th>操作</th><th v-for="target in roles" :key="target">{{ target }}</th></tr></thead><tbody><tr v-for="entry in permissionActions" :key="entry.id"><th scope="row">{{ entry.label }}</th><td v-for="target in roles" :key="target"><label class="permission-switch"><input type="checkbox" :checked="access.can(target, entry.id)" :disabled="!editable||!access.canGrant(target,entry.id)" @change="toggle(target, entry.id, $event)"><span class="sr-only">{{ target }}可执行{{ entry.label }}</span></label></td></tr></tbody></table></div></section>
 <p v-if="!editable" class="notice">切换到管理员角色后可以维护权限矩阵。</p>
</template>

<style scoped>
.permission-panel{margin-bottom:16px}.permission-table th:first-child{min-width:250px;text-align:left}.permission-table td{text-align:center;min-width:100px}.permission-table thead th:not(:first-child){text-align:center}.permission-switch{display:inline-flex;align-items:center;justify-content:center}.permission-switch input{width:17px;height:17px;accent-color:#146895;cursor:pointer}.permission-switch input:disabled{cursor:not-allowed;opacity:.55}.permission-table tbody th{font-size:12px;font-weight:500;color:#3c5364}
</style>
