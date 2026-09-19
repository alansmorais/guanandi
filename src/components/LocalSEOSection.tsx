/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Seção de Conteúdo Natural & Local SEO para a Página Inicial
 */

import { Link } from "react-router-dom";
import { MapPin, Truck, Beer, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { LOCAL_CITIES } from "../data/localSeoCities";

export default function LocalSEOSection() {
  const citiesList = Object.values(LOCAL_CITIES);

  return (
    <section className="py-6 sm:py-8 px-4 sm:px-6 bg-[#0B0B0B] border-t border-white/5">
      <div className="max-w-5xl mx-auto space-y-5">
        
        {/* Bloco Natural Solicitado */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow font-specs text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>Cobertura Regional • Litoral Norte de São Paulo</span>
          </div>

          <h2 className="font-heading font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-tight text-white">
            Chope artesanal e estrutura para eventos no Litoral Norte
          </h2>

          <p className="font-body text-xs sm:text-sm text-[#BDBDBD] leading-relaxed">
            Atendemos eventos em <strong>Caraguatatuba</strong>, <strong>São Sebastião</strong>, <strong>Ilhabela</strong> e <strong>Ubatuba</strong> com chope artesanal, chopeiras, barris, Beer Truck e estrutura para festas.
          </p>
        </div>

        {/* 4 Cards de Cidades com Links Amigáveis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {citiesList.map((city) => (
            <Link
              key={city.slug}
              to={`/${city.slug}`}
              className="group bg-[#121212] hover:bg-[#181818] border border-[#242424] hover:border-brand-yellow py-3.5 px-4 rounded transition-all flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-specs text-[11px] font-bold text-brand-yellow uppercase tracking-wider">
                    {city.cityName}
                  </span>
                  <MapPin className="w-3.5 h-3.5 text-[#666] group-hover:text-brand-yellow transition-colors" />
                </div>
                <h3 className="font-heading font-black text-sm uppercase text-white group-hover:text-brand-yellow transition-colors">
                  Chopp & Chopeiras em {city.cityName}
                </h3>
                <p className="font-body text-xs text-[#8E8E8E] line-clamp-2 leading-relaxed">
                  {city.heroSubheadline}
                </p>
              </div>

              <div className="pt-2.5 mt-2.5 border-t border-[#1F1F1F] flex items-center justify-between font-specs text-xs text-brand-yellow font-bold">
                <span>Ver Cobertura Local</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Informações Técnicas de Entrega no Litoral */}
        <div className="bg-[#111] border border-[#222] py-4 px-4 sm:py-5 sm:px-6 rounded space-y-4">
          <div className="space-y-0.5">
            <span className="font-specs font-bold text-xs text-brand-yellow uppercase tracking-wider">
              Compromisso de Frescor e Temperatura
            </span>
            <h3 className="font-heading font-black text-lg uppercase tracking-tight text-white">
              Logística Especializada para o Calor do Litoral
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-body text-xs text-[#A8A39E] leading-relaxed">
            <div className="space-y-1">
              <strong className="text-white font-heading uppercase text-xs block">
                1. Chopeiras de Alta Vazão 220V
              </strong>
              <p>
                Dimensionadas para manter o chopp entre 0°C e 2°C mesmo sob temperaturas externas elevadas. Nossos modelos possuem serpentinas longas e controle digital de refrigeração.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-white font-heading uppercase text-xs block">
                2. Gás CO2 Alimentar e Pressurização
              </strong>
              <p>
                Toda locação inclui cilindro com carga completa e regulador manométrico calibrado, garantindo colarinho cremoso e retenção natural dos aromas de malte e lúpulo.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-white font-heading uppercase text-xs block">
                3. Assistência e Montagem no Local
              </strong>
              <p>
                Nossa equipe posiciona a chopeira, conecta a válvula extratora do barril, executa a primeira sangria e orienta o anfitrião sobre a tiragem correta do chope.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
