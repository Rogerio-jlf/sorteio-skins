// ============================================
// src/app/api/raffles/[id]/entries/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

// GET /api/raffles/[id]/entries - Lista participações do usuário em um sorteio
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      );
    }

    const entries = await prisma.raffleEntry.findMany({
      where: {
        userId,
        raffleId: params.id,
      },
      include: {
        deposit: {
          include: {
            sponsor: true,
          },
        },
      },
      orderBy: {
        ticketNumber: "asc",
      },
    });

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error("Erro ao buscar participações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar participações" },
      { status: 500 }
    );
  }
}
