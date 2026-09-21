/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modal de Pós-Venda (Upsell) — Opção de Segunda Cerveja
 * Permite ao cliente adicionar uma segunda cerveja ao mesmo pedido antes da confirmação final
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Beer as BeerIcon, Check, Plus, X, Sparkles, ShieldCheck } from "lucide-react";
import { BEERS } from "../data";
import { Beer } from "../types";

export interface SecondBeerSelection {
  beerId: string;
  beerName: string;
  kegSize: 30 | 50;
  price: number;
  quantity: number;
}

interface SecondBeerUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  firstBeerName: string;
  firstBeerId: string;
  currentSecondBeer: SecondBeerSelection | null;
  onAddSecondBeer: (selection: SecondBeerSelection) => void;
  onDeclineSecondBeer: () => void;
}

export default function SecondBeerUpsellModal({
  isOpen,
  onClose,
  firstBeerName,
  firstBeerId,
  currentSecondBeer,
  onAddSecondBeer,
  onDeclineSecondBeer,
}: SecondBeerUpsellModalProps) {
  // Suggest a different beer by default
  const otherBeers = BEERS.filter((b) => b.id !== firstBeerId);
  const defaultSelectedBeer = currentSecondBeer
    ? BEERS.find((b) => b.id === currentSecondBeer.beerId) || otherBeers[0] || BEERS[0]
    : otherBeers[0] || BEERS[0];

  const [selectedBeer, setSelectedBeer] = useState<Beer>(defaultSelectedBeer);
  const [kegSize, setKegSize] = useState<30 | 50>(currentSecondBeer?.kegSize || 30);

  if (!isOpen) return null;

  const currentPrice = kegSize === 50 ? selectedBeer.price50L : selectedBeer.price30L;

  const handleConfirm = () => {
    onAddSecondBeer({
      beerId: selectedBeer.id,
      beerName: selectedBeer.name,
      kegSize,
      price: currentPrice,
      quantity: 1,
    });
    onClose();
  };

  const handleDecline = () => {
    onDeclineSecondBeer();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-[#141414] border border-[#2D2D2D] rounded-xl max-w-2xl w-full p-4 sm:p-6 text-brand-cream relative shadow-2xl my-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#888] hover:text-brand-cream transition-colors p-1"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-3 pb-4 border-b border-[#262626]">
            <div className="w-10 h-10 rounded-lg bg-brand-yellow/10 border border-brand-yellow/30 flex items-center justify-center flex-shrink-0 text-brand-yellow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-specs font-bold text-[11px] uppercase tracking-wider text-brand-yellow bg-brand-yellow/10 px-2 py-0.5 rounded">
                  Oferta de Pós-Venda
                </span>
                <span className="text-[11px] text-[#888] font-specs">Mesmo Pedido • Sem Frete Adicional</span>
              </div>
              <h3 className="font-heading font-black text-lg sm:text-xl text-brand-cream uppercase mt-1">
                Deseja adicionar uma segunda cerveja?
              </h3>
              <p className="font-body text-xs text-[#A8A39E] mt-0.5">
                Você já escolheu <strong className="text-brand-yellow">{firstBeerName}</strong>. Ter dois estilos diferentes agrada a todos os perfis de convidados e aproveita a mesma chopeira de 2 vias.
              </p>
            </div>
          </div>

          {/* Beer Selection Grid */}
          <div className="py-4">
            <label className="block font-heading font-bold text-xs uppercase text-[#C5BFB8] mb-2">
              Escolha o segundo estilo de chopp:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 max-h-56 overflow-y-auto pr-1">
              {BEERS.map((beer) => {
                const isSelected = selectedBeer.id === beer.id;
                const isFirstBeer = beer.id === firstBeerId;
                return (
                  <button
                    key={beer.id}
                    type="button"
                    onClick={() => setSelectedBeer(beer)}
                    className={`p-2.5 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-brand-yellow/10 border-brand-yellow text-brand-cream shadow-sm"
                        : "bg-[#181818] border-[#2A2A2A] text-[#BBB] hover:border-[#444]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-heading font-bold text-xs uppercase truncate text-brand-cream">
                          {beer.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0" />}
                      </div>
                      <div className="text-[10px] text-brand-yellow font-specs mb-1">{beer.style}</div>
                      <p className="text-[10px] font-body text-[#888] line-clamp-2 leading-relaxed">
                        {beer.description}
                      </p>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-[#262626] flex items-center justify-between text-[10px] font-specs">
                      <span className="text-[#666]">ABV {beer.abv}</span>
                      <span className="text-brand-yellow font-bold">R$ {beer.price30L} (30L)</span>
                    </div>

                    {isFirstBeer && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#333] text-[#CCC] text-[9px] px-1.5 py-0.2 rounded font-specs border border-[#555]">
                        Já no pedido
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume / Keg Size Selector */}
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-lg p-3 sm:p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-heading font-bold text-xs uppercase text-brand-cream block">
                  Volume do 2º Barril para {selectedBeer.name}
                </span>
                <span className="font-body text-xs text-[#888]">
                  IBU {selectedBeer.ibu} • Teor Alcoólico {selectedBeer.abv}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setKegSize(30)}
                  className={`px-3 py-1.5 rounded text-xs font-specs font-bold uppercase transition-all ${
                    kegSize === 30
                      ? "bg-brand-yellow text-brand-black shadow"
                      : "bg-[#242424] text-[#AAA] hover:text-brand-cream"
                  }`}
                >
                  Barril 30 Litros — R$ {selectedBeer.price30L},00
                </button>
                <button
                  type="button"
                  onClick={() => setKegSize(50)}
                  className={`px-3 py-1.5 rounded text-xs font-specs font-bold uppercase transition-all ${
                    kegSize === 50
                      ? "bg-brand-yellow text-brand-black shadow"
                      : "bg-[#242424] text-[#AAA] hover:text-brand-cream"
                  }`}
                >
                  Barril 50 Litros — R$ {selectedBeer.price50L},00
                </button>
              </div>
            </div>

            {/* Price Preview */}
            <div className="mt-3 pt-2.5 border-t border-[#292929] flex items-center justify-between text-xs font-body">
              <span className="text-[#A8A39E]">
                Valor adicional para este item (mesmo pedido):
              </span>
              <span className="font-specs font-black text-brand-yellow text-base">
                + R$ {currentPrice.toLocaleString("pt-BR")},00
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-[#262626]">
            <button
              type="button"
              onClick={handleDecline}
              className="w-full sm:w-auto px-4 py-2 rounded text-xs font-heading font-bold uppercase text-[#888] hover:text-brand-cream hover:bg-[#222] transition-colors"
            >
              Continuar Sem Segunda Cerveja
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-auto px-5 py-2.5 bg-brand-yellow text-brand-black rounded font-heading font-black text-xs uppercase tracking-wider hover:bg-brand-amber transition-all flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar ao Pedido (+ R$ {currentPrice.toLocaleString("pt-BR")},00)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
