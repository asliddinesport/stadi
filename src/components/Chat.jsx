import { useEffect, useRef, useState } from 'react'
import { Paperclip, Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Logo } from './Sidebar'
import { askAI } from '../lib/ai'

export default function Chat({ material, onAsk, messages, setMessages }) {
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])

  const send = async (text) => {
    const q = (text ?? input).trim()
    if (!q || busy) return
    setInput('')
    const next = [...messages, { role: 'user', content: q }]
    setMessages(next)
    setBusy(true)
    try {
      const { answer, sources } = await askAI({
        question: q,
        context: material?.text || '',
        history: next.map((m) => ({ role: m.role, content: m.content })),
      })
      setMessages([...next, { role: 'assistant', content: answer, sources }])
      onAsk?.({ question: q, answer })
    } catch (e) {
      setMessages([...next, { role: 'assistant', content: `Ошибка: ${e.message}` }])
    } finally {
      setBusy(false)
    }
  }

  const examples = [
    'Что такое переобучение модели?',
    'Какие основные типы машинного обучения?',
    'Объясни простыми словами: градиентный спуск',
    'Сделай краткое содержание этого материала',
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center shrink-0">
              <Logo className="w-5 h-5" />
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 text-sm text-slate-700 shadow-sm max-w-2xl">
              <div className="font-semibold mb-1">Привет! 👋</div>
              Я — Стади, твой ИИ-помощник. Загрузите учебный материал, и я смогу
              отвечать на ваши вопросы, ссылаясь на источник.
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}
          >
            {m.role === 'assistant' && (
              <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center shrink-0">
                <Logo className="w-5 h-5" />
              </div>
            )}
            <div
              className={
                m.role === 'user'
                  ? 'rounded-2xl px-4 py-3 text-sm max-w-2xl whitespace-pre-wrap bg-brand text-white'
                  : 'rounded-2xl px-4 py-3 text-sm max-w-2xl bg-white text-slate-700 shadow-sm prose-chat'
              }
            >
              {m.role === 'user' ? (
                m.content
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              )}
              {m.sources?.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-400">
                  Источники: {m.sources.join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center">
              <Logo className="w-5 h-5" />
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 text-sm text-slate-400 shadow-sm">
              Стади печатает…
            </div>
          </div>
        )}

        <div ref={endRef} />

        {messages.length === 0 && (
          <div className="pt-4">
            <div className="text-sm font-semibold text-slate-700 mb-3">
              Примеры вопросов
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {examples.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-left bg-slate-100 hover:bg-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 flex items-center justify-between"
                >
                  <span>{q}</span>
                  <span className="text-slate-400">›</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-white p-3 md:p-4">
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
          <Paperclip size={18} className="text-slate-400 shrink-0" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Задайте вопрос по материалу…"
            className="flex-1 bg-transparent outline-none text-sm min-w-0"
          />
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
