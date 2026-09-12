import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Welcome from './pages/Welcome'
import Promo from './pages/Promo'
import Home from './pages/Home'
import ChatList from './pages/ChatList'
import ChatView from './pages/ChatView'
import Materials from './pages/Materials'
import History from './pages/History'
import Settings from './pages/Settings'
import Developer from './pages/Developer'
import Summary from './pages/Summary'
import Quiz from './pages/Quiz'
import Flashcards from './pages/Flashcards'
import MindMap from './pages/MindMap'
import Schedule from './pages/Schedule'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

const withLayout = (el) => <ProtectedRoute><Layout>{el}</Layout></ProtectedRoute>

export default function App() {
  const { user, loading } = useAuth()
  if (loading) {
    return <div className="h-screen flex items-center justify-center text-slate-500">Загрузка…</div>
  }

  return (
    <Routes>
      {/* Публичные */}
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/promo" element={<Promo />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

      {/* Приватные */}
      <Route path="/" element={withLayout(<Home />)} />
      <Route path="/chats" element={withLayout(<ChatList />)} />
      <Route path="/chat/:id" element={withLayout(<ChatView />)} />
      <Route path="/materials" element={withLayout(<Materials />)} />
      <Route path="/history" element={withLayout(<History />)} />
      <Route path="/schedule" element={withLayout(<Schedule />)} />
      <Route path="/settings" element={withLayout(<Settings />)} />
      <Route path="/summary" element={withLayout(<Summary />)} />
      <Route path="/quiz" element={withLayout(<Quiz />)} />
      <Route path="/flashcards" element={withLayout(<Flashcards />)} />
      <Route path="/mindmap" element={withLayout(<MindMap />)} />
      <Route
        path="/developer"
        element={<ProtectedRoute developerOnly><Layout><Developer /></Layout></ProtectedRoute>}
      />

      {/* Fallback: если не залогинен — на /welcome, иначе на / */}
      <Route path="*" element={<Navigate to={user ? '/' : '/welcome'} replace />} />
    </Routes>
  )
}
