import { useState, useEffect } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dataforge-theme') === 'dark' ||
        (!localStorage.getItem('dataforge-theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return false
  })
  const { id: datasetId } = useParams()

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('dataforge-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('dataforge-theme', 'light')
    }
  }, [isDark])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        isDark={isDark}
        onToggleDark={() => setIsDark((v) => !v)}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        datasetId={datasetId}
      />
      <main className="pt-16 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
