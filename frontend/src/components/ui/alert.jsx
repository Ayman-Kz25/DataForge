import { cn } from '@/utils/cn'
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'

const variants = {
  info:    { icon: Info,          bg: 'bg-blue-50 dark:bg-blue-950/30',   border: 'border-blue-200 dark:border-blue-800',   text: 'text-blue-800 dark:text-blue-200' },
  success: { icon: CheckCircle2,  bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-800 dark:text-emerald-200' },
  warning: { icon: TriangleAlert, bg: 'bg-amber-50 dark:bg-amber-950/30',  border: 'border-amber-200 dark:border-amber-800',  text: 'text-amber-800 dark:text-amber-200' },
  danger:  { icon: AlertCircle,   bg: 'bg-red-50 dark:bg-red-950/30',     border: 'border-red-200 dark:border-red-800',     text: 'text-red-800 dark:text-red-200' },
}

export function Alert({ variant = 'info', title, children, onDismiss, className }) {
  const { icon: Icon, bg, border, text } = variants[variant]
  return (
    <div className={cn('flex gap-3 rounded-lg border p-4', bg, border, className)}>
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', text)} />
      <div className="flex-1 min-w-0">
        {title && <p className={cn('text-sm font-semibold mb-1', text)}>{title}</p>}
        <div className={cn('text-sm', text)}>{children}</div>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className={cn('shrink-0', text)}>
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
