import { useState } from 'react'
import FileUpload from '../components/FileUpload'
import Chat from '../components/Chat'
import { Logo } from '../components/Sidebar'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useDocument } from '../context/DocumentContext'

export default function Home() {
  const { user } = useAuth()
  const { activeMaterial, setActiveMaterial } = useDocument()
  const [messages, setMessages] = useState([])

  const handleUploaded = async (m) => {
    setActiveMaterial(m)
    if (user)
      await supabase
        .from('materials')
        .insert({ user_id: user.id, name: m.name, content: m.text.slice(0, 100000) })
  }

  const handleAsk = async ({ question, answer }) => {
    if (user) await supabase.from('history').insert({ user_id: user.id, question, answer })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="text-center mb-6 md:mb-8">
        <div className="flex justify-center mb-3 md:mb-4">
          <Logo className="w-12 h-12 md:w-16 md:h-16" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Стади
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
          Задавай вопросы по учебным материалам
          <br className="hidden md:block" /> и получай точные ответы с указанием источников.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-4 md:mb-6">
        <div className="p-4 md:p-6">
          <FileUpload onUploaded={handleUploaded} />
          {activeMaterial && (
            <div className="mt-4 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-3 break-words">
              ✅ Загружен материал: <b>{activeMaterial.name}</b> (
              {(activeMaterial.size / 1024).toFixed(1)} КБ,{' '}
              {activeMaterial.text.length} символов)
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden h-[calc(100vh-280px)] md:h-[600px] flex flex-col">
        <Chat
          material={activeMaterial}
          onAsk={handleAsk}
          messages={messages}
          setMessages={setMessages}
        />
      </div>
    </div>
  )
}
