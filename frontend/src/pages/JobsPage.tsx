import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import { usersApi, jobsApi } from '@/services/api'
import { getFullName, getInitials } from '@/utils'
import type { User, Job } from '@/types'

function ShieldIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 512 512" fill="currentColor" style={{ display: 'inline', marginLeft: 4 }}>
      <path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0z"/>
    </svg>
  )
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 8,
  border: '1px solid #e0dfdc',
  marginBottom: 8,
}

export default function JobsPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: freshUser } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => usersApi.getUser(user!.id).then(r => r.data as User),
    enabled: !!user,
  })

  const { data: jobsData } = useQuery({
    queryKey: ['jobs', 'all'],
    queryFn: () => jobsApi.list({ limit: 40 }).then(r => r.data),
  })

  const profile = freshUser?.profile ?? user?.profile
  const name = getFullName(profile)
  const avatarSrc = profile?.avatar_url
  const initials = getInitials(name)
  const bannerUrl = profile?.banner_url

  const jobs = jobsData?.jobs || []

  const mockJobs = [
    { id: 101, title: 'Python Developer Intern', company: 'WEBBOOST SOLUTION IT SERVICES', location: 'India (Remote)', pic: 'https://picsum.photos/seed/j1/48/48' },
    { id: 102, title: 'Backend Developer Intern', company: 'FlatZ', location: 'Karur', pic: 'https://picsum.photos/seed/j2/48/48', hidePromo: true, timeAgo: '1 month ago' },
    { id: 103, title: 'Full Stack Web Developer Intern', company: 'WebBoost Solutions by UM', location: 'India (Remote)', pic: 'https://picsum.photos/seed/j3/48/48' },
    { id: 104, title: 'SDE Intern - RL Environments (Freelancer)', company: 'Deccan AI Experts', location: 'India (Remote)', pic: 'https://picsum.photos/seed/j4/48/48' },
    { id: 105, title: 'MERN Stack Developer Intern (MongoDB, Express, React, Node.js)', company: 'Skillified Mentor Jobs', location: 'India (Remote)', pic: 'https://picsum.photos/seed/j5/48/48' },
    { id: 106, title: 'AI Internship', company: 'FlyRank AI', location: 'India (Remote)', pic: 'https://picsum.photos/seed/j6/48/48', verified: true },
    { id: 107, title: 'Principal Engineer Software', company: 'Paylocity Corporation', location: 'Bengaluru (Remote)', pic: 'https://picsum.photos/seed/j7/48/48', verified: true, alumni: true },
    { id: 108, title: 'Full-Stack Developer Intern', company: 'SolvusAI', location: 'India (Remote)', pic: 'https://picsum.photos/seed/j8/48/48' },
  ]

  const displayJobs = mockJobs // Explicitly use the image items to precisely match the user's mockup

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '225px 879px', gap: 24, width: 1128, margin: '24px auto', alignItems: 'start' }}>
      
      {/* ── Left sidebar ─────────────────────────────────────────── */}
      <aside style={{ position: 'sticky', top: 80 }}>
        
        {/* Card 1 — Profile */}
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          <div
            onClick={() => navigate(`/profile/${user?.id}`)}
            style={{
              height: 56,
              background: bannerUrl
                ? `url(${bannerUrl}) center/cover`
                : 'linear-gradient(135deg, #a0b4c7 0%, #a0b4c7 100%)',
              cursor: 'pointer',
            }}
          >
            {!bannerUrl && (
              <img src="https://picsum.photos/seed/banner/225/56" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            )}
          </div>
          <div style={{ margin: '-38px 0 12px 16px', width: 72, height: 72, position: 'relative', zIndex: 2 }}>
            <div onClick={() => navigate(`/profile/${user?.id}`)} style={{ cursor: 'pointer' }}>
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={name}
                  style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid #fff', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', border: '2px solid #fff',
                  backgroundColor: '#0a66c2', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 600,
                }}>
                  {initials}
                </div>
              )}
            </div>
          </div>
          <div style={{ padding: '0 16px 16px', textAlign: 'left' }}>
            <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>
              <Link
                to={`/profile/${user?.id}`}
                style={{ textDecoration: 'none', color: 'rgba(0,0,0,0.9)' }}
                onMouseOver={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')}
                onMouseOut={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'none')}
              >
                {name}
              </Link>
              <ShieldIcon />
            </div>
            {profile?.headline && (
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', marginTop: 4, lineHeight: 1.4 }}>
                {profile.headline}
              </div>
            )}
            {profile?.location && (
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', marginTop: 2 }}>
                {profile.location}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <img src="https://picsum.photos/seed/mountblue/24/24" style={{ width: 16, height: 16, borderRadius: 2 }} alt="" />
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.9)', fontWeight: 600 }}>MountBlue Technologies</span>
            </div>
          </div>
        </div>

        {/* Card 2 — Preferences */}
        <div style={cardStyle}>
            <div style={{ padding: '16px', fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')} onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}>
                <i className="fa-solid fa-list" style={{ color: 'rgba(0,0,0,0.6)', fontSize: 16, width: 20 }}></i>
                Preferences
            </div>
            <div style={{ padding: '16px', fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')} onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}>
                <i className="fa-solid fa-bookmark" style={{ color: 'rgba(0,0,0,0.6)', fontSize: 16, width: 20 }}></i>
                Job tracker
            </div>
            <div style={{ padding: '16px', fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')} onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}>
                <i className="fa-solid fa-square" style={{ color: '#e7a33e', fontSize: 16, width: 20 }}></i>
                My Career Insights
            </div>
            <hr style={{ border: 0, borderTop: '1px solid #e0dfdc', margin: 0 }} />
            <div style={{ padding: '16px', fontSize: 14, fontWeight: 600, color: '#0a66c2', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')} onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}>
                <i className="fa-solid fa-pen-to-square" style={{ color: '#0a66c2', fontSize: 16, width: 20 }}></i>
                Post a free job
            </div>
        </div>

        {/* Footer links */}
        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', textAlign: 'center', marginTop: 16, padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 16px', marginBottom: 8 }}>
            <span style={{ cursor: 'pointer' }} onMouseOver={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')} onMouseOut={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'none')}>About</span>
            <span style={{ cursor: 'pointer' }} onMouseOver={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')} onMouseOut={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'none')}>Accessibility</span>
            <span style={{ cursor: 'pointer' }} onMouseOver={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')} onMouseOut={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'none')}>Help Center</span>
            <span style={{ cursor: 'pointer' }} onMouseOver={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')} onMouseOut={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'none')}>Privacy &amp; Terms <i className="fa-solid fa-caret-down"></i></span>
            <span style={{ cursor: 'pointer' }} onMouseOver={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')} onMouseOut={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'none')}>Ad Choices</span>
            <span style={{ cursor: 'pointer' }} onMouseOver={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')} onMouseOut={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'none')}>Advertising</span>
            <span style={{ cursor: 'pointer' }} onMouseOver={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')} onMouseOut={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'none')}>Business Services <i className="fa-solid fa-caret-down"></i></span>
            <span style={{ cursor: 'pointer' }} onMouseOver={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')} onMouseOut={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'none')}>Get the LinkedIn app</span>
            <span style={{ cursor: 'pointer' }} onMouseOver={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')} onMouseOut={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'none')}>More</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span style={{ color: '#0a66c2', fontWeight: 600 }}>Linked<i className="fa-brands fa-linkedin" style={{ fontSize: 14 }}></i></span> LinkedIn Corporation © 2026
          </div>
        </div>

      </aside>

      {/* ── Right Column ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Top promo card */}
        <div style={{ ...cardStyle, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, backgroundColor: '#00204a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, flexShrink: 0 }}>
                    in
                </div>
                <div>
                    <div style={{ fontSize: 16, color: 'rgba(0,0,0,0.9)', marginBottom: 12 }}>Turn signals into pipeline</div>
                    <button style={{ border: '1px solid #0a66c2', color: '#0a66c2', background: 'transparent', borderRadius: 24, padding: '4px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }} onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(10, 102, 194, 0.1)')} onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}>
                        Request demo
                    </button>
                </div>
            </div>
            <div style={{ cursor: 'pointer', padding: 8, color: 'rgba(0,0,0,0.6)' }} onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')} onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}>
                <i className="fa-solid fa-ellipsis"></i>
            </div>
        </div>

        {/* More jobs for you */}
        <div style={cardStyle}>
            <div style={{ padding: '24px 24px 12px' }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: 'rgba(0,0,0,0.9)', margin: '0 0 4px' }}>More jobs for you</h2>
                <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>Based on your profile, preferences, and activity like applies, searches, and saves</div>
            </div>

            <div>
                {displayJobs.map((j: any, i: number) => (
                    <div key={j.id || i} style={{ display: 'flex', padding: '16px 24px', position: 'relative', borderTop: '1px solid #e0dfdc' }}>
                        <div style={{ marginRight: 16, cursor: 'pointer' }}>
                            <img src={j.pic || (j.company?.logo_url) || `https://picsum.photos/seed/job${j.id}/48/48`} alt="" style={{ width: 48, height: 48, objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 16, fontWeight: 600, color: '#0a66c2', cursor: 'pointer', marginBottom: 2 }} onMouseOver={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')} onMouseOut={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'none')}>
                                {j.title} {j.verified && <ShieldIcon />}
                            </div>
                            <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.9)', marginBottom: 2 }}>
                                {j.company?.name || j.company} • {j.location}
                            </div>
                            
                            {j.alumni && (
                                <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                                    <img src="https://picsum.photos/seed/a1/16/16" style={{ borderRadius: '50%', width: 16, height: 16 }} alt="" /> 1 company alumni works here
                                </div>
                            )}

                            {!j.hidePromo ? (
                                <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', marginTop: 4 }}>
                                    Promoted • <span style={{ color: '#057642', fontWeight: 600 }}>Be an early applicant</span>
                                </div>
                            ) : (
                                <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', marginTop: 4 }}>
                                    {j.timeAgo || '1 month ago'}
                                </div>
                            )}
                        </div>
                        <button style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: 'rgba(0,0,0,0.6)', cursor: 'pointer', fontSize: 16 }} onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')} onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                ))}
            </div>
        </div>

      </div>

    </div>
  )
}
