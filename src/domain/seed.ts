import { defaultPricingSchemes, type Candidate, type Item, type Package } from './model.ts'
import { goodsListRows } from '../data/goodsList.ts'
import { goodsHitRowByItem } from '../data/sourceSheets.ts'
import { demoPartOverrides } from '../data/demoPartSelections.ts'
// 一键载入的演示资料：与 createPackage 出厂文件同源，避免两处各写一份。
export const demoFiles:{name:string;type:string;status:string}[]=[{name:'演示询价资料.zip',type:'ZIP',status:'演示清点完成'},{name:'演示询价资料.zip / 货物清单.xlsx',type:'Excel',status:'演示解析完成'},{name:'演示询价资料.zip / 技术规范.docx',type:'Word',status:'演示解析完成'},{name:'演示询价资料.zip / 附图.pdf',type:'PDF',status:'待核对'}]
export function createPackage(catalog:Candidate[], projectId: string, packageName: string, packageNo: string):Package {
 // C21 无串型号，只能按技术规范编码命中；客户清单里的跳线串型号是串内结构描述，不是 catalog 的 model。
 const exact=catalog.find(c=>c.spec==='9111-500085186-00026')!
 // 演示数据中的货物项 02 直接绑定同型号的现有分解记录，打开子件页即可展示完整子件。
 const item02=catalog.find(c=>c.model==='06XZ11-4000-10P(H)-2A护')
 const atlas=catalog.find(c=>c.model.includes('7X2-4055') && c.description==='400/50') || catalog.find(c=>c.name.startsWith('66kV'))
 const mk=(id:string,name:string,quantity:number,c?:Candidate):Item=>({goodsList:goodsListRows[id],goodsRow:goodsHitRowByItem[id],id,name,quantity,unit:'套',model:c?.model||'',spec:c?.spec||'',conductor:'400/50',voltage:'750 kV',atlas:c?.atlas||'',drawing:c?.drawing||'',kind:'金具串',route:0,selected:c?.id||'',confirmed:false,excluded:false,exclusionReason:'',source:'演示询价清单.xlsx · 货物项 '+id,original:{名称:name,数量:String(quantity),导线:'400/50'},price:0,cost:0})
 const a=mk('01',exact.name,26,exact)
 const b=mk('02','66kV导线悬垂通用,06XZ11-4000-10P(H)-2A护',38,item02);b.model='06XZ11-4000-10P(H)-2A护';b.spec='';b.atlas='';b.drawing='';b.conductor='';b.voltage='66 kV';b.route=1;b.original.导线='原资料未给出'
 const c=mk('03',atlas?.name||'750 kV 导线悬垂通用',12,atlas);c.spec='';c.route=2
 // 原货物项仅去掉护/铝标记，导线沿用销售值；候选演示只替换两条串内的相关子件。
 c.model=c.model.replace(/(护|铝)$/,'');c.name=c.name.replace(/(护|铝)$/,'')
 c.goodsList={...c.goodsList,物资描述:(c.goodsList?.物资描述||'').replace(/(护|铝)$/,'')}
 a.partOverrides=demoPartOverrides(a,exact.parts)
 if(item02)b.partOverrides=demoPartOverrides(b,item02.parts)
 if(atlas)c.partOverrides=demoPartOverrides(c,atlas.parts)
 const d=mk('04','保护金具-间隔棒,FJZF-640/28',48);d.kind='独立物资';d.unit='支';d.selected='item:04';d.confirmed=false;d.exclusionReason='单件金具与金具串并列纳入本包报价';d.route=3
 return {
  id: `${projectId}-${packageNo}`,
  projectId,
  packageName,
  packageNo,
  voltageLevel:'750千伏',
  stage:'并行协作',
  version:1,
  salesConfirmed:null,
  techConfirmed:null,
  technicalReviewRequired:true,
  items:[a,b,c,d],
  files:JSON.parse(JSON.stringify(demoFiles)),
  audit:[],
  snapshots:[],
  pricingNote:'',
  tax:13,
  manualBoss:false,
  pricingSchemes:JSON.parse(JSON.stringify(defaultPricingSchemes)),
  selectedSchemeId:'standard',
  settings:{amountThreshold:null,marginFloor:null},
  createdAt:new Date().toLocaleString('zh-CN')
 }
}
