import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

// BUSCAR TODOS OS USUÁRIOS
export async function GET(request: NextRequest) {
  if (!request.url) {
    return NextResponse.json(
      { error: "URL da requisição não encontrada" },
      { status: 400 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}
