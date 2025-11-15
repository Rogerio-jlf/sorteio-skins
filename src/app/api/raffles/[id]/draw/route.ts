// ============================================
// src/app/api/raffles/[id]/draw/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

// POST /api/raffles/[id]/draw - Realiza sorteio (admin)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Adicionar verificação de permissão de admin aqui

    const entries = await prisma.raffleEntry.findMany({
      where: { raffleId: params.id },
      include: {
        user: true,
      },
    });

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma participação encontrada" },
        { status: 400 }
      );
    }

    // Seleciona vencedor aleatório
    const winnerEntry = entries[Math.floor(Math.random() * entries.length)];

    const updatedRaffle = await prisma.raffle.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        winnerId: winnerEntry.userId,
        winnerNumber: winnerEntry.ticketNumber,
        drawDate: new Date(),
      },
      include: {
        sponsor: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        raffle: updatedRaffle,
        winner: winnerEntry.user,
        winningNumber: winnerEntry.ticketNumber,
      },
    });
  } catch (error) {
    console.error("Erro ao realizar sorteio:", error);
    return NextResponse.json(
      { error: "Erro ao realizar sorteio" },
      { status: 500 }
    );
  }
}
