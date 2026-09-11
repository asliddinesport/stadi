import { useEffect, useState } from 'react'
import { Code2, Users, Database, MessageSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Developer() {
  const [stats, setStats] = useState({ users: 0, materials: 0, questions: 0 })

  useEffect(() => {
    ;(async () => {
      const [m, h] = await Promise.all([
        supabase.from('materials').select('*', { count: 'exact', head: true }),
        supabase.from('history').select('*', { count: 'exact', head: true }),
      ])
      setStats({ users: 0, materials: m.count || 0, questions: h.count || 0 })
    })()
  }, [])

  const Card = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center gap-4 transition-colors">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center gap-3 mb-6">
        <Code2 className="text-brand" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Developer Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card icon={Users} label="Пользователи" value={stats.users} color="bg-blue-50 dark:bg-blue-950/40 text-brand" />
        <Card icon={Database} label="Материалы" value={stats.materials} color="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600" />
        <Card icon={MessageSquare} label="Вопросы" value={stats.questions} color="bg-amber-50 dark:bg-amber-950/40 text-amber-600" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors">
        <h2 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">
          Доступ только для разработчика
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Эта страница видна только пользователю с email из переменной окружения{' '}
          <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">VITE_DEVELOPER_EMAIL</code>.
        </p>
      </div>
    </div>
  )
}
