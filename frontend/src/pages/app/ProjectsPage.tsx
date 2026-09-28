import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus, Edit2, Trash2, FolderOpen, CheckCircle2,
} from 'lucide-react'
import { projectsApi } from '@/api/projects'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { CardSkeleton } from '@/components/ui/SkeletonLoader'
import { cn } from '@/lib/utils'
import { normaliseError } from '@/api/client'
import { Link } from 'react-router-dom'
import type { Project } from '@/types'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7']

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  color: z.string().optional(),
})
type ProjectFormData = z.infer<typeof projectSchema>

// ── DonutProgress ────────────────────────────────────────────────────────────
function DonutProgress({
  value,
  color,
  size = 56,
}: {
  value: number
  color: string
  size?: number
}) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={5}
        className="text-gray-100 dark:text-white/10"
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  )
}

// ── ProjectCard ───────────────────────────────────────────────────────────────
function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project
  onEdit: (p: Project) => void
  onDelete: (p: Project) => void
}) {
  const completionPct = project.task_count > 0
    ? Math.round((project.completed_task_count / project.task_count) * 100)
    : 0
  const remaining = project.task_count - project.completed_task_count
  const color = project.color ?? '#6366f1'

  // Derive a single-letter initial for the icon square
  const initial = project.name.charAt(0).toUpperCase()

  return (
    <div className="rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border shadow-sm hover:shadow-md transition-all p-5 group">
      <div className="flex items-center gap-3">
        {/* Colored icon square */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-base shrink-0"
          style={{ backgroundColor: color }}
        >
          {initial}
        </div>

        {/* Text info */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/app/projects/${project.id}`}
            className="font-bold text-text-primary hover:text-brand-500 transition-colors block truncate"
          >
            {project.name}
          </Link>
          {project.description && (
            <p className="text-xs text-text-muted truncate mt-0.5">{project.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-text-muted">
              {project.completed_task_count}/{project.task_count} tasks
            </span>
            {remaining === 0 && project.task_count > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Done!
              </span>
            )}
          </div>
        </div>

        {/* Right: donut + actions */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          {/* Donut */}
          <div className="relative">
            <DonutProgress value={completionPct} color={color} size={52} />
            <span
              className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
              style={{ color }}
            >
              {completionPct}%
            </span>
          </div>
          {/* Edit/Delete actions — visible on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(project)}
              className="p-1 rounded-lg text-text-muted hover:text-brand-500 hover:bg-brand-500/10 transition-colors"
              aria-label="Edit project"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(project)}
              className="p-1 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
              aria-label="Delete project"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ProjectFormModal ──────────────────────────────────────────────────────────
function ProjectFormModal({
  open,
  onClose,
  project,
}: {
  open: boolean
  onClose: () => void
  project?: Project | null
}) {
  const queryClient = useQueryClient()
  const [apiError, setApiError] = useState<string | null>(null)
  const isEdit = !!project

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? { name: project.name, description: project.description ?? '', color: project.color ?? COLORS[0] }
      : { name: '', description: '', color: COLORS[0] },
  })

  const selectedColor = watch('color')

  const mutation = useMutation({
    mutationFn: (data: ProjectFormData) =>
      isEdit ? projectsApi.update(project!.id, data) : projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      onClose()
      reset()
    },
    onError: (err) => setApiError(normaliseError(err).message),
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit project' : 'New project'}
      size="sm"
    >
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        {apiError && (
          <div className="px-3 py-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {apiError}
          </div>
        )}

        <Input
          label="Project name"
          placeholder="e.g. Newsletter API"
          error={errors.name?.message}
          autoFocus
          {...register('name')}
        />

        <div>
          <label className="block text-sm text-text-muted mb-1.5">Description (optional)</label>
          <textarea
            className="w-full px-3 py-2.5 rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-surface text-text-primary text-sm placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none transition-all"
            rows={2}
            placeholder="What is this project about?"
            {...register('description')}
          />
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-2">Color</label>
          <div className="flex gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className={cn(
                  'w-7 h-7 rounded-full border-2 transition-all',
                  selectedColor === color
                    ? 'border-white scale-110 shadow-md'
                    : 'border-transparent opacity-60 hover:opacity-100'
                )}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending} className="flex-1">
            {isEdit ? 'Save changes' : 'Create project'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ── ProjectsPage ──────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  })

  const projects = data?.results ?? []

  const deleteMutation = useMutation({
    mutationFn: () => projectsApi.delete(deleteProject!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setDeleteProject(null)
    },
    onError: (err) => setDeleteError(normaliseError(err).message),
  })

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
          {projects.length > 0 && (
            <p className="text-sm text-text-muted mt-1">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && projects.length === 0 && (
          <EmptyState
            icon={FolderOpen}
            title="No projects yet"
            description="Projects help you group related tasks and track progress on larger goals."
            action={{ label: 'Create project', onClick: () => setCreateOpen(true) }}
          />
        )}

        {/* Project list */}
        {!isLoading && projects.length > 0 && (
          <div className="space-y-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={setEditProject}
                onDelete={setDeleteProject}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB — New project */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg z-30"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)' }}
        aria-label="New project"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Create modal */}
      <ProjectFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {/* Edit modal */}
      {editProject && (
        <ProjectFormModal
          open={!!editProject}
          onClose={() => setEditProject(null)}
          project={editProject}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteProject}
        onClose={() => setDeleteProject(null)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete project"
        description={`Delete "${deleteProject?.name}"? Tasks in this project will not be deleted.`}
        confirmLabel="Delete project"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      {/* Suppress unused variable warning */}
      {deleteError && null}
    </>
  )
}
