import { useState } from 'react'
import { Layers, Loader2, ChevronLeft, ChevronRight, Shuffle } from 'lucide-react'
import { useDocument } from '../context/DocumentContext'
import { generateFlashcards } from '../lib/ai'

export default function Flashcards() {
  const { activeMaterial } = useDocument()
  const [cards, setCards] = useState([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const start = async () => {
    if (!activeMaterial?.text) {
      setError('Загрузите материал на главной странице')
      return
    }
    setBusy(true); setError(''); setCards([]); setKnown({}); setIdx(0); setFlipped(false)
    try {
      const { cards } = await generateFlashcards(activeMaterial.text, { count: 10 })
      setCards(cards || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const next = () => {
    setFlipped(false)
    setTimeout(() => setIdx((i) => (i + 1) % cards.length), 150)
  }
  const prev = () => {
    setFlipped(false)
    setTimeout(() => setIdx((i) => (i - 1 + cards.length) % cards.length), 150)
  }
  const shuffle = () => {
    setCards((c) => [...c].sort(() => Math.random() - 0.5))
    setIdx(0); setFlipped(false)
  }
  const markKnown = () => {
    setKnown((k) => ({ ...k, [idx]: true }))
    next()
  }
  const markUnknown = () => {
    setKnown((k) => ({ ...k, [idx]: false }))
    next()
  }

  const progress = cards.length ? Object.keys(known).length : 0

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center gap-3 mb-4">
        <Layers className="text-brand" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Флеш-карточки</h1>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Карточки «вопрос-ответ» для быстрого запоминания. Клик по карточке — перевернуть.
      </p>

      {!activeMaterial && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-200 mb-4">
          Сначала загрузите материал на <b>главной странице</b>.
        </div>
      )}

      {!cards.length && !busy && (
        <button
          onClick={start}
          disabled={!activeMaterial}
          className="w-full bg-brand hover:bg-blue-600 disabled:opacity-60 text-white font-medium py-3 rounded-xl inline-flex items-center justify-center gap-2 mb-4"
        >
          <Layers size={18} /> Создать карточки
        </button>
      )}

      {busy && (
        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 py-8">
          <Loader2 size={18} className="animate-spin" /> Генерирую карточки…
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300 mb-4">
          {error}
        </div>
      )}

      {cards.length > 0 && (
        <>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span>Карточка {idx + 1} из {cards.length}</span>
            <span>Изучено: {progress} / {cards.length}</span>
          </div>

          <div
            onClick={() => setFlipped((f) => !f)}
            className="cursor-pointer select-none"
            style={{ perspective: '1000px' }}
          >
            <div
              className="relative w-full h-64 md:h-72 transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)',
              }}
            >
              <div
                className="absolute inset-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center justify-center text-center text-slate-800 dark:text-slate-100 text-lg font-medium"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {cards[idx].front}
              </div>
              <div
                className="absolute inset-0 bg-brand text-white rounded-2xl p-6 flex items-center justify-center text-center text-base md:text-lg"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                {cards[idx].back}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mt-6">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center"
              aria-label="Назад"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={markUnknown}
              className="flex-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 font-medium py-2.5 rounded-xl text-sm"
            >
              Не знаю
            </button>
            <button
              onClick={markKnown}
              className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 font-medium py-2.5 rounded-xl text-sm"
            >
              Знаю
            </button>

            <button
              onClick={next}
              className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center"
              aria-label="Вперёд"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <button
            onClick={shuffle}
            className="w-full mt-4 text-sm text-slate-500 dark:text-slate-400 hover:text-brand flex items-center justify-center gap-1.5 py-2"
          >
            <Shuffle size={14} /> Перемешать
          </button>
        </>
      )}
    </div>
  )
}
