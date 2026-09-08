import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  FileSpreadsheet,
  Trash2,
  Search,
  Database,
  BarChart2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { LoadingScreen } from '@/components/ui/spinner'

import { datasetService } from '@/services/api'
import { useDatasetStore } from '@/store/datasetStore'
import {
  formatDate,
  formatFileSize,
  formatNumber,
} from '@/utils/formatters'

const STATUS_VARIANTS = {
  uploaded: {
    variant: 'info',
    label: 'Uploaded',
  },
  profiling: {
    variant: 'warning',
    label: 'Profiling',
  },
  validating: {
    variant: 'warning',
    label: 'Validating',
  },
  cleaning: {
    variant: 'warning',
    label: 'Cleaning',
  },
  completed: {
    variant: 'success',
    label: 'Analyzed',
  },
  error: {
    variant: 'danger',
    label: 'Error',
  },
}

export default function MyDatasets() {
  const navigate = useNavigate()

  const {
    datasets,
    setDatasets,
    removeDataset,
  } = useDatasetStore()

  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDatasets()
  }, [])

  const fetchDatasets = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await datasetService.getAll()

      setDatasets(res.data?.data || [])
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load datasets.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      setDeletingId(id)
      setError(null)

      await datasetService.delete(id)

      removeDataset(id)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to delete dataset.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const filteredDatasets = datasets.filter((dataset) =>
    dataset.originalName
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="h-full min-h-0">
        <LoadingScreen message="Loading your datasets..." />
      </div>
    )
  }

  return (
    <div
      className="
        relative
        h-full
        min-h-0
        overflow-hidden
        bg-background
      "
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0">
        <div className="dataforge-grid absolute inset-0 opacity-15" />

        <div
          className="
            absolute
            -right-40
            -top-40
            h-[480px]
            w-[480px]
            rounded-full
            bg-primary/6
            blur-[130px]
          "
        />
      </div>

      {/* =====================================================
          PAGE
      ====================================================== */}

      <main
        className="
          relative
          z-10
          mx-auto
          flex
          h-full
          min-h-0
          max-w-7xl
          flex-col
          overflow-hidden
          px-5
          py-5
          sm:px-8
          sm:py-6
        "
      >
        {/* ===================================================
            HEADER
        ==================================================== */}

        <header className="shrink-0">
          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-lg
                    bg-primary-soft
                    text-primary
                  "
                >
                  <Database className="h-3.5 w-3.5" />
                </div>

                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-muted
                  "
                >
                  Dataset library
                </span>
              </div>

              <h1
                className="
                  mt-3
                  text-2xl
                  font-black
                  tracking-[-0.04em]
                  sm:text-3xl
                "
              >
                My datasets
              </h1>

              <p className="mt-1.5 text-sm text-muted-foreground">
                Browse uploaded datasets and continue analysis.
              </p>
            </div>

            <Button
              onClick={() => navigate('/datasets/upload')}
              className="
                shrink-0
                gap-2
                rounded-xl
              "
            >
              <Upload className="h-4 w-4" />
              Upload dataset
            </Button>
          </div>

          {/* =================================================
              TOOLBAR
          ================================================== */}

          <div
            className="
              mt-5
              flex
              flex-col
              gap-3
              border-y
              border-border
              py-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                text-muted-foreground
              "
            >
              <span className="font-semibold text-foreground">
                {datasets.length}
              </span>

              <span>
                {datasets.length === 1
                  ? 'dataset'
                  : 'datasets'}
              </span>

              {searchQuery && (
                <>
                  <span className="h-1 w-1 rounded-full bg-border-strong" />

                  <span>
                    {filteredDatasets.length} matching
                  </span>
                </>
              )}
            </div>

            <div className="relative w-full sm:w-64">
              <Search
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  h-3.5
                  w-3.5
                  -translate-y-1/2
                  text-muted
                "
              />

              <Input
                placeholder="Search datasets..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                className="h-9 pl-9"
              />
            </div>
          </div>
        </header>

        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mt-4 shrink-0">
            <Alert
              variant="danger"
              onDismiss={() => setError(null)}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            </Alert>
          </div>
        )}

        {/* ===================================================
            DATASET WORKSPACE
        ==================================================== */}

        <section
          className="
            relative
            mt-4
            flex
            min-h-0
            flex-1
            flex-col
            overflow-hidden
            border
            border-border
            bg-surface/80
            backdrop-blur-sm
          "
        >
          <div className="absolute inset-x-0 top-0 h-px bg-primary/40" />

          {filteredDatasets.length === 0 ? (
            <EmptyState
              hasSearch={Boolean(searchQuery)}
              onClearSearch={() => setSearchQuery('')}
              onUpload={() =>
                navigate('/datasets/upload')
              }
            />
          ) : (
            <DatasetTable
              datasets={filteredDatasets}
              deletingId={deletingId}
              onAnalyze={(id) =>
                navigate(`/datasets/${id}/profile`)
              }
              onDelete={handleDelete}
            />
          )}
        </section>
      </main>
    </div>
  )
}

/* ============================================================
   DATASET TABLE
============================================================ */

function DatasetTable({
  datasets,
  deletingId,
  onAnalyze,
  onDelete,
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Desktop table header */}

      <div
        className="
          hidden
          shrink-0
          border-b
          border-border
          bg-surface-secondary/50
          lg:block
        "
      >
        <div
          className="
            grid
            grid-cols-[minmax(280px,2.4fr)_90px_110px_110px_125px_140px_150px]
            items-center
            gap-4
            px-5
            py-3
          "
        >
          <TableHeading>File name</TableHeading>
          <TableHeading>Type</TableHeading>
          <TableHeading>Size</TableHeading>
          <TableHeading>Rows</TableHeading>
          <TableHeading>Status</TableHeading>
          <TableHeading>Uploaded</TableHeading>
          <TableHeading align="right">
            Actions
          </TableHeading>
        </div>
      </div>

      {/* Scrollable dataset list */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overflow-x-auto
        "
      >
        {/* Desktop */}

        <div className="hidden min-w-[1060px] lg:block">
          {datasets.map((dataset) => (
            <DatasetRow
              key={dataset._id}
              dataset={dataset}
              deletingId={deletingId}
              onAnalyze={onAnalyze}
              onDelete={onDelete}
            />
          ))}
        </div>

        {/* Mobile / tablet */}

        <div className="divide-y divide-border lg:hidden">
          {datasets.map((dataset) => (
            <DatasetMobileRow
              key={dataset._id}
              dataset={dataset}
              deletingId={deletingId}
              onAnalyze={onAnalyze}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>

      {/* Footer */}

      <div
        className="
          flex
          shrink-0
          items-center
          justify-between
          gap-4
          border-t
          border-border
          bg-surface
          px-5
          py-3
        "
      >
        <span className="text-[11px] text-muted-foreground">
          Showing {datasets.length}{' '}
          {datasets.length === 1
            ? 'dataset'
            : 'datasets'}
        </span>

        <span className="hidden text-[11px] text-muted-foreground sm:inline">
          Select a dataset to continue analysis
        </span>
      </div>
    </div>
  )
}

/* ============================================================
   DESKTOP ROW
============================================================ */

function DatasetRow({
  dataset,
  deletingId,
  onAnalyze,
  onDelete,
}) {
  const statusConfig =
    STATUS_VARIANTS[dataset.status] || {
      variant: 'default',
      label: dataset.status || 'Unknown',
    }

  return (
    <div
      className="
        grid
        grid-cols-[minmax(280px,2.4fr)_90px_110px_110px_125px_140px_150px]
        items-center
        gap-4
        border-b
        border-border
        px-5
        py-3.5
        transition-colors
        last:border-b-0
        hover:bg-surface-secondary/40
      "
    >
      {/* File */}

      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-primary-soft
              text-primary
            "
          >
            <FileSpreadsheet className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p
              className="
                truncate
                text-sm
                font-semibold
                text-foreground
              "
              title={dataset.originalName}
            >
              {dataset.originalName}
            </p>

            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Dataset
            </p>
          </div>
        </div>
      </div>

      {/* Type */}

      <div className="font-mono text-[10px] font-medium uppercase text-muted-foreground">
        {dataset.fileType || getFileExtension(dataset.originalName)}
      </div>

      {/* Size */}

      <div className="text-xs text-muted-foreground">
        {formatFileSize(dataset.fileSize)}
      </div>

      {/* Rows */}

      <div className="font-mono text-xs tabular-nums text-muted-foreground">
        {dataset.rowCount
          ? formatNumber(dataset.rowCount)
          : 'N/A'}
      </div>

      {/* Status */}

      <div>
        <Badge variant={statusConfig.variant}>
          {statusConfig.label}
        </Badge>
      </div>

      {/* Date */}

      <div className="text-xs text-muted-foreground">
        {formatDate(dataset.createdAt)}
      </div>

      {/* Actions */}

      <div className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onAnalyze(dataset._id)}
          className="
            h-8
            gap-1.5
            px-2.5
            text-xs
          "
        >
          <BarChart2 className="h-3.5 w-3.5" />
          Analyze
        </Button>

        <Button
          size="icon"
          variant="ghost"
          disabled={deletingId === dataset._id}
          onClick={() =>
            onDelete(
              dataset._id,
              dataset.originalName
            )
          }
          className="
            h-8
            w-8
            rounded-lg
            text-muted
            hover:bg-danger/10
            hover:text-danger
          "
          title="Delete dataset"
          aria-label={`Delete ${dataset.originalName}`}
        >
          {deletingId === dataset._id ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

/* ============================================================
   MOBILE ROW
============================================================ */

function DatasetMobileRow({
  dataset,
  deletingId,
  onAnalyze,
  onDelete,
}) {
  const statusConfig =
    STATUS_VARIANTS[dataset.status] || {
      variant: 'default',
      label: dataset.status || 'Unknown',
    }

  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-primary-soft
            text-primary
          "
        >
          <FileSpreadsheet className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p
              className="
                min-w-0
                truncate
                text-sm
                font-semibold
              "
              title={dataset.originalName}
            >
              {dataset.originalName}
            </p>

            <Badge
              variant={statusConfig.variant}
              className="shrink-0"
            >
              {statusConfig.label}
            </Badge>
          </div>

          <div
            className="
              mt-2
              flex
              flex-wrap
              items-center
              gap-x-3
              gap-y-1
              text-[11px]
              text-muted-foreground
            "
          >
            <span className="font-mono uppercase">
              {dataset.fileType ||
                getFileExtension(
                  dataset.originalName
                )}
            </span>

            <span className="h-1 w-1 rounded-full bg-border-strong" />

            <span>
              {formatFileSize(dataset.fileSize)}
            </span>

            <span className="h-1 w-1 rounded-full bg-border-strong" />

            <span>
              {dataset.rowCount
                ? `${formatNumber(dataset.rowCount)} rows`
                : 'Rows unavailable'}
            </span>

            <span className="h-1 w-1 rounded-full bg-border-strong" />

            <span>
              {formatDate(dataset.createdAt)}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onAnalyze(dataset._id)}
              className="h-8 gap-1.5 px-3 text-xs"
            >
              <BarChart2 className="h-3.5 w-3.5" />
              Analyze
            </Button>

            <Button
              size="icon"
              variant="ghost"
              disabled={deletingId === dataset._id}
              onClick={() =>
                onDelete(
                  dataset._id,
                  dataset.originalName
                )
              }
              className="
                h-8
                w-8
                rounded-lg
                text-muted
                hover:bg-danger/10
                hover:text-danger
              "
              title="Delete dataset"
              aria-label={`Delete ${dataset.originalName}`}
            >
              {deletingId === dataset._id ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  hasSearch,
  onClearSearch,
  onUpload,
}) {
  return (
    <div
      className="
        flex
        min-h-0
        flex-1
        items-center
        justify-center
        px-6
        py-10
      "
    >
      <div className="max-w-md text-center">
        <div
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            border
            border-border
            bg-surface-secondary
            text-muted-foreground
          "
        >
          {hasSearch ? (
            <Search className="h-6 w-6" />
          ) : (
            <Database className="h-6 w-6" />
          )}
        </div>

        <h2 className="mt-5 text-base font-bold">
          {hasSearch
            ? 'No datasets matched your search'
            : 'No datasets yet'}
        </h2>

        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          {hasSearch
            ? 'Try a different filename or clear the search.'
            : 'Upload a CSV or Excel file to create your first dataset.'}
        </p>

        <div className="mt-5">
          {hasSearch ? (
            <Button
              variant="secondary"
              onClick={onClearSearch}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Clear search
            </Button>
          ) : (
            <Button
              onClick={onUpload}
              className="gap-2 rounded-xl"
            >
              <Upload className="h-4 w-4" />
              Upload dataset
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   TABLE HEADING
============================================================ */

function TableHeading({
  children,
  align = 'left',
}) {
  return (
    <div
      className={`
        text-[10px]
        font-bold
        uppercase
        tracking-[0.12em]
        text-muted
        ${align === 'right' ? 'text-right' : ''}
      `}
    >
      {children}
    </div>
  )
}

/* ============================================================
   HELPERS
============================================================ */

function getFileExtension(filename) {
  return filename.includes('.')
    ? filename.split('.').pop()
    : ''
}