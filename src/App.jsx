import { useEffect, useState } from 'react'
import { Heart, LogOut, Moon, PawPrint, Sparkles, Sun, User } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert'
import { Button } from './components/ui/button'
import { PetCard } from './components/PetCard'
import { Results } from './components/Results'
import { useAuth } from './AuthProvider'
import { fetchPetsForUser, fetchLikedPetsForUser, fetchPreviewPets, recordSelection } from './lib/api'
import AuthCallback from './AuthCallback'

function App() {
  const [pets, setPets] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedPets, setLikedPets] = useState([])
  const [previewPets, setPreviewPets] = useState([])
  const [activeTab, setActiveTab] = useState('swipe') // 'swipe' | 'liked'
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)

  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth()

  // 1. Fetch unauthenticated preview pets
  useEffect(() => {
    if (!user && !authLoading) {
      fetchPreviewPets().then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPreviewPets(data.slice(0, 3))
        }
      }).catch(() => {})
    }
  }, [user, authLoading])

  // 2. Fetch pets and past liked pets when user is logged in
  const fetchPets = async () => {
    setIsLoading(true)
    setError('')
    setCurrentIndex(0)
    try {
      if (!user) return

      // Load past liked pets from DB
      const pastLiked = await fetchLikedPetsForUser(user.id).catch(() => [])
      setLikedPets(pastLiked)

      // Load unswiped pets deck
      const data = await fetchPetsForUser(user.id)
      setPets(data)
    } catch (fetchError) {
      setPets([])
      setError(fetchError.message || 'Something went wrong while finding pets.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      fetchPets()
    }
  }, [authLoading, user])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  const handlePass = () => {
    if (!isLoading && currentIndex < pets.length) {
      const currentPet = pets[currentIndex]
      if (user) recordSelection({ user_id: user.id, pet_id: currentPet.id, did_like: false }).catch(() => {})
      setCurrentIndex((index) => index + 1)
    }
  }

  const handleLike = () => {
    if (!isLoading && currentIndex < pets.length) {
      const currentPet = pets[currentIndex]
      setLikedPets((liked) => {
        const exists = liked.some((p) => String(p.id) === String(currentPet.id))
        return exists ? liked : [currentPet, ...liked]
      })
      if (user) recordSelection({ user_id: user.id, pet_id: currentPet.id, did_like: true }).catch(() => {})
      setCurrentIndex((index) => index + 1)
    }
  }

  useEffect(() => {
    const isCallbackPath = typeof window !== 'undefined' && window.location.pathname === '/auth/callback'
    if (isCallbackPath || !user || authLoading || activeTab !== 'swipe') return

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') handlePass()
      if (event.key === 'ArrowRight') handleLike()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  // --- Early returns (Rules of Hooks: placed after all hooks) ---

  // 1. Redirect callback handler
  if (typeof window !== 'undefined' && window.location.pathname === '/auth/callback') {
    return <AuthCallback />
  }

  // 2. Auth loading state
  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-stone-950">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500 dark:text-stone-400">Signing you in...</p>
        </div>
      </main>
    )
  }

  // 3. Unauthenticated Login Screen with Preview Pet Cards
  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-slate-50 dark:bg-stone-950 text-slate-900 dark:text-stone-100 transition-colors">
        <div className="w-full max-w-xl text-center space-y-8">
          <div className="space-y-3">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-orange-500 text-white shadow-lg shadow-orange-500/30 mb-2">
              <PawPrint size={32} strokeWidth={2.4} />
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Welcome to Pawfect</h1>
            <p className="text-base text-slate-600 dark:text-stone-400 max-w-md mx-auto">
              Swipe through adoptable pets near you and find your new best friend.
            </p>
          </div>

          {/* 3 Random Pet Preview Cards */}
          {previewPets.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-500 dark:text-orange-400 flex items-center justify-center gap-1.5">
                <Sparkles size={14} /> Preview Adoptable Pets
              </p>
              <div className="grid grid-cols-3 gap-3">
                {previewPets.map((pet, idx) => {
                  const imgSrc = pet.images?.[0] || pet.image_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d'
                  return (
                    <div key={pet.id || idx} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all hover:scale-105 dark:border-stone-800 dark:bg-stone-900">
                      <div className="aspect-square overflow-hidden bg-slate-100 dark:bg-stone-800">
                        <img src={imgSrc} alt={pet.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="p-2.5 text-center">
                        <p className="font-display text-xs font-bold text-slate-900 dark:text-stone-100 truncate">{pet.name}</p>
                        <p className="text-[11px] font-medium text-slate-400 dark:text-stone-500 truncate">{pet.breed}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="max-w-md mx-auto flex flex-col gap-3 pt-2">
            <Button onClick={signInWithGoogle} size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/25">
              Sign in with Google
            </Button>
            <Button
              onClick={() => {
                const demo = { id: crypto.randomUUID(), name: 'Demo User' }
                localStorage.setItem('demo_user', JSON.stringify(demo))
                window.location.reload()
              }}
              variant="outline"
              size="lg"
              className="w-full border-slate-300 dark:border-stone-700"
            >
              Continue as Demo User
            </Button>
          </div>
        </div>

        {/* Theme Toggle on Login Screen */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setIsDarkMode((dark) => !dark)}
          className="fixed bottom-5 left-5 z-10 h-11 w-11 rounded-full border-slate-200 bg-white/90 shadow-lg backdrop-blur dark:border-stone-700 dark:bg-stone-900/90"
        >
          {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
        </Button>
      </main>
    )
  }

  const displayName = user.name || user.email?.split('@')[0] || 'Friend'
  const isFinished = !isLoading && !error && currentIndex >= pets.length && pets.length > 0

  return (
    <main className="min-h-screen overflow-hidden px-5 pb-28 pt-6 text-slate-900 transition-colors duration-500 dark:text-stone-100 sm:px-8 sm:pt-8 bg-slate-50 dark:bg-stone-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        {/* Main Application Header */}
        <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 dark:border-stone-800/80 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/25">
              <PawPrint size={23} strokeWidth={2.4} />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-none tracking-tight">Pawfect</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-stone-500">Pet matching</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <div className="flex items-center rounded-full bg-slate-200/70 p-1 dark:bg-stone-800/80 self-center sm:self-auto">
            <button
              onClick={() => setActiveTab('swipe')}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'swipe'
                  ? 'bg-white text-slate-900 shadow dark:bg-stone-900 dark:text-stone-100'
                  : 'text-slate-500 hover:text-slate-900 dark:text-stone-400 dark:hover:text-stone-100'
              }`}
            >
              <Sparkles size={14} className={activeTab === 'swipe' ? 'text-orange-500' : ''} />
              <span>Swipe Deck</span>
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'liked'
                  ? 'bg-white text-slate-900 shadow dark:bg-stone-900 dark:text-stone-100'
                  : 'text-slate-500 hover:text-slate-900 dark:text-stone-400 dark:hover:text-stone-100'
              }`}
            >
              <Heart size={14} className={activeTab === 'liked' ? 'fill-orange-500 text-orange-500' : ''} />
              <span>Liked ({likedPets.length})</span>
            </button>
          </div>

          {/* User Profile & Log Out */}
          <div className="flex items-center gap-3 justify-between sm:justify-end">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
              <User size={14} className="text-orange-500" />
              <span>Welcome, <strong className="text-slate-900 dark:text-stone-100">{displayName}</strong></span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-stone-800 dark:text-stone-300 dark:hover:border-rose-900 dark:hover:bg-rose-950/40"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <section className="flex flex-1 flex-col items-center justify-center py-8 sm:py-12">
          {activeTab === 'liked' ? (
            <Results likedPets={likedPets} onStartOver={() => { setActiveTab('swipe'); fetchPets(); }} />
          ) : (
            <>
              {isLoading && (
                <div className="flex flex-col items-center gap-5 text-center" role="status">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-[2rem] bg-orange-100 text-orange-500 dark:bg-orange-950/60 dark:text-orange-300">
                    <PawPrint className="animate-pulse" size={34} />
                    <span className="absolute inset-0 animate-ping rounded-[2rem] border border-orange-300/70 dark:border-orange-600/50" />
                  </div>
                  <div>
                    <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Sniffing out some matches...</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-stone-400">A fresh group of lovable pets is on the way.</p>
                  </div>
                </div>
              )}

              {!isLoading && error && (
                <Alert className="max-w-md border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100">
                  <AlertTitle>We lost the scent</AlertTitle>
                  <AlertDescription className="mt-1 flex flex-col gap-4">
                    <span>{error}</span>
                    <Button type="button" onClick={fetchPets} variant="outline" className="w-fit border-rose-300 bg-transparent text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-100 dark:hover:bg-rose-900/50">
                      Try again
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {!isLoading && !error && !isFinished && pets[currentIndex] && (
                <PetCard pet={pets[currentIndex]} onPass={handlePass} onLike={handleLike} current={currentIndex + 1} total={pets.length} />
              )}

              {isFinished && (
                <Results likedPets={likedPets} onStartOver={fetchPets} />
              )}
            </>
          )}
        </section>

        {/* Footer */}
        <footer className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-stone-500">
          <span>{activeTab === 'swipe' && !isFinished && !isLoading && !error ? 'Drag card left to Pass, right to Like, or use arrow keys' : 'Made for every kind of wonderful'}</span>
          {activeTab === 'swipe' && !isFinished && !isLoading && !error && <span>{currentIndex + 1} / {pets.length}</span>}
        </footer>
      </div>

      {/* Theme Toggle Floating Button */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={() => setIsDarkMode((dark) => !dark)}
        className="fixed bottom-5 left-5 z-10 h-11 w-11 rounded-full border-slate-200 bg-white/90 shadow-lg backdrop-blur transition-transform hover:-translate-y-1 dark:border-stone-700 dark:bg-stone-900/90 sm:bottom-7 sm:left-7"
      >
        {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
      </Button>
    </main>
  )
}

export default App
