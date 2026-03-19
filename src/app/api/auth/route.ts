import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, senha, lembrar } = body;

    if (!nome || !senha) {
      return NextResponse.json(
        { error: "Nome e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const usuario = await db.usuario.findUnique({
      where: { nome },
    });

    if (!usuario || !usuario.ativo) {
      return NextResponse.json(
        { error: "Usuário não encontrado ou inativo" },
        { status: 401 }
      );
    }

    if (usuario.senha !== senha) {
      return NextResponse.json(
        { error: "Senha incorreta" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const sessionData = JSON.stringify({
      id: usuario.id,
      nome: usuario.nome,
      nivel: usuario.nivel,
    });

    cookieStore.set("session", sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: lembrar ? 60 * 60 * 24 * 30 : 60 * 60 * 8,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        nomeCompleto: usuario.nomeCompleto,
        nivel: usuario.nivel,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// GET - Verificar sessão
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    const userData = JSON.parse(session.value);

    const usuario = await db.usuario.findUnique({
      where: { id: userData.id },
    });

    if (!usuario || !usuario.ativo) {
      cookieStore.delete("session");
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        nomeCompleto: usuario.nomeCompleto,
        nivel: usuario.nivel,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}

// DELETE - Logout
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return NextResponse.json({ success: true });
}
