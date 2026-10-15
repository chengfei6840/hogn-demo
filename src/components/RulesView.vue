<script setup lang="ts">
import {dictionary} from '@/data/rules'
import StatusBadge from './StatusBadge.vue'
</script>
<template><div class="page-heading"><div><p class="eyebrow">基础数据与治理</p><h1>规则与字典</h1><p class="muted">行业字段、叫法和必填口径由业务维护，通用解析核心保持独立。</p></div><StatusBadge text="国网金具串 · V0.1 演示"/></div>
 <section class="panel"><div class="panel-heading"><h2>字段定义与同义词</h2><span class="muted">规范字段、常见叫法与必填口径</span></div><div class="table-wrap"><table><thead><tr><th>名称</th><th>类型</th><th>同义词/叫法</th><th>必填</th></tr></thead><tbody><tr v-for="(r,idx) in dictionary" :key="idx"><td v-for="(c,n) in r.slice(0,3)" :key="n">{{c}}</td><td><span v-if="r[3]" class="required-mark">{{r[3]}}</span><span v-else class="muted">—</span></td></tr></tbody></table></div></section>
</template>
