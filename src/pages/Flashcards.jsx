import { useState } from 'react'
import {
  Layers, Loader2, ChevronLeft, ChevronRight, Shuffle, Sparkles,
  RotateCcw, Trophy,
} from 'lucide-react'
import { useDocument } from '../context/DocumentContext'
import { generateFlashcards } from '../lib/ai'

const COUNTS = [5, 10, 15, 20]

export default function Flashcards() {
  const { activeMaterial } = useDocument()
  const [count, setCount] = useState(10)
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
    setBusy(true); setError('')
    setCards([]); setKnown({}); setIdx(0); setFlipped(false)
    try {
      const { cards: cs } = await generateFlashcards(activeMaterial.text, { count })
      setCards(cs || [])
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
    setKnown((k) => ({ ...k, [idx]: true })); next()
  }
  const markUnknown = () => {
    setKnown((k) => ({ ...k, [idx]: false })); next()
  }

  const progress = cards.length ? Object.keys(known).length : 0
  const knownCount = Object.values(known).filter(Boolean).length
  const allDone = cards.length > 0 && progress === cards.length

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center gap-3 mb-4">
        <Layers className="text-brand" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Флеш-карточки</h1>
      </div>

      {!activeMaterial && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-200 mb-4">
          Сначала загрузите материал на <b>главной странице</b>.
        </div>
      )}

      {!cards.length && !busy && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6">
          <div className="text-sm text-slate-600 dark:text-slate-300 mb-3">
            Сколько карточек?
          </div>
          <div className="flex gap-2 mb-5">
            {COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  count === n
                    ? 'bg-brand border-brand text-white'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand/50'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            onClick={start}
            disabled={!activeMaterial}
            className="w-full bg-brand hover:bg-blue-600 disabled:opacity-60 text-white font-medium py-3 rounded-xl inline-flex items-center justify-center gap-2"
          >
            <Sparkles size={18} /> Создать карточки
          </button>
        </div>
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
          {/* Прогресс-бар */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
              <span>Карточка {idx + 1} / {cards.length}</span>
              <span>✅ {knownCount} · ❌ {progress - knownCount}</span>
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand transition-all"
                style={{ width: `${(progress / cards.length) * 100}%` }}
              />
            </div>
          </div>

          {allDone && (
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl px-6 py-5 mb-4 text-center">
              <Trophy className="mx-auto mb-2" size={32} />
              <div className="font-semibold">Все карточки пройдены!</div>
              <div className="text-sm opacity-90 mt-1">
                Знали {knownCount} из {cards.length} ({Math.round((knownCount / cards.length) * 100)}%)
              </div>
            </div>
          )}

          <div
            onClick={() => setFlipped((f) => !f)}
            className="cursor-pointer select-none"
            style={{ perspective: '1000px' }}
          >
            <div
              className="relative w-full h-72 md:h-80 transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)',
              }}
            >
              <div
                className="absolute inset-0 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-lg"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-4">
                  Вопрос
                </div>
                <div className="text-xl md:text-2xl text-slate-800 dark:text-slate-100 font-semibold">
                  {cards[idx].front}
                </div>
                <div className="absolute bottom-4 text-[10px] text-slate-300 dark:text-slate-600">
                  клик — перевернуть
                </div>
              </div>
              <div
                className="absolute inset-0 bg-gradient-to-br from-brand to-blue-600 text-white rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-lg"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="text-xs uppercase tracking-wider opacity-80 mb-4">
                  Ответ
                </div>
                <div className="text-base md:text-lg leading-relaxed">
                  {cards[idx].back}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mt-6">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={markUnknown}
              className="flex-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 font-medium py-3 rounded-xl text-sm hover:bg-red-100 dark:hover:bg-red-950"
            >
              ❌ Не знаю
            </button>
            <button
              onClick={markKnown}
              className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 font-medium py-3 rounded-xl text-sm hover:bg-emerald-100 dark:hover:bg-emerald-950"
            >
              ✅ Знаю
            </button>
            <button
              onClick={next}
              className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={shuffle}
              className="flex-1 text-sm text-slate-500 dark:text-slate-400 hover:text-brand flex items-center justify-center gap-1.5 py-2"
            >
              <Shuffle size={14} /> Перемешать
            </button>
            <button
              onClick={start}
              className="flex-1 text-sm text-slate-500 dark:text-slate-400 hover:text-brand flex items-center justify-center gap-1.5 py-2"
            >
              <RotateCcw size={14} /> Новые карточки
            </button>
          </div>
        </>
      )}
    </div>
  )
}
