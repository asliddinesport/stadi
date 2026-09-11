import { useEffect, useState } from 'react'
import { FileText, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Materials() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('materials')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
    if (!error) setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const remove = async (id) => {
    await supabase.from('materials').delete().eq('id', id)
    setItems((s) => s.filter((x) => x.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">
        Мои материалы
      </h1>
      {loading ? (
        <div className="text-slate-500 dark:text-slate-400">Загрузка…</div>
      ) : items.length === 0 ? (
        <div className="text-slate-500 dark:text-slate-400">
          Пока нет загруженных материалов.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="text-brand shrink-0" size={18} />
                <div className="min-w-0">
                  <div className="font-medium text-slate-800 dark:text-slate-100 truncate">
                    {it.name}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(it.created_at).toLocaleString('ru-RU')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => remove(it.id)}
                className="text-slate-400 hover:text-red-500 shrink-0 ml-3"
                aria-label="Удалить"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
