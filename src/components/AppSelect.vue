<script setup lang="ts" generic="T extends string | number">
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
defineOptions({ inheritAttrs: false })
const model = defineModel<T>({ required: true })
defineProps<{ options: readonly (T | { value: T; label: string })[]; label: string }>()
</script>

<template>
  <Select v-model="model">
    <SelectTrigger v-bind="$attrs" :aria-label="label" class="app-select">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="option in options" :key="typeof option === 'object' ? option.value : option" :value="typeof option === 'object' ? option.value : option">
        {{ typeof option === 'object' ? option.label : option }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
