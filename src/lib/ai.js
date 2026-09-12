import { supabase } from './supabase'
import { selectRelevantContext, trimHistory } from './contextSelector'

// ─────────────────────────────────────────────
// Базовая функция вызова Groq через Edge Function
// ─────────────────────────────────────────────
async function callAI(messages, temperature = 0.3) {
  const { data, error } = await supabase.functions.invoke('openai-proxy', {
    body: { messages, model: 'openai/gpt-oss-20b', temperature },
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
}

/** Вытащить JSON из ответа модели (обрезает ```json ... ```) */
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
// 1. Обычный чат (уже было)
// ─────────────────────────────────────────────
export async function askAI({ question, context, history = [] }) {
  const relevantContext = selectRelevantContext(context || '', question)

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

  const answer = await callAI(messages, 0.3)
  return {
    answer,
    sources: relevantContext ? ['Загруженный материал (фрагменты)'] : [],
  }
}

// ─────────────────────────────────────────────
// 2. Конспект документа
// ─────────────────────────────────────────────
export async function summarizeDocument(text, { maxChunks = 5, onProgress } = {}) {
  if (!text || text.length < 200) throw new Error('Документ слишком короткий')

  // Разбиваем на равные куски и берём начало + конец + середину
  const chunks = []
  const step = Math.max(1, Math.floor(text.length / maxChunks))
  for (let i = 0; i < maxChunks && i * step < text.length; i++) {
    chunks.push(text.slice(i * step, (i + 1) * step))
  }

  const parts = []
  for (let i = 0; i < chunks.length; i++) {
    onProgress?.(`Обрабатываю часть ${i + 1} из ${chunks.length}…`)
    const sys = `Ты — Стади. Твоя задача — сделать краткий конспект фрагмента учебного материала.
Формат: 3–6 ключевых тезисов в виде маркированного списка.
Сохраняй важные термины, определения, формулы и примеры.
Отвечай на русском языке, только Markdown, без преамбул.`
    const answer = await callAI([
      { role: 'system', content: sys },
      { role: 'user', content: chunks[i] },
    ], 0.2)
    parts.push(answer)
    // Пауза между запросами — иначе сработает TPM-лимит Groq
    if (i < chunks.length - 1) await new Promise((r) => setTimeout(r, 4000))
  }

  onProgress?.('Собираю итоговый конспект…')
  const combineSys = `Ты — Стади. Ниже — конспекты частей одного документа.
Собери их в единый структурированный конспект на русском языке.
Формат:
# Заголовок документа (придумай сам по содержанию)
## Раздел 1
- тезис
- тезис
## Раздел 2
...
## Ключевые термины
- **Термин** — определение
Отвечай только Markdown, без лишних вступлений.`

  const combined = await callAI([
    { role: 'system', content: combineSys },
    { role: 'user', content: parts.join('\n\n---\n\n') },
  ], 0.3)

  return combined
}

// ─────────────────────────────────────────────
// 3. Тест (экзаменатор)
// ─────────────────────────────────────────────
export async function generateQuiz(text, { count = 5 } = {}) {
  const ctx = selectRelevantContext(text, 'определения термины ключевые понятия', 5000)

  const sys = `Ты — Стади-экзаменатор. Составь тест из ${count} вопросов по материалу.
Верни СТРОГО валидный JSON без пояснений:
{
  "questions": [
    {
      "q": "текст вопроса",
      "options": ["вариант 1", "вариант 2", "вариант 3", "вариант 4"],
      "correct": 0,
      "explanation": "почему этот ответ верный"
    }
  ]
}
Правила:
- ровно 4 варианта ответа на каждый вопрос
- correct — индекс правильного варианта (0–3)
- вопросы на русском языке, по существу материала
- никаких markdown-обёрток вокруг JSON`

  const raw = await callAI([
    { role: 'system', content: sys },
    { role: 'user', content: ctx },
  ], 0.4)

  return extractJSON(raw)
}

// ─────────────────────────────────────────────
// 4. Флеш-карточки
// ─────────────────────────────────────────────
export async function generateFlashcards(text, { count = 10 } = {}) {
  const ctx = selectRelevantContext(text, 'определения термины формулы даты события', 5000)

  const sys = `Ты — Стади. Составь ${count} флеш-карточек по материалу.
Верни СТРОГО валидный JSON:
{
  "cards": [
    { "front": "Термин или вопрос", "back": "Краткое определение или ответ" }
  ]
}
Правила:
- front — короткий (до 80 символов)
- back — ёмкий, 1–3 предложения
- только самое важное для запоминания
- русский язык, без markdown-обёрток вокруг JSON`

  const raw = await callAI([
    { role: 'system', content: sys },
    { role: 'user', content: ctx },
  ], 0.5)

  return extractJSON(raw)
}

// ─────────────────────────────────────────────
// 5. Mind map (Mermaid)
// ─────────────────────────────────────────────
export async function generateMindMap(text) {
  const ctx = selectRelevantContext(text, 'структура разделы темы подтемы связи', 5000)

  const sys = `Ты — Стади. Составь mind map (карту мыслей) по материалу.
Формат вывода — строго синтаксис Mermaid mindmap, начиная с "mindmap".
Пример структуры:
mindmap
  root((Тема))
    Раздел 1
      Подтема 1.1
      Подтема 1.2
    Раздел 2
      Подтема 2.1
Правила:
- только русские слова в узлах
- 2–3 уровня вложенности
- 5–9 ветвей первого уровня
- НЕ добавляй markdown-обёртки, преамбулы, пояснения — только код Mermaid
- первая строка должна быть ровно "mindmap"`

  const raw = await callAI([
    { role: 'system', content: sys },
    { role: 'user', content: ctx },
  ], 0.4)

  // Чистим на случай markdown-обёртки
  return raw
    .replace(/```mermaid/gi, '')
    .replace(/```/g, '')
    .trim()
}

// ─────────────────────────────────────────────
// 6. Перевод фрагмента
// ─────────────────────────────────────────────
export async function translateText(text, targetLang) {
  const sys = `Ты — переводчик. Переведи текст на ${targetLang}.
Сохрани структуру Markdown (заголовки, списки, выделения).
Верни только перевод, без пояснений.`

  return callAI([
    { role: 'system', content: sys },
    { role: 'user', content: text },
  ], 0.2)
}

// ─────────────────────────────────────────────
// 7. Только по документу (без ИИ-фантазий)
// ─────────────────────────────────────────────
export async function askDocumentOnly({ question, context }) {
  const relevant = selectRelevantContext(context || '', question, 5000)
  if (!relevant) {
    return {
      answer: 'В загруженном документе нет информации по этому вопросу.',
      sources: [],
    }
  }

  const sys = `Ты — Стади. Отвечай ТОЛЬКО на основе предоставленного текста.
Если ответа в тексте нет — так и скажи: «В документе нет ответа на этот вопрос».
Не используй свои общие знания. Не придумывай.
Формат: Markdown, списки, цитаты из текста в кавычках.`

  const answer = await callAI([
    { role: 'system', content: sys },
    { role: 'user', content: `Вопрос: ${question}\n\nТекст документа:\n${relevant}` },
  ], 0.2)

  return { answer, sources: ['Только загруженный материал'] }
}
