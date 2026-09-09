import { cn } from '@/utils/cn'

export function ProgressBar({ value = 0, className, color = 'bg-indigo-600', label = 'Progress' }) {
  const clampedValue = Math.min(100, Math.max(0, value))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden', className)}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500 ease-out', color)}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  )
}

export function ScoreBar({ value = 0, max = 100, label, showValue = true }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const getColor = (v) => {
    if (v >= 85) return 'bg-emerald-500'
    if (v >= 70) return 'bg-indigo-500'
    if (v >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div className="flex items-center gap-3">
      {label && <span className="text-sm text-gray-600 dark:text-gray-400 w-32 shrink-0">{label}</span>}
      <div
        role="progressbar"
        aria-label={label || 'Score'}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden"
      >
        <div
          className={cn('h-full rounded-full transition-all duration-700', getColor(value))}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValue && (
        <span className="text-sm font-mono font-medium text-gray-700 dark:text-gray-300 w-16 text-right">
          {Math.round(value)}/{max}
        </span>
      )}
    </div>
  )
}

