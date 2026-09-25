import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ToastProps {
  message: string
  visible: boolean
  variant?: 'success' | 'info' | 'error'
  onDismiss?: () => void
  durationMs?: number
}

export default function Toast({
  message,
  visible,
  variant = 'success',
  onDismiss,
  durationMs = 2500,
}: ToastProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      setShow(true)
      const t = setTimeout(() => {
        setShow(false)
        onDismiss?.()
      }, durationMs)
      return () => clearTimeout(t)
    } else {
      setShow(false)
    }
  }, [visible, durationMs, onDismiss])

  const variantClasses = {
    success: 'border-[rgba(63,185,80,0.4)] text-accent-green',
    info:    'border-[rgba(88,166,255,0.4)] text-accent-blue',
    error:   'border-[rgba(248,81,73,0.4)] text-accent-red',
  }

  return (
    <div
      className={cn(
        'fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border bg-card-surface shadow-lg font-mono text-sm transition-all duration-300',
        variantClasses[variant],
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      )}
    >
      <span>{message}</span>
      <button onClick={() => { setShow(false); onDismiss?.() }} className="text-text-muted hover:text-text-primary">
        <X size={14} />
      </button>
    </div>
  )
}
