import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createPackage } from '../src/domain/seed.ts'
import { retrieveCandidates } from '../src/domain/retrieval.ts'
const catalog=JSON.parse(readFileSync(new URL('../src/data/catalog.json',import.meta.url),'utf8'))
test('自动召回按记录ID合并来源，不合并同型号不同记录',()=>{
 const item=createPackage(catalog,'HG-20260908-001','包11 · GW100','P1').items[2]
 const hits=retrieveCandidates(catalog,item)
 assert.equal(new Set(hits.map(h=>h.candidate.id)).size,hits.length)
 assert(hits.find(h=>h.candidate.id==='C13'))
 assert(hits.find(h=>h.candidate.id==='C12'))
 assert.equal(hits[0].candidate.id,'C13')
 assert(hits.some(h=>h.routes.length>1))
})
test('自动补充召回只在主路径无结果时触发，指定编码不自动改路径',()=>{
 const item=createPackage(catalog,'HG-20260908-001','包11 · GW100','P1').items[0];item.spec='NO-SUCH-SPEC';item.model='';item.atlas=''
 assert.equal(retrieveCandidates(catalog,item,'0','750').length,0)
 const fallback=retrieveCandidates(catalog,item,'auto','750')
 assert(fallback.length>0);assert(fallback.every(h=>h.routes.length===1&&h.routes[0]===3))
})
test('排除项和独立物资不召回金具串',()=>{
 const p=createPackage(catalog,'HG-20260908-001','包11 · GW100','P1');assert.equal(retrieveCandidates(catalog,p.items[3]).length,0)
 p.items[0].excluded=true;assert.equal(retrieveCandidates(catalog,p.items[0]).length,0)
})
