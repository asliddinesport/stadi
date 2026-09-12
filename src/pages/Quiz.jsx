import { useState } from 'react'
import { GraduationCap, Loader2, RefreshCw, Check, X } from 'lucide-react'
import { useDocument } from '../context/DocumentContext'
import { generateQuiz } from '../lib/ai'

export default function Quiz() {
  const { activeMaterial } = useDocument()
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [finished, setFinished] = useState(false)

  const start = async () => {
    if (!activeMaterial?.text) {
      setError('Загрузите материал на главной странице')
      return
    }
    setBusy(true); setError('')
    setQuestions([]); setAnswers({}); setFinished(false)
    try {
      const { questions } = await generateQuiz(activeMaterial.text, { count: 5 })
      setQuestions(questions || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const select = (qi, oi) => {
    if (finished) return
    setAnswers((a) => ({ ...a, [qi]: oi }))
  }

  const finish = () => setFinished(true)

  const score = questions.reduce(
    (s, q, i) => s + (answers[i] === q.correct ? 1 : 0),
    0,
  )

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center gap-3 mb-4">
        <GraduationCap className="text-brand" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Экзаменатор</h1>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        ИИ составит тест по вашему материалу и оценит ответы.
      </p>

      {!activeMaterial && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-200 mb-4">
          Сначала загрузите материал на <b>главной странице</b>.
        </div>
      )}

      {!questions.length && !busy && (
        <button
          onClick={start}
          disabled={!activeMaterial}
          className="w-full bg-brand hover:bg-blue-600 disabled:opacity-60 text-white font-medium py-3 rounded-xl inline-flex items-center justify-center gap-2 mb-4"
        >
          <GraduationCap size={18} /> Начать тест
        </button>
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
            <div className="bg-brand/10 border border-brand/30 rounded-xl px-5 py-4 mb-5 text-center">
              <div className="text-slate-700 dark:text-slate-200 text-sm">Ваш результат</div>
              <div className="text-3xl font-bold text-brand mt-1">
                {score} / {questions.length}
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

          <div className="flex gap-3 mt-6">
            {!finished ? (
              <button
                onClick={finish}
                disabled={Object.keys(answers).length < questions.length}
                className="flex-1 bg-brand hover:bg-blue-600 disabled:opacity-60 text-white font-medium py-3 rounded-xl"
              >
                Завершить и проверить
              </button>
            ) : (
              <button
                onClick={start}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-3 rounded-xl inline-flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} /> Пройти заново
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
