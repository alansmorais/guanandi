/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Navigate, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Package, Settings, LogOut, Menu, X, Bell, Calendar, Terminal } from "lucide-react";
import { useState } from "react";
import { useFirebase } from "../../contexts/FirebaseContext";
import { logout } from "../../lib/firebase";

const NAV_ITEMS = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/reservations", label: "Reservas", icon: Calendar },
  { path: "/admin/leads", label: "Orçamentos", icon: Users },
  { path: "/admin/inventory", label: "Inventário", icon: Package },
  { path: "/admin/developer", label: "Developer", icon: Terminal },
];

export default function AdminLayout() {
  const { user, adminUser, isAdmin, loading, logoutAdminSession } = useFirebase();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-black">
        <div className="w-8 h-8 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin && !user && !adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = async () => {
    logoutAdminSession();
    try {
      await logout();
    } catch (e) {
      // Ignora se não houver sessão ativa do Firebase
    }
    navigate("/");
  };

  const displayName = adminUser ? adminUser.name : (user?.displayName || "Administrador");
  const displayEmail = adminUser ? `${adminUser.username}@guanandi.com.br (Slot ${adminUser.slot})` : (user?.email || "admin@guanandi.com.br");

  return (
    <div className="min-h-screen bg-brand-black flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 border-r border-white/5 flex-col bg-[#0D0D0D]">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center font-heading font-black text-brand-black text-sm">G</div>
            <div>
              <span className="font-heading font-black uppercase text-white tracking-wider text-sm block">Guanandi Admin</span>
              <span className="text-[10px] font-specs text-[#777]">Painel de Controle</span>
            </div>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 font-heading text-xs font-black uppercase tracking-wider transition-all rounded ${
                  isActive 
                    ? "bg-brand-yellow text-brand-black" 
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-brand-yellow">
              {adminUser ? adminUser.slot : "A"}
            </div>
            <div className="overflow-hidden">
              <div className="font-heading text-[11px] font-black uppercase text-white truncate">{displayName}</div>
              <div className="font-specs text-[9px] text-white/40 truncate">{displayEmail}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 font-heading text-xs font-black uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-all rounded"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-[#0D0D0D]">
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-6 h-6 text-white" />
            </button>
            <span className="font-heading font-black uppercase text-white tracking-wider text-xs">Guanandi Admin</span>
          </div>

          <div className="hidden lg:block">
            <h1 className="font-specs text-xs font-black uppercase text-white/50 tracking-[0.2em]">
              {NAV_ITEMS.find(i => i.path === location.pathname)?.label || "Administração"}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-white/40 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-yellow rounded-full" />
            </button>
            <div className="w-px h-6 bg-white/5" />
            <Link to="/" className="font-specs text-xs font-black uppercase text-brand-yellow hover:underline tracking-wider">
              Ver Site Público →
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-6 lg:p-10 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer com link ASM Solutions */}
        <footer className="border-t border-white/5 py-4 px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-specs text-[#777] bg-[#0A0A0A]">
          <div>
            © 2026 Cervejaria Guanandi. Desenvolvido por{" "}
            <a
              href="https://alansmsolutions.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-yellow font-bold hover:underline transition-colors"
            >
              ASM Solutions
            </a>
          </div>
          <div className="flex items-center gap-4 text-[#555]">
            <span>Painel Administrativo Seguro</span>
            <span>•</span>
            <span>Máximo 2 Usuários</span>
          </div>
        </footer>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-brand-black flex flex-col">
          <div className="h-16 border-b border-white/5 flex items-center justify-between px-6">
            <span className="font-heading font-black uppercase text-white tracking-wider text-xs">Menu Admin</span>
            <button onClick={() => setMobileMenuOpen(false)}>
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <nav className="p-6 space-y-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 font-heading text-lg font-black uppercase text-white hover:text-brand-yellow"
              >
                <item.icon className="w-5 h-5 text-brand-yellow" />
                <span>{item.label}</span>
              </Link>
            ))}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 font-heading text-lg font-black uppercase text-red-500 pt-8"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair do Sistema</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
