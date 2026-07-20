import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import MessagingOverlay from '@/components/layout/MessagingOverlay'
import { Toaster } from 'react-hot-toast'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <MessagingOverlay />
      <Toaster
        position="bottom-left"
        toastOptions={{
          duration: 3000,
          style: { background: '#1d2226', color: '#fff', borderRadius: '8px', fontSize: '14px' },
        }}
      />
    </div>
  )
}
