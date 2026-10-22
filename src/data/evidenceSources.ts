// public/ 下静态资源必须拼 base 前缀，否则部署到 GitHub Pages 子路径时会 404。
import { asset } from '@/lib/asset'

export type EvidenceSourceId = 'requirements' | 'atlas'

export interface EvidenceSource {
  id: EvidenceSourceId
  label: string
  image: string
  sourceText: string
  highlightClass: EvidenceSourceId
}

export const evidenceSources: EvidenceSource[] = [
  {
    id: 'requirements',
    label: '国家电网公司总部_一级省公司固化ID修编（9111-500085186-00077）',
    image: asset('parts-source-id.png'),
    sourceText: '来源：国家电网公司总部_一级省公司固化ID修编（9111-500085186-00077） · 第 2 页',
    highlightClass: 'requirements'
  },
  {
    id: 'atlas',
    label: '220kV输电线路金具分册（2011版串图）',
    image: asset('parts-source-atlas.png'),
    sourceText: '来源：220kV输电线路金具分册（2011版串图） · 图 5-1-1 2XD11—0000—07P—1A',
    highlightClass: 'atlas'
  }
]
