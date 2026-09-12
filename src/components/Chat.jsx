import { useEffect, useRef, useState } from 'react'
import {
  Paperclip, Send, Mic, MicOff, Copy, Check,
  Share2, Download, Sparkles, Languages,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Logo } from './Sidebar'
import { askAI, translateText } from '../lib/ai'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { exportChatToPDF } from '../lib/exportChat'
import { useAuth } from '../context/AuthContext'

const markdownComponents = {
  table: ({ node, ...props }) => (
    <div className="md-table-wrap">
      <table {...props} />
    </div>
  ),
  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'kk', label: 'Қазақша' },
  { code: 'uz', label: 'Oʻzbekcha' },
]

export default function Chat({ material, onAsk, messages, setMessages }) {
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState(null)
  const [translations, setTranslations] = useState({}) // { [msgIndex]: { lang, text } }
  const [translating, setTranslating] = useState(null)
  const [openLangMenu, setOpenLangMenu] = useState(null) // индекс сообщения с открытым меню
  const endRef = useRef(null)

  const voice = useVoiceInput({
    onResult: (text) => setInput(text),
  })

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])

  // Закрытие языкового меню по клику снаружи
  useEffect(() => {
    const close = () => setOpenLangMenu(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  const send = async (text) => {
    const q = (text ?? input).trim()
    if (!q || busy) return
    setInput('')
    if (voice.listening) voice.stop()
    const next = [...messages, { role: 'user', content: q }]
    setMessages(next)
    setBusy(true)
    try {
      const { answer, sources } = await askAI({
        question: q,
        context: material?.text || '',
        history: next.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      })
      setMessages([...next, { role: 'assistant', content: answer, sources }])
      onAsk?.({ question: q, answer })
    } catch (e) {
      setMessages([...next, { role: 'assistant', content: `Ошибка: ${e.message}` }])
    } finally {
      setBusy(false)
    }
  }

  const copyMessage = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 1500)
    } catch (_) {}
  }

  const shareMessage = async (text) => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Стади', text }) } catch (_) {}
    } else {
      await navigator.clipboard.writeText(text)
      alert('Скопировано в буфер обмена')
    }
  }

  const handleExport = () => {
    if (!messages.length) return
    exportChatToPDF({
      messages,
      materialName: material?.name,
      userName: user?.email,
    })
  }

  const translate = async (idx, text, langLabel) => {
    setOpenLangMenu(null)
    // Повторный клик по тому же языку — убрать перевод
    if (translations[idx]?.lang === langLabel) {
      setTranslations((t) => {
        const copy = { ...t }
        delete copy[idx]
        return copy
      })
      return
    }
    setTranslating(idx)
    try {
      const result = await translateText(text, langLabel)
      setTranslations((t) => ({ ...t, [idx]: { lang: langLabel, text: result } }))
    } catch (e) {
      alert('Ошибка перевода: ' + e.message)
    } finally {
      setTranslating(null)
    }
  }

  const examples = [
    'Что такое переобучение модели?',
    'Какие основные типы машинного обучения?',
    'Объясни простыми словами: градиентный спуск',
    'Сделай краткое содержание этого материала',
  ]

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Тулбар */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
          <Sparkles size={12} className="text-brand shrink-0" />
          <span className="truncate">{material ? material.name : 'Чат со Стади'}</span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-brand px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Скачать в PDF"
          >
            <Download size={13} /> PDF
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-brand flex items-center justify-center shrink-0">
              <Logo className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-700 dark:text-slate-200 shadow-sm max-w-[85%] md:max-w-2xl border border-transparent dark:border-slate-700">
              <div className="font-semibold mb-1">Привет! 👋</div>
              Я — Стади, твой ИИ-помощник. Загрузите учебный материал, и я смогу
              отвечать на ваши вопросы, ссылаясь на источник.
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`group flex gap-2 md:gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-brand flex items-center justify-center shrink-0">
                <Logo className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            )}
            <div className="max-w-[85%] md:max-w-2xl min-w-0">
              <div
                className={
                  m.role === 'user'
                    ? 'rounded-2xl px-3.5 py-2.5 md:px-4 md:py-3 text-sm whitespace-pre-wrap break-words bg-brand text-white'
                    : 'rounded-2xl px-3.5 py-2.5 md:px-4 md:py-3 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm prose-chat border border-transparent dark:border-slate-700'
                }
              >
                {m.role === 'user' ? (
                  m.content
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {m.content}
                  </ReactMarkdown>
                )}
                {m.sources?.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-400">
                    Источники: {m.sources.join(', ')}
                  </div>
                )}
              </div>

              {m.role === 'assistant' && (
                <>
                  <div className="mt-1 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => copyMessage(m.content, i)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-brand px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Скопировать"
                    >
                      {copiedIdx === i ? <Check size={12} /> : <Copy size={12} />}
                      {copiedIdx === i ? 'Скопировано' : 'Копировать'}
                    </button>
                    <button
                      onClick={() => shareMessage(m.content)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-brand px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Поделиться"
                    >
                      <Share2 size={12} /> Поделиться
                    </button>

                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() =>
                          setOpenLangMenu(openLangMenu === i ? null : i)
                        }
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-brand px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Перевести"
                      >
                        <Languages size={12} />
                        {translating === i ? 'Перевод…' : 'Перевод'}
                      </button>

                      {openLangMenu === i && (
                        <div className="absolute bottom-full left-0 mb-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-30 min-w-[140px]">
                          {LANGUAGES.map((l) => (
                            <button
                              key={l.code}
                              onClick={() => translate(i, m.content, l.label)}
                              className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 ${
                                translations[i]?.lang === l.label
                                  ? 'text-brand font-semibold'
                                  : 'text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              {l.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {translations[i] && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                        {translations[i].lang}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                        {translations[i].text}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-brand flex items-center justify-center shrink-0">
              <Logo className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-400 shadow-sm border border-transparent dark:border-slate-700">
              Стади печатает…
            </div>
          </div>
        )}

        <div ref={endRef} />

        {messages.length === 0 && (
          <div className="pt-4">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
              Примеры вопросов
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {examples.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-left bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl px-3.5 py-2.5 md:px-4 md:py-3 text-sm text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2 transition-colors"
                >
                  <span className="min-w-0">{q}</span>
                  <span className="text-slate-400 shrink-0">›</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 md:p-4">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2">
          <Paperclip size={18} className="text-slate-400 shrink-0" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={voice.listening ? 'Говорите…' : 'Задайте вопрос по материалу…'}
            className="flex-1 bg-transparent outline-none text-sm min-w-0 dark:text-slate-100 dark:placeholder:text-slate-500"
          />

          {voice.supported && (
            <button
              type="button"
              onClick={voice.listening ? voice.stop : voice.start}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                voice.listening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-brand hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={voice.listening ? 'Остановить' : 'Голосовой ввод'}
            >
              {voice.listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}

          <button
            onClick={() => send()}
            disabled={busy || !input.trim()}
            className="w-9 h-9 rounded-full bg-brand hover:bg-blue-600 disabled:opacity-50 text-white flex items-center justify-center shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
