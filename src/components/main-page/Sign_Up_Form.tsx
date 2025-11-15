"use client";

import { useState } from "react";
import { X, Lock, Eye, EyeOff, Mail, User, Sparkles } from "lucide-react";
import { z } from "zod";
import { signUp } from "../../lib/auth-client";

// Schema de validação Zod
const signUpSchemaZod = z
  .object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
    email: z
      .string()
      .min(1, "E-mail é obrigatório.")
      .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/,
        'E-mail deve conter "@" seguido de domínio e extensão válida.'
      ),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres.")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula.")
      .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula.")
      .regex(
        /[^a-zA-Z0-9]/,
        "Senha deve conter pelo menos um caractere especial."
      ),
    confirmPassword: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchemaZod>;

interface SignUpFormProps {
  isOpenSinUpForm: boolean;
  onCloseSingUpForm: () => void;
  onToDoLogin: () => void;
}

export function SignUpForm({
  isOpenSinUpForm,
  onCloseSingUpForm,
  onToDoLogin,
}: SignUpFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof SignUpFormData, string>>
  >({});
  const [fieldValid, setFieldValid] = useState<
    Partial<Record<keyof SignUpFormData, boolean>>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  const [nameValue, setNameValue] = useState("");
  const [nameFocused, setNameFocused] = useState(false);

  const [emailValue, setEmailValue] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  // Função para limpar o formulário
  const clearForm = () => {
    setNameValue("");
    setEmailValue("");
    setPasswordValue("");
    setConfirmPasswordValue("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError(null);
    setFieldErrors({});
    setFieldValid({});
    setIsLoading(false);
  };

  // Função para fechar e limpar
  const handleClose = () => {
    clearForm();
    onCloseSingUpForm();
  };

  // Valida campo individual ao sair (onBlur)
  const handleFieldBlur = (fieldName: keyof SignUpFormData, value: string) => {
    if (!value) return;

    // Para confirmPassword, precisamos validar com a senha atual
    if (fieldName === "confirmPassword") {
      const isValid = value === passwordValue;
      setFieldValid((prev) => ({ ...prev, confirmPassword: isValid }));
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: isValid ? undefined : "As senhas não coincidem.",
      }));
      return;
    }

    const fieldSchema = z.object({
      [fieldName]: signUpSchemaZod.shape[fieldName],
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
      name: nameValue,
      email: emailValue,
      password: passwordValue,
      confirmPassword: confirmPasswordValue,
    };

    const validation = signUpSchemaZod.safeParse(rawData);

    if (!validation.success) {
      const errors: Partial<Record<keyof SignUpFormData, string>> = {};
      validation.error.issues.forEach((err) => {
        const field = err.path[0] as keyof SignUpFormData;
        if (!errors[field]) {
          errors[field] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await signUp.email({
        name: validation.data.name,
        email: validation.data.email,
        password: validation.data.password,
      });

      if (res.error) {
        setError(res.error.message || "Algo deu errado.");
        setIsLoading(false);
      } else {
        clearForm();
        onCloseSingUpForm();
        alert("Cadastro realizado com sucesso!");
      }
    } catch (err) {
      console.error("SignUp error:", err);
      setError("Erro ao fazer cadastro. Tente novamente.");
      setIsLoading(false);
    }
  };

  if (!isOpenSinUpForm) return null;

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
        <div className="bg-linear-to-br from-green-500/10 via-emerald-500/5 to-green-600/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-green-400/30 p-8 flex flex-col gap-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-green-400/50 to-transparent"></div>

          {/* Header */}
          <header className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center p-4 bg-linear-to-br from-green-500/30 to-emerald-600/20 rounded-2xl shadow-2xl border border-green-400/30">
                <User className="text-green-300" size={40} />
                <div className="absolute -top-1 -right-1">
                  <Sparkles
                    className="text-green-300 animate-pulse"
                    size={18}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-linear-to-r from-white via-green-100 to-white drop-shadow-lg">
                SKIN RAFFLE
              </h1>
              <p className="text-green-200 tracking-wider font-bold text-sm uppercase">
                Criar Nova Conta
              </p>
            </div>
          </header>

          {/* Badge Site Seguro */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-xs text-green-100 font-semibold tracking-wider uppercase">
                Cadastro Seguro
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
          <div className="flex flex-col gap-5">
            {/* Campo Nome */}
            <div className="flex flex-col gap-1.5">
              <div className="relative group">
                <User
                  className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-all ${
                    nameFocused ? "text-green-300 scale-110" : "text-slate-300"
                  }`}
                  size={24}
                />
                <input
                  name="name"
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onFocus={() => setNameFocused(true)}
                  onBlur={(e) => {
                    setNameFocused(false);
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
                      : "focus:ring-green-400/50"
                  } focus:border-transparent transition-all backdrop-blur-sm`}
                />

                <label
                  className={`absolute left-0 transition-all pointer-events-none font-semibold ${
                    nameFocused || nameValue
                      ? "-top-7 text-sm text-green-200 tracking-wider"
                      : "top-1/2 -translate-y-1/2 pl-14 text-base text-slate-300 italic tracking-wide"
                  }`}
                >
                  Seu Nome Completo
                </label>
              </div>

              {fieldErrors.name && (
                <p className="text-xs text-red-300 tracking-wide font-medium flex items-center gap-1.5 ml-1">
                  <span className="text-red-400">⚠</span> {fieldErrors.name}
                </p>
              )}
              {fieldValid.name && !fieldErrors.name && (
                <p className="text-xs text-green-300 tracking-wide font-medium flex items-center gap-1.5 ml-1">
                  <span className="text-green-400">✓</span> Nome verificado
                </p>
              )}
            </div>

            {/* Campo Email */}
            <div className="flex flex-col gap-1.5">
              <div className="relative group">
                <Mail
                  className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-all ${
                    emailFocused ? "text-green-300 scale-110" : "text-slate-300"
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
                      : "focus:ring-green-400/50"
                  } focus:border-transparent transition-all backdrop-blur-sm`}
                />

                <label
                  className={`absolute left-0 transition-all pointer-events-none font-semibold ${
                    emailFocused || emailValue
                      ? "-top-7 text-sm text-green-200 tracking-wider"
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
                      ? "text-green-300 scale-110"
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
                      : "focus:ring-green-400/50"
                  } focus:border-transparent transition-all backdrop-blur-sm`}
                />

                <label
                  className={`absolute left-0 transition-all pointer-events-none font-semibold ${
                    passwordFocused || passwordValue
                      ? "-top-7 text-sm text-green-200 tracking-wider"
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
                        passwordFocused ? "text-green-300" : "text-slate-300"
                      }`}
                    />
                  ) : (
                    <Eye
                      className={`w-5 h-5 ${
                        passwordFocused ? "text-green-300" : "text-slate-300"
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

            {/* Campo Confirmar Senha */}
            <div className="flex flex-col gap-1.5">
              <div className="relative group">
                <Lock
                  className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-all ${
                    confirmPasswordFocused
                      ? "text-green-300 scale-110"
                      : "text-slate-300"
                  }`}
                  size={22}
                />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPasswordValue}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onChange={(e) => setConfirmPasswordValue(e.target.value)}
                  onBlur={(e) => {
                    setConfirmPasswordFocused(false);
                    handleFieldBlur("confirmPassword", e.target.value);
                  }}
                  className={`w-full pl-14 pr-12 py-4 bg-white/10 tracking-wide font-semibold text-white text-base ${
                    fieldErrors.confirmPassword
                      ? "border-2 border-red-400 shadow-lg shadow-red-500/20"
                      : fieldValid.confirmPassword
                      ? "border-2 border-green-400 shadow-lg shadow-green-500/20"
                      : "border border-white/20 shadow-lg shadow-black/20"
                  } rounded-xl placeholder-transparent focus:outline-none focus:ring-2 ${
                    fieldErrors.confirmPassword
                      ? "focus:ring-red-400/50"
                      : fieldValid.confirmPassword
                      ? "focus:ring-green-400/50"
                      : "focus:ring-green-400/50"
                  } focus:border-transparent transition-all backdrop-blur-sm`}
                />

                <label
                  className={`absolute left-0 transition-all pointer-events-none font-semibold ${
                    confirmPasswordFocused || confirmPasswordValue
                      ? "-top-7 text-sm text-green-200 tracking-wider"
                      : "top-1/2 -translate-y-1/2 pl-14 text-base text-slate-300 italic tracking-wide"
                  }`}
                >
                  Confirme sua Senha
                </label>

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-all z-10 p-1 rounded-lg hover:bg-white/10"
                >
                  {showConfirmPassword ? (
                    <EyeOff
                      className={`w-5 h-5 ${
                        confirmPasswordFocused
                          ? "text-green-300"
                          : "text-slate-300"
                      }`}
                    />
                  ) : (
                    <Eye
                      className={`w-5 h-5 ${
                        confirmPasswordFocused
                          ? "text-green-300"
                          : "text-slate-300"
                      }`}
                    />
                  )}
                </button>
              </div>

              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-300 tracking-wide font-medium flex items-center gap-1.5 ml-1">
                  <span className="text-red-400">⚠</span>{" "}
                  {fieldErrors.confirmPassword}
                </p>
              )}
              {fieldValid.confirmPassword && !fieldErrors.confirmPassword && (
                <p className="text-xs text-green-300 tracking-wide font-medium flex items-center gap-1.5 ml-1">
                  <span className="text-green-400">✓</span> Senhas coincidem
                </p>
              )}
            </div>

            {/* Botão Submit */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="relative w-full bg-linear-to-r from-green-600 via-emerald-500 to-green-600 text-lg text-white font-black tracking-wider p-4 rounded-xl hover:from-green-500 hover:via-emerald-400 hover:to-green-500 transition-all shadow-xl shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

              <span className="relative z-10">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Criando Conta...
                  </span>
                ) : (
                  "Criar Conta"
                )}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-white/20 to-white/20"></div>
            <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
              ou
            </span>
            <div className="flex-1 h-px bg-linear-to-l from-transparent via-white/20 to-white/20"></div>
          </div>

          {/* Link para login */}
          <div className="text-center">
            <p className="text-slate-300 text-sm tracking-wide font-medium">
              Já tem uma conta?{" "}
              <button
                onClick={onToDoLogin}
                className="text-green-300 hover:text-white font-bold underline decoration-green-400/50 underline-offset-2 hover:decoration-white transition-all"
              >
                Fazer login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
