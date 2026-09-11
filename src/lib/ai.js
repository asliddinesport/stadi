import { supabase } from './supabase'
import { selectRelevantContext, trimHistory } from './contextSelector'

export async function askAI({ question, context, history = [] }) {
  // 🔥 Отбираем только релевантную часть документа — иначе превышаем TPM Groq
  const relevantContext = selectRelevantContext(context || '', question)

  const systemPrompt = `Ты — Стади, ИИ-помощник в обучении.
Отвечай на русском языке, чётко и структурированно.
Оформляй ответ в Markdown: используй заголовки, списки, **жирный текст**.
Если дан контекст материала — используй только его и ссылайся на источники.
Если контекста нет — ответь общими знаниями и предупреди об этом.

Контекст из учебного материала (фрагменты, наиболее релевантные вопросу):
${relevantContext || '(контекст отсутствует)'}`

  const messages = [
    { role: 'system', content: systemPrompt },
    // Оставляем только 4 последних сообщения — экономия токенов
    ...trimHistory(
      history.map((m) => ({ role: m.role, content: m.content })),
      4,
    ),
    { role: 'user', content: question },
  ]

  const { data, error } = await supabase.functions.invoke('openai-proxy', {
    body: { messages, model: 'openai/gpt-oss-20b', temperature: 0.3 },
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

  const answer = data?.choices?.[0]?.message?.content?.trim() || 'Пустой ответ'
  return {
    answer,
    sources: relevantContext ? ['Загруженный материал (фрагменты)'] : [],
  }
}
