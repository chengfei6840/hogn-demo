<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useWorkspace } from '@/domain/store'
import { displayRoleText, type Package } from '@/domain/model'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AppIcon from './AppIcon.vue'
import AppSelect from './AppSelect.vue'
import StatusBadge from './StatusBadge.vue'

const open = defineModel<boolean>({ required: true })
const { package: pkg, project } = useWorkspace()
type Run = NonNullable<Package['approvalRun']>
type Entry = { id:string; person:string; role:string; title:string; stage:string; time:string; detail:string; status?:string; version?:string }

const tab = shallowRef<'operations' | 'approvals'>('operations')
const query = shallowRef('')
// reka 的 SelectItem 不接受空字符串 value（Select 用空串表示清空选择、显示占位符），所以筛选用非空哨兵值。
const stage = shallowRef('all')
const ascending = shallowRef(false)

// 操作记录不含阶段字段，只能按动作名归入流程环节；审批节点名由流程设计器自定义，所以末尾要留兜底桶。
const stageRules: [RegExp, string][] = [
  [/资料|解析|新建报价包/, '资料解析'],
  [/客户需求|销售确认/, '销售需求确认'],
  [/审批配置/, '审批配置'],
  [/审批|签发|退回|董事长|通过/, '审批签发'],
  [/核价|成本|报价方案|报价范围|提交财务/, '成本核算与方案选择'],
  [/技术|串型|子件|单件金具/, '技术选项确认'],
  [/外发/, '销售外发'],
  [/成交|归档|版本/, '成交追踪'],
  [/问题|补充/, '询价协作'],
]
function actionStage(action:string) {
  const text = displayRoleText(action)
  return stageRules.find(([pattern]) => pattern.test(text))?.[1] || '流程审批'
}
// log() 把操作人拼在 detail 首位（人员；详情），Audit 本身没有 operator 字段，按首个分号切开还原。
function splitDetail(detail:string) {
  const at = detail.indexOf('；')
  return at < 0 ? { person: '', detail } : { person: detail.slice(0, at), detail: detail.slice(at + 1) }
}
function personName(person:string) { return !person ? '操作人未记录' : person.includes('·') ? person.split('·').pop()!.trim() || person : person }
function initialOf(person:string) { return person ? personName(person).slice(0, 1) : '?' }
const operations = computed<Entry[]>(() => pkg.audit.map((a, n) => {
  const parts = splitDetail(a.detail)
  return {
    id: 'op-' + n + '-' + a.at, person: parts.person, role: displayRoleText(a.role), title: displayRoleText(a.action),
    stage: actionStage(a.action), time: a.at, detail: displayRoleText(parts.detail), version: 'V' + a.version,
  }
}))
// ApprovalRun 没有 submittedBy：提交人取本包「提交审批签发」留痕里时间最接近本次提交时刻的一条。
function submitterOf(run:Run) {
  const submitted = pkg.audit.filter(a => a.action === '提交审批签发')
  if (!submitted.length) return ''
  const target = Date.parse(run.startedAt)
  const best = submitted.reduce((a, b) => Math.abs(Date.parse(b.at) - target) < Math.abs(Date.parse(a.at) - target) ? b : a)
  return splitDetail(best.detail).person
}
// 退回会把节点重置为 pending 并清空意见，所以只列已办与未触发节点，退回本身另起一条留痕。
const approvals = computed<Entry[]>(() => {
  const runs: Run[] = [...(pkg.approvalRun ? [pkg.approvalRun] : []), ...(pkg.approvalHistory || [])]
  return runs.flatMap(run => {
    const version = 'V' + run.requestVersion
    const entries: Entry[] = [{
      id: run.recordId + '-' + run.startedAt + '-submit', person: submitterOf(run), role: '提交人', title: '提交报价审批', stage: '审批签发',
      time: run.startedAt, status: '已提交', version, detail: run.recordName + ' V' + run.recordVersion + ' · 需求版本 ' + version + '\n核价依据：' + run.basis,
    }]
    run.steps.forEach((step, n) => {
      if (step.status === 'pending') return
      entries.push({
        id: run.recordId + '-' + run.startedAt + '-' + n, person: step.assignee, role: displayRoleText(step.role), title: displayRoleText(step.name),
        stage: '审批签发', time: step.completedAt || run.startedAt, version,
        status: step.status === 'skipped' ? '未触发' : step.action === 'issue' ? '已签发' : '审批通过',
        detail: step.status === 'skipped' ? '该节点按当前金额与毛利判断未触发，无需处理。' : displayRoleText(step.opinion || '未填写审批意见'),
      })
    })
    if (run.status === 'returned') entries.push({
      id: run.recordId + '-' + run.startedAt + '-returned', person: run.returnedBy || '', role: '退回人', title: '审批退回', stage: '审批签发',
      time: run.returnedAt || run.startedAt, status: '审批退回', version, detail: run.returnReason || '未填写退回原因',
    })
    return entries
  })
})
const base = computed<Entry[]>(() => tab.value === 'operations' ? operations.value : approvals.value)
const stageOptions = computed(() => [{ value: 'all', label: '全部阶段' }, ...[...new Set(base.value.map(e => e.stage))].map(s => ({ value: s, label: s }))])
const filtered = computed(() => base.value
  .filter(e => (stage.value === 'all' || e.stage === stage.value) && `${e.person} ${e.title} ${e.detail} ${e.role} ${e.version || ''}`.toLowerCase().includes(query.value.trim().toLowerCase()))
  .sort((a, b) => (timeValue(b.time) - timeValue(a.time)) * (ascending.value ? -1 : 1)))
function timeValue(time:string) { const parsed = Date.parse(time); return Number.isNaN(parsed) ? 0 : parsed }
function switchTab(next:'operations' | 'approvals') { tab.value = next; stage.value = 'all' }
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent side="right" class="history-sheet" aria-label="报价流程记录">
      <SheetHeader class="history-sheet-header">
        <SheetTitle>报价流程记录<StatusBadge :text="pkg.stage" /></SheetTitle>
        <p class="muted">{{project.name}} · {{pkg.packageName}} · {{pkg.id}} · V{{pkg.version}}</p>
      </SheetHeader>
      <div class="history-tabs" role="group" aria-label="记录类别">
        <button type="button" :class="{active:tab==='operations'}" :aria-pressed="tab==='operations'" @click="switchTab('operations')">操作记录 {{operations.length}}</button>
        <button type="button" :class="{active:tab==='approvals'}" :aria-pressed="tab==='approvals'" @click="switchTab('approvals')">审批记录 {{approvals.length}}</button>
      </div>
      <div class="history-sheet-body">
        <div class="history-toolbar">
          <div class="history-search"><AppIcon name="magnifying-glass" :size="14"/><Input v-model="query" aria-label="搜索流程记录" placeholder="搜索人员、操作或详情"/></div>
          <AppSelect v-model="stage" label="筛选记录阶段" :options="stageOptions"/>
          <Button variant="outline" size="sm" @click="ascending=!ascending">{{ascending?'最早优先 ↑':'最新优先 ↓'}}</Button>
        </div>
        <p class="history-count">{{filtered.length}} 条记录 · {{tab==='operations' ? '当前报价包的操作留痕，不含其他报价包记录' : '仅显示已提交或已执行的审批节点，不包含待审批节点'}}</p>
        <ol v-if="filtered.length" class="history-timeline">
          <li v-for="entry in filtered" :key="entry.id" class="history-node">
            <span class="history-dot"></span>
            <div class="history-meta"><time>{{entry.time || '时间未记录'}}</time><span>{{entry.stage}}{{entry.version ? ' · '+entry.version : ''}}</span></div>
            <article class="history-card">
              <h3>{{entry.title}}<StatusBadge v-if="entry.status" :text="entry.status"/></h3>
              <div class="history-person"><span class="avatar">{{initialOf(entry.person)}}</span><strong>{{personName(entry.person)}}</strong><span>{{entry.role}}</span></div>
              <details><summary>查看操作详情</summary><p>{{entry.detail || '未记录详情'}}</p></details>
            </article>
          </li>
        </ol>
        <div v-else class="empty"><AppIcon name="clock-counter-clockwise" :size="30"/><h3>{{base.length ? '没有匹配的记录' : '暂无已记录的历史操作'}}</h3><p>不会根据当前状态推测或补造历史记录。</p></div>
      </div>
      <footer class="history-foot">只读记录 · 不提供编辑和删除操作</footer>
    </SheetContent>
  </Sheet>
</template>
