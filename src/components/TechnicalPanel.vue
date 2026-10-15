<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, shallowRef, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import AppIcon from './AppIcon.vue'
import AppSelect from '@/components/AppSelect.vue'
import FormDialog from './FormDialog.vue'
import { catalog, useWorkspace } from '@/domain/store'
import { goodsSourceSheet } from '@/data/sourceSheets'
import { technicalDirector, technicalDirectors, type Role } from '@/domain/model'
import { goodsColumns } from '@/data/goodsList'
import { useUsersStore } from '@/stores/users'

const props = defineProps<{ itemId: string }>()
const emit = defineEmits<{ close: [] }>()
const { package: pkg, role, person, act, toast } = useWorkspace()
const usersStore=useUsersStore()

// 串参数：这五项正是总库串型匹配用到的字段，保存时按新值重新匹配。
type ChainKey = 'model' | 'voltage' | 'conductor' | 'atlas' | 'drawing'
const chainFields: { key: ChainKey; label: string; hint: string }[] = [
  { key: 'model', label: '串型号', hint: '总库串型号' },
  { key: 'voltage', label: '电压等级', hint: '并入串型名电压段' },
  { key: 'conductor', label: '适用导线', hint: '并入串型名导线段' },
  { key: 'atlas', label: '图册版本', hint: '总库图册字段' },
  { key: 'drawing', label: '图号', hint: '总库图号字段' }
]
const chainDraft = reactive<Record<ChainKey, string>>({ model: '', voltage: '', conductor: '', atlas: '', drawing: '' })
const reason = shallowRef('')
const itemDraft = reactive({ name: '', quantity: 0, unit: '', conductor: '', voltage: '', spec: '', model: '' })
const salesGoodsFields = goodsColumns.filter(column => !['包名称', '分包编号'].includes(column))
const goodsDraft = reactive<Record<string, string>>({})
const zoomOpen = shallowRef(false)
const zoomScale = shallowRef(1)
const compareOpen = shallowRef(false)
const candidateChoice = shallowRef('')
const assignOpen = shallowRef(false)
const assignForm = reactive({ owner: '技术' as Role, assignee: '技术 · 李工' })
const assignPeople=computed(()=>usersStore.peopleForRole(assignForm.owner).filter(assignee=>assignForm.owner!=='技术'||!technicalDirectors.includes(assignee)))
function updateAssignOwner(owner:Role){assignForm.owner=owner;assignForm.assignee=assignPeople.value[0]||''}

const item = computed(() => pkg.items.find(entry => entry.id === props.itemId))
// 串信息只对串型货物项有意义：独立物资没有串，右侧编辑区整体隐藏。
const isChain = computed(() => item.value?.kind !== '独立物资')
const isSales = computed(() => role.value === '销售')
const candidate = computed(() => isChain.value && item.value?.selected ? catalog.find(entry => entry.id === item.value?.selected) || null : null)
const familyCandidates = computed(() => {
  if (!item.value || !isChain.value) return []
  const model = item.value.model.trim() || item.value.name.match(/[A-Z0-9]+(?:-[A-Z0-9()]+){1,}(?:护|铝)?/i)?.[0] || ''
  const family = model.replace(/-\d+A(?:护|铝)$/i, '').toLowerCase()
  const voltage = item.value.voltage.replace(/\s/g, '').toLowerCase()
  const conductor = item.value.conductor.replace(/\s/g, '').toLowerCase()
  const candidates = catalog.filter(entry => {
    if (family && !entry.model.toLowerCase().startsWith(family)) return false
    const candidateVoltage = entry.name.match(/^(\d+(?:\.\d+)?kV)/i)?.[1]?.toLowerCase() || ''
    if (voltage && candidateVoltage && voltage !== candidateVoltage) return false
    const candidateConductor = entry.description.split(',')[0].replace(/\s/g, '').toLowerCase()
    if (conductor && conductor !== candidateConductor) return false
    return Boolean(family || (item.value?.spec && entry.spec === item.value.spec))
  })
  return candidates
})
const selectedCandidate = computed(() => familyCandidates.value.find(entry => entry.id === candidateChoice.value) || null)
const compareCandidates = computed(() => familyCandidates.value)
const visibleChainFields = computed(() => chainFields.filter(field => !['atlas', 'drawing'].includes(field.key)))
const canChooseCandidate = computed(() => role.value === '技术' && canEdit.value)
const needsCandidateRecheck = computed(() => Boolean(candidate.value && !familyCandidates.value.some(entry => entry.id === candidate.value?.id)))
// 修改记录：这条串保存过几次串信息、改了哪些字段，供技术复核时对照。
const changes = computed(() => (item.value?.technicalChanges ?? []).map(change => ({ ...change, changes: change.changes.filter(entry => !entry.field.startsWith('part.')) })).filter(change => change.changes.length))
const canEdit = computed(() => ['资料整理', '并行协作'].includes(pkg.stage) && (role.value === '销售' || (role.value === '技术' && (person.value === technicalDirector || (pkg.technicalExecution?.mode === 'employee' && pkg.technicalExecution.status === 'assigned' && pkg.technicalExecution.assignee === person.value)))))
const draftParams = computed(() => Object.fromEntries(chainFields.map(field => [field.key, String(chainDraft[field.key] ?? '').trim()])) as Record<ChainKey, string>)
const chainDirty = computed(() => chainFields.some(field => draftParams.value[field.key] !== (item.value?.[field.key] || '').trim()))
function serialFieldMissing(key: ChainKey) { return key !== 'atlas' && key !== 'drawing' && !String(item.value?.[key] || '').trim() }

function candidateParams(entry: typeof catalog[number]): Record<ChainKey, string> {
  const voltage = entry.name.match(/^(\d+(?:\.\d+)?kV)/i)?.[1] || ''
  return { model: entry.model, voltage, conductor: entry.description.split(',')[0].trim(), atlas: entry.atlas, drawing: entry.drawing || entry.drawing2 }
}

function chooseCandidate(id: string) {
  candidateChoice.value = id
  const entry = familyCandidates.value.find(option => option.id === id)
  if (entry) Object.assign(chainDraft, candidateParams(entry))
}

function firstPartSummary(entry: typeof catalog[number]) {
  const part = entry.parts.find(row => /铝包带|护线条/.test(row.name)) || entry.parts[0]
  return part ? `${part.name} · ${part.model}` : '子件信息待补充'
}

watch(() => props.itemId, () => {
  zoomOpen.value = false
  zoomScale.value = 1
  reason.value = ''
  compareOpen.value = false
  // 串参数以当前货物项自身取值为准：它在「资料解析」阶段已由总库匹配结果写入，缺失时才回落到当前串。
  candidateChoice.value = item.value?.selected && familyCandidates.value.some(entry => entry.id === item.value?.selected)
    ? item.value.selected
    : familyCandidates.value.length === 1 ? familyCandidates.value[0].id : ''
  const selected = familyCandidates.value.find(entry => entry.id === candidateChoice.value)
  const selectedParams = selected ? candidateParams(selected) : null
  for (const field of chainFields) chainDraft[field.key] = item.value?.[field.key] || selectedParams?.[field.key] || ''
  itemDraft.name = item.value?.name || ''
  itemDraft.quantity = item.value?.quantity || 0
  itemDraft.unit = item.value?.unit || ''
  itemDraft.conductor = item.value?.conductor || ''
  itemDraft.voltage = item.value?.voltage || ''
  itemDraft.spec = item.value?.spec || ''
  itemDraft.model = item.value?.model || ''
  for (const field of salesGoodsFields) goodsDraft[field] = item.value?.goodsList?.[field] || ''
}, { immediate: true })

watch(zoomOpen, open => { document.body.style.overflow = open ? 'hidden' : '' })
onBeforeUnmount(() => { document.body.style.overflow = '' })

function save() {
  if (!item.value || !canEdit.value) return
  if (!reason.value.trim()) { toast('请填写修改原因'); return }
  if (!chainDirty.value && candidateChoice.value === (item.value.selected || '')) { toast('串信息没有改动'); return }
  const params: Record<string, string> = {}
  for (const field of chainFields) params[field.key] = (chainDraft[field.key] || '').trim()
  // 保存只改串信息：子件编辑不在这里，交由总库按新参数重新匹配。
  if (!act('editChainParams', { id: item.value.id, params, candidateId: candidateChoice.value || undefined, reason: reason.value })) return
  toast('串信息及选型已保存，V' + pkg.version + ' 需技术重新确认')
  emit('close')
}
function saveItem() {
  if (!item.value || !canEdit.value) return
  if (!reason.value.trim()) { toast('请填写修改原因'); return }
  const payload: Record<string, unknown> = { id: item.value.id, ...itemDraft, reason: reason.value, goodsList: { ...goodsDraft } }
  if (!act('editItem', payload)) return
  toast('货物项已更新，销售和技术需重新确认')
  emit('close')
}
function confirmSingle() {
  if (!item.value || !canEdit.value) return
  if (!reason.value.trim()) { toast('请填写单件物料确认依据'); return }
  if (!act('confirmSingle', { id: item.value.id, reason: reason.value })) return
  emit('close')
}
// 指派：把这条串尚未补齐的待确认条目交给指定人员，沿用原来的「先选角色再选人员」流程。
function saveAssign() {
  if (!item.value || !canEdit.value) return
  if (!act('assign', { id: item.value.id, assignee: assignForm.assignee })) return
  toast('已指派给 ' + assignForm.assignee + '，该条进入对方待确认清单')
  assignOpen.value = false
}
</script>

<template>
  <section v-if="item" class="technical-panel" :aria-label="isSales ? '解析信息与来源' : isChain ? '串信息与来源' : '货物项信息与来源'">
    <header class="technical-panel-head">
      <div>
        <h2>{{ isSales ? '解析信息与来源' : isChain ? '串信息与来源' : '货物项信息与来源' }} · 货物项 {{ item.id }}</h2>
        <p>{{ item.name }} · {{ candidate?.name || item.model || item.spec || '尚无串型结果' }}</p>
      </div>
      <Button variant="outline" size="sm" @click="emit('close')">关闭<AppIcon name="x" :size="15"/></Button>
    </header>

    <div class="technical-panel-grid">
      <section class="technical-panel-main">
        <section v-if="!isSales && isChain" class="panel-block panel-candidate-block">
          <h3>{{ familyCandidates.length === 1 ? '串型匹配结果' : '串型候选' }}<small>来自 U9 汇总表{{ familyCandidates.length > 1 ? ' · ' + familyCandidates.length + ' 条' : '' }}</small></h3>
          <div v-if="familyCandidates.length > 1" class="candidate-picker">
            <label for="chain-candidate">选择候选串</label>
            <select id="chain-candidate" :value="candidateChoice" :disabled="!canChooseCandidate" @change="chooseCandidate(($event.target as HTMLSelectElement).value)">
              <option value="">请选择候选串</option>
              <option v-for="option in familyCandidates" :key="option.id" :value="option.id">
                {{ option.model || option.name }} · {{ option.description.split(',')[0] || '导线待补' }} · {{ option.parts.length }} 项子件
              </option>
            </select>
            <Button v-if="familyCandidates.length > 1" variant="outline" size="sm" @click="compareOpen = true">查看候选对比</Button>
          </div>
          <div v-if="selectedCandidate" class="candidate-preview" :class="{ 'candidate-pending': !item.selected || needsCandidateRecheck }">
            <div><b>{{ selectedCandidate.model || selectedCandidate.name }}</b><span>{{ selectedCandidate.name.match(/^(\d+(?:\.\d+)?kV)/i)?.[1] || '电压待确认' }} · 导线 {{ selectedCandidate.description.split(',')[0] || '待补充' }}</span></div>
            <p>主要子件：{{ firstPartSummary(selectedCandidate) }}</p>
            <small v-if="!item.selected || needsCandidateRecheck">候选尚未保存到本货物项；请核对并保存串信息。</small><small v-else-if="familyCandidates.length > 1">选择后已同步到右侧串信息草稿；填写修改依据并保存串信息后生效。</small>
          </div>
          <p v-else-if="!familyCandidates.length" class="candidate-empty">当前型号、电压和已知导线没有匹配记录，请核对串型号、技术规范编码和来源资料。</p>
          <p v-if="needsCandidateRecheck" class="candidate-warning">当前已匹配串与已确认的电压等级或导线型号不一致，已从候选中排除；请重新选择并核对。</p>
          <p v-else-if="familyCandidates.length > 1 && !selectedCandidate" class="candidate-empty">请选择候选串。选择后，导线型号会同步填入右侧“适用导线”。</p>
        </section>
        <figure class="panel-shot">
          <div class="panel-shot-frame" role="button" tabindex="0" aria-label="放大查看串来源图片" @click="zoomOpen = true" @keydown.enter="zoomOpen = true">
            <img :src="'/source-goods-' + item.id + '.png'" :alt="'货物清单第 ' + (item.goodsRow ?? '—') + ' 行原文截图'"/>
          </div>
          <figcaption>来源提示：高亮取自《{{ goodsSourceSheet.file }}》的“{{ goodsSourceSheet.sheet }}”工作表，第 {{ item.goodsRow ?? '—' }} 行；点击图片可放大查看。</figcaption>
        </figure>
      </section>

      <aside class="technical-panel-side">
        <template v-if="isSales">
          <div class="panel-block">
            <h3>销售核对信息<small>核对解析结果，可修改货物项和清单字段</small></h3>
            <div class="panel-chain-form item-edit-form">
              <label><span>货物名称</span><Input v-model="itemDraft.name" :disabled="!canEdit" /></label>
              <label><span>数量</span><Input v-model.number="itemDraft.quantity" type="number" min="1" :disabled="!canEdit" /></label>
              <label><span>单位</span><Input v-model="itemDraft.unit" :disabled="!canEdit" /></label>
              <label :class="{ 'field-missing': isChain && serialFieldMissing('conductor') }"><span>导线型号<small v-if="isChain && serialFieldMissing('conductor')">待补充</small></span><Input v-model="itemDraft.conductor" :class="{ 'missing-field': isChain && serialFieldMissing('conductor') }" :disabled="!canEdit" /></label>
              <label :class="{ 'field-missing': isChain && serialFieldMissing('voltage') }"><span>电压等级<small v-if="isChain && serialFieldMissing('voltage')">待补充</small></span><Input v-model="itemDraft.voltage" :class="{ 'missing-field': isChain && serialFieldMissing('voltage') }" :disabled="!canEdit" /></label>
              <label><span>技术规范编码</span><Input v-model="itemDraft.spec" :disabled="!canEdit" /></label>
              <label :class="{ 'field-missing': isChain && serialFieldMissing('model') }"><span>{{ isChain ? '串型号' : '物料型号' }}<small v-if="isChain && serialFieldMissing('model')">待补充</small></span><Input v-model="itemDraft.model" :class="{ 'missing-field': isChain && serialFieldMissing('model') }" :disabled="!canEdit" /></label>
            </div>
          </div>
          <div class="panel-block">
            <h3>物料清单解析字段<small>包名称、分包编号由项目包信息维护</small></h3>
            <div class="panel-chain-form item-edit-form">
              <label v-for="field in salesGoodsFields" :key="field"><span>{{ field }}</span><Input v-model="goodsDraft[field]" :disabled="!canEdit" /></label>
            </div>
          </div>
          <label class="panel-reason">修改原因与依据<Textarea v-model="reason" :disabled="!canEdit" placeholder="说明客户需求变更或解析结果修正依据" /></label>
          <div class="panel-side-actions"><Button variant="outline" @click="emit('close')">取消</Button><Button :disabled="!canEdit" @click="saveItem">保存核对信息</Button></div>
          <p v-if="!canEdit" class="panel-hint">当前角色或阶段不可修改核对信息，仅可查看。</p>
          <div v-if="changes.length" class="panel-block">
            <h3>修改记录<small>共 {{ changes.length }} 条</small></h3>
            <ol class="panel-changes">
              <li v-for="change in changes" :key="change.id">
                <div class="panel-change-head"><b>{{ change.actor }}</b><small>{{ change.role }} · {{ change.at }}</small></div>
                <p>{{ change.reason }}</p>
                <ul><li v-for="(detail, n) in change.changes" :key="n">{{ detail.label }}：{{ detail.before ?? '空' }} → {{ detail.after || '空' }}</li></ul>
              </li>
            </ol>
          </div>
        </template>
        <template v-else-if="isChain">
        <div class="panel-block">
          <h3>修改串信息<small>保存后按新参数重新匹配总库</small></h3>
          <div class="panel-chain-form">
            <label v-for="field in visibleChainFields" :key="field.key" :class="{ 'field-missing': serialFieldMissing(field.key) }"><span>{{ field.label }}<small>{{ serialFieldMissing(field.key) ? '待补充' : field.hint }}</small></span><Input v-model="chainDraft[field.key]" :class="{ 'missing-field': serialFieldMissing(field.key) }" :disabled="!canEdit" :placeholder="'填写' + field.label"/></label>
          </div>
        </div>
        <label class="panel-reason">修改原因与依据<Textarea v-model="reason" :disabled="!canEdit" placeholder="说明客户变更、图册依据或技术复核结论"/></label>
        <div class="panel-side-actions"><Button class="panel-assign" variant="outline" :disabled="!canEdit" @click="assignOpen = true"><AppIcon name="user-switch" :size="15"/>指派</Button><Button variant="outline" @click="emit('close')">取消</Button><Button :disabled="!canEdit" @click="save">保存串信息</Button></div>
        <p v-if="!canEdit" class="panel-hint">当前角色或阶段不可修改串信息，仅可查看。</p>

        <div v-if="changes.length" class="panel-block">
          <h3>修改记录<small>共 {{ changes.length }} 条</small></h3>
          <ol class="panel-changes">
            <li v-for="change in changes" :key="change.id">
              <div class="panel-change-head"><b>{{ change.actor }}</b><small>{{ change.role }} · {{ change.at }}</small></div>
              <p>{{ change.reason }}</p>
              <ul><li v-for="(detail, n) in change.changes" :key="n">{{ detail.label }}：{{ detail.before ?? '空' }} → {{ detail.after || '空' }}</li></ul>
            </li>
          </ol>
        </div>
        </template>
        <template v-else>
          <div class="panel-block">
            <h3>编辑货物项<small>独立物资无需串型匹配</small></h3>
            <div class="panel-chain-form item-edit-form">
              <label><span>货物名称</span><Input v-model="itemDraft.name" :disabled="!canEdit" /></label>
              <label><span>数量</span><Input v-model.number="itemDraft.quantity" type="number" min="1" :disabled="!canEdit" /></label>
              <label><span>单位</span><Input v-model="itemDraft.unit" :disabled="!canEdit" /></label>
              <label><span>导线型号</span><Input v-model="itemDraft.conductor" :disabled="!canEdit" /></label>
              <label><span>电压等级</span><Input v-model="itemDraft.voltage" :disabled="!canEdit" /></label>
              <label><span>技术规范编码</span><Input v-model="itemDraft.spec" :disabled="!canEdit" /></label>
              <label><span>物料型号</span><Input v-model="itemDraft.model" :disabled="!canEdit" /></label>
            </div>
          </div>
          <label class="panel-reason">修改原因与依据<Textarea v-model="reason" :disabled="!canEdit" placeholder="说明客户变更、物料依据或技术复核结论" /></label>
          <div class="panel-side-actions"><Button variant="outline" @click="emit('close')">取消</Button><Button variant="outline" :disabled="!canEdit" @click="confirmSingle">确认单件物料</Button><Button :disabled="!canEdit" @click="saveItem">保存货物项</Button></div>
          <p v-if="!canEdit" class="panel-hint">当前角色或阶段不可修改货物项，仅可查看。</p>
        </template>
      </aside>
    </div>

    <FormDialog v-model="compareOpen" title="候选串对比" description="候选来自 U9 汇总表。选择某一列后，候选参数会填入右侧串信息草稿；保存串信息后生效。" wide>
      <div class="candidate-compare-wrap">
        <table class="candidate-compare-table">
          <thead><tr><th>对比项目</th><th v-for="entry in compareCandidates" :key="entry.id" :class="{chosen: entry.id === candidateChoice}">{{ entry.model || entry.name }}<small>{{ entry.name.match(/^(\d+(?:\.\d+)?kV)/i)?.[1] || '电压待补' }}</small></th></tr></thead>
          <tbody>
            <tr><th>适用导线</th><td v-for="entry in compareCandidates" :key="entry.id">{{ entry.description.split(',')[0] || '待补充' }}</td></tr>
            <tr><th>配套首件</th><td v-for="entry in compareCandidates" :key="entry.id">{{ firstPartSummary(entry) }}</td></tr>
            <tr><th>子件数量</th><td v-for="entry in compareCandidates" :key="entry.id">{{ entry.parts.length }} 项</td></tr>
            <tr><th>数据来源</th><td v-for="entry in compareCandidates" :key="entry.id">{{ entry.sheet }} · 第 {{ entry.row }} 行</td></tr>
          </tbody>
        </table>
        <div class="candidate-compare-actions"><Button v-for="entry in compareCandidates" :key="entry.id" :variant="entry.id === candidateChoice ? 'default' : 'outline'" size="sm" :disabled="!canChooseCandidate" @click="chooseCandidate(entry.id); compareOpen = false">选择 {{ entry.model || entry.id }}</Button></div>
      </div>
    </FormDialog>

    <!-- 来源图预览：可滚动查看完整图片，只能通过关闭按钮或 Esc 退出。 -->
    <Teleport to="body">
      <div v-if="zoomOpen" class="technical-zoom" aria-label="来源图片放大预览" @wheel.stop @touchmove.stop>
        <div class="technical-zoom-tools"><Button variant="outline" size="sm" @click="zoomScale = Math.max(.5, zoomScale - .25)">−</Button><Button variant="outline" size="sm" @click="zoomScale = 1">还原</Button><Button variant="outline" size="sm" @click="zoomScale = Math.min(3, zoomScale + .25)">＋</Button><Button variant="outline" size="sm" @click="zoomOpen = false">关闭<AppIcon name="x" :size="15"/></Button></div>
        <img :style="{ width: `${zoomScale * 100}%`, maxWidth: 'none' }" :src="'/source-goods-' + item.id + '.png'" :alt="'货物清单第 ' + (item.goodsRow ?? '—') + ' 行原文截图（放大）'"/>
      </div>
    </Teleport>

    <FormDialog v-model="assignOpen" layer="nested" title="指派待确认条目">
      <label>责任角色<AppSelect :model-value="assignForm.owner" label="责任角色" :options="['销售', '技术']" @update:model-value="updateAssignOwner"/></label>
      <label>负责人<AppSelect v-model="assignForm.assignee" label="负责人" :options="assignPeople"/></label>
      <p class="muted">指派后这条串尚未补齐的字段转入对方待确认清单，状态显示为待技术确认。</p>
      <Button :disabled="!canEdit" @click="saveAssign">保存指派</Button>
    </FormDialog>
  </section>
</template>

<style scoped>
.technical-panel{display:flex;flex-direction:column;min-height:0;background:#fff;overflow:hidden}
.technical-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-shrink:0;padding:12px 16px;border-bottom:1px solid #e5ebf0;background:#f7fafc}
.technical-panel-head h2{margin:0;font-size:14px}
.technical-panel-head p{margin:3px 0 0;color:#5c7386;font-size:11px;overflow-wrap:anywhere}
/* 左侧承载资料预览，右侧承载编辑表单；桌面端按 2:1 分配空间。 */
.technical-panel-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);flex:1;min-height:0;align-items:stretch}
.technical-panel-main{display:flex;flex-direction:column;gap:14px;min-width:0;min-height:0;overflow-y:auto;padding:16px;border-right:1px solid #e5ebf0;background:#fbfdfe;overscroll-behavior:contain}
.technical-panel-side{display:flex;flex-direction:column;gap:12px;min-width:0;min-height:0;overflow-y:auto;padding:16px;overscroll-behavior:contain}
.panel-block{flex:0 0 auto;border:1px solid #e1e8ee;border-radius:8px;background:#fff;overflow:hidden}
.panel-block>h3{margin:0;padding:11px 14px;border-bottom:1px solid #e8edf1;font-size:13px}
.panel-block>h3 small{margin-left:8px;color:#788594;font-size:10px;font-weight:400}
.panel-evidence{display:grid;grid-template-columns:100px 1fr;gap:8px 14px;padding:14px;margin:0;font-size:12px}
.panel-evidence dt{color:#8291a0}
.panel-evidence dd{margin:0;overflow-wrap:anywhere}
.panel-evidence dd small{display:block;color:#788594;font-size:11px}
.panel-source-line{margin:0;padding:0 14px 14px;color:#788594;font-size:11px;line-height:1.6;overflow-wrap:anywhere}
.panel-candidate-block{padding-bottom:12px}
.candidate-picker{display:grid;grid-template-columns:auto minmax(180px,1fr) auto;align-items:center;gap:10px;padding:12px 14px 8px}
.candidate-picker label{font-size:11px;color:#5d7286;font-weight:600}
.candidate-picker select{height:34px;min-width:0;padding:0 9px;border:1px solid #ced9e2;border-radius:6px;background:#fff;color:#263849;font-size:11px}
.candidate-picker select:focus-visible{outline:2px solid #0b5b96;outline-offset:1px}
.candidate-preview{margin:0 14px;padding:10px 12px;border:1px solid #dce7ef;border-radius:6px;background:#f7fafc}
.candidate-preview>div{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px}
.candidate-preview b{font-size:12px;color:#153c5a}
.candidate-preview span,.candidate-preview small,.candidate-preview p{font-size:11px;color:#65798b}
.candidate-preview p{margin:6px 0 2px}
.candidate-preview small{display:block;line-height:1.5}
.candidate-empty{margin:4px 14px 0;color:#7a8997;font-size:11px;line-height:1.5}
.candidate-warning{margin:6px 14px 0;padding:7px 9px;border-radius:5px;background:#fff5e5;color:#875713;font-size:11px;line-height:1.5}
.candidate-compare-wrap{max-width:100%;overflow-x:auto}
.candidate-compare-table{width:100%;border-collapse:collapse;font-size:11px}
.candidate-compare-table th,.candidate-compare-table td{min-width:140px;padding:9px 10px;border:1px solid #e1e8ee;text-align:left;vertical-align:top;overflow-wrap:anywhere}
.candidate-compare-table thead th{background:#f4f7f9;color:#30485b}
.candidate-compare-table th:first-child{min-width:100px}
.candidate-compare-table th small{display:block;margin-top:4px;color:#75889a;font-weight:400}
.candidate-compare-table .chosen{background:#eaf4fb}
.candidate-compare-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.panel-shot{margin:0;padding:16px;border:1px solid #e1e8ee;border-radius:8px;background:#fff}
.panel-shot-frame{overflow-x:auto;border:1px solid #e1e8ee;border-radius:6px;background:#fbfdfe;cursor:zoom-in}
.panel-shot-frame:focus-visible{outline:2px solid #064975;outline-offset:2px}
/* 保持原图比例：左栏变宽时同步放大，左栏不足时保留横向查看。 */
.panel-shot-frame img{display:block;width:max(100%,1200px);height:auto}
.panel-shot figcaption{margin-top:8px;color:#788594;font-size:11px;line-height:1.6}
.panel-chain-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:14px}
.panel-chain-form label{display:flex;flex-direction:column;gap:5px;font-size:11px}
.panel-chain-form label>span{display:flex;align-items:baseline;gap:6px;color:#5d7286;font-weight:600}
.panel-chain-form label small{color:#8a98a4;font-size:10px;font-weight:400}
.panel-chain-form label.field-missing>span{color:#8a4b00}
.panel-chain-form label.field-missing small{color:#a15c00;font-weight:600}
.panel-chain-form :deep(input.missing-field){border-color:#e5a23b;background:#fff9e8;box-shadow:0 0 0 1px #e5a23b40}
.candidate-preview.candidate-pending{border-color:#e5a23b;background:#fff9e8}
.panel-chain-form input{height:34px;padding:6px 8px;font-size:11px}
.item-edit-form{grid-template-columns:repeat(2,minmax(0,1fr))}
.panel-reason{display:flex;flex-direction:column;gap:5px;font-size:11px;color:#5d7286;font-weight:600}
.panel-reason textarea{min-height:84px;font-weight:400}
.panel-side-actions{display:flex;justify-content:flex-end;gap:10px}
.panel-assign{margin-right:auto}
.panel-hint{margin:0;color:#926420;font-size:11px;line-height:1.6}
.panel-changes{margin:0;padding:0;list-style:none;max-height:190px;overflow-y:auto;overscroll-behavior:contain}
.panel-changes>li{padding:11px 14px;border-bottom:1px solid #e8edf1}
.panel-changes>li:last-child{border-bottom:0}
.panel-change-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
.panel-change-head b{font-size:11px}
.panel-change-head small{color:#8a98a4;font-size:10px;white-space:nowrap}
.panel-changes p{margin:5px 0 0;color:#6c7989;font-size:11px;line-height:1.6;overflow-wrap:anywhere}
.panel-changes ul{margin:6px 0 0;padding-left:16px;color:#5d7286;font-size:10px;line-height:1.7}
.technical-zoom{position:fixed;inset:0;z-index:100;display:flex;align-items:flex-start;justify-content:center;overflow:auto;overscroll-behavior:contain;touch-action:pan-y;pointer-events:auto;padding:70px 24px 24px;background:#000000e6}
.technical-zoom img{display:block;width:min(1600px,94vw);height:auto;background:#fff}
.technical-zoom-tools{position:fixed;top:18px;right:24px;z-index:1;display:flex;gap:8px}
@media(max-width:900px){.technical-panel{max-height:none}.technical-panel-grid{grid-template-columns:minmax(0,1fr)}.technical-panel-main{border-right:0;border-bottom:1px solid #e5ebf0}.panel-chain-form{grid-template-columns:minmax(0,1fr)}.panel-evidence{grid-template-columns:1fr;gap:4px}.panel-evidence dd{margin-bottom:8px}}
@media(max-width:620px){.candidate-picker{grid-template-columns:1fr}.candidate-picker select{width:100%}}
</style>
