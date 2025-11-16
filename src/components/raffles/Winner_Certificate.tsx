"use client";

// http://localhost:3000/paginas/raffles/cmi0hvae20002759gaxwk7xz5/winner

interface WinnerCertificateProps {
  raffleId: string;
  raffleTitle: string;
  skinName: string;
  skinValue: number;
  winnerName: string;
  winnerEmail: string;
  winnerNumber: number;
  totalEntries: number;
  drawDate: Date;
  sponsorName: string;
}

export default function WinnerCertificate({
  raffleId,
  skinName,
  skinValue,
  winnerName,
  winnerEmail,
  winnerNumber,
  totalEntries,
  drawDate,
  sponsorName,
}: WinnerCertificateProps) {
  const formattedDate = new Date(drawDate).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 to-purple-900 flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl p-16 max-w-4xl shadow-2xl relative overflow-hidden">
        {/* Shine effect */}
        <div className="absolute inset-0 bg-linear-to-br from-transparent via-yellow-100/10 to-transparent animate-shine pointer-events-none" />

        {/* Trophy */}
        <div className="text-8xl text-center mb-5 animate-bounce">🏆</div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-purple-600 text-center mb-3">
          PARABÉNS!
        </h1>
        <p className="text-gray-600 text-center text-lg mb-10">
          Você é o grande vencedor do sorteio!
        </p>

        {/* Winner Box */}
        <div className="bg-linear-to-r from-purple-600 to-purple-800 text-white p-8 rounded-2xl mb-8 shadow-lg">
          <div className="text-4xl font-bold text-center mb-2">
            {winnerName}
          </div>
          <div className="text-lg text-center opacity-90">{winnerEmail}</div>
        </div>

        {/* Prize Info */}
        <div className="bg-gray-50 p-6 rounded-xl mb-8 border-l-4 border-purple-600">
          <div className="flex justify-between items-center py-4 border-b border-gray-200">
            <span className="text-gray-600 font-medium">🎮 Prêmio</span>
            <span className="text-gray-900 text-xl font-bold">{skinName}</span>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-gray-200">
            <span className="text-gray-600 font-medium">💰 Valor</span>
            <span className="text-gray-900 text-xl font-bold">
              {skinValue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
          <div className="flex justify-between items-center py-4">
            <span className="text-gray-600 font-medium">
              📅 Data do Sorteio
            </span>
            <span className="text-gray-900 text-xl font-bold">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Winning Number */}
        <p className="text-gray-600 text-lg text-center mb-5">
          Número da Sorte
        </p>
        <div className="text-8xl font-bold text-purple-600 text-center mb-8">
          🎲 {winnerNumber}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          <div className="bg-gray-50 p-5 rounded-xl text-center">
            <div className="text-4xl font-bold text-purple-600 mb-1">
              {totalEntries}
            </div>
            <div className="text-gray-600 text-sm">Total de Bilhetes</div>
          </div>
          <div className="bg-gray-50 p-5 rounded-xl text-center">
            <div className="text-4xl font-bold text-purple-600 mb-1">
              {winnerNumber}
            </div>
            <div className="text-gray-600 text-sm">Bilhete Vencedor</div>
          </div>
          <div className="bg-gray-50 p-5 rounded-xl text-center">
            <div className="text-4xl font-bold text-purple-600 mb-1">
              {((1 / totalEntries) * 100).toFixed(1)}%
            </div>
            <div className="text-gray-600 text-sm">Chance Real</div>
          </div>
        </div>

        {/* Sponsor Badge */}
        <div className="text-center">
          <span className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold">
            Patrocinado por {sponsorName} 🎯
          </span>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-gray-500 text-sm">
          <p>Sorteio ID: {raffleId}</p>
          <p className="mt-2">Sistema de Sorteios v1.0</p>
        </div>
      </div>
    </div>
  );
}
