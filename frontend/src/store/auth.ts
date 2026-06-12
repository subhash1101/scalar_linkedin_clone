import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  updateUser: (user: Partial<User>) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('access_token', token)
        set({ user, token })
      },
      updateUser: (partial) => {
        const current = get().user
        if (current) set({ user: { ...current, ...partial } })
      },
      logout: () => {
        localStorage.removeItem('access_token')
        set({ user: null, token: null })
      },
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'linkedin-auth',
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
)
