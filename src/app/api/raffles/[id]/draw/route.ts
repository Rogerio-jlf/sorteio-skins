// src/app/api/raffles/[id]/draw/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { requireAdmin } from "../../../../../lib/auth-middleware";
import { sendWinnerEmail } from "../../../../../lib/email"; // 👈 Importar função de email

// POST /api/raffles/:id/draw - Realiza o sorteio (admin)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Verificar se é admin
  const authResult = await requireAdmin(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  console.log(`Admin ${user.email} realizando sorteio ${id}`);

  try {
    // 1. Buscar o sorteio
    const raffle = await prisma.raffle.findUnique({
      where: { id },
      include: {
        _count: {
          select: { entries: true },
        },
        sponsor: true, // 👈 Incluir sponsor aqui para usar depois
      },
    });

    if (!raffle) {
      return NextResponse.json(
        { error: "Sorteio não encontrado" },
        { status: 404 }
      );
    }

    // 2. Verificar se já foi sorteado
    if (raffle.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Sorteio já foi realizado" },
        { status: 400 }
      );
    }

    // 3. Verificar se há entries
    const totalEntries = raffle._count.entries;
    if (totalEntries === 0) {
      return NextResponse.json(
        { error: "Nenhuma entrada encontrada para este sorteio" },
        { status: 400 }
      );
    }

    // 4. Sortear número aleatório (de 1 até totalEntries)
    const winnerNumber = Math.floor(Math.random() * totalEntries) + 1;

    console.log(
      `🎲 Sorteando entre ${totalEntries} entries. Número sorteado: ${winnerNumber}`
    );

    // 5. Buscar a entry com esse número
    const winnerEntry = await prisma.raffleEntry.findUnique({
      where: {
        raffleId_ticketNumber: {
          raffleId: id,
          ticketNumber: winnerNumber,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!winnerEntry) {
      console.error(
        `❌ Erro: Entry com número ${winnerNumber} não encontrada!`
      );
      return NextResponse.json(
        { error: "Erro ao determinar vencedor" },
        { status: 500 }
      );
    }

    // 6. Atualizar sorteio com vencedor
    const updatedRaffle = await prisma.raffle.update({
      where: { id },
      data: {
        status: "COMPLETED",
        winnerId: winnerEntry.userId,
        winnerNumber: winnerNumber,
        drawDate: new Date(),
      },
      include: {
        winner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sponsor: true,
      },
    });

    console.log(
      `🎉 Sorteio realizado! Vencedor: ${winnerEntry.user.name} (número ${winnerNumber})`
    );

    // 7. 📧 ENVIAR EMAIL PARA O VENCEDOR
    let emailSent = false;
    let emailError: string | null = null;

    try {
      await sendWinnerEmail({
        to: winnerEntry.user.email,
        winnerName: winnerEntry.user.name,
        raffleTitle: updatedRaffle.title,
        skinName: updatedRaffle.skinName,
        skinValue: updatedRaffle.skinValue,
        winnerNumber: winnerNumber,
        totalEntries: totalEntries,
        drawDate: updatedRaffle.drawDate!,
        sponsorName: updatedRaffle.sponsor.name,
        raffleId: updatedRaffle.id,
      });
      emailSent = true;
      console.log(
        `✅ Email enviado com sucesso para ${winnerEntry.user.email}`
      );
    } catch (error) {
      // ⚠️ Não falha o sorteio se o email falhar
      emailError =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao enviar email";
      console.error("❌ Erro ao enviar email:", error);
      console.warn(
        "⚠️ Sorteio concluído, mas email não foi enviado. Reenvio manual pode ser necessário."
      );
    }

    return NextResponse.json({
      success: true,
      emailSent, // 👈 Indica se o email foi enviado
      emailError, // 👈 Mensagem de erro (se houver)
      data: {
        raffleId: updatedRaffle.id,
        raffleTitle: updatedRaffle.title,
        winnerNumber: winnerNumber,
        winnerId: winnerEntry.userId,
        winner: winnerEntry.user,
        totalEntries: totalEntries,
        drawDate: updatedRaffle.drawDate,
        sponsorName: updatedRaffle.sponsor.name,
      },
    });
  } catch (error) {
    console.error("Erro ao realizar sorteio:", error);
    return NextResponse.json(
      { error: "Erro ao realizar sorteio" },
      { status: 500 }
    );
  }
}
