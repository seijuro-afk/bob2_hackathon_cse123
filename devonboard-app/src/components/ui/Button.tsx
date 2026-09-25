import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  leftIcon?: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent-green hover:bg-accent-green-hover text-[#0a0e14] font-semibold border border-transparent',
  secondary:
    'bg-card-surface hover:bg-card-hover text-text-primary border border-card-border hover:border-card-border-active',
  danger:
    'bg-[rgba(248,81,73,0.12)] hover:bg-[rgba(248,81,73,0.2)] text-accent-red border border-[rgba(248,81,73,0.3)]',
  ghost:
    'bg-transparent hover:bg-card-surface text-text-muted hover:text-text-primary border border-transparent',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5',
  md: 'h-8 px-3.5 text-xs gap-2',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', leftIcon, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded font-mono transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

export default Button
