import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar, { Logo } from './Sidebar'
import Footer from './Footer'

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-30 bg-sidebar text-white px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-sidebarHover"
            aria-label="Открыть меню"
          >
            <Menu size={22} />
          </button>
          <Logo className="w-7 h-7" />
          <span className="text-lg font-bold">Стади</span>
        </header>

        <main className="flex-1 min-w-0">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
