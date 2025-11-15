// ============================================
// src/lib/types.ts
import { Deposit, Raffle, RaffleEntry, Sponsor, User } from "@prisma/client";

// Tipos com relações
export type DepositWithRelations = Deposit & {
  sponsor: Sponsor;
  raffle: Raffle;
  user: User;
  entries: RaffleEntry[];
};

export type RaffleWithRelations = Raffle & {
  sponsor: Sponsor;
  _count: {
    entries: number;
  };
};

export type RaffleEntryWithRelations = RaffleEntry & {
  user: User;
  raffle: Raffle;
  deposit: Deposit & {
    sponsor: Sponsor;
  };
};

// Tipos de resposta da API
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
