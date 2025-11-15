// src/app/raffles/page.tsx
import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import prisma from "../../lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency, getTimeRemaining } from "../../lib/utils/format";
import { Trophy, Users, Clock, Tag } from "lucide-react";

export default async function RafflesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const raffles = await prisma.raffle.findMany({
    where: {
      status: "ACTIVE",
      endDate: { gte: new Date() },
    },
    include: {
      sponsor: true,
      _count: {
        select: { entries: true },
      },
    },
    orderBy: { endDate: "asc" },
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Sorteios Disponíveis
          </h1>
          <p className="text-gray-400">
            Escolha um sorteio e faça seu depósito para concorrer a skins
            incríveis!
          </p>
        </div>

        {/* Filtros (placeholder para futuras implementações) */}
        <div className="flex items-center gap-4 mb-8">
          <Badge variant="secondary" className="cursor-pointer">
            Todos ({raffles.length})
          </Badge>
          <Badge variant="outline" className="cursor-pointer text-gray-400">
            Encerrando em breve
          </Badge>
          <Badge variant="outline" className="cursor-pointer text-gray-400">
            Mais participações
          </Badge>
        </div>

        {/* Grid de Sorteios */}
        {raffles.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Trophy className="h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhum sorteio ativo
              </h3>
              <p className="text-gray-400 text-center max-w-md">
                No momento não há sorteios disponíveis. Volte em breve para
                conferir novos sorteios!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map((raffle) => (
              <Card
                key={raffle.id}
                className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300 overflow-hidden group"
              >
                {/* Imagem da Skin */}
                <div className="relative h-48 bg-linear-to-br from-gray-700 to-gray-800 overflow-hidden">
                  {raffle.skinImage ? (
                    <Image
                      src={raffle.skinImage}
                      alt={raffle.skinName}
                      fill
                      className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Trophy className="h-20 w-20 text-gray-600" />
                    </div>
                  )}
                  {/* Badge do Patrocinador */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-blue-600 hover:bg-blue-700">
                      {raffle.sponsor.name}
                    </Badge>
                  </div>
                  {/* Valor da Skin */}
                  <div className="absolute bottom-3 right-3">
                    <Badge
                      variant="secondary"
                      className="bg-green-600/90 text-white"
                    >
                      {formatCurrency(raffle.skinValue)}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg line-clamp-1">
                    {raffle.skinName}
                  </CardTitle>
                  <CardDescription className="text-gray-400 line-clamp-2">
                    {raffle.description || raffle.title}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Informações */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{raffle._count.entries} participações</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{getTimeRemaining(raffle.endDate)}</span>
                    </div>
                  </div>

                  {/* Info sobre depósito */}
                  <div className="bg-gray-700/30 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-300 mb-1">
                      <Tag className="h-4 w-4" />
                      <span className="font-medium">Como participar:</span>
                    </div>
                    <p className="text-gray-400 text-xs">
                      Deposite no site {raffle.sponsor.name} com o cupom{" "}
                      <span className="font-mono font-bold text-blue-400">
                        {raffle.sponsor.couponCode}
                      </span>
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      A cada R$ 15,00 = 1 quota
                    </p>
                  </div>

                  {/* Botão de Ação */}
                  <Link href={`/raffles/${raffle.id}`} className="block">
                    <Button
                      className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                    >
                      {session ? "Participar Agora" : "Ver Detalhes"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Informações adicionais */}
        {raffles.length > 0 && (
          <Card className="mt-8 bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Como funciona?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Escolha um sorteio</h4>
                  <p className="text-sm text-gray-400">
                    Selecione a skin que você deseja ganhar
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Faça seu depósito</h4>
                  <p className="text-sm text-gray-400">
                    Deposite no site parceiro usando nosso cupom de desconto
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Envie o comprovante</h4>
                  <p className="text-sm text-gray-400">
                    Tire um print do depósito e envie para validação
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Aguarde o sorteio</h4>
                  <p className="text-sm text-gray-400">
                    Seus números serão gerados automaticamente. Boa sorte!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
