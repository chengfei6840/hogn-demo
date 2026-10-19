import type { Package, Project } from './model'

export function ensureMaterialWorksheetOwnership(project:Project):void {
 if(!project.packages.length&&!project.materialWorksheets?.length)return
 if(!project.materialWorksheets?.length)project.materialWorksheets=[{id:'uncategorized',name:'未分类',order:0}]
 const known=new Set(project.materialWorksheets.map(sheet=>sheet.id))
 if(project.packages.some(pkg=>!pkg.materialWorksheetId||!known.has(pkg.materialWorksheetId))&&!known.has('uncategorized'))project.materialWorksheets.push({id:'uncategorized',name:'未分类',order:project.materialWorksheets.length})
 const fallback=project.materialWorksheets.find(sheet=>sheet.id==='uncategorized')?.id||project.materialWorksheets[0].id
 for(const pkg of project.packages)if(!pkg.materialWorksheetId||!known.has(pkg.materialWorksheetId))pkg.materialWorksheetId=fallback
}

export function packageWorksheetId(pkg:Package,project:Project):string {
 return project.materialWorksheets?.some(sheet=>sheet.id===pkg.materialWorksheetId)
  ? pkg.materialWorksheetId!
  : project.materialWorksheets?.find(sheet=>sheet.id==='uncategorized')?.id||project.materialWorksheets?.[0]?.id||'uncategorized'
}
