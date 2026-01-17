import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Pegar o session token dos cookies
        const sessionToken = request.cookies.get('better-auth.session_token')?.value;

        if (sessionToken) {
            // Invalidar a sessão no banco
            await auth.api.signOut({
                headers: request.headers,
            });
        }

        // Criar resposta de sucesso
        const response = NextResponse.json({
            success: true,
            message: 'Logout realizado com sucesso',
        });

        // Limpar os cookies
        response.cookies.delete('better-auth.session_token');

        return response;
    } catch (error) {
        console.error('Erro ao fazer logout:', error);

        // Mesmo com erro, limpar os cookies
        const response = NextResponse.json(
            { success: true, message: 'Logout realizado' },
            { status: 200 }
        );

        response.cookies.delete('better-auth.session_token');

        return response;
    }
}
