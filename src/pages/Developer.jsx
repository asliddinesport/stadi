import { useEffect, useState } from 'react'
import {
  Code2, Users, Database, MessageSquare, MessageCircle, TrendingUp, RefreshCw,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Developer() {
  const [stats, setStats] = useState(null)
  const [daily, setDaily] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [s, d] = await Promise.all([
        supabase.rpc('get_stats'),
        supabase.rpc('get_daily_stats', { days: 14 }),
      ])
      if (s.error) throw s.error
      if (d.error) throw d.error
      setStats(s.data)
      setDaily(d.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const Card = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {value ?? '—'}
        </div>
      </div>
    </div>
  )

  // Максимум для масштаба графика
  const maxQ = Math.max(1, ...daily.map((d) => Number(d.questions) || 0))
  const maxM = Math.max(1, ...daily.map((d) => Number(d.messages) || 0))
  const maxAll = Math.max(maxQ, maxM)

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Code2 className="text-brand" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Developer Dashboard
          </h1>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-brand px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Обновить
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300 mb-4">
          {error}
        </div>
      )}

      {/* Карточки со статистикой */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card icon={Users} label="Пользователи" value={stats?.users} color="bg-blue-50 dark:bg-blue-950/40 text-brand" />
        <Card icon={Database} label="Материалы" value={stats?.materials} color="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600" />
        <Card icon={MessageSquare} label="Вопросы (старое)" value={stats?.questions} color="bg-amber-50 dark:bg-amber-950/40 text-amber-600" />
        <Card icon={MessageCircle} label="Чаты" value={stats?.chats} color="bg-purple-50 dark:bg-purple-950/40 text-purple-600" />
        <Card icon={MessageCircle} label="Сообщения" value={stats?.messages} color="bg-pink-50 dark:bg-pink-950/40 text-pink-600" />
      </div>

      {/* График за 14 дней */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="text-brand" size={18} />
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">
            Активность за 14 дней
          </h2>
        </div>

        {daily.length === 0 ? (
          <div className="text-center text-sm text-slate-400 py-8">
            Пока нет данных
          </div>
        ) : (
          <div className="flex items-end gap-1 h-48">
            {daily.map((d) => {
              const q = Number(d.questions) || 0
              const m = Number(d.messages) || 0
              const hQ = (q / maxAll) * 100
              const hM = (m / maxAll) * 100
              const label = new Date(d.day).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
              })
              return (
                <div
                  key={d.day}
                  className="flex-1 flex flex-col items-center gap-1 group"
                  title={`${label}: ${q} вопросов, ${m} сообщений`}
                >
                  <div className="flex items-end gap-0.5 w-full h-full">
                    <div
                      className="flex-1 bg-amber-400 dark:bg-amber-500 rounded-t transition-all group-hover:bg-amber-500"
                      style={{ height: `${hQ}%`, minHeight: q > 0 ? '3px' : '0' }}
                    />
                    <div
                      className="flex-1 bg-brand rounded-t transition-all group-hover:bg-blue-600"
                      style={{ height: `${hM}%`, minHeight: m > 0 ? '3px' : '0' }}
                    />
                  </div>
                  <div className="text-[9px] text-slate-400 whitespace-nowrap">
                    {label}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-400" /> Вопросы
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-brand" /> Сообщения в чатах
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mt-6">
        <h2 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">
          Доступ только для разработчика
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Эта страница видна только пользователю с email из{' '}
          <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">
            VITE_DEVELOPER_EMAIL
          </code>.
        </p>
      </div>
    </div>
  )
}
