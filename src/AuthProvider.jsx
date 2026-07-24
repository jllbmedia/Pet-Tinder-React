import { createContext, useContext, useEffect, useState } from 'react'
import { getSession, signInWithProvider, signOut } from './lib/authClient'

const AuthContext = createContext({ user: null, loading: true, signInWithGoogle: () => {}, signOut: () => {} })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const s = await getSession()
        if (!mounted) return
        if (s && s.user) setUser(s.user)
        else {
          // fallback: check demo_user in localStorage
          const demo = JSON.parse(localStorage.getItem('demo_user') || 'null')
          if (demo) setUser(demo)
        }
      } catch (e) {
        console.debug('auth init failed', e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => (mounted = false)
  }, [])

  const signInWithGoogle = () => signInWithProvider('google')
  const doSignOut = async () => {
    await signOut()
    localStorage.removeItem('demo_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut: doSignOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
