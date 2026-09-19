/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link, useNavigate } from "react-router-dom";
import { 
  Beer, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  HelpCircle, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  PhoneCall,
  Clock,
  Compass
} from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import SEOHead from "./SEOHead";
import { LOCAL_CITIES, LocalCityData } from "../data/localSeoCities";

interface LocalLandingPageProps {
  cityKey: "caraguatatuba" | "sao-sebastiao" | "ilhabela" | "ubatuba";
}

export default function LocalLandingPage({ cityKey }: LocalLandingPageProps) {
  const city: LocalCityData = LOCAL_CITIES[cityKey];
  const navigate = useNavigate();

  if (!city) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center text-white">
        Cidade não encontrada.
      </div>
    );
  }

  // Schema.org FAQ & LocalBusiness
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "Brewery"],
        "name": `Cervejaria Guanandi - ${city.cityName}`,
        "description": city.metaDescription,
        "url": `https://guanandi.com.br/${city.slug}`,
        "telephone": "+55-12-99888-7766",
        "priceRange": "$$",
        "areaServed": {
          "@type": "City",
          "name": city.cityName
        },
        "address": {
          "@type": "PostalAddress",
          "addressLocality": city.cityName,
          "addressRegion": "SP",
          "addressCountry": "BR"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": city.faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ]
  };

  const otherCities = Object.entries(LOCAL_CITIES).filter(([k]) => k !== cityKey);

  const handleStartBooking = () => {
    // Guarda a cidade de interesse para auto-preenchimento ou rola até o assistente
    sessionStorage.setItem("guanandi_selected_city", city.cityName);
    navigate("/");
  };

  return (
    <>
      <SEOHead 
        title={city.title}
        description={city.metaDescription}
        canonicalPath={`/${city.slug}`}
        schemaJson={schemaData}
      />

      <Header />

      <main className="flex-grow bg-brand-black text-brand-cream">
        {/* Breadcrumb Semântico */}
        <nav aria-label="Breadcrumb" className="bg-[#0A0A0A] border-b border-white/5 py-2 px-4 sm:px-8 text-[11px] font-specs text-[#777]">
          <div className="max-w-5xl mx-auto flex items-center gap-2">
            <Link to="/" className="hover:text-brand-yellow transition-colors">Início</Link>
            <span>/</span>
            <span>Atendimento Litoral Norte</span>
            <span>/</span>
            <span className="text-brand-yellow font-bold">{city.cityName}</span>
          </div>
        </nav>

        {/* Hero Section Local */}
        <section className="py-6 sm:py-8 px-4 sm:px-8 border-b border-white/5 relative overflow-hidden bg-gradient-to-b from-[#141414] to-[#0D0D0D]">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow rounded font-specs text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              <span>Atendimento Exclusivo • {city.cityName} (Litoral Norte SP)</span>
            </div>

            <h1 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-white max-w-3xl leading-[1.1]">
              {city.heroHeadline}
            </h1>

            <p className="font-body text-xs sm:text-sm text-[#BDBDBD] max-w-2xl leading-relaxed">
              {city.heroSubheadline}
            </p>

            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-md">
              <button
                type="button"
                onClick={handleStartBooking}
                className="btn-primary py-2.5 px-5 font-heading font-black text-xs sm:text-sm uppercase tracking-wider rounded flex items-center justify-center gap-2 bg-brand-yellow text-brand-black hover:bg-yellow-400 transition-colors shadow-lg"
              >
                <span>Fazer Reserva em {city.cityName}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/5512998887766?text=${encodeURIComponent(`Olá! Gostaria de um orçamento de chopp artesanal e chopeira para um evento em ${city.cityName}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 font-heading font-bold text-xs uppercase tracking-wider rounded border border-[#333] hover:border-brand-yellow text-brand-cream hover:text-brand-yellow transition-colors flex items-center justify-center gap-2 bg-[#1A1A1A]"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Direto</span>
              </a>
            </div>

            {/* Quick Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/5 text-xs font-specs">
              <div className="flex items-center gap-2 text-[#999]">
                <Clock className="w-4 h-4 text-brand-yellow" />
                <span>Instalação Agendada</span>
              </div>
              <div className="flex items-center gap-2 text-[#999]">
                <ShieldCheck className="w-4 h-4 text-brand-yellow" />
                <span>Chopp Puro Malte Fresco</span>
              </div>
              <div className="flex items-center gap-2 text-[#999]">
                <Beer className="w-4 h-4 text-brand-yellow" />
                <span>Chopeiras 2 Vias 220V</span>
              </div>
              <div className="flex items-center gap-2 text-[#999]">
                <Truck className="w-4 h-4 text-brand-yellow" />
                <span>Entrega com Suporte</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Logística e Cobertura Local */}
        <section className="py-6 sm:py-8 px-4 sm:px-8 border-b border-white/5 bg-[#0D0D0D]">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="space-y-1">
              <span className="font-specs font-bold text-xs text-brand-yellow uppercase tracking-wider">
                Logística de Entrega
              </span>
              <h2 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-tight text-brand-cream">
                Como Entregamos Chopp em {city.cityName}
              </h2>
              <p className="font-body text-xs sm:text-sm text-[#A8A39E] max-w-2xl">
                {city.logisticsInfo.logisticsDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#141414] border border-[#262626] py-4 px-4 sm:py-5 sm:px-5 rounded space-y-3">
                <h3 className="font-heading font-black text-sm uppercase text-brand-yellow flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  <span>Bairros e Praias Atendidos com Frequência</span>
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-specs text-[#CCC]">
                  {city.logisticsInfo.keyNeighborhoods.map((b) => (
                    <li key={b} className="flex items-center gap-2 bg-[#0A0A0A] p-2 rounded border border-[#222]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#141414] border border-[#262626] py-4 px-4 sm:py-5 sm:px-5 rounded space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading font-black text-sm uppercase text-brand-yellow flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span>Detalhes de Deslocamento & Frete</span>
                  </h3>
                  <div className="mt-2.5 space-y-2 font-specs text-xs text-[#AAA]">
                    <div className="p-2.5 bg-[#0A0A0A] rounded border border-[#222]">
                      <strong className="text-white block mb-0.5">Distância:</strong>
                      <span>{city.logisticsInfo.baseDistance}</span>
                    </div>
                    <div className="p-2.5 bg-[#0A0A0A] rounded border border-[#222]">
                      <strong className="text-white block mb-0.5">Tabela de Transporte:</strong>
                      <span>{city.logisticsInfo.deliveryFeeInfo}</span>
                    </div>
                    <div className="p-2.5 bg-[#0A0A0A] rounded border border-[#222]">
                      <strong className="text-white block mb-0.5">Antecedência Recomendada:</strong>
                      <span className="text-brand-yellow">{city.logisticsInfo.leadTimeNotice}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-yellow/10 border border-brand-yellow/20 p-2.5 rounded text-[11px] font-specs text-brand-cream">
                  💡 <strong>Dica Local em {city.cityName}:</strong> {city.localTip}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Estrutura e Equipamentos Recomendados */}
        <section className="py-6 sm:py-8 px-4 sm:px-8 border-b border-white/5 bg-[#121212]">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="space-y-1">
              <span className="font-specs font-bold text-xs text-brand-yellow uppercase tracking-wider">
                Equipamentos Profissionais
              </span>
              <h2 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-tight text-brand-cream">
                Estrutura de Locação para Eventos em {city.cityName}
              </h2>
              <p className="font-body text-xs sm:text-sm text-[#A8A39E] max-w-2xl">
                Todos os nossos aluguéis acompanham cilindro de CO2 alimentar pressurizado, torneiras belgas com controle de fluxo e suporte técnico.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {city.equipmentHighlights.map((eq) => (
                <div key={eq.name} className="bg-[#171717] border border-[#2A2A2A] py-4 px-4 sm:py-5 sm:px-5 rounded space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-specs font-bold uppercase tracking-wider bg-brand-yellow text-brand-black rounded">
                      {eq.badge}
                    </span>
                    <h3 className="font-heading font-black text-base uppercase text-white">
                      {eq.name}
                    </h3>
                    <p className="font-body text-xs text-[#9E9E9E] leading-relaxed">
                      {eq.detail}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#262626]">
                    <span className="text-[11px] font-specs text-brand-yellow font-bold">
                      ✓ Revisado e higienizado antes do envio
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Ocasiões e Tipos de Eventos */}
        <section className="py-6 sm:py-8 px-4 sm:px-8 border-b border-white/5 bg-[#0D0D0D]">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="space-y-1">
              <span className="font-specs font-bold text-xs text-brand-yellow uppercase tracking-wider">
                Ocasiões Comuns
              </span>
              <h2 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-tight text-brand-cream">
                Tipos de Eventos que Atendemos em {city.cityName}
              </h2>
              <p className="font-body text-xs sm:text-sm text-[#A8A39E] max-w-2xl">
                Do churrasco íntimo de fim de semana aos grandes casamentos e celebrações corporativas na praia.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {city.eventTypes.map((ev, idx) => (
                <div key={idx} className="bg-[#141414] border border-[#262626] py-4 px-4 rounded space-y-2">
                  <div className="w-7 h-7 rounded bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center text-brand-yellow font-heading font-black text-xs">
                    {idx + 1}
                  </div>
                  <h3 className="font-heading font-black text-sm uppercase text-white">
                    {ev.title}
                  </h3>
                  <p className="font-body text-xs text-[#A8A39E] leading-relaxed">
                    {ev.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: FAQ Específica com Schema.org */}
        <section className="py-6 sm:py-8 px-4 sm:px-8 border-b border-white/5 bg-[#121212]">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-brand-yellow font-specs font-bold text-xs uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Dúvidas Frequentes</span>
              </div>
              <h2 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-tight text-brand-cream">
                Perguntas Frequentes sobre Chopp em {city.cityName}
              </h2>
              <p className="font-body text-xs sm:text-sm text-[#A8A39E] max-w-2xl">
                Respostas práticas para quem está planejando locar chopeira e barris de chopp artesanal.
              </p>
            </div>

            <div className="space-y-3 max-w-3xl">
              {city.faqs.map((faq, i) => (
                <div key={i} className="bg-[#181818] border border-[#282828] py-3.5 px-4 rounded space-y-1.5">
                  <h3 className="font-heading font-black text-sm uppercase text-brand-yellow flex items-start gap-2">
                    <span className="text-xs mt-0.5 text-white/50">Q:</span>
                    <span>{faq.question}</span>
                  </h3>
                  <p className="font-body text-xs text-[#B5B5B5] leading-relaxed pl-5">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cross-linking Cidades Vizinhas */}
        <section className="py-5 sm:py-6 px-4 sm:px-8 bg-[#0D0D0D] border-b border-white/5">
          <div className="max-w-5xl mx-auto space-y-3 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="font-heading font-black text-sm uppercase text-white tracking-wide">
                Também Atendemos no Litoral Norte
              </h3>
              <p className="font-body text-xs text-[#777] mt-0.5">
                Conheça as particularidades de entrega e chopeiras para outras localidades da região:
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 sm:pt-0">
              {otherCities.map(([_, c]) => (
                <Link
                  key={c.slug}
                  to={`/${c.slug}`}
                  className="px-2.5 py-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] hover:border-brand-yellow rounded font-specs text-xs text-[#DDD] transition-colors"
                >
                  📍 {c.cityName}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA to Booking Panel */}
        <section className="py-8 sm:py-10 px-4 sm:px-8 text-center bg-gradient-to-t from-[#0A0A0A] to-[#121212]">
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-tight text-white">
              Pronto para Reservar Chopp em {city.cityName}?
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#A8A39E]">
              Faça sua simulação em menos de 2 minutos. Escolha os barris, os dispensadores e veja o valor exato com frete para a sua data.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={handleStartBooking}
                className="btn-primary py-3 px-6 font-heading font-black text-xs sm:text-sm uppercase tracking-wider rounded inline-flex items-center gap-2 bg-brand-yellow text-brand-black hover:bg-yellow-400 transition-colors shadow-xl"
              >
                <span>Iniciar Simulação de Reserva</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
