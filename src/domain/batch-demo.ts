import type { Candidate, Item, Package } from './model.ts'
import { applyPartOption, eligiblePartOptions } from './part-selection.ts'

export function copyDemoItems(template: Item[], catalog: Candidate[], prefill: boolean): Item[] {
  const items: Item[] = JSON.parse(JSON.stringify(template))
  if (!prefill) return items
  for (const item of items) {
    item.source = `批量演示预填 · 货物项 ${item.id}`
    item.assignees = {}
    item.technicalChanges = []
    item.confirmed = true
    if (item.kind === '独立物资') continue
    const candidate = catalog.find(entry => entry.id === item.selected)
    item.model ||= candidate?.model || candidate?.spec || `DEMO-${item.id}`
    item.conductor ||= '400/50'
    item.voltage ||= '750 kV'
    let parts = item.partOverrides || candidate?.parts || []
    for (const part of [...parts]) {
      const option = eligiblePartOptions(part, item)[0]
      if (part.selection && option) {
        parts = applyPartOption(parts, part.row, option, { model: option.model, material: option.material || 'Q235', qty: String(part.qty ?? 1), u9: option.u9, drawing: option.drawing })
      }
    }
    item.partOverrides = parts.map(part => ({ ...part,
      model: part.model || `DEMO-PART-${part.row}`, qty: part.qty ?? 1,
      material: part.material || 'Q235', drawing: part.drawing || `DEMO-DRAWING-${part.row}`,
      u9: part.u9 || `DEMO-U9-${part.row}`, reference: undefined,
    }))
  }
  return items
}

// Shared uploads are one file pool. Names are only a prototype deduplication key,
// not the future production rule for matching documents to packages.
export function collectBatchFiles(packages: readonly Package[]): Package['files'] {
  return [...new Map(packages.flatMap(pkg => pkg.files).map(file => [file.name, { ...file }])).values()]
}
