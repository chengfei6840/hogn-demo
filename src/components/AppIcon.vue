<script setup lang="ts">
import { Icon } from '@iconify/vue'
import icons from '@/data/icons.json'
const props=withDefaults(defineProps<{name:string;size?:number}>(),{size:20})
</script>
<template><Icon :icon="icons[props.name as keyof typeof icons] || icons.circle" :width="size" :height="size" aria-hidden="true" /></template>
