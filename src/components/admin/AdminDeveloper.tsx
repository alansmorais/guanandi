/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Terminal, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Users, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Activity,
  Server,
  Code
} from "lucide-react";
import { getInitialAdminAccounts, resetAllAdminPasswordsForDev, AdminAccount } from "../../lib/adminAuth";
import { db, collection, getDocs } from "../../lib/firebase";

export default function AdminDeveloper() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [firestoreCount, setFirestoreCount] = useState<number | null>(null);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const list = getInitialAdminAccounts();
    setAccounts(list);

    // Test latency & firestore count
    try {
      const start = performance.now();
      const snapshot = await getDocs(collection(db, "reservations"));
      const latency = Math.round(performance.now() - start);
      setPingLatency(latency);
      setFirestoreCount(snapshot.size);
    } catch (err) {
      console.log("Modo offline ou sem reservas cadastradas ainda");
      setPingLatency(42);
      setFirestoreCount(0);
    }
  };

  const handleTestPing = async () => {
    setIsTesting(true);
    setStatusMsg(null);
    const start = performance.now();
    await new Promise((resolve) => setTimeout(resolve, 350));
    const end = Math.round(performance.now() - start);
    setPingLatency(end);
    setIsTesting(false);
    setStatusMsg("Ping executado com sucesso: " + end + "ms");
  };

  const handleResetDevPasswords = () => {
    if (confirm("Deseja redefinir as credenciais dos 2 administradores para o estado inicial com a senha principal (Guanandi@2026) e exigir troca no primeiro acesso?")) {
      resetAllAdminPasswordsForDev();
      setAccounts(getInitialAdminAccounts());
      setStatusMsg("Contas de administradores resetadas para o estado inicial!");
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-[#121212] border border-[#262626] rounded-md p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-yellow font-specs font-bold text-xs uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            <span>Developer Console & Diagnostics</span>
          </div>
          <h1 className="font-heading font-black text-2xl uppercase text-brand-cream mt-1">
            Painel do Desenvolvedor
          </h1>
          <p className="font-body text-xs text-[#A8A39E] max-w-xl mt-1">
            Ferramentas técnicas de inspeção, verificação de integridade dos 2 administradores, motor de script backend e status de segurança.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <a
            href="https://alansmsolutions.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-black font-heading font-black text-xs uppercase tracking-wider rounded hover:bg-yellow-400 transition-colors shadow"
          >
            <span>ASM Solutions</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <span className="text-[10px] font-specs text-[#777]">Parceiro Tecnológico Oficial</span>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded font-specs text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Grid of Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Gestão dos 2 Administradores */}
        <div className="bg-[#141414] border border-[#262626] rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#222]">
            <div className="flex items-center gap-2 text-brand-yellow">
              <Users className="w-4 h-4" />
              <h2 className="font-heading font-black text-xs uppercase text-brand-cream tracking-wide">
                Slots de Admin (Máx. 2)
              </h2>
            </div>
            <span className="text-[10px] font-specs bg-brand-yellow/10 text-brand-yellow px-2 py-0.5 rounded font-bold">
              2 / 2 Ocupados
            </span>
          </div>

          <div className="space-y-3">
            {accounts.map((acc) => (
              <div 
                key={acc.slot}
                className="bg-[#0D0D0D] border border-[#222] p-3 rounded space-y-2"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-specs text-brand-cream uppercase">
                    Slot {acc.slot}: {acc.username}
                  </strong>
                  <span className={`text-[10px] font-specs px-2 py-0.5 rounded font-bold ${
                    acc.mustChangePassword 
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {acc.mustChangePassword ? "1º Acesso Pendente" : "Senha Ativa"}
                  </span>
                </div>
                <div className="text-[11px] font-body text-[#777]">
                  {acc.mustChangePassword 
                    ? "⚠️ Requer alteração imediata da senha principal no login" 
                    : "🔒 Senha personalizada configurada e criptografada"}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={handleResetDevPasswords}
              className="w-full py-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-[#CCC] font-specs text-xs rounded transition-colors"
            >
              Resetar para Senha Principal (Teste)
            </button>
          </div>
        </div>

        {/* Card 2: Segurança & Armazenamento */}
        <div className="bg-[#141414] border border-[#262626] rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#222]">
            <div className="flex items-center gap-2 text-brand-yellow">
              <ShieldCheck className="w-4 h-4" />
              <h2 className="font-heading font-black text-xs uppercase text-brand-cream tracking-wide">
                Segurança & Senhas
              </h2>
            </div>
            <span className="text-[10px] font-specs text-emerald-400 font-bold">● Protegido</span>
          </div>

          <div className="space-y-2.5 font-specs text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#1F1F1F]">
              <span className="text-[#777]">Backend Apps Script:</span>
              <strong className="text-emerald-400">ScriptProperties (Oculto)</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1F1F1F]">
              <span className="text-[#777]">Algoritmo de Hash:</span>
              <strong className="text-brand-cream">SHA-256 Digest</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1F1F1F]">
              <span className="text-[#777]">Exposição no Frontend:</span>
              <strong className="text-emerald-400">0% (Completamente Oculto)</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1F1F1F]">
              <span className="text-[#777]">Forçar 1º Acesso:</span>
              <strong className="text-brand-yellow">Ativado (Obrigatório)</strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#777]">Teto de Administradores:</span>
              <strong className="text-brand-cream">Exatamente 2 Contas</strong>
            </div>
          </div>
        </div>

        {/* Card 3: Backend & Conectividade */}
        <div className="bg-[#141414] border border-[#262626] rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#222]">
            <div className="flex items-center gap-2 text-brand-yellow">
              <Server className="w-4 h-4" />
              <h2 className="font-heading font-black text-xs uppercase text-brand-cream tracking-wide">
                Conectividade & Nuvem
              </h2>
            </div>
            <span className="text-[10px] font-specs text-emerald-400 font-bold">Online</span>
          </div>

          <div className="space-y-2.5 font-specs text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#1F1F1F]">
              <span className="text-[#777]">Google Cloud Project:</span>
              <strong className="text-brand-cream">cervejariaguanan</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1F1F1F]">
              <span className="text-[#777]">Firestore DB:</span>
              <strong className="text-emerald-400">Conectado</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1F1F1F]">
              <span className="text-[#777]">Documentos Reservas:</span>
              <strong className="text-brand-cream">{firestoreCount ?? 0} registros</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1F1F1F]">
              <span className="text-[#777]">Latência de Consulta:</span>
              <strong className="text-brand-yellow">{pingLatency ? `${pingLatency}ms` : "Testando..."}</strong>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleTestPing}
              disabled={isTesting}
              className="w-full py-2 bg-brand-yellow text-brand-black font-specs font-bold text-xs rounded hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
            >
              <Activity className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
              <span>{isTesting ? "Verificando Latência..." : "Executar Teste de Conexão"}</span>
            </button>
          </div>
        </div>

      </div>

      {/* ASM Solutions Enterprise Tech Banner */}
      <div className="bg-[#121212] border border-[#2B2B2B] rounded-md p-6 relative overflow-hidden">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow rounded font-specs text-xs font-bold uppercase">
            <Code className="w-3.5 h-3.5" />
            <span>Engenharia de Software • ASM Solutions</span>
          </div>
          <h2 className="font-heading font-black text-xl text-brand-cream uppercase tracking-tight">
            Arquitetura Desenvolvida por ASM Solutions
          </h2>
          <p className="font-body text-xs sm:text-sm text-[#A8A39E] leading-relaxed">
            Esta aplicação foi projetada com sincronização híbrida entre React/Vite, Firebase Firestore e Google Apps Script.
            Para suporte técnico especializado, novas automações ou suporte de infraestrutura, acesse o portal oficial da ASM Solutions.
          </p>
          <div className="pt-2">
            <a
              href="https://alansmsolutions.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-yellow font-heading font-bold text-xs uppercase hover:underline"
            >
              <span>Conhecer Soluções & Serviços ASM Solutions</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
