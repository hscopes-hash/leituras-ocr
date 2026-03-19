'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  nome: string
  nomeCompleto?: string | null
  nivel: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  savedCredentials: { nome: string; senha: string } | null
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  saveCredentials: (nome: string, senha: string) => void
  clearCredentials: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      savedCredentials: null,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
      saveCredentials: (nome, senha) =>
        set({ savedCredentials: { nome, senha } }),
      clearCredentials: () => set({ savedCredentials: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        savedCredentials: state.savedCredentials,
      }),
    }
  )
)
