import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-slate-900 text-white hover:bg-slate-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white',
  outline: 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white',
}

const sizes = { default: 'h-10 px-4 py-2', sm: 'h-9 rounded-lg px-3', lg: 'h-12 rounded-xl px-6', icon: 'h-10 w-10' }

export function Button({ className, variant = 'default', size = 'default', ...props }) {
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]', variants[variant], sizes[size], className)} {...props} />
}