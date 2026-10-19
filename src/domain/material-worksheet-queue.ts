export interface WorksheetQueueItem {
  id: string
}

interface MaterialWorksheetQueueOptions<TWorksheet extends WorksheetQueueItem, TResult> {
  worksheets: readonly TWorksheet[]
  selectedIds: readonly string[]
  signal: AbortSignal
  parse: (worksheet: TWorksheet) => TResult | Promise<TResult>
  onError: (worksheet: TWorksheet, error: unknown) => TResult
  onStart: (worksheet: TWorksheet, index: number, total: number) => void
  onResult: (result: TResult, worksheet: TWorksheet, index: number, total: number) => void
  minimumStepDurationMs?: number
  yieldToUi?: () => Promise<void>
  wait?: (durationMs: number, signal: AbortSignal) => Promise<boolean>
  now?: () => number
}

function yieldToBrowserPaint(): Promise<void> {
  return new Promise(resolve => {
    if (typeof requestAnimationFrame !== 'function') {
      setTimeout(resolve, 0)
      return
    }
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

function waitUnlessAborted(durationMs: number, signal: AbortSignal): Promise<boolean> {
  if (signal.aborted) return Promise.resolve(false)

  return new Promise(resolve => {
    const finish = (completed: boolean) => {
      clearTimeout(timer)
      signal.removeEventListener('abort', onAbort)
      resolve(completed)
    }
    const onAbort = () => finish(false)
    const timer = setTimeout(() => finish(true), durationMs)
    signal.addEventListener('abort', onAbort, { once: true })
    if (signal.aborted) finish(false)
  })
}

export async function runMaterialWorksheetQueue<TWorksheet extends WorksheetQueueItem, TResult>({
  worksheets,
  selectedIds,
  signal,
  parse,
  onError,
  onStart,
  onResult,
  minimumStepDurationMs = 1000,
  yieldToUi = yieldToBrowserPaint,
  wait = waitUnlessAborted,
  now = Date.now,
}: MaterialWorksheetQueueOptions<TWorksheet, TResult>): Promise<boolean> {
  const selected = new Set(selectedIds)
  const queue = worksheets.filter(worksheet => selected.has(worksheet.id))

  for (let index = 0; index < queue.length; index += 1) {
    if (signal.aborted) return false

    const worksheet = queue[index]
    const startedAt = now()
    onStart(worksheet, index, queue.length)
    await yieldToUi()
    if (signal.aborted) return false

    let result: TResult
    try {
      result = await parse(worksheet)
    } catch (error) {
      result = onError(worksheet, error)
    }

    const remainingDuration = Math.max(0, minimumStepDurationMs - (now() - startedAt))
    if (remainingDuration && !await wait(remainingDuration, signal)) return false
    if (signal.aborted) return false

    onResult(result, worksheet, index, queue.length)
  }

  return !signal.aborted
}
