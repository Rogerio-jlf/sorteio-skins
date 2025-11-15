import { PrismaClient } from "@prisma/client";

// Evita múltiplas instâncias no modo dev (Next.js reinicia muito por hot-reload)
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"], // se quiser: ['query', 'info', 'warn', 'error']
  });

// Só guarda em dev para não criar várias conexões
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
