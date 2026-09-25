import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Sparkles, Check, X, RefreshCw } from 'lucide-react'
import { aiApi } from '@/api/ai'
import { tasksApi } from '@/api/tasks'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import type { AISuggestion, TaskPriority } from '@/types'

type SuggestionItem = Omit<AISuggestion, 'id'> & { id: string, selected: boolean }

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

  const selectedCount = suggestions.filter(s => s.selected).length

  return (
    <div className="page-container max-w-2xl mx-auto py-12">
      {stage === 'input' && (
        <div className="text-center space-y-8 animate-fade-in">
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-500/10 mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-3">AI Task Generator</h1>
            <p className="text-text-muted">Describe your goal and Pace will suggest tasks to get there.</p>
          </div>

          <div className="card p-4 text-left">
            <textarea
              className="w-full h-32 bg-transparent border-none resize-none focus:outline-none text-text-primary text-lg placeholder-text-disabled"
              placeholder="e.g. Build a task management application with React and Django..."
              value={goal}
              onChange={e => setGoal(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end pt-4 border-t border-border">
              <Button onClick={handleGenerate} disabled={!goal.trim()}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate tasks
              </Button>
            </div>
          </div>
        </div>
      )}

      {stage === 'loading' && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mb-6" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Thinking through your goal...</h2>
          <p className="text-text-muted">Breaking this down into actionable steps.</p>
        </div>
      )}

      {stage === 'error' && (
        <div className="text-center py-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-500/10 mb-4">
            <X className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">We couldn't generate suggestions right now.</h2>
          <p className="text-text-muted mb-8">Please try again or create your tasks manually.</p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/app/tasks')}>Create manually</Button>
            <Button onClick={() => generateMutation.mutate()}>Try again</Button>
          </div>
        </div>
      )}

      {stage === 'suggestions' && (
        <div className="animate-fade-in space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Review Suggestions</h1>
            <p className="text-text-muted line-clamp-2 px-8">Goal: {goal}</p>
          </div>

          <div className="card divide-y divide-border overflow-hidden">
            {suggestions.map((task) => (
              <div key={task.id} className={cn("p-4 transition-colors", task.selected ? "bg-surface" : "bg-surface-overlay/30 opacity-60")}>
                <div className="flex items-start gap-3">
                  <button 
                    className={cn(
                      "mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                      task.selected ? "bg-brand-500 border-brand-500" : "border-border-subtle hover:border-brand-500/50"
                    )}
                    onClick={() => updateSuggestion(task.id, { selected: !task.selected })}
                  >
                    {task.selected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                  <div className="flex-1 space-y-3">
                    <Input 
                      value={task.title}
                      onChange={(e) => updateSuggestion(task.id, { title: e.target.value })}
                      className={cn("font-medium", !task.selected && "line-through text-text-muted")}
                      disabled={!task.selected}
                    />
                    {task.selected && (
                      <div className="grid grid-cols-2 gap-3">
                        <Select
                          value={task.priority}
                          onValueChange={(v) => updateSuggestion(task.id, { priority: v as TaskPriority })}
                          options={[
                            { value: 'low', label: 'Low' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'high', label: 'High' },
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
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between card p-4 sticky bottom-6 shadow-strong">
            <div>
              <div className="text-sm font-medium text-text-primary">{selectedCount} of {suggestions.length} selected</div>
              <button onClick={() => setStage('input')} className="text-xs text-text-muted hover:text-text-primary transition-colors">Start over</button>
            </div>
            <Button 
              onClick={handleConfirm} 
              disabled={selectedCount === 0}
              isLoading={isCreating}
            >
              <Check className="w-4 h-4 mr-2" />
              Create {selectedCount} tasks
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
