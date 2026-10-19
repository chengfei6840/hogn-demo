<script setup lang="ts">
import { useWorkspace } from '@/domain/store'
import { packageCategory } from '@/domain/batch-packages'
import PackageScope from './PackageScope.vue'
import BomView from '../BomView.vue'
import FinanceView from '../FinanceView.vue'
import QuotesView from '../QuotesView.vue'
defineProps<{ view: 'bom' | 'finance' | 'quotes' }>()
const { workflowPackages, project } = useWorkspace()
const selected = workflowPackages
</script>
<template><div class="aggregate-workflow"><p class="muted">汇总展示本次所选 {{ selected.length }} 个报价包；各包的税率、成本、审批和报价版本分别保存。</p><section v-for="pkg in selected" :key="pkg.id" class="aggregate-package-section"><header><b>{{ packageCategory(pkg,project.materialWorksheets||[]) }} · {{ pkg.packageName }}</b><span>{{ pkg.packageNo }} · {{ pkg.stage }}</span></header><PackageScope :package-id="pkg.id"><BomView v-if="view==='bom'"/><FinanceView v-else-if="view==='finance'"/><QuotesView v-else/></PackageScope></section></div></template>
<style scoped>.aggregate-workflow{display:grid;gap:22px}.aggregate-package-section{min-width:0;border-top:2px solid #d6e5ef;padding-top:12px}.aggregate-package-section>header{display:flex;align-items:center;gap:15px;padding:8px 0 16px;color:#244963}.aggregate-package-section>header span{font-size:12px;color:#70879a}</style>
