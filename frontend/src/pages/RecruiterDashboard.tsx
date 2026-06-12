import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Building2, Users, BarChart3, Calendar, FileText, Trash2, Edit3, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { jobsApi, companiesApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import Modal from '@/components/common/Modal'
import { PageSpinner } from '@/components/common/Spinner'
import { timeAgo, jobTypeLabel, experienceLevelLabel } from '@/utils'
import type { Job } from '@/types'

type Tab = 'jobs' | 'applicants' | 'analytics'

export default function RecruiterDashboard() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('jobs')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showJobForm, setShowJobForm] = useState(false)
  const [editJob, setEditJob] = useState<Job | null>(null)

  const { data: myJobs = [], isLoading } = useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: () => jobsApi.getPostedJobs().then(r => r.data),
  })

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesApi.list().then(r => r.data),
  })

  const { data: applicants = [] } = useQuery({
    queryKey: ['applicants', selectedJob?.id],
    queryFn: () => jobsApi.getApplicants(selectedJob!.id).then(r => r.data),
    enabled: !!selectedJob,
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => jobsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['recruiter-jobs'] }); toast.success('Job deleted') },
  })

  const updateStatusMut = useMutation({
    mutationFn: ({ appId, status }: { appId: number; status: string }) => jobsApi.updateApplicationStatus(appId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applicants', selectedJob?.id] }),
  })

  const statusOptions = ['applied', 'reviewing', 'shortlisted', 'interview', 'rejected', 'hired']
  const statusColors: Record<string, string> = {
    applied: 'bg-blue-100 text-blue-700',
    reviewing: 'bg-yellow-100 text-yellow-700',
    shortlisted: 'bg-purple-100 text-purple-700',
    interview: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    hired: 'bg-emerald-100 text-emerald-700',
  }

  const totalApplications = (myJobs as Job[]).reduce((sum, j) => sum + j.application_count, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
        <button onClick={() => setShowJobForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Post a Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active Jobs', value: (myJobs as Job[]).filter(j => j.is_active).length, icon: Building2 },
          { label: 'Total Applications', value: totalApplications, icon: Users },
          { label: 'Avg per Job', value: (myJobs as Job[]).length ? Math.round(totalApplications / (myJobs as Job[]).length) : 0, icon: BarChart3 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
                <Icon size={20} className="text-brand-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-5 border-b border-gray-200">
        {(['jobs', 'applicants', 'analytics'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t ? 'border-brand-500 text-brand-500' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Jobs Tab */}
      {tab === 'jobs' && (
        isLoading ? <PageSpinner /> : (
          <div className="space-y-3">
            {(myJobs as Job[]).map(job => (
              <div key={job.id} className="card p-5 flex items-start justify-between group">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{job.title}</h3>
                    {!job.is_active && <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">Closed</span>}
                  </div>
                  <p className="text-sm text-gray-600">{job.company?.name} · {job.location}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>{jobTypeLabel(job.job_type)}</span>
                    <span>{experienceLevelLabel(job.experience_level)}</span>
                    <span>Posted {timeAgo(job.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-medium text-brand-500">{job.application_count} applicant{job.application_count !== 1 ? 's' : ''}</span>
                    <button
                      onClick={() => { setSelectedJob(job); setTab('applicants') }}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      View →
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditJob(job)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => deleteMut.mutate(job.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {(myJobs as Job[]).length === 0 && (
              <div className="card p-12 text-center text-gray-400">
                <Building2 size={48} className="mx-auto mb-3 opacity-30" />
                <p>No jobs posted yet. Post your first job!</p>
              </div>
            )}
          </div>
        )
      )}

      {/* Applicants Tab */}
      {tab === 'applicants' && (
        <div>
          {/* Job selector */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {(myJobs as Job[]).map(j => (
              <button
                key={j.id}
                onClick={() => setSelectedJob(j)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                  selectedJob?.id === j.id ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {j.title} ({j.application_count})
              </button>
            ))}
          </div>

          {selectedJob ? (
            <div className="space-y-3">
              {(applicants as Record<string, unknown>[]).length === 0 ? (
                <div className="card p-8 text-center text-gray-400">No applicants yet</div>
              ) : (applicants as Record<string, unknown>[]).map(app => {
                const applicant = app.applicant as { id: number; username: string; profile?: { first_name: string; last_name: string; headline?: string; avatar_url?: string } }
                return (
                  <div key={app.id as number} className="card p-4 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">
                        {applicant?.profile?.first_name?.[0]}{applicant?.profile?.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{applicant?.profile?.first_name} {applicant?.profile?.last_name}</p>
                        <p className="text-xs text-gray-500">{applicant?.profile?.headline}</p>
                        <p className="text-xs text-gray-400">Applied {timeAgo(app.applied_at as string)}</p>
                        {(app.cover_letter as string) && (
                          <p className="text-xs text-gray-600 mt-1 italic line-clamp-2">"{app.cover_letter as string}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={app.status as string}
                        onChange={e => updateStatusMut.mutate({ appId: app.id as number, status: e.target.value })}
                        className={`text-xs rounded-full px-3 py-1 font-medium border-0 cursor-pointer ${statusColors[app.status as string] || 'bg-gray-100'}`}
                      >
                        {statusOptions.map(s => <option key={s} value={s} className="bg-white text-gray-800">{s}</option>)}
                      </select>
                      {(app.resume_url as string) && (
                        <a href={app.resume_url as string} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-gray-100 rounded text-gray-500">
                          <FileText size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="card p-8 text-center text-gray-400">Select a job to view applicants</div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {tab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Applications by Job</h3>
            <div className="space-y-3">
              {(myJobs as Job[]).map(j => (
                <div key={j.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate">{j.title}</span>
                    <span className="font-medium ml-2">{j.application_count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${Math.min(100, (j.application_count / Math.max(...(myJobs as Job[]).map(x => x.application_count), 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total jobs posted</span>
                <span className="font-semibold">{(myJobs as Job[]).length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Active listings</span>
                <span className="font-semibold">{(myJobs as Job[]).filter(j => j.is_active).length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total applicants</span>
                <span className="font-semibold">{totalApplications}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Easy Apply enabled</span>
                <span className="font-semibold">{(myJobs as Job[]).filter(j => j.is_easy_apply).length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      <PostJobModal
        isOpen={showJobForm}
        onClose={() => setShowJobForm(false)}
        companies={companies as Record<string, unknown>[]}
        onSuccess={() => qc.invalidateQueries({ queryKey: ['recruiter-jobs'] })}
      />
    </div>
  )
}

function PostJobModal({ isOpen, onClose, companies, onSuccess }: {
  isOpen: boolean; onClose: () => void; companies: Record<string, unknown>[]; onSuccess: () => void
}) {
  const [form, setForm] = useState({
    company_id: '', title: '', description: '', requirements: '', benefits: '',
    location: '', is_remote: false, job_type: 'full_time', experience_level: 'mid_senior',
    salary_min: '', salary_max: '', is_easy_apply: false,
  })
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const createMut = useMutation({
    mutationFn: () => jobsApi.create({ ...form, company_id: parseInt(form.company_id), salary_min: form.salary_min ? parseInt(form.salary_min) : null, salary_max: form.salary_max ? parseInt(form.salary_max) : null }),
    onSuccess: () => { onSuccess(); onClose(); toast.success('Job posted!') },
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post a Job" size="lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Company *</label>
          <select value={form.company_id} onChange={e => set('company_id', e.target.value)} className="input">
            <option value="">Select company</option>
            {companies.map(c => <option key={c.id as number} value={c.id as number}>{c.name as string}</option>)}
          </select>
        </div>
        <input value={form.title} onChange={e => set('title', e.target.value)} className="input" placeholder="Job title *" />
        <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input h-28 resize-none" placeholder="Job description" />
        <textarea value={form.requirements} onChange={e => set('requirements', e.target.value)} className="input h-24 resize-none" placeholder="Requirements" />
        <textarea value={form.benefits} onChange={e => set('benefits', e.target.value)} className="input h-20 resize-none" placeholder="Benefits" />
        <input value={form.location} onChange={e => set('location', e.target.value)} className="input" placeholder="Location" />
        <div className="grid grid-cols-2 gap-4">
          <select value={form.job_type} onChange={e => set('job_type', e.target.value)} className="input">
            {['full_time', 'part_time', 'contract', 'internship'].map(t => <option key={t} value={t}>{jobTypeLabel(t)}</option>)}
          </select>
          <select value={form.experience_level} onChange={e => set('experience_level', e.target.value)} className="input">
            {['entry', 'associate', 'mid_senior', 'director', 'executive'].map(l => <option key={l} value={l}>{experienceLevelLabel(l)}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input value={form.salary_min} onChange={e => set('salary_min', e.target.value)} className="input" type="number" placeholder="Min salary ($)" />
          <input value={form.salary_max} onChange={e => set('salary_max', e.target.value)} className="input" type="number" placeholder="Max salary ($)" />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={form.is_remote} onChange={e => set('is_remote', e.target.checked)} /> Remote
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={form.is_easy_apply} onChange={e => set('is_easy_apply', e.target.checked)} /> Easy Apply
          </label>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={() => createMut.mutate()} disabled={!form.company_id || !form.title || createMut.isPending} className="btn-primary">
            {createMut.isPending ? 'Posting…' : 'Post Job'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
