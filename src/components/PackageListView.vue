<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { useWorkspace } from '@/domain/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AppSelect from './AppSelect.vue'
import StatusBadge from './StatusBadge.vue'
import AppIcon from './AppIcon.vue'
import { isPackageVisibleToPerson, totals, type MaterialPackageSummary, type Package } from '@/domain/model'
import { ALL_WORKSHEETS, getPackageBatchCapability, packageCategory, batchCompatibility } from '@/domain/batch-packages'
import PackageOperationSummaryDialog from './PackageOperationSummaryDialog.vue'

const { project, packages, role, person, openPackage, openPackageEditor, openIntake, packageListWorksheetByProject, selectedPackageIds, enterBatch, toast } = useWorkspace()
const query = shallowRef('')
const stage = shallowRef('全部阶段')
const expandedPackageId = shallowRef('')
const showSelected = shallowRef(false)
const operationRecordPackage = shallowRef<Package | null>(null)
const operationRecordOpen = computed({ get: () => !!operationRecordPackage.value, set: (value: boolean) => { if (!value) operationRecordPackage.value = null } })
const visible = computed(() => packages.value.filter(pkg => isPackageVisibleToPerson(pkg, person.value, role.value)))
const worksheetTabs = computed(() => (project.materialWorksheets||[]).map(sheet=>({...sheet,count:visible.value.filter(pkg=>pkg.materialWorksheetId===sheet.id).length})).filter(sheet=>sheet.count>0).sort((a,b)=>a.order-b.order))
const selectedWorksheetId = computed({get:()=>worksheetTabs.value.some(sheet=>sheet.id===packageListWorksheetByProject.value[project.id])?packageListWorksheetByProject.value[project.id]:ALL_WORKSHEETS,set:(id:string)=>{packageListWorksheetByProject.value={...packageListWorksheetByProject.value,[project.id]:id};query.value='';stage.value='全部阶段';expandedPackageId.value=''}})
watch(worksheetTabs,()=>{if(packageListWorksheetByProject.value[project.id]&&!worksheetTabs.value.some(tab=>tab.id===packageListWorksheetByProject.value[project.id]))packageListWorksheetByProject.value={...packageListWorksheetByProject.value,[project.id]:ALL_WORKSHEETS}},{immediate:true})
const categorized = computed(() => selectedWorksheetId.value===ALL_WORKSHEETS?visible.value:visible.value.filter(pkg=>pkg.materialWorksheetId===selectedWorksheetId.value))
const stages = computed(() => ['全部阶段', ...new Set(categorized.value.map(pkg => pkg.stage))])
const filtered = computed(() => categorized.value.filter(pkg =>
  (stage.value === '全部阶段' || pkg.stage === stage.value)
  && [pkg.packageName, pkg.packageNo || '', pkg.id].some(value => value.toLowerCase().includes(query.value.trim().toLowerCase())),
))
const archivedCount = computed(() => categorized.value.filter(pkg => pkg.archivedAt).length)
const capabilities = computed(()=>new Map(visible.value.map(pkg=>[pkg.id,getPackageBatchCapability(pkg,role.value,person.value)])))
const selection = computed(()=>selectedPackageIds.value.map(id=>visible.value.find(pkg=>pkg.id===id)).filter((pkg):pkg is Package=>!!pkg))
watch([role,person,()=>project.id],()=>{selectedPackageIds.value=[]})
watch(visible,items=>{const current=new Set(items.map(pkg=>pkg.id));selectedPackageIds.value=selectedPackageIds.value.filter(id=>current.has(id))})
const compatibility = computed(()=>batchCompatibility(selection.value.map(pkg=>capabilities.value.get(pkg.id)!)))
const filteredSelectable = computed(()=>filtered.value.filter(pkg=>capabilities.value.get(pkg.id)?.allowed))
const allFilteredSelected = computed(()=>filteredSelectable.value.length>0&&filteredSelectable.value.every(pkg=>selectedPackageIds.value.includes(pkg.id)))
const someFilteredSelected = computed(()=>filteredSelectable.value.some(pkg=>selectedPackageIds.value.includes(pkg.id)))
function togglePackage(pkg:Package,checked:boolean){if(pkg.archivedAt||!capabilities.value.get(pkg.id)?.allowed)return;selectedPackageIds.value=checked?[...new Set([...selectedPackageIds.value,pkg.id])]:selectedPackageIds.value.filter(id=>id!==pkg.id)}
function toggleFiltered(){const ids=new Set(selectedPackageIds.value);if(allFilteredSelected.value)filteredSelectable.value.forEach(pkg=>ids.delete(pkg.id));else filteredSelectable.value.forEach(pkg=>ids.add(pkg.id));selectedPackageIds.value=[...ids]}
function removeSelection(id:string){selectedPackageIds.value=selectedPackageIds.value.filter(value=>value!==id)}
function beginBatch(){try{if(!compatibility.value.compatible){toast(compatibility.value.reason);return}enterBatch(selection.value.map(pkg=>pkg.id))}catch(error){toast(error instanceof Error?error.message:'无法进入批量处理')}}

function summaryFor(pkg: Package) { return pkg.materialSummary }
function formatQuantity(value: number) { return value.toLocaleString('zh-CN', { maximumFractionDigits: 4 }) }
function quantityLabel(summary: MaterialPackageSummary) {
  return summary.quantities.map(entry => `${formatQuantity(entry.quantity)} ${entry.unit}`).join(' · ') || '数量待补充'
}
function pointCounts(summary: MaterialPackageSummary) {
  const counts = new Map<string, number>()
  for (const location of summary.locations) counts.set(location.region, (counts.get(location.region) || 0) + 1)
  return [...counts].map(([region, count]) => ({ region, count })).sort((a, b) => b.count - a.count || a.region.localeCompare(b.region, 'zh-CN'))
}
function distributionPreview(summary: MaterialPackageSummary) {
  const regions = pointCounts(summary)
  if (!regions.length) return '交货地点待补充'
  const preview = regions.slice(0, 2).map(({ region, count }) => `${region} ${count} 点`).join('，')
  return regions.length > 2 ? `${preview}，其余 ${regions.length - 2} 地` : preview
}
function unitsFor(summary: MaterialPackageSummary) { return summary.quantities.map(entry => entry.unit) }
function quantityAt(location: MaterialPackageSummary['locations'][number], unit: string) {
  const amount = location.quantities.find(entry => entry.unit === unit)?.quantity
  return amount === undefined ? '—' : formatQuantity(amount)
}
function packageTotal(pkg: Package) {
  const amount = totals(pkg)
  if (amount.amount <= 0) return '待核价'
  return `¥${amount.taxed.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function packageMargin(pkg: Package) {
  const amount = totals(pkg)
  return amount.amount <= 0 ? '待核价' : `${amount.margin.toFixed(1)}%`
}
function currentStatus(pkg: Package) {
  if (pkg.archivedAt) return pkg.stage
  if (pkg.stage === '资料整理') return pkg.materialSummary ? '待资料解析' : '资料整理'
  if (pkg.stage === '并行协作') {
    if (pkg.salesConfirmed !== pkg.version) return '待销售确认'
    if (pkg.techConfirmed === pkg.version) return '技术确认完成'
    if (pkg.technicalExecution?.mode === 'employee') return pkg.technicalExecution.status === 'submitted' ? '待技术总监确认' : '技术员工处理中'
    return '待技术总监确认'
  }
  const labels: Partial<Record<Package['stage'], string>> = {
    财务核价: '待成本核算',
    审批签发: '审批中',
    可出具报价: '待财务签发',
    已出具: '已签发',
  }
  return labels[pkg.stage] || pkg.stage
}
function toggleDistribution(pkg: Package) {
  if (!pkg.materialSummary) return
  expandedPackageId.value = expandedPackageId.value === pkg.id ? '' : pkg.id
}
</script>

<template>
  <div class="page-heading">
    <div>
      <p class="eyebrow">{{ project.name }}</p>
      <h1>报价包列表</h1>
      <p class="muted">项目基础信息：{{ project.customer }} · {{ project.region || '地区待补充' }} · {{ project.gridType || '电网待补充' }}</p>
    </div>
    <Button v-if="role === '销售'" @click="openIntake('package')"><AppIcon name="plus" />新建报价包</Button>
  </div>

  <nav class="worksheet-tabs" aria-label="按工作表筛选报价包">
    <button type="button" :class="{'is-active':selectedWorksheetId===ALL_WORKSHEETS}" :aria-pressed="selectedWorksheetId===ALL_WORKSHEETS" @click="selectedWorksheetId=ALL_WORKSHEETS">全部 <span>{{ visible.length }}</span></button>
    <button v-for="tab in worksheetTabs" :key="tab.id" type="button" :class="{'is-active':selectedWorksheetId===tab.id}" :aria-pressed="selectedWorksheetId===tab.id" :title="tab.name" @click="selectedWorksheetId=tab.id">{{tab.name}} <span>{{tab.count}}</span></button>
  </nav>

  <section class="panel ledger-panel package-ledger">
    <div class="panel-heading ledger-filters">
      <h2>报价包 <span class="count">{{ categorized.length }}</span><small v-if="archivedCount" class="count-note">其中 {{ archivedCount }} 个已归档</small></h2>
      <Input v-model="query" aria-label="搜索报价包" placeholder="搜索报价包名称、包号或编号" />
      <AppSelect v-model="stage" label="筛选包阶段" :options="stages" />
    </div>
    <div class="ledger-table package-ledger-table">
      <table>
        <colgroup>
          <col class="col-select" /><col class="col-package" /><col class="col-category" /><col class="col-voltage" /><col class="col-code-count" /><col class="col-quantity" /><col class="col-distribution" />
          <col class="col-total" /><col class="col-margin" /><col class="col-created" /><col class="col-status" /><col class="col-actions" />
        </colgroup>
        <thead>
          <tr>
            <th><input type="checkbox" aria-label="全选当前筛选中可处理的报价包" :checked="allFilteredSelected" :indeterminate="someFilteredSelected&&!allFilteredSelected" :disabled="!filteredSelectable.length" @change="toggleFiltered" /></th><th>报价包</th><th>类别</th><th>电压等级</th><th>技术编码种类数</th><th>货物总数量</th><th>地域分布</th>
            <th>总价</th><th>毛利率</th><th>创建时间</th><th>当前状态</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="pkg in filtered" :key="pkg.id">
            <tr :class="{ 'row-archived': pkg.archivedAt, 'distribution-expanded-row': expandedPackageId === pkg.id, 'row-selected':selectedPackageIds.includes(pkg.id) }">
              <td><input type="checkbox" :aria-label="`选择${pkg.packageName}`" :checked="selectedPackageIds.includes(pkg.id)" :disabled="!capabilities.get(pkg.id)?.allowed" :title="capabilities.get(pkg.id)?.reason||'选择报价包'" @change="togglePackage(pkg,($event.target as HTMLInputElement).checked)" /></td>
              <td class="package-name-cell">
                <button class="project-name" @click="openPackage(pkg.id)">{{ pkg.packageName }}</button>
                <small class="block mono">{{ pkg.id }}</small>
                <small v-if="pkg.packageNo">包号 {{ pkg.packageNo }}</small>
                <small v-if="pkg.archivedAt" class="tag-archived">已归档 · {{ pkg.archivedAt }}</small>
              </td>
              <td class="category-cell" :title="packageCategory(pkg,project.materialWorksheets||[])">{{ packageCategory(pkg,project.materialWorksheets||[]) }}</td>
              <td>{{ pkg.materialSummary?.voltageLevels.join(' / ') || pkg.voltageLevel || '待确认' }}</td>
              <td>{{ pkg.materialSummary ? `${pkg.materialSummary.technicalCodeCount} 种` : '待读取清单' }}</td>
              <td class="quantity-cell">
                <b>{{ pkg.materialSummary ? quantityLabel(pkg.materialSummary) : '待读取清单' }}</b>
                <small v-if="pkg.materialSummary">分布于 {{ pkg.materialSummary.locations.length }} 个交货点</small>
              </td>
              <td class="distribution-cell">
                <template v-if="pkg.materialSummary">
                  <b>{{ pointCounts(pkg.materialSummary).length }} 省 · {{ new Set(pkg.materialSummary.locations.map(location => location.project)).size }} 工程 · {{ pkg.materialSummary.locations.length }} 点</b>
                  <small>{{ distributionPreview(pkg.materialSummary) }}</small>
                  <button type="button" class="distribution-toggle" :aria-expanded="expandedPackageId === pkg.id" @click="toggleDistribution(pkg)">
                    {{ expandedPackageId === pkg.id ? '收起分布' : '查看分布' }} <AppIcon :name="expandedPackageId === pkg.id ? 'caret-up' : 'caret-down'" :size="13" />
                  </button>
                </template>
                <span v-else class="secondary-value">待解析清单</span>
              </td>
              <td>{{ packageTotal(pkg) }}</td>
              <td>{{ packageMargin(pkg) }}</td>
              <td>{{ pkg.createdAt }}</td>
              <td><StatusBadge :text="currentStatus(pkg)" /></td>
              <td class="package-actions">
                <Button v-if="role === '销售'" size="sm" variant="ghost" @click="openPackageEditor(pkg.id)">编辑</Button>
                <Button v-if="role === '董事长'" size="sm" variant="outline" @click="operationRecordPackage = pkg">操作记录</Button>
                <span v-if="role!=='销售' && role!=='董事长'">—</span>
              </td>
            </tr>
            <tr v-if="expandedPackageId === pkg.id && pkg.materialSummary" class="distribution-detail-row">
              <td colspan="12">
                <section class="distribution-detail" :aria-label="`${pkg.packageName}地域与数量分布`">
                  <header>
                    <div>
                      <h3>{{ pkg.packageName }} · 地域与数量分布</h3>
                      <p>{{ pointCounts(pkg.materialSummary).length }} 省 · {{ new Set(pkg.materialSummary.locations.map(location => location.project)).size }} 工程 · {{ pkg.materialSummary.locations.length }} 个交货点。相同单位分别汇总。</p>
                    </div>
                    <button type="button" class="distribution-close" @click="expandedPackageId = ''">收起 <AppIcon name="caret-up" :size="13" /></button>
                  </header>
                  <div class="distribution-table-wrap">
                    <table class="distribution-table">
                      <thead><tr><th>地域</th><th>工程</th><th>交货点</th><th>货物项</th><th v-for="unit in unitsFor(pkg.materialSummary)" :key="unit">{{ unit }}</th></tr></thead>
                      <tbody>
                        <tr v-for="(location, index) in pkg.materialSummary.locations" :key="`${location.region}-${location.project}-${location.deliveryPoint}-${index}`">
                          <td>{{ location.region }}</td><td>{{ location.project }}</td><td>{{ location.deliveryPoint }}</td><td>{{ location.itemCount }} 项</td>
                          <td v-for="unit in unitsFor(pkg.materialSummary)" :key="unit">{{ quantityAt(location, unit) }}</td>
                        </tr>
                        <tr v-if="!pkg.materialSummary.locations.length"><td class="distribution-empty" :colspan="4 + unitsFor(pkg.materialSummary).length">尚未从清单识别到交货地点</td></tr>
                        <tr class="distribution-total-row"><td>合计</td><td>{{ new Set(pkg.materialSummary.locations.map(location => location.project)).size }} 个工程</td><td>{{ pkg.materialSummary.locations.length }} 个交货点</td><td>{{ pkg.materialSummary.itemCount }} 项</td><td v-for="entry in pkg.materialSummary.quantities" :key="entry.unit">{{ formatQuantity(entry.quantity) }}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <div v-if="!filtered.length" class="empty">{{categorized.length?'当前工作表下没有符合条件的报价包，请调整搜索或阶段筛选。':'当前工作表下暂无可见报价包。'}} <button v-if="query||stage!=='全部阶段'" type="button" class="package-enter-action" @click="query='';stage='全部阶段'">清除筛选</button></div>
    </div>
    <footer class="batch-selection-bar">
      <div><b>已选择 {{ selection.length }} 个报价包</b><span>涉及 {{ new Set(selection.map(pkg=>packageCategory(pkg,project.materialWorksheets||[]))).size }} 个类别</span><span v-if="selection.length&&!compatibility.compatible" class="batch-warning">{{ compatibility.reason }}</span><span v-else-if="selection.length">{{ capabilities.get(selection[0].id)?.label }}</span><span v-else>请选择报价包</span></div>
      <div class="batch-selection-actions"><Button variant="ghost" :disabled="!selection.length" @click="selectedPackageIds=[]">清空选择</Button><Button variant="outline" :disabled="!selection.length" @click="showSelected=!showSelected">{{showSelected?'收起已选':'查看已选'}}</Button><Button :disabled="!selection.length||!compatibility.compatible" @click="beginBatch">批量进入（{{selection.length}}）</Button></div>
      <aside v-if="showSelected" class="selected-package-popover"><header>已选报价包 <button type="button" @click="showSelected=false">关闭</button></header><div v-for="pkg in selection" :key="pkg.id" class="selected-package-row"><div><b>{{pkg.packageName}}</b><small>{{packageCategory(pkg,project.materialWorksheets||[])}} · {{pkg.id}} · {{capabilities.get(pkg.id)?.label}}</small></div><button type="button" @click="removeSelection(pkg.id)">移除</button></div></aside>
    </footer>
  </section>
  <PackageOperationSummaryDialog v-if="operationRecordPackage" v-model:open="operationRecordOpen" :pkg="operationRecordPackage" :category="packageCategory(operationRecordPackage, project.materialWorksheets || [])" />
</template>

<style scoped>
.worksheet-tabs{display:flex;gap:8px;max-width:100%;margin:0 0 18px;padding:4px 0;overflow-x:auto}
.worksheet-tabs button{flex:none;max-width:260px;padding:8px 14px;border:1px solid #d6e3ed;border-radius:7px;background:#fff;color:#43576a;font-size:13px;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.worksheet-tabs button span{margin-left:6px;color:#718397;font-size:12px}
.worksheet-tabs button.is-active{border-color:#075580;background:#edf5fa;color:#075580;font-weight:650}
.worksheet-tabs button:focus-visible{outline:3px solid #619cc4;outline-offset:2px}
.package-ledger-table{overflow-x:auto;overflow-y:auto}
.package-ledger-table table{width:100%;min-width:1260px;table-layout:fixed}
.package-ledger-table .col-select{width:42px}.package-ledger-table .col-category{width:9%}
.package-ledger-table .col-package{width:10%}.package-ledger-table .col-voltage{width:10%}.package-ledger-table .col-code-count{width:8%}.package-ledger-table .col-quantity{width:17%}.package-ledger-table .col-distribution{width:15%}.package-ledger-table .col-total{width:6%}.package-ledger-table .col-margin{width:6%}.package-ledger-table .col-created{width:8%}.package-ledger-table .col-status{width:9%}.package-ledger-table .col-actions{width:11%}
.package-ledger-table th,.package-ledger-table td{padding:12px 8px;overflow-wrap:anywhere;word-break:normal}
.package-ledger-table .package-name-cell{text-align:left!important}
.package-name-cell small{display:block;margin-top:5px;overflow-wrap:anywhere}
.package-name-cell .project-name{max-width:100%;overflow-wrap:anywhere}
.quantity-cell b,.distribution-cell b{display:block;min-width:0;font-size:12px;font-weight:600;line-height:1.5;overflow-wrap:anywhere}
.quantity-cell small,.distribution-cell small{display:block;margin-top:4px;color:#65788a;font-size:11px;line-height:1.45;overflow-wrap:anywhere}
.distribution-toggle,.distribution-close{display:inline-flex;align-items:center;justify-content:center;gap:4px;margin-top:6px;padding:4px 8px;border:1px solid #d6e3ed;border-radius:999px;background:#f5f9fc;color:#075580;font-size:11px;font-weight:550;line-height:1.2;white-space:nowrap;cursor:pointer;transition:background-color .16s ease,border-color .16s ease,color .16s ease}
.distribution-toggle:hover,.distribution-close:hover{border-color:#9dbbd0;background:#eaf3f9;color:#064975}
.distribution-toggle:focus-visible,.distribution-close:focus-visible,.package-enter-action:focus-visible{outline:3px solid #619cc4;outline-offset:2px}
.package-enter-action{padding:4px 2px;border:0;background:transparent;color:#075580;font-size:12px;font-weight:600;white-space:nowrap}
.package-enter-action:hover{text-decoration:underline;text-underline-offset:3px;color:#064975}
.secondary-value{color:#788594;font-size:11px}
.distribution-expanded-row{background:#f4f8fb}
.distribution-detail-row>td{padding:0 12px 14px!important;background:#f4f8fb}
.distribution-detail{padding:14px 18px 8px;border:1px solid #dce6ed;border-radius:8px;background:#fbfdff;text-align:left}
.distribution-detail header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:0 0 12px}
.distribution-detail h3{margin:0;font-size:14px;color:#263c4d}
.distribution-detail header p{margin:5px 0 0;color:#687e90;font-size:11px;line-height:1.5}
.distribution-table-wrap{max-height:310px;overflow-y:auto;overflow-x:hidden}
.package-ledger-table .distribution-table{width:100%;min-width:0;table-layout:fixed;font-size:12px}
.distribution-table th,.distribution-table td{padding:9px 8px;text-align:left!important;overflow-wrap:anywhere;word-break:normal}
.distribution-table th:nth-child(1){width:9%}.distribution-table th:nth-child(2){width:27%}.distribution-table th:nth-child(3){width:23%}.distribution-table th:nth-child(4){width:9%}
.distribution-table td:nth-child(1),.distribution-table td:nth-child(4),.distribution-table td:nth-child(n+5){text-align:center!important}
.distribution-table th{position:sticky;top:0;z-index:1;background:#f3f6f8}
.distribution-table td{border-bottom:1px solid #e8edf2}
.distribution-total-row td{font-weight:650;background:#f7f9fb}
.distribution-empty{text-align:center!important;color:#788594}
.package-actions{white-space:nowrap}
.package-actions :deep(.button){margin:2px}
.row-selected{background:#edf6fc}.category-cell{color:#4b657a;font-size:12px}
.batch-selection-bar{position:sticky;bottom:0;z-index:5;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:12px 16px;border-top:1px solid #d8e4ed;background:rgba(255,255,255,.97);box-shadow:0 -5px 18px #1d40500e}
.batch-selection-bar>div:first-child,.batch-selection-actions{display:flex;align-items:center;gap:14px;flex-wrap:wrap}.batch-selection-bar span,.selected-package-row small{color:#65788a;font-size:12px}.batch-warning{color:#a15812!important}.selected-package-popover{position:absolute;right:170px;bottom:calc(100% + 8px);width:min(460px,90vw);max-height:310px;overflow:auto;padding:12px;border:1px solid #dce6ed;border-radius:10px;background:#fff;box-shadow:0 12px 32px #18344820}.selected-package-popover header,.selected-package-row{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:8px}.selected-package-row{border-top:1px solid #edf1f4}.selected-package-row small{display:block;margin-top:3px}
@media(max-width:1100px){.package-ledger-table th,.package-ledger-table td{padding:10px 5px;font-size:11px}.package-ledger-table .col-package{width:10%}.package-ledger-table .col-voltage{width:9%}.package-ledger-table .col-code-count{width:7%}.package-ledger-table .col-quantity{width:18%}.package-ledger-table .col-distribution{width:16%}.package-ledger-table .col-total{width:6%}.package-ledger-table .col-margin{width:6%}.package-ledger-table .col-created{width:8%}.package-ledger-table .col-status{width:9%}.package-ledger-table .col-actions{width:11%}.package-name-cell small{font-size:10px}.distribution-toggle{padding:4px 6px;font-size:10px}}
@media(max-width:760px){.package-ledger-table th,.package-ledger-table td{padding:8px 3px;font-size:10px}.package-ledger-table .col-package{width:11%}.package-ledger-table .col-voltage{width:8%}.package-ledger-table .col-code-count{width:7%}.package-ledger-table .col-quantity{width:18%}.package-ledger-table .col-distribution{width:17%}.package-ledger-table .col-total{width:6%}.package-ledger-table .col-margin{width:6%}.package-ledger-table .col-created{width:8%}.package-ledger-table .col-status{width:8%}.package-ledger-table .col-actions{width:11%}.package-actions{white-space:normal}.package-actions :deep(.button){margin:2px 0}.package-enter-action{font-size:10px}.distribution-detail{padding:10px}.distribution-table th,.distribution-table td{padding:7px 4px;font-size:10px}}
</style>
