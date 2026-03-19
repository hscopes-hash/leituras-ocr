'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface Usuario {
  id: string
  nome: string
  nomeCompleto: string | null
  nivel: string
  ativo: boolean
}

interface CadastroUsuariosProps {
  isAdmin: boolean
}

const NIVEIS = [
  { value: 'OPERADOR', label: 'Operador' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'ADMINISTRADOR', label: 'Administrador' },
]

export default function CadastroUsuarios({ isAdmin }: CadastroUsuariosProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [form, setForm] = useState({
    nome: '',
    senha: '',
    nomeCompleto: '',
    nivel: 'OPERADOR',
    ativo: true,
  })

  const carregar = async () => {
    try {
      const response = await fetch('/api/usuarios')
      const data = await response.json()
      setUsuarios(data)
    } catch (error) {
      console.error('Erro ao carregar:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)

    try {
      const method = editando ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        nome: form.nome,
        nomeCompleto: form.nomeCompleto,
        nivel: form.nivel,
        ativo: form.ativo,
      }

      if (!editando || form.senha) {
        body.senha = form.senha
      }

      if (editando) {
        body.id = editando.id
      }

      const response = await fetch('/api/usuarios', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        carregar()
        setForm({ nome: '', senha: '', nomeCompleto: '', nivel: 'OPERADOR', ativo: true })
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
      nomeCompleto: usuario.nomeCompleto || '',
      nivel: usuario.nivel,
      ativo: usuario.ativo,
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este usuário?')) return

    try {
      const response = await fetch(`/api/usuarios?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        carregar()
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao excluir')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao excluir')
    }
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          Acesso restrito a administradores
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {editando ? 'Editar Usuário' : 'Novo Usuário'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome de Login</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: joao"
                  disabled={!!editando}
                  required
                />
              </div>
              <div>
                <Label>Senha {editando && '(deixe vazio para manter)'}</Label>
                <Input
                  type="password"
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  placeholder="••••••"
                  required={!editando}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome Completo</Label>
                <Input
                  value={form.nomeCompleto}
                  onChange={(e) => setForm({ ...form, nomeCompleto: e.target.value })}
                  placeholder="Ex: João da Silva"
                />
              </div>
              <div>
                <Label>Nível de Acesso</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={form.nivel}
                  onChange={(e) => setForm({ ...form, nivel: e.target.value })}
                >
                  {NIVEIS.map((n) => (
                    <option key={n.value} value={n.value}>{n.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.ativo} onCheckedChange={(checked) => setForm({ ...form, ativo: checked })} />
              <Label>Ativo</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={salvando}>
                {salvando ? 'Salvando...' : editando ? 'Atualizar' : 'Cadastrar'}
              </Button>
              {editando && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditando(null)
                  setForm({ nome: '', senha: '', nomeCompleto: '', nivel: 'OPERADOR', ativo: true })
                }}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {usuarios.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nenhum usuário cadastrado</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {usuarios.map((usuario) => (
                <div key={usuario.id} className={`flex items-center justify-between p-3 rounded-lg ${usuario.ativo ? 'bg-slate-50' : 'bg-slate-200 opacity-60'}`}>
                  <div>
                    <span className="font-medium">{usuario.nome}</span>
                    {usuario.nomeCompleto && (
                      <span className="text-sm text-slate-500 ml-2">({usuario.nomeCompleto})</span>
                    )}
                    <div className="text-xs text-slate-500 mt-1">
                      Nível: {NIVEIS.find(n => n.value === usuario.nivel)?.label || usuario.nivel}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(usuario)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(usuario.id)}>
                      Excluir
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
