import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  Database,
  FileCheck2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';

const capabilities = [
  {
    number: '01',
    icon: Upload,
    title: 'Drop your dataset',
    description:
      'CSV files, structured data, and real-world datasets go straight into your workspace.',
  },
  {
    number: '02',
    icon: FileCheck2,
    title: 'Validate automatically',
    description:
      'DataForge checks missing values, duplicates, types, ranges, consistency, and anomalies.',
  },
  {
    number: '03',
    icon: BarChart3,
    title: 'Understand the result',
    description:
      'Turn validation results into quality scores, visualizations, reports, and useful findings.',
  },
];

const stats = [
  ['14+', 'validation checks'],
  ['0–100', 'quality score'],
  ['ML', 'anomaly detection'],
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">

      {/* Background grid */}
      <div
        className="
          pointer-events-none fixed inset-0 -z-10
          bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)]
          bg-[size:64px_64px]
        "
      />

      {/* Ambient glow */}
      <div className="pointer-events-none fixed left-1/2 top-0 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/15" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">

          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-indigo-500/20">
              <span className="text-sm font-black text-white">
                DF
              </span>
            </div>

            <div className="text-left">
              <div className="text-sm font-bold tracking-tight">
                DataForge
              </div>
              <div className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:block">
                Data quality platform
              </div>
            </div>
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              How it works
            </a>

            <a
              href="#capabilities"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              Capabilities
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
            >
              Sign in
            </Button>

            <Button
              size="sm"
              onClick={() => navigate('/register')}
              className="hidden gap-2 sm:flex"
            >
              Start free
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>

        <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:pb-28 lg:pt-28">

          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">

            {/* Hero copy */}
            <div>

              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3.5 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                </span>

                Built for trustworthy data
              </div>

              <h1 className="max-w-4xl text-5xl font-black tracking-[-0.045em] sm:text-6xl lg:text-[76px] lg:leading-[0.98]">
                Bad data gets
                <br />

                <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
                  expensive.
                </span>

                <br />

                Catch it early.
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                DataForge turns raw datasets into validated, explainable,
                decision-ready data. Upload it, inspect it, fix it, and
                understand its quality before it reaches your analysis.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="h-12 gap-2 px-6"
                >
                  Start with your data
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="h-12 px-6"
                >
                  Open workspace
                </Button>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Automated validation
                </div>

                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ML anomaly detection
                </div>

                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Automated reports
                </div>
              </div>
            </div>

            {/* Product visual */}
            <div className="relative">

              {/* Main dashboard */}
              <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl shadow-slate-950/10 dark:shadow-black/30">

                {/* Window header */}
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                  </div>

                  <span className="font-mono text-[10px] text-muted-foreground">
                    DATAFORGE / QUALITY
                  </span>
                </div>

                <div className="p-5 sm:p-7">

                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Dataset
                      </p>

                      <h3 className="mt-1 text-lg font-bold">
                        customer_transactions.csv
                      </h3>
                    </div>

                    <div className="rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Validated
                    </div>
                  </div>

                  {/* Score */}
                  <div className="mt-8 flex items-center gap-7">
                    <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-[10px] border-indigo-500/15">
                      <div className="absolute inset-[-10px] rounded-full border-[10px] border-transparent border-r-indigo-500 border-t-indigo-500" />

                      <div className="text-center">
                        <div className="text-3xl font-black">
                          94
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          quality
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <QualityRow
                        label="Completeness"
                        value="98%"
                      />
                      <QualityRow
                        label="Consistency"
                        value="96%"
                      />
                      <QualityRow
                        label="Validity"
                        value="92%"
                      />
                    </div>
                  </div>

                  {/* Validation list */}
                  <div className="mt-8 space-y-2">
                    <ValidationRow
                      label="Missing values"
                      result="Passed"
                    />
                    <ValidationRow
                      label="Duplicate records"
                      result="Passed"
                    />
                    <ValidationRow
                      label="Type consistency"
                      result="Passed"
                    />
                    <ValidationRow
                      label="Anomalies"
                      result="3 detected"
                      warning
                    />
                  </div>
                </div>
              </div>

              {/* Floating insight card */}
              <div className="absolute -bottom-7 -left-5 w-56 rounded-2xl border border-border bg-surface p-4 shadow-xl sm:-left-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                  </div>

                  <div>
                    <p className="text-xs font-bold">
                      ML finding
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      3 unusual transactions
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating check card */}
              <div className="absolute -right-4 -top-5 hidden w-48 rounded-2xl border border-border bg-surface p-4 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  </div>

                  <div>
                    <p className="text-xs font-bold">
                      14 checks
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      completed successfully
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-border bg-surface/50">
          <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
            {stats.map(([value, label]) => (
              <div
                key={label}
                className="flex items-center gap-4 px-6 py-7 sm:justify-center"
              >
                <span className="font-mono text-2xl font-bold tracking-tight">
                  {value}
                </span>

                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32"
        >
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-500">
              From upload to confidence
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Your dataset gets a
              <br />
              quality report before you trust it.
            </h2>

            <p className="mt-5 text-base leading-7 text-muted-foreground">
              DataForge removes the repetitive inspection work so you can
              spend more time working with the data and less time wondering
              whether the data is correct.
            </p>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3">
            {capabilities.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.number}
                  className="group bg-surface p-7 transition-colors hover:bg-surface-secondary sm:p-9"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground">
                      {item.number}
                    </span>

                    <Icon className="h-5 w-5 text-indigo-500 transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  <h3 className="mt-12 text-xl font-bold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Capabilities */}
        <section
          id="capabilities"
          className="border-y border-border bg-surface/40"
        >
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">

            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">

              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-500">
                  Built for your FYP
                </p>

                <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                  Everything you need to
                  <span className="text-indigo-500"> know your data.</span>
                </h2>

                <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
                  A single workspace for profiling, validation, anomaly
                  detection, cleaning, visualization, and automated reporting.
                </p>

                <div className="mt-8">
                  <Button
                    onClick={() => navigate('/register')}
                    className="gap-2"
                  >
                    Create your workspace
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                <FeatureCard
                  icon={Database}
                  title="Dataset profiling"
                  description="Understand columns, types, distributions, and missing values."
                />

                <FeatureCard
                  icon={ShieldCheck}
                  title="Quality scoring"
                  description="A clear 0–100 score gives your dataset an immediate health check."
                />

                <FeatureCard
                  icon={Sparkles}
                  title="ML anomalies"
                  description="Surface unusual records that conventional validation can miss."
                />

                <FeatureCard
                  icon={BarChart3}
                  title="Interactive reports"
                  description="Turn raw validation results into useful visual reports."
                />

              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8 lg:py-32">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10">
            <Zap className="h-5 w-5 text-indigo-500" />
          </div>

          <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
            Stop guessing.
            <br />
            <span className="text-indigo-500">
              Start validating.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Upload your first dataset and see exactly where your data stands.
          </p>

          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="h-12 gap-2 px-7"
            >
              Get started with DataForge
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-xs text-muted-foreground sm:px-8 md:flex-row md:items-center md:justify-between">

          <div>
            © 2026 DataForge
          </div>

          <div className="text-center">
            Mehran University of Engineering, Science & Technology
            <span className="mx-2 hidden sm:inline">·</span>
            Department of Software Engineering · 23SW
          </div>

          <div className="flex items-center justify-center gap-2">
            <LockKeyhole className="h-3.5 w-3.5" />
            Secure workspace
          </div>
        </div>
      </footer>
    </div>
  );
}

function QualityRow({ label, value }) {
  return (
    <div className="flex min-w-[150px] items-center justify-between gap-5 text-xs">
      <span className="text-muted-foreground">
        {label}
      </span>

      <span className="font-mono font-semibold">
        {value}
      </span>
    </div>
  );
}

function ValidationRow({ label, result, warning = false }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary/50 px-3.5 py-2.5">
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full ${
            warning
              ? 'bg-amber-500/10 text-amber-500'
              : 'bg-emerald-500/10 text-emerald-500'
          }`}
        >
          {warning ? (
            <Sparkles className="h-3 w-3" />
          ) : (
            <Check className="h-3 w-3" />
          )}
        </div>

        <span className="text-xs">
          {label}
        </span>
      </div>

      <span
        className={`text-[10px] font-semibold ${
          warning
            ? 'text-amber-500'
            : 'text-emerald-500'
        }`}
      >
        {result}
      </span>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="group rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
        <Icon className="h-5 w-5 text-indigo-500" />
      </div>

      <h3 className="mt-5 font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}