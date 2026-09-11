import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, File, X, Loader2 } from 'lucide-react'
import { extractTextFromFile } from '../lib/documentParser'

export default function FileUpload({ onUploaded }) {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = useCallback(async (files) => {
    setError('')
    const file = files[0]
    if (!file) return
    setProcessing(true)
    try {
      const text = await extractTextFromFile(file)
      onUploaded?.({ name: file.name, size: file.size, text })
    } catch (e) {
      setError(e.message || 'Не удалось обработать файл')
    } finally {
      setProcessing(false)
    }
  }, [onUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFiles,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 md:p-10 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-brand bg-blue-50 dark:bg-blue-950/30'
            : 'border-slate-200 dark:border-slate-700 hover:border-brand/60 bg-white dark:bg-slate-800'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
            {processing ? (
              <Loader2 className="text-brand animate-spin" size={26} />
            ) : (
              <UploadCloud className="text-brand" size={26} />
            )}
          </div>
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-100">
              {processing ? 'Обрабатываю файл…' : 'Загрузите учебный материал'}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Поддерживаются PDF и DOCX файлы
            </div>
          </div>
          <button
            type="button"
            disabled={processing}
            className="mt-2 bg-brand hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg inline-flex items-center gap-2"
          >
            <File size={16} />
            Выбрать файл
          </button>
          <div className="text-xs text-slate-400 dark:text-slate-500">
            или перетащите файл сюда
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <X size={14} /> {error}
        </div>
      )}
    </div>
  )
}
