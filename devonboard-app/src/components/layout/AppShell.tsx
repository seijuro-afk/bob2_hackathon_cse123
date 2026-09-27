import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  ListChecks,
  GitCommitHorizontal,
  BookOpen,
  ShieldCheck,
  Settings2,
  PartyPopper,
  Terminal,
  LogOut,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../lib/AuthContext'

const NAV_ITEMS = [
  { to: '/setup',     label: 'Setup Checklist',       Icon: ListChecks, managerOnly: false },
  { to: '/commits',   label: 'Commit History',         Icon: GitCommitHorizontal, managerOnly: false },
  { to: '/docs',      label: 'Docs Q&A',               Icon: BookOpen, managerOnly: false },
  { to: '/validator', label: 'Environment Validator',  Icon: ShieldCheck, managerOnly: false },
  { to: '/manager',   label: 'Manager Settings',       Icon: Settings2, managerOnly: true },
  { to: '/complete',  label: 'Onboarding Complete',    Icon: PartyPopper, managerOnly: false },
]

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const visibleItems = NAV_ITEMS.filter(item => !item.managerOnly || user?.role === 'manager')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

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
          {visibleItems.map(({ to, label, Icon }) => (
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
        <div className="px-4 py-3 border-t border-card-border space-y-2">
          {user && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono truncate">
                <span className="text-accent-green">@{user.username}</span>
                <span className="text-text-muted"> · {user.role}</span>
              </span>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1 rounded hover:bg-card-hover text-text-muted hover:text-accent-red transition-colors flex-shrink-0"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
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
