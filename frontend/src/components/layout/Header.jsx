import { Menu, Moon, Sun, LogOut, User, Settings, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

export function Header({ onToggleSidebar, isDark, onToggleDark }) {
  const { user, logout, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    try { await authService.logout() } catch (_) {}
    logout()
    navigate('/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 gap-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/95">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle navigation"
      >
        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      </button>

      <a href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-gray-100">
        <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
          <span className="text-white text-xs font-black">DF</span>
        </div>
        DataForge
      </a>

      <div className="flex-1" />

      <button
        onClick={onToggleDark}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle dark mode"
      >
        {isDark
          ? <Sun className="h-5 w-5 text-gray-400" />
          : <Moon className="h-5 w-5 text-gray-600" />}
      </button>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
            {user?.name || 'User'}
          </span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900 py-1">
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => { navigate('/settings'); setMenuOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Settings className="h-4 w-4" /> Settings
            </button>
            {isAdmin() && (
              <button
                onClick={() => { navigate('/admin'); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Shield className="h-4 w-4" /> Admin Panel
              </button>
            )}
            <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
