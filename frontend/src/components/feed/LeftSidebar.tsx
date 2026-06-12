import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import { usersApi } from '@/services/api'
import { getFullName, getInitials } from '@/utils'
import type { User } from '@/types'

function HoverItem({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 16px',
        fontSize: 12,
        fontWeight: 600,
        color: 'rgba(0,0,0,0.6)',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
      onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
      onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
    >
      {children}
    </div>
  )
}

function BookmarkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 384 512" fill="currentColor">
      <path d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z"/>
    </svg>
  )
}
function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 640 512" fill="currentColor">
      <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM609.3 512H471.4c5.4-9.4 8.6-20.3 8.6-32v-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2h61.4C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"/>
    </svg>
  )
}
function NewspaperIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
      <path d="M96 96c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H80c-44.2 0-80-35.8-80-80V128c0-17.7 14.3-32 32-32s32 14.3 32 32V400c0 8.8 7.2 16 16 16s16-7.2 16-16V96zm64 24v56c0 13.3 10.7 24 24 24H296c13.3 0 24-10.7 24-24V120c0-13.3-10.7-24-24-24H184c-13.3 0-24 10.7-24 24zm208-8c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H384c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H384c-8.8 0-16 7.2-16 16zM160 304c0 8.8 7.2 16 16 16H432c8.8 0 16-7.2 16-16s-7.2-16-16-16H176c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16H432c8.8 0 16-7.2 16-16s-7.2-16-16-16H176c-8.8 0-16 7.2-16 16z"/>
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
      <path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm112 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336c-8.8 0-16 7.2-16 16z"/>
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 512 512" fill="currentColor" style={{ display: 'inline', marginLeft: 4 }}>
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

export default function LeftSidebar() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: freshUser } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => usersApi.getUser(user!.id).then(r => r.data as User),
    enabled: !!user,
  })

  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => usersApi.getStats(user!.id).then(r => r.data),
    enabled: !!user,
  })

  const profile = freshUser?.profile ?? user?.profile
  const name = getFullName(profile)
  const avatarSrc = profile?.avatar_url
  const initials = getInitials(name)
  const bannerUrl = profile?.banner_url

  return (
    <aside>
      {/* Card 1 — Profile */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        {/* Cover photo — clickable */}
        <div
          onClick={() => navigate(`/profile/${user?.id}`)}
          style={{
            height: 56,
            background: bannerUrl
              ? `url(${bannerUrl}) center/cover`
              : 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)',
            cursor: 'pointer',
          }}
        />

        {/* Avatar — left-aligned, overlaps banner */}
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

        {/* Name + headline + location */}
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
        </div>
      </div>

      {/* Card 2 — Profile stats */}
      <div style={cardStyle}>
        <Link
          to={`/profile/${user?.id}`}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 16px', fontSize: 12, fontWeight: 600,
            color: 'rgba(0,0,0,0.6)', textDecoration: 'none', cursor: 'pointer',
          }}
          onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
          onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
        >
          <span>Profile viewers</span>
          <span style={{ color: '#0a66c2' }}>{profile?.profile_views ?? 0}</span>
        </Link>
        <div
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 16px', fontSize: 12, fontWeight: 600,
            color: 'rgba(0,0,0,0.6)', cursor: 'pointer',
          }}
          onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
          onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
        >
          <span>Post impressions</span>
          <span style={{ color: '#0a66c2' }}>{(stats as { post_impressions?: number })?.post_impressions ?? 1}</span>
        </div>
      </div>

      {/* Card 3 — Premium */}
      <div style={cardStyle}>
        <div
          style={{ padding: '12px 16px', cursor: 'pointer' }}
          onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
          onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
        >
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)' }}>Access exclusive tools &amp; insights</div>
          <strong style={{ fontSize: 12, color: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: '#e7a33e', borderRadius: 2, flexShrink: 0 }} />
            Try Premium for ₹0
          </strong>
        </div>
      </div>

      {/* Card 4 — Quick links */}
      <div style={{ ...cardStyle, marginBottom: 0 }}>
        <HoverItem><BookmarkIcon /> Saved items</HoverItem>
        <HoverItem><UsersIcon /> Groups</HoverItem>
        <HoverItem><NewspaperIcon /> Newsletters</HoverItem>
        <HoverItem><CalendarIcon /> Events</HoverItem>
      </div>
    </aside>
  )
}
