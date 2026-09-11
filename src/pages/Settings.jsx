import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user } = useAuth()
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">
        Настройки
      </h1>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 transition-colors">
        <div>
          <div className="text-xs text-slate-400 dark:text-slate-500">Email</div>
          <div className="font-medium text-slate-900 dark:text-slate-100">{user?.email}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 dark:text-slate-500">ID пользователя</div>
          <div className="font-mono text-sm text-slate-900 dark:text-slate-100 break-all">
            {user?.id}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 dark:text-slate-500">Провайдер</div>
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {user?.app_metadata?.provider}
          </div>
        </div>
      </div>
    </div>
  )
}
