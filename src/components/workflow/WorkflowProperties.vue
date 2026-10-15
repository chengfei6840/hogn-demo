<script setup lang="ts">
import {computed,reactive,watch} from 'vue'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import AppSelect from '../AppSelect.vue'
import {labelOf,type DesignNode,type DesignEdge} from '@/domain/workflow-design'
const props=defineProps<{element:DesignNode|DesignEdge|null;kind:string;readonly?:boolean}>()
const emit=defineEmits<{apply:[text:string,properties:Record<string,any>];remove:[]}>()
const form=reactive({name:'',role:'财务',assignee:'',action:'approve',condition:'always'})
const task=computed(()=>props.kind==='node'&&props.element?.properties?.kind==='task')
watch(()=>props.element,n=>Object.assign(form,{name:n?labelOf(n):'',role:n?.properties?.role||'财务',assignee:(n?.properties?.assignee||'').split(' · ').slice(1).join(' · '),action:n?.properties?.action||'approve',condition:n?.properties?.condition||'always'}),{immediate:true})
function apply(){emit('apply',form.name,{...props.element?.properties,role:form.role,assignee:form.role+' · '+form.assignee.trim(),action:form.action,condition:form.condition})}
</script>
<template>
 <div class="panel-heading"><h2>节点配置</h2></div>
 <div v-if="element" class="panel-body"><label>节点名称<Input v-model="form.name" :disabled="readonly"/></label>
  <template v-if="task"><label>处理动作<AppSelect v-model="form.action" label="处理动作" :disabled="readonly" :options="[{value:'approve',label:'审批'},{value:'issue',label:'最终签发'}]"/></label><label>参与角色<AppSelect v-model="form.role" label="参与角色" :disabled="readonly" :options="['财务']"/></label><label>处理人姓名<Input v-model="form.assignee" :disabled="readonly" placeholder="每个节点填写一位处理人"/></label><p class="muted">每个节点对应一位财务处理人，前序审批完成后才能签发。</p></template>
  <p v-else class="muted">审批开始与签发完成标记流程边界。</p>
  <template v-if="!readonly"><Button class="w-full" @click="apply">应用配置</Button><Button v-if="task||kind==='edge'" class="w-full mt-3" variant="outline" @click="emit('remove')">删除所选{{kind==='edge'?'连线':'节点'}}</Button></template>
 </div><div v-else class="empty">选择左侧节点或画布元素，查看处理人与执行顺序。</div>
</template>
