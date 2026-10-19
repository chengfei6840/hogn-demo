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
import { canHandlePackageProcess, canHandleTechnicalWork, confirmEntries, itemInformationGaps, packageProcessParticipant, selectionConfirmationReady, technicalCompletionIssues, technicalDirector, technicalDirectors, type Item, type Package } from '@/domain/model'
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
import { packageCategory } from '@/domain/batch-packages'
import AppSelect from './AppSelect.vue'
import { Input } from '@/components/ui/input'
import PackageScope from './workflow/PackageScope.vue'
import AggregateWorkflowView from './workflow/AggregateWorkflowView.vue'
import TechnicalAssignmentDialog from './workflow/TechnicalAssignmentDialog.vue'
import { ALL_FILTER, categoryKey, collectWorkflowItems, filterWorkflowItems, type WorkflowItemRow } from '@/domain/workflow-item-filters'

const { package: pkg, project, packages, batchPackageIds, batchSession, workflowPackages, assignTechnicalPackages, actBatch, role, person, act, toast } = useWorkspace()
const usersStore=useUsersStore()
const sourcePackages = workflowPackages
const focusPackage = computed(() => sourcePackages.value[0] || pkg as Package)
const rejectOpen = shallowRef(false)
const assignOpen = shallowRef(false)
const returnTechnicalOpen = shallowRef(false)
const returnTechnicalForm = reactive({ reason: '' })
const technicalSummaryExpanded = shallowRef(false)
const bomOpen = shallowRef(false)
const exportLoading = shallowRef(false)
// 串信息面板与子件面板内嵌在流程条下方：空字符串即关闭，两者互斥，同时只开一个。
const chainPanelId = shallowRef('')
const partsPanelId = shallowRef('')
const chainPackageId = shallowRef('')
const partsPackageId = shallowRef('')
const chainDialogOpen = computed({ get: () => Boolean(chainPanelId.value), set: open => { if (!open) chainPanelId.value = '' } })
const partsDialogOpen = computed({ get: () => Boolean(partsPanelId.value), set: open => { if (!open) partsPanelId.value = '' } })
const form = reactive({ reason: '' })
function sourceLabel(id:string){const target=sourcePackages.value.find(pkg=>pkg.id===id);return target?`${target.packageName} · ${packageCategory(target as Package,project.materialWorksheets||[])} · ${target.packageNo||target.id}`:''}

// 待确认清单按字段现算：只列当前人员自己要确认的条目，逐串逐字段一条，独立物资不参与。
const salesConfirmed = computed(() => sourcePackages.value.every(target=>target.salesConfirmed === target.version))
const technicalConfirmed = computed(() => sourcePackages.value.every(target=>target.techConfirmed === target.version))
const technicalIssues = computed(() => sourcePackages.value.flatMap(target=>technicalCompletionIssues(target, catalog)))
const technicalActionBlocked = computed(() => role.value === '技术' && (technicalIssues.value.length > 0 || sourcePackages.value.some(target=>target.technicalExecution?.mode==='employee'&&target.technicalExecution.status!=='submitted'&&person.value===technicalDirector)))
const editable = computed(() => sourcePackages.value.every(target=>['资料整理', '并行协作'].includes(target.stage)))
const confirmationReady = computed(() => sourcePackages.value.every(target=>selectionConfirmationReady(target)))
const technicalOwner = computed(() => packageProcessParticipant(focusPackage.value as Package, 'technicalConfirmation'))
const canHandleTechnical = computed(() => canHandleTechnicalWork(focusPackage.value as Package, person.value))
const isTechnicalDirector = computed(() => role.value === '技术' && person.value === technicalDirector)
const hasTechnicalAssignment = computed(() => sourcePackages.value.some(target=>Boolean(target.technicalExecution)))
const isAssignedTechnicalEmployee = computed(() => role.value === '技术' && sourcePackages.value.some(target=>target.technicalExecution?.mode === 'employee' && target.technicalExecution.status === 'assigned' && target.technicalExecution.assignee === person.value))
const canRejectToSales = computed(() => focusPackage.value.stage === '并行协作' && salesConfirmed.value && !technicalConfirmed.value && (isTechnicalDirector.value || isAssignedTechnicalEmployee.value))
const canReturnTechnical = computed(() => isTechnicalDirector.value && sourcePackages.value.some(target=>target.technicalExecution?.mode === 'employee' && target.technicalExecution.status === 'submitted'))
const activeTechnicalStaff=computed(()=>usersStore.peopleForRole('技术').filter(assignee=>!technicalDirectors.includes(assignee)))
const technicalAccessDenied = computed(() => role.value === '技术' && (!sourcePackages.value.length || ['并行协作'].includes(focusPackage.value.stage) && !technicalConfirmed.value && !canHandleTechnical.value))
const salesOwner = computed(() => packageProcessParticipant(focusPackage.value as Package, 'salesConfirmation'))
const salesAccessDenied = computed(() => role.value === '销售' && !salesConfirmed.value && !canHandlePackageProcess(focusPackage.value as Package, 'salesConfirmation', person.value))
const processAccessDenied = computed(() => technicalAccessDenied.value || salesAccessDenied.value)
const accessDeniedOwner = computed(() => technicalAccessDenied.value ? technicalOwner.value : salesOwner.value)
const accessDeniedStage = computed(() => technicalAccessDenied.value ? '技术选项确认' : '销售需求确认')
const primaryActionLabel = computed(() => role.value === '销售' ? '确认需求与范围' : isAssignedTechnicalEmployee.value ? '提交总监确认' : '总监确认')
const technicalStatusText = computed(() => {
 if(sourcePackages.value.length>1){const delegated=sourcePackages.value.filter(target=>target.technicalExecution?.mode==='employee');const submitted=delegated.filter(target=>target.technicalExecution?.status==='submitted');return `本次 ${sourcePackages.value.length} 个包：${delegated.length} 个已指派员工（${submitted.length} 个已提交），其余由总监处理。总监确认前需等待员工提交并补齐技术信息。`}

 if(focusPackage.value.technicalExecution?.mode==='director')return '技术总监选择自行完成，技术员工不会看到本包。'
 if(focusPackage.value.technicalExecution?.mode==='employee')return focusPackage.value.technicalExecution.status==='submitted'?'技术员工已提交，等待总监确认。':focusPackage.value.technicalExecution.returnReason?'由 '+(focusPackage.value.technicalExecution.returnedBy||'技术 · 李总监')+' 驳回给 '+focusPackage.value.technicalExecution.assignee+'：'+focusPackage.value.technicalExecution.returnReason:'已指派给 '+focusPackage.value.technicalExecution.assignee+'，完成后需提交总监确认。'
 return '技术确认由技术总监负责；总监可指派技术员工协助处理。'
})
type ItemFilter = 'all' | 'resolved' | 'pending'
const itemFilter = shallowRef<ItemFilter>('all')
const categoryFilter = shallowRef(ALL_FILTER)
const packageFilter = shallowRef(ALL_FILTER)
const itemQuery = shallowRef('')
const allRows = computed(() => collectWorkflowItems(sourcePackages.value, project.materialWorksheets || []))
const categoryOptions = computed(() => [...new Map(allRows.value.map(row => [row.categoryKey, row.categoryName])).entries()].map(([value, label]) => ({ value, label })))
const packageOptions = computed(() => sourcePackages.value.filter(item => categoryFilter.value === ALL_FILTER || categoryKey(item) === categoryFilter.value).map(item => ({ value: item.id, label: `${item.packageName} · ${item.materialSummary?.sourceWorksheetName || '未分类'} · ${item.packageNo || item.id.slice(-6)}` })))
watch(categoryFilter, () => { if (packageFilter.value !== ALL_FILTER && !packageOptions.value.some(option => option.value === packageFilter.value)) packageFilter.value = ALL_FILTER })
const visibleItems = computed(() => filterWorkflowItems(allRows.value, { categoryKey: categoryFilter.value, packageId: packageFilter.value, query: itemQuery.value, status: itemFilter.value }, row => itemReviewState(row.item, row.pkg)))
const resetItemFilters = () => { categoryFilter.value = ALL_FILTER; packageFilter.value = ALL_FILTER; itemQuery.value = ''; itemFilter.value = 'all' }

// 状态只说明信息是否齐全；销售看串信息，技术同时看串信息和子件信息。
function itemReviewState(item: Item, sourcePackage: Package = focusPackage.value as Package) {
  if (item.excluded) return '不纳入本次报价'
  if (item.kind === '独立物资') return '已解决'
  const gaps = itemInformationGaps(sourcePackage, item, catalog)
  const serialMissing = role.value === '销售'
    ? confirmEntries(sourcePackage).some(entry => entry.itemId === item.id && entry.assignee === person.value)
    : gaps.serial.length > 0
  const partsMissing = role.value === '技术' && gaps.parts.length > 0
  if (serialMissing && partsMissing) return '缺少串、子件信息'
  if (serialMissing) return '缺少串信息'
  if (partsMissing) return '缺少子件信息'
  return '已解决'
}
function openChain(row: WorkflowItemRow) { chainPackageId.value = row.packageId; chainPanelId.value = row.itemId; partsPanelId.value = '' }
function openParts(row: WorkflowItemRow) { partsPackageId.value = row.packageId; partsPanelId.value = row.itemId; chainPanelId.value = '' }
watch(batchSession,()=>{chainPanelId.value='';partsPanelId.value='';assignOpen.value=false;returnTechnicalOpen.value=false;rejectOpen.value=false;bomOpen.value=false;resetItemFilters()})
async function exportItems() {
  if (role.value !== '销售' && role.value !== '技术') return
  exportLoading.value = true
  try {
    await downloadCollaborationItems({
      rows: visibleItems.value.map(row => ({ pkg: row.pkg, categoryName: row.categoryName, item: row.item, status: itemReviewState(row.item, row.pkg) })),
      fileName: `${project.name}-${batchPackageIds.value.length ? `${batchPackageIds.value.length}个报价包` : focusPackage.value.packageName}-${role.value}确认清单.xlsx`,
      role: role.value,
      catalog,
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
function chainActionLabel(item: Item, sourcePackage: Package) {
  if (item.excluded || item.kind === '独立物资') return '查看'
  return itemReviewState(item,sourcePackage).startsWith('缺少') ? '去确认' : '查看'
}
function confirmTechnical(): boolean {
  if (!salesConfirmed.value) { toast('请先等待销售完成需求确认'); return false }
  if(isAssignedTechnicalEmployee.value)return act('submitTechnical')
  if(isTechnicalDirector.value)return act('confirmTech')
  toast('请由技术总监或被指派的技术员工处理'); return false
}
function runPrimaryAction() {
  if (!batchPackageIds.value.length) { if (role.value === '销售') act('confirmSales'); else if (role.value === '技术') confirmTechnical(); return }
  actBatch(role.value==='销售'?'confirmSales':isAssignedTechnicalEmployee.value?'submitTechnical':'confirmTech')
}
function openTechnicalAssignment(){assignOpen.value=true}
function saveTechnicalAssignment(ids:string[], payload:{mode:'director'|'employee';assignee?:string}){if(assignTechnicalPackages(ids,payload))assignOpen.value=false}
function openReturnTechnical(){returnTechnicalForm.reason='';returnTechnicalOpen.value=true}
function returnToTechnical(){if(batchPackageIds.value.length ? actBatch('returnTechnical',returnTechnicalForm).every(result=>result.ok) : act('returnTechnical',returnTechnicalForm))returnTechnicalOpen.value=false}
function show() { form.reason = ''; rejectOpen.value = true }
function submit() { if (batchPackageIds.value.length ? actBatch('rejectStage',form).every(result=>result.ok) : act('rejectStage', form)) rejectOpen.value = false }
</script>

<template>
  <Dialog v-model:open="chainDialogOpen">
    <DialogContent contained portal-to="#workflow-dialog-root" class="detail-dialog" overlay-class="detail-overlay" aria-label="串信息与来源">
      <DialogTitle class="sr-only">{{sourceLabel(chainPackageId)}} · 查看串信息与来源</DialogTitle>
      <PackageScope v-if="chainPanelId" :key="`${chainPackageId}:${chainPanelId}`" :package-id="chainPackageId"><TechnicalPanel :item-id="chainPanelId" @close="chainPanelId = ''" /></PackageScope>
    </DialogContent>
  </Dialog>

  <section v-if="processAccessDenied" class="process-access-denied technical-access-denied panel" aria-live="polite">
    <AppIcon name="lock-key" :size="40" />
    <h2>{{!sourcePackages.length?'当前没有分配给你的技术任务':'你无权访问该页面'}}</h2>
    <p v-if="sourcePackages.length">本包“{{ accessDeniedStage }}”已指定由 {{ accessDeniedOwner }} 处理。</p>
    <p class="technical-access-user">当前人员：{{ person }}</p>
  </section>

  <Dialog v-model:open="partsDialogOpen">
    <DialogContent contained portal-to="#workflow-dialog-root" class="detail-dialog" overlay-class="detail-overlay" aria-label="子件与来源">
      <DialogTitle class="sr-only">{{sourceLabel(partsPackageId)}} · 查看子件与来源</DialogTitle>
      <PackageScope v-if="partsPanelId" :key="`${partsPackageId}:${partsPanelId}`" :package-id="partsPackageId"><PartsPanel :item-id="partsPanelId" @close="partsPanelId = ''" /></PackageScope>
    </DialogContent>
  </Dialog>

  <div v-if="role==='技术'&&!processAccessDenied&&salesConfirmed&&!technicalConfirmed" class="technical-assignment-status panel"><div class="technical-assignment-status-line">{{technicalStatusText}}<button v-if="focusPackage.technicalExecution?.mode==='employee'&&focusPackage.technicalExecution.status==='submitted'" type="button" class="technical-summary-toggle" :aria-expanded="technicalSummaryExpanded" @click="technicalSummaryExpanded=!technicalSummaryExpanded">{{technicalSummaryExpanded?'收起修改摘要':'查看修改摘要'}}</button></div><div v-if="technicalSummaryExpanded&&focusPackage.technicalExecution?.mode==='employee'&&focusPackage.technicalExecution.status==='submitted'" class="technical-change-summary"><ul v-if="focusPackage.technicalExecution.submittedSummary?.length"><li v-for="(summary,index) in focusPackage.technicalExecution.submittedSummary" :key="index">{{summary}}</li></ul><p v-else>本次未修改串型信息或子件信息。</p></div></div>
  <section v-if="role==='销售' &amp;&amp; !salesConfirmed &amp;&amp; !processAccessDenied" class="panel sales-confirmation-hint"><p>销售无需补齐全部技术参数或逐项解决技术问题。请核对货物名称、有效数量、单位及本次报价范围后完成销售确认；串型、子件和技术缺项由技术人员继续核对。</p></section>
  <div v-if="!processAccessDenied" id="collaboration-stage" class="collaboration-stage"><div id="collaboration-workspace" class="collaboration-columns"><section class="panel collaboration-items"><div class="panel-heading"><div><h2>客户货物项 <span class="count">{{ allRows.length }}</span></h2><p class="muted">汇总展示本次所选报价包；仅首包保留待确认项，其余包预填完整。修改仅作用于对应货物项。</p></div><div class="collaboration-list-tools"><div class="goods-filters" role="group" aria-label="货物项状态筛选"><button type="button" :class="{ active: itemFilter === 'all' }" @click="itemFilter = 'all'">全部</button><button type="button" :class="{ active: itemFilter === 'resolved' }" @click="itemFilter = 'resolved'">已解决</button><button type="button" :class="{ active: itemFilter === 'pending' }" @click="itemFilter = 'pending'">待解决</button></div><Button v-if="role === '销售' || role === '技术'" variant="outline" :disabled="exportLoading || !visibleItems.length" @click="exportItems"><AppIcon name="download-simple" />{{ exportLoading ? '导出中…' : '导出 Excel' }}</Button></div></div>
  <div class="workflow-item-filters"><label>类别<AppSelect v-model="categoryFilter" label="筛选货物项类别" :options="[{value:ALL_FILTER,label:'全部类别'},...categoryOptions]"/></label><label>报价包<AppSelect v-model="packageFilter" label="筛选报价包" :options="[{value:ALL_FILTER,label:'全部报价包'},...packageOptions]"/></label><label class="workflow-item-search">搜索货物项<Input v-model="itemQuery" aria-label="搜索货物名称、型号或编号" placeholder="搜索货物名称、型号或编号"/></label><Button variant="ghost" @click="resetItemFilters">重置</Button><span class="workflow-item-count">共 {{ visibleItems.length }} 条</span></div>
  <div class="table-wrap"><table class="goods-table"><thead><tr><th>序号</th><th>包名称</th><th>类别</th><th>货物名称 / 串型号</th><th>数量</th><th>导线条件</th><th v-for="col in visibleGoodsColumns" :key="col" :class="{ 'goods-code-cell': goodsCodeColumns.includes(col) }">{{ col }}</th><th>核验状态</th><th v-if="role !== '销售'">子件</th><th>需求操作</th></tr></thead><tbody><tr v-for="(row,index) in visibleItems" :key="`${row.packageId}:${row.itemId}`"><td class="mono">{{ String(index+1).padStart(2,'0') }}</td><td>{{row.packageName}}</td><td class="goods-category-cell">{{row.categoryName}}</td><td class="goods-name-cell"><b>{{ row.item.name }}</b><small>{{ row.item.model || row.item.spec || '独立物资' }}<span v-if="row.item.excluded"> · {{ row.item.exclusionReason }}</span></small></td><td>{{ row.item.quantity }} {{ row.item.unit }}</td><td>{{ row.item.conductor || '待确认' }}<small>{{ row.item.voltage }}</small></td><td v-for="col in visibleGoodsColumns" :key="col" class="goods-cell" :class="{ 'goods-code-cell': goodsCodeColumns.includes(col) }">{{ col === '包名称' ? row.packageName : col === '类别' ? row.categoryName : row.item.goodsList?.[col] || '—' }}</td><td><StatusBadge :text="itemReviewState(row.item,row.pkg)"/><small v-if="row.item.technicalChanges?.length" class="technical-change-hint">有修改记录</small></td><td v-if="role !== '销售'"><div class="result-actions"><Button size="sm" variant="ghost" @click="openParts(row)">查看子件</Button></div></td><td><div class="result-actions"><Button size="sm" variant="outline" @click="openChain(row)">{{ chainActionLabel(row.item,row.pkg) }}</Button></div></td></tr><tr v-if="!visibleItems.length"><td colspan="99" class="empty">当前筛选下没有货物项</td></tr></tbody></table></div></section></div>

  <div class="collaboration-actions collaboration-actions-bottom" aria-label="询价协作操作"><span v-if="batchPackageIds.length" class="batch-action-scope">本次确认范围：全部所选 {{batchPackageIds.length}} 个报价包（筛选仅影响列表展示）</span><Button v-if="canRejectToSales" variant="outline" :disabled="!editable" @click="show()">驳回到销售确认<AppIcon name="arrow-counter-clockwise" /></Button><Button v-if="isTechnicalDirector && salesConfirmed && !technicalConfirmed" variant="outline" :disabled="!editable" @click="openTechnicalAssignment">{{hasTechnicalAssignment?'重新指派':'指派'}}<AppIcon name="user-switch" /></Button><Button v-if="canReturnTechnical" variant="outline" :disabled="!editable" @click="openReturnTechnical">驳回到技术人员<AppIcon name="arrow-counter-clockwise" /></Button><Button v-if="(role === '销售' && !salesConfirmed) || (role === '技术' && salesConfirmed && !technicalConfirmed && (isTechnicalDirector || isAssignedTechnicalEmployee))" :disabled="!editable || technicalActionBlocked || (isTechnicalDirector && focusPackage.technicalExecution?.mode==='employee' && focusPackage.technicalExecution.status!=='submitted')" @click="runPrimaryAction">{{ batchPackageIds.length > 1 ? role==='销售'?`确认全部所选包需求（${batchPackageIds.length}个包）`:`${primaryActionLabel}（全部${batchPackageIds.length}个包）` : primaryActionLabel }}<AppIcon name="arrow-right" /></Button><Button v-if="confirmationReady && ['销售', '技术', '财务', '董事长'].includes(role)" variant="outline" @click="bomOpen = true">查看 BOM<AppIcon name="arrow-right" /></Button></div></div>

  <Sheet v-model:open="bomOpen"><SheetContent side="right" class="bom-sheet" aria-label="BOM"><SheetHeader class="bom-sheet-title"><SheetTitle>BOM</SheetTitle></SheetHeader><AggregateWorkflowView v-if="batchPackageIds.length" view="bom"/><BomView v-else embedded /></SheetContent></Sheet>
  <FormDialog v-model="rejectOpen" title="驳回"><label>驳回原因<Textarea v-model="form.reason" placeholder="填写驳回的具体依据，销售重新确认前会一直显示在协作页顶部" /></label><p class="muted">驳回后本包版本 +1，销售与技术的原确认一并作废，回到「销售需求确认」重新确认后再往下走。</p><Button @click="submit">保存</Button></FormDialog>
  <TechnicalAssignmentDialog v-model="assignOpen" :packages="sourcePackages" :sheets="project.materialWorksheets||[]" :staff="activeTechnicalStaff" :director="person" @save="saveTechnicalAssignment"/>
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
.workflow-item-filters{display:flex;align-items:end;gap:14px;padding:12px 16px;border-bottom:1px solid #e3eaf0;background:#f8fafc;flex-wrap:wrap}.workflow-item-filters>label{display:grid;gap:5px;color:#607589;font-size:12px}.workflow-item-filters .app-select{min-width:210px}.workflow-item-search{min-width:280px;flex:1}.workflow-item-count{margin-left:auto;padding:0 4px 9px;color:#718397;font-size:12px;white-space:nowrap}
</style>

<style scoped>.batch-action-scope{margin-right:auto;color:#658097;font-size:12px}.goods-category-cell{min-width:150px;max-width:180px;color:#506c82;font-size:11px}.goods-table th:nth-child(2){min-width:70px}</style>
