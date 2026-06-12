import React, { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  MapPin, Globe, Briefcase, GraduationCap, Award, Code2,
  Star, MessageCircle, UserPlus, UserCheck, Edit3, Plus, Trash2,
  Download, Camera, PenLine
} from 'lucide-react'
import toast from 'react-hot-toast'
import { usersApi, connectionsApi, messagesApi, postsApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import Avatar from '@/components/common/Avatar'
import Modal from '@/components/common/Modal'
import PostCard from '@/components/feed/PostCard'
import { PageSpinner } from '@/components/common/Spinner'
import { getFullName, formatDate, timeAgo } from '@/utils'
import type { Experience, Education, Certification, Project, Skill } from '@/types'

// ── Edit Profile Modal ────────────────────────────────────────────────────
function EditProfileModal({ isOpen, onClose, profile }: { isOpen: boolean; onClose: () => void; profile: Record<string, unknown> }) {
  const qc = useQueryClient()
  const { updateUser } = useAuthStore()
  const [form, setForm] = useState({
    first_name: (profile.first_name as string) || '',
    last_name: (profile.last_name as string) || '',
    headline: (profile.headline as string) || '',
    bio: (profile.bio as string) || '',
    location: (profile.location as string) || '',
    industry: (profile.industry as string) || '',
    website: (profile.website as string) || '',
    open_to_work: (profile.open_to_work as boolean) || false,
  })

  const mutation = useMutation({
    mutationFn: () => usersApi.updateProfile(form),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['user'] })
      updateUser({ profile: res.data })
      toast.success('Profile updated')
      onClose()
    },
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit profile" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First name *</label>
            <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last name *</label>
            <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className="input" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Headline</label>
          <input value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} className="input" placeholder="e.g. Senior Engineer at TechCorp" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">About</label>
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className="input h-28 resize-none" placeholder="Write a summary about yourself" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="input" placeholder="City, Country" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Industry</label>
            <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className="input" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Website</label>
          <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} className="input" placeholder="https://" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.open_to_work} onChange={e => setForm(f => ({ ...f, open_to_work: e.target.checked }))} className="rounded" />
          <span className="text-sm">Open to work</span>
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Experience Form ──────────────────────────────────────────────────────
function ExperienceForm({ initial, onSave, onCancel }: { initial?: Experience; onSave: (data: Record<string, unknown>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    company: initial?.company || '',
    employment_type: initial?.employment_type || 'Full-time',
    location: initial?.location || '',
    is_current: initial?.is_current || false,
    start_date: initial?.start_date || '',
    end_date: initial?.end_date || '',
    description: initial?.description || '',
  })
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))
  return (
    <div className="space-y-3">
      <input value={form.title} onChange={e => set('title', e.target.value)} className="input" placeholder="Title *" />
      <input value={form.company} onChange={e => set('company', e.target.value)} className="input" placeholder="Company *" />
      <select value={form.employment_type} onChange={e => set('employment_type', e.target.value)} className="input">
        {['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship', 'Volunteer'].map(t => <option key={t}>{t}</option>)}
      </select>
      <input value={form.location} onChange={e => set('location', e.target.value)} className="input" placeholder="Location" />
      <div className="grid grid-cols-2 gap-3">
        <input value={form.start_date} onChange={e => set('start_date', e.target.value)} className="input" placeholder="Start (YYYY-MM)" />
        {!form.is_current && <input value={form.end_date} onChange={e => set('end_date', e.target.value)} className="input" placeholder="End (YYYY-MM)" />}
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={form.is_current} onChange={e => set('is_current', e.target.checked)} />
        Currently working here
      </label>
      <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input h-24 resize-none" placeholder="Description" />
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="btn-outline">Cancel</button>
        <button onClick={() => onSave(form)} className="btn-primary">Save</button>
      </div>
    </div>
  )
}

// ── Education Form ───────────────────────────────────────────────────────
function EducationForm({ initial, onSave, onCancel }: { initial?: Education; onSave: (data: Record<string, unknown>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    school: initial?.school || '',
    degree: initial?.degree || '',
    field_of_study: initial?.field_of_study || '',
    start_date: initial?.start_date || '',
    end_date: initial?.end_date || '',
    grade: initial?.grade || '',
    description: initial?.description || '',
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  return (
    <div className="space-y-3">
      <input value={form.school} onChange={e => set('school', e.target.value)} className="input" placeholder="School *" />
      <input value={form.degree} onChange={e => set('degree', e.target.value)} className="input" placeholder="Degree" />
      <input value={form.field_of_study} onChange={e => set('field_of_study', e.target.value)} className="input" placeholder="Field of study" />
      <div className="grid grid-cols-2 gap-3">
        <input value={form.start_date} onChange={e => set('start_date', e.target.value)} className="input" placeholder="Start (YYYY-MM)" />
        <input value={form.end_date} onChange={e => set('end_date', e.target.value)} className="input" placeholder="End (YYYY-MM)" />
      </div>
      <input value={form.grade} onChange={e => set('grade', e.target.value)} className="input" placeholder="Grade / GPA" />
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="btn-outline">Cancel</button>
        <button onClick={() => onSave(form)} className="btn-primary">Save</button>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user: currentUser, updateUser } = useAuthStore()
  const qc = useQueryClient()
  const profileId = userId ? parseInt(userId) : currentUser?.id
  const isOwn = profileId === currentUser?.id

  const [editOpen, setEditOpen] = useState(false)
  const [addExpOpen, setAddExpOpen] = useState(false)
  const [editExpId, setEditExpId] = useState<number | null>(null)
  const [addEduOpen, setAddEduOpen] = useState(false)
  const [editEduId, setEditEduId] = useState<number | null>(null)
  const [addSkillOpen, setAddSkillOpen] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [addCertOpen, setAddCertOpen] = useState(false)
  const [addProjOpen, setAddProjOpen] = useState(false)
  const avatarRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  const { data: profileUser, isLoading } = useQuery({
    queryKey: ['user', profileId],
    queryFn: () => usersApi.getUser(profileId!).then(r => r.data),
    enabled: !!profileId,
  })

  const { data: stats } = useQuery({
    queryKey: ['user-stats', profileId],
    queryFn: () => usersApi.getStats(profileId!).then(r => r.data),
    enabled: !!profileId,
  })

  const { data: experiences = [] } = useQuery({
    queryKey: ['experiences', profileId],
    queryFn: () => usersApi.getExperiences(profileId!).then(r => r.data),
    enabled: !!profileId,
  })

  const { data: educations = [] } = useQuery({
    queryKey: ['educations', profileId],
    queryFn: () => usersApi.getEducations(profileId!).then(r => r.data),
    enabled: !!profileId,
  })

  const { data: skills = [] } = useQuery({
    queryKey: ['skills', profileId],
    queryFn: () => usersApi.getSkills(profileId!).then(r => r.data),
    enabled: !!profileId,
  })

  const { data: certifications = [] } = useQuery({
    queryKey: ['certifications', profileId],
    queryFn: () => usersApi.getCertifications(profileId!).then(r => r.data),
    enabled: !!profileId,
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', profileId],
    queryFn: () => usersApi.getProjects(profileId!).then(r => r.data),
    enabled: !!profileId,
  })

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', profileId],
    queryFn: () => usersApi.getRecommendations(profileId!).then(r => r.data),
    enabled: !!profileId,
  })

  const { data: posts = [] } = useQuery({
    queryKey: ['user-posts', profileId],
    queryFn: () => postsApi.getUserPosts(profileId!).then(r => r.data),
    enabled: !!profileId,
  })

  // Connection state
  const { data: connections = [] } = useQuery({
    queryKey: ['connections'],
    queryFn: () => connectionsApi.getMyConnections().then(r => r.data),
  })
  const { data: sentReqs = [] } = useQuery({
    queryKey: ['sent-reqs'],
    queryFn: () => connectionsApi.getSent().then(r => r.data),
  })
  const { data: incomingReqs = [] } = useQuery({
    queryKey: ['incoming-reqs'],
    queryFn: () => connectionsApi.getIncoming().then(r => r.data),
  })

  const isConnected = connections.some((c: { user: { id: number }; connection_id: number }) => c.user.id === profileId)
  const sentReq = sentReqs.find((r: { addressee: { id: number }; id: number }) => r.addressee?.id === profileId)
  const incomingReq = incomingReqs.find((r: { requester: { id: number }; id: number }) => r.requester?.id === profileId)

  const connectMutation = useMutation({
    mutationFn: () => connectionsApi.sendRequest(profileId!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sent-reqs'] }); toast.success('Request sent!') },
  })

  const withdrawMutation = useMutation({
    mutationFn: (id: number) => connectionsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sent-reqs'] }); toast.success('Request withdrawn') },
  })

  const acceptMutation = useMutation({
    mutationFn: (id: number) => connectionsApi.accept(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incoming-reqs'] })
      qc.invalidateQueries({ queryKey: ['connections'] })
      toast.success('Connected!')
    },
  })

  const messageMutation = useMutation({
    mutationFn: async () => {
      const res = await messagesApi.createConversation(profileId!)
      return res.data
    },
    onSuccess: (data) => { window.location.href = `/messaging?conv=${data.conversation_id}` },
  })

  const addExpMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => usersApi.addExperience(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['experiences', profileId] }); setAddExpOpen(false) },
  })

  const updateExpMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => usersApi.updateExperience(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['experiences', profileId] }); setEditExpId(null) },
  })

  const deleteExpMutation = useMutation({
    mutationFn: (id: number) => usersApi.deleteExperience(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['experiences', profileId] }),
  })

  const addEduMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => usersApi.addEducation(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['educations', profileId] }); setAddEduOpen(false) },
  })

  const deleteEduMutation = useMutation({
    mutationFn: (id: number) => usersApi.deleteEducation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['educations', profileId] }),
  })

  const addSkillMutation = useMutation({
    mutationFn: (name: string) => usersApi.addSkill(name),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['skills', profileId] }); setAddSkillOpen(false); setNewSkill('') },
  })

  const removeSkillMutation = useMutation({
    mutationFn: (id: number) => usersApi.removeSkill(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills', profileId] }),
  })

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['user', profileId] })
      if (currentUser) updateUser({ profile: { ...currentUser.profile, avatar_url: res.data.avatar_url } as typeof currentUser.profile })
      toast.success('Photo updated')
    },
  })

  const uploadBanner = useMutation({
    mutationFn: (file: File) => usersApi.uploadBanner(file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user', profileId] }); toast.success('Banner updated') },
  })

  if (isLoading) return <PageSpinner />
  if (!profileUser) return <div className="p-8 text-center text-gray-500">User not found</div>

  const name = getFullName(profileUser.profile)
  const p = profileUser.profile

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-3">
      {/* Header card */}
      <div className="card overflow-hidden">
        {/* Banner */}
        <div
          className="h-36 relative group"
          style={{
            background: p?.banner_url
              ? `url(${p.banner_url}) center/cover`
              : 'linear-gradient(135deg, #0a66c2 0%, #0854a4 100%)'
          }}
        >
          {isOwn && (
            <>
              <button
                onClick={() => bannerRef.current?.click()}
                className="absolute bottom-2 right-2 bg-black/40 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera size={16} />
              </button>
              <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadBanner.mutate(f) }} />
            </>
          )}
        </div>

        <div className="px-6 pb-5">
          <div className="flex items-end justify-between -mt-14 mb-4">
            <div className="relative group">
              <Avatar src={p?.avatar_url} name={name} size="2xl" className="ring-4 ring-white" />
              {isOwn && (
                <>
                  <button
                    onClick={() => avatarRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <Camera size={14} />
                  </button>
                  <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar.mutate(f) }} />
                </>
              )}
            </div>

            <div className="flex items-center gap-2 mt-14">
              {isOwn ? (
                <>
                  <button onClick={() => setEditOpen(true)} className="btn-outline flex items-center gap-1.5">
                    <Edit3 size={14} /> Edit profile
                  </button>
                  {p?.resume_url && (
                    <a href={p.resume_url} download className="btn-outline flex items-center gap-1.5">
                      <Download size={14} /> Resume
                    </a>
                  )}
                </>
              ) : (
                <>
                  {isConnected ? (
                    <span className="flex items-center gap-1 text-sm font-semibold text-gray-600 border border-gray-300 rounded-full px-4 py-1.5">
                      <UserCheck size={14} /> Connected
                    </span>
                  ) : sentReq ? (
                    <button onClick={() => withdrawMutation.mutate(sentReq.id)} className="btn-outline">
                      Withdraw
                    </button>
                  ) : incomingReq ? (
                    <button onClick={() => acceptMutation.mutate(incomingReq.id)} className="btn-primary flex items-center gap-1.5">
                      <UserPlus size={14} /> Accept
                    </button>
                  ) : (
                    <button onClick={() => connectMutation.mutate()} className="btn-primary flex items-center gap-1.5">
                      <UserPlus size={14} /> Connect
                    </button>
                  )}
                  <button onClick={() => messageMutation.mutate()} className="btn-outline flex items-center gap-1.5">
                    <MessageCircle size={14} /> Message
                  </button>
                </>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-semibold">{name}</h1>
          {p?.headline && <p className="text-gray-700 mt-1">{p.headline}</p>}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
            {p?.location && (
              <span className="flex items-center gap-1"><MapPin size={14} /> {p.location}</span>
            )}
            {p?.industry && (
              <span className="flex items-center gap-1"><Briefcase size={14} /> {p.industry}</span>
            )}
            {p?.website && (
              <a href={p.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-500 hover:underline">
                <Globe size={14} /> {p.website}
              </a>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 text-sm">
            <span className="text-brand-500 font-semibold hover:underline cursor-pointer">
              {stats?.connections || 0} connections
            </span>
            {p?.open_to_work && (
              <span className="bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-0.5 text-xs font-medium">
                Open to work
              </span>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      {p?.bio && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">About</h2>
            {isOwn && <button onClick={() => setEditOpen(true)} className="p-1 hover:bg-gray-100 rounded"><PenLine size={16} className="text-gray-500" /></button>}
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{p.bio}</p>
        </div>
      )}

      {/* Experience */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0 flex items-center gap-2"><Briefcase size={18} /> Experience</h2>
          {isOwn && (
            <button onClick={() => setAddExpOpen(true)} className="p-1 hover:bg-gray-100 rounded">
              <Plus size={18} className="text-gray-500" />
            </button>
          )}
        </div>

        {addExpOpen && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <ExperienceForm onSave={(data) => addExpMutation.mutate(data)} onCancel={() => setAddExpOpen(false)} />
          </div>
        )}

        <div className="space-y-5">
          {(experiences as Experience[]).map(exp => (
            <div key={exp.id}>
              {editExpId === exp.id ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <ExperienceForm
                    initial={exp}
                    onSave={(data) => updateExpMutation.mutate({ id: exp.id, data })}
                    onCancel={() => setEditExpId(null)}
                  />
                </div>
              ) : (
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    <Briefcase size={18} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{exp.title}</h3>
                        <p className="text-sm text-gray-600">{exp.company} · {exp.employment_type}</p>
                        <p className="text-xs text-gray-400">
                          {formatDate(exp.start_date || '')} – {exp.is_current ? 'Present' : formatDate(exp.end_date || '')}
                          {exp.location && ` · ${exp.location}`}
                        </p>
                        {exp.description && <p className="text-sm text-gray-600 mt-1">{exp.description}</p>}
                      </div>
                      {isOwn && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditExpId(exp.id)} className="p-1 hover:bg-gray-100 rounded">
                            <PenLine size={14} className="text-gray-500" />
                          </button>
                          <button onClick={() => deleteExpMutation.mutate(exp.id)} className="p-1 hover:bg-gray-100 rounded">
                            <Trash2 size={14} className="text-red-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0 flex items-center gap-2"><GraduationCap size={18} /> Education</h2>
          {isOwn && (
            <button onClick={() => setAddEduOpen(true)} className="p-1 hover:bg-gray-100 rounded">
              <Plus size={18} className="text-gray-500" />
            </button>
          )}
        </div>

        {addEduOpen && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <EducationForm onSave={(data) => addEduMutation.mutate(data)} onCancel={() => setAddEduOpen(false)} />
          </div>
        )}

        <div className="space-y-5">
          {(educations as Education[]).map(edu => (
            <div key={edu.id} className="flex items-start gap-4 group">
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                <GraduationCap size={18} className="text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{edu.school}</h3>
                    <p className="text-sm text-gray-600">{edu.degree}{edu.field_of_study && `, ${edu.field_of_study}`}</p>
                    {(edu.start_date || edu.end_date) && (
                      <p className="text-xs text-gray-400">{formatDate(edu.start_date || '')} – {formatDate(edu.end_date || '')}</p>
                    )}
                  </div>
                  {isOwn && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => deleteEduMutation.mutate(edu.id)} className="p-1 hover:bg-gray-100 rounded">
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0 flex items-center gap-2"><Star size={18} /> Skills</h2>
          {isOwn && (
            <button onClick={() => setAddSkillOpen(v => !v)} className="p-1 hover:bg-gray-100 rounded">
              <Plus size={18} className="text-gray-500" />
            </button>
          )}
        </div>

        {isOwn && addSkillOpen && (
          <div className="flex gap-2 mb-4">
            <input value={newSkill} onChange={e => setNewSkill(e.target.value)} className="input" placeholder="Add a skill" onKeyDown={e => e.key === 'Enter' && addSkillMutation.mutate(newSkill)} />
            <button onClick={() => addSkillMutation.mutate(newSkill)} className="btn-primary">Add</button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {(skills as Skill[]).map(s => (
            <div key={s.id} className="group flex items-center gap-1 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
              <span className="text-sm text-brand-700 font-medium">{s.name}</span>
              {s.endorsement_count > 0 && <span className="text-xs text-brand-500">{s.endorsement_count}</span>}
              {isOwn && (
                <button onClick={() => removeSkillMutation.mutate(s.id)} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={12} className="text-red-400" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      {(certifications as Certification[]).length > 0 && (
        <div className="card p-5">
          <h2 className="section-title flex items-center gap-2"><Award size={18} /> Licenses & Certifications</h2>
          <div className="space-y-4">
            {(certifications as Certification[]).map(cert => (
              <div key={cert.id} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                  <Award size={18} className="text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{cert.name}</h3>
                  {cert.issuing_org && <p className="text-sm text-gray-600">{cert.issuing_org}</p>}
                  {cert.issue_date && <p className="text-xs text-gray-400">Issued {formatDate(cert.issue_date)}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {(projects as Project[]).length > 0 && (
        <div className="card p-5">
          <h2 className="section-title flex items-center gap-2"><Code2 size={18} /> Projects</h2>
          <div className="space-y-4">
            {(projects as Project[]).map(proj => (
              <div key={proj.id}>
                <h3 className="font-semibold text-sm">{proj.title}</h3>
                {proj.description && <p className="text-sm text-gray-600 mt-0.5">{proj.description}</p>}
                {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-500 hover:underline mt-0.5 block">{proj.url}</a>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations?.received?.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title">Recommendations</h2>
          <div className="space-y-5">
            {recommendations.received.map((rec: { id: number; giver: { id: number; profile?: { first_name: string; last_name: string; headline?: string; avatar_url?: string } }; text: string; created_at: string; relationship_type?: string }) => (
              <div key={rec.id} className="flex items-start gap-3">
                <Avatar src={rec.giver?.profile?.avatar_url} name={getFullName(rec.giver?.profile)} size="sm" />
                <div>
                  <p className="text-sm font-semibold">{getFullName(rec.giver?.profile)}</p>
                  <p className="text-xs text-gray-500">{rec.giver?.profile?.headline}</p>
                  <p className="text-sm text-gray-700 mt-1 italic">"{rec.text}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity */}
      {(posts as unknown[]).length > 0 && (
        <div className="card p-5">
          <h2 className="section-title">Activity</h2>
          <div className="space-y-3">
            {(posts as { id: number; content: string; created_at: string; like_count: number; comment_count: number }[]).slice(0, 3).map(post => (
              <div key={post.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                <p className="text-gray-700 line-clamp-2">{post.content}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(post.created_at)} · {post.like_count} likes · {post.comment_count} comments</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isOwn && profileUser.profile && (
        <EditProfileModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          profile={profileUser.profile as unknown as Record<string, unknown>}
        />
      )}
    </div>
  )
}
