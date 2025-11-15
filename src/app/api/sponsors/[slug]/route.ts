// ============================================
// src/app/api/sponsors/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// GET /api/sponsors/[slug] - Busca patrocinador por slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const sponsor = await prisma.sponsor.findUnique({
      where: { slug: params.slug },
    });

    if (!sponsor) {
      return NextResponse.json(
        { error: "Patrocinador não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: sponsor });
  } catch (error) {
    console.error("Erro ao buscar patrocinador:", error);
    return NextResponse.json(
      { error: "Erro ao buscar patrocinador" },
      { status: 500 }
    );
  }
}
