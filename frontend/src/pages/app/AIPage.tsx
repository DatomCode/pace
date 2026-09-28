import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Sparkles, Check, X, RefreshCw, Trash2 } from 'lucide-react'
import { aiApi } from '@/api/ai'
import { tasksApi } from '@/api/tasks'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import type { AISuggestion, TaskPriority } from '@/types'

type SuggestionItem = Omit<AISuggestion, 'id'> & { id: string, selected: boolean }

// Priority badge styling
const PRIORITY_CONFIG: Record<TaskPriority, { label: string; bg: string; text: string }> = {
  urgent: { label: 'U', bg: 'bg-red-500', text: 'text-white' },
  high:   { label: 'H', bg: 'bg-amber-500', text: 'text-white' },
  medium: { label: 'M', bg: 'bg-brand-500', text: 'text-white' },
  low:    { label: 'L', bg: 'bg-gray-400', text: 'text-white' },
}

export default function AIPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [goal, setGoal] = useState('')
  const [stage, setStage] = useState<'input' | 'loading' | 'suggestions' | 'error'>('input')
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  
  const [isCreating, setIsCreating] = useState(false)

  const generateMutation = useMutation({
    mutationFn: () => aiApi.generateTasks({ goal }),
    onMutate: () => setStage('loading'),
    onSuccess: (data) => {
      setSuggestions(
        data.suggestions.map((s, i) => ({
          ...s,
          id: `temp-${i}`,
          selected: true
        }))
      )
      setStage('suggestions')
    },
    onError: () => setStage('error')
  })

  const createTasksMutation = useMutation({
    mutationFn: async (tasksToCreate: SuggestionItem[]) => {
      setIsCreating(true)
      for (const task of tasksToCreate) {
        await tasksApi.create({
          title: task.title,
          description: task.description,
          priority: task.priority,
          estimated_duration: task.estimated_duration,
          category: task.category,
          status: 'todo',
          due_date: new Date().toISOString().split('T')[0], // Default due date to today
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      navigate('/app/tasks')
    },
    onSettled: () => setIsCreating(false)
  })

  const handleGenerate = () => {
    if (!goal.trim()) return
    generateMutation.mutate()
  }

  const handleConfirm = () => {
    const selected = suggestions.filter(s => s.selected)
    if (selected.length === 0) return
    createTasksMutation.mutate(selected)
  }

  const updateSuggestion = (id: string, updates: Partial<SuggestionItem>) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const removeSuggestion = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id))
  }

  const selectedCount = suggestions.filter(s => s.selected).length

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">

      {/* ── Stage 0: Goal Input ── */}
      {stage === 'input' && (
        <div className="space-y-6 animate-fade-in">
          {/* Gradient hero header */}
          <div
            className="relative rounded-3xl p-7 overflow-hidden text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)' }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">AI Task Generator</h1>
              <p className="text-white/80 text-sm leading-relaxed">
                Describe your goal and Pace will break it down into clear, actionable tasks for you.
              </p>
            </div>
          </div>

          {/* Goal textarea card */}
          <div className="rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border shadow-sm p-4">
            <label className="block text-sm font-bold text-text-primary mb-2">What do you want to achieve?</label>
            <textarea
              className="w-full h-36 bg-transparent border border-gray-100 dark:border-border rounded-2xl resize-none p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-text-primary text-base placeholder-text-disabled transition-all"
              placeholder="e.g. Build a task management application with React and Django..."
              value={goal}
              onChange={e => setGoal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleGenerate() }}
              autoFocus
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-text-disabled">Press ⌘↵ to generate</span>
              <button
                onClick={handleGenerate}
                disabled={!goal.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
              >
                <Sparkles className="w-4 h-4" />
                Generate tasks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stage 1: Loading ── */}
      {stage === 'loading' && (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-5 animate-fade-in">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-full border-4 border-transparent animate-spin"
              style={{ borderTopColor: '#6366f1', borderRightColor: '#8b5cf6' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-brand-500" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-1">Thinking through your goal...</h2>
            <p className="text-text-muted text-sm italic">Breaking this down into actionable steps.</p>
          </div>
        </div>
      )}

      {/* ── Stage Error ── */}
      {stage === 'error' && (
        <div className="animate-fade-in space-y-4">
          <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-6 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
              <X className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-1">Couldn't generate suggestions</h2>
              <p className="text-sm text-text-muted">Something went wrong. Please try again or create your tasks manually.</p>
            </div>
            <div className="flex gap-3">
              <button
                className="px-4 py-2 rounded-2xl border border-gray-200 dark:border-border text-sm font-semibold text-text-muted hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                onClick={() => navigate('/app/tasks')}
              >
                Create manually
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                onClick={() => generateMutation.mutate()}
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stage 2 & 3: Suggestions ── */}
      {stage === 'suggestions' && (
        <div className="animate-fade-in space-y-5">
          {/* Sub-header */}
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} for:
            </h1>
            <p className="text-sm text-text-muted line-clamp-2 mt-0.5 italic">"{goal}"</p>
          </div>

          {/* Suggestion cards */}
          <div className="space-y-3">
            {suggestions.map((task) => {
              const pCfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium
              return (
                <div
                  key={task.id}
                  className={cn(
                    'rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border shadow-sm p-4 transition-all',
                    !task.selected && 'opacity-50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Toggle checkbox */}
                    <button
                      className={cn(
                        'mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all',
                        task.selected
                          ? 'bg-brand-500 border-brand-500'
                          : 'border-gray-300 dark:border-border hover:border-brand-500/60'
                      )}
                      onClick={() => updateSuggestion(task.id, { selected: !task.selected })}
                    >
                      {task.selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </button>

                    {/* Priority badge */}
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0',
                      pCfg.bg, pCfg.text
                    )}>
                      {pCfg.label}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      {/* Inline-editable title */}
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => updateSuggestion(task.id, { title: e.target.value })}
                        disabled={!task.selected}
                        className={cn(
                          'w-full bg-transparent text-sm font-semibold text-text-primary focus:outline-none border-b border-transparent focus:border-brand-500/40 pb-0.5 transition-colors',
                          !task.selected && 'line-through text-text-muted'
                        )}
                      />

                      {task.selected && (
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={task.priority}
                            onValueChange={(v) => updateSuggestion(task.id, { priority: v as TaskPriority })}
                            options={[
                              { value: 'low', label: 'Low priority' },
                              { value: 'medium', label: 'Medium priority' },
                              { value: 'high', label: 'High priority' },
                              { value: 'urgent', label: 'Urgent' },
                            ]}
                          />
                          <Input
                            type="number"
                            placeholder="Duration (min)"
                            value={task.estimated_duration || ''}
                            onChange={(e) => updateSuggestion(task.id, { estimated_duration: parseInt(e.target.value) || undefined })}
                          />
                        </div>
                      )}

                      {/* Duration chip when collapsed */}
                      {!task.selected && task.estimated_duration && (
                        <span className="text-xs text-text-disabled">{task.estimated_duration} min</span>
                      )}
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeSuggestion(task.id)}
                      className="mt-0.5 p-1.5 rounded-lg text-text-disabled hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shrink-0"
                      aria-label="Remove suggestion"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Stage 3: Confirm footer */}
          <div className="rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border shadow-sm p-4 flex items-center justify-between gap-4 sticky bottom-24">
            <div>
              <p className="text-sm font-bold text-text-primary">
                {selectedCount} of {suggestions.length} selected
              </p>
              <button
                onClick={() => setStage('input')}
                className="text-xs text-text-muted hover:text-text-primary transition-colors mt-0.5"
              >
                ← Start over
              </button>
            </div>
            <button
              onClick={handleConfirm}
              disabled={selectedCount === 0 || isCreating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
            >
              {isCreating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create {selectedCount} Task{selectedCount !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
