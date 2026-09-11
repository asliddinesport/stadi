import { useAuth } from '../context/AuthContext'
export default function Settings() {
  const { user } = useAuth()
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Настройки</h1>
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div><div className="text-xs text-slate-400">Email</div><div className="font-medium">{user?.email}</div></div>
        <div><div className="text-xs text-slate-400">ID пользователя</div><div className="font-mono text-sm">{user?.id}</div></div>
        <div><div className="text-xs text-slate-400">Провайдер</div><div className="font-medium">{user?.app_metadata?.provider}</div></div>
      </div>
    </div>
  )
}
