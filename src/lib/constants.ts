// ============================================
// src/lib/constants.ts
import { RaffleStatus, DepositStatus } from "@prisma/client";

export const QUOTA_VALUE = 15; // R$ 15 = 1 quota

// Enums exportados do Prisma para facilitar uso
export { RaffleStatus, DepositStatus };

// Status labels para exibição
export const RAFFLE_STATUS_LABELS: Record<RaffleStatus, string> = {
  ACTIVE: "Ativo",
  DRAWING: "Sorteando",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
};

export const DEPOSIT_STATUS_LABELS: Record<DepositStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};
