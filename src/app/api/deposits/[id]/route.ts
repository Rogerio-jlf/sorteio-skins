// ============================================
// src/app/api/deposits/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// GET /api/deposits/[id] - Busca depósito específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deposit = await prisma.deposit.findUnique({
      where: { id: params.id },
      include: {
        sponsor: true,
        raffle: true,
        user: true,
        entries: {
          select: {
            ticketNumber: true,
          },
        },
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
