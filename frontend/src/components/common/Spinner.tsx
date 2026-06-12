import React from 'react'
import { cn } from '@/utils'

export default function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size]
  return (
    <div className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-brand-500', s, className)} />
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Spinner size="lg" />
    </div>
  )
}
