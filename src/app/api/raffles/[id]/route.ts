// src/app/api/raffles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// GET /api/raffles/[id] - Busca sorteio por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 Promise
) {
  // ✅ DESEMPACOTAR PARAMS
  const { id } = await params;

  try {
    const raffle = await prisma.raffle.findUnique({
      where: { id }, // 👈 Agora funciona
      include: {
        sponsor: true,
        _count: {
          select: { entries: true },
        },
      },
    });

    if (!raffle) {
      return NextResponse.json(
        { error: "Sorteio não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: raffle });
  } catch (error) {
    console.error("Erro ao buscar sorteio:", error);
    return NextResponse.json(
      { error: "Erro ao buscar sorteio" },
      { status: 500 }
    );
  }
}
