import type { Audit, Candidate, Item, Package, Part, TechnicalChange } from './model.ts'

export type OperationRole = '销售' | '技术' | '财务'
export interface OperationEntry {
  id: string
  audit: Audit
  kind: 'item' | 'part' | 'finance'
  item?: Item
  part?: Part
  legacy: boolean
  object: string
  label: string
  before: string
  after: string
  actor: string
  time: string
  changes: TechnicalChange['changes']
}
const roles: OperationRole[] = ['销售', '技术', '财务']
const actions = /^(修改客户需求解析信息|调整报价范围|修改技术串型|修改串型参数并重新匹配|修改技术子件|财务修改子件成本|财务修改单件成本|财务修改货物项核价)$/
const partLabels: Record<string, string> = { name: '名称', model: '型号', qty: '用量', unit: '单位', material: '材质', weight: '重量', u9: 'U9编码', drawing: '图号', processRoute: '工艺路线', selection: '候选选型', reference: '参考子件', cost: '核算单价' }

function itemFor(pkg: Package, audit: Audit) {
  if (audit.context?.itemSnapshot) return audit.context.itemSnapshot
  const id = audit.context?.itemId || /(?:货物项\s*)?(\d+)\s*[：；]/.exec(audit.detail.split('；').slice(1).join('；'))?.[1]
  return pkg.items.find(item => item.id === id)
}
function changesFor(audit: Audit, item?: Item): TechnicalChange['changes'] {
  if (audit.context?.changes?.length) return audit.context.changes
  const technical = item?.technicalChanges?.find(change => change.at === audit.at && change.role === audit.role && (!change.reason || audit.detail.includes(change.reason)))
  if (technical) return technical.changes
  // 旧财务日志只有可读文本；仅提取明确记录的前后数字，不补造历史值。
  const match = /单位成本\s+([\d.]+)\s*→\s*([\d.]+)/.exec(audit.detail)
  return match ? [{ field: 'cost', label: '单位成本', before: Number(match[1]), after: Number(match[2]) }] : []
}
function valueText(value: string | number | null, field: string, item: Item | undefined, catalog: Candidate[]) {
  if (value === null || value === '') return '待确认'
  if (field === 'selected') return catalog.find(candidate => candidate.id === value)?.model || String(value)
  if (typeof value !== 'number') return String(value)
  if (field === 'margin') return `${value}%`
  if (field === 'price' || field === 'cost' || /^part\.\d+\.cost$/.test(field)) return `¥${value.toFixed(4)}`
  if (field === 'quantity') return `${value} ${item?.unit || ''}`.trim()
  return String(value)
}
function shortTime(at: string) {
  const date = new Date(at)
  if (Number.isNaN(date.getTime())) return at
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
export function groupedOperationRecords(pkg: Package, catalog: Candidate[]) {
  const groups: Record<OperationRole, OperationEntry[]> = { 销售: [], 技术: [], 财务: [] }
  pkg.audit.forEach((audit, index) => {
    if (!roles.includes(audit.role as OperationRole) || (!audit.context && !actions.test(audit.action))) return
    const item = itemFor(pkg, audit)
    const changes = changesFor(audit, item)
    const rows = changes.length ? changes : [{ field: '', label: audit.action, before: null, after: null }]
    rows.forEach((change, fieldIndex) => {
      const partMatch = /^part\.(\d+)\.(.+)/.exec(change.field)
      const partRow = partMatch ? Number(partMatch[1]) : audit.context?.partRow
      const parts = item?.partOverrides || catalog.find(candidate => candidate.id === item?.selected)?.parts || []
      const part = audit.context?.partSnapshot?.row === partRow ? audit.context.partSnapshot : parts.find(part => part.row === partRow)
      const kind = partRow !== undefined ? 'part' : audit.role === '财务' ? 'finance' : 'item'
      groups[audit.role as OperationRole].push({
        id: `${index}-${fieldIndex}`, audit, kind, item, part, legacy: !audit.context,
        object: partRow !== undefined ? `子件${String(Math.max(1,parts.findIndex(part=>part.row===partRow)+1)).padStart(2,'0')}` : item ? `货物项${item.id}` : '报价包',
        label: partMatch ? partLabels[partMatch[2]] || change.label : change.label,
        before: change.field ? valueText(change.before,change.field,item,catalog) : '未记录字段前后值',
        after: change.field ? valueText(change.after,change.field,item,catalog) : '查看详情',
        actor: audit.detail.split('；')[0]?.split('·').pop()?.trim() || audit.role,
        time: shortTime(audit.at), changes: change.field ? [change] : [],
      })
    })
  })
  return groups
}
