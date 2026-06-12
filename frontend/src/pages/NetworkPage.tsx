import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { connectionsApi } from '@/services/api'
import { getFullName, getInitials } from '@/utils'

/* ── SVG Icons ─────────────────────────────────────────────────────────── */
function UserGroupIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 640 512" fill="currentColor">
      <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM609.3 512H471.4c5.4-9.4 8.6-20.3 8.6-32v-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2h61.4C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"/>
    </svg>
  )
}
function AddressBookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor">
      <path d="M96 0C60.7 0 32 28.7 32 64V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H96zM208 288h64c44.2 0 80 35.8 80 80c0 8.8-7.2 16-16 16H144c-8.8 0-16-7.2-16-16c0-44.2 35.8-80 80-80zm-32-96a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zM512 80c0-8.8-7.2-16-16-16s-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16V80zm0 160c0-8.8-7.2-16-16-16s-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16V240zm-16 112c-8.8 0-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16V352c0-8.8-7.2-16-16-16z"/>
    </svg>
  )
}
function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 640 512" fill="currentColor">
      <path d="M144 160A80 80 0 1 0 144 0a80 80 0 1 0 0 160zm368 0A80 80 0 1 0 512 0a80 80 0 1 0 0 160zM0 298.7C0 310.4 9.6 320 21.3 320H234.7c.2 0 .4 0 .7 0c-26.6-23.5-43.3-57.8-43.3-96c0-7.6 .7-15 1.9-22.3c-13.6-6.3-28.7-9.7-44.6-9.7H106.7C47.8 192 0 239.8 0 298.7zM405.3 320H618.7c11.8 0 21.3-9.6 21.3-21.3C640 239.8 592.2 192 533.3 192H490.7c-15.9 0-31 3.5-44.6 9.7c1.3 7.2 1.9 14.7 1.9 22.3c0 38.2-16.8 72.5-43.3 96c.2 0 .4 0 .7 0zM224 224c0 79.5 64.5 144 144 144s144-64.5 144-144s-64.5-144-144-144s-144 64.5-144 144zM0 464c0 26.5 21.5 48 48 48H592c26.5 0 48-21.5 48-48V464c0-61.9-50.1-112-112-112H112C50.1 352 0 402.1 0 464z"/>
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 448 512" fill="currentColor">
      <path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336z"/>
    </svg>
  )
}
function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 384 512" fill="currentColor">
      <path d="M48 0C21.5 0 0 21.5 0 48V464c0 26.5 21.5 48 48 48h96V432c0-26.5 21.5-48 48-48s48 21.5 48 48v80h96c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48H48zM64 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V240zm112-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V240c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V240zM80 96h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V112zm112-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16z"/>
    </svg>
  )
}
function NewspaperIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor">
      <path d="M96 96c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H80c-44.2 0-80-35.8-80-80V128c0-17.7 14.3-32 32-32s32 14.3 32 32V400c0 8.8 7.2 16 16 16s16-7.2 16-16V96zm64 24v56c0 13.3 10.7 24 24 24H296c13.3 0 24-10.7 24-24V120c0-13.3-10.7-24-24-24H184c-13.3 0-24 10.7-24 24zm208-8c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H384c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H384c-8.8 0-16 7.2-16 16zM160 304c0 8.8 7.2 16 16 16H432c8.8 0 16-7.2 16-16s-7.2-16-16-16H176c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16H432c8.8 0 16-7.2 16-16s-7.2-16-16-16H176c-8.8 0-16 7.2-16 16z"/>
    </svg>
  )
}
function UserPlusIcon() {
  return (
    <svg width="16" height="14" viewBox="0 0 640 512" fill="currentColor">
      <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM504 312V248H440c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V136c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H552v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/>
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
function XMarkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 384 512" fill="currentColor">
      <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
    </svg>
  )
}
function AngleLeftIcon() {
  return (
    <svg width="8" height="14" viewBox="0 0 256 512" fill="currentColor">
      <path d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z"/>
    </svg>
  )
}
function AngleRightIcon() {
  return (
    <svg width="8" height="14" viewBox="0 0 256 512" fill="currentColor">
      <path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"/>
    </svg>
  )
}

/* ── Static data ─────────────────────────────────────────────────────────── */
const PUZZLES = [
  { name: 'Wend #4',     bg: '#f8c77e', connections: 4,  solve: true },
  { name: 'Patches #87', bg: '#a0c4ff', connections: 6,  solve: true },
  { name: 'Zip #452',    bg: '#ffadad', connections: 6,  solve: false },
]

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80',
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80',
]

/* ── Types ─────────────────────────────────────────────────────────────── */
interface SuggestionUser {
  id: number
  username: string
  profile?: { first_name: string; last_name: string; headline?: string; avatar_url?: string }
}
interface IncomingReq {
  id: number
  requester: { id: number; username: string; profile?: { first_name: string; last_name: string; headline?: string; avatar_url?: string } }
  message?: string
  created_at: string
}

/* ── Shared styles ─────────────────────────────────────────────────────── */
const card: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 8,
  border: '1px solid #e0dfdc',
  marginBottom: 12,
  overflow: 'hidden',
}

const outlineBlueBtn = (extra?: React.CSSProperties): React.CSSProperties => ({
  border: '1px solid #0a66c2',
  color: '#0a66c2',
  background: 'transparent',
  borderRadius: 16,
  fontWeight: 600,
  cursor: 'pointer',
  ...extra,
})

/* ── Component ─────────────────────────────────────────────────────────── */
export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState<'grow' | 'catchup'>('grow')
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())
  const qc = useQueryClient()

  const { data: incoming = [] } = useQuery<IncomingReq[]>({
    queryKey: ['incoming-reqs'],
    queryFn: () => connectionsApi.getIncoming().then(r => r.data),
  })
  const { data: suggestions = [] } = useQuery<SuggestionUser[]>({
    queryKey: ['suggestions'],
    queryFn: () => connectionsApi.getSuggestions().then(r => r.data),
  })
  const { data: connections = [] } = useQuery({
    queryKey: ['connections'],
    queryFn: () => connectionsApi.getMyConnections().then(r => r.data),
  })

  const acceptMut = useMutation({
    mutationFn: (id: number) => connectionsApi.accept(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incoming-reqs'] })
      qc.invalidateQueries({ queryKey: ['connections'] })
      toast.success('Connected!')
    },
  })
  const rejectMut = useMutation({
    mutationFn: (id: number) => connectionsApi.reject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incoming-reqs'] }),
  })
  const connectMut = useMutation({
    mutationFn: (id: number) => connectionsApi.sendRequest(id),
    onSuccess: (_, id) => {
      setDismissed(prev => new Set(prev).add(id))
      qc.invalidateQueries({ queryKey: ['suggestions'] })
      toast.success('Request sent!')
    },
  })

  const connCount = Array.isArray(connections) ? connections.length : 0
  const visible = suggestions.filter(u => !dismissed.has(u.id))

  const SIDEBAR_ITEMS = [
    { icon: <UserGroupIcon />,    label: 'Connections',          count: connCount || 0 },
    { icon: <AddressBookIcon />,  label: 'Following & followers', count: null },
    { icon: <UsersIcon />,        label: 'Groups',               count: null },
    { icon: <CalendarIcon />,     label: 'Events',               count: null },
    { icon: <BuildingIcon />,     label: 'Pages',                count: 11 },
    { icon: <NewspaperIcon />,    label: 'Newsletters',          count: 3 },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 780px', gap: 24, width: 1128, margin: '24px auto', alignItems: 'start' }}>

      {/* ── Left sidebar ─────────────────────────────────────────── */}
      <aside style={{ position: 'sticky', top: 80 }}>
        {/* Manage my network */}
        <div style={card}>
          <div style={{ padding: '12px 0' }}>
            <div style={{ padding: '4px 16px 12px', fontSize: 16, fontWeight: 600, color: 'rgba(0,0,0,0.9)' }}>
              Manage my network
            </div>
            {SIDEBAR_ITEMS.map(({ icon, label, count }) => (
              <div
                key={label}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', fontSize: 16, color: 'rgba(0,0,0,0.6)', cursor: 'pointer' }}
                onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
                onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 24, display: 'flex', justifyContent: 'center', fontSize: 18 }}>{icon}</span>
                  {label}
                </div>
                {count !== null && <span style={{ fontSize: 14 }}>{count}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Promoted ad */}
        <div style={{ ...card, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', textAlign: 'right', marginBottom: 8 }}>Promoted •••</div>
          <div style={{ background: '#e8f4fc', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 16, color: '#0000ff', fontWeight: 700 }}>
              <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor" style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }}>
                <path d="M243.4 2.6l-224 96c-14 6-21.8 21-18.7 35.8S16.8 160 32 160v8c0 13.3 10.7 24 24 24H456c13.3 0 24-10.7 24-24v-8c15.2 0 28.3-10.7 31.3-25.6s-4.8-29.9-18.7-35.8l-224-96c-8.1-3.4-17.2-3.4-25.2 0zM128 224H64V420.3c-.6 .3-1.2 .7-1.8 1.1l-48 32c-11.7 7.8-17 22.4-12.9 35.9S17.9 512 32 512H480c14.1 0 26.5-9.2 30.6-22.7s-1.1-28.1-12.9-35.9l-48-32c-.6-.4-1.2-.7-1.8-1.1V224H384v192H320V224H256v192H192V224H128zM256 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
              </svg>
              SBI
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'rgba(0,0,0,0.9)' }}>State Bank of India</div>
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', marginBottom: 4 }}>Master your money with State Bank of India</div>
          <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.6)', marginBottom: 12 }}>Your Financial knowledge hub is here!</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'rgba(0,0,0,0.6)', marginBottom: 12, gap: 8 }}>
            <div style={{ display: 'flex' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #fff', marginLeft: i === 1 ? 0 : -8, backgroundColor: '#b0c0d0', flexShrink: 0 }} />
              ))}
            </div>
            <span>32 connections also follow</span>
          </div>
          <button
            style={outlineBlueBtn({ width: '100%', padding: '6px 16px', fontSize: 14 })}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#eaf4fd'; (e.currentTarget as HTMLElement).style.borderWidth = '2px' }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.borderWidth = '1px' }}
          >
            Follow
          </button>
        </div>

        {/* Footer links */}
        <div style={{ padding: 16, textAlign: 'center', fontSize: 12, color: 'rgba(0,0,0,0.6)', lineHeight: 1.8 }}>
          {[
            ['About', 'Accessibility', 'Help Center'],
            ['Privacy & Terms ▾', 'Ad Choices', 'Advertising'],
            ['Business Services ▾', 'Get the LinkedIn app', 'More'],
          ].map((row, ri) => (
            <div key={ri}>
              {row.map(link => (
                <a key={link} href="#" style={{ color: 'rgba(0,0,0,0.6)', margin: '0 4px' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = '#0a66c2'; (e.currentTarget as HTMLElement).style.textDecoration = 'underline' }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.6)'; (e.currentTarget as HTMLElement).style.textDecoration = 'none' }}
                >{link}</a>
              ))}
            </div>
          ))}
          <div style={{ marginTop: 8 }}>
            <strong style={{ color: '#0a66c2' }}>LinkedIn</strong> Corporation © 2026
          </div>
        </div>
      </aside>

      {/* ── Main section ─────────────────────────────────────────── */}
      <section>

        {/* Tabs */}
        <div style={{ ...card, display: 'flex', padding: '0 16px', alignItems: 'center' }}>
          {(['grow', 'catchup'] as const).map(tab => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 12px', marginRight: 16, fontSize: 16, fontWeight: 600, cursor: 'pointer',
                color: activeTab === tab ? '#01754f' : 'rgba(0,0,0,0.6)',
                borderBottom: activeTab === tab ? '2px solid #01754f' : '2px solid transparent',
              }}
            >
              {tab === 'grow' ? 'Grow' : 'Catch up'}
            </div>
          ))}
        </div>

        {activeTab === 'grow' && (
          <>
            {/* Invitations */}
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, fontSize: 16 }}>
                <span>Invitations ({incoming.length})</span>
                <button style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 4 }}
                  onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
                  onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
                >Show all</button>
              </div>

              {incoming.length === 0 ? (
                <div style={{ padding: '16px 16px 24px', color: 'rgba(0,0,0,0.6)', fontSize: 14, borderTop: '1px solid #e0dfdc', textAlign: 'center' }}>
                  No pending invitations
                </div>
              ) : incoming.map(req => {
                const name = getFullName(req.requester.profile)
                const avatarSrc = req.requester.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'user')}`
                return (
                  <div key={req.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '12px 16px', borderTop: '1px solid #e0dfdc' }}>
                    {/* Avatar */}
                    <Link to={`/profile/${req.requester.id}`} style={{ flexShrink: 0 }}>
                      <div style={{ width: 72, height: 72, borderRadius: '50%', marginRight: 12, overflow: 'hidden' }}>
                        <img src={avatarSrc} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </Link>

                    {/* Details */}
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(0,0,0,0.9)' }}>
                        <Link to={`/profile/${req.requester.id}`} style={{ textDecoration: 'none', color: 'inherit' }}
                          onMouseOver={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')}
                          onMouseOut={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'none')}
                        >{name}</Link>
                        <ShieldIcon />
                      </div>
                      {req.requester.profile?.headline && (
                        <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)', marginTop: 2 }}>{req.requester.profile.headline}</div>
                      )}
                      {req.message && (
                        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', marginTop: 4, fontStyle: 'italic' }}>"{req.message}"</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: 16, marginTop: 16, flexShrink: 0 }}>
                      <button
                        onClick={() => rejectMut.mutate(req.id)}
                        style={{ background: 'none', border: 'none', fontSize: 16, fontWeight: 600, color: 'rgba(0,0,0,0.6)', marginRight: 16, padding: 8, cursor: 'pointer', borderRadius: 4 }}
                        onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
                        onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
                      >Ignore</button>
                      <button
                        onClick={() => acceptMut.mutate(req.id)}
                        style={outlineBlueBtn({ padding: '6px 16px', fontSize: 16 })}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#eaf4fd'; (e.currentTarget as HTMLElement).style.borderWidth = '2px'; (e.currentTarget as HTMLElement).style.padding = '5px 15px' }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.borderWidth = '1px'; (e.currentTarget as HTMLElement).style.padding = '6px 16px' }}
                      >Accept</button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Puzzles */}
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px 0' }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'rgba(0,0,0,0.9)' }}>Need a reset? Try a puzzle 🧠</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[<AngleLeftIcon />, <AngleRightIcon />].map((icon, i) => (
                    <div key={i}
                      style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.6)', cursor: 'pointer' }}
                      onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
                      onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
                    >{icon}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', padding: '12px 16px 16px', gap: 16 }}>
                {PUZZLES.map((p, i) => (
                  <div key={i} style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: p.bg, marginRight: 8, flexShrink: 0 }} />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'rgba(0,0,0,0.9)' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', marginTop: 2, gap: 4 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#c0ccd8', flexShrink: 0 }} />
                        {p.connections} connections played
                      </div>
                    </div>
                    {p.solve && (
                      <button style={outlineBlueBtn({ padding: '4px 12px', fontSize: 14, flexShrink: 0, marginLeft: 8 })}
                        onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#eaf4fd')}
                        onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                      >Solve</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* People you may know */}
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, fontSize: 16 }}>
                <span>People you may know</span>
                <button style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 4 }}
                  onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
                  onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
                >Show all</button>
              </div>

              {visible.length === 0 ? (
                <div style={{ padding: '0 16px 24px', color: 'rgba(0,0,0,0.6)', fontSize: 14, textAlign: 'center' }}>
                  No suggestions at the moment
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: '0 16px 16px' }}>
                  {visible.map((u, idx) => {
                    const name = getFullName(u.profile)
                    const avatarSrc = u.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'user')}`
                    const cover = COVER_IMAGES[idx % COVER_IMAGES.length]
                    return (
                      <div key={u.id} style={{ border: '1px solid #e0dfdc', borderRadius: 8, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
                        {/* Close */}
                        <button
                          onClick={() => setDismissed(prev => new Set(prev).add(u.id))}
                          style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, border: 'none' }}
                          onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.85)')}
                          onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.6)')}
                        ><XMarkIcon /></button>

                        {/* Cover */}
                        <div style={{ height: 62, backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

                        {/* Avatar */}
                        <div style={{ width: 96, height: 96, borderRadius: '50%', border: '2px solid #fff', margin: '-48px auto 0', position: 'relative', zIndex: 2, overflow: 'hidden', backgroundColor: '#e0e0e0', flexShrink: 0 }}>
                          <img src={avatarSrc} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        {/* Info */}
                        <div style={{ padding: 12, textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.2, marginBottom: 4, color: 'rgba(0,0,0,0.9)' }}>
                            <Link to={`/profile/${u.id}`} style={{ textDecoration: 'none', color: 'inherit' }}
                              onMouseOver={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')}
                              onMouseOut={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'none')}
                            >{name}</Link>
                          </div>
                          {u.profile?.headline && (
                            <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                              {u.profile.headline}
                            </div>
                          )}
                          <div style={{ marginTop: 'auto', marginBottom: 12 }} />
                          <button
                            onClick={() => connectMut.mutate(u.id)}
                            disabled={connectMut.isPending}
                            style={outlineBlueBtn({ width: '100%', padding: '6px 0', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 })}
                            onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#eaf4fd')}
                            onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                          >
                            <UserPlusIcon /> Connect
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'catchup' && (
          <div style={{ ...card, padding: 32, textAlign: 'center', color: 'rgba(0,0,0,0.6)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Catch up with your network</div>
            <div style={{ fontSize: 14 }}>See recent activity from your connections.</div>
          </div>
        )}

      </section>
    </div>
  )
}
