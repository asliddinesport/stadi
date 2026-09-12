import { useEffect, useState } from 'react'
import {
  Calendar, Plus, Trash2, Bell, Check, CheckCircle2, Clock,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { sanitizeText } from '../lib/sanitize'

export default function Schedule() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', subject: '', due_date: '', notes: '' })
  const [busy, setBusy] = useState(false)
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default',
  )

  const load = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('schedule')
      .select('*')
      .order('due_date', { ascending: true })
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const add = async (e) => {
    e.preventDefault()
    if (!form.title || !form.due_date) return
    setBusy(true)
    try {
      await supabase.from('schedule').insert({
        user_id: user.id,
        title: sanitizeText(form.title),
        subject: form.subject ? sanitizeText(form.subject) : null,
        due_date: form.due_date,
        notes: form.notes ? sanitizeText(form.notes) : null,
      })
      setForm({ title: '', subject: '', due_date: '', notes: '' })
      setShowForm(false)
      load()
      requestNotify()
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    await supabase.from('schedule').delete().eq('id', id)
    load()
  }

  const toggleDone = async (item) => {
    await supabase.from('schedule').update({ done: !item.done }).eq('id', item.id)
    load()
  }

  const requestNotify = async () => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'default') {
      const p = await Notification.requestPermission()
      setNotifPermission(p)
    }
  }

  // Проверка напоминаний раз в 60 сек
  useEffect(() => {
    if (notifPermission !== 'granted') return
    const check = () => {
      const now = new Date()
      items.forEach((it) => {
        if (it.done) return
        const due = new Date(it.due_date)
        const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
        if (diffDays === 0) {
          const key = `notif-${it.id}-today`
          if (!localStorage.getItem(key)) {
            new Notification('Стади · Сегодня дедлайн', {
              body: it.title,
              icon: '/favicon.ico',
            })
            localStorage.setItem(key, '1')
          }
        }
      })
    }
    check()
    const id = setInterval(check, 60000)
    return () => clearInterval(id)
  }, [items, notifPermission])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = items.filter((i) => !i.done && new Date(i.due_date) >= today)
  const overdue = items.filter((i) => !i.done && new Date(i.due_date) < today)
  const done = items.filter((i) => i.done)

  const daysLeft = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'сегодня'
    if (diff === 1) return 'завтра'
    if (diff < 0) return `просрочено на ${-diff} дн.`
    return `через ${diff} дн.`
  }

  const Item = ({ it, urgent }) => (
    <div
      className={`flex items-start gap-3 bg-white dark:bg-slate-900 border rounded-xl px-4 py-3 ${
        urgent ? 'border-red-300 dark:border-red-900' : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <button
        onClick={() => toggleDone(it)}
        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
          it.done
            ? 'bg-brand border-brand text-white'
            : 'border-slate-300 dark:border-slate-600'
        }`}
      >
        {it.done && <Check size={12} />}
      </button>
      <div className="min-w-0 flex-1">
        <div className={`font-medium ${it.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
          {it.title}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap gap-2">
          {it.subject && <span>📚 {it.subject}</span>}
          <span>📅 {new Date(it.due_date).toLocaleDateString('ru-RU')}</span>
          {!it.done && (
            <span className={urgent ? 'text-red-500 font-medium' : ''}>
              <Clock size={10} className="inline -mt-0.5 mr-0.5" />
              {daysLeft(it.due_date)}
            </span>
          )}
        </div>
        {it.notes && (
          <div className="text-xs text-slate-400 mt-1">{it.notes}</div>
        )}
      </div>
      <button
        onClick={() => remove(it.id)}
        className="text-slate-400 hover:text-red-500 shrink-0"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="text-brand" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Расписание</h1>
        </div>
        {notifPermission !== 'granted' && (
          <button
            onClick={requestNotify}
            className="flex items-center gap-1.5 text-xs text-brand hover:underline"
          >
            <Bell size={13} /> Включить напоминания
          </button>
        )}
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-brand hover:bg-blue-600 text-white font-medium py-3 rounded-xl inline-flex items-center justify-center gap-2 mb-5"
        >
          <Plus size={18} /> Добавить задачу
        </button>
      )}

      {showForm && (
        <form
          onSubmit={add}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 mb-5 space-y-3"
        >
          <input
            required
            placeholder="Название (например: Зачёт по матанализу)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-brand text-slate-800 dark:text-slate-100"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder="Предмет"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-brand text-slate-800 dark:text-slate-100"
            />
            <input
              required
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-brand text-slate-800 dark:text-slate-100"
            />
          </div>
          <textarea
            placeholder="Заметки (необязательно)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-brand text-slate-800 dark:text-slate-100"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium py-2.5 rounded-xl text-sm"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 bg-brand hover:bg-blue-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm"
            >
              {busy ? 'Сохраняю…' : 'Сохранить'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-slate-500 dark:text-slate-400 text-center py-8">Загрузка…</div>
      ) : items.length === 0 ? (
        <div className="text-slate-400 text-center py-16">
          Пока нет задач. Добавьте первую!
        </div>
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-red-500 font-semibold mb-2">
                Просроченные
              </div>
              <div className="space-y-2">
                {overdue.map((it) => <Item key={it.id} it={it} urgent />)}
              </div>
            </div>
          )}
          {upcoming.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                Предстоящие
              </div>
              <div className="space-y-2">
                {upcoming.map((it) => <Item key={it.id} it={it} />)}
              </div>
            </div>
          )}
          {done.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                <CheckCircle2 size={12} className="inline -mt-0.5 mr-1" />
                Выполнено
              </div>
              <div className="space-y-2 opacity-60">
                {done.map((it) => <Item key={it.id} it={it} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
