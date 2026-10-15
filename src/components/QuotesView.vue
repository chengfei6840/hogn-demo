<script setup lang="ts">
import AppSelect from '@/components/AppSelect.vue'
import { computed, reactive, shallowRef, watch } from 'vue'
import { useWorkspace } from '@/domain/store'
import { money, canIssueQuote, canHandlePackageProcess, type DealResult, type Package } from '@/domain/model'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AppIcon from './AppIcon.vue'
import StatusBadge from './StatusBadge.vue'
import FormDialog from './FormDialog.vue'
import { Textarea } from '@/components/ui/textarea'
import { downloadQuoteWorkbook } from '@/lib/quote-export'

const { package: p, project, role, person, act, toast } = useWorkspace()
const index = shallowRef(0)
const snap = computed(() => p.snapshots[index.value])
const excludedItems = computed(() => snap.value?.excluded ?? [])
const expanded = reactive<Record<string, boolean>>({})
const showAllParts = reactive<Record<string, boolean>>({})
const editing = shallowRef(false)
const draftItems = reactive<Record<string, number>>({})
const draftParts = reactive<Record<string, number>>({})
watch(index, () => { editing.value = false })
const canView = computed(() => {
  if (!['销售', '财务', '董事长'].includes(role.value)) return false
  if (role.value === '销售' && p.stage === '已出具') return canHandlePackageProcess(p as Package, 'salesExternal', person.value)
  if (role.value === '销售' && p.stage === '客户议价中') return canHandlePackageProcess(p as Package, 'dealTracking', person.value)
  return true
})
const canEdit = computed(() => role.value === '销售' && index.value === 0 && ['已出具', '客户议价中'].includes(p.stage) && !p.archivedAt)
const shownUntaxed = computed(() => snap.value?.items.reduce((sum, item) => sum + unitPrice(item.id, item.price) * item.quantity, 0) || 0)
const shownTaxed = computed(() => snap.value ? Math.round(shownUntaxed.value * (1 + snap.value.tax / 100) * 10000) / 10000 : 0)
const shownTaxAmount = computed(() => shownTaxed.value - shownUntaxed.value)

const dealOpen = shallowRef(false), dealStatus = shallowRef<DealResult>('已成交'), dealNote = shallowRef('')
const dealResults = computed(() => [
  { value: '已成交' as DealResult, label: '已成交（归档入库）' },
  { value: '未成交' as DealResult, label: '未成交（归档入库）' },
  { value: '已取消' as DealResult, label: '已取消（归档入库）' },
])

function partRows(itemId: string) { const rows = snap.value?.quoteParts?.filter(part => part.itemId === itemId) || []; return [...rows.filter(part => part.qty !== 0), ...rows.filter(part => part.qty === 0)] }
function visibleParts(itemId: string) { const rows = partRows(itemId); return showAllParts[itemId] ? rows : rows.slice(0, 5) }
function toggleItem(itemId: string) { if(partRows(itemId).length) expanded[itemId] = !expanded[itemId] }
function priceValue(value: unknown) {
  const number = Number((value as { target?: { value?: string } })?.target?.value ?? value)
  return Number.isFinite(number) && number >= 0 ? Math.round(number * 10000) / 10000 : 0
}
function unitPrice(itemId: string, value: number) { return editing.value ? draftItems[itemId] ?? value : value }
function partPrice(itemId: string, row: number, value: number) { return editing.value ? draftParts[`${itemId}:${row}`] ?? value : value }
function startEditing() {
  if (!canEdit.value || !snap.value) return
  for (const item of snap.value.items) draftItems[item.id] = item.price
  for (const part of snap.value.quoteParts || []) draftParts[`${part.itemId}:${part.row}`] = part.price
  editing.value = true
}
function cancelEditing() { editing.value = false }
function setParentPrice(itemId: string, raw: unknown) {
  const next = priceValue(raw)
  draftItems[itemId] = next
  const children = partRows(itemId)
  const subtotal = children.reduce((sum, part) => sum + (part.qty ?? 0) * partPrice(itemId, part.row, part.price), 0)
  if (children.length && subtotal > 0) {
    const factor = next / subtotal
    for (const part of children) draftParts[`${itemId}:${part.row}`] = Math.round(partPrice(itemId, part.row, part.price) * factor * 10000) / 10000
  } else if (children.length) {
    const first = children.find(part => (part.qty ?? 0) > 0)
    if (first) draftParts[`${itemId}:${first.row}`] = Math.round(next / first.qty! * 10000) / 10000
  }
}
function setPartPrice(itemId: string, row: number, raw: unknown) {
  draftParts[`${itemId}:${row}`] = priceValue(raw)
  draftItems[itemId] = Math.round(partRows(itemId).reduce((sum, part) => sum + (part.qty ?? 0) * partPrice(itemId, part.row, part.price), 0) * 10000) / 10000
}
function savePrices() {
  if (!snap.value) return false
  const items = snap.value.items.map(item => ({
    id: item.id,
    price: unitPrice(item.id, item.price),
    partPrices: Object.fromEntries(partRows(item.id).map(part => [part.row, partPrice(item.id, part.row, part.price)])),
  }))
  const saved = act('updateQuotePrices', { snapshotId: snap.value.id, items })
  if (saved) editing.value = false
  return saved
}
async function download() {
  if (!snap.value || !canView.value) return
  if (editing.value && !savePrices()) return
  try {
    await downloadQuoteWorkbook(project, snap.value, p.packageName)
    toast('已下载报价 Excel；文件价格与当前页面一致')
  } catch {
    toast('报价 Excel 生成失败，请重试')
  }
}
</script>

<template>
  <div class="signed-quote">
    <h1>已签发报价</h1>
    <div v-if="!canView" class="panel empty"><AppIcon name="lock-key" :size="36"/><h2>当前角色无权查看报价金额</h2><p>技术结果请在串型检索中查阅。</p></div>
    <section v-else-if="!snap" class="panel empty"><AppIcon name="files" :size="45"/><h2>尚未签发报价</h2><p>完成确认与审批后，由财务签发报价。</p><Button v-if="canIssueQuote(p as Package, role, person)" @click="act('issue')">财务签发报价</Button></section>
    <template v-else>
      <div class="quote-toolbar">
        <div class="quote-version-group">
          <span class="quote-project">{{ project.name }} / {{ p.packageName }}</span>
          <AppSelect v-model="index" label="报价版本" :options="p.snapshots.map((s, n) => ({ value: n, label: '报价版本 V' + s.version }))"/>
          <StatusBadge text="已签发"/>
        </div>
        <div class="quote-identification"><p>报价编号：{{ snap.id }}</p><p>签发时间：{{ snap.at }}</p></div>
        <div class="quote-actions">
          <Button v-if="canEdit && !editing" variant="outline" @click="startEditing">调整报价</Button>
          <Button v-if="editing" variant="outline" @click="cancelEditing">取消修改</Button>
          <Button v-if="editing" @click="savePrices">保存报价调整</Button>
          <Button variant="outline" @click="download"><AppIcon name="download-simple"/>下载报价单 Excel</Button>
        </div>
      </div>
      <div class="quote-metrics" aria-label="报价金额汇总">
        <div><span>不含税总额</span><strong>{{ money(shownUntaxed) }}</strong></div>
        <div><span>税率</span><strong>{{ snap.tax }}%</strong></div>
        <div><span>税额</span><strong>{{ money(shownTaxAmount) }}</strong></div>
        <div><span>含税总额</span><strong>{{ money(shownTaxed) }}</strong></div>
      </div>
      <p class="quote-caption">报价明细 · 点击串行展开子件 · 金额单位：元</p>
      <div class="quote-table-scroll">
        <table class="quote-table">
          <colgroup><col class="disclosure-column"/><col class="sequence-column"/><col class="name-column"/><col class="quantity-column"/><col class="unit-column"/><col class="price-column"/><col class="amount-column"/></colgroup>
          <thead><tr><th aria-label="展开子件"></th><th>序号</th><th>串名称 / 型号</th><th>数量</th><th>单位</th><th class="numeric">未税报价单价</th><th class="numeric">未税报价金额</th></tr></thead>
          <tbody>
            <template v-for="item in snap.items" :key="item.id">
              <tr class="quote-parent-row" :class="{ 'is-expanded': expanded[item.id], 'has-parts': partRows(item.id).length }" :tabindex="partRows(item.id).length ? 0 : undefined" :aria-expanded="partRows(item.id).length ? !!expanded[item.id] : undefined" @click="toggleItem(item.id)" @keydown.enter.prevent="toggleItem(item.id)" @keydown.space.prevent="toggleItem(item.id)">
                <td class="disclosure-cell"><button v-if="partRows(item.id).length" type="button" :aria-label="(expanded[item.id] ? '收起' : '展开') + '货物项' + item.id + '子件'" :aria-expanded="!!expanded[item.id]" @click.stop="toggleItem(item.id)"><span class="disclosure-triangle" :class="{ open: expanded[item.id] }" aria-hidden="true"></span></button></td>
                <td class="center">{{ item.id }}</td><td class="quote-item-name">{{ item.name }}<small v-if="item.kind === '独立物资'">独立物资</small></td>
                <td class="center">{{ item.quantity }}</td><td class="center">{{ item.unit }}</td>
                <td class="numeric"><Input v-if="editing" type="number" min="0" step="0.0001" :model-value="unitPrice(item.id, item.price)" :aria-label="`调整货物项 ${item.id} 未税单价`" @click.stop @keydown.stop @change="setParentPrice(item.id, $event)"/><span v-else>{{ money(item.price) }}</span></td>
                <td class="numeric">{{ money(unitPrice(item.id, item.price) * item.quantity) }}</td>
              </tr>
              <tr v-if="expanded[item.id] && partRows(item.id).length" class="quote-child-container">
                <td colspan="7"><div class="quote-child-box">
                  <p class="quote-child-heading">子件明细 · 每套分配</p>
                  <table class="quote-child-table"><colgroup><col style="width:20%"/><col style="width:25%"/><col style="width:12%"/><col style="width:9%"/><col style="width:17%"/><col style="width:17%"/></colgroup>
                    <thead><tr><th>子件名称</th><th>型号规格</th><th>每套用量</th><th>单位</th><th class="numeric">未税报价单价</th><th class="numeric">每套报价小计</th></tr></thead>
                    <tbody><tr v-for="part in visibleParts(item.id)" :key="part.row"><td>{{ part.name }}</td><td>{{ part.model || '—' }}</td><td class="center">{{ part.qty ?? '—' }}</td><td class="center">{{ part.unit }}</td>
                      <td class="numeric"><Input v-if="editing" type="number" min="0" step="0.0001" :model-value="partPrice(item.id, part.row, part.price)" :aria-label="`调整子件 ${part.name} 未税单价`" @change="setPartPrice(item.id, part.row, $event)"/><span v-else>{{ money(part.price) }}</span></td>
                      <td class="numeric">{{ money((part.qty ?? 0) * partPrice(item.id, part.row, part.price)) }}</td>
                    </tr></tbody>
                  </table>
                  <div class="quote-child-footer">
                    <button v-if="partRows(item.id).length > 5" class="show-more-parts" type="button" @click="showAllParts[item.id] = !showAllParts[item.id]"><AppIcon name="info" :size="16"/>{{ showAllParts[item.id] ? '收起更多子件' : `另有 ${partRows(item.id).length - 5} 项子件，展开后可继续查看` }}</button>
                    <div class="quote-child-total"><span>本串每套报价合计</span><strong>{{ money(unitPrice(item.id, item.price)) }}</strong><span class="included-note">已包含在串报价中</span></div>
                  </div>
                </div></td>
              </tr>
            </template>
            <tr v-if="!snap.items.length"><td colspan="7" class="empty">当前报价版本没有明细。</td></tr>
          </tbody>
        </table>
      </div>
      <section v-if="snap.notes || excludedItems.length || p.dealNote" class="quote-terms">
        <AppIcon name="file-text" :size="28"/><div>
          <div v-if="snap.notes"><h2>商务条款</h2><p>{{ snap.notes }}</p></div>
          <div v-if="excludedItems.length" class="quote-excluded"><h3>本次报价不包含</h3><p v-for="item in excludedItems" :key="item.id">{{ item.name }}：{{ item.exclusionReason }}</p></div>
          <p v-if="p.dealNote" class="quote-deal-note">成交记录：{{ p.dealNote }}</p>
        </div>
      </section>
      <p v-if="editing" class="quote-edit-hint">修改串单价时，所属子件报价按比例同步；修改子件单价时，串单价按子件合计重算。</p>
      <div class="quote-process-actions">
        <Button v-if="role === '销售' && p.archivedAt" variant="outline" @click="act('unarchive')">取消归档</Button>
        <Button v-if="role === '销售' && ['已出具', '客户议价中'].includes(p.stage)" variant="outline" @click="act('revision')">创建报价新版本</Button>
        <Button v-if="role === '销售' && p.stage === '已出具'" @click="act('dispatch')">登记外发</Button>
        <Button v-if="role === '销售' && p.stage === '客户议价中'" @click="dealOpen = true">登记成交结果</Button>
      </div>
    </template>
  </div>
  <FormDialog v-model="dealOpen" title="登记成交结果" description="保存客户反馈和成交状态，归档后报价只读。">
    <label>结果<AppSelect v-model="dealStatus" label="成交结果" :options="dealResults"/></label>
    <label>客户反馈与依据（必填）<Textarea v-model="dealNote" placeholder="填写客户确认、未成交原因、取消依据或后续议价说明"/></label>
    <Button @click="act('deal', { status: dealStatus, note: dealNote }) && (dealOpen = false)">保存并归档入库</Button>
  </FormDialog>
</template>

<style scoped>
:global(main[data-page="quotes"]){display:block!important;overflow-y:auto;padding:26px 30px 34px}
.signed-quote{color:#163751;font-size:14px}.signed-quote h1{font-size:30px;font-weight:700;color:#10385b;margin:0 0 16px}
.quote-toolbar{display:flex;align-items:center;gap:20px;flex-wrap:wrap;margin-bottom:22px}.quote-version-group{display:flex;gap:14px;align-items:center;flex-wrap:wrap}.quote-project{padding:10px 18px;border:1px solid #d5e3ee;border-radius:6px;background:#fff;font-size:15px;font-weight:600}.quote-version-group :deep(.app-select){height:40px;border-color:#d5e3ee;font-size:14px}.quote-version-group :deep(.status){font-size:13px;padding:10px 12px}.quote-identification{margin-left:auto;color:#607b93;font-size:13px;line-height:1.8}.quote-identification p{margin:0}.quote-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.quote-actions :deep(button){height:40px}
.quote-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid #d5e3ee;border-radius:6px;background:#fbfdff;padding:18px 0;margin-bottom:22px}.quote-metrics>div{text-align:center;border-left:1px solid #dce7ef;display:grid;gap:7px;padding:0 12px}.quote-metrics>div:first-child{border-left:0}.quote-metrics span{font-size:14px;color:#58718c}.quote-metrics strong{font-size:22px;font-weight:650;color:#123b62;font-variant-numeric:tabular-nums}
.quote-caption{margin:0 0 12px;color:#537494;font-size:14px}.quote-table-scroll{overflow-x:auto;border:1px solid #d5e3ee;border-radius:6px;background:#fff}.quote-table{table-layout:fixed;min-width:900px;font-size:14px}.quote-table th,.quote-table td{border-right:1px solid #e0e9f0;border-bottom:1px solid #e0e9f0;padding:12px 18px;color:#163751}.quote-table th{font-weight:500;background:#f1f7fb;color:#58738e;text-align:center;font-size:14px}.quote-table th:nth-child(3){text-align:left}.quote-table th:last-child,.quote-table td:last-child{border-right:0}.quote-table tbody>tr:last-child>td{border-bottom:0}.disclosure-column{width:4%}.sequence-column{width:6%}.name-column{width:40%}.quantity-column{width:8%}.unit-column{width:8%}.price-column{width:17%}.amount-column{width:17%}.quote-table .numeric{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}.quote-table .center{text-align:center}.quote-item-name{line-height:1.6;font-size:14px}.quote-item-name small{font-size:12px;margin-top:2px;color:#6c8499}.quote-parent-row.has-parts{cursor:pointer}.quote-parent-row.has-parts:hover{background:#f2f8fd}.quote-parent-row.is-expanded{background:#e6f3ff;font-weight:600}.quote-parent-row:focus-visible{outline:2px solid #5a94c0;outline-offset:-2px}.quote-table .disclosure-cell{padding:0;text-align:center}.disclosure-cell button{display:flex;align-items:center;justify-content:center;width:100%;height:44px;background:transparent;border:0;color:#173d60}
.quote-table .quote-child-container>td{padding:0 18px 12px;background:#e9f5ff;border-right:0}.quote-child-box{border:1px solid #cfe3f3;border-radius:5px;padding:12px 14px;background:#f7fbff}.quote-child-heading{color:#557495;font-size:14px;margin:0 0 8px}.quote-child-table{table-layout:fixed;font-size:13px}.quote-child-table th,.quote-child-table td{padding:7px 16px;background:#fff;font-size:13px;font-weight:400;line-height:1.5}.quote-child-table th{background:#f2f7fc;text-align:center}.quote-child-table td{border:1px solid #e0e9f0}.quote-child-table th:first-child,.quote-child-table th:nth-child(2){text-align:center}.quote-child-footer{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:12px 4px 0;flex-wrap:wrap}.show-more-parts{display:flex;gap:7px;align-items:center;border:0;background:transparent;color:#527da4;font-size:13px;padding:2px 0}.quote-child-total{display:flex;align-items:center;gap:16px;margin-left:auto;color:#527494;font-size:13px}.quote-child-total strong{font-size:17px;color:#123b62;white-space:nowrap}.included-note{padding-left:16px;border-left:1px solid #bfd5e7}
.quote-terms{display:flex;gap:16px;border:1px solid #d5e3ee;border-radius:6px;padding:18px 22px;background:#fff;margin-top:22px;line-height:1.7}.quote-terms>svg{flex-shrink:0;color:#1e6daa;margin-top:2px}.quote-terms h2{font-size:17px;font-weight:650;color:#163f66;margin-bottom:4px}.quote-terms p{font-size:14px;white-space:pre-wrap;margin:0;color:#38536e}.quote-excluded,.quote-deal-note{margin-top:12px!important}.quote-excluded h3{font-size:14px;margin-bottom:4px}.quote-edit-hint{font-size:12px;color:#617b90;margin-top:14px}.quote-process-actions{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;margin-top:18px}.quote-table :deep(input){max-width:150px;text-align:right;margin-left:auto}
.quote-table .quote-item-name{text-align:left;font-size:15px}.quote-child-heading{text-align:left}.quote-child-table th,.quote-child-table td{font-size:14px}.quote-child-table td:nth-child(1),.quote-child-table td:nth-child(2){text-align:left}.quote-parent-row.is-expanded,.quote-parent-row.is-expanded:hover{background:#e6f3ff}.disclosure-triangle{width:0;height:0;border-top:4px solid transparent;border-bottom:4px solid transparent;border-left:6px solid currentColor}.disclosure-triangle.open{transform:rotate(90deg)}
@media(max-width:1100px){.quote-identification{margin-left:0}.quote-actions{margin-left:auto}.quote-child-total{gap:10px}.quote-metrics strong{font-size:19px}}
@media(max-width:800px){:global(main[data-page="quotes"]){padding:20px 14px}.signed-quote h1{font-size:25px}.quote-metrics{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:18px}.quote-metrics>div:nth-child(3){border-left:0}.quote-metrics strong{font-size:18px}.quote-toolbar{gap:12px}.quote-actions{margin-left:0}.quote-project{padding:8px 12px}.quote-terms{padding:16px}}
</style>
