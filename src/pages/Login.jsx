import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Chrome, Apple as AppleIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/Sidebar'

export default function Login() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const fn = mode === 'signin' ? signInWithEmail : signUpWithEmail
      const { error } = await fn(email, password)
      if (error) throw error
      if (mode === 'signup') setError('Проверьте почту для подтверждения регистрации')
      else navigate('/')
    } catch (err) {
      setError(err.message || 'Ошибка входа')
    } finally {
      setBusy(false)
    }
  }

  const oauth = async (provider) => {
    setError('')
    const { error } =
      provider === 'google' ? await signInWithGoogle() : await signInWithApple()
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
        <div className="flex flex-col items-center gap-3 mb-8">
          <Logo className="w-14 h-14" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Стади</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            {mode === 'signin'
              ? 'Войдите, чтобы продолжить обучение'
              : 'Создайте аккаунт, чтобы начать'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-brand outline-none text-sm"
            />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Пароль (мин. 6 символов)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-brand outline-none text-sm"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-brand hover:bg-blue-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {busy ? 'Подождите…' : mode === 'signin' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          или
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </div>

        <div className="space-y-2">
          <button
            onClick={() => oauth('google')}
            className="w-full flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Chrome size={18} /> Войти через Google
          </button>
          <button
            onClick={() => oauth('apple')}
            className="w-full flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
          >
            <AppleIcon size={18} /> Войти через Apple ID
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {mode === 'signin' ? (
            <>
              Нет аккаунта?{' '}
              <button onClick={() => setMode('signup')} className="text-brand font-medium">
                Зарегистрироваться
              </button>
            </>
          ) : (
            <>
              Уже есть аккаунт?{' '}
              <button onClick={() => setMode('signin')} className="text-brand font-medium">
                Войти
              </button>
            </>
          )}
        </div>

        <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800 text-center">
          <Link
            to="/welcome"
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-brand transition-colors"
          >
            ← На главную
          </Link>
        </div>
      </div>
    </div>
  )
}
