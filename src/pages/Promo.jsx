import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Promo() {
  return (
    <div className="relative w-screen h-screen bg-slate-950">
      <Link
        to="/welcome"
        className="fixed top-4 left-4 z-50 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 backdrop-blur border border-slate-700/50 text-slate-200 text-xs font-medium transition-colors"
      >
        <ArrowLeft size={14} /> Назад
      </Link>
      <iframe
        src="/promo/index.html"
        title="Стади — Презентация"
        className="w-full h-full border-0"
      />
    </div>
  )
}
