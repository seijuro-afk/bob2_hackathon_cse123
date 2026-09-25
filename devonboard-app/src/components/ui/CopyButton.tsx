import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '../../lib/utils'

interface CopyButtonProps {
  text: string
  className?: string
  label?: string
  resetMs?: number
}

export default function CopyButton({ text, className, label, resetMs = 1800 }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), resetMs)
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer',
        'bg-card-surface hover:bg-card-hover border border-card-border hover:border-card-border-active',
        copied ? 'text-accent-green' : 'text-text-muted hover:text-text-primary',
        className
      )}
      title="Copy to clipboard"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {label && <span>{copied ? 'copied!' : label}</span>}
    </button>
  )
}
