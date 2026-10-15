<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useWorkspace } from '@/domain/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AppIcon from './AppIcon.vue'
const { projects, role, openProject, openIntake } = useWorkspace()
const query=shallowRef('')
const filtered=computed(()=>projects.value.filter(p=>[p.name,p.id,p.customer,p.region||''].some(v=>v.toLowerCase().includes(query.value.trim().toLowerCase()))))
</script>
<template>
 <div class="page-heading"><div><p class="eyebrow">项目管理</p><h1>项目台账</h1><p class="muted">项目承载多个报价包；进入具体项目后再查看该项目下的报价包列表。</p></div><Button v-if="role==='销售'" @click="openIntake('project')"><AppIcon name="plus"/>新建项目</Button></div>
 <section class="panel ledger-panel"><div class="panel-heading ledger-filters"><h2>项目列表 <span class="count">{{projects.length}}</span></h2><Input v-model="query" aria-label="搜索项目" placeholder="搜索项目名称、编号或客户"/></div>
 <div class="ledger-table"><table><thead><tr><th>项目名称</th><th>客户 / 地区</th><th>电网类型</th><th>报价包数量</th><th>负责人</th><th>创建时间</th><th>操作</th></tr></thead><tbody><tr v-for="p in filtered" :key="p.id"><td><button class="project-name" @click="openProject(p.id)">{{p.name}}</button><small class="block mono">{{p.id}}</small></td><td>{{p.customer}}<small>{{p.region || '地区待补充'}}</small></td><td>{{p.gridType || '电网待补充'}}</td><td><b>{{p.packages.filter(x=>!x.archivedAt).length}} 个包</b><small v-if="p.packages.some(x=>x.archivedAt)">另有 {{p.packages.filter(x=>x.archivedAt).length}} 个已归档</small></td><td>{{p.salesOwner}}</td><td>{{p.createdAt}}</td><td class="project-actions"><Button v-if="role==='销售'" size="sm" variant="ghost" @click="openProject(p.id);openIntake('editProject')">编辑</Button><button type="button" class="project-enter-action" @click="openProject(p.id)">进入</button></td></tr></tbody></table><div v-if="!filtered.length" class="empty">{{projects.length?'没有符合条件的项目，请调整搜索条件。':'当前没有项目，请从新建项目并导入物料清单开始。'}}</div></div>
 </section>
</template>

<style scoped>
.project-actions{white-space:nowrap}
.project-enter-action{margin-left:8px;padding:4px 2px;border:0;background:transparent;color:#075580;font-size:12px;font-weight:600;white-space:nowrap}
.project-enter-action:hover{text-decoration:underline;text-underline-offset:3px;color:#064975}
.project-enter-action:focus-visible{outline:3px solid #619cc4;outline-offset:2px}
</style>
