import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Listar leituras
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get('usuarioId')
    const limite = parseInt(searchParams.get('limite') || '50')

    const where: { usuarioId?: string } = {}
    if (usuarioId) {
      where.usuarioId = usuarioId
    }

    const leituras = await db.leitura.findMany({
      where,
      include: {
        maquina: {
          include: { tipo: true }
        },
        local: true,
        usuario: {
          select: { id: true, nome: true, nomeCompleto: true }
        }
      },
      orderBy: { dataLeitura: 'desc' },
      take: limite,
    })

    // Converter os dados para incluir codigo em vez de id
    const leiturasFormatadas = leituras.map(l => ({
      ...l,
      maquinaId: l.maquina?.codigo,
      localId: l.local?.codigo,
    }))

    return NextResponse.json({ leituras: leiturasFormatadas })
  } catch (error) {
    console.error('Erro ao listar leituras:', error)
    return NextResponse.json({ error: 'Erro ao listar leituras' }, { status: 500 })
  }
}

// POST - Criar leitura
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { usuarioId, maquinaCodigo, localCodigo, entrada, saida, imagem, tempoProcessamento, observacao } = body

    if (!usuarioId) {
      return NextResponse.json({ error: 'Usuário é obrigatório' }, { status: 400 })
    }

    if (!maquinaCodigo) {
      return NextResponse.json({ error: 'Máquina é obrigatória' }, { status: 400 })
    }

    // Buscar a máquina pelo codigo
    const maquina = await db.maquina.findUnique({
      where: { codigo: parseInt(maquinaCodigo) }
    })

    if (!maquina) {
      return NextResponse.json({ error: 'Máquina não encontrada' }, { status: 400 })
    }

    // Buscar o local pelo codigo se fornecido
    let localDb = null
    if (localCodigo) {
      localDb = await db.local.findUnique({
        where: { codigo: parseInt(localCodigo) }
      })
    }

    const leitura = await db.leitura.create({
      data: {
        usuarioId,
        maquinaId: maquina.id,
        localId: localDb?.id || null,
        entrada: entrada || 0,
        saida: saida || 0,
        imagem: imagem || null,
        tempoProcessamento: tempoProcessamento || null,
        observacao: observacao || null,
      },
      include: {
        maquina: { include: { tipo: true } },
        local: true,
        usuario: { select: { id: true, nome: true, nomeCompleto: true } }
      }
    })

    // Atualizar acumuladores da máquina
    await db.maquina.update({
      where: { id: maquina.id },
      data: {
        entrada: { increment: entrada || 0 },
        saida: { increment: saida || 0 },
      }
    })

    return NextResponse.json({ leitura })
  } catch (error) {
    console.error('Erro ao criar leitura:', error)
    return NextResponse.json({ error: 'Erro ao criar leitura: ' + String(error) }, { status: 500 })
  }
}

// DELETE - Excluir leitura
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    await db.leitura.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir leitura:', error)
    return NextResponse.json({ error: 'Erro ao excluir leitura' }, { status: 500 })
  }
}
