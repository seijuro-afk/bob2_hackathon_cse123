import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2, GitBranch, Package, Container, Database, GitMerge,
  Loader2, Search, MessageSquare, CalendarDays, Activity
} from 'lucide-react'
import CopyButton from '../components/ui/CopyButton'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { cn } from '../lib/utils'

interface FirstIssue {
  id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  estimate: string
  branch: string
}

type AssignState = 'idle' | 'loading' | 'assigned'

const FIRST_ISSUES: FirstIssue[] = [
  { id: 'DOT-1847', title: 'Add rate limiting to /api/v2/auth endpoints', difficulty: 'Easy', estimate: '2–3h', branch: 'feat/DOT-1847-rate-limit-auth' },
  { id: 'DOT-1851', title: 'Migrate legacy user model to Drizzle ORM schema', difficulty: 'Medium', estimate: '4–6h', branch: 'feat/DOT-1851-drizzle-user-model' },
  { id: 'DOT-1863', title: 'Write E2E tests for onboarding checklist API', difficulty: 'Medium', estimate: '3–4h', branch: 'feat/DOT-1863-e2e-checklist' },
]

const VERIFIED_BADGES = [
  { label: 'Git SSH', icon: GitBranch },
  { label: 'Dependencies', icon: Package },
  { label: 'Local Docker', icon: Container },
  { label: 'Database', icon: Database },
  { label: 'Working Tree', icon: GitMerge },
]

// SVG ring for 100% progress
function ReadinessRing({ pct }: { pct: number }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#262c36" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke="#3fb950"
        strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        className="transition-all duration-700"
      />
      <text x="50" y="55" textAnchor="middle" fill="#f0f6fc" fontSize="18" fontWeight="700" fontFamily="Geist, sans-serif">
        {pct}%
      </text>
    </svg>
  )
}

export default function OnboardingCompletion() {
  const navigate = useNavigate()
  const [assignStates, setAssignStates] = useState<Record<string, AssignState>>({})
  const [qaSearch, setQaSearch] = useState('')

  const handleAssign = (issue: FirstIssue) => {
    setAssignStates(prev => ({ ...prev, [issue.id]: 'loading' }))
    setTimeout(() => {
      setAssignStates(prev => ({ ...prev, [issue.id]: 'assigned' }))
    }, 900)
  }

  const handleQaSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (qaSearch.trim()) {
      navigate('/docs')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Hero */}
      <div className="bg-card-surface rounded-xl border border-accent-green/30 p-6 flex flex-col md:flex-row items-center gap-6">
        <ReadinessRing pct={100} />
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Badge variant="success" className="text-[10px]">Milestone 06/06 Complete</Badge>
            <span className="font-mono text-xs text-text-muted">18m 42s total</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Environment Ready · Welcome to the Team!</h1>
          <p className="text-sm text-text-muted mt-1 max-w-lg">
            All checks passed. Your local development environment is fully configured and ready. Your first pull request awaits.
          </p>
        </div>
      </div>

      {/* Verified badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {VERIFIED_BADGES.map(({ label, icon: Icon }) => (
          <div key={label} className="bg-card-surface border border-accent-green/20 rounded-lg p-3 flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-accent-green/10 border border-accent-green/30 flex items-center justify-center">
              <Icon size={16} className="text-accent-green" />
            </div>
            <span className="text-[11px] font-mono text-text-muted text-center">{label}</span>
            <CheckCircle2 size={13} className="text-accent-green" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* First issues */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-text-primary">Recommended First Issues</h2>
          {FIRST_ISSUES.map(issue => {
            const state = assignStates[issue.id] ?? 'idle'
            return (
              <div key={issue.id} className="bg-card-surface rounded-xl border border-card-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] text-accent-blue">{issue.id}</span>
                      <Badge
                        variant={issue.difficulty === 'Easy' ? 'success' : issue.difficulty === 'Medium' ? 'warning' : 'error'}
                        className="text-[10px]"
                      >
                        {issue.difficulty}
                      </Badge>
                      <span className="text-[11px] text-text-muted font-mono">{issue.estimate}</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">{issue.title}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-canvas-dark rounded px-3 py-1.5 font-mono text-[11px] border border-card-border text-text-muted">
                    <GitBranch size={11} className="text-accent-green flex-shrink-0" />
                    <span className="text-accent-green truncate">{state === 'assigned' ? issue.branch : 'branch will be created on assign'}</span>
                  </div>
                  <button
                    onClick={() => state === 'idle' && handleAssign(issue)}
                    disabled={state !== 'idle'}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all',
                      state === 'assigned'
                        ? 'bg-accent-green/15 text-accent-green border border-accent-green/30 cursor-default'
                        : 'bg-accent-green hover:bg-accent-green-hover text-canvas-dark border border-transparent'
                    )}
                  >
                    {state === 'loading' ? (
                      <><Loader2 size={12} className="animate-spin" /> Assigning...</>
                    ) : state === 'assigned' ? (
                      <><CheckCircle2 size={12} /> Assigned</>
                    ) : (
                      'Assign to Me & Create Branch'
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          {/* Dev command */}
          <div className="bg-card-surface rounded-xl border border-card-border p-4 space-y-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Quick Launch</h3>
            <div className="flex items-center gap-2 bg-canvas-dark rounded px-3 py-2 font-mono text-xs border border-card-border">
              <span className="text-text-muted select-none">$</span>
              <code className="text-accent-green flex-1">pnpm dev</code>
              <CopyButton text="pnpm dev" />
            </div>
          </div>

          {/* Q&A search */}
          <div className="bg-card-surface rounded-xl border border-card-border p-4 space-y-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Docs Q&amp;A</h3>
            <form onSubmit={handleQaSearch} className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-canvas-dark border border-card-border rounded px-3 py-2 focus-within:border-accent-blue transition-colors">
                <Search size={12} className="text-text-muted" />
                <input
                  value={qaSearch}
                  onChange={e => setQaSearch(e.target.value)}
                  placeholder="Ask Docs Q&A"
                  className="bg-transparent font-mono text-xs text-text-primary outline-none flex-1 placeholder:text-text-muted"
                />
              </div>
              <button type="submit" className="px-3 py-2 bg-accent-green hover:bg-accent-green-hover text-canvas-dark text-xs font-mono font-semibold rounded transition-colors">
                Go
              </button>
            </form>
          </div>

          {/* Mentor card */}
          <div className="bg-card-surface rounded-xl border border-card-border p-4 space-y-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Your Mentor</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center font-mono text-sm font-bold text-accent-blue flex-shrink-0">
                MR
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Marco Rodriguez</p>
                <p className="text-[11px] text-text-muted font-mono">@m-rodriguez · #eng-core</p>
              </div>
              <Badge variant="success" dot pulse className="ml-auto text-[10px]">Online</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 justify-center"
                leftIcon={<MessageSquare size={12} />}
                onClick={() => alert('Opening Slack #eng-core...')}
              >
                Slack
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 justify-center"
                leftIcon={<CalendarDays size={12} />}
                onClick={() => alert('Opening 1:1 scheduler...')}
              >
                Book 1:1
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Telemetry bar */}
      <div className="border-t border-card-border pt-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-text-muted">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5"><Activity size={11} className="text-accent-green" />Latency: 12ms</span>
          <span>cluster: nexus-dev-01</span>
          <span>branch: <span className="text-accent-green">main</span></span>
        </div>
        <Badge variant="info" className="text-[10px]">IBM Bob Handover Complete</Badge>
      </div>
    </div>
  )
}
