import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, CheckCheck, MoreHorizontal } from 'lucide-react'
import { notificationsApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
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
  const { user } = useAuthStore()
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
    <div style={{ display: 'grid', gridTemplateColumns: '225px 540px 300px', gap: 24, width: 1128, margin: '24px auto', alignItems: 'start' }}>
      
      {/* ── Left Column ────────────────────────────────────────────── */}
      <aside style={{ position: 'sticky', top: 80 }}>
        {/* Profile Card */}
        <div className="card overflow-hidden mb-2 bg-white border border-gray-200 rounded-lg">
          <div className="h-14 relative" style={{
            background: user?.profile?.banner_url
              ? `url(${user.profile.banner_url}) center/cover`
              : 'linear-gradient(135deg, #0a66c2 0%, #0854a4 100%)'
          }}></div>
          <div className="px-4 pb-4 text-center">
            <div className="relative inline-block -mt-8 mb-2">
              <Avatar src={user?.profile?.avatar_url} name={getFullName(user?.profile) || 'User'} size="xl" className="border-2 border-white bg-white" />
            </div>
            <h2 className="text-base font-semibold hover:underline cursor-pointer text-gray-900 leading-tight">
              <Link to={`/profile/${user?.id}`} className="text-gray-900">{getFullName(user?.profile) || 'J Vinay Siva Subhash'}</Link>
            </h2>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 px-2 leading-relaxed">
              {user?.profile?.headline || 'Python Developer 🐍 | Machine Learning & Deep Learning...'}
            </p>
          </div>
        </div>

        {/* Manage Settings */}
        <div className="card bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-[15px] text-gray-900 mb-2">Manage your notifications</h3>
          <a href="#" className="text-sm font-semibold text-[#0a66c2] hover:underline">View settings</a>
        </div>
      </aside>

      {/* ── Center Column ──────────────────────────────────────────── */}
      <section>
        <div className="card bg-white border border-gray-200 rounded-lg overflow-hidden">
          
          {/* Filters */}
          <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-200 overflow-x-auto scrollbar-hide">
            {['All', 'Jobs', 'My posts', 'Mentions'].map(f => (
              <button
                key={f}
                className={cn(
                  'flex-shrink-0 text-[14px] font-semibold px-4 py-1.5 rounded-full transition-colors',
                  f === 'All'
                    ? 'bg-[#01754f] text-white hover:bg-[#006040]'
                    : 'bg-white border border-gray-500 text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-700'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* List */}
          {isLoading ? (
            <div className="p-8"><PageSpinner /></div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Bell size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-lg">No notifications right now</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map(notif => {
                const actorName = getFullName(notif.actor?.profile)
                return (
                  <div
                    key={notif.id}
                    onClick={() => !notif.is_read && markReadMut.mutate(notif.id)}
                    className={cn(
                      'flex items-start px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50',
                      !notif.is_read ? 'bg-[#edf3f8]' : 'bg-white'
                    )}
                  >
                    {/* Blue dot for unread */}
                    <div className="w-4 flex-shrink-0 pt-3">
                      {!notif.is_read && <div className="w-2.5 h-2.5 bg-[#0a66c2] rounded-full" />}
                    </div>

                    {/* Avatar with icon */}
                    <Link to={getLink(notif)} className="relative flex-shrink-0 mr-3 mt-1 block">
                      <Avatar src={notif.actor?.profile?.avatar_url} name={actorName || 'System'} size="lg" />
                      <span className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm text-xs">
                        {TYPE_ICONS[notif.type] || '🔔'}
                      </span>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4 mt-1">
                      <Link to={getLink(notif)} className="text-[14px] text-gray-800 leading-snug block hover:text-[#0a66c2]">
                        <span className="font-semibold text-gray-900">{actorName}</span>
                        {' '}{notif.message}
                      </Link>
                      
                      {/* Optional Action Button based on type */}
                      {(notif.type === 'profile_view' || notif.type === 'job_alert') && (
                        <button className="mt-2 px-4 py-1 border border-[#0a66c2] text-[#0a66c2] font-semibold text-[14px] rounded-full hover:bg-[#eaf4fd] transition-colors">
                          Try Premium for ₹0
                        </button>
                      )}
                    </div>

                    {/* Time & More */}
                    <div className="flex flex-col items-end flex-shrink-0 pt-1">
                      <span className="text-[12px] text-gray-500 mb-2">{timeAgo(notif.created_at)}</span>
                      <button className="text-gray-500 hover:bg-gray-200 p-1 rounded-full transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Right Column ────────────────────────────────────────────── */}
      <aside className="w-[300px] hidden lg:block flex-shrink-0">
        <div className="card bg-white border border-gray-200 rounded-lg p-4 mb-4 text-center shadow-sm">
          <div className="text-[12px] text-gray-500 text-right mb-2">Promoted •••</div>
          <div className="flex gap-3 mb-3 items-center text-left">
            <div className="w-14 h-14 bg-white flex items-center justify-center border border-gray-200 flex-shrink-0">
              <span className="text-[#0a66c2] font-bold text-xl leading-none">OCEAN<br/>BASE</span>
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-semibold text-[14px] text-gray-900 leading-tight">OceanBase</span>
            </div>
          </div>
          <p className="text-[14px] text-gray-700 mb-4 text-left leading-snug">
            One database for transactions, analytics, and AI.
          </p>
          <div className="text-[12px] text-gray-500 mb-4 text-left leading-relaxed">No more separate stacks. Follow for unified distributed DB insights.</div>
          <div className="flex items-center gap-2 mb-4">
            <Avatar name="BANAVATH" size="xs" className="w-6 h-6" />
            <span className="text-[12px] text-gray-500 leading-snug text-left">BANAVATH also follows</span>
          </div>
          <button className="w-full border border-[#0a66c2] text-[#0a66c2] font-semibold text-[15px] rounded-full py-1 hover:bg-[#eaf4fd] transition-colors">
            Follow
          </button>
        </div>

        {/* Footer links */}
        <div className="px-4 text-center text-[12px] text-gray-500 leading-[2]">
          <div className="mb-1">
            <a href="#" className="hover:text-[#0a66c2] hover:underline mx-2">About</a>
            <a href="#" className="hover:text-[#0a66c2] hover:underline mx-2">Accessibility</a>
            <a href="#" className="hover:text-[#0a66c2] hover:underline mx-2">Help Center</a>
          </div>
          <div className="mb-1">
            <a href="#" className="hover:text-[#0a66c2] hover:underline mx-2">Privacy & Terms ▾</a>
            <a href="#" className="hover:text-[#0a66c2] hover:underline mx-2">Ad Choices</a>
          </div>
          <div className="mb-1">
            <a href="#" className="hover:text-[#0a66c2] hover:underline mx-2">Advertising</a>
            <a href="#" className="hover:text-[#0a66c2] hover:underline mx-2">Business Services ▾</a>
          </div>
          <div className="mb-2">
            <a href="#" className="hover:text-[#0a66c2] hover:underline mx-2">Get the LinkedIn app</a>
            <a href="#" className="hover:text-[#0a66c2] hover:underline mx-2">More</a>
          </div>
          <div><strong className="text-[#0a66c2]">LinkedIn</strong> LinkedIn Corporation © 2026</div>
        </div>
      </aside>
    </div>
  )
}
