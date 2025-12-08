"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Gift,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Users,
  ChevronDown,
  Calendar,
  Award,
  Zap,
  Shield,
  Heart,
  Youtube,
  Instagram,
} from "lucide-react";
import { LoginForm } from "./Sign_In_Form";
import { SignUpForm } from "./Sign_Up_Form";
import Image from "next/image";
import Link from "next/link";

export default function MainPage() {
  const [copiedCode, setCopiedCode] = useState<string>("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isLoginFormOpen, setIsLoginFormOpen] = useState(false);
  const [isSignUpFormOpen, setIsSignUpFormOpen] = useState(false);

  // Função para abrir formulário de login
  const handleToDoLogin = () => {
    setIsSignUpFormOpen(false);
    setIsLoginFormOpen(true);
  };
  // ==========

  // Função para abrir formulário de cadastro
  const handleToDoSignUp = () => {
    setIsLoginFormOpen(false);
    setIsSignUpFormOpen(true);
  };
  // ==========

  // Arrays de patrocinadores
  const patrocinador = [
    {
      name: "CSGO NET",
      coupon: "RAFFLE10",
      discount: "10% OFF",
      description: "Ganhe 10% de desconto em todos os casos e boxes exclusivos",
      link: "https://csgo.net",
      color: "from-orange-500 via-red-500 to-pink-600",
    },
    {
      name: "Nesha Store",
      coupon: "RAFFLE10",
      discount: "10% OFF",
      description: "Ganhe 10% de desconto em todos os casos e boxes exclusivos",
      link: "https://neshastore.com",
      color: "from-purple-600 via-pink-600 to-red-600",
    },
  ];
  // ==========

  // Arrays de sorteios ativos
  const activeRaffles = [
    {
      id: 1,
      name: "AK-47 | Redline",
      value: "R$ 45,00",
      participants: 1247,
      endTime: Date.now() + 3600000 * 24,
      rarity: "Classified",
      // color: "from-purple-500 to-pink-500",
      image: "/facas-1.webp",
    },
    {
      id: 2,
      name: "AWP | Dragon Lore",
      value: "R$ 2.150,00",
      participants: 3891,
      endTime: Date.now() + 3600000 * 48,
      rarity: "Covert",
      // color: "from-red-500 to-orange-500",
      image: "/facas-2.webp",
    },
    {
      id: 3,
      name: "Karambit | Fade",
      value: "R$ 850,00",
      participants: 2456,
      endTime: Date.now() + 3600000 * 12,
      rarity: "Covert",
      // color: "from-yellow-500 to-orange-500",
      image: "/facas-3.webp",
    },
  ];
  // ==========

  // Arrays de vencedores recentes
  const vencedorRecente = [
    {
      name: "Player***123",
      skin: "M4A4 | Howl",
      date: "Há 2 horas",
      value: "R$ 1.200",
    },
    {
      name: "CS***Pro",
      skin: "Butterfly Knife",
      date: "Há 5 horas",
      value: "R$ 950",
    },
    {
      name: "Gamer***XD",
      skin: "AK-47 | Fire Serpent",
      date: "Há 8 horas",
      value: "R$ 780",
    },
    {
      name: "Skin***Hunter",
      skin: "Glock-18 | Fade",
      date: "Há 1 dia",
      value: "R$ 420",
    },
  ];
  // ==========

  // Arrays de perguntas frequentes
  const faqs = [
    {
      question: "Como participar dos sorteios?",
      answer:
        "Basta criar uma conta gratuita, escolher o sorteio que deseja participar e clicar em 'Participar'. Você pode aumentar suas chances usando cupons dos nossos patrocinadores.",
    },
    {
      question: "É realmente grátis?",
      answer:
        "Sim! Todos os nossos sorteios são 100% gratuitos. Você não precisa pagar nada para participar. Ganhamos com nossos patrocinadores.",
    },
    {
      question: "Como recebo minha skin se ganhar?",
      answer:
        "Quando você ganha, enviamos a skin diretamente para seu inventário do Steam. O processo é automático e leva até 24 horas.",
    },
    {
      question: "Posso participar de múltiplos sorteios?",
      answer:
        "Sim! Você pode participar de quantos sorteios quiser simultaneamente. Quanto mais você participa, mais chances tem de ganhar.",
    },
    {
      question: "Os sorteios são justos?",
      answer:
        "Absolutamente! Usamos um sistema de seleção aleatória verificável. Todos os sorteios são transparentes e auditáveis.",
    },
  ];
  // ==========

  // Arrays de como funciona
  const howItWorks = [
    {
      step: 1,
      title: "Crie sua Conta",
      description: "Cadastro rápido e gratuito",
      icon: Users,
    },
    {
      step: 2,
      title: "Escolha o Sorteio",
      description: "Veja skins disponíveis",
      icon: Gift,
    },
    {
      step: 3,
      title: "Participe do Sorteio",
      description: "Faça sua inscrição",
      icon: Zap,
    },
    {
      step: 4,
      title: "Envio o Comprovante",
      description: "Confirme sua participação",
      icon: Shield,
    },
    {
      step: 5,
      title: "Aguarde o Resultado",
      description: "Anúncio em tempo real",
      icon: Trophy,
    },
  ];
  // ==========

  // Arrays de próximos sorteios
  const proximoSorteio = [
    { date: "16 Nov", skin: "Karambit | Tiger Tooth", value: "R$ 650,00" },
    { date: "17 Nov", skin: "M4A1-S | Hyper Beast", value: "R$ 85,00" },
    { date: "18 Nov", skin: "USP-S | Kill Confirmed", value: "R$ 120,00" },
    { date: "19 Nov", skin: "Glock-18 | Water Elemental", value: "R$ 25,00" },
  ];
  // ==========

  // Função para copiar cupom
  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };
  // ==========

  // Componente de contagem regressiva
  const CountdownTimer = ({ endTime }: { endTime: number }) => {
    const [timeLeft, setTimeLeft] = useState<string>("");

    useEffect(() => {
      const timer = setInterval(() => {
        const now = Date.now();
        const difference = endTime - now;

        if (difference > 0) {
          const hours = Math.floor(difference / (1000 * 60 * 60));
          const minutes = Math.floor(
            (difference % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft("Encerrado");
        }
      }, 1000);

      return () => clearInterval(timer);
    }, [endTime]);

    return <span>{timeLeft}</span>;
  };
  // ==========

  // ====================================================================================================
  // Renderização do Componente
  // ====================================================================================================
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Modal de Login */}
      <LoginForm
        isOpenLoginForm={isLoginFormOpen}
        onCloseLoginForm={() => setIsLoginFormOpen(false)}
        onRegisterNow={handleToDoSignUp}
      />
      {/* ===== */}

      {/* Modal de Cadastro */}
      <SignUpForm
        isOpenSinUpForm={isSignUpFormOpen}
        onCloseSingUpForm={() => setIsSignUpFormOpen(false)}
        onToDoLogin={handleToDoLogin}
      />
      {/* ===== */}

      {/* ========== HEADER ========== */}
      <header className="shadow-gray-400 shadow-md bg-black backdrop-blur-md sticky top-0 z-50">
        <div className="w-[1600px] mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 bg-linear-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Image
                src="/taruh-1.avif"
                alt="Logo Taruh"
                width={60}
                height={60}
                className="w-18 h-18 rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-4xl font-extrabold bg-linear-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent tracking-tighter select-none">
                  TARUH
                </h1>
                <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/50 rounded-md text-yellow-400 text-xs font-semibold tracking-widest select-none italic animate-pulse">
                  PRO
                </span>
              </div>
              <span className="text-base text-slate-300 font-semibold tracking-widest select-none italic">
                Skin Raffle
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLoginFormOpen(true)}
              className="px-6 py-2 bg-linear-to-r from-yellow-400 via-orange-500 to-red-600 rounded-md font-extrabold shadow-slate-400 shadow-sm text-xl hover:shadow-lg active:scale-95 hover:shadow-slate-400 transition-all hover:scale-110 text-black tracking-widest select-none"
            >
              Entrar
            </button>
          </div>
        </div>
      </header>
      {/* ===== */}

      {/* ========== HERO ========== */}
      <section className="w-[1600px] mx-auto py-20 text-center relative flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-4 mb-14">
          <Sparkles className="w-7 h-7 text-yellow-500 animate-pulse" />
          <span className="text-yellow-500 font-extrabold uppercase text-lg tracking-widest select-none">
            Sorteios Exclusivos
          </span>
          <Sparkles className="w-7 h-7 text-yellow-500 animate-pulse" />
        </div>

        <h2 className="text-7xl font-extrabold select-none tracking-widest text-white mb-2">
          Ganhe Skins
          <span className="block bg-linear-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent leading-tight">
            Incríveis para o seu jogo
          </span>
        </h2>

        <p className="text-xl text-gray-400 max-w-4xl mx-auto tracking-wider italic select-none font-semibold">
          Participe dos nossos sorteios exclusivos e concorra a skins raras. Use
          os cupons dos nossos{" "}
          <span className="bg-linear-to-r from-cyan-400 via-blue-500 to-cyan-600 bg-clip-text text-transparent text-3xl select-none font-extrabold tracking-widest">
            Patrocinadores
          </span>{" "}
          para ter ainda mais chances de ganhar!
        </p>
      </section>
      {/* ===== */}

      {/* ========== SORTEIOS ATIVOS ========== */}
      <section className="w-[1600px] mx-auto py-20">
        <div className="text-center flex flex-col gap-2 mb-14">
          <h3 className="text-5xl font-extrabold tracking-widest select-none text-white">
            Sorteios Ativos Agora
          </h3>
          <p className="text-gray-400 text-xl select-none tracking-widest font-semibold italic">
            Participe antes que acabe o tempo!
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {activeRaffles.map((raffle) => (
            <div
              key={raffle.id}
              className="bg-black rounded-2xl overflow-hidden shadow-cyan-500 shadow-lg"
            >
              <div className="relative h-70">
                <Image
                  src={raffle.image}
                  alt={raffle.name}
                  width={400}
                  height={200}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-linear-to-br opacity-20"></div>
                <div className="absolute top-4 right-5">
                  <span className="px-4 py-1.5 bg-cyan-500 rounded-full border border-cyan-700 text-xs font-bold text-black tracking-widest select-none italic">
                    {raffle.rarity}
                  </span>
                </div>
              </div>

              <div className="flex flex-col p-6 gap-10">
                <div className="flex flex-col">
                  <h4 className="text-2xl font-extrabold tracking-widest select-none text-white font-mono">
                    {raffle.name}
                  </h4>
                  <p className="text-3xl font-extrabold tracking-widest select-none italic text-yellow-500">
                    {raffle.value}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold select-none tracking-widest flex items-center gap-4">
                      <Users className="w-5 h-5" />
                      Participantes
                    </span>
                    <span className="text-white font-semibold select-none tracking-widest text-xl italic">
                      {raffle.participants.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold select-none tracking-widest flex items-center gap-4">
                      <Clock className="w-5 h-5" />
                      Termina em
                    </span>
                    <span className="text-orange-500 font-semibold select-none tracking-widest text-xl italic">
                      <CountdownTimer endTime={raffle.endTime} />
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button className=" py-2 px-6 bg-linear-to-r text-xl bg-cyan-500 rounded-md text-black transition-all hover:scale-110 hover:bg-cyan-500/70 cursor-pointer active:scale-95 tracking-widest font-extrabold">
                    Participar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* ===== */}

      {/* ========== VENCEDORES RECENTES ========== */}
      <section className="w-[1600px] mx-auto py-20 rounded-2xl">
        <div className="flex flex-col gap-2 text-center mb-14">
          <h3 className="text-5xl font-extrabold tracking-widest select-none text-white">
            Vencedores Recentes
          </h3>
          <p className="text-white text-xl tracking-widest font-semibold italic select-none">
            Pessoas reais ganhando skins reais!
          </p>
        </div>

        <div className="grid grid-cols-4 gap-8">
          {vencedorRecente.map((vencedor, index) => (
            <div
              key={index}
              className="flex flex-col gap-8 bg-linear-to-br from-gray-800 to-black rounded-xl p-6 border border-emerald-700 shadow-md shadow-emerald-500 hover:shadow-lg hover:shadow-emerald-500 transition-all hover:scale-103"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md shadow-emerald-400/30">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <p className="font-extrabold text-base tracking-widest select-none text-white">
                    {vencedor.name}
                  </p>
                  <p className="text-sm text-gray-400 tracking-widest select-none italic font-semibold">
                    {vencedor.date}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-2xl font-mono font-extrabold tracking-widest select-none text-amber-500">
                  {vencedor.skin}
                </p>
                <p className="text-2xl font-black tracking-widest select-none text-green-500 italic">
                  {vencedor.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* ===== */}

      {/* ========== COMO FUNCIONA ========== */}
      <section className="w-[1600px] mx-auto py-20">
        <div className="flex flex-col gap-2 text-center mb-14">
          <h3 className="text-5xl font-extrabold tracking-widest select-none text-white">
            Como Funciona
          </h3>
          <p className="text-gray-400 text-xl tracking-widest font-semibold italic select-none">
            Simples e rápido, em 4 passos
          </p>
        </div>

        <div className="grid grid-cols-5 gap-8">
          {howItWorks.map((item) => (
            <div key={item.step} className="text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 mx-auto bg-linear-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <div
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center border-2 border-yellow-500 mx-auto"
                  style={{ left: "calc(50% + 24px)" }}
                >
                  <span className="text-sm font-extrabold tracking-widest select-none text-yellow-500">
                    {item.step}
                  </span>
                </div>
              </div>

              <h4 className="text-xl font-extrabold tracking-widest select-none text-white">
                {item.title}
              </h4>
              <p className="text-gray-400 tracking-widest font-semibold italic select-none">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
      {/* ===== */}

      {/* ========== PRÓXIMOS SORTEIOS ========== */}
      <section className="w-[1800px] mx-auto py-20">
        <div className="flex flex-col gap-2 text-center mb-14">
          <h3 className="text-5xl font-extrabold tracking-widest select-none text-white">
            Próximos Sorteios
          </h3>
          <p className="text-gray-400 text-xl tracking-widest font-semibold italic select-none">
            Fique de olho no calendário!
          </p>
        </div>

        <div className="grid grid-cols-4 gap-8">
          {proximoSorteio.map((raffle, index) => (
            <div
              key={index}
              className="flex flex-col bg-linear-to-br from-gray-800 to-black rounded-xl p-6 border border-purple-700 shadow-md shadow-purple-500 hover:shadow-lg hover:shadow-purple-500 transition-all hover:scale-103"
            >
              <div className="flex items-center gap-3 mb-8">
                <Calendar className="w-6 h-6 text-purple-400" />
                <span className="text-sm font-extrabold tracking-widest select-none text-purple-400">
                  {raffle.date}
                </span>
              </div>
              <p className="text-xl font-mono font-extrabold tracking-widest select-none text-white mb-1">
                {raffle.skin}
              </p>
              <p className="text-2xl font-extrabold tracking-widest select-none text-yellow-500 italic">
                {raffle.value}
              </p>
            </div>
          ))}
        </div>
      </section>
      {/* ===== */}

      {/* ========== PATROCINADORES ========== */}
      <section className="w-[1300px] mx-auto py-20">
        <div className="flex flex-col gap-2 text-center mb-14">
          <h3 className="text-5xl font-extrabold tracking-widest select-none text-white">
            Nossos Patrocinadores
          </h3>
          <p className="text-gray-400 text-xl tracking-widest font-semibold italic select-none">
            Use os cupons exclusivos e ganhe descontos incríveis
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {patrocinador.map((patrocinador, index) => (
            <div
              key={index}
              className="bg-linear-to-br from-gray-800 to-black rounded-xl shadow-lg shadow-gray-500 border border-gray-700 transition-all"
            >
              <div className="p-6">
                <h4 className="text-3xl font-extrabold tracking-widest select-none text-white mb-1">
                  {patrocinador.name}
                </h4>
                <p className="text-gray-400 font-semibold italic tracking-widest select-none mb-8">
                  {patrocinador.description}
                </p>

                <div
                  className={`inline-block px-6 py-2 bg-linear-to-r ${patrocinador.color} rounded-xl font-extrabold tracking-widest select-none text-2xl text-white mb-8 animate-pulse shadow-md shadow-gray-500`}
                >
                  {patrocinador.discount}
                </div>

                <div className="bg-black rounded-xl border border-cyan-700 p-6 mb-8 shadow-md shadow-cyan-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 tracking-widest select-none font-semibold">
                        CUPOM
                      </p>
                      <p className="text-3xl font-mono font-extrabold select-none text-yellow-500">
                        {patrocinador.coupon}
                      </p>
                    </div>
                    <button
                      onClick={() => copyCoupon(patrocinador.coupon)}
                      title="Copiar Cupom"
                      className={`cursor-pointer p-4 rounded-md  active:scale-95 animate-pulse transition-all ${
                        copiedCode === patrocinador.coupon
                          ? "bg-green-500 scale-110"
                          : "bg-gray-800 hover:bg-gray-600"
                      }`}
                    >
                      {copiedCode === patrocinador.coupon ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Copy className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </div>

                <Link
                  href={patrocinador.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center justify-center gap-3 py-4 bg-linear-to-r ${patrocinador.color} rounded-md font-extrabold tracking-widest select-none text-xl shadow-md shadow-gray-500 transition-all hover:scale-102 active:scale-95 cursor-pointer`}
                >
                  Visitar Site
                  <ExternalLink className="w-5 h-5 transition-transform group-hover:rotate-12 group-hover:scale-110" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* ===== */}

      {/* ========== PERGUNTAS FREQUENTES ========== */}
      <section className="w-[900px] mx-auto py-20">
        <div className="flex flex-col gap-2 text-center mb-14">
          <h3 className="text-5xl font-extrabold tracking-widest select-none text-white">
            Perguntas Frequentes
          </h3>
          <p className="text-gray-400 text-xl tracking-widest select-none font-semibold italic">
            Tire suas dúvidas
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-linear-to-br from-gray-800 to-black rounded-xl border border-gray-700 shadow-md shadow-gray-500 hover:scale-105 active:scale-97 transition-all"
            >
              <button
                onClick={() =>
                  setExpandedFaq(expandedFaq === index ? null : index)
                }
                className="w-full cursor-pointer p-6 flex items-center justify-between text-left transition-all"
              >
                <span className="font-bold text-lg">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform text-white ${
                    expandedFaq === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedFaq === index && (
                <div className="bg-linear-to-br from-gray-800 to-black p-6">
                  <p className="text-gray-400 tracking-widest select-none font-semibold italic text-base">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      {/* ===== */}

      {/* ========== ESTATÍSTICAS ========== */}
      <section className="w-[1600px] mx-auto py-20">
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-linear-to-br from-gray-800 to-black rounded-xl p-8 text-center border border-gray-700 hover:border-yellow-500 transition-all">
            <div className="text-5xl font-extrabold tracking-widest select-none text-yellow-500 mb-1">
              1.234
            </div>
            <div className="text-gray-400 text-xl tracking-widest select-none font-semibold italic">
              Skins Sorteadas
            </div>
          </div>
          <div className="bg-linear-to-br from-gray-800 to-black rounded-xl p-8 text-center border border-gray-700 hover:border-green-500 transition-all">
            <div className="text-5xl font-extrabold tracking-widest select-none text-green-500 mb-1">
              5.678
            </div>
            <div className="text-gray-400 text-xl tracking-widest select-none font-semibold italic">
              Participantes Ativos
            </div>
          </div>
          <div className="bg-linear-to-br from-gray-800 to-black rounded-xl p-8 text-center border border-gray-700 hover:border-purple-500 transition-all">
            <div className="text-5xl font-extrabold tracking-widest select-none text-purple-500 mb-1">
              R$ 89k
            </div>
            <div className="text-gray-400 text-xl tracking-widest select-none font-semibold italic">
              Valor em Prêmios
            </div>
          </div>
        </div>
      </section>
      {/* ===== */}

      {/* ========== BADGES DE CONFIANÇA ========== */}
      <section className="w-[1300px] mx-auto py-20">
        <div className="grid grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center">
            <Shield className="w-12 h-12 text-green-500 mb-4" />
            <p className="font-extrabold tracking-widest select-none text-white text-lg">
              100% Seguro
            </p>
            <p className="text-sm text-gray-400 tracking-widest select-none font-semibold italic">
              Proteção SSL
            </p>
          </div>

          <div className="flex flex-col items-center">
            <Zap className="w-12 h-12 text-yellow-500 mb-4" />
            <p className="font-extrabold tracking-widest select-none text-white text-lg">
              Entrega Rápida
            </p>
            <p className="text-sm text-gray-400 tracking-widest select-none font-semibold italic">
              Até 24 horas
            </p>
          </div>

          <div className="flex flex-col items-center">
            <Heart className="w-12 h-12 text-red-500 mb-4" />
            <p className="font-extrabold tracking-widest select-none text-white text-lg">
              Suporte 24/7
            </p>
            <p className="text-sm text-gray-400 tracking-widest select-none font-semibold italic">
              Sempre disponível
            </p>
          </div>

          <div className="flex flex-col items-center">
            <Award className="w-12 h-12 text-purple-500 mb-4" />
            <p className="font-extrabold tracking-widest select-none text-white text-lg">
              Verificado
            </p>
            <p className="text-sm text-gray-400 tracking-widest select-none font-semibold italic">
              Sistema justo
            </p>
          </div>
        </div>
      </section>
      {/* ===== */}

      {/* ========== CARD FINAL ========== */}
      <section className="w-[1300px] mx-auto py-20">
        <div className="bg-linear-to-r from-yellow-500 to-orange-600 rounded-xl p-12 text-center">
          <h3 className="text-5xl text-white font-extrabold tracking-widest select-none mb-2">
            Pronto para Ganhar Skins?
          </h3>
          <p className="text-xl text-gray-800 font-semibold italic tracking-widest select-none mb-14">
            Junte-se a milhares de jogadores e comece a participar agora!
          </p>
          <button className="px-12 py-4 bg-black hover:bg-black/70 rounded-xl text-xl text-white font-extrabold tracking-widest select-none transition-all hover:scale-103 active:scale-95 cursor-pointer">
            Criar Conta Grátis
          </button>
        </div>
      </section>
      {/* ===== */}

      {/* ========== FOOTER ========== */}
      <footer className=" border-t border-gray-700 bg-black py-10">
        <div className="flex justify-center items-center w-[1600px] mx-auto mb-10">
          <div className="grid grid-cols-4 gap-60 mb-8">
            <div>
              <h4 className="text-lg text-white font-extrabold tracking-widest select-none mb-2">
                Sobre
              </h4>
              <ul className="space-y-2 text-sm text-gray-400 font-semibold italic tracking-widest select-none">
                <li className="hover:scale-110 transition-all">
                  <a href="#" className="hover:text-white transition-colors">
                    Quem Somos
                  </a>
                </li>
                <li className="hover:scale-110 transition-all">
                  <a href="#" className="hover:text-white transition-colors">
                    Como Funciona
                  </a>
                </li>
                <li className="hover:scale-110 transition-all">
                  <a href="#" className="hover:text-white transition-colors">
                    Termos de Uso
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg text-white font-extrabold tracking-widest select-none mb-2">
                Suporte
              </h4>
              <ul className="space-y-2 text-sm text-gray-400 font-semibold italic tracking-widest select-none">
                <li className="hover:scale-110 transition-all">
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li className="hover:scale-110 transition-all">
                  <a href="#" className="hover:text-white transition-colors">
                    Contato
                  </a>
                </li>
                <li className="hover:scale-110 transition-all">
                  <a href="#" className="hover:text-white transition-colors">
                    Ajuda
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg text-white font-extrabold tracking-widest select-none mb-2">
                Legal
              </h4>
              <ul className="space-y-2 text-sm text-gray-400 font-semibold italic tracking-widest select-none">
                <li className="hover:scale-110 transition-all">
                  <a href="#" className="hover:text-white transition-colors">
                    Privacidade
                  </a>
                </li>
                <li className="hover:scale-110 transition-all">
                  <a href="#" className="hover:text-white transition-colors">
                    Cookies
                  </a>
                </li>
                <li className="hover:scale-110 transition-all">
                  <a href="#" className="hover:text-white transition-colors">
                    Regulamento
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg text-white font-extrabold tracking-widest select-none mb-2">
                Redes Sociais
              </h4>
              <ul className="space-y-4 text-sm text-gray-400 font-semibold italic tracking-widest select-none">
                <li>
                  <a href="#" className="flex items-center gap-5 group">
                    <div className="w-8 h-8 bg-[#FF0000] rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                      <Youtube className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-400 group-hover:text-white transition-all group-hover:scale-110">
                      YouTube
                    </span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-5 group">
                    <div className="w-8 h-8 bg-linear-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                      <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-400 group-hover:text-white transition-all group-hover:scale-110">
                      Instagram
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-400 font-semibold italic tracking-widest select-none">
          &copy; {new Date().getFullYear()} Skin Raffle. Todos os direitos
          reservados.
        </div>
      </footer>
      {/* ===== */}
    </div>
  );
}
