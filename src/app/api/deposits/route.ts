// ============================================
// src/app/api/deposits/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import {
  calculateQuotas,
  generateUniqueTicketNumbers,
} from "../../../lib/utils/ticket-generator";
import { QUOTA_VALUE } from "../../../lib/constants";

// GET /api/deposits - Lista depósitos do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      );
    }

    const deposits = await prisma.deposit.findMany({
      where: { userId },
      include: {
        sponsor: true,
        raffle: true,
        entries: {
          select: {
            ticketNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: deposits });
  } catch (error) {
    console.error("Erro ao buscar depósitos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar depósitos" },
      { status: 500 }
    );
  }
}

// POST /api/deposits - Cria novo depósito
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sponsorId, raffleId, amount, proofImage } = body;

    // Validações
    if (!userId || !sponsorId || !raffleId || !amount || !proofImage) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    const quotas = calculateQuotas(amount);

    if (quotas === 0) {
      return NextResponse.json(
        { error: `O valor mínimo para participar é R$ ${QUOTA_VALUE}` },
        { status: 400 }
      );
    }

    // Verifica se o sorteio existe e está ativo
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
    });

    if (!raffle || raffle.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Sorteio não encontrado ou não está ativo" },
        { status: 404 }
      );
    }

    // Busca números existentes
    const existingEntries = await prisma.raffleEntry.findMany({
      where: { raffleId },
      select: { ticketNumber: true },
    });

    const existingNumbers = new Set(
      existingEntries.map((entry) => entry.ticketNumber)
    );

    // Gera números únicos
    const ticketNumbers = generateUniqueTicketNumbers(quotas, existingNumbers);

    if (ticketNumbers.length < quotas) {
      return NextResponse.json(
        { error: "Não foi possível gerar números únicos suficientes" },
        { status: 500 }
      );
    }

    // Cria depósito e entries em transação
    const result = await prisma.$transaction(async (tx) => {
      const deposit = await tx.deposit.create({
        data: {
          userId,
          sponsorId,
          raffleId,
          amount,
          quotas,
          proofImage,
          status: "PENDING",
        },
      });

      const entries = await tx.raffleEntry.createMany({
        data: ticketNumbers.map((ticketNumber) => ({
          userId,
          raffleId,
          depositId: deposit.id,
          ticketNumber,
        })),
      });

      return { deposit, entriesCount: entries.count };
    });

    return NextResponse.json({
      success: true,
      data: {
        depositId: result.deposit.id,
        quotas,
        ticketNumbers,
      },
    });
  } catch (error) {
    console.error("Erro ao criar depósito:", error);
    return NextResponse.json(
      { error: "Erro ao processar depósito" },
      { status: 500 }
    );
  }
}
