import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  Database,
  ArrowRight,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Activity,
  FileSpreadsheet,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingScreen } from '@/components/ui/spinner'

import { useAuthStore } from '@/store/authStore'
import { datasetService } from '@/services/api'
import { formatDate } from '@/utils/formatters'

const statusConfig = {
  completed: {
    label: 'Analyzed',
    icon: CheckCircle2,
    variant: 'success',
  },
  uploaded: {
    label: 'Pending',
    icon: Clock3,
    variant: 'info',
  },
  error: {
    label: 'Error',
    icon: AlertCircle,
    variant: 'danger',
  },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [datasets, setDatasets] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    datasetService
      .getAll()
      .then((res) => {
        setDatasets(res.data?.data || [])
      })
      .catch(() => {
        setDatasets([])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const stats = useMemo(() => {
    const total = datasets.length

    const completed = datasets.filter(
      (dataset) => dataset.status === 'completed'
    ).length

    const pending = datasets.filter(
      (dataset) => dataset.status === 'uploaded'
    ).length

    const errors = datasets.filter(
      (dataset) => dataset.status === 'error'
    ).length

    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      completed,
      pending,
      errors,
      completionRate,
    }
  }, [datasets])

  const recentDatasets = datasets.slice(0, 7)
  const firstName = user?.name?.split(' ')[0] || 'User'

  if (isLoading) {
    return <LoadingScreen message="Loading workspace..." />
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-background">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0">
        <div className="dataforge-grid absolute inset-0 opacity-25" />

        <div
          className="
            absolute
            -right-48
            -top-48
            h-[560px]
            w-[560px]
            rounded-full
            bg-primary/7
            blur-[140px]
          "
        />
      </div>

      <main
        className="
          relative
          z-10
          mx-auto
          max-w-[1500px]
          px-5
          py-8
          sm:px-8
          lg:px-10
        "
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <header
          className="
            flex
            flex-col
            gap-6
            border-b
            border-border
            pb-8
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" />

              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-muted-foreground
                "
              >
                Workspace
              </span>
            </div>

            <h1
              className="
                text-3xl
                font-black
                tracking-[-0.035em]
                sm:text-4xl
              "
            >
              Good Evening, {firstName}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Your latest dataset activity at a glance.
            </p>
          </div>

          <Button
            onClick={() => navigate('/datasets/upload')}
            className="
              h-11
              w-fit
              gap-2
              rounded-xl
              px-5
              shadow-lg
              shadow-primary/20
            "
          >
            <Upload className="h-4 w-4" />
            Upload dataset
          </Button>
        </header>

        {/* =====================================================
            OVERVIEW
        ====================================================== */}

        <section
          className="
            grid
            border-b
            border-border
            lg:grid-cols-[1fr_360px]
          "
        >
          {/* Main health */}
          <div
            className="
              relative
              overflow-hidden
              border-b
              border-border
              py-9
              lg:border-b-0
              lg:border-r
              lg:pr-12
            "
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-muted
                  "
                >
                  Data health
                </p>

                <div className="mt-2 flex items-end gap-2">
                  <span
                    className="
                      text-6xl
                      font-black
                      leading-none
                      tracking-[-0.06em]
                    "
                  >
                    {stats.completionRate}
                  </span>

                  <span className="mb-1.5 text-lg font-bold text-muted">
                    %
                  </span>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  {stats.completed} of {stats.total} datasets have
                  completed analysis.
                </p>
              </div>

              <div
                className="
                  hidden
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-primary-soft
                  text-primary
                  sm:flex
                "
              >
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            {/* Health bar */}
            <div className="mt-7 max-w-2xl">
              <div className="flex h-2 overflow-hidden bg-surface-secondary">
                {stats.completed > 0 && (
                  <div
                    className="bg-success transition-all duration-700"
                    style={{
                      width: `${(stats.completed / Math.max(stats.total, 1)) * 100}%`,
                    }}
                  />
                )}

                {stats.pending > 0 && (
                  <div
                    className="bg-warning transition-all duration-700"
                    style={{
                      width: `${(stats.pending / Math.max(stats.total, 1)) * 100}%`,
                    }}
                  />
                )}

                {stats.errors > 0 && (
                  <div
                    className="bg-danger transition-all duration-700"
                    style={{
                      width: `${(stats.errors / Math.max(stats.total, 1)) * 100}%`,
                    }}
                  />
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
                <Legend
                  label="Analyzed"
                  value={stats.completed}
                  className="bg-success"
                />

                <Legend
                  label="Pending"
                  value={stats.pending}
                  className="bg-warning"
                />

                <Legend
                  label="Errors"
                  value={stats.errors}
                  className="bg-danger"
                />
              </div>
            </div>
          </div>

          {/* Activity summary */}
          <div className="py-9 lg:pl-10">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-muted
                  "
                >
                  Activity
                </p>

                <h2 className="mt-1 text-lg font-bold tracking-tight">
                  Dataset overview
                </h2>
              </div>

              <Activity className="h-4 w-4 text-muted" />
            </div>

            <div className="mt-6 grid grid-cols-3 divide-x divide-border">
              <OverviewStat
                value={stats.total}
                label="Total"
              />

              <OverviewStat
                value={stats.completed}
                label="Analyzed"
              />

              <OverviewStat
                value={stats.pending + stats.errors}
                label="Attention"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            DATASET SECTION
        ====================================================== */}

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-muted
                "
              >
                Library
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight">
                Recent datasets
              </h2>
            </div>

            {datasets.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/datasets')}
                className="gap-1.5 text-muted-foreground"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {recentDatasets.length === 0 ? (
            <EmptyState
              onUpload={() => navigate('/datasets/upload')}
            />
          ) : (
            <div className="border-y border-border">
              {/* Table header */}
              <div
                className="
                  hidden
                  grid-cols-[48px_minmax(0,1fr)_150px_100px_24px]
                  items-center
                  gap-4
                  border-b
                  border-border
                  px-4
                  py-3
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-muted
                  sm:grid
                "
              >
                <span>#</span>
                <span>Dataset</span>
                <span>Status</span>
                <span>Created</span>
                <span />
              </div>

              {recentDatasets.map((dataset, index) => (
                <DatasetRow
                  key={dataset._id}
                  dataset={dataset}
                  index={index}
                  onClick={() =>
                    navigate(`/datasets/${dataset._id}`)
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* =====================================================
            FOOTER SUMMARY
        ====================================================== */}

        {datasets.length > 0 && (
          <section
            className="
              mt-10
              flex
              flex-col
              gap-4
              border-t
              border-border
              pt-5
              text-xs
              text-muted-foreground
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-success" />

              <span>
                {stats.completed} datasets successfully analyzed
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/datasets')}
              className="
                inline-flex
                items-center
                gap-1
                font-semibold
                text-muted-foreground
                transition-colors
                hover:text-primary
              "
            >
              Open dataset library
              <ArrowRight className="h-3 w-3" />
            </button>
          </section>
        )}
      </main>
    </div>
  )
}

/* ============================================================
   OVERVIEW STAT
============================================================ */

function OverviewStat({ value, label }) {
  return (
    <div className="px-4 first:pl-0 last:pr-0">
      <p className="text-2xl font-black tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
    </div>
  )
}

/* ============================================================
   LEGEND
============================================================ */

function Legend({ label, value, className }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-1.5 w-1.5 rounded-full ${className}`} />

      <span>{label}</span>

      <span className="font-semibold text-foreground">
        {value}
      </span>
    </div>
  )
}

/* ============================================================
   DATASET ROW
============================================================ */

function DatasetRow({ dataset, index, onClick }) {
  const config =
    statusConfig[dataset.status] || statusConfig.uploaded

  const StatusIcon = config.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        grid
        w-full
        grid-cols-[minmax(0,1fr)_auto]
        items-center
        gap-4
        px-4
        py-5
        text-left
        transition-colors
        hover:bg-surface-secondary/45
        sm:grid-cols-[48px_minmax(0,1fr)_150px_100px_24px]
      "
    >
      {/* Index */}
      <span
        className="
          hidden
          font-mono
          text-[10px]
          tabular-nums
          text-muted
          sm:block
        "
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Dataset */}
      <div className="flex min-w-0 items-center gap-4">
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-surface-secondary
            text-muted-foreground
            transition-all
            group-hover:bg-primary-soft
            group-hover:text-primary
          "
        >
          <FileSpreadsheet className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p
            className="
              truncate
              text-sm
              font-bold
              tracking-tight
              transition-colors
              group-hover:text-primary
            "
          >
            {dataset.originalName}
          </p>

          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground sm:hidden">
            <span>{formatDate(dataset.createdAt)}</span>

            <span className="h-1 w-1 rounded-full bg-border-strong" />

            <span>{config.label}</span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="hidden sm:block">
        <Badge variant={config.variant}>
          <StatusIcon className="mr-1.5 h-3 w-3" />
          {config.label}
        </Badge>
      </div>

      {/* Date */}
      <span className="hidden text-xs text-muted-foreground sm:block">
        {formatDate(dataset.createdAt)}
      </span>

      {/* Arrow */}
      <ChevronRight
        className="
          h-4
          w-4
          shrink-0
          text-muted
          transition-all
          group-hover:translate-x-1
          group-hover:text-primary
        "
      />
    </button>
  )
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({ onUpload }) {
  return (
    <div
      className="
        flex
        min-h-[320px]
        flex-col
        items-center
        justify-center
        border-b
        border-dashed
        border-border
        px-6
        text-center
      "
    >
      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-primary-soft
          text-primary
        "
      >
        <Database className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-base font-bold">
        No datasets yet
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">
        Your uploaded datasets will appear here.
      </p>

      <Button
        onClick={onUpload}
        size="sm"
        className="mt-6 gap-2 rounded-xl"
      >
        <Upload className="h-4 w-4" />
        Upload dataset
      </Button>
    </div>
  )
}