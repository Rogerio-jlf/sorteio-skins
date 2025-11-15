"use client";

import { useState } from "react";
import { Trophy, Gift, Sparkles, Copy, Check } from "lucide-react";
import { LoginForm } from "../main-page/Sign_In_Form";
import { SignUpForm } from "../main-page/Sign_Up_Form";

interface Sponsor {
  name: string;
  logo: string;
  coupon: string;
  discount: string;
  description: string;
  link: string;
  color: string;
}

export default function MainPage() {
  const [copiedCode, setCopiedCode] = useState("");
  const [isLoginFormOpen, setIsLoginFormOpen] = useState(false);
  const [isSignUpFormOpen, setIsSignUpFormOpen] = useState(false);

  const handleToDoSignUp = () => {
    setIsLoginFormOpen(false);
    setIsSignUpFormOpen(true);
  };

  const handleToDoLogin = () => {
    setIsSignUpFormOpen(false);
    setIsLoginFormOpen(true);
  };

  const sponsors: Sponsor[] = [
    {
      name: "CSGo.net",
      logo: "🎮",
      coupon: "RAFFLE10",
      discount: "10% OFF",
      description: "Ganhe 10% de desconto em todos os casos",
      link: "https://csgo.net",
      color: "from-orange-500 to-red-600",
    },
    {
      name: "Nesha",
      logo: "💎",
      coupon: "NESHA15",
      discount: "15% OFF",
      description: "Use o cupom e ganhe 15% de bônus",
      link: "#",
      color: "from-purple-500 to-pink-600",
    },
  ];

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Modal de Login */}
      <LoginForm
        isOpenLoginForm={isLoginFormOpen}
        onCloseLoginForm={() => setIsLoginFormOpen(false)}
        onRegisterNow={handleToDoSignUp}
      />

      {/* Modal de Cadastro */}
      <SignUpForm
        isOpenSinUpForm={isSignUpFormOpen}
        onCloseSingUpForm={() => setIsSignUpFormOpen(false)}
        onToDoLogin={handleToDoLogin}
      />

      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-2xl font-bold bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Skin Raffle
            </h1>
          </div>
          <button
            onClick={() => setIsLoginFormOpen(true)}
            className="px-6 py-2 bg-linear-to-r from-yellow-500 to-orange-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all"
          >
            Entrar
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          <span className="text-yellow-400 font-semibold uppercase text-sm">
            Sorteios Diários
          </span>
          <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
        </div>

        <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Ganhe Skins
          <span className="block bg-linear-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Incríveis Todos os Dias
          </span>
        </h2>

        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Participe dos nossos sorteios exclusivos e concorra a skins raras de
          CS2. Use os cupons dos nossos patrocinadores para ter ainda mais
          chances!
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <button className="px-8 py-4 bg-linear-to-r from-yellow-500 to-orange-600 rounded-lg font-bold text-lg hover:shadow-xl hover:shadow-orange-500/50 transition-all flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Ver Sorteios
          </button>
          <button className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-lg transition-all">
            Como Funciona
          </button>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-3">Nossos Patrocinadores</h3>
          <p className="text-gray-400">
            Use os cupons exclusivos e ganhe descontos incríveis
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {sponsors.map((sponsor, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all hover:shadow-xl"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl">{sponsor.logo}</div>
                  <div>
                    <h4 className="text-2xl font-bold">{sponsor.name}</h4>
                    <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full font-bold text-sm">
                      {sponsor.discount}
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 mb-4">{sponsor.description}</p>

                <div className="bg-gray-900 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">
                        Código do Cupom:
                      </p>
                      <p className="text-xl font-mono font-bold text-yellow-400">
                        {sponsor.coupon}
                      </p>
                    </div>
                    <button
                      onClick={() => copyCoupon(sponsor.coupon)}
                      className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                      title="Copiar código"
                    >
                      {copiedCode === sponsor.coupon ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={`bg-linear-to-br ${sponsor.color} p-8 flex items-center justify-center relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="w-64 h-48 relative z-10 drop-shadow-2xl transform hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                  <svg
                    className="w-48 h-48"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="40"
                      y="60"
                      width="120"
                      height="80"
                      rx="8"
                      fill="url(#grad1)"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                    />
                    <rect
                      x="60"
                      y="40"
                      width="20"
                      height="40"
                      rx="4"
                      fill="url(#grad2)"
                    />
                    <rect
                      x="50"
                      y="140"
                      width="100"
                      height="20"
                      rx="4"
                      fill="url(#grad3)"
                    />
                    <circle
                      cx="120"
                      cy="100"
                      r="8"
                      fill="rgba(255,255,255,0.5)"
                    />
                    <line
                      x1="90"
                      y1="85"
                      x2="140"
                      y2="85"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                    />
                    <line
                      x1="90"
                      y1="100"
                      x2="140"
                      y2="100"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                    />
                    <line
                      x1="90"
                      y1="115"
                      x2="140"
                      y2="115"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                    />
                    <defs>
                      <linearGradient
                        id="grad1"
                        x1="40"
                        y1="60"
                        x2="160"
                        y2="140"
                      >
                        <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                        <stop offset="100%" stopColor="rgba(200,200,200,0.8)" />
                      </linearGradient>
                      <linearGradient
                        id="grad2"
                        x1="60"
                        y1="40"
                        x2="80"
                        y2="80"
                      >
                        <stop offset="0%" stopColor="rgba(150,150,150,0.9)" />
                        <stop offset="100%" stopColor="rgba(100,100,100,0.8)" />
                      </linearGradient>
                      <linearGradient
                        id="grad3"
                        x1="50"
                        y1="140"
                        x2="150"
                        y2="160"
                      >
                        <stop offset="0%" stopColor="rgba(100,100,100,0.9)" />
                        <stop offset="100%" stopColor="rgba(80,80,80,0.8)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              <div className="p-6 pt-4">
                <a
                  href={sponsor.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center py-3 bg-linear-to-r ${sponsor.color} rounded-lg font-semibold hover:shadow-lg transition-all`}
                >
                  Visitar Site
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
            <div className="text-4xl font-bold text-yellow-400 mb-2">1,234</div>
            <div className="text-gray-400">Skins Sorteadas</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
            <div className="text-4xl font-bold text-green-400 mb-2">5,678</div>
            <div className="text-gray-400">Participantes Ativos</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
            <div className="text-4xl font-bold text-purple-400 mb-2">$89k</div>
            <div className="text-gray-400">Valor em Prêmios</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-900/50 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-400">
          <p>© 2024 Skin Raffle. Todos os direitos reservados.</p>
          <p className="text-sm mt-2">Jogue com responsabilidade. +18</p>
        </div>
      </footer>
    </div>
  );
}
