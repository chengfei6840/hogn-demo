import { findCandidates, candidateDifferences, type Candidate, type Item } from './model.ts'
export interface RetrievalHit { candidate: Candidate; routes: number[] }
export function retrieveCandidates(catalog: Candidate[], item: Item, mode = 'auto', query = ''): RetrievalHit[] {
 if (item.kind !== '金具串' || item.excluded) return []
 const routes = mode === 'auto' ? [0, 1, 2].filter(r => r === 0 ? !!item.spec : r === 1 ? !!item.model : !!item.atlas) : [Number(mode)]
 const hits = new Map<string, RetrievalHit>()
 function collect(route: number) {
  for (const candidate of findCandidates(catalog, item, route, query)) {
   const hit = hits.get(candidate.id)
   if (hit) hit.routes.push(route)
   else hits.set(candidate.id, { candidate, routes: [route] })
  }
 }
 routes.forEach(collect)
 if (mode === 'auto' && !hits.size) collect(3)
 return [...hits.values()].sort((a,b) => candidateDifferences(item,a.candidate).length-candidateDifferences(item,b.candidate).length)
}
