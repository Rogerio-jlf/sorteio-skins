// src/app/api/raffles/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/auth-middleware";

// GET /api/raffles - Lista sorteios ativos
export async function GET() {
  try {
    const raffles = await prisma.raffle.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: new Date(),
        },
      },
      include: {
        sponsor: true,
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { createdAt: "desc" },
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
    // ✅ VERIFICAR SE É ADMIN
    const authResult = await requireAdmin(request);

    if (authResult instanceof NextResponse) {
      return authResult; // Retorna erro de autenticação/autorização
    }

    const { user } = authResult;
    console.log(`Admin ${user.email} criando sorteio`);

    // Parse do body
    const body = await request.json();
    console.log("Body recebido:", JSON.stringify(body, null, 2));

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
        {
          error: "Campos obrigatórios faltando",
          missing: {
            sponsorId: !sponsorId,
            title: !title,
            skinName: !skinName,
            skinValue: !skinValue,
            startDate: !startDate,
            endDate: !endDate,
          },
        },
        { status: 400 }
      );
    }

    // Verificar se o patrocinador existe
    console.log(`Buscando patrocinador: ${sponsorId}`);
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: sponsorId },
    });

    if (!sponsor) {
      return NextResponse.json(
        { error: "Patrocinador não encontrado" },
        { status: 404 }
      );
    }

    console.log(`Patrocinador encontrado: ${sponsor.name}`);

    // Validar datas
    const start = new Date(startDate);
    const end = new Date(endDate);

    console.log(
      `Datas - Início: ${start.toISOString()}, Fim: ${end.toISOString()}`
    );

    if (end <= start) {
      return NextResponse.json(
        { error: "Data de término deve ser posterior à data de início" },
        { status: 400 }
      );
    }

    // Criar sorteio
    console.log("Criando sorteio no banco...");
    const raffle = await prisma.raffle.create({
      data: {
        sponsorId,
        title,
        description: description || null,
        skinName,
        skinImage: skinImage || null,
        skinValue: parseFloat(skinValue.toString()), // Garantir que é número
        startDate: start,
        endDate: end,
        status: "ACTIVE",
      },
      include: {
        sponsor: true,
      },
    });

    console.log(`Sorteio criado com sucesso: ${raffle.id}`);

    return NextResponse.json({ success: true, data: raffle }, { status: 201 });
  } catch (error) {
    // Log detalhado do erro
    console.error("❌ ERRO COMPLETO:");
    console.error(
      "Nome:",
      error instanceof Error ? error.name : "Desconhecido"
    );
    console.error("Mensagem:", error instanceof Error ? error.message : error);
    console.error("Stack:", error instanceof Error ? error.stack : "N/A");

    // Se for erro do Prisma, mostrar detalhes
    if (error && typeof error === "object" && "code" in error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.error("Código Prisma:", (error as any).code);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.error("Meta:", (error as any).meta);
    }

    return NextResponse.json(
      {
        error: "Erro ao criar sorteio",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
