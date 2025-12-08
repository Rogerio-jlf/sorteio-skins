"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, X, Lock, Eye, EyeOff, Mail, Sparkles } from "lucide-react";
import { z } from "zod";
import { signIn } from "../../lib/auth-client";

// Schema de validação Zod
const signInSchemaZod = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório.")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/,
      'E-mail deve conter "@" seguido de domínio e extensão válida.'
    ),
  password: z.string().min(1, "Senha é obrigatória."),
});

type SignInFormData = z.infer<typeof signInSchemaZod>;

interface SignInFormProps {
  isOpenLoginForm: boolean;
  onCloseLoginForm: () => void;
  onRegisterNow: () => void;
}

export function LoginForm({
  isOpenLoginForm,
  onCloseLoginForm,
  onRegisterNow,
}: SignInFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof SignInFormData, string>>
  >({});
  const [fieldValid, setFieldValid] = useState<
    Partial<Record<keyof SignInFormData, boolean>>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  const [emailValue, setEmailValue] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);

  const router = useRouter();

  // Função para limpar o formulário
  const clearForm = () => {
    setEmailValue("");
    setPasswordValue("");
    setShowPassword(false);
    setError(null);
    setFieldErrors({});
    setFieldValid({});
    setIsLoading(false);
  };

  // Função para fechar e limpar o formulário
  const handleClose = () => {
    clearForm();
    onCloseLoginForm();
  };

  // Valida campo individual ao sair (onBlur)
  const handleFieldBlur = (fieldName: keyof SignInFormData, value: string) => {
    if (!value) return;

    const fieldSchema = z.object({
      [fieldName]: signInSchemaZod.shape[fieldName],
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

  // Função Submit
  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);
    setFieldErrors({});

    const rawData = {
      email: emailValue,
      password: passwordValue,
    };

    const validation = signInSchemaZod.safeParse(rawData);

    if (!validation.success) {
      const errors: Partial<Record<keyof SignInFormData, string>> = {};
      validation.error.issues.forEach((err) => {
        const field = err.path[0] as keyof SignInFormData;
        if (!errors[field]) {
          errors[field] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Fazer login
      const res = await signIn.email({
        email: validation.data.email,
        password: validation.data.password,
      });

      if (res.error) {
        setError(res.error.message || "Algo deu errado.");
        setIsLoading(false);
        return;
      }

      // 2. ✅ Verificar se é ADMIN após login bem-sucedido
      try {
        const meResponse = await fetch("/api/auth/me");
        const meData = await meResponse.json();

        if (meData.success && meData.user) {
          clearForm();
          onCloseLoginForm();

          // 3. Redirecionar baseado na role
          if (meData.user.isAdmin) {
            console.log(
              "✅ Admin detectado, redirecionando para /paginas/admin"
            );
            router.push("/paginas/admin");
          } else {
            console.log(
              "✅ Usuário comum, redirecionando para /paginas/dashboard"
            );
            router.push("/paginas/dashboard");
          }
        } else {
          // Se não conseguir pegar os dados do usuário, redireciona para dashboard
          clearForm();
          onCloseLoginForm();
          router.push("/paginas/dashboard");
        }
      } catch (meError) {
        console.error("Erro ao verificar role do usuário:", meError);
        // Em caso de erro, redireciona para dashboard por padrão
        clearForm();
        onCloseLoginForm();
        router.push("/paginas/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao fazer login. Tente novamente.");
      setIsLoading(false);
    }
  };

  if (!isOpenLoginForm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md relative">
        {/* Botão Fechar */}
        <button
          onClick={handleClose}
          className="absolute -top-4 -right-4 z-10 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-all shadow-lg"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Card do formulário */}
        <div className="bg-linear-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent"></div>

          {/* Header */}
          <header className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-xl animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center p-4 bg-linear-to-br from-yellow-500/30 to-orange-600/20 rounded-2xl shadow-2xl border border-yellow-400/30">
                <Trophy className="text-yellow-300" size={40} />
                <div className="absolute -top-1 -right-1">
                  <Sparkles
                    className="text-yellow-300 animate-pulse"
                    size={18}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-linear-to-r from-white via-yellow-100 to-white drop-shadow-lg">
                SKIN RAFFLE
              </h1>
              <p className="text-yellow-200 tracking-wider font-bold text-sm uppercase">
                Entrar na Plataforma
              </p>
            </div>
          </header>

          {/* Badge Site Seguro */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-xs text-green-100 font-semibold tracking-wider uppercase">
                Sistema Seguro
              </span>
            </div>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-400/50 rounded-xl backdrop-blur-sm">
              <p className="text-red-200 text-sm tracking-wide font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Formulário */}
          <form className="flex flex-col gap-6">
            {/* Campo Email */}
            <div className="flex flex-col gap-1.5">
              <div className="relative group">
                <Mail
                  className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-all ${
                    emailFocused
                      ? "text-yellow-300 scale-110"
                      : "text-slate-300"
                  }`}
                  size={24}
                />
                <input
                  name="email"
                  type="email"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
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
                  } rounded-xl placeholder-transparent focus:outline-none focus:ring-2 ${
                    fieldErrors.email
                      ? "focus:ring-red-400/50"
                      : fieldValid.email
                      ? "focus:ring-green-400/50"
                      : "focus:ring-yellow-400/50"
                  } focus:border-transparent transition-all backdrop-blur-sm`}
                />

                <label
                  className={`absolute left-0 transition-all pointer-events-none font-semibold ${
                    emailFocused || emailValue
                      ? "-top-7 text-sm text-yellow-200 tracking-wider"
                      : "top-1/2 -translate-y-1/2 pl-14 text-base text-slate-300 italic tracking-wide"
                  }`}
                >
                  Seu E-mail
                </label>
              </div>

              {fieldErrors.email && (
                <p className="text-xs text-red-300 tracking-wide font-medium flex items-center gap-1.5 ml-1">
                  <span className="text-red-400">⚠</span> {fieldErrors.email}
                </p>
              )}
              {fieldValid.email && !fieldErrors.email && (
                <p className="text-xs text-green-300 tracking-wide font-medium flex items-center gap-1.5 ml-1">
                  <span className="text-green-400">✓</span> E-mail verificado
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="flex flex-col gap-1.5">
              <div className="relative group">
                <Lock
                  className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-all ${
                    passwordFocused
                      ? "text-yellow-300 scale-110"
                      : "text-slate-300"
                  }`}
                  size={22}
                />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={passwordValue}
                  onFocus={() => setPasswordFocused(true)}
                  onChange={(e) => setPasswordValue(e.target.value)}
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
                  } rounded-xl placeholder-transparent focus:outline-none focus:ring-2 ${
                    fieldErrors.password
                      ? "focus:ring-red-400/50"
                      : fieldValid.password
                      ? "focus:ring-green-400/50"
                      : "focus:ring-yellow-400/50"
                  } focus:border-transparent transition-all backdrop-blur-sm`}
                />

                <label
                  className={`absolute left-0 transition-all pointer-events-none font-semibold ${
                    passwordFocused || passwordValue
                      ? "-top-7 text-sm text-yellow-200 tracking-wider"
                      : "top-1/2 -translate-y-1/2 pl-14 text-base text-slate-300 italic tracking-wide"
                  }`}
                >
                  Sua Senha
                </label>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-all z-10 p-1 rounded-lg hover:bg-white/10"
                >
                  {showPassword ? (
                    <EyeOff
                      className={`w-5 h-5 ${
                        passwordFocused ? "text-yellow-300" : "text-slate-300"
                      }`}
                    />
                  ) : (
                    <Eye
                      className={`w-5 h-5 ${
                        passwordFocused ? "text-yellow-300" : "text-slate-300"
                      }`}
                    />
                  )}
                </button>
              </div>

              {fieldErrors.password && (
                <p className="text-xs text-red-300 tracking-wide font-medium flex items-center gap-1.5 ml-1">
                  <span className="text-red-400">⚠</span> {fieldErrors.password}
                </p>
              )}
              {fieldValid.password && !fieldErrors.password && (
                <p className="text-xs text-green-300 tracking-wide font-medium flex items-center gap-1.5 ml-1">
                  <span className="text-green-400">✓</span> Senha verificada
                </p>
              )}
            </div>

            {/* Link Esqueci minha senha */}
            <div className="text-right -mt-2">
              <a
                href="#"
                className="text-yellow-300 hover:text-white text-sm font-semibold underline decoration-yellow-400/50 underline-offset-2 hover:decoration-white transition-all"
              >
                Esqueci minha senha
              </a>
            </div>

            {/* Botão Submit */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="relative w-full bg-linear-to-r from-yellow-600 via-orange-500 to-yellow-600 text-lg text-white font-black tracking-wider p-4 rounded-xl hover:from-yellow-500 hover:via-orange-400 hover:to-yellow-500 transition-all shadow-xl shadow-yellow-600/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

              <span className="relative z-10">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Entrando...
                  </span>
                ) : (
                  "Entrar"
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-white/20 to-white/20"></div>
            <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
              ou
            </span>
            <div className="flex-1 h-px bg-linear-to-l from-transparent via-white/20 to-white/20"></div>
          </div>

          {/* Link para cadastro */}
          <div className="text-center">
            <p className="text-slate-300 text-sm tracking-wide font-medium">
              Não tem conta?{" "}
              <button
                onClick={onRegisterNow}
                className="text-yellow-300 hover:text-white font-bold underline decoration-yellow-400/50 underline-offset-2 hover:decoration-white transition-all"
              >
                Cadastre-se agora
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
