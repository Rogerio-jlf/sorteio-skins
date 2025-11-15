// src/components/deposit-form.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Ticket,
} from "lucide-react";
import { formatCurrency } from "../lib/utils/format";
import { calculateQuotas } from "../lib/utils/ticket-generator";
import { QUOTA_VALUE } from "../lib/constants";
import Image from "next/image";

interface DepositFormProps {
  raffle: {
    id: string;
    sponsor: {
      id: string;
      name: string;
      couponCode: string;
    };
  };
  userId: string;
}

export default function DepositForm({ raffle, userId }: DepositFormProps) {
  const [amount, setAmount] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountNum = parseFloat(amount) || 0;
  const quotas = calculateQuotas(amountNum);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Arquivo muito grande. Máximo 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Apenas imagens são permitidas");
        return;
      }

      setProofFile(file);
      setError(null);

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validações
    if (!amount || amountNum < QUOTA_VALUE) {
      setError(`O valor mínimo é ${formatCurrency(QUOTA_VALUE)}`);
      return;
    }

    if (!proofFile) {
      setError("Por favor, envie o comprovante do depósito");
      return;
    }

    setLoading(true);

    try {
      // Upload da imagem (você precisará implementar isso)
      // Por enquanto, vamos simular com base64
      const proofImage = previewUrl || "";

      const response = await fetch("/api/deposits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          sponsorId: raffle.sponsor.id,
          raffleId: raffle.id,
          amount: amountNum,
          proofImage,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao processar depósito");
      }

      setSuccess(true);
      setAmount("");
      setProofFile(null);
      setPreviewUrl(null);

      // Recarregar a página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Erro ao enviar depósito");
      } else {
        setError(String(err) || "Erro ao enviar depósito");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Depósito Enviado!
            </h3>
            <p className="text-gray-400 mb-4">
              Seu depósito está em análise. Você receberá suas quotas assim que
              for aprovado.
            </p>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {quotas} quota{quotas > 1 ? "s" : ""} gerada
              {quotas > 1 ? "s" : ""}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Participar do Sorteio</CardTitle>
        <CardDescription className="text-gray-400">
          Faça seu depósito e ganhe quotas para concorrer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informação do Cupom */}
          <div className="bg-blue-600/10 border border-blue-600/50 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-2">
              Use o cupom no site {raffle.sponsor.name}:
            </p>
            <div className="flex items-center justify-between bg-gray-700/50 rounded px-3 py-2">
              <span className="font-mono font-bold text-blue-400 text-lg">
                {raffle.sponsor.couponCode}
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(raffle.sponsor.couponCode);
                }}
              >
                Copiar
              </Button>
            </div>
          </div>

          {/* Valor do Depósito */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white">
              Valor Depositado
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={QUOTA_VALUE}
                placeholder={`Mínimo ${formatCurrency(QUOTA_VALUE)}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
            {amountNum >= QUOTA_VALUE && (
              <div className="flex items-center gap-2 text-sm">
                <Ticket className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400">
                  Você receberá{" "}
                  <span className="font-bold text-white">{quotas}</span> quota
                  {quotas > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* Upload do Comprovante */}
          <div className="space-y-2">
            <Label htmlFor="proof" className="text-white">
              Comprovante do Depósito
            </Label>
            <div className="relative">
              <Input
                id="proof"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <label
                htmlFor="proof"
                className="flex items-center justify-center w-full h-32 px-4 transition bg-gray-700 border-2 border-gray-600 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-500 focus:outline-none"
              >
                {previewUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={500}
                      height={500}
                      className="object-contain w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      Clique para fazer upload
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG até 5MB
                    </span>
                  </div>
                )}
              </label>
            </div>
            {proofFile && (
              <p className="text-xs text-gray-400">Arquivo: {proofFile.name}</p>
            )}
          </div>

          {/* Mensagens de Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Informações */}
          <div className="bg-gray-700/30 rounded-lg p-3 text-xs text-gray-400 space-y-1">
            <p>• Tire um print da tela de depósito</p>
            <p>• O comprovante deve mostrar o valor e o cupom usado</p>
            <p>• Seu depósito será analisado em até 24h</p>
            <p>• A cada R$ {QUOTA_VALUE} você ganha 1 quota</p>
          </div>

          {/* Botão de Enviar */}
          <Button
            type="submit"
            className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>Enviar Depósito</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
