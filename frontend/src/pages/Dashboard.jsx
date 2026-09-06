import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FolderOpen, BarChart2, Database } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingScreen } from '@/components/ui/spinner'
import { useAuthStore } from '@/store/authStore'
import { datasetService } from '@/services/api'
import { formatDate } from '@/utils/formatters'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [datasets, setDatasets] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    datasetService.getAll()
      .then((res) => setDatasets(res.data.data || []))
      .catch(() => setDatasets([]))
      .finally(() => setIsLoading(false))
  }, [])

  const stats = [
    { label: 'Total Datasets', value: datasets.length, icon: Database },
    { label: 'Analyzed', value: datasets.filter((d) => d.status === 'completed').length, icon: BarChart2 },
    { label: 'Pending', value: datasets.filter((d) => d.status === 'uploaded').length, icon: FolderOpen },
  ]

  if (isLoading) return <LoadingScreen message="Loading dashboard..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user?.name?.split(' ')[0] || 'User'} ??
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overview of your datasets and quality evaluations.
          </p>
        </div>
        <Button onClick={() => navigate('/datasets/upload')} className="gap-2">
          <Upload className="h-4 w-4" /> Upload Dataset
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Recent Datasets</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/datasets')}>View all</Button>
        </div>
        <CardContent className="p-0">
          {datasets.length === 0 ? (
            <div className="py-16 text-center">
              <Database className="h-10 w-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No datasets uploaded yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Upload a CSV or Excel file to get started</p>
              <Button size="sm" className="mt-4" onClick={() => navigate('/datasets/upload')}>
                <Upload className="h-4 w-4 mr-2" /> Upload Dataset
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {datasets.slice(0, 5).map((ds) => (
                <div key={ds._id}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => navigate(`/datasets/${ds._id}`)}
                >
                  <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <Database className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{ds.originalName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(ds.createdAt)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    ds.status === 'completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    ds.status === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>{ds.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
