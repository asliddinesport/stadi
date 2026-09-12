import { supabase } from './supabase'
import { selectRelevantContext, trimHistory } from './contextSelector'
import { hashQuestion, getCached, setCached } from './cache'
import { enqueue } from './queue'

// ─────────────────────────────────────────────
// Авто-выбор модели по сложности вопроса
// ─────────────────────────────────────────────
function pickModel(question) {
  const q = question.toLowerCase()
  const hardMarkers = [
    'докажи', 'выведи', 'объясни подробно', 'сравни', 'проанализируй',
    'напиши код', 'реши задачу', 'пошагово', 'разбери', 'аргументируй',
  ]
  const hard = hardMarkers.some((m) => q.includes(m)) || question.length > 200
  return hard ? 'openai/gpt-oss-120b' : 'openai/gpt-oss-20b'
}

async function callAI(messages, { temperature = 0.3, model } = {}) {
  const useModel = model || 'openai/gpt-oss-20b'
  return enqueue(async () => {
    const { data, error } = await supabase.functions.invoke('openai-proxy', {
      body: { messages, model: useModel, temperature },
    })

    if (error) {
      let details = error.message || 'Неизвестная ошибка'
      try {
        if (error.context) {
          if (typeof error.context.json === 'function') {
            const body = await error.context.json()
            details = body?.error?.message || body?.error || details
          } else if (typeof error.context.text === 'function') {
            details = await error.context.text()
          }
        }
      } catch (_) { /* ignore */ }
      throw new Error(details)
    }

    if (data?.error) {
      throw new Error(typeof data.error === 'string' ? data.error : data.error.message)
    }

    return data?.choices?.[0]?.message?.content?.trim() || ''
  })
}

function extractJSON(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  const raw = fenced ? fenced[1] : text
  const first = raw.indexOf('{')
  const firstArr = raw.indexOf('[')
  const start = firstArr !== -1 && (firstArr < first || first === -1) ? firstArr : first
  const last = Math.max(raw.lastIndexOf('}'), raw.lastIndexOf(']'))
  return JSON.parse(raw.slice(start, last + 1))
}

// ─────────────────────────────────────────────
// 1. Чат со Стади (с кэшем + авто-моделью)
// ─────────────────────────────────────────────
export async function askAI({ question, context, history = [] }) {
  const relevantContext = selectRelevantContext(context || '', question)
  const questionHash = hashQuestion(question, relevantContext)

  // Проверяем кэш
  const cached = await getCached(questionHash)
  if (cached) {
    return {
      answer: cached.answer,
      sources: relevantContext ? ['Загруженный материал (кэш)'] : [],
      cached: true,
    }
  }

  const systemPrompt = `Ты — Стади, ИИ-помощник в обучении.
Отвечай на русском языке, чётко и структурированно.
Оформляй ответ в Markdown: используй заголовки, списки, **жирный текст**.
Если дан контекст материала — используй только его и ссылайся на источники.
Если контекста нет — ответь общими знаниями и предупреди об этом.

Контекст:
${relevantContext || '(контекст отсутствует)'}`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...trimHistory(history.map((m) => ({ role: m.role, content: m.content })), 4),
    { role: 'user', content: question },
  ]

  const model = pickModel(question)
  const answer = await callAI(messages, { temperature: 0.3, model })

  // Пишем в кэш
  await setCached({ questionHash, question, answer, model })

  return {
    answer,
    sources: relevantContext ? ['Загруженный материал (фрагменты)'] : [],
  }
}

// ─────────────────────────────────────────────
// 2. Конспект
// ─────────────────────────────────────────────
export async function summarizeDocument(text, { maxChunks = 5, onProgress } = {}) {
  if (!text || text.length < 200) throw new Error('Документ слишком короткий')
  const chunks = []
  const step = Math.max(1, Math.floor(text.length / maxChunks))
  for (let i = 0; i < maxChunks && i * step < text.length; i++) {
    chunks.push(text.slice(i * step, (i + 1) * step))
  }
  const parts = []
  for (let i = 0; i < chunks.length; i++) {
    onProgress?.(`Обрабатываю часть ${i + 1} из ${chunks.length}…`)
    const sys = `Ты — Стади. Сделай краткий конспект фрагмента.
Формат: 3–6 ключевых тезисов маркированным списком.
Сохраняй важные термины, определения, формулы, примеры.
Только Markdown, без преамбул.`
    const answer = await callAI(
      [{ role: 'system', content: sys }, { role: 'user', content: chunks[i] }],
      { temperature: 0.2 },
    )
    parts.push(answer)
  }
  onProgress?.('Собираю итоговый конспект…')
  const combineSys = `Ты — Стади. Собери конспекты частей в единый структурированный конспект.
Формат:
# Заголовок
## Раздел
- тезис
## Ключевые термины
- **Термин** — определение
Только Markdown.`
  const combined = await callAI(
    [{ role: 'system', content: combineSys }, { role: 'user', content: parts.join('\n\n---\n\n') }],
    { temperature: 0.3 },
  )
  return combined
}

// ─────────────────────────────────────────────
// 3. Тест
// ─────────────────────────────────────────────
export async function generateQuiz(text, { count = 5 } = {}) {
  const ctx = selectRelevantContext(text, 'определения термины ключевые понятия', 5000)
  const sys = `Ты — Стади-экзаменатор. Составь тест из ${count} вопросов.
Верни СТРОГО валидный JSON:
{ "questions": [ { "q": "...", "options": ["a","b","c","d"], "correct": 0, "explanation": "..." } ] }
Правила: ровно 4 варианта, correct — индекс (0–3), русский, без markdown.`
  const raw = await callAI(
    [{ role: 'system', content: sys }, { role: 'user', content: ctx }],
    { temperature: 0.4 },
  )
  return extractJSON(raw)
}

// ─────────────────────────────────────────────
// 4. Флеш-карточки
// ─────────────────────────────────────────────
export async function generateFlashcards(text, { count = 10 } = {}) {
  const ctx = selectRelevantContext(text, 'определения термины формулы даты события', 5000)
  const sys = `Ты — Стади. Составь ${count} карточек.
Верни СТРОГО валидный JSON:
{ "cards": [ { "front": "Термин/вопрос", "back": "Определение/ответ" } ] }
front — до 80 символов, back — 1–3 предложения, русский, без markdown.`
  const raw = await callAI(
    [{ role: 'system', content: sys }, { role: 'user', content: ctx }],
    { temperature: 0.5 },
  )
  return extractJSON(raw)
}

// ─────────────────────────────────────────────
// 5. Mind map
// ─────────────────────────────────────────────
export async function generateMindMap(text) {
  const ctx = selectRelevantContext(text, 'структура разделы темы подтемы связи', 5000)
  const sys = `Ты — Стади. Составь mind map.
Формат строго Mermaid mindmap, первая строка — "mindmap".
Пример:
mindmap
  root((Тема))
    Раздел
      Подтема
Правила: русские узлы, 2–3 уровня, 5–9 ветвей, без markdown-обёрток.`
  const raw = await callAI(
    [{ role: 'system', content: sys }, { role: 'user', content: ctx }],
    { temperature: 0.4 },
  )
  return raw.replace(/```mermaid/gi, '').replace(/```/g, '').trim()
}

// ─────────────────────────────────────────────
// 6. Перевод
// ─────────────────────────────────────────────
export async function translateText(text, targetLang) {
  const sys = `Переведи текст на ${targetLang}.
Сохрани структуру Markdown (заголовки, списки, выделения).
Верни только перевод.`
  return callAI(
    [{ role: 'system', content: sys }, { role: 'user', content: text }],
    { temperature: 0.2 },
  )
}

// ─────────────────────────────────────────────
// 7. Только по документу
// ─────────────────────────────────────────────
export async function askDocumentOnly({ question, context }) {
  const relevant = selectRelevantContext(context || '', question, 5000)
  if (!relevant) {
    return {
      answer: 'В загруженном документе нет информации по этому вопросу.',
      sources: [],
    }
  }
  const sys = `Отвечай ТОЛЬКО на основе текста.
Если ответа нет — скажи: «В документе нет ответа».
Не используй общие знания. Формат: Markdown, списки, цитаты в кавычках.`
  const answer = await callAI(
    [{ role: 'system', content: sys },
     { role: 'user', content: `Вопрос: ${question}\n\nТекст:\n${relevant}` }],
    { temperature: 0.2 },
  )
  return { answer, sources: ['Только загруженный материал'] }
}
