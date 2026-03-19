'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface Local {
  codigo: number
  nome: string
  adicional: string | null
  percentual: number
  ativo: boolean
}

export default function CadastroLocais() {
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

  const carregar = async () => {
    try {
      const response = await fetch('/api/locais')
      const data = await response.json()
      setLocais(data)
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
          adicional: form.adicional?.substring(0, 30) || null,
          percentual: parseFloat(form.percentual) || 0,
          ativo: form.ativo,
        }),
      })

      if (response.ok) {
        carregar()
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

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {editando ? 'Editar Local' : 'Novo Local'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Código (00001-99999)</Label>
                <Input
                  type="number"
                  min={1}
                  max={99999}
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  disabled={!!editando}
                  required
                />
              </div>
              <div>
                <Label>Nome (30 car.)</Label>
                <Input
                  maxLength={30}
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: CASINO LAS VEGAS"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Adicional (30 car.)</Label>
                <Input
                  maxLength={30}
                  value={form.adicional}
                  onChange={(e) => setForm({ ...form, adicional: e.target.value })}
                  placeholder="Ex: FILIAL CENTRO"
                />
              </div>
              <div>
                <Label>Percentual (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  value={form.percentual}
                  onChange={(e) => setForm({ ...form, percentual: e.target.value })}
                />
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
                  setForm({ codigo: '', nome: '', adicional: '', percentual: '0', ativo: true })
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
          <CardTitle className="text-lg">Locais Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {locais.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nenhum local cadastrado</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {locais.map((local) => (
                <div key={local.codigo} className={`flex items-center justify-between p-3 rounded-lg ${local.ativo ? 'bg-slate-50' : 'bg-slate-200 opacity-60'}`}>
                  <div>
                    <span className="font-mono text-sm bg-slate-200 px-2 py-1 rounded mr-2">
                      {local.codigo.toString().padStart(5, '0')}
                    </span>
                    <span className="font-medium">{local.nome}</span>
                    {local.adicional && (
                      <span className="text-sm text-slate-500 ml-2">({local.adicional})</span>
                    )}
                    {local.percentual > 0 && (
                      <div className="text-xs text-slate-500 mt-1">
                        Percentual adicional: {local.percentual.toFixed(2)}%
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(local)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(local.codigo)}>
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
