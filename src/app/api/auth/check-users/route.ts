import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const count = await db.usuario.count()
    return NextResponse.json({ temUsuarios: count > 0 })
  } catch (error) {
    console.error('Erro ao verificar usuários:', error)
    return NextResponse.json({ temUsuarios: false })
  }
}
