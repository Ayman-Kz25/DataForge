import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import {
  BarChart2,
  PieChart,
  TrendingUp,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { LoadingScreen } from '@/components/ui/spinner'
import { processingService, datasetService } from '@/services/api'

export default function Analytics() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dataset, setDataset] = useState(null)
  const [profile, setProfile] = useState(null)
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

      const resultsRes = await processingService.getResults(id)
      setProfile(resultsRes.data.data?.profilingResult)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics data.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <LoadingScreen message="Loading analytics and charts..." />

  const columns = profile?.columns || []
  const numericColumns = columns.filter((c) => c.semanticType === 'numeric')
  const categoricalColumns = columns.filter((c) => c.semanticType === 'categorical')

  // Chart 1: Missing values by column
  const missingChartOption = {
    title: { text: 'Missing Values Percentage by Column', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis', formatter: '{b}: {c}% missing' },
    xAxis: {
      type: 'category',
      data: columns.map((c) => c.name),
      axisLabel: { rotate: 30, fontSize: 11 }
    },
    yAxis: { type: 'value', max: 100, name: '%' },
    series: [
      {
        data: columns.map((c) => c.missingPercentage || 0),
        type: 'bar',
        itemStyle: { color: '#6366F1', borderRadius: [4, 4, 0, 0] },
      }
    ]
  }

  // Chart 2: First Categorical distribution
  const primaryCat = categoricalColumns[0]
  const catChartOption = primaryCat?.topCategories ? {
    title: { text: `Category Distribution: ${primaryCat.name}`, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item' },
    series: [
      {
        name: primaryCat.name,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        data: Object.entries(primaryCat.topCategories).map(([name, value]) => ({ name, value })),
      }
    ]
  } : null

  // Chart 3: Numeric stats comparison
  const numericChartOption = numericColumns.length > 0 ? {
    title: { text: 'Numeric Feature Averages (Mean)', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: numericColumns.map((c) => c.name),
      axisLabel: { rotate: 20 }
    },
    yAxis: { type: 'value' },
    series: [
      {
        data: numericColumns.map((c) => c.mean || 0),
        type: 'bar',
        itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] }
      }
    ]
  } : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">Phase 9</Badge>
            <span className="text-xs text-gray-500 font-mono">ID: {id}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Visual Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Interactive exploratory visualizations generated with Apache ECharts.
          </p>
        </div>

        <Button
          onClick={() => navigate(`/datasets/${id}/insights`)}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" /> AI Insights <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <ReactECharts option={missingChartOption} style={{ height: '340px', width: '100%' }} />
          </CardContent>
        </Card>

        {catChartOption ? (
          <Card>
            <CardContent className="pt-6">
              <ReactECharts option={catChartOption} style={{ height: '340px', width: '100%' }} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-24 text-center text-gray-500">
              <PieChart className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              No categorical columns found for distribution plotting.
            </CardContent>
          </Card>
        )}

        {numericChartOption && (
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <ReactECharts option={numericChartOption} style={{ height: '340px', width: '100%' }} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
