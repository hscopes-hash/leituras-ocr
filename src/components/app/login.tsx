'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, LogIn, UserPlus } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'

interface LoginProps {
  onLoginSuccess: () => void
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [lembrar, setLembrar] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasUsers, setHasUsers] = useState<boolean | null>(null)
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [newAdminNome, setNewAdminNome] = useState('')
  const [newAdminSenha, setNewAdminSenha] = useState('')

  const { savedCredentials, saveCredentials, clearCredentials } = useAuthStore()

  // Check if users exist
  useEffect(() => {
    const checkUsers = async () => {
      try {
        const response = await fetch('/api/auth')
        const data = await response.json()
        // If authenticated, we already have a session
        if (data.authenticated) {
          onLoginSuccess()
          return
        }
        // Check if users exist by trying to access a protected route
        const usuariosResponse = await fetch('/api/usuarios')
        if (usuariosResponse.status === 401) {
          // No session, but we need to check if users exist
          // Try to create admin - if fails, users exist
          setHasUsers(true) // Assume users exist by default
        } else if (usuariosResponse.status === 403) {
          // Has session but not admin - login worked
          onLoginSuccess()
        }
      } catch {
        setHasUsers(true)
      }
    }
    checkUsers()
  }, [onLoginSuccess])

  // Load saved credentials
  useEffect(() => {
    if (savedCredentials) {
      setNome(savedCredentials.nome)
      setSenha(savedCredentials.senha)
      setLembrar(true)
    }
  }, [savedCredentials])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, senha, lembrar }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        if (lembrar) {
          saveCredentials(nome, senha)
        } else {
          clearCredentials()
        }
        onLoginSuccess()
      } else {
        setError(data.error || 'Erro ao fazer login')
        setHasUsers(true)
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: newAdminNome, senha: newAdminSenha }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        onLoginSuccess()
      } else {
        setError(data.error || 'Erro ao criar usuário')
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShowCreateAdmin = async () => {
    // Try to create admin to check if users exist
    try {
      const response = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: 'test', senha: 'test' }),
      })

      if (response.status === 400) {
        // Users exist
        setShowCreateAdmin(false)
        setError('Já existem usuários cadastrados. Faça login.')
        setHasUsers(true)
      } else {
        setShowCreateAdmin(true)
        setHasUsers(false)
      }
    } catch {
      setShowCreateAdmin(true)
      setHasUsers(false)
    }
  }

  if (hasUsers === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Gestão de Leituras</CardTitle>
          <CardDescription>
            {showCreateAdmin ? 'Criar usuário administrador' : 'Faça login para continuar'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showCreateAdmin ? (
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newAdminNome">Nome de usuário</Label>
                <Input
                  id="newAdminNome"
                  type="text"
                  value={newAdminNome}
                  onChange={(e) => setNewAdminNome(e.target.value)}
                  placeholder="Digite o nome de usuário"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newAdminSenha">Senha</Label>
                <Input
                  id="newAdminSenha"
                  type="password"
                  value={newAdminSenha}
                  onChange={(e) => setNewAdminSenha(e.target.value)}
                  placeholder="Digite a senha"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                Criar Administrador
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowCreateAdmin(false)}
              >
                Voltar ao login
              </Button>
            </form>
          ) : (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Digite seu nome de usuário"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lembrar"
                    checked={lembrar}
                    onCheckedChange={(checked) => setLembrar(checked as boolean)}
                  />
                  <Label htmlFor="lembrar" className="text-sm font-normal cursor-pointer">
                    Salvar credenciais
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4 mr-2" />
                  )}
                  Entrar
                </Button>
              </form>

              {!hasUsers && (
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleShowCreateAdmin}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Criar primeiro usuário ADMIN
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
