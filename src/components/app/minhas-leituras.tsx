'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Eye, Trash2 } from 'lucide-react'

interface Leitura {
  id: string
  entrada: number
  saida: number
  imagem: string | null
  tempoProcessamento: number | null
  observacao: string | null
  dataLeitura: string
  maquina: {
    codigo: number
    nome: string
    moeda: string
    tipo: {
      descricao: string
    }
  }
  local: {
    codigo: number
    nome: string
  } | null
}

interface MinhasLeiturasProps {
  onBack: () => void
}

export function MinhasLeituras({ onBack }: MinhasLeiturasProps) {
  const [leituras, setLeituras] = useState<Leitura[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [selectedLeitura, setSelectedLeitura] = useState<Leitura | null>(null)

  const loadLeituras = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (dataInicio) params.append('dataInicio', dataInicio)
      if (dataFim) params.append('dataFim', dataFim)

      const response = await fetch(`/api/leituras?${params.toString()}`)
      const data = await response.json()
      setLeituras(data)
    } catch (error) {
      console.error('Erro ao carregar leituras:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLeituras()
  }, [dataInicio, dataFim])

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta leitura?')) return

    try {
      const response = await fetch(`/api/leituras?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        setLeituras(leituras.filter((l) => l.id !== id))
        setSelectedLeitura(null)
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatValue = (value: number, moeda: string) => {
    return `${moeda} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-20">
      {/* Header */}
      <div className="bg-green-500 text-white p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-green-600">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Minhas Leituras</h1>
          <p className="text-white/80 text-sm">{leituras.length} registro(s)</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 bg-white border-b">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Data Início</Label>
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Data Fim</Label>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : leituras.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma leitura encontrada
          </div>
        ) : (
          leituras.map((leitura) => (
            <Card
              key={leitura.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedLeitura(leitura)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(leitura.dataLeitura)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedLeitura(leitura)
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>

                <div className="font-semibold mb-2">
                  {leitura.maquina.codigo.toString().padStart(5, '0')} - {leitura.maquina.nome}
                </div>

                {leitura.local && (
                  <div className="text-sm text-muted-foreground mb-2">
                    📍 {leitura.local.nome}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-1.5 rounded-full">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Entrada</p>
                      <p className="font-semibold text-green-600">
                        {formatValue(leitura.entrada, leitura.maquina.moeda)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-red-100 p-1.5 rounded-full">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Saída</p>
                      <p className="font-semibold text-red-600">
                        {formatValue(leitura.saida, leitura.maquina.moeda)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog Detalhes */}
      <Dialog open={!!selectedLeitura} onOpenChange={() => setSelectedLeitura(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Leitura</DialogTitle>
          </DialogHeader>
          {selectedLeitura && (
            <div className="space-y-4">
              <div className="text-sm space-y-2">
                <p>
                  <strong>Data/Hora:</strong> {formatDate(selectedLeitura.dataLeitura)}
                </p>
                <p>
                  <strong>Máquina:</strong>{' '}
                  {selectedLeitura.maquina.codigo.toString().padStart(5, '0')} -{' '}
                  {selectedLeitura.maquina.nome}
                </p>
                {selectedLeitura.local && (
                  <p>
                    <strong>Local:</strong> {selectedLeitura.local.nome}
                  </p>
                )}
                <p>
                  <strong>Entrada:</strong>{' '}
                  <span className="text-green-600">
                    {formatValue(selectedLeitura.entrada, selectedLeitura.maquina.moeda)}
                  </span>
                </p>
                <p>
                  <strong>Saída:</strong>{' '}
                  <span className="text-red-600">
                    {formatValue(selectedLeitura.saida, selectedLeitura.maquina.moeda)}
                  </span>
                </p>
                {selectedLeitura.tempoProcessamento && (
                  <p>
                    <strong>Tempo IA:</strong> {selectedLeitura.tempoProcessamento.toFixed(1)}s
                  </p>
                )}
                {selectedLeitura.observacao && (
                  <p>
                    <strong>Observação:</strong> {selectedLeitura.observacao}
                  </p>
                )}
              </div>

              {selectedLeitura.imagem && (
                <img
                  src={selectedLeitura.imagem}
                  alt="Leitura"
                  className="w-full rounded-lg"
                />
              )}

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleDelete(selectedLeitura.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Leitura
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex justify-around py-2">
          <Button
            variant="ghost"
            className="flex flex-col items-center h-auto py-2 px-3"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs mt-1">Voltar</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center h-auto py-2 px-3 text-green-500"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs mt-1">Histórico</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
