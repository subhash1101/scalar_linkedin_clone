import React from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Outlet />
      <Toaster position="top-center" />
    </div>
  )
}
