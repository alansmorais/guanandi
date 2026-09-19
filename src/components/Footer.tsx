/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Phone, Mail, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full bg-[#080808] border-t border-[#1C1C1C] py-6 sm:py-7 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-brand-yellow text-brand-black flex items-center justify-center font-specs font-black text-sm">
              GN
            </div>
            <span className="font-heading font-black text-sm uppercase text-brand-cream">Cervejaria Guanandi</span>
          </div>
          <p className="font-body text-xs text-[#807A75] leading-relaxed">
            Dispensadores de chopp profissionais, barris frescos e infraestrutura completa para casamentos, confraternizações e eventos particulares no Litoral Norte de SP.
          </p>
          <div className="text-[10px] font-specs text-[#555] uppercase">
            Produção Artesanal com Registro MAPA Ativo
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-heading font-black text-xs uppercase text-brand-yellow tracking-wider">Região de Atendimento</h4>
          <ul className="space-y-1 font-body text-xs text-[#A8A39E]">
            <li>
              <Link to="/chope-sao-sebastiao" className="hover:text-brand-yellow transition-colors block">
                • São Sebastião (Centro & Praias)
              </Link>
            </li>
            <li>
              <Link to="/chope-caraguatatuba" className="hover:text-brand-yellow transition-colors block">
                • Caraguatatuba (Condomínios & Eventos)
              </Link>
            </li>
            <li>
              <Link to="/chope-ilhabela" className="hover:text-brand-yellow transition-colors block">
                • Ilhabela (Casamentos & Pousadas)
              </Link>
            </li>
            <li>
              <Link to="/chope-ubatuba" className="hover:text-brand-yellow transition-colors block">
                • Ubatuba (Temporada & Festas)
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-heading font-black text-xs uppercase text-brand-yellow tracking-wider">Padrão Operacional</h4>
          <ul className="space-y-1 font-body text-xs text-[#A8A39E]">
            <li>• Chopeiras elétricas 2 vias (Preto / Inox)</li>
            <li>• Teste de temperatura e pressão na entrega</li>
            <li>• Higienização CIP bactericida entre eventos</li>
            <li>• Agendamento mínimo de 7 dias de antecedência</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-heading font-black text-xs uppercase text-brand-yellow tracking-wider">Plantão de Eventos</h4>
          <div className="space-y-1.5 font-body text-xs text-[#A8A39E]">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-brand-yellow" />
              <span>(12) 99888-7766</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-brand-yellow" />
              <span>reservas@guanandi.com.br</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-brand-yellow" />
              <span>São Sebastião — SP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 pt-3 border-t border-[#181818] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] font-specs text-[#777]">
        <div>
          © {new Date().getFullYear()} Cervejaria Guanandi. Desenvolvido por{" "}
          <a
            href="https://alansmsolutions.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-yellow font-bold hover:underline transition-colors"
          >
            ASM Solutions
          </a>
        </div>
        <div className="flex items-center gap-4 text-[#555]">
          <span>60% Black • 30% Yellow • 10% Accents</span>
          <span>Beba com moderação. Venda proibida para menores de 18 anos.</span>
        </div>
      </div>
    </footer>
  );
}
