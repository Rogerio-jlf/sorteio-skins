// ============================================
// src/lib/utils/ticket-generator.ts
import { QUOTA_VALUE } from "../../lib/constants";

/**
 * Gera números de sorteio únicos para as quotas
 */
export function generateUniqueTicketNumbers(
  count: number,
  existingNumbers: Set<number>
): number[] {
  const numbers: number[] = [];
  const maxAttempts = count * 100;

  let attempts = 0;
  while (numbers.length < count && attempts < maxAttempts) {
    const randomNum = Math.floor(Math.random() * 1000000) + 1;

    if (!existingNumbers.has(randomNum) && !numbers.includes(randomNum)) {
      numbers.push(randomNum);
      existingNumbers.add(randomNum);
    }
    attempts++;
  }

  return numbers;
}

/**
 * Calcula quantas quotas o usuário tem direito baseado no valor depositado
 */
export function calculateQuotas(amount: number): number {
  return Math.floor(amount / QUOTA_VALUE);
}
