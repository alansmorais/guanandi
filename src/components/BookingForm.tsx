/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Send, MessageSquare, CheckCircle, ArrowRight } from "lucide-react";
import React, { useState } from "react";

export default function BookingForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <section id="contato" className="w-full py-24 px-6 md:px-10 bg-brand-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left side: WhatsApp CTA */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 p-8 md:p-12 flex flex-col justify-between space-y-12 relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-brand-yellow/10 border border-brand-yellow/20 px-3 py-1 text-brand-yellow font-display text-[10px] font-black uppercase tracking-widest">
              <span className="w-2 h-2 bg-brand-yellow rounded-full animate-ping" />
              <span>Plantão de Atendimento Imediato</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold uppercase text-white leading-[0.9] tracking-tighter">
              Reserve Sua Choppeira para o <span className="text-brand-yellow">Fim de Semana</span>
            </h2>
            <p className="font-body text-white/50">
              Nossa grade de equipamentos costuma esgotar com até 48 horas de antecedência nas sextas e sábados. Fale agora diretamente com nosso mestre cervejeiro.
            </p>
            <div className="space-y-3 font-display text-xs font-bold uppercase tracking-wide">
              <div className="flex items-center gap-3 text-white">
                <CheckCircle className="w-4 h-4 text-brand-yellow" />
                <span>Confirmação imediata de barris</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <CheckCircle className="w-4 h-4 text-brand-yellow" />
                <span>Sem cobrança antecipada abusiva</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <CheckCircle className="w-4 h-4 text-brand-yellow" />
                <span>Emissão de Nota Fiscal e contrato</span>
              </div>
            </div>
          </div>

          <div className="pt-12 relative z-10">
            <a 
              href="https://wa.me/5567999990000"
              className="group flex items-center justify-between w-full bg-brand-yellow text-brand-black p-8 transition-all hover:bg-brand-amber shadow-[8px_8px_0px_#F5EFEB] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            >
              <div className="flex items-center gap-6">
                <MessageSquare className="w-12 h-12" />
                <div className="text-left">
                  <span className="font-display text-[10px] font-black uppercase tracking-widest block opacity-60">Conversar Agora via WhatsApp</span>
                  <span className="font-display text-3xl font-black uppercase block">(67) 99999-0000</span>
                </div>
              </div>
              <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </a>
            <span className="block text-center font-display text-[10px] font-bold uppercase text-white/20 mt-6 tracking-[0.2em]">
              Tempo médio de resposta: 4 minutos
            </span>
          </div>
        </div>

        {/* Right side: Detailed Form */}
        <div className="lg:col-span-7 bg-white/5 border border-white/10 p-8 md:p-12">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2 border-b border-white/10 pb-6">
                <h3 className="font-display text-2xl font-black uppercase text-white tracking-tight">Formulário de Pré-Reserva</h3>
                <p className="font-body text-xs text-white/40">Preencha os dados e receba nossa proposta formal com detalhes técnicos.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block font-display text-[10px] font-black uppercase text-brand-yellow tracking-widest">Seu Nome Completo</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex: Roberto Silva"
                    className="w-full bg-brand-black border border-white/10 p-4 text-white font-body text-sm focus:outline-none focus:border-brand-yellow transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-display text-[10px] font-black uppercase text-brand-yellow tracking-widest">WhatsApp / Telefone</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="(67) 99999-0000"
                    className="w-full bg-brand-black border border-white/10 p-4 text-white font-body text-sm focus:outline-none focus:border-brand-yellow transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block font-display text-[10px] font-black uppercase text-brand-yellow tracking-widest">Data do Evento</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full bg-brand-black border border-white/10 p-4 text-white font-body text-sm focus:outline-none focus:border-brand-yellow transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-display text-[10px] font-black uppercase text-brand-yellow tracking-widest">Bairro / Cidade</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex: Chácara Cachoeira, CG"
                    className="w-full bg-brand-black border border-white/10 p-4 text-white font-body text-sm focus:outline-none focus:border-brand-yellow transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-display text-[10px] font-black uppercase text-brand-yellow tracking-widest">Observações Adicionais</label>
                <textarea 
                  rows={3}
                  placeholder="Ex: Local tem escadas? Ponto de tomada 220V próximo?"
                  className="w-full bg-brand-black border border-white/10 p-4 text-white font-body text-sm focus:outline-none focus:border-brand-yellow transition-colors resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-white/5 border border-white/10 text-brand-yellow py-5 font-display text-lg font-black uppercase tracking-tight hover:bg-brand-yellow hover:text-brand-black transition-all flex items-center justify-center gap-3"
              >
                <span>Enviar Solicitação de Orçamento</span>
                <Send className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12"
            >
              <div className="w-20 h-20 bg-brand-yellow rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-brand-black" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-3xl font-black uppercase text-white">Solicitação Recebida!</h3>
                <p className="font-body text-sm text-white/50 max-w-sm">
                  Nossa equipe técnica já está conferindo a rota e disponibilidade de barris. Em instantes entraremos em contato.
                </p>
              </div>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="font-display text-xs font-bold uppercase text-brand-yellow tracking-widest hover:underline"
              >
                Voltar ao formulário
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
