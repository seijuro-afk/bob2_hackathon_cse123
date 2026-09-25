import { cn } from '../../lib/utils'

interface TerminalProps {
  title?: string
  rightSlot?: React.ReactNode
  className?: string
  bodyClassName?: string
  children: React.ReactNode
}

export default function Terminal({
  title = 'terminal',
  rightSlot,
  className,
  bodyClassName,
  children,
}: TerminalProps) {
  return (
    <div className={cn('rounded-lg border border-card-border bg-canvas-dark overflow-hidden', className)}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-card-border bg-canvas-subtle select-none">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block" />
          </div>
          <span className="text-text-muted text-[11px] font-mono ml-1">{title}</span>
        </div>
        {rightSlot}
      </div>

      {/* Body */}
      <div className={cn('p-4 font-mono text-xs text-text-primary leading-relaxed', bodyClassName)}>
        {children}
      </div>
    </div>
  )
}
