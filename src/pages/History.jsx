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
      const { data } = await supabase.from('history').select('id, question, answer, created_at').order('created_at', { ascending: false }).limit(100)
      setItems(data || []); setLoading(false)
    })()
  }, [user])

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">История вопросов</h1>
      {loading ? <div className="text-slate-500">Загрузка…</div>
        : items.length === 0 ? <div className="text-slate-500">История пуста.</div>
        : <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
                <div className="text-xs text-slate-400 mb-1">{new Date(it.created_at).toLocaleString('ru-RU')}</div>
                <div className="font-medium text-slate-800 mb-2">❓ {it.question}</div>
                <div className="text-sm text-slate-600 whitespace-pre-wrap">{it.answer}</div>
              </div>
            ))}
          </div>}
    </div>
  )
}
