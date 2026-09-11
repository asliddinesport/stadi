import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function History() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const { data } = await supabase
        .from('history')
        .select('id, question, answer, created_at')
        .order('created_at', { ascending: false })
        .limit(100)
      setItems(data || [])
      setLoading(false)
    })()
  }, [user])

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">
        История вопросов
      </h1>
      {loading ? (
        <div className="text-slate-500 dark:text-slate-400">Загрузка…</div>
      ) : items.length === 0 ? (
        <div className="text-slate-500 dark:text-slate-400">История пуста.</div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <div
              key={it.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 transition-colors"
            >
              <div className="text-xs text-slate-400 dark:text-slate-500 mb-1">
                {new Date(it.created_at).toLocaleString('ru-RU')}
              </div>
              <div className="font-medium text-slate-800 dark:text-slate-100 mb-2">
                ❓ {it.question}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                {it.answer}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
