"use client";

import { signOut, useSession } from "../../lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.push("/"); // Redireciona para a página de login após logout
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Não mostra o botão se não houver sessão
  if (!session) return null;

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
    >
      {isLoading ? "Saindo..." : "Sair"}
    </button>
  );
}
