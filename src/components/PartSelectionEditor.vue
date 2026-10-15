<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AppIcon from './AppIcon.vue'
import type { Item, Part } from '@/domain/model'
import { chainWrapKind, type PartOption, type PartEditDraft, type PartSelectionHistory } from '@/domain/part-selection'

const props=defineProps<{item:Item;part:Part;options:PartOption[];optionId:string;draft:PartEditDraft;recommendation?:PartSelectionHistory;disabled:boolean}>()
const emit=defineEmits<{choose:[id:string];material:[value:string];adopt:[];'update:draft':[draft:PartEditDraft]}>()
const isWrapping=computed(()=>props.part.selection?.key==='wrapping')
const kind=computed(()=>chainWrapKind(props.item))
const selected=computed(()=>props.options.find(option=>option.id===props.optionId))
const sameModel=(a:PartOption,b:PartOption)=>isWrapping.value?a.model===b.model&&a.kind===b.kind:a.id===b.id
const models=computed(()=>props.options.filter((option,index,all)=>all.findIndex(entry=>sameModel(entry,option))===index))
const materials=computed(()=>[...new Set(props.options.filter(option=>selected.value&&sameModel(selected.value,option)).map(option=>option.material).filter(Boolean))])
const recommendedLabel=computed(()=>props.recommendation?`${props.recommendation.model} · ${props.recommendation.material}`:'')
const patch=(key:keyof PartEditDraft,value:string)=>emit('update:draft',{...props.draft,[key]:value})
</script>

<template>
  <div class="part-choice-editor">
    <div class="choice-context">
      <div><span>适用导线</span><strong>{{ item.conductor || '待确认' }}</strong></div>
      <div><span>{{ isWrapping ? '串型护／铝' : '技术规范编码' }}</span><strong>{{ isWrapping ? (kind==='护'?'护线条':kind==='铝'?'铝包带':'未确定') : (item.spec || item.goodsList?.['技术规范编码'] || '待确认') }}</strong></div>
    </div>

    <fieldset class="model-choices" :disabled="disabled">
      <legend>{{ isWrapping ? '型号候选' : '料号候选' }}<span class="choice-count">{{ models.length }} 个候选</span></legend>
      <label v-for="option in models" :key="option.id" class="model-choice" :class="{chosen:selected && sameModel(selected,option)}">
        <input type="radio" :name="'part-model-'+part.row" :value="option.id" :checked="!!selected && sameModel(selected,option)" @change="emit('choose',option.id)"/>
        <span class="choice-text"><b>{{ option.model }}</b><small>{{ isWrapping ? '关联线夹：'+option.linkedPart?.model : option.detail }}</small><small v-if="!isWrapping" class="mono">U9 {{ option.u9 }} · 图号 {{ option.drawing }}</small></span>
        <span v-if="isWrapping" class="choice-kind">{{ option.detail }}</span>
      </label>
      <p v-if="!models.length" class="choice-empty">当前条件没有匹配的子件候选，请核对串型与来源图纸。</p>
    </fieldset>
    <p class="choice-help">{{ isWrapping ? (kind ? '已按导线 '+item.conductor+' 和串型“'+kind+'”筛选。' : '候选已按导线 '+(item.conductor||'待确认')+' 筛选。') : '型号相同，紧固件版本不同，对应不同 U9 料号。' }}</p>

    <div class="material-field">
      <label :for="'part-material-'+part.row">材质<span v-if="!draft.material" class="pending-chip"><AppIcon name="info" :size="13"/>待确认</span></label>
      <template v-if="isWrapping">
        <select :id="'part-material-'+part.row" :value="draft.material" :disabled="disabled || !selected" @change="emit('material',($event.target as HTMLSelectElement).value)">
          <option value="">请选择材质</option><option v-for="material in materials" :key="material" :value="material">{{ material }}</option>
        </select>
        <div class="material-shortcuts"><button v-for="material in materials" :key="material" type="button" :disabled="disabled" :class="{active:draft.material===material}" @click="emit('material',material)">{{ material }}</button></div>
        <p class="choice-help">图纸材料要求：L3 或 LF10。</p>
      </template>
      <template v-else><Input :id="'part-material-'+part.row" :model-value="draft.material" :disabled="disabled" placeholder="按图纸或技术要求填写材质" @update:model-value="patch('material',String($event))"/><p class="choice-help">标准品档案未单列材质，请人工核验并填写。</p></template>
    </div>

    <div v-if="recommendation" class="history-recommendation">
      <div class="recommendation-heading"><h3>历史推荐<span v-if="recommendation.demo" class="choice-count">示例记录</span></h3><Button size="sm" variant="outline" :disabled="disabled" @click="emit('adopt')">采用推荐</Button></div>
      <b>推荐参考：{{ recommendedLabel }}</b>
      <p>依据：相同技术编码 {{ recommendation.technicalCode }}、相同地区 {{ recommendation.region }} 的已保存子件选择。</p>
      <p>来源：{{ recommendation.projectName }} · {{ recommendation.packageName }} · {{ recommendation.savedAt.slice(0,10) }}</p>
      <div class="recommendation-note"><AppIcon name="info" :size="14"/>采用前核对本次图纸与材质要求。</div>
    </div>
    <p v-else class="choice-help">暂无符合本技术编码、地区和当前串型条件的历史推荐。</p>

    <div class="selection-result-fields">
      <label><span>用量（{{ selected?.unit || part.unit }}）</span><Input :model-value="draft.qty" type="number" min="0" :disabled="disabled" @update:model-value="patch('qty',String($event))"/></label>
      <label><span>U9 料号</span><Input :model-value="draft.u9" readonly placeholder="选定型号与材质后带出"/></label>
      <label class="drawing-result"><span>图号</span><span class="mono">{{ draft.drawing || '选定后带出' }}</span></label>
    </div>
    <p v-if="isWrapping && selected?.linkedPart" class="linked-result"><AppIcon name="arrow-right" :size="15"/>保存时同步更新悬垂线夹：<b>{{ selected.linkedPart.model }}</b></p>
    <p v-if="part.selection?.demo && isWrapping" class="choice-help">本条为交互示例，材质与 U9 料号组合为演示映射。</p>
  </div>
</template>

<style scoped>
.part-choice-editor{display:flex;flex-direction:column;gap:12px;color:#23394c;font-size:12px}
.choice-context{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:15px 18px;background:#eff6fc;border-radius:7px}
.choice-context>div{display:flex;flex-direction:column;gap:4px;min-width:0}.choice-context>div+div{padding-left:20px;border-left:1px solid #cadbe9}
.choice-context span{color:#536b80}.choice-context strong{font-size:15px;overflow-wrap:anywhere}
.model-choices{border:0;padding:0;margin:0;min-width:0}.model-choices legend{margin-bottom:9px;font-size:15px;font-weight:650}
.choice-count{display:inline-block;margin-left:10px;padding:2px 7px;border-radius:4px;background:#e8f2fc;color:#135787;font-size:11px;font-weight:500;vertical-align:middle}
.model-choice{display:flex;align-items:center;gap:12px;padding:10px 14px;margin:0;border:1px solid #c7d8e7;border-bottom-width:0;cursor:pointer;background:#fff}.model-choice:nth-of-type(1){border-radius:6px 6px 0 0}.model-choice:last-of-type{border-bottom-width:1px;border-radius:0 0 6px 6px}.model-choice:only-of-type{border-radius:6px}
.model-choice:hover{background:#f5f9fd}.model-choice.chosen{background:#eef6ff;border-color:#7ab0e5;box-shadow:inset 0 0 0 1px #7ab0e5}.model-choice:has(input:focus-visible){outline:2px solid #075187;outline-offset:2px}.model-choice:has(input:disabled){cursor:not-allowed;opacity:.7}
.model-choice input{width:18px;height:18px;flex-shrink:0;accent-color:#0b5c9b}.choice-text{display:flex;flex:1;flex-direction:column;gap:4px;min-width:0}.choice-text b{font-size:14px}.choice-text small{font-size:11px;color:#546d83;overflow-wrap:anywhere}
.choice-kind{border:1px solid #c5dced;border-radius:4px;padding:3px 7px;white-space:nowrap;background:#e8f3fc;color:#25557a;font-size:11px}
.choice-help{margin:0;color:#5a7185;font-size:11px;line-height:1.65}.model-choices+.choice-help{margin-top:-9px}.choice-empty{padding:12px;background:#fff8e7;color:#865b18}
.material-field>label{display:flex;align-items:center;gap:10px;margin-bottom:8px;font-size:15px;font-weight:650}.material-field select{width:100%;height:36px;padding:5px 9px;border:1px solid #cbd9e5;border-radius:6px;font-size:12px;color:#263f54;background:#fff}.material-field select:focus-visible{outline:2px solid #0b5c9b;outline-offset:2px}.material-field select:disabled{background:#f5f7fa;cursor:not-allowed}
.pending-chip{display:inline-flex;align-items:center;gap:4px;padding:3px 7px;background:#fff3d8;color:#875000;border-radius:4px;font-size:11px;font-weight:500}
.material-shortcuts{display:flex;gap:8px;margin:8px 0}.material-shortcuts button{min-width:72px;padding:5px 14px;border:1px solid #d2dfea;border-radius:4px;background:#fff;color:#283d50;cursor:pointer}.material-shortcuts button:hover:not(:disabled),.material-shortcuts button.active{border-color:#0b5c9b;background:#eaf4fc;color:#0b4d80}.material-shortcuts button:focus-visible{outline:2px solid #075187;outline-offset:2px}
.history-recommendation{padding:13px 15px;border:1px solid #bcd8ef;border-radius:6px;background:#f0f7ff}.recommendation-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px}.recommendation-heading h3{margin:0;font-size:14px}.history-recommendation>b{font-size:13px}.history-recommendation p{margin:6px 0 0;font-size:11px;line-height:1.5;color:#4b667d;overflow-wrap:anywhere}.recommendation-note{display:flex;align-items:center;gap:5px;margin-top:10px;color:#305d82;font-size:11px}
.selection-result-fields{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px}.selection-result-fields label{display:flex;flex-direction:column;gap:6px;margin:0}.selection-result-fields :deep(input[readonly]){background:#f5f7fa}.drawing-result{grid-column:1/-1;flex-direction:row!important;align-items:baseline;color:#556d80}.drawing-result span+span{color:#253d52;font-size:11px}
.linked-result{display:flex;align-items:center;gap:5px;margin:0;color:#225c85;font-size:11px}.linked-result b{font-weight:600}.mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
@media(max-width:600px){.choice-context{gap:10px;padding:12px}.choice-context>div+div{padding-left:10px}.choice-context strong{font-size:13px}.recommendation-heading{flex-wrap:wrap}.model-choice{padding:10px;gap:8px}.selection-result-fields{grid-template-columns:1fr}}
</style>
