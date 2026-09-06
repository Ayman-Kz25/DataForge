import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  FileOutput
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { LoadingScreen } from '@/components/ui/spinner'
import { insightsService, datasetService } from '@/services/api'

export default function AIInsights() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dataset, setDataset] = useState(null)
  const [insights, setInsights] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
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
        const insightsRes = await insightsService.getInsights(id)
        if (insightsRes.data.data) {
          setInsights(insightsRes.data.data)
        }
      } catch (_) {
        // Not generated yet
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load AI insights.')
    } finally {
      setIsLoading(false)
    }
  }

  const generateInsights = async () => {
    try {
      setIsGenerating(true)
      setError(null)
      const res = await insightsService.generate(id)
      setInsights(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'AI insight generation failed. Please ensure GEMINI_API_KEY is configured.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) return <LoadingScreen message="Loading AI insights..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">Phase 10</Badge>
            <span className="text-xs text-gray-500 font-mono">ID: {id}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Automated AI Insights
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ground-truth data explanations powered by Google Gemini (structured statistical facts only, zero hallucinations).
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={generateInsights}
            disabled={isGenerating}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {insights ? 'Regenerate' : 'Generate Insights'}
          </Button>

          <Button
            onClick={() => navigate(`/datasets/${id}/reports`)}
            className="gap-2"
          >
            <FileOutput className="h-4 w-4" /> Download Reports <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!insights ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Sparkles className="h-12 w-12 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">No AI insights generated yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Synthesize validation results, anomaly patterns, and score distributions into natural language executive takeaways.
            </p>
            <Button className="mt-4 gap-2" onClick={generateInsights} disabled={isGenerating}>
              <Sparkles className="h-4 w-4" /> Generate Insights with Gemini
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Executive Summary */}
          <Card className="border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/20">
            <CardHeader>
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Lightbulb className="h-5 w-5" />
                <CardTitle>Executive Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-gray-800 dark:text-gray-200">
                {insights.summary || 'No summary available.'}
              </p>
            </CardContent>
          </Card>

          {/* Key Findings List */}
          {insights.findings?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Findings ({insights.findings.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.findings.map((finding, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">{finding}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Risks and Recommendations */}
          {insights.recommendations?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Actionable Recommendations ({insights.recommendations.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-900 dark:text-amber-200">{rec}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
