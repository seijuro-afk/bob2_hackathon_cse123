import { useEffect, useState } from 'react'
import {
  ChevronUp, ChevronDown, Pencil, Trash2, Save, X, GripVertical, Loader2
} from 'lucide-react'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Toast from '../components/ui/Toast'
import { cn } from '../lib/utils'
import { api, type ApiTask } from '../lib/api'

const AUDIT_LOG = [
  { user: 'm-rodriguez', action: 'Updated Task 4 estimated time', time: '3h ago' },
  { user: 's-chen', action: 'Added Task 5 automated check', time: '1d ago' },
  { user: 'm-rodriguez', action: 'Created initial workflow', time: '3d ago' },
]

export default function ManagerSettings() {
  const [tasks, setTasks] = useState<ApiTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [editingTask, setEditingTask] = useState<ApiTask | null>(null)
  const [editForm, setEditForm] = useState<ApiTask | null>(null)

  useEffect(() => {
    api<ApiTask[]>('/tasks')
      .then(setTasks)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load tasks'))
      .finally(() => setLoading(false))
  }, [])

  const reportError = (err: unknown, fallback: string) =>
    setError(err instanceof Error ? err.message : fallback)

  const swap = (idx: number, other: number) => {
    setTasks(prev => {
      const next = [...prev]
      ;[next[idx], next[other]] = [next[other], next[idx]]
      return next
    })
  }

  const moveUp = (idx: number) => {
    if (idx > 0) swap(idx, idx - 1)
  }

  const moveDown = (idx: number) => {
    if (idx < tasks.length - 1) swap(idx, idx + 1)
  }

  const deleteTask = async (id: string) => {
    try {
      await api(`/tasks/${id}`, { method: 'DELETE' })
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      reportError(err, 'Failed to delete task')
    }
  }

  const openEdit = (task: ApiTask) => {
    setEditingTask(task)
    setEditForm({ ...task })
  }

  const closeEdit = () => { setEditingTask(null); setEditForm(null) }

  const saveEdit = async () => {
    if (!editForm) return
    try {
      const updated = await api<ApiTask>(`/tasks/${editForm.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          automatedCheck: editForm.automatedCheck,
          estimatedTime: editForm.estimatedTime,
          required: editForm.required,
          tags: editForm.tags,
        }),
      })
      setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)))
      closeEdit()
    } catch (err) {
      reportError(err, 'Failed to save task')
    }
  }

  const saveOrder = async () => {
    try {
      setTasks(await api<ApiTask[]>('/tasks/reorder', {
        method: 'POST',
        body: JSON.stringify({ ids: tasks.map(t => t.id) }),
      }))
      setToastVisible(true)
    } catch (err) {
      reportError(err, 'Failed to save order')
    }
  }

  const requiredCount = tasks.filter(t => t.required).length

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs text-text-muted font-mono mb-1">Settings / Workflow &amp; Checklist Customization</p>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Team Onboarding Workflow Manager</h1>
            <p className="text-sm text-text-muted mt-0.5">Configure onboarding tasks, requirements, and automated checks.</p>
          </div>
          <Badge variant="warning" className="text-[10px] self-start md:self-center">Manager Access</Badge>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Save size={13} />}
          onClick={saveOrder}
          disabled={loading}
        >
          Save Changes
        </Button>
        {error && <span className="text-xs font-mono text-accent-red">{error}</span>}
      </div>

      {/* Progress banner */}
      <div className="bg-card-surface rounded-xl border border-card-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-text-primary">Onboarding Workflow</p>
          <p className="text-xs text-text-muted">{tasks.length} tasks · {requiredCount} required · {tasks.length - requiredCount} optional</p>
        </div>
        <div className="flex items-center gap-3 min-w-[220px]">
          <div className="flex-1 h-1.5 bg-card-border rounded-full overflow-hidden">
            <div className="h-full bg-accent-green rounded-full" style={{ width: `${tasks.length ? (requiredCount / tasks.length) * 100 : 0}%` }} />
          </div>
          <span className="text-xs font-mono text-accent-green">{requiredCount}/{tasks.length} required</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Task list */}
        <section className="lg:col-span-8 flex flex-col gap-2">
          {loading && (
            <div className="flex items-center gap-2 p-4 text-sm text-text-muted font-mono">
              <Loader2 size={15} className="animate-spin" /> Loading workflow...
            </div>
          )}
          {!loading && tasks.length === 0 && (
            <div className="p-4 text-sm text-text-muted font-mono">No tasks configured yet.</div>
          )}
          {tasks.map((task, idx) => (
            <div
              key={task.id}
              className="bg-card-surface rounded-xl border border-card-border p-4 flex items-start gap-3 group"
            >
              {/* Drag handle */}
              <GripVertical size={15} className="text-card-border mt-0.5 cursor-grab flex-shrink-0" />

              {/* Number */}
              <span className="w-5 h-5 rounded-full bg-canvas-dark border border-card-border flex items-center justify-center font-mono text-[11px] text-text-muted flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-text-primary">{task.title}</span>
                    {task.tags.map(tag => (
                      <Badge key={tag} variant="neutral" className="text-[10px]">{tag}</Badge>
                    ))}
                    <Badge variant={task.required ? 'error' : 'neutral'} className="text-[10px]">
                      {task.required ? 'Required' : 'Optional'}
                    </Badge>
                  </div>
                  {/* Reorder + actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1 rounded hover:bg-card-hover text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"><ChevronUp size={14} /></button>
                    <button onClick={() => moveDown(idx)} disabled={idx === tasks.length - 1} className="p-1 rounded hover:bg-card-hover text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"><ChevronDown size={14} /></button>
                    <button onClick={() => openEdit(task)} className="p-1 rounded hover:bg-card-hover text-text-muted hover:text-accent-blue transition-colors"><Pencil size={13} /></button>
                    <button onClick={() => deleteTask(task.id)} className="p-1 rounded hover:bg-card-hover text-text-muted hover:text-accent-red transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">{task.description}</p>
                <div className="flex items-center gap-3 mt-2 font-mono text-[11px] text-text-muted">
                  <span>$ {task.automatedCheck}</span>
                  <span>·</span>
                  <span>{task.estimatedTime}</span>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-card-surface rounded-xl border border-card-border p-4 space-y-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Audit Log</h3>
            {AUDIT_LOG.map((entry, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-accent-blue">@{entry.user}</span>
                  <span className="font-mono text-[11px] text-text-muted">{entry.time}</span>
                </div>
                <span className="text-[11px] text-text-muted">{entry.action}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Edit Modal */}
      {editingTask && editForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeEdit() }}
        >
          <div className="bg-card-surface border border-card-border rounded-xl w-full max-w-lg shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-card-border">
              <h2 className="text-base font-semibold text-text-primary">Edit Task</h2>
              <button onClick={closeEdit} className="p-1 rounded hover:bg-card-hover text-text-muted hover:text-text-primary transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Title</label>
                <input
                  value={editForm.title}
                  onChange={e => setEditForm(f => f ? { ...f, title: e.target.value } : f)}
                  className="w-full bg-canvas-dark border border-card-border rounded px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm(f => f ? { ...f, description: e.target.value } : f)}
                  rows={3}
                  className="w-full bg-canvas-dark border border-card-border rounded px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-accent-blue transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Automated Check Command</label>
                  <input
                    value={editForm.automatedCheck}
                    onChange={e => setEditForm(f => f ? { ...f, automatedCheck: e.target.value } : f)}
                    className="w-full bg-canvas-dark border border-card-border rounded px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Estimated Time</label>
                  <input
                    value={editForm.estimatedTime}
                    onChange={e => setEditForm(f => f ? { ...f, estimatedTime: e.target.value } : f)}
                    className="w-full bg-canvas-dark border border-card-border rounded px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Tags (comma-separated)</label>
                <input
                  value={editForm.tags.join(', ')}
                  onChange={e => setEditForm(f => f ? { ...f, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) } : f)}
                  className="w-full bg-canvas-dark border border-card-border rounded px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  role="switch"
                  aria-checked={editForm.required}
                  onClick={() => setEditForm(f => f ? { ...f, required: !f.required } : f)}
                  className={cn(
                    'relative w-9 h-5 rounded-full transition-colors flex-shrink-0',
                    editForm.required ? 'bg-accent-green' : 'bg-card-border'
                  )}
                >
                  <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform', editForm.required ? 'translate-x-4' : 'translate-x-0.5')} />
                </button>
                <span className="text-sm text-text-primary">Required task</span>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-card-border">
              <Button variant="ghost" size="sm" onClick={closeEdit}>Cancel</Button>
              <Button variant="primary" size="sm" leftIcon={<Save size={13} />} onClick={saveEdit}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      <Toast message="Workflow saved successfully." visible={toastVisible} onDismiss={() => setToastVisible(false)} />
    </div>
  )
}
