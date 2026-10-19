<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent, PopoverArrow } from 'reka-ui'
import { packageCategory } from '@/domain/batch-packages'
import type { Package, MaterialWorksheetMeta } from '@/domain/model'
import AppIcon from '../AppIcon.vue'

const props = withDefaults(defineProps<{ packages: readonly Package[]; sheets: readonly MaterialWorksheetMeta[]; label?: string; showCount?: boolean }>(), { label: '查看处理范围', showCount: true })
const open = ref(false)
const query = ref('')
watch(open, value => { if (value) query.value = '' })
const groups = computed(() => {
  const grouped = new Map<string, { id: string; name: string; packages: Package[] }>()
  for (const pkg of props.packages) {
    const name = packageCategory(pkg, [...props.sheets])
    const id = pkg.materialWorksheetId || name
    if (!grouped.has(id)) grouped.set(id, { id, name, packages: [] })
    grouped.get(id)?.packages.push(pkg)
  }
  return [...grouped.values()]
})
const filtered = computed(() => groups.value.flatMap(group => {
  const term = query.value.trim().toLowerCase()
  const packages = group.packages.filter(pkg => `${group.name} ${pkg.packageName} ${pkg.packageNo || ''} ${pkg.id}`.toLowerCase().includes(term))
  return packages.length ? [{ ...group, packages, total: group.packages.length }] : []
}))
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger class="scope-trigger" :disabled="!packages.length" :aria-label="`${label}${showCount ? ' '+packages.length : ''}`">
      {{ label }}<span v-if="showCount">{{ packages.length }}</span><AppIcon :name="open ? 'caret-up' : 'caret-down'" :size="13" />
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent class="package-scope-popover" side="bottom" align="center" :side-offset="10" :collision-padding="16" aria-label="本次处理范围">
        <header class="scope-heading"><h3>本次处理范围</h3><span>仅查看</span></header>
        <label class="scope-search"><AppIcon name="magnifying-glass" :size="18" /><input v-model="query" type="search" placeholder="搜索包名称、包号或类别" aria-label="搜索处理范围" /></label>
        <div class="scope-groups">
          <details v-for="group in filtered" :key="group.id" class="scope-category" :open="!!query.trim() || group.total <= 3">
            <summary><AppIcon name="caret-right" :size="16" /><b>{{ group.name }}</b><span>{{ group.total }} 个包</span></summary>
            <ul><li v-for="pkg in group.packages" :key="pkg.id"><span>{{ pkg.packageName }}</span><small>{{ pkg.packageNo || '暂无包号' }}</small></li></ul>
          </details>
          <p v-if="!filtered.length" class="scope-empty">没有符合条件的报价包</p>
        </div>
        <footer class="scope-notice">展开类别查看包明细；本次操作始终作用于全部所选包。</footer>
        <PopoverArrow class="scope-popover-arrow" :width="16" :height="8" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style scoped>
.scope-trigger{display:inline-flex;align-items:center;justify-content:center;gap:8px;flex-shrink:0;min-height:34px;padding:6px 14px;border:1px solid #b8cedf;border-radius:6px;background:#fff;color:#075580;font-size:12px;font-weight:600;white-space:nowrap;cursor:pointer}.scope-trigger:hover,.scope-trigger[data-state=open]{border-color:#075580;background:#f3f9fd}.scope-trigger:focus-visible{outline:3px solid #a8cfe8;outline-offset:2px}.scope-trigger:disabled{opacity:.5;cursor:default}
:global(.package-scope-popover){z-index:80;width:min(560px,calc(100vw - 32px));display:flex;flex-direction:column;max-height:min(560px,calc(100dvh - 90px));padding:20px;border:1px solid #cddde9;border-radius:9px;background:#fff;color:#18364f;box-shadow:0 10px 30px #193b5426;outline:none}
.scope-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}.scope-heading h3{font-size:17px;margin:0;font-weight:700}.scope-heading>span{padding:3px 9px;background:#edf5fc;border:1px solid #d9e6f1;border-radius:6px;font-size:11px;color:#57728a}.scope-search{display:flex;align-items:center;gap:9px;border:1px solid #cddce8;border-radius:6px;padding:8px 11px;flex-shrink:0;color:#6b8296}.scope-search input{width:100%;min-width:0;border:0;outline:0;background:transparent;font:inherit;font-size:13px;color:#18364f}.scope-search:focus-within{border-color:#075580;box-shadow:0 0 0 2px #e1eff9}.scope-groups{min-height:0;overflow:auto;overscroll-behavior:contain;max-height:350px;margin:17px 0}.scope-category{margin-bottom:8px;border:1px solid #dfeaf2;border-radius:6px;overflow:hidden}.scope-category:last-child{margin-bottom:0}.scope-category summary{display:flex;align-items:center;gap:11px;min-height:46px;padding:10px 13px;background:#eff7fd;cursor:pointer;list-style:none}.scope-category summary::-webkit-details-marker{display:none}.scope-category summary>svg{color:#075580;flex-shrink:0}.scope-category[open] summary>svg{transform:rotate(90deg)}.scope-category summary b{font-size:13px;min-width:0;overflow-wrap:anywhere}.scope-category summary>span{margin-left:auto;white-space:nowrap;font-size:12px;color:#6b8296}.scope-category ul{list-style:none;padding:0;margin:0}.scope-category li{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:12px 16px 12px 45px;border-top:1px solid #e9eff4;font-size:13px}.scope-category li small{color:#798ea1;font-size:12px}.scope-notice{flex-shrink:0;padding-top:14px;border-top:1px solid #e5edf3;color:#6b8296;font-size:12px;line-height:1.6}.scope-empty{text-align:center;padding:22px;color:#71879a;font-size:13px}
.scope-search{margin:0}.scope-search input[type=search]{height:22px;padding:0!important;border:0!important;border-radius:0;box-shadow:none!important;background:transparent}:global(.scope-popover-arrow){fill:white;stroke:#cddde9;stroke-width:1px}
</style>
