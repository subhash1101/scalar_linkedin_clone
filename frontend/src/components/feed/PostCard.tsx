import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ThumbsUp, MessageCircle, Repeat2, Send,
  MoreHorizontal, Trash2, Globe, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { postsApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import Avatar from '@/components/common/Avatar'
import { getFullName, timeAgo } from '@/utils'
import type { Post, Comment } from '@/types'
import TextareaAutosize from 'react-textarea-autosize'

const REACTIONS = [
  { key: 'like', emoji: '👍', label: 'Like', color: 'text-blue-600' },
  { key: 'celebrate', emoji: '🎉', label: 'Celebrate', color: 'text-yellow-500' },
  { key: 'support', emoji: '🤝', label: 'Support', color: 'text-teal-500' },
  { key: 'love', emoji: '❤️', label: 'Love', color: 'text-red-500' },
  { key: 'insightful', emoji: '💡', label: 'Insightful', color: 'text-orange-500' },
  { key: 'funny', emoji: '😄', label: 'Funny', color: 'text-green-500' },
]

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [showComments, setShowComments] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const authorName = getFullName(post.author?.profile)
  const isOwn = post.author_id === user?.id

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
      qc.invalidateQueries({ queryKey: ['post-comments', post.id] })
      setCommentText('')
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => postsApi.deleteComment(post.id, commentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  })

  const repostMutation = useMutation({
    mutationFn: () => postsApi.repost(post.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['feed'] }); toast.success('Reposted!') },
  })

  const contentShort = post.content.length > 280
  const displayContent = contentShort && !expanded ? post.content.slice(0, 280) + '…' : post.content

  const activeReaction = REACTIONS.find(r => r.key === post.user_reaction)

  return (
    <div className="card fade-in">
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Link to={`/profile/${post.author_id}`}>
              <Avatar src={post.author?.profile?.avatar_url} name={authorName} size="md" />
            </Link>
            <div>
              <Link to={`/profile/${post.author_id}`} className="font-semibold text-sm hover:underline">
                {authorName}
              </Link>
              <div className="text-xs text-gray-500 leading-tight">
                {post.author?.profile?.headline}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <span>{timeAgo(post.created_at)}</span>
                <span>·</span>
                <Globe size={12} />
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMore(v => !v)}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
            >
              <MoreHorizontal size={20} />
            </button>
            {showMore && (
              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-200 py-1 w-40 z-10">
                {isOwn && (
                  <button
                    onClick={() => { deleteMutation.mutate(); setShowMore(false) }}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full text-red-600"
                  >
                    <Trash2 size={14} /> Delete post
                  </button>
                )}
                <button className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full" onClick={() => setShowMore(false)}>
                  Save post
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-3 text-sm text-gray-800 whitespace-pre-line leading-relaxed">
          {displayContent}
          {contentShort && (
            <button onClick={() => setExpanded(v => !v)} className="text-gray-500 font-medium hover:text-gray-700 ml-1">
              {expanded ? 'see less' : 'see more'}
            </button>
          )}
        </div>

        {/* Media */}
        {post.media.length > 0 && (
          <div className={`mt-3 grid gap-1 ${post.media.length > 1 ? 'grid-cols-2' : ''}`}>
            {post.media.filter(m => m.media_type === 'image').map(m => (
              <img key={m.id} src={m.url || ''} alt="" className="w-full rounded-lg object-cover max-h-64" />
            ))}
          </div>
        )}

        {/* Engagement counts */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-1">
            {post.like_count > 0 && (
              <>
                <span className="flex">👍❤️🎉</span>
                <span className="hover:underline cursor-pointer">{post.like_count}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {post.comment_count > 0 && (
              <button onClick={() => setShowComments(v => !v)} className="hover:underline">
                {post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}
              </button>
            )}
            {post.repost_count > 0 && <span>{post.repost_count} reposts</span>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center px-2 py-1">
        <div
          className="relative flex-1"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          <button
            onClick={() => likeMutation.mutate('like')}
            className={`flex items-center justify-center gap-2 py-2 w-full rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors ${
              activeReaction ? activeReaction.color : 'text-gray-500'
            }`}
          >
            {activeReaction ? (
              <><span className="text-base">{activeReaction.emoji}</span> {activeReaction.label}</>
            ) : (
              <><ThumbsUp size={18} /> Like</>
            )}
          </button>

          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 mb-1 flex items-center gap-1 bg-white rounded-full shadow-xl border border-gray-200 px-3 py-2 z-20"
              >
                {REACTIONS.map(r => (
                  <button
                    key={r.key}
                    onClick={() => { likeMutation.mutate(r.key); setShowReactions(false) }}
                    title={r.label}
                    className="text-2xl hover:scale-125 transition-transform"
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
          className="flex items-center justify-center gap-2 py-2 flex-1 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <MessageCircle size={18} /> Comment
        </button>
        <button
          onClick={() => repostMutation.mutate()}
          className="flex items-center justify-center gap-2 py-2 flex-1 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Repeat2 size={18} /> Repost
        </button>
        <button className="flex items-center justify-center gap-2 py-2 flex-1 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
          <Send size={18} /> Send
        </button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Add comment */}
              <div className="flex items-start gap-2">
                <Avatar src={user?.profile?.avatar_url} name={getFullName(user?.profile)} size="sm" />
                <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
                  <TextareaAutosize
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Add a comment…"
                    className="w-full bg-transparent text-sm outline-none resize-none"
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

              {/* Comments list */}
              {post.comments.slice(0, 5).map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                  currentUserId={user?.id}
                  onDelete={(id) => deleteCommentMutation.mutate(id)}
                />
              ))}

              {post.comment_count > 5 && (
                <button className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700">
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
    <div className="flex items-start gap-2">
      <Link to={`/profile/${comment.author_id}`}>
        <Avatar src={comment.author?.profile?.avatar_url} name={authorName} size="sm" />
      </Link>
      <div className="flex-1">
        <div className="bg-gray-100 rounded-2xl px-3 py-2">
          <Link to={`/profile/${comment.author_id}`} className="text-xs font-semibold hover:underline">{authorName}</Link>
          <p className="text-sm mt-0.5">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1">
          <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
          <button className="text-xs font-medium text-gray-500 hover:text-gray-700">Like</button>
          <button className="text-xs font-medium text-gray-500 hover:text-gray-700">Reply</button>
          {comment.author_id === currentUserId && (
            <button onClick={() => onDelete(comment.id)} className="text-xs font-medium text-red-400 hover:text-red-600">Delete</button>
          )}
        </div>
        {comment.replies?.map(reply => (
          <CommentItem key={reply.id} comment={reply} postId={postId} currentUserId={currentUserId} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}
