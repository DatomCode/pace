import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Mail, LogOut, Settings, Calendar } from 'lucide-react'

import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
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

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

// ── Section card wrapper ───────────────────────────────────────────────────────
function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <section className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="flex items-center justify-center size-8 rounded-lg bg-surface-overlay">
          <Icon className="size-4 text-text-muted" aria-hidden="true" />
        </div>
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
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
    <div className="page-container max-w-2xl">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Settings className="size-6 text-text-muted" aria-hidden="true" />
          Settings
        </h1>
        <p className="mt-1 text-sm text-text-muted">Manage your profile and preferences.</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* ── Profile section ───────────────────────────────────────────────── */}
        <SectionCard title="Profile" icon={User}>
          <form
            onSubmit={handleSubmit(onProfileSubmit)}
            noValidate
            className="flex flex-col gap-4"
          >
            <Input
              label="Full name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              error={errors.name?.message}
              disabled={isProfileSubmitting}
              {...register('name')}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              disabled={isProfileSubmitting}
              {...register('email')}
            />

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
                <span className="text-sm text-green-400 animate-fade-in">
                  Profile saved!
                </span>
              )}
            </div>
          </form>
        </SectionCard>

        {/* ── Preferences section ───────────────────────────────────────────── */}
        <SectionCard title="Preferences" icon={Settings}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Select
                label="Productivity focus"
                placeholder="Select a focus area..."
                value={preference}
                onValueChange={setPreference}
                options={PREFERENCE_OPTIONS}
                disabled={prefMutation.isPending}
              />

              {prefMutation.isError && (
                <p role="alert" className="text-sm text-red-400">
                  Failed to save preference. Please try again.
                </p>
              )}

              <div className="flex items-center gap-3">
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
                  <span className="text-sm text-green-400 animate-fade-in">
                    Preference saved!
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-6 border-t border-border-subtle">
              <Select
                label="App Theme"
                placeholder="Select a theme..."
                value={theme}
                onValueChange={(val) => setTheme(val as 'light' | 'dark')}
                options={THEME_OPTIONS}
              />
            </div>
          </div>
        </SectionCard>

        {/* ── Account section ───────────────────────────────────────────────── */}
        <SectionCard title="Account" icon={LogOut}>
          <div className="flex flex-col gap-5">
            {/* Join date */}
            {user?.date_joined && (
              <div
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-lg',
                  'bg-surface-overlay border border-border-subtle',
                )}
              >
                <Calendar className="size-4 text-text-muted shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-xs text-text-muted">Member since</p>
                  <p className="text-sm font-medium text-text-primary">
                    {formatDate(user.date_joined, 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {/* Email display */}
            {user?.email && (
              <div
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-lg',
                  'bg-surface-overlay border border-border-subtle',
                )}
              >
                <Mail className="size-4 text-text-muted shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-xs text-text-muted">Signed in as</p>
                  <p className="text-sm font-medium text-text-primary">{user.email}</p>
                </div>
              </div>
            )}

            {/* Logout */}
            <div className="pt-1">
              <Button
                type="button"
                variant="danger"
                size="md"
                isLoading={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="size-4" aria-hidden="true" />
                {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
