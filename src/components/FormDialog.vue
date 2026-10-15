<script setup lang="ts">
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription } from '@/components/ui/dialog'
const open=defineModel<boolean>({required:true})
const props=withDefaults(defineProps<{title:string;description?:string;wide?:boolean;layer?:'default'|'nested';contained?:boolean;portalTo?:string;bodyClass?:string}>(),{wide:false,layer:'default',contained:false,portalTo:undefined,bodyClass:undefined})
</script>
<template><Dialog v-model:open="open"><DialogContent :contained="props.contained" :portal-to="props.portalTo" :close-button="props.contained" :class="['form-dialog',props.contained?'detail-dialog':(props.wide?'max-w-5xl':'max-w-xl'),'max-h-[88dvh]','overflow-hidden',props.layer==='nested'?'!z-[60]':'z-50']" :overlay-class="props.contained?'detail-overlay !z-[60]':props.layer==='nested'?'z-[60]':''"><DialogHeader><DialogTitle>{{props.title}}</DialogTitle><DialogDescription>{{props.description || '填写内容后保存，所有变更将记录来源及操作人。'}}</DialogDescription></DialogHeader><div :class="['dialog-body',props.bodyClass]"><slot /></div></DialogContent></Dialog></template>
