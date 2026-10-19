<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { packageCategory } from '@/domain/batch-packages'
import { canAssignTechnicalPackage } from '@/domain/technical-assignment'
import type { MaterialWorksheetMeta, Package } from '@/domain/model'

const open = defineModel<boolean>({ required: true })
const props = defineProps<{ packages: Package[]; sheets: readonly MaterialWorksheetMeta[]; staff: string[]; director: string }>()
const emit = defineEmits<{ save: [ids: string[], payload: { mode: 'director' | 'employee'; assignee?: string }] }>()
const assignee = shallowRef('')
const selected = shallowRef<string[]>([])
const eligible = computed(() => props.packages.filter(pkg => canAssignTechnicalPackage(pkg, props.director)))
const chosen = computed(() => eligible.value.filter(pkg => selected.value.includes(pkg.id)))
const itemCount = computed(() => chosen.value.reduce((total, pkg) => total + pkg.items.length, 0))
const allSelected = computed(() => eligible.value.length > 0 && chosen.value.length === eligible.value.length)
watch(open, value => {
  if (!value) return
  selected.value = []
  assignee.value = props.staff[0] || ''
})
function toggle(id: string, checked: boolean) {
  selected.value = checked ? [...new Set([...selected.value, id])] : selected.value.filter(value => value !== id)
}
function save() {
  if (!chosen.value.length || !assignee.value) return
  const mode = assignee.value === '由技术总监自行完成' ? 'director' : 'employee'
  emit('save', chosen.value.map(pkg => pkg.id), { mode, assignee: mode === 'employee' ? assignee.value : undefined })
}
</script>

<template>
  <Dialog v-model:open="open"><DialogContent class="assignment-dialog !max-w-[820px]" aria-label="指派技术确认任务">
    <DialogHeader><DialogTitle>指派技术确认任务</DialogTitle><DialogDescription>选择本次任务中的报价包，指派给技术人员协助处理。</DialogDescription></DialogHeader>
    <div class="assignment-body">
      <label class="assignment-person">技术处理人<select v-model="assignee" aria-label="技术处理人"><option v-for="label in staff" :key="label" :value="label">{{label}}</option><option value="由技术总监自行完成">由技术总监自行完成</option></select></label>
      <div class="assignment-heading"><b>选择报价包</b><span>已选择 {{chosen.length}} / {{packages.length}} 个包</span><Button size="sm" variant="ghost" @click="selected=eligible.map(pkg=>pkg.id)">全选</Button><Button size="sm" variant="ghost" @click="selected=[]">清空</Button></div>
      <div class="assignment-table-wrap"><table class="assignment-table"><thead><tr><th><input type="checkbox" aria-label="全选可指派报价包" :checked="allSelected" :indeterminate="chosen.length>0&&!allSelected" @change="selected=($event.target as HTMLInputElement).checked?eligible.map(pkg=>pkg.id):[]"/></th><th>类别</th><th>包名称</th><th>包号</th><th>当前处理人</th></tr></thead><tbody><tr v-for="pkg in packages" :key="pkg.id" :class="{selected:selected.includes(pkg.id)}"><td><input type="checkbox" :aria-label="`指派 ${packageCategory(pkg,[...sheets])} · ${pkg.packageName} · ${pkg.packageNo||pkg.id}`" :checked="selected.includes(pkg.id)" :disabled="!eligible.some(item=>item.id===pkg.id)" @change="toggle(pkg.id,($event.target as HTMLInputElement).checked)"/></td><td>{{packageCategory(pkg,[...sheets])}}</td><td>{{pkg.packageName}}</td><td>{{pkg.packageNo||'—'}}<small>{{pkg.id}}</small></td><td>{{pkg.techConfirmed===pkg.version?'技术已确认':pkg.technicalExecution?.mode==='employee'?pkg.technicalExecution.assignee:pkg.technicalExecution?.mode==='director'?'总监自行完成':'未指派'}}</td></tr></tbody></table></div>
      <p class="assignment-notice" role="status">{{assignee==='由技术总监自行完成'?'所选包将改为总监自行完成':`${assignee||'技术人员'}将仅收到已勾选的 ${chosen.length} 个包及其货物项`}}，其余 {{packages.length-chosen.length}} 个包保持不变。</p>
      <p class="assignment-note">员工提交后，仍需技术总监确认才能进入成本核算。</p>
    </div>
    <footer class="assignment-footer"><span>本次指派：{{chosen.length}} 个包 · {{itemCount}} 条货物项</span><Button variant="outline" @click="open=false">取消</Button><Button :disabled="!chosen.length||!assignee" @click="save">确认指派（{{chosen.length}}个包）</Button></footer>
  </DialogContent></Dialog>
</template>

<style scoped>
.assignment-dialog{width:calc(100vw - 40px);max-width:820px;max-height:88dvh;display:flex;flex-direction:column;gap:0;padding:26px;overflow:hidden}.assignment-body{overflow:auto;padding-top:24px}.assignment-person{display:grid;gap:10px;font-weight:600}.assignment-person select{width:100%;height:42px;padding:0 12px;border:1px solid #ccdce8;border-radius:7px;background:white;font-weight:400}.assignment-heading{display:flex;align-items:center;gap:8px;border-top:1px solid #e5edf3;margin-top:22px;padding-top:16px;margin-bottom:12px}.assignment-heading>span{margin-left:auto;font-size:12px;color:#657c90}.assignment-table-wrap{overflow:auto;border:1px solid #dde7ef;border-radius:8px;max-height:310px}.assignment-table{width:100%;min-width:650px;border-collapse:collapse;font-size:13px}.assignment-table th{background:#f3f7fb;color:#617a90;font-weight:500;text-align:left}.assignment-table th,.assignment-table td{padding:14px 12px;border-bottom:1px solid #e7eef4}.assignment-table tr:last-child td{border-bottom:0}.assignment-table input{width:17px;height:17px;accent-color:#07547f}.assignment-table .selected{background:#edf7ff}.assignment-table small{display:block;font-size:10px;color:#879aab;margin-top:4px}.assignment-notice{padding:14px;background:#eaf6ff;color:#08629b;border-radius:8px;font-size:13px;margin-top:18px}.assignment-note{font-size:12px;color:#758a9c;margin:12px 0 0}.assignment-footer{display:flex;align-items:center;gap:10px;padding-top:20px;margin-top:20px;border-top:1px solid #e5edf3}.assignment-footer>span{margin-right:auto;font-size:13px;color:#425d74}@media(max-width:600px){.assignment-footer{flex-wrap:wrap}.assignment-footer>span{width:100%}}
</style>
