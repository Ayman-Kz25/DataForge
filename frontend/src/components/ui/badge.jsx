import { cn } from '@/utils/cn'

const variants = {
  default:  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  success:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning:  'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger:   'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  primary:  'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  info:     'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

export function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
