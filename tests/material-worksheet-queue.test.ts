import test from 'node:test'
import assert from 'node:assert/strict'
import { runMaterialWorksheetQueue } from '../src/domain/material-worksheet-queue.ts'

const worksheets = [{ id: 'first' }, { id: 'second' }, { id: 'third' }]

test('按工作簿顺序逐张处理所选工作表并等待每张表反馈完成', async () => {
  const events: string[] = []
  const waits: number[] = []
  const controller = new AbortController()
  let clock = 0
  let activeParses = 0
  let maxActiveParses = 0

  const completed = await runMaterialWorksheetQueue({
    worksheets,
    selectedIds: ['third', 'first'],
    signal: controller.signal,
    minimumStepDurationMs: 1000,
    now: () => clock,
    yieldToUi: async () => undefined,
    wait: async duration => {
      waits.push(duration)
      clock += duration
      return true
    },
    parse: async worksheet => {
      events.push(`start:${worksheet.id}`)
      activeParses += 1
      maxActiveParses = Math.max(maxActiveParses, activeParses)
      clock += 150
      activeParses -= 1
      return worksheet.id
    },
    onError: (_worksheet, error) => { throw error },
    onStart: worksheet => events.push(`active:${worksheet.id}`),
    onResult: result => events.push(`done:${result}`),
  })

  assert.equal(completed, true)
  assert.deepEqual(events, [
    'active:first', 'start:first', 'done:first',
    'active:third', 'start:third', 'done:third',
  ])
  assert.deepEqual(waits, [850, 850])
  assert.equal(maxActiveParses, 1)
})

test('单张工作表解析失败后继续处理后续工作表', async () => {
  const results: Array<{ id: string; error: string }> = []
  const controller = new AbortController()

  const completed = await runMaterialWorksheetQueue({
    worksheets,
    selectedIds: ['first', 'second', 'third'],
    signal: controller.signal,
    minimumStepDurationMs: 0,
    yieldToUi: async () => undefined,
    parse: worksheet => {
      if (worksheet.id === 'second') throw new Error('无有效表头')
      return { id: worksheet.id, error: '' }
    },
    onError: (worksheet, error) => ({ id: worksheet.id, error: String(error) }),
    onStart: () => undefined,
    onResult: result => results.push(result),
  })

  assert.equal(completed, true)
  assert.deepEqual(results, [
    { id: 'first', error: '' },
    { id: 'second', error: 'Error: 无有效表头' },
    { id: 'third', error: '' },
  ])
})

test('等待期间取消会立即结束队列且不发布当前结果或运行下一张', async () => {
  const controller = new AbortController()
  const active: string[] = []
  const results: string[] = []

  const completed = await runMaterialWorksheetQueue({
    worksheets,
    selectedIds: ['first', 'second'],
    signal: controller.signal,
    minimumStepDurationMs: 1000,
    now: () => 0,
    yieldToUi: async () => undefined,
    wait: async (_duration, signal) => {
      controller.abort()
      return !signal.aborted
    },
    parse: worksheet => worksheet.id,
    onError: (_worksheet, error) => { throw error },
    onStart: worksheet => active.push(worksheet.id),
    onResult: result => results.push(result),
  })

  assert.equal(completed, false)
  assert.deepEqual(active, ['first'])
  assert.deepEqual(results, [])
})

test('解析函数中取消时不会回写迟到结果', async () => {
  const controller = new AbortController()
  const results: string[] = []

  const completed = await runMaterialWorksheetQueue({
    worksheets,
    selectedIds: ['first', 'second'],
    signal: controller.signal,
    minimumStepDurationMs: 0,
    yieldToUi: async () => undefined,
    parse: worksheet => {
      controller.abort()
      return worksheet.id
    },
    onError: (_worksheet, error) => { throw error },
    onStart: () => undefined,
    onResult: result => results.push(result),
  })

  assert.equal(completed, false)
  assert.deepEqual(results, [])
})
