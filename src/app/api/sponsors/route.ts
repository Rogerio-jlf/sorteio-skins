// ============================================
// src/app/api/sponsors/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

// GET /api/sponsors - Lista patrocinadores
export async function GET() {
  try {
    const sponsors = await prisma.sponsor.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: sponsors });
  } catch (error) {
    console.error("Erro ao buscar patrocinadores:", error);
    return NextResponse.json(
      { error: "Erro ao buscar patrocinadores" },
      { status: 500 }
    );
  }
}
