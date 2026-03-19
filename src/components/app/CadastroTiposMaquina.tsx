'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TipoMaquina {
  codigo: number
  descricao: string
  campoEntrada: string
  campoSaida: string
}

export default function CadastroTiposMaquina() {
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
      setTipos(data)
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
      const response = await fetch('/api/tipos-maquina', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo,
          descricao: form.descricao.substring(0, 15),
          campoEntrada: form.campoEntrada.substring(0, 10),
          campoSaida: form.campoSaida.substring(0, 10),
        }),
      })

      if (response.ok) {
        carregarTipos()
        setForm({ codigo: '', descricao: '', campoEntrada: 'ENTRADA', campoSaida: 'SAIDA' })
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

  const handleEdit = (tipo: TipoMaquina) => {
    setEditando(tipo)
    setForm({
      codigo: tipo.codigo.toString().padStart(2, '0'),
      descricao: tipo.descricao,
      campoEntrada: tipo.campoEntrada,
      campoSaida: tipo.campoSaida,
    })
  }

  const handleDelete = async (codigo: number) => {
    if (!confirm('Deseja excluir este tipo?')) return

    try {
      const response = await fetch(`/api/tipos-maquina?codigo=${codigo}`, { method: 'DELETE' })
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
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {editando ? 'Editar Tipo de Máquina' : 'Novo Tipo de Máquina'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Código (01-99)</Label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  disabled={!!editando}
                  required
                />
              </div>
              <div>
                <Label>Descrição (15 car.)</Label>
                <Input
                  maxLength={15}
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Ex: CAÇA NÍQUEL"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Campo Entrada (10 car.)</Label>
                <Input
                  maxLength={10}
                  value={form.campoEntrada}
                  onChange={(e) => setForm({ ...form, campoEntrada: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Campo Saída (10 car.)</Label>
                <Input
                  maxLength={10}
                  value={form.campoSaida}
                  onChange={(e) => setForm({ ...form, campoSaida: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={salvando}>
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
        <CardHeader>
          <CardTitle className="text-lg">Tipos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {tipos.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nenhum tipo cadastrado</p>
          ) : (
            <div className="space-y-2">
              {tipos.map((tipo) => (
                <div key={tipo.codigo} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <span className="font-mono text-sm bg-slate-200 px-2 py-1 rounded mr-2">
                      {tipo.codigo.toString().padStart(2, '0')}
                    </span>
                    <span className="font-medium">{tipo.descricao}</span>
                    <div className="text-xs text-slate-500 mt-1">
                      Entrada: {tipo.campoEntrada} | Saída: {tipo.campoSaida}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(tipo)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(tipo.codigo)}>
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
