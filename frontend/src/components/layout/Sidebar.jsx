import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  X, LayoutDashboard, FolderOpen, Upload, FileText,
  CheckSquare, Search, Scissors, GitCompare, BarChart2,
  Lightbulb, FileOutput, Settings, Shield
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

const navLinkClass = ({ isActive }) =>
  cn(
    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
    isActive
      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
  )

export function Sidebar({ isOpen, onClose, datasetId }) {
  const { isAdmin } = useAuthStore()

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72 flex flex-col',
          'bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800',
          'shadow-xl transition-transform duration-200 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-gray-100">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">DF</span>
            </div>
            DataForge
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <SectionLabel>Menu</SectionLabel>
          <NavLink to="/dashboard" className={navLinkClass} onClick={onClose}>
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </NavLink>

          <SectionLabel>My Work</SectionLabel>
          <NavLink to="/datasets" className={navLinkClass} onClick={onClose}>
            <FolderOpen className="h-4 w-4" /> My Datasets
          </NavLink>
          <NavLink to="/datasets/upload" className={navLinkClass} onClick={onClose}>
            <Upload className="h-4 w-4" /> Upload Dataset
          </NavLink>

          {datasetId && (
            <>
              <SectionLabel>Analysis</SectionLabel>
              <NavLink to={`/datasets/${datasetId}/profile`} className={navLinkClass} onClick={onClose}>
                <FileText className="h-4 w-4" /> Data Profile
              </NavLink>
              <NavLink to={`/datasets/${datasetId}/validation`} className={navLinkClass} onClick={onClose}>
                <CheckSquare className="h-4 w-4" /> Validation
              </NavLink>
              <NavLink to={`/datasets/${datasetId}/anomalies`} className={navLinkClass} onClick={onClose}>
                <Search className="h-4 w-4" /> Anomaly Detection
              </NavLink>
              <NavLink to={`/datasets/${datasetId}/cleaning`} className={navLinkClass} onClick={onClose}>
                <Scissors className="h-4 w-4" /> Data Cleaning
              </NavLink>
              <NavLink to={`/datasets/${datasetId}/comparison`} className={navLinkClass} onClick={onClose}>
                <GitCompare className="h-4 w-4" /> Before vs After
              </NavLink>

              <SectionLabel>Insights & Reports</SectionLabel>
              <NavLink to={`/datasets/${datasetId}/analytics`} className={navLinkClass} onClick={onClose}>
                <BarChart2 className="h-4 w-4" /> Analytics
              </NavLink>
              <NavLink to={`/datasets/${datasetId}/insights`} className={navLinkClass} onClick={onClose}>
                <Lightbulb className="h-4 w-4" /> AI Insights
              </NavLink>
              <NavLink to={`/datasets/${datasetId}/reports`} className={navLinkClass} onClick={onClose}>
                <FileOutput className="h-4 w-4" /> Reports
              </NavLink>
            </>
          )}

          <SectionLabel>Account</SectionLabel>
          <NavLink to="/settings" className={navLinkClass} onClick={onClose}>
            <Settings className="h-4 w-4" /> Settings
          </NavLink>
          {isAdmin() && (
            <NavLink to="/admin" className={navLinkClass} onClick={onClose}>
              <Shield className="h-4 w-4" /> Admin Panel
            </NavLink>
          )}
        </nav>
      </aside>
    </>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600">
      {children}
    </p>
  )
}
