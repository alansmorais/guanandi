/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from "react-router-dom";
import { ShieldCheck, MessageCircle, SlidersHorizontal } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 w-full z-50 bg-[#0D0D0D] border-b border-[#262626]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-13 sm:h-14 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-3 text-brand-cream hover:opacity-95 transition-opacity">
          <div className="w-8 h-8 rounded bg-brand-yellow text-brand-black flex items-center justify-center font-specs font-black text-lg tracking-tight">
            GN
          </div>
          <div>
            <div className="font-heading font-black text-sm tracking-wider uppercase text-brand-cream leading-tight">
              Cervejaria Guanandi
            </div>
            <div className="font-specs font-bold text-[11px] text-brand-yellow uppercase tracking-widest leading-none">
              Locação & Reservas • Litoral Norte SP
            </div>
          </div>
        </Link>

        {/* Status Pill & Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#A8A39E] font-specs">
            <span className="w-2 h-2 rounded-full bg-brand-yellow"></span>
            <span>Mínimo 7 dias antecedência</span>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-xs font-heading font-bold uppercase tracking-wider text-[#A8A39E]">
            <a href="/#cidades" className="hover:text-brand-yellow transition-colors">Cidades</a>
            <a href="/#taps" className="hover:text-brand-yellow transition-colors">Taps & Barris</a>
            <a href="/#equipamentos" className="hover:text-brand-yellow transition-colors">Chopeiras</a>
          </div>

          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#2A2A2A] text-xs font-heading font-bold uppercase text-[#C5BFB8] hover:text-brand-cream hover:border-[#444] transition-all"
            title="Acesso Administrativo"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-yellow" />
            <span className="hidden sm:inline">Painel Admin</span>
          </Link>

          <a
            href="https://wa.me/5567999990000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-brand-yellow text-brand-black text-xs font-heading font-black uppercase tracking-wider hover:bg-brand-amber transition-colors shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>Suporte</span>
          </a>
        </div>
      </div>
    </header>
  );
}
