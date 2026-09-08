import { useEffect, useMemo, useState } from 'react'
import {
  User,
  Shield,
  KeyRound,
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Clock3,
  Database,
  AlertCircle,
  Save,
  Smartphone,
  LogOut,
  Trash2,
  ChevronRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { useAuthStore } from '@/store/authStore'

const DEFAULT_NOTIFICATIONS = {
  analysisComplete: true,
  validationIssues: true,
  weeklySummary: false,
}

export default function Settings() {
  const { user } = useAuthStore()

  const [profile, setProfile] = useState({
    name: user?.name || '',
  })

  const [savedProfile, setSavedProfile] = useState({
    name: user?.name || '',
  })

  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  })

  const [notifications, setNotifications] = useState(
    DEFAULT_NOTIFICATIONS
  )

  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [preferencesSaving, setPreferencesSaving] = useState(false)

  const [profileMessage, setProfileMessage] = useState(null)
  const [passwordMessage, setPasswordMessage] = useState(null)
  const [preferencesMessage, setPreferencesMessage] = useState(null)

  const [error, setError] = useState(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const name = user?.name || ''

    setProfile({ name })
    setSavedProfile({ name })
  }, [user?.name])

  const profileDirty = profile.name.trim() !== savedProfile.name

  const passwordChecks = useMemo(() => {
    const password = passwords.next

    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      match:
        password.length > 0 &&
        password === passwords.confirm,
    }
  }, [passwords.next, passwords.confirm])

  const passwordStrength = useMemo(() => {
    const checks = [
      passwordChecks.length,
      passwordChecks.uppercase,
      passwordChecks.lowercase,
      passwordChecks.number,
    ]

    const score = checks.filter(Boolean).length

    if (!passwords.next) {
      return {
        label: 'Enter a new password',
        width: 'w-0',
      }
    }

    if (score <= 1) {
      return {
        label: 'Weak password',
        width: 'w-1/4',
      }
    }

    if (score === 2) {
      return {
        label: 'Fair password',
        width: 'w-2/4',
      }
    }

    if (score === 3) {
      return {
        label: 'Good password',
        width: 'w-3/4',
      }
    }

    return {
      label: 'Strong password',
      width: 'w-full',
    }
  }, [passwords.next, passwordChecks])

  const passwordValid =
    passwords.current.length > 0 &&
    passwordChecks.length &&
    passwordChecks.uppercase &&
    passwordChecks.lowercase &&
    passwordChecks.number &&
    passwordChecks.match

  const handleProfileSave = async (event) => {
    event.preventDefault()

    if (!profile.name.trim()) {
      setProfileMessage({
        type: 'error',
        text: 'Full name cannot be empty.',
      })
      return
    }

    try {
      setProfileSaving(true)
      setProfileMessage(null)
      setError(null)

      // Replace this section with your profile API call.
      await new Promise((resolve) => setTimeout(resolve, 500))

      const nextProfile = {
        name: profile.name.trim(),
      }

      setProfile(nextProfile)
      setSavedProfile(nextProfile)

      setProfileMessage({
        type: 'success',
        text: 'Profile details saved successfully.',
      })
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to save profile details.'
      )
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordUpdate = async (event) => {
    event.preventDefault()

    setPasswordMessage(null)
    setError(null)

    if (!passwords.current) {
      setPasswordMessage({
        type: 'error',
        text: 'Enter your current password.',
      })
      return
    }

    if (!passwordValid) {
      setPasswordMessage({
        type: 'error',
        text: 'Use a stronger password and make sure both new password fields match.',
      })
      return
    }

    try {
      setPasswordSaving(true)

      // Replace this section with your password API call.
      await new Promise((resolve) => setTimeout(resolve, 600))

      setPasswords({
        current: '',
        next: '',
        confirm: '',
      })

      setPasswordMessage({
        type: 'success',
        text: 'Password updated successfully.',
      })
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update password.'
      )
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleNotificationChange = (key) => {
    setNotifications((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  const handlePreferencesSave = async () => {
    try {
      setPreferencesSaving(true)
      setPreferencesMessage(null)
      setError(null)

      // Replace this section with your preferences API call.
      await new Promise((resolve) => setTimeout(resolve, 400))

      setPreferencesMessage({
        type: 'success',
        text: 'Notification preferences updated.',
      })
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update notification preferences.'
      )
    } finally {
      setPreferencesSaving(false)
    }
  }

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false)

    setError(
      'Account deletion is not connected yet. Add your account deletion API endpoint before enabling this action.'
    )
  }

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="dataforge-grid absolute inset-0 opacity-10" />
        <div className="absolute -right-40 -top-40 h-[460px] w-[460px] rounded-full bg-primary/6 blur-[130px]" />
      </div>

      <main className="relative z-10 mx-auto flex h-full min-h-0 max-w-6xl flex-col overflow-hidden px-5 py-5 sm:px-8 sm:py-6">
        <header className="shrink-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <User className="h-3.5 w-3.5" />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                  Account
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                Settings
              </h1>

              <p className="mt-1.5 text-sm text-muted-foreground">
                Manage your profile, security, and notifications.
              </p>
            </div>

            <AccountStatus user={user} />
          </div>
        </header>

        {error && (
          <div className="mt-4 shrink-0">
            <Alert
              variant="danger"
              onDismiss={() => setError(null)}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            </Alert>
          </div>
        )}

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 space-y-5">
              <section className="overflow-hidden border border-border bg-surface/80 backdrop-blur-sm">
                <SectionHeader
                  icon={User}
                  eyebrow="Profile"
                  title="Profile details"
                  description="Update the information associated with your account."
                />

                <form
                  onSubmit={handleProfileSave}
                  className="border-t border-border"
                >
                  <div className="grid gap-5 p-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Full name
                      </Label>

                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(event) =>
                          setProfile((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email address
                      </Label>

                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

                        <Input
                          id="email"
                          value={user?.email || ''}
                          disabled
                          className="bg-surface-secondary pl-10"
                        />
                      </div>

                      <p className="text-[11px] text-muted">
                        Contact support to change your email address.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      {profileMessage?.type === 'success' && (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                          <span className="text-xs text-success">
                            {profileMessage.text}
                          </span>
                        </>
                      )}

                      {profileMessage?.type === 'error' && (
                        <>
                          <AlertCircle className="h-3.5 w-3.5 text-danger" />
                          <span className="text-xs text-danger">
                            {profileMessage.text}
                          </span>
                        </>
                      )}

                      {!profileDirty && !profileMessage && (
                        <span className="text-xs text-muted">
                          No unsaved changes
                        </span>
                      )}

                      {profileDirty && (
                        <span className="text-xs text-warning">
                          Unsaved changes
                        </span>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={!profileDirty || profileSaving}
                      className="gap-2"
                    >
                      {profileSaving ? (
                        <>
                          <Save className="h-4 w-4 animate-pulse" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </section>

              <section className="overflow-hidden border border-border bg-surface/80 backdrop-blur-sm">
                <SectionHeader
                  icon={Shield}
                  eyebrow="Security"
                  title="Password"
                  description="Keep your account protected with a strong password."
                />

                <form
                  onSubmit={handlePasswordUpdate}
                  className="border-t border-border"
                >
                  <div className="space-y-5 p-5">
                    <PasswordField
                      id="currentPass"
                      label="Current password"
                      value={passwords.current}
                      visible={showPasswords.current}
                      placeholder="Enter current password"
                      onChange={(value) =>
                        setPasswords((current) => ({
                          ...current,
                          current: value,
                        }))
                      }
                      onToggle={() =>
                        setShowPasswords((current) => ({
                          ...current,
                          current: !current.current,
                        }))
                      }
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <PasswordField
                        id="newPass"
                        label="New password"
                        value={passwords.next}
                        visible={showPasswords.next}
                        placeholder="Minimum 8 characters"
                        onChange={(value) =>
                          setPasswords((current) => ({
                            ...current,
                            next: value,
                          }))
                        }
                        onToggle={() =>
                          setShowPasswords((current) => ({
                            ...current,
                            next: !current.next,
                          }))
                        }
                      />

                      <PasswordField
                        id="confirmPass"
                        label="Confirm new password"
                        value={passwords.confirm}
                        visible={showPasswords.confirm}
                        placeholder="Repeat new password"
                        onChange={(value) =>
                          setPasswords((current) => ({
                            ...current,
                            confirm: value,
                          }))
                        }
                        onToggle={() =>
                          setShowPasswords((current) => ({
                            ...current,
                            confirm: !current.confirm,
                          }))
                        }
                      />
                    </div>

                    {passwords.next && (
                      <PasswordStrength
                        strength={passwordStrength}
                        checks={passwordChecks}
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-3 border-t border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      {passwordMessage ? (
                        <div
                          className={`flex items-center gap-2 text-xs ${
                            passwordMessage.type === 'success'
                              ? 'text-success'
                              : 'text-danger'
                          }`}
                        >
                          {passwordMessage.type === 'success' ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <AlertCircle className="h-3.5 w-3.5" />
                          )}
                          {passwordMessage.text}
                        </div>
                      ) : (
                        <span className="text-xs text-muted">
                          Use at least 8 characters with mixed character types.
                        </span>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={passwordSaving}
                      className="gap-2"
                    >
                      <KeyRound className="h-4 w-4" />
                      {passwordSaving
                        ? 'Updating...'
                        : 'Update password'}
                    </Button>
                  </div>
                </form>
              </section>

              <section className="overflow-hidden border border-border bg-surface/80 backdrop-blur-sm">
                <SectionHeader
                  icon={Bell}
                  eyebrow="Notifications"
                  title="Notification preferences"
                  description="Choose which DataForge events should reach you."
                />

                <div className="divide-y divide-border border-t border-border">
                  <NotificationRow
                    title="Analysis completed"
                    description="Get notified when dataset profiling and analysis finishes."
                    checked={notifications.analysisComplete}
                    onChange={() =>
                      handleNotificationChange('analysisComplete')
                    }
                  />

                  <NotificationRow
                    title="Validation issues"
                    description="Get notified when important data quality issues are detected."
                    checked={notifications.validationIssues}
                    onChange={() =>
                      handleNotificationChange('validationIssues')
                    }
                  />

                  <NotificationRow
                    title="Weekly summary"
                    description="Receive a weekly overview of your dataset activity."
                    checked={notifications.weeklySummary}
                    onChange={() =>
                      handleNotificationChange('weeklySummary')
                    }
                  />
                </div>

                <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
                  {preferencesMessage ? (
                    <div className="flex items-center gap-2 text-xs text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {preferencesMessage.text}
                    </div>
                  ) : (
                    <span className="text-xs text-muted">
                      Preferences are stored for this session.
                    </span>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePreferencesSave}
                    disabled={preferencesSaving}
                    className="gap-2"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {preferencesSaving
                      ? 'Saving...'
                      : 'Save preferences'}
                  </Button>
                </div>
              </section>
            </div>

            <aside className="min-w-0 space-y-5">
              <section className="border border-border bg-surface/80 backdrop-blur-sm">
                <SectionHeader
                  icon={Shield}
                  eyebrow="Account"
                  title="Account overview"
                />

                <div className="border-t border-border">
                  <InfoRow
                    icon={User}
                    label="Role"
                    value={
                      <Badge
                        variant={
                          user?.role === 'admin'
                            ? 'primary'
                            : 'default'
                        }
                        className="uppercase"
                      >
                        {user?.role || 'user'}
                      </Badge>
                    }
                  />

                  <InfoRow
                    icon={Mail}
                    label="Email"
                    value={user?.email || 'Not available'}
                  />

                  <InfoRow
                    icon={Database}
                    label="Workspace"
                    value="DataForge"
                  />

                  <InfoRow
                    icon={CheckCircle2}
                    label="Account status"
                    value={
                      <span className="flex items-center gap-1.5 text-success">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" />
                        Active
                      </span>
                    }
                  />
                </div>
              </section>

              <section className="border border-border bg-surface/80 backdrop-blur-sm">
                <SectionHeader
                  icon={Lock}
                  eyebrow="Security"
                  title="Security status"
                />

                <div className="border-t border-border p-5">
                  <SecurityItem
                    icon={Lock}
                    title="Password protected"
                    description="Your account uses password authentication."
                    status="Protected"
                  />

                  <SecurityItem
                    icon={Smartphone}
                    title="Active session"
                    description="This browser session is currently active."
                    status="Current"
                  />

                  <SecurityItem
                    icon={Clock3}
                    title="Session security"
                    description="Session credentials are handled by DataForge."
                    status="Enabled"
                  />
                </div>
              </section>

              <section className="border border-danger/25 bg-surface/80">
                <div className="flex items-start gap-3 border-b border-danger/15 px-5 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
                    <AlertCircle className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-danger">
                      Danger zone
                    </p>

                    <h2 className="mt-1 text-sm font-bold">
                      Delete account
                    </h2>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs leading-5 text-muted-foreground">
                    Permanently remove your DataForge account and associated
                    workspace data.
                  </p>

                  {!showDeleteConfirm ? (
                    <Button
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="mt-4 w-full gap-2 text-danger hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete account
                    </Button>
                  ) : (
                    <div className="mt-4 space-y-3 rounded-xl border border-danger/20 bg-danger/5 p-3">
                      <p className="text-xs font-medium text-danger">
                        This action cannot be undone.
                      </p>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setShowDeleteConfirm(false)
                          }
                          className="flex-1"
                        >
                          Cancel
                        </Button>

                        <Button
                          size="sm"
                          onClick={handleDeleteAccount}
                          className="flex-1 bg-danger text-white hover:bg-danger/90"
                        >
                          Confirm
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>

          <div className="h-5 shrink-0" />
        </div>
      </main>
    </div>
  )
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-sm font-bold">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

function AccountStatus({ user }) {
  return (
    <div className="flex items-center gap-3 border border-border bg-surface/70 px-3 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
        {getInitials(user?.name)}
      </div>

      <div className="min-w-0">
        <p className="truncate text-xs font-semibold">
          {user?.name || 'DataForge user'}
        </p>

        <p className="truncate text-[11px] text-muted-foreground">
          {user?.email || 'Account'}
        </p>
      </div>

      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
    </div>
  )
}

function PasswordField({
  id,
  label,
  value,
  visible,
  placeholder,
  onChange,
  onToggle,
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="pr-11"
          autoComplete={
            id === 'currentPass'
              ? 'current-password'
              : 'new-password'
          }
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-secondary hover:text-foreground"
          aria-label={
            visible ? `Hide ${label}` : `Show ${label}`
          }
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )
}

function PasswordStrength({ strength, checks }) {
  return (
    <div className="border border-border bg-surface-secondary/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold">
          Password strength
        </span>

        <span className="text-[11px] text-muted-foreground">
          {strength.label}
        </span>
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full bg-primary transition-all ${strength.width}`}
        />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <PasswordRule
          valid={checks.length}
          text="At least 8 characters"
        />
        <PasswordRule
          valid={checks.uppercase}
          text="One uppercase letter"
        />
        <PasswordRule
          valid={checks.lowercase}
          text="One lowercase letter"
        />
        <PasswordRule
          valid={checks.number}
          text="One number"
        />
        <PasswordRule
          valid={checks.match}
          text="Passwords match"
        />
      </div>
    </div>
  )
}

function PasswordRule({ valid, text }) {
  return (
    <div
      className={`flex items-center gap-2 text-[11px] ${
        valid
          ? 'text-success'
          : 'text-muted-foreground'
      }`}
    >
      <CheckCircle2
        className={`h-3.5 w-3.5 ${
          valid ? 'opacity-100' : 'opacity-40'
        }`}
      />
      {text}
    </div>
  )
}

function NotificationRow({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-5 px-5 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
          checked
            ? 'bg-primary'
            : 'bg-border-strong'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked
              ? 'translate-x-0.5'
              : '-translate-x-4'
          }`}
        />
      </button>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3.5 last:border-b-0">
      <div className="flex items-center gap-2.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>

      <div className="max-w-[170px] truncate text-right text-xs font-medium">
        {value}
      </div>
    </div>
  )
}

function SecurityItem({
  icon: Icon,
  title,
  description,
  status,
}) {
  return (
    <div className="flex gap-3 border-b border-border py-3.5 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
        <Icon className="h-3.5 w-3.5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold">
            {title}
          </p>

          <span className="text-[10px] font-semibold text-success">
            {status}
          </span>
        </div>

        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}

function getInitials(name) {
  if (!name) return 'DF'

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}