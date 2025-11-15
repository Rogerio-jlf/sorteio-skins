// ============================================
// src/app/api/deposits/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

// PATCH /api/deposits/[id]/approve - Aprova depósito (admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Adicionar verificação de permissão de admin aqui

    const deposit = await prisma.deposit.update({
      where: { id: params.id },
      data: { status: "APPROVED" },
    });

    return NextResponse.json({ success: true, data: deposit });
  } catch (error) {
    console.error("Erro ao aprovar depósito:", error);
    return NextResponse.json(
      { error: "Erro ao aprovar depósito" },
      { status: 500 }
    );
  }
}
