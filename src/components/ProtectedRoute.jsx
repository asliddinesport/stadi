import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, developerOnly = false }) {
  const { user, loading, isDeveloper } = useAuth()
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-500">
        Загрузка…
      </div>
    )
  }
  if (!user) return <Navigate to="/welcome" replace />
  if (developerOnly && !isDeveloper) return <Navigate to="/" replace />
  return children
}
