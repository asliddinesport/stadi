/**
 * Простая очередь с последовательным выполнением и паузой между запросами.
 * Защищает от 429 Too Many Requests от Groq при быстрых вопросах подряд.
 */
let chain = Promise.resolve()

export function enqueue(fn, gapMs = 1200) {
  const run = chain.then(async () => {
    const result = await fn()
    // Пауза после каждого запроса
    await new Promise((r) => setTimeout(r, gapMs))
    return result
  })
  // chain всегда должен быть успешным, иначе следующий встанет
  chain = run.catch(() => {})
  return run
}
