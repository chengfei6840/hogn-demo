<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspace } from '@/domain/store'
import { packageCategory } from '@/domain/batch-packages'
import PackageScopePopover from './PackageScopePopover.vue'
defineProps<{ projectName: string }>()
const { project, workflowPackages } = useWorkspace()
const selected = workflowPackages
const categories = computed(() => new Set(selected.value.map(pkg => pkg.materialWorksheetId || packageCategory(pkg, project.materialWorksheets || []))).size)
</script>
<template><div v-if="selected.length" class="workflow-selection-summary" aria-label="本次所选报价包"><div class="workflow-project-details"><b>{{projectName}}</b><span>本次处理 {{ selected.length }} 个报价包 · {{ categories }} 个类别</span></div><PackageScopePopover :packages="selected" :sheets="project.materialWorksheets||[]" /></div><span v-else class="muted">当前人员未分配本次技术任务</span></template>
<style scoped>
.workflow-selection-summary{flex:1;display:flex;align-items:center;gap:20px;min-width:0;color:#668094;font-size:12px}.workflow-project-details{min-width:0;display:grid;gap:5px}.workflow-project-details b{max-width:100%;font-size:16px;color:#18364f}.workflow-project-details span{white-space:nowrap}.workflow-selection-summary :deep(.scope-trigger){margin-left:12px}@media(max-width:700px){.workflow-selection-summary{gap:8px;flex-wrap:wrap}}
</style>
