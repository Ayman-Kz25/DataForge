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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        isDark={isDark}
        onToggleDark={() => setIsDark((v) => !v)}
      />

      <div className="flex-1 flex pt-16">
        {/* Desktop static sidebar + Mobile drawer */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          datasetId={datasetId}
        />

        {/* Main content container with proper desktop margin offset */}
        <main className="flex-1 min-w-0 transition-all duration-200 lg:pl-64">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

