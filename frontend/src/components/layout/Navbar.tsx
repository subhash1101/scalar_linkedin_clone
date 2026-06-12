import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Users, Briefcase, MessageCircle, Bell,
  Search, LogOut, Settings, User, Grid3X3
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { notificationsApi, usersApi } from '@/services/api'
import Avatar from '@/components/common/Avatar'
import { getFullName } from '@/utils'

/* Font Awesome fa-brands fa-linkedin path */
function LiLogo() {
  return (
    <svg width="34" height="34" viewBox="0 0 448 512" fill="#0a66c2" xmlns="http://www.w3.org/2000/svg">
      <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/>
    </svg>
  )
}

/* Caret-down triangle matching fa-solid fa-caret-down */
function CaretDownIcon({ size = 12, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 512" fill="currentColor" style={style}>
      <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9S303 191.9 288 192H32c-15 0-28.2 8.8-33.8 20.8S.2 237.4 9.4 246.6l128 128z"/>
    </svg>
  )
}

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showMe, setShowMe] = useState(false)
  const meRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const { data: notifData } = useQuery({
    queryKey: ['notification-count'],
    queryFn: () => notificationsApi.getUnreadCount().then(r => r.data),
    refetchInterval: 30_000,
    enabled: !!user,
  })

  const { data: searchResults } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => usersApi.searchUsers(searchQuery).then(r => r.data),
    enabled: searchQuery.length > 1,
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (meRef.current && !meRef.current.contains(e.target as Node)) setShowMe(false)
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unreadCount = notifData?.count || 0
  const name = getFullName(user?.profile)

  const navItems = [
    { to: '/',             icon: Home,          label: 'Home',          badge: 0 },
    { to: '/network',      icon: Users,         label: 'My Network',    badge: 0 },
    { to: '/jobs',         icon: Briefcase,     label: 'Jobs',          badge: 0 },
    { to: '/messaging',    icon: MessageCircle, label: 'Messaging',     badge: 0 },
    { to: '/notifications',icon: Bell,          label: 'Notifications', badge: unreadCount },
  ]

  return (
    <header style={{
      backgroundColor: '#fff',
      height: 52,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid #e0dfdc',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <div style={{ width: 1128, display: 'flex', alignItems: 'center', padding: '0 24px' }}>

        {/* Logo + Search */}
        <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Link to="/" style={{ marginRight: 8, lineHeight: 0 }}>
            <LiLogo />
          </Link>

          {/* Search bar */}
          <div ref={searchRef} style={{ position: 'relative' }}>
            <div style={{
              backgroundColor: '#eef3f8',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              height: 34,
              width: 280,
            }}>
              <Search size={16} style={{ color: '#666', flexShrink: 0 }} />
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearch(true) }}
                onFocus={() => setShowSearch(true)}
                placeholder="Search"
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  marginLeft: 8, width: '100%', fontSize: 14,
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <AnimatePresence>
              {showSearch && searchQuery.length > 1 && searchResults && (searchResults as unknown[]).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: 4,
                    width: 288, background: '#fff', borderRadius: 8,
                    boxShadow: '0 0 0 1px rgba(0,0,0,.12), 0 4px 6px rgba(0,0,0,.1)',
                    border: '1px solid #e0dfdc', overflow: 'hidden', zIndex: 50,
                  }}
                >
                  {(searchResults as Array<{ id: number; username: string; profile?: { first_name: string; last_name: string; headline?: string; avatar_url?: string } }>)
                    .slice(0, 8).map(u => (
                      <button
                        key={u.id}
                        onClick={() => { navigate(`/profile/${u.id}`); setShowSearch(false); setSearchQuery('') }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          width: '100%', padding: '10px 16px', cursor: 'pointer',
                          background: 'none', border: 'none', textAlign: 'left',
                        }}
                        onMouseOver={e => (e.currentTarget.style.backgroundColor = '#ebebeb')}
                        onMouseOut={e => (e.currentTarget.style.backgroundColor = '')}
                      >
                        <Avatar src={u.profile?.avatar_url} name={getFullName(u.profile)} size="sm" />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{getFullName(u.profile)}</div>
                          {u.profile?.headline && (
                            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                              {u.profile.headline}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>

          {navItems.map(({ to, icon: Icon, label, badge }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', color: isActive ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.6)',
                  minWidth: 80, height: '100%', cursor: 'pointer',
                  position: 'relative', textDecoration: 'none',
                  borderBottom: isActive ? '2px solid rgba(0,0,0,0.9)' : '2px solid transparent',
                  fontSize: 14,
                }}
                onMouseOver={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.9)' }}
                onMouseOut={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.6)' }}
              >
                <Icon size={20} style={{ marginBottom: 4 }} />
                <span style={{ fontSize: 12 }}>{label}</span>
                {badge > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 20,
                    backgroundColor: '#cc1016', color: '#fff',
                    borderRadius: '50%', fontSize: 10, fontWeight: 700,
                    padding: '1px 5px', border: '2px solid #fff',
                  }}>
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </Link>
            )
          })}

          {/* Me */}
          <div ref={meRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMe(v => !v)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', color: 'rgba(0,0,0,0.6)',
                minWidth: 80, height: 52, cursor: 'pointer',
                background: 'none', border: 'none', fontSize: 14,
                borderBottom: '2px solid transparent',
              }}
              onMouseOver={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.9)')}
              onMouseOut={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.6)')}
            >
              <Avatar src={user?.profile?.avatar_url} name={name} size="sm" />
              <span style={{ fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                Me <CaretDownIcon size={10} />
              </span>
            </button>

            <AnimatePresence>
              {showMe && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.1 }}
                  style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: 4,
                    width: 300, background: '#fff', borderRadius: 8,
                    boxShadow: '0 0 0 1px rgba(0,0,0,.15), 0 6px 12px rgba(0,0,0,.15)',
                    border: '1px solid #e0dfdc', overflow: 'hidden', zIndex: 50,
                  }}
                >
                  <div style={{ padding: 16, borderBottom: '1px solid #e0dfdc' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <Avatar src={user?.profile?.avatar_url} name={name} size="lg" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{name}</div>
                        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', marginTop: 2 }}>{user?.profile?.headline || user?.username}</div>
                      </div>
                    </div>
                    <Link
                      to={`/profile/${user?.id}`}
                      onClick={() => setShowMe(false)}
                      style={{
                        display: 'block', marginTop: 12, width: '100%', textAlign: 'center',
                        fontSize: 14, fontWeight: 600, color: '#0a66c2',
                        border: '1px solid #0a66c2', borderRadius: 20, padding: '6px 0',
                        textDecoration: 'none',
                      }}
                      onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#e8f0f9')}
                      onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
                    >
                      View Profile
                    </Link>
                  </div>
                  <div style={{ padding: '4px 0' }}>
                    {user?.role === 'recruiter' && (
                      <Link to="/recruiter" onClick={() => setShowMe(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', fontSize: 14, textDecoration: 'none', color: 'rgba(0,0,0,0.9)' }}
                        onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
                        onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
                      >
                        <Briefcase size={16} style={{ color: 'rgba(0,0,0,0.6)' }} /> Recruiter Dashboard
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link to="/admin" onClick={() => setShowMe(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', fontSize: 14, textDecoration: 'none', color: 'rgba(0,0,0,0.9)' }}
                        onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
                        onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
                      >
                        <Settings size={16} style={{ color: 'rgba(0,0,0,0.6)' }} /> Admin Panel
                      </Link>
                    )}
                    <Link to="/learning" onClick={() => setShowMe(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', fontSize: 14, textDecoration: 'none', color: 'rgba(0,0,0,0.9)' }}
                      onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
                      onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
                    >
                      <User size={16} style={{ color: 'rgba(0,0,0,0.6)' }} /> Learning
                    </Link>
                    <div style={{ height: 1, background: '#e0dfdc', margin: '4px 0' }} />
                    <button
                      onClick={() => { logout(); navigate('/auth') }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '8px 16px', fontSize: 14, color: 'rgba(0,0,0,0.9)',
                        background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left',
                      }}
                      onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
                      onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
                    >
                      <LogOut size={16} style={{ color: 'rgba(0,0,0,0.6)' }} /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 32, backgroundColor: '#e0dfdc', margin: '0 16px' }} />

          {/* For Business */}
          <div
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', color: 'rgba(0,0,0,0.6)',
              minWidth: 80, height: 52, cursor: 'pointer',
            }}
            onMouseOver={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.9)')}
            onMouseOut={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.6)')}
          >
            <Grid3X3 size={20} style={{ marginBottom: 4 }} />
            <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 2 }}>
              For Business <CaretDownIcon size={10} />
            </span>
          </div>

          {/* Try Premium */}
          <div style={{ fontSize: 12, color: '#915907', textAlign: 'center', maxWidth: 80, cursor: 'pointer' }}>
            <a href="#" style={{ color: '#915907', textDecoration: 'none', fontSize: 12 }}>
              Try Premium for ₹0
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
