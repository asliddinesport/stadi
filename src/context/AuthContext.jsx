import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  const signInWithEmail = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signUpWithEmail = (email, password) => supabase.auth.signUp({ email, password })
  const signInWithGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
  const signInWithApple = () => supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: window.location.origin } })
  const signOut = () => supabase.auth.signOut()

  const developerEmail = (import.meta.env.VITE_DEVELOPER_EMAIL || '').toLowerCase()
  const isDeveloper = !!user?.email && user.email.toLowerCase() === developerEmail

  return (
    <AuthContext.Provider value={{ user, loading, isDeveloper, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)
