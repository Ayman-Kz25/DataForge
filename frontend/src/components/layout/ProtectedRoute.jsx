import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location, message: 'Please sign in to continue.' }} replace />
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
