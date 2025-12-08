// src/app/raffles/page.tsx
import { auth } from "../../../lib/auth";
import { headers } from "next/headers";
import prisma from "../../../lib/prisma";
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
import {
  formatCurrency,
  formatDate,
  getTimeRemaining,
} from "../../../lib/utils/format";
import { Trophy, Users, Clock, Ticket, TrendingUp } from "lucide-react";

export default async function RafflesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Buscar todos os sorteios ativos
  const activeRaffles = await prisma.raffle.findMany({
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
    orderBy: {
      endDate: "asc",
    },
  });

  // Buscar sorteios encerrados recentes
  const completedRaffles = await prisma.raffle.findMany({
    where: {
      status: "COMPLETED",
    },
    include: {
      sponsor: true,
      winner: {
        select: {
          name: true,
        },
      },
      _count: {
        select: { entries: true },
      },
    },
    orderBy: {
      drawDate: "desc",
    },
    take: 3,
  });

  // Estatísticas gerais
  const totalActiveRaffles = activeRaffles.length;
  const totalPrizeValue = activeRaffles.reduce(
    (sum, raffle) => sum + raffle.skinValue,
    0
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Sorteios Disponíveis
              </h1>
              <p className="text-gray-400">
                Escolha um sorteio e comece a concorrer agora mesmo!
              </p>
            </div>
            {session && (
              <Link href="/dashboard">
                <Button variant="outline" className="border-gray-700">
                  Meu Dashboard
                </Button>
              </Link>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">
                      Sorteios Ativos
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {totalActiveRaffles}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">
                      Valor Total em Prêmios
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(totalPrizeValue)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">
                      Total de Participações
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {activeRaffles.reduce(
                        (sum, r) => sum + r._count.entries,
                        0
                      )}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sorteios Ativos */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Sorteios em Andamento
            </h2>
            <Badge
              variant="outline"
              className="text-green-500 border-green-500"
            >
              {totalActiveRaffles} ativos
            </Badge>
          </div>

          {activeRaffles.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="py-16 text-center">
                <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Nenhum sorteio ativo no momento
                </h3>
                <p className="text-gray-400">
                  Novos sorteios serão adicionados em breve. Volte mais tarde!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRaffles.map((raffle) => {
                const timeRemaining = getTimeRemaining(raffle.endDate);
                const currentTime = new Date().getTime();
                const isEndingSoon =
                  new Date(raffle.endDate).getTime() - currentTime <
                  24 * 60 * 60 * 1000; // menos de 24h

                return (
                  <Card
                    key={raffle.id}
                    className="bg-gray-800/50 border-gray-700 hover:border-blue-600 transition-all duration-300 overflow-hidden group"
                  >
                    {/* Imagem */}
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

                      {/* Badges superiores */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className="bg-blue-600 text-white">
                          {raffle.sponsor.name}
                        </Badge>
                        {isEndingSoon && (
                          <Badge className="bg-red-600 text-white animate-pulse">
                            Encerrando!
                          </Badge>
                        )}
                      </div>

                      {/* Valor */}
                      <div className="absolute bottom-3 right-3">
                        <Badge className="bg-green-600 text-white text-lg px-3 py-1">
                          {formatCurrency(raffle.skinValue)}
                        </Badge>
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-xl line-clamp-1">
                        {raffle.skinName}
                      </CardTitle>
                      <CardDescription className="text-gray-400 line-clamp-2">
                        {raffle.title}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Estatísticas */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-700/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <Users className="h-3 w-3" />
                            <span className="text-xs">Participações</span>
                          </div>
                          <p className="text-lg font-bold text-white">
                            {raffle._count.entries}
                          </p>
                        </div>

                        <div className="bg-gray-700/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">Termina em</span>
                          </div>
                          <p className="text-lg font-bold text-white">
                            {timeRemaining}
                          </p>
                        </div>
                      </div>

                      {/* Data de encerramento */}
                      <div className="text-xs text-gray-400 text-center">
                        Encerra em {formatDate(raffle.endDate)}
                      </div>

                      {/* Botão */}
                      <Link href={`/raffles/${raffle.id}`} className="block">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <Ticket className="mr-2 h-4 w-4" />
                          Participar Agora
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sorteios Finalizados */}
        {completedRaffles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Sorteios Recentes
              </h2>
              <Badge
                variant="outline"
                className="text-gray-400 border-gray-600"
              >
                Finalizados
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {completedRaffles.map((raffle) => (
                <Card
                  key={raffle.id}
                  className="bg-gray-800/30 border-gray-700 opacity-75"
                >
                  <div className="relative h-32 bg-linear-to-br from-gray-700 to-gray-800">
                    {raffle.skinImage ? (
                      <Image
                        src={raffle.skinImage}
                        alt={raffle.skinName}
                        fill
                        className="object-contain p-4 grayscale"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Trophy className="h-12 w-12 text-gray-600" />
                      </div>
                    )}
                    <Badge className="absolute top-2 left-2 bg-gray-600">
                      Finalizado
                    </Badge>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg line-clamp-1">
                      {raffle.skinName}
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-sm">
                      {raffle.sponsor.name}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {raffle.winner && (
                        <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-3">
                          <p className="text-yellow-500 font-semibold">
                            🏆 Vencedor
                          </p>
                          <p className="text-white">{raffle.winner.name}</p>
                        </div>
                      )}
                      <div className="text-gray-400 text-xs">
                        {raffle._count.entries} participações • Realizado em{" "}
                        {raffle.drawDate ? formatDate(raffle.drawDate) : "N/A"}
                      </div>
                    </div>

                    <Link
                      href={`/raffles/${raffle.id}/winner`}
                      className="block mt-4"
                    >
                      <Button
                        variant="outline"
                        className="w-full border-gray-600 hover:bg-gray-700"
                      >
                        Ver Certificado
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA Final */}
        {!session && activeRaffles.length > 0 && (
          <Card className="mt-12 bg-linear-to-r from-blue-600 to-purple-600 border-none">
            <CardContent className="py-12 text-center">
              <Trophy className="h-16 w-16 text-white mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-white mb-3">
                Pronto para começar?
              </h3>
              <p className="text-blue-100 mb-6 text-lg">
                Faça login ou crie sua conta para participar dos sorteios
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/sign-in">
                  <Button size="lg" variant="secondary">
                    Fazer Login
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    Criar Conta
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
