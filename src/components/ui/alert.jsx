import { cn } from '../../lib/utils'

export function Alert({ className, ...props }) { return <div role="alert" className={cn('relative w-full rounded-2xl border px-5 py-4 text-sm', className)} {...props} /> }
export function AlertTitle({ className, ...props }) { return <h3 className={cn('font-bold leading-none tracking-tight', className)} {...props} /> }
export function AlertDescription({ className, ...props }) { return <div className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} /> }