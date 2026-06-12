import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Users, Briefcase, MessageSquare, Bell,
  ChevronDown, Search, X, LogOut, User, Settings
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { notificationsApi, usersApi } from '@/services/api'
import Avatar from '@/components/common/Avatar'
import { getFullName } from '@/utils'

interface NavItem {
  to: string
  icon: React.ElementType
  label: string
  badge?: number
}

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
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
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false)
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unreadCount = notifData?.count || 0

  const navItems: NavItem[] = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/network', icon: Users, label: 'My Network' },
    { to: '/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/messaging', icon: MessageSquare, label: 'Messaging' },
    { to: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
  ]

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  const name = getFullName(user?.profile)

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 h-14">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center gap-2">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 mr-1" aria-label="LinkedIn Home">
          <div className="w-8 h-8 bg-brand-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
        </Link>

        {/* Search */}
        <div ref={searchRef} className="relative flex-shrink-0">
          <div className="flex items-center bg-[#eef3f8] rounded-full px-3 py-1.5 gap-2 w-52">
            <Search size={16} className="text-gray-500 flex-shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true) }}
              onFocus={() => setShowSearch(true)}
              placeholder="Search"
              className="bg-transparent text-sm w-full outline-none placeholder-gray-500"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowSearch(false) }}>
                <X size={14} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showSearch && searchQuery.length > 1 && searchResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
              >
                {searchResults.slice(0, 8).map((u: { id: number; username: string; profile?: { first_name: string; last_name: string; headline?: string; avatar_url?: string } }) => (
                  <button
                    key={u.id}
                    onClick={() => { navigate(`/profile/${u.id}`); setShowSearch(false); setSearchQuery('') }}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-left"
                  >
                    <Avatar src={u.profile?.avatar_url} name={getFullName(u.profile)} size="sm" />
                    <div>
                      <div className="text-sm font-medium">{getFullName(u.profile)}</div>
                      {u.profile?.headline && <div className="text-xs text-gray-500 truncate w-48">{u.profile.headline}</div>}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav Items */}
        <nav className="flex items-center flex-1 justify-center gap-0.5" role="navigation" aria-label="Main navigation">
          {navItems.map(({ to, icon: Icon, label, badge }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center justify-center px-4 h-14 min-w-[72px] relative group transition-colors ${
                  isActive ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                  {badge != null && badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative ml-1">
          <button
            onClick={() => setShowProfile(v => !v)}
            className="flex flex-col items-center justify-center px-2 h-14 text-gray-500 hover:text-gray-700"
            aria-expanded={showProfile}
            aria-haspopup="true"
          >
            <Avatar src={user?.profile?.avatar_url} name={name} size="sm" />
            <span className="flex items-center text-[10px] mt-0.5 gap-0.5">
              Me <ChevronDown size={10} />
            </span>
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Avatar src={user?.profile?.avatar_url} name={name} size="md" />
                    <div>
                      <div className="font-semibold text-sm">{name}</div>
                      <div className="text-xs text-gray-500 truncate w-36">{user?.profile?.headline || user?.username}</div>
                    </div>
                  </div>
                  <Link
                    to={`/profile/${user?.id}`}
                    onClick={() => setShowProfile(false)}
                    className="mt-3 block w-full text-center text-sm font-semibold text-brand-500 border border-brand-500 rounded-full py-1 hover:bg-brand-50 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>

                <div className="py-2">
                  {user?.role === 'recruiter' && (
                    <Link to="/recruiter" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50">
                      <Briefcase size={16} className="text-gray-500" />
                      Recruiter Dashboard
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50">
                      <Settings size={16} className="text-gray-500" />
                      Admin Panel
                    </Link>
                  )}
                  <Link to="/learning" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50">
                    <User size={16} className="text-gray-500" />
                    Learning
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 w-full text-left text-red-600">
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
