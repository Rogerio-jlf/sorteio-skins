// src/app/raffles/[id]/page.tsx
import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import prisma from "../../../../lib/prisma";
import type { RaffleEntry, Deposit } from "@prisma/client";
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
} from "../../../../lib/utils/format";
import { Trophy, Users, Clock, ArrowLeft, Ticket } from "lucide-react";
import DepositForm from "../../../../components/deposit-form";

interface PageProps {
  params: Promise<{ id: string }>; // ← params agora é uma Promise
}

export default async function RaffleDetailPage({ params }: PageProps) {
  // ← CORREÇÃO: await params antes de usar
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const raffle = await prisma.raffle.findUnique({
    where: { id }, // ← agora usando o id desembrulhado
    include: {
      sponsor: true,
      _count: {
        select: { entries: true },
      },
    },
  });

  if (!raffle) {
    notFound();
  }

  // Buscar participações do usuário neste sorteio
  let userEntries: (RaffleEntry & { deposit: Deposit | null })[] = [];
  if (session) {
    userEntries = await prisma.raffleEntry.findMany({
      where: {
        userId: session.user.id,
        raffleId: raffle.id,
      },
      include: {
        deposit: true,
      },
      orderBy: {
        ticketNumber: "asc",
      },
    });
  }

  const isActive =
    raffle.status === "ACTIVE" && new Date(raffle.endDate) > new Date();
  const totalUserTickets = userEntries.length;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Botão Voltar */}
        <Link href="/paginas/raffles">
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para sorteios
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal - Detalhes do Sorteio */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Principal com Imagem */}
            <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
              <div className="relative h-80 bg-linear-to-br from-gray-700 to-gray-800">
                {raffle.skinImage ? (
                  <Image
                    src={raffle.skinImage}
                    alt={raffle.skinName}
                    fill
                    className="object-contain p-8"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Trophy className="h-32 w-32 text-gray-600" />
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-blue-600">{raffle.sponsor.name}</Badge>
                  {isActive ? (
                    <Badge className="bg-green-600">Ativo</Badge>
                  ) : (
                    <Badge variant="secondary">Encerrado</Badge>
                  )}
                </div>
                <div className="absolute bottom-4 right-4">
                  <Badge
                    variant="secondary"
                    className="bg-green-600/90 text-white text-lg px-4 py-2"
                  >
                    {formatCurrency(raffle.skinValue)}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-3xl text-white">
                  {raffle.skinName}
                </CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  {raffle.title}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Descrição */}
                {raffle.description && (
                  <div>
                    <h3 className="text-white font-semibold mb-2">
                      Sobre o sorteio
                    </h3>
                    <p className="text-gray-400">{raffle.description}</p>
                  </div>
                )}

                {/* Estatísticas */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Participações</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {raffle._count.entries}
                    </p>
                  </div>

                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Tempo restante</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {getTimeRemaining(raffle.endDate)}
                    </p>
                  </div>

                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Ticket className="h-4 w-4" />
                      <span className="text-sm">Suas quotas</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {totalUserTickets}
                    </p>
                  </div>
                </div>

                {/* Datas */}
                <div className="border-t border-gray-700 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Início do sorteio:</span>
                    <span className="text-white">
                      {formatDate(raffle.startDate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Encerramento:</span>
                    <span className="text-white">
                      {formatDate(raffle.endDate)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Minhas Participações */}
            {session && userEntries.length > 0 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Suas Participações
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Você possui {totalUserTickets} quota
                    {totalUserTickets > 1 ? "s" : ""} neste sorteio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {userEntries.slice(0, 10).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <Ticket className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-mono text-lg font-bold text-white">
                              #{entry.ticketNumber.toString().padStart(6, "0")}
                            </p>
                            <p className="text-xs text-gray-400">
                              Número da sorte
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {formatDate(entry.createdAt)}
                        </Badge>
                      </div>
                    ))}
                    {userEntries.length > 10 && (
                      <p className="text-center text-sm text-gray-400 pt-2">
                        + {userEntries.length - 10} quotas adicionais
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna Lateral - Participar */}
          <div className="space-y-6">
            {/* Card de Participação */}
            {session ? (
              isActive ? (
                <DepositForm raffle={raffle} userId={session.user.id} />
              ) : (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Sorteio Encerrado
                      </h3>
                      <p className="text-gray-400">
                        Este sorteio não está mais aceitando participações
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            ) : (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Faça login para participar
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Entre com sua conta para começar a concorrer
                    </p>
                    <Link href="/sign-in">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Fazer Login
                      </Button>
                    </Link>
                    <p className="text-sm text-gray-400 mt-4">
                      Não tem conta?{" "}
                      <Link
                        href="/sign-up"
                        className="text-blue-400 hover:underline"
                      >
                        Cadastre-se
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informações do Patrocinador */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Patrocinador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  {raffle.sponsor.logoUrl && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-700">
                      <Image
                        src={raffle.sponsor.logoUrl}
                        alt={raffle.sponsor.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-white text-lg">
                      {raffle.sponsor.name}
                    </h3>
                    <p className="text-sm text-gray-400">Site parceiro</p>
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Código do cupom:</p>
                  <p className="font-mono font-bold text-lg text-blue-400">
                    {raffle.sponsor.couponCode}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Regras */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Regras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-400">
                <p>• A cada R$ 15,00 depositados, você ganha 1 quota</p>
                <p>• O sorteio será realizado na data de encerramento</p>
                <p>• O vencedor será notificado por e-mail</p>
                <p>• Use o cupom do patrocinador ao fazer o depósito</p>
                <p>• Envie o comprovante para validação</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
