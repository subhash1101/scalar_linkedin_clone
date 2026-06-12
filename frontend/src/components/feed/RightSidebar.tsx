import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { connectionsApi } from '@/services/api'
import Avatar from '@/components/common/Avatar'
import { getFullName } from '@/utils'
import toast from 'react-hot-toast'

const NEWS = [
  { title: 'AI reshapes hiring practices in 2026', views: '12,842 readers' },
  { title: 'Remote work trends: where are we now?', views: '9,320 readers' },
  { title: 'Top skills employers want this year', views: '7,104 readers' },
  { title: 'How to negotiate your next salary', views: '5,891 readers' },
  { title: 'The rise of the fractional executive', views: '4,230 readers' },
]

export default function RightSidebar() {
  const qc = useQueryClient()

  const { data: suggestions = [] } = useQuery({
    queryKey: ['suggestions'],
    queryFn: () => connectionsApi.getSuggestions().then(r => r.data),
  })

  const connectMutation = useMutation({
    mutationFn: (userId: number) => connectionsApi.sendRequest(userId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['suggestions'] }); toast.success('Request sent!') },
    onError: () => toast.error('Failed to send request'),
  })

  return (
    <aside className="space-y-2 w-full">
      {/* Suggestions */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">People you may know</h3>
        <div className="space-y-4">
          {suggestions.slice(0, 5).map((u: {
            id: number
            username: string
            profile?: { first_name: string; last_name: string; headline?: string; avatar_url?: string }
          }) => {
            const name = getFullName(u.profile)
            return (
              <div key={u.id} className="flex items-start gap-2">
                <Link to={`/profile/${u.id}`}>
                  <Avatar src={u.profile?.avatar_url} name={name} size="sm" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${u.id}`} className="text-sm font-medium hover:underline block truncate">{name}</Link>
                  <p className="text-xs text-gray-500 truncate">{u.profile?.headline}</p>
                  <button
                    onClick={() => connectMutation.mutate(u.id)}
                    disabled={connectMutation.isPending}
                    className="mt-1 flex items-center gap-1 text-xs font-semibold text-gray-600 border border-gray-400 rounded-full px-3 py-0.5 hover:bg-gray-100 transition-colors"
                  >
                    <UserPlus size={12} /> Connect
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        {suggestions.length > 5 && (
          <Link to="/network" className="mt-3 block text-sm text-gray-500 hover:text-gray-700 font-medium text-center">
            View all →
          </Link>
        )}
      </div>

      {/* News */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">LinkedIn News</h3>
        <div className="space-y-3">
          {NEWS.map((item, i) => (
            <div key={i} className="group cursor-pointer">
              <p className="text-sm font-medium group-hover:underline">{item.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.views}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 px-2 flex flex-wrap gap-x-2 gap-y-1">
        {['About', 'Accessibility', 'Help', 'Privacy', 'Terms'].map(link => (
          <a key={link} href="#" className="hover:underline">{link}</a>
        ))}
        <span className="w-full mt-1">LinkedIn Corporation © 2026</span>
      </div>
    </aside>
  )
}
