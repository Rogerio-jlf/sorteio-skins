"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "../../lib/auth-client";
import { z } from "zod";

import {
  FaUser,
  FaLock,
  FaBuilding,
  FaChartLine,
  FaUsers,
  FaFileInvoiceDollar,
  FaShieldAlt,
  FaClock,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaEye, FaEyeLowVision } from "react-icons/fa6";
import { HiSparkles } from "react-icons/hi2";
import { ButtonLoader } from "../../components/Loading";

// Schema de validação Zod
const signUpSchema = z.object({
  name: z
    .string()
    .min(9, "Nome deve conter, no mínimo 9 caracteres.")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter, apenas letras e espaços.")
    .transform((name) => {
      return name
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    }),
  email: z
    .string()
    .min(1, "E-mail é obrigatório.")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/,
      'E-mail deve conter, "@" seguido de domínio e extensão válida.'
    ),
  password: z
    .string()
    .min(8, "Senha deve conter, no mínimo 8 caracteres.")
    .regex(/[A-Z]/, "Senha deve conter, pelo menos uma letra maiúscula.")
    .regex(/[a-z]/, "Senha deve conter, pelo menos uma letra minúscula.")
    .regex(/[0-9]/, "Senha deve conter, pelo menos um número.")
    .regex(
      /[@$!%*?&#^()_+=\-[\]{}|\\:;"'<>,.\/]/,
      "Senha deve conter, no mínimo um caractere especial"
    ),
});

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export default function SignUpPage() {
  const router = useRouter();

  // ========================================
  // ESTADOS
  // ========================================
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [fieldValid, setFieldValid] = useState<{
    name?: boolean;
    email?: boolean;
    password?: boolean;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const [fullNameValue, setFullNameValue] = useState("");
  const [fullNameFocused, setFullNameFocused] = useState(false);

  const [emailValue, setEmailValue] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  // ========================================

  // Valida campo individual ao sair (onBlur)
  const handleFieldBlur = (
    fieldName: "name" | "email" | "password",
    value: string
  ) => {
    if (!value) return;

    const fieldSchema = z.object({
      [fieldName]: signUpSchema.shape[fieldName],
    });

    const validation = fieldSchema.safeParse({ [fieldName]: value });

    if (validation.success) {
      setFieldValid((prev) => ({ ...prev, [fieldName]: true }));
      setFieldErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    } else {
      setFieldValid((prev) => ({ ...prev, [fieldName]: false }));
      const errorMessage = validation.error.issues[0]?.message;
      setFieldErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));
    }
  };

  // Formata o nome enquanto digita
  const handleFullNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");

    const words = value.split(" ");
    const lowerCaseWords = ["e", "da", "das", "de", "di", "do", "dos"];

    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase();
      if (lowerCaseWords.includes(word) && i !== 0) {
        words[i] = word;
      } else if (word.length > 0) {
        words[i] = word.charAt(0).toUpperCase() + word.slice(1);
      }
    }

    const formattedValueFullName = words.join(" ");
    setFullNameValue(formattedValueFullName);
  };

  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailValue(e.target.value);
  };

  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordValue(e.target.value);
  };

  // ========================================
  // FUNÇÃO SUBMIT
  // ========================================
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validation = signUpSchema.safeParse(rawData);

    if (!validation.success) {
      const errors: { name?: string; email?: string; password?: string } = {};
      validation.error.issues.forEach((err) => {
        const field = err.path[0] as "name" | "email" | "password";
        if (!errors[field]) {
          errors[field] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    const res = await signUp.email({
      name: validation.data.name,
      email: validation.data.email,
      password: validation.data.password,
    });

    if (res.error) {
      setError(res.error.message || "Algo deu errado.");
      setIsLoading(false);
    } else {
      router.push("/painel");
    }
  }

  // ========================================
  // RENDERIZAÇÃO
  // ========================================
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex"
      style={{ backgroundImage: "url('/img-fundo-sign-in7.jpeg')" }}
    >
      {/* Overlay global com gradiente premium */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-blue-900/40"></div>

      {/* LADO ESQUERDO - SEÇÃO INFORMATIVA */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative">
        {/* Overlay adicional para melhorar legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 to-transparent"></div>

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col items-center justify-center text-white w-full px-8">
          <div className="max-w-xl space-y-8 flex flex-col items-center">
            {/* Branding Premium do Condomínio Godinho */}
            <div className="text-center space-y-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative inline-flex items-center justify-center p-6 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-3xl shadow-2xl border border-blue-400/30">
                  <FaBuilding className="text-blue-300" size={60} />
                  <div className="absolute -top-2 -right-2">
                    <HiSparkles
                      className="text-yellow-300 animate-pulse"
                      size={24}
                    />
                  </div>
                </div>
              </div>

              {/* Nome do Condomínio em destaque */}
              <div className="space-y-3">
                <div className="relative">
                  <h1 className="text-5xl font-black tracking-[0.3em] select-none text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white drop-shadow-2xl">
                    GODINHO
                  </h1>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-48 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-400/50"></div>
                  <p className="text-blue-200 tracking-[0.25em] font-bold select-none text-sm uppercase">
                    Condomínio
                  </p>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-400/50"></div>
                </div>
              </div>

              {/* Chamada de ação */}
              <div className="space-y-3 pt-4">
                <h2 className="text-4xl font-extrabold tracking-wider">
                  Seja Bem-Vindo!
                </h2>
                <p className="text-xl text-slate-300 font-semibold italic tracking-wide">
                  Junte-se à nossa comunidade exclusiva
                </p>
              </div>
            </div>

            {/* Badge de membros */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full backdrop-blur-sm">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center">
                    <FaUsers className="text-white text-xs" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white"></div>
                </div>
                <div className="text-left">
                  <p className="text-xs text-blue-100 font-bold tracking-wider">
                    +150 MORADORES
                  </p>
                  <p className="text-[10px] text-slate-300">
                    Cadastrados e ativos
                  </p>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
              <p className="text-lg text-slate-200 leading-relaxed text-center">
                Faça parte do{" "}
                <span className="font-bold text-blue-300">
                  Condomínio Godinho
                </span>{" "}
                e tenha acesso ao portal mais moderno e completo para gestão
                condominial. É rápido, seguro e totalmente gratuito!
              </p>
            </div>

            {/* Benefícios */}
            <div className="w-full space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">Vantagens Exclusivas</h3>
                <p className="text-sm text-slate-300 italic">
                  Tudo que você precisa em um só lugar
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-blue-400/50 hover:bg-white/15 transition-all group">
                  <div className="bg-gradient-to-br from-blue-500/30 to-blue-600/20 p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FaChartLine className="text-blue-300" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">
                      Controle Financeiro Total
                    </h4>
                    <p className="text-slate-300 text-sm">
                      Gerencie todas as receitas e despesas com relatórios
                      detalhados
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-blue-400/50 hover:bg-white/15 transition-all group">
                  <div className="bg-gradient-to-br from-blue-500/30 to-blue-600/20 p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FaFileInvoiceDollar className="text-blue-300" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">
                      Boletos Automatizados
                    </h4>
                    <p className="text-slate-300 text-sm">
                      Emissão e controle de boletos de forma simples e rápida
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-blue-400/50 hover:bg-white/15 transition-all group">
                  <div className="bg-gradient-to-br from-blue-500/30 to-blue-600/20 p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FaShieldAlt className="text-blue-300" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">
                      Segurança Certificada
                    </h4>
                    <p className="text-slate-300 text-sm">
                      Seus dados protegidos com criptografia de última geração
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-blue-400/50 hover:bg-white/15 transition-all group">
                  <div className="bg-gradient-to-br from-blue-500/30 to-blue-600/20 p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FaClock className="text-blue-300" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Acesso 24/7</h4>
                    <p className="text-slate-300 text-sm">
                      Gerencie tudo de qualquer lugar, a qualquer momento
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LADO DIREITO - FORMULÁRIO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative">
        {/* Overlay adicional para o lado do formulário */}
        <div className="absolute inset-0 bg-gradient-to-l from-slate-950/60 to-transparent"></div>

        <div className="w-full max-w-md relative z-10 px-6">
          {/* Card principal premium */}
          <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 flex flex-col gap-6 relative overflow-hidden">
            {/* Efeito de brilho sutil no topo */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

            {/* Header premium */}
            <header className="flex flex-col items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl animate-pulse"></div>
                <div className="relative inline-flex items-center justify-center p-5 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-2xl shadow-2xl border border-blue-400/30">
                  <FaBuilding className="text-blue-300" size={40} />
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <h1 className="text-3xl font-black tracking-[0.2em] select-none text-white">
                  CADASTRO
                </h1>
                <div className="flex items-center gap-2">
                  <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-400/50"></div>
                  <p className="text-slate-200 tracking-wider font-semibold select-none text-sm">
                    Portal Godinho
                  </p>
                  <div className="h-px w-8 bg-gradient-to-l from-transparent to-blue-400/50"></div>
                </div>
              </div>
            </header>

            {/* Mensagem de erro geral */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-400/50 rounded-xl backdrop-blur-sm">
                <p className="text-red-200 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Campo Nome */}
              <div className="flex flex-col gap-1.5">
                <div className="relative group">
                  <FaUser
                    className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-all ${
                      fullNameFocused
                        ? "text-blue-300 scale-110"
                        : "text-slate-300"
                    }`}
                    size={22}
                  />

                  <input
                    name="name"
                    type="text"
                    value={fullNameValue}
                    onChange={handleFullNameInput}
                    onFocus={() => setFullNameFocused(true)}
                    onBlur={(e) => {
                      setFullNameFocused(false);
                      handleFieldBlur("name", e.target.value);
                    }}
                    className={`w-full pl-14 pr-4 py-4 bg-white/10 tracking-wide font-semibold text-white text-base ${
                      fieldErrors.name
                        ? "border-2 border-red-400 shadow-lg shadow-red-500/20"
                        : fieldValid.name
                        ? "border-2 border-green-400 shadow-lg shadow-green-500/20"
                        : "border border-white/20 shadow-lg shadow-black/20"
                    } rounded-xl placeholder-transparent focus:outline-none focus:ring-2 ${
                      fieldErrors.name
                        ? "focus:ring-red-400/50"
                        : fieldValid.name
                        ? "focus:ring-green-400/50"
                        : "focus:ring-blue-400/50"
                    } focus:border-transparent transition-all peer backdrop-blur-sm`}
                  />

                  <label
                    htmlFor="name"
                    className={`absolute left-0 transition-all pointer-events-none font-semibold ${
                      fullNameFocused || fullNameValue
                        ? "-top-7 text-sm text-blue-200 tracking-wider"
                        : "top-1/2 -translate-y-1/2 pl-14 text-base text-slate-300 italic tracking-wide"
                    }`}
                  >
                    Nome Completo
                  </label>

                  {/* Efeito de brilho no hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-400/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
                {fieldErrors.name && (
                  <p className="text-xs text-red-300 tracking-wide select-none font-medium flex items-center gap-1.5 ml-1">
                    <span className="text-red-400">⚠</span> {fieldErrors.name}
                  </p>
                )}
                {fieldValid.name && !fieldErrors.name && (
                  <p className="text-xs text-green-300 tracking-wide select-none font-medium flex items-center gap-1.5 ml-1">
                    <span className="text-green-400">✓</span> Nome verificado
                  </p>
                )}
              </div>

              {/* Campo Email */}
              <div className="flex flex-col gap-1.5">
                <div className="relative group">
                  <MdEmail
                    className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-all ${
                      emailFocused
                        ? "text-blue-300 scale-110"
                        : "text-slate-300"
                    }`}
                    size={24}
                  />
                  <input
                    name="email"
                    type="email"
                    value={emailValue}
                    onChange={handleEmailInput}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={(e) => {
                      setEmailFocused(false);
                      handleFieldBlur("email", e.target.value);
                    }}
                    className={`w-full pl-14 pr-4 py-4 bg-white/10 tracking-wide font-semibold text-white text-base ${
                      fieldErrors.email
                        ? "border-2 border-red-400 shadow-lg shadow-red-500/20"
                        : fieldValid.email
                        ? "border-2 border-green-400 shadow-lg shadow-green-500/20"
                        : "border border-white/20 shadow-lg shadow-black/20"
                    } rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 ${
                      fieldErrors.email
                        ? "focus:ring-red-400/50"
                        : fieldValid.email
                        ? "focus:ring-green-400/50"
                        : "focus:ring-blue-400/50"
                    } focus:border-transparent transition-all peer backdrop-blur-sm`}
                  />

                  <label
                    htmlFor="email"
                    className={`absolute left-0 transition-all pointer-events-none font-semibold ${
                      emailFocused || emailValue
                        ? "-top-7 text-sm text-blue-200 tracking-wider"
                        : "top-1/2 -translate-y-1/2 pl-14 text-base text-slate-300 italic tracking-wide"
                    }`}
                  >
                    Email
                  </label>

                  {/* Efeito de brilho no hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-400/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-red-300 tracking-wide select-none font-medium flex items-center gap-1.5 ml-1">
                    <span className="text-red-400">⚠</span> {fieldErrors.email}
                  </p>
                )}
                {fieldValid.email && !fieldErrors.email && (
                  <p className="text-xs text-green-300 tracking-wide select-none font-medium flex items-center gap-1.5 ml-1">
                    <span className="text-green-400">✓</span> E-mail verificado
                  </p>
                )}
              </div>

              {/* Campo Senha */}
              <div className="flex flex-col gap-1.5">
                <div className="relative group">
                  <FaLock
                    className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-all ${
                      passwordFocused
                        ? "text-blue-300 scale-110"
                        : "text-slate-300"
                    }`}
                    size={22}
                  />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={passwordValue}
                    onFocus={() => setPasswordFocused(true)}
                    onChange={handlePasswordInput}
                    onBlur={(e) => {
                      setPasswordFocused(false);
                      handleFieldBlur("password", e.target.value);
                    }}
                    className={`w-full pl-14 pr-12 py-4 bg-white/10 tracking-wide font-semibold text-white text-base ${
                      fieldErrors.password
                        ? "border-2 border-red-400 shadow-lg shadow-red-500/20"
                        : fieldValid.password
                        ? "border-2 border-green-400 shadow-lg shadow-green-500/20"
                        : "border border-white/20 shadow-lg shadow-black/20"
                    } rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 ${
                      fieldErrors.password
                        ? "focus:ring-red-400/50"
                        : fieldValid.password
                        ? "focus:ring-green-400/50"
                        : "focus:ring-blue-400/50"
                    } focus:border-transparent transition-all peer backdrop-blur-sm`}
                  />

                  <label
                    htmlFor="password"
                    className={`absolute left-0 transition-all pointer-events-none font-semibold ${
                      passwordFocused || passwordValue
                        ? "-top-7 text-sm text-blue-200 tracking-wider"
                        : "top-1/2 -translate-y-1/2 pl-14 text-base text-slate-300 italic tracking-wide"
                    }`}
                  >
                    Senha
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-all z-10 p-1 rounded-lg hover:bg-white/10"
                  >
                    {showPassword ? (
                      <FaEyeLowVision
                        className={`cursor-pointer hover:scale-110 transition-all active:scale-95 ${
                          passwordFocused ? "text-blue-300" : "text-slate-300"
                        }`}
                        size={20}
                      />
                    ) : (
                      <FaEye
                        className={`cursor-pointer hover:scale-110 transition-all active:scale-95 ${
                          passwordFocused ? "text-blue-300" : "text-slate-300"
                        }`}
                        size={20}
                      />
                    )}
                  </button>

                  {/* Efeito de brilho no hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-400/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>

                {fieldErrors.password ? (
                  <p className="text-xs text-red-300 tracking-wide select-none font-medium flex items-center gap-1.5 ml-1">
                    <span className="text-red-400">⚠</span>{" "}
                    {fieldErrors.password}
                  </p>
                ) : fieldValid.password ? (
                  <p className="text-xs text-green-300 tracking-wide select-none font-medium flex items-center gap-1.5 ml-1">
                    <span className="text-green-400">✓</span> Senha verificada
                  </p>
                ) : (
                  <p className="text-xs text-slate-300 text-justify tracking-wide select-none font-medium leading-relaxed">
                    Senha deve conter no mínimo 8 caracteres, sendo uma letra
                    maiúscula, uma minúscula, um número e um caractere especial.
                  </p>
                )}
              </div>

              {/* Botão Submit Premium */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-lg text-white font-black tracking-wider p-4 rounded-xl hover:from-blue-500 hover:via-blue-400 hover:to-blue-500 transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
              >
                {/* Efeito de brilho animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

                <span className="relative z-10">
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <ButtonLoader size={20} />
                      Criando seu acesso...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FaShieldAlt />
                      Criar Minha Conta
                    </span>
                  )}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-white/20"></div>
              <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                ou
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/20 to-white/20"></div>
            </div>

            {/* Link para login */}
            <div className="text-center">
              <p className="text-slate-300 text-sm tracking-wide font-medium select-none">
                Já possui uma conta?{" "}
                <a
                  href="/sign-in"
                  className="text-blue-300 hover:text-white font-bold select-none underline decoration-blue-400/50 underline-offset-2 hover:decoration-white transition-all"
                >
                  Fazer login
                </a>
              </p>
            </div>

            {/* Features badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
              <div className="flex flex-col items-center gap-1 p-2">
                <FaChartLine className="text-blue-300" size={16} />
                <span className="text-[10px] text-slate-300 font-medium text-center leading-tight">
                  Relatórios
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2">
                <FaFileInvoiceDollar className="text-blue-300" size={16} />
                <span className="text-[10px] text-slate-300 font-medium text-center leading-tight">
                  Boletos
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2">
                <FaUsers className="text-blue-300" size={16} />
                <span className="text-[10px] text-slate-300 font-medium text-center leading-tight">
                  Comunicados
                </span>
              </div>
            </div>
          </div>

          {/* Footer aprimorado */}
          <footer className="text-center text-slate-300 text-xs tracking-wide select-none font-medium mt-6 space-y-2">
            <p>
              Ao criar uma conta, você concorda com nossos{" "}
              <a
                href="#"
                className="underline hover:text-white font-bold decoration-blue-400/50 hover:decoration-white transition-all"
              >
                Termos de Uso
              </a>{" "}
              e{" "}
              <a
                href="#"
                className="underline hover:text-white font-bold decoration-blue-400/50 hover:decoration-white transition-all"
              >
                Política de Privacidade
              </a>
            </p>
            <p className="text-slate-400 text-[10px] flex items-center justify-center gap-1">
              <FaShieldAlt size={10} />
              Ambiente protegido com criptografia de ponta a ponta
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
