import { useEffect, useState } from 'react'
import {
  GraduationCap, Loader2, RefreshCw, Check, X, Save, Sparkles,
} from 'lucide-react'
import { useDocument } from '../context/DocumentContext'
import { generateQuiz } from '../lib/ai'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const COUNTS = [5, 10, 15, 20]

export default function Quiz() {
  const { user } = useAuth()
  const { activeMaterial } = useDocument()
  const [count, setCount] = useState(5)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [finished, setFinished] = useState(false)
  const [saved, setSaved] = useState(false)
  const [results, setResults] = useState([])

  const loadResults = async () => {
    if (!user) return
    const { data } = await supabase
      .from('quiz_results')
      .select('id, material_name, total, correct, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
    setResults(data || [])
  }
  useEffect(() => { loadResults() }, [user])

  const start = async () => {
    if (!activeMaterial?.text) {
      setError('Загрузите материал на главной странице')
      return
    }
    setBusy(true); setError('')
    setQuestions([]); setAnswers({}); setFinished(false); setSaved(false)
    try {
      const { questions: qs } = await generateQuiz(activeMaterial.text, { count })
      setQuestions(qs || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const refreshQuestions = async () => {
    // Обновить только вопросы, сохранив количество
    await start()
  }

  const select = (qi, oi) => {
    if (finished) return
    setAnswers((a) => ({ ...a, [qi]: oi }))
  }

  const finish = () => setFinished(true)

  const saveResult = async () => {
    if (!user || !questions.length) return
    await supabase.from('quiz_results').insert({
      user_id: user.id,
      material_name: activeMaterial?.name || 'без материала',
      total: questions.length,
      correct: score,
    })
    setSaved(true)
    loadResults()
  }

  const score = questions.reduce(
    (s, q, i) => s + (answers[i] === q.correct ? 1 : 0), 0,
  )

  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center gap-3 mb-4">
        <GraduationCap className="text-brand" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Экзаменатор</h1>
      </div>

      {!activeMaterial && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-200 mb-4">
          Сначала загрузите материал на <b>главной странице</b>.
        </div>
      )}

      {!questions.length && !busy && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6">
          <div className="text-sm text-slate-600 dark:text-slate-300 mb-3">
            Сколько вопросов?
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
            <Sparkles size={18} /> Начать тест
          </button>
        </div>
      )}

      {busy && (
        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 py-8">
          <Loader2 size={18} className="animate-spin" /> Составляю вопросы…
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300 mb-4">
          {error}
        </div>
      )}

      {questions.length > 0 && (
        <>
          {finished && (
            <div className="relative overflow-hidden bg-gradient-to-br from-brand to-blue-500 text-white rounded-2xl px-6 py-8 mb-5 text-center">
              <div className="text-sm opacity-90">Ваш результат</div>
              <div className="text-5xl font-bold mt-1">
                {score} / {questions.length}
              </div>
              <div className="text-sm opacity-90 mt-1">{pct}%</div>
              <div className="mt-3 text-xs opacity-80">
                {pct >= 80 ? '🏆 Отличный результат!' :
                 pct >= 60 ? '👍 Хорошо, но есть что улучшить' :
                 '📚 Стоит повторить материал'}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div
                key={qi}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5"
              >
                <div className="font-medium text-slate-800 dark:text-slate-100 mb-3">
                  {qi + 1}. {q.q}
                </div>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[qi] === oi
                    const isCorrect = finished && oi === q.correct
                    const isWrong = finished && selected && oi !== q.correct
                    return (
                      <button
                        key={oi}
                        onClick={() => select(qi, oi)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm flex items-center justify-between gap-3 transition-colors ${
                          isCorrect
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                            : isWrong
                            ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
                            : selected
                            ? 'bg-brand/10 border-brand text-brand'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand/60'
                        }`}
                      >
                        <span>{opt}</span>
                        {isCorrect && <Check size={16} />}
                        {isWrong && <X size={16} />}
                      </button>
                    )
                  })}
                </div>
                {finished && q.explanation && (
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
            {!finished ? (
              <button
                onClick={finish}
                disabled={Object.keys(answers).length < questions.length}
                className="md:col-span-3 bg-brand hover:bg-blue-600 disabled:opacity-60 text-white font-medium py-3 rounded-xl"
              >
                Завершить и проверить
              </button>
            ) : (
              <>
                <button
                  onClick={start}
                  className="bg-brand hover:bg-blue-600 text-white font-medium py-3 rounded-xl inline-flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} /> Пройти ещё раз
                </button>
                <button
                  onClick={refreshQuestions}
                  disabled={busy}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-3 rounded-xl inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <RefreshCw size={16} /> Обновить тест
                </button>
                <button
                  onClick={saveResult}
                  disabled={saved}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-medium py-3 rounded-xl inline-flex items-center justify-center gap-2"
                >
                  <Save size={16} /> {saved ? 'Сохранено' : 'Сохранить результат'}
                </button>
              </>
            )}
          </div>
        </>
      )}

      {results.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Последние результаты
          </h2>
          <div className="space-y-2">
            {results.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <div className="text-slate-800 dark:text-slate-100 truncate">{r.material_name}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(r.created_at).toLocaleString('ru-RU')}
                  </div>
                </div>
                <div className={`font-bold ${r.correct / r.total >= 0.7 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {r.correct} / {r.total}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
