'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

interface Local {
  codigo: number
  nome: string
  adicional?: string | null
  percentual: number
  ativo: boolean
}

export default function LocaisPage() {
  const router = useRouter()
  const [locais, setLocais] = useState<Local[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [editando, setEditando] = useState<Local | null>(null)
  const [form, setForm] = useState({
    codigo: '',
    nome: '',
    adicional: '',
    percentual: '0',
    ativo: true,
  })

  const carregarLocais = async () => {
    try {
      const response = await fetch('/api/locais')
      const data = await response.json()
      setLocais(data.locais || [])
    } catch (error) {
      console.error('Erro ao carregar locais:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarLocais()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)

    try {
      const codigo = parseInt(form.codigo)
      if (isNaN(codigo) || codigo < 1 || codigo > 99999) {
        alert('Código deve ser entre 00001 e 99999')
        setSalvando(false)
        return
      }

      const method = editando ? 'PUT' : 'POST'
      const response = await fetch('/api/locais', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo,
          nome: form.nome.substring(0, 30),
          adicional: form.adicional.substring(0, 30) || null,
          percentual: parseFloat(form.percentual) || 0,
          ativo: form.ativo,
        }),
      })

      if (response.ok) {
        carregarLocais()
        setForm({ codigo: '', nome: '', adicional: '', percentual: '0', ativo: true })
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

  const handleEdit = (local: Local) => {
    setEditando(local)
    setForm({
      codigo: local.codigo.toString().padStart(5, '0'),
      nome: local.nome,
      adicional: local.adicional || '',
      percentual: local.percentual.toString(),
      ativo: local.ativo,
    })
  }

  const handleDelete = async (codigo: number) => {
    if (!confirm('Deseja excluir este local?')) return

    try {
      const response = await fetch(`/api/locais?codigo=${codigo}`, { method: 'DELETE' })
      if (response.ok) {
        carregarLocais()
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
          <h1 className="text-xl font-bold">Locais</h1>
          <p className="text-sm text-slate-500">Cadastre os locais</p>
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {editando ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editando ? 'Editar Local' : 'Novo Local'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Código (5 dígitos)</Label>
                <Input
                  type="number"
                  min={1}
                  max={99999}
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  disabled={!!editando}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Nome (30 car.)</Label>
                <Input
                  maxLength={30}
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: LOCAL PRINCIPAL"
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Adicional (30 car.)</Label>
                <Input
                  maxLength={30}
                  value={form.adicional}
                  onChange={(e) => setForm({ ...form, adicional: e.target.value })}
                  placeholder="Opcional"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Percentual (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.percentual}
                  onChange={(e) => setForm({ ...form, percentual: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={salvando} className="flex-1">
                {salvando ? 'Salvando...' : editando ? 'Atualizar' : 'Cadastrar'}
              </Button>
              {editando && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditando(null)
                  setForm({ codigo: '', nome: '', adicional: '', percentual: '0', ativo: true })
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
          <CardTitle className="text-lg">Locais Cadastrados ({locais.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {locais.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nenhum local cadastrado</p>
          ) : (
            <div className="space-y-2">
              {locais.map((local) => (
                <div key={local.codigo} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-primary text-primary-foreground px-2 py-1 rounded">
                        {local.codigo.toString().padStart(5, '0')}
                      </span>
                      <span className="font-medium">{local.nome}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 ml-1">
                      {local.adicional && `${local.adicional} | `}Percentual: {local.percentual}%
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(local)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(local.codigo)}>
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
