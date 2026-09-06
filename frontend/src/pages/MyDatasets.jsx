import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  FileSpreadsheet,
  Trash2,
  ExternalLink,
  Search,
  Database,
  BarChart2
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { LoadingScreen } from '@/components/ui/spinner'
import { datasetService } from '@/services/api'
import { useDatasetStore } from '@/store/datasetStore'
import { formatDate, formatFileSize, formatNumber } from '@/utils/formatters'

const STATUS_VARIANTS = {
  uploaded: { variant: 'info', label: 'Uploaded' },
  profiling: { variant: 'warning', label: 'Profiling' },
  validating: { variant: 'warning', label: 'Validating' },
  cleaning: { variant: 'warning', label: 'Cleaning' },
  completed: { variant: 'success', label: 'Analyzed' },
  error: { variant: 'danger', label: 'Error' },
}

export default function MyDatasets() {
  const navigate = useNavigate()
  const { datasets, setDatasets, removeDataset } = useDatasetStore()
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
      setDatasets(res.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load datasets.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingId(id)
      await datasetService.delete(id)
      removeDataset(id)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete dataset.')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredDatasets = datasets.filter((d) =>
    d.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) return <LoadingScreen message="Loading your datasets..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Datasets</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your uploaded files, run quality analysis, and view reports.
          </p>
        </div>
        <Button onClick={() => navigate('/datasets/upload')} className="gap-2 shrink-0">
          <Upload className="h-4 w-4" /> Upload Dataset
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>
            Uploaded Files ({datasets.length})
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredDatasets.length === 0 ? (
            <div className="py-16 text-center">
              <Database className="h-10 w-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No datasets matched your search' : 'No datasets yet'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                {searchQuery ? 'Try adjusting your search keywords' : 'Upload your first CSV or Excel file to get started'}
              </p>
              {!searchQuery && (
                <Button size="sm" className="mt-4" onClick={() => navigate('/datasets/upload')}>
                  <Upload className="h-4 w-4" /> Upload File
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3">File Name</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Size</th>
                    <th className="px-6 py-3">Rows</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Uploaded</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredDatasets.map((dataset) => {
                    const statusConfig = STATUS_VARIANTS[dataset.status] || { variant: 'default', label: dataset.status }

                    return (
                      <tr key={dataset._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 flex items-center justify-center shrink-0">
                              <FileSpreadsheet className="h-4 w-4" />
                            </div>
                            <span className="truncate max-w-xs">{dataset.originalName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono uppercase text-xs text-gray-500">
                          {dataset.fileType}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {formatFileSize(dataset.fileSize)}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {dataset.rowCount ? formatNumber(dataset.rowCount) : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {formatDate(dataset.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => navigate(`/datasets/${dataset._id}/profile`)}
                              className="h-8 px-2.5 text-xs gap-1"
                            >
                              <BarChart2 className="h-3.5 w-3.5" /> Analyze
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={deletingId === dataset._id}
                              onClick={() => handleDelete(dataset._id, dataset.originalName)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                              title="Delete dataset"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
