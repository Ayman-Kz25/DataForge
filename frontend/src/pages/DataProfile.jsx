import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FileSpreadsheet,
  Layers,
  Database,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldCheck
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { LoadingScreen } from '@/components/ui/spinner'
import { processingService, datasetService } from '@/services/api'
import { formatNumber, formatPercent } from '@/utils/formatters'

export default function DataProfile() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dataset, setDataset] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProfiling, setIsProfiling] = useState(false)
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
        if (resultsRes.data.data?.profilingResult) {
          setProfile(resultsRes.data.data.profilingResult)
        }
      } catch (_) {
        // Not profiled yet
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dataset details.')
    } finally {
      setIsLoading(false)
    }
  }

  const runProfiling = async () => {
    try {
      setIsProfiling(true)
      setError(null)
      const res = await processingService.profile(id)
      setProfile(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Profiling failed. Please try again.')
    } finally {
      setIsProfiling(false)
    }
  }

  if (isLoading) return <LoadingScreen message="Loading data profile..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">Phase 4</Badge>
            <span className="text-xs text-gray-500 font-mono">ID: {id}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {dataset?.originalName || 'Dataset Profile'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Structural metadata, column datatypes, distributions, and missing values.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={runProfiling}
            disabled={isProfiling}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isProfiling ? 'animate-spin' : ''}`} />
            {profile ? 'Re-Profile' : 'Run Profile'}
          </Button>

          <Button
            onClick={() => navigate(`/datasets/${id}/validation`)}
            className="gap-2"
          >
            <ShieldCheck className="h-4 w-4" /> Validation & Quality <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary KPI Cards */}
      {profile && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatNumber(profile.rowCount)}
                </p>
                <p className="text-xs text-gray-500">Total Rows</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatNumber(profile.columnCount)}
                </p>
                <p className="text-xs text-gray-500">Total Columns</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatPercent(profile.missingPercentage)}
                </p>
                <p className="text-xs text-gray-500">Missing Data</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {profile.duplicateRows || 0}
                </p>
                <p className="text-xs text-gray-500">Duplicates</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Columns Profile Table */}
      {!profile ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Layers className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">No profile generated yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Run profiling to calculate statistical summaries, column types, and missing rates.
            </p>
            <Button className="mt-4 gap-2" onClick={runProfiling} disabled={isProfiling}>
              <RefreshCw className={`h-4 w-4 ${isProfiling ? 'animate-spin' : ''}`} /> Run Profiler
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Column Diagnostics ({profile.columns?.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3">Column</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Semantic</th>
                  <th className="px-6 py-3">Missing</th>
                  <th className="px-6 py-3">Unique</th>
                  <th className="px-6 py-3">Min / Max</th>
                  <th className="px-6 py-3">Mean / Median</th>
                  <th className="px-6 py-3">Std Dev</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {profile.columns?.map((col) => (
                  <tr key={col.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-gray-100">
                      {col.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {col.dtype}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={col.semanticType === 'numeric' ? 'info' : col.semanticType === 'id' ? 'default' : 'primary'}>
                        {col.semanticType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className={col.missingPercentage > 0 ? 'text-amber-600 font-medium' : 'text-gray-500'}>
                        {col.missingCount} ({formatPercent(col.missingPercentage)})
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {col.uniqueCount} ({formatPercent(col.uniquePercentage)})
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">
                      {col.min !== undefined && col.max !== undefined ? `${col.min} / ${col.max}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">
                      {col.mean !== undefined ? `${Number(col.mean).toFixed(1)} / ${col.median}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">
                      {col.std !== undefined ? Number(col.std).toFixed(2) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
