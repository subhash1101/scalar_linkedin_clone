import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(date: string | Date): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return ''
  }
}

export function formatDate(date: string | Date, fmt = 'MMM yyyy'): string {
  try {
    return format(new Date(date), fmt)
  } catch {
    return ''
  }
}

export function getFullName(profile?: { first_name?: string; last_name?: string } | null): string {
  if (!profile) return 'Unknown'
  return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown'
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function getAvatarUrl(url?: string | null): string | undefined {
  return url || undefined
}

export function formatSalary(min?: number | null, max?: number | null): string {
  if (!min && !max) return 'Salary not specified'
  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max!)}`
}

export function jobTypeLabel(type: string): string {
  const map: Record<string, string> = {
    full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract',
    temporary: 'Temporary', internship: 'Internship', volunteer: 'Volunteer',
  }
  return map[type] || type
}

export function experienceLevelLabel(level: string): string {
  const map: Record<string, string> = {
    internship: 'Internship', entry: 'Entry level', associate: 'Associate',
    mid_senior: 'Mid-Senior', director: 'Director', executive: 'Executive',
  }
  return map[level] || level
}
