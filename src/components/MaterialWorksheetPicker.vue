<script setup lang="ts">
import type { MaterialPackageSummary } from '@/domain/model'
import type { MaterialWorksheetInfo, MaterialWorksheetParseResult } from '@/domain/material-list'
import { computed, shallowRef } from 'vue'
import { Button } from '@/components/ui/button'
import AppIcon from './AppIcon.vue'

const props = defineProps<{
  fileName: string
  fileSize: number
  worksheets: MaterialWorksheetInfo[]
  selectedIds: string[]
  results: MaterialWorksheetParseResult[]
  summaries: MaterialPackageSummary[]
  activeWorksheetId: string
  activeWorksheetIndex: number
  parseTotal: number
  loading: boolean
  parsing: boolean
  selectionChanged: boolean
  error: string
}>()
const emit = defineEmits<{
  fileSelected: [file: File]
  chooseDemo: []
  removeFile: []
  toggleWorksheet: [id: string, event: Event]
  selectAll: []
  clearSelection: []
  parse: []
}>()
const fileInput=shallowRef<HTMLInputElement|null>(null)
const resultsByWorksheet = computed(() => new Map(props.results.map(result => [result.worksheet.id, result])))
const worksheetRows = computed(() => props.worksheets.map(sheet => {
  const result = resultsByWorksheet.value.get(sheet.id)
  const selected = props.selectedIds.includes(sheet.id)
  const isActive = props.activeWorksheetId === sheet.id && props.parsing
  const isWaiting = props.parsing && selected && !result && !isActive
  const status = !selected ? 'unselected' : isActive ? 'parsing' : isWaiting ? 'waiting' : result ? result.summaries.length ? 'complete' : 'error' : 'ready'
  return { sheet, result, status }
}))
function onFileSelected(event:Event){const input=event.target as HTMLInputElement;const file=input.files?.[0];input.value='';if(file)emit('fileSelected',file)}
function sizeLabel(bytes:number){return bytes<1024?`${bytes} B`:bytes<1048576?`${(bytes/1024).toFixed(1)} KB`:`${(bytes/1048576).toFixed(1)} MB`}
</script>

<template>
  <section class="material-worksheet-picker" aria-label="物料清单工作表解析" :aria-busy="parsing">
    <input ref="fileInput" class="sr-only" type="file" accept=".xlsx" aria-label="选择物料清单 Excel" :disabled="loading||parsing" @change="onFileSelected">
    <div class="picker-actions">
      <Button type="button" variant="outline" :disabled="loading || parsing" @click="fileInput?.click()"><AppIcon :name="loading?'spinner-gap':'folder-simple-plus'" :class="{'parse-spinner':loading}"/>{{loading?'正在读取工作表':'选择物料清单'}}</Button>
      <Button type="button" variant="outline" :disabled="loading || parsing" @click="emit('chooseDemo')"><AppIcon name="file-text"/>载入演示文档</Button>
    </div>
    <p v-if="error" class="picker-error" role="alert">{{error}}</p>
    <template v-if="fileName">
      <div class="picker-file"><AppIcon name="file-text"/><span>{{fileName}} · {{sizeLabel(fileSize)}}</span><Button type="button" variant="ghost" size="sm" :disabled="loading || parsing" @click="emit('removeFile')">移除</Button></div>
      <template v-if="worksheets.length">
        <div class="picker-heading"><div><b>识别到 {{worksheets.length}} 个工作表</b><p>选择需要纳入本项目报价的内容。默认勾选可见工作表。</p></div><div><Button type="button" variant="ghost" size="sm" :disabled="loading || parsing" @click="emit('selectAll')">全选</Button><Button type="button" variant="ghost" size="sm" :disabled="loading || parsing" @click="emit('clearSelection')">取消全选</Button></div></div>
        <ul class="worksheet-options">
          <li v-for="row in worksheetRows" :key="row.sheet.id" :class="{'worksheet-disabled':loading || parsing,'worksheet-active':row.status==='parsing'}">
            <label><input type="checkbox" :checked="selectedIds.includes(row.sheet.id)" :disabled="loading || parsing" @change="emit('toggleWorksheet',row.sheet.id,$event)"><span class="worksheet-name" :title="row.sheet.name">{{row.sheet.name}}</span><small v-if="row.sheet.state!=='visible'">隐藏</small></label>
            <span v-if="row.status==='parsing'" class="worksheet-status worksheet-running" role="status"><AppIcon name="spinner-gap" :size="14" class="parse-spinner"/>解析中</span>
            <span v-else-if="row.status==='waiting'" class="worksheet-status worksheet-hint">等待解析</span>
            <span v-else-if="row.status==='unselected'" class="worksheet-status worksheet-hint">未选择</span>
            <span v-else-if="row.status==='complete'" class="worksheet-status worksheet-success"><AppIcon name="check" :size="14"/>{{row.result?.summaries.length}} 个报价包</span>
            <span v-else-if="row.status==='error'" class="worksheet-status worksheet-error" :title="row.result?.error"><AppIcon name="warning-circle" :size="14"/>未识别到报价包</span>
            <span v-else class="worksheet-status worksheet-hint">待解析</span>
          </li>
        </ul>
        <p v-if="parsing" class="worksheet-progress" role="status" aria-live="polite">正在解析第 {{activeWorksheetIndex}} / {{parseTotal}} 个工作表：{{worksheets.find(sheet=>sheet.id===activeWorksheetId)?.name}} · 已完成 {{results.length}} / {{parseTotal}}</p>
        <p v-if="selectionChanged" class="picker-error" role="status">工作表选择已更改，请重新解析。</p>
        <p v-else-if="!selectedIds.length" class="picker-error" role="status">请至少选择一个工作表。</p>
        <div class="picker-parse"><span>已选择 {{selectedIds.length}} / {{worksheets.length}} 个工作表</span><Button type="button" :disabled="!selectedIds.length || parsing || loading" @click="emit('parse')"><AppIcon :name="parsing?'spinner-gap':'play'" :class="{'parse-spinner':parsing}"/>{{parsing?`正在解析（${activeWorksheetIndex}/${parseTotal}）`:'解析所选工作表'}}</Button></div>
        <div v-if="results.length&&!parsing" class="worksheet-results" aria-live="polite"><div v-for="result in results" :key="result.worksheet.id"><b>{{result.worksheet.name}}：{{result.summaries.length}} 个报价包</b><span v-if="result.error">{{result.error}}</span><span v-else>{{result.summaries.slice(0,5).map(summary=>summary.packageName+(summary.packageNo?' · '+summary.packageNo:'')).join('、')}}<template v-if="result.summaries.length>5">，还有 {{result.summaries.length-5}} 个包</template></span></div></div>
      </template>
    </template>
  </section>
</template>

<style scoped>
.material-worksheet-picker{grid-column:1/-1;padding:16px;border:1px solid #dce6ed;border-radius:8px;background:#fff}
.picker-actions,.picker-file,.picker-heading,.picker-parse{display:flex;align-items:center;justify-content:space-between;gap:10px}
.picker-actions{justify-content:flex-start}.picker-file{margin-top:12px;color:#43576a;font-size:12px}.picker-file span{flex:1;overflow-wrap:anywhere}
.picker-heading{margin:14px 0 9px}.picker-heading p{margin:4px 0 0;color:#65788a;font-size:12px}.worksheet-options{max-height:220px;overflow:auto;margin:0;padding:0;list-style:none;border:1px solid #e3eaf0;border-radius:6px}
.worksheet-options li{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 12px;border-bottom:1px solid #edf1f4;font-size:12px}.worksheet-options li:last-child{border-bottom:0}.worksheet-options li.worksheet-active{background:#f2f8fc}.worksheet-options label{display:flex;align-items:center;gap:9px;min-width:0}.worksheet-options input{accent-color:#075580}.worksheet-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.worksheet-options small{color:#7b8995}.worksheet-status{display:inline-flex;align-items:center;justify-content:flex-end;gap:5px;flex-shrink:0;min-width:88px}.worksheet-hint{color:#788594}.worksheet-success,.worksheet-running{color:#157347}.worksheet-running{color:#064975}.worksheet-error,.picker-error{color:#b42318}.picker-parse{margin-top:10px;color:#65788a;font-size:12px}.worksheet-progress{margin:9px 0 0;color:#064975;font-size:12px}.worksheet-results{display:grid;gap:7px;margin-top:12px}.worksheet-results>div{display:grid;gap:3px;padding:9px 11px;border-radius:6px;background:#f4f8fb;font-size:12px}.worksheet-results span{color:#65788a;overflow-wrap:anywhere}.picker-error{margin:10px 0;font-size:12px}
.parse-spinner{animation:picker-spin 1s linear infinite}@keyframes picker-spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.parse-spinner{animation:none}}
</style>
