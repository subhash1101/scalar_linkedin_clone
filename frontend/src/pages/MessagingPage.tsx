import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Send, Search, Paperclip, Smile, MoreVertical } from 'lucide-react'
import { messagesApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import Avatar from '@/components/common/Avatar'
import { getFullName, timeAgo } from '@/utils'
import type { Conversation, Message } from '@/types'
import TextareaAutosize from 'react-textarea-autosize'

export default function MessagingPage() {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const [activeConvId, setActiveConvId] = useState<number | null>(null)
  const [messageText, setMessageText] = useState('')
  const [convSearch, setConvSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  const initialConvId = searchParams.get('conv')
  useEffect(() => {
    if (initialConvId) setActiveConvId(parseInt(initialConvId))
  }, [initialConvId])

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagesApi.getConversations().then(r => r.data),
    refetchInterval: 10_000,
  })

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', activeConvId],
    queryFn: () => messagesApi.getMessages(activeConvId!).then(r => r.data),
    enabled: !!activeConvId,
    refetchInterval: 5_000,
  })

  const sendMut = useMutation({
    mutationFn: (content: string) => messagesApi.sendMessage(activeConvId!, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', activeConvId] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
      setMessageText('')
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const filteredConvs = (conversations as Conversation[]).filter(c => {
    const other = c.members[0]
    if (!other) return true
    const name = getFullName(other.profile)
    return name.toLowerCase().includes(convSearch.toLowerCase())
  })

  const activeConv = (conversations as Conversation[]).find(c => c.id === activeConvId)
  const activeOther = activeConv?.members[0]
  const activeOtherName = getFullName(activeOther?.profile)

  const handleSend = () => {
    if (!messageText.trim() || !activeConvId) return
    sendMut.mutate(messageText.trim())
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 h-[calc(100vh-56px)]">
      <div className="card h-full flex overflow-hidden">
        {/* Left panel: Conversations */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold mb-3">Messaging</h2>
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 gap-2">
              <Search size={14} className="text-gray-400" />
              <input
                value={convSearch}
                onChange={e => setConvSearch(e.target.value)}
                placeholder="Search messages"
                className="bg-transparent text-sm w-full outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map(conv => {
              const other = conv.members[0]
              const name = getFullName(other?.profile)
              const isActive = conv.id === activeConvId
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${isActive ? 'bg-blue-50 border-r-2 border-brand-500' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar src={other?.profile?.avatar_url} name={name} size="md" />
                    {conv.unread_count > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${conv.unread_count > 0 ? 'font-semibold' : 'font-medium'} truncate`}>{name}</span>
                      {conv.last_message && (
                        <span className="text-xs text-gray-400 ml-1 flex-shrink-0">{timeAgo(conv.last_message.created_at)}</span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${conv.unread_count > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {conv.last_message?.content || 'No messages yet'}
                    </p>
                  </div>
                </button>
              )
            })}

            {filteredConvs.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">No conversations found</div>
            )}
          </div>
        </div>

        {/* Center: Messages */}
        {activeConvId ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={activeOther?.profile?.avatar_url} name={activeOtherName} size="md" />
                <div>
                  <h3 className="font-semibold text-sm">{activeOtherName}</h3>
                  <p className="text-xs text-gray-500">{activeOther?.profile?.headline}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreVertical size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {(messages as Message[]).map((msg, i) => {
                const isOwn = msg.sender_id === user?.id
                const sender = msg.sender
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    {!isOwn && <Avatar src={sender?.profile?.avatar_url} name={getFullName(sender?.profile)} size="xs" />}
                    <div className={`max-w-xs lg:max-w-md group ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                      {msg.is_deleted ? (
                        <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-400 italic">
                          Message deleted
                        </div>
                      ) : (
                        <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                          isOwn ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {msg.content}
                          {msg.attachment_url && (
                            <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="block mt-1 underline text-xs">
                              📎 Attachment
                            </a>
                          )}
                        </div>
                      )}
                      <span className="text-xs text-gray-400 mt-0.5 px-1">{timeAgo(msg.created_at)}</span>
                    </div>
                  </motion.div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-end gap-2 bg-gray-100 rounded-2xl px-4 py-2">
                <button onClick={() => fileRef.current?.click()} className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <Paperclip size={18} />
                </button>
                <input ref={fileRef} type="file" className="hidden" />
                <TextareaAutosize
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Write a message…"
                  minRows={1}
                  maxRows={5}
                  className="flex-1 bg-transparent text-sm outline-none resize-none"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!messageText.trim() || sendMut.isPending}
                  className="flex-shrink-0 p-1.5 bg-brand-500 text-white rounded-full disabled:opacity-40 hover:bg-brand-600 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
