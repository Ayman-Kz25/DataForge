import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Database,
  ShieldCheck,
  BarChart3,
  Check,
  Activity,
  FileCheck2,
  Sparkles,
  LockKeyhole,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'

import { authService } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import ThemeToggle from '../components/ThemeToggle'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const platformFeatures = [
  {
    icon: Database,
    title: 'Centralized data',
    description: 'Keep datasets organized in one workspace.',
  },
  {
    icon: FileCheck2,
    title: 'Data validation',
    description: 'Identify quality issues before they affect results.',
  },
  {
    icon: BarChart3,
    title: 'Automated analysis',
    description: 'Turn raw datasets into useful findings.',
  },
]

const validationItems = [
  'Missing values',
  'Duplicate records',
  'Data type issues',
  'Outlier detection',
]

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const { login } = useAuthStore()

  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const message = location.state?.message
  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      setServerError('')

      const res = await authService.login(data)

      const {
        user,
        accessToken,
        refreshToken,
      } = res.data.data

      login(user, accessToken, refreshToken)

      navigate(from, { replace: true })
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          'Login failed. Please verify your credentials.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background text-foreground transition-colors duration-300">
      <div className="grid min-h-dvh lg:grid-cols-[1.08fr_0.92fr]">

        {/* =====================================================
            LEFT PRODUCT PANEL
        ====================================================== */}

        <section className="relative hidden overflow-hidden lg:flex">
          {/* Background */}
          <div className="absolute inset-0 bg-surface-secondary" />

          {/* Primary glow */}
          <div
            className="
              absolute
              -left-40
              -top-40
              h-[520px]
              w-[520px]
              rounded-full
              bg-primary/10
              blur-[110px]
            "
          />

          <div
            className="
              absolute
              -bottom-40
              -right-40
              h-[520px]
              w-[520px]
              rounded-full
              bg-violet-500/10
              blur-[110px]
            "
          />

          {/* Grid */}
          <div className="dataforge-grid absolute inset-0 opacity-80" />

          {/* Content */}
          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

            {/* Header */}
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="
                  group
                  flex
                  w-fit
                  items-center
                  gap-3
                  rounded-xl
                  focus:outline-none
                  focus:ring-2
                  focus:ring-primary
                  focus:ring-offset-2
                  focus:ring-offset-background
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary
                    text-white
                    shadow-lg
                    shadow-primary/25
                    transition-transform
                    duration-300
                    group-hover:scale-105
                  "
                >
                  <span className="text-sm font-black tracking-tight">
                    DF
                  </span>
                </div>

                <span className="text-xl font-bold tracking-tight">
                  DataForge
                </span>
              </Link>

              <div className="rounded-xl border border-border bg-surface/70 p-1 backdrop-blur-xl">
                <ThemeToggle />
              </div>
            </div>

            {/* Main visual */}
            <div className="my-12 max-w-2xl">

              <div
                className="
                  mb-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-primary/20
                  bg-primary/10
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-primary
                "
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>

                Intelligent data workspace
              </div>

              <h2
                className="
                  max-w-xl
                  text-4xl
                  font-black
                  leading-[1.08]
                  tracking-tight
                  sm:text-5xl
                  xl:text-6xl
                "
              >
                Turn raw data into
                <span className="block text-primary">
                  reliable decisions.
                </span>
              </h2>

              <p
                className="
                  mt-6
                  max-w-xl
                  text-base
                  leading-7
                  text-muted-foreground
                  xl:text-lg
                "
              >
                DataForge helps you validate, clean, analyze, and understand
                datasets through a single modern workspace.
              </p>

              {/* Product preview */}
              <div
                className="
                  mt-10
                  overflow-hidden
                  rounded-3xl
                  border
                  border-border
                  bg-surface/80
                  shadow-2xl
                  shadow-primary/5
                  backdrop-blur-xl
                "
              >
                {/* Preview header */}
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <Activity className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        Dataset health
                      </p>
                      <p className="text-xs text-muted">
                        customer_data.csv
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Healthy
                  </div>
                </div>

                {/* Score */}
                <div className="grid gap-6 p-5 sm:grid-cols-[150px_1fr]">
                  <div
                    className="
                      flex
                      flex-col
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-border
                      bg-surface-secondary
                      p-5
                    "
                  >
                    <div className="flex items-baseline">
                      <span className="text-4xl font-black tracking-tight">
                        94
                      </span>

                      <span className="ml-1 text-sm text-muted">
                        /100
                      </span>
                    </div>

                    <span className="mt-1 text-xs font-medium text-muted-foreground">
                      Quality score
                    </span>
                  </div>

                  <div className="space-y-3">
                    {validationItems.map((item, index) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary/70 px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                            <Check className="h-3.5 w-3.5 text-success" />
                          </div>

                          <span className="text-xs font-medium">
                            {item}
                          </span>
                        </div>

                        <span className="text-[10px] font-medium text-muted">
                          {index === 0
                            ? '0.8%'
                            : index === 1
                              ? '0.2%'
                              : index === 2
                                ? 'Good'
                                : 'Low'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {platformFeatures.map(
                  ({ icon: Icon, title, description }) => (
                    <div
                      key={title}
                      className="
                        rounded-2xl
                        border
                        border-border
                        bg-surface/60
                        p-4
                        backdrop-blur-xl
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:border-primary/30
                        hover:shadow-lg
                        hover:shadow-primary/5
                      "
                    >
                      <div
                        className="
                          mb-3
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          bg-primary-soft
                          text-primary
                        "
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <p className="text-sm font-semibold">
                        {title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted">
              <span>
                © {new Date().getFullYear()} DataForge
              </span>

              <div className="flex items-center gap-2">
                <LockKeyhole className="h-3.5 w-3.5" />
                Secure workspace access
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT LOGIN PANEL
        ====================================================== */}

        <main
          className="
            relative
            flex
            min-h-dvh
            items-center
            justify-center
            overflow-hidden
            bg-background
            px-5
            py-8
            sm:px-8
          "
        >
          {/* Mobile background effects */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
            <div
              className="
                absolute
                -right-32
                -top-32
                h-80
                w-80
                rounded-full
                bg-primary/10
                blur-[100px]
              "
            />

            <div
              className="
                absolute
                -bottom-32
                -left-32
                h-80
                w-80
                rounded-full
                bg-violet-500/10
                blur-[100px]
              "
            />

            <div className="dataforge-grid absolute inset-0 opacity-60" />
          </div>

          <div className="relative z-10 w-full max-w-md">

            {/* Mobile header */}
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link
                to="/"
                className="flex items-center gap-2.5"
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary
                    text-white
                    shadow-lg
                    shadow-primary/20
                  "
                >
                  <span className="text-xs font-black">
                    DF
                  </span>
                </div>

                <span className="font-bold">
                  DataForge
                </span>
              </Link>

              <div className="flex items-center gap-1">
                <ThemeToggle />

                <Link
                  to="/"
                  className="
                    flex
                    items-center
                    gap-1.5
                    rounded-lg
                    px-2
                    py-2
                    text-sm
                    font-medium
                    text-muted-foreground
                    transition-colors
                    hover:bg-surface-secondary
                    hover:text-foreground
                  "
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Link>
              </div>
            </div>

            {/* Login card */}
            <div
              className="
                overflow-hidden
                rounded-[28px]
                border
                border-border
                bg-surface
                shadow-2xl
                shadow-black/5
                dark:shadow-black/30
              "
            >
              {/* Card top accent */}
              <div className="h-1 bg-gradient-to-r from-primary via-violet-500 to-primary" />

              <div className="p-7 sm:p-9">

                {/* Header */}
                <div className="mb-8">
                  <div className="mb-5 flex items-center justify-between">
                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        bg-primary-soft
                        text-primary
                      "
                    >
                      <Database className="h-5 w-5" />
                    </div>

                    <div
                      className="
                        hidden
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-border
                        bg-surface-secondary
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        text-muted-foreground
                        sm:flex
                      "
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-success" />
                      Secure sign in
                    </div>
                  </div>

                  <h1 className="text-3xl font-black tracking-tight">
                    Welcome back
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Sign in to continue to your DataForge workspace.
                  </p>
                </div>

                {/* Success message */}
                {message && (
                  <Alert
                    variant="info"
                    className="mb-6 rounded-2xl"
                  >
                    {message}
                  </Alert>
                )}

                {/* Server error */}
                {serverError && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="mb-6"
                  >
                    <Alert
                      variant="danger"
                      className="rounded-2xl"
                    >
                      {serverError}
                    </Alert>
                  </div>
                )}

                {/* Form */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                  noValidate
                >
                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold"
                    >
                      Email address
                    </Label>

                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      error={errors.email}
                      aria-invalid={errors.email ? 'true' : 'false'}
                      aria-describedby={
                        errors.email ? 'email-error' : undefined
                      }
                      {...register('email')}
                      className="
                        h-12
                        rounded-xl
                        border-border
                        bg-surface-secondary
                        px-4
                        text-sm
                        transition-all
                        placeholder:text-muted
                        focus:border-primary
                        focus:bg-surface
                        focus:ring-2
                        focus:ring-primary/20
                      "
                    />

                    {errors.email && (
                      <p
                        id="email-error"
                        className="text-xs font-medium text-danger"
                      >
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-sm font-semibold"
                      >
                        Password
                      </Label>

                      <Link
                        to="/forgot-password"
                        className="
                          text-xs
                          font-semibold
                          text-primary
                          transition-colors
                          hover:text-primary-hover
                        "
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        error={errors.password}
                        aria-invalid={
                          errors.password ? 'true' : 'false'
                        }
                        aria-describedby={
                          errors.password
                            ? 'password-error'
                            : undefined
                        }
                        {...register('password')}
                        className="
                          h-12
                          rounded-xl
                          border-border
                          bg-surface-secondary
                          px-4
                          pr-12
                          text-sm
                          transition-all
                          placeholder:text-muted
                          focus:border-primary
                          focus:bg-surface
                          focus:ring-2
                          focus:ring-primary/20
                        "
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((value) => !value)
                        }
                        aria-label={
                          showPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                        className="
                          absolute
                          right-2
                          top-1/2
                          -translate-y-1/2
                          rounded-lg
                          p-2
                          text-muted
                          transition-colors
                          hover:bg-surface
                          hover:text-foreground
                          focus:outline-none
                          focus:ring-2
                          focus:ring-primary
                        "
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {errors.password && (
                      <p
                        id="password-error"
                        className="text-xs font-medium text-danger"
                      >
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="
                      mt-2
                      h-12
                      w-full
                      rounded-xl
                      bg-primary
                      text-sm
                      font-semibold
                      text-white
                      shadow-lg
                      shadow-primary/20
                      transition-all
                      hover:bg-primary-hover
                      hover:shadow-primary/30
                      disabled:cursor-not-allowed
                      disabled:opacity-70
                    "
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          size="sm"
                          className="border-t-white"
                        />

                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign in to workspace</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="my-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-border" />

                  <span className="text-[11px] font-medium tracking-wider text-muted">
                    OR
                  </span>

                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Register */}
                <div
                  className="
                    rounded-2xl
                    border
                    border-border
                    bg-surface-secondary
                    p-4
                    text-center
                  "
                >
                  <p className="text-sm text-muted-foreground">
                    Don't have a DataForge account?
                  </p>

                  <Link
                    to="/register"
                    className="
                      mt-1
                      inline-flex
                      items-center
                      gap-1
                      text-sm
                      font-semibold
                      text-primary
                      transition-colors
                      hover:text-primary-hover
                    "
                  >
                    Create your account
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Security footer */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
              <ShieldCheck className="h-3.5 w-3.5" />

              <span>
                Your workspace is protected with secure authentication.
              </span>
            </div>

            <p className="mt-3 text-center text-[11px] leading-5 text-muted">
              By signing in, you agree to the DataForge terms and privacy policy.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}