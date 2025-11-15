// ============================================
// src/app/api/deposits/[id]/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

// PATCH /api/deposits/[id]/reject - Rejeita depósito (admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Adicionar verificação de permissão de admin aqui

    await prisma.$transaction(async (tx) => {
      // Remove as entries relacionadas
      await tx.raffleEntry.deleteMany({
        where: { depositId: params.id },
      });

      // Rejeita o depósito
      await tx.deposit.update({
        where: { id: params.id },
        data: { status: "REJECTED" },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao rejeitar depósito:", error);
    return NextResponse.json(
      { error: "Erro ao rejeitar depósito" },
      { status: 500 }
    );
  }
}
