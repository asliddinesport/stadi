import { useState } from 'react'
import FileUpload from '../components/FileUpload'
import Chat from '../components/Chat'
import { Logo } from '../components/Sidebar'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [material, setMaterial] = useState(null)
  const [messages, setMessages] = useState([])

  const handleUploaded = async (m) => {
    setMaterial(m)
    if (user) await supabase.from('materials').insert({ user_id: user.id, name: m.name, content: m.text.slice(0, 100000) })
  }
  const handleAsk = async ({ question, answer }) => {
    if (user) await supabase.from('history').insert({ user_id: user.id, question, answer })
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4"><Logo className="w-16 h-16" /></div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Стади</h1>
        <p className="text-slate-500">Задавай вопросы по учебным материалам<br />и получай точные ответы с указанием источников.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
        <div className="p-6">
          <FileUpload onUploaded={handleUploaded} />
          {material && (
            <div className="mt-4 text-sm text-slate-600 bg-slate-50 rounded-lg px-4 py-3">
              ✅ Загружен материал: <b>{material.name}</b> ({(material.size / 1024).toFixed(1)} КБ, {material.text.length} символов)
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-[600px] flex flex-col">
        <Chat material={material} onAsk={handleAsk} messages={messages} setMessages={setMessages} />
      </div>
    </div>
  )
}
