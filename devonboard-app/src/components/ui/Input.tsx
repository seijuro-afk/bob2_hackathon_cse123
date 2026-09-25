import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ prefix, suffix, className, ...props }, ref) => (
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3 text-text-muted text-xs font-mono select-none pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full bg-canvas-dark border border-card-border rounded text-sm text-text-primary placeholder:text-text-muted',
          'px-3 py-2 font-mono',
          'focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue',
          'transition-colors',
          prefix && 'pl-16',
          suffix && 'pr-10',
          className
        )}
        {...props}
      />
      {suffix && (
        <span className="absolute right-3 text-text-muted text-xs select-none pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  )
)
Input.displayName = 'Input'

export default Input
