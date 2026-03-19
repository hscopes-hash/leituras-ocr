import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hash } from 'bcryptjs'

// GET - Listar usuários
export async function GET() {
  try {
    const usuarios = await db.usuario.findMany({
      select: {
        id: true,
        nome: true,
        nivel: true,
        nomeCompleto: true,
        ativo: true,
        createdAt: true,
      },
      orderBy: { nome: 'asc' }
    })

    return NextResponse.json({ usuarios })
  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    return NextResponse.json({ error: 'Erro ao listar usuários' }, { status: 500 })
  }
}

// POST - Criar usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, senha, nivel, nomeCompleto, ativo = true } = body

    if (!nome || !senha || !nivel) {
      return NextResponse.json({ error: 'Nome, senha e nível são obrigatórios' }, { status: 400 })
    }

    // Verificar se nome já existe
    const existente = await db.usuario.findFirst({ where: { nome } })
    if (existente) {
      return NextResponse.json({ error: 'Nome de usuário já existe' }, { status: 400 })
    }

    // Hash da senha
    const senhaHash = await hash(senha, 10)

    const usuario = await db.usuario.create({
      data: {
        nome,
        senha: senhaHash,
        nivel,
        nomeCompleto: nomeCompleto || nome,
        ativo,
      },
      select: {
        id: true,
        nome: true,
        nivel: true,
        nomeCompleto: true,
        ativo: true,
      }
    })

    return NextResponse.json({ usuario })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
  }
}

// PUT - Atualizar usuário
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, nome, senha, nivel, nomeCompleto, ativo } = body

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const data: { nome?: string; senha?: string; nivel?: string; nomeCompleto?: string; ativo?: boolean } = {}
    
    if (nome) {
      const existente = await db.usuario.findFirst({ 
        where: { nome, NOT: { id } } 
      })
      if (existente) {
        return NextResponse.json({ error: 'Nome de usuário já existe' }, { status: 400 })
      }
      data.nome = nome
    }
    
    if (senha) {
      data.senha = await hash(senha, 10)
    }
    
    if (nivel) data.nivel = nivel
    if (nomeCompleto !== undefined) data.nomeCompleto = nomeCompleto
    if (ativo !== undefined) data.ativo = ativo

    const usuario = await db.usuario.update({
      where: { id },
      data,
      select: {
        id: true,
        nome: true,
        nivel: true,
        nomeCompleto: true,
        ativo: true,
      }
    })

    return NextResponse.json({ usuario })
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
  }
}

// DELETE - Excluir usuário
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    await db.usuario.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 })
  }
}
