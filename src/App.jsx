import { useEffect, useState } from 'react'
import { Heart, Moon, PawPrint, Sun } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert'
import { Button } from './components/ui/button'
import { PetCard } from './components/PetCard'
import { Results } from './components/Results'
import { useAuth } from './AuthProvider'
import { fetchPetsForUser, recordSelection } from './lib/api'
import AuthCallback from './AuthCallback'

const PETS_ENDPOINT = 'https://pet.btholt.workers.dev/pets/random/15'

function App() {
  const [pets, setPets] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedPets, setLikedPets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { user, loading: authLoading, signInWithGoogle } = useAuth()

  const fetchPets = async () => {
    setIsLoading(true)
    setError('')
    setCurrentIndex(0)
    setLikedPets([])
    try {
      if (!user) {
        setPets([])
        setError('Sign in to view pets')
        return
      }

      const data = await fetchPetsForUser(user.id)
      if (!Array.isArray(data) || data.length === 0) throw new Error('No pets available')
      setPets(data)
    } catch (fetchError) {
      setPets([])
      setError(fetchError.message || 'Something went wrong while finding pets.')
    } finally {
      setIsLoading(false)
    }
  }

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
      setLikedPets((liked) => [...liked, currentPet])
      if (user) recordSelection({ user_id: user.id, pet_id: currentPet.id, did_like: true }).catch(() => {})
      setCurrentIndex((index) => index + 1)
    }
  }

  useEffect(() => {
    if (!authLoading && user) fetchPets()
  }, [authLoading, user])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    const isCallbackPath = typeof window !== 'undefined' && window.location.pathname === '/auth/callback'
    if (isCallbackPath || !user || authLoading) return

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') handlePass()
      if (event.key === 'ArrowRight') handleLike()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  // --- Early returns and conditional rendering (placed below all hook declarations) ---

  // 1. Redirect callback handler
  if (typeof window !== 'undefined' && window.location.pathname === '/auth/callback') {
    return <AuthCallback />
  }

  // 2. Loading state
  if (authLoading) return null

  // 3. User sign-in wrapper
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center p-8">
          <h2 className="font-display text-2xl font-bold">Welcome to Pawfect</h2>
          <p className="mt-3 text-sm text-slate-600">Sign in to start swiping through adoptable pets.</p>
          <div className="mt-6 flex flex-col gap-3">
            <Button onClick={signInWithGoogle} className="w-full">Sign in with Google</Button>
            <Button onClick={() => {
              const demo = { id: crypto.randomUUID(), name: 'Demo User' }
              localStorage.setItem('demo_user', JSON.stringify(demo))
              window.location.reload()
            }} variant="outline" className="w-full">Continue as Demo User</Button>
          </div>
        </div>
      </main>
    )
  }

  const isFinished = !isLoading && !error && currentIndex === pets.length && pets.length > 0

  return (
    <main className="min-h-screen overflow-hidden px-5 pb-28 pt-6 text-slate-900 transition-colors duration-500 dark:text-stone-100 sm:px-8 sm:pt-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/25"><PawPrint size={23} strokeWidth={2.4} /></div>
            <div><p className="font-display text-lg font-bold leading-none tracking-tight">Pawfect</p><p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-stone-500">Pet matching</p></div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs font-bold text-slate-500 shadow-sm dark:border-stone-700 dark:bg-stone-900/70 dark:text-stone-400 sm:flex"><Heart size={14} className="fill-orange-500 text-orange-500" /><span>Find your new best friend</span></div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-12">
          {isLoading && <div className="flex flex-col items-center gap-5 text-center" role="status"><div className="relative flex h-20 w-20 items-center justify-center rounded-[2rem] bg-orange-100 text-orange-500 dark:bg-orange-950/60 dark:text-orange-300"><PawPrint className="animate-pulse" size={34} /><span className="absolute inset-0 animate-ping rounded-[2rem] border border-orange-300/70 dark:border-orange-600/50" /></div><div><h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Sniffing out some matches...</h1><p className="mt-2 text-sm text-slate-500 dark:text-stone-400">A fresh group of lovable pets is on the way.</p></div></div>}

          {!isLoading && error && <Alert className="max-w-md border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100"><AlertTitle>We lost the scent</AlertTitle><AlertDescription className="mt-1 flex flex-col gap-4"><span>{error}</span><Button type="button" onClick={fetchPets} variant="outline" className="w-fit border-rose-300 bg-transparent text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-100 dark:hover:bg-rose-900/50">Try again</Button></AlertDescription></Alert>}

          {!isLoading && !error && !isFinished && pets[currentIndex] && <PetCard pet={pets[currentIndex]} onPass={handlePass} onLike={handleLike} current={currentIndex + 1} total={pets.length} />}
          {isFinished && <Results likedPets={likedPets} onStartOver={fetchPets} />}
        </section>

        <footer className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-stone-500"><span>{!isFinished && !isLoading && !error ? 'Use the buttons or arrow keys to choose' : 'Made for every kind of wonderful'}</span>{!isFinished && !isLoading && !error && <span>{currentIndex + 1} / {pets.length}</span>}</footer>
      </div>

      <Button type="button" variant="outline" size="icon" aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setIsDarkMode((dark) => !dark)} className="fixed bottom-5 left-5 z-10 h-11 w-11 rounded-full border-slate-200 bg-white/90 shadow-lg backdrop-blur transition-transform hover:-translate-y-1 dark:border-stone-700 dark:bg-stone-900/90 sm:bottom-7 sm:left-7">{isDarkMode ? <Sun size={17} /> : <Moon size={17} />}</Button>
    </main>
  )
}

export default App
