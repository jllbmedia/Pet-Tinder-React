import { useEffect, useState } from 'react'
import { getSession } from './lib/authClient'
import { Button } from './components/ui/button'

export default function AuthCallback() {
  const [status, setStatus] = useState('processing')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // try to finalize session with the auth client
        const s = await getSession()
        if (!mounted) return
        if (s && s.user) {
          // redirect home — AuthProvider will pick up session
          setStatus('done')
          window.history.replaceState({}, document.title, '/')
          window.location.replace('/')
          return
        }
        // fallback: try reading query params or wait a moment
        setStatus('no-session')
      } catch (err) {
        setStatus('error')
      }
    })()
    return () => (mounted = false)
  }, [])

  if (status === 'processing') return <div className="min-h-screen flex items-center justify-center">Finalizing sign-in…</div>
  if (status === 'done') return <div className="min-h-screen flex items-center justify-center">Signed in — redirecting…</div>

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md text-center p-8">
        <h2 className="font-display text-2xl font-bold">Sign-in result</h2>
        <p className="mt-3 text-sm text-slate-600">{status === 'no-session' ? 'No active session found. Try signing in again.' : 'Something went wrong finishing sign-in.'}</p>
        <div className="mt-6">
          <Button onClick={() => window.location.replace('/')}>Back home</Button>
        </div>
      </div>
    </div>
  )
}
