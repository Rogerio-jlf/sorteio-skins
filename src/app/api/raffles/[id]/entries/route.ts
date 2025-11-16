// src/app/api/raffles/[id]/entries/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

// GET /api/raffles/:id/entries - Lista entries de um sorteio
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Next.js 15
) {
  // ✅ DESEMPACOTAR PARAMS
  const { id } = await params;

  try {
    // Obter userId da query string (opcional)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Buscar sorteio
    const raffle = await prisma.raffle.findUnique({
      where: { id },
    });

    if (!raffle) {
      return NextResponse.json(
        { error: "Sorteio não encontrado" },
        { status: 404 }
      );
    }

    // Filtros para busca
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { raffleId: id };
    if (userId) {
      where.userId = userId;
    }

    // Buscar entries
    const entries = await prisma.raffleEntry.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        deposit: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { ticketNumber: "asc" }, // ✅ Usando ticketNumber
    });

    // Contar total
    const totalEntries = await prisma.raffleEntry.count({
      where,
    });

    return NextResponse.json({
      success: true,
      data: {
        raffleId: id,
        raffleTitle: raffle.title,
        entries,
        totalEntries,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar entries:", error);
    return NextResponse.json(
      { error: "Erro ao buscar entries" },
      { status: 500 }
    );
  }
}
