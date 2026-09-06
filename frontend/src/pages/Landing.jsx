import { useNavigate } from 'react-router-dom'
import { ArrowRight, Database, Shield, BarChart2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-900">
        <div className="flex items-center gap-2 font-bold text-xl text-white">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-sm font-black">DF</span>
          </div>
          DataForge
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span className="text-sm text-indigo-300 font-medium">Smart Data Validation & Automated Insights</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight max-w-4xl">
          Know Your Data.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Trust Your Results.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl leading-relaxed">
          Upload any dataset and DataForge will profile its structure, validate data quality,
          detect anomalies via Machine Learning, clean errors, and generate automated insights.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Button size="lg" onClick={() => navigate('/register')} className="gap-2">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: Database, label: '14 Validation Checks' },
            { icon: Shield, label: 'Quality Scoring (0-100)' },
            { icon: BarChart2, label: 'Interactive Dashboards' },
            { icon: Sparkles, label: 'AI Insights & Reports' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/60 px-4 py-2">
              <Icon className="h-4 w-4 text-indigo-400" />
              <span className="text-sm text-gray-300">{label}</span>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-600 border-t border-gray-900">
        DataForge · Mehran University of Engineering, Science & Technology · Department of Software Engineering (23SW)
      </footer>
    </div>
  )
}
