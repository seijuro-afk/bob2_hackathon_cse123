import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Loader2, Copy, RotateCcw, ExternalLink } from 'lucide-react'
import Terminal from '../components/ui/Terminal'
import CopyButton from '../components/ui/CopyButton'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { cn } from '../lib/utils'
import { api, type ApiTask, runTaskCheck } from '../lib/api'

type TaskStatus = 'done' | 'active' | 'pending'

interface Task {
  id: string
  title: string
  subtitle: string
  command?: string
  status: TaskStatus
  checkOutput?: string
  checkPassed?: boolean
}

function fromApi(t: ApiTask): Task {
  return { id: t.id, title: t.title, subtitle: t.description, command: t.automatedCheck, status: 'pending' }
}

const DOCKER_LOGS = [
  { t: '12:01:03', msg: 'Starting postgres:15-alpine...', ok: true },
  { t: '12:01:04', msg: 'Starting redis:7-alpine...', ok: true },
  { t: '12:01:05', msg: 'Starting minio/minio:latest...', ok: true },
  { t: '12:01:06', msg: 'nexus-postgres-1  | database system is ready to accept connections', ok: true },
  { t: '12:01:07', msg: 'nexus-redis-1     | Ready to accept connections tcp', ok: true },
  { t: '12:01:09', msg: 'nexus-minio-1     | MinIO Object Storage Server', ok: true },
  { t: '12:01:09', msg: 'All containers healthy ✓', ok: true },
]

interface DiagItem { label: string; value: string; ok: boolean }

export default function SetupChecklist() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [autoAdvance, setAutoAdvance] = useState(false)
  const [running, setRunning] = useState(false)
  const [diag, setDiag] = useState<DiagItem[]>([])

  useEffect(() => {
    api<ApiTask[]>('/tasks')
      .then(list => {
        const mapped = list.map(fromApi)
        setTasks(mapped)
        // Fire checks for the first 3 tasks in parallel to populate Host Diagnostics
        const probes = mapped.slice(0, 3)
        Promise.allSettled(probes.map(t => runTaskCheck(t.id))).then(results => {
          setDiag(probes.map((t, i) => {
            const r = results[i]
            if (r.status === 'fulfilled') {
              // Extract first non-empty line as the display value
              const firstLine = r.value.output.split('\n').find(l => l.trim()) ?? r.value.output
              const value = firstLine.length > 24 ? firstLine.slice(0, 24) + '…' : firstLine
              return { label: t.title.split(' ')[0], value, ok: r.value.passed }
            }
            return { label: t.title.split(' ')[0], value: 'error', ok: false }
          }))
        })
      })
      .catch(err => setLoadError(err instanceof Error ? err.message : 'Failed to load tasks'))
      .finally(() => setLoading(false))
  }, [])

  const doneCount = tasks.filter(t => t.status === 'done').length
  const pct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0

  const runNext = async () => {
    if (running) return
    const nextIdx = tasks.findIndex(t => t.status === 'pending')
    if (nextIdx === -1) return

    const target = tasks[nextIdx]

    // Mark the previously active task done, and the next pending task active
    setTasks(prev => prev.map((t, i) => {
      if (t.status === 'active') return { ...t, status: 'done' }
      if (i === nextIdx) return { ...t, status: 'active' }
      return t
    }))
    setRunning(true)

    try {
      const result = await runTaskCheck(target.id)
      setTasks(prev => prev.map(t =>
        t.id === target.id
          ? { ...t, status: result.passed ? 'done' : 'active', checkOutput: result.output, checkPassed: result.passed }
          : t
      ))
      if (result.passed && autoAdvance) {
        // Let state settle before triggering the next run
        setTimeout(() => setRunning(false), 0)
        return
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Check failed'
      setTasks(prev => prev.map(t =>
        t.id === target.id
          ? { ...t, status: 'active', checkOutput: msg, checkPassed: false }
          : t
      ))
    }

    setRunning(false)
  }

  // Auto-advance: when a task just completed successfully and autoAdvance is on, run next
  useEffect(() => {
    if (!autoAdvance || running) return
    const hasActive = tasks.some(t => t.status === 'active')
    if (!hasActive) return
    const activeTask = tasks.find(t => t.status === 'active')
    if (activeTask?.checkPassed === true) {
      runNext()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, autoAdvance, running])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') runNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 bg-card-surface p-5 rounded-xl border border-card-border">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-accent-green bg-accent-green/10 border border-accent-green/30 px-2 py-0.5 rounded">ENV_SPEC_V2</span>
            <span className="font-mono text-[11px] text-text-muted">•</span>
            <span className="font-mono text-[11px] text-text-muted">target: local-dev-darwin-arm64</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Setup Checklist</h1>
          <p className="text-sm text-text-muted">Step-by-step developer environment setup for nexus-core-api</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 min-w-[260px]">
          <div className="flex items-center justify-between w-full font-mono text-xs">
            <span className="text-text-muted uppercase tracking-wider text-[10px]">Overall Completion</span>
            <span className="text-accent-green font-medium">{doneCount} of {tasks.length} completed ({pct}%)</span>
          </div>
          {/* Segmented progress bar */}
          <div className="grid gap-1.5 w-full h-1.5" style={{ gridTemplateColumns: `repeat(${tasks.length}, 1fr)` }}>
            {tasks.map(t => (
              <div
                key={t.id}
                className={cn(
                  'rounded-sm',
                  t.status === 'done' ? 'bg-accent-green' :
                  t.status === 'active' ? 'bg-accent-green/30 animate-pulse' :
                  'bg-card-border'
                )}
              />
            ))}
          </div>
          <Button variant="primary" size="sm" onClick={runNext} disabled={loading || running || tasks.length === 0} className="mt-1">
            {running ? <Loader2 size={13} className="animate-spin mr-1" /> : null}
            Run Next: Task {String(doneCount + 1).padStart(2, '0')}
            {!running && <kbd className="ml-1.5 font-mono text-[10px] bg-black/20 px-1.5 py-0.5 rounded">↵</kbd>}
          </Button>
        </div>
      </header>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-text-muted font-mono">
          <Loader2 size={15} className="animate-spin" /> Loading checklist...
        </div>
      )}
      {loadError && (
        <div className="rounded-md border border-accent-red/40 bg-accent-red/10 px-4 py-2.5 text-xs font-mono text-accent-red">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Tasks */}
        <section className="lg:col-span-8 flex flex-col gap-3">
          {tasks.map(task => (
            <article
              key={task.id}
              className={cn(
                'bg-card-surface rounded-xl p-4 flex flex-col gap-3 border transition-all',
                task.status === 'active' ? 'border-accent-green/50' : 'border-card-border'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {task.status === 'done' ? (
                    <CheckCircle2 size={18} className="text-accent-green flex-shrink-0" />
                  ) : task.status === 'active' ? (
                    <Loader2 size={18} className="text-accent-green animate-spin flex-shrink-0" />
                  ) : (
                    <Circle size={18} className="text-card-border flex-shrink-0" />
                  )}
                  <div>
                    <h2 className="text-sm font-medium text-text-primary">{task.id}. {task.title}</h2>
                    <span className="font-mono text-[11px] text-text-muted">{task.subtitle}</span>
                  </div>
                </div>
                {task.status === 'done' && <Badge variant="success" className="text-[10px]">Done</Badge>}
                {task.status === 'active' && <Badge variant="info" dot pulse className="text-[10px]">Running</Badge>}
                {task.status === 'pending' && <Badge variant="neutral" className="text-[10px]">Pending</Badge>}
              </div>

              {task.command && (task.status === 'done' || task.status === 'active') && (
                <div className="flex items-center gap-2 bg-canvas-dark rounded px-3 py-2 font-mono text-xs border border-card-border">
                  <span className="text-accent-blue select-none">$</span>
                  <code className="text-text-primary flex-1 truncate">{task.command}</code>
                  <CopyButton text={task.command} />
                </div>
              )}

              {/* Check output terminal — shown when output is available */}
              {(task.checkOutput != null) && (
                <Terminal
                  title={task.command ?? 'check output'}
                  rightSlot={
                    task.checkPassed === false
                      ? <span className="font-mono text-[10px] text-accent-red">✗ failed</span>
                      : <span className="font-mono text-[10px] text-accent-green">✓ passed</span>
                  }
                  bodyClassName="max-h-40 overflow-y-auto whitespace-pre-wrap break-all"
                >
                  <span className={task.checkPassed === false ? 'text-accent-red' : 'text-accent-green'}>
                    {task.checkOutput}
                  </span>
                </Terminal>
              )}

              {/* Fallback Docker mock terminal — only shown when active, docker task, and no real output yet */}
              {task.status === 'active' && /docker/i.test(task.title) && task.checkOutput == null && (
                <Terminal
                  title="docker compose up -d"
                  rightSlot={
                    <Button variant="ghost" size="sm" leftIcon={<RotateCcw size={12} />}>
                      Restart
                    </Button>
                  }
                  bodyClassName="space-y-1.5 max-h-40 overflow-y-auto"
                >
                  {DOCKER_LOGS.map((log, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px]">
                      <span className="text-text-muted flex-shrink-0">{log.t}</span>
                      <span className={log.ok ? 'text-accent-green' : 'text-accent-red'}>{log.msg}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-[11px] pt-1">
                    <span className="text-accent-green font-bold">❯</span>
                    <span className="text-text-muted">waiting for healthchecks...</span>
                    <span className="w-1.5 h-3 bg-accent-green animate-pulse inline-block" />
                  </div>
                </Terminal>
              )}
            </article>
          ))}
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          {/* Host diagnostics */}
          <div className="bg-card-surface rounded-xl p-4 border border-card-border space-y-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center justify-between">
              Host Diagnostics
              {diag.length === 0 && !loading && (
                <Loader2 size={11} className="animate-spin text-text-muted" />
              )}
            </h3>
            {diag.length > 0
              ? diag.map(item => (
                  <div key={item.label} className="flex items-center justify-between font-mono text-xs">
                    <span className="text-text-muted">{item.label}</span>
                    <span className={cn('font-medium', item.ok ? 'text-accent-green' : 'text-accent-red')}>{item.value}</span>
                  </div>
                ))
              : (
                  <p className="text-xs text-text-muted font-mono">Running checks…</p>
                )
            }
          </div>

          {/* Auto-advance toggle */}
          <div className="bg-card-surface rounded-xl p-4 border border-card-border flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-text-primary">Auto-advance</p>
              <p className="text-xs text-text-muted">Run next task automatically on completion</p>
            </div>
            <button
              role="switch"
              aria-checked={autoAdvance}
              onClick={() => setAutoAdvance(v => !v)}
              className={cn(
                'relative w-10 h-5 rounded-full transition-colors flex-shrink-0',
                autoAdvance ? 'bg-accent-green' : 'bg-card-border'
              )}
            >
              <span className={cn(
                'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                autoAdvance ? 'translate-x-5' : 'translate-x-0.5'
              )} />
            </button>
          </div>

          {/* Troubleshooting links */}
          <div className="bg-card-surface rounded-xl p-4 border border-card-border space-y-2">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Resources</h3>
            {[
              'Docker Troubleshooting Guide',
              'SSH Key Setup Docs',
              'Environment Variables Reference',
              'Database Migration Guide',
            ].map(link => (
              <a
                key={link}
                href="#"
                className="flex items-center justify-between gap-2 text-xs text-accent-blue hover:text-text-primary transition-colors py-1"
              >
                <span>{link}</span>
                <ExternalLink size={11} className="flex-shrink-0 text-text-muted" />
              </a>
            ))}
          </div>

          {/* Copy button */}
          <div className="bg-card-surface rounded-xl p-4 border border-card-border space-y-2">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Copy size={11} />
              Quick Copy
            </h3>
            <CopyButton
              text={tasks.find(t => t.status === 'active')?.command ?? ''}
              label="Copy active task command"
              className="w-full justify-center"
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
