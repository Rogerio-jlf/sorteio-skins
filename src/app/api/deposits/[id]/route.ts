// src/app/api/deposits/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// GET /api/deposits/[id] - Busca depósito por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 Promise
) {
  // ✅ DESEMPACOTAR PARAMS
  const { id } = await params;

  try {
    const deposit = await prisma.deposit.findUnique({
      where: { id }, // 👈 Agora funciona
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sponsor: true,
        raffle: true,
        entries: true,
      },
    });

    if (!deposit) {
      return NextResponse.json(
        { error: "Depósito não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: deposit });
  } catch (error) {
    console.error("Erro ao buscar depósito:", error);
    return NextResponse.json(
      { error: "Erro ao buscar depósito" },
      { status: 500 }
    );
  }
}
