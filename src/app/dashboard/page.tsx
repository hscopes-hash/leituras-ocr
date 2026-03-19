'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  FileText, 
  Settings, 
  Users, 
  Database,
  MapPin,
  Cog,
  TrendingUp,
  Clock
} from 'lucide-react'

interface Usuario {
  id: string
  nome: string
  nivel: string
}

interface Estatisticas {
  totalLeituras: number
  leiturasHoje: number
  totalMaquinas: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [stats, setStats] = useState<Estatisticas>({
    totalLeituras: 0,
    leiturasHoje: 0,
    totalMaquinas: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario_logado')
    if (!usuarioSalvo) {
      router.push('/')
      return
    }
    setUsuario(JSON.parse(usuarioSalvo))
    
    // Carregar estatísticas
    fetchEstatisticas()
  }, [router])

  const fetchEstatisticas = async () => {
    try {
      const [leiturasRes, maquinasRes] = await Promise.all([
        fetch('/api/leituras/stats'),
        fetch('/api/maquinas'),
      ])
      
      const leiturasData = await leiturasRes.json()
      const maquinasData = await maquinasRes.json()
      
      setStats({
        totalLeituras: leiturasData.total || 0,
        leiturasHoje: leiturasData.hoje || 0,
        totalMaquinas: maquinasData.maquinas?.length || 0,
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isAdmin = usuario?.nivel === 'ADMINISTRADOR'

  const menuPrincipal = [
    {
      title: 'Leitura OCR',
      description: 'Capturar foto e extrair valores',
      icon: Camera,
      href: '/leitura',
      color: 'bg-green-500',
      show: true,
    },
    {
      title: 'Minhas Leituras',
      description: 'Histórico de leituras realizadas',
      icon: FileText,
      href: '/leituras',
      color: 'bg-blue-500',
      show: true,
    },
  ]

  const menuCadastros = [
    {
      title: 'Tipos de Máquina',
      description: 'Cadastrar tipos',
      icon: Database,
      href: '/cadastros/tipos-maquina',
      show: isAdmin,
    },
    {
      title: 'Máquinas',
      description: 'Cadastrar máquinas',
      icon: Cog,
      href: '/cadastros/maquinas',
      show: isAdmin,
    },
    {
      title: 'Locais',
      description: 'Cadastrar locais',
      icon: MapPin,
      href: '/cadastros/locais',
      show: isAdmin,
    },
    {
      title: 'Usuários',
      description: 'Gerenciar usuários',
      icon: Users,
      href: '/cadastros/usuarios',
      show: isAdmin,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Boas-vindas */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-slate-800">Sistema de Leituras</h1>
        <p className="text-slate-500">Bem-vindo, {usuario?.nome}!</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <CardContent className="p-3">
            <FileText className="w-6 h-6 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{stats.totalLeituras}</p>
            <p className="text-xs text-slate-500">Total</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <Clock className="w-6 h-6 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold">{stats.leiturasHoje}</p>
            <p className="text-xs text-slate-500">Hoje</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <Cog className="w-6 h-6 mx-auto text-orange-500 mb-1" />
            <p className="text-2xl font-bold">{stats.totalMaquinas}</p>
            <p className="text-xs text-slate-500">Máquinas</p>
          </CardContent>
        </Card>
      </div>

      {/* Menu Principal */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-slate-700">Ações</h2>
        <div className="grid grid-cols-2 gap-3">
          {menuPrincipal.filter(item => item.show).map((item) => (
            <Card 
              key={item.href}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(item.href)}
            >
              <CardContent className="p-4">
                <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-xs text-slate-500">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Menu Cadastros */}
      {isAdmin && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-700">Cadastros</h2>
            <Badge variant="secondary" className="text-xs">Admin</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {menuCadastros.filter(item => item.show).map((item) => (
              <Card 
                key={item.href}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(item.href)}
              >
                <CardContent className="p-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                    <item.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <h3 className="font-medium text-sm">{item.title}</h3>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
