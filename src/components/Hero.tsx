/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ArrowRight, Calculator, Hammer, Thermometer, Beer, Lock } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-brand-black">
      {/* Background Decorative Element */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/80 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1571705042748-55fdee1ea47b?auto=format&fit=crop&q=80&w=2000" 
          alt="Brewery background" 
          className="w-full h-full object-cover grayscale"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-8 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 text-brand-amber font-display text-[10px] md:text-xs font-black uppercase tracking-widest"
          >
            <span className="w-2 h-2 bg-brand-amber rounded-full animate-ping" />
            <span>Pronto Atendimento para Fins de Semana & Eventos</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase leading-[0.9] tracking-tighter text-white">
              Chopp Fresco na Sua Festa com <span className="text-brand-yellow block">Estrutura Profissional</span>
            </h1>
            <p className="font-body text-base md:text-lg text-white/50 max-w-2xl">
              Locação completa de choppeiras elétricas e a gelo com barris de chopp puro malte artesanal, direto dos tanques da Cervejaria Guanandi. Entrega técnica pontual e suporte 24h.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {[
              { icon: Beer, label: "Barris Disponíveis", value: "30L e 50L Inox" },
              { icon: Thermometer, label: "Choppeiras Elétricas", value: "1 ou 2 Vias (70L/h)" },
              { icon: Hammer, label: "Instalação Inclusa", value: "Equipe Especializada" },
            ].map((spec, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-4 flex items-center gap-4 group hover:border-brand-yellow/30 transition-colors">
                <spec.icon className="w-8 h-8 text-brand-yellow" />
                <div>
                  <div className="font-display text-[10px] uppercase font-bold text-brand-yellow/60">{spec.label}</div>
                  <div className="font-display text-sm font-black uppercase text-white">{spec.value}</div>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-4"
          >
            <a 
              href="#orcamento"
              className="bg-brand-yellow text-brand-black px-8 py-4 font-display text-base font-black uppercase tracking-tight hover:bg-brand-amber transition-all shadow-[4px_4px_0px_#F5EFEB] hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex items-center gap-2"
            >
              <span>Monte Seu Orçamento</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <a 
              href="#calculadora-de-chopp"
              className="bg-white/5 border border-white/10 text-white px-6 py-4 font-display text-base font-black uppercase tracking-tight hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Calculator className="w-5 h-5 text-brand-yellow" />
              <span>Calcular Litragem</span>
            </a>
            <div className="flex items-center gap-2 text-white/40 font-display text-[10px] uppercase font-bold pl-4 border-l border-white/10">
              <Lock className="w-3 h-3 text-brand-yellow" />
              <span>Sem caução abusivo • Contrato simples</span>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-4"
        >
          <div className="bg-white/5 border border-white/10 p-8 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-brand-yellow text-brand-black font-display text-[10px] font-black px-3 py-1 uppercase">Disponibilidade Hoje</div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center p-2">
                <img src="https://raw.githubusercontent.com/google/material-design-icons/master/png/action/visibility/materialicons/24dp/2x/baseline_visibility_black_24dp.png" alt="Seal" />
              </div>
              <div>
                <span className="font-display text-xs text-brand-yellow font-black uppercase block">Linha Direta de Fábrica</span>
                <span className="font-display text-2xl text-white font-black uppercase leading-tight">Padrão Guanandi</span>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-white/10 font-display">
              <div className="flex justify-between items-center">
                <span className="text-white/40 uppercase text-[10px] font-bold">Pressão de CO2</span>
                <span className="text-brand-yellow font-black">2.4 BAR REGULADO</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/40 uppercase text-[10px] font-bold">Temperatura de Saída</span>
                <span className="text-brand-amber font-black">-1.0°C A 1.5°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/40 uppercase text-[10px] font-bold">Taxa de Sanitização</span>
                <span className="text-white font-black">100% CERTIFICADA</span>
              </div>
            </div>

            <div className="bg-brand-black p-4 flex items-center justify-between border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-brand-yellow rounded-full animate-pulse" />
                <span className="font-display text-[10px] font-black uppercase text-white/60">Barris Envasados Hoje</span>
              </div>
              <span className="font-display text-lg font-black text-brand-yellow">38 DISPONÍVEIS</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
