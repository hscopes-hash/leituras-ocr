import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Listar tipos de máquina
export async function GET() {
  try {
    const tipos = await db.tipoMaquina.findMany({
      orderBy: { codigo: 'asc' }
    })

    return NextResponse.json(tipos)
  } catch (error) {
    console.error('Erro ao listar tipos de máquina:', error)
    return NextResponse.json({ error: 'Erro ao listar tipos de máquina' }, { status: 500 })
  }
}

// POST - Criar tipo de máquina
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { codigo, descricao, campoEntrada, campoSaida } = body

    if (!codigo || !descricao) {
      return NextResponse.json({ error: 'Código e descrição são obrigatórios' }, { status: 400 })
    }

    if (codigo < 1 || codigo > 99) {
      return NextResponse.json({ error: 'Código deve ser entre 01 e 99' }, { status: 400 })
    }

    const existente = await db.tipoMaquina.findUnique({
      where: { codigo }
    })

    if (existente) {
      return NextResponse.json({ error: 'Código já existe' }, { status: 400 })
    }

    const tipo = await db.tipoMaquina.create({
      data: {
        codigo,
        descricao: descricao.substring(0, 15),
        campoEntrada: (campoEntrada || 'ENTRADA').substring(0, 10),
        campoSaida: (campoSaida || 'SAIDA').substring(0, 10),
      }
    })

    return NextResponse.json(tipo)
  } catch (error) {
    console.error('Erro ao criar tipo de máquina:', error)
    return NextResponse.json({ error: 'Erro ao criar tipo de máquina' }, { status: 500 })
  }
}

// PUT - Atualizar tipo de máquina
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, codigo, descricao, campoEntrada, campoSaida } = body

    if (!id && !codigo) {
      return NextResponse.json({ error: 'ID ou código é obrigatório' }, { status: 400 })
    }

    // Buscar pelo id ou codigo
    const where = id ? { id } : { codigo }
    
    const tipo = await db.tipoMaquina.update({
      where,
      data: {
        descricao: descricao?.substring(0, 15),
        campoEntrada: campoEntrada?.substring(0, 10),
        campoSaida: campoSaida?.substring(0, 10),
      }
    })

    return NextResponse.json(tipo)
  } catch (error) {
    console.error('Erro ao atualizar tipo de máquina:', error)
    return NextResponse.json({ error: 'Erro ao atualizar tipo de máquina' }, { status: 500 })
  }
}

// DELETE - Excluir tipo de máquina
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const codigo = searchParams.get('codigo')

    if (!id && !codigo) {
      return NextResponse.json({ error: 'ID ou código é obrigatório' }, { status: 400 })
    }

    // Verificar se há máquinas usando este tipo
    const codigoNum = codigo ? parseInt(codigo) : null
    
    if (codigoNum) {
      const maquinas = await db.maquina.count({
        where: { tipo: { codigo: codigoNum } }
      })

      if (maquinas > 0) {
        return NextResponse.json({ error: 'Não é possível excluir. Existem máquinas usando este tipo.' }, { status: 400 })
      }

      await db.tipoMaquina.delete({ where: { codigo: codigoNum } })
    } else if (id) {
      await db.tipoMaquina.delete({ where: { id } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir tipo de máquina:', error)
    return NextResponse.json({ error: 'Erro ao excluir tipo de máquina' }, { status: 500 })
  }
}
