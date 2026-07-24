import { Heart, MapPin, X } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { useRef, useState } from 'react'

export function PetCard({ pet, onPass, onLike, current, total }) {
  const cardRef = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [rot, setRot] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  let startX = 0
  let startY = 0

  const handlePointerDown = (e) => {
    const p = e.touches ? e.touches[0] : e
    startX = p.clientX
    startY = p.clientY
    setIsDragging(true)
    e.target.setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    const p = e.touches ? e.touches[0] : e
    const dx = p.clientX - startX
    const dy = p.clientY - startY
    setPos({ x: dx, y: dy })
    setRot(Math.max(Math.min(dx / 20, 20), -20))
  }

  const release = () => {
    setIsDragging(false)
    const threshold = 120
    if (pos.x > threshold) {
      // like
      setPos({ x: 1000, y: pos.y })
      setTimeout(() => onLike && onLike(), 200)
      return
    }
    if (pos.x < -threshold) {
      // pass
      setPos({ x: -1000, y: pos.y })
      setTimeout(() => onPass && onPass(), 200)
      return
    }
    // reset
    setPos({ x: 0, y: 0 })
    setRot(0)
  }

  return (
    <div className="w-full max-w-md animate-[fade-in_500ms_ease-out]">
      <Card className="overflow-hidden">
        <div
          ref={cardRef}
          className="relative aspect-[4/4.7] overflow-hidden bg-slate-100 dark:bg-stone-800 touch-pan-y"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={release}
          onPointerCancel={release}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={release}
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) rotate(${rot}deg)`,
            transition: isDragging ? 'none' : 'transform 220ms ease-out',
          }}
        >
          <img src={pet.images[0]} alt={`${pet.name}, a ${pet.breed}`} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5"><span className="rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-600 shadow-sm backdrop-blur dark:bg-stone-950/75 dark:text-stone-300">{current} / {total}</span><span className="rounded-full bg-white/85 p-2 text-orange-500 shadow-sm backdrop-blur dark:bg-stone-950/75"><Heart size={15} className="fill-orange-500" /></span></div>
        </div>
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4"><div><h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-stone-100">{pet.name}</h1><p className="mt-1 text-sm font-semibold text-slate-500 dark:text-stone-400">{pet.breed} <span className="mx-1 text-slate-300 dark:text-stone-600">•</span> {typeof pet.age === 'number' ? `${pet.age} ${pet.age === 1 ? 'year' : 'years'}` : pet.age}</p></div><div className="mt-1 rounded-full bg-orange-50 p-2.5 text-orange-500 dark:bg-orange-950/50 dark:text-orange-300"><MapPin size={16} /></div></div>
          <div className="mt-7 grid grid-cols-2 gap-3"><Button type="button" variant="outline" size="lg" onClick={onPass} className="border-slate-200 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 dark:border-stone-700 dark:hover:border-rose-900 dark:hover:bg-rose-950/30"><X size={18} /> Pass</Button><Button type="button" size="lg" onClick={onLike} className="bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"><Heart size={18} className="fill-current" /> Like</Button></div>
        </div>
      </Card>
    </div>
  )
}