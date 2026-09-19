/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Calculator, Info, ArrowDown, MapPin } from "lucide-react";
import { CalculationResult } from "../types";
import { BEERS } from "../data";

export default function ChoppCalculator() {
  const [guests, setGuests] = useState(50);
  const [duration, setDuration] = useState(5);
  const [eventType, setEventType] = useState<"churrasco" | "casamento" | "corporativo">("churrasco");
  const [isLitoralRoute, setIsLitoralRoute] = useState(false);
  
  const [result, setResult] = useState<CalculationResult>({
    liters: 100,
    cups: 330,
    kegSetup: "2 Barris de 50 Litros",
    machineSetup: "Elétrica 2 Vias (70L/h)",
    estimatedPrice: 1500,
    logisticsFee: 0,
  });

  const rates = {
    churrasco: 1.8,
    casamento: 1.3,
    corporativo: 1.0,
  };

  const pilsenPriceL = 15; // R$ 15,00/L as per user request

  useEffect(() => {
    const factor = rates[eventType];
    const durationMultiplier = 1 + ((duration - 4) * 0.08);
    let calculatedLiters = Math.round(guests * factor * Math.max(0.85, durationMultiplier));

    // Round to nearest 10L for keg modularity
    calculatedLiters = Math.max(30, Math.ceil(calculatedLiters / 10) * 10);

    let kegSetup = "";
    let priceEstimate = 0;
    let machine = "Choppeira Bancada 1 Via";

    const pilsen30L = 450; // 30 * 15
    const pilsen50L = 750; // 50 * 15

    if (calculatedLiters <= 30) {
      kegSetup = "1 Barril de 30 Litros";
      priceEstimate = pilsen30L;
      machine = "Bancada Portátil 1 Via";
    } else if (calculatedLiters <= 50) {
      kegSetup = "1 Barril de 50 Litros";
      priceEstimate = pilsen50L;
      machine = "Bancada Portátil 1 Via";
    } else if (calculatedLiters <= 80) {
      kegSetup = "1x 50L + 1x 30L (80 Litros)";
      priceEstimate = pilsen50L + pilsen30L;
      machine = "Elétrica 2 Vias (70L/h)";
    } else if (calculatedLiters <= 100) {
      kegSetup = "2 Barris de 50 Litros";
      priceEstimate = pilsen50L * 2;
      machine = "Elétrica 2 Vias (70L/h)";
    } else if (calculatedLiters <= 150) {
      kegSetup = "3 Barris de 50 Litros";
      priceEstimate = pilsen50L * 3;
      machine = "Torre Naja 2 Vias Dupla";
    } else {
      const num50 = Math.ceil(calculatedLiters / 50);
      kegSetup = `${num50} Barris de 50 Litros (${num50 * 50}L)`;
      priceEstimate = num50 * pilsen50L;
      machine = "Torre Naja + Ponto Extra";
    }

    const logisticsFee = isLitoralRoute ? 220 : 0;

    setResult({
      liters: calculatedLiters,
      cups: Math.round((calculatedLiters * 1000) / 300),
      kegSetup,
      machineSetup: machine,
      estimatedPrice: priceEstimate,
      logisticsFee: logisticsFee,
    });
  }, [guests, duration, eventType, isLitoralRoute]);

  return (
    <section id="calculadora-de-chopp" className="w-full py-24 px-6 md:px-10 bg-brand-black">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/5 border border-white/10 p-8 md:p-12 space-y-12">
          <div className="space-y-4 border-b border-white/10 pb-8">
            <div className="inline-flex items-center gap-2 font-display text-xs font-black uppercase tracking-widest text-brand-amber">
              <Calculator className="w-4 h-4" />
              <span>Simulador de Litragem Exata Guanandi</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold uppercase text-white tracking-tight">
              Calculadora Rápida de Chopp para o Seu Evento
            </h2>
            <p className="font-body text-white/50 max-w-2xl">
              Evite a frustração de faltar chopp ou o desperdício excessivo. Ajuste os parâmetros abaixo e calcule os barris necessários em tempo real.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Inputs Column */}
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-4">
                <label className="block font-display text-xs font-black uppercase text-brand-amber tracking-widest">
                  1. Tipo de Comemoração
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(["churrasco", "casamento", "corporativo"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setEventType(type)}
                      className={`p-5 text-left border transition-all ${
                        eventType === type 
                        ? "bg-brand-yellow text-brand-black border-brand-yellow" 
                        : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="font-display text-lg font-black uppercase">{type}</div>
                      <div className="font-body text-[10px] opacity-60">
                        {rates[type]} Litros / pessoa
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-display text-xs font-black uppercase text-brand-amber tracking-widest">
                      2. Número de Convidados
                    </label>
                    <span className="font-display text-xl font-black text-brand-yellow bg-white/5 px-4 py-1">
                      {guests} Pessoas
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="250" 
                    step="5"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full accent-brand-yellow h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between font-display text-[10px] text-white/20 uppercase font-bold">
                    <span>10 pax</span>
                    <span>100 pax</span>
                    <span>250+ pax</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-display text-xs font-black uppercase text-brand-amber tracking-widest">
                      3. Duração Prevista
                    </label>
                    <span className="font-display text-xl font-black text-brand-yellow bg-white/5 px-4 py-1">
                      {duration} Horas
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="2" 
                    max="12" 
                    step="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full accent-brand-yellow h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between font-display text-[10px] text-white/20 uppercase font-bold">
                    <span>2 horas</span>
                    <span>6 horas</span>
                    <span>12 horas</span>
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <label className="font-display text-xs font-black uppercase text-brand-amber tracking-widest block">
                    4. Logística do Litoral
                  </label>
                  <button 
                    onClick={() => setIsLitoralRoute(!isLitoralRoute)}
                    className={`w-full p-4 border flex items-center gap-4 transition-all ${
                      isLitoralRoute ? "bg-brand-yellow/10 border-brand-yellow text-white" : "bg-white/5 border-white/10 text-white/40"
                    }`}
                  >
                    <div className={`w-5 h-5 border flex items-center justify-center ${isLitoralRoute ? "bg-brand-yellow border-brand-yellow" : "border-white/20"}`}>
                      {isLitoralRoute && <MapPin className="w-3 h-3 text-brand-black" />}
                    </div>
                    <div className="text-left">
                      <div className="font-display text-xs font-black uppercase">Rota São Sebastião ↔ Caraguatatuba</div>
                      <div className="font-body text-[10px] tracking-tight">Taxa de deslocamento para The Beer Truck (R$ 220,00)</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-white/5 p-4 flex items-center gap-3 border-l-4 border-brand-yellow text-white/60 text-[11px] font-bold uppercase font-display">
                <Info className="w-4 h-4 text-brand-yellow" />
                <span>Cálculo considerando margem de segurança de 10% para evitar falta antes do término.</span>
              </div>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-5 bg-brand-black border border-white/10 p-8 flex flex-col justify-between h-full">
              <div className="space-y-8">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="font-display text-xs font-black uppercase text-white/40 tracking-widest">Recomendação Guanandi</span>
                  <div className="w-2.5 h-2.5 bg-brand-yellow rounded-full animate-pulse" />
                </div>

                <div className="py-8 text-center bg-white/5 space-y-2 border border-white/5">
                  <span className="font-display text-[10px] font-black uppercase text-white/40 tracking-widest">Volume Total Recomendado</span>
                  <span className="font-display text-7xl font-black text-brand-yellow block">{result.liters}L</span>
                  <span className="font-body text-xs text-white/40">~ {result.cups} copos de 300ml servidos</span>
                </div>

                <div className="space-y-4 font-display">
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-[10px] text-white/30 uppercase font-bold">Configuração de Barris:</span>
                    <span className="text-sm font-black text-white uppercase">{result.kegSetup}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-[10px] text-white/30 uppercase font-bold">Choppeira Indicada:</span>
                    <span className="text-sm font-black text-brand-amber uppercase">{result.machineSetup}</span>
                  </div>
                  {result.logisticsFee ? (
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-[10px] text-white/30 uppercase font-bold">Taxa de Logística:</span>
                      <span className="text-sm font-black text-brand-yellow uppercase">R$ {result.logisticsFee},00</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[10px] text-white/30 uppercase font-bold">Total Estimado (Pilsen):</span>
                    <span className="text-2xl font-black text-white">R$ {(result.estimatedPrice + (result.logisticsFee || 0)).toLocaleString("pt-BR")},00</span>
                  </div>
                </div>
              </div>

              <a 
                href="#reserva"
                className="w-full mt-8 bg-brand-yellow text-brand-black py-5 font-display text-lg font-black uppercase tracking-tight hover:bg-brand-amber transition-all flex items-center justify-center gap-3 text-center"
              >
                <span>Reservar esta Opção</span>
                <ArrowDown className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
