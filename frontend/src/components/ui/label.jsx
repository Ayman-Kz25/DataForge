import * as React from 'react'
import { cn } from '@/utils/cn'

export const Label = React.forwardRef(({ className, children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1', className)}
    {...props}
  >
    {children}
  </label>
))
Label.displayName = 'Label'
