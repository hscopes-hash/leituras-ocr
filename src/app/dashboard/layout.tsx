'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Camera, 
  FileText, 
  Settings, 
  Users, 
  LogOut, 
  Home,
  Database,
  MapPin,
  Cog,
  Menu,
  X,
  User
} from 'lucide-react'

interface Usuario {
  id: string
  nome: string
  nivel: string
  nomeCompleto?: string | null
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [menuAberto, setMenuAberto] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario_logado')
    if (!usuarioSalvo) {
      router.push('/')
      return
    }
    const parsed = JSON.parse(usuarioSalvo)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsuario(parsed)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCarregando(false)
  }, [router])

  const isAdmin = usuario?.nivel === 'ADMINISTRADOR'

  const handleLogout = () => {
    localStorage.removeItem('usuario_logado')
    router.push('/')
  }

  const menuItems = [
    { icon: Home, label: 'Início', href: '/dashboard', show: true },
    { icon: Camera, label: 'Nova Leitura', href: '/leitura', show: true },
    { icon: FileText, label: 'Minhas Leituras', href: '/leituras', show: true },
    { icon: Database, label: 'Tipos de Máquina', href: '/cadastros/tipos-maquina', show: isAdmin },
    { icon: Cog, label: 'Máquinas', href: '/cadastros/maquinas', show: isAdmin },
    { icon: MapPin, label: 'Locais', href: '/cadastros/locais', show: isAdmin },
    { icon: Users, label: 'Usuários', href: '/cadastros/usuarios', show: isAdmin },
  ]

  const menuInferior = [
    { icon: Home, label: 'Início', href: '/dashboard' },
    { icon: Camera, label: 'Ler', href: '/leitura' },
    { icon: FileText, label: 'Histórico', href: '/leituras' },
    { icon: Settings, label: 'Mais', href: '#', onClick: () => setMenuAberto(!menuAberto) },
  ]

  if (carregando || !usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">{usuario.nomeCompleto || usuario.nome}</p>
              <p className="text-xs opacity-80">{usuario.nivel}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-primary-foreground hover:bg-white/20">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Menu Lateral (Mobile) */}
      {menuAberto && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMenuAberto(false)}>
          <Card className="absolute right-0 top-0 h-full w-64 rounded-none" onClick={e => e.stopPropagation()}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg">Cadastros</h2>
                <Button variant="ghost" size="icon" onClick={() => setMenuAberto(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="space-y-2">
                {menuItems.filter(item => item.show).map((item) => (
                  <Button
                    key={item.href}
                    variant={pathname === item.href ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      router.push(item.href)
                      setMenuAberto(false)
                    }}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="max-w-2xl mx-auto p-4">
        {children}
      </main>

      {/* Navegação Inferior (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="max-w-2xl mx-auto flex justify-around py-2">
          {menuInferior.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-4 ${
                pathname === item.href ? 'text-primary' : 'text-slate-500'
              }`}
              onClick={item.onClick || (() => router.push(item.href))}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  )
}
