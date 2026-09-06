import { cn } from '@/utils/cn'

export function Spinner({ className, size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8', xl: 'h-12 w-12' }
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600',
        'dark:border-gray-700 dark:border-t-indigo-400',
        sizes[size],
        className
      )}
    />
  )
}

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  )
}
