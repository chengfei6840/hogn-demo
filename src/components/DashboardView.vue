<script setup lang="ts">
import { computed } from 'vue'
import {currentApprovalStep,canHandleApproval} from '@/domain/approval-workflow'
import { useWorkspace } from '@/domain/store'
import { Button } from '@/components/ui/button'
import AppIcon from './AppIcon.vue'
import StatusBadge from './StatusBadge.vue'
import DashboardInsights from './DashboardInsights.vue'
import { confirmEntries, isPackageVisibleToPerson, technicalDirector, type Package } from '@/domain/model'
const {projects,role,person,page,openIntake,openPackage}=useWorkspace()
const allPackages=computed(()=>projects.value.flatMap(proj=>proj.packages.filter(pkg=>!pkg.archivedAt&&isPackageVisibleToPerson(pkg,person.value,role.value)).map(pkg=>({...pkg,projectName:proj.name,projectId:proj.id}))))
const archivedCount=computed(()=>projects.value.flatMap(proj=>proj.packages).filter(pkg=>pkg.archivedAt).length)
const tasks=computed(()=>role.value==='董事长'?[]:allPackages.value.flatMap(pkg=>{
 const rows=confirmEntries(pkg as Package).filter(e=>e.assignee===person.value).map(e=>({id:pkg.id+e.id,packageId:pkg.id,projectName:pkg.projectName,title:e.title+' · 货物项 '+e.itemId,status:'待'+e.owner+'确认',target:'collaboration'}))
 if(role.value==='技术'&&person.value===technicalDirector&&pkg.stage==='并行协作'&&pkg.salesConfirmed===pkg.version&&pkg.techConfirmed!==pkg.version)rows.push({id:pkg.id+'technical-confirm',packageId:pkg.id,projectName:pkg.projectName,title:pkg.technicalExecution?.mode==='employee'?'技术结果总监确认':'技术选项总监确认',status:pkg.technicalExecution?.mode==='employee'&&pkg.technicalExecution.status!=='submitted'?'等待技术员工':'待我处理',target:'collaboration'})
 if(role.value==='技术'&&pkg.technicalExecution?.mode==='employee'&&pkg.technicalExecution.assignee===person.value)rows.push({id:pkg.id+'technical-work',packageId:pkg.id,projectName:pkg.projectName,title:pkg.technicalExecution.status==='submitted'?'技术结果已提交':'技术选项处理',status:pkg.technicalExecution.status==='submitted'?'等待总监确认':'待我完成并提交总监确认',target:'collaboration'})
 const task=currentApprovalStep(pkg.approvalRun)
 if(task&&canHandleApproval(pkg.approvalRun,role.value,person.value))rows.push({id:pkg.id+'approval',packageId:pkg.id,projectName:pkg.projectName,title:task.name,status:'待我处理',target:'finance'})
 else if(role.value==='财务'&&pkg.stage==='财务核价')rows.push({id:pkg.id+'finance',packageId:pkg.id,projectName:pkg.projectName,title:'成本核算与方案选择',status:'待核价',target:'finance'})
 return rows
}))
const stats=computed(()=>[{title:'项目总数',value:projects.value.length,icon:'folder-open'},{title:'在办报价包',value:allPackages.value.length,icon:'package'},{title:'我的待办',value:tasks.value.length,icon:'list-checks'},{title:'已签发包',value:allPackages.value.filter(p=>['已出具','客户议价中'].includes(p.stage)).length,icon:'seal-check'},{title:'历史库已归档',value:archivedCount.value,icon:'files'}])
function enter(packageId:string,target:string){openPackage(packageId);page.value=target}
</script>
<template>
 <div class="page-heading"><div><p class="eyebrow">{{person}} · 工作概览</p><h1>工作台</h1><p class="muted">先处理待办，再跟进项目进度。</p></div><Button v-if="role==='销售'" @click="openIntake('project')"><AppIcon name="plus"/>新建项目</Button></div>
 <div class="stats-grid"><div v-for="stat in stats" :key="stat.title" class="stat"><div class="flex justify-between"><span>{{stat.title}}</span><AppIcon :name="stat.icon"/></div><strong>{{stat.value}}</strong></div></div>
 <div class="dashboard-columns"><section class="panel"><div class="panel-heading"><div><h2>我的待办 <span class="count">{{tasks.length}}</span></h2><p class="muted">按当前角色与负责人汇总</p></div></div><button v-for="task in tasks" :key="task.id" class="todo-row dashboard-task" @click="enter(task.packageId,task.target)"><span class="risk-marker"><AppIcon name="clock-counter-clockwise"/></span><span class="grow text-left"><b>{{task.title}}</b><small>{{task.projectName}}</small></span><StatusBadge :text="task.status"/><AppIcon name="arrow-right"/></button><div v-if="!tasks.length" class="empty"><AppIcon name="seal-check" :size="32"/><p>当前没有分配给你的待办</p></div></section>
 <section class="panel"><div class="panel-heading"><h2>报价包进度</h2><Button variant="ghost" size="sm" @click="page='overview'">全部项目<AppIcon name="arrow-right"/></Button></div><button v-for="pkg in allPackages.slice(0,5)" :key="pkg.id" class="todo-row dashboard-task" @click="openPackage(pkg.id)"><span class="grow text-left"><b>{{pkg.packageName}}</b><small>{{pkg.projectName}}</small></span><StatusBadge :text="pkg.stage"/></button></section></div>
 <DashboardInsights/>
</template>
<style scoped>.dashboard-columns{display:grid;grid-template-columns:1.15fr 1fr;gap:20px}.dashboard-task{width:100%;background:white;border:0;border-bottom:1px solid #edf1f5;gap:12px}.dashboard-task:hover{background:#f5f9fc}@media(max-width:1100px){.dashboard-columns{grid-template-columns:1fr}}</style>
