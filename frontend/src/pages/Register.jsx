import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  FileCheck2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

import { authService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters'),

    email: z
      .string()
      .trim()
      .email('Enter a valid email address'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),

    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  );

const passwordRules = [
  {
    key: 'length',
    label: 'At least 8 characters',
    test: (value) => value.length >= 8,
  },
  {
    key: 'uppercase',
    label: 'One uppercase letter',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    key: 'number',
    label: 'One number',
    test: (value) => /\d/.test(value),
  },
  {
    key: 'special',
    label: 'One special character',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

function getPasswordStrength(password) {
  if (!password) {
    return {
      score: 0,
      label: 'Enter a password',
    };
  }

  const score = passwordRules.filter((rule) =>
    rule.test(password)
  ).length;

  if (score <= 1) {
    return {
      score,
      label: 'Weak password',
    };
  }

  if (score === 2) {
    return {
      score,
      label: 'Fair password',
    };
  }

  if (score === 3) {
    return {
      score,
      label: 'Good password',
    };
  }

  return {
    score,
    label: 'Strong password',
  };
}

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const name = useWatch({
    control,
    name: 'name',
    defaultValue: '',
  });

  const email = useWatch({
    control,
    name: 'email',
    defaultValue: '',
  });

  const password = useWatch({
    control,
    name: 'password',
    defaultValue: '',
  });

  const confirmPassword = useWatch({
    control,
    name: 'confirmPassword',
    defaultValue: '',
  });

  const passwordStrength = useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  const passwordMatches =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const completedFields = [
    name.trim().length >= 2,
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    passwordStrength.score === 4,
    passwordMatches,
  ].filter(Boolean).length;

  const progress = Math.round((completedFields / 4) * 100);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setServerError('');

      const res = await authService.register({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      const {
        user,
        accessToken,
        refreshToken,
      } = res.data.data;

      login(
        user,
        accessToken,
        refreshToken
      );

      navigate('/dashboard');
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground transition-colors duration-300">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div
          className="
            absolute inset-0 opacity-60
            bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)]
            bg-[size:56px_56px]
          "
        />

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />

        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[120px]" />

      </div>

      <div className="relative grid min-h-dvh lg:grid-cols-[0.9fr_1.1fr]">

        {/* =====================================================
            BRAND PANEL
        ====================================================== */}

        <section className="relative hidden overflow-hidden border-r border-border lg:flex">

          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-background to-background" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

            {/* Logo */}

            <Link
              to="/"
              className="flex w-fit items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-indigo-500/20">
                <span className="text-sm font-black text-white">
                  DF
                </span>
              </div>

              <div>
                <div className="text-lg font-bold tracking-tight">
                  DataForge
                </div>

                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Data quality platform
                </div>
              </div>
            </Link>

            {/* Main */}

            <div className="max-w-xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                Your workspace starts here
              </div>

              <h2 className="text-4xl font-black tracking-[-0.04em] xl:text-6xl xl:leading-[1.02]">
                From raw data
                <br />
                to{' '}
                <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                  trusted results.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">
                Create your workspace and bring your datasets into
                one place for validation, anomaly detection,
                visualization, and automated reporting.
              </p>

              {/* Product preview */}

              <div className="mt-10 rounded-3xl border border-border bg-surface/80 p-5 shadow-xl backdrop-blur-xl">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10">
                      <Database className="h-4 w-4 text-indigo-500" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold">
                        Your workspace
                      </p>

                      <p className="text-[11px] text-muted-foreground">
                        Ready for your first dataset
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Ready
                  </div>

                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">

                  <MiniStat
                    icon={Upload}
                    label="Upload"
                  />

                  <MiniStat
                    icon={FileCheck2}
                    label="Validate"
                  />

                  <MiniStat
                    icon={BarChart3}
                    label="Analyze"
                  />

                </div>

                <div className="mt-4 rounded-xl border border-border bg-surface-secondary/60 p-3">

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Quality score
                    </span>

                    <span className="font-mono text-sm font-bold">
                      94/100
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                    <div className="h-full w-[94%] rounded-full bg-indigo-500" />
                  </div>

                </div>

              </div>

              {/* Trust points */}

              <div className="mt-8 grid grid-cols-2 gap-3">

                <TrustPoint
                  icon={ShieldCheck}
                  text="Secure authentication"
                />

                <TrustPoint
                  icon={LockKeyhole}
                  text="Protected workspace"
                />

              </div>

            </div>

            {/* Footer */}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                © {new Date().getFullYear()} DataForge
              </span>

              <span>
                Software Engineering · 23SW
              </span>
            </div>

          </div>
        </section>

        {/* =====================================================
            REGISTER PANEL
        ====================================================== */}

        <main className="relative flex min-h-dvh items-center justify-center px-5 py-8 sm:px-8 lg:py-12">

          <div className="relative z-10 w-full max-w-xl">

            {/* Mobile header */}

            <div className="mb-7 flex items-center justify-between lg:hidden">

              <Link
                to="/"
                className="flex items-center gap-2.5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                  <span className="text-xs font-black text-white">
                    DF
                  </span>
                </div>

                <span className="font-bold">
                  DataForge
                </span>
              </Link>

              <Link
                to="/"
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>

            </div>

            {/* Registration container */}

            <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-2xl shadow-slate-950/5 dark:shadow-black/20">

              {/* Progress header */}

              <div className="border-b border-border px-6 py-4 sm:px-9">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Account setup
                    </p>

                    <p className="mt-1 text-xs font-medium">
                      {completedFields === 4
                        ? 'Ready to create your workspace'
                        : `${completedFields} of 4 completed`}
                    </p>
                  </div>

                  <span className="font-mono text-xs text-muted-foreground">
                    {progress}%
                  </span>

                </div>

                <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-secondary">

                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />

                </div>

              </div>

              <div className="p-6 sm:p-9">

                {/* Heading */}

                <div className="mb-8">

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <Database className="h-5 w-5" />
                  </div>

                  <h1 className="text-3xl font-black tracking-tight">
                    Create your workspace
                  </h1>

                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Set up your account and start analyzing your
                    datasets with DataForge.
                  </p>

                </div>

                {/* Server error */}

                {serverError && (
                  <div
                    role="alert"
                    className="mb-6"
                  >
                    <Alert
                      variant="danger"
                      className="rounded-xl"
                    >
                      {serverError}
                    </Alert>
                  </div>
                )}

                {/* Form */}

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="space-y-6"
                >

                  {/* Name */}

                  <Field
                    label="Full name"
                    htmlFor="name"
                    error={errors.name}
                  >

                    <Input
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="John Doe"
                      {...register('name')}
                      aria-invalid={!!errors.name}
                      className={inputClass(!!errors.name)}
                    />

                  </Field>

                  {/* Email */}

                  <Field
                    label="Email address"
                    htmlFor="email"
                    error={errors.email}
                  >

                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      {...register('email')}
                      aria-invalid={!!errors.email}
                      className={inputClass(!!errors.email)}
                    />

                  </Field>

                  {/* Password */}

                  <div className="space-y-3">

                    <Label
                      htmlFor="password"
                      className="text-sm font-semibold"
                    >
                      Password
                    </Label>

                    <div className="relative">

                      <Input
                        id="password"
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        autoComplete="new-password"
                        placeholder="Create a strong password"
                        {...register('password')}
                        aria-invalid={!!errors.password}
                        className={`${inputClass(
                          !!errors.password
                        )} pr-12`}
                      />

                      <PasswordToggle
                        visible={showPassword}
                        onClick={() =>
                          setShowPassword(
                            (value) => !value
                          )
                        }
                      />

                    </div>

                    {/* Strength */}

                    {password && (
                      <div className="space-y-2">

                        <div className="flex items-center justify-between">

                          <span className="text-[11px] font-medium text-muted-foreground">
                            Password strength
                          </span>

                          <span
                            className={`text-[11px] font-semibold ${
                              passwordStrength.score >= 4
                                ? 'text-emerald-500'
                                : passwordStrength.score >= 3
                                ? 'text-amber-500'
                                : 'text-red-500'
                            }`}
                          >
                            {passwordStrength.label}
                          </span>

                        </div>

                        <div className="grid grid-cols-4 gap-1.5">

                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 rounded-full transition-all ${
                                passwordStrength.score >= level
                                  ? passwordStrength.score >= 4
                                    ? 'bg-emerald-500'
                                    : passwordStrength.score >= 3
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                  : 'bg-border'
                              }`}
                            />
                          ))}

                        </div>

                        <div className="grid gap-1.5 pt-1 sm:grid-cols-2">

                          {passwordRules.map((rule) => {
                            const passed = rule.test(password);

                            return (
                              <div
                                key={rule.key}
                                className={`flex items-center gap-2 text-[11px] transition-colors ${
                                  passed
                                    ? 'text-emerald-500'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {passed ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : (
                                  <div className="h-3.5 w-3.5 rounded-full border border-border" />
                                )}

                                {rule.label}
                              </div>
                            );
                          })}

                        </div>

                      </div>
                    )}

                    {errors.password && (
                      <p className="text-xs font-medium text-red-500">
                        {errors.password.message}
                      </p>
                    )}

                  </div>

                  {/* Confirm password */}

                  <div className="space-y-3">

                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-semibold"
                    >
                      Confirm password
                    </Label>

                    <div className="relative">

                      <Input
                        id="confirmPassword"
                        type={
                          showConfirmPassword
                            ? 'text'
                            : 'password'
                        }
                        autoComplete="new-password"
                        placeholder="Repeat your password"
                        {...register('confirmPassword')}
                        aria-invalid={
                          !!errors.confirmPassword
                        }
                        className={`${inputClass(
                          !!errors.confirmPassword
                        )} pr-12`}
                      />

                      <PasswordToggle
                        visible={showConfirmPassword}
                        onClick={() =>
                          setShowConfirmPassword(
                            (value) => !value
                          )
                        }
                      />

                    </div>

                    {confirmPassword && (
                      <div
                        className={`flex items-center gap-2 text-xs font-medium ${
                          passwordMatches
                            ? 'text-emerald-500'
                            : 'text-red-500'
                        }`}
                      >
                        {passwordMatches ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Passwords match
                          </>
                        ) : (
                          <>
                            <X className="h-3.5 w-3.5" />
                            Passwords do not match
                          </>
                        )}
                      </div>
                    )}

                    {errors.confirmPassword && (
                      <p className="text-xs font-medium text-red-500">
                        {errors.confirmPassword.message}
                      </p>
                    )}

                  </div>

                  {/* Submit */}

                  <Button
                    type="submit"
                    disabled={isLoading || !isValid}
                    className="h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/10 transition-all hover:shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {isLoading ? (
                      <>
                        <Spinner
                          size="sm"
                          className="border-t-white"
                        />
                        <span>
                          Creating workspace...
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          Create your workspace
                        </span>

                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}

                  </Button>

                </form>

                {/* Existing account */}

                <div className="mt-7 border-t border-border pt-6 text-center">

                  <p className="text-sm text-muted-foreground">
                    Already have an account?
                  </p>

                  <Link
                    to="/login"
                    className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:text-primary-hover"
                  >
                    Sign in to DataForge
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                </div>

              </div>
            </div>

            {/* Security notice */}

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <LockKeyhole className="h-3.5 w-3.5" />
              Your credentials are transmitted securely
            </div>

            {/* Terms */}

            <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">
              By creating an account, you agree to the DataForge
              terms and privacy policy.
            </p>

          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   Reusable UI helpers
============================================================ */

function Field({
  label,
  htmlFor,
  error,
  children,
}) {
  return (
    <div className="space-y-2">

      <Label
        htmlFor={htmlFor}
        className="text-sm font-semibold"
      >
        {label}
      </Label>

      {children}

      {error && (
        <p
          id={`${htmlFor}-error`}
          className="text-xs font-medium text-red-500"
        >
          {error.message}
        </p>
      )}

    </div>
  );
}

function PasswordToggle({
  visible,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        visible
          ? 'Hide password'
          : 'Show password'
      }
      className="
        absolute right-2 top-1/2
        -translate-y-1/2
        rounded-lg p-2
        text-muted-foreground
        transition-colors
        hover:bg-surface-secondary
        hover:text-foreground
        focus:outline-none
        focus:ring-2
        focus:ring-primary/30
      "
    >
      {visible ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </button>
  );
}

function MiniStat({
  icon: Icon,
  label,
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface-secondary/50 px-3 py-3">
      <Icon className="h-4 w-4 text-primary" />

      <span className="text-[10px] font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function TrustPoint({
  icon: Icon,
  text,
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface/50 px-3 py-2.5">
      <Icon className="h-4 w-4 text-emerald-500" />

      <span className="text-[11px] font-medium text-muted-foreground">
        {text}
      </span>
    </div>
  );
}

function inputClass(hasError) {
  return `
    h-12 w-full rounded-xl px-4 text-sm
    bg-surface-secondary
    border
    ${
      hasError
        ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
        : 'border-border focus:border-primary focus:ring-primary/20'
    }
    text-foreground
    placeholder:text-subtle-foreground
    transition-all
    focus:bg-surface
    focus:ring-2
  `;
}