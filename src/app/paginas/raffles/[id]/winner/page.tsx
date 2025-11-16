import { notFound } from "next/navigation";
import prisma from "../../../../../lib/prisma";
import WinnerCertificate from "../../../../../components/raffles/Winner_Certificate";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WinnerPage({ params }: Props) {
  const { id } = await params;

  // Buscar sorteio com vencedor
  const raffle = await prisma.raffle.findUnique({
    where: { id },
    include: {
      winner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      sponsor: true,
      _count: {
        select: { entries: true },
      },
    },
  });

  // Se sorteio não existe
  if (!raffle) {
    notFound();
  }

  // Se sorteio ainda não foi realizado
  if (raffle.status !== "COMPLETED" || !raffle.winner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Sorteio Ainda Não Realizado
          </h1>
          <p className="text-gray-600">Este sorteio ainda está em andamento.</p>
        </div>
      </div>
    );
  }

  return (
    <WinnerCertificate
      raffleId={raffle.id}
      raffleTitle={raffle.title}
      skinName={raffle.skinName}
      skinValue={raffle.skinValue}
      winnerName={raffle.winner.name}
      winnerEmail={raffle.winner.email}
      winnerNumber={raffle.winnerNumber!}
      totalEntries={raffle._count.entries}
      drawDate={raffle.drawDate!}
      sponsorName={raffle.sponsor.name}
    />
  );
}
