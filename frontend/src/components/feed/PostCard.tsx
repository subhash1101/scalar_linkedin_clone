import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { postsApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { getFullName, getInitials, timeAgo } from '@/utils'
import type { Post, Comment } from '@/types'
import TextareaAutosize from 'react-textarea-autosize'

const REACTIONS = [
  { key: 'like',       emoji: '👍', label: 'Like',       color: '#378fe9' },
  { key: 'celebrate',  emoji: '🎉', label: 'Celebrate',  color: '#44712e' },
  { key: 'support',    emoji: '🤝', label: 'Support',    color: '#715e86' },
  { key: 'love',       emoji: '❤️', label: 'Love',       color: '#b24020' },
  { key: 'insightful', emoji: '💡', label: 'Insightful', color: '#915907' },
  { key: 'funny',      emoji: '😄', label: 'Funny',      color: '#44712e' },
]

/* SVG icons matching Font Awesome */
function ThumbsUpIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor">
      <path d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192H96c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor">
      <path d="M323.8 34.8c-38.2-10.9-78.1 11.2-89 49.4l-5.7 20c-3.7 13-10.4 25-19.5 35l-51.3 56.4c-8.9 9.8-8.2 25 1.6 33.9s25 8.2 33.9-1.6l51.3-56.4c14.1-15.5 24.4-34 30.1-54.1l5.7-20c3.6-12.7 16.9-20.1 29.7-16.5s20.1 16.9 16.5 29.7l-5.7 20c-5.7 19.9-14.7 38.7-26.6 55.5c-5.2 7.3-5.8 16.9-1.7 24.9s12.3 13 21.3 13L448 224c8.8 0 16 7.2 16 16c0 6.8-4.3 12.7-10.4 15c-7.4 2.8-13 9-14.9 16.7s.1 15.8 5.3 21.7c2.5 2.8 4 6.5 4 10.6c0 7.8-5.6 14.3-13 15.7c-8.2 1.6-15.1 7.3-18 15.2s-1.6 16.7 3.6 23.3c2.1 2.7 3.4 6.1 3.4 9.8c0 7.3-5.4 13.6-12.7 14.7c-7.3 1.1-12.7 7.4-12.7 14.7c0 8.8-7.2 16-16 16H288c-12.4 0-24.5-3.6-34.9-10.4L226.3 416c-11.2-7.3-18.3-19.5-18.3-32.9V312.7l0-.4c0-7.1 1.7-13.9 4.9-20c5.7-11.3 4.4-24.8-3.3-34.8L162.7 192H224c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32H160H112C64.5 64 32 100.5 32 144V448c0 17.7 14.3 32 32 32H96c17.7 0 32-14.3 32-32V384h32c12.4 0 24.5 3.6 34.9 10.4L222.7 416H384c26.5 0 48-21.5 48-48c0-5.4-.9-10.7-2.5-15.6c14.3-7.8 24.1-22.8 24.5-40.1c8-7.8 13-18.6 13-30.6c0-9.5-3-18.3-8.2-25.4C467.5 265.8 480 247.5 480 224c0-35.3-28.7-64-64-64H367.5c5.9-11.4 9.2-24.1 8.5-37.4c-1-16.6-8.5-32.5-21.1-44.3C341.1 66.5 323.7 39.7 323.8 34.8z"/>
    </svg>
  )
}
function CommentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor">
      <path d="M123.6 391.3c12.9-9.4 29.6-11.8 44.6-6.4c26.5 9.6 56.2 15.1 87.8 15.1c124.2 0 208-80.5 208-160s-83.8-160-208-160S48 160.5 48 240c0 32 12.4 62.8 35.7 89.2c8.6 9.7 12.8 22.5 11.8 35.4c-1.4 18.1-5.7 34.7-11.3 49.4c17-7.9 31.1-16.7 39.4-22.7zM21.2 431.9c1.8-2.7 3.5-5.4 5.1-8.1c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208s-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6c-15.1 6.6-32.3 12.6-50.1 16.1c-.8 .2-1.6 .3-2.4 .4c-4.1 .5-7.9-1.8-9.6-5.5c-1.7-3.7-1-8 1.8-11z"/>
    </svg>
  )
}
function RetweetIcon() {
  return (
    <svg width="20" height="18" viewBox="0 0 576 512" fill="currentColor">
      <path d="M272 416c17.7 0 32-14.3 32-32s-14.3-32-32-32H160c-17.7 0-32-14.3-32-32V192h32c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-64-64c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-9.2 9.2-11.9 22.9-6.9 34.9C7.4 184.2 19.1 192 32 192H64V320c0 53 43 96 96 96H272zM304 96c-17.7 0-32 14.3-32 32s14.3 32 32 32H416c17.7 0 32 14.3 32 32V320H416c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c9.2-9.2 11.9-22.9 6.9-34.9C568.6 327.8 556.9 320 544 320H512V192c0-53-43-96-96-96H304z"/>
    </svg>
  )
}
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor">
      <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"/>
    </svg>
  )
}
function EllipsisIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 448 512" fill="currentColor">
      <path d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112A56 56 0 1 1 384 200z"/>
    </svg>
  )
}
function GlobeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 512 512" fill="currentColor" style={{ display: 'inline' }}>
      <path d="M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64H348.7c2.2 20.4 3.3 41.8 3.3 64zm28.8-64H503.9c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32H376.7c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0H167.7c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.5 26 20.9 58.2 27 94.7zm-209 0H18.6C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192H131.2c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.5-26-20.9-58.2-27-94.6H344.3c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352H135.3zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6H493.4z"/>
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
      <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/>
    </svg>
  )
}

interface PostCardProps { post: Post }

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [showComments, setShowComments] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const authorName = getFullName(post.author?.profile)
  const isOwn = post.author_id === user?.id
  const avatarSrc = post.author?.profile?.avatar_url

  const likeMutation = useMutation({
    mutationFn: (reaction: string) => postsApi.likePost(post.id, reaction),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: () => postsApi.deletePost(post.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['feed'] }); toast.success('Post deleted') },
  })
  const commentMutation = useMutation({
    mutationFn: (text: string) => postsApi.addComment(post.id, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] })
      setCommentText('')
    },
  })
  const deleteCommentMutation = useMutation({
    mutationFn: (id: number) => postsApi.deleteComment(post.id, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  })
  const repostMutation = useMutation({
    mutationFn: () => postsApi.repost(post.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['feed'] }); toast.success('Reposted!') },
  })

  const contentShort = post.content.length > 280
  const displayContent = contentShort && !expanded ? post.content.slice(0, 280) : post.content
  const activeReaction = REACTIONS.find(r => r.key === post.user_reaction)

  const postActionStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', padding: '10px 12px',
    color: 'rgba(0,0,0,0.6)', fontWeight: 600, borderRadius: 4,
    cursor: 'pointer', background: 'none', border: 'none', fontSize: 14, gap: 6,
  }

  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 8,
      border: '1px solid #e0dfdc', marginBottom: 8, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        {/* Author pic — rounded 5px like LinkedIn group/company */}
        <div style={{ flexShrink: 0 }}>
          {avatarSrc ? (
            <img
              src={avatarSrc} alt={authorName}
              style={{ width: 48, height: 48, borderRadius: 5, objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: 48, height: 48, borderRadius: 5, backgroundColor: '#0a66c2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 16, fontWeight: 600,
            }}>
              {getInitials(authorName)}
            </div>
          )}
        </div>

        {/* Meta */}
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <Link to={`/profile/${post.author_id}`}
              style={{ textDecoration: 'none', color: 'rgba(0,0,0,0.9)' }}
              onMouseOver={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')}
              onMouseOut={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'none')}
            >
              {authorName}
            </Link>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', marginTop: 1 }}>
            {post.author?.profile?.headline}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', marginTop: 1 }}>
            {timeAgo(post.created_at)} · <GlobeIcon />
          </div>
        </div>

        {/* Menu */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setShowMenu(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.6)', padding: 4 }}
          >
            <EllipsisIcon />
          </button>
          {showMenu && (
            <div style={{
              position: 'absolute', right: 0, top: 28, background: '#fff',
              borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,.12), 0 4px 6px rgba(0,0,0,.1)',
              border: '1px solid #e0dfdc', padding: '4px 0', width: 176, zIndex: 10,
            }}>
              {isOwn && (
                <button
                  onClick={() => { deleteMutation.mutate(); setShowMenu(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 14, color: '#cc1016', background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}
                  onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
                  onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
                >
                  <TrashIcon /> Delete post
                </button>
              )}
              <button
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 14, color: 'rgba(0,0,0,0.9)', background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}
                onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
                onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
                onClick={() => setShowMenu(false)}
              >
                Save post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px 8px', fontSize: 14, lineHeight: 1.5, color: 'rgba(0,0,0,0.9)' }}>
        {displayContent}
        {contentShort && (
          <span
            onClick={() => setExpanded(v => !v)}
            style={{ color: 'rgba(0,0,0,0.6)', cursor: 'pointer', marginLeft: 4 }}
          >
            {expanded ? ' see less' : '... more'}
          </span>
        )}
      </div>

      {/* Media */}
      {post.media.length > 0 && (
        <div style={{ display: post.media.length > 1 ? 'grid' : 'block', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {post.media.filter(m => m.media_type === 'image').map(m => (
            <img
              key={m.id} src={m.url || ''} alt=""
              style={{ width: '100%', display: 'block', backgroundColor: '#000', maxHeight: post.media.length === 1 ? 400 : 240, objectFit: 'cover' }}
            />
          ))}
        </div>
      )}

      {/* Stats row */}
      {(post.like_count > 0 || post.comment_count > 0 || post.repost_count > 0) && (
        <div style={{
          padding: '8px 16px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', fontSize: 12,
          color: 'rgba(0,0,0,0.6)', borderBottom: '1px solid #e0dfdc',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {post.like_count > 0 && (
              <>
                <span style={{ color: '#1485bd' }}>👍</span>
                <span style={{ color: '#df704d' }}>💡</span>
                <span style={{ color: '#6fa05a' }}>👏</span>
                <span style={{ cursor: 'pointer' }}
                  onMouseOver={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')}
                  onMouseOut={e => ((e.currentTarget as HTMLElement).style.textDecoration = '')}
                >
                  {post.like_count}
                </span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {post.comment_count > 0 && (
              <button
                onClick={() => setShowComments(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'rgba(0,0,0,0.6)', padding: 0 }}
                onMouseOver={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')}
                onMouseOut={e => ((e.currentTarget as HTMLElement).style.textDecoration = '')}
              >
                {post.comment_count} comments
              </button>
            )}
            {post.repost_count > 0 && (
              <span>{post.repost_count} reposts</span>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 12px' }}>
        {/* Like with reaction picker */}
        <div
          style={{ position: 'relative', flex: 1 }}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          <button
            onClick={() => likeMutation.mutate(activeReaction ? 'unlike' : 'like')}
            style={{
              ...postActionStyle,
              width: '100%', justifyContent: 'center',
              color: activeReaction ? activeReaction.color : 'rgba(0,0,0,0.6)',
            }}
            onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
            onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
          >
            {activeReaction ? (
              <><span style={{ fontSize: 18 }}>{activeReaction.emoji}</span> {activeReaction.label}</>
            ) : (
              <><ThumbsUpIcon /> Like</>
            )}
          </button>

          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.9 }}
                transition={{ duration: 0.12 }}
                style={{
                  position: 'absolute', bottom: '100%', left: 0, marginBottom: 4,
                  display: 'flex', alignItems: 'center', gap: 4,
                  backgroundColor: '#fff', borderRadius: 24,
                  boxShadow: '0 0 0 1px rgba(0,0,0,.12), 0 4px 12px rgba(0,0,0,.15)',
                  padding: '8px 12px', zIndex: 20,
                }}
              >
                {REACTIONS.map(r => (
                  <button
                    key={r.key}
                    onClick={() => { likeMutation.mutate(r.key); setShowReactions(false) }}
                    title={r.label}
                    style={{ fontSize: 26, background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.1s', lineHeight: 1 }}
                    onMouseOver={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.25)')}
                    onMouseOut={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
                  >
                    {r.emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setShowComments(v => !v)}
          style={{ ...postActionStyle, flex: 1, justifyContent: 'center' }}
          onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
          onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
        >
          <CommentIcon /> Comment
        </button>

        <button
          onClick={() => repostMutation.mutate()}
          style={{ ...postActionStyle, flex: 1, justifyContent: 'center' }}
          onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
          onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
        >
          <RetweetIcon /> Repost
        </button>

        <button
          style={{ ...postActionStyle, flex: 1, justifyContent: 'center' }}
          onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
          onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
        >
          <SendIcon /> Send
        </button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', borderTop: '1px solid #e0dfdc' }}
          >
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                {user?.profile?.avatar_url ? (
                  <img src={user.profile.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#0a66c2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                    {getInitials(getFullName(user?.profile))}
                  </div>
                )}
                <div style={{ flex: 1, border: '1px solid rgba(0,0,0,0.6)', borderRadius: 20, padding: '6px 16px' }}>
                  <TextareaAutosize
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Add a comment…"
                    style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 14, resize: 'none', fontFamily: 'inherit' }}
                    minRows={1}
                    maxRows={5}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) {
                        e.preventDefault()
                        commentMutation.mutate(commentText.trim())
                      }
                    }}
                  />
                </div>
              </div>
              {post.comments.slice(0, 5).map(comment => (
                <CommentItem key={comment.id} comment={comment} postId={post.id} currentUserId={user?.id} onDelete={id => deleteCommentMutation.mutate(id)} />
              ))}
              {post.comment_count > 5 && (
                <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <ChevronDown size={16} /> Load more comments
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CommentItem({ comment, postId, currentUserId, onDelete }: {
  comment: Comment; postId: number; currentUserId?: number; onDelete: (id: number) => void
}) {
  const authorName = getFullName(comment.author?.profile)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <Link to={`/profile/${comment.author_id}`} style={{ flexShrink: 0 }}>
        {comment.author?.profile?.avatar_url ? (
          <img src={comment.author.profile.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#0a66c2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 600 }}>
            {getInitials(authorName)}
          </div>
        )}
      </Link>
      <div style={{ flex: 1 }}>
        <div style={{ backgroundColor: '#f3f2ef', borderRadius: 8, padding: '8px 12px' }}>
          <Link to={`/profile/${comment.author_id}`} style={{ fontSize: 12, fontWeight: 600, textDecoration: 'none', color: 'rgba(0,0,0,0.9)' }}>
            {authorName}
          </Link>
          <p style={{ fontSize: 14, marginTop: 2, color: 'rgba(0,0,0,0.9)' }}>{comment.content}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 4, paddingLeft: 4 }}>
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)' }}>{timeAgo(comment.created_at)}</span>
          <button style={{ fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Like</button>
          <button style={{ fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Reply</button>
          {comment.author_id === currentUserId && (
            <button onClick={() => onDelete(comment.id)} style={{ fontSize: 12, fontWeight: 600, color: '#cc1016', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
          )}
        </div>
        {comment.replies?.map(reply => (
          <CommentItem key={reply.id} comment={reply} postId={postId} currentUserId={currentUserId} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}
