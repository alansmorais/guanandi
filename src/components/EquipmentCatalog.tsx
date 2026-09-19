/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EQUIPMENTS } from "../data";
import { Gauge, Check, Shield } from "lucide-react";

export default function EquipmentCatalog() {
  return (
    <section id="equipamentos" className="w-full py-6 sm:py-8 px-4 sm:px-6 bg-[#0D0D0D] border-t border-[#1F1F1F]">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-[#222]">
          <div>
            <div className="flex items-center gap-2 font-specs font-bold text-xs uppercase tracking-wider text-brand-yellow">
              <Gauge className="w-3.5 h-3.5" />
              <span>Equipamentos & Engenharia de Dispensação</span>
            </div>
            <h2 className="font-heading font-black text-xl sm:text-2xl uppercase text-brand-cream tracking-tight mt-0.5">
              Dispensadores Profissionais & Estrutura
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-specs text-[#A8A39E]">
            <Shield className="w-3.5 h-3.5 text-brand-yellow" />
            <span>Chassis preto fosco • Torneiras inox • Sanitização atóxica</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {EQUIPMENTS.map((equip) => (
            <div 
              key={equip.id}
              className="bg-[#141414] border border-[#262626] rounded-md py-3.5 px-4 flex flex-col justify-between hover:border-[#383838] transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-brand-yellow text-brand-black font-specs font-black text-[11px] px-2 py-0.5 rounded uppercase">
                    {equip.category}
                  </span>
                  <span className="text-[11px] font-specs font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Testado & Calibrado
                  </span>
                </div>
                
                <div>
                  <h3 className="font-heading font-black text-base uppercase text-brand-cream">{equip.name}</h3>
                  <p className="font-body text-xs text-[#A8A39E] mt-1">{equip.description}</p>
                </div>

                <div className="bg-[#0D0D0D] border border-[#222] rounded p-3 space-y-2">
                  {equip.specs.map((spec, si) => (
                    <div key={si} className="flex justify-between items-center text-xs font-specs">
                      <span className="text-[#7A7570] uppercase">{spec.label}:</span>
                      <strong className="text-brand-cream uppercase">{spec.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#222] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-specs uppercase text-[#777] block">Locação Evento</span>
                  <span className="font-specs font-black text-lg text-brand-yellow">
                    {equip.price ? `R$ ${equip.price},00` : "Incluso c/ Barril"}
                  </span>
                </div>
                <a 
                  href="#booking-panel"
                  className="px-3 py-1.5 bg-[#1C1C1C] border border-[#303030] text-brand-cream font-heading font-bold text-xs uppercase tracking-wider hover:bg-brand-yellow hover:text-brand-black transition-colors rounded"
                >
                  Selecionar
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
