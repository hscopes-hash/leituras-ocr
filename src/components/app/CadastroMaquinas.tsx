'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface TipoMaquina {
  codigo: number
  descricao: string
}

interface Maquina {
  codigo: number
  nome: string
  tipoId: number
  tipo?: TipoMaquina
  entrada: number
  saida: number
  moeda: string
  ativo: boolean
}

export default function CadastroMaquinas() {
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

  const carregar = async () => {
    try {
      const [resMaquinas, resTipos] = await Promise.all([
        fetch('/api/maquinas'),
        fetch('/api/tipos-maquina'),
      ])
      const dataMaquinas = await resMaquinas.json()
      const dataTipos = await resTipos.json()
      setMaquinas(dataMaquinas)
      setTipos(dataTipos)
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
      const response = await fetch('/api/maquinas', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo,
          nome: form.nome.substring(0, 15),
          tipoId: parseInt(form.tipoId),
          entrada: parseFloat(form.entrada) || 0,
          saida: parseFloat(form.saida) || 0,
          moeda: form.moeda.substring(0, 5),
          ativo: form.ativo,
        }),
      })

      if (response.ok) {
        carregar()
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
            {editando ? 'Editar Máquina' : 'Nova Máquina'}
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
                <Label>Nome (15 car.)</Label>
                <Input
                  maxLength={15}
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: MÁQUINA 01"
                  required
                />
              </div>
            </div>
            <div>
              <Label>Tipo de Máquina</Label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={form.tipoId}
                onChange={(e) => setForm({ ...form, tipoId: e.target.value })}
                required
              >
                <option value="">Selecione...</option>
                {tipos.map((tipo) => (
                  <option key={tipo.codigo} value={tipo.codigo}>
                    {tipo.codigo.toString().padStart(2, '0')} - {tipo.descricao}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Entrada</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.entrada}
                  onChange={(e) => setForm({ ...form, entrada: e.target.value })}
                />
              </div>
              <div>
                <Label>Saída</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.saida}
                  onChange={(e) => setForm({ ...form, saida: e.target.value })}
                />
              </div>
              <div>
                <Label>Moeda</Label>
                <Input
                  maxLength={5}
                  value={form.moeda}
                  onChange={(e) => setForm({ ...form, moeda: e.target.value })}
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
                  setForm({ codigo: '', nome: '', tipoId: '', entrada: '0', saida: '0', moeda: 'R$', ativo: true })
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
          <CardTitle className="text-lg">Máquinas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {maquinas.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nenhuma máquina cadastrada</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {maquinas.map((maquina) => (
                <div key={maquina.codigo} className={`flex items-center justify-between p-3 rounded-lg ${maquina.ativo ? 'bg-slate-50' : 'bg-slate-200 opacity-60'}`}>
                  <div>
                    <span className="font-mono text-sm bg-slate-200 px-2 py-1 rounded mr-2">
                      {maquina.codigo.toString().padStart(5, '0')}
                    </span>
                    <span className="font-medium">{maquina.nome}</span>
                    <div className="text-xs text-slate-500 mt-1">
                      Tipo: {maquina.tipo?.descricao || '-'} | Entrada: {maquina.moeda} {maquina.entrada.toFixed(2)} | Saída: {maquina.moeda} {maquina.saida.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(maquina)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(maquina.codigo)}>
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
