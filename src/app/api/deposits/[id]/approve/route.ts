// src/app/api/deposits/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { requireAdmin } from "../../../../../lib/auth-middleware";

// PATCH /api/deposits/:id/approve - Aprova depósito (admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Params é Promise no Next.js 15
) {
  // ✅ DESEMPACOTAR PARAMS
  const { id } = await params;

  // ✅ VERIFICAR SE É ADMIN
  const authResult = await requireAdmin(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  console.log(`Admin ${user.email} aprovando depósito ${id}`);

  try {
    // Buscar depósito
    const deposit = await prisma.deposit.findUnique({
      where: { id },
      include: {
        raffle: true,
      },
    });

    if (!deposit) {
      return NextResponse.json(
        { error: "Depósito não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já foi aprovado
    if (deposit.status === "APPROVED") {
      return NextResponse.json(
        { error: "Depósito já foi aprovado" },
        { status: 400 }
      );
    }

    // Verificar se o sorteio já foi realizado
    if (deposit.raffle.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Sorteio já foi realizado" },
        { status: 400 }
      );
    }

    // 1. Obter o último número de entry deste sorteio
    const lastEntry = await prisma.raffleEntry.findFirst({
      where: { raffleId: deposit.raffleId },
      orderBy: { ticketNumber: "desc" }, // ✅ Corrigido para ticketNumber
    });

    const startNumber = lastEntry ? lastEntry.ticketNumber + 1 : 1;

    // 2. Criar entries sequenciais
    const entriesToCreate = [];
    for (let i = 0; i < deposit.quotas; i++) {
      entriesToCreate.push({
        raffleId: deposit.raffleId,
        userId: deposit.userId,
        depositId: deposit.id,
        ticketNumber: startNumber + i, // ✅ Corrigido para ticketNumber
      });
    }

    // 3. Atualizar depósito e criar entries em transação
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [updatedDeposit, createdEntries] = await prisma.$transaction([
      prisma.deposit.update({
        where: { id },
        data: { status: "APPROVED" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          raffle: true,
          sponsor: true,
        },
      }),
      prisma.raffleEntry.createMany({
        data: entriesToCreate,
      }),
    ]);

    // 4. Buscar as entries criadas para retornar
    const entries = await prisma.raffleEntry.findMany({
      where: {
        depositId: deposit.id,
      },
      orderBy: { ticketNumber: "asc" },
    });

    console.log(
      `✅ Depósito ${id} aprovado. ${
        entries.length
      } entries criadas (números ${startNumber} a ${
        startNumber + deposit.quotas - 1
      })`
    );

    return NextResponse.json({
      success: true,
      data: {
        ...updatedDeposit,
        entries,
      },
    });
  } catch (error) {
    console.error("Erro ao aprovar depósito:", error);
    return NextResponse.json(
      { error: "Erro ao aprovar depósito" },
      { status: 500 }
    );
  }
}
