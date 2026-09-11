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
    const { data, error } = await supabase.from('materials').select('id, name, created_at').order('created_at', { ascending: false })
    if (!error) setItems(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [user])

  const remove = async (id) => {
    await supabase.from('materials').delete().eq('id', id)
    setItems((s) => s.filter((x) => x.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Мои материалы</h1>
      {loading ? <div className="text-slate-500">Загрузка…</div>
        : items.length === 0 ? <div className="text-slate-500">Пока нет загруженных материалов.</div>
        : <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileText className="text-brand" size={18} />
                  <div>
                    <div className="font-medium text-slate-800">{it.name}</div>
                    <div className="text-xs text-slate-400">{new Date(it.created_at).toLocaleString('ru-RU')}</div>
                  </div>
                </div>
                <button onClick={() => remove(it.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>}
    </div>
  )
}
