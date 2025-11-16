// scripts/make-admin.ts
// Execute com: npx tsx scripts/make-admin.ts seu-email@exemplo.com

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function makeAdmin(email: string) {
  try {
    console.log(`🔍 Buscando usuário com email: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ Usuário com email ${email} não encontrado`);
      process.exit(1);
    }

    if (user.role === "ADMIN") {
      console.log(`ℹ️  Usuário ${user.name} já é ADMIN`);
      process.exit(0);
    }

    console.log(`📝 Atualizando usuário ${user.name} para ADMIN...`);

    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    console.log(`✅ Usuário ${user.name} (${user.email}) agora é ADMIN!`);
  } catch (error) {
    console.error("❌ Erro:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Pegar email da linha de comando
const email = process.argv[2];

if (!email) {
  console.error("❌ Uso: npx tsx scripts/make-admin.ts seu-email@exemplo.com");
  process.exit(1);
}

makeAdmin(email);
