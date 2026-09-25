import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Loader2, Copy, RotateCcw, ExternalLink } from 'lucide-react'
import Terminal from '../components/ui/Terminal'
import CopyButton from '../components/ui/CopyButton'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { cn } from '../lib/utils'

type TaskStatus = 'done' | 'active' | 'pending'

interface Task {
  id: number
  title: string
  subtitle: string
  command?: string
  status: TaskStatus
}

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Clone Repository & SSH Keys', subtitle: 'Git clone complete & key ed25519 verified', command: 'git clone git@github.com:enterprise/nexus-core-api.git && ssh-add ~/.ssh/id_ed25519', status: 'done' },
  { id: 2, title: 'Install Node Dependencies', subtitle: 'pnpm install completed — 847 packages', command: 'pnpm install', status: 'done' },
  { id: 3, title: 'Configure Environment Variables', subtitle: '.env.local created from template', command: 'cp .env.example .env.local && code .env.local', status: 'done' },
  { id: 4, title: 'Start Docker Containers', subtitle: 'Postgres 15, Redis 7, MinIO running', command: 'docker compose up -d', status: 'active' },
  { id: 5, title: 'Run Database Migrations', subtitle: 'Pending — requires task 4 completion', command: 'pnpm db:migrate', status: 'pending' },
  { id: 6, title: 'Run Test Suite', subtitle: 'Pending — final validation step', command: 'pnpm test', status: 'pending' },
]

const DOCKER_LOGS = [
  { t: '12:01:03', msg: 'Starting postgres:15-alpine...', ok: true },
  { t: '12:01:04', msg: 'Starting redis:7-alpine...', ok: true },
  { t: '12:01:05', msg: 'Starting minio/minio:latest...', ok: true },
  { t: '12:01:06', msg: 'nexus-postgres-1  | database system is ready to accept connections', ok: true },
  { t: '12:01:07', msg: 'nexus-redis-1     | Ready to accept connections tcp', ok: true },
  { t: '12:01:09', msg: 'nexus-minio-1     | MinIO Object Storage Server', ok: true },
  { t: '12:01:09', msg: 'All containers healthy ✓', ok: true },
]

export default function SetupChecklist() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [autoAdvance, setAutoAdvance] = useState(false)

  const doneCount = tasks.filter(t => t.status === 'done').length
  const pct = Math.round((doneCount / tasks.length) * 100)

  const runNext = () => {
    setTasks(prev => {
      const idx = prev.findIndex(t => t.status === 'pending')
      if (idx === -1) return prev
      // mark current active as done, next pending as active
      return prev.map((t, i) => {
        if (t.status === 'active') return { ...t, status: 'done' }
        if (i === idx) return { ...t, status: 'active' }
        return t
      })
    })
  }

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
          <Button variant="primary" size="sm" onClick={runNext} className="mt-1">
            Run Next: Task {String(doneCount + 1).padStart(2, '0')}
            <kbd className="ml-1.5 font-mono text-[10px] bg-black/20 px-1.5 py-0.5 rounded">↵</kbd>
          </Button>
        </div>
      </header>

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

              {/* Expanded terminal for active docker task */}
              {task.id === 4 && task.status === 'active' && (
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
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Host Diagnostics</h3>
            {[
              { label: 'Node', value: 'v20.11.1', ok: true },
              { label: 'Docker', value: '24.0.7', ok: true },
              { label: 'pnpm', value: '8.14.0', ok: true },
              { label: 'Disk Free', value: '48 GB', ok: true },
              { label: 'RAM', value: '16 GB', ok: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between font-mono text-xs">
                <span className="text-text-muted">{item.label}</span>
                <span className={cn('font-medium', item.ok ? 'text-accent-green' : 'text-accent-red')}>{item.value}</span>
              </div>
            ))}
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
