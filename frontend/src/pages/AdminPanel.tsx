import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Users, Building2, Briefcase, Flag, BarChart3, UserCheck, UserX, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/services/api'
import { PageSpinner } from '@/components/common/Spinner'
import { timeAgo } from '@/utils'

type Tab = 'overview' | 'users' | 'reports'

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>('overview')
  const qc = useQueryClient()

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then(r => r.data),
  })

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.listUsers().then(r => r.data),
    enabled: tab === 'users',
  })

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => adminApi.listReports().then(r => r.data),
    enabled: tab === 'reports',
  })

  const roleMut = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => adminApi.updateRole(id, role),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Role updated') },
  })

  const toggleActiveMut = useMutation({
    mutationFn: (id: number) => adminApi.toggleActive(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Status updated') },
  })

  const reportStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => adminApi.updateReportStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reports'] }),
  })

  const statCards = [
    { label: 'Total Users', value: stats?.users, icon: Users, color: 'text-blue-500 bg-blue-50' },
    { label: 'Companies', value: stats?.companies, icon: Building2, color: 'text-purple-500 bg-purple-50' },
    { label: 'Active Jobs', value: stats?.jobs, icon: Briefcase, color: 'text-green-500 bg-green-50' },
    { label: 'Pending Reports', value: stats?.reports, icon: Flag, color: 'text-red-500 bg-red-50' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={28} className="text-brand-500" />
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {(['overview', 'users', 'reports'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t ? 'border-brand-500 text-brand-500' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
            {t === 'reports' && (stats?.reports || 0) > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{stats?.reports}</span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} mb-3`}>
                  <Icon size={20} />
                </div>
                <p className="text-2xl font-bold">{value ?? '—'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 size={18} /> Platform Health</h3>
            <div className="space-y-3">
              {[
                { label: 'User growth', pct: 78 },
                { label: 'Job fill rate', pct: 62 },
                { label: 'Engagement rate', pct: 45 },
                { label: 'Report resolution', pct: 90 },
              ].map(({ label, pct }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium">{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        usersLoading ? <PageSpinner /> : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Joined</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(users as Record<string, unknown>[]).map(u => (
                  <tr key={u.id as number} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.name as string || u.username as string}</div>
                      <div className="text-xs text-gray-400">@{u.username as string}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email as string}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role as string}
                        onChange={e => roleMut.mutate({ id: u.id as number, role: e.target.value })}
                        className="text-xs border border-gray-200 rounded px-2 py-1"
                      >
                        {['user', 'recruiter', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-xs font-medium rounded-full px-2 py-0.5 ${(u.is_active as boolean) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {(u.is_active as boolean) ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{timeAgo(u.created_at as string)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActiveMut.mutate(u.id as number)}
                        className={`p-1 rounded hover:bg-gray-100 ${(u.is_active as boolean) ? 'text-red-400' : 'text-green-500'}`}
                        title={(u.is_active as boolean) ? 'Ban user' : 'Unban user'}
                      >
                        {(u.is_active as boolean) ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Reports */}
      {tab === 'reports' && (
        reportsLoading ? <PageSpinner /> : (
          <div className="space-y-3">
            {(reports as Record<string, unknown>[]).length === 0 ? (
              <div className="card p-8 text-center text-gray-400">
                <Flag size={40} className="mx-auto mb-2 opacity-30" />
                <p>No reports yet</p>
              </div>
            ) : (reports as Record<string, unknown>[]).map(r => (
              <div key={r.id as number} className="card p-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium bg-gray-100 rounded px-2 py-0.5">{r.entity_type as string}</span>
                    <span className="text-xs text-gray-500">#{r.entity_id as number}</span>
                  </div>
                  <p className="text-sm font-medium">{r.reason as string}</p>
                  {(r.description as string) && <p className="text-xs text-gray-500 mt-0.5">{r.description as string}</p>}
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(r.created_at as string)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${(r.status as string) === 'pending' ? 'bg-yellow-100 text-yellow-700' : (r.status as string) === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {r.status as string}
                  </span>
                  <select
                    value={r.status as string}
                    onChange={e => reportStatusMut.mutate({ id: r.id as number, status: e.target.value })}
                    className="text-xs border border-gray-200 rounded px-2 py-1"
                  >
                    {['pending', 'reviewed', 'resolved', 'dismissed'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
