<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import { useWorkspace } from '@/domain/store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import StatusBadge from './StatusBadge.vue'
const props=defineProps<{embedded?:boolean}>()
const {approvalSettings,role,act}=useWorkspace()
const amount=shallowRef<number|string>(''),margin=shallowRef<number|string>('')
watch(()=>[approvalSettings.amountThreshold,approvalSettings.marginFloor],()=>{amount.value=approvalSettings.amountThreshold??'';margin.value=approvalSettings.marginFloor??''},{immediate:true})
function settings(){act('settings',{amountThreshold:amount.value===''?null:Number(amount.value),marginFloor:margin.value===''?null:Number(margin.value)})}
</script>
<template><div :class="props.embedded?'approval-settings-embedded':''"><div v-if="!props.embedded" class="page-heading"><div><p class="eyebrow">系统管理</p><h1>审批配置</h1><p class="muted">红光统一审批规则，适用于全部项目的新报价与未签发报价。</p></div></div>
<section class="panel"><div class="panel-heading"><h2>报价风险提醒阈值</h2><StatusBadge text="正式阈值待确认"/></div><div class="panel-body max-w-2xl"><div class="notice amber">阈值仅用于报价风险提醒，不会增加审批节点或改变审批流程。</div><label>整份报价含税金额提醒值（元）<Input v-model="amount" type="number" min="0" :disabled="role!=='董事长'" placeholder="留空表示尚未配置"/></label><label>毛利率提醒红线（%）<Input v-model="margin" type="number" min="0" max="100" :disabled="role!=='董事长'" placeholder="留空表示尚未配置"/></label><p class="muted">达到任一阈值后，在财务核价与审批页面显示提醒，审批仍按财务流程逐节点处理。</p><Button v-if="role==='董事长'" class="mt-5" @click="settings">保存演示配置</Button></div></section>
</div></template>
