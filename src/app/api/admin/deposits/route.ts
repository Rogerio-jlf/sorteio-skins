// src/app/api/admin/deposits/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/auth-middleware";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  // ✅ VERIFICAR SE É ADMIN
  const authResult = await requireAdmin(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  console.log(`Admin ${user.email} listando todos os depósitos`);

  try {
    const { searchParams } = new URL(request.url);

    // Extrair parâmetros de busca
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const userName = searchParams.get("userName");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const raffleId = searchParams.get("raffleId");
    const sponsorId = searchParams.get("sponsorId");

    // DEBUG - Ver um exemplo do banco ANTES
    const sampleDeposit = await prisma.deposit.findFirst({
      orderBy: { createdAt: "desc" },
    });
    console.log(
      "🔍 DEBUG - Exemplo de data no banco:",
      sampleDeposit?.createdAt?.toISOString()
    );

    // Construir objeto de filtro dinamicamente
    const where: Prisma.DepositWhereInput = {};

    // Filtro por status
    if (status) {
      where.status = status as "PENDING" | "APPROVED" | "REJECTED";
    }

    // Filtro por userId específico
    if (userId) {
      where.userId = userId;
    }

    // Filtro por nome ou email do usuário (busca parcial)
    if (userName) {
      where.user = {
        OR: [
          { name: { contains: userName, mode: "insensitive" } },
          { email: { contains: userName, mode: "insensitive" } },
        ],
      };
    }

    // Filtro por data (ajustado para timezone do Brasil UTC-3)
    if (startDate || endDate) {
      where.createdAt = {};

      if (startDate) {
        // Início do dia no Brasil (00:00:00 BRT = 03:00:00 UTC)
        const startDateBR = new Date(startDate + "T00:00:00");
        // Adicionar 3 horas para converter BRT para UTC
        const startDateUTC = new Date(
          startDateBR.getTime() + 3 * 60 * 60 * 1000
        );
        where.createdAt.gte = startDateUTC;

        // DEBUG
        console.log("🔍 DEBUG - Data Inicial:", {
          input: startDate,
          startDateBR: startDateBR.toISOString(),
          startDateUTC: startDateUTC.toISOString(),
        });
      }

      if (endDate) {
        // Fim do dia no Brasil (23:59:59 BRT = 02:59:59 UTC do dia seguinte)
        const endDateBR = new Date(endDate + "T23:59:59");
        // Adicionar 3 horas para converter BRT para UTC
        const endDateUTC = new Date(endDateBR.getTime() + 3 * 60 * 60 * 1000);
        where.createdAt.lte = endDateUTC;

        // DEBUG
        console.log("🔍 DEBUG - Data Final:", {
          input: endDate,
          endDateBR: endDateBR.toISOString(),
          endDateUTC: endDateUTC.toISOString(),
        });
      }
    }

    // Filtro por sorteio
    if (raffleId) {
      where.raffleId = raffleId;
    }

    // Filtro por patrocinador
    if (sponsorId) {
      where.sponsorId = sponsorId;
    }

    // DEBUG - Ver o filtro completo
    console.log("🔍 DEBUG - Filtro WHERE:", JSON.stringify(where, null, 2));

    const deposits = await prisma.deposit.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sponsor: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            couponCode: true,
          },
        },
        raffle: {
          select: {
            id: true,
            title: true,
            skinName: true,
            skinImage: true,
            status: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // PENDING primeiro
        { createdAt: "desc" }, // Mais recentes primeiro
      ],
    });

    // DEBUG - Resultado
    console.log("🔍 DEBUG - Total encontrado:", deposits.length);
    if (deposits.length > 0) {
      console.log(
        "🔍 DEBUG - Primeira data encontrada:",
        deposits[0].createdAt.toISOString()
      );
    }

    return NextResponse.json({
      success: true,
      data: deposits,
      filters: {
        status,
        userId,
        userName,
        startDate,
        endDate,
        raffleId,
        sponsorId,
        total: deposits.length,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar depósitos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar depósitos" },
      { status: 500 }
    );
  }
}
