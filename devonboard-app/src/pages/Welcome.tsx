import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Terminal as TerminalIcon,
  Network,
  UserCog,
  UserPlus,
  LogIn,
  BadgeCheck,
  PlusCircle,
  Play,
  ChevronRight,
  ShieldCheck,
  Clock,
  Users,
  ClipboardList,
  Lock,
} from 'lucide-react'
import Badge from '../components/ui/Badge'
import CopyButton from '../components/ui/CopyButton'
import Button from '../components/ui/Button'
import { cn } from '../lib/utils'

const CLI_CMD = 'npx devonboard join --token DEV-NEXUS-8492 --repo enterprise/nexus-core-api'

type TerminalStatus = { text: string; color: string }

const INITIAL_STATUS: TerminalStatus = {
  text: 'ready: choose an action above or run CLI bootstrap...',
  color: 'text-text-muted',
}

export default function Welcome() {
  const navigate = useNavigate()
  const [termStatus, setTermStatus] = useState<TerminalStatus>(INITIAL_STATUS)

  const handleJoin = () => {
    setTermStatus({
      text: 'authenticating token DEV-NEXUS-8492... starting automated environment bootstrap!',
      color: 'text-accent-green',
    })
    setTimeout(() => navigate('/setup'), 1200)
  }

  const handleCreateTeam = () => {
    setTermStatus({
      text: 'generating team workspace for core-platform with repository enterprise/nexus-core-api...',
      color: 'text-accent-blue',
    })
    setTimeout(() => navigate('/manager'), 1200)
  }

  return (
    <div className="min-h-screen bg-canvas-dark text-text-primary flex flex-col justify-between selection:bg-accent-green/30 selection:text-white antialiased">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col space-y-7 my-auto">

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-card-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-card-surface border border-card-border flex items-center justify-center flex-shrink-0">
              <TerminalIcon size={16} className="text-accent-green" />
            </div>
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm">
              <span className="text-text-muted font-medium">devonboard</span>
              <span className="text-card-border-active">/</span>
              <span className="text-text-primary font-semibold tracking-wide">enterprise / nexus-core-api</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-card-surface text-text-muted border border-card-border">v2.4.0</span>
            </div>
          </div>
          <Badge variant="success" dot pulse>active onboarding</Badge>
        </header>

        {/* Hero */}
        <div className="flex flex-col space-y-2 text-center max-w-2xl mx-auto pt-1">
          <div className="inline-flex items-center justify-center gap-2 text-xs font-mono text-accent-green uppercase tracking-widest font-semibold">
            <Network size={15} />
            <span>role selection &amp; entry path</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome to DevOnboard</h1>
          <p className="text-sm text-text-muted max-w-lg mx-auto">
            Turn weeks of manual repository onboarding into minutes of automated engineering flow. Select your entry path below.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Manager card */}
          <div className="p-5 sm:p-6 rounded-lg border border-card-border bg-card-surface hover:border-card-border-active transition-colors flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="neutral">Manager / Supervisor Role</Badge>
                <UserCog size={18} className="text-text-muted" />
              </div>
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <UserPlus size={18} className="text-accent-green" />
                  Create a Team Workspace
                </h2>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Set up onboarding checklists, configure automated CLI assertions, and provision repositories for incoming engineers.
                </p>
              </div>
              <div className="space-y-3 pt-1 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Team / Org Name</label>
                  <div className="px-3 py-2 rounded bg-canvas-dark border border-card-border text-text-primary flex items-center justify-between">
                    <span className="font-medium">core-platform</span>
                    <span className="text-text-muted">#eng-core</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Default Service Repo</label>
                    <div className="px-3 py-2 rounded bg-canvas-dark border border-card-border text-text-primary truncate">
                      enterprise/nexus-core-api
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Branch</label>
                    <div className="px-3 py-2 rounded bg-canvas-dark border border-card-border">
                      <span className="text-accent-green font-medium">main</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-card-border space-y-2.5">
              <Button
                variant="secondary"
                className="w-full justify-center py-2.5"
                leftIcon={<PlusCircle size={15} className="text-accent-green" />}
                onClick={handleCreateTeam}
              >
                Create Workspace &amp; Setup Pipeline →
              </Button>
              <div className="text-[11px] text-text-muted flex items-center justify-center gap-2 font-mono">
                <span>CLI snippet:</span>
                <code className="text-text-primary bg-canvas-dark px-2 py-0.5 rounded border border-card-border">npx devonboard team init</code>
              </div>
            </div>
          </div>

          {/* Engineer card */}
          <div className="relative p-5 sm:p-6 rounded-lg border border-accent-green/50 bg-card-surface hover:border-accent-green transition-colors flex flex-col justify-between space-y-5 ring-1 ring-accent-green/20">
            <div className="absolute -top-3 right-4">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-accent-green text-canvas-dark font-bold tracking-wide uppercase shadow">Engineer / Intern Role</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="success">New Hire Onboarding</Badge>
                <LogIn size={18} className="text-accent-green" />
              </div>
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <LogIn size={18} className="text-accent-green" />
                  Join Existing Team
                </h2>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Enter your team invite code or repository link to launch your isolated Docker container, verify keys, and start work.
                </p>
              </div>
              <div className="space-y-3 pt-1 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Invite Token / Magic Token</label>
                  <div className="px-3 py-2 rounded bg-canvas-dark border border-accent-green/40 flex items-center justify-between">
                    <span className="font-bold tracking-wider text-accent-green">DEV-NEXUS-8492</span>
                    <BadgeCheck size={15} className="text-accent-green" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Mentor Assignment Preview</label>
                  <div className="px-3 py-2 rounded bg-canvas-dark border border-card-border flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                      <span className="text-accent-blue">@m-rodriguez</span>
                      <span className="text-text-muted">·</span>
                      <span className="text-text-muted">#eng-core</span>
                    </span>
                    <Badge variant="success" className="text-[10px]">Assigned</Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-card-border space-y-2.5">
              <Button
                variant="primary"
                className="w-full justify-center py-2.5 text-xs font-bold"
                leftIcon={<Play size={16} />}
                onClick={handleJoin}
              >
                Join Team &amp; Start Onboarding ↵
              </Button>
              <div className="text-[11px] text-text-muted flex items-center justify-center gap-2 font-mono">
                <span>CLI snippet:</span>
                <code className="text-text-primary bg-canvas-dark px-2 py-0.5 rounded border border-card-border">npx devonboard join --token=DEV-NEXUS-8492</code>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal */}
        <div className="rounded-lg border border-card-border bg-canvas-dark overflow-hidden font-mono text-xs">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-card-border bg-canvas-subtle select-none">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="text-text-muted text-[11px] ml-2 flex items-center gap-1.5 font-medium">
                <TerminalIcon size={13} className="text-text-muted" />
                zsh — devonboard-cli · entry gate
              </span>
            </div>
            <CopyButton text={CLI_CMD} label="copy command" />
          </div>
          <div className="p-4 space-y-2 min-h-[110px] text-text-primary leading-relaxed">
            <div className="flex items-center gap-2">
              <span className="text-accent-blue font-bold">❯</span>
              <span className="font-semibold">{CLI_CMD}</span>
              <span className="text-[10px] text-text-muted ml-auto hidden sm:inline">node v20.11.1</span>
            </div>
            <div className="space-y-1 pl-3 text-text-muted border-l border-card-border text-xs">
              {[
                <>Workspace verified: <span className="text-text-primary font-mono">enterprise/nexus-core-api</span> (branch: main)</>,
                <>Assigned mentor: <span className="text-accent-blue font-mono">@m-rodriguez</span> (Slack notify #eng-core sent)</>,
                <>Local environment profile injected into <span className="text-text-primary">~/.devonboard/profile.json</span></>,
              ].map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <ChevronRight size={13} className="text-accent-green flex-shrink-0" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-text-primary pt-1">
              <span className="text-accent-green font-bold">❯</span>
              <span className={cn('transition-colors', termStatus.color)}>{termStatus.text}</span>
              <span className="w-1.5 h-3.5 bg-accent-green inline-block animate-pulse" />
            </div>
          </div>
        </div>

        {/* Metrics strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 font-mono text-xs">
          {[
            { icon: <ShieldCheck size={15} className="text-accent-green" />, label: 'System Pre-check', value: 'Node 20+, Docker 24+', badge: <Badge variant="success" className="text-[10px]">PASSED</Badge> },
            { icon: <Clock size={15} className="text-accent-blue" />, label: 'Estimated Setup', value: '15 – 20 min', badge: <span className="text-[10px] text-text-muted">automated sync</span> },
            { icon: <Users size={15} className="text-accent-green" />, label: 'Assigned Team & Mentor', value: 'core-platform / @m-rodriguez', badge: null },
            { icon: <ClipboardList size={15} className="text-accent-green" />, label: 'Next Milestone', value: 'Setup Checklist (0/6)', badge: <span className="text-[10px] text-accent-blue">Pending</span> },
          ].map((card, i) => (
            <div key={i} className="p-3.5 rounded-lg border border-card-border bg-card-surface">
              <div className="flex items-center gap-2 text-text-muted mb-1">
                {card.icon}
                <span className="uppercase tracking-wider text-[10px] font-semibold">{card.label}</span>
              </div>
              <div className="text-text-primary font-medium text-sm flex items-center justify-between mt-1">
                <span className="truncate">{card.value}</span>
                {card.badge}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="border-t border-card-border pt-5 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-text-primary font-medium">DevOnboard Engine v2.4.0</span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              System Normal: internal registry connected
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Latency: 12ms</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a href="#docs" className="hover:text-text-primary transition-colors">Documentation</a>
            <a href="#slack" className="hover:text-text-primary transition-colors flex items-center gap-1">
              <span className="text-accent-green">#</span>eng-onboarding
            </a>
            <a href="#vault" className="hover:text-text-primary transition-colors flex items-center gap-1">
              <Lock size={12} className="text-accent-green" />
              Vault SSO Active
            </a>
          </div>
        </footer>

      </div>
    </div>
  )
}
