import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MapPin, Bookmark, BookmarkCheck, Zap, ChevronDown, X, Filter, Building2, Clock
} from 'lucide-react'
import toast from 'react-hot-toast'
import { jobsApi } from '@/services/api'
import Avatar from '@/components/common/Avatar'
import Modal from '@/components/common/Modal'
import { PageSpinner } from '@/components/common/Spinner'
import { formatSalary, jobTypeLabel, experienceLevelLabel, timeAgo } from '@/utils'
import type { Job } from '@/types'

const JOB_TYPES = ['full_time', 'part_time', 'contract', 'internship']
const EXP_LEVELS = ['entry', 'associate', 'mid_senior', 'director']

export default function JobsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('')
  const [expLevel, setExpLevel] = useState('')
  const [isRemote, setIsRemote] = useState<boolean | undefined>()
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'applied'>('search')

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', search, location, jobType, expLevel, isRemote],
    queryFn: () => jobsApi.list({
      q: search || undefined,
      location: location || undefined,
      job_type: jobType || undefined,
      experience_level: expLevel || undefined,
      is_remote: isRemote,
      limit: 40,
    }).then(r => r.data),
    enabled: activeTab === 'search',
  })

  const { data: savedJobs = [] } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: () => jobsApi.getSaved().then(r => r.data),
    enabled: activeTab === 'saved',
  })

  const { data: myApps = [] } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => jobsApi.getMyApplications().then(r => r.data),
    enabled: activeTab === 'applied',
  })

  const saveMut = useMutation({
    mutationFn: (id: number) => jobsApi.save(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
      qc.invalidateQueries({ queryKey: ['saved-jobs'] })
      toast.success(res.data.saved ? 'Job saved!' : 'Job unsaved')
    },
  })

  const applyMut = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      if (coverLetter) fd.append('cover_letter', coverLetter)
      if (resumeFile) fd.append('resume', resumeFile)
      return jobsApi.apply(selectedJob!.id, fd)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
      qc.invalidateQueries({ queryKey: ['my-applications'] })
      setApplyOpen(false)
      setCoverLetter('')
      setResumeFile(null)
      toast.success('Application submitted!')
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { detail?: string } } }
      toast.error(err.response?.data?.detail || 'Failed to apply')
    },
  })

  const jobs = data?.jobs || []
  const total = data?.total || 0

  const statusColors: Record<string, string> = {
    applied: 'bg-blue-100 text-blue-700',
    reviewing: 'bg-yellow-100 text-yellow-700',
    shortlisted: 'bg-purple-100 text-purple-700',
    interview: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    hired: 'bg-emerald-100 text-emerald-700',
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Page tabs */}
      <div className="flex gap-2 mb-4">
        {(['search', 'saved', 'applied'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === t ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {t === 'search' ? 'Search Jobs' : t === 'saved' ? 'Saved Jobs' : 'Applications'}
          </button>
        ))}
      </div>

      {activeTab === 'search' && (
        <div className="flex gap-4">
          {/* Left: Search & Filters + Job List */}
          <div className="flex flex-col gap-3 w-full lg:w-[380px] flex-shrink-0">
            {/* Search */}
            <div className="card p-4 space-y-3">
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 gap-2">
                <Search size={16} className="text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Title, skill, or company"
                  className="bg-transparent text-sm w-full outline-none"
                />
                {search && <button onClick={() => setSearch('')}><X size={14} className="text-gray-400" /></button>}
              </div>
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 gap-2">
                <MapPin size={16} className="text-gray-400" />
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Location"
                  className="bg-transparent text-sm w-full outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select value={jobType} onChange={e => setJobType(e.target.value)} className="text-xs border border-gray-200 rounded-full px-3 py-1 bg-white">
                  <option value="">Job type</option>
                  {JOB_TYPES.map(t => <option key={t} value={t}>{jobTypeLabel(t)}</option>)}
                </select>
                <select value={expLevel} onChange={e => setExpLevel(e.target.value)} className="text-xs border border-gray-200 rounded-full px-3 py-1 bg-white">
                  <option value="">Experience</option>
                  {EXP_LEVELS.map(l => <option key={l} value={l}>{experienceLevelLabel(l)}</option>)}
                </select>
                <button
                  onClick={() => setIsRemote(v => v === true ? undefined : true)}
                  className={`text-xs border rounded-full px-3 py-1 transition-colors ${isRemote ? 'border-brand-500 text-brand-500 bg-brand-50' : 'border-gray-200 bg-white'}`}
                >
                  Remote
                </button>
              </div>
            </div>

            {/* Job list */}
            <div className="text-xs text-gray-500 px-1">{total} results</div>
            {isLoading ? <PageSpinner /> : (
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {jobs.map((job: Job) => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`card w-full text-left p-4 hover:border-brand-300 transition-all ${selectedJob?.id === job.id ? 'border-brand-500 bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        {job.company?.logo_url ? (
                          <img src={job.company.logo_url} alt="" className="w-full h-full rounded object-cover" />
                        ) : (
                          <Building2 size={18} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{job.title}</h3>
                        <p className="text-xs text-gray-600">{job.company?.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} />{job.location}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {job.is_easy_apply && (
                            <span className="flex items-center gap-0.5 text-xs text-brand-500 font-medium">
                              <Zap size={10} /> Easy Apply
                            </span>
                          )}
                          {job.is_remote && <span className="text-xs text-green-600 font-medium">Remote</span>}
                          {job.is_applied && <span className="text-xs text-brand-500 font-medium">Applied</span>}
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); saveMut.mutate(job.id) }}
                        className="flex-shrink-0 p-1 hover:bg-gray-100 rounded"
                      >
                        {job.is_saved ? <BookmarkCheck size={16} className="text-brand-500" /> : <Bookmark size={16} className="text-gray-400" />}
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Job details */}
          <div className="flex-1 hidden lg:block">
            {selectedJob ? (
              <div className="card p-6 sticky top-[72px] max-h-[calc(100vh-100px)] overflow-y-auto">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                      {selectedJob.company?.logo_url ? (
                        <img src={selectedJob.company.logo_url} alt="" className="w-full h-full rounded-lg object-cover" />
                      ) : (
                        <Building2 size={24} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedJob.title}</h2>
                      <p className="text-gray-600">{selectedJob.company?.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14} />{selectedJob.location}</p>
                    </div>
                  </div>
                  <button onClick={() => saveMut.mutate(selectedJob.id)} className="p-2 hover:bg-gray-100 rounded-full">
                    {selectedJob.is_saved ? <BookmarkCheck size={20} className="text-brand-500" /> : <Bookmark size={20} className="text-gray-400" />}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs">{jobTypeLabel(selectedJob.job_type)}</span>
                  <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs">{experienceLevelLabel(selectedJob.experience_level)}</span>
                  {selectedJob.is_remote && <span className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-xs">Remote</span>}
                  {selectedJob.is_easy_apply && <span className="bg-blue-50 text-brand-600 rounded-full px-3 py-1 text-xs flex items-center gap-0.5"><Zap size={10} /> Easy Apply</span>}
                </div>

                {(selectedJob.salary_min || selectedJob.salary_max) && (
                  <p className="text-sm font-medium text-gray-700 mb-4">
                    {formatSalary(selectedJob.salary_min, selectedJob.salary_max)} / year
                  </p>
                )}

                <div className="flex gap-3 mb-6">
                  {selectedJob.is_applied ? (
                    <span className="btn-primary opacity-60 cursor-default">Applied</span>
                  ) : (
                    <button onClick={() => setApplyOpen(true)} className="btn-primary">
                      {selectedJob.is_easy_apply ? '⚡ Easy Apply' : 'Apply'}
                    </button>
                  )}
                  <span className="text-xs text-gray-400 flex items-center gap-1 self-center">
                    <Clock size={12} /> {timeAgo(selectedJob.created_at)}
                  </span>
                </div>

                {selectedJob.description && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">About the role</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{selectedJob.description}</p>
                  </div>
                )}

                {selectedJob.requirements && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Requirements</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{selectedJob.requirements}</p>
                  </div>
                )}

                {selectedJob.benefits && (
                  <div>
                    <h3 className="font-semibold mb-2">Benefits</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{selectedJob.benefits}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="card p-12 text-center text-gray-400">
                <Briefcase size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-lg">Select a job to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved jobs */}
      {activeTab === 'saved' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(savedJobs as Job[]).length === 0 ? (
            <p className="text-gray-500 col-span-2 text-center py-12">No saved jobs yet</p>
          ) : (savedJobs as Job[]).map(job => (
            <div key={job.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{job.title}</h3>
                  <p className="text-xs text-gray-600">{job.company?.name} · {job.location}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => { setSelectedJob(job); setActiveTab('search') }} className="text-xs btn-outline py-1">View</button>
                    <button onClick={() => saveMut.mutate(job.id)} className="text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Applications */}
      {activeTab === 'applied' && (
        <div className="space-y-3">
          {(myApps as { id: number; status: string; applied_at: string; job?: Job }[]).length === 0 ? (
            <p className="text-gray-500 text-center py-12">No applications yet</p>
          ) : (myApps as { id: number; status: string; applied_at: string; job?: Job }[]).map(app => (
            <div key={app.id} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                <Building2 size={18} className="text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{app.job?.title}</h3>
                <p className="text-xs text-gray-500">{app.job?.company?.name} · Applied {timeAgo(app.applied_at)}</p>
              </div>
              <span className={`text-xs font-medium rounded-full px-3 py-1 capitalize ${statusColors[app.status] || 'bg-gray-100 text-gray-600'}`}>
                {app.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      <Modal isOpen={applyOpen} onClose={() => setApplyOpen(false)} title={`Apply: ${selectedJob?.title}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cover Letter</label>
            <textarea
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              className="input h-32 resize-none"
              placeholder="Tell them why you're a great fit..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Resume (optional)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={e => setResumeFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setApplyOpen(false)} className="btn-outline">Cancel</button>
            <button onClick={() => applyMut.mutate()} disabled={applyMut.isPending} className="btn-primary">
              {applyMut.isPending ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function Briefcase({ size, className }: { size: number; className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
}
