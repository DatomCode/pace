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
import { cn } from '@/lib/utils'

// â”€â”€ Validation schema â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Stage steps displayed on the left panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STAGES = [
  { label: 'Plan', description: 'Capture tasks & set priorities' },
  { label: 'Schedule', description: 'Block time for focused work' },
  { label: 'Execute', description: 'Work through your list' },
  { label: 'Review', description: 'Reflect and improve weekly' },
]


// â”€â”€ Feature highlights for the left panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FEATURES = [
  'Capture tasks with priorities and deadlines',
  'Schedule focused time blocks on a daily view',
  'Receive AI-generated weekly summaries',
  'Track completion rates over time',
]

// â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      navigate('/app/onboarding', { replace: true })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setServerError(message)
    }
  }

  return (
    <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden flex">
      {/* â”€â”€ Left panel: branding â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-surface flex-col justify-between p-12 relative overflow-hidden">
        {/* Background illustration */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/auth_illustration.jpg" 
            alt="Productivity Illustration" 
            className="w-full h-full object-cover opacity-60 dark:opacity-30 mix-blend-multiply dark:mix-blend-lighten"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 relative z-10 hover:opacity-80 transition-opacity"><div className="flex items-center justify-center size-10 rounded-xl gradient-brand shadow-brand"><span className="text-white font-bold text-xl leading-none">P</span></div><span className="text-xl font-bold text-text-primary tracking-tight bg-surface/50 px-2 py-1 rounded-md backdrop-blur-sm">Pace</span></Link>

        {/* Tagline */}
        <div className="relative z-10 bg-surface/50 backdrop-blur-md p-8 rounded-2xl border border-border shadow-soft max-w-lg">
          <h1 className="text-4xl font-bold text-text-primary leading-tight mb-4 text-balance">
            Your personal productivity<br />command center.
          </h1>
          <p className="text-text-muted text-lg leading-relaxed mb-8">
            Plan your work, stick to your schedule, and see real progress every week.
          </p>

          {/* Stage steps */}
          <ol className="flex flex-col gap-4" aria-label="Pace workflow stages">
            {STAGES.map((stage, index) => (
              <li key={stage.label} className="flex items-start gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={cn(
                      'flex items-center justify-center size-7 rounded-full text-xs font-bold',
                      'bg-brand-500/15 text-brand-500 border border-brand-500/30'
                    )}
                  >
                    {index + 1}
                  </div>
                  {index < STAGES.length - 1 && (
                    <div className="w-px h-5 bg-border mt-2" aria-hidden="true" />
                  )}
                </div>
                <div className="pt-0.5">
                  <h3 className="text-sm font-bold text-text-primary">{stage.label}</h3>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{stage.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* â”€â”€ Right panel: form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
              It's free to get started â€” no credit card needed.
            </p>
          </div>

          
          {/* Google Sign In */}
          <button
            type="button"
            onClick={() => alert('Google OAuth would initiate here!')}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-border rounded-xl bg-surface hover:bg-surface-overlay transition-all text-sm font-semibold text-text-primary shadow-sm mt-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Or email</span>
            <div className="h-px bg-border flex-1" />
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
              {isSubmitting ? 'Creating accountâ€¦' : 'Create account'}
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
