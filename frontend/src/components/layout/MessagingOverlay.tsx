import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { getFullName, getInitials } from '@/utils'

function EllipsisIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
      <path d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112A56 56 0 1 1 384 200z"/>
    </svg>
  )
}
function PenSquareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
      <path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"/>
    </svg>
  )
}
function AngleUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
      <path d="M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z"/>
    </svg>
  )
}
function AngleDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
      <path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/>
    </svg>
  )
}

export default function MessagingOverlay() {
  const { user } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const name = getFullName(user?.profile)
  const avatarSrc = user?.profile?.avatar_url

  if (!user) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, right: 24,
      width: 280, backgroundColor: '#fff',
      border: '1px solid #e0dfdc',
      borderRadius: '8px 8px 0 0',
      boxShadow: '0 0 0 1px rgba(0,0,0,0.15), 0 4px 6px rgba(0,0,0,0.2)',
      zIndex: 1000,
    }}>
      {/* Header */}
      <div
        onClick={() => setCollapsed(v => !v)}
        style={{
          padding: 12, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', cursor: 'pointer',
          borderBottom: collapsed ? 'none' : '1px solid #e0dfdc',
        }}
        onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
        onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 14, color: 'rgba(0,0,0,0.9)' }}>
          {/* Avatar */}
          <div style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8, overflow: 'hidden', flexShrink: 0 }}>
            {avatarSrc ? (
              <img src={avatarSrc} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '100%', height: '100%', backgroundColor: '#0a66c2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 12, fontWeight: 600,
              }}>
                {getInitials(name)}
              </div>
            )}
          </div>
          Messaging
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(0,0,0,0.6)' }}
          onClick={e => e.stopPropagation()}
        >
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.6)', padding: 0 }}><EllipsisIcon /></button>
          <Link to="/messaging" style={{ color: 'rgba(0,0,0,0.6)', lineHeight: 0 }}><PenSquareIcon /></Link>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.6)', padding: 0 }}
            onClick={() => setCollapsed(v => !v)}
          >
            {collapsed ? <AngleUpIcon /> : <AngleDownIcon />}
          </button>
        </div>
      </div>

      {/* Body (collapsed hides this) */}
      {!collapsed && (
        <Link
          to="/messaging"
          style={{
            display: 'block', padding: '16px', fontSize: 14,
            color: 'rgba(0,0,0,0.6)', textAlign: 'center', textDecoration: 'none',
          }}
          onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
          onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
        >
          Open full messaging
        </Link>
      )}
    </div>
  )
}
