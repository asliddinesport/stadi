import { useParams } from 'react-router-dom'
import Chat from '../components/Chat'

export default function ChatView() {
  const { id } = useParams()
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden h-[calc(100vh-200px)] md:h-[700px] flex flex-col">
        <Chat chatId={id} />
      </div>
    </div>
  )
}
