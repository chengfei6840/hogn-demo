<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import AppIcon from './AppIcon.vue'
import type { Part } from '@/domain/model'
import { searchReferenceParts, type PartReference } from '@/domain/part-reference'

const props=defineProps<{part:Part;records:PartReference[];selected?:PartReference;disabled:boolean}>()
const emit=defineEmits<{choose:[reference:PartReference|undefined]}>()
const query=shallowRef('')
watch(()=>props.part.row,()=>{query.value=props.part.name},{immediate:true})
const matches=computed(()=>searchReferenceParts(props.records,query.value,props.part.unit))
const visible=computed(()=>matches.value.slice(0,8))
</script>

<template>
  <section class="reference-picker" aria-label="参考子件选择">
    <header><h3>参考子件<span>选填</span></h3><Button v-if="selected" size="sm" variant="outline" :disabled="disabled" @click="emit('choose',undefined)">清除参考</Button></header>
    <p class="reference-help">当前子件无料号，可选择相似子件作为财务成本计算依据。</p>
    <label class="reference-search"><span class="sr-only">搜索参考子件</span><Input v-model="query" :disabled="disabled" aria-label="搜索参考子件" placeholder="输入名称、型号或料号，支持模糊搜索"/><AppIcon name="magnifying-glass" :size="16"/></label>
    <div class="reference-results" role="group" aria-label="参考子件候选">
      <label v-for="reference in visible" :key="reference.id" class="reference-option" :class="{chosen:selected?.id===reference.id}">
        <input type="radio" :name="'part-reference-'+part.row" :disabled="disabled" :checked="selected?.id===reference.id" @change="emit('choose',reference)"/>
        <span><b>{{ reference.name }} {{ reference.model }}</b><small>料号 {{ reference.u9 }} · {{ reference.material || '材质未列明' }} · 计价单位 {{ reference.unit }}</small><small>{{ reference.source }} · 第 {{ reference.sourceRow }} 行</small></span>
      </label>
      <p v-if="!visible.length" class="reference-empty">没有匹配的参考子件，可以更换关键词或暂时留空。</p>
    </div>
    <p v-if="matches.length>visible.length" class="reference-help">共 {{ matches.length }} 条，当前展示前 {{ visible.length }} 条，请细化关键词。</p>
    <div v-if="selected" class="reference-selected"><AppIcon name="link" :size="15"/><span>已选择：<b>{{ selected.name }} {{ selected.model }}</b><small>保存后财务显示“参考子件成本”，按当前子件用量汇总。</small></span></div>
    <p v-else class="reference-help">料号与参考子件均可留空，未选择参考时由财务填写核算成本。</p>
  </section>
</template>

<style scoped>
.reference-picker{margin-top:16px;padding:14px;border:1px solid #cbdceb;border-radius:7px;background:#f7fbff;color:#294258}
.reference-picker header{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px}.reference-picker h3{font-size:14px;margin:0}.reference-picker h3 span{margin-left:8px;padding:2px 6px;border-radius:4px;background:#e7f1fa;color:#275c83;font-size:10px;font-weight:400}
.reference-help{margin:7px 0;color:#536f86;font-size:11px;line-height:1.65}.reference-search{position:relative;display:block;margin:10px 0}.reference-search :deep(input){padding-right:34px;font-size:12px}.reference-search svg{position:absolute;right:10px;top:9px;color:#5e7890;pointer-events:none}
.reference-results{max-height:235px;overflow-y:auto;overscroll-behavior:contain}.reference-option{display:flex;align-items:flex-start;gap:10px;margin:0 0 7px;padding:10px;border:1px solid #d5e0ea;border-radius:5px;background:#fff;cursor:pointer}.reference-option:hover{background:#eff7fd}.reference-option.chosen{border-color:#2775ad;background:#eaf4fc}.reference-option:has(input:focus-visible){outline:2px solid #0b5c96;outline-offset:2px}.reference-option:has(input:disabled){cursor:not-allowed;opacity:.7}
.reference-option input{width:16px;height:16px;margin-top:2px;flex-shrink:0;accent-color:#0b5c96}.reference-option span{display:flex;flex-direction:column;gap:4px;min-width:0}.reference-option b{font-size:12px;overflow-wrap:anywhere}.reference-option small{font-size:10px;color:#526e83;overflow-wrap:anywhere}.reference-empty{padding:12px;font-size:11px;color:#5a7184}
.reference-selected{display:flex;align-items:flex-start;gap:7px;margin-top:10px;padding:9px 10px;background:#e6f2fc;border-radius:4px;font-size:11px;line-height:1.6}.reference-selected svg{flex-shrink:0;margin-top:2px}.reference-selected small{display:block;font-size:10px;color:#476a85}
</style>
