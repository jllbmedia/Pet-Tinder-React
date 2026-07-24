import { createAuthClient } from '@neondatabase/auth'

const AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL

// Create a client adapter (Better Auth-style adapter)
export const authClient = createAuthClient(AUTH_URL)

export async function getSession() {
  if (!authClient || typeof authClient.getSession !== 'function') return null
  try {
    return await authClient.getSession()
  } catch {
    return null
  }
}

export async function signInWithProvider(providerId = 'google') {
  // Try to use adapter if available; otherwise redirect to the auth URL with a callback
  const callbackURL = `${window.location.origin}/auth/callback`
  if (authClient && typeof authClient.signIn?.social === 'function') {
    // prefer client redirect helper if present
    try {
      return await authClient.signIn.social({
        provider: providerId,
        callbackURL,
      })
    } catch (e) {
      console.error('[AuthClient] social sign-in helper failed, falling back to manual redirect:', e)
    }
  }

  if (!AUTH_URL) return

  // Common hosted auth redirect paths — try a sensible default
  const candidates = [
    `${AUTH_URL}/sign-in/oauth?provider=${encodeURIComponent(providerId)}&redirect_to=${encodeURIComponent(callbackURL)}`,
    `${AUTH_URL}/sign-in/social?providerId=${encodeURIComponent(providerId)}&redirect_to=${encodeURIComponent(callbackURL)}`,
    `${AUTH_URL}/authorize?provider=${encodeURIComponent(providerId)}&redirect_uri=${encodeURIComponent(callbackURL)}`,
  ]

  window.location.href = candidates[0]
}

export async function signOut() {
  if (authClient && typeof authClient.signOut === 'function') return authClient.signOut()
  // fallback: clear local storage
  localStorage.removeItem('demo_user')
}
