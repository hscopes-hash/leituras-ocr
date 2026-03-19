import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { db } from './db'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export interface SessionUser {
  id: string
  nome: string
  nivel: string
  nomeCompleto?: string | null
}

export async function createSession(user: SessionUser, lembrar: boolean = false) {
  const cookieStore = await cookies()
  const sessionData = JSON.stringify({
    id: user.id,
    nome: user.nome,
    nivel: user.nivel,
    nomeCompleto: user.nomeCompleto,
  })

  cookieStore.set('session', sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: lembrar ? 60 * 60 * 24 * 30 : 60 * 60 * 8, // 30 dias ou 8 horas
    path: '/',
  })
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')

    if (!session) return null

    const userData = JSON.parse(session.value) as SessionUser

    // Verify user still exists and is active
    const usuario = await db.usuario.findUnique({
      where: { id: userData.id },
      select: { id: true, nome: true, nivel: true, nomeCompleto: true, ativo: true },
    })

    if (!usuario || !usuario.ativo) {
      cookieStore.delete('session')
      return null
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      nivel: usuario.nivel,
      nomeCompleto: usuario.nomeCompleto,
    }
  } catch {
    return null
  }
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export function isAdmin(nivel: string): boolean {
  return nivel === 'ADMINISTRADOR'
}
