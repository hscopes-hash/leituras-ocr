'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Check, X } from 'lucide-react'

interface Usuario {
  id: string
  nome: string
  senha?: string
  nivel: string
  nomeCompleto?: string | null
  ativo: boolean
}

export default function UsuariosPage() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [form, setForm] = useState({
    nome: '',
    senha: '',
    nivel: 'OPERADOR',
    nomeCompleto: '',
    ativo: true,
  })

  const carregarUsuarios = async () => {
    try {
      const response = await fetch('/api/usuarios')
      const data = await response.json()
      setUsuarios(data.usuarios || [])
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarUsuarios()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)

    try {
      if (!form.nome || (!editando && !form.senha)) {
        alert('Preencha todos os campos obrigatórios')
        setSalvando(false)
        return
      }

      const method = editando ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        id: editando?.id,
        nome: form.nome,
        nivel: form.nivel,
        nomeCompleto: form.nomeCompleto || null,
        ativo: form.ativo,
      }

      if (form.senha) {
        body.senha = form.senha
      }

      const response = await fetch('/api/usuarios', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        carregarUsuarios()
        setForm({ nome: '', senha: '', nivel: 'OPERADOR', nomeCompleto: '', ativo: true })
        setEditando(null)
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao salvar')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  const handleEdit = (usuario: Usuario) => {
    setEditando(usuario)
    setForm({
      nome: usuario.nome,
      senha: '',
      nivel: usuario.nivel,
      nomeCompleto: usuario.nomeCompleto || '',
      ativo: usuario.ativo,
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este usuário?')) return

    try {
      const response = await fetch(`/api/usuarios?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        carregarUsuarios()
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao excluir')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao excluir')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Usuários</h1>
          <p className="text-sm text-slate-500">Gerencie os usuários do sistema</p>
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {editando ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editando ? 'Editar Usuário' : 'Novo Usuário'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Nome de Usuário *</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="login"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Senha {editando ? '(deixe vazio para manter)' : '*'}</Label>
                <Input
                  type="password"
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  placeholder="******"
                  required={!editando}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Nome Completo</Label>
                <Input
                  value={form.nomeCompleto}
                  onChange={(e) => setForm({ ...form, nomeCompleto: e.target.value })}
                  placeholder="Nome para exibição"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Nível</Label>
                <Select value={form.nivel} onValueChange={(v) => setForm({ ...form, nivel: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMINISTRADOR">ADMINISTRADOR</SelectItem>
                    <SelectItem value="SUPERVISOR">SUPERVISOR</SelectItem>
                    <SelectItem value="OPERADOR">OPERADOR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={salvando} className="flex-1">
                {salvando ? 'Salvando...' : editando ? 'Atualizar' : 'Cadastrar'}
              </Button>
              {editando && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditando(null)
                  setForm({ nome: '', senha: '', nivel: 'OPERADOR', nomeCompleto: '', ativo: true })
                }}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Usuários Cadastrados ({usuarios.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {usuarios.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nenhum usuário cadastrado</p>
          ) : (
            <div className="space-y-2">
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{usuario.nome}</span>
                      {usuario.ativo ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {usuario.nomeCompleto && `${usuario.nomeCompleto} | `}{usuario.nivel}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(usuario)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(usuario.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
