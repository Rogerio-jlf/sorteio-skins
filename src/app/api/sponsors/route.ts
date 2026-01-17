// src/app/api/sponsors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../lib/auth-middleware';
import prisma from '../../../lib/prisma';

// CRIAR PATROCINADOR
export async function POST(request: NextRequest) {
    // ✅ VERIFICAR SE É ADMIN
    const authResult = await requireAdmin(request);

    if (authResult instanceof NextResponse) {
        return authResult;
    }

    const { user } = authResult;
    console.log(`Admin ${user.email} criando patrocinador`);

    try {
        const body = await request.json();
        const { name, slug, couponCode, logoUrl, isActive } = body;

        // Validações básicas
        if (!name || !slug || !couponCode) {
            return NextResponse.json(
                { error: 'Nome, slug e código do cupom são obrigatórios' },
                { status: 400 }
            );
        }

        // Verificar se slug já existe
        const existingSlug = await prisma.sponsor.findUnique({
            where: { slug },
        });

        if (existingSlug) {
            return NextResponse.json({ error: 'Slug já está em uso' }, { status: 400 });
        }

        // Verificar se couponCode já existe
        const existingCoupon = await prisma.sponsor.findUnique({
            where: { couponCode },
        });

        if (existingCoupon) {
            return NextResponse.json({ error: 'Código de cupom já está em uso' }, { status: 400 });
        }

        const sponsor = await prisma.sponsor.create({
            data: {
                name,
                slug,
                couponCode,
                logoUrl: logoUrl || null,
                isActive: isActive ?? true,
            },
        });

        return NextResponse.json({ success: true, data: sponsor }, { status: 201 });
    } catch (error) {
        console.error('Erro ao criar patrocinador:', error);
        return NextResponse.json({ error: 'Erro ao criar patrocinador' }, { status: 500 });
    }
}

// LISTAR TODOS OS PATROCINADORES
export async function GET() {
    try {
        const sponsors = await prisma.sponsor.findMany({
            // where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ success: true, data: sponsors });
    } catch (error) {
        console.error('Erro ao buscar patrocinadores:', error);
        return NextResponse.json({ error: 'Erro ao buscar patrocinadores' }, { status: 500 });
    }
}
