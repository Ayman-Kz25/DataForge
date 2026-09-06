import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Scissors,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Download,
  AlertCircle,
  FileSpreadsheet,
  GitCompare
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { ProgressBar } from '@/components/ui/progress'
import { LoadingScreen } from '@/components/ui/spinner'
import { processingService, datasetService } from '@/services/api'
import { formatNumber } from '@/utils/formatters'

export default function Cleaning() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dataset, setDataset] = useState(null)
  const [cleaningResult, setCleaningResult] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCleaning, setIsCleaning] = useState(false)
  const [cleaningProgress, setCleaningProgress] = useState(0)
  const [error, setError] = useState(null)

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
        const compRes = await processingService.getComparison(id)
        if (compRes.data.data) {
          setCleaningResult(compRes.data.data)
        }
      } catch (_) {
        // Not cleaned yet
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cleaning data.')
    } finally {
      setIsLoading(false)
    }
  }

  const runAutoCleaning = async () => {
    try {
      setIsCleaning(true)
      setError(null)
      setCleaningProgress(25)

      const timer = setInterval(() => {
        setCleaningProgress((prev) => (prev < 90 ? prev + 15 : prev))
      }, 400)

      const res = await processingService.clean(id, { mode: 'auto' })
      clearInterval(timer)
      setCleaningProgress(100)
      setCleaningResult(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Cleaning failed. Please try again.')
    } finally {
      setIsCleaning(false)
    }
  }

  if (isLoading) return <LoadingScreen message="Loading cleaning pipeline..." />

  const operations = cleaningResult?.operations || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">Phase 7</Badge>
            <span className="text-xs text-gray-500 font-mono">ID: {id}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {dataset?.originalName || 'Data Cleaning'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Automated & configurable transformations: imputation, deduplication, formatting, and outlier winsorization.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={runAutoCleaning}
            disabled={isCleaning}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isCleaning ? 'animate-spin' : ''}`} />
            {cleaningResult ? 'Re-Run Clean' : 'Auto-Clean Now'}
          </Button>

          <Button
            onClick={() => navigate(`/datasets/${id}/comparison`)}
            className="gap-2"
          >
            <GitCompare className="h-4 w-4" /> Before vs After <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {isCleaning && (
        <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50/20">
          <CardContent className="py-6 space-y-3">
            <div className="flex justify-between text-sm font-medium text-indigo-900 dark:text-indigo-200">
              <span>Applying automated cleaning transformations...</span>
              <span>{cleaningProgress}%</span>
            </div>
            <ProgressBar value={cleaningProgress} />
          </CardContent>
        </Card>
      )}

      {/* Cleaning Results Overview */}
      {cleaningResult && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(cleaningResult.rowsBefore)}
              </p>
              <p className="text-xs text-gray-500">Rows Before</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatNumber(cleaningResult.rowsAfter)}
              </p>
              <p className="text-xs text-gray-500">Rows After</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {operations.length}
              </p>
              <p className="text-xs text-gray-500">Transformations Applied</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {cleaningResult.rowsBefore - cleaningResult.rowsAfter}
              </p>
              <p className="text-xs text-gray-500">Rows Removed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main content */}
      {!cleaningResult ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Scissors className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">No cleaning performed yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Clean missing values, drop duplicate rows, cast types, and winsorize extreme outliers.
            </p>
            <Button className="mt-4 gap-2" onClick={runAutoCleaning} disabled={isCleaning}>
              <Scissors className="h-4 w-4" /> Start Auto-Clean Pipeline
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Cleaning Operations Log ({operations.length} steps)</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100 dark:divide-gray-800 p-0">
            {operations.map((op) => (
              <div key={op.step} className="p-4 flex items-start gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                <div className="h-7 w-7 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                  {op.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      {op.description}
                    </span>
                    <Badge variant="default" className="font-mono text-[11px]">
                      {op.strategy}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Target: <span className="font-mono">{op.column || 'Dataset (Global)'}</span> • Changes: {op.changeCount} items
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
