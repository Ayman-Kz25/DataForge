import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Search,
  AlertOctagon,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { LoadingScreen } from '@/components/ui/spinner'
import { processingService, datasetService } from '@/services/api'
import { formatNumber, formatPercent } from '@/utils/formatters'

export default function AnomalyDetection() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dataset, setDataset] = useState(null)
  const [anomalyResult, setAnomalyResult] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetecting, setIsDetecting] = useState(false)
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
        const resultsRes = await processingService.getResults(id)
        if (resultsRes.data.data?.anomalyResult) {
          setAnomalyResult(resultsRes.data.data.anomalyResult)
        }
      } catch (_) {
        // Not run yet
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load anomaly detection data.')
    } finally {
      setIsLoading(false)
    }
  }

  const runDetection = async () => {
    try {
      setIsDetecting(true)
      setError(null)
      const res = await processingService.detectAnomalies(id)
      setAnomalyResult(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Anomaly detection failed. Please try again.')
    } finally {
      setIsDetecting(false)
    }
  }

  if (isLoading) return <LoadingScreen message="Loading anomaly results..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">Phase 6</Badge>
            <span className="text-xs text-gray-500 font-mono">ID: {id}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {dataset?.originalName || 'Anomaly Detection'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Machine learning unsupervised outlier detection via Scikit-Learn Isolation Forest.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={runDetection}
            disabled={isDetecting}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isDetecting ? 'animate-spin' : ''}`} />
            {anomalyResult ? 'Re-Detect' : 'Run Detection'}
          </Button>

          <Button
            onClick={() => navigate(`/datasets/${id}/cleaning`)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" /> Data Cleaning <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* KPI Cards */}
      {anomalyResult && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {anomalyResult.method}
                </p>
                <p className="text-xs text-gray-500">Algorithm</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600">
                <AlertOctagon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {anomalyResult.anomalyCount}
                </p>
                <p className="text-xs text-gray-500">Anomalous Rows</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatPercent(anomalyResult.anomalyPercentage)}
                </p>
                <p className="text-xs text-gray-500">Contamination %</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                  {anomalyResult.status}
                </p>
                <p className="text-xs text-gray-500">Detector Status</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Results Body */}
      {!anomalyResult ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Search className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">No anomaly detection performed yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Run the unsupervised Isolation Forest model to isolate multivariate anomalies.
            </p>
            <Button className="mt-4 gap-2" onClick={runDetection} disabled={isDetecting}>
              <RefreshCw className={`h-4 w-4 ${isDetecting ? 'animate-spin' : ''}`} /> Run Isolation Forest
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {anomalyResult.status === 'skipped' && (
            <Alert variant="info" title="Isolation Forest Skipped">
              {anomalyResult.reason || 'Dataset did not meet size or numeric column requirements (e.g. requires at least 10 rows and numeric features).'}
            </Alert>
          )}

          {anomalyResult.affectedRows?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Identified Outlier Row Indices ({anomalyResult.affectedRows.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {anomalyResult.affectedRows.map((rowIndex) => (
                    <span
                      key={rowIndex}
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900"
                    >
                      Row #{rowIndex + 1}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {anomalyResult.columnScores && Object.keys(anomalyResult.columnScores).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Feature Deviation in Anomalous Subset</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-3">Feature / Column</th>
                      <th className="px-6 py-3">Mean Shift Distance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {Object.entries(anomalyResult.columnScores).map(([col, score]) => (
                      <tr key={col} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                        <td className="px-6 py-3 font-mono font-medium text-gray-900 dark:text-gray-100">{col}</td>
                        <td className="px-6 py-3 font-mono text-gray-600 dark:text-gray-300">{Number(score).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
