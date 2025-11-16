// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth-middleware";

// GET /api/auth/me - Retorna informações do usuário logado
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.role === "ADMIN",
    },
  });
}
