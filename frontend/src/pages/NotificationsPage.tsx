import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { notificationsApi } from '@/services/api'
import Avatar from '@/components/common/Avatar'
import { PageSpinner } from '@/components/common/Spinner'
import { getFullName, timeAgo } from '@/utils'
import type { Notification } from '@/types'
import { cn } from '@/utils'

const TYPE_ICONS: Record<string, string> = {
  like: '👍', celebrate: '🎉', support: '🤝', love: '❤️', insightful: '💡', funny: '😄',
  comment: '💬', mention: '@️', connection_request: '🤝', connection_accepted: '✅',
  job_alert: '💼', profile_view: '👁️', repost: '🔄', endorsement: '⭐',
}

export default function NotificationsPage() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: () => notificationsApi.getAll({ unread_only: filter === 'unread' }).then(r => r.data),
    refetchInterval: 15_000,
  })

  const markReadMut = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); qc.invalidateQueries({ queryKey: ['notification-count'] }) },
  })

  const markAllReadMut = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); qc.invalidateQueries({ queryKey: ['notification-count'] }) },
  })

  const notifications: Notification[] = data?.notifications || []
  const unreadCount: number = data?.unread_count || 0

  function getLink(notif: Notification): string {
    switch (notif.entity_type) {
      case 'post': return `/`
      case 'user': return `/profile/${notif.entity_id}`
      default: return '/'
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">{unreadCount} new</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMut.mutate()}
                className="text-sm text-brand-500 hover:underline flex items-center gap-1"
              >
                <CheckCheck size={16} /> Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex px-6 py-3 gap-4 border-b border-gray-100">
          {(['all', 'unread'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'text-sm font-medium capitalize pb-1 border-b-2 transition-colors',
                filter === f ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {f} {f === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? <PageSpinner /> : notifications.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Bell size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg">No {filter === 'unread' ? 'unread ' : ''}notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map(notif => {
              const actorName = getFullName(notif.actor?.profile)
              return (
                <Link
                  key={notif.id}
                  to={getLink(notif)}
                  onClick={() => !notif.is_read && markReadMut.mutate(notif.id)}
                  className={cn(
                    'flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors',
                    !notif.is_read && 'bg-blue-50'
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar src={notif.actor?.profile?.avatar_url} name={actorName || 'System'} size="md" />
                    <span className="absolute -bottom-0.5 -right-0.5 text-base">{TYPE_ICONS[notif.type] || '🔔'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">
                      <span className="font-semibold">{actorName}</span>
                      {' '}{notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(notif.created_at)}</p>
                  </div>
                  {!notif.is_read && (
                    <div className="w-2.5 h-2.5 bg-brand-500 rounded-full mt-1.5 flex-shrink-0" />
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
