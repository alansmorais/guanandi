/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Tela de Autenticação Segura com Controle de Dois Níveis (ADMIN & DEVELOPER)
 * - Nenhuma senha exposta no código do navegador
 * - Autenticação realizada estritamente via backend
 * - Perfis independentes: Administrador Operacional e Desenvolvedor Técnico
 */

import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, LogIn, KeyRound, ShieldAlert, CheckCircle, Terminal, UserCheck, Shield } from "lucide-react";
import { useFirebase } from "../../contexts/FirebaseContext";

export default function AdminLogin() {
  const { isAdmin, isDeveloper, loading, loginWithCredentials } = useFirebase();
  const navigate = useNavigate();

  // Role selector tab: 'admin' | 'developer'
  const [selectedRole, setSelectedRole] = useState<"admin" | "developer">("admin");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAdmin) {
      if (isDeveloper && selectedRole === "developer") {
        navigate("/admin/developer");
      } else {
        navigate("/admin/reservations");
      }
    }
  }, [isAdmin, isDeveloper, loading, navigate, selectedRole]);

  // Altera o usuário padrão de sugestão ao trocar de aba
  const handleRoleTabChange = (role: "admin" | "developer") => {
    setSelectedRole(role);
    setError(null);
    setUsername(role === "developer" ? "developer" : "admin");
    setPassword("");
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Informe o usuário e a senha.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await loginWithCredentials(username.trim(), password, selectedRole);

      if (!res.success) {
        setError(res.error || "Credenciais inválidas para o perfil selecionado.");
        setIsSubmitting(false);
        return;
      }

      if (res.role === "developer") {
        navigate("/admin/developer");
      } else {
        navigate("/admin/reservations");
      }
    } catch (err: any) {
      setError(err?.message || "Erro de conexão ao servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-brand-yellow rounded-full flex items-center justify-center font-heading font-black text-brand-black text-xl mx-auto mb-2 shadow-lg">
          G
        </div>
        <h1 className="font-heading font-black text-2xl uppercase tracking-wider text-white">
          Cervejaria Guanandi
        </h1>
        <p className="text-xs text-[#888] font-specs uppercase tracking-widest mt-0.5">
          Portal de Acesso Restrito
        </p>
      </div>

      <div className="bg-[#141414] border border-[#262626] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-5">
        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0A0A0A] border border-[#242424] rounded-lg">
          <button
            type="button"
            onClick={() => handleRoleTabChange("admin")}
            className={`py-2 px-3 rounded text-xs font-heading font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              selectedRole === "admin"
                ? "bg-brand-yellow text-brand-black shadow"
                : "text-[#888] hover:text-white"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>1. ADMIN</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange("developer")}
            className={`py-2 px-3 rounded text-xs font-heading font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              selectedRole === "developer"
                ? "bg-brand-yellow text-brand-black shadow"
                : "text-[#888] hover:text-white"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>2. DEVELOPER</span>
          </button>
        </div>

        {/* Role Description Card */}
        <div className={`p-3 rounded-lg border text-xs font-body ${
          selectedRole === "admin" 
            ? "bg-[#181818] border-[#2A2A2A] text-[#CCC]" 
            : "bg-[#161A14] border-emerald-900/40 text-emerald-300"
        }`}>
          {selectedRole === "admin" ? (
            <div className="space-y-1">
              <span className="font-heading font-bold text-brand-yellow uppercase block text-[11px]">
                Perfil: Administrador Operacional
              </span>
              <p className="text-[#999] text-[11px]">
                Gestão de reservas, consulta de clientes, atualização de status e alteração de preços do cardápio.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="font-heading font-bold text-emerald-400 uppercase block text-[11px] flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                <span>Perfil: Engenheiro Desenvolvedor</span>
              </span>
              <p className="text-emerald-400/70 text-[11px]">
                Diagnóstico de ambiente, verificação de conectividade SMTP, logs técnicos do sistema e manutenção.
              </p>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-950/40 border border-red-800/60 p-3 rounded-lg text-xs text-red-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-heading font-bold uppercase text-[#A8A39E] mb-1">
              Usuário ({selectedRole.toUpperCase()})
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={selectedRole === "developer" ? "developer" : "admin"}
              className="w-full bg-[#0E0E0E] border border-[#2B2B2B] rounded py-2 px-3 text-sm text-brand-cream font-specs focus:outline-none focus:border-brand-yellow transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-heading font-bold uppercase text-[#A8A39E] mb-1">
              Senha de Acesso
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0E0E0E] border border-[#2B2B2B] rounded py-2 px-3 text-sm text-brand-cream font-specs focus:outline-none focus:border-brand-yellow transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-yellow text-brand-black py-2.5 rounded font-heading font-black text-xs uppercase tracking-wider hover:bg-brand-amber transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg mt-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-brand-black border-t-transparent rounded-full animate-spin" />
                <span>Autenticando no Servidor...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Entrar como {selectedRole.toUpperCase()}</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-[#222] text-center">
          <p className="text-[10px] text-[#666] font-specs">
            Segurança Cervejaria Guanandi • Hashes PBKDF2/SHA-512 Server-Side
          </p>
        </div>
      </div>
    </div>
  );
}
