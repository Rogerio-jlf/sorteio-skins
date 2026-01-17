// AdminPanel.tsx - Corrigido para usar as novas rotas RESTful

import {
    AlertCircle,
    ArrowBigRight,
    Calendar,
    Check,
    CheckCircle,
    CreditCard,
    DollarSign,
    Eye,
    Gift,
    Package,
    Pencil,
    Plus,
    RefreshCcw,
    Save,
    Trash2,
    Users,
    XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

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
    status: 'ACTIVE' | 'DRAWING' | 'COMPLETED' | 'CANCELLED';
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
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
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
    const [activeTab, setActiveTab] = useState<'sponsors' | 'raffles' | 'deposits'>('sponsors');
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [raffles, setRaffles] = useState<Raffle[]>([]);
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal states
    const [showSponsorModal, setShowSponsorModal] = useState(false);
    const [showRaffleModal, setShowRaffleModal] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
    const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
    const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Modal de confirmação
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    // Filtros de depósito
    const [depositFilters, setDepositFilters] = useState({
        status: '',
        userName: '',
        startDate: '',
        endDate: '',
    });

    // Form states
    const [sponsorForm, setSponsorForm] = useState({
        name: '',
        slug: '',
        couponCode: '',
        logoUrl: '',
        isActive: true,
    });

    const [raffleForm, setRaffleForm] = useState({
        sponsorId: '',
        title: '',
        description: '',
        skinName: '',
        skinImage: '',
        skinValue: '',
        startDate: '',
        endDate: '',
    });

    // Carregar dados
    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            if (activeTab === 'sponsors') {
                const res = await fetch('/api/sponsors');
                const data = await res.json();
                if (data.success) setSponsors(data.data);
            } else if (activeTab === 'raffles') {
                const res = await fetch('/api/raffles');
                const data = await res.json();
                if (data.success) setRaffles(data.data);
            } else if (activeTab === 'deposits') {
                // Construir query string com filtros
                const params = new URLSearchParams();
                if (depositFilters.status) params.append('status', depositFilters.status);
                if (depositFilters.userName) params.append('userName', depositFilters.userName);
                if (depositFilters.startDate) params.append('startDate', depositFilters.startDate);
                if (depositFilters.endDate) params.append('endDate', depositFilters.endDate);

                const queryString = params.toString();
                const url = `/api/admin/deposits${queryString ? `?${queryString}` : ''}`;

                const res = await fetch(url);
                const data = await res.json();
                if (data.success) setDeposits(data.data);
            }
        } catch {
            setError('Erro ao carregar dados');
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

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 5000); // 5 segundos

            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess('');
            }, 5000); // 5 segundos

            return () => clearTimeout(timer);
        }
    }, [success]);

    // Função para limpar filtros
    const clearFilters = () => {
        setDepositFilters({
            status: '',
            userName: '',
            startDate: '',
            endDate: '',
        });
    };

    // Função para formatar valor em moeda brasileira
    const formatCurrency = (value: string) => {
        // Remove tudo que não é número
        const numbers = value.replace(/\D/g, '');

        // Se não houver números, retorna vazio
        if (!numbers) return '';

        // Converte para número e divide por 100 para ter os centavos
        const amount = parseInt(numbers) / 100;

        // Formata no padrão brasileiro
        return amount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    const handleCurrencyChange = (e: { target: { value: string } }) => {
        const formatted = formatCurrency(e.target.value);
        setRaffleForm({
            ...raffleForm,
            skinValue: formatted,
        });
    };

    // Função para lidar com upload de imagem
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Verifica se é uma imagem
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione apenas arquivos de imagem');
                return;
            }

            // Converte a imagem para base64
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setRaffleForm({
                        ...raffleForm,
                        skinImage: reader.result,
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Função para lidar com upload de logo do patrocinador
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Verifica se é uma imagem
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione apenas arquivos de imagem');
                return;
            }

            // Converte a imagem para base64
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setSponsorForm({
                        ...sponsorForm,
                        logoUrl: reader.result,
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // ========== PATROCINADOR ==========

    // CRIAR PATROCINADOR
    const handleCreateSponsor = async () => {
        openConfirmModal(
            'Novo Patrocinador',
            'Tem certeza que deseja criar este patrocinador?',
            async () => {
                setError('');
                setSuccess('');
                setIsSaving(true);

                if (!sponsorForm.name || !sponsorForm.slug || !sponsorForm.couponCode) {
                    setError('Por favor, preencha todos os campos obrigatórios');
                    setIsSaving(false);
                    return;
                }

                try {
                    const res = await fetch('/api/sponsors', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(sponsorForm),
                    });

                    const data = await res.json();

                    if (data.success) {
                        setSuccess(`O Patrocinador "${sponsorForm.name}" foi criado com sucesso!`);
                        setShowSponsorModal(false);
                        resetSponsorForm();
                        loadData();
                    } else {
                        setError(
                            data.error ||
                                'Erro ao tentar criar patrocinador. Por favor, verifique os dados e tente novamente.'
                        );
                    }
                } catch (err) {
                    console.error(err);
                    setError(
                        'Erro ao tentar criar patrocinador. Por favor, verifique os dados e tente novamente.'
                    );
                } finally {
                    setIsSaving(false);
                }
            }
        );
    };
    // EDITAR PATROCINADOR
    const handleUpdateSponsor = async () => {
        openConfirmModal(
            'Editar Patrocinador',
            'Tem certeza que deseja editar este patrocinador?',
            async () => {
                setError('');
                setSuccess('');
                setIsSaving(true);

                if (!sponsorForm.name || !sponsorForm.slug || !sponsorForm.couponCode) {
                    setError('Por favor, preencha todos os campos obrigatórios');
                    setIsSaving(false);
                    return;
                }

                if (!editingSponsor) {
                    setError(
                        'Nenhum patrocinador foi selecionado para edição. Por favor, selecione um patrocinador e tente novamente.'
                    );
                    setIsSaving(false);
                    return;
                }

                try {
                    const res = await fetch(`/api/sponsors/${editingSponsor.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(sponsorForm),
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
                                'Erro ao tentar atualizar patrocinador. Por favor, verifique os dados e tente novamente.'
                        );
                    }
                } catch (err) {
                    console.error(err);
                    setError(
                        'Erro ao tentar atualizar patrocinador. Por favor, verifique os dados e tente novamente.'
                    );
                } finally {
                    setIsSaving(false);
                }
            }
        );
    };

    // DELETAR PATROCINADOR - ✅ CORRIGIDO
    const handleDeleteSponsor = async (sponsorId: string, sponsorName: string) => {
        openConfirmModal(
            'Excluir Patrocinador',
            'Tem certeza que deseja excluir este patrocinador? Esta ação não poderá ser desfeita!',
            async () => {
                setError('');
                setSuccess('');

                try {
                    // ✅ MUDANÇA: DELETE /api/sponsors/[id] em vez de DELETE /api/sponsors?id=
                    const res = await fetch(`/api/sponsors/${sponsorId}`, {
                        method: 'DELETE',
                    });

                    const data = await res.json();

                    if (data.success) {
                        setSuccess(`O Patrocinador ${sponsorName} foi excluído com sucesso!`);
                        loadData();
                    } else {
                        setError(
                            data.error ||
                                'Erro ao tentar excluir patrocinador. Por favor, verifique os dados e tente novamente.'
                        );
                    }
                } catch (err) {
                    console.error(err);
                    setError(
                        'Erro ao tentar excluir patrocinador. Por favor, verifique os dados e tente novamente.'
                    );
                }
            }
        );
    };

    // ========== SORTEIO ==========
    const handleSaveRaffle = async () => {
        setError('');
        setSuccess('');
        setIsSaving(true);

        if (
            !raffleForm.sponsorId ||
            !raffleForm.title ||
            !raffleForm.skinName ||
            !raffleForm.skinValue ||
            !raffleForm.startDate ||
            !raffleForm.endDate
        ) {
            setError('Preencha todos os campos obrigatórios');
            setIsSaving(false);
            return;
        }

        try {
            const res = await fetch('/api/raffles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...raffleForm,
                    skinValue: parseFloat(raffleForm.skinValue),
                }),
            });

            const data = await res.json();

            if (data.success) {
                setSuccess('Sorteio criado com sucesso!');
                setShowRaffleModal(false);
                resetRaffleForm();
                loadData();
            } else {
                setError(data.error || 'Erro ao salvar sorteio');
            }
        } catch (err) {
            console.error(err);
            setError('Erro ao salvar sorteio');
        } finally {
            setIsSaving(false);
        }
    };

    // SORTEIO - Realizar sorteio
    const handleDrawRaffle = async (raffleId: string) => {
        openConfirmModal(
            'Realizar Sorteio',
            'Tem certeza que deseja realizar este sorteio? Esta ação não poderá ser desfeita!',
            async () => {
                setError('');
                setSuccess('');

                try {
                    const res = await fetch(`/api/raffles/${raffleId}/draw`, {
                        method: 'POST',
                    });

                    const data = await res.json();

                    if (data.success) {
                        setSuccess(
                            `Sorteio realizado! Vencedor: ${data.data.winner.name} (Número ${data.data.winnerNumber})`
                        );
                        loadData();
                    } else {
                        setError(data.error || 'Erro ao realizar sorteio');
                    }
                } catch (err) {
                    console.error(err);
                    setError('Erro ao realizar sorteio');
                }
            }
        );
    };

    // ========== DEPÓSITOS ==========

    // APROVAR DEPÓSITO
    const handleApproveDeposit = async (depositId: string, userName: string) => {
        openConfirmModal(
            'Aprovar Depósito',
            `Tem certeza que deseja aprovar o depósito de ${userName}? Esta ação criará as quotas no sorteio.`,
            async () => {
                setError('');
                setSuccess('');

                try {
                    const res = await fetch(`/api/deposits/${depositId}/approve`, {
                        method: 'PATCH',
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
                            data.error || 'Erro ao aprovar depósito. Por favor, tente novamente.'
                        );
                    }
                } catch (err) {
                    console.error(err);
                    setError('Erro ao aprovar depósito. Por favor, tente novamente.');
                }
            }
        );
    };

    // REJEITAR DEPÓSITO
    const handleRejectDeposit = async (depositId: string, userName: string) => {
        openConfirmModal(
            'Rejeitar Depósito',
            `Tem certeza que deseja rejeitar o depósito de ${userName}?`,
            async () => {
                setError('');
                setSuccess('');

                try {
                    const res = await fetch(`/api/deposits/${depositId}/reject`, {
                        method: 'PATCH',
                    });

                    const data = await res.json();

                    if (data.success) {
                        setSuccess(`Depósito de ${userName} rejeitado.`);
                        setShowDepositModal(false);
                        setSelectedDeposit(null);
                        loadData();
                    } else {
                        setError(
                            data.error || 'Erro ao rejeitar depósito. Por favor, tente novamente.'
                        );
                    }
                } catch (err) {
                    console.error(err);
                    setError('Erro ao rejeitar depósito. Por favor, tente novamente.');
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
            name: '',
            slug: '',
            couponCode: '',
            logoUrl: '',
            isActive: true,
        });
        setEditingSponsor(null);
    };

    const resetRaffleForm = () => {
        setRaffleForm({
            sponsorId: '',
            title: '',
            description: '',
            skinName: '',
            skinImage: '',
            skinValue: '',
            startDate: '',
            endDate: '',
        });
        setEditingRaffle(null);
    };

    // Função para abrir modal de confirmação
    const openConfirmModal = (title: string, message: string, onConfirm: () => void) => {
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
            ACTIVE: 'bg-green-500 text-black',
            DRAWING: 'bg-yellow-500 text-black',
            COMPLETED: 'bg-blue-500 text-white',
            CANCELLED: 'bg-red-500 text-white',
        };
        const labels = {
            ACTIVE: 'Ativo',
            DRAWING: 'Sorteando',
            COMPLETED: 'Concluído',
            CANCELLED: 'Cancelado',
        };
        return (
            <span
                className={`rounded-full border px-4 py-0.5 text-xs font-bold tracking-wide select-none ${
                    styles[status as keyof typeof styles]
                }`}
            >
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    const getDepositStatusBadge = (status: string) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            APPROVED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800',
        };
        const labels = {
            PENDING: 'Pendente',
            APPROVED: 'Aprovado',
            REJECTED: 'Rejeitado',
        };
        return (
            <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
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
        <div className="flex min-h-screen flex-col bg-slate-900 p-6">
            <div className="mx-auto flex h-screen w-7xl flex-col gap-6">
                {/* ===== HEADER FIXO ===== */}
                <header className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="mb-1 text-3xl font-bold tracking-wider text-white select-none">
                                Painel Administrativo
                            </h1>
                            <p className="text-base font-medium tracking-wide text-white select-none">
                                Gerencie patrocinadores, sorteios e depósitos
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                openConfirmModal(
                                    'Sair do Sistema',
                                    'Tem certeza que deseja sair do painel administrativo?',
                                    async () => {
                                        try {
                                            const response = await fetch('/api/auth/sign-out', {
                                                method: 'POST',
                                                credentials: 'include',
                                            });

                                            const data = await response.json();

                                            if (data.success) {
                                                // Redirecionar para login
                                                window.location.href = '/login';
                                            } else {
                                                setError('Erro ao sair do sistema.');
                                            }
                                        } catch (error) {
                                            console.error('Erro ao fazer logout:', error);
                                            // Mesmo com erro, redirecionar (cookies foram limpos no servidor)
                                            window.location.href = '/login';
                                        }
                                    }
                                );
                            }}
                            className="flex cursor-pointer items-center gap-2 rounded-md bg-red-600 px-6 py-2 text-base font-semibold tracking-wide text-white shadow-md shadow-black transition-all hover:-translate-y-1 hover:bg-red-500 active:scale-95"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Sair
                        </button>
                    </div>
                </header>

                {/* ===== ALERTAS FIXOS ===== */}
                <div className="">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-500 bg-red-500/20 p-4">
                            <AlertCircle className="text-red-400" size={20} />
                            <p className="flex-1 text-red-200">{error}</p>
                            <button
                                onClick={() => setError('')}
                                className="rounded-lg p-1 text-red-400 transition-colors hover:bg-red-500/30 hover:text-red-300"
                                aria-label="Fechar alerta"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 rounded-lg border border-green-500 bg-green-500/20 p-4">
                            <Check className="text-green-400" size={20} />
                            <p className="flex-1 text-green-200">{success}</p>
                            <button
                                onClick={() => setSuccess('')}
                                className="rounded-lg p-1 text-green-400 transition-colors hover:bg-green-500/30 hover:text-green-300"
                                aria-label="Fechar alerta"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* ===== ABAS FIXAS ===== */}
                <div className="flex gap-4">
                    {/* Patrocinadores */}
                    <button
                        onClick={() => setActiveTab('sponsors')}
                        className={`flex items-center gap-2 rounded-md px-6 py-2 text-base font-semibold tracking-wider text-white shadow-md shadow-black transition-all ${
                            activeTab === 'sponsors'
                                ? '-translate-y-2 bg-purple-600'
                                : 'cursor-pointer bg-white/10 hover:-translate-y-1 hover:bg-white/20 active:scale-95'
                        }`}
                    >
                        <Package size={20} />
                        Patrocinadores
                    </button>

                    {/* Sorteios */}
                    <button
                        onClick={() => setActiveTab('raffles')}
                        className={`flex items-center gap-2 rounded-md px-6 py-2 text-base font-semibold tracking-wider text-white shadow-md shadow-black transition-all ${
                            activeTab === 'raffles'
                                ? '-translate-y-2 bg-purple-600'
                                : 'cursor-pointer bg-white/10 hover:-translate-y-1 hover:bg-white/20 active:scale-95'
                        }`}
                    >
                        <Gift size={20} />
                        Sorteios
                    </button>

                    {/* Depósitos */}
                    <button
                        onClick={() => setActiveTab('deposits')}
                        className={`flex items-center gap-2 rounded-md px-6 py-2 text-base font-semibold tracking-wider text-white shadow-md shadow-black transition-all ${
                            activeTab === 'deposits'
                                ? '-translate-y-2 bg-purple-600'
                                : 'cursor-pointer bg-white/10 hover:-translate-y-1 hover:bg-white/20 active:scale-95'
                        }`}
                    >
                        <CreditCard size={20} />
                        Depósitos
                    </button>
                </div>

                {/* ===== CONTEÚDO COM SCROLL ===== */}
                <div className="overflow-y-auto">
                    {loading ? (
                        <div className="py-12 text-center">
                            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-purple-400"></div>
                            <p className="mt-4 text-base font-medium tracking-wider text-purple-300">
                                Carregando...
                            </p>
                        </div>
                    ) : (
                        <div className="h-full overflow-hidden rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
                            {activeTab === 'sponsors' ? (
                                <>
                                    {/* Header Patrocinadores */}
                                    <div className="mb-6 flex items-center justify-between">
                                        <h2 className="text-2xl font-bold tracking-wider text-white select-none">
                                            Patrocinadores
                                        </h2>
                                        <button
                                            onClick={() => {
                                                resetSponsorForm();
                                                setShowSponsorModal(true);
                                            }}
                                            className="flex cursor-pointer items-center gap-3 rounded-md bg-purple-600 px-6 py-2 text-base font-semibold tracking-wide text-white shadow-md shadow-black transition-all hover:-translate-y-1 hover:bg-purple-500 active:scale-95"
                                        >
                                            <Plus size={20} />
                                            Novo Patrocinador
                                        </button>
                                    </div>

                                    {/* Lista de patrocinadores */}
                                    <div className="grid gap-4">
                                        {sponsors.length === 0 ? (
                                            <p className="py-8 text-center text-base tracking-wider text-purple-300 select-none">
                                                Nenhum patrocinador cadastrado
                                            </p>
                                        ) : (
                                            sponsors.map((sponsor) => (
                                                <div
                                                    key={sponsor.id}
                                                    className="flex items-center justify-between rounded-xl bg-white/10 px-6 py-4 shadow-md shadow-black"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        {sponsor.logoUrl ? (
                                                            <Image
                                                                src={sponsor.logoUrl}
                                                                alt={sponsor.name}
                                                                width={64}
                                                                height={64}
                                                                className="h-16 w-16 rounded-xl border border-purple-700 object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-purple-600/50">
                                                                <Package
                                                                    size={32}
                                                                    className="text-purple-300"
                                                                />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h3 className="text-lg font-bold tracking-widest text-white select-none">
                                                                {sponsor.name}
                                                            </h3>
                                                            <p className="text-sm font-medium tracking-wide text-purple-300 select-none">
                                                                Cupom: {sponsor.couponCode}
                                                            </p>
                                                            <p className="text-sm font-medium tracking-wide text-purple-300 select-none">
                                                                Slug: {sponsor.slug}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {/* Botões e Badge */}
                                                    <div className="flex items-center gap-20">
                                                        {/* Badge Ativo/Inativo */}
                                                        <div className="flex min-w-20 justify-center">
                                                            {sponsor.isActive ? (
                                                                <span className="rounded-full border border-green-700 bg-green-600 px-4 py-0.5 text-xs font-medium tracking-wide text-black select-none">
                                                                    Ativo
                                                                </span>
                                                            ) : (
                                                                <span className="rounded-full border border-red-700 bg-red-600 px-4 py-0.5 text-xs font-medium tracking-wide text-white select-none">
                                                                    Inativo
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingSponsor(sponsor);
                                                                    setSponsorForm({
                                                                        name: sponsor.name,
                                                                        slug: sponsor.slug,
                                                                        couponCode:
                                                                            sponsor.couponCode,
                                                                        logoUrl:
                                                                            sponsor.logoUrl || '',
                                                                        isActive: sponsor.isActive,
                                                                    });
                                                                    setShowSponsorModal(true);
                                                                }}
                                                                className="flex cursor-pointer items-center gap-2 rounded-md bg-purple-600 px-6 py-1 text-sm font-medium tracking-wide text-white shadow-md shadow-black transition-all hover:-translate-y-1 hover:bg-purple-500 active:scale-95"
                                                            >
                                                                <Pencil size={16} />
                                                                Editar
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteSponsor(
                                                                        sponsor.id,
                                                                        sponsor.name
                                                                    )
                                                                }
                                                                className="flex cursor-pointer items-center gap-2 rounded-md bg-red-600 px-6 py-1 text-sm font-medium tracking-wide text-white shadow-md shadow-black transition-all hover:-translate-y-1 hover:bg-red-500 active:scale-95"
                                                            >
                                                                <Trash2 size={16} />
                                                                Deletar
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            ) : activeTab === 'raffles' ? (
                                <>
                                    {/* Header Sorteios */}
                                    <div className="mb-6 flex items-center justify-between">
                                        <h2 className="text-2xl font-bold tracking-wider text-white select-none">
                                            Sorteios
                                        </h2>
                                        <button
                                            onClick={() => {
                                                resetRaffleForm();
                                                setShowRaffleModal(true);
                                            }}
                                            className="flex cursor-pointer items-center gap-2 rounded-md bg-purple-600 px-6 py-2 text-base font-medium tracking-wide text-white shadow-md shadow-black transition-all hover:-translate-y-1 hover:bg-purple-500 active:scale-95"
                                        >
                                            <Plus size={20} />
                                            Novo Sorteio
                                        </button>
                                    </div>

                                    {/* Lista Sorteios */}
                                    <div className="grid gap-4">
                                        {raffles.length === 0 ? (
                                            <p className="py-8 text-center text-base font-medium tracking-wider text-white select-none">
                                                Nenhum sorteio cadastrado
                                            </p>
                                        ) : (
                                            raffles.map((raffle) => (
                                                <div
                                                    key={raffle.id}
                                                    className="rounded-xl bg-white/10 p-6 shadow-md shadow-black"
                                                >
                                                    <div className="mb-6 flex items-start justify-between">
                                                        <div className="flex gap-6">
                                                            {raffle.skinImage ? (
                                                                <Image
                                                                    src={raffle.skinImage}
                                                                    alt={raffle.skinName}
                                                                    width={240}
                                                                    height={80}
                                                                    className="h-20 w-60 rounded-lg border border-white/20 bg-white/10 object-cover p-4"
                                                                />
                                                            ) : (
                                                                <div className="flex h-20 w-60 items-center justify-center rounded-lg border border-white/20 bg-white/10 p-4">
                                                                    <Gift
                                                                        size={32}
                                                                        className="text-purple-300"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h3 className="text-lg font-bold tracking-wider text-white select-none">
                                                                    {raffle.title}
                                                                </h3>
                                                                <p className="text-sm font-medium tracking-wider text-purple-300 select-none">
                                                                    Skin: {raffle.skinName}
                                                                </p>
                                                                <p className="text-sm font-medium tracking-wider text-purple-300 select-none">
                                                                    Patrocinador:{' '}
                                                                    {raffle.sponsor.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusBadge(raffle.status)}
                                                        </div>
                                                    </div>

                                                    <div className="mb-6 grid grid-cols-4 gap-4">
                                                        <div className="rounded-lg border border-white/20 bg-white/10 px-6 py-2">
                                                            <div className="mb-1 flex items-center gap-2">
                                                                <DollarSign
                                                                    size={16}
                                                                    className="text-purple-300"
                                                                />
                                                                <span className="text-sm font-medium tracking-wider text-purple-300 select-none">
                                                                    Valor
                                                                </span>
                                                            </div>
                                                            <p className="text-base font-bold tracking-wider text-white select-none">
                                                                R$ {raffle.skinValue.toFixed(2)}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-lg border border-white/20 bg-white/10 px-6 py-2">
                                                            <div className="mb-1 flex items-center gap-2">
                                                                <Users
                                                                    size={16}
                                                                    className="text-purple-300"
                                                                />
                                                                <span className="text-sm font-medium tracking-wider text-purple-300 select-none">
                                                                    Participantes
                                                                </span>
                                                            </div>
                                                            <p className="text-base font-bold tracking-wider text-white select-none">
                                                                {raffle._count.entries}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-lg border border-white/20 bg-white/10 px-6 py-2">
                                                            <div className="mb-1 flex items-center gap-2">
                                                                <Calendar
                                                                    size={16}
                                                                    className="text-purple-300"
                                                                />
                                                                <span className="text-sm font-medium tracking-wider text-purple-300 select-none">
                                                                    Início
                                                                </span>
                                                            </div>
                                                            <p className="text-base font-bold tracking-wider text-white select-none">
                                                                {new Date(
                                                                    raffle.startDate
                                                                ).toLocaleDateString('pt-BR')}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-lg border border-white/20 bg-white/10 px-6 py-2">
                                                            <div className="mb-1 flex items-center gap-2">
                                                                <Calendar
                                                                    size={16}
                                                                    className="text-purple-300"
                                                                />
                                                                <span className="text-sm font-medium tracking-wider text-purple-300 select-none">
                                                                    Término
                                                                </span>
                                                            </div>
                                                            <p className="text-base font-bold tracking-wider text-white select-none">
                                                                {new Date(
                                                                    raffle.endDate
                                                                ).toLocaleDateString('pt-BR')}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {raffle.status === 'ACTIVE' && (
                                                        <div className="flex justify-end">
                                                            <button
                                                                onClick={() =>
                                                                    handleDrawRaffle(raffle.id)
                                                                }
                                                                className="flex w-[250px] items-center justify-center gap-2 rounded-md bg-green-600 py-2 font-semibold text-black shadow-md shadow-black transition-all hover:-translate-y-1 hover:bg-green-500 active:scale-95"
                                                            >
                                                                <ArrowBigRight size={16} />
                                                                Realizar Sorteio
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex h-full flex-col">
                                    {/* Header Depósitos + Filtros Fixos */}
                                    <div className="mb-6 shrink-0">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h2 className="text-2xl font-bold text-white">
                                                Depósitos
                                            </h2>
                                            <div className="flex gap-2">
                                                <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm text-yellow-300">
                                                    Pendentes:{' '}
                                                    {
                                                        deposits.filter(
                                                            (d) => d.status === 'PENDING'
                                                        ).length
                                                    }
                                                </span>
                                                <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-300">
                                                    Aprovados:{' '}
                                                    {
                                                        deposits.filter(
                                                            (d) => d.status === 'APPROVED'
                                                        ).length
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        {/* Painel de Filtros */}
                                        <div className="space-y-4 rounded-lg bg-white/5 p-4">
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                                {/* Filtro por Status */}
                                                <div>
                                                    <label className="mb-1 block text-sm text-purple-200">
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
                                                        className="w-full rounded-lg border border-purple-500/30 bg-white/10 px-4 py-2 text-white"
                                                    >
                                                        <option value="">Todos</option>
                                                        <option value="PENDING">Pendente</option>
                                                        <option value="APPROVED">Aprovado</option>
                                                        <option value="REJECTED">Rejeitado</option>
                                                    </select>
                                                </div>

                                                {/* Filtro por Usuário */}
                                                <div>
                                                    <label className="mb-1 block text-sm text-purple-200">
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
                                                        className="w-full rounded-lg border border-purple-500/30 bg-white/10 px-4 py-2 text-white placeholder-purple-400"
                                                    />
                                                </div>

                                                {/* Filtro por Data Inicial */}
                                                <div>
                                                    <label className="mb-1 block text-sm text-purple-200">
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
                                                        className="w-full rounded-lg border border-purple-500/30 bg-white/10 px-4 py-2 text-white"
                                                    />
                                                </div>

                                                {/* Filtro por Data Final */}
                                                <div>
                                                    <label className="mb-1 block text-sm text-purple-200">
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
                                                        className="w-full rounded-lg border border-purple-500/30 bg-white/10 px-4 py-2 text-white"
                                                    />
                                                </div>
                                            </div>

                                            {/* Botões de Ação */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => loadData()}
                                                    className="rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-purple-700"
                                                >
                                                    🔍 Filtrar
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        clearFilters();
                                                        setTimeout(() => loadData(), 100);
                                                    }}
                                                    className="rounded-lg bg-white/10 px-6 py-2 text-white transition-colors hover:bg-white/20"
                                                >
                                                    🗑️ Limpar Filtros
                                                </button>
                                            </div>

                                            {/* Contador de Resultados */}
                                            <div className="text-sm text-purple-300">
                                                {deposits.length} depósito
                                                {deposits.length !== 1 ? 's' : ''} encontrado
                                                {deposits.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lista Depósitos com Scroll */}
                                    <div className="flex-1 overflow-y-auto">
                                        <div className="grid gap-4 pr-2">
                                            {deposits.length === 0 ? (
                                                <p className="py-8 text-center text-purple-200">
                                                    Nenhum depósito encontrado
                                                </p>
                                            ) : (
                                                deposits.map((deposit) => (
                                                    <div
                                                        key={deposit.id}
                                                        className="rounded-lg bg-white/5 p-4"
                                                    >
                                                        <div className="mb-3 flex items-start justify-between">
                                                            <div className="flex flex-1 gap-4">
                                                                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-purple-600/50">
                                                                    <CreditCard
                                                                        size={32}
                                                                        className="text-purple-200"
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h3 className="text-lg font-bold text-white">
                                                                        {deposit.user.name}
                                                                    </h3>
                                                                    <p className="text-sm text-purple-300">
                                                                        {deposit.user.email}
                                                                    </p>
                                                                    <p className="text-xs text-purple-400">
                                                                        Sorteio:{' '}
                                                                        {deposit.raffle.title}
                                                                    </p>
                                                                    <p className="text-xs text-purple-400">
                                                                        Patrocinador:{' '}
                                                                        {deposit.sponsor.name}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {getDepositStatusBadge(
                                                                    deposit.status
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="mb-3 grid grid-cols-3 gap-4">
                                                            <div className="rounded-lg bg-white/5 p-3">
                                                                <div className="mb-1 flex items-center gap-2 text-purple-300">
                                                                    <DollarSign size={16} />
                                                                    <span className="text-xs">
                                                                        Valor
                                                                    </span>
                                                                </div>
                                                                <p className="font-bold text-white">
                                                                    R$ {deposit.amount.toFixed(2)}
                                                                </p>
                                                            </div>

                                                            <div className="rounded-lg bg-white/5 p-3">
                                                                <div className="mb-1 flex items-center gap-2 text-purple-300">
                                                                    <Package size={16} />
                                                                    <span className="text-xs">
                                                                        Quotas
                                                                    </span>
                                                                </div>
                                                                <p className="font-bold text-white">
                                                                    {deposit.quotas}
                                                                </p>
                                                            </div>

                                                            <div className="rounded-lg bg-white/5 p-3">
                                                                <div className="mb-1 flex items-center gap-2 text-purple-300">
                                                                    <Calendar size={16} />
                                                                    <span className="text-xs">
                                                                        Data
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm font-bold text-white">
                                                                    {new Date(
                                                                        deposit.createdAt
                                                                    ).toLocaleDateString('pt-BR')}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    handleViewDeposit(deposit)
                                                                }
                                                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
                                                            >
                                                                <Eye size={16} />
                                                                Ver Comprovante
                                                            </button>
                                                            {deposit.status === 'PENDING' && (
                                                                <>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleApproveDeposit(
                                                                                deposit.id,
                                                                                deposit.user.name
                                                                            )
                                                                        }
                                                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-2 font-semibold text-white transition-colors hover:bg-green-700"
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
                                                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2 font-semibold text-white transition-colors hover:bg-red-700"
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

            {/* ========== MODAL PATROCINADOR ========== */}
            {showSponsorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="w-full max-w-md rounded-xl border border-white/10 bg-slate-800 px-6 py-4">
                        <h3 className="mb-6 text-2xl font-bold tracking-wider text-white select-none">
                            {editingSponsor ? 'Editar Patrocinador' : 'Novo Patrocinador'}
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="mb-1 block text-sm tracking-wider text-white select-none">
                                    Nome *
                                </label>
                                <input
                                    type="text"
                                    value={sponsorForm.name}
                                    onChange={(e) => {
                                        // Capitaliza a primeira letra de cada palavra
                                        const formatted = e.target.value
                                            .split(' ')
                                            .map(
                                                (word) =>
                                                    word.charAt(0).toUpperCase() +
                                                    word.slice(1).toLowerCase()
                                            )
                                            .join(' ');
                                        setSponsorForm({ ...sponsorForm, name: formatted });
                                    }}
                                    placeholder="Nome do patrocinador"
                                    className="w-full rounded-md bg-white/10 px-4 py-2 text-base font-medium tracking-wider text-white shadow-md shadow-black placeholder:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm tracking-wider text-white select-none">
                                    Slug *
                                </label>
                                <input
                                    type="text"
                                    value={sponsorForm.slug}
                                    onChange={(e) =>
                                        setSponsorForm({
                                            ...sponsorForm,
                                            slug: e.target.value.toLowerCase(),
                                        })
                                    }
                                    placeholder="slug-do-patrocinador"
                                    className="w-full rounded-md bg-white/10 px-4 py-2 text-base font-medium tracking-wider text-white shadow-md shadow-black placeholder:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm tracking-wider text-white select-none">
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
                                    placeholder="CUPOM123"
                                    className="w-full rounded-md bg-white/10 px-4 py-2 text-base font-medium tracking-wider text-white shadow-md shadow-black placeholder:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm tracking-wider text-white select-none">
                                    URL da Logo
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={sponsorForm.logoUrl}
                                        onChange={(e) =>
                                            setSponsorForm({
                                                ...sponsorForm,
                                                logoUrl: e.target.value,
                                            })
                                        }
                                        className="flex-1 rounded-md bg-white/10 px-4 py-2 text-base font-medium tracking-wider text-white shadow-md shadow-black placeholder:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                                        placeholder="https://... ou selecione um arquivo"
                                    />
                                    <label className="flex cursor-pointer items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-white shadow-md shadow-black transition-all hover:-translate-y-1 hover:bg-purple-500 active:scale-95">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                    </label>
                                </div>
                                {sponsorForm.logoUrl && (
                                    <div className="relative mt-2 inline-block">
                                        <img
                                            src={sponsorForm.logoUrl}
                                            alt="Preview"
                                            className="h-20 w-20 rounded-md border border-white/20 object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display =
                                                    'none';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSponsorForm({ ...sponsorForm, logoUrl: '' })
                                            }
                                            className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white shadow-md shadow-black transition-all hover:-translate-y-1 hover:bg-red-500 active:scale-95"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
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
                                    className="h-4 w-4 shadow-md shadow-black transition-all hover:scale-105 active:scale-105"
                                />
                                <label className="text-sm font-medium tracking-wider text-white select-none">
                                    Ativo
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-between gap-4">
                            <button
                                onClick={() => setShowSponsorModal(false)}
                                disabled={isSaving}
                                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-white/10 py-2 text-base font-medium tracking-wide text-white shadow-md shadow-black transition-all hover:-translate-y-1 hover:bg-white/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={editingSponsor ? handleUpdateSponsor : handleCreateSponsor}
                                disabled={isSaving}
                                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-purple-600 py-2 text-base font-medium tracking-wide text-white shadow-md shadow-black transition-all hover:-translate-y-1 hover:bg-purple-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        {editingSponsor ? 'Atualizando...' : 'Salvando...'}
                                    </>
                                ) : (
                                    <>
                                        {editingSponsor ? (
                                            <RefreshCcw size={16} />
                                        ) : (
                                            <Save size={16} />
                                        )}
                                        {editingSponsor ? 'Atualizar' : 'Salvar'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== MODAL SORTEIO ========== */}
            {showRaffleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
                    <div className="w-full max-w-md rounded-xl border border-white/20 bg-slate-800 px-6 py-4">
                        <h3 className="mb-6 text-2xl font-bold tracking-wider text-white select-none">
                            Novo Sorteio
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium tracking-wider text-white select-none">
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
                                    className="w-full cursor-pointer rounded-md bg-white/10 px-4 py-2 text-white shadow-md shadow-black focus:ring-1 focus:ring-purple-600 focus:outline-none active:scale-95"
                                >
                                    <option
                                        value=""
                                        className="text-sm font-semibold tracking-wide text-gray-500 select-none"
                                    >
                                        Selecione...
                                    </option>
                                    {sponsors.map((s) => (
                                        <option
                                            key={s.id}
                                            value={s.id}
                                            className="text-base font-medium tracking-wide text-black select-none"
                                        >
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium tracking-wider text-white select-none">
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    value={raffleForm.title}
                                    onChange={(e) =>
                                        setRaffleForm({
                                            ...raffleForm,
                                            title:
                                                e.target.value.charAt(0).toUpperCase() +
                                                e.target.value.slice(1),
                                        })
                                    }
                                    placeholder="Título do sorteio"
                                    className="w-full rounded-md bg-white/10 px-4 py-2 text-white shadow-md shadow-black placeholder:text-sm focus:ring-1 focus:ring-purple-600 focus:outline-none active:scale-95"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium tracking-wider text-white select-none">
                                    Descrição
                                </label>
                                <textarea
                                    value={raffleForm.description}
                                    // capitaliza a primeira letra da primeira palavra
                                    onChange={(e) =>
                                        setRaffleForm({
                                            ...raffleForm,
                                            description:
                                                e.target.value.charAt(0).toUpperCase() +
                                                e.target.value.slice(1),
                                        })
                                    }
                                    rows={3}
                                    placeholder="Descrição do sorteio"
                                    className="w-full rounded-md bg-white/10 px-4 py-2 text-white shadow-md shadow-black placeholder:text-sm focus:ring-1 focus:ring-purple-600 focus:outline-none active:scale-95"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium tracking-wider text-white select-none">
                                    Nome da Skin *
                                </label>
                                <input
                                    type="text"
                                    value={raffleForm.skinName}
                                    onChange={(e) =>
                                        setRaffleForm({
                                            ...raffleForm,
                                            skinName:
                                                e.target.value.charAt(0).toUpperCase() +
                                                e.target.value.slice(1),
                                        })
                                    }
                                    placeholder="Nome da skin"
                                    className="w-full rounded-md bg-white/10 px-4 py-2 text-white shadow-md shadow-black placeholder:text-sm focus:ring-1 focus:ring-purple-600 focus:outline-none active:scale-95"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium tracking-wider text-white select-none">
                                    URL da Imagem
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={raffleForm.skinImage}
                                        onChange={(e) =>
                                            setRaffleForm({
                                                ...raffleForm,
                                                skinImage: e.target.value,
                                            })
                                        }
                                        className="flex-1 rounded-md bg-white/10 px-4 py-2 text-white shadow-md shadow-black placeholder:text-sm focus:ring-1 focus:ring-purple-600 focus:outline-none active:scale-95"
                                        placeholder="https://... ou selecione um arquivo"
                                    />
                                    <label className="flex cursor-pointer items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-white shadow-md shadow-black transition-all hover:-translate-y-1 hover:bg-purple-500 active:scale-95">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                    </label>
                                </div>
                                {raffleForm.skinImage && (
                                    <div className="relative mt-2 inline-block">
                                        <img
                                            src={raffleForm.skinImage}
                                            alt="Preview"
                                            className="h-20 w-20 rounded-md border border-white/20 object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display =
                                                    'none';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setRaffleForm({ ...raffleForm, skinImage: '' })
                                            }
                                            className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white shadow-md shadow-black transition-all hover:-translate-y-1 hover:bg-red-500 active:scale-95"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium tracking-wider text-white select-none">
                                    Valor da Skin *
                                </label>
                                <input
                                    type="text"
                                    value={raffleForm.skinValue}
                                    onChange={handleCurrencyChange}
                                    className="w-full rounded-md bg-white/10 px-4 py-2 text-white shadow-md shadow-black placeholder:text-sm focus:ring-1 focus:ring-purple-600 focus:outline-none active:scale-95"
                                    placeholder="R$ 100,00"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium tracking-wider text-white select-none">
                                    Data de Início *
                                </label>
                                <input
                                    type="date"
                                    value={raffleForm.startDate}
                                    onChange={(e) =>
                                        setRaffleForm({
                                            ...raffleForm,
                                            startDate: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md bg-white/10 px-4 py-2 text-white shadow-md shadow-black placeholder:text-sm focus:ring-1 focus:ring-purple-600 focus:outline-none active:scale-95"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium tracking-wider text-white select-none">
                                    Data de Término *
                                </label>
                                <input
                                    type="date"
                                    value={raffleForm.endDate}
                                    onChange={(e) =>
                                        setRaffleForm({ ...raffleForm, endDate: e.target.value })
                                    }
                                    className="w-full rounded-md bg-white/10 px-4 py-2 text-white shadow-md shadow-black placeholder:text-sm focus:ring-1 focus:ring-purple-600 focus:outline-none active:scale-95"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex gap-4">
                            <button
                                onClick={() => setShowRaffleModal(false)}
                                disabled={isSaving}
                                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-white/10 py-2 text-base font-semibold tracking-wide text-white shadow-md shadow-black transition-all hover:-translate-y-1 hover:bg-white/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveRaffle}
                                disabled={isSaving}
                                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-purple-600 py-2 text-base font-semibold tracking-wide text-white shadow-md shadow-black transition-all hover:-translate-y-1 hover:bg-purple-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Salvar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== MODAL DETALHES DO DEPÓSITO ========== */}
            {showDepositModal && selectedDeposit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="w-full max-w-2xl rounded-2xl border border-purple-500/30 bg-slate-900 p-6">
                        <h3 className="mb-4 text-2xl font-bold text-white">Detalhes do Depósito</h3>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-purple-300">Usuário</p>
                                    <p className="font-bold text-white">
                                        {selectedDeposit.user.name}
                                    </p>
                                    <p className="text-xs text-purple-400">
                                        {selectedDeposit.user.email}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-purple-300">Status</p>
                                    {getDepositStatusBadge(selectedDeposit.status)}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-purple-300">Valor</p>
                                    <p className="font-bold text-white">
                                        R$ {selectedDeposit.amount.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-purple-300">Quotas</p>
                                    <p className="font-bold text-white">{selectedDeposit.quotas}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-purple-300">Data</p>
                                    <p className="text-sm font-bold text-white">
                                        {new Date(selectedDeposit.createdAt).toLocaleDateString(
                                            'pt-BR'
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 text-sm text-purple-300">Sorteio</p>
                                <p className="font-bold text-white">
                                    {selectedDeposit.raffle.title}
                                </p>
                                <p className="text-xs text-purple-400">
                                    {selectedDeposit.raffle.skinName}
                                </p>
                            </div>

                            <div>
                                <p className="mb-2 text-sm text-purple-300">Patrocinador</p>
                                <p className="font-bold text-white">
                                    {selectedDeposit.sponsor.name}
                                </p>
                            </div>

                            <div>
                                <p className="mb-2 text-sm text-purple-300">Comprovante</p>
                                <Image
                                    src={selectedDeposit.proofImage}
                                    alt="Comprovante"
                                    width={600}
                                    height={400}
                                    className="w-full rounded-lg border border-purple-500/30"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDepositModal(false);
                                    setSelectedDeposit(null);
                                }}
                                className="flex-1 rounded-lg bg-white/10 py-2 text-white transition-colors hover:bg-white/20"
                            >
                                Fechar
                            </button>
                            {selectedDeposit.status === 'PENDING' && (
                                <>
                                    <button
                                        onClick={() => {
                                            handleApproveDeposit(
                                                selectedDeposit.id,
                                                selectedDeposit.user.name
                                            );
                                        }}
                                        className="flex-1 rounded-lg bg-green-600 py-2 text-white transition-colors hover:bg-green-700"
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
                                        className="flex-1 rounded-lg bg-red-600 py-2 text-white transition-colors hover:bg-red-700"
                                    >
                                        Rejeitar
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ========== MODAL DE CONFIRMAÇÃO ========== */}
            {showConfirmModal && confirmAction && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80">
                    <div className="w-full max-w-md rounded-xl border border-white/20 bg-slate-800 p-6">
                        <h3 className="mb-6 text-center text-2xl font-bold tracking-wider text-white select-none">
                            {confirmAction.title}
                        </h3>
                        <p className="mb-6 text-base font-medium tracking-wider text-purple-300 select-none">
                            {confirmAction.message}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={handleCancelConfirm}
                                className="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-white/10 py-2 text-base font-medium tracking-wide text-white shadow-md shadow-black transition-all hover:-translate-y-1 hover:bg-white/20 active:scale-95"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 py-2 text-base font-medium tracking-wide text-white shadow-md shadow-black transition-all hover:-translate-y-1 hover:bg-purple-700 active:scale-95"
                            >
                                <Check size={16} />
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
