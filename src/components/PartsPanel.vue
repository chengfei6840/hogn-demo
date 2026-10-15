<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, shallowRef, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import AppIcon from './AppIcon.vue'
import FormDialog from './FormDialog.vue'
import StatusBadge from './StatusBadge.vue'
import PartSelectionEditor from './PartSelectionEditor.vue'
import PartReferencePicker from './PartReferencePicker.vue'
import { catalog, useWorkspace } from '@/domain/store'
import { evidenceSources, type EvidenceSourceId } from '@/data/evidenceSources'
import { missingPartFields, technicalDirector, type Part } from '@/domain/model'
import { applyPartOption, eligiblePartOptions, findPartRecommendation, partSelectionIssues, type PartEditDraft } from '@/domain/part-selection'
import { jc1Options } from '@/data/demoPartSelections'
import { referencePartCatalog, type PartReference } from '@/domain/part-reference'

const props = defineProps<{ itemId: string }>()
const emit = defineEmits<{ close: [] }>()
const { package: pkg, project, role, person, act, toast } = useWorkspace()

// 子件与串面板同构：内嵌在流程条下方，打开一个就关另一个。
const zoomOpen = shallowRef(false)
const zoomScale = shallowRef(1)
const editOpen = shallowRef(false)
const editRow = shallowRef<number | null>(null)
const optionId = shallowRef('')
const referenceDraft = shallowRef<PartReference | undefined>(undefined)
const reason = shallowRef('')
const editDraft = reactive({ model: '', qty: '', material: '', u9: '', drawing: '' })
const sourceId = shallowRef<EvidenceSourceId>('requirements')
// public/ 下的静态资源在子路径部署时必须带 base 前缀。
const asset=(file:string)=>`${import.meta.env.BASE_URL}${file}`

const item = computed(() => pkg.items.find(entry => entry.id === props.itemId))
const candidate = computed(() => item.value?.selected ? catalog.find(entry => entry.id === item.value?.selected) || null : null)
// 子件以货物项自身的修改结果为准：没有覆盖记录时回落到当前串的子件分解。
const parts = computed<Part[]>(() => item.value?.partOverrides || candidate.value?.parts || [])
const editingPart = computed(() => parts.value.find(part => part.row === editRow.value) || selectedPart.value)
const editMissingFields = computed(() => editingPart.value ? missingPartFields(editingPart.value) : [])
const selectedSource = computed(() => evidenceSources.find(source => source.id === sourceId.value) || evidenceSources[0])
// 进入面板默认选中第一条子件，右侧表格仍保留当前行高亮。
const selectedPart = shallowRef<Part | null>(null)
const canEdit = computed(() => ['资料整理', '并行协作'].includes(pkg.stage) && (role.value === '销售' || (role.value === '技术' && (person.value === technicalDirector || (pkg.technicalExecution?.mode === 'employee' && pkg.technicalExecution.status === 'assigned' && pkg.technicalExecution.assignee === person.value)))))
const options = computed(() => editingPart.value && item.value ? eligiblePartOptions(editingPart.value,item.value) : [])
const selectedOption = computed(() => options.value.find(option=>option.id===optionId.value))
const resolvedOption = computed(() => {
  const chosen=selectedOption.value
  if(!chosen)return undefined
  return options.value.find(option=>option.model===chosen.model&&option.kind===chosen.kind&&
    (editingPart.value?.selection?.key==='wrapping'||option.id===chosen.id)&&
    (!option.material||option.material===editDraft.material))
})
const recommendation = computed(() => {
  if(!editingPart.value||!item.value)return undefined
  return findPartRecommendation(project.partSelectionHistory??[],editingPart.value,item.value,project)
})
const saveBlocked = computed(() => !canEdit.value || Boolean(editingPart.value?.selection &&
  (!resolvedOption.value||!editDraft.material.trim()||!editDraft.qty.trim()||!Number.isFinite(Number(editDraft.qty))||Number(editDraft.qty)<0)))
const isWrapSource = computed(() => editingPart.value?.selection?.source==='wrap-atlas')
const referenceRecords = computed(() => editingPart.value && item.value ? referencePartCatalog(catalog,pkg.items,{candidateId:item.value.selected,row:editingPart.value.row}) : [])

watch(() => props.itemId, () => {
  zoomOpen.value = false
  zoomScale.value = 1
  editOpen.value = false
  reason.value = ''
  sourceId.value = 'requirements'
  selectedPart.value = parts.value[0] || null
}, { immediate: true })

watch(zoomOpen, open => { document.body.style.overflow = open ? 'hidden' : '' })
onBeforeUnmount(() => { document.body.style.overflow = '' })

// 子件保存后覆盖数组整体换新，按行号重新指向同一条，避免左侧来源停留在旧值。
watch(parts, next => {
  const row = selectedPart.value?.row
  selectedPart.value = next.find(part => part.row === row) || next[0] || null
})

function pick(part: Part) { selectedPart.value = part }
function missingFields(part:Part) { return [...new Set([...missingPartFields(part),...(item.value?partSelectionIssues(part,item.value):[])])] }
function openEdit(part: Part) {
  selectedPart.value = part
  editRow.value = part.row
  optionId.value = part.selection?.selectedOptionId || ''
  referenceDraft.value = part.reference ? {...part.reference} : undefined
  editDraft.model = part.model || ''
  editDraft.qty = part.qty === null || part.qty === undefined ? '' : String(part.qty)
  editDraft.material = part.material || ''
  editDraft.u9 = part.u9 || ''
  editDraft.drawing = part.drawing || ''
  reason.value = ''
  editOpen.value = true
}
function chooseOption(id:string) {
  const option=options.value.find(entry=>entry.id===id)
  if(!option||!canEdit.value)return
  const sameMaterial=options.value.find(entry=>entry.model===option.model&&entry.kind===option.kind&&entry.material===editDraft.material&&
    (editingPart.value?.selection?.key==='wrapping'||entry.id===id))
  optionId.value=sameMaterial?.id||id
  editDraft.model=option.model
  if(option.material&&!sameMaterial)editDraft.material=''
  syncOptionFields()
}
function chooseMaterial(material:string) { if(canEdit.value){editDraft.material=material;syncOptionFields()} }
function syncOptionFields() {
  const option=resolvedOption.value
  if(option)optionId.value=option.id
  editDraft.u9=option?.u9||''
  editDraft.drawing=option?.drawing||''
}
function adoptRecommendation() {
  const option=options.value.find(entry=>entry.id===recommendation.value?.optionId)
  if(!option||!recommendation.value||!canEdit.value)return
  optionId.value=option.id
  editDraft.model=option.model
  editDraft.material=recommendation.value.material
  syncOptionFields()
}
function patchDraft(draft:PartEditDraft) { if(canEdit.value)Object.assign(editDraft,draft) }
function savePart() {
  if (!item.value || editRow.value === null || saveBlocked.value) return
  if (!reason.value.trim()) { toast('请填写修改原因'); return }
  const raw = editDraft.qty.trim()
  const qty = raw === '' ? null : Number(raw)
  if (qty !== null && (!Number.isFinite(qty) || qty < 0)) { toast('用量需填写不小于 0 的数字'); return }
  // updateParts 按整串子件比对留痕，所以提交的是替换掉本行后的完整数组，而不是单行。
  const next = editingPart.value?.selection && resolvedOption.value
    ? applyPartOption(parts.value,editRow.value,resolvedOption.value,editDraft)
    : parts.value.map(part => part.row === editRow.value
    ? { ...part, model: editDraft.model.trim(), qty, material: editDraft.material.trim(), u9: editDraft.u9.trim(), drawing: editDraft.drawing.trim(), reference:editDraft.u9.trim()?undefined:referenceDraft.value }
    : part)
  if (!act('updateParts', { id: item.value.id, parts: next, reason: reason.value })) return
  editOpen.value = false
}
</script>

<template>
  <section v-if="item" class="parts-panel" aria-label="子件与来源">
    <header class="parts-panel-head">
      <div>
        <h2>子件与来源 · 货物项 {{ item.id }}</h2>
        <p>{{ item.name }} · {{ candidate?.name || item.model || item.spec || '尚无串型结果' }} · 子件 {{ parts.length }} 条</p>
      </div>
      <Button variant="outline" size="sm" @click="emit('close')">关闭<AppIcon name="x" :size="15"/></Button>
    </header>

    <section class="parts-panel-list">
        <div class="panel-block">
          <h3>子件明细<small>共 {{ parts.length }} 条</small></h3>
          <div v-if="parts.length" class="parts-table">
            <table>
              <thead><tr><th>名称</th><th>型号</th><th>用量</th><th>材质</th><th>U9料号</th><th>图号</th><th>状态</th><th>操作</th></tr></thead>
              <tbody><tr v-for="part in parts" :key="part.row" :class="{ picked: selectedPart?.row === part.row, 'missing-info': missingFields(part).length > 0 }" @click="pick(part)">
                <td>{{ part.name }}<small v-if="part.selection" class="part-choice-label">{{ part.selection.key==='wrapping'?'型号 / 材质候选':'同规格多料号' }}</small></td>
                <td>{{ part.model }}</td>
                <td>{{ part.qty ?? '待补充' }} {{ part.unit }}</td>
                <td>{{ part.material || '待补充' }}</td>
                <td class="mono">{{ part.u9 || '无料号（可选）' }}</td>
                <td class="mono">{{ part.drawing || '待补充' }}</td>
                <td><StatusBadge :text="missingFields(part).length ? '缺少信息' : '已解决'" /></td>
                <td class="parts-actions"><Button size="sm" variant="outline" :disabled="!canEdit" @click.stop="openEdit(part)">编辑</Button></td>
              </tr></tbody>
            </table>
          </div>
          <div v-else class="parts-empty"><AppIcon name="files"/><p>当前没有可展示的子件。</p></div>
        </div>
        <p v-if="!canEdit" class="panel-hint">当前角色或阶段不可修改子件，仅可查看。</p>
    </section>

    <!-- 来源图预览：可滚动查看完整图片，只能通过关闭按钮或 Esc 退出。 -->
    <Teleport to="body">
      <div v-if="zoomOpen" class="parts-zoom" aria-label="来源图片放大预览" @wheel.stop @touchmove.stop>
        <div class="parts-zoom-tools"><Button variant="outline" size="sm" @click="zoomScale = Math.max(.5, zoomScale - .25)">−</Button><Button variant="outline" size="sm" @click="zoomScale = 1">还原</Button><Button variant="outline" size="sm" @click="zoomScale = Math.min(3, zoomScale + .25)">＋</Button><Button variant="outline" size="sm" @click="zoomOpen = false">关闭<AppIcon name="x" :size="15"/></Button></div>
        <div class="evidence-image" :style="{ width: `${zoomScale * 100}%`, maxWidth: 'none' }"><img :src="isWrapSource?asset('parts-source-wrap.png'):selectedSource.image" :alt="isWrapSource?'包缠物选型附表（放大）':selectedSource.label + '（放大）'"/><template v-if="isWrapSource"><span class="evidence-highlight wrap-material-highlight" aria-hidden="true"/><span class="wrap-option-highlight" :class="selectedOption?.kind==='护'?'guard-row':selectedOption?.kind==='铝'?'aluminum-row':''" aria-hidden="true"/></template><span v-else class="evidence-highlight" :class="'evidence-highlight-' + selectedSource.highlightClass" aria-hidden="true"/></div>
      </div>
    </Teleport>
  </section>

  <!-- 逐行编辑：只改这一行的子件字段，保存时连同其余子件一起提交，由 updateParts 按行留痕。 -->
  <FormDialog v-model="editOpen" contained portal-to="#workflow-dialog-root" layer="nested" :body-class="editingPart?.selection ? 'part-candidate-body' : undefined" :title="'编辑子件 · '+(editingPart?.name || '')" :description="editingPart?.selection ? '选择型号与材质后，同步更新子件配置。' : '左侧查看本条子件的来源依据，右侧修改字段；保存后本包需技术重新确认。'">
    <div class="parts-edit-layout" :class="{ 'selection-layout': editingPart?.selection }">
      <section class="parts-edit-source">
        <template v-if="editingPart?.selection">
          <label class="evidence-source-select">来源{{ isWrapSource ? '图纸' : '档案' }}<select aria-label="选择子件候选来源"><option>{{ isWrapSource ? '悬垂串组装图 · 导线包缠物' : '料品档案信息 · 参考标准品库 · JC-1' }}</option></select></label>
          <figure v-if="isWrapSource" class="panel-shot choice-source-shot">
            <div class="panel-shot-frame" role="button" tabindex="0" aria-label="放大查看包缠物图纸" @click="zoomOpen=true" @keydown.enter="zoomOpen=true">
              <div class="evidence-image wrap-evidence"><img :src="asset('parts-source-wrap.png')" alt="悬垂串组装零件表及导线包缠物选型附表"/><span class="evidence-highlight wrap-material-highlight" aria-hidden="true"/><span class="wrap-option-highlight" :class="selectedOption?.kind==='护'?'guard-row':selectedOption?.kind==='铝'?'aluminum-row':''" aria-hidden="true"/></div>
            </div>
            <figcaption>220kV 图册组装表第⑦项及附表。高亮当前导线 {{ item?.conductor }} 的可选配置，点击图片可放大。</figcaption>
          </figure>
          <figure v-else class="standard-source">
            <figcaption>料品档案信息-参考标准品库.xlsx · Sheet1</figcaption>
            <table><thead><tr><th>行号</th><th>规格</th><th>描述</th><th>料号 / 图号</th></tr></thead><tbody><tr v-for="(option,index) in jc1Options" :key="option.id" :class="{chosen:optionId===option.id}"><td>{{ 1379+index }}</td><td>{{ option.model }}</td><td>{{ option.detail }}</td><td class="mono">{{ option.u9 }}<small>{{ option.drawing }}</small></td></tr></tbody></table>
            <p>两条规格相同，差别取自档案“描述”列中的螺栓要求；料号和图号分别来自对应列。</p>
          </figure>
          <div class="source-selection-note"><AppIcon name="info" :size="16"/><span>{{ isWrapSource ? '当前导线：'+item?.conductor+'；图纸提供铝包带、护线条两种配置。' : '当前为同规格多料号示例，请根据紧固件要求选择。' }}</span></div>
        </template>
        <template v-else><label class="evidence-source-select">来源图片<select v-model="sourceId" aria-label="选择子件来源图片"><option v-for="source in evidenceSources" :key="source.id" :value="source.id">{{ source.label }}</option></select></label>
        <figure class="panel-shot">
          <div class="panel-shot-frame" role="button" tabindex="0" aria-label="放大查看原始资料截图" @click="zoomOpen = true" @keydown.enter="zoomOpen = true">
            <div class="evidence-image"><img :src="selectedSource.image" :alt="selectedSource.label"/><span class="evidence-highlight" :class="'evidence-highlight-' + selectedSource.highlightClass" aria-hidden="true"/></div>
          </div>
          <figcaption>{{ selectedSource.sourceText }}；高亮区域为本次检索命中位置，点击图片可放大查看。</figcaption>
        </figure></template>
      </section>
      <section class="parts-edit-fields">
        <div class="parts-edit-fields-body">
        <PartSelectionEditor v-if="editingPart?.selection && item" :item="item" :part="editingPart" :options="options" :option-id="optionId" :draft="editDraft" :recommendation="recommendation" :disabled="!canEdit" @choose="chooseOption" @material="chooseMaterial" @adopt="adoptRecommendation" @update:draft="patchDraft"/>
        <div v-else class="parts-edit-form">
          <label :class="{ 'field-missing': editMissingFields.includes('型号') }"><span>型号<small v-if="editMissingFields.includes('型号')">待补充</small></span><Input v-model="editDraft.model" :class="{ 'missing-field': editMissingFields.includes('型号') }" :disabled="!canEdit"/></label>
          <label :class="{ 'field-missing': editMissingFields.includes('用量') }"><span>用量<small v-if="editMissingFields.includes('用量')">待补充</small></span><Input v-model="editDraft.qty" type="number" min="0" :class="{ 'missing-field': editMissingFields.includes('用量') }" :disabled="!canEdit"/></label>
          <label :class="{ 'field-missing': editMissingFields.includes('材质') }"><span>材质<small v-if="editMissingFields.includes('材质')">待补充</small></span><Input v-model="editDraft.material" :class="{ 'missing-field': editMissingFields.includes('材质') }" :disabled="!canEdit"/></label>
          <label class="optional-field"><span>U9料号<small>选填</small></span><Input v-model="editDraft.u9" :disabled="!canEdit" placeholder="无料号可留空"/></label>
          <label :class="{ 'field-missing': editMissingFields.includes('图号') }"><span>图号<small v-if="editMissingFields.includes('图号')">待补充</small></span><Input v-model="editDraft.drawing" :class="{ 'missing-field': editMissingFields.includes('图号') }" :disabled="!canEdit"/></label>
        </div>
        <PartReferencePicker v-if="editingPart && !editingPart.selection && !editDraft.u9.trim()" :part="editingPart" :records="referenceRecords" :selected="referenceDraft" :disabled="!canEdit" @choose="referenceDraft=$event"/>
        <label v-if="!editingPart?.selection" class="parts-edit-reason">修改原因与依据<Textarea v-model="reason" :disabled="!canEdit" placeholder="说明客户变更、图册依据或技术复核结论"/></label>
        <section v-if="editingPart?.technicalChanges?.length" class="part-edit-history">
          <h3>修改记录 · {{ editingPart.model || '型号未填写' }}</h3>
          <ol><li v-for="change in editingPart.technicalChanges" :key="change.id"><div class="part-history-meta"><strong>{{ change.actor }}</strong><span>{{ change.role }} · {{ change.at }}</span></div><p>{{ change.reason }}</p><ul><li v-for="(detail,index) in change.changes" :key="index">{{ detail.label.replace(/^子件\d+\s*/, '') }}：{{ detail.before ?? '空' }} → {{ detail.after ?? '空' }}</li></ul></li></ol>
        </section>
        </div>
        <label v-if="editingPart?.selection" class="parts-edit-reason">修改原因与依据<Textarea v-model="reason" :disabled="!canEdit" placeholder="填写本次选型依据"/></label>
        <div class="parts-edit-actions"><span v-if="editingPart?.selection && saveBlocked && canEdit" class="selection-pending"><AppIcon name="info" :size="14"/>完成型号、材质和用量选择后可保存。</span><Button variant="outline" @click="editOpen = false">取消</Button><Button :disabled="saveBlocked" @click="savePart">保存子件</Button></div>
      </section>
    </div>
  </FormDialog>
</template>

<style scoped>
.parts-panel{display:flex;flex-direction:column;min-height:0;background:#fff;overflow:hidden}
.parts-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-shrink:0;padding:12px 16px;border-bottom:1px solid #e5ebf0;background:#f7fafc}
.parts-panel-head h2{margin:0;font-size:14px}
.parts-panel-head p{margin:3px 0 0;color:#5c7386;font-size:11px;overflow-wrap:anywhere}
/* 左右各半：右栏要放七列，2:1 会把子件表压到只能横向滚。 */
.parts-panel-list{display:flex;flex-direction:column;gap:12px;min-width:0;min-height:0;overflow-y:auto;padding:16px;overscroll-behavior:contain}
.panel-block{flex:0 0 auto;border:1px solid #e1e8ee;border-radius:8px;background:#fff;overflow:hidden}
.panel-block>h3{margin:0;padding:11px 14px;border-bottom:1px solid #e8edf1;font-size:13px}
.panel-block>h3 small{margin-left:8px;color:#788594;font-size:10px;font-weight:400}
.evidence-source-select{display:flex;flex-direction:column;gap:6px;margin:0;font-size:11px;color:#5d7286;font-weight:600}
.evidence-source-select select{width:100%;height:36px;padding:6px 9px;font-size:11px}
.panel-evidence{display:grid;grid-template-columns:92px 1fr;gap:8px 14px;padding:14px;margin:0;font-size:12px}
.panel-evidence dt{color:#8291a0}
.panel-evidence dd{margin:0;overflow-wrap:anywhere}
.panel-evidence dd small{display:block;color:#788594;font-size:11px}
.panel-shot{margin:0;padding:16px;border:1px solid #e1e8ee;border-radius:8px;background:#fff}
.panel-shot-frame{overflow-x:auto;border:1px solid #e1e8ee;border-radius:6px;background:#fbfdfe;cursor:zoom-in}
.panel-shot-frame:focus-visible{outline:2px solid #064975;outline-offset:2px}
.evidence-image{position:relative;width:max(100%,1200px);line-height:0}
.evidence-image img{display:block;width:100%;height:auto}
.evidence-highlight{position:absolute;border:3px solid #f59e0b;background:#fbbf2430;border-radius:4px;box-shadow:0 0 0 1px #fff8;pointer-events:none}
.evidence-highlight-requirements{left:14%;top:18%;width:74%;height:39%}
.evidence-highlight-atlas{left:52%;top:27%;width:41%;height:41%}
.panel-shot figcaption{margin-top:8px;color:#788594;font-size:11px;line-height:1.6}
.panel-hint{margin:0;color:#926420;font-size:11px;line-height:1.6}
.parts-table{overflow:auto}
.parts-table table{width:100%;min-width:720px;border-collapse:collapse}
.parts-table th,.parts-table td{padding:10px 10px;text-align:left;font-size:11px;border-bottom:1px solid #e8edf2;overflow-wrap:anywhere}
.parts-table th{position:sticky;top:0;background:#f7f9fb;color:#788594;z-index:1;white-space:nowrap}
.parts-table tbody tr{cursor:pointer}
.parts-table tbody tr:hover{background:#f7fafc}
.parts-table tbody tr.picked{background:#edf5fb}
.parts-table tbody tr.missing-info{background:#fff7d6}
.parts-table tbody tr.missing-info.picked{background:#ffefb8}
.part-edit-history{margin-top:16px;padding:12px 14px;border:1px solid #e1e8ee;border-radius:8px;background:#f7fafc;color:#526a7e}
.part-edit-history h3{margin:0;font-size:12px}
.part-edit-history ol{margin:7px 0 0;padding:0;list-style:none}
.part-edit-history ol>li{padding:7px 0;border-top:1px solid #e5ebf0}
.part-history-meta{display:flex;justify-content:space-between;gap:10px;font-size:10px}
.part-history-meta span{color:#8291a0}
.part-edit-history p{margin:4px 0;color:#788594;font-size:10px}
.part-edit-history ul{margin:3px 0 0;padding-left:16px;font-size:10px;line-height:1.6}
.parts-actions{white-space:nowrap}
.parts-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;min-height:150px;color:#788594;font-size:12px}
.parts-zoom{position:fixed;inset:0;z-index:100;display:flex;align-items:flex-start;justify-content:center;overflow:auto;overscroll-behavior:contain;touch-action:pan-y;pointer-events:auto;padding:70px 24px 24px;background:#000000e6}
.parts-zoom .evidence-image{width:min(1600px,94vw);background:#fff}
.parts-zoom-tools{position:fixed;top:18px;right:24px;z-index:1;display:flex;gap:8px}
.parts-edit-layout{display:grid;grid-template-columns:minmax(0,2fr) minmax(360px,1fr);gap:18px;min-height:0}
.parts-edit-source{min-width:0;padding-right:18px;border-right:1px solid #e5ebf0}
.parts-edit-fields{min-width:0;display:flex;flex-direction:column}
.parts-edit-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.parts-edit-form label{display:flex;flex-direction:column;gap:6px;font-size:12px}
.parts-edit-form label>span{display:flex;justify-content:space-between;gap:8px}
.parts-edit-form label>span small{color:#a15c00;font-size:10px;font-weight:600}
.parts-edit-form .optional-field>span small{color:#506d84;font-weight:400}
.parts-edit-form label.field-missing{color:#8a4b00}
.parts-edit-form :deep(input.missing-field){border-color:#e5a23b;background:#fff9e8;box-shadow:0 0 0 1px #e5a23b40}
.parts-edit-reason{display:flex;flex-direction:column;gap:6px;margin-top:14px;font-size:12px}
.parts-edit-reason textarea{min-height:78px}
.parts-edit-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:16px}
.part-choice-label{display:block;margin-top:4px;color:#155b8d;font-size:10px}
.selection-layout{grid-template-columns:minmax(0,1.4fr) minmax(380px,1fr);gap:24px;height:100%;width:100%}
:global(.part-candidate-body){display:flex;flex:1;overflow:hidden}
.selection-layout .parts-edit-source{padding-right:8px;border-right:0;overflow-y:auto;min-height:0}
.selection-layout .parts-edit-fields{min-height:0}
.selection-layout .parts-edit-fields-body{overflow-y:auto;min-height:0;flex:1;padding-right:8px}
.selection-layout .parts-edit-reason{margin:12px 0 0}
.selection-layout .parts-edit-reason textarea{min-height:64px;height:64px}
.selection-layout .parts-edit-actions{padding-top:12px;border-top:1px solid #e1e8ee;margin-top:12px}
.choice-source-shot{padding:12px;margin-top:10px}.choice-source-shot .evidence-image{width:100%}
.wrap-material-highlight{left:14%;top:50.9%;width:70.9%;height:3.4%;border-width:2px;border-radius:0}
.wrap-option-highlight{position:absolute;left:14%;top:85.1%;width:70.9%;height:6.7%;border:2px solid #347db3;background:#64b6f326;pointer-events:none}.wrap-option-highlight.guard-row{top:88.4%;height:3.4%}.wrap-option-highlight.aluminum-row{height:3.3%}
.source-selection-note{display:flex;align-items:flex-start;gap:7px;padding:12px;margin-top:12px;border-radius:5px;background:#eaf4fc;color:#21577f;font-size:12px;line-height:1.6}.source-selection-note svg{flex-shrink:0;margin-top:2px}
.standard-source{margin:10px 0 0;padding:16px;border:1px solid #dce6ee;border-radius:6px;overflow:auto}.standard-source figcaption{margin-bottom:14px;font-size:13px;font-weight:600}.standard-source table{width:100%;border-collapse:collapse;font-size:12px}.standard-source th,.standard-source td{padding:12px 8px;text-align:left;border-bottom:1px solid #dce6ee;vertical-align:top}.standard-source th{color:#516b80;background:#f5f8fb}.standard-source tr.chosen{background:#eaf4fc}.standard-source small{display:block;margin-top:8px}.standard-source p{margin:14px 0 0;color:#536e82;font-size:12px;line-height:1.7}
.selection-pending{display:flex;align-items:center;gap:5px;margin-right:auto;color:#586f83;font-size:11px}.selection-pending svg{flex-shrink:0}.selection-layout .parts-edit-actions{flex-wrap:wrap}
@media(max-width:900px){.parts-panel{max-height:none}.panel-evidence{grid-template-columns:1fr;gap:4px}.panel-evidence dd{margin-bottom:8px}.parts-edit-layout{grid-template-columns:minmax(0,1fr)}.parts-edit-source{padding-right:0;border-right:0;border-bottom:1px solid #e5ebf0;padding-bottom:14px}.parts-edit-form{grid-template-columns:minmax(0,1fr)}}
@media(max-width:900px){:global(.part-candidate-body){display:block;overflow-y:auto}.selection-layout{height:auto}.selection-layout .parts-edit-fields-body,.selection-layout .parts-edit-source{overflow:visible}.selection-layout .parts-edit-actions{position:sticky;bottom:-2px;background:#fff;padding-bottom:4px}}
</style>
