// src/app/api/deposits/[id]/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { requireAdmin } from "../../../../../lib/auth-middleware";

// PATCH /api/deposits/[id]/reject - Rejeita depósito (admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 Promise
) {
  // ✅ DESEMPACOTAR PARAMS
  const { id } = await params;

  // ✅ VERIFICAR SE É ADMIN
  const authResult = await requireAdmin(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  console.log(`Admin ${user.email} rejeitando depósito ${id}`);

  try {
    const deposit = await prisma.deposit.findUnique({
      where: { id },
    });

    if (!deposit) {
      return NextResponse.json(
        { error: "Depósito não encontrado" },
        { status: 404 }
      );
    }

    if (deposit.status !== "PENDING") {
      return NextResponse.json(
        { error: "Apenas depósitos pendentes podem ser rejeitados" },
        { status: 400 }
      );
    }

    const updatedDeposit = await prisma.deposit.update({
      where: { id },
      data: { status: "REJECTED" },
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
      },
    });

    return NextResponse.json({ success: true, data: updatedDeposit });
  } catch (error) {
    console.error("Erro ao rejeitar depósito:", error);
    return NextResponse.json(
      { error: "Erro ao rejeitar depósito" },
      { status: 500 }
    );
  }
}
