import { useEffect, useState } from 'react'
import {
  Outlet,
  useLocation,
  useParams,
} from 'react-router-dom'

import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { id: datasetId } = useParams()
  const location = useLocation()

  // Close the mobile sidebar after navigation.
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Close the mobile drawer when entering desktop mode.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')

    const handleChange = (event) => {
      if (event.matches) {
        setSidebarOpen(false)
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Application background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="dataforge-grid absolute inset-0 opacity-10" />

        <div className="absolute -right-48 -top-48 h-[560px] w-[560px] rounded-full bg-primary/5 blur-[140px]" />

        <div className="absolute -bottom-64 -left-48 h-[520px] w-[520px] rounded-full bg-primary/3 blur-[140px]" />
      </div>

      {/* Fixed application header */}
      <header className="fixed inset-x-0 top-0 z-50 h-16">
        <Header
          onToggleSidebar={() =>
            setSidebarOpen((current) => !current)
          }
        />
      </header>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        datasetId={datasetId}
      />

      {/* Main workspace */}
      <main className="relative z-10 min-w-0 pt-16 lg:pl-64">
        <div
          className="
            mx-auto
            min-h-[calc(100vh-4rem)]
            max-w-[1600px]
            px-4
            py-5
            sm:px-6
            sm:py-6
            lg:px-8
            lg:py-8
          "
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}