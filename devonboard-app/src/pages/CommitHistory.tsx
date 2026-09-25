import { useState } from 'react'
import { GitCommit, Search, RefreshCw, CheckCheck, FileDiff } from 'lucide-react'
import CopyButton from '../components/ui/CopyButton'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { cn } from '../lib/utils'

type CommitType = 'setup' | 'feature' | 'docs'

interface Commit {
  hash: string
  shortHash: string
  message: string
  author: string
  timestamp: string
  type: CommitType
  tags: string[]
  setupImpact?: string
  diffLines: { type: '+' | '-' | ' '; content: string }[]
}

const COMMITS: Commit[] = [
  {
    hash: 'a3f9c1d2e4b8f0c7',
    shortHash: 'a3f9c1d',
    message: 'feat(docker): add postgres healthcheck to compose.yml',
    author: 'm-rodriguez',
    timestamp: '2 hours ago',
    type: 'setup',
    tags: ['setup-impact', 'docker'],
    setupImpact: 'Required for Task 4: containers now need healthcheck passing before migrations run.',
    diffLines: [
      { type: ' ', content: '  postgres:' },
      { type: ' ', content: '    image: postgres:15-alpine' },
      { type: '+', content: '    healthcheck:' },
      { type: '+', content: '      test: ["CMD-SHELL", "pg_isready -U $POSTGRES_USER"]' },
      { type: '+', content: '      interval: 5s' },
      { type: '+', content: '      retries: 5' },
      { type: ' ', content: '    ports:' },
    ],
  },
  {
    hash: 'b7d2e5f1c9a3b6e0',
    shortHash: 'b7d2e5f',
    message: 'chore(env): update .env.example with VAULT_URL variable',
    author: 's-chen',
    timestamp: '5 hours ago',
    type: 'setup',
    tags: ['setup-impact', 'config'],
    setupImpact: 'New required env variable VAULT_URL added. Re-copy from .env.example.',
    diffLines: [
      { type: ' ', content: 'DATABASE_URL=postgresql://localhost:5432/nexus' },
      { type: '+', content: 'VAULT_URL=https://vault.internal.company.com' },
      { type: '+', content: 'VAULT_TOKEN=' },
      { type: ' ', content: 'REDIS_URL=redis://localhost:6379' },
    ],
  },
  {
    hash: 'c2a1d8f3b5e9c7a4',
    shortHash: 'c2a1d8f',
    message: 'feat(api): add /health endpoint to nexus-core',
    author: 'j-kim',
    timestamp: '1 day ago',
    type: 'feature',
    tags: ['api', 'monitoring'],
    diffLines: [
      { type: '+', content: 'router.get("/health", (req, res) => {' },
      { type: '+', content: '  res.json({ status: "ok", uptime: process.uptime() })' },
      { type: '+', content: '})' },
    ],
  },
  {
    hash: 'd9e4f7c2a1b8d3e5',
    shortHash: 'd9e4f7c',
    message: 'docs(setup): update README with Docker prerequisites',
    author: 'm-rodriguez',
    timestamp: '2 days ago',
    type: 'docs',
    tags: ['docs', 'readme'],
    diffLines: [
      { type: '+', content: '## Prerequisites' },
      { type: '+', content: '- Docker 24.0+' },
      { type: '+', content: '- Node 20+' },
      { type: '+', content: '- pnpm 8.14+' },
    ],
  },
]

type Filter = 'all' | CommitType

export default function CommitHistory() {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Commit>(COMMITS[0])
  const [resolved, setResolved] = useState(false)

  const visible = COMMITS.filter(c => {
    const matchesFilter = filter === 'all' || c.type === filter
    const matchesSearch = !search || c.message.toLowerCase().includes(search.toLowerCase()) || c.shortHash.includes(search)
    return matchesFilter && matchesSearch
  })

  const FILTERS: { label: string; value: Filter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Setup Impact', value: 'setup' },
    { label: 'Features', value: 'feature' },
    { label: 'Docs', value: 'docs' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Breadcrumb + branch */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <span>enterprise/nexus-core-api</span>
          <span>/</span>
          <span className="text-accent-green">main</span>
          <Badge variant="success" className="text-[10px] ml-1">Ahead 0, Behind 0, Clean tree</Badge>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={12} />}>
          Fetch Remote
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Commit History &amp; Changelog</h1>
        <p className="text-sm text-text-muted mt-1">
          Setup-impact commits are flagged and explained in plain English.
        </p>
      </div>

      {/* Filter + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-3 py-1 rounded text-xs font-mono transition-colors',
                filter === f.value
                  ? 'bg-accent-green/15 text-accent-green border border-accent-green/30'
                  : 'text-text-muted hover:text-text-primary border border-transparent'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-canvas-dark border border-card-border rounded px-3 py-1.5 flex-1 max-w-xs">
          <Search size={13} className="text-text-muted flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search commits... (⌘F)"
            className="bg-transparent text-xs font-mono text-text-primary placeholder:text-text-muted outline-none w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Commit feed */}
        <section className="lg:col-span-5 flex flex-col gap-2">
          {visible.length === 0 ? (
            <div className="text-center text-text-muted text-sm py-10">No commits match filter.</div>
          ) : (
            visible.map(commit => (
              <button
                key={commit.hash}
                onClick={() => { setSelected(commit); setResolved(false) }}
                className={cn(
                  'w-full text-left p-3.5 rounded-lg border transition-all',
                  selected.hash === commit.hash
                    ? 'border-accent-green/50 bg-card-surface'
                    : 'border-card-border bg-card-surface hover:border-card-border-active'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {commit.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant={tag === 'setup-impact' ? 'warning' : tag === 'api' ? 'info' : 'neutral'}
                        className="text-[10px]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="font-mono text-[11px] text-text-muted flex-shrink-0">{commit.shortHash}</span>
                </div>
                <p className="text-xs text-text-primary font-medium leading-relaxed mb-1.5">{commit.message}</p>
                <div className="flex items-center justify-between text-[11px] text-text-muted font-mono">
                  <span>@{commit.author}</span>
                  <span>{commit.timestamp}</span>
                </div>
                {commit.setupImpact && (
                  <div className="mt-2 p-2 rounded bg-accent-amber/10 border border-accent-amber/20 text-[11px] text-accent-amber font-mono">
                    ⚠ {commit.setupImpact}
                  </div>
                )}
              </button>
            ))
          )}
        </section>

        {/* Diff inspector */}
        <section className="lg:col-span-7 sticky top-6">
          <div className="rounded-lg border border-card-border bg-card-surface overflow-hidden">
            {/* Diff header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-card-border bg-canvas-subtle">
              <div className="flex items-center gap-2">
                <FileDiff size={14} className="text-text-muted" />
                <span className="font-mono text-xs text-text-primary font-medium truncate max-w-[240px]">
                  {selected.message}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <CopyButton text={selected.diffLines.map(l => l.type + l.content).join('\n')} label="Copy Patch" />
                <Button
                  variant={resolved ? 'ghost' : 'secondary'}
                  size="sm"
                  leftIcon={resolved ? <CheckCheck size={12} className="text-accent-green" /> : undefined}
                  onClick={() => setResolved(true)}
                >
                  {resolved ? 'Applied to Local' : 'Mark Resolved'}
                </Button>
              </div>
            </div>

            {/* Commit meta */}
            <div className="px-4 py-2 border-b border-card-border flex items-center gap-4 font-mono text-[11px] text-text-muted">
              <span><GitCommit size={11} className="inline mr-1" />{selected.shortHash}</span>
              <span>@{selected.author}</span>
              <span>{selected.timestamp}</span>
            </div>

            {/* Diff lines */}
            <div className="p-4 font-mono text-xs space-y-0.5 overflow-x-auto">
              {selected.diffLines.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex gap-2 px-2 py-0.5 rounded-sm',
                    line.type === '+' ? 'bg-accent-green/10 text-accent-green' :
                    line.type === '-' ? 'bg-accent-red/10 text-accent-red' :
                    'text-text-muted'
                  )}
                >
                  <span className="select-none w-3 flex-shrink-0">{line.type}</span>
                  <span>{line.content}</span>
                </div>
              ))}
            </div>

            {selected.setupImpact && !resolved && (
              <div className="mx-4 mb-4 p-3 rounded bg-accent-amber/10 border border-accent-amber/20 text-xs text-accent-amber font-mono">
                <span className="font-semibold">Action required: </span>{selected.setupImpact}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
