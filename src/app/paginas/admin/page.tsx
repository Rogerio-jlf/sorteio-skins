"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPanel } from "../admin/Painel_Admin";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (data.success && data.user.isAdmin) {
        setIsAuthorized(true);
      } else {
        router.push("/");
      }
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">Verificando permissões...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <AdminPanel />;
}
