import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { MessageSquare, Trash2, Plus, Search } from 'lucide-react'
import { useChats } from '../context/ChatContext'
import { deleteChat } from '../lib/chats'

export default function ChatList() {
  const { chats, refresh, activeChatId, setActiveChatId } = useChats()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    (c.material_name || '').toLowerCase().includes(query.toLowerCase()),
  )

  const startNew = () => {
    setActiveChatId(null)
    navigate('/')
  }

  const remove = async (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Удалить этот чат?')) return
    await deleteChat(id)
    await refresh()
    if (activeChatId === id) navigate('/')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center justify-between mb-5 gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          История чатов
        </h1>
        <button
          onClick={startNew}
          className="flex items-center gap-2 bg-brand hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl"
        >
          <Plus size={16} /> Новый чат
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по чатам…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-brand"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-slate-400 py-16">
          {chats.length === 0
            ? 'Пока нет ни одного чата. Начните новый!'
            : 'Ничего не найдено'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <NavLink
              key={c.id}
              to={`/chat/${c.id}`}
              onClick={() => setActiveChatId(c.id)}
              className={`flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border rounded-xl px-4 py-3 hover:border-brand/50 transition-colors ${
                activeChatId === c.id
                  ? 'border-brand'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <MessageSquare className="text-brand shrink-0" size={18} />
                <div className="min-w-0">
                  <div className="font-medium text-slate-800 dark:text-slate-100 truncate">
                    {c.title}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 truncate">
                    {c.material_name ? `📄 ${c.material_name} · ` : ''}
                    {new Date(c.updated_at).toLocaleString('ru-RU')}
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => remove(e, c.id)}
                className="text-slate-400 hover:text-red-500 shrink-0"
                aria-label="Удалить"
              >
                <Trash2 size={16} />
              </button>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}
