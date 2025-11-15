"use client";

import { signIn } from "../../lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { ButtonLoader } from "../../components/Loading";
import {
  FaBuilding,
  FaChartLine,
  FaFileInvoiceDollar,
  FaLock,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";
import { FaEye, FaEyeLowVision } from "react-icons/fa6";
import { HiSparkles } from "react-icons/hi2";
import { MdEmail } from "react-icons/md";

// Schema de validação Zod
const signInSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório.")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/,
      'E-mail deve conter, "@" seguido de domínio e extensão válida.'
    ),
  password: z.string().min(1, "Senha é obrigatória."),
});

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export default function SignInPage() {
  const router = useRouter();

  // ========================================
  // ESTADOS
  // ========================================
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [fieldValid, setFieldValid] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const [emailValue, setEmailValue] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  // ========================================

  // Valida campo individual ao sair (onBlur)
  const handleFieldBlur = (fieldName: "email" | "password", value: string) => {
    if (!value) return;

    const fieldSchema = z.object({
      [fieldName]: signInSchema.shape[fieldName],
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
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validation = signInSchema.safeParse(rawData);

    if (!validation.success) {
      const errors: { email?: string; password?: string } = {};
      validation.error.issues.forEach((err) => {
        const field = err.path[0] as "email" | "password";
        if (!errors[field]) {
          errors[field] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    const res = await signIn.email({
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

  // =========================================
  // RENDERIZAÇÃO
  // =========================================
  return (
    <div
      className="min-h-screen flex bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/img-fundo-sign-in15.jpg')" }}
    >
      {/* ===== OVERLAY ===== */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-blue-900/40"></div>

      <div className="w-full flex items-center justify-end relative mr-96">
        <div className="w-full max-w-md relative z-10">
          {/* Card do formulário com efeito premium */}
          <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 flex flex-col gap-6 relative overflow-hidden">
            {/* Efeito de brilho sutil no topo */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

            {/* ===== HEADER ===== */}
            <header className="flex flex-col items-center gap-5 relative">
              {/* Logo com efeito de profundidade */}
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl animate-pulse"></div>
                <div className="relative inline-flex items-center justify-center p-5 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-2xl shadow-2xl border border-blue-400/30">
                  <FaBuilding className="text-blue-300" size={48} />
                  <div className="absolute -top-1 -right-1">
                    <HiSparkles
                      className="text-yellow-300 animate-pulse"
                      size={20}
                    />
                  </div>
                </div>
              </div>

              {/* Branding do Condomínio */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <h1 className="text-3xl font-black tracking-[0.3em] select-none text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white drop-shadow-lg">
                    GODINHO
                  </h1>
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-400/50"></div>
                  <p className="text-blue-200 tracking-[0.2em] font-bold select-none text-xs uppercase">
                    Condomínio
                  </p>
                  <div className="h-px w-8 bg-gradient-to-l from-transparent to-blue-400/50"></div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <FaShieldAlt className="text-blue-300" size={14} />
                  <p className="text-slate-200 tracking-wider font-semibold select-none text-base">
                    Portal Exclusivo do Morador
                  </p>
                </div>
              </div>
            </header>
            {/* ========== */}

            {/* ===== BADGE SITE SEGURO ===== */}
            <div className="flex justify-center -mt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <span className="text-xs text-blue-100 font-semibold tracking-wider uppercase">
                  Sistema Seguro
                </span>
              </div>
            </div>
            {/* ========== */}

            {/* Mensagem de erro geral */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-400/50 rounded-xl backdrop-blur-sm">
                <p className="text-red-200 text-sm tracking-wide font-medium">
                  {error}
                </p>
              </div>
            )}
            {/* ========== */}

            {/* ===== FORMULÁRIO ===== */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              {/* Campo Email */}
              <div className="gap-1.5 flex flex-col ">
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
                    Email do Morador
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
              {/* ===== */}

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
                    Senha de Acesso
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

                {fieldErrors.password && (
                  <p className="text-xs text-red-300 tracking-wide select-none font-medium flex items-center gap-1.5 ml-1">
                    <span className="text-red-400">⚠</span>{" "}
                    {fieldErrors.password}
                  </p>
                )}
                {fieldValid.password && !fieldErrors.password && (
                  <p className="text-xs text-green-300 tracking-wide select-none font-medium flex items-center gap-1.5 ml-1">
                    <span className="text-green-400">✓</span> Senha verificada
                  </p>
                )}
              </div>
              {/* ===== */}

              {/* Link Esqueci minha senha */}
              <div className="text-right -mt-2">
                <a
                  href="/forgot-password"
                  className="text-blue-300 hover:text-white text-sm font-semibold select-none underline decoration-blue-400/50 underline-offset-2 hover:decoration-white transition-all inline-flex items-center gap-1 group"
                >
                  <FaLock className="text-xs group-hover:scale-110 transition-transform" />
                  Esqueci minha senha
                </a>
              </div>
              {/* ===== */}

              {/* Botão Submit */}
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
                      Acessando Portal...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FaShieldAlt />
                      Acessar Portal
                    </span>
                  )}
                </span>
              </button>
            </form>
            {/* ========== */}

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-white/20"></div>
              <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                ou
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/20 to-white/20"></div>
            </div>
            {/* ========== */}

            {/* Link para cadastro */}
            <div className="text-center">
              <p className="text-slate-300 text-sm tracking-wide font-medium select-none">
                Novo morador?{" "}
                <a
                  href="/sign-up"
                  className="text-blue-300 hover:text-white font-bold select-none underline decoration-blue-400/50 underline-offset-2 hover:decoration-white transition-all"
                >
                  Solicite seu acesso
                </a>
              </p>
            </div>
            {/* ========== */}

            {/* Features badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
              <div className="flex flex-col items-center gap-1 p-2">
                <FaChartLine className="text-blue-300" size={16} />
                <span className="text-[10px] text-slate-300 font-medium text-center leading-tight">
                  Relatórios
                </span>
              </div>
              {/* ===== */}
              <div className="flex flex-col items-center gap-1 p-2">
                <FaFileInvoiceDollar className="text-blue-300" size={16} />
                <span className="text-[10px] text-slate-300 font-medium text-center leading-tight">
                  Boletos
                </span>
              </div>
              {/* ===== */}
              <div className="flex flex-col items-center gap-1 p-2">
                <FaUsers className="text-blue-300" size={16} />
                <span className="text-[10px] text-slate-300 font-medium text-center leading-tight">
                  Comunicados
                </span>
              </div>
            </div>
          </div>
          {/* ========== */}

          {/* ===== FOOTER ===== */}
          <footer className="text-center text-slate-300 text-xs tracking-wide select-none font-medium mt-6 space-y-2">
            <p>
              Ao entrar, você concorda com nossos{" "}
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
            {/* ===== */}
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
