<script setup lang="ts">
import AppSelect from '@/components/AppSelect.vue'
import {computed,shallowRef,watch,nextTick} from 'vue'
import {useWorkspace} from './domain/store'
import {confirmEntries,rolePeople,technicalDirector,type Role,type Package} from './domain/model'
import {Button} from '@/components/ui/button'
import AppIcon from './components/AppIcon.vue'
import BomView from './components/BomView.vue'
import {asset} from '@/lib/asset'
import OverviewView from './components/OverviewView.vue'
import PackageListView from './components/PackageListView.vue'
import DashboardView from './components/DashboardView.vue'
import RoleManagementView from './components/RoleManagementView.vue'
import UserManagementView from './components/UserManagementView.vue'
import ArchiveView from './components/ArchiveView.vue'
import ApprovalWorkflowView from './components/ApprovalWorkflowView.vue'
import NewInquiryDialog from './components/NewInquiryDialog.vue'
import SourcesView from './components/SourcesView.vue'
import CollaborationView from './components/CollaborationView.vue'
import FinanceView from './components/FinanceView.vue'
import QuotesView from './components/QuotesView.vue'
import RulesView from './components/RulesView.vue'
import DataGovernanceView from './components/DataGovernanceView.vue'
import PhaseView from './components/PhaseView.vue'
import FormDialog from './components/FormDialog.vue'
import ProjectHistorySheet from './components/ProjectHistorySheet.vue'
import ProjectProgress from './components/workflow/ProjectProgress.vue'
import SidebarProgress from './components/workflow/SidebarProgress.vue'
import WorkflowSelectionSummary from './components/workflow/WorkflowSelectionSummary.vue'
import AggregateWorkflowView from './components/workflow/AggregateWorkflowView.vue'
import PackageScope from './components/workflow/PackageScope.vue'
import { permissionPages, useRolePermissionsStore } from './stores/role-permissions'
const {package:pkg,project:p,packages,batchPackageIds,hasBatchSelection,workflowPackages,role,person,people,page,notice,act}=useWorkspace()
const access=useRolePermissionsStore()
const mainContent=shallowRef<HTMLElement|null>(null)
// public/ 静态资源必须拼 base 前缀；Vue 模板里访问不到 import.meta.env，故经 script 暴露。
// 共享实现在 @/lib/asset，新增资源引用一律走它。
watch(page,async()=>{await nextTick();mainContent.value?.scrollTo({top:0});mainContent.value?.focus({preventScroll:true})})
const resetOpen=shallowRef(false)
const historyOpen=shallowRef(false)
// 侧边栏按业务域分组：标题 + 条目，条目顺序即展示顺序。
type NavItem={id:string;label:string;icon:string;tag?:string}
type NavGroup={id:string;title:string;progress?:boolean;items:NavItem[]}
const navGroups:NavGroup[]=[
 {id:'home',title:'工作台',items:[{id:'dashboard',label:'工作台',icon:'squares-four'}]},
 // 项目台账入口与当前包流程速览同属「报价项目」组，二者同级并列（台账在上）。
 {id:'quote',title:'报价项目',progress:true,items:[{id:'overview',label:'项目台账',icon:'squares-four'}]},
 {id:'assets',title:'资产与规则',items:[{id:'data-governance',label:'资料治理',icon:'database'},{id:'archive',label:'历史库',icon:'files'},{id:'rules',label:'规则与字典',icon:'sliders-horizontal'}]},
 {id:'admin',title:'系统管理',items:[{id:'user-management',label:'用户管理',icon:'user-circle'},{id:'roles',label:'角色管理',icon:'users-three'},{id:'approval-workflow',label:'审批与流程配置',icon:'git-branch'}]},
 {id:'contract',title:'后续阶段',items:[{id:'phase2',label:'成本库与集成',icon:'database',tag:'二期'},{id:'phase3',label:'报告与出图',icon:'cube',tag:'三期'}]},
]
const nav=navGroups.flatMap(group=>group.items)
const pageAllowed=computed(()=>!permissionPages.some(entry=>entry.id===page.value)||access.can(role.value,page.value as any))
const projectTabs=[{id:'parse',label:'资料解析'},{id:'collaboration',label:'询价协作'},{id:'bom',label:'BOM'},{id:'finance',label:'核价与审批'},{id:'quotes',label:'报价记录'}]
const showPackageList=computed(()=>page.value==='packages')
const showWorkflow=computed(()=>['parse','collaboration','bom','finance','quotes'].includes(page.value))
const currentTitle=computed(()=>showPackageList.value?'报价包列表':showWorkflow.value ? projectTabs.find(n=>n.id===page.value)?.label : nav.find(n=>n.id===page.value)?.label)
const roles=Object.keys(rolePeople) as Role[]
// 侧边栏徽标与协作页清单同源：按当前人员现算还需补齐的串字段条目。
const myEntryCount=computed(()=>workflowPackages.value.flatMap(target=>confirmEntries(target)).filter(entry=>entry.assignee===person.value).length)
watch([role,people],()=>{if(!people.value.includes(person.value))person.value=people.value[0]||''},{flush:'sync'})
</script>
<template><a class="skip-link" href="#main-content">跳到主要内容</a><div class="app-layout"><aside class="sidebar"><div class="sidebar-brand"><img :src="asset('hogn-logo.png')" alt="HOGN 红光" width="132" height="35"/><span>金具智能报价</span></div><div class="workspace-label"><span class="workspace-icon">金</span><div><b>国网项目工作空间</b><small>内网业务工作台</small></div></div><template v-for="g in navGroups" :key="g.id"><p class="nav-section">{{g.title}}</p><nav :aria-label="g.title"><button v-for="n in g.items" :key="n.id" :aria-label="n.label" :aria-current="page===n.id?'page':undefined" :class="{active:page===n.id || (n.id==='overview'&&(showWorkflow||showPackageList))}" @click="page=n.id"><AppIcon :name="n.icon"/><span>{{n.label}}</span><span v-if="n.id==='collaboration' && myEntryCount" class="nav-count">{{myEntryCount}}</span><small v-if="n.tag">{{n.tag}}</small></button></nav><SidebarProgress v-if="g.progress"/></template><div class="sidebar-foot"><AppIcon name="shield-check"/><div><b>原型演示环境</b><small>本地保存 · 服务模拟</small></div></div></aside>
 <div class="main-shell"><header class="topbar"><div class="breadcrumb">红光金具 <span>/</span> {{currentTitle}}</div><div class="topbar-actions"><span class="demo-label">交互原型</span><Button variant="ghost" size="sm" @click="resetOpen=true"><AppIcon name="arrow-counter-clockwise" :size="17"/>重置演示</Button><div class="role-select"><span class="avatar small">{{role.slice(0,1)}}</span><div class="role-controls"><small>当前角色 · 可切换演示</small><AppSelect v-model="role" label="切换角色" :options="roles.map(r=>({value:r,label:r}))"/><AppSelect v-if="people.length>1" v-model="person" label="切换当前人员" :options="people"/></div></div></div></header>
 <section v-if="showPackageList" class="project-context"><div class="project-context-heading"><Button variant="ghost" size="sm" @click="page='overview'"><AppIcon name="arrow-left"/>项目台账</Button><b>{{p.name}}</b><small>{{p.id}} · {{p.customer}}</small></div></section>
 <section v-if="showWorkflow" class="project-context workflow-context"><div class="project-context-heading"><Button variant="ghost" size="sm" @click="page='packages'"><AppIcon name="arrow-left"/>报价包列表</Button><b v-if="!hasBatchSelection&&!(role==='技术'&&person!==technicalDirector)">{{p.name}}</b><WorkflowSelectionSummary :project-name="p.name" v-if="hasBatchSelection||(role==='技术'&&person!==technicalDirector)"/><small v-else>{{pkg.packageName}} · {{pkg.id}} · {{p.customer}}</small><Button class="ml-auto" variant="outline" size="sm" :disabled="!workflowPackages.length" @click="historyOpen=true"><AppIcon name="clock-counter-clockwise" :size="15"/>流程记录</Button></div></section>
 <ProjectProgress v-if="showWorkflow"/>
 <main id="main-content" :data-page="page" ref="mainContent" :class="{'ledger-main':page==='overview'||page==='packages'||page==='archive'}" tabindex="-1"><div id="workflow-dialog-root"></div><section v-if="!pageAllowed" class="panel empty"><AppIcon name="lock-key" :size="36"/><h2>当前角色没有此页面的访问权限</h2><p>请在顶部切换到有权限的角色；管理员可在角色管理中调整页面权限。</p></section><DashboardView v-else-if="page==='dashboard'"/><OverviewView v-else-if="page==='overview'"/><PackageListView v-else-if="page==='packages'"/><SourcesView v-else-if="page==='parse'"/><section v-else-if="page==='collaboration' && !pkg.items.length && !batchPackageIds.some(id=>packages.some(item=>item.id===id&&item.items.length))" class="panel empty"><h2>尚未生成货物项</h2><p>先添加资料并启动演示解析。</p><Button @click="page='parse'">添加资料并解析</Button></section><CollaborationView v-else-if="page==='collaboration'"/><AggregateWorkflowView v-else-if="hasBatchSelection && ['bom','finance','quotes'].includes(page)" :view="page as 'bom'|'finance'|'quotes'"/><BomView v-else-if="page==='bom'"/><FinanceView v-else-if="page==='finance'"/><QuotesView v-else-if="page==='quotes'"/><RulesView v-else-if="page==='rules'"/><DataGovernanceView v-else-if="page==='data-governance'"/><UserManagementView v-else-if="page==='user-management'"/><RoleManagementView v-else-if="page==='roles'"/><ArchiveView v-else-if="page==='archive'"/><ApprovalWorkflowView v-else-if="page==='approval-workflow'"/><PhaseView v-else :phase="page"/></main></div>
 <NewInquiryDialog/><PackageScope v-if="workflowPackages.length" :key="`${person}:${workflowPackages[0].id}`" :package-id="workflowPackages[0].id"><ProjectHistorySheet v-model="historyOpen"/></PackageScope><div v-if="notice" class="toast" role="status"><AppIcon name="info"/>{{notice}}</div><FormDialog v-model="resetOpen" title="重置本地演示" description="清除本地全部项目、报价包、操作记录和报价快照。重置后列表为空，可重新导入项目。"><Button @click="act('reset');resetOpen=false">清空并重置演示</Button></FormDialog>
</div></template>
