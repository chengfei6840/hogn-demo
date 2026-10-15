<script setup lang="ts">
import { computed } from 'vue'
import { candidateDifferences, type Candidate, type Item } from '@/domain/model'
const props=defineProps<{item:Item;candidate:Candidate}>()
const rows=computed(()=>{
 const differences=candidateDifferences(props.item,props.candidate)
 return [
  ['串型号',props.item.model,props.candidate.model,'串型号不一致'],
  ['电压',props.item.voltage,props.candidate.name.match(/\d+\s*kV/i)?.[0]||'','电压等级不一致'],
  ['适用导线',props.item.conductor,props.candidate.description,'适用导线不一致']
 ].map(([label,demand,value,error])=>({label,demand,value,different:differences.includes(error)}))
})
</script>
<template><div class="comparison-table"><table><thead><tr><th>核对项</th><th>客户需求</th><th>当前候选</th></tr></thead><tbody><tr v-for="row in rows" :key="row.label" :class="{different:row.different}"><th>{{row.label}}</th><td>{{row.demand||'未提供'}}</td><td>{{row.value||'源记录为空'}}<small v-if="row.different">存在差异</small></td></tr></tbody></table></div><p class="comparison-note">字段相符仅供初核，仍须核实串内子件。</p></template>
<style scoped>.comparison-table{overflow:auto}.comparison-table table{width:100%;min-width:0;table-layout:fixed;border-collapse:collapse}.comparison-table th,.comparison-table td{padding:10px 12px;text-align:center;font-size:12px;vertical-align:top;overflow-wrap:anywhere;border-bottom:1px solid #e8edf2}.comparison-table th:first-child{width:24%}.comparison-table thead{background:#f7f9fb;color:#7b8894}.different td{background:#fff8ed;color:#926420}.different small{display:block;color:#b37724;margin-top:5px}.comparison-note{font-size:11px;color:#8693a0;margin:12px 16px}</style>
