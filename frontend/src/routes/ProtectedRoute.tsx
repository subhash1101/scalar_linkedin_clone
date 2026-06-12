import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  if (!token) return <Navigate to="/auth" replace />
  return <>{children}</>
}

export function RecruiterRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/auth" replace />
  if (user.role !== 'recruiter' && user.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/auth" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}
