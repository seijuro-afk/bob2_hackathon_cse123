import { useState, useEffect } from 'react'
import { RefreshCw, Wrench, Download, CheckCircle2, AlertTriangle, XCircle, Copy } from 'lucide-react'
import Terminal from '../components/ui/Terminal'
import CopyButton from '../components/ui/CopyButton'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Toast from '../components/ui/Toast'
import { cn } from '../lib/utils'

type DiagStatus = 'pass' | 'warning' | 'fail'

interface DiagItem {
  id: string
  name: string
  version?: string
  expected?: string
  status: DiagStatus
  fixCommand?: string
  message?: string
}

interface DiagGroup {
  label: string
  items: DiagItem[]
}

const INITIAL_GROUPS: DiagGroup[] = [
  {
    label: 'Core Runtimes',
    items: [
      { id: 'node', name: 'Node.js', version: 'v20.11.1', expected: '>=20.0.0', status: 'pass' },
      { id: 'pnpm', name: 'pnpm', version: '8.14.0', expected: '>=8.0.0', status: 'pass' },
      { id: 'git', name: 'Git', version: '2.43.0', expected: '>=2.40.0', status: 'pass' },
    ],
  },
  {
    label: 'Containerization',
    items: [
      { id: 'docker', name: 'Docker', version: '24.0.7', expected: '>=24.0.0', status: 'pass' },
      { id: 'compose', name: 'Docker Compose', version: '2.24.1', expected: '>=2.20.0', status: 'pass' },
      { id: 'containers', name: 'Containers Running', version: '3/3', status: 'pass' },
    ],
  },
  {
    label: 'Database & Services',
    items: [
      { id: 'postgres', name: 'PostgreSQL Connection', status: 'pass', version: 'OK' },
      { id: 'redis', name: 'Redis Connection', status: 'warning', message: 'AUTH required but REDIS_PASSWORD not set', fixCommand: 'echo REDIS_PASSWORD=devpassword >> .env.local' },
    ],
  },
  {
    label: 'Security & Credentials',
    items: [
      { id: 'ssh', name: 'SSH Key (ed25519)', status: 'pass', version: 'Verified' },
      { id: 'vault', name: 'Vault Token', status: 'warning', message: 'VAULT_TOKEN expires in 2 hours — re-authenticate', fixCommand: 'vault login -method=oidc' },
    ],
  },
]

type LogLine = { t: string; msg: string; ok: boolean }

export default function EnvironmentValidator() {
  const [groups, setGroups] = useState<DiagGroup[]>(INITIAL_GROUPS)
  const [logs, setLogs] = useState<LogLine[]>([
    { t: '12:00:00', msg: 'Initial diagnostic run complete.', ok: true },
  ])
  const [isRunning, setIsRunning] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const allItems = groups.flatMap(g => g.items)
  const passCount = allItems.filter(i => i.status === 'pass').length
  const warnCount = allItems.filter(i => i.status === 'warning').length

  const addLog = (msg: string, ok = true) => {
    const t = new Date().toLocaleTimeString('en-GB')
    setLogs(prev => [...prev, { t, msg, ok }])
  }

  const handleRerun = () => {
    setIsRunning(true)
    addLog('Re-running diagnostics...')
    setTimeout(() => {
      setIsRunning(false)
      addLog('Diagnostic run complete.', true)
      showToast('Diagnostics complete — ' + passCount + ' passed, ' + warnCount + ' warnings')
    }, 1500)
  }

  const handleAutoFix = (item: DiagItem) => {
    if (!item.fixCommand) return
    addLog('Applying fix: ' + item.fixCommand)
    setGroups(prev =>
      prev.map(g => ({
        ...g,
        items: g.items.map(i => i.id === item.id ? { ...i, status: 'pass', message: undefined, version: 'Fixed' } : i),
      }))
    )
    addLog('Fix applied successfully for ' + item.name, true)
  }

  const handleExportJson = () => {
    const data = JSON.stringify({ timestamp: new Date().toISOString(), groups }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'diagnostics.json'; a.click()
    URL.revokeObjectURL(url)
    showToast('Exported diagnostics.json')
  }

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastVisible(true)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') { e.preventDefault(); handleRerun() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Environment Validator</h1>
            <Badge variant="neutral" className="text-[10px] font-mono">PROBE-{Math.floor(Math.random() * 9000 + 1000)}</Badge>
          </div>
          <p className="text-sm text-text-muted">
            {warnCount > 0
              ? <span className="text-accent-amber">{warnCount} Warning{warnCount > 1 ? 's' : ''} Detected — </span>
              : null}
            {passCount}/{allItems.length} checks passed
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw size={13} className={cn(isRunning && 'animate-spin')} />}
            onClick={handleRerun}
            disabled={isRunning}
          >
            Re-run Diagnostics
            <kbd className="ml-1.5 font-mono text-[10px] bg-black/20 px-1.5 py-0.5 rounded">⌘R</kbd>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Wrench size={13} />}
            onClick={() => {
              groups.flatMap(g => g.items).filter(i => i.status === 'warning' && i.fixCommand).forEach(handleAutoFix)
            }}
          >
            Auto-Fix Safe Items
          </Button>
          <Button variant="secondary" size="sm" leftIcon={<Download size={13} />} onClick={handleExportJson}>
            Export JSON
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Diagnostic groups */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          {groups.map(group => (
            <div key={group.label} className="bg-card-surface rounded-xl border border-card-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-card-border bg-canvas-subtle">
                <h2 className="text-sm font-semibold text-text-primary">{group.label}</h2>
                <Badge
                  variant={group.items.every(i => i.status === 'pass') ? 'success' : 'warning'}
                  className="text-[10px]"
                >
                  {group.items.filter(i => i.status === 'pass').length}/{group.items.length} passed
                </Badge>
              </div>
              <div className="divide-y divide-card-border">
                {group.items.map(item => (
                  <div key={item.id} className="px-4 py-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        {item.status === 'pass' ? (
                          <CheckCircle2 size={15} className="text-accent-green flex-shrink-0" />
                        ) : item.status === 'warning' ? (
                          <AlertTriangle size={15} className="text-accent-amber flex-shrink-0" />
                        ) : (
                          <XCircle size={15} className="text-accent-red flex-shrink-0" />
                        )}
                        <span className="text-sm text-text-primary">{item.name}</span>
                        {item.message && (
                          <span className="text-xs text-accent-amber font-mono hidden md:block truncate max-w-xs">{item.message}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.version && (
                          <span className={cn(
                            'font-mono text-xs',
                            item.status === 'pass' ? 'text-accent-green' : item.status === 'warning' ? 'text-accent-amber' : 'text-accent-red'
                          )}>{item.version}</span>
                        )}
                        {item.status !== 'pass' && item.fixCommand && (
                          <Button variant="secondary" size="sm" leftIcon={<Wrench size={11} />} onClick={() => handleAutoFix(item)}>
                            Auto-fix
                          </Button>
                        )}
                      </div>
                    </div>
                    {item.fixCommand && item.status !== 'pass' && (
                      <div className="flex items-center gap-2 bg-canvas-dark rounded px-3 py-1.5 font-mono text-xs border border-card-border">
                        <Copy size={11} className="text-text-muted flex-shrink-0" />
                        <code className="text-text-primary flex-1 truncate">{item.fixCommand}</code>
                        <CopyButton text={item.fixCommand} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          {/* Host specs */}
          <div className="bg-card-surface rounded-xl border border-card-border p-4 space-y-2">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Host Machine</h3>
            {[
              { label: 'OS', value: 'macOS 14.3 (arm64)' },
              { label: 'CPU', value: 'Apple M2 Pro' },
              { label: 'RAM', value: '16 GB' },
              { label: 'Disk Free', value: '48 GB' },
              { label: 'Arch', value: 'darwin-arm64' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between font-mono text-xs">
                <span className="text-text-muted">{item.label}</span>
                <span className="text-text-primary">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Compliance */}
          <div className="bg-card-surface rounded-xl border border-card-border p-4 space-y-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Compliance Readiness</h3>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold font-mono text-text-primary">
                {Math.round((passCount / allItems.length) * 100)}%
              </span>
              <Badge
                variant={warnCount === 0 ? 'success' : 'warning'}
                dot
                className="text-[10px]"
              >
                {warnCount === 0 ? 'Ready' : 'Needs Attention'}
              </Badge>
            </div>
            <div className="w-full h-1.5 bg-card-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-green rounded-full transition-all"
                style={{ width: `${Math.round((passCount / allItems.length) * 100)}%` }}
              />
            </div>
          </div>

          {/* Terminal log */}
          <Terminal title="diagnostic log" bodyClassName="space-y-1.5 max-h-48 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px]">
                <span className="text-text-muted flex-shrink-0">{log.t}</span>
                <span className={log.ok ? 'text-accent-green' : 'text-accent-red'}>{log.msg}</span>
              </div>
            ))}
          </Terminal>
        </aside>
      </div>

      <Toast message={toastMsg} visible={toastVisible} onDismiss={() => setToastVisible(false)} />
    </div>
  )
}
