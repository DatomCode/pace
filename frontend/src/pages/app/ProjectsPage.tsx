import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus, Edit2, Trash2, FolderOpen, CheckCircle2
} from 'lucide-react'
import { projectsApi } from '@/api/projects'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import ProgressBar from '@/components/ui/ProgressBar'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { CardSkeleton } from '@/components/ui/SkeletonLoader'
import { cn, formatDate } from '@/lib/utils'
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

  return (
    <div className="card p-5 hover:border-brand-500/20 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-3 h-3 rounded-full shrink-0 mt-0.5"
            style={{ backgroundColor: project.color ?? '#6366f1' }}
          />
          <Link
            to={`/app/projects/${project.id}`}
            className="font-semibold text-text-primary hover:text-brand-400 transition-colors truncate"
          >
            {project.name}
          </Link>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
          <button
            onClick={() => onEdit(project)}
            className="p-1 rounded text-text-muted hover:text-text-primary transition-colors"
            aria-label="Edit project"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(project)}
            className="p-1 rounded text-text-muted hover:text-red-400 transition-colors"
            aria-label="Delete project"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {project.description && (
        <p className="text-xs text-text-muted mb-3 line-clamp-2">{project.description}</p>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>{project.completed_task_count} of {project.task_count} tasks</span>
          <span className="font-medium text-text-secondary">{completionPct}%</span>
        </div>
        <ProgressBar value={completionPct} color="green" />
        {remaining > 0 && (
          <p className="text-xs text-text-muted">{remaining} remaining</p>
        )}
        {remaining === 0 && project.task_count > 0 && (
          <p className="text-xs text-green-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            All done!
          </p>
        )}
      </div>

      <Link
        to={`/app/projects/${project.id}`}
        className="inline-flex items-center gap-1 mt-3 text-xs text-text-muted hover:text-brand-400 transition-colors"
      >
        View tasks →
      </Link>
    </div>
  )
}

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
          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
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
            className="w-full px-3 py-2.5 rounded-lg bg-surface-overlay border border-border text-text-primary text-sm placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
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
                    ? 'border-white scale-110'
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
      <div className="page-container space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
            {projects.length > 0 && (
              <p className="text-sm text-text-muted mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            New project
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* Projects grid */}
        {!isLoading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </>
  )
}
