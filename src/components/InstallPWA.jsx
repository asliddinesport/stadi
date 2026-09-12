import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallPWA() {
  const [prompt, setPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Не показываем, если уже установлено
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (localStorage.getItem('pwa-dismissed')) return

    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    setPrompt(null)
  }

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem('pwa-dismissed', '1')
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
        <Download className="text-brand" size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
          Установить Стади
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Как приложение на телефон — работает офлайн и открывается быстрее.
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={install}
            className="bg-brand hover:bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
          >
            Установить
          </button>
          <button
            onClick={dismiss}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-3 py-1.5"
          >
            Позже
          </button>
        </div>
      </div>
      <button onClick={dismiss} className="text-slate-400 hover:text-slate-600 shrink-0">
        <X size={16} />
      </button>
    </div>
  )
}
