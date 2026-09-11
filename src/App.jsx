import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Materials from './pages/Materials'
import History from './pages/History'
import Settings from './pages/Settings'
import Developer from './pages/Developer'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

const withLayout = (el) => (<ProtectedRoute><Layout>{el}</Layout></ProtectedRoute>)

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return <div className="h-screen flex items-center justify-center text-slate-500">Загрузка…</div>
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={withLayout(<Home />)} />
      <Route path="/materials" element={withLayout(<Materials />)} />
      <Route path="/history" element={withLayout(<History />)} />
      <Route path="/settings" element={withLayout(<Settings />)} />
      <Route path="/developer" element={
        <ProtectedRoute developerOnly><Layout><Developer /></Layout></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
