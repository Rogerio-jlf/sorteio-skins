// src/app/api/raffles/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { RaffleStatus, Prisma } from "@prisma/client";

// GET /api/raffles - Lista sorteios ativos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");

    // Type guard para validar o status
    const isValidStatus = (status: string): status is RaffleStatus => {
      return ["ACTIVE", "DRAWING", "COMPLETED", "CANCELLED"].includes(status);
    };

    // Define o where com tipagem correta
    const where: Prisma.RaffleWhereInput =
      statusParam && isValidStatus(statusParam)
        ? { status: statusParam }
        : {
            status: RaffleStatus.ACTIVE,
            endDate: {
              gte: new Date(),
            },
          };

    const raffles = await prisma.raffle.findMany({
      where,
      include: {
        sponsor: true,
        _count: {
          select: {
            entries: true,
          },
        },
      },
      orderBy: {
        endDate: "asc",
      },
    });

    return NextResponse.json({ success: true, data: raffles });
  } catch (error) {
    console.error("Erro ao buscar sorteios:", error);
    return NextResponse.json(
      { error: "Erro ao buscar sorteios" },
      { status: 500 }
    );
  }
}

// POST /api/raffles - Cria novo sorteio (admin)
export async function POST(request: NextRequest) {
  try {
    // TODO: Adicionar verificação de permissão de admin aqui

    const body = await request.json();
    const {
      sponsorId,
      title,
      description,
      skinName,
      skinImage,
      skinValue,
      startDate,
      endDate,
    } = body;

    // Validações básicas
    if (
      !sponsorId ||
      !title ||
      !skinName ||
      !skinValue ||
      !startDate ||
      !endDate
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const raffle = await prisma.raffle.create({
      data: {
        sponsorId,
        title,
        description,
        skinName,
        skinImage,
        skinValue: Number(skinValue),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: RaffleStatus.ACTIVE,
      },
      include: {
        sponsor: true,
      },
    });

    return NextResponse.json({ success: true, data: raffle }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar sorteio:", error);
    return NextResponse.json(
      { error: "Erro ao criar sorteio" },
      { status: 500 }
    );
  }
}
