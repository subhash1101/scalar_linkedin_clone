import React, { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'
import { postsApi } from '@/services/api'
import { getFullName, getInitials } from '@/utils'
import Modal from '@/components/common/Modal'
import TextareaAutosize from 'react-textarea-autosize'
import Avatar from '@/components/common/Avatar'

/* Photo icon = fa-solid fa-image */
function PhotoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 512 512" fill="#378fe9">
      <path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6h96 32H424c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/>
    </svg>
  )
}

/* Video icon = fa-brands fa-youtube style (play button) */
function VideoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 576 512" fill="#5f9b41">
      <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/>
    </svg>
  )
}

/* Write article icon = fa-solid fa-newspaper */
function ArticleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 512 512" fill="#e16745">
      <path d="M96 96c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H80c-44.2 0-80-35.8-80-80V128c0-17.7 14.3-32 32-32s32 14.3 32 32V400c0 8.8 7.2 16 16 16s16-7.2 16-16V96zm64 24v56c0 13.3 10.7 24 24 24H296c13.3 0 24-10.7 24-24V120c0-13.3-10.7-24-24-24H184c-13.3 0-24 10.7-24 24zm208-8c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H384c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H384c-8.8 0-16 7.2-16 16zM160 304c0 8.8 7.2 16 16 16H432c8.8 0 16-7.2 16-16s-7.2-16-16-16H176c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16H432c8.8 0 16-7.2 16-16s-7.2-16-16-16H176c-8.8 0-16 7.2-16 16z"/>
    </svg>
  )
}

const actionBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 8px',
  borderRadius: 4,
  fontSize: 14,
  fontWeight: 600,
  color: 'rgba(0,0,0,0.6)',
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  gap: 8,
}

export default function CreatePost() {
  const { user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()
  const name = getFullName(user?.profile)

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('content', content)
      fd.append('visibility', 'public')
      files.forEach(f => fd.append('files', f))
      return postsApi.createPost(fd)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] })
      setIsOpen(false)
      setContent('')
      setFiles([])
      setPreviews([])
      toast.success('Post shared!')
    },
    onError: () => toast.error('Failed to post'),
  })

  const addFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...newFiles])
    newFiles.forEach(f => {
      if (f.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = ev => setPreviews(prev => [...prev, ev.target!.result as string])
        reader.readAsDataURL(f)
      } else {
        setPreviews(prev => [...prev, ''])
      }
    })
  }

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const avatarSrc = user?.profile?.avatar_url

  return (
    <>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 8,
        border: '1px solid #e0dfdc',
        marginBottom: 8,
        overflow: 'hidden',
        padding: '12px 16px',
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          {/* Avatar */}
          <div style={{ width: 48, height: 48, borderRadius: '50%', marginRight: 8, flexShrink: 0, overflow: 'hidden' }}>
            {avatarSrc ? (
              <img src={avatarSrc} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '100%', height: '100%', backgroundColor: '#0a66c2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 16, fontWeight: 600,
              }}>
                {getInitials(name)}
              </div>
            )}
          </div>

          {/* Input */}
          <div
            onClick={() => setIsOpen(true)}
            style={{
              flexGrow: 1, border: '1px solid rgba(0,0,0,0.6)', borderRadius: 35,
              padding: '14px 16px', fontSize: 14, fontWeight: 600,
              color: 'rgba(0,0,0,0.6)', cursor: 'pointer', transition: 'background-color 0.2s',
            }}
            onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
            onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
          >
            Start a post
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <button
            style={actionBtnStyle}
            onClick={() => { setIsOpen(true); fileRef.current?.click() }}
            onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
            onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
          >
            <PhotoIcon /> Photo
          </button>
          <button
            style={actionBtnStyle}
            onClick={() => setIsOpen(true)}
            onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
            onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
          >
            <VideoIcon /> Video
          </button>
          <button
            style={actionBtnStyle}
            onClick={() => setIsOpen(true)}
            onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
            onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
          >
            <ArticleIcon /> Write article
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create a post">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar src={user?.profile?.avatar_url} name={name} size="md" />
            <div>
              <div className="font-semibold text-sm">{name}</div>
              <select className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5 mt-1 border border-gray-200">
                <option>Anyone</option>
                <option>Connections only</option>
              </select>
            </div>
          </div>

          <TextareaAutosize
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What do you want to talk about?"
            minRows={4}
            maxRows={15}
            className="w-full resize-none outline-none text-gray-800 text-base placeholder-gray-400"
            autoFocus
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden bg-gray-100">
                  {src ? (
                    <img src={src} alt="" className="w-full h-32 object-cover" />
                  ) : (
                    <div className="h-32 flex items-center justify-center text-sm text-gray-500">
                      <FileText size={24} className="mr-2" /> {files[i]?.name}
                    </div>
                  )}
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input ref={fileRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={addFile} />

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button onClick={() => fileRef.current?.click()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <PhotoIcon />
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={!content.trim() || mutation.isPending}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
