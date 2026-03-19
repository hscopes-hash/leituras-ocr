'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

interface Maquina {
  codigo: number
  nome: string
  tipoId: number
  tipo?: {
    codigo: number
    descricao: string
  }
  entrada: number
  saida: number
  moeda: string
  ativo: boolean
}

interface TipoMaquina {
  codigo: number
  descricao: string
}

export default function MaquinasPage() {
  const router = useRouter()
  const [maquinas, setMaquinas] = useState<Maquina[]>([])
  const [tipos, setTipos] = useState<TipoMaquina[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [editando, setEditando] = useState<Maquina | null>(null)
  const [form, setForm] = useState({
    codigo: '',
    nome: '',
    tipoId: '',
    entrada: '0',
    saida: '0',
    moeda: 'R$',
    ativo: true,
  })

  const carregarDados = async () => {
    try {
      const [maquinasRes, tiposRes] = await Promise.all([
        fetch('/api/maquinas'),
        fetch('/api/tipos-maquina'),
      ])
      const maquinasData = await maquinasRes.json()
      const tiposData = await tiposRes.json()
      setMaquinas(maquinasData.maquinas || [])
      setTipos(tiposData || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
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
      const response = await fetch('/api/maquinas', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo,
          nome: form.nome.substring(0, 15),
          tipoId: parseInt(form.tipoId),
          entrada: parseFloat(form.entrada) || 0,
          saida: parseFloat(form.saida) || 0,
          moeda: form.moeda,
          ativo: form.ativo,
        }),
      })

      if (response.ok) {
        carregarDados()
        setForm({ codigo: '', nome: '', tipoId: '', entrada: '0', saida: '0', moeda: 'R$', ativo: true })
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

  const handleEdit = (maquina: Maquina) => {
    setEditando(maquina)
    setForm({
      codigo: maquina.codigo.toString().padStart(5, '0'),
      nome: maquina.nome,
      tipoId: maquina.tipoId.toString(),
      entrada: maquina.entrada.toString(),
      saida: maquina.saida.toString(),
      moeda: maquina.moeda,
      ativo: maquina.ativo,
    })
  }

  const handleDelete = async (codigo: number) => {
    if (!confirm('Deseja excluir esta máquina?')) return

    try {
      const response = await fetch(`/api/maquinas?codigo=${codigo}`, { method: 'DELETE' })
      if (response.ok) {
        carregarDados()
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
          <h1 className="text-xl font-bold">Máquinas</h1>
          <p className="text-sm text-slate-500">Cadastre as máquinas</p>
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {editando ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editando ? 'Editar Máquina' : 'Nova Máquina'}
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
                <Label className="text-sm">Nome (15 car.)</Label>
                <Input
                  maxLength={15}
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: MÁQUINA 01"
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">Tipo de Máquina</Label>
              <Select value={form.tipoId} onValueChange={(v) => setForm({ ...form, tipoId: v })} required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map((tipo) => (
                    <SelectItem key={tipo.codigo} value={tipo.codigo.toString()}>
                      {tipo.codigo.toString().padStart(2, '0')} - {tipo.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm">Entrada Inicial</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.entrada}
                  onChange={(e) => setForm({ ...form, entrada: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Saída Inicial</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.saida}
                  onChange={(e) => setForm({ ...form, saida: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Moeda</Label>
                <Input
                  maxLength={3}
                  value={form.moeda}
                  onChange={(e) => setForm({ ...form, moeda: e.target.value })}
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
                  setForm({ codigo: '', nome: '', tipoId: '', entrada: '0', saida: '0', moeda: 'R$', ativo: true })
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
          <CardTitle className="text-lg">Máquinas Cadastradas ({maquinas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {maquinas.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nenhuma máquina cadastrada</p>
          ) : (
            <div className="space-y-2">
              {maquinas.map((maquina) => (
                <div key={maquina.codigo} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-primary text-primary-foreground px-2 py-1 rounded">
                        {maquina.codigo.toString().padStart(5, '0')}
                      </span>
                      <span className="font-medium">{maquina.nome}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 ml-1">
                      Tipo: {maquina.tipo?.descricao || '-'} | {maquina.moeda} {maquina.entrada.toLocaleString('pt-BR')} / {maquina.saida.toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(maquina)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(maquina.codigo)}>
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
