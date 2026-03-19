'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, Calendar, Clock, TrendingUp, TrendingDown, Image as ImageIcon } from 'lucide-react'

interface Leitura {
  id: string
  maquinaId: number
  maquina?: {
    codigo: number
    nome: string
  }
  local?: {
    codigo: number
    nome: string
  } | null
  entrada: number
  saida: number
  imagem?: string | null
  tempoProcessamento?: number | null
  dataLeitura: string
}

interface Usuario {
  id: string
  nome: string
  nivel: string
}

export default function LeiturasPage() {
  const router = useRouter()
  const [leituras, setLeituras] = useState<Leitura[]>([])
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null)

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario_logado')
    if (!usuarioSalvo) {
      router.push('/')
      return
    }
    const usuarioData = JSON.parse(usuarioSalvo)
    setUsuario(usuarioData)
    carregarLeituras(usuarioData.id)
  }, [router])

  const carregarLeituras = async (usuarioId: string) => {
    try {
      const response = await fetch(`/api/leituras?usuarioId=${usuarioId}`)
      const data = await response.json()
      setLeituras(data.leituras || [])
    } catch (error) {
      console.error('Erro ao carregar leituras:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr)
    return data.toLocaleDateString('pt-BR')
  }

  const formatarHora = (dataStr: string) => {
    const data = new Date(dataStr)
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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
          <h1 className="text-xl font-bold">Minhas Leituras</h1>
          <p className="text-sm text-slate-500">{leituras.length} leituras realizadas</p>
        </div>
      </div>

      {/* Lista de Leituras */}
      {leituras.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Nenhuma leitura realizada</p>
            <Button className="mt-4" onClick={() => router.push('/leitura')}>
              Fazer Primeira Leitura
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {leituras.map((leitura) => (
            <Card key={leitura.id} className="overflow-hidden">
              <CardHeader className="pb-2 bg-slate-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {leitura.maquina?.nome || `Máquina ${leitura.maquinaId}`}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {formatarData(leitura.dataLeitura)}
                    <Clock className="w-3 h-3 ml-2" />
                    {formatarHora(leitura.dataLeitura)}
                  </div>
                </div>
                {leitura.local && (
                  <p className="text-xs text-slate-500">{leitura.local.nome}</p>
                )}
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-2 rounded-full">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Entrada</p>
                      <p className="font-bold text-green-600">{formatarMoeda(leitura.entrada)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-red-100 p-2 rounded-full">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Saída</p>
                      <p className="font-bold text-red-600">{formatarMoeda(leitura.saida)}</p>
                    </div>
                  </div>
                </div>
                {leitura.imagem && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full text-xs"
                    onClick={() => setImagemSelecionada(leitura.imagem!)}
                  >
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Ver Imagem
                  </Button>
                )}
                {leitura.tempoProcessamento && (
                  <p className="text-xs text-slate-400 mt-2 text-right">
                    Processado em {leitura.tempoProcessamento.toFixed(1)}s
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Imagem */}
      {imagemSelecionada && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setImagemSelecionada(null)}
        >
          <img
            src={imagemSelecionada}
            alt="Leitura"
            className="max-w-full max-h-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            className="absolute top-4 right-4"
            variant="secondary"
            onClick={() => setImagemSelecionada(null)}
          >
            Fechar
          </Button>
        </div>
      )}
    </div>
  )
}
