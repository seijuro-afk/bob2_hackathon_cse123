import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Wrench, Download, CheckCircle2, AlertTriangle, XCircle, Copy, Loader2 } from 'lucide-react'
import Terminal from '../components/ui/Terminal'
import CopyButton from '../components/ui/CopyButton'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Toast from '../components/ui/Toast'
import { cn } from '../lib/utils'
import { runAllChecks, runTaskCheck, getSystemInfo, type CheckSummary, type SystemInfo } from '../lib/api'

type DiagStatus = 'pass' | 'warning' | 'fail'

interface DiagItem {
  id: string       // task mongo id — used for runTaskCheck
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

// Maps the first tag of a task to a group label
const TAG_GROUP: Record<string, string> = {
  git: 'Git & Security',
  security: 'Git & Security',
  node: 'Core Runtimes',
  pnpm: 'Core Runtimes',
  docker: 'Containerization',
  infra: 'Containerization',
  database: 'Database & Services',
  config: 'Configuration',
  testing: 'Testing',
}

function summariesToGroups(summaries: CheckSummary[]): DiagGroup[] {
  const groupMap = new Map<string, DiagItem[]>()
  for (const s of summaries) {
    const firstTag = s.automatedCheck ? (
      // derive group from task title keywords as fallback when tags aren't on CheckSummary
      Object.keys(TAG_GROUP).find(k => s.title.toLowerCase().includes(k)) ?? 'other'
    ) : 'other'
    const label = TAG_GROUP[firstTag] ?? 'Other'
    const firstLine = s.output.split('\n').find(l => l.trim()) ?? s.output
    const version = firstLine.length > 30 ? firstLine.slice(0, 30) + '…' : firstLine
    const item: DiagItem = {
      id: s.taskId,
      name: s.title,
      version: s.passed ? version : undefined,
      status: s.passed ? 'pass' : 'fail',
      message: s.passed ? undefined : firstLine.slice(0, 80),
    }
    if (!groupMap.has(label)) groupMap.set(label, [])
    groupMap.get(label)!.push(item)
  }
  return Array.from(groupMap.entries()).map(([label, items]) => ({ label, items }))
}

type LogLine = { t: string; msg: string; ok: boolean }

export default function EnvironmentValidator() {
  const [groups, setGroups] = useState<DiagGroup[]>([])
  const [logs, setLogs] = useState<LogLine[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null)

  const allItems = groups.flatMap(g => g.items)
  const passCount = allItems.filter(i => i.status === 'pass').length
  const warnCount = allItems.filter(i => i.status === 'warning').length
  const failCount = allItems.filter(i => i.status === 'fail').length

  const addLog = (msg: string, ok = true) => {
    const t = new Date().toLocaleTimeString('en-GB')
    setLogs(prev => [...prev, { t, msg, ok }])
  }

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastVisible(true)
  }

  const fetchAndApply = useCallback(async () => {
    setIsRunning(true)
    addLog('Running diagnostics…')
    try {
      const summaries = await runAllChecks()
      const built = summariesToGroups(summaries)
      setGroups(built)
      const p = summaries.filter(s => s.passed).length
      const f = summaries.filter(s => !s.passed).length
      summaries.forEach(s => addLog(
        `${s.title}: ${s.passed ? 'passed' : 'failed'} (${s.durationMs}ms)`,
        s.passed,
      ))
      addLog(`Done — ${p} passed, ${f} failed`, f === 0)
      showToast(`Diagnostics complete — ${p} passed, ${f} failed`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Diagnostics failed'
      addLog(msg, false)
      showToast(msg)
    } finally {
      setIsRunning(false)
    }
  }, [])

  // Run diagnostics and fetch system info on mount
  useEffect(() => {
    fetchAndApply()
    getSystemInfo().then(setSysInfo).catch(() => {/* sidebar stays null — no crash */})
  }, [fetchAndApply])

  const handleRerun = () => { fetchAndApply() }

  const handleAutoFix = async (item: DiagItem) => {
    if (!item.fixCommand) return
    addLog(`Applying fix: ${item.fixCommand}`)
    // Optimistically mark as fixing
    setGroups(prev => prev.map(g => ({
      ...g,
      items: g.items.map(i => i.id === item.id ? { ...i, status: 'warning', message: 'Fixing…', version: undefined } : i),
    })))
    try {
      const result = await runTaskCheck(item.id)
      const firstLine = result.output.split('\n').find(l => l.trim()) ?? result.output
      setGroups(prev => prev.map(g => ({
        ...g,
        items: g.items.map(i => i.id === item.id
          ? {
              ...i,
              status: result.passed ? 'pass' : 'fail',
              message: result.passed ? undefined : firstLine.slice(0, 80),
              version: result.passed ? (firstLine.length > 30 ? firstLine.slice(0, 30) + '…' : firstLine) : undefined,
            }
          : i),
      })))
      addLog(`${item.name}: re-check ${result.passed ? 'passed' : 'failed'} (${result.durationMs}ms)`, result.passed)
      if (!result.passed) showToast(`${item.name} still failing — check the output`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Re-check failed'
      setGroups(prev => prev.map(g => ({
        ...g,
        items: g.items.map(i => i.id === item.id ? { ...i, status: 'fail', message: msg } : i),
      })))
      addLog(`${item.name}: ${msg}`, false)
    }
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
            {failCount > 0
              ? <span className="text-accent-red">{failCount} Failed — </span>
              : warnCount > 0
              ? <span className="text-accent-amber">{warnCount} Warning{warnCount > 1 ? 's' : ''} — </span>
              : null}
            {isRunning && groups.length === 0
              ? 'Running checks…'
              : `${passCount}/${allItems.length} checks passed`}
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
          {isRunning && groups.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-text-muted font-mono bg-card-surface rounded-xl border border-card-border p-5">
              <Loader2 size={15} className="animate-spin flex-shrink-0" />
              Running environment checks…
            </div>
          )}
          {groups.map(group => (
            <div key={group.label} className="bg-card-surface rounded-xl border border-card-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-card-border bg-canvas-subtle">
                <h2 className="text-sm font-semibold text-text-primary">{group.label}</h2>
                <Badge
                  variant={group.items.every(i => i.status === 'pass') ? 'success' : group.items.some(i => i.status === 'fail') ? 'error' : 'warning'}
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
            {sysInfo
              ? [
                  { label: 'OS', value: sysInfo.os },
                  { label: 'Arch', value: sysInfo.arch },
                  { label: 'CPU', value: sysInfo.cpu.length > 28 ? sysInfo.cpu.slice(0, 28) + '…' : sysInfo.cpu },
                  { label: 'Cores', value: String(sysInfo.cpuCount) },
                  { label: 'RAM', value: `${sysInfo.totalMemGb} GB` },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between font-mono text-xs">
                    <span className="text-text-muted">{item.label}</span>
                    <span className="text-text-primary">{item.value}</span>
                  </div>
                ))
              : <p className="text-xs text-text-muted font-mono">Loading…</p>
            }
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
