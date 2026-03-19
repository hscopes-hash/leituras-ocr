import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Listar locais
export async function GET() {
  try {
    const locais = await db.local.findMany({
      orderBy: { codigo: 'asc' },
    })

    return NextResponse.json({ locais })
  } catch (error) {
    console.error('Erro ao listar locais:', error)
    return NextResponse.json({ error: 'Erro ao listar locais' }, { status: 500 })
  }
}

// POST - Criar local
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { codigo, nome, adicional, percentual, ativo } = body

    if (!codigo || !nome) {
      return NextResponse.json({ error: 'Código e nome são obrigatórios' }, { status: 400 })
    }

    const existente = await db.local.findUnique({
      where: { codigo },
    })

    if (existente) {
      return NextResponse.json({ error: 'Código já existe' }, { status: 400 })
    }

    const local = await db.local.create({
      data: {
        codigo,
        nome: nome.substring(0, 30),
        adicional: adicional?.substring(0, 30) || null,
        percentual: percentual || 0,
        ativo: ativo ?? true,
      },
    })

    return NextResponse.json(local)
  } catch (error) {
    console.error('Erro ao criar local:', error)
    return NextResponse.json({ error: 'Erro ao criar local' }, { status: 500 })
  }
}

// PUT - Atualizar local
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, codigo, nome, adicional, percentual, ativo } = body

    if (!id && !codigo) {
      return NextResponse.json({ error: 'ID ou código é obrigatório' }, { status: 400 })
    }

    const where = id ? { id } : { codigo }
    
    const local = await db.local.update({
      where,
      data: {
        nome: nome?.substring(0, 30),
        adicional: adicional?.substring(0, 30) || null,
        percentual,
        ativo,
      },
    })

    return NextResponse.json(local)
  } catch (error) {
    console.error('Erro ao atualizar local:', error)
    return NextResponse.json({ error: 'Erro ao atualizar local' }, { status: 500 })
  }
}

// DELETE - Excluir local
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const codigo = searchParams.get('codigo')

    if (!id && !codigo) {
      return NextResponse.json({ error: 'ID ou código é obrigatório' }, { status: 400 })
    }

    if (codigo) {
      const local = await db.local.findUnique({ where: { codigo: parseInt(codigo) } })
      if (local) {
        const leituras = await db.leitura.count({ where: { localId: local.id } })
        if (leituras > 0) {
          return NextResponse.json({ error: 'Não é possível excluir. Existem leituras para este local.' }, { status: 400 })
        }
        await db.local.delete({ where: { codigo: parseInt(codigo) } })
      }
    } else if (id) {
      const leituras = await db.leitura.count({ where: { localId: id } })
      if (leituras > 0) {
        return NextResponse.json({ error: 'Não é possível excluir. Existem leituras para este local.' }, { status: 400 })
      }
      await db.local.delete({ where: { id } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir local:', error)
    return NextResponse.json({ error: 'Erro ao excluir local' }, { status: 500 })
  }
}
