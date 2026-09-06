import * as React from 'react'
import { cn } from '@/utils/cn'

export const Input = React.forwardRef((
  { className, type = 'text', error, ...props },
  ref
) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
        'placeholder:text-gray-400 text-gray-900',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500',
        'transition-colors duration-150',
        error && 'border-red-500 focus:ring-red-500',
        className
      )}
      {...props}
    />
  )
})
Input.displayName = 'Input'
