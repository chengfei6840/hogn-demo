<script setup lang="ts">
import { computed, reactive, shallowRef, watch } from 'vue'
import { Textarea } from '@/components/ui/textarea'
import { useWorkspace } from '@/domain/store'
import { goodsColumns } from '@/data/goodsList'
import { catalog } from '@/domain/store'
import { downloadCollaborationItems } from '@/lib/collaboration-export'
// 清单里的编码、编号、日期列不折行；项目/单位/描述等长文本列允许折行，避免拉出超宽列。
const visibleGoodsColumns = computed(() => goodsColumns.filter(col => !['包名称', '分包编号'].includes(col)))
const goodsCodeColumns = ['分标编号', '首批交货日期', '最后一批交货日期', '技术规范编码', '网省采购申请号', '总部采购申请号', '物料编码', '扩展编码']
import { canHandlePackageProcess, canHandleTechnicalWork, confirmEntries, itemInformationGaps, packageProcessParticipant, selectionConfirmationReady, technicalCompletionIssues, technicalDirector, technicalDirectors, technicalStaff, type Item, type Package } from '@/domain/model'
import { Button } from '@/components/ui/button'
import AppIcon from './AppIcon.vue'
import StatusBadge from './StatusBadge.vue'
import FormDialog from './FormDialog.vue'
import BomView from './BomView.vue'
import TechnicalPanel from './TechnicalPanel.vue'
import PartsPanel from './PartsPanel.vue'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useUsersStore } from '@/stores/users'

const { package: pkg, project, role, person, act, toast } = useWorkspace()
const usersStore=useUsersStore()
const rejectOpen = shallowRef(false)
const assignOpen = shallowRef(false)
const returnTechnicalOpen = shallowRef(false)
const technicalAssignment = shallowRef(technicalStaff[0])
const returnTechnicalForm = reactive({ reason: '' })
const technicalSummaryExpanded = shallowRef(false)
const bomOpen = shallowRef(false)
const exportLoading = shallowRef(false)
// 串信息面板与子件面板内嵌在流程条下方：空字符串即关闭，两者互斥，同时只开一个。
const chainPanelId = shallowRef('')
const partsPanelId = shallowRef('')
const chainDialogOpen = computed({ get: () => Boolean(chainPanelId.value), set: open => { if (!open) chainPanelId.value = '' } })
const partsDialogOpen = computed({ get: () => Boolean(partsPanelId.value), set: open => { if (!open) partsPanelId.value = '' } })
const form = reactive({ reason: '' })

// 待确认清单按字段现算：只列当前人员自己要确认的条目，逐串逐字段一条，独立物资不参与。
const entries = computed(() => confirmEntries(pkg as Package))
const salesConfirmed = computed(() => pkg.salesConfirmed === pkg.version)
const technicalConfirmed = computed(() => pkg.techConfirmed === pkg.version)
const technicalIssues = computed(() => technicalCompletionIssues(pkg as Package, catalog))
const technicalActionBlocked = computed(() => role.value === '技术' && technicalIssues.value.length > 0)
const editable = computed(() => ['资料整理', '并行协作'].includes(pkg.stage))
const confirmationReady = computed(() => selectionConfirmationReady(pkg as Package))
const technicalOwner = computed(() => packageProcessParticipant(pkg as Package, 'technicalConfirmation'))
const canHandleTechnical = computed(() => canHandleTechnicalWork(pkg as Package, person.value))
const isTechnicalDirector = computed(() => role.value === '技术' && person.value === technicalDirector)
const hasTechnicalAssignment = computed(() => Boolean(pkg.technicalExecution))
const isAssignedTechnicalEmployee = computed(() => role.value === '技术' && pkg.technicalExecution?.mode === 'employee' && pkg.technicalExecution.status === 'assigned' && pkg.technicalExecution.assignee === person.value)
const canRejectToSales = computed(() => pkg.stage === '并行协作' && salesConfirmed.value && !technicalConfirmed.value && (isTechnicalDirector.value || isAssignedTechnicalEmployee.value))
const canReturnTechnical = computed(() => isTechnicalDirector.value && pkg.technicalExecution?.mode === 'employee' && pkg.technicalExecution.status === 'submitted')
const activeTechnicalStaff=computed(()=>usersStore.peopleForRole('技术').filter(assignee=>!technicalDirectors.includes(assignee)))
const technicalAssignmentOptions = computed(() => [...(hasTechnicalAssignment.value ? ['由技术总监自行完成'] : []), ...activeTechnicalStaff.value])
watch(activeTechnicalStaff,people=>{if(people.length&&!people.includes(technicalAssignment.value))technicalAssignment.value=people[0]},{immediate:true})
const technicalAccessDenied = computed(() => role.value === '技术' && ['并行协作'].includes(pkg.stage) && !technicalConfirmed.value && !canHandleTechnical.value)
const salesOwner = computed(() => packageProcessParticipant(pkg as Package, 'salesConfirmation'))
const salesAccessDenied = computed(() => role.value === '销售' && !salesConfirmed.value && !canHandlePackageProcess(pkg as Package, 'salesConfirmation', person.value))
const processAccessDenied = computed(() => technicalAccessDenied.value || salesAccessDenied.value)
const accessDeniedOwner = computed(() => technicalAccessDenied.value ? technicalOwner.value : salesOwner.value)
const accessDeniedStage = computed(() => technicalAccessDenied.value ? '技术选项确认' : '销售需求确认')
const primaryActionLabel = computed(() => role.value === '销售' ? '确认需求与范围' : isAssignedTechnicalEmployee.value ? '提交总监确认' : '总监确认')
const technicalStatusText = computed(() => {
 if(pkg.technicalExecution?.mode==='director')return '技术总监选择自行完成，技术员工不会看到本包。'
 if(pkg.technicalExecution?.mode==='employee')return pkg.technicalExecution.status==='submitted'?'技术员工已提交，等待总监确认。':pkg.technicalExecution.returnReason?'由 '+(pkg.technicalExecution.returnedBy||'技术 · 李总监')+' 驳回给 '+pkg.technicalExecution.assignee+'：'+pkg.technicalExecution.returnReason:'已指派给 '+pkg.technicalExecution.assignee+'，完成后需提交总监确认。'
 return '技术确认由技术总监负责；总监可指派技术员工协助处理。'
})
type ItemFilter = 'all' | 'resolved' | 'pending'
const itemFilter = shallowRef<ItemFilter>('all')
const visibleItems = computed(() => {
  if (itemFilter.value === 'all') return pkg.items
  const resolved = itemFilter.value === 'resolved'
  return pkg.items.filter(item => (itemReviewState(item) === '已解决' || itemReviewState(item) === '不纳入本次报价') === resolved)
})

// 状态只说明信息是否齐全；销售看串信息，技术同时看串信息和子件信息。
function itemReviewState(item: Item) {
  if (item.excluded) return '不纳入本次报价'
  if (item.kind === '独立物资') return '已解决'
  const gaps = itemInformationGaps(pkg as Package, item, catalog)
  const serialMissing = role.value === '销售'
    ? entries.value.some(entry => entry.itemId === item.id)
    : gaps.serial.length > 0
  const partsMissing = role.value === '技术' && gaps.parts.length > 0
  if (serialMissing && partsMissing) return '缺少串、子件信息'
  if (serialMissing) return '缺少串信息'
  if (partsMissing) return '缺少子件信息'
  return '已解决'
}
function openChain(id: string) { chainPanelId.value = id; partsPanelId.value = '' }
function openParts(id: string) { partsPanelId.value = id; chainPanelId.value = '' }
async function exportItems() {
  if (role.value !== '销售' && role.value !== '技术') return
  exportLoading.value = true
  try {
    await downloadCollaborationItems({
      pkg: { ...pkg, packageName: `${project.name}-${pkg.packageName}` } as Package,
      role: role.value,
      items: visibleItems.value,
      catalog,
      statusFor: itemReviewState,
    })
    toast(`已导出 ${visibleItems.value.length} 条货物项`)
  } catch (error) {
    console.error('导出确认清单失败', error)
    toast('导出失败，请稍后重试')
  } finally {
    exportLoading.value = false
  }
}

// 串参数或子件仍有空项时进入确认；信息齐全则以查看为主，销售与技术使用同一判定。
function chainActionLabel(item: Item) {
  if (item.excluded || item.kind === '独立物资') return '查看'
  return itemReviewState(item).startsWith('缺少') ? '去确认' : '查看'
}
function confirmTechnical() {
  if (!salesConfirmed.value) { toast('请先等待销售完成需求确认'); return }
  if(isAssignedTechnicalEmployee.value)act('submitTechnical')
  else if(isTechnicalDirector.value)act('confirmTech')
  else toast('请由技术总监或被指派的技术员工处理')
}
function runPrimaryAction() { if (role.value === '销售') act('confirmSales'); else if (role.value === '技术') confirmTechnical() }
function openTechnicalAssignment(){technicalAssignment.value=pkg.technicalExecution?.mode==='employee'?pkg.technicalExecution.assignee||technicalStaff[0]:pkg.technicalExecution?.mode==='director'?'由技术总监自行完成':technicalStaff[0];assignOpen.value=true}
function saveTechnicalAssignment(){const mode=technicalAssignment.value==='由技术总监自行完成'?'director':'employee';if(act('assignTechnical',{mode,assignee:mode==='employee'?technicalAssignment.value:undefined}))assignOpen.value=false}
function openReturnTechnical(){returnTechnicalForm.reason='';returnTechnicalOpen.value=true}
function returnToTechnical(){if(act('returnTechnical',returnTechnicalForm))returnTechnicalOpen.value=false}
function show() { form.reason = ''; rejectOpen.value = true }
function submit() { if (act('rejectStage', form)) rejectOpen.value = false }
</script>

<template>
  <Dialog v-model:open="chainDialogOpen">
    <DialogContent contained portal-to="#workflow-dialog-root" class="detail-dialog" overlay-class="detail-overlay" aria-label="串信息与来源">
      <DialogTitle class="sr-only">查看串信息与来源</DialogTitle>
      <TechnicalPanel v-if="chainPanelId" :key="chainPanelId" :item-id="chainPanelId" @close="chainPanelId = ''" />
    </DialogContent>
  </Dialog>

  <section v-if="processAccessDenied" class="process-access-denied technical-access-denied panel" aria-live="polite">
    <AppIcon name="lock-key" :size="40" />
    <h2>你无权访问该页面</h2>
    <p>本包“{{ accessDeniedStage }}”已指定由 {{ accessDeniedOwner }} 处理。</p>
    <p class="technical-access-user">当前人员：{{ person }}</p>
  </section>

  <Dialog v-model:open="partsDialogOpen">
    <DialogContent contained portal-to="#workflow-dialog-root" class="detail-dialog" overlay-class="detail-overlay" aria-label="子件与来源">
      <DialogTitle class="sr-only">查看子件与来源</DialogTitle>
      <PartsPanel v-if="partsPanelId" :key="partsPanelId" :item-id="partsPanelId" @close="partsPanelId = ''" />
    </DialogContent>
  </Dialog>

  <div v-if="role==='技术'&&salesConfirmed&&!technicalConfirmed" class="technical-assignment-status panel"><div class="technical-assignment-status-line">{{technicalStatusText}}<button v-if="pkg.technicalExecution?.mode==='employee'&&pkg.technicalExecution.status==='submitted'" type="button" class="technical-summary-toggle" :aria-expanded="technicalSummaryExpanded" @click="technicalSummaryExpanded=!technicalSummaryExpanded">{{technicalSummaryExpanded?'收起修改摘要':'查看修改摘要'}}</button></div><div v-if="technicalSummaryExpanded&&pkg.technicalExecution?.mode==='employee'&&pkg.technicalExecution.status==='submitted'" class="technical-change-summary"><ul v-if="pkg.technicalExecution.submittedSummary?.length"><li v-for="(summary,index) in pkg.technicalExecution.submittedSummary" :key="index">{{summary}}</li></ul><p v-else>本次未修改串型信息或子件信息。</p></div></div>
  <section v-if="role==='销售' &amp;&amp; !salesConfirmed &amp;&amp; !processAccessDenied" class="panel sales-confirmation-hint"><p>销售无需补齐全部技术参数或逐项解决技术问题。请核对货物名称、有效数量、单位及本次报价范围后完成销售确认；串型、子件和技术缺项由技术人员继续核对。</p></section>
  <div id="collaboration-stage" class="collaboration-stage"><div id="collaboration-workspace" class="collaboration-columns"><section class="panel collaboration-items"><div class="panel-heading"><div><h2>客户货物项 <span class="count">{{ pkg.items.length }}</span></h2><p class="muted">串型、子件和来源已在当前页面集中维护，修改后保留前后差异。</p></div><div class="collaboration-list-tools"><div class="goods-filters" role="group" aria-label="货物项筛选"><button type="button" :class="{ active: itemFilter === 'all' }" @click="itemFilter = 'all'">全部</button><button type="button" :class="{ active: itemFilter === 'resolved' }" @click="itemFilter = 'resolved'">已解决</button><button type="button" :class="{ active: itemFilter === 'pending' }" @click="itemFilter = 'pending'">待解决</button></div><Button v-if="role === '销售' || role === '技术'" variant="outline" :disabled="exportLoading || !visibleItems.length" @click="exportItems"><AppIcon name="download-simple" />{{ exportLoading ? '导出中…' : '导出 Excel' }}</Button></div></div><div class="table-wrap"><table class="goods-table"><thead><tr><th>序号</th><th>货物名称 / 串型号</th><th>数量</th><th>导线条件</th><th v-for="col in visibleGoodsColumns" :key="col" :class="{ 'goods-code-cell': goodsCodeColumns.includes(col) }">{{ col }}</th><th>核验状态</th><th v-if="role !== '销售'">子件</th><th>需求操作</th></tr></thead><tbody><tr v-for="item in visibleItems" :key="item.id"><td class="mono">{{ item.id }}</td><td class="goods-name-cell"><b>{{ item.name }}</b><small>{{ item.model || item.spec || '独立物资' }}<span v-if="item.excluded"> · {{ item.exclusionReason }}</span></small></td><td>{{ item.quantity }} {{ item.unit }}</td><td>{{ item.conductor || '待确认' }}<small>{{ item.voltage }}</small></td><td v-for="col in visibleGoodsColumns" :key="col" class="goods-cell" :class="{ 'goods-code-cell': goodsCodeColumns.includes(col) }">{{ item.goodsList?.[col] || '—' }}</td><td><StatusBadge :text="itemReviewState(item)" /><small v-if="item.technicalChanges?.length" class="technical-change-hint">有修改记录</small></td><td v-if="role !== '销售'"><div class="result-actions"><Button size="sm" variant="ghost" @click="openParts(item.id)">查看子件</Button></div></td><td><div class="result-actions"><Button size="sm" variant="outline" @click="openChain(item.id)">{{ chainActionLabel(item) }}</Button></div></td></tr><tr v-if="!visibleItems.length"><td colspan="99" class="empty">当前筛选下没有货物项</td></tr></tbody></table></div></section></div>

  <div class="collaboration-actions collaboration-actions-bottom" aria-label="询价协作操作"><Button v-if="canRejectToSales" variant="outline" :disabled="!editable" @click="show()">驳回到销售确认<AppIcon name="arrow-counter-clockwise" /></Button><Button v-if="isTechnicalDirector && salesConfirmed && !technicalConfirmed" variant="outline" :disabled="!editable" @click="openTechnicalAssignment">{{hasTechnicalAssignment?'重新指派':'指派'}}<AppIcon name="user-switch" /></Button><Button v-if="canReturnTechnical" variant="outline" :disabled="!editable" @click="openReturnTechnical">驳回到技术人员<AppIcon name="arrow-counter-clockwise" /></Button><Button v-if="(role === '销售' && !salesConfirmed) || (role === '技术' && salesConfirmed && !technicalConfirmed && (isTechnicalDirector || isAssignedTechnicalEmployee))" :disabled="!editable || technicalActionBlocked || (isTechnicalDirector && pkg.technicalExecution?.mode==='employee' && pkg.technicalExecution.status!=='submitted')" @click="runPrimaryAction">{{ primaryActionLabel }}<AppIcon name="arrow-right" /></Button><Button v-if="confirmationReady && ['销售', '技术', '财务', '董事长'].includes(role)" variant="outline" @click="bomOpen = true">查看 BOM<AppIcon name="arrow-right" /></Button></div></div>

  <Sheet v-model:open="bomOpen"><SheetContent side="right" class="bom-sheet" aria-label="BOM"><SheetHeader class="bom-sheet-title"><SheetTitle>BOM</SheetTitle></SheetHeader><BomView embedded /></SheetContent></Sheet>
  <FormDialog v-model="rejectOpen" title="驳回"><label>驳回原因<Textarea v-model="form.reason" placeholder="填写驳回的具体依据，销售重新确认前会一直显示在协作页顶部" /></label><p class="muted">驳回后本包版本 +1，销售与技术的原确认一并作废，回到「销售需求确认」重新确认后再往下走。</p><Button @click="submit">保存</Button></FormDialog>
  <FormDialog v-model="assignOpen" :title="hasTechnicalAssignment?'重新指派技术确认任务':'指派技术确认任务'" description="选择一名技术员工处理当前包。员工提交后，仍需技术总监确认才能进入成本核算。"><label for="technical-assignee">技术处理人<select id="technical-assignee" v-model="technicalAssignment" class="technical-assignment-select"><option v-for="person in technicalAssignmentOptions" :key="person" :value="person">{{person}}</option></select></label><Button @click="saveTechnicalAssignment">保存指派</Button></FormDialog>
  <FormDialog v-model="returnTechnicalOpen" title="驳回到技术人员" description="填写需要补充或重新确认的内容，技术员工处理后需再次提交总监确认。"><label>退回原因<Textarea v-model="returnTechnicalForm.reason" placeholder="说明需要重新确认的技术内容" /></label><Button @click="returnToTechnical">退回并通知技术人员</Button></FormDialog>
</template>

<style scoped>
.sales-confirmation-hint{padding:12px 18px;background:#f1f7fb;color:#315b78}.sales-confirmation-hint p{margin:0;font-size:13px;line-height:1.8}
.technical-access-denied{min-height:360px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;color:#587083}.technical-access-denied :deep(svg){color:#b7791f}.technical-access-denied h2{margin:6px 0 0;color:#18324a;font-size:22px}.technical-access-denied p{margin:0}.technical-access-denied .technical-access-user{font-size:13px;color:#7a8d9d}:global(body:has(.technical-access-denied) #collaboration-stage){display:none}:global(body:has(.technical-access-denied) .collaboration-actions){display:none}.collaboration-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap}.collaboration-actions-bottom{padding:18px 0 2px;margin-bottom:0;border-top:1px solid #e0e7ee}.technical-change-hint{display:block;margin-top:5px;font-size:10px;color:#9a6b22}.collaboration-list-tools{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap}.goods-filters{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.goods-filters button{border:1px solid #dce5ec;border-radius:6px;background:#fff;color:#6f8190;padding:6px 12px;font-size:12px}.goods-filters button:hover{background:#f5f9fc;color:#064975}.goods-filters button.active{border-color:#064975;background:#edf4f9;color:#064975;font-weight:600}.result-actions{display:flex;align-items:center;justify-content:center;gap:3px;flex-wrap:wrap;min-width:150px}.collaboration-items table{min-width:2400px}.goods-table{--goods-result-width:120px;--goods-parts-width:120px;--goods-action-width:110px}.goods-table th,.goods-table td{padding:8px 10px}.goods-table th:nth-last-child(3),.goods-table td:nth-last-child(3){position:sticky;right:calc(var(--goods-parts-width) + var(--goods-action-width));width:var(--goods-result-width);min-width:var(--goods-result-width);background:#fff;box-shadow:-1px 0 0 #e7edf2;z-index:2}.goods-table th:nth-last-child(2),.goods-table td:nth-last-child(2){position:sticky;right:var(--goods-action-width);width:var(--goods-parts-width);min-width:var(--goods-parts-width);background:#fff;box-shadow:-1px 0 0 #e7edf2;z-index:3}.goods-table th:last-child,.goods-table td:last-child{position:sticky;right:0;width:var(--goods-action-width);min-width:var(--goods-action-width);background:#fff;box-shadow:-1px 0 0 #e7edf2;z-index:4}.goods-table thead th:nth-last-child(3),.goods-table thead th:nth-last-child(2),.goods-table thead th:last-child{background:#f8fafc;z-index:5}.goods-table tbody tr:hover td:nth-last-child(3),.goods-table tbody tr:hover td:nth-last-child(2),.goods-table tbody tr:hover td:last-child{background:#fafcfe}.goods-table td:nth-last-child(-n+2) .result-actions{min-width:0}.goods-cell{max-width:200px;white-space:normal;overflow-wrap:anywhere;font-size:11px;color:#4b5563}.goods-code-cell{max-width:none;white-space:nowrap}td.goods-name-cell small{max-width:240px}@media(max-width:800px){.collaboration-actions{width:100%;justify-content:flex-start}.collaboration-list-tools{width:100%;justify-content:flex-start}.goods-filters{width:100%;justify-content:flex-start}.result-actions{justify-content:flex-start}}
 .process-access-denied{position:relative;z-index:2}.process-access-denied~.collaboration-stage{display:none}:global(body:has(.process-access-denied) #collaboration-stage){display:none}:global(body:has(.process-access-denied) .collaboration-actions){display:none}
.technical-assignment-status{margin:0 0 12px;padding:12px 16px;color:#43647c;background:#f3f8fb}
.technical-assignment-status-line{display:flex;align-items:center;justify-content:space-between;gap:12px}
.technical-summary-toggle{padding:0;border:0;background:transparent;color:#075985;font:inherit;text-decoration:underline;cursor:pointer;white-space:nowrap}
.technical-change-summary{margin-top:10px;padding-top:8px;border-top:1px solid #dce8ef;font-size:12px;line-height:1.7}
.technical-change-summary ul{margin:0;padding-left:18px}
.technical-change-summary p{margin:0;color:#60788a}
.technical-assignment-select{width:100%;height:40px}
</style>
