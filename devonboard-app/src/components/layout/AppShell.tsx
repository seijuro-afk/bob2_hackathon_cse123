import { Outlet, NavLink } from 'react-router-dom'
import {
  ListChecks,
  GitCommitHorizontal,
  BookOpen,
  ShieldCheck,
  Settings2,
  PartyPopper,
  Terminal,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/setup',     label: 'Setup Checklist',       Icon: ListChecks },
  { to: '/commits',   label: 'Commit History',         Icon: GitCommitHorizontal },
  { to: '/docs',      label: 'Docs Q&A',               Icon: BookOpen },
  { to: '/validator', label: 'Environment Validator',  Icon: ShieldCheck },
  { to: '/manager',   label: 'Manager Settings',       Icon: Settings2 },
  { to: '/complete',  label: 'Onboarding Complete',    Icon: PartyPopper },
]

export default function AppShell() {
  return (
    <div className="flex h-screen bg-canvas-dark text-text-primary overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-card-border bg-canvas-subtle">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-card-border">
          <div className="w-7 h-7 rounded bg-card-surface border border-card-border flex items-center justify-center flex-shrink-0">
            <Terminal size={14} className="text-accent-green" />
          </div>
          <span className="font-mono text-sm font-semibold text-text-primary">devonboard</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-colors',
                  isActive
                    ? 'bg-[#1f242c] border-l-2 border-accent-green text-text-primary pl-[9px]'
                    : 'text-text-muted hover:text-text-primary hover:bg-card-surface border-l-2 border-transparent pl-[9px]'
                )
              }
            >
              <Icon size={15} />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-card-border">
          <p className="text-xs text-text-muted font-mono">DevOnboard v0.1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
