import { useEffect, useRef, useState } from 'react'
import { Network, Loader2, Download } from 'lucide-react'
import { useDocument } from '../context/DocumentContext'
import { generateMindMap } from '../lib/ai'

let mermaidInitialized = false

export default function MindMap() {
  const { activeMaterial } = useDocument()
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const containerRef = useRef(null)

  const start = async () => {
    if (!activeMaterial?.text) {
      setError('Загрузите материал на главной странице')
      return
    }
    setBusy(true); setError(''); setCode('')
    try {
      const mm = await generateMindMap(activeMaterial.text)
      setCode(mm)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!code || !containerRef.current) return
    let cancelled = false

    ;(async () => {
      try {
        const mermaid = (await import('mermaid')).default
        if (!mermaidInitialized) {
          mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' })
          mermaidInitialized = true
        }
        const id = 'mm-' + Date.now()
        const { svg } = await mermaid.render(id, code)
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      } catch (e) {
        if (!cancelled) setError('Не удалось отрисовать схему: ' + e.message)
      }
    })()

    return () => { cancelled = true }
  }, [code])

  const downloadSVG = () => {
    if (!containerRef.current) return
    const svg = containerRef.current.querySelector('svg')
    if (!svg) return
    const data = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([data], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mindmap-${activeMaterial?.name || 'stadi'}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center gap-3 mb-4">
        <Network className="text-brand" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mind map</h1>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Визуальная карта ключевых идей документа.
      </p>

      {!activeMaterial && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-200 mb-4">
          Сначала загрузите материал на <b>главной странице</b>.
        </div>
      )}

      {!code && !busy && (
        <button
          onClick={start}
          disabled={!activeMaterial}
          className="w-full bg-brand hover:bg-blue-600 disabled:opacity-60 text-white font-medium py-3 rounded-xl inline-flex items-center justify-center gap-2 mb-4"
        >
          <Network size={18} /> Построить карту
        </button>
      )}

      {busy && (
        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 py-8">
          <Loader2 size={18} className="animate-spin" /> Строю схему…
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300 mb-4">
          {error}
        </div>
      )}

      {code && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 overflow-x-auto">
          <div className="flex justify-end mb-2">
            <button
              onClick={downloadSVG}
              className="text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-brand px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Download size={13} /> SVG
            </button>
          </div>
          <div ref={containerRef} className="min-w-[600px] text-center" />
        </div>
      )}
    </div>
  )
}
