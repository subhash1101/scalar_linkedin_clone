import React from 'react'
import { cn, getInitials } from '@/utils'

interface AvatarProps {
  src?: string | null
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  onClick?: () => void
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
}

const colorMap = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500']

function getColor(name: string) {
  const idx = name.charCodeAt(0) % colorMap.length
  return colorMap[idx]
}

export default function Avatar({ src, name, size = 'md', className, onClick }: AvatarProps) {
  const sizeClass = sizeMap[size]
  
  const avatarSrc = src || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'user')}`

  return (
    <img
      src={avatarSrc}
      alt={name}
      className={cn('rounded-full object-cover flex-shrink-0', sizeClass, className, onClick && 'cursor-pointer')}
      onClick={onClick}
      onError={(e) => { e.currentTarget.style.display = 'none' }}
    />
  )
}
