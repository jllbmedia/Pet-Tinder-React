import { useEffect, useState, useRef } from 'react'
import { getSession } from './lib/authClient'
import { Button } from './components/ui/button'

export default function AuthCallback() {
  const [status, setStatus] = useState('processing')
  const hasExecuted = useRef(false)

  useEffect(() => {
    if (hasExecuted.current) return
    hasExecuted.current = true

    async function verifyAuth() {
      try {
        const session = await getSession()
        const user = session?.user || session?.data?.user
        if (user) {
          setStatus('done')
          window.location.replace('/')
        } else {
          // Fallback session check delay if cookies are setting
          setTimeout(async () => {
            const retry = await getSession()
            const retryUser = retry?.user || retry?.data?.user
            if (retryUser) {
              setStatus('done')
              window.location.replace('/')
            } else {
              setStatus('no-session')
            }
          }, 1000)
        }
      } catch (err) {
        console.error('Callback error:', err)
        setStatus('error')
      }
    }

    verifyAuth()
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
