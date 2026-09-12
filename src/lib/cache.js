import { supabase } from './supabase'

/** Простой хеш (djb2) для ключа кэша */
export function hashQuestion(question, context) {
  const str = (question + '||' + (context || '').slice(0, 500)).trim().toLowerCase()
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0
  }
  return String(h >>> 0)
}

/** Найти ответ в кэше */
export async function getCached(questionHash) {
  const { data } = await supabase
    .from('ai_cache')
    .select('answer, model')
    .eq('question_hash', questionHash)
    .maybeSingle()
  return data
}

/** Сохранить ответ в кэш */
export async function setCached({ questionHash, question, answer, model }) {
  // Игнорируем ошибки — кэш не критичен
  try {
    await supabase.from('ai_cache').insert({
      question_hash: questionHash,
      question: question.slice(0, 500),
      answer,
      model,
    })
  } catch (_) { /* ignore */ }
}
