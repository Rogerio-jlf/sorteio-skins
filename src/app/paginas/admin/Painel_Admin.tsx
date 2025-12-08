// AdminPanel.tsx - Corrigido para usar as novas rotas RESTful

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Plus,
  Check,
  Users,
  Gift,
  Calendar,
  DollarSign,
  Package,
  CreditCard,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Image from "next/image";

// Tipos
interface Sponsor {
  id: string;
  name: string;
  slug: string;
  couponCode: string;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

interface Raffle {
  id: string;
  title: string;
  description: string | null;
  skinName: string;
  skinImage: string | null;
  skinValue: number;
  startDate: string;
  endDate: string;
  drawDate: string | null;
  status: "ACTIVE" | "DRAWING" | "COMPLETED" | "CANCELLED";
  sponsor: Sponsor;
  _count: { entries: number };
}

interface Deposit {
  id: string;
  userId: string;
  sponsorId: string;
  raffleId: string;
  amount: number;
  quotas: number;
  proofImage: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  sponsor: Sponsor;
  raffle: Raffle;
}

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<
    "sponsors" | "raffles" | "deposits"
  >("sponsors");
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [showRaffleModal, setShowRaffleModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null);

  // Modal de confirmação
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Filtros de depósito
  const [depositFilters, setDepositFilters] = useState({
    status: "",
    userName: "",
    startDate: "",
    endDate: "",
  });

  // Form states
  const [sponsorForm, setSponsorForm] = useState({
    name: "",
    slug: "",
    couponCode: "",
    logoUrl: "",
    isActive: true,
  });

  const [raffleForm, setRaffleForm] = useState({
    sponsorId: "",
    title: "",
    description: "",
    skinName: "",
    skinImage: "",
    skinValue: "",
    startDate: "",
    endDate: "",
  });

  // Carregar dados
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      if (activeTab === "sponsors") {
        const res = await fetch("/api/sponsors");
        const data = await res.json();
        if (data.success) setSponsors(data.data);
      } else if (activeTab === "raffles") {
        const res = await fetch("/api/raffles");
        const data = await res.json();
        if (data.success) setRaffles(data.data);
      } else if (activeTab === "deposits") {
        // Construir query string com filtros
        const params = new URLSearchParams();
        if (depositFilters.status)
          params.append("status", depositFilters.status);
        if (depositFilters.userName)
          params.append("userName", depositFilters.userName);
        if (depositFilters.startDate)
          params.append("startDate", depositFilters.startDate);
        if (depositFilters.endDate)
          params.append("endDate", depositFilters.endDate);

        const queryString = params.toString();
        const url = `/api/admin/deposits${
          queryString ? `?${queryString}` : ""
        }`;

        const res = await fetch(url);
        const data = await res.json();
        if (data.success) setDeposits(data.data);
      }
    } catch {
      setError("Erro ao carregar dados");
    }
    setLoading(false);
  };

  useEffect(() => {
    const load = async () => {
      await loadData();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Função para limpar filtros
  const clearFilters = () => {
    setDepositFilters({
      status: "",
      userName: "",
      startDate: "",
      endDate: "",
    });
  };

  // ========== PATROCINADOR ==========

  // CRIAR PATROCINADOR
  const handleCreateSponsor = async () => {
    openConfirmModal(
      "Novo Patrocinador",
      "Tem certeza que deseja criar este patrocinador?",
      async () => {
        setError("");
        setSuccess("");

        if (!sponsorForm.name || !sponsorForm.slug || !sponsorForm.couponCode) {
          setError("Por favor, preencha todos os campos obrigatórios");
          return;
        }

        try {
          const res = await fetch("/api/sponsors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sponsorForm),
          });

          const data = await res.json();

          if (data.success) {
            setSuccess(
              `O Patrocinador ${sponsorForm.name} foi criado com sucesso!`
            );
            setShowSponsorModal(false);
            resetSponsorForm();
            loadData();
          } else {
            setError(
              data.error ||
                "Erro ao tentar criar patrocinador. Por favor, verifique os dados e tente novamente."
            );
          }
        } catch (err) {
          console.error(err);
          setError(
            "Erro ao tentar criar patrocinador. Por favor, verifique os dados e tente novamente."
          );
        }
      }
    );
  };

  // EDITAR PATROCINADOR - ✅ CORRIGIDO
  const handleUpdateSponsor = async () => {
    openConfirmModal(
      "Editar Patrocinador",
      "Tem certeza que deseja editar este patrocinador?",
      async () => {
        setError("");
        setSuccess("");

        if (!sponsorForm.name || !sponsorForm.slug || !sponsorForm.couponCode) {
          setError("Por favor, preencha todos os campos obrigatórios");
          return;
        }

        if (!editingSponsor) {
          setError(
            "Nenhum patrocinador foi selecionado para edição. Por favor, selecione um patrocinador e tente novamente."
          );
          return;
        }

        try {
          // ✅ MUDANÇA: PUT /api/sponsors/[id] em vez de PUT /api/sponsors
          const res = await fetch(`/api/sponsors/${editingSponsor.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sponsorForm), // ✅ Sem o id no body
          });

          const data = await res.json();

          if (data.success) {
            setSuccess(
              `O Patrocinador ${sponsorForm.name} foi atualizado com sucesso!`
            );
            setShowSponsorModal(false);
            resetSponsorForm();
            loadData();
          } else {
            setError(
              data.error ||
                "Erro ao tentar atualizar patrocinador. Por favor, verifique os dados e tente novamente."
            );
          }
        } catch (err) {
          console.error(err);
          setError(
            "Erro ao tentar atualizar patrocinador. Por favor, verifique os dados e tente novamente."
          );
        }
      }
    );
  };

  // DELETAR PATROCINADOR - ✅ CORRIGIDO
  const handleDeleteSponsor = async (
    sponsorId: string,
    sponsorName: string
  ) => {
    openConfirmModal(
      "Excluir Patrocinador",
      "Tem certeza que deseja excluir este patrocinador? Esta ação não poderá ser desfeita!",
      async () => {
        setError("");
        setSuccess("");

        try {
          // ✅ MUDANÇA: DELETE /api/sponsors/[id] em vez de DELETE /api/sponsors?id=
          const res = await fetch(`/api/sponsors/${sponsorId}`, {
            method: "DELETE",
          });

          const data = await res.json();

          if (data.success) {
            setSuccess(
              `O Patrocinador ${sponsorName} foi excluído com sucesso!`
            );
            loadData();
          } else {
            setError(
              data.error ||
                "Erro ao tentar excluir patrocinador. Por favor, verifique os dados e tente novamente."
            );
          }
        } catch (err) {
          console.error(err);
          setError(
            "Erro ao tentar excluir patrocinador. Por favor, verifique os dados e tente novamente."
          );
        }
      }
    );
  };

  // ========== SORTEIO ==========
  const handleSaveRaffle = async () => {
    setError("");
    setSuccess("");

    if (
      !raffleForm.sponsorId ||
      !raffleForm.title ||
      !raffleForm.skinName ||
      !raffleForm.skinValue ||
      !raffleForm.startDate ||
      !raffleForm.endDate
    ) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const res = await fetch("/api/raffles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...raffleForm,
          skinValue: parseFloat(raffleForm.skinValue),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("Sorteio criado com sucesso!");
        setShowRaffleModal(false);
        resetRaffleForm();
        loadData();
      } else {
        setError(data.error || "Erro ao salvar sorteio");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar sorteio");
    }
  };

  // SORTEIO - Realizar sorteio
  const handleDrawRaffle = async (raffleId: string) => {
    if (
      !confirm(
        "Tem certeza que deseja realizar este sorteio? Esta ação não pode ser desfeita!"
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/raffles/${raffleId}/draw`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(
          `Sorteio realizado! Vencedor: ${data.data.winner.name} (Número ${data.data.winnerNumber})`
        );
        loadData();
      } else {
        setError(data.error || "Erro ao realizar sorteio");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao realizar sorteio");
    }
  };

  // ========== DEPÓSITOS ==========

  // APROVAR DEPÓSITO
  const handleApproveDeposit = async (depositId: string, userName: string) => {
    openConfirmModal(
      "Aprovar Depósito",
      `Tem certeza que deseja aprovar o depósito de ${userName}? Esta ação criará as quotas no sorteio.`,
      async () => {
        setError("");
        setSuccess("");

        try {
          const res = await fetch(`/api/deposits/${depositId}/approve`, {
            method: "PATCH",
          });

          const data = await res.json();

          if (data.success) {
            setSuccess(
              `Depósito de ${userName} aprovado com sucesso! ${data.data.quotas} quotas criadas.`
            );
            setShowDepositModal(false);
            setSelectedDeposit(null);
            loadData();
          } else {
            setError(
              data.error ||
                "Erro ao aprovar depósito. Por favor, tente novamente."
            );
          }
        } catch (err) {
          console.error(err);
          setError("Erro ao aprovar depósito. Por favor, tente novamente.");
        }
      }
    );
  };

  // REJEITAR DEPÓSITO
  const handleRejectDeposit = async (depositId: string, userName: string) => {
    openConfirmModal(
      "Rejeitar Depósito",
      `Tem certeza que deseja rejeitar o depósito de ${userName}?`,
      async () => {
        setError("");
        setSuccess("");

        try {
          const res = await fetch(`/api/deposits/${depositId}/reject`, {
            method: "PATCH",
          });

          const data = await res.json();

          if (data.success) {
            setSuccess(`Depósito de ${userName} rejeitado.`);
            setShowDepositModal(false);
            setSelectedDeposit(null);
            loadData();
          } else {
            setError(
              data.error ||
                "Erro ao rejeitar depósito. Por favor, tente novamente."
            );
          }
        } catch (err) {
          console.error(err);
          setError("Erro ao rejeitar depósito. Por favor, tente novamente.");
        }
      }
    );
  };

  // VER DETALHES DO DEPÓSITO
  const handleViewDeposit = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setShowDepositModal(true);
  };

  // ========== HELPERS ==========

  const resetSponsorForm = () => {
    setSponsorForm({
      name: "",
      slug: "",
      couponCode: "",
      logoUrl: "",
      isActive: true,
    });
    setEditingSponsor(null);
  };

  const resetRaffleForm = () => {
    setRaffleForm({
      sponsorId: "",
      title: "",
      description: "",
      skinName: "",
      skinImage: "",
      skinValue: "",
      startDate: "",
      endDate: "",
    });
    setEditingRaffle(null);
  };

  // Função para abrir modal de confirmação
  const openConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    setConfirmAction({ title, message, onConfirm });
    setShowConfirmModal(true);
  };

  // Função para confirmar ação
  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction.onConfirm();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  // Função para cancelar
  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: "bg-green-100 text-green-800",
      DRAWING: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-blue-100 text-blue-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    const labels = {
      ACTIVE: "Ativo",
      DRAWING: "Sorteando",
      COMPLETED: "Concluído",
      CANCELLED: "Cancelado",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getDepositStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    const labels = {
      PENDING: "Pendente",
      APPROVED: "Aprovado",
      REJECTED: "Rejeitado",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  // ================================================================================
  // RENDERIZAÇÃO PRINCIPAL
  // ================================================================================
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex flex-col h-screen">
        {/* ===== HEADER FIXO ===== */}
        <header className="bg-white/10 backdrop-blur-md rounded-2xl p-6 m-6 mb-0 border border-white/20 flex-shrink-0">
          <h1 className="text-3xl font-bold text-white mb-2">
            Painel Administrativo
          </h1>
          <p className="text-purple-200">
            Gerencie patrocinadores, sorteios e depósitos
          </p>
        </header>

        {/* ===== ALERTAS FIXOS ===== */}
        <div className="px-6 flex-shrink-0">
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mt-4 flex items-center gap-2">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-200">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mt-4 flex items-center gap-2">
              <Check className="text-green-400" size={20} />
              <p className="text-green-200">{success}</p>
            </div>
          )}
        </div>

        {/* ===== ABAS FIXAS ===== */}
        <div className="flex gap-2 px-6 mt-6 flex-shrink-0">
          {/* Patrocinadores */}
          <button
            onClick={() => setActiveTab("sponsors")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "sponsors"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-white/10 text-purple-200 hover:bg-white/20"
            }`}
          >
            <Package size={20} />
            Patrocinadores
          </button>
          {/* Sorteios */}
          <button
            onClick={() => setActiveTab("raffles")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "raffles"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-white/10 text-purple-200 hover:bg-white/20"
            }`}
          >
            <Gift size={20} />
            Sorteios
          </button>
          {/* Depósitos */}
          <button
            onClick={() => setActiveTab("deposits")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "deposits"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-white/10 text-purple-200 hover:bg-white/20"
            }`}
          >
            <CreditCard size={20} />
            Depósitos
          </button>
        </div>

        {/* ===== CONTEÚDO COM SCROLL ===== */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
              <p className="text-purple-200 mt-4">Carregando...</p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 h-full overflow-hidden">
              {activeTab === "sponsors" ? (
                <>
                  {/* Header Patrocinadores */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      Patrocinadores
                    </h2>
                    <button
                      onClick={() => {
                        resetSponsorForm();
                        setShowSponsorModal(true);
                      }}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Plus size={20} />
                      Novo Patrocinador
                    </button>
                  </div>

                  {/* Lista de patrocinadores */}
                  <div className="grid gap-4">
                    {sponsors.length === 0 ? (
                      <p className="text-purple-200 text-center py-8">
                        Nenhum patrocinador cadastrado
                      </p>
                    ) : (
                      sponsors.map((sponsor) => (
                        <div
                          key={sponsor.id}
                          className="bg-white/5 rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            {sponsor.logoUrl ? (
                              <Image
                                src={sponsor.logoUrl}
                                alt={sponsor.name}
                                width={64}
                                height={64}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-purple-600/50 rounded-lg flex items-center justify-center">
                                <Package
                                  size={32}
                                  className="text-purple-200"
                                />
                              </div>
                            )}
                            <div>
                              <h3 className="text-white font-bold text-lg">
                                {sponsor.name}
                              </h3>
                              <p className="text-purple-300 text-sm">
                                Cupom: {sponsor.couponCode}
                              </p>
                              <p className="text-purple-400 text-xs">
                                Slug: {sponsor.slug}
                              </p>
                            </div>
                          </div>
                          {/* Badge Ativo/Inativo */}
                          <div className="flex items-center gap-2">
                            {sponsor.isActive ? (
                              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                                Ativo
                              </span>
                            ) : (
                              <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm">
                                Inativo
                              </span>
                            )}
                          </div>
                          {/* Botões Editar/Deletar */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingSponsor(sponsor);
                                setSponsorForm({
                                  name: sponsor.name,
                                  slug: sponsor.slug,
                                  couponCode: sponsor.couponCode,
                                  logoUrl: sponsor.logoUrl || "",
                                  isActive: sponsor.isActive,
                                });
                                setShowSponsorModal(true);
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteSponsor(sponsor.id, sponsor.name)
                              }
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors"
                            >
                              Deletar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : activeTab === "raffles" ? (
                <>
                  {/* Header Sorteios */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Sorteios</h2>
                    <button
                      onClick={() => {
                        resetRaffleForm();
                        setShowRaffleModal(true);
                      }}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Plus size={20} />
                      Novo Sorteio
                    </button>
                  </div>

                  {/* Lista Sorteios */}
                  <div className="grid gap-4">
                    {raffles.length === 0 ? (
                      <p className="text-purple-200 text-center py-8">
                        Nenhum sorteio cadastrado
                      </p>
                    ) : (
                      raffles.map((raffle) => (
                        <div
                          key={raffle.id}
                          className="bg-white/5 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex gap-4">
                              {raffle.skinImage ? (
                                <Image
                                  src={raffle.skinImage}
                                  alt={raffle.skinName}
                                  width={64}
                                  height={64}
                                  className="w-20 h-20 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-purple-600/50 rounded-lg flex items-center justify-center">
                                  <Gift size={32} className="text-purple-200" />
                                </div>
                              )}
                              <div>
                                <h3 className="text-white font-bold text-lg">
                                  {raffle.title}
                                </h3>
                                <p className="text-purple-300 text-sm">
                                  {raffle.skinName}
                                </p>
                                <p className="text-purple-400 text-xs">
                                  Patrocinador: {raffle.sponsor.name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(raffle.status)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-purple-300 mb-1">
                                <DollarSign size={16} />
                                <span className="text-xs">Valor</span>
                              </div>
                              <p className="text-white font-bold">
                                R$ {raffle.skinValue.toFixed(2)}
                              </p>
                            </div>

                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-purple-300 mb-1">
                                <Users size={16} />
                                <span className="text-xs">Participantes</span>
                              </div>
                              <p className="text-white font-bold">
                                {raffle._count.entries}
                              </p>
                            </div>

                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-purple-300 mb-1">
                                <Calendar size={16} />
                                <span className="text-xs">Início</span>
                              </div>
                              <p className="text-white font-bold text-sm">
                                {new Date(raffle.startDate).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </p>
                            </div>

                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-purple-300 mb-1">
                                <Calendar size={16} />
                                <span className="text-xs">Término</span>
                              </div>
                              <p className="text-white font-bold text-sm">
                                {new Date(raffle.endDate).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </p>
                            </div>
                          </div>

                          {raffle.status === "ACTIVE" && (
                            <button
                              onClick={() => handleDrawRaffle(raffle.id)}
                              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors"
                            >
                              Realizar Sorteio
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col h-full">
                  {/* Header Depósitos + Filtros Fixos */}
                  <div className="shrink-0 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-white">
                        Depósitos
                      </h2>
                      <div className="flex gap-2">
                        <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">
                          Pendentes:{" "}
                          {
                            deposits.filter((d) => d.status === "PENDING")
                              .length
                          }
                        </span>
                        <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                          Aprovados:{" "}
                          {
                            deposits.filter((d) => d.status === "APPROVED")
                              .length
                          }
                        </span>
                      </div>
                    </div>

                    {/* Painel de Filtros */}
                    <div className="bg-white/5 rounded-lg p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Filtro por Status */}
                        <div>
                          <label className="text-purple-200 text-sm mb-1 block">
                            Status
                          </label>
                          <select
                            value={depositFilters.status}
                            onChange={(e) =>
                              setDepositFilters({
                                ...depositFilters,
                                status: e.target.value,
                              })
                            }
                            className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                          >
                            <option value="">Todos</option>
                            <option value="PENDING">Pendente</option>
                            <option value="APPROVED">Aprovado</option>
                            <option value="REJECTED">Rejeitado</option>
                          </select>
                        </div>

                        {/* Filtro por Usuário */}
                        <div>
                          <label className="text-purple-200 text-sm mb-1 block">
                            Usuário (nome ou email)
                          </label>
                          <input
                            type="text"
                            value={depositFilters.userName}
                            onChange={(e) =>
                              setDepositFilters({
                                ...depositFilters,
                                userName: e.target.value,
                              })
                            }
                            placeholder="Digite nome ou email..."
                            className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-purple-400"
                          />
                        </div>

                        {/* Filtro por Data Inicial */}
                        <div>
                          <label className="text-purple-200 text-sm mb-1 block">
                            Data Inicial
                          </label>
                          <input
                            type="date"
                            value={depositFilters.startDate}
                            onChange={(e) =>
                              setDepositFilters({
                                ...depositFilters,
                                startDate: e.target.value,
                              })
                            }
                            className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                          />
                        </div>

                        {/* Filtro por Data Final */}
                        <div>
                          <label className="text-purple-200 text-sm mb-1 block">
                            Data Final
                          </label>
                          <input
                            type="date"
                            value={depositFilters.endDate}
                            onChange={(e) =>
                              setDepositFilters({
                                ...depositFilters,
                                endDate: e.target.value,
                              })
                            }
                            className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                          />
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadData()}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
                        >
                          🔍 Filtrar
                        </button>
                        <button
                          onClick={() => {
                            clearFilters();
                            setTimeout(() => loadData(), 100);
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          🗑️ Limpar Filtros
                        </button>
                      </div>

                      {/* Contador de Resultados */}
                      <div className="text-purple-300 text-sm">
                        {deposits.length} depósito
                        {deposits.length !== 1 ? "s" : ""} encontrado
                        {deposits.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>

                  {/* Lista Depósitos com Scroll */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="grid gap-4 pr-2">
                      {deposits.length === 0 ? (
                        <p className="text-purple-200 text-center py-8">
                          Nenhum depósito encontrado
                        </p>
                      ) : (
                        deposits.map((deposit) => (
                          <div
                            key={deposit.id}
                            className="bg-white/5 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex gap-4 flex-1">
                                <div className="w-16 h-16 bg-purple-600/50 rounded-lg flex items-center justify-center">
                                  <CreditCard
                                    size={32}
                                    className="text-purple-200"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-white font-bold text-lg">
                                    {deposit.user.name}
                                  </h3>
                                  <p className="text-purple-300 text-sm">
                                    {deposit.user.email}
                                  </p>
                                  <p className="text-purple-400 text-xs">
                                    Sorteio: {deposit.raffle.title}
                                  </p>
                                  <p className="text-purple-400 text-xs">
                                    Patrocinador: {deposit.sponsor.name}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getDepositStatusBadge(deposit.status)}
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div className="bg-white/5 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-purple-300 mb-1">
                                  <DollarSign size={16} />
                                  <span className="text-xs">Valor</span>
                                </div>
                                <p className="text-white font-bold">
                                  R$ {deposit.amount.toFixed(2)}
                                </p>
                              </div>

                              <div className="bg-white/5 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-purple-300 mb-1">
                                  <Package size={16} />
                                  <span className="text-xs">Quotas</span>
                                </div>
                                <p className="text-white font-bold">
                                  {deposit.quotas}
                                </p>
                              </div>

                              <div className="bg-white/5 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-purple-300 mb-1">
                                  <Calendar size={16} />
                                  <span className="text-xs">Data</span>
                                </div>
                                <p className="text-white font-bold text-sm">
                                  {new Date(
                                    deposit.createdAt
                                  ).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewDeposit(deposit)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                              >
                                <Eye size={16} />
                                Ver Comprovante
                              </button>
                              {deposit.status === "PENDING" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleApproveDeposit(
                                        deposit.id,
                                        deposit.user.name
                                      )
                                    }
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                  >
                                    <CheckCircle size={16} />
                                    Aprovar
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectDeposit(
                                        deposit.id,
                                        deposit.user.name
                                      )
                                    }
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                  >
                                    <XCircle size={16} />
                                    Rejeitar
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Patrocinador */}
      {showSponsorModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              {editingSponsor ? "Editar Patrocinador" : "Novo Patrocinador"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-purple-200 text-sm mb-1 block">
                  Nome *
                </label>
                <input
                  type="text"
                  value={sponsorForm.name}
                  onChange={(e) =>
                    setSponsorForm({ ...sponsorForm, name: e.target.value })
                  }
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                  placeholder="Nome do patrocinador"
                />
              </div>

              <div>
                <label className="text-purple-200 text-sm mb-1 block">
                  Slug *
                </label>
                <input
                  type="text"
                  value={sponsorForm.slug}
                  onChange={(e) =>
                    setSponsorForm({ ...sponsorForm, slug: e.target.value })
                  }
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                  placeholder="slug-do-patrocinador"
                />
              </div>

              <div>
                <label className="text-purple-200 text-sm mb-1 block">
                  Código do Cupom *
                </label>
                <input
                  type="text"
                  value={sponsorForm.couponCode}
                  onChange={(e) =>
                    setSponsorForm({
                      ...sponsorForm,
                      couponCode: e.target.value,
                    })
                  }
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                  placeholder="CUPOM123"
                />
              </div>

              <div>
                <label className="text-purple-200 text-sm mb-1 block">
                  URL da Logo
                </label>
                <input
                  type="text"
                  value={sponsorForm.logoUrl}
                  onChange={(e) =>
                    setSponsorForm({
                      ...sponsorForm,
                      logoUrl: e.target.value,
                    })
                  }
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sponsorForm.isActive}
                  onChange={(e) =>
                    setSponsorForm({
                      ...sponsorForm,
                      isActive: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <label className="text-purple-200 text-sm">Ativo</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSponsorModal(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={
                  editingSponsor ? handleUpdateSponsor : handleCreateSponsor
                }
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
              >
                {editingSponsor ? "Atualizar" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sorteio */}
      {showRaffleModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/30 my-8">
            <h3 className="text-2xl font-bold text-white mb-4">Novo Sorteio</h3>

            <div className="space-y-4">
              <div>
                <label className="text-purple-200 text-sm mb-1 block">
                  Patrocinador *
                </label>
                <select
                  value={raffleForm.sponsorId}
                  onChange={(e) =>
                    setRaffleForm({
                      ...raffleForm,
                      sponsorId: e.target.value,
                    })
                  }
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Selecione...</option>
                  {sponsors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-purple-200 text-sm mb-1 block">
                  Título *
                </label>
                <input
                  type="text"
                  value={raffleForm.title}
                  onChange={(e) =>
                    setRaffleForm({ ...raffleForm, title: e.target.value })
                  }
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                  placeholder="Título do sorteio"
                />
              </div>

              <div>
                <label className="text-purple-200 text-sm mb-1 block">
                  Descrição
                </label>
                <textarea
                  value={raffleForm.description}
                  onChange={(e) =>
                    setRaffleForm({
                      ...raffleForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                  rows={3}
                  placeholder="Descrição do sorteio"
                />
              </div>

              <div>
                <label className="text-purple-200 text-sm mb-1 block">
                  Nome da Skin *
                </label>
                <input
                  type="text"
                  value={raffleForm.skinName}
                  onChange={(e) =>
                    setRaffleForm({ ...raffleForm, skinName: e.target.value })
                  }
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                  placeholder="Nome da skin"
                />
              </div>
              <div>
                <label className="text-purple-200 text-sm mb-1 block">
                  URL da Imagem
                </label>
                <input
                  type="text"
                  value={raffleForm.skinImage}
                  onChange={(e) =>
                    setRaffleForm({
                      ...raffleForm,
                      skinImage: e.target.value,
                    })
                  }
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-purple-200 text-sm mb-1 block">
                  Valor da Skin (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={raffleForm.skinValue}
                  onChange={(e) =>
                    setRaffleForm({
                      ...raffleForm,
                      skinValue: e.target.value,
                    })
                  }
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                  placeholder="100.00"
                />
              </div>

              <div>
                <label className="text-purple-200 text-sm mb-1 block">
                  Data de Início *
                </label>
                <input
                  type="datetime-local"
                  value={raffleForm.startDate}
                  onChange={(e) =>
                    setRaffleForm({
                      ...raffleForm,
                      startDate: e.target.value,
                    })
                  }
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-purple-200 text-sm mb-1 block">
                  Data de Término *
                </label>
                <input
                  type="datetime-local"
                  value={raffleForm.endDate}
                  onChange={(e) =>
                    setRaffleForm({ ...raffleForm, endDate: e.target.value })
                  }
                  className="w-full bg-white/10 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRaffleModal(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRaffle}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes do Depósito */}
      {showDepositModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full border border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              Detalhes do Depósito
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-purple-300 text-sm">Usuário</p>
                  <p className="text-white font-bold">
                    {selectedDeposit.user.name}
                  </p>
                  <p className="text-purple-400 text-xs">
                    {selectedDeposit.user.email}
                  </p>
                </div>
                <div>
                  <p className="text-purple-300 text-sm">Status</p>
                  {getDepositStatusBadge(selectedDeposit.status)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-purple-300 text-sm">Valor</p>
                  <p className="text-white font-bold">
                    R$ {selectedDeposit.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-purple-300 text-sm">Quotas</p>
                  <p className="text-white font-bold">
                    {selectedDeposit.quotas}
                  </p>
                </div>
                <div>
                  <p className="text-purple-300 text-sm">Data</p>
                  <p className="text-white font-bold text-sm">
                    {new Date(selectedDeposit.createdAt).toLocaleDateString(
                      "pt-BR"
                    )}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-purple-300 text-sm mb-2">Sorteio</p>
                <p className="text-white font-bold">
                  {selectedDeposit.raffle.title}
                </p>
                <p className="text-purple-400 text-xs">
                  {selectedDeposit.raffle.skinName}
                </p>
              </div>

              <div>
                <p className="text-purple-300 text-sm mb-2">Patrocinador</p>
                <p className="text-white font-bold">
                  {selectedDeposit.sponsor.name}
                </p>
              </div>

              <div>
                <p className="text-purple-300 text-sm mb-2">Comprovante</p>
                <Image
                  src={selectedDeposit.proofImage}
                  alt="Comprovante"
                  width={600}
                  height={400}
                  className="w-full rounded-lg border border-purple-500/30"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDepositModal(false);
                  setSelectedDeposit(null);
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors"
              >
                Fechar
              </button>
              {selectedDeposit.status === "PENDING" && (
                <>
                  <button
                    onClick={() => {
                      handleApproveDeposit(
                        selectedDeposit.id,
                        selectedDeposit.user.name
                      );
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => {
                      handleRejectDeposit(
                        selectedDeposit.id,
                        selectedDeposit.user.name
                      );
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Rejeitar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-60 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/30 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">
              {confirmAction.title}
            </h3>
            <p className="text-purple-200 mb-6">{confirmAction.message}</p>
            <div className="flex gap-4">
              <button
                onClick={handleCancelConfirm}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
