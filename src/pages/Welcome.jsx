import { Link } from 'react-router-dom'
import {
  BookOpen, GraduationCap, Layers, Network, MessageSquare,
  Calendar, Mic, Languages, FileText, Send, ArrowRight,
  Shield, Zap, Heart,
} from 'lucide-react'
import { Logo } from '../components/Sidebar'

const features = [
  { icon: MessageSquare, title: 'Чат с ИИ по документу', text: 'Задайте вопрос — получите ответ со ссылкой на источник.' },
  { icon: BookOpen, title: 'Конспект больших лекций', text: 'Структурированный конспект по документу на 100+ страниц.' },
  { icon: GraduationCap, title: 'Экзаменатор', text: '5–20 вопросов по материалу с объяснениями.' },
  { icon: Layers, title: 'Флеш-карточки', text: 'Запоминайте с прогресс-баром и 3D-переворотом.' },
  { icon: Network, title: 'Mind map', text: 'Автоматическая схема ключевых идей, экспорт в SVG.' },
  { icon: Languages, title: 'Перевод на 8 языков', text: 'Ответы ИИ на английском, китайском, арабском.' },
  { icon: Mic, title: 'Голосовой ввод', text: 'Диктуйте вопрос — не нужно печатать.' },
  { icon: Calendar, title: 'Расписание + Telegram', text: 'Напоминания о дедлайнах в мессенджере.' },
  { icon: FileText, title: 'Экспорт в PDF', text: 'Сохраните беседу или конспект одним кликом.' },
]

const steps = [
  { n: '01', title: 'Загрузите файл', text: 'PDF или DOCX до 200 000 символов.' },
  { n: '02', title: 'Задайте вопрос', text: 'Текстом или голосом — как удобнее.' },
  { n: '03', title: 'Получите ответ', text: 'Со ссылками на конкретные части документа.' },
]

export default function Welcome() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="text-lg font-bold">Стади</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Войти
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-brand hover:bg-blue-600 text-white transition-colors"
            >
              Начать бесплатно
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 text-brand text-xs font-semibold mb-6">
          <Zap size={12} />
          Бесплатно · без VPN · из России
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
          Учитесь{' '}
          <span className="bg-gradient-to-r from-brand to-blue-500 bg-clip-text text-transparent">
            умнее
          </span>
          ,<br />а не дольше
        </h1>
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Стади читает ваши лекции и конспекты, отвечает на вопросы
          со ссылками на источник, делает конспекты, тесты и карточки.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand hover:bg-blue-600 text-white font-semibold transition-colors"
          >
            Попробовать бесплатно <ArrowRight size={18} />
          </Link>
          <a
            href="/promo"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand/50 font-semibold transition-colors"
          >
            Смотреть презентацию
          </a>
        </div>

        {/* Mockup */}
        <div className="mt-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="ml-3 text-xs text-slate-400">stadi-asld.vercel.app</div>
          </div>
          <div className="p-6 md:p-8 text-left bg-slate-50 dark:bg-slate-950">
            <div className="max-w-md mx-auto space-y-3">
              <div className="bg-brand text-white rounded-2xl px-4 py-3 text-sm ml-auto max-w-[85%]">
                Что такое переобучение модели?
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm">
                <strong className="text-brand">Переобучение</strong> — когда модель запоминает тренировочные данные, а не учится общим закономерностям.
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                  Источник: КОНСПЕКТ лекций.pdf
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Проблема ─── */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="text-xs font-bold uppercase tracking-widest text-brand mb-3">Проблема</div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Студент тратит часы на поиск ответа
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="text-4xl font-black text-red-500 mb-2">4 ч</div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                в неделю уходит на поиск ответов в конспектах и лекциях
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="text-4xl font-black text-amber-500 mb-2">60%</div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                информации из лекций забывается к моменту сессии
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="text-4xl font-black text-purple-500 mb-2">0</div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                инструментов, которые «понимают» именно ваш материал
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Как работает ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-brand mb-3">Решение</div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            Три шага — и ответ у вас
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <div className="text-6xl font-black text-brand/20 mb-3">{s.n}</div>
              <h3 className="text-xl font-bold mb-2">{s.title}</h3>
              <p className="text-slate-500 dark:text-slate-400">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="text-xs font-bold uppercase tracking-widest text-brand mb-3">Возможности</div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Всё для учёбы в одном месте
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand/50 hover:shadow-lg transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-3 group-hover:bg-brand group-hover:text-white transition-colors">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{f.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Trust ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <Shield size={22} />
            </div>
            <div>
              <h3 className="font-bold mb-1">Приватность</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Ваши материалы хранятся только в вашем аккаунте. Никто другой их не видит.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
              <Zap size={22} />
            </div>
            <div>
              <h3 className="font-bold mb-1">Работает в России</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Открывается без VPN. Оплата и регистрация — обычные, привычные.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center flex-shrink-0">
              <Heart size={22} />
            </div>
            <div>
              <h3 className="font-bold mb-1">Сделано студентом</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Я знаю, как тяжело искать ответы в конспектах. Поэтому сделал Стади.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-gradient-to-br from-brand to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-5">
            Попробуйте прямо сейчас
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Загрузите первую лекцию и задайте любой вопрос. Бесплатно, без карты.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-brand font-bold hover:bg-slate-100 transition-colors"
          >
            Начать бесплатно <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-white mb-3">
                <Logo className="w-7 h-7" />
                <span className="text-lg font-bold">Стади</span>
              </div>
              <p className="text-sm">ИИ-помощник в обучении</p>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Владелец</div>
              <div className="text-white text-sm">Хусниддинов Аслиддин</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Контакты</div>
              <a href="mailto:asliddinhusniddinov240@gmail.com" className="block text-sm hover:text-white transition-colors">
                asliddinhusniddinov240@gmail.com
              </a>
              <a href="https://edu.susu.ru" target="_blank" rel="noreferrer" className="block text-sm hover:text-white transition-colors mt-1">
                Партнёр: edu.susu.ru
              </a>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between gap-2 text-xs">
            <div>© {new Date().getFullYear()} Стади. Все права защищены.</div>
            <div className="flex gap-4">
              <a href="/promo" className="hover:text-white transition-colors">Презентация</a>
              <Link to="/login" className="hover:text-white transition-colors">Войти</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
