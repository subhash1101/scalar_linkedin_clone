import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, UserPlus, UserCheck, UserX, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { connectionsApi } from '@/services/api'
import Avatar from '@/components/common/Avatar'
import { getFullName, timeAgo } from '@/utils'
import { PageSpinner } from '@/components/common/Spinner'

type Tab = 'suggestions' | 'connections' | 'incoming' | 'sent' | 'followers' | 'following'
const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'suggestions', label: 'Grow your network', icon: UserPlus },
  { key: 'connections', label: 'Connections', icon: UserCheck },
  { key: 'incoming', label: 'Invitations', icon: Users },
  { key: 'sent', label: 'Sent', icon: Clock },
]

export default function NetworkPage() {
  const [tab, setTab] = useState<Tab>('incoming')
  const qc = useQueryClient()

  const { data: suggestions = [], isLoading: loadSug } = useQuery({
    queryKey: ['suggestions'],
    queryFn: () => connectionsApi.getSuggestions().then(r => r.data),
    enabled: tab === 'suggestions',
  })
  const { data: connections = [], isLoading: loadConn } = useQuery({
    queryKey: ['connections'],
    queryFn: () => connectionsApi.getMyConnections().then(r => r.data),
    enabled: tab === 'connections',
  })
  const { data: incoming = [], isLoading: loadIn } = useQuery({
    queryKey: ['incoming-reqs'],
    queryFn: () => connectionsApi.getIncoming().then(r => r.data),
  })
  const { data: sent = [] } = useQuery({
    queryKey: ['sent-reqs'],
    queryFn: () => connectionsApi.getSent().then(r => r.data),
    enabled: tab === 'sent',
  })

  const connectMut = useMutation({
    mutationFn: (id: number) => connectionsApi.sendRequest(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['suggestions'] }); toast.success('Request sent!') },
  })
  const acceptMut = useMutation({
    mutationFn: (id: number) => connectionsApi.accept(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incoming-reqs'] })
      qc.invalidateQueries({ queryKey: ['connections'] })
      toast.success('Connected!')
    },
  })
  const rejectMut = useMutation({
    mutationFn: (id: number) => connectionsApi.reject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incoming-reqs'] }),
  })
  const removeMut = useMutation({
    mutationFn: (id: number) => connectionsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['connections'] }),
  })
  const withdrawMut = useMutation({
    mutationFn: (id: number) => connectionsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sent-reqs'] }),
  })

  const isLoading = loadSug || loadConn || loadIn

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="card p-0 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === key ? 'border-brand-500 text-brand-500' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={16} />
              {label}
              {key === 'incoming' && incoming.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {incoming.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {isLoading ? <PageSpinner /> : (
            <>
              {/* Suggestions */}
              {tab === 'suggestions' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">People you may know</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {suggestions.map((u: { id: number; username: string; profile?: { first_name: string; last_name: string; headline?: string; avatar_url?: string } }) => {
                      const name = getFullName(u.profile)
                      return (
                        <div key={u.id} className="border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                          <Link to={`/profile/${u.id}`}>
                            <Avatar src={u.profile?.avatar_url} name={name} size="xl" className="mx-auto mb-2" />
                          </Link>
                          <Link to={`/profile/${u.id}`} className="font-medium text-sm hover:underline block">{name}</Link>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 h-8">{u.profile?.headline}</p>
                          <button
                            onClick={() => connectMut.mutate(u.id)}
                            className="mt-3 w-full border border-brand-500 text-brand-500 rounded-full py-1 text-sm font-medium hover:bg-brand-50 transition-colors"
                          >
                            + Connect
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Connections */}
              {tab === 'connections' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">{connections.length} Connections</h2>
                  <div className="divide-y divide-gray-100">
                    {connections.map((c: { connection_id: number; user: { id: number; username: string; profile?: { first_name: string; last_name: string; headline?: string; avatar_url?: string } }; connected_at: string }) => {
                      const name = getFullName(c.user.profile)
                      return (
                        <div key={c.connection_id} className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <Link to={`/profile/${c.user.id}`}>
                              <Avatar src={c.user.profile?.avatar_url} name={name} size="md" />
                            </Link>
                            <div>
                              <Link to={`/profile/${c.user.id}`} className="font-medium text-sm hover:underline">{name}</Link>
                              <p className="text-xs text-gray-500">{c.user.profile?.headline}</p>
                              <p className="text-xs text-gray-400">Connected {timeAgo(c.connected_at)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeMut.mutate(c.connection_id)}
                            className="btn-outline text-sm text-red-500 border-red-300 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Incoming */}
              {tab === 'incoming' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Invitations ({incoming.length})</h2>
                  {incoming.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No pending invitations</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {incoming.map((req: { id: number; requester: { id: number; username: string; profile?: { first_name: string; last_name: string; headline?: string; avatar_url?: string } }; message?: string; created_at: string }) => {
                        const name = getFullName(req.requester.profile)
                        return (
                          <div key={req.id} className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-3">
                              <Link to={`/profile/${req.requester.id}`}>
                                <Avatar src={req.requester.profile?.avatar_url} name={name} size="md" />
                              </Link>
                              <div>
                                <Link to={`/profile/${req.requester.id}`} className="font-medium text-sm hover:underline">{name}</Link>
                                <p className="text-xs text-gray-500">{req.requester.profile?.headline}</p>
                                {req.message && <p className="text-xs text-gray-600 italic mt-0.5">"{req.message}"</p>}
                                <p className="text-xs text-gray-400">{timeAgo(req.created_at)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => rejectMut.mutate(req.id)} className="btn-outline text-sm">Ignore</button>
                              <button onClick={() => acceptMut.mutate(req.id)} className="btn-primary text-sm">Accept</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Sent */}
              {tab === 'sent' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Sent invitations ({sent.length})</h2>
                  <div className="divide-y divide-gray-100">
                    {sent.map((req: { id: number; addressee: { id: number; username: string; profile?: { first_name: string; last_name: string; headline?: string; avatar_url?: string } }; created_at: string }) => {
                      const name = getFullName(req.addressee.profile)
                      return (
                        <div key={req.id} className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <Link to={`/profile/${req.addressee.id}`}>
                              <Avatar src={req.addressee.profile?.avatar_url} name={name} size="md" />
                            </Link>
                            <div>
                              <Link to={`/profile/${req.addressee.id}`} className="font-medium text-sm hover:underline">{name}</Link>
                              <p className="text-xs text-gray-500">{req.addressee.profile?.headline}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => withdrawMut.mutate(req.id)}
                            className="btn-outline text-sm"
                          >
                            Withdraw
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
