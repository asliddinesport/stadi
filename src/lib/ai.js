import { supabase } from './supabase'

export async function askAI({ question, context, history = [] }) {
  const systemPrompt = `Ты — Стади, ИИ-помощник в обучении.
Отвечай на русском языке, чётко и структурированно.
Если дан контекст материала — используй только его и ссылайся на источники.
Если контекста нет — ответь общими знаниями и предупреди об этом.

Контекст из учебного материала:
${context || '(контекст отсутствует)'}`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6),
    { role: 'user', content: question },
  ]

  const { data, error } = await supabase.functions.invoke('openai-proxy', {
    body: { messages, model: 'openai/gpt-oss-20b', temperature: 0.3 },
  })
  if (error) throw new Error(error.message || 'Ошибка прокси')
  if (data?.error) throw new Error(data.error)

  const answer = data?.choices?.[0]?.message?.content?.trim() || 'Пустой ответ'
  return { answer, sources: context ? ['Загруженный материал'] : [] }
}
