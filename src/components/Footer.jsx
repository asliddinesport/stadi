import { Mail, User, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-6 md:mt-10 transition-colors">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-5 md:py-8 text-xs md:text-sm text-slate-600 dark:text-slate-400">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <User size={13} /> Владелец
            </div>
            <div>Хусниддинов Аслиддин</div>
          </div>

          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <Mail size={13} /> Сотрудничество
            </div>
            <a
              href="mailto:asliddinhusniddinov240@gmail.com"
              className="text-brand hover:underline break-all"
            >
              asliddinhusniddinov240@gmail.com
            </a>
          </div>

          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <ExternalLink size={13} /> Партнёр
            </div>
            <a
              href="https://edu.susu.ru"
              target="_blank"
              rel="noreferrer"
              className="text-brand hover:underline"
            >
              edu.susu.ru
            </a>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col md:flex-row justify-between gap-1 text-[11px] md:text-xs text-slate-400 dark:text-slate-500">
          <div>© {new Date().getFullYear()} Стади. Все права защищены.</div>
          <div className="hidden md:block">ИИ-помощник в обучении</div>
        </div>
      </div>
    </footer>
  )
}
