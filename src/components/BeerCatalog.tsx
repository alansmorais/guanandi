/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BEERS } from "../data";
import { Beer as BeerIcon } from "lucide-react";

export default function BeerCatalog() {
  return (
    <section id="taps" className="w-full py-6 sm:py-8 px-4 sm:px-6 bg-[#0D0D0D] border-t border-[#1F1F1F]">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-[#222]">
          <div>
            <div className="flex items-center gap-2 font-specs font-bold text-xs uppercase tracking-wider text-brand-yellow">
              <BeerIcon className="w-3.5 h-3.5" />
              <span>Tap List & Disponibilidade de Barris</span>
            </div>
            <h2 className="font-heading font-black text-xl sm:text-2xl uppercase text-brand-cream tracking-tight mt-0.5">
              Chopp Artesanal Fresco
            </h2>
          </div>
          <div className="text-xs font-body text-[#807A75]">
            Válvula extratora padrão Slink / Euro Sankey (S)
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {BEERS.map((beer, i) => (
            <div 
              key={beer.id}
              className="bg-[#141414] border border-[#262626] rounded-md flex flex-col overflow-hidden hover:border-[#3E3E3E] transition-colors"
            >
              {/* Yellow Tap Badge */}
              <div className="bg-brand-yellow text-brand-black px-3 py-1 flex items-center justify-between font-specs font-black text-xs uppercase tracking-wider">
                <span>TAP 0{i + 1}</span>
                <span className="text-[11px] font-bold">{beer.style}</span>
              </div>

              <div className="py-3 px-3.5 space-y-2.5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-heading font-black text-base uppercase text-brand-cream leading-snug">{beer.name}</h3>
                  <p className="font-body text-xs text-[#A8A39E] mt-0.5 line-clamp-2">{beer.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#222]">
                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-specs bg-[#0D0D0D] p-2 rounded border border-[#242424]">
                    <div>
                      <span className="text-[10px] text-[#777] block uppercase">ABV</span>
                      <strong className="text-brand-cream text-sm">{beer.abv}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#777] block uppercase">Amargor</span>
                      <strong className="text-brand-cream text-sm">{beer.ibu} IBU</strong>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-specs px-1">
                    <span className="text-[#888]">30L: <strong className="text-brand-cream font-bold">R$ {beer.price30L}</strong></span>
                    <span className="text-brand-yellow font-bold text-sm">50L: R$ {beer.price50L}</span>
                  </div>

                  <a 
                    href="#booking-panel"
                    className="w-full py-2 bg-[#1C1C1C] border border-[#303030] text-brand-cream font-heading font-bold text-xs uppercase tracking-wider hover:bg-brand-yellow hover:text-brand-black hover:border-brand-yellow transition-colors text-center rounded block"
                  >
                    Adicionar à Reserva
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
