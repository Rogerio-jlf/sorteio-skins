// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
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
import {
  formatCurrency,
  formatDate,
  DEPOSIT_STATUS_LABELS,
} from "../../../lib/utils/format";
import { Trophy, Ticket, Clock, DollarSign } from "lucide-react";
import LogoutButton from "@/src/components/utils/Logout";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  // Buscar dados do usuário
  const [deposits, activeRaffles, userEntries] = await Promise.all([
    prisma.deposit.findMany({
      where: { userId: session.user.id },
      include: {
        sponsor: true,
        raffle: true,
        entries: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.raffle.findMany({
      where: {
        status: "ACTIVE",
        endDate: { gte: new Date() },
      },
      include: {
        sponsor: true,
        _count: { select: { entries: true } },
      },
      take: 3,
    }),
    prisma.raffleEntry.findMany({
      where: { userId: session.user.id },
      include: {
        raffle: {
          include: { sponsor: true },
        },
      },
    }),
  ]);

  // Estatísticas
  const totalDeposited = deposits.reduce((sum, d) => sum + d.amount, 0);
  const totalQuotas = deposits.reduce((sum, d) => sum + d.quotas, 0);
  const pendingDeposits = deposits.filter((d) => d.status === "PENDING").length;
  const activeParticipations = userEntries.filter(
    (e) => e.raffle.status === "ACTIVE"
  ).length;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Bem-vindo, {session.user.name}!
            </h1>
            <p className="text-gray-400">
              Acompanhe suas participações e sorteios
            </p>
          </div>

          <div>
            <LogoutButton />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Depositado
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(totalDeposited)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total de Quotas
              </CardTitle>
              <Ticket className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalQuotas}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Participações Ativas
              </CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {activeParticipations}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Depósitos Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {pendingDeposits}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sorteios Ativos */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Sorteios Ativos</span>
                <Link href="/raffles">
                  <Button variant="ghost" size="sm" className="text-blue-400">
                    Ver todos
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Participe dos sorteios disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeRaffles.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  Nenhum sorteio ativo no momento
                </p>
              ) : (
                activeRaffles.map((raffle) => (
                  <div
                    key={raffle.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">
                        {raffle.skinName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Badge variant="outline" className="text-xs">
                          {raffle.sponsor.name}
                        </Badge>
                        <span>•</span>
                        <span>{raffle._count.entries} participações</span>
                      </div>
                    </div>
                    <Link href={`/raffles/${raffle.id}`}>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Participar
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Últimos Depósitos */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Últimos Depósitos</span>
                <Link href="/deposits">
                  <Button variant="ghost" size="sm" className="text-blue-400">
                    Ver todos
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Acompanhe o status dos seus depósitos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {deposits.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  Nenhum depósito realizado ainda
                </p>
              ) : (
                deposits.map((deposit) => (
                  <div
                    key={deposit.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-700/30"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">
                          {formatCurrency(deposit.amount)}
                        </h3>
                        <Badge
                          variant={
                            deposit.status === "APPROVED"
                              ? "default"
                              : deposit.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {DEPOSIT_STATUS_LABELS[deposit.status]}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-400">
                        <p>
                          {deposit.sponsor.name} • {deposit.quotas} quotas
                        </p>
                        <p>{formatDate(deposit.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* CTA para fazer depósito */}
        {activeRaffles.length > 0 && (
          <Card className="mt-8 bg-linear-to-r from-blue-600 to-purple-600 border-none">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Pronto para participar?
                </h3>
                <p className="text-blue-100">
                  Escolha um sorteio e faça seu depósito para concorrer!
                </p>
              </div>
              <Link href="/raffles">
                <Button size="lg" variant="secondary">
                  Ver Sorteios
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
