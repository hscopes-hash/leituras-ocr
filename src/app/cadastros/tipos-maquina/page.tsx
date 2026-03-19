'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

interface TipoMaquina {
  id: string
  codigo: number
  descricao: string
  campoEntrada: string
  campoSaida: string
}

export default function TiposMaquinaPage() {
  const router = useRouter()
  const [tipos, setTipos] = useState<TipoMaquina[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [editando, setEditando] = useState<TipoMaquina | null>(null)
  const [form, setForm] = useState({
    codigo: '',
    descricao: '',
    campoEntrada: 'ENTRADA',
    campoSaida: 'SAIDA',
  })

  const carregarTipos = async () => {
    try {
      const response = await fetch('/api/tipos-maquina')
      const data = await response.json()
      setTipos(data || [])
    } catch (error) {
      console.error('Erro ao carregar tipos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarTipos()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)

    try {
      const codigo = parseInt(form.codigo)
      if (isNaN(codigo) || codigo < 1 || codigo > 99) {
        alert('Código deve ser entre 01 e 99')
        setSalvando(false)
        return
      }

      const method = editando ? 'PUT' : 'POST'
      const body: { codigo: number; descricao: string; campoEntrada: string; campoSaida: string; id?: string } = {
        codigo,
        descricao: form.descricao.substring(0, 15),
        campoEntrada: form.campoEntrada.substring(0, 10),
        campoSaida: form.campoSaida.substring(0, 10),
      }
      
      if (editando) {
        body.id = editando.id
      }

      const response = await fetch('/api/tipos-maquina', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      
      if (response.ok) {
        carregarTipos()
        setForm({ codigo: '', descricao: '', campoEntrada: 'ENTRADA', campoSaida: 'SAIDA' })
        setEditando(null)
      } else {
        alert(data.error || 'Erro ao salvar')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  const handleEdit = (tipo: TipoMaquina) => {
    setEditando(tipo)
    setForm({
      codigo: tipo.codigo.toString().padStart(2, '0'),
      descricao: tipo.descricao,
      campoEntrada: tipo.campoEntrada,
      campoSaida: tipo.campoSaida,
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este tipo?')) return

    try {
      const response = await fetch(`/api/tipos-maquina?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        carregarTipos()
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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Tipos de Máquina</h1>
          <p className="text-sm text-slate-500">Cadastre os tipos de máquinas</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {editando ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editando ? 'Editar Tipo' : 'Novo Tipo'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Código (01-99)</Label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  disabled={!!editando}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Descrição (15 car.)</Label>
                <Input
                  maxLength={15}
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Ex: CAÇA NÍQUEL"
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Campo Entrada</Label>
                <Input
                  maxLength={10}
                  value={form.campoEntrada}
                  onChange={(e) => setForm({ ...form, campoEntrada: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Campo Saída</Label>
                <Input
                  maxLength={10}
                  value={form.campoSaida}
                  onChange={(e) => setForm({ ...form, campoSaida: e.target.value })}
                  required
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
                  setForm({ codigo: '', descricao: '', campoEntrada: 'ENTRADA', campoSaida: 'SAIDA' })
                }}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Tipos Cadastrados ({tipos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tipos.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nenhum tipo cadastrado</p>
          ) : (
            <div className="space-y-2">
              {tipos.map((tipo) => (
                <div key={tipo.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-primary text-primary-foreground px-2 py-1 rounded">
                        {tipo.codigo.toString().padStart(2, '0')}
                      </span>
                      <span className="font-medium">{tipo.descricao}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 ml-1">
                      Entrada: {tipo.campoEntrada} | Saída: {tipo.campoSaida}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(tipo)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(tipo.id)}>
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
