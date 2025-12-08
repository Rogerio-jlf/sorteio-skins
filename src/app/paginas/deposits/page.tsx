// src/app/deposits/page.tsx
import { redirect } from "next/navigation";
import { auth } from "../../../lib/auth";
import { headers } from "next/headers";
import prisma from "../../../lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  formatCurrency,
  formatDate,
  DEPOSIT_STATUS_LABELS,
} from "../../../lib/utils/format";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Ticket,
  FileText,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default async function DepositsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  // Buscar todos os depósitos do usuário
  const deposits = await prisma.deposit.findMany({
    where: { userId: session.user.id },
    include: {
      sponsor: true,
      raffle: {
        include: {
          sponsor: true,
        },
      },
      entries: {
        select: {
          id: true,
          ticketNumber: true,
        },
        orderBy: {
          ticketNumber: "asc",
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Estatísticas
  const stats = {
    total: deposits.length,
    approved: deposits.filter((d) => d.status === "APPROVED").length,
    pending: deposits.filter((d) => d.status === "PENDING").length,
    rejected: deposits.filter((d) => d.status === "REJECTED").length,
    totalAmount: deposits.reduce((sum, d) => sum + d.amount, 0),
    totalQuotas: deposits.reduce((sum, d) => sum + d.quotas, 0),
    approvedAmount: deposits
      .filter((d) => d.status === "APPROVED")
      .reduce((sum, d) => sum + d.amount, 0),
  };

  // Agrupar por status
  const pendingDeposits = deposits.filter((d) => d.status === "PENDING");
  const approvedDeposits = deposits.filter((d) => d.status === "APPROVED");
  const rejectedDeposits = deposits.filter((d) => d.status === "REJECTED");

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </Link>

          <h1 className="text-4xl font-bold text-white mb-2">Meus Depósitos</h1>
          <p className="text-gray-400">
            Acompanhe o histórico completo dos seus depósitos
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Depositado</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(stats.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.total} depósito{stats.total !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Aprovados</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.approved}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(stats.approvedAmount)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Pendentes</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.pending}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Em análise</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-600/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total de Quotas</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalQuotas}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Números da sorte</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aviso para depósitos pendentes */}
        {pendingDeposits.length > 0 && (
          <Card className="bg-orange-600/10 border-orange-600/30 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-600/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Você tem {pendingDeposits.length} depósito
                    {pendingDeposits.length !== 1 ? "s" : ""} pendente
                    {pendingDeposits.length !== 1 ? "s" : ""}
                  </h3>
                  <p className="text-orange-200 text-sm">
                    Seus depósitos estão sendo analisados. Você receberá uma
                    notificação assim que forem aprovados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Depósitos */}
        {deposits.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="py-16 text-center">
              <DollarSign className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhum depósito realizado
              </h3>
              <p className="text-gray-400 mb-6">
                Você ainda não fez nenhum depósito. Escolha um sorteio para
                começar!
              </p>
              <Link href="/raffles">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Ver Sorteios Disponíveis
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Depósitos Pendentes */}
            {pendingDeposits.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-orange-500" />
                  Pendentes ({pendingDeposits.length})
                </h2>
                <div className="space-y-4">
                  {pendingDeposits.map((deposit) => (
                    <DepositCard key={deposit.id} deposit={deposit} />
                  ))}
                </div>
              </div>
            )}

            {/* Depósitos Aprovados */}
            {approvedDeposits.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Aprovados ({approvedDeposits.length})
                </h2>
                <div className="space-y-4">
                  {approvedDeposits.map((deposit) => (
                    <DepositCard key={deposit.id} deposit={deposit} />
                  ))}
                </div>
              </div>
            )}

            {/* Depósitos Rejeitados */}
            {rejectedDeposits.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <XCircle className="h-6 w-6 text-red-500" />
                  Rejeitados ({rejectedDeposits.length})
                </h2>
                <div className="space-y-4">
                  {rejectedDeposits.map((deposit) => (
                    <DepositCard key={deposit.id} deposit={deposit} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA para fazer novo depósito */}
        {deposits.length > 0 && (
          <Card className="mt-8 bg-linear-to-r from-blue-600 to-purple-600 border-none">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Quer aumentar suas chances?
                </h3>
                <p className="text-blue-100">
                  Participe de mais sorteios e aumente suas chances de ganhar!
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

// Componente para cada card de depósito
interface DepositCardProps {
  deposit: {
    id: string;
    amount: number;
    quotas: number;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: Date;
    raffleId: string;
    feedbackMessage?: string;
    proofImageUrl?: string;
    raffle: {
      skinName: string;
      sponsor: {
        name: string;
      };
    };
    sponsor: {
      name: string;
    };
    entries: Array<{
      id: string;
      ticketNumber: number;
    }>;
  };
}

function DepositCard({ deposit }: DepositCardProps) {
  const statusConfig = {
    PENDING: {
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-600/20",
      borderColor: "border-orange-600/30",
      badge: "secondary",
    },
    APPROVED: {
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-600/20",
      borderColor: "border-green-600/30",
      badge: "default",
    },
    REJECTED: {
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-600/20",
      borderColor: "border-red-600/30",
      badge: "destructive",
    },
  };

  const config = statusConfig[deposit.status as keyof typeof statusConfig];
  const StatusIcon = config.icon;

  return (
    <Card className={`bg-gray-800/50 border-gray-700 ${config.borderColor}`}>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Coluna Esquerda - Informações Principais */}
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center shrink-0`}
              >
                <StatusIcon className={`h-6 w-6 ${config.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-white">
                    {formatCurrency(deposit.amount)}
                  </h3>
                  <Badge
                    variant={
                      config.badge as "default" | "secondary" | "destructive"
                    }
                  >
                    {DEPOSIT_STATUS_LABELS[deposit.status]}
                  </Badge>
                </div>
                <Link
                  href={`/raffles/${deposit.raffleId}`}
                  className="text-blue-400 hover:underline font-medium"
                >
                  {deposit.raffle.skinName}
                </Link>
                <p className="text-sm text-gray-400 mt-1">
                  {deposit.sponsor.name}
                </p>
              </div>
            </div>

            {/* Informações Detalhadas */}
            <div className="grid grid-cols-2 gap-4 bg-gray-700/30 rounded-lg p-4">
              <div>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Ticket className="h-4 w-4" />
                  <span>Quotas</span>
                </div>
                <p className="text-xl font-bold text-white">{deposit.quotas}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Data</span>
                </div>
                <p className="text-sm font-semibold text-white">
                  {formatDate(deposit.createdAt)}
                </p>
              </div>
            </div>

            {/* Mensagem de feedback */}
            {deposit.feedbackMessage && (
              <div className="mt-4 bg-gray-700/30 rounded-lg p-3">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-white">
                    Mensagem do admin:
                  </span>{" "}
                  {deposit.feedbackMessage}
                </p>
              </div>
            )}
          </div>

          {/* Coluna Direita - Números da Sorte */}
          {deposit.status === "APPROVED" && deposit.entries.length > 0 && (
            <div className="lg:w-64">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-blue-500" />
                  Números da Sorte
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {deposit.entries
                    .slice(0, 5)
                    .map((entry: { id: string; ticketNumber: number }) => (
                      <div
                        key={entry.id}
                        className="bg-blue-600/20 rounded px-3 py-2"
                      >
                        <p className="font-mono font-bold text-blue-400 text-center">
                          #{entry.ticketNumber.toString().padStart(6, "0")}
                        </p>
                      </div>
                    ))}
                  {deposit.entries.length > 5 && (
                    <p className="text-xs text-center text-gray-400 pt-1">
                      +{deposit.entries.length - 5} números
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Comprovante */}
          {deposit.proofImageUrl && (
            <div className="lg:w-32">
              <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400 mb-2">Comprovante</p>
                <a
                  href={deposit.proofImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline" className="w-full">
                    Ver
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
