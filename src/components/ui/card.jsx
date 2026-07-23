import { cn } from '../../lib/utils'

export function Card({ className, ...props }) { return <div className={cn('rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-stone-700 dark:bg-stone-900 dark:shadow-black/20', className)} {...props} /> }