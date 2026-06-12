import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bookmark, Eye, Users } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { usersApi } from '@/services/api'
import Avatar from '@/components/common/Avatar'
import { getFullName } from '@/utils'

export default function LeftSidebar() {
  const { user } = useAuthStore()
  const name = getFullName(user?.profile)

  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => usersApi.getStats(user!.id).then(r => r.data),
    enabled: !!user,
  })

  return (
    <aside className="space-y-2 w-full">
      {/* Profile card */}
      <div className="card overflow-hidden">
        {/* Banner */}
        <div
          className="h-14 relative"
          style={{
            background: user?.profile?.banner_url
              ? `url(${user.profile.banner_url}) center/cover`
              : 'linear-gradient(135deg, #0a66c2 0%, #0854a4 100%)'
          }}
        />
        <div className="px-4 pb-4">
          <div className="-mt-7 mb-2">
            <Link to={`/profile/${user?.id}`}>
              <Avatar
                src={user?.profile?.avatar_url}
                name={name}
                size="xl"
                className="ring-2 ring-white"
              />
            </Link>
          </div>
          <Link to={`/profile/${user?.id}`} className="font-semibold hover:underline block leading-tight">
            {name}
          </Link>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{user?.profile?.headline}</p>

          {user?.profile?.open_to_work && (
            <div className="mt-2 text-xs bg-green-50 text-green-700 border border-green-200 rounded px-2 py-1 inline-block">
              Open to work
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-gray-600">
                <Eye size={14} /> Profile views
              </span>
              <span className="font-semibold text-brand-500">{user?.profile?.profile_views || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-gray-600">
                <Users size={14} /> Connections
              </span>
              <span className="font-semibold text-brand-500">{stats?.connections || 0}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 px-4 py-3">
          <Link to="/network" className="flex items-center justify-between text-xs text-gray-600 hover:text-brand-500">
            <span className="flex items-center gap-1.5">
              <Bookmark size={14} /> Saved items
            </span>
          </Link>
        </div>
      </div>

      {/* Recent activity */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent activity</h3>
        <Link to={`/profile/${user?.id}`} className="text-xs text-brand-500 hover:underline font-medium">
          View all activity →
        </Link>
      </div>
    </aside>
  )
}
