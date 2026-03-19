'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Camera,
  ClipboardList,
  Settings,
  User,
  LogOut,
  Wrench,
  MonitorSmartphone,
  MapPin,
  Users,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'

type View =
  | 'dashboard'
  | 'nova-leitura'
  | 'minhas-leituras'
  | 'cadastros'
  | 'tipos-maquina'
  | 'maquinas'
  | 'locais'
  | 'usuarios'
  | 'perfil'

interface DashboardProps {
  onViewChange: (view: View) => void
  onLogout: () => void
}

export function Dashboard({ onViewChange, onLogout }: DashboardProps) {
  const { user } = useAuthStore()
  const isAdmin = user?.nivel === 'ADMINISTRADOR'

  const menuItems = [
    {
      icon: Camera,
      label: 'Nova Leitura',
      description: 'Capturar e processar OCR',
      view: 'nova-leitura' as View,
      color: 'bg-blue-500',
    },
    {
      icon: ClipboardList,
      label: 'Minhas Leituras',
      description: 'Histórico de leituras',
      view: 'minhas-leituras' as View,
      color: 'bg-green-500',
    },
    ...(isAdmin
      ? [
          {
            icon: Settings,
            label: 'Cadastros',
            description: 'Gerenciar dados do sistema',
            view: 'cadastros' as View,
            color: 'bg-amber-500',
          },
        ]
      : []),
    {
      icon: User,
      label: 'Meu Perfil',
      description: 'Dados do usuário',
      view: 'perfil' as View,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold">Gestão de Leituras</h1>
        <p className="text-primary-foreground/80 mt-1">
          Bem-vindo, {user?.nomeCompleto || user?.nome}!
        </p>
        <p className="text-sm text-primary-foreground/60 mt-1">
          {user?.nivel === 'ADMINISTRADOR' ? 'Administrador' : 'Operador'}
        </p>
      </div>

      {/* Menu Grid */}
      <div className="p-4 space-y-3">
        {menuItems.map((item) => (
          <Card
            key={item.view}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onViewChange(item.view)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`${item.color} p-3 rounded-xl text-white`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-4 mt-4">
        <Button
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex justify-around py-2">
          <Button
            variant="ghost"
            className="flex flex-col items-center h-auto py-2 px-3"
            onClick={() => onViewChange('nova-leitura')}
          >
            <Camera className="w-5 h-5" />
            <span className="text-xs mt-1">Leitura</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center h-auto py-2 px-3"
            onClick={() => onViewChange('minhas-leituras')}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-xs mt-1">Histórico</span>
          </Button>
          {isAdmin && (
            <Button
              variant="ghost"
              className="flex flex-col items-center h-auto py-2 px-3"
              onClick={() => onViewChange('cadastros')}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs mt-1">Cadastros</span>
            </Button>
          )}
          <Button
            variant="ghost"
            className="flex flex-col items-center h-auto py-2 px-3"
            onClick={() => onViewChange('perfil')}
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Perfil</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

// Cadastros Menu Component
export function CadastrosMenu({ onViewChange }: { onViewChange: (view: View) => void }) {
  const menuItems = [
    {
      icon: Wrench,
      label: 'Tipos de Máquina',
      view: 'tipos-maquina' as View,
      color: 'bg-orange-500',
    },
    {
      icon: MonitorSmartphone,
      label: 'Máquinas',
      view: 'maquinas' as View,
      color: 'bg-blue-500',
    },
    {
      icon: MapPin,
      label: 'Locais',
      view: 'locais' as View,
      color: 'bg-green-500',
    },
    {
      icon: Users,
      label: 'Usuários',
      view: 'usuarios' as View,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-20">
      <div className="bg-amber-500 text-white p-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold">Cadastros</h1>
        <p className="text-white/80 mt-1">Gerencie os dados do sistema</p>
      </div>

      <div className="p-4 space-y-3">
        {menuItems.map((item) => (
          <Card
            key={item.view}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onViewChange(item.view)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`${item.color} p-3 rounded-xl text-white`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.label}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex justify-around py-2">
          <Button
            variant="ghost"
            className="flex flex-col items-center h-auto py-2 px-3"
            onClick={() => onViewChange('dashboard')}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs mt-1">Voltar</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export type { View }
