// src/lib/auth-middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import prisma from "./prisma";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

/**
 * Verifica se o usuário está autenticado
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: AuthUser } | NextResponse> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autenticado. Faça login para continuar." },
        { status: 401 }
      );
    }

    // Buscar role do usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return { user: user as AuthUser };
  } catch (error) {
    console.error("Erro na autenticação:", error);
    return NextResponse.json(
      { error: "Erro ao verificar autenticação" },
      { status: 500 }
    );
  }
}

/**
 * Verifica se o usuário é admin
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ user: AuthUser } | NextResponse> {
  const authResult = await requireAuth(request);

  // Se já é um erro, retorna
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // Verifica se é admin
  if (authResult.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso negado. Apenas administradores podem acessar." },
      { status: 403 }
    );
  }

  return authResult;
}

/**
 * Verifica se o usuário pode acessar o recurso (é o dono ou é admin)
 */
export async function requireOwnerOrAdmin(
  request: NextRequest,
  resourceUserId: string
): Promise<
  { user: AuthUser; isOwner: boolean; isAdmin: boolean } | NextResponse
> {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const isOwner = authResult.user.id === resourceUserId;
  const isAdmin = authResult.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      {
        error:
          "Acesso negado. Você não tem permissão para acessar este recurso.",
      },
      { status: 403 }
    );
  }

  return {
    user: authResult.user,
    isOwner,
    isAdmin,
  };
}
