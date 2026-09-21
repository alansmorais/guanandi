/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Layout do Painel Administrativo — Cervejaria Guanandi
 * - Enforça isolamento de permissões entre ADMIN e DEVELOPER
 * - Bloqueia acesso não autorizado ao Developer Console
 */

import { Navigate, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  LogOut, 
  Calendar, 
  Terminal, 
  Lock, 
  ShieldCheck, 
  UserCheck 
} from "lucide-react";
import { useState } from "react";
import { useFirebase } from "../../contexts/FirebaseContext";

const BASE_NAV_ITEMS = [
  { path: "/admin/reservations", label: "Reservas", icon: Calendar, requiredRole: "admin" },
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard, requiredRole: "admin" },
  { path: "/admin/inventory", label: "Cardápio & Preços", icon: Package, requiredRole: "admin" },
  { path: "/admin/leads", label: "Contatos", icon: Users, requiredRole: "admin" },
  { path: "/admin/developer", label: "Developer Console", icon: Terminal, requiredRole: "developer" },
];

export default function AdminLayout() {
  const { sessionUser, isAdmin, isDeveloper, loading, logoutAdminSession } = useFirebase();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="w-8 h-8 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redireciona para o login se não estiver autenticado
  if (!isAdmin && !sessionUser) {
    return <Navigate to="/admin/login" replace />;
  }

  // Bloqueio rigoroso de rota URL direta: ADMIN não acessa rota do DEVELOPER
  const isTryingToAccessDeveloper = location.pathname.startsWith("/admin/developer");
  if (isTryingToAccessDeveloper && !isDeveloper) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-[#141414] border border-red-900/60 rounded-xl max-w-lg w-full p-6 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 bg-red-950/50 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto text-red-400">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="font-heading font-black text-xl text-white uppercase">
            Acesso Restrito ao Desenvolvedor
          </h2>
          <p className="text-xs text-[#A8A39E] leading-relaxed">
            Você está autenticado como <strong>ADMIN (Operacional)</strong>. As ferramentas de diagnóstico e configurações técnicas do Developer Console requerem privilégios exclusivos do perfil <strong>DEVELOPER</strong>.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => navigate("/admin/reservations")}
              className="px-4 py-2 bg-brand-yellow text-brand-black font-heading font-black text-xs uppercase tracking-wider rounded hover:bg-brand-amber transition-colors"
            >
              Voltar para Reservas
            </button>
            <button
              onClick={() => {
                logoutAdminSession();
                navigate("/admin/login");
              }}
              className="px-4 py-2 border border-[#333] text-xs font-heading font-bold uppercase text-[#AAA] hover:text-white rounded transition-colors"
            >
              Trocar de Perfil
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logoutAdminSession();
    navigate("/admin/login");
  };

  const displayName = sessionUser?.name || "Administrador";
  const roleName = sessionUser?.role === "developer" ? "DEVELOPER" : "ADMIN";

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 border-r border-[#222] flex-col bg-[#0F0F0F]">
        {/* Brand header */}
        <div className="p-5 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-yellow rounded-lg flex items-center justify-center font-heading font-black text-brand-black text-base shadow">
              G
            </div>
            <div>
              <span className="font-heading font-black uppercase text-white tracking-wider text-sm block">
                Guanandi Admin
              </span>
              <span className="text-[10px] font-specs text-brand-yellow font-bold uppercase">
                {roleName}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-grow p-3.5 space-y-1">
          {BASE_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const isDevOnly = item.requiredRole === "developer";
            const isLockedForCurrent = isDevOnly && !isDeveloper;

            return (
              <Link
                key={item.path}
                to={isLockedForCurrent ? "/admin/developer" : item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 font-heading text-xs font-black uppercase tracking-wider transition-all rounded ${
                  isActive 
                    ? "bg-brand-yellow text-brand-black shadow" 
                    : isLockedForCurrent
                    ? "text-[#555] hover:bg-white/5"
                    : "text-[#AAA] hover:bg-[#1A1A1A] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>

                {isDevOnly && (
                  <span className={`text-[9px] font-specs font-bold px-1.5 py-0.5 rounded ${
                    isDeveloper 
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40" 
                      : "bg-[#222] text-[#666]"
                  }`}>
                    {isLockedForCurrent ? <Lock className="w-2.5 h-2.5 inline" /> : "DEV"}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#222] space-y-3">
          <div className="flex items-center gap-3 p-2 bg-[#161616] rounded border border-[#262626]">
            <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${
              isDeveloper ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-brand-yellow/20 text-brand-yellow"
            }`}>
              {isDeveloper ? <Terminal className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <div className="font-heading text-xs font-black uppercase text-white truncate">
                {displayName}
              </div>
              <div className="font-specs text-[10px] text-[#888] truncate">
                Perfil: <strong className="text-brand-yellow">{roleName}</strong>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 font-heading text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-950/20 border border-red-900/30 rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar on mobile */}
        <div className="lg:hidden bg-[#0F0F0F] border-b border-[#222] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-heading font-black uppercase text-white text-sm">Guanandi Admin</span>
            <span className="text-[10px] font-specs text-brand-yellow font-bold bg-brand-yellow/10 px-1.5 py-0.5 rounded">
              {roleName}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-red-400 font-heading uppercase font-bold"
          >
            Sair
          </button>
        </div>

        {/* Mobile Nav strip */}
        <div className="lg:hidden flex items-center gap-1 p-2 bg-[#141414] border-b border-[#222] overflow-x-auto">
          {BASE_NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded text-[11px] font-heading font-bold uppercase whitespace-nowrap ${
                location.pathname === item.path ? "bg-brand-yellow text-brand-black" : "text-[#888]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
