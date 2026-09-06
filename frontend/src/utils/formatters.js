export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatNumber(num) {
  if (num === null || num === undefined) return '—'
  return num.toLocaleString()
}

export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '—'
  return `${Number(value).toFixed(decimals)}%`
}

export function formatDate(dateString) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getQualityLevel(score) {
  if (score >= 85) return { label: 'Excellent', color: '#10B981', bg: 'bg-emerald-50', text: 'text-emerald-700' }
  if (score >= 70) return { label: 'Good',      color: '#6366F1', bg: 'bg-indigo-50',  text: 'text-indigo-700' }
  if (score >= 50) return { label: 'Fair',      color: '#F59E0B', bg: 'bg-amber-50',   text: 'text-amber-700' }
  return             { label: 'Poor',      color: '#EF4444', bg: 'bg-red-50',     text: 'text-red-700' }
}

export function truncate(str, maxLength = 40) {
  if (!str) return ''
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str
}
