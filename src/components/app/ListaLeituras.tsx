'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trash2, Calendar, DollarSign } from 'lucide-react'

interface Leitura {
  id: string
  usuarioId: string
  maquinaId: number
  localId: number | null
  entrada: number
  saida: number
  tempoProcessamento: number | null
  dataLeitura: string
  usuario?: { nome: string; nomeCompleto: string | null }
  maquina?: { codigo: number; nome: string }
  local?: { codigo: number; nome: string }
}

export default function ListaLeituras() {
  const [leituras, setLeituras] = useState<Leitura[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const carregar = async () => {
    try {
      const response = await fetch('/api/leituras')
      const data = await response.json()
      setLeituras(data)
    } catch (error) {
      console.error('Erro ao carregar:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta leitura?')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/leituras?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        carregar()
      } else {
        alert('Erro ao excluir')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao excluir')
    } finally {
      setDeleting(null)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Leituras Realizadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leituras.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            Nenhuma leitura registrada
          </p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {leituras.map((leitura) => (
              <div
                key={leitura.id}
                className="p-3 bg-slate-50 rounded-lg border"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {leitura.maquina?.codigo?.toString().padStart(5, '0')}
                      </Badge>
                      <span className="font-medium">
                        {leitura.maquina?.nome || 'Máquina não encontrada'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-slate-600">
                      {formatDate(leitura.dataLeitura)}
                    </div>

                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-1 text-green-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">
                          E: {formatCurrency(leitura.entrada)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">
                          S: {formatCurrency(leitura.saida)}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 flex gap-4">
                      <span>
                        Usuário: {leitura.usuario?.nomeCompleto || leitura.usuario?.nome || '-'}
                      </span>
                      {leitura.local && (
                        <span>Local: {leitura.local.nome}</span>
                      )}
                      {leitura.tempoProcessamento && (
                        <span>IA: {leitura.tempoProcessamento.toFixed(1)}s</span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(leitura.id)}
                    disabled={deleting === leitura.id}
                  >
                    {deleting === leitura.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
