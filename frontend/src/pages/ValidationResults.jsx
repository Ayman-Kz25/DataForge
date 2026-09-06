import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  RefreshCw,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { ScoreBar } from '@/components/ui/progress'
import { LoadingScreen } from '@/components/ui/spinner'
import { processingService, datasetService } from '@/services/api'
import { getQualityLevel } from '@/utils/formatters'

const CHECK_STATUS_ICONS = {
  pass: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', badge: 'success' },
  warning: { icon: AlertTriangle, color: 'text-amber-500 dark:text-amber-400', badge: 'warning' },
  fail: { icon: XCircle, color: 'text-red-500 dark:text-red-400', badge: 'danger' },
  info: { icon: Info, color: 'text-blue-500 dark:text-blue-400', badge: 'info' },
}

export default function ValidationResults() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dataset, setDataset] = useState(null)
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState(null)
  const [selectedFilter, setSelectedFilter] = useState('all')

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const datasetRes = await datasetService.getById(id)
      setDataset(datasetRes.data.data)

      try {
        const resultsRes = await processingService.getResults(id)
        if (resultsRes.data.data?.validationResult) {
          setResults(resultsRes.data.data)
        }
      } catch (_) {
        // Not validated yet
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load validation details.')
    } finally {
      setIsLoading(false)
    }
  }

  const runValidation = async () => {
    try {
      setIsValidating(true)
      setError(null)
      const res = await processingService.validate(id)
      setResults(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Validation failed. Please try again.')
    } finally {
      setIsValidating(false)
    }
  }

  if (isLoading) return <LoadingScreen message="Loading validation results..." />

  const qualityScore = results?.qualityScore
  const validationResult = results?.validationResult
  const checks = validationResult?.checks || []

  const qualityLevel = qualityScore ? getQualityLevel(qualityScore.overall) : null

  const filteredChecks = checks.filter((c) => {
    if (selectedFilter === 'all') return true
    return c.status === selectedFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">Phase 5</Badge>
            <span className="text-xs text-gray-500 font-mono">ID: {id}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {dataset?.originalName || 'Validation & Quality Score'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            14 rule-based checks and hybrid explainable data quality score (0–100).
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={runValidation}
            disabled={isValidating}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} />
            {qualityScore ? 'Re-Validate' : 'Run Validation'}
          </Button>

          <Button
            onClick={() => navigate(`/datasets/${id}/cleaning`)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" /> Clean Data <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Quality Score Hero Card */}
      {qualityScore && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 flex flex-col justify-center items-center text-center p-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
            <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mb-3">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Quality Score</p>
            <div className="mt-2 flex items-baseline justify-center gap-1">
              <span className="text-6xl font-black text-gray-900 dark:text-gray-100">
                {qualityScore.overall}
              </span>
              <span className="text-gray-400 text-lg font-medium">/100</span>
            </div>
            <div className="mt-3">
              <Badge variant={qualityLevel.label === 'Excellent' || qualityLevel.label === 'Good' ? 'success' : 'warning'}>
                {qualityLevel.label} Quality
              </Badge>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 max-w-xs">
              Calculated via weighted formula across completeness, uniqueness, validity, consistency, and anomalies.
            </p>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Score Breakdown (5 Factors)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <ScoreBar
                label="Completeness (25%)"
                value={qualityScore.completeness}
                max={100}
              />
              <ScoreBar
                label="Uniqueness (20%)"
                value={qualityScore.uniqueness}
                max={100}
              />
              <ScoreBar
                label="Validity (25%)"
                value={qualityScore.validity}
                max={100}
              />
              <ScoreBar
                label="Consistency (15%)"
                value={qualityScore.consistency}
                max={100}
              />
              <ScoreBar
                label="Anomaly Score (15%)"
                value={qualityScore.anomalyScore}
                max={100}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* 14 Validation Checks Section */}
      {!qualityScore ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ShieldCheck className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">No validation performed yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Execute all 14 quality checks to compute the quality score and detect potential data issues.
            </p>
            <Button className="mt-4 gap-2" onClick={runValidation} disabled={isValidating}>
              <RefreshCw className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} /> Run 14-Check Validation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Validation Checks ({checks.length} Rules)</CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {validationResult?.totalIssues || 0} potential issue(s) flagged across the dataset.
              </p>
            </div>

            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg text-xs">
              {['all', 'pass', 'warning', 'fail', 'info'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1 rounded-md font-medium transition-colors uppercase ${
                    selectedFilter === filter
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="divide-y divide-gray-100 dark:divide-gray-800 p-0">
            {filteredChecks.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">
                No checks match the filter "{selectedFilter}".
              </div>
            ) : (
              filteredChecks.map((check) => {
                const config = CHECK_STATUS_ICONS[check.status] || CHECK_STATUS_ICONS.info
                const Icon = config.icon

                return (
                  <div key={check.id} className="p-4 flex items-start gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {check.name}
                        </p>
                        <Badge variant={config.badge}>
                          {check.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-400 font-mono">
                          Severity: {check.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {check.summary}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
