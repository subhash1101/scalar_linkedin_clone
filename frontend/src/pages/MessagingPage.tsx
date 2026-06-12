import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Send, Search, Paperclip, Smile, MoreVertical, MoreHorizontal, Edit, Star, X, Image as ImageIcon } from 'lucide-react'
import { messagesApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import Avatar from '@/components/common/Avatar'
import { getFullName, timeAgo } from '@/utils'
import type { Conversation, Message } from '@/types'
import TextareaAutosize from 'react-textarea-autosize'

const EMOJIS = ['😀', '😂', '🥰', '😎', '👍', '🙏', '🔥', '🎉', '❤️', '💡', '🤔', '🙌']

export default function MessagingPage() {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const [activeConvId, setActiveConvId] = useState<number | null>(null)
  const [messageText, setMessageText] = useState('')
  const [convSearch, setConvSearch] = useState('')
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
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
    mutationFn: ({ content, file }: { content: string, file?: File }) => messagesApi.sendMessage(activeConvId!, content, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', activeConvId] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
      setMessageText('')
      setAttachedFile(null)
      setShowEmojiPicker(false)
      if (fileRef.current) fileRef.current.value = ''
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
    if ((!messageText.trim() && !attachedFile) || !activeConvId) return
    sendMut.mutate({ content: messageText.trim(), file: attachedFile || undefined })
  }

  return (
    <div className="max-w-[1128px] mx-auto py-6 flex gap-6 h-[calc(100vh-56px)]">
      <div className="card flex-1 flex flex-col overflow-hidden bg-white border border-gray-200 rounded-lg">
        {/* Full-width Header */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <h2 className="text-base font-semibold text-gray-900">Messaging</h2>
              <div className="flex items-center bg-[#edf3f8] rounded-[4px] px-2 py-1 gap-2 w-64">
                <Search size={14} className="text-gray-600 font-bold" />
                <input
                  value={convSearch}
                  onChange={e => setConvSearch(e.target.value)}
                  placeholder="Search messages"
                  className="bg-transparent text-[13px] w-full outline-none text-gray-900 placeholder-gray-600"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MoreHorizontal size={18} className="text-gray-600 cursor-pointer hover:text-gray-900" />
              <Edit size={18} className="text-gray-600 cursor-pointer hover:text-gray-900" />
            </div>
          </div>
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <button className="flex-shrink-0 bg-[#01754f] text-white text-[13px] font-semibold px-3 py-1 rounded-full flex items-center gap-1 hover:bg-[#006040]">Focused <span className="text-[10px]">▼</span></button>
            {['Jobs', 'Unread', 'Connections', 'InMail', 'Starred'].map(pill => (
              <button key={pill} className="flex-shrink-0 bg-white border border-gray-400 text-gray-600 text-[13px] font-semibold px-3 py-1 rounded-full hover:bg-gray-50 hover:text-gray-900 hover:border-gray-600 transition-colors">
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Split Panels */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel: Conversations */}
          <div className="w-[320px] flex-shrink-0 border-r border-gray-200 flex flex-col bg-white overflow-y-auto">
            {filteredConvs.map(conv => {
              const other = conv.members[0]
              const name = getFullName(other?.profile)
              const isActive = conv.id === activeConvId
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full flex items-start gap-3 px-3 py-3 hover:bg-gray-50 transition-colors text-left border-l-[4px] ${isActive ? 'bg-[#f4f2ee] border-[#01754f]' : 'border-transparent border-b border-b-gray-100'}`}
                >
                  <div className="relative flex-shrink-0 mt-1">
                    <Avatar src={other?.profile?.avatar_url} name={name} size="md" />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                      <span className="w-2.5 h-2.5 bg-[#01754f] border border-white rounded-full"></span>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-[15px] ${conv.unread_count > 0 || isActive ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'} truncate`}>{name}</span>
                      <span className="text-[12px] text-gray-600 ml-1 flex-shrink-0">{conv.last_message ? timeAgo(conv.last_message.created_at) : ''}</span>
                    </div>
                    <p className={`text-[13px] truncate ${conv.unread_count > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'} mt-0.5`}>
                      {conv.last_message ? `${conv.last_message.sender_id === user?.id ? 'You: ' : ''}${conv.last_message.content || 'Attachment'}` : 'No messages yet'}
                    </p>
                  </div>
                </button>
              )
            })}

            {filteredConvs.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">No conversations found</div>
            )}
          </div>

        {/* Center: Messages */}
        {activeConvId ? (
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base text-gray-900">{activeOtherName}</h3>
                <p className="text-[13px] text-gray-500 truncate max-w-lg">{activeOther?.profile?.headline}</p>
              </div>
              <div className="flex items-center gap-3">
                <MoreHorizontal size={20} className="text-gray-500 cursor-pointer hover:text-gray-800" />
                <Star size={20} className="text-gray-500 cursor-pointer hover:text-gray-800" />
              </div>
            </div>

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              <div className="text-center relative my-4">
                <hr className="border-gray-200 absolute top-1/2 left-0 right-0" />
                <span className="relative bg-white px-2 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">TODAY</span>
              </div>
              {(messages as Message[]).map((msg, i) => {
                const isOwn = msg.sender_id === user?.id
                const sender = msg.sender
                
                // Grouping logic (simplified)
                const prevMsg = i > 0 ? messages[i - 1] : null;
                const showHeader = !prevMsg || prevMsg.sender_id !== msg.sender_id || (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 5 * 60000);

                return (
                  <div key={msg.id} className="flex gap-3">
                    {showHeader ? (
                      <div className="flex-shrink-0">
                        <Avatar src={sender?.profile?.avatar_url} name={getFullName(sender?.profile)} size="md" />
                      </div>
                    ) : (
                      <div className="w-10 flex-shrink-0" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      {showHeader && (
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-semibold text-[15px] text-gray-900">{getFullName(sender?.profile)}</span>
                          <span className="text-[12px] text-gray-500">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                      
                      {msg.is_deleted ? (
                        <div className="text-[14px] text-gray-400 italic mb-1">
                          Message deleted
                        </div>
                      ) : (
                        <div className="text-[14px] text-gray-900 mb-1 whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                          {msg.attachment_url && (
                            <div className="mt-2">
                              {msg.attachment_type === 'image' ? (
                                <img src={msg.attachment_url} alt="attachment" className="max-w-md rounded-[4px] max-h-64 object-cover border border-gray-200" />
                              ) : (
                                <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-1.5 border border-[#0a66c2] text-[#0a66c2] font-semibold rounded-full text-[14px] hover:bg-[#eaf4fd] transition-colors mt-2">
                                  Download Attachment
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 relative bg-[#f4f2ee]">
              {showEmojiPicker && (
                <div className="absolute bottom-full right-16 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-4 gap-2 z-10">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setMessageText(prev => prev + e)} className="text-xl p-1 hover:bg-gray-100 rounded">
                      {e}
                    </button>
                  ))}
                </div>
              )}
              {attachedFile && (
                <div className="mb-2 inline-flex items-center gap-2 bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-[13px] shadow-sm">
                  <ImageIcon size={14} className="text-gray-500" />
                  <span className="truncate max-w-[200px]">{attachedFile.name}</span>
                  <button onClick={() => setAttachedFile(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex items-end gap-2 bg-white border border-gray-300 rounded-[8px] px-4 py-2 relative shadow-sm focus-within:border-gray-500">
                <button onClick={() => fileRef.current?.click()} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded flex-shrink-0 transition-colors">
                  <Paperclip size={18} />
                </button>
                <input ref={fileRef} type="file" className="hidden" onChange={e => {
                  if (e.target.files?.[0]) setAttachedFile(e.target.files[0])
                }} />
                
                <TextareaAutosize
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Write a message…"
                  minRows={1}
                  maxRows={5}
                  className="flex-1 bg-transparent text-[14px] outline-none resize-none py-1.5 text-gray-900 placeholder-gray-500"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                />
                
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded flex-shrink-0 transition-colors">
                  <Smile size={18} />
                </button>
                
                <button
                  onClick={handleSend}
                  disabled={(!messageText.trim() && !attachedFile) || sendMut.isPending}
                  className="flex-shrink-0 p-1.5 bg-[#0a66c2] text-white rounded-full disabled:bg-gray-300 hover:bg-[#004182] transition-colors ml-1"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 bg-white">
            <div className="text-center">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-lg font-medium text-gray-600">Select a conversation</p>
              <p className="text-sm">Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-[300px] hidden lg:block flex-shrink-0">
        <div className="card bg-white border border-gray-200 rounded-lg p-4 mb-4 text-center shadow-sm">
          <div className="text-[12px] text-gray-500 text-right mb-2">Promoted •••</div>
          <div className="flex gap-3 mb-3 items-center text-left">
            <div className="w-14 h-14 bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
              <span className="text-[#e2231a] font-bold text-2xl italic">M</span>
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-semibold text-[14px] text-gray-900 leading-tight">Microchip India</span>
            </div>
          </div>
          <p className="text-[14px] text-gray-700 mb-4 text-left leading-snug">
            {user?.profile?.first_name ? `${user.profile.first_name}` : 'J Vinay Siva Subhash'}, grow your business with news and insights from Microchip...
          </p>
          <div className="text-[12px] text-gray-500 mb-4 text-left leading-relaxed">Stay informed on industry news and trends</div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-1">
              <div className="w-6 h-6 rounded-full bg-blue-100 border border-white"></div>
              <div className="w-6 h-6 rounded-full bg-green-100 border border-white"></div>
            </div>
            <span className="text-[12px] text-gray-500 leading-snug text-left">Siddani Nagendra & 1 other connection also follow</span>
          </div>
          <button className="w-full border border-[#0a66c2] text-[#0a66c2] font-semibold text-[15px] rounded-full py-1 hover:bg-[#eaf4fd] transition-colors">
            Follow
          </button>
        </div>

        {/* Footer links */}
        <div className="px-4 text-center text-[12px] text-gray-500 leading-[2]">
          <div className="mb-1">
            <a href="#" className="hover:text-[#0a66c2] hover:underline mx-2">About</a>
            <a href="#" className="hover:text-[#0a66c2] hover:underline mx-2">Accessibility</a>
            <a href="#" className="hover:text-[#0a66c2] hover:underline mx-2">Help Center</a>
          </div>
          <div className="mb-1">
            <a href="#" className="hover:text-[#0a66c2] hover:underline mx-2">Privacy & Terms ▾</a>
            <a href="#" className="hover:text-[#0a66c2] hover:underline mx-2">Ad Choices</a>
          </div>
          <div className="mb-1">
            <a href="#" className="hover:text-[#0a66c2] hover:underline mx-2">Advertising</a>
            <a href="#" className="hover:text-[#0a66c2] hover:underline mx-2">Business Services ▾</a>
          </div>
          <div className="mb-2">
            <a href="#" className="hover:text-[#0a66c2] hover:underline mx-2">Get the LinkedIn app</a>
            <a href="#" className="hover:text-[#0a66c2] hover:underline mx-2">More</a>
          </div>
          <div><strong className="text-[#0a66c2]">LinkedIn</strong> LinkedIn Corporation © 2026</div>
        </div>
      </div>
    </div>
  )
}
