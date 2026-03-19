import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get('usuarioId')

    const where: { usuarioId?: string } = {}
    if (usuarioId) {
      where.usuarioId = usuarioId
    }

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const [total, totalHoje] = await Promise.all([
      db.leitura.count({ where }),
      db.leitura.count({
        where: {
          ...where,
          dataLeitura: { gte: hoje }
        }
      })
    ])

    return NextResponse.json({ total, hoje: totalHoje })
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    return NextResponse.json({ total: 0, hoje: 0 })
  }
}
