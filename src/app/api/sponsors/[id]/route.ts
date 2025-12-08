// src/app/api/sponsors/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/auth-middleware";

// GET /api/sponsors/[id] - Buscar patrocinador por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const sponsor = await prisma.sponsor.findUnique({
      where: { id },
      include: {
        raffles: {
          orderBy: { createdAt: "desc" },
        },
      },
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

// PUT /api/sponsors/[id] - Atualizar patrocinador
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ VERIFICAR SE É ADMIN
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  const { id } = await params;

  console.log(`Admin ${user.email} atualizando patrocinador ${id}`);

  try {
    const body = await request.json();
    const { name, slug, couponCode, logoUrl, isActive } = body;

    // Verificar se o patrocinador existe
    const existingSponsor = await prisma.sponsor.findUnique({
      where: { id },
    });

    if (!existingSponsor) {
      return NextResponse.json(
        { error: "Patrocinador não encontrado" },
        { status: 404 }
      );
    }

    // Se mudou o slug, verificar se o novo não está em uso
    if (slug && slug !== existingSponsor.slug) {
      const slugInUse = await prisma.sponsor.findUnique({
        where: { slug },
      });

      if (slugInUse) {
        return NextResponse.json(
          { error: "Slug já está em uso" },
          { status: 400 }
        );
      }
    }

    // Se mudou o couponCode, verificar se o novo não está em uso
    if (couponCode && couponCode !== existingSponsor.couponCode) {
      const couponInUse = await prisma.sponsor.findUnique({
        where: { couponCode },
      });

      if (couponInUse) {
        return NextResponse.json(
          { error: "Código de cupom já está em uso" },
          { status: 400 }
        );
      }
    }

    const sponsor = await prisma.sponsor.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(couponCode !== undefined && { couponCode }),
        ...(logoUrl !== undefined && { logoUrl: logoUrl || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, data: sponsor });
  } catch (error) {
    console.error("Erro ao atualizar patrocinador:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar patrocinador" },
      { status: 500 }
    );
  }
}

// DELETE /api/sponsors/[id] - Deletar patrocinador
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ VERIFICAR SE É ADMIN
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  const { id } = await params;

  console.log(`Admin ${user.email} deletando patrocinador ${id}`);

  try {
    // Verificar se o patrocinador existe
    const existingSponsor = await prisma.sponsor.findUnique({
      where: { id },
      include: {
        raffles: true,
      },
    });

    if (!existingSponsor) {
      return NextResponse.json(
        { error: "Patrocinador não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se tem rifas associadas (opcional - você pode querer impedir a exclusão)
    if (existingSponsor.raffles.length > 0) {
      return NextResponse.json(
        {
          error: "Não é possível deletar patrocinador com rifas associadas",
          rafflesCount: existingSponsor.raffles.length,
        },
        { status: 400 }
      );
    }

    await prisma.sponsor.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Patrocinador deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar patrocinador:", error);
    return NextResponse.json(
      { error: "Erro ao deletar patrocinador" },
      { status: 500 }
    );
  }
}
