import { Heart, MapPin, X } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { useRef, useState } from 'react'

export function PetCard({ pet, onPass, onLike, current, total }) {
  const cardRef = useRef(null)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const isDraggingRef = useRef(false)

  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [rot, setRot] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const handlePointerDown = (e) => {
    const p = e.touches ? e.touches[0] : e
    startXRef.current = p.clientX
    startYRef.current = p.clientY
    isDraggingRef.current = true
    setIsDragging(true)
    if (e.currentTarget?.setPointerCapture && e.pointerId) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {}
    }
  }

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return
    const p = e.touches ? e.touches[0] : e
    const dx = p.clientX - startXRef.current
    const dy = p.clientY - startYRef.current
    setPos({ x: dx, y: dy })
    setRot(Math.max(Math.min(dx / 18, 22), -22))
  }

  const release = () => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    setIsDragging(false)

    const threshold = 100
    if (pos.x > threshold) {
      // Like swipe animation off-screen
      setPos({ x: 800, y: pos.y })
      setRot(25)
      setTimeout(() => {
        setPos({ x: 0, y: 0 })
        setRot(0)
        onLike && onLike()
      }, 200)
      return
    }
    if (pos.x < -threshold) {
      // Pass swipe animation off-screen
      setPos({ x: -800, y: pos.y })
      setRot(-25)
      setTimeout(() => {
        setPos({ x: 0, y: 0 })
        setRot(0)
        onPass && onPass()
      }, 200)
      return
    }

    // Reset back to center
    setPos({ x: 0, y: 0 })
    setRot(0)
  }

  // Calculate stamp opacity based on drag distance
  const likeOpacity = Math.min(Math.max((pos.x - 20) / 90, 0), 1)
  const nopeOpacity = Math.min(Math.max((-pos.x - 20) / 90, 0), 1)

  return (
    <div className="w-full max-w-md animate-[fade-in_500ms_ease-out] touch-none select-none">
      <Card className="overflow-hidden shadow-xl border border-slate-200 dark:border-stone-800">
        <div
          ref={cardRef}
          className="relative aspect-[4/4.7] cursor-grab overflow-hidden bg-slate-100 dark:bg-stone-800 active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={release}
          onPointerCancel={release}
          style={{
            transform: `translate3d(${pos.x}px, ${pos.y}px, 0px) rotate(${rot}deg)`,
            transition: isDragging ? 'none' : 'transform 250ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
        >
          {/* Dynamic LIKE Stamp Overlay */}
          <div
            className="absolute left-6 top-8 z-20 pointer-events-none rounded-xl border-4 border-emerald-500 bg-emerald-500/20 px-4 py-1.5 font-display text-3xl font-black uppercase tracking-wider text-emerald-500 rotate-[-18deg] shadow-lg backdrop-blur-xs transition-opacity duration-75"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </div>

          {/* Dynamic NOPE / PASS Stamp Overlay */}
          <div
            className="absolute right-6 top-8 z-20 pointer-events-none rounded-xl border-4 border-rose-500 bg-rose-500/20 px-4 py-1.5 font-display text-3xl font-black uppercase tracking-wider text-rose-500 rotate-[18deg] shadow-lg backdrop-blur-xs transition-opacity duration-75"
            style={{ opacity: nopeOpacity }}
          >
            NOPE
          </div>

          <img src={pet.images?.[0] || pet.image_url} alt={`${pet.name}, a ${pet.breed}`} className="h-full w-full object-cover pointer-events-none select-none" />

          {/* Card Counter & Icon Badge */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 pointer-events-none">
            <span className="rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-600 shadow-sm backdrop-blur dark:bg-stone-950/75 dark:text-stone-300">
              {current} / {total}
            </span>
            <span className="rounded-full bg-white/85 p-2 text-orange-500 shadow-sm backdrop-blur dark:bg-stone-950/75">
              <Heart size={15} className="fill-orange-500" />
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-stone-100">
                {pet.name}
              </h1>
              <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-stone-400">
                {pet.breed} <span className="mx-1 text-slate-300 dark:text-stone-600">•</span> {typeof pet.age === 'number' ? `${pet.age} ${pet.age === 1 ? 'year' : 'years'}` : pet.age}
              </p>
            </div>
            <div className="mt-1 rounded-full bg-orange-50 p-2.5 text-orange-500 dark:bg-orange-950/50 dark:text-orange-300">
              <MapPin size={16} />
            </div>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                setPos({ x: -800, y: 0 })
                setRot(-25)
                setTimeout(() => {
                  setPos({ x: 0, y: 0 })
                  setRot(0)
                  onPass && onPass()
                }, 200)
              }}
              className="border-slate-200 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 dark:border-stone-700 dark:hover:border-rose-900 dark:hover:bg-rose-950/30"
            >
              <X size={18} /> Pass
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={() => {
                setPos({ x: 800, y: 0 })
                setRot(25)
                setTimeout(() => {
                  setPos({ x: 0, y: 0 })
                  setRot(0)
                  onLike && onLike()
                }, 200)
              }}
              className="bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
            >
              <Heart size={18} className="fill-current" /> Like
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}