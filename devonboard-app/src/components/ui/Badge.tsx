import { cn } from '../../lib/utils'

type Variant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple'

interface BadgeProps {
  variant?: Variant
  dot?: boolean
  pulse?: boolean
  className?: string
  children: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  success: 'bg-[rgba(63,185,80,0.12)] text-accent-green border border-[rgba(63,185,80,0.3)]',
  warning: 'bg-[rgba(210,153,34,0.12)] text-accent-amber border border-[rgba(210,153,34,0.3)]',
  error:   'bg-[rgba(248,81,73,0.12)] text-accent-red border border-[rgba(248,81,73,0.3)]',
  info:    'bg-[rgba(88,166,255,0.12)] text-accent-blue border border-[rgba(88,166,255,0.3)]',
  neutral: 'bg-canvas-subtle text-text-muted border border-card-border',
  purple:  'bg-[rgba(188,140,255,0.12)] text-accent-purple border border-[rgba(188,140,255,0.3)]',
}

const dotColors: Record<Variant, string> = {
  success: 'bg-accent-green',
  warning: 'bg-accent-amber',
  error:   'bg-accent-red',
  info:    'bg-accent-blue',
  neutral: 'bg-text-muted',
  purple:  'bg-accent-purple',
}

export default function Badge({ variant = 'neutral', dot, pulse, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium',
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            dotColors[variant],
            pulse && 'animate-pulse'
          )}
        />
      )}
      {children}
    </span>
  )
}
