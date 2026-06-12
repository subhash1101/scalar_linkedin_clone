import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { usersApi, postsApi } from '@/services/api'
import { getFullName } from '@/utils'
import PostCard from '@/components/feed/PostCard'
import { PageSpinner } from '@/components/common/Spinner'
import './ProfilePage.css' // Reuse the same CSS

export default function ProfilePostsPage() {
  const { userId } = useParams<{ userId: string }>()
  const id = Number(userId)

  const { data: userRes, isLoading: userLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getUser(id)
  })

  const { data: postsRes, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', id],
    queryFn: () => postsApi.getUserPosts(id)
  })

  if (userLoading || postsLoading) {
    return <div className="flex justify-center p-8"><PageSpinner /></div>
  }

  const profileUser = userRes?.data
  const posts = postsRes?.data || []
  
  if (!profileUser) return null

  const p = profileUser.profile
  const name = getFullName(profileUser.profile)

  return (
    <div className="custom-profile-wrapper">
      <main className="main-container" style={{ gridTemplateColumns: '225px 540px 300px', gap: '24px', width: '1128px', margin: '24px auto' }}>
        
        {/* Left Column (Mini Intro) */}
        <div className="sidebar-column" style={{ position: 'sticky', top: 80 }}>
          <div className="card overflow-hidden">
            <div className="h-16 relative" style={{
              background: p?.banner_url
                ? `url(${p.banner_url}) center/cover`
                : 'linear-gradient(135deg, #0a66c2 0%, #0854a4 100%)'
            }}></div>
            <div className="px-4 pb-4 text-center">
              <div className="relative inline-block -mt-8 mb-2">
                <img src={p?.avatar_url || 'https://via.placeholder.com/64/e16745/fff?text=Photo'} alt="avatar" className="w-16 h-16 rounded-full border-2 border-white object-cover bg-white" />
              </div>
              <h2 className="text-base font-semibold hover:underline cursor-pointer">
                <Link to={`/profile/${id}`} style={{ color: 'var(--text-dark)' }}>{name}</Link>
              </h2>
              <p className="text-xs text-gray-500 mt-1">{p?.headline}</p>
            </div>
          </div>
        </div>

        {/* Center Column (Feed) */}
        <div>
          <div className="card p-4 mb-4" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
            <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>{name}'s Activity</h1>
            <div className="text-sm text-gray-500">{posts.length} posts</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {posts.length > 0 ? (
              posts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="card p-8 text-center text-gray-500" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '32px', textAlign: 'center' }}>
                No posts yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Profile Sidebar) */}
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
                
                <div className="sidebar-list-item">
                    <img src="https://picsum.photos/seed/p1/48/48" className="sidebar-pic" alt="Anitya" />
                    <div className="sidebar-info">
                        <div className="sidebar-name">Anitya Sharma <span style={{ color: 'var(--text-gray)', fontWeight: 'normal' }}>· 2nd</span></div>
                        <div className="sidebar-headline">--</div>
                        <button className="btn-connect-small"><i className="fa-solid fa-user-plus" style={{ marginRight: '4px' }}></i> Connect</button>
                    </div>
                </div>
                <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '16px -24px' }} />
                <div className="sidebar-list-item">
                    <img src="https://picsum.photos/seed/p2/48/48" className="sidebar-pic" alt="Kumar" />
                    <div className="sidebar-info">
                        <div className="sidebar-name">Kumar Vaibhav <i className="fa-solid fa-circle-check" style={{ color: 'var(--text-gray)', fontSize: '12px' }}></i> <span style={{ color: 'var(--text-gray)', fontWeight: 'normal' }}>· 2nd</span></div>
                        <div className="sidebar-headline">Software Engineer at MountBlue Technologies</div>
                        <button className="btn-connect-small"><i className="fa-solid fa-user-plus" style={{ marginRight: '4px' }}></i> Connect</button>
                    </div>
                </div>
                <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '16px -24px' }} />
                <div className="sidebar-list-item">
                    <img src="https://picsum.photos/seed/p3/48/48" className="sidebar-pic" alt="Mohammed" />
                    <div className="sidebar-info">
                        <div className="sidebar-name">Mohammed Ali <i className="fa-brands fa-linkedin" style={{ color: '#0a66c2', fontSize: '12px' }}></i> <span style={{ color: 'var(--text-gray)', fontWeight: 'normal' }}>· 2nd</span></div>
                        <div className="sidebar-headline">Attended Maharaja Institute of technology Mysore</div>
                        <button className="btn-connect-small"><i className="fa-solid fa-user-plus" style={{ marginRight: '4px' }}></i> Connect</button>
                    </div>
                </div>
                <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '16px -24px' }} />
                <div className="sidebar-list-item">
                    <img src="https://picsum.photos/seed/p4/48/48" className="sidebar-pic" alt="Sahil" />
                    <div className="sidebar-info">
                        <div className="sidebar-name">Sahil Yadav <span style={{ color: 'var(--text-gray)', fontWeight: 'normal' }}>· 2nd</span></div>
                        <div className="sidebar-headline">Software Development Engineer</div>
                        <button className="btn-connect-small"><i className="fa-solid fa-user-plus" style={{ marginRight: '4px' }}></i> Connect</button>
                    </div>
                </div>
                <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '16px -24px' }} />
                <div className="sidebar-list-item">
                    <div className="sidebar-pic" style={{ backgroundColor: '#a0b4c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa-solid fa-user" style={{ color: 'white', fontSize: '24px' }}></i>
                    </div>
                    <div className="sidebar-info">
                        <div className="sidebar-name">VELUDANI SANJAY KUMAR <i className="fa-brands fa-linkedin" style={{ color: '#0a66c2', fontSize: '12px' }}></i><br/><span style={{ color: 'var(--text-gray)', fontWeight: 'normal' }}>· 2nd</span></div>
                        <div className="sidebar-headline">Software Engineer Intern @ MountBlue Technologies</div>
                        <button className="btn-connect-small"><i className="fa-solid fa-user-plus" style={{ marginRight: '4px' }}></i> Connect</button>
                    </div>
                </div>
                
                <Link to="/network" className="card-footer" style={{ margin: '16px -24px 0 -24px', display: 'block', borderTop: '1px solid var(--border-color)' }}>Show all <i className="fa-solid fa-arrow-right"></i></Link>
            </div>
        </div>

      </main>
    </div>
  )
}
