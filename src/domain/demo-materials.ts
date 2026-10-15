import manifest from '../data/demo-package-materials.json'
import type { Package } from './model'

export interface DemoMaterial { name:string; type:string; sourceUrl:string }
const packageMaterials=manifest as Record<string,DemoMaterial[]>

export function demoMaterialsForPackage(pkg:Pick<Package,'packageName'|'materialSummary'>):DemoMaterial[]{
 const number=/包\s*(\d+)/.exec(pkg.materialSummary?.packageName||pkg.packageName)?.[1]
 return number?packageMaterials[number]||[]:[]
}
