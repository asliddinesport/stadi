import { Mail, User, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-10">
      <div className="max-w-4xl mx-auto px-6 py-8 text-sm text-slate-600">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <User size={14} /> Владелец
            </div>
            <div>Хусниддинов Аслиддин</div>
          </div>

          <div>
            <div className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Mail size={14} /> Сотрудничество и вопросы
            </div>
            <a
              href="mailto:asliddinhusniddinov240@gmail.com"
              className="text-brand hover:underline break-all"
            >
              asliddinhusniddinov240@gmail.com
            </a>
          </div>

          <div>
            <div className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <ExternalLink size={14} /> Партнёр
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

        <div className="border-t border-slate-100 pt-4 flex flex-col md:flex-row justify-between gap-2 text-xs text-slate-400">
          <div>© {new Date().getFullYear()} Стади. Все права защищены.</div>
          <div>ИИ-помощник в обучении</div>
        </div>
      </div>
    </footer>
  )
}
