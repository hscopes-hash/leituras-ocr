'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Lock, User, Loader2, AlertCircle, Eye, EyeOff, SkipForward } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [salvarCredenciais, setSalvarCredenciais] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const usuarioLogado = localStorage.getItem('usuario_logado')
    if (usuarioLogado) {
      router.push('/dashboard')
      return
    }

    const credenciaisSalvas = localStorage.getItem('credenciais_usuario')
    if (credenciaisSalvas) {
      try {
        const { nome: nomeSalvo, senha: senhaSalva } = JSON.parse(credenciaisSalvas)
        setNome(nomeSalvo)
        setSenha(senhaSalva)
        setSalvarCredenciais(true)
      } catch {
        localStorage.removeItem('credenciais_usuario')
      }
    }

    setIsChecking(false)
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, senha }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('usuario_logado', JSON.stringify(data.usuario))

        if (salvarCredenciais) {
          localStorage.setItem('credenciais_usuario', JSON.stringify({ nome, senha }))
        } else {
          localStorage.removeItem('credenciais_usuario')
        }

        router.push('/dashboard')
      } else {
        setError(data.error || 'Usuário ou senha incorretos')
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePular = () => {
    const usuarioTemporario = {
      id: 'temp-' + Date.now(),
      nome: 'Visitante',
      nivel: 'ADMINISTRADOR',
      nomeCompleto: 'Visitante',
    }
    localStorage.setItem('usuario_logado', JSON.stringify(usuarioTemporario))
    router.push('/dashboard')
  }

  if (isChecking) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Login</CardTitle>
          <p className="text-sm text-muted-foreground">Sistema de Leituras</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome de Usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nome"
                  type="text"
                  placeholder="Digite seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="salvar"
                checked={salvarCredenciais}
                onCheckedChange={(checked) => setSalvarCredenciais(checked === true)}
              />
              <Label htmlFor="salvar" className="text-sm cursor-pointer">
                Salvar credenciais
              </Label>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              Entrar
            </Button>

            {/* Botão Pular */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handlePular}
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Pular
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
