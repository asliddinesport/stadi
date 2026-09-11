/**
 * Простой keyword-based отбор релевантных чанков из большого текста.
 * Работает без embeddings — быстро, офлайн, укладывается в лимиты бесплатных API.
 *
 * Идея: разбиваем документ на абзацы, считаем пересечение слов вопроса
 * с каждым абзацем, берём топ-N самых релевантных.
 */

// Грубая оценка: 1 токен ≈ 3 символа для русского текста.
// 2000 токенов контекста ≈ 6000 символов — оставляем запас под ответ и историю.
const MAX_CONTEXT_CHARS = 6000
const MIN_CHUNK_LEN = 40 // слишком короткие абзацы игнорируем

/** Убираем стоп-слова и приводим к нижнему регистру */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2) // выбрасываем короткие служебные слова
}

/** Разбиваем текст на абзацы, склеиваем слишком короткие */
function splitIntoChunks(text) {
  const paragraphs = text
    .split(/\n\s*\n|\n(?=[А-ЯA-Z0-9])/)
    .map((p) => p.trim())
    .filter((p) => p.length >= MIN_CHUNK_LEN)

  // Склеиваем короткие абзацы между собой
  const chunks = []
  let buffer = ''
  for (const p of paragraphs) {
    if ((buffer + '\n\n' + p).length < 400) {
      buffer = buffer ? buffer + '\n\n' + p : p
    } else {
      if (buffer) chunks.push(buffer)
      buffer = p
    }
  }
  if (buffer) chunks.push(buffer)
  return chunks
}

/** Считаем релевантность чанка вопросу: пересечение слов */
function scoreChunk(chunkWords, queryWords) {
  const set = new Set(chunkWords)
  let score = 0
  for (const w of queryWords) if (set.has(w)) score++
  return score
}

/**
 * Возвращает наиболее релевантную часть документа, укладывающуюся в лимит.
 * Если вопрос не имеет пересечений — берёт первые чанки (обычно это введение).
 */
export function selectRelevantContext(fullText, question, maxChars = MAX_CONTEXT_CHARS) {
  if (!fullText) return ''
  if (fullText.length <= maxChars) return fullText

  const chunks = splitIntoChunks(fullText)
  const queryWords = normalize(question)

  const scored = chunks.map((chunk, i) => ({
    chunk,
    index: i,
    score: scoreChunk(normalize(chunk), queryWords),
  }))

  // Сортируем по релевантности, при равенстве — по порядку в документе
  scored.sort((a, b) => b.score - a.score || a.index - b.index)

  const picked = []
  let total = 0
  for (const { chunk, index } of scored) {
    if (total + chunk.length > maxChars) continue
    picked.push({ chunk, index })
    total += chunk.length + 2
    if (total >= maxChars * 0.9) break
  }

  // Возвращаем в исходном порядке, чтобы сохранить логику текста
  picked.sort((a, b) => a.index - b.index)
  return picked.map((p) => p.chunk).join('\n\n---\n\n')
}

/**
 * Ограничивает историю диалога — оставляем только последние N сообщений,
 * чтобы не раздувать запрос.
 */
export function trimHistory(history, maxMessages = 4) {
  return history.slice(-maxMessages)
}
