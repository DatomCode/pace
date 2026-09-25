import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react'

import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// ── Validation schema ──────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long'),
    password_confirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

// ── Feature highlights for the left panel ─────────────────────────────────────
const FEATURES = [
  'Capture tasks with priorities and deadlines',
  'Schedule focused time blocks on a daily view',
  'Receive AI-generated weekly summaries',
  'Track completion rates over time',
]

// ── Component ──────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate()
  const { setTokens, setUser } = useAuthStore()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', password_confirm: '' },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null)
    try {
      const { user, tokens } = await authApi.register({
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirm: values.password_confirm,
      })
      setTokens(tokens.access, tokens.refresh)
      setUser(user)
      navigate('/onboarding', { replace: true })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setServerError(message)
    }
  }

  return (
    <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden flex">
      {/* ── Left panel: branding ───────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-surface flex-col justify-between p-12 relative overflow-hidden">
        {/* Background orbs */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
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

        {/* Tagline + features */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-text-primary leading-tight mb-4 text-balance">
            Start building better<br />habits today.
          </h1>
          <p className="text-text-muted text-lg leading-relaxed max-w-sm">
            Join Pace and take control of your time with clarity, focus, and weekly insight.
          </p>

          <ul className="mt-10 flex flex-col gap-4" aria-label="Features">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-green-400 shrink-0" aria-hidden="true" />
                <span className="text-sm text-text-secondary">{feature}</span>
              </li>
            ))}
          </ul>
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
            <h2 className="text-2xl font-bold text-text-primary">Create your account</h2>
            <p className="mt-1 text-sm text-text-muted">
              It's free to get started — no credit card needed.
            </p>
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

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <Input
              label="Full name"
              type="text"
              placeholder="Jane Smith"
              autoComplete="name"
              leftIcon={<User className="size-4" />}
              error={errors.name?.message}
              disabled={isSubmitting}
              {...register('name')}
            />

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
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              leftIcon={<Lock className="size-4" />}
              error={errors.password?.message}
              disabled={isSubmitting}
              {...register('password')}
            />

            <Input
              label="Confirm password"
              type="password"
              placeholder="Repeat your password"
              autoComplete="new-password"
              leftIcon={<Lock className="size-4" />}
              error={errors.password_confirm?.message}
              disabled={isSubmitting}
              {...register('password_confirm')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="mt-2 w-full"
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
              {!isSubmitting && <ArrowRight className="size-4" aria-hidden="true" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-brand-400 hover:text-brand-300 transition-colors"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-5 text-xs text-text-disabled text-center leading-relaxed">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
