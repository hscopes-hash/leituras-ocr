'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Usuario {
  id: string
  nome: string
  nomeCompleto?: string | null
  nivel: string
}

interface AuthContextType {
  usuario: Usuario | null
  isLoading: boolean
  login: (nome: string, senha: string, lembrar: boolean) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAdmin: boolean
  isOperador: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth')
      const data = await response.json()
      if (data.authenticated && data.usuario) {
        setUsuario(data.usuario)
      }
    } catch {
      setUsuario(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (nome: string, senha: string, lembrar: boolean) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, senha, lembrar }),
      })

      const data = await response.json()

      if (data.success && data.usuario) {
        setUsuario(data.usuario)
        return { success: true }
      }

      return { success: false, error: data.error || 'Erro ao fazer login' }
    } catch {
      return { success: false, error: 'Erro de conexão' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' })
    } finally {
      setUsuario(null)
    }
  }

  const isAdmin = usuario?.nivel === 'ADMINISTRADOR'
  const isOperador = usuario?.nivel === 'OPERADOR' || isAdmin

  return (
    <AuthContext.Provider value={{ usuario, isLoading, login, logout, isAdmin, isOperador }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
