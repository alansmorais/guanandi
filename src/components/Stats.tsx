/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";

export default function Stats() {
  const stats = [
    { value: "+1.200", label: "Eventos Atendidos" },
    { value: "0%", label: "Chopp Quente (Garantia)" },
    { value: "2 HORAS", label: "Janela Média de Montagem" },
    { value: "4.9 ★", label: "Avaliação dos Anfitriões" },
  ];

  return (
    <section className="w-full bg-white/5 border-y border-white/5 py-12 px-6 md:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center"
          >
            <span className="font-display text-4xl md:text-5xl font-black text-brand-yellow mb-2">{stat.value}</span>
            <span className="font-display text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/40">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
