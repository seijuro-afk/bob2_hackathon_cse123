import { cn } from '../../lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export default function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-card-border bg-card-surface',
        className
      )}
    >
      {children}
    </div>
  )
}
