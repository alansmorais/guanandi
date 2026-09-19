/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import Header from "./components/Header";
import BeerCatalog from "./components/BeerCatalog";
import EquipmentCatalog from "./components/EquipmentCatalog";
import Footer from "./components/Footer";
import BookingWizard from "./components/BookingWizard";
import AdminLogin from "./components/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminLeads from "./components/admin/AdminLeads";
import AdminInventory from "./components/admin/AdminInventory";
import AdminReservations from "./components/admin/AdminReservations";
import AdminDeveloper from "./components/admin/AdminDeveloper";
import LocalLandingPage from "./components/LocalLandingPage";
import LocalSEOSection from "./components/LocalSEOSection";
import SEOHead from "./components/SEOHead";
import { MapPin } from "lucide-react";

const HOME_SCHEMA_JSON = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Brewery", "LocalBusiness"],
      "name": "Cervejaria Guanandi",
      "url": "https://guanandi.com.br/",
      "telephone": "+55-12-99888-7766",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "São Sebastião",
        "addressRegion": "SP",
        "addressCountry": "BR"
      },
      "areaServed": [
        { "@type": "City", "name": "Caraguatatuba" },
        { "@type": "City", "name": "São Sebastião" },
        { "@type": "City", "name": "Ilhabela" },
        { "@type": "City", "name": "Ubatuba" }
      ],
      "description": "Locação de chopeiras elétricas 2 vias, barris de chopp artesanal fresco e Beer Truck para eventos em Caraguatatuba, São Sebastião, Ilhabela e Ubatuba."
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Qual é a antecedência mínima para alugar chopeira no Litoral Norte?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Trabalhamos com agendamento mínimo de 7 dias de antecedência para assegurar chopp recém-embarrilado e escala de montagem técnica."
          }
        },
        {
          "@type": "Question",
          "name": "Vocês entregam chopp e chopeira em Caraguatatuba, São Sebastião, Ilhabela e Ubatuba?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sim! Cobrimos as quatro cidades com rotas programadas, incluindo atendimento em condomínios e logística de travessia de balsa em Ilhabela."
          }
        },
        {
          "@type": "Question",
          "name": "O que está incluído na locação da chopeira?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A chopeira acompanha cilindro de gás CO2 alimentar cheio, válvula extratora, mangueiras atóxicas, instalação técnica e teste de pressão no local."
          }
        }
      ]
    }
  ]
};

function LandingPage() {
  return (
    <>
      <SEOHead 
        title="Cervejaria Guanandi | Chope Artesanal & Locação de Chopeiras no Litoral Norte"
        description="Locação de chopeiras elétricas 2 vias, barris de chopp artesanal 30L e 50L, e Beer Truck em Caraguatatuba, São Sebastião, Ilhabela e Ubatuba. Faça sua reserva online."
        canonicalPath="/"
        schemaJson={HOME_SCHEMA_JSON}
      />

      <Header />
      <main className="flex-grow">
        {/* SaaS Booking Application Workspace */}
        <section id="booking-panel" className="py-4 sm:py-6 px-4 sm:px-6 bg-[#0D0D0D]">
          <div className="max-w-4xl mx-auto space-y-4">
            
            {/* Header com SEO Natural e Foco na Experiência */}
            <div className="space-y-1.5 text-center sm:text-left sm:flex sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 font-specs font-bold text-xs uppercase tracking-wider text-brand-yellow">
                  <span>Plataforma Oficial de Locação</span>
                  <span>•</span>
                  <span>Litoral Norte SP</span>
                </div>
                
                <h1 className="font-heading font-black text-2xl sm:text-3xl uppercase text-brand-cream tracking-tight mt-0.5">
                  Locação de Chopeiras & Barris
                </h1>
                
                <h2 className="font-heading font-black text-xs sm:text-sm uppercase text-brand-yellow tracking-wide mt-0.5">
                  Chope artesanal e estrutura para eventos no Litoral Norte
                </h2>
                
                <p className="font-body text-xs sm:text-sm text-[#A8A39E] max-w-xl mt-1 leading-relaxed">
                  Atendemos eventos em <strong>Caraguatatuba</strong>, <strong>São Sebastião</strong>, <strong>Ilhabela</strong> e <strong>Ubatuba</strong> com chope artesanal, chopeiras, barris, Beer Truck e estrutura para festas.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end text-xs font-specs text-[#777]">
                <span className="text-brand-yellow font-bold">Mínimo 7 dias de antecedência</span>
                <span>Base São Sebastião ↔ Caraguatatuba</span>
              </div>
            </div>

            {/* Cidades Atendidas - Links Rápidos e Naturais */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 border-t border-white/5 text-xs font-specs">
              <span className="text-[#777] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-yellow" />
                <span>Páginas Locais:</span>
              </span>
              <Link 
                to="/chope-caraguatatuba" 
                className="px-2.5 py-1 bg-[#161616] hover:bg-[#202020] border border-[#2B2B2B] hover:border-brand-yellow rounded text-[#CCC] hover:text-brand-yellow transition-colors"
              >
                Caraguatatuba
              </Link>
              <Link 
                to="/chope-sao-sebastiao" 
                className="px-2.5 py-1 bg-[#161616] hover:bg-[#202020] border border-[#2B2B2B] hover:border-brand-yellow rounded text-[#CCC] hover:text-brand-yellow transition-colors"
              >
                São Sebastião
              </Link>
              <Link 
                to="/chope-ilhabela" 
                className="px-2.5 py-1 bg-[#161616] hover:bg-[#202020] border border-[#2B2B2B] hover:border-brand-yellow rounded text-[#CCC] hover:text-brand-yellow transition-colors"
              >
                Ilhabela
              </Link>
              <Link 
                to="/chope-ubatuba" 
                className="px-2.5 py-1 bg-[#161616] hover:bg-[#202020] border border-[#2B2B2B] hover:border-brand-yellow rounded text-[#CCC] hover:text-brand-yellow transition-colors"
              >
                Ubatuba
              </Link>
            </div>

            {/* The Booking Application: Primary Focus */}
            <BookingWizard />
          </div>
        </section>

        {/* Compact Reference Catalogs */}
        <BeerCatalog />
        <EquipmentCatalog />

        {/* Local SEO Section with Real Content and FAQs */}
        <div id="cidades">
          <LocalSEOSection />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <Router>
        <div className="min-h-screen flex flex-col selection:bg-brand-yellow selection:text-brand-black bg-brand-black">
          <Routes>
            {/* Página Inicial com Booking e SEO Integrado */}
            <Route path="/" element={<LandingPage />} />

            {/* Rotas Locais Específicas por Cidade (Litoral Norte SP) */}
            <Route path="/chope-caraguatatuba" element={<LocalLandingPage cityKey="caraguatatuba" />} />
            <Route path="/chope-sao-sebastiao" element={<LocalLandingPage cityKey="sao-sebastiao" />} />
            <Route path="/chope-ilhabela" element={<LocalLandingPage cityKey="ilhabela" />} />
            <Route path="/chope-ubatuba" element={<LocalLandingPage cityKey="ubatuba" />} />

            {/* Painel Administrativo Seguro */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="reservations" element={<AdminReservations />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="developer" element={<AdminDeveloper />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </FirebaseProvider>
  );
}
