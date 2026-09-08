import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  X,
  LayoutDashboard,
  FolderOpen,
  Upload,
  FileText,
  CheckSquare,
  Search,
  Scissors,
  GitCompare,
  BarChart2,
  Lightbulb,
  FileOutput,
  Settings,
  Shield,
  ChevronRight,
  Database,
} from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

const navLinkClass = ({ isActive }) =>
  cn(
    'group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium',
    'transition-colors duration-150',
    isActive
      ? 'bg-primary-soft text-primary'
      : 'text-muted-foreground hover:bg-surface-secondary hover:text-foreground'
  )

export function Sidebar({
  isOpen,
  onClose,
  datasetId,
}) {
  const { isAdmin } = useAuthStore()

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile / tablet overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] lg:hidden',
          'transition-opacity duration-200',
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col',
          'border-r border-border bg-surface/95 backdrop-blur-xl',
          'transition-transform duration-200 ease-out',
          isOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Mobile header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Database className="h-3.5 w-3.5" />
            </div>

            <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
              Navigation
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-secondary hover:text-foreground"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            <SectionLabel>Workspace</SectionLabel>

            <SidebarLink
              to="/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={onClose}
            />

            <SidebarLink
              to="/datasets"
              icon={FolderOpen}
              label="My datasets"
              onClick={onClose}
            />

            <SidebarLink
              to="/datasets/upload"
              icon={Upload}
              label="Upload dataset"
              onClick={onClose}
            />
          </div>

          {datasetId && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between px-3">
                <SectionLabel className="px-0 pt-0">
                  Current dataset
                </SectionLabel>

                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <Database className="h-3 w-3" />
                </span>
              </div>

              <div className="mb-2 rounded-lg border border-border bg-surface-secondary/40 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                  Analysis workspace
                </p>

                <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                  {datasetId}
                </p>
              </div>

              <div className="space-y-0.5">
                <SidebarLink
                  to={`/datasets/${datasetId}/profile`}
                  icon={FileText}
                  label="Data profile"
                  onClick={onClose}
                />

                <SidebarLink
                  to={`/datasets/${datasetId}/validation`}
                  icon={CheckSquare}
                  label="Validation"
                  onClick={onClose}
                />

                <SidebarLink
                  to={`/datasets/${datasetId}/anomalies`}
                  icon={Search}
                  label="Anomaly detection"
                  onClick={onClose}
                />

                <SidebarLink
                  to={`/datasets/${datasetId}/cleaning`}
                  icon={Scissors}
                  label="Data cleaning"
                  onClick={onClose}
                />

                <SidebarLink
                  to={`/datasets/${datasetId}/comparison`}
                  icon={GitCompare}
                  label="Before vs after"
                  onClick={onClose}
                />
              </div>

              <SectionLabel>
                Results
              </SectionLabel>

              <div className="space-y-0.5">
                <SidebarLink
                  to={`/datasets/${datasetId}/analytics`}
                  icon={BarChart2}
                  label="Analytics"
                  onClick={onClose}
                />

                <SidebarLink
                  to={`/datasets/${datasetId}/insights`}
                  icon={Lightbulb}
                  label="AI insights"
                  onClick={onClose}
                />

                <SidebarLink
                  to={`/datasets/${datasetId}/reports`}
                  icon={FileOutput}
                  label="Reports"
                  onClick={onClose}
                />
              </div>
            </div>
          )}

          <div className="mt-5">
            <SectionLabel>Account</SectionLabel>

            <div className="space-y-0.5">
              <SidebarLink
                to="/settings"
                icon={Settings}
                label="Settings"
                onClick={onClose}
              />

              {isAdmin() && (
                <SidebarLink
                  to="/admin"
                  icon={Shield}
                  label="Admin panel"
                  onClick={onClose}
                />
              )}
            </div>
          </div>
        </nav>

        {/* Bottom workspace status */}
        <div className="shrink-0 border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-surface-secondary/50 px-3 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold">
                Workspace ready
              </p>

              <p className="mt-0.5 text-[10px] text-muted-foreground">
                DataForge is operational
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function SidebarLink({
  to,
  icon: Icon,
  label,
  onClick,
}) {
  return (
    <NavLink
      to={to}
      className={navLinkClass}
      onClick={onClick}
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              'h-4 w-4 shrink-0',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground group-hover:text-foreground'
            )}
          />

          <span className="min-w-0 flex-1 truncate">
            {label}
          </span>

          <ChevronRight
            className={cn(
              'h-3.5 w-3.5 shrink-0 transition-all',
              isActive
                ? 'translate-x-0 opacity-100 text-primary'
                : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-50'
            )}
          />
        </>
      )}
    </NavLink>
  )
}

function SectionLabel({
  children,
  className,
}) {
  return (
    <p
      className={cn(
        'px-3 pb-1 pt-4 text-[9px] font-bold uppercase tracking-[0.18em] text-muted',
        className
      )}
    >
      {children}
    </p>
  )
}