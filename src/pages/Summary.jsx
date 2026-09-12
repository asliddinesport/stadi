import { useState } from 'react'
import { FileText, Loader2, Download, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useDocument } from '../context/DocumentContext'
import { summarizeDocument } from '../lib/ai'

export default function Summary() {
  const { activeMaterial } = useDocument()
  const [result, setResult] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')

  const run = async () => {
    if (!activeMaterial?.text) {
      setError('Загрузите материал на главной странице')
      return
    }
    setBusy(true)
    setError('')
    setResult('')
    try {
      const md = await summarizeDocument(activeMaterial.text, {
        maxChunks: 5,
        onProgress: setProgress,
      })
      setResult(md)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
      setProgress('')
    }
  }

  const download = () => {
    const blob = new Blob([result], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `конспект-${activeMaterial?.name || 'stadi'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="text-brand" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Конспект</h1>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        ИИ сделает структурированный конспект по вашему материалу.
      </p>

      {!activeMaterial && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-200 mb-4">
          Сначала загрузите материал на <b>главной странице</b>.
        </div>
      )}

      {activeMaterial && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-4 text-sm text-slate-700 dark:text-slate-200">
          Материал: <b>{activeMaterial.name}</b> ({activeMaterial.text.length} символов)
        </div>
      )}

      <button
        onClick={run}
        disabled={busy || !activeMaterial}
        className="w-full bg-brand hover:bg-blue-600 disabled:opacity-60 text-white font-medium py-3 rounded-xl inline-flex items-center justify-center gap-2 mb-4"
      >
        {busy ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
        {busy ? progress || 'Готовлю конспект…' : 'Сделать конспект'}
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300 mb-4">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6">
          <div className="flex justify-end mb-2">
            <button
              onClick={download}
              className="text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-brand px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Download size={13} /> Скачать .md
            </button>
          </div>
          <article className="prose-chat text-slate-700 dark:text-slate-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </article>
        </div>
      )}
    </div>
  )
}
