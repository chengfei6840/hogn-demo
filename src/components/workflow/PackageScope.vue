<script setup lang="ts">
import { provide } from 'vue'
import { usePackageWorkspace, workspaceContextKey } from '@/domain/store'
const props = defineProps<{ packageId: string }>()
provide(workspaceContextKey, usePackageWorkspace(props.packageId))
</script>
<template><slot /></template>
