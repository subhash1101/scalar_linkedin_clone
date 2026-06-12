import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { authApi, usersApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'

const loginSchema = z.object({
  username: z.string().min(1, 'Username required'),
  password: z.string().min(1, 'Password required'),
})

const registerSchema = z.object({
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().min(1, 'Last name required'),
  username: z.string().min(3, 'Min 3 characters').max(50),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const handleLogin = async (data: LoginForm) => {
    setLoading(true)
    try {
      const res = await authApi.login(data.username, data.password)
      const tokenData = res.data
      // Store token first so the axios interceptor can attach it to getMe()
      localStorage.setItem('access_token', tokenData.access_token)
      const userRes = await usersApi.getMe()
      setAuth(userRes.data, tokenData.access_token)
      navigate('/')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      localStorage.removeItem('access_token')
      toast.error(error.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (data: RegisterForm) => {
    setLoading(true)
    try {
      const res = await authApi.register(data)
      const tokenData = res.data
      // Store token first so the axios interceptor can attach it to getMe()
      localStorage.setItem('access_token', tokenData.access_token)
      const userRes = await usersApi.getMe()
      setAuth(userRes.data, tokenData.access_token)
      navigate('/')
      toast.success('Welcome to LinkedIn!')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      localStorage.removeItem('access_token')
      toast.error(error.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">in</span>
          </div>
          <span className="text-brand-500 text-2xl font-bold tracking-tight">linkedin</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-600">New to LinkedIn?</span>
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="font-semibold text-brand-500 hover:text-brand-600"
          >
            {mode === 'login' ? 'Join now' : 'Sign in'}
          </button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-65px)]">
        {/* Left hero */}
        <div className="hidden lg:flex flex-col justify-center flex-1 max-w-xl px-16">
          <h1 className="text-5xl font-normal text-[#8f5849] leading-tight mb-2">
            Welcome to your<br />professional community
          </h1>
          <div className="mt-8 space-y-4">
            {[
              { emoji: '🚀', text: 'Find your dream job' },
              { emoji: '🤝', text: 'Connect with professionals' },
              { emoji: '📚', text: 'Learn new skills' },
              { emoji: '💡', text: 'Share your expertise' },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-center gap-3 text-lg text-gray-700">
                <span className="text-2xl">{emoji}</span>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Auth form */}
        <div className="flex items-center justify-center flex-1 px-6 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
              <AnimatePresence mode="wait">
                {mode === 'login' ? (
                  <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <h2 className="text-2xl font-semibold mb-1">Sign in</h2>
                    <p className="text-gray-500 text-sm mb-6">Stay updated on your professional world</p>

                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                          {...loginForm.register('username')}
                          className="input"
                          placeholder="Enter your username"
                          autoComplete="username"
                        />
                        {loginForm.formState.errors.username && (
                          <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.username.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                          <input
                            {...loginForm.register('password')}
                            type={showPw ? 'text' : 'password'}
                            className="input pr-10"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                          />
                          <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                        )}
                      </div>
                      <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
                        {loading ? 'Signing in…' : 'Sign in'}
                      </button>
                    </form>

                    <div className="mt-4 text-center text-sm text-gray-500">
                      <span>Demo: </span>
                      <button onClick={() => { loginForm.setValue('username', 'demo'); loginForm.setValue('password', 'password123') }} className="text-brand-500 hover:underline">
                        Fill demo credentials
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-2xl font-semibold mb-1">Make the most of your professional life</h2>
                    <p className="text-gray-500 text-sm mb-6">Create your free account</p>

                    <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                          <input {...registerForm.register('first_name')} className="input" placeholder="First" />
                          {registerForm.formState.errors.first_name && (
                            <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.first_name.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                          <input {...registerForm.register('last_name')} className="input" placeholder="Last" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input {...registerForm.register('username')} className="input" placeholder="Choose a username" />
                        {registerForm.formState.errors.username && (
                          <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.username.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input {...registerForm.register('email')} type="email" className="input" placeholder="Email address" />
                        {registerForm.formState.errors.email && (
                          <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                          <input {...registerForm.register('password')} type={showPw ? 'text' : 'password'} className="input pr-10" placeholder="6+ characters" />
                          <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {registerForm.formState.errors.password && (
                          <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.password.message}</p>
                        )}
                      </div>
                      <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
                        {loading ? 'Creating account…' : 'Join now'}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
