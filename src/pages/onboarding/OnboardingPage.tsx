import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  GraduationCap,
  Lightbulb,
  ArrowRight,
  ChevronLeft,
  Sun,
  Moon,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'

import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface OptionCard {
  id: string
  label: string
  description: string
  icon: React.ComponentType<LucideProps>
}

const ROLE_OPTIONS: OptionCard[] = [
  { id: 'work', label: 'Work / Professional', description: 'Manage projects, tasks and meetings', icon: Briefcase },
  { id: 'school', label: 'Student', description: 'Organize assignments and studying', icon: GraduationCap },
  { id: 'personal', label: 'Personal Use', description: 'Everyday hobbies and daily life', icon: Lightbulb },
]

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            current === i ? 'w-6 bg-brand-500' : 'w-2 bg-border'
          )}
        />
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  
  const [step, setStep] = useState(0) // 0: Welcome, 1: Theme, 2: Role, 3: Goal
  
  // State for form
  const [selectedRole, setSelectedRole] = useState(user?.productivity_preference || '')
  const [goal, setGoal] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNext = () => setStep((s) => s + 1)
  const handleBack = () => setStep((s) => s - 1)

  const handleComplete = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      const updatedUser = await authApi.completeOnboarding({
        purpose: selectedRole,
        initial_goal: goal,
      })
      setUser(updatedUser)
      navigate('/app/dashboard', { replace: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setError(message)
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="animate-fade-in flex flex-col items-center text-center h-full justify-center">
            <div className="w-full h-48 bg-surface-overlay rounded-2xl mb-8 overflow-hidden">
              <img src="/assets/onboarding_welcome.jpg" alt="Welcome to Pace" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-3">Welcome to Pace!</h1>
            <p className="text-text-muted mb-8 max-w-xs leading-relaxed mx-auto">
              We're thrilled to have you here. Let's take a quick moment to set up your workspace.
            </p>
            <Button size="lg" className="w-full mt-auto" onClick={handleNext}>
              Let's get started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )
      case 1:
        return (
          <div className="animate-fade-in flex flex-col h-full">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Choose your theme</h1>
            <p className="text-text-muted mb-8">You can always change this later in settings.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  "flex flex-col items-center p-6 rounded-2xl border-2 transition-all",
                  theme === 'light' ? "border-brand-500 bg-brand-500/5" : "border-border bg-surface hover:border-brand-500/30"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mb-4">
                  <Sun className="w-6 h-6" />
                </div>
                <span className="font-semibold text-text-primary">Light Mode</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  "flex flex-col items-center p-6 rounded-2xl border-2 transition-all",
                  theme === 'dark' ? "border-brand-500 bg-brand-500/5" : "border-border bg-surface hover:border-brand-500/30"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-indigo-900 text-indigo-400 flex items-center justify-center mb-4">
                  <Moon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-text-primary">Dark Mode</span>
              </button>
            </div>

            <div className="mt-auto flex gap-3 pt-4">
              <Button variant="secondary" onClick={handleBack} className="px-3">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button size="lg" className="flex-1" onClick={handleNext}>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="animate-fade-in flex flex-col h-full">
            <h1 className="text-2xl font-bold text-text-primary mb-2">How will you use Pace?</h1>
            <p className="text-text-muted mb-8">We'll tailor your experience based on your focus.</p>

            <div className="grid gap-3 mb-8">
              {ROLE_OPTIONS.map((option) => {
                const Icon = option.icon
                const isSelected = selectedRole === option.id
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedRole(option.id)}
                    className={cn(
                      'flex items-center p-4 rounded-xl border-2 text-left transition-all',
                      isSelected
                        ? 'border-brand-500 bg-brand-500/5'
                        : 'border-border bg-surface hover:border-brand-500/30'
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-lg mr-4 transition-colors",
                      isSelected ? "bg-brand-500 text-white" : "bg-surface-overlay text-text-muted"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-text-primary">{option.label}</div>
                      <div className="text-xs text-text-muted">{option.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-auto flex gap-3 pt-4">
              <Button variant="secondary" onClick={handleBack} className="px-3">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                className="flex-1" 
                onClick={handleNext}
                disabled={!selectedRole}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="animate-fade-in flex flex-col h-full">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Set your first goal</h1>
            <p className="text-text-muted mb-8">What's one thing you want to accomplish today?</p>

            <div className="mb-8">
              <Input
                label="Today's Goal"
                placeholder="e.g. Finish the marketing report..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="mt-auto flex gap-3 pt-4">
              <Button variant="secondary" onClick={handleBack} className="px-3" disabled={isSubmitting}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                className="flex-1" 
                onClick={handleComplete}
                isLoading={isSubmitting}
              >
                {goal.trim() ? 'Complete Setup' : 'Skip for now'}
              </Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden bg-bg flex flex-col items-center justify-center p-4">
      {/* Background orb */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-5 pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(ellipse, #6366f1 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center size-9 rounded-xl gradient-brand shadow-brand">
            <span className="text-white font-bold text-lg leading-none">P</span>
          </div>
          <span className="text-lg font-bold text-text-primary">Pace</span>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-3xl p-8 shadow-strong min-h-[500px] flex flex-col">
          {/* Step dots */}
          {step > 0 && (
            <div className="flex items-center justify-between mb-8">
              <StepDots current={step - 1} total={3} />
              <span className="text-xs font-semibold text-text-disabled uppercase tracking-wider">
                Step {step} of 3
              </span>
            </div>
          )}

          {renderStepContent()}
        </div>
      </div>
    </div>
  )
}
