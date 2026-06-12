import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import { ProtectedRoute, RecruiterRoute, AdminRoute } from './routes/ProtectedRoute'
import { PageSpinner } from './components/common/Spinner'

const AuthPage = lazy(() => import('./pages/AuthPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const ProfilePostsPage = lazy(() => import('./pages/ProfilePostsPage'))
const NetworkPage = lazy(() => import('./pages/NetworkPage'))
const JobsPage = lazy(() => import('./pages/JobsPage'))
const MessagingPage = lazy(() => import('./pages/MessagingPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const LearningPage = lazy(() => import('./pages/LearningPage'))
const RecruiterDashboard = lazy(() => import('./pages/RecruiterDashboard'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><PageSpinner /></div>}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/auth" element={<AuthPage />} />
          </Route>

          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/profile/:userId/posts" element={<ProfilePostsPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/messaging" element={<MessagingPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/learning" element={<LearningPage />} />
            <Route path="/recruiter" element={<RecruiterDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
