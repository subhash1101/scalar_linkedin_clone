import React, { useState, useRef } from 'react'
import './ProfilePage.css'
import { useParams, Link } from 'react-router-dom'
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
  const [editExpMode, setEditExpMode] = useState(false)
  const [addEduOpen, setAddEduOpen] = useState(false)
  const [editEduId, setEditEduId] = useState<number | null>(null)
  const [editEduMode, setEditEduMode] = useState(false)
  const [addSkillOpen, setAddSkillOpen] = useState(false)
  const [editSkillMode, setEditSkillMode] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [addProjOpen, setAddProjOpen] = useState(false)
  const [pendingReqs, setPendingReqs] = useState<Set<number>>(new Set())
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

  const updateEduMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => usersApi.updateEducation(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['educations', profileId] }); setEditEduId(null) },
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

  const currentExp = (experiences as Experience[])?.find(e => e.is_current) || (experiences as Experience[])?.[0];
  const latestEdu = (educations as Education[])?.[0];

  return (
    <div className="custom-profile-wrapper">
      <main className="main-container">
        
        <div className="main-column">
            
            <div className="card intro-card">
                <div className="cover-photo" style={{ background: p?.banner_url ? `url(${p.banner_url}) center/cover` : 'url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&q=80) center/cover' }}>
                    {isOwn && (
                      <div className="edit-cover-btn" onClick={() => bannerRef.current?.click()}><i className="fa-solid fa-camera" style={{ fontSize: '14px' }}></i></div>
                    )}
                    <input ref={bannerRef} type="file" accept="image/*" className="hidden" style={{display: 'none'}} onChange={e => { const f = e.target.files?.[0]; if (f) uploadBanner.mutate(f) }} />
                </div>
                <div className="profile-pic-container">
                    <div className="profile-pic" style={{ background: p?.avatar_url ? `url(${p.avatar_url}) center/cover` : '#fff' }}>
                    {isOwn && (
                        <div style={{ position: 'absolute', bottom: '0', right: '0', background: 'white', borderRadius: '50%', padding: '4px', cursor: 'pointer', border: '1px solid #ccc' }} onClick={() => avatarRef.current?.click()}>
                            <i className="fa-solid fa-camera" style={{ fontSize: '14px', color: '#666' }}></i>
                        </div>
                    )}
                    <input ref={avatarRef} type="file" accept="image/*" className="hidden" style={{display: 'none'}} onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar.mutate(f) }} />
                    </div>
                </div>
                {isOwn && (
                  <div className="icon-btn" style={{ position: 'absolute', top: '216px', right: '24px' }} onClick={() => setEditOpen(true)}>
                    <i className="fa-solid fa-pen"></i>
                  </div>
                )}
                
                <div className="intro-content">
                    <div className="intro-left">
                        <div className="profile-name">
                            {name} 
                            <i className="fa-solid fa-shield-halved badge-shield"></i>
                            <span className="pronouns">He/Him</span>
                        </div>
                        <div className="profile-headline">{p?.headline}</div>
                        <div className="profile-location">
                            {p?.location} · <a href="#" style={{ fontWeight: 600 }}>Contact info</a>
                        </div>
                        <a href="#" className="connections-link">{stats?.connections || 0} connections</a>
                    </div>
                    <div className="intro-right">
                        {currentExp && (
                            <div className="company-link">
                                <img src={`https://picsum.photos/seed/${currentExp.id}/32/32`} alt={currentExp.company} className="company-icon" style={{ borderRadius: '50%' }} />
                                <span>{currentExp.company}</span>
                            </div>
                        )}
                        {latestEdu && (
                            <div className="company-link">
                                <img src={`https://picsum.photos/seed/edu${latestEdu.id}/32/32`} alt={latestEdu.school} className="company-icon" style={{ borderRadius: '50%' }} />
                                <span>{latestEdu.school}</span>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="action-buttons">
                    {isOwn ? (
                        <>
                          <button className="btn-primary" onClick={() => setEditOpen(true)}>Open to</button>
                          <button className="btn-outline">Add section</button>
                          {p?.resume_url && (
                             <a href={p.resume_url} download className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center' }}>Resume</a>
                          )}
                        </>
                    ) : (
                        <>
                          {isConnected ? (
                            <button className="btn-outline">Connected</button>
                          ) : sentReq ? (
                            <button className="btn-outline" onClick={() => withdrawMutation.mutate(sentReq.id)}>Withdraw</button>
                          ) : incomingReq ? (
                            <button className="btn-primary" onClick={() => acceptMutation.mutate(incomingReq.id)}>Accept</button>
                          ) : (
                            <button className="btn-primary" onClick={() => connectMutation.mutate()}>Connect</button>
                          )}
                          <button className="btn-outline" onClick={() => messageMutation.mutate()}>Message</button>
                        </>
                    )}
                </div>
            </div>

            {p?.bio && (
                <div className="card card-padding">
                    <div className="card-header-flex">
                        <div className="section-title">About</div>
                        {isOwn && <i className="fa-solid fa-pen" style={{ color: 'var(--text-gray)', cursor: 'pointer' }} onClick={() => setEditOpen(true)}></i>}
                    </div>
                    <div style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                        {p.bio}
                    </div>
                </div>
            )}

            <div className="card card-padding">
                <div className="section-title" style={{ marginBottom: '4px' }}>Analytics</div>
                <div className="analytics-title-area">
                    <i className="fa-solid fa-eye"></i> Private to you
                </div>
                
                <div className="analytics-grid">
                    <div className="stat-item">
                        <i className="fa-solid fa-user-group"></i>
                        <div className="stat-content">
                            <h3>{p?.profile_views || 0} profile views</h3>
                            <p>Discover who's viewed your profile.</p>
                        </div>
                    </div>
                    <div className="stat-item">
                        <i className="fa-solid fa-chart-simple"></i>
                        <div className="stat-content">
                            <h3>{(posts as any[]).length * 10} post impressions</h3>
                            <p>Check out who's engaging with your posts.<br/>Past 7 days</p>
                        </div>
                    </div>
                    <div className="stat-item">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <div className="stat-content">
                            <h3>42 search appearances</h3>
                            <p>See how often you appear in search results.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-footer" style={{ marginTop: '-8px' }}>Show all <i className="fa-solid fa-arrow-right"></i></div>

            {(posts as any[]).length > 0 && (
                <>
                <div className="card card-padding" style={{ paddingBottom: '16px' }}>
                    <div className="card-header-flex">
                        <div>
                            <div className="section-title">Activity</div>
                            <div className="activity-meta"><a href="#">{(posts as any[]).reduce((sum, p) => sum + p.like_count, 0)} engagements</a></div>
                        </div>
                        <div>
                            <button className="btn-post">Create a post</button>
                        </div>
                    </div>

                    <div className="activity-tabs">
                        <div className="activity-tab active">Posts</div>
                        <div className="activity-tab">Videos</div>
                    </div>

                    <div className="posts-grid">
                        {(posts as any[]).slice(0, 2).map(post => (
                          <div className="post-card" key={post.id}>
                              <div className="post-header">
                                  <img src={p?.avatar_url || 'https://via.placeholder.com/32/e16745/fff'} alt="Profile" />
                                  <div className="post-author-info">
                                      <div className="post-author-name">{name} <i className="fa-solid fa-circle-check" style={{ color: 'var(--text-gray)', fontSize: '12px', marginLeft: '4px' }}></i> {isOwn && 'You'}</div>
                                      <div className="post-author-meta">{p?.headline} <br/> {timeAgo(post.created_at)}</div>
                                  </div>
                                  <i className="fa-solid fa-ellipsis" style={{ color: 'var(--text-gray)' }}></i>
                              </div>
                              <div className="post-text">
                                  {post.content}
                              </div>
                              <div className="post-stats">
                                  <div className="post-stats-icons">
                                      <span>👍</span><span>👏</span>
                                  </div>
                                  {post.like_count} • {post.comment_count} comments
                              </div>
                          </div>
                        ))}
                    </div>
                </div>
                <Link to={`/profile/${userId}/posts`} className="card-footer" style={{ marginTop: '-8px', display: 'block' }}>Show all posts <i className="fa-solid fa-arrow-right"></i></Link>
                </>
            )}

            <div className="card card-padding">
                <div className="card-header-flex">
                    <div className="section-title">Experience</div>
                    {isOwn && (
                        <div className="icon-btn-group">
                            <div className="icon-btn" onClick={() => setEditExpMode(!editExpMode)}><i className="fa-solid fa-pen"></i></div>
                            <div className="icon-btn" onClick={() => setAddExpOpen(true)}><i className="fa-solid fa-plus"></i></div>
                        </div>
                    )}
                </div>
                
                {addExpOpen && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <ExperienceForm onSave={(data) => addExpMutation.mutate(data)} onCancel={() => setAddExpOpen(false)} />
                  </div>
                )}
                
                {(experiences as Experience[]).map(exp => (
                    <div key={exp.id} style={{ marginBottom: '16px' }}>
                      {editExpId === exp.id ? (
                        <div className="p-4 bg-gray-50 rounded-lg mb-4">
                          <ExperienceForm
                            initial={exp}
                            onSave={(data) => updateExpMutation.mutate({ id: exp.id, data })}
                            onCancel={() => setEditExpId(null)}
                          />
                        </div>
                      ) : (
                        <div className="list-item">
                            <img src={`https://picsum.photos/seed/${exp.id}/48/48`} alt={exp.company} className="list-logo" style={{ borderRadius: '50%' }} />
                            <div className="list-content flex justify-between items-start" style={{ position: 'relative', width: '100%' }}>
                                <div>
                                  <h3 className="list-title">{exp.title}</h3>
                                  <div className="list-subtitle">{exp.company} · {exp.employment_type}</div>
                                  <div className="list-meta">
                                      <span>{formatDate(exp.start_date || '')} - {exp.is_current ? 'Present' : formatDate(exp.end_date || '')}</span>
                                      <span>{exp.location}</span>
                                      {exp.description && <span style={{ marginTop: '8px', color: 'var(--text-dark)', display: 'block' }}>{exp.description}</span>}
                                  </div>
                                </div>
                                {editExpMode && (
                                  <div className="flex gap-2 ml-4">
                                    <button onClick={() => setEditExpId(exp.id)} className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"><i className="fa-solid fa-pen"></i></button>
                                    <button onClick={() => deleteExpMutation.mutate(exp.id)} className="p-2 hover:bg-red-100 rounded-full text-red-500 transition-colors"><i className="fa-solid fa-trash"></i></button>
                                  </div>
                                )}
                            </div>
                        </div>
                      )}
                    </div>
                ))}
            </div>

            <div className="card card-padding" style={{ paddingBottom: '8px' }}>
                <div className="card-header-flex">
                    <div className="section-title">Education</div>
                    {isOwn && (
                        <div className="icon-btn-group">
                            <div className="icon-btn" onClick={() => setEditEduMode(!editEduMode)}><i className="fa-solid fa-pen"></i></div>
                            <div className="icon-btn" onClick={() => setAddEduOpen(true)}><i className="fa-solid fa-plus"></i></div>
                        </div>
                    )}
                </div>
                
                {addEduOpen && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <EducationForm onSave={(data) => addEduMutation.mutate(data)} onCancel={() => setAddEduOpen(false)} />
                  </div>
                )}
                
                {(educations as Education[]).map(edu => (
                    <div key={edu.id} style={{ marginBottom: '16px' }}>
                      {editEduId === edu.id ? (
                        <div className="p-4 bg-gray-50 rounded-lg mb-4">
                          <EducationForm
                            initial={edu}
                            onSave={(data) => updateEduMutation.mutate({ id: edu.id, data })}
                            onCancel={() => setEditEduId(null)}
                          />
                        </div>
                      ) : (
                        <div className="list-item">
                            <img src={`https://picsum.photos/seed/edu${edu.id}/48/48`} alt={edu.school} className="list-logo" style={{ borderRadius: '50%' }} />
                            <div className="list-content flex justify-between items-start" style={{ position: 'relative', width: '100%' }}>
                                <div>
                                  <h3 className="list-title">{edu.school}</h3>
                                  <div className="list-subtitle">{edu.degree}, {edu.field_of_study}</div>
                                  <div className="list-meta">
                                      <span>{formatDate(edu.start_date || '')} - {formatDate(edu.end_date || '')}</span>
                                  </div>
                                  <div className="list-skills">
                                      {edu.grade && <strong>Grade: {edu.grade}</strong>}
                                  </div>
                                </div>
                                {editEduMode && (
                                  <div className="flex gap-2 ml-4">
                                    <button onClick={() => setEditEduId(edu.id)} className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"><i className="fa-solid fa-pen"></i></button>
                                    <button onClick={() => deleteEduMutation.mutate(edu.id)} className="p-2 hover:bg-red-100 rounded-full text-red-500 transition-colors"><i className="fa-solid fa-trash"></i></button>
                                  </div>
                                )}
                            </div>
                        </div>
                      )}
                    </div>
                ))}
            </div>
            {(educations as Education[]).length > 2 && <div className="card-footer" style={{ marginTop: '-8px' }}>Show all {(educations as Education[]).length} educations <i className="fa-solid fa-arrow-right"></i></div>}

            <div className="card card-padding" style={{ paddingBottom: '8px' }}>
                <div className="card-header-flex">
                    <div className="section-title">Skills ({(skills as Skill[]).length})</div>
                    {isOwn && (
                        <div className="icon-btn-group">
                            <div className="icon-btn" onClick={() => setEditSkillMode(!editSkillMode)}><i className="fa-solid fa-pen"></i></div>
                            <div className="icon-btn" onClick={() => setAddSkillOpen(!addSkillOpen)}><i className="fa-solid fa-plus"></i></div>
                        </div>
                    )}
                </div>
                
                {addSkillOpen && (
                  <div className="flex gap-2 mb-4">
                    <input value={newSkill} onChange={e => setNewSkill(e.target.value)} className="input" placeholder="Add a skill" style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }} onKeyDown={e => { if (e.key === 'Enter' && newSkill) { addSkillMutation.mutate(newSkill); } }} />
                    <button onClick={() => { if (newSkill) addSkillMutation.mutate(newSkill); }} className="btn-primary">Add</button>
                  </div>
                )}
                
                {(skills as Skill[]).map(s => (
                    <div className="skill-item flex justify-between items-center" key={s.id}>
                        <span>{s.name} {s.endorsement_count > 0 && <span style={{ color: 'var(--text-gray)', fontSize: '12px' }}>· {s.endorsement_count} endorsements</span>}</span>
                        {editSkillMode && (
                          <button onClick={() => removeSkillMutation.mutate(s.id)} className="p-1.5 hover:bg-red-100 rounded-full text-red-500 transition-colors ml-4"><i className="fa-solid fa-trash"></i></button>
                        )}
                    </div>
                ))}
            </div>



        </div>

        <div className="sidebar-column">
            
            <div className="card sidebar-section">
                <div className="card-header-flex" style={{ marginBottom: '4px' }}>
                    <span className="sidebar-title" style={{ marginBottom: 0 }}>Profile language</span>
                    <i className="fa-solid fa-pen" style={{ cursor: 'pointer', color: 'var(--text-gray)' }}></i>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-gray)', marginBottom: '16px' }}>English</div>
                <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', marginBottom: '16px' }} />
                <div className="card-header-flex" style={{ marginBottom: '4px' }}>
                    <span className="sidebar-title" style={{ marginBottom: 0 }}>Public profile & URL</span>
                    <i className="fa-solid fa-pen" style={{ cursor: 'pointer', color: 'var(--text-gray)' }}></i>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-gray)' }}>www.linkedin.com/in/{profileUser.username}</div>
            </div>

            <div className="card sidebar-section">
                <div className="sidebar-title" style={{ marginBottom: '4px' }}>Who your viewers also viewed</div>
                <div style={{ fontSize: '12px', color: 'var(--text-gray)', marginBottom: '16px' }}>Private to you</div>
                
                <div className="sidebar-list-item">
                    <div className="sidebar-pic" style={{ backgroundColor: '#a0b4c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa-solid fa-user" style={{ color: 'white', fontSize: '24px' }}></i>
                    </div>
                    <div className="sidebar-info">
                        <div className="sidebar-name">Software Developer at MountBlue Technologies</div>
                        <button className="btn-connect-small">View</button>
                    </div>
                </div>
            </div>

            <div className="card sidebar-section" style={{ paddingBottom: 0 }}>
                <div className="sidebar-title" style={{ marginBottom: '4px' }}>People you may know</div>
                <div style={{ fontSize: '12px', color: 'var(--text-gray)', marginBottom: '16px' }}>From your company</div>
                
                {[
                  { id: 1, name: 'Anitya Sharma', headline: '--', pic: 'https://picsum.photos/seed/p1/48/48' },
                  { id: 2, name: 'Kumar Vaibhav', headline: 'Software Engineer at MountBlue Technologies', pic: 'https://picsum.photos/seed/p2/48/48', verified: true },
                  { id: 3, name: 'Mohammed Ali', headline: 'Attended Maharaja Institute of technology Mysore', pic: 'https://picsum.photos/seed/p3/48/48', in: true },
                  { id: 4, name: 'Sahil Yadav', headline: 'Software Development Engineer', pic: 'https://picsum.photos/seed/p4/48/48' },
                  { id: 5, name: 'VELUDANI SANJAY KUMAR', headline: 'Software Engineer Intern @ MountBlue Technologies', placeholder: true, in: true },
                ].map((p, idx) => (
                  <React.Fragment key={p.id}>
                    {idx > 0 && <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '16px -24px' }} />}
                    <div className="sidebar-list-item">
                        {p.placeholder ? (
                          <div className="sidebar-pic" style={{ backgroundColor: '#a0b4c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <i className="fa-solid fa-user" style={{ color: 'white', fontSize: '24px' }}></i>
                          </div>
                        ) : (
                          <img src={p.pic} className="sidebar-pic" alt={p.name} />
                        )}
                        <div className="sidebar-info">
                            <div className="sidebar-name">
                              {p.name} 
                              {p.verified && <i className="fa-solid fa-circle-check" style={{ color: 'var(--text-gray)', fontSize: '12px', marginLeft: '4px' }}></i>}
                              {p.in && <i className="fa-brands fa-linkedin" style={{ color: '#0a66c2', fontSize: '12px', marginLeft: '4px' }}></i>}
                              {p.id === 5 ? <br/> : ' '}
                              <span style={{ color: 'var(--text-gray)', fontWeight: 'normal' }}>· 2nd</span>
                            </div>
                            <div className="sidebar-headline">{p.headline}</div>
                            <button 
                              className={pendingReqs.has(p.id) ? "btn-outline" : "btn-connect-small"}
                              style={pendingReqs.has(p.id) ? { padding: '4px 16px', marginTop: '8px' } : {}}
                              onClick={() => {
                                if (!pendingReqs.has(p.id)) {
                                  setPendingReqs(prev => new Set(prev).add(p.id));
                                  toast.success("Request sent!");
                                }
                              }}
                            >
                              {pendingReqs.has(p.id) ? 'Pending' : <><i className="fa-solid fa-user-plus" style={{ marginRight: '4px' }}></i> Connect</>}
                            </button>
                        </div>
                    </div>
                  </React.Fragment>
                ))}
                
                <Link to="/network" className="card-footer" style={{ margin: '16px -24px 0 -24px', display: 'block', borderTop: '1px solid var(--border-color)' }}>Show all <i className="fa-solid fa-arrow-right"></i></Link>
            </div>

        </div>
      </main>

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
