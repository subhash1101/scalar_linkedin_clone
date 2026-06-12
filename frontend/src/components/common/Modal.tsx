import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            className={`relative bg-white rounded-xl shadow-2xl w-full ${sizeMap[size]} max-h-[90vh] overflow-y-auto`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close">
                  <X size={20} />
                </button>
              </div>
            )}
            {!title && (
              <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full z-10" aria-label="Close">
                <X size={20} />
              </button>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
