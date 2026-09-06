import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { LoadingScreen } from '@/components/ui/spinner'
import { processingService, datasetService } from '@/services/api'
import { formatNumber } from '@/utils/formatters'

export default function Comparison() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dataset, setDataset] = useState(null)
  const [comparison, setComparison] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
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
        setComparison(compRes.data.data)
      } catch (_) {
        // No comparison yet
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load comparison data.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <LoadingScreen message="Loading comparison..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">Phase 8</Badge>
            <span className="text-xs text-gray-500 font-mono">ID: {id}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Before vs After Comparison
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Side-by-side delta analysis comparing the raw dataset against the cleaned output.
          </p>
        </div>

        <Button
          onClick={() => navigate(`/datasets/${id}/analytics`)}
          className="gap-2"
        >
          <BarChart2 className="h-4 w-4" /> Visual Analytics <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!comparison ? (
        <Card>
          <CardContent className="py-16 text-center">
            <GitCompare className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">No cleaning comparison available</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Run data cleaning first to generate before vs after delta metrics and transformation logs.
            </p>
            <Button className="mt-4 gap-2" onClick={() => navigate(`/datasets/${id}/cleaning`)}>
              Go to Data Cleaning <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Comparison Split Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before Card */}
            <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-amber-700 dark:text-amber-400">Original Raw Dataset</CardTitle>
                  <Badge variant="warning">Before</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500">Row Count</span>
                  <span className="text-sm font-semibold">{formatNumber(comparison.rowsBefore)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="text-sm font-semibold text-amber-600">Unclean (Raw)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">Immutable Original</span>
                  <span className="text-xs text-emerald-600 font-medium">Preserved</span>
                </div>
              </CardContent>
            </Card>

            {/* After Card */}
            <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-emerald-700 dark:text-emerald-400">Cleaned Dataset</CardTitle>
                  <Badge variant="success">After</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500">Row Count</span>
                  <span className="text-sm font-semibold">{formatNumber(comparison.rowsAfter)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="text-sm font-semibold text-emerald-600">Imputed & Standardized</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">Transformations Applied</span>
                  <span className="text-sm font-semibold">{comparison.operations?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audit trail */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Audit Log of Operations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3">Step</th>
                    <th className="px-6 py-3">Operation</th>
                    <th className="px-6 py-3">Target Column</th>
                    <th className="px-6 py-3">Strategy</th>
                    <th className="px-6 py-3 text-right">Affected Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {comparison.operations?.map((op) => (
                    <tr key={op.step} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <td className="px-6 py-4 font-mono font-medium">#{op.step}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{op.description}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{op.column || 'Global'}</td>
                      <td className="px-6 py-4"><Badge variant="default">{op.strategy}</Badge></td>
                      <td className="px-6 py-4 text-right font-mono font-semibold text-gray-900 dark:text-gray-100">{op.changeCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
