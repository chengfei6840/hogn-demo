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
<template><section class="sidebar-progress" aria-label="当前包流程进度速览"><ol><li v-for="(step,n) in steps" :key="step.id" :class="[step.status,'enterable']" :aria-current="step.status==='current'?'step':undefined"><i><AppIcon v-if="step.status==='done'" name="check" :size="12"/><template v-else>{{n+1}}</template></i><button type="button" :title="step.label" @click="go(step.id)">{{step.label}}</button></li></ol></section></template>
<style scoped>
.sidebar-progress li>button{border:0;background:none;padding:0;font:inherit;color:inherit;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sidebar-progress li.enterable>button:hover{color:#2672a4;text-decoration:underline;text-underline-offset:3px}
.sidebar-progress li.enterable.current>button:hover{color:#064975}
</style>
