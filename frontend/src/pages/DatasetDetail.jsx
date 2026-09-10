import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Table2,
  TriangleAlert,
  WandSparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { LoadingScreen } from '@/components/ui/spinner'

import {
  datasetService,
  processingService,
} from '@/services/api'

import {
  formatNumber,
  formatPercent,
} from '@/utils/formatters'

export default function DatasetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dataset, setDataset] = useState(null)
  const [results, setResults] = useState(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const loadDataset = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      setError(null)

      const datasetResponse =
        await datasetService.getById(id)

      const datasetData =
        datasetResponse.data?.data || null

      setDataset(datasetData)

      try {
        const resultsResponse =
          await processingService.getResults(id)

        setResults(
          resultsResponse.data?.data || null
        )
      } catch (processingError) {
        // Processing results may not exist yet.
        if (
          processingError.response?.status !== 404
        ) {
          console.error(
            'Failed to load processing results:',
            processingError
          )
        }

        setResults(null)
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load dataset details.'
      )
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadDataset()
  }, [id])

  const qualityScore = useMemo(() => {
    return results?.qualityScore?.overall ?? null
  }, [results])

  const validationIssues = useMemo(() => {
    return (
      results?.validationResult?.totalIssues ??
      0
    )
  }, [results])

  const anomalyCount = useMemo(() => {
    return (
      results?.anomalyResult?.anomalyCount ??
      0
    )
  }, [results])

  const anomalyPercentage = useMemo(() => {
    return (
      results?.anomalyResult?.anomalyPercentage ??
      0
    )
  }, [results])

  const missingPercentage = useMemo(() => {
    return (
      results?.profilingResult
        ?.missingPercentage ??
      0
    )
  }, [results])

  const duplicateRows = useMemo(() => {
    return (
      results?.profilingResult?.duplicateRows ??
      0
    )
  }, [results])

  const hasProcessingResults = Boolean(results)

  if (isLoading) {
    return (
      <div className="h-full min-h-0">
        <LoadingScreen message="Loading dataset..." />
      </div>
    )
  }

  if (!dataset) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <Database className="mx-auto h-10 w-10 text-muted" />

          <h1 className="mt-4 text-lg font-bold">
            Dataset not found
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            This dataset may have been deleted or
            you may not have access to it.
          </p>

          <Button
            className="mt-5"
            onClick={() => navigate('/datasets')}
          >
            Back to datasets
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-background">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="dataforge-grid absolute inset-0 opacity-10" />

        <div
          className="
            absolute
            -right-48
            -top-48
            h-[520px]
            w-[520px]
            rounded-full
            bg-primary/5
            blur-[140px]
          "
        />
      </div>

      <main
        className="
          relative
          z-10
          mx-auto
          flex
          h-full
          min-h-0
          max-w-[1600px]
          flex-col
          overflow-hidden
          px-5
          py-5
          sm:px-6
          sm:py-6
          lg:px-8
        "
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="shrink-0">
          <div
            className="
              flex
              flex-col
              gap-4
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-7
                    w-7
                    shrink-0
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
                  Dataset overview
                </span>

                <StatusBadge
                  status={dataset.status}
                />
              </div>

              <div className="mt-3 flex min-w-0 items-center gap-3">
                <FileSpreadsheet
                  className="h-5 w-5 shrink-0 text-primary"
                />

                <h1
                  className="
                    min-w-0
                    truncate
                    text-xl
                    font-black
                    tracking-[-0.035em]
                    sm:text-2xl
                  "
                  title={dataset.originalName}
                >
                  {dataset.originalName ||
                    'Dataset'}
                </h1>
              </div>

              <div
                className="
                  mt-1.5
                  flex
                  flex-wrap
                  items-center
                  gap-x-3
                  gap-y-1
                  text-xs
                  text-muted-foreground
                "
              >
                <span>
                  {dataset.fileType ||
                    'Unknown file type'}
                </span>

                <span className="h-1 w-1 rounded-full bg-border-strong" />

                <span className="font-mono text-[10px]">
                  {id}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => loadDataset(true)}
                disabled={isRefreshing}
                className="h-9 gap-2 rounded-lg"
              >
                <RefreshCw
                  className={
                    isRefreshing
                      ? 'h-3.5 w-3.5 animate-spin'
                      : 'h-3.5 w-3.5'
                  }
                />

                Refresh
              </Button>

              <Button
                onClick={() =>
                  navigate(
                    `/datasets/${id}/profile`
                  )
                }
                className="h-9 gap-2 rounded-lg"
              >
                <BarChart3 className="h-3.5 w-3.5" />

                Open profile

                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </header>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mt-4 shrink-0">
            <Alert
              variant="danger"
              onDismiss={() => setError(null)}
            >
              <div className="flex items-start gap-2.5">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            </Alert>
          </div>
        )}

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="mt-5 min-h-0 flex-1 overflow-auto pr-1">
          <div className="space-y-4 pb-6">

            {/* =================================================
                OVERVIEW METRICS
            ================================================== */}

            <section
              className="
                grid
                grid-cols-2
                overflow-hidden
                border
                border-border
                bg-surface/80
                backdrop-blur-sm
                sm:grid-cols-4
              "
            >
              <OverviewMetric
                icon={Table2}
                label="Rows"
                value={formatNumber(
                  dataset.rowCount || 0
                )}
              />

              <OverviewMetric
                icon={Database}
                label="Columns"
                value={formatNumber(
                  dataset.columnCount || 0
                )}
                bordered
              />

              <OverviewMetric
                icon={ShieldCheck}
                label="Quality score"
                value={
                  qualityScore !== null
                    ? `${Number(
                        qualityScore
                      ).toFixed(1)}`
                    : 'N/A'
                }
                tone={
                  qualityScore === null
                    ? 'default'
                    : qualityScore >= 80
                      ? 'success'
                      : qualityScore >= 50
                        ? 'warning'
                        : 'danger'
                }
                bordered
              />

              <OverviewMetric
                icon={TriangleAlert}
                label="Validation issues"
                value={formatNumber(
                  validationIssues
                )}
                tone={
                  validationIssues > 0
                    ? 'warning'
                    : 'success'
                }
                bordered
              />
            </section>

            {/* =================================================
                DATA HEALTH
            ================================================== */}

            <section
              className="
                border
                border-border
                bg-surface/80
                backdrop-blur-sm
              "
            >
              <SectionHeader
                icon={ShieldCheck}
                title="Data health"
                description="Current quality indicators calculated from the available processing results."
              />

              <div
                className="
                  grid
                  grid-cols-1
                  divide-y
                  divide-border
                  sm:grid-cols-2
                  sm:divide-x
                  sm:divide-y-0
                  lg:grid-cols-5
                "
              >
                <HealthMetric
                  label="Completeness"
                  value={
                    results?.qualityScore
                      ?.completeness
                  }
                />

                <HealthMetric
                  label="Uniqueness"
                  value={
                    results?.qualityScore
                      ?.uniqueness
                  }
                />

                <HealthMetric
                  label="Validity"
                  value={
                    results?.qualityScore
                      ?.validity
                  }
                />

                <HealthMetric
                  label="Consistency"
                  value={
                    results?.qualityScore
                      ?.consistency
                  }
                />

                <HealthMetric
                  label="Anomaly score"
                  value={
                    results?.qualityScore
                      ?.anomalyScore
                  }
                />
              </div>
            </section>

            {/* =================================================
                PROCESSING SUMMARY
            ================================================== */}

            <section
              className="
                grid
                grid-cols-1
                gap-4
                lg:grid-cols-2
              "
            >
              <InfoCard
                icon={FileSpreadsheet}
                title="Profile summary"
                description="Structural information discovered during profiling."
              >
                <InfoRow
                  label="Missing data"
                  value={
                    hasProcessingResults
                      ? formatPercent(
                          missingPercentage
                        )
                      : 'Not profiled'
                  }
                />

                <InfoRow
                  label="Duplicate rows"
                  value={
                    hasProcessingResults
                      ? formatNumber(
                          duplicateRows
                        )
                      : 'Not profiled'
                  }
                />

                <InfoRow
                  label="Rows"
                  value={formatNumber(
                    dataset.rowCount || 0
                  )}
                />

                <InfoRow
                  label="Columns"
                  value={formatNumber(
                    dataset.columnCount || 0
                  )}
                />
              </InfoCard>

              <InfoCard
                icon={ShieldAlert}
                title="Anomaly summary"
                description="Statistical and machine-learning anomaly detection results."
              >
                <InfoRow
                  label="Anomalies detected"
                  value={
                    hasProcessingResults
                      ? formatNumber(anomalyCount)
                      : 'Not analyzed'
                  }
                  tone={
                    anomalyCount > 0
                      ? 'warning'
                      : 'default'
                  }
                />

                <InfoRow
                  label="Anomaly percentage"
                  value={
                    hasProcessingResults
                      ? formatPercent(
                          anomalyPercentage
                        )
                      : 'Not analyzed'
                  }
                />

                <InfoRow
                  label="Detection method"
                  value={
                    results?.anomalyResult
                      ?.method ||
                    'Not analyzed'
                  }
                />

                <InfoRow
                  label="Affected rows"
                  value={
                    results?.anomalyResult
                      ?.affectedRows
                      ? formatNumber(
                          results.anomalyResult
                            .affectedRows.length
                        )
                      : 'N/A'
                  }
                />
              </InfoCard>
            </section>

            {/* =================================================
                DATASET INFORMATION
            ================================================== */}

            <section
              className="
                border
                border-border
                bg-surface/80
                backdrop-blur-sm
              "
            >
              <SectionHeader
                icon={FileText}
                title="Dataset information"
                description="File and dataset metadata."
              />

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >
                <MetadataItem
                  label="Original filename"
                  value={
                    dataset.originalName ||
                    'N/A'
                  }
                />

                <MetadataItem
                  label="File type"
                  value={
                    dataset.fileType || 'N/A'
                  }
                />

                <MetadataItem
                  label="File size"
                  value={
                    dataset.fileSize
                      ? formatFileSize(
                          dataset.fileSize
                        )
                      : 'N/A'
                  }
                />

                <MetadataItem
                  label="Rows"
                  value={formatNumber(
                    dataset.rowCount || 0
                  )}
                />

                <MetadataItem
                  label="Columns"
                  value={formatNumber(
                    dataset.columnCount || 0
                  )}
                />

                <MetadataItem
                  label="Dataset ID"
                  value={id}
                  mono
                />
              </div>
            </section>

            {/* =================================================
                ANALYSIS NAVIGATION
            ================================================== */}

            <section
              className="
                border
                border-border
                bg-surface/80
                backdrop-blur-sm
              "
            >
              <SectionHeader
                icon={Sparkles}
                title="Dataset analysis"
                description="Continue working with this dataset."
              />

              <div
                className="
                  grid
                  grid-cols-1
                  gap-2
                  p-4
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >
                <AnalysisAction
                  icon={BarChart3}
                  title="Data profile"
                  description="Inspect columns and statistics."
                  onClick={() =>
                    navigate(
                      `/datasets/${id}/profile`
                    )
                  }
                />

                <AnalysisAction
                  icon={ShieldCheck}
                  title="Validation"
                  description="Run and review quality checks."
                  onClick={() =>
                    navigate(
                      `/datasets/${id}/validation`
                    )
                  }
                />

                <AnalysisAction
                  icon={ShieldAlert}
                  title="Anomalies"
                  description="Detect unusual records and patterns."
                  onClick={() =>
                    navigate(
                      `/datasets/${id}/anomalies`
                    )
                  }
                />

                <AnalysisAction
                  icon={WandSparkles}
                  title="Cleaning"
                  description="Clean and compare the dataset."
                  onClick={() =>
                    navigate(
                      `/datasets/${id}/cleaning`
                    )
                  }
                />

                <AnalysisAction
                  icon={Sparkles}
                  title="AI insights"
                  description="Generate explanations from analysis results."
                  onClick={() =>
                    navigate(
                      `/datasets/${id}/insights`
                    )
                  }
                />

                <AnalysisAction
                  icon={FileText}
                  title="Reports"
                  description="Generate and download reports."
                  onClick={() =>
                    navigate(
                      `/datasets/${id}/reports`
                    )
                  }
                />
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  )
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {
  if (!status) return null

  const normalized = String(
    status
  ).toLowerCase()

  const variant =
    normalized === 'completed'
      ? 'success'
      : normalized === 'failed'
        ? 'danger'
        : normalized === 'profiling' ||
            normalized === 'validating' ||
            normalized === 'cleaning'
          ? 'warning'
          : 'default'

  return (
    <Badge variant={variant}>
      {status}
    </Badge>
  )
}

/* ============================================================
   OVERVIEW METRIC
============================================================ */

function OverviewMetric({
  icon: Icon,
  label,
  value,
  tone = 'default',
  bordered = false,
}) {
  const toneClass = {
    default:
      'text-primary bg-primary-soft',
    success:
      'text-success bg-success/10',
    warning:
      'text-warning bg-warning/10',
    danger:
      'text-danger bg-danger/10',
  }

  return (
    <div
      className={`
        flex
        items-center
        gap-3
        px-4
        py-4
        sm:px-5
        ${bordered ? 'border-l border-border' : ''}
      `}
    >
      <div
        className={`
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          ${toneClass[tone]}
        `}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
          {label}
        </p>

        <p className="mt-0.5 font-mono text-lg font-bold tabular-nums">
          {value}
        </p>
      </div>
    </div>
  )
}

/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
        border-b
        border-border
        px-4
        py-3.5
        sm:px-5
      "
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

      <div>
        <h2 className="text-sm font-bold">
          {title}
        </h2>

        <p className="mt-1 text-[11px] text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}

/* ============================================================
   HEALTH METRIC
============================================================ */

function HealthMetric({ label, value }) {
  const hasValue =
    value !== undefined &&
    value !== null

  return (
    <div className="px-4 py-4 sm:px-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
        {label}
      </p>

      <p className="mt-1 font-mono text-lg font-bold tabular-nums">
        {hasValue
          ? `${Number(value).toFixed(1)}`
          : 'N/A'}
      </p>

      {hasValue && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-secondary">
          <div
            className="h-full rounded-full bg-primary"
            style={{
              width: `${Math.min(
                Math.max(Number(value), 0),
                100
              )}%`,
            }}
          />
        </div>
      )}
    </div>
  )
}

/* ============================================================
   INFO CARD
============================================================ */

function InfoCard({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section
      className="
        border
        border-border
        bg-surface/80
        backdrop-blur-sm
      "
    >
      <SectionHeader
        icon={Icon}
        title={title}
        description={description}
      />

      <div className="divide-y divide-border">
        {children}
      </div>
    </section>
  )
}

/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({
  label,
  value,
  tone = 'default',
}) {
  const valueClass =
    tone === 'warning'
      ? 'text-warning'
      : 'text-foreground'

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
      <span className="text-xs text-muted-foreground">
        {label}
      </span>

      <span
        className={`
          text-right
          text-xs
          font-semibold
          ${valueClass}
        `}
      >
        {value}
      </span>
    </div>
  )
}

/* ============================================================
   METADATA ITEM
============================================================ */

function MetadataItem({
  label,
  value,
  mono = false,
}) {
  return (
    <div className="border-b border-border px-4 py-3.5 sm:px-5 lg:border-r">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
        {label}
      </p>

      <p
        className={`
          mt-1
          truncate
          text-xs
          font-medium
          ${mono ? 'font-mono' : ''}
        `}
        title={value}
      >
        {value}
      </p>
    </div>
  )
}

/* ============================================================
   ANALYSIS ACTION
============================================================ */

function AnalysisAction({
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        flex
        items-center
        gap-3
        rounded-lg
        border
        border-border
        bg-surface
        p-3.5
        text-left
        transition-colors
        hover:bg-surface-secondary
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-primary
        focus-visible:ring-offset-2
      "
    >
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
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
          {description}
        </p>
      </div>

      <ArrowRight
        className="
          h-3.5
          w-3.5
          shrink-0
          text-muted
          transition-transform
          group-hover:translate-x-0.5
        "
      />
    </button>
  )
}

/* ============================================================
   FILE SIZE
============================================================ */

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) {
    return 'N/A'
  }

  const units = [
    'B',
    'KB',
    'MB',
    'GB',
  ]

  const index = Math.min(
    Math.floor(
      Math.log(bytes) / Math.log(1024)
    ),
    units.length - 1
  )

  return `${(
    bytes /
    Math.pow(1024, index)
  ).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}
