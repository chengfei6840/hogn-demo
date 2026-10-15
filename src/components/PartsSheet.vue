<script setup lang="ts">
import type { Candidate } from '@/domain/model'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import AppIcon from './AppIcon.vue'
const open = defineModel<boolean>({ required: true })
defineProps<{ candidate: Candidate | null; differences: string[]; canAdopt: boolean; unavailableReasons?: string[] }>()
defineEmits<{ adopt: [] }>()
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent side="right" class="parts-sheet">
      <SheetHeader class="parts-sheet-header">
        <SheetTitle>串内子件明细</SheetTitle>
        <SheetDescription>核对候选的子件组成与来源，关闭后继续比较其他候选。</SheetDescription>
      </SheetHeader>
      <template v-if="candidate">
        <div class="parts-sheet-summary">
          <p class="mono muted">{{ candidate.id }} · {{ candidate.parts.length }} 条子件 · {{ candidate.parts.filter(p => p.u9).length }} 条 U9 已关联</p>
          <h3>{{ candidate.name }}</h3>
          <p class="muted">{{ candidate.description }}</p>
          <div v-if="differences.length" class="notice amber"><AppIcon name="warning" />{{ differences.join('；') }}。差异未解决前不能采用。</div>
        </div>
        <div class="parts-sheet-table" tabindex="0" role="region" aria-label="子件明细表格">
          <table><thead><tr><th>子件名称</th><th>型号</th><th>每套用量</th><th>材质</th><th>U9 料号</th><th>公司图号</th></tr></thead>
            <tbody><tr v-for="part in candidate.parts" :key="part.row"><td>{{ part.name }}</td><td class="mono">{{ part.model }}</td><td>{{ part.qty ?? '待补充' }} {{ part.unit }}</td><td>{{ part.material || '待补充' }}</td><td class="mono">{{ part.u9 || '待补充' }}</td><td class="mono">{{ part.drawing || '待补充' }}</td></tr></tbody>
          </table>
        </div>
        <div class="parts-sheet-source"><span>来源依据</span><p>{{ candidate.source }} · {{ candidate.sheet }} · 第 {{ candidate.row }} 行起</p></div>
        <div v-if="unavailableReasons?.length" class="parts-sheet-source">暂不能采用：{{unavailableReasons.join('；')}}</div><div class="parts-sheet-footer"><Button variant="outline" @click="open=false">返回候选</Button><Button :disabled="!canAdopt" @click="$emit('adopt')">采用此串型</Button></div>
      </template>
    </SheetContent>
  </Sheet>
</template>
