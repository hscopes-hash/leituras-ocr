import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Listar máquinas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipoId = searchParams.get('tipoId')

    const where: { tipoId?: string } = {}
    if (tipoId) {
      // Buscar o tipo pelo codigo para pegar o id
      const tipo = await db.tipoMaquina.findUnique({ where: { codigo: parseInt(tipoId) } })
      if (tipo) {
        where.tipoId = tipo.id
      }
    }

    const maquinas = await db.maquina.findMany({
      where,
      include: {
        tipo: true,
      },
      orderBy: { codigo: 'asc' },
    })

    return NextResponse.json({ maquinas })
  } catch (error) {
    console.error('Erro ao listar máquinas:', error)
    return NextResponse.json({ error: 'Erro ao listar máquinas' }, { status: 500 })
  }
}

// POST - Criar máquina
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { codigo, nome, tipoId, entrada, saida, moeda, ativo } = body

    if (!codigo || !nome || !tipoId) {
      return NextResponse.json({ error: 'Código, nome e tipo são obrigatórios' }, { status: 400 })
    }

    if (codigo < 1 || codigo > 99999) {
      return NextResponse.json({ error: 'Código deve ser entre 00001 e 99999' }, { status: 400 })
    }

    const existente = await db.maquina.findUnique({
      where: { codigo },
    })

    if (existente) {
      return NextResponse.json({ error: 'Código já existe' }, { status: 400 })
    }

    // Buscar o tipo pelo codigo
    const tipo = await db.tipoMaquina.findUnique({
      where: { codigo: tipoId },
    })

    if (!tipo) {
      return NextResponse.json({ error: 'Tipo de máquina não encontrado' }, { status: 400 })
    }

    const maquina = await db.maquina.create({
      data: {
        codigo,
        nome: nome.substring(0, 15),
        tipoId: tipo.id,
        entrada: entrada || 0,
        saida: saida || 0,
        moeda: moeda?.substring(0, 5) || 'R$',
        ativo: ativo ?? true,
      },
      include: { tipo: true },
    })

    return NextResponse.json(maquina)
  } catch (error) {
    console.error('Erro ao criar máquina:', error)
    return NextResponse.json({ error: 'Erro ao criar máquina' }, { status: 500 })
  }
}

// PUT - Atualizar máquina
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, codigo, nome, tipoId, entrada, saida, moeda, ativo } = body

    if (!id && !codigo) {
      return NextResponse.json({ error: 'ID ou código é obrigatório' }, { status: 400 })
    }

    // Buscar pelo id ou codigo
    const where = id ? { id } : { codigo }
    
    // Buscar o tipo se fornecido
    let tipoData = null
    if (tipoId) {
      tipoData = await db.tipoMaquina.findUnique({ where: { codigo: tipoId } })
    }

    const maquina = await db.maquina.update({
      where,
      data: {
        nome: nome?.substring(0, 15),
        tipoId: tipoData?.id,
        entrada,
        saida,
        moeda: moeda?.substring(0, 5),
        ativo,
      },
      include: { tipo: true },
    })

    return NextResponse.json(maquina)
  } catch (error) {
    console.error('Erro ao atualizar máquina:', error)
    return NextResponse.json({ error: 'Erro ao atualizar máquina' }, { status: 500 })
  }
}

// DELETE - Excluir máquina
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const codigo = searchParams.get('codigo')

    if (!id && !codigo) {
      return NextResponse.json({ error: 'ID ou código é obrigatório' }, { status: 400 })
    }

    // Verificar se há leituras
    const where: { maquinaId?: string; codigo?: number } = {}
    if (codigo) {
      const maquina = await db.maquina.findUnique({ where: { codigo: parseInt(codigo) } })
      if (maquina) {
        const leituras = await db.leitura.count({ where: { maquinaId: maquina.id } })
        if (leituras > 0) {
          return NextResponse.json({ error: 'Não é possível excluir. Existem leituras para esta máquina.' }, { status: 400 })
        }
        await db.maquina.delete({ where: { codigo: parseInt(codigo) } })
      }
    } else if (id) {
      const leituras = await db.leitura.count({ where: { maquinaId: id } })
      if (leituras > 0) {
        return NextResponse.json({ error: 'Não é possível excluir. Existem leituras para esta máquina.' }, { status: 400 })
      }
      await db.maquina.delete({ where: { id } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir máquina:', error)
    return NextResponse.json({ error: 'Erro ao excluir máquina' }, { status: 500 })
  }
}
