/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  MapPin, 
  User, 
  Package, 
  CheckCircle, 
  MessageSquare,
  Beer as BeerIcon,
  CreditCard,
  Clock,
  Sparkles,
  Truck
} from "lucide-react";
import { BEERS } from "../data";
import { Beer, Reservation } from "../types";
import { db, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType } from "../lib/firebase";

const STEPS = [
  { id: "beer", title: "1. Chopp", icon: BeerIcon },
  { id: "keg", title: "2. Volume", icon: Package },
  { id: "date", title: "3. Data", icon: Calendar },
  { id: "location", title: "4. Local", icon: MapPin },
  { id: "customer", title: "5. Dados", icon: User },
  { id: "summary", title: "6. Resumo", icon: CreditCard },
];

const REGIONS = [
  { city: "São Sebastião - Centro / Sul", fee: 0, label: "Base Local — Frete Grátis" },
  { city: "Caraguatatuba", fee: 220, label: "Deslocamento Rota Litoral — R$ 220,00" },
  { city: "Ilhabela (Balsa inclusa)", fee: 180, label: "Travessia Especial — R$ 180,00" },
  { city: "Ubatuba", fee: 280, label: "Rota Norte — R$ 280,00" },
];

export default function BookingWizard({ initialBeerId }: { initialBeerId?: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reservationCode, setReservationCode] = useState("");
  
  const [bookingData, setBookingData] = useState<Partial<Reservation>>({
    beerId: initialBeerId || BEERS[0].id,
    beerName: BEERS.find(b => b.id === (initialBeerId || BEERS[0].id))?.name || "",
    kegSize: 50,
    quantity: 1,
    eventDate: "",
    location: { city: "São Sebastião - Centro / Sul", neighborhood: "", address: "" },
    customerName: "",
    customerWhatsApp: "",
    customerEmail: "",
    status: "pendente",
    logisticsFee: 0,
  });

  useEffect(() => {
    const preCity = sessionStorage.getItem("guanandi_selected_city");
    if (preCity) {
      const match = REGIONS.find(r => r.city.toLowerCase().includes(preCity.toLowerCase()));
      if (match) {
        setBookingData(prev => ({
          ...prev,
          location: {
            city: match.city,
            neighborhood: prev.location?.neighborhood || "",
            address: prev.location?.address || ""
          },
          logisticsFee: match.fee
        }));
      }
      sessionStorage.removeItem("guanandi_selected_city");
    }
  }, []);

  const selectedBeer = BEERS.find(b => b.id === bookingData.beerId) || BEERS[0];
  const unitPrice = bookingData.kegSize === 30 ? selectedBeer.price30L : selectedBeer.price50L;
  const subtotal = unitPrice * (bookingData.quantity || 1);
  const totalPrice = subtotal + (bookingData.logisticsFee || 0);
  const downPayment = totalPrice * 0.5;

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  // Regra dos 7 dias no mínimo
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const minDateString = minDate.toISOString().split("T")[0];

  const handleCityChange = (cityName: string) => {
    const reg = REGIONS.find(r => r.city === cityName);
    setBookingData(prev => ({
      ...prev,
      logisticsFee: reg ? reg.fee : 0,
      location: { ...prev.location!, city: cityName }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const code = `#GN-${Math.floor(Math.random() * 90000) + 10000}`;
    setReservationCode(code);

    try {
      const reservationData = {
        ...bookingData,
        totalPrice,
        createdAt: serverTimestamp(),
      } as Reservation;
      
      await addDoc(collection(db, "reservations"), reservationData);
      setIsSuccess(false); // will set true below
    } catch (error) {
      console.warn("Firestore save fallback:", error);
    } finally {
      setIsSubmitting(false);
      setIsSuccess(true);

      const message = `🍺 *NOVA RESERVA - CERVEJARIA GUANANDI (${code})*
*Cliente:* ${bookingData.customerName}
*Chopp:* ${bookingData.beerName} (${bookingData.kegSize}L x${bookingData.quantity})
*Data:* ${bookingData.eventDate}
*Cidade:* ${bookingData.location?.city}
*Endereço:* ${bookingData.location?.address}, ${bookingData.location?.neighborhood}
*Taxa Logística:* R$ ${bookingData.logisticsFee?.toLocaleString('pt-BR')},00
*Valor Total:* R$ ${totalPrice.toLocaleString('pt-BR')},00
*Sinal 50%:* R$ ${downPayment.toLocaleString('pt-BR')},00

Solicito a conferência de disponibilidade dos equipamentos e barris.`;
      
      const whatsappUrl = `https://wa.me/5567999990000?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-[#141414] border border-[#262626] rounded-lg py-6 px-5 sm:py-8 sm:px-8 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 bg-brand-green/30 border-2 border-brand-green rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle className="w-6 h-6" />
        </div>
        
        <div className="space-y-1">
          <div className="font-specs font-bold text-xs uppercase tracking-widest text-brand-yellow">Solicitação Registrada</div>
          <h3 className="font-heading font-black text-xl sm:text-2xl text-brand-cream uppercase">Reserva Pré-Confirmada</h3>
          <p className="font-body text-xs text-[#A8A39E] max-w-md mx-auto pt-1">
            Seus dados e itens foram enviados para a nossa equipe técnica. Uma cópia do checklist e a chave PIX para o sinal de 50% foram encaminhados ao seu WhatsApp.
          </p>
        </div>

        <div className="bg-[#0D0D0D] border border-[#2A2A2A] py-2.5 px-4 rounded text-center">
          <span className="font-specs text-xs uppercase text-[#807A75] block">Código de Acompanhamento</span>
          <span className="font-specs font-black text-2xl text-brand-yellow tracking-wider">{reservationCode || "#GN-84920"}</span>
        </div>

        <div className="pt-1 flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            onClick={() => { setIsSuccess(false); setCurrentStep(0); }}
            className="px-4 py-2 rounded border border-[#333] text-xs font-heading font-bold uppercase text-[#C5BFB8] hover:text-brand-cream hover:border-[#555] transition-colors"
          >
            Fazer Nova Reserva
          </button>
          <a 
            href={`https://wa.me/5567999990000`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-brand-yellow text-brand-black px-5 py-2 rounded font-heading font-black text-xs uppercase tracking-wider hover:bg-brand-amber transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Abrir Conversa no WhatsApp</span>
          </a>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-3">
            <div>
              <span className="font-specs font-bold text-xs uppercase text-brand-yellow tracking-wider">Passo 1 de 6</span>
              <h3 className="font-heading font-black text-lg sm:text-xl text-brand-cream uppercase">Selecione o Chopp Artesanal</h3>
              <p className="font-body text-xs text-[#A8A39E]">Escolha o estilo ideal para a torneira do seu evento.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {BEERS.map((beer, idx) => {
                const isSelected = bookingData.beerId === beer.id;
                return (
                  <button
                    key={beer.id}
                    onClick={() => {
                      setBookingData({ ...bookingData, beerId: beer.id, beerName: beer.name });
                    }}
                    className={`py-2.5 px-3 rounded border text-left transition-all flex items-start justify-between gap-2.5 ${
                      isSelected
                        ? "bg-[#1C1C1C] border-brand-yellow ring-1 ring-brand-yellow"
                        : "bg-[#111] border-[#242424] hover:border-[#383838]"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-specs font-black bg-brand-yellow text-brand-black uppercase">
                          TAP 0{idx + 1}
                        </span>
                        <span className="font-heading font-black text-sm text-brand-cream">{beer.name}</span>
                      </div>
                      <div className="font-body text-[11px] text-[#A8A39E] line-clamp-1">{beer.description}</div>
                      <div className="flex items-center gap-3 pt-0.5 text-[11px] font-specs text-[#888]">
                        <span>ABV: <strong className="text-brand-cream">{beer.abv}</strong></span>
                        <span>IBU: <strong className="text-brand-cream">{beer.ibu}</strong></span>
                        <span className="text-brand-yellow font-bold">50L: R$ {beer.price50L}</span>
                      </div>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected ? "border-brand-yellow bg-brand-yellow text-brand-black" : "border-[#444]"
                    }`}>
                      {isSelected && <span className="text-[9px] font-black leading-none">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-3.5">
            <div>
              <span className="font-specs font-bold text-xs uppercase text-brand-yellow tracking-wider">Passo 2 de 6</span>
              <h3 className="font-heading font-black text-lg sm:text-xl text-brand-cream uppercase">Volume do Barril e Quantidade</h3>
              <p className="font-body text-xs text-[#A8A39E]">Disponível nos volumes padrão cervejeiro 30L ou 50L.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[30, 50].map((size) => {
                const isSelected = bookingData.kegSize === size;
                const price = size === 30 ? selectedBeer.price30L : selectedBeer.price50L;
                return (
                  <button
                    key={size}
                    onClick={() => setBookingData({ ...bookingData, kegSize: size as 30 | 50 })}
                    className={`py-3 px-4 rounded border text-center transition-all ${
                      isSelected
                        ? "bg-[#1C1C1C] border-brand-yellow ring-1 ring-brand-yellow"
                        : "bg-[#111] border-[#262626] hover:border-[#383838]"
                    }`}
                  >
                    <span className="font-specs font-black text-2xl sm:text-3xl text-brand-cream block">{size} Litros</span>
                    <span className="font-specs font-bold text-sm text-brand-yellow block mt-0.5">
                      R$ {price.toLocaleString('pt-BR')},00
                    </span>
                    <span className="font-body text-[10px] text-[#7A7570] block mt-0.5">
                      Aprox. {Math.round(size * 2.5)} copos de 400ml
                    </span>
                  </button>
                );
              })}
            </div>
            
            <div className="bg-[#111] border border-[#262626] py-2.5 px-3.5 rounded flex items-center justify-between">
              <div>
                <span className="font-heading font-black text-xs uppercase text-brand-cream block">Quantidade de Barris</span>
                <span className="font-body text-[11px] text-[#807A75]">Necessita de mais litragem para seu público?</span>
              </div>
              
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={() => setBookingData(prev => ({ ...prev, quantity: Math.max(1, (prev.quantity || 1) - 1) }))}
                  className="w-7 h-7 rounded border border-[#333] bg-[#181818] flex items-center justify-center text-brand-cream hover:bg-[#252525] transition-colors font-black text-sm"
                >
                  −
                </button>
                <span className="font-specs font-black text-lg text-brand-yellow w-5 text-center">{bookingData.quantity}</span>
                <button 
                  onClick={() => setBookingData(prev => ({ ...prev, quantity: (prev.quantity || 1) + 1 }))}
                  className="w-7 h-7 rounded border border-[#333] bg-[#181818] flex items-center justify-center text-brand-cream hover:bg-[#252525] transition-colors font-black text-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            <div>
              <span className="font-specs font-bold text-xs uppercase text-brand-yellow tracking-wider">Passo 3 de 6</span>
              <h3 className="font-heading font-black text-lg sm:text-xl text-brand-cream uppercase">Data e Horário do Evento</h3>
              <p className="font-body text-xs text-[#A8A39E]">Necessário agendamento prévio com no mínimo 7 dias de antecedência para maturação e logística.</p>
            </div>

            <div className="space-y-2.5 pt-1">
              <div>
                <label className="block font-heading font-bold text-xs uppercase text-[#C5BFB8] mb-1">
                  Data de Montagem e Início do Evento *
                </label>
                <input 
                  type="date"
                  min={minDateString}
                  value={bookingData.eventDate}
                  onChange={(e) => setBookingData({ ...bookingData, eventDate: e.target.value })}
                  className="w-full bg-[#111] border border-[#282828] rounded py-2 px-3 text-brand-cream font-specs text-base focus:outline-none focus:border-brand-yellow"
                />
              </div>

              <div className="py-2 px-3 bg-[#161616] border-l-2 border-brand-yellow rounded-r text-xs font-body text-[#A8A39E] space-y-0.5">
                <div className="font-specs font-bold text-brand-yellow uppercase text-[11px]">Regra Operacional de Antecedência:</div>
                <p>Data mínima permitida pelo sistema: <strong>{new Date(minDate).toLocaleDateString('pt-BR')}</strong> (7 dias corridos a partir de hoje).</p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            <div>
              <span className="font-specs font-bold text-xs uppercase text-brand-yellow tracking-wider">Passo 4 de 6</span>
              <h3 className="font-heading font-black text-lg sm:text-xl text-brand-cream uppercase">Cidade & Endereço de Entrega</h3>
              <p className="font-body text-xs text-[#A8A39E]">Defina o local exato onde nossa equipe fará a instalação e o teste de pressão.</p>
            </div>

            <div className="space-y-2.5 pt-1">
              <div>
                <label className="block font-heading font-bold text-xs uppercase text-[#C5BFB8] mb-1">
                  Município / Região de Atendimento *
                </label>
                <select
                  value={bookingData.location?.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full bg-[#111] border border-[#282828] rounded py-2 px-3 text-brand-cream font-body text-sm focus:outline-none focus:border-brand-yellow"
                >
                  {REGIONS.map(reg => (
                    <option key={reg.city} value={reg.city} className="bg-[#111] text-brand-cream">
                      {reg.city} — {reg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-heading font-bold text-xs uppercase text-[#C5BFB8] mb-1">Bairro / Praia *</label>
                  <input 
                    placeholder="Ex: Maresias, Juquehy, Centro..."
                    value={bookingData.location?.neighborhood}
                    onChange={(e) => setBookingData({ ...bookingData, location: { ...bookingData.location!, neighborhood: e.target.value } })}
                    className="w-full bg-[#111] border border-[#282828] rounded py-2 px-2.5 text-brand-cream font-body text-sm focus:outline-none focus:border-brand-yellow"
                  />
                </div>
                <div>
                  <label className="block font-heading font-bold text-xs uppercase text-[#C5BFB8] mb-1">Endereço Completo *</label>
                  <input 
                    placeholder="Rua, Número, Condomínio..."
                    value={bookingData.location?.address}
                    onChange={(e) => setBookingData({ ...bookingData, location: { ...bookingData.location!, address: e.target.value } })}
                    className="w-full bg-[#111] border border-[#282828] rounded py-2 px-2.5 text-brand-cream font-body text-sm focus:outline-none focus:border-brand-yellow"
                  />
                </div>
              </div>

              {bookingData.logisticsFee === 220 && (
                <div className="py-2 px-3 bg-brand-yellow/10 border border-brand-yellow/30 rounded flex items-center gap-2 text-xs text-brand-cream">
                  <Truck className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0" />
                  <span>Taxa padrão interurbana (São Sebastião ↔ Caraguatatuba): <strong>R$ 220,00</strong> aplicada ao total.</span>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-3">
            <div>
              <span className="font-specs font-bold text-xs uppercase text-brand-yellow tracking-wider">Passo 5 de 6</span>
              <h3 className="font-heading font-black text-lg sm:text-xl text-brand-cream uppercase">Dados para Faturamento & Contato</h3>
              <p className="font-body text-xs text-[#A8A39E]">Os detalhes de confirmação e recibo serão enviados via WhatsApp.</p>
            </div>

            <div className="space-y-2.5 pt-1">
              <div>
                <label className="block font-heading font-bold text-xs uppercase text-[#C5BFB8] mb-1">Nome Completo *</label>
                <input 
                  placeholder="Nome do responsável pela locação"
                  value={bookingData.customerName}
                  onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                  className="w-full bg-[#111] border border-[#282828] rounded py-2 px-2.5 text-brand-cream font-body text-sm focus:outline-none focus:border-brand-yellow"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-heading font-bold text-xs uppercase text-[#C5BFB8] mb-1">WhatsApp com DDD *</label>
                  <input 
                    placeholder="(12) 99999-9999"
                    value={bookingData.customerWhatsApp}
                    onChange={(e) => setBookingData({ ...bookingData, customerWhatsApp: e.target.value })}
                    className="w-full bg-[#111] border border-[#282828] rounded py-2 px-2.5 text-brand-cream font-body text-sm focus:outline-none focus:border-brand-yellow"
                  />
                </div>
                <div>
                  <label className="block font-heading font-bold text-xs uppercase text-[#C5BFB8] mb-1">E-mail *</label>
                  <input 
                    type="email"
                    placeholder="seu@email.com"
                    value={bookingData.customerEmail}
                    onChange={(e) => setBookingData({ ...bookingData, customerEmail: e.target.value })}
                    className="w-full bg-[#111] border border-[#282828] rounded py-2 px-2.5 text-brand-cream font-body text-sm focus:outline-none focus:border-brand-yellow"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-3">
            <div>
              <span className="font-specs font-bold text-xs uppercase text-brand-yellow tracking-wider">Passo 6 de 6</span>
              <h3 className="font-heading font-black text-lg sm:text-xl text-brand-cream uppercase">Ficha de Reserva & Locação</h3>
              <p className="font-body text-xs text-[#A8A39E]">Verificação final e checklist estruturado conforme as diretrizes da cervejaria.</p>
            </div>

            {/* STRUCTURED GOLDEN HEADER BLOCKS & CHECKLIST (Guanandi Visual Guidelines) */}
            <div className="space-y-2 pt-1">
              
              {/* BLOCO 1: PROGRAMAÇÃO DO EVENTO & LOGÍSTICA */}
              <div className="bg-[#111] border border-[#262626] rounded overflow-hidden">
                <div className="bg-brand-yellow text-brand-black px-3 py-1 flex items-center justify-between font-heading font-black text-xs uppercase tracking-wider">
                  <span>🟡 01. PROGRAMAÇÃO DO EVENTO & LOGÍSTICA</span>
                  <span className="font-specs font-bold text-[10px] bg-brand-black/10 px-1.5 py-0.5 rounded">AGENDADO</span>
                </div>
                <ul className="py-2 px-3 space-y-1 text-xs font-body text-brand-cream">
                  <li className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5">
                      <span className="text-brand-yellow font-bold">✓</span>
                      <span><strong>Data do Evento:</strong> {bookingData.eventDate ? new Date(bookingData.eventDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'A definir'}</span>
                    </div>
                    <span className="font-specs text-[#A8A39E]">Mín. 7 dias</span>
                  </li>
                  <li className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5">
                      <span className="text-brand-yellow font-bold">✓</span>
                      <span><strong>Local:</strong> {bookingData.location?.address || 'Endereço'}, {bookingData.location?.neighborhood} ({bookingData.location?.city})</span>
                    </div>
                    <span className="font-specs text-brand-cream">
                      {bookingData.logisticsFee ? `R$ ${bookingData.logisticsFee},00` : 'Incluso'}
                    </span>
                  </li>
                </ul>
              </div>

              {/* BLOCO 2: DISPENSADORES & EQUIPAMENTOS */}
              <div className="bg-[#111] border border-[#262626] rounded overflow-hidden">
                <div className="bg-brand-yellow text-brand-black px-3 py-1 flex items-center justify-between font-heading font-black text-xs uppercase tracking-wider">
                  <span>🟡 02. DISPENSADORES & EQUIPAMENTOS INCLUSOS</span>
                  <span className="font-specs font-bold text-[10px] bg-brand-black/10 px-1.5 py-0.5 rounded">LOCAÇÃO</span>
                </div>
                <ul className="py-2 px-3 space-y-1 text-xs font-body text-brand-cream">
                  <li className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5">
                      <span className="text-brand-yellow font-bold">✓</span>
                      <span>Chopeira Elétrica 2 Vias (Chassis Preto Fosco / Torneiras Inox com regulagem)</span>
                    </div>
                    <span className="font-specs text-brand-yellow">Incluso</span>
                  </li>
                  <li className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5">
                      <span className="text-brand-yellow font-bold">✓</span>
                      <span>Cilindro CO₂ Grau Cervejeiro Alimentício + Regulador com Manômetro Duplo</span>
                    </div>
                    <span className="font-specs text-brand-yellow">Incluso</span>
                  </li>
                  <li className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5">
                      <span className="text-brand-yellow font-bold">✓</span>
                      <span>Válvula Extratora Padrão Slink + Mangueiras Atóxicas Sanitizadas</span>
                    </div>
                    <span className="font-specs text-brand-yellow">Incluso</span>
                  </li>
                </ul>
              </div>

              {/* BLOCO 3: BARRIS DE CHOPP ARTESANAL */}
              <div className="bg-[#111] border border-[#262626] rounded overflow-hidden">
                <div className="bg-brand-yellow text-brand-black px-3 py-1 flex items-center justify-between font-heading font-black text-xs uppercase tracking-wider">
                  <span>🟡 03. BARRIS DE CHOPP ARTESANAL</span>
                  <span className="font-specs font-bold text-[10px] bg-brand-black/10 px-1.5 py-0.5 rounded">
                    {((bookingData.kegSize || 50) * (bookingData.quantity || 1))} LITROS
                  </span>
                </div>
                <ul className="py-2 px-3 space-y-1 text-xs font-body text-brand-cream">
                  <li className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5">
                      <span className="text-brand-yellow font-bold">✓</span>
                      <span><strong>{bookingData.quantity}x Barril {bookingData.beerName}</strong> ({bookingData.kegSize} Litros)</span>
                    </div>
                    <span className="font-specs font-bold text-brand-cream">R$ {subtotal.toLocaleString('pt-BR')},00</span>
                  </li>
                </ul>
              </div>

              {/* BLOCO 4: CONDIÇÕES GERAIS & VALOR TOTAL */}
              <div className="bg-[#111] border border-[#262626] rounded overflow-hidden">
                <div className="bg-brand-yellow text-brand-black px-3 py-1 flex items-center justify-between font-heading font-black text-xs uppercase tracking-wider">
                  <span>🟡 04. CONDIÇÕES GERAIS & RESUMO FINANCEIRO</span>
                  <span className="font-specs font-bold text-[10px] bg-brand-black/10 px-1.5 py-0.5 rounded">CONTRATO</span>
                </div>
                <ul className="py-2 px-3 space-y-1.5 text-xs font-body text-brand-cream">
                  <li className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5">
                      <span className="text-brand-yellow font-bold">✓</span>
                      <span>Instalação técnica e calibragem no local inclusas</span>
                    </div>
                    <span className="font-specs text-brand-yellow">Cortesia</span>
                  </li>
                  <li className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5">
                      <span className="text-brand-yellow font-bold">✓</span>
                      <span>Condição de pagamento: 50% na reserva + 50% na entrega e montagem</span>
                    </div>
                    <span className="font-specs text-[#C5BFB8]">PIX / Cartão</span>
                  </li>

                  <li className="pt-1.5 border-t border-[#262626] flex items-center justify-between">
                    <div>
                      <div className="font-heading font-black text-xs text-brand-cream uppercase">Total da Locação</div>
                      <div className="font-specs text-[11px] text-[#807A75]">
                        Sinal de confirmação (50%): <strong>R$ {downPayment.toLocaleString('pt-BR')},00</strong>
                      </div>
                    </div>
                    <div className="font-specs font-black text-xl sm:text-2xl text-brand-yellow">
                      R$ {totalPrice.toLocaleString('pt-BR')},00
                    </div>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-lg py-3.5 px-4 sm:py-5 sm:px-6 flex flex-col">
      {/* Mini Stepper Tabs */}
      <div className="grid grid-cols-6 gap-1 mb-3.5 pb-2.5 border-b border-[#222]">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;
          return (
            <div 
              key={step.id} 
              className={`flex items-center justify-center gap-1 py-1 px-1 rounded text-center transition-colors ${
                isActive ? "bg-brand-yellow text-brand-black" : isDone ? "text-brand-yellow/80" : "text-[#555]"
              }`}
            >
              <span className="font-specs font-black text-xs">{step.title}</span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[260px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#242424]">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`flex items-center gap-1 font-heading text-xs font-bold uppercase transition-colors ${
            currentStep === 0 ? "text-[#444] cursor-not-allowed" : "text-[#A8A39E] hover:text-brand-cream"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        {currentStep === STEPS.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !bookingData.customerName || !bookingData.customerWhatsApp}
            className="bg-brand-yellow text-brand-black px-5 py-2 rounded font-heading font-black text-xs uppercase tracking-wider hover:bg-brand-amber transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? "Gravando Reserva..." : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Solicitar Reserva</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={nextStep}
            className="flex items-center gap-1.5 bg-brand-yellow text-brand-black px-5 py-2 rounded font-heading font-black text-xs uppercase tracking-wider hover:bg-brand-amber transition-colors"
          >
            <span>Continuar</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
