import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Mail, Lock, ArrowRight } from 'lucide-react'

import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

// ── Validation schema ──────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

// ── Stage steps displayed on the left panel ────────────────────────────────────
const STAGES = [
  { label: 'Plan', description: 'Capture tasks & set priorities' },
  { label: 'Schedule', description: 'Block time for focused work' },
  { label: 'Execute', description: 'Work through your list' },
  { label: 'Review', description: 'Reflect and improve weekly' },
]

// ── Component ──────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const { setTokens, setUser } = useAuthStore()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)
    try {
      const { user, tokens } = await authApi.login({
        email: values.email,
        password: values.password,
      })
      setTokens(tokens.access, tokens.refresh)
      setUser(user)
      navigate('/app/dashboard', { replace: true })
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Invalid email or password. Please try again.'
      setServerError(message)
    }
  }

  return (
    <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden flex">
      {/* ── Left panel: branding ───────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-surface flex-col justify-between p-12 relative overflow-hidden">
        {/* Background gradient orb */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center justify-center size-10 rounded-xl gradient-brand shadow-brand">
            <span className="text-white font-bold text-xl leading-none">P</span>
          </div>
          <span className="text-xl font-bold text-text-primary tracking-tight">Pace</span>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-text-primary leading-tight mb-4 text-balance">
            Your personal productivity<br />command center.
          </h1>
          <p className="text-text-muted text-lg leading-relaxed max-w-sm">
            Plan your work, stick to your schedule, and see real progress every week.
          </p>

          {/* Stage steps */}
          <ol className="mt-10 flex flex-col gap-5" aria-label="Pace workflow stages">
            {STAGES.map((stage, index) => (
              <li key={stage.label} className="flex items-start gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={cn(
                      'flex items-center justify-center size-7 rounded-full text-xs font-bold',
                      'bg-brand-500/15 text-brand-400 border border-brand-500/30',
                    )}
                  >
                    {index + 1}
                  </div>
                  {index < STAGES.length - 1 && (
                    <div className="w-px h-5 bg-border-subtle mt-1" aria-hidden="true" />
                  )}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-semibold text-text-primary">{stage.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{stage.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Footer */}
        <p className="text-xs text-text-disabled relative z-10">
          © {new Date().getFullYear()} Pace. All rights reserved.
        </p>
      </div>

      {/* ── Right panel: form ──────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex items-center justify-center size-8 rounded-lg gradient-brand">
              <span className="text-white font-bold text-base leading-none">P</span>
            </div>
            <span className="text-lg font-bold text-text-primary">Pace</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary">Welcome back</h2>
            <p className="mt-1 text-sm text-text-muted">Sign in to your account to continue.</p>
          </div>

          {/* Error banner */}
          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-3 mb-6 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400"
            >
              <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              leftIcon={<Mail className="size-4" />}
              error={errors.email?.message}
              disabled={isSubmitting}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              leftIcon={<Lock className="size-4" />}
              error={errors.password?.message}
              disabled={isSubmitting}
              {...register('password')}
            />

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                id="rememberMe"
                type="checkbox"
                className="size-4 rounded border-border bg-surface-overlay accent-brand-500 cursor-pointer"
                {...register('rememberMe')}
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-text-secondary cursor-pointer select-none"
              >
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="mt-1 w-full"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
              {!isSubmitting && <ArrowRight className="size-4" aria-hidden="true" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-brand-400 hover:text-brand-300 transition-colors"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
