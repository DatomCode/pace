import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Sun, Moon, LogOut, Calendar, Mail, CheckCircle2 } from 'lucide-react'

import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { Button } from '@/components/ui/Button'
import { cn, formatDate } from '@/lib/utils'

// ── Schemas ────────────────────────────────────────────────────────────────────
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

// ── Preference options ─────────────────────────────────────────────────────────
const PREFERENCE_OPTIONS = [
  { value: 'work', label: 'Work' },
  { value: 'school', label: 'School' },
  { value: 'personal_projects', label: 'Personal Projects' },
  { value: 'learning', label: 'Learning' },
  { value: 'general_productivity', label: 'General Productivity' },
]

// ── Section card wrapper ───────────────────────────────────────────────────────
function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border shadow-sm p-5">
      <h2 className="text-base font-bold text-text-primary mb-4">{title}</h2>
      {children}
    </section>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user, setUser, logout } = useAuthStore()
  const { theme, setTheme } = useThemeStore()

  const [preference, setPreference] = useState<string>(
    user?.productivity_preference ?? '',
  )
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [prefSuccess, setPrefSuccess] = useState(false)

  // ── Profile form ──────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isProfileSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
    },
  })

  const profileMutation = useMutation({
    mutationFn: (payload: ProfileFormValues) => authApi.updateProfile(payload),
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    },
  })

  const onProfileSubmit = (values: ProfileFormValues) => {
    profileMutation.mutate(values)
  }

  // ── Preference mutation ───────────────────────────────────────────────────
  const prefMutation = useMutation({
    mutationFn: (pref: string) =>
      authApi.updateProfile({ productivity_preference: pref }),
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      setPrefSuccess(true)
      setTimeout(() => setPrefSuccess(false), 3000)
    },
  })

  const handleSavePreference = () => {
    if (!preference) return
    prefMutation.mutate(preference)
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      logout()
      qc.clear()
      navigate('/login', { replace: true })
    },
  })

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-28">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">Manage your profile and preferences.</p>
      </div>

      {/* ── Profile section ───────────────────────────────────────────────── */}
      <SectionCard title="Profile">
        <form onSubmit={handleSubmit(onProfileSubmit)} noValidate className="flex flex-col gap-4">
          {/* Name field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-primary">Full name</label>
            <input
              type="text"
              placeholder="Your name"
              autoComplete="name"
              disabled={isProfileSubmitting}
              className={cn(
                'rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-surface',
                'focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:outline-none',
                'px-4 py-3 text-sm text-text-primary placeholder:text-text-muted',
                'disabled:opacity-50',
              )}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-primary">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isProfileSubmitting}
              className={cn(
                'rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-surface',
                'focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:outline-none',
                'px-4 py-3 text-sm text-text-primary placeholder:text-text-muted',
                'disabled:opacity-50',
              )}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {profileMutation.isError && (
            <p role="alert" className="text-sm text-red-400">
              Failed to save profile. Please try again.
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isProfileSubmitting}
              disabled={!isDirty || isProfileSubmitting}
            >
              Save profile
            </Button>

            {profileSuccess && (
              <span className="flex items-center gap-1 text-sm text-emerald-500 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                Saved!
              </span>
            )}
          </div>
        </form>
      </SectionCard>

      {/* ── Preferences section ───────────────────────────────────────────── */}
      <SectionCard title="Preferences">
        <div className="flex flex-col gap-6">
          {/* Theme toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-primary">App Theme</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value as 'light' | 'dark')}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition-all',
                    theme === value
                      ? 'border-brand-500 bg-brand-500/5 text-brand-500'
                      : 'border-gray-100 dark:border-border bg-surface-overlay text-text-muted hover:border-brand-500/40',
                  )}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Productivity focus */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-primary">Productivity Focus</label>
            <div className="flex flex-wrap gap-2">
              {PREFERENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPreference(opt.value)}
                  disabled={prefMutation.isPending}
                  className={cn(
                    'rounded-2xl px-4 py-2 text-sm font-semibold transition-all',
                    preference === opt.value
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-surface-overlay text-text-muted hover:bg-surface-overlay/80',
                    'disabled:opacity-50',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {prefMutation.isError && (
              <p role="alert" className="text-sm text-red-400">
                Failed to save preference. Please try again.
              </p>
            )}

            <div className="flex items-center gap-3 mt-1">
              <Button
                type="button"
                variant="primary"
                size="md"
                isLoading={prefMutation.isPending}
                disabled={!preference || prefMutation.isPending}
                onClick={handleSavePreference}
              >
                Save preference
              </Button>

              {prefSuccess && (
                <span className="flex items-center gap-1 text-sm text-emerald-500 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  Saved!
                </span>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Account section ───────────────────────────────────────────────── */}
      <SectionCard title="Account">
        <div className="flex flex-col gap-4">
          {/* Signed in as */}
          {user?.email && (
            <div className="flex items-center gap-3 rounded-xl bg-surface-overlay p-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-brand-400" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-text-muted">Signed in as</p>
                <p className="text-sm font-semibold text-text-primary">{user.email}</p>
              </div>
            </div>
          )}

          {/* Join date */}
          {user?.date_joined && (
            <div className="flex items-center gap-3 rounded-xl bg-surface-overlay p-3">
              <div className="w-8 h-8 rounded-lg bg-surface-overlay border border-border flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-text-muted" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-text-muted">Member since</p>
                <p className="text-sm font-semibold text-text-primary">
                  {formatDate(user.date_joined, 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            type="button"
            disabled={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-red-500 text-red-500',
              'hover:bg-red-50 dark:hover:bg-red-500/10 font-bold px-5 py-2.5 transition-colors',
              'disabled:opacity-50',
            )}
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </SectionCard>
    </div>
  )
}
