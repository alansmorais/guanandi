/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X, Check, ShieldCheck, Wrench, Sparkles } from "lucide-react";

export interface ExtractorOption {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string;
  badge?: string;
  included?: boolean;
}

export const EXTRACTOR_OPTIONS: ExtractorOption[] = [
  {
    id: "standard-s",
    name: "Válvula Extratora Padrão Slink / Euro Sankey (S)",
    type: "Padrão Guanandi (1 Unidade)",
    price: 0,
    description: "Conexão padrão nacional compatível com 100% dos barris Guanandi e chopeiras do litoral norte. Já inclusa na locação.",
    badge: "JÁ INCLUSA",
    included: true,
  },
  {
    id: "extra-s",
    name: "Válvula Extratora Adicional Tipo S (2º Barril Simultâneo)",
    type: "Adicional de Linha",
    price: 45,
    description: "Ideal para manter dois barris engatados e pressurizados ao mesmo tempo na chopeira de 2 vias, sem precisar desengatar.",
    badge: "RECOMENDADO P/ 2+ BARRIS",
  },
  {
    id: "picnic-kit",
    name: "Kit Torneira Picnic & Extração Portátil Manual",
    type: "Extração Autônoma",
    price: 60,
    description: "Permite servir chopp direto do barril sem chopeira elétrica. Excelente para levar barris para lanchas, praias ou áreas isoladas.",
    badge: "PORTÁTIL / SEM ELETRICIDADE",
  },
  {
    id: "type-g",
    name: "Válvula Extratora Tipo G (Padrão Triangular / Micromatic)",
    type: "Barris Especiais",
    price: 50,
    description: "Para clientes que possuem barris próprios específicos com bocal triangular tipo G.",
    badge: "BARRIS ESPECIAIS",
  },
  {
    id: "type-a",
    name: "Válvula Extratora Tipo A (Deslizante Alemã)",
    type: "Barris Importados",
    price: 50,
    description: "Padrão deslizante alemão para barris de estilo específico ou importações.",
    badge: "IMPORTADOS",
  },
  {
    id: "ball-lock",
    name: "Kit Adaptadores Engate Rápido & Post-Mix Ball Lock",
    type: "Conexão Kegerator",
    price: 35,
    description: "Conexão rápida com espigões em inox para integração em chopeiras residenciais e kegerators caseiros.",
    badge: "HOMEBREW / KEGERATOR",
  },
];

interface ExtractorOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedId: string;
  onSelectOption: (option: ExtractorOption) => void;
}

export default function ExtractorOptionsModal({
  isOpen,
  onClose,
  selectedId,
  onSelectOption,
}: ExtractorOptionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#141414] border border-[#2F2F2F] rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#1A1A1A] border-b border-[#2A2A2A] p-4 sm:px-6 flex items-start justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-specs font-bold text-brand-yellow uppercase tracking-wider">
              <Wrench className="w-3.5 h-3.5" />
              <span>Pós-Venda & Opcionais Técnicos</span>
            </div>
            <h3 className="font-heading font-black text-lg sm:text-xl text-brand-cream uppercase">
              Válvula Extratora & Conexões
            </h3>
            <p className="font-body text-xs text-[#A8A39E]">
              O kit padrão da locação já acompanha a extratora oficial Tipo S. Escolha abaixo se deseja conexões extras ou outro padrão de válvula.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#888] hover:text-brand-cream p-1.5 rounded-md hover:bg-[#252525] transition-colors"
            title="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Options list */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-grow divide-y divide-[#222]">
          {EXTRACTOR_OPTIONS.map((opt) => {
            const isSelected = selectedId === opt.id || (!selectedId && opt.id === "standard-s");
            return (
              <div
                key={opt.id}
                onClick={() => {
                  onSelectOption(opt);
                }}
                className={`pt-3 first:pt-0 cursor-pointer group`}
              >
                <div 
                  className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-[#1C1C1C] border-brand-yellow ring-1 ring-brand-yellow shadow-md"
                      : "bg-[#111] border-[#262626] hover:border-[#404040]"
                  }`}
                >
                  <div className="space-y-1 flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading font-black text-sm uppercase text-brand-cream group-hover:text-brand-yellow transition-colors">
                        {opt.name}
                      </span>
                      {opt.badge && (
                        <span className={`text-[10px] font-specs font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          opt.included 
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                            : "bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30"
                        }`}>
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="font-body text-xs text-[#A8A39E] leading-relaxed">
                      {opt.description}
                    </p>
                    <div className="text-[11px] font-specs text-[#777]">
                      Categoria: <span className="text-[#AAA]">{opt.type}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:pl-3 sm:border-l sm:border-[#262626] flex-shrink-0">
                    <div className="text-right">
                      <span className="font-specs font-black text-sm sm:text-base text-brand-yellow block">
                        {opt.price === 0 ? "Incluso" : `+ R$ ${opt.price.toFixed(2).replace(".", ",")}`}
                      </span>
                      <span className="text-[10px] font-body text-[#777] block">
                        {opt.price === 0 ? "Taxa R$ 0,00" : "Por evento"}
                      </span>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-brand-yellow bg-brand-yellow text-brand-black"
                        : "border-[#444] group-hover:border-[#666]"
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#1A1A1A] border-t border-[#2A2A2A] p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-body text-[#888]">
            <ShieldCheck className="w-4 h-4 text-brand-yellow" />
            <span className="hidden sm:inline">Higienização e teste de pressão com CO₂ garantidos pela cervejaria.</span>
            <span className="sm:hidden">Equipamentos 100% revisados.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-brand-yellow text-brand-black font-heading font-black text-xs uppercase tracking-wider rounded hover:bg-brand-amber transition-colors"
          >
            Confirmar e Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
