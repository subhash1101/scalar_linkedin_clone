import React, { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Image, FileText, X, Video } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'
import { postsApi } from '@/services/api'
import Avatar from '@/components/common/Avatar'
import { getFullName } from '@/utils'
import Modal from '@/components/common/Modal'
import TextareaAutosize from 'react-textarea-autosize'

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

  return (
    <>
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <Avatar src={user?.profile?.avatar_url} name={name} size="md" />
          <button
            onClick={() => setIsOpen(true)}
            className="flex-1 text-left border border-gray-400 rounded-full px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:border-gray-600 transition-colors"
          >
            Start a post
          </button>
        </div>
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
          {[
            { icon: Image, label: 'Photo', color: 'text-blue-500' },
            { icon: Video, label: 'Video', color: 'text-green-500' },
            { icon: FileText, label: 'Document', color: 'text-orange-500' },
          ].map(({ icon: Icon, label, color }) => (
            <button
              key={label}
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 text-sm font-medium transition-colors flex-1 justify-center"
            >
              <Icon size={20} className={color} />
              {label}
            </button>
          ))}
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
            <div className="flex items-center gap-2">
              <button onClick={() => fileRef.current?.click()} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <Image size={20} className="text-blue-500" />
              </button>
            </div>
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
