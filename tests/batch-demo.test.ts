import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { copyDemoItems, collectBatchFiles } from '../src/domain/batch-demo.ts'
import { createPackage } from '../src/domain/seed.ts'
import { confirmEntries, technicalCompletionIssues, type Candidate } from '../src/domain/model.ts'
const catalog = JSON.parse(readFileSync(new URL('../src/data/catalog.json', import.meta.url),'utf8')) as Candidate[]

test('仅首包保留演示缺项，其余包真实填满串与子件字段', () => {
  const first = createPackage(catalog,'project','包2','P2')
  const baseline = JSON.stringify(first)
  const second = createPackage(catalog,'project','包1','P33')
  second.items = copyDemoItems(first.items,catalog,true)
  assert.ok(confirmEntries(first).length > 0)
  assert.ok(technicalCompletionIssues(first,catalog).length > 0)
  assert.deepEqual(confirmEntries(second),[])
  assert.deepEqual(technicalCompletionIssues(second,catalog),[])
  assert.ok(second.items.every(item=>item.confirmed))
  assert.deepEqual(second.items.map(item=>item.name),first.items.map(item=>item.name))
  assert.equal(JSON.stringify(first),baseline)
  second.items[0].name='仅修改复制包'
  assert.notEqual(first.items[0].name,second.items[0].name)
})

test('统一资料池去重且不修改包的原资料；首包缺项复制保持独立', () => {
  const first=createPackage(catalog,'p','包1','P1')
  const second=createPackage(catalog,'p','包2','P2')
  const files=collectBatchFiles([first,second])
  assert.equal(files.length,first.files.length)
  files[0].status='统一解析完成'
  assert.notEqual(first.files[0].status,files[0].status)
  const copy=copyDemoItems(first.items,catalog,false)
  copy[0].name='临时编辑'
  assert.notEqual(copy[0].name,first.items[0].name)
})
