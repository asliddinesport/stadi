import { NavLink, useNavigate } from 'react-router-dom'
import { Home, FileText, Clock, Settings, Code2, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Logo = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <path d="M4 6 L18 2 L18 34 L4 38 Z" fill="#4f6ef7" />
    <path d="M22 2 L36 6 L36 38 L22 34 Z" fill="#2563eb" />
    <path d="M18 2 L22 2 L22 34 L18 34 Z" fill="#1e40af" opacity="0.6" />
  </svg>
)

export default function Sidebar() {
  const { signOut, isDeveloper, user } = useAuth()
  const navigate = useNavigate()
  const items = [
    { to: '/', icon: Home, label: 'Главная' },
    { to: '/materials', icon: FileText, label: 'Мои материалы' },
    { to: '/history', icon: Clock, label: 'История' },
    { to: '/settings', icon: Settings, label: 'Настройки' },
  ]
  if (isDeveloper) items.push({ to: '/developer', icon: Code2, label: 'Developer' })

  return (
    <aside className="w-64 shrink-0 bg-sidebar text-slate-300 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-6 flex items-center gap-3">
        <Logo className="w-9 h-9" />
        <span className="text-white text-xl font-bold">Стади</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-sidebarHover text-white' : 'hover:bg-sidebarHover/60 hover:text-white'}`}>
            <Icon size={18} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-400 truncate mb-3">{user?.email}</div>
        <button onClick={async () => { await signOut(); navigate('/login') }}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <LogOut size={16} /> Выйти
        </button>
      </div>
    </aside>
  )
}
