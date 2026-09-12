import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home, FileText, Clock, Settings, Code2, LogOut, X, Sun, Moon,
  BookOpen, GraduationCap, Layers, Network, MessageSquare, Plus, Calendar,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useChats } from '../context/ChatContext'

export const Logo = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <path d="M4 6 L18 2 L18 34 L4 38 Z" fill="#4f6ef7" />
    <path d="M22 2 L36 6 L36 38 L22 34 Z" fill="#2563eb" />
    <path d="M18 2 L22 2 L22 34 L18 34 Z" fill="#1e40af" opacity="0.6" />
  </svg>
)

export default function Sidebar({ mobileOpen, onClose }) {
  const { signOut, isDeveloper, user } = useAuth()
  const { theme, toggle } = useTheme()
  const { setActiveChatId } = useChats()
  const navigate = useNavigate()

  const mainItems = [
    { to: '/', icon: Home, label: 'Главная' },
    { to: '/chats', icon: MessageSquare, label: 'История чатов' },
    { to: '/materials', icon: FileText, label: 'Мои материалы' },
    { to: '/schedule', icon: Calendar, label: 'Расписание' },
  ]

  const toolItems = [
    { to: '/summary', icon: BookOpen, label: 'Конспект' },
    { to: '/quiz', icon: GraduationCap, label: 'Экзаменатор' },
    { to: '/flashcards', icon: Layers, label: 'Карточки' },
    { to: '/mindmap', icon: Network, label: 'Mind map' },
  ]

  const bottomItems = [{ to: '/settings', icon: Settings, label: 'Настройки' }]
  if (isDeveloper) bottomItems.push({ to: '/developer', icon: Code2, label: 'Developer' })

  const handleLogout = async () => { await signOut(); navigate('/login') }
  const startNewChat = () => { setActiveChatId(null); navigate('/'); onClose?.() }

  const renderItem = ({ to, icon: Icon, label }) => (
    <NavLink
      key={to}
      to={to}
      end={to === '/'}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
          isActive ? 'bg-sidebarHover text-white' : 'hover:bg-sidebarHover/60 hover:text-white'
        }`
      }
    >
      <Icon size={18} /><span>{label}</span>
    </NavLink>
  )

  return (
    <>
      {mobileOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-black/50 z-40 md:hidden" />
      )}
      <aside className={`fixed md:sticky top-0 left-0 z-50 w-64 shrink-0 h-screen bg-sidebar text-slate-300 flex flex-col transform transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="px-5 py-6 flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-9 h-9" />
            <span className="text-white text-xl font-bold">Стади</span>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="px-3 mb-3">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-brand hover:bg-blue-600 text-white text-sm font-medium"
          >
            <Plus size={16} /> Новый чат
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {mainItems.map(renderItem)}
          <div className="pt-4 pb-1 px-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Инструменты ИИ</div>
          </div>
          {toolItems.map(renderItem)}
          <div className="pt-4 pb-1 px-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Прочее</div>
          </div>
          {bottomItems.map(renderItem)}
        </nav>

        <div className="px-3 pb-3">
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-sidebarHover/60 hover:text-white"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}</span>
          </button>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 truncate mb-3">{user?.email}</div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
            <LogOut size={16} /> Выйти
          </button>
        </div>
      </aside>
    </>
  )
}
