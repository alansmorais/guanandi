/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Headphones, ShieldCheck, Thermometer } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      id: "01",
      title: "Escolha os Estilos & Choppeira",
      desc: "Selecione entre barris de 30L ou 50L dos nossos estilos artesanais e defina se prefere choppeira elétrica ou a gelo.",
    },
    {
      id: "02",
      title: "Agende Data e Janela Horária",
      desc: "Defina o melhor horário no local do evento. Recomendamos a montagem técnica com 2 a 3 horas de antecedência.",
    },
    {
      id: "03",
      title: "Entrega, Instalação e Teste",
      desc: "Nossa equipe técnica transporta, conecta o CO2, regula a vazão e tira o primeiro copo aferindo a temperatura.",
    },
    {
      id: "04",
      title: "Recolhimento Sem Dor de Cabeça",
      desc: "No dia útil seguinte ao evento, passamos no local para recolher barris vazios e choppeira. Sem trabalho pós-festa.",
    },
  ];

  return (
    <section className="w-full py-24 px-6 md:px-10 bg-white/5">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="font-display text-xs font-black uppercase text-brand-amber tracking-[0.3em] block">Sem Estresse para o Anfitrião</span>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold uppercase text-white tracking-tight">
            Como Funciona a Locação Guanandi
          </h2>
          <p className="font-body text-white/50">
            Nossa operação é desenhada para você apenas brindar com seus convidados. Cuidamos da logística pesada, da pressão correta de gás e da limpeza terminal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-brand-black border border-white/5 p-8 space-y-6 relative group hover:border-brand-yellow/20 transition-all"
            >
              <span className="font-display text-7xl font-black text-white/5 absolute top-2 right-4 select-none group-hover:text-brand-yellow/10 transition-colors">{step.id}</span>
              <div className="w-12 h-12 bg-brand-yellow text-brand-black flex items-center justify-center font-display text-xl font-black">
                {i + 1}
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="font-display text-xl font-black uppercase text-white leading-tight">{step.title}</h3>
                <p className="font-body text-sm text-white/40">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          {[
            { icon: Headphones, title: "Plantão Técnico 24h", desc: "Qualquer eventualidade durante a festa, um técnico é deslocado imediatamente." },
            { icon: ShieldCheck, title: "Sanitização CIP", desc: "Todas as serpentinas passam por desinfecção química bactericida antes de cada envio." },
            { icon: Thermometer, title: "Chopp a -1°C Garantido", desc: "Seu chopp sai estupidamente gelado da primeira até a última gota do barril." },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 p-6 flex items-start gap-4 border border-white/5">
              <item.icon className="w-8 h-8 text-brand-yellow shrink-0" />
              <div className="space-y-1">
                <span className="font-display text-sm font-black uppercase text-white block">{item.title}</span>
                <p className="font-body text-xs text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
