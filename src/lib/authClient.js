import { createAuthClient } from '@neondatabase/auth'

// Lazy-initialize the auth client — createAuthClient requires a full absolute URL
// and throws at module load if the URL is invalid, which crashes the entire app.
// By deferring initialization we guarantee window.location.origin is available.
let _client = null

function getClient() {
  if (!_client) {
    try {
      const baseURL = import.meta.env.VITE_NEON_AUTH_URL || window.location.origin + '/auth-proxy'
      _client = createAuthClient(baseURL, {
        fetchOptions: {
          credentials: 'include',  // Send cookies cross-origin for Neon Auth
        },
      })
    } catch (e) {
      console.error('[AuthClient] Failed to create auth client:', e)
    }
  }
  return _client
}

// Re-export as a getter so existing imports like `authClient.getSession()` still work
export const authClient = new Proxy({}, {
  get(_, prop) {
    const client = getClient()
    if (!client) return undefined
    const value = client[prop]
    return typeof value === 'function' ? value.bind(client) : value
  }
})

export async function getSession() {
  const client = getClient()
  if (!client || typeof client.getSession !== 'function') return null
  try {
    const result = await client.getSession()
    // Better Auth wraps the response: { data: { session, user } }
    // Normalize so callers can use session.user directly
    if (result?.data?.user) return result.data
    if (result?.user) return result
    return null
  } catch {
    return null
  }
}

export async function signInWithProvider(providerId = 'google') {
  const client = getClient()
  const callbackURL = `${window.location.origin}/auth/callback`

  if (client && typeof client.signIn?.social === 'function') {
    try {
      return await client.signIn.social({
        provider: providerId,
        callbackURL,
      })
    } catch (e) {
      console.error('[AuthClient] social sign-in helper failed, falling back to manual redirect:', e)
    }
  }

  // Manual redirect fallback
  const baseURL = import.meta.env.VITE_NEON_AUTH_URL || window.location.origin + '/auth-proxy'
  if (!baseURL) return

  window.location.href = `${baseURL}/sign-in/social?providerId=${encodeURIComponent(providerId)}&redirect_to=${encodeURIComponent(callbackURL)}`
}

export async function signOut() {
  const client = getClient()
  if (client && typeof client.signOut === 'function') return client.signOut()
  localStorage.removeItem('demo_user')
}
