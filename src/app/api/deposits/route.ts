// src/app/api/deposits/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

// GET /api/deposits?userId=xxx - Lista depósitos de um usuário
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
        sponsor: {
          select: {
            name: true,
            logoUrl: true,
          },
        },
        raffle: {
          select: {
            title: true,
            skinName: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
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

    // Validações básicas
    if (!userId || !sponsorId || !raffleId || !amount || !proofImage) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Valor deve ser maior que zero" },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o patrocinador existe
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: sponsorId },
    });

    if (!sponsor) {
      return NextResponse.json(
        { error: "Patrocinador não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o sorteio existe e está ativo
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
    });

    if (!raffle) {
      return NextResponse.json(
        { error: "Sorteio não encontrado" },
        { status: 404 }
      );
    }

    if (raffle.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Sorteio não está ativo" },
        { status: 400 }
      );
    }

    // Calcular número de quotas (exemplo: R$10 = 1 quota)
    const quotas = Math.floor(amount / 10);

    if (quotas === 0) {
      return NextResponse.json(
        { error: "Valor mínimo é R$10 para 1 quota" },
        { status: 400 }
      );
    }

    const deposit = await prisma.deposit.create({
      data: {
        userId,
        sponsorId,
        raffleId,
        amount,
        quotas,
        proofImage,
        status: "PENDING",
      },
      include: {
        sponsor: true,
        raffle: true,
      },
    });

    return NextResponse.json({ success: true, data: deposit }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar depósito:", error);
    return NextResponse.json(
      { error: "Erro ao criar depósito" },
      { status: 500 }
    );
  }
}
