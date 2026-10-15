<script setup lang="ts">
import {usePackageProgress} from '@/domain/package-progress'
import {useWorkspace} from '@/domain/store'
import AppIcon from '../AppIcon.vue'
const steps=usePackageProgress()
const {page,role,toast}=useWorkspace()
function go(id:string){
 const step=steps.value.find(item=>item.id===id)
 const approvalStep=id==='approval'||Boolean(step?.label.includes('审批'))
 const target=id==='parse'?'parse':id==='sales'||id==='tech'?'collaboration':id==='finance'||approvalStep?'finance':id==='send'||id==='track'?'quotes':''
 if(!target)return
 const allowed=(id==='parse'&&role.value==='销售')||(id==='sales'&&role.value==='销售')||(id==='tech'&&role.value==='技术')||(target==='finance'&&['财务','董事长'].includes(role.value))||(target==='quotes'&&role.value==='销售')
 if(!allowed){toast('当前角色无权限访问该流程页面');return}
 page.value=target
}
</script>
<template><div class="stage-strip" aria-label="当前包流程与审批进度"><div v-for="(step,n) in steps" :key="step.id" class="stage-step" :class="step.status" role="button" tabindex="0" :aria-label="'进入'+step.label" :aria-current="step.status==='current'?'step':undefined" @click="go(step.id)" @keydown.enter.prevent="go(step.id)" @keydown.space.prevent="go(step.id)"><span><AppIcon v-if="step.status==='done'" name="check" :size="13"/><template v-else>{{n+1}}</template></span>{{step.label}}<AppIcon v-if="n<steps.length-1" name="caret-right" :size="12"/></div></div></template>
<style scoped>
.stage-strip>.stage-step{cursor:pointer;border-radius:5px}
.stage-strip>.stage-step:hover{color:#2672a4;text-decoration:underline;text-underline-offset:3px}
.stage-strip>.stage-step.current:hover{color:#064975}
</style>
