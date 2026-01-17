'use client';

import { ArrowLeft, Home, Search } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="w-full max-w-2xl text-center">
                {/* Animação 404 */}
                <div className="mb-8">
                    <h1 className="animate-pulse bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-[150px] leading-none font-black tracking-tighter text-transparent select-none md:text-[200px]">
                        404
                    </h1>
                </div>

                {/* Ícone */}
                <div className="mb-8 flex justify-center">
                    <div className="rounded-full border-4 border-purple-500/30 bg-purple-500/10 p-8 backdrop-blur-sm">
                        <Search className="h-16 w-16 text-purple-400" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Mensagem */}
                <h2 className="mb-4 text-3xl font-bold tracking-wide text-white md:text-4xl">
                    Página Não Encontrada
                </h2>
                <p className="mb-8 text-lg text-purple-300 md:text-xl">
                    Ops! A página que você está procurando não existe ou foi movida.
                </p>

                {/* Botões */}
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                    <Link
                        href="/"
                        className="group flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-purple-900/50 transition-all hover:-translate-y-1 hover:bg-purple-500 hover:shadow-xl hover:shadow-purple-900/70 active:scale-95"
                    >
                        <Home size={20} />
                        Ir para Início
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="group flex items-center justify-center gap-2 rounded-lg border-2 border-purple-500/50 bg-white/10 px-8 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-purple-500 hover:bg-white/20 active:scale-95"
                    >
                        <ArrowLeft size={20} />
                        Voltar
                    </button>
                </div>

                {/* Decoração */}
                <div className="mt-12 flex justify-center gap-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400"></div>
                </div>
            </div>

            {/* Background decorativo */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-0 -left-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"></div>
                <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl"></div>
            </div>
        </div>
    );
}
