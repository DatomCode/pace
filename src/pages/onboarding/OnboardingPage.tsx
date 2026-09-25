import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  GraduationCap,
  Lightbulb,
  BookOpen,
  LayoutGrid,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'

import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

// ── Purpose options ────────────────────────────────────────────────────────────
interface PurposeOption {
  id: string
  label: string
  description: string
  icon: React.ComponentType<LucideProps>
}

const PURPOSE_OPTIONS: PurposeOption[] = [
  {
    id: 'work',
    label: 'Work',
    description: 'Professional tasks, projects and meetings',
    icon: Briefcase,
  },
  {
    id: 'school',
    label: 'School',
    description: 'Assignments, exams and study sessions',
    icon: GraduationCap,
  },
  {
    id: 'personal_projects',
    label: 'Personal Projects',
    description: 'Side projects, creative work and hobbies',
    icon: Lightbulb,
  },
  {
    id: 'learning',
    label: 'Learning',
    description: 'Courses, books and skill building',
    icon: BookOpen,
  },
  {
    id: 'general_productivity',
    label: 'General Productivity',
    description: 'Mixed tasks across all areas of life',
    icon: LayoutGrid,
  },
]

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full transition-all duration-300',
            i === current - 1
              ? 'w-6 h-2 bg-brand-500'
              : 'w-2 h-2 bg-surface-overlay border border-border',
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  const [step, setStep] = useState<1 | 2>(1)
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null)
  const [goal, setGoal] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleComplete = async (skip = false) => {
    if (!selectedPurpose) return
    setIsSubmitting(true)
    setError(null)
    try {
      const updatedUser = await authApi.completeOnboarding({
        purpose: selectedPurpose,
        initial_goal: skip ? undefined : goal.trim() || undefined,
      })
      setUser(updatedUser)
      navigate('/app/dashboard', { replace: true })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden bg-bg flex items-center justify-center p-4">
      {/* Background orb */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-5 pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(ellipse, #6366f1 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center size-9 rounded-xl gradient-brand shadow-brand">
            <span className="text-white font-bold text-lg leading-none">P</span>
          </div>
          <span className="text-lg font-bold text-text-primary">Pace</span>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-medium">
          {/* Step dots */}
          <div className="flex items-center justify-between mb-7">
            <StepDots current={step} total={2} />
            <span className="text-xs text-text-disabled">
              {step} / 2
            </span>
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h1 className="text-xl font-bold text-text-primary mb-1">
                What do you mainly want to use Pace for?
              </h1>
              <p className="text-sm text-text-muted mb-6">
                This helps us personalise your experience. You can change it later.
              </p>

              <div className="grid grid-cols-1 gap-3" role="listbox" aria-label="Select a purpose">
                {PURPOSE_OPTIONS.map((option) => {
                  const Icon = option.icon
                  const isSelected = selectedPurpose === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => setSelectedPurpose(option.id)}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl border text-left',
                        'transition-all duration-150 cursor-pointer select-none',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                        isSelected
                          ? 'bg-brand-500/10 border-brand-500/50 shadow-brand/10'
                          : 'bg-surface-overlay border-border hover:border-brand-500/30 hover:bg-brand-500/5',
                      )}
                    >
                      <div
                        className={cn(
                          'flex items-center justify-center size-10 rounded-lg shrink-0 transition-colors',
                          isSelected
                            ? 'bg-brand-500/20 text-brand-400'
                            : 'bg-surface-elevated text-text-muted',
                        )}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            'text-sm font-semibold transition-colors',
                            isSelected ? 'text-brand-400' : 'text-text-primary',
                          )}
                        >
                          {option.label}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="ml-auto shrink-0">
                          <div className="size-2 rounded-full bg-brand-500" aria-hidden="true" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <Button
                type="button"
                variant="primary"
                size="lg"
                disabled={!selectedPurpose}
                className="mt-6 w-full"
                onClick={() => setStep(2)}
              >
                Continue
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="animate-fade-in">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors mb-6"
                aria-label="Back to step 1"
              >
                <ChevronLeft className="size-3.5" aria-hidden="true" />
                Back
              </button>

              <h1 className="text-xl font-bold text-text-primary mb-1">
                What do you want to accomplish today?
              </h1>
              <p className="text-sm text-text-muted mb-6">
                Add an optional goal for today. You can skip this for now.
              </p>

              <Input
                label="Today's goal (optional)"
                type="text"
                placeholder="e.g. Finish the project report and review emails"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                disabled={isSubmitting}
              />

              {error && (
                <p role="alert" className="mt-3 text-sm text-red-400">
                  {error}
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  className="flex-1"
                  onClick={() => handleComplete(true)}
                >
                  Skip for now
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  className="flex-1"
                  onClick={() => handleComplete(false)}
                >
                  {isSubmitting ? 'Setting up…' : 'Get started'}
                  {!isSubmitting && <ArrowRight className="size-4" aria-hidden="true" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
