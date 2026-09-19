/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, LogIn, KeyRound, ShieldAlert, CheckCircle, ExternalLink, ArrowRight } from "lucide-react";
import { loginWithGoogle, db, doc, setDoc } from "../../lib/firebase";
import { useFirebase } from "../../contexts/FirebaseContext";
import { verifyAdminLogin, updateAdminPassword } from "../../lib/adminAuth";

export default function AdminLogin() {
  const { user, adminUser, isAdmin, loading, loginAdminSession } = useFirebase();
  const navigate = useNavigate();

  // Form state
  const [username, setUsername] = useState("admin1");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forced password change state
  const [isFirstAccessMode, setIsFirstAccessMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changeSuccess, setChangeSuccess] = useState(false);

  useEffect(() => {
    if (!loading && (isAdmin || adminUser)) {
      navigate("/admin");
    }
  }, [user, adminUser, isAdmin, loading, navigate]);

  const handleAdminCredentialsLogin = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!username.trim() || !password) {
      setError("Informe o usuário e a senha.");
      setIsSubmitting(false);
      return;
    }

    const res = verifyAdminLogin(username, password);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || "Credenciais inválidas.");
      return;
    }

    if (res.mustChangePassword && res.user) {
      // Primeiro acesso: obriga a alteração da senha principal
      setIsFirstAccessMode(true);
      setError(null);
    } else if (res.user) {
      loginAdminSession(res.user);
      navigate("/admin");
    }
  };

  const handleForcePasswordChange = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 6) {
      setError("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas digitadas não coincidem.");
      return;
    }

    const res = updateAdminPassword(username, newPassword);
    if (!res.success || !res.user) {
      setError(res.error || "Erro ao salvar nova senha.");
      return;
    }

    setChangeSuccess(true);
    setTimeout(() => {
      loginAdminSession(res.user!);
      navigate("/admin");
    }, 1200);
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await loginWithGoogle();
    } catch (err: any) {
      setError("Falha na autenticação Google. Verifique se sua conta possui permissão de administrador.");
    }
  };

  const setupAdminFirestore = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, "admins", user.uid), {
        email: user.email,
        role: "admin",
        createdAt: new Date(),
      });
      window.location.reload();
    } catch (err) {
      console.error("Setup Admin Error:", err);
      setError("Erro ao configurar perfil de administrador no Firestore.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-brand-black px-4 sm:px-6 py-10">
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-md w-full space-y-6 bg-[#121212] border border-[#262626] rounded-md p-8 shadow-2xl">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-brand-yellow rounded-full flex items-center justify-center mx-auto text-brand-black">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-heading font-black text-2xl uppercase text-brand-cream tracking-tight">
              Acesso Administrativo
            </h1>
            <p className="font-body text-xs text-[#A8A39E]">
              Painel de Gestão e Reservas • Máximo de 2 Administradores
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded font-specs text-xs text-center flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {changeSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded font-specs text-xs text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Nova senha cadastrada com sucesso! Redirecionando...</span>
            </div>
          )}

          {/* Form 1: Alteração Obrigatória no Primeiro Acesso */}
          {isFirstAccessMode ? (
            <form onSubmit={handleForcePasswordChange} className="space-y-4">
              <div className="bg-brand-yellow/10 border border-brand-yellow/30 p-3 rounded text-xs font-body text-brand-cream space-y-1">
                <div className="font-heading font-black uppercase text-brand-yellow flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  <span>Primeiro Acesso — Troca Obrigatória</span>
                </div>
                <p className="text-[11px] text-[#BBB]">
                  Você fez login com a senha principal inicial. Por segurança do sistema, defina sua nova senha pessoal antes de acessar o painel.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-specs uppercase text-[#A8A39E] font-bold">
                  Usuário
                </label>
                <input
                  type="text"
                  value={username}
                  disabled
                  className="w-full bg-[#0D0D0D] border border-[#262626] rounded px-3 py-2 text-xs font-specs text-[#777] cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-specs uppercase text-[#A8A39E] font-bold">
                  Nova Senha (Mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Sua nova senha segura"
                  required
                  className="w-full bg-[#0D0D0D] border border-[#333] rounded px-3 py-2 text-xs font-specs text-brand-cream focus:border-brand-yellow outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-specs uppercase text-[#A8A39E] font-bold">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  required
                  className="w-full bg-[#0D0D0D] border border-[#333] rounded px-3 py-2 text-xs font-specs text-brand-cream focus:border-brand-yellow outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-yellow text-brand-black font-heading font-black text-xs uppercase tracking-wider rounded hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 shadow"
              >
                <span>Salvar Nova Senha & Entrar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Form 2: Login Padrão de Administrador (Max 2 Usuários) */
            <div className="space-y-5">
              <form onSubmit={handleAdminCredentialsLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-specs">
                    <label className="uppercase text-[#A8A39E] font-bold">
                      Usuário Administrador
                    </label>
                    <span className="text-[10px] text-brand-yellow">Slot 1 ou 2</span>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin1 ou admin2"
                    required
                    className="w-full bg-[#0D0D0D] border border-[#333] rounded px-3 py-2.5 text-xs font-specs text-brand-cream focus:border-brand-yellow outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-specs uppercase text-[#A8A39E] font-bold">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha ou senha principal"
                    required
                    className="w-full bg-[#0D0D0D] border border-[#333] rounded px-3 py-2.5 text-xs font-specs text-brand-cream focus:border-brand-yellow outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-brand-yellow text-brand-black font-heading font-black text-xs uppercase tracking-wider rounded hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 shadow font-bold"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isSubmitting ? "Verificando..." : "Entrar no Painel"}</span>
                </button>
              </form>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#262626]" />
                <span className="flex-shrink mx-3 text-[10px] font-specs uppercase text-[#666]">
                  ou autenticação em nuvem
                </span>
                <div className="flex-grow border-t border-[#262626]" />
              </div>

              {/* Login via Google / Firebase para administradores */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] text-brand-cream py-2.5 rounded font-heading font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <span>Acessar via Google Workspace</span>
              </button>

              {!isAdmin && user && (
                <div className="text-center space-y-2 pt-2 border-t border-[#222]">
                  <p className="text-amber-400 text-xs font-specs font-bold uppercase">Acesso Não Vinculado</p>
                  <p className="text-[#777] text-[10px] font-specs">
                    Conta logada: {user.email}
                  </p>
                  {user.email === "alanpkmorais@gmail.com" && (
                    <button
                      onClick={setupAdminFirestore}
                      className="w-full bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30 py-2 rounded font-specs text-xs font-bold uppercase tracking-wider hover:bg-brand-yellow/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Cadastrar minha conta como Admin Oficial</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-[#222] text-center text-[10px] font-specs text-[#666]">
            Regra Estrita: Limite de até 2 contas simultâneas • Senhas protegidas em backend
          </div>
        </div>
      </div>

      {/* Footer com link ASM Solutions */}
      <footer className="text-center py-4 text-xs font-specs text-[#777] space-y-1">
        <div>
          © {new Date().getFullYear()} Cervejaria Guanandi. Desenvolvido por{" "}
          <a
            href="https://alansmsolutions.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-yellow font-bold hover:underline inline-flex items-center gap-1"
          >
            <span>ASM Solutions</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="text-[10px] text-[#555]">
          Automação de Reservas • Google Apps Script • Cloud Firestore
        </div>
      </footer>
    </div>
  );
}
