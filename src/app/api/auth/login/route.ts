import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { compare } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, senha } = body

    console.log('Tentativa de login:', { nome })

    if (!nome || !senha) {
      return NextResponse.json({ success: false, error: 'Nome e senha são obrigatórios' }, { status: 400 })
    }

    // Buscar usuário (case-insensitive com regex)
    const usuario = await db.usuario.findFirst({ 
      where: { 
        nome: { equals: nome } 
      } 
    })

    console.log('Usuário encontrado:', usuario ? usuario.nome : 'NÃO ENCONTRADO')

    if (!usuario) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 401 })
    }

    if (!usuario.ativo) {
      return NextResponse.json({ success: false, error: 'Usuário inativo' }, { status: 401 })
    }

    // Verificar senha
    const senhaValida = await compare(senha, usuario.senha)
    console.log('Senha válida:', senhaValida)

    if (!senhaValida) {
      return NextResponse.json({ success: false, error: 'Senha incorreta' }, { status: 401 })
    }

    // Retornar dados do usuário (sem a senha)
    return NextResponse.json({
      success: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        nivel: usuario.nivel,
        nomeCompleto: usuario.nomeCompleto,
      }
    })
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json({ success: false, error: 'Erro no login: ' + String(error) }, { status: 500 })
  }
}
