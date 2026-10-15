<script setup lang="ts">
import { computed } from 'vue'
const props=defineProps<{text:string}>()
const tone=computed(()=>/已签发|已解决|已确认|已出具|可出具|通过|准确/.test(props.text)?'good':/阻断|退回|未找到/.test(props.text)?'bad':/缺少|待|暂缓|多条|处理中|审批/.test(props.text)?'warn':'neutral')
</script>
<template><span class="status" :class="tone"><span class="status-dot"></span>{{text==='可出具报价'?'待财务签发':text==='已出具'?'已签发':text}}</span></template>
