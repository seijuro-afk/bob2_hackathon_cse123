import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight, ExternalLink, FileText, Database, ShieldCheck, GitBranch, Layers } from 'lucide-react'
import CopyButton from '../components/ui/CopyButton'
import Badge from '../components/ui/Badge'
import { cn } from '../lib/utils'

interface QAEntry {
  id: number
  question: string
  answer: string
  snippet: string
  params?: { key: string; value: string; desc: string }[]
  source: string
  category: string
}

type Filter = 'all' | 'setup' | 'database' | 'auth' | 'ci' | 'git'

const QA_ENTRIES: QAEntry[] = [
  {
    id: 1,
    question: 'How do I set up the local database?',
    category: 'setup',
    answer: 'Run `docker compose up -d` to start Postgres, then execute `pnpm db:migrate` to apply all pending migrations. The DATABASE_URL in your .env.local must point to localhost:5432.',
    snippet: 'docker compose up -d\npnpm db:migrate\npnpm db:seed # optional test data',
    params: [
      { key: 'DATABASE_URL', value: 'postgresql://user:pass@localhost:5432/nexus', desc: 'Primary DB connection string' },
      { key: 'POSTGRES_USER', value: 'nexus', desc: 'Postgres username (matches compose.yml)' },
    ],
    source: 'docs/setup/database.md',
  },
  {
    id: 2,
    question: 'What is VAULT_URL and why is it required?',
    category: 'auth',
    answer: 'VAULT_URL points to the HashiCorp Vault instance used for secret rotation and SSO token issuance. Without it, the auth middleware returns 503 on all protected routes.',
    snippet: 'VAULT_URL=https://vault.internal.company.com\nVAULT_TOKEN=<your-dev-token>',
    params: [
      { key: 'VAULT_URL', value: 'https://vault.internal.company.com', desc: 'Vault base URL' },
      { key: 'VAULT_TOKEN', value: 's.xxx...', desc: 'Short-lived dev token from vault login' },
    ],
    source: 'docs/auth/vault-setup.md',
  },
  {
    id: 3,
    question: 'How do I run CI checks locally before pushing?',
    category: 'ci',
    answer: 'Use `pnpm ci:local` to run lint, typecheck, and the full test suite in sequence. This mirrors what the GitHub Actions pipeline runs on PR.',
    snippet: 'pnpm ci:local\n# equivalent to:\n# pnpm lint && pnpm typecheck && pnpm test',
    source: '.github/workflows/ci.yml',
  },
  {
    id: 4,
    question: 'How do I create a feature branch?',
    category: 'git',
    answer: 'Branches follow the pattern `feat/<ticket-id>-short-description`. Push to origin and the PR template will auto-populate from the commit messages.',
    snippet: 'git checkout -b feat/DOT-1234-my-feature\ngit push -u origin feat/DOT-1234-my-feature',
    source: 'docs/git/branching.md',
  },
]

const FILTERS: { label: string; value: Filter; icon: typeof Search }[] = [
  { label: 'All Corpus', value: 'all', icon: Layers },
  { label: 'Setup & Environment', value: 'setup', icon: FileText },
  { label: 'Database', value: 'database', icon: Database },
  { label: 'Auth & IAM', value: 'auth', icon: ShieldCheck },
  { label: 'CI/CD Pipeline', value: 'ci', icon: ChevronRight },
  { label: 'Git Logs & Commits', value: 'git', icon: GitBranch },
]

const DOC_SOURCES = [
  { name: 'docs/setup/', count: 12 },
  { name: 'docs/auth/', count: 8 },
  { name: 'docs/api/', count: 24 },
  { name: '.github/workflows/', count: 4 },
  { name: 'README.md', count: 1 },
]

export default function DocumentationQA() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const [activeQ, setActiveQ] = useState<QAEntry>(QA_ENTRIES[0])
  const [searchQuery, setSearchQuery] = useState('How do I set up the local database?')
  const [bottomSearch, setBottomSearch] = useState('')

  const handleBottomSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (bottomSearch.trim()) {
      navigate('/docs')
      setSearchQuery(bottomSearch)
      setBottomSearch('')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Search header */}
      <div className="bg-card-surface rounded-xl border border-card-border p-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-canvas-dark border border-accent-blue/30 rounded-lg px-3 py-2 flex-1 focus-within:border-accent-blue transition-colors">
            <span className="font-mono text-[11px] text-text-muted select-none">kb://</span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent font-mono text-sm text-text-primary outline-none flex-1 placeholder:text-text-muted"
              placeholder="Search documentation... (⌘K)"
            />
            <kbd className="font-mono text-[10px] bg-card-surface border border-card-border px-1.5 py-0.5 rounded text-text-muted select-none">⌘K</kbd>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
            <Badge variant="success" dot className="text-[10px]">247 files indexed</Badge>
          </div>
        </div>

        {/* Filter badges */}
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono transition-colors',
                activeFilter === f.value
                  ? 'bg-accent-green/15 text-accent-green border border-accent-green/30'
                  : 'bg-canvas-dark text-text-muted border border-card-border hover:text-text-primary'
              )}
            >
              <f.icon size={11} />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          {/* FAQ buttons */}
          <div className="bg-card-surface rounded-xl border border-card-border p-4 space-y-1.5">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Frequently Asked</h3>
            {QA_ENTRIES.map(qa => (
              <button
                key={qa.id}
                onClick={() => { setActiveQ(qa); setSearchQuery(qa.question) }}
                className={cn(
                  'w-full text-left text-xs px-3 py-2 rounded transition-colors font-mono',
                  activeQ.id === qa.id
                    ? 'bg-accent-green/10 text-accent-green border-l-2 border-accent-green pl-2.5'
                    : 'text-text-muted hover:text-text-primary hover:bg-card-hover'
                )}
              >
                {qa.question}
              </button>
            ))}
          </div>

          {/* Doc sources */}
          <div className="bg-card-surface rounded-xl border border-card-border p-4 space-y-2">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Indexed Sources</h3>
            {DOC_SOURCES.map(src => (
              <div key={src.name} className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-text-muted flex items-center gap-1.5">
                  <FileText size={10} />
                  {src.name}
                </span>
                <span className="text-accent-blue">{src.count} docs</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Answer pane */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          {/* Active query */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="info" className="text-[10px]">Verified Answer</Badge>
              <span className="font-mono text-xs text-text-muted">{activeQ.source}</span>
            </div>
            <a href="#" className="flex items-center gap-1 text-xs text-accent-blue hover:text-text-primary transition-colors font-mono">
              View Raw
              <ExternalLink size={11} />
            </a>
          </div>

          {/* Answer card */}
          <div className="bg-card-surface rounded-xl border border-card-border p-5 space-y-4">
            <h2 className="text-base font-semibold text-text-primary">{activeQ.question}</h2>
            <p className="text-sm text-text-muted leading-relaxed">{activeQ.answer}</p>

            {/* Code snippet */}
            <div className="rounded-lg border border-card-border bg-canvas-dark overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-card-border bg-canvas-subtle">
                <span className="font-mono text-[11px] text-text-muted">shell</span>
                <CopyButton text={activeQ.snippet} label="Copy snippet" />
              </div>
              <pre className="p-4 font-mono text-xs text-accent-green overflow-x-auto">{activeQ.snippet}</pre>
            </div>

            {/* Params table */}
            {activeQ.params && activeQ.params.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Environment Variables</h4>
                <div className="rounded border border-card-border overflow-hidden">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-card-border bg-canvas-subtle">
                        <th className="text-left px-3 py-2 text-text-muted font-medium">Key</th>
                        <th className="text-left px-3 py-2 text-text-muted font-medium">Example</th>
                        <th className="text-left px-3 py-2 text-text-muted font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeQ.params.map(p => (
                        <tr key={p.key} className="border-b border-card-border last:border-0">
                          <td className="px-3 py-2 text-accent-green">{p.key}</td>
                          <td className="px-3 py-2 text-text-muted truncate max-w-[160px]">{p.value}</td>
                          <td className="px-3 py-2 text-text-muted">{p.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Bottom search */}
          <form onSubmit={handleBottomSearch} className="bg-card-surface rounded-xl border border-card-border p-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Continue searching</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 flex-1 bg-canvas-dark border border-card-border rounded px-3 py-2 focus-within:border-accent-blue transition-colors">
                <Search size={13} className="text-text-muted flex-shrink-0" />
                <input
                  value={bottomSearch}
                  onChange={e => setBottomSearch(e.target.value)}
                  placeholder="Ask another question..."
                  className="bg-transparent font-mono text-xs text-text-primary outline-none flex-1 placeholder:text-text-muted"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-accent-green hover:bg-accent-green-hover text-canvas-dark text-xs font-mono font-semibold rounded transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
