/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Assistente de Reservas de Chopp — Cervejaria Guanandi
 * - Pós-venda (upsell) interativo para 2ª cerveja no mesmo pedido
 * - Notificações exclusivamente por e-mail (sem WhatsApp)
 * - Validação completa de campos (horário, data mínima, convidados, e-mail)
 * - Proteção contra alteração de preços e duplo clique
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
  Beer as BeerIcon,
  CreditCard,
  Clock,
  Sparkles,
  Truck,
  Wrench,
  Mail,
  Users,
  Check,
  Plus,
  AlertCircle,
  FileText
} from "lucide-react";
import { BEERS } from "../data";
import { Beer, Reservation } from "../types";
import { submitReservationToApi } from "../lib/api";
import ExtractorOptionsModal from "./ExtractorOptionsModal";
import SecondBeerUpsellModal, { SecondBeerSelection } from "./SecondBeerUpsellModal";

const STEPS = [
  { id: "beer", title: "1. Chopp", icon: BeerIcon },
  { id: "keg", title: "2. Volume", icon: Package },
  { id: "date", title: "3. Data & Hora", icon: Calendar },
  { id: "location", title: "4. Local", icon: MapPin },
  { id: "customer", title: "5. Dados", icon: User },
  { id: "upsell", title: "6. 2ª Cerveja", icon: Sparkles },
  { id: "summary", title: "7. Resumo", icon: CreditCard },
];

const REGIONS = [
  { city: "São Sebastião", fee: 120, label: "Base Local — R$ 120,00" },
  { city: "Caraguatatuba", fee: 80, label: "Rota Regional — R$ 80,00" },
  { city: "Ilhabela", fee: 220, label: "Travessia Especial (Balsa) — R$ 220,00" },
  { city: "Ubatuba", fee: 160, label: "Rota Litoral Norte — R$ 160,00" },
];

const TIME_SLOTS = [
  "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", 
  "16:00", "17:00", "18:00", "19:00", "20:00", "A combinar"
];

export default function BookingWizard({ initialBeerId }: { initialBeerId?: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  const [isExtractorModalOpen, setIsExtractorModalOpen] = useState(false);
  const [selectedExtractorId, setSelectedExtractorId] = useState("standard-s");
  const [isSecondBeerModalOpen, setIsSecondBeerModalOpen] = useState(false);

  // Selected second beer for upsell
  const [selectedUpsellBeerId, setSelectedUpsellBeerId] = useState<string>("");
  const [selectedUpsellKegSize, setSelectedUpsellKegSize] = useState<30 | 50>(30);
  
  const [bookingData, setBookingData] = useState<Partial<Reservation>>({
    beerId: initialBeerId || BEERS[0].id,
    beerName: BEERS.find(b => b.id === (initialBeerId || BEERS[0].id))?.name || BEERS[0].name,
    kegSize: 50,
    quantity: 1,
    eventDate: "",
    eventTime: "14:00",
    guestCount: 40,
    notes: "",
    location: { city: "São Sebastião", neighborhood: "", address: "" },
    customerName: "",
    customerWhatsApp: "",
    customerEmail: "",
    status: "pendente",
    logisticsFee: 120,
    extractorOption: "Válvula Extratora Padrão Slink / Euro Sankey (S)",
    extractorFee: 0,
    secondBeerAdded: false,
    secondBeer: null,
    secondBeerPrice: 0,
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
  const subtotal1 = unitPrice * (bookingData.quantity || 1);

  // Second Beer calculation
  const secondBeerPrice = bookingData.secondBeerAdded && bookingData.secondBeer
    ? (bookingData.secondBeer.price || 0) * (bookingData.secondBeer.quantity || 1)
    : 0;

  const extractorFee = bookingData.extractorFee || 0;
  const logisticsFee = bookingData.logisticsFee || 0;
  const totalPrice = subtotal1 + secondBeerPrice + logisticsFee + extractorFee;
  const downPayment = totalPrice * 0.5;

  const nextStep = () => {
    setSubmissionError(null);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };
  const prevStep = () => {
    setSubmissionError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Regra dos 7 dias no mínimo
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const minDateString = minDate.toISOString().split("T")[0];

  const handleCityChange = (cityName: string) => {
    const reg = REGIONS.find(r => r.city === cityName);
    setBookingData(prev => ({
      ...prev,
      logisticsFee: reg ? reg.fee : 120,
      location: { ...prev.location!, city: cityName }
    }));
  };

  // Upsell handlers
  const handleAddSecondBeer = (selection: SecondBeerSelection) => {
    setBookingData(prev => ({
      ...prev,
      secondBeerAdded: true,
      secondBeer: {
        beerId: selection.beerId,
        beerName: selection.beerName,
        kegSize: selection.kegSize,
        price: selection.price,
        quantity: 1,
      },
      secondBeerPrice: selection.price,
    }));
  };

  const handleRemoveSecondBeer = () => {
    setBookingData(prev => ({
      ...prev,
      secondBeerAdded: false,
      secondBeer: null,
      secondBeerPrice: 0,
    }));
  };

  // Validações antes da submissão
  const validateBeforeSubmit = (): string | null => {
    if (!bookingData.customerName || bookingData.customerName.trim().length < 2) {
      return "Informe seu nome completo para a reserva.";
    }
    if (!bookingData.customerWhatsApp || bookingData.customerWhatsApp.trim().length < 8) {
      return "Informe seu telefone / WhatsApp de contato.";
    }
    if (!bookingData.customerEmail || !bookingData.customerEmail.includes("@")) {
      return "Informe um e-mail válido para receber a confirmação da reserva.";
    }
    if (!bookingData.eventDate) {
      return "Selecione a data do evento.";
    }
    if (bookingData.eventDate < minDateString) {
      return `A data deve respeitar o prazo mínimo operacional de 7 dias (${new Date(minDate).toLocaleDateString('pt-BR')}).`;
    }
    if (!bookingData.location?.address || !bookingData.location?.neighborhood) {
      return "Informe o endereço completo e bairro para a entrega dos equipamentos.";
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateBeforeSubmit();
    if (validationError) {
      setSubmissionError(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const payload: Partial<Reservation> = {
        beerId: bookingData.beerId,
        beerName: bookingData.beerName,
        kegSize: bookingData.kegSize,
        quantity: bookingData.quantity || 1,
        totalPrice,
        logisticsFee,
        extractorOption: bookingData.extractorOption,
        extractorFee,
        eventDate: bookingData.eventDate,
        eventTime: bookingData.eventTime || "14:00",
        guestCount: Number(bookingData.guestCount) || 40,
        notes: bookingData.notes || "",
        secondBeerAdded: bookingData.secondBeerAdded,
        secondBeer: bookingData.secondBeer,
        secondBeerPrice,
        customerName: bookingData.customerName,
        customerWhatsApp: bookingData.customerWhatsApp,
        customerEmail: bookingData.customerEmail,
        location: bookingData.location,
        status: "pendente",
      };

      const result = await submitReservationToApi(payload);

      if (!result.success || !result.reservation) {
        throw new Error(result.error || "Não foi possível registrar a reserva no servidor.");
      }

      setConfirmedReservation(result.reservation);
      setIsSuccess(true);
    } catch (err: any) {
      setSubmissionError(err?.message || "Ocorreu um erro ao processar sua reserva. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // PÁGINA DE CONFIRMAÇÃO DO CLIENTE (Item 7)
  if (isSuccess && confirmedReservation) {
    const res = confirmedReservation;
    const finalDownPayment = Math.round(res.totalPrice * 0.5);

    return (
      <div className="bg-[#141414] border border-[#262626] rounded-xl py-6 px-5 sm:py-8 sm:px-8 max-w-2xl mx-auto space-y-6 shadow-2xl">
        {/* Success Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-brand-cream uppercase tracking-tight">
            Reserva Realizada com Sucesso!
          </h2>
          <p className="font-body text-sm text-[#A8A39E] max-w-lg mx-auto">
            Sua solicitação de locação de chopeira e barris foi registrada com sucesso em nosso sistema.
          </p>
        </div>

        {/* E-mail confirmation alert box */}
        <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-lg p-3.5 flex items-start gap-3 text-left">
          <Mail className="w-5 h-5 text-brand-yellow flex-shrink-0 mt-0.5" />
          <div className="text-xs font-body text-brand-cream space-y-1">
            <p className="font-heading font-bold text-brand-yellow uppercase text-xs">
              Confirmação Enviada por E-mail
            </p>
            <p className="text-[#D1D5DB]">
              Os detalhes completos da sua reserva foram enviados para:{" "}
              <strong className="text-white">{res.customerEmail}</strong>.
            </p>
            <p className="text-[#9CA3AF] text-[11px]">
              Nossa equipe operacional já recebeu uma cópia e entrará em contato para agendar o horário de montagem.
            </p>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-[#101010] border border-[#242424] rounded-lg overflow-hidden text-left">
          <div className="bg-[#181818] px-4 py-2.5 border-b border-[#262626] flex items-center justify-between">
            <span className="font-specs font-bold text-xs uppercase text-[#A8A39E]">
              Ficha da Reserva
            </span>
            <span className="font-specs font-black text-brand-yellow text-sm bg-brand-yellow/10 px-2.5 py-0.5 rounded border border-brand-yellow/20">
              {res.reservationCode || `#GN-${Math.floor(Math.random() * 90000) + 10000}`}
            </span>
          </div>

          <div className="p-4 space-y-3.5 text-xs font-body text-[#D1D5DB]">
            {/* Event Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pb-3 border-b border-[#222]">
              <div>
                <span className="text-[#777] block text-[11px] uppercase font-specs">Data do Evento:</span>
                <span className="text-white font-bold text-sm">
                  {res.eventDate ? new Date(res.eventDate + 'T00:00:00').toLocaleDateString('pt-BR') : res.eventDate}
                </span>
              </div>
              <div>
                <span className="text-[#777] block text-[11px] uppercase font-specs">Horário:</span>
                <span className="text-white font-bold text-sm">{res.eventTime || "A combinar"}</span>
              </div>
              <div>
                <span className="text-[#777] block text-[11px] uppercase font-specs">Número de Pessoas:</span>
                <span className="text-white font-bold text-sm">{res.guestCount} convidados</span>
              </div>
            </div>

            {/* Products (Beer 1 + Beer 2) */}
            <div className="space-y-2 pb-3 border-b border-[#222]">
              <span className="text-[#777] block text-[11px] uppercase font-specs font-bold">
                Produtos & Chopes Escolhidos:
              </span>
              
              {/* Cerveja 1 */}
              <div className="bg-[#161616] p-2.5 rounded border border-[#282828] flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">{res.beerName}</span>
                  <span className="text-[#999] text-[11px]">Barril de {res.kegSize}L (Quantidade: {res.quantity})</span>
                </div>
                <span className="font-specs font-bold text-brand-yellow">Cerveja Principal</span>
              </div>

              {/* Segunda Cerveja se selecionada */}
              {res.secondBeerAdded && res.secondBeer ? (
                <div className="bg-[#1A1810] p-2.5 rounded border border-brand-yellow/30 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-yellow" />
                      <span className="text-brand-yellow font-bold">{res.secondBeer.beerName}</span>
                    </div>
                    <span className="text-[#999] text-[11px]">2ª Cerveja (Upsell) — Barril {res.secondBeer.kegSize}L</span>
                  </div>
                  <span className="font-specs font-bold text-brand-yellow">
                    R$ {res.secondBeer.price?.toLocaleString('pt-BR')},00
                  </span>
                </div>
              ) : (
                <div className="text-[11px] text-[#666] italic">Segunda cerveja: Não adicionada</div>
              )}
            </div>

            {/* Location & Extractor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-3 border-b border-[#222]">
              <div>
                <span className="text-[#777] block text-[11px] uppercase font-specs">Local de Entrega:</span>
                <span className="text-white">{res.location?.address}, {res.location?.neighborhood}</span>
                <span className="text-[#999] block text-[11px]">{res.location?.city}</span>
              </div>
              <div>
                <span className="text-[#777] block text-[11px] uppercase font-specs">Válvula / Extratora:</span>
                <span className="text-white">{res.extractorOption || "Padrão Slink (S)"}</span>
              </div>
            </div>

            {/* Total Financials */}
            <div className="bg-[#181818] p-3 rounded-lg border border-[#2D2D2D] flex items-center justify-between">
              <div>
                <span className="font-heading font-black text-xs text-brand-cream uppercase block">
                  Valor Total do Pedido
                </span>
                <span className="text-[11px] text-[#888]">
                  Sinal de 50% para reserva: <strong>R$ {finalDownPayment.toLocaleString('pt-BR')},00</strong>
                </span>
              </div>
              <div className="font-specs font-black text-xl sm:text-2xl text-brand-yellow">
                R$ {res.totalPrice?.toLocaleString('pt-BR')},00
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-lg border border-[#333] text-xs font-heading font-bold uppercase text-[#C5BFB8] hover:text-brand-cream hover:border-[#555] transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Imprimir Ficha</span>
          </button>

          <button
            onClick={() => {
              setIsSuccess(false);
              setConfirmedReservation(null);
              setCurrentStep(0);
            }}
            className="px-6 py-2.5 rounded-lg bg-brand-yellow text-brand-black text-xs font-heading font-black uppercase tracking-wider hover:bg-brand-amber transition-colors flex items-center justify-center gap-2"
          >
            <span>Fazer Outra Reserva</span>
          </button>
        </div>
      </div>
    );
  }

  // RENDERIZAÇÃO DOS PASSOS DO WIZARD
  const renderStep = () => {
    switch (currentStep) {
      // 1. Chopp Principal
      case 0:
        return (
          <div className="space-y-3">
            <div>
              <span className="font-specs font-bold text-xs uppercase text-brand-yellow tracking-wider">Passo 1 de 7</span>
              <h3 className="font-heading font-black text-lg sm:text-xl text-brand-cream uppercase">Selecione o Chopp Artesanal Principal</h3>
              <p className="font-body text-xs text-[#A8A39E]">Escolha o estilo carro-chefe para o seu evento.</p>
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

      // 2. Volume & Quantidade
      case 1:
        return (
          <div className="space-y-3.5">
            <div>
              <span className="font-specs font-bold text-xs uppercase text-brand-yellow tracking-wider">Passo 2 de 7</span>
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
                <span className="font-body text-[11px] text-[#807A75]">Para a cerveja principal ({selectedBeer.name})</span>
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

      // 3. Data, Horário e Convidados (Validação exigida)
      case 2:
        return (
          <div className="space-y-3">
            <div>
              <span className="font-specs font-bold text-xs uppercase text-brand-yellow tracking-wider">Passo 3 de 7</span>
              <h3 className="font-heading font-black text-lg sm:text-xl text-brand-cream uppercase">Data, Horário e Convidados</h3>
              <p className="font-body text-xs text-[#A8A39E]">Necessário agendamento prévio com no mínimo 7 dias de antecedência para maturação e logística.</p>
            </div>

            <div className="space-y-3 pt-1">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-heading font-bold text-xs uppercase text-[#C5BFB8] mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-yellow" />
                    <span>Horário Previsto do Evento *</span>
                  </label>
                  <select
                    value={bookingData.eventTime || "14:00"}
                    onChange={(e) => setBookingData({ ...bookingData, eventTime: e.target.value })}
                    className="w-full bg-[#111] border border-[#282828] rounded py-2 px-3 text-brand-cream font-body text-sm focus:outline-none focus:border-brand-yellow"
                  >
                    {TIME_SLOTS.map((time) => (
                      <option key={time} value={time} className="bg-[#111] text-brand-cream">
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-heading font-bold text-xs uppercase text-[#C5BFB8] mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-brand-yellow" />
                    <span>Estimativa de Convidados / Pessoas *</span>
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={1500}
                    placeholder="Ex: 40 convidados"
                    value={bookingData.guestCount || ""}
                    onChange={(e) => setBookingData({ ...bookingData, guestCount: Math.max(1, parseInt(e.target.value) || 0) })}
                    className="w-full bg-[#111] border border-[#282828] rounded py-2 px-3 text-brand-cream font-body text-sm focus:outline-none focus:border-brand-yellow"
                  />
                </div>
              </div>

              <div className="py-2 px-3 bg-[#161616] border-l-2 border-brand-yellow rounded-r text-xs font-body text-[#A8A39E] space-y-0.5">
                <div className="font-specs font-bold text-brand-yellow uppercase text-[11px]">Regra Operacional de Antecedência:</div>
                <p>Data mínima permitida: <strong>{new Date(minDate).toLocaleDateString('pt-BR')}</strong> (7 dias de antecedência para sanitização).</p>
              </div>
            </div>
          </div>
        );

      // 4. Local
      case 3:
        return (
          <div className="space-y-3">
            <div>
              <span className="font-specs font-bold text-xs uppercase text-brand-yellow tracking-wider">Passo 4 de 7</span>
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

              <div className="py-2 px-3 bg-brand-yellow/10 border border-brand-yellow/30 rounded flex items-center gap-2 text-xs text-brand-cream">
                <Truck className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0" />
                <span>Taxa logística para {bookingData.location?.city}: <strong>R$ {logisticsFee},00</strong> inclusa no cálculo.</span>
              </div>
            </div>
          </div>
        );

      // 5. Dados do Cliente
      case 4:
        return (
          <div className="space-y-3">
            <div>
              <span className="font-specs font-bold text-xs uppercase text-brand-yellow tracking-wider">Passo 5 de 7</span>
              <h3 className="font-heading font-black text-lg sm:text-xl text-brand-cream uppercase">Dados de Contato & Faturamento</h3>
              <p className="font-body text-xs text-[#A8A39E]">A confirmação da reserva será enviada diretamente para o seu e-mail.</p>
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
                  <label className="block font-heading font-bold text-xs uppercase text-[#C5BFB8] mb-1">Telefone / WhatsApp com DDD *</label>
                  <input 
                    placeholder="(12) 99999-9999"
                    value={bookingData.customerWhatsApp}
                    onChange={(e) => setBookingData({ ...bookingData, customerWhatsApp: e.target.value })}
                    className="w-full bg-[#111] border border-[#282828] rounded py-2 px-2.5 text-brand-cream font-body text-sm focus:outline-none focus:border-brand-yellow"
                  />
                </div>
                <div>
                  <label className="block font-heading font-bold text-xs uppercase text-[#C5BFB8] mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-brand-yellow" />
                    <span>E-mail para Confirmação *</span>
                  </label>
                  <input 
                    type="email"
                    placeholder="seu@email.com"
                    value={bookingData.customerEmail}
                    onChange={(e) => setBookingData({ ...bookingData, customerEmail: e.target.value })}
                    className="w-full bg-[#111] border border-[#282828] rounded py-2 px-2.5 text-brand-cream font-body text-sm focus:outline-none focus:border-brand-yellow"
                  />
                </div>
              </div>

              <div>
                <label className="block font-heading font-bold text-xs uppercase text-[#C5BFB8] mb-1">
                  Observações do Evento (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Horário de preferência para instalação, ponto de energia próximo, escadas..."
                  value={bookingData.notes || ""}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  className="w-full bg-[#111] border border-[#282828] rounded py-2 px-2.5 text-brand-cream font-body text-sm focus:outline-none focus:border-brand-yellow resize-none"
                />
              </div>
            </div>
          </div>
        );

      // 6. OPÇÃO DE SEGUNDA CERVEJA — PÓS-VENDA (Item 1 do pedido do usuário)
      case 5:
        return (
          <div className="space-y-4">
            <div className="border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-specs font-bold text-xs uppercase text-brand-yellow tracking-wider bg-brand-yellow/10 px-2 py-0.5 rounded">
                  Passo 6 de 7 • Pós-Venda
                </span>
                <span className="text-[11px] text-[#888] font-specs">Mesmo Pedido • Sem Frete Adicional</span>
              </div>
              <h3 className="font-heading font-black text-lg sm:text-xl text-brand-cream uppercase mt-1">
                Deseja adicionar uma segunda cerveja ao pedido?
              </h3>
              <p className="font-body text-xs text-[#A8A39E] mt-0.5">
                Você já escolheu <strong className="text-brand-yellow">{bookingData.beerName} ({bookingData.kegSize}L)</strong>. Aproveite a chopeira de 2 vias para oferecer um segundo estilo aos seus convidados!
              </p>
            </div>

            {/* SE JÁ TEM SEGUNDA CERVEJA ADICIONADA */}
            {bookingData.secondBeerAdded && bookingData.secondBeer ? (
              <div className="bg-[#1A1810] border-2 border-brand-yellow rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded bg-brand-yellow text-brand-black flex items-center justify-center font-black">
                      ✓
                    </div>
                    <div>
                      <span className="text-[10px] font-specs font-bold text-brand-yellow uppercase tracking-wider block">
                        Segunda Cerveja Adicionada ao Pedido
                      </span>
                      <h4 className="font-heading font-black text-base text-white">
                        {bookingData.secondBeer.beerName} — Barril {bookingData.secondBeer.kegSize} Litros
                      </h4>
                      <p className="text-xs font-body text-[#C5BFB8]">
                        Adicionado ao mesmo pedido • Frete e chopeira já inclusos.
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-specs font-black text-base text-brand-yellow block">
                      + R$ {bookingData.secondBeer.price?.toLocaleString('pt-BR')},00
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveSecondBeer}
                      className="text-[11px] text-red-400 hover:text-red-300 font-specs underline mt-1 block"
                    >
                      Remover 2ª cerveja
                    </button>
                  </div>
                </div>

                {/* Total updated preview */}
                <div className="bg-[#111] p-2.5 rounded border border-[#333] flex items-center justify-between text-xs">
                  <span className="text-[#A8A39E]">Novo Valor Total Atualizado:</span>
                  <span className="font-specs font-black text-brand-yellow text-base">
                    R$ {totalPrice.toLocaleString('pt-BR')},00
                  </span>
                </div>
              </div>
            ) : (
              /* SELEÇÃO DE SEGUNDA CERVEJA */
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {BEERS.map((beer) => {
                    const isMainBeer = beer.id === bookingData.beerId;
                    const isSelected = selectedUpsellBeerId === beer.id;
                    return (
                      <div
                        key={beer.id}
                        onClick={() => setSelectedUpsellBeerId(beer.id)}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          isSelected
                            ? "bg-brand-yellow/10 border-brand-yellow text-brand-cream shadow"
                            : "bg-[#111] border-[#252525] hover:border-[#383838]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-heading font-bold text-xs uppercase text-brand-cream">
                            {beer.name}
                          </span>
                          {isMainBeer && (
                            <span className="text-[9px] bg-[#333] text-[#AAA] px-1.5 py-0.5 rounded font-specs">
                              Principal
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-brand-yellow font-specs mb-1">{beer.style}</div>
                        <p className="text-[10px] font-body text-[#888] line-clamp-1">{beer.description}</p>
                        <div className="mt-2 pt-1 border-t border-[#222] flex items-center justify-between text-[10px] font-specs">
                          <span className="text-[#666]">ABV {beer.abv} • IBU {beer.ibu}</span>
                          <span className="text-brand-yellow font-bold">
                            30L: R$ {beer.price30L} | 50L: R$ {beer.price50L}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Seleção do tamanho se uma cerveja foi selecionada */}
                {selectedUpsellBeerId && (
                  <div className="bg-[#181818] border border-[#2E2E2E] rounded-lg p-3 space-y-2.5">
                    {(() => {
                      const upsellBeer = BEERS.find(b => b.id === selectedUpsellBeerId)!;
                      const price = selectedUpsellKegSize === 50 ? upsellBeer.price50L : upsellBeer.price30L;
                      return (
                        <>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="text-xs font-heading font-bold text-brand-cream uppercase">
                                Tamanho do Barril: {upsellBeer.name}
                              </span>
                              <span className="text-[11px] text-[#888] block">
                                Escolha o volume ideal para o segundo estilo
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedUpsellKegSize(30)}
                                className={`px-2.5 py-1 rounded text-xs font-specs font-bold uppercase transition-all ${
                                  selectedUpsellKegSize === 30
                                    ? "bg-brand-yellow text-brand-black"
                                    : "bg-[#252525] text-[#AAA]"
                                }`}
                              >
                                30L (R$ {upsellBeer.price30L},00)
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedUpsellKegSize(50)}
                                className={`px-2.5 py-1 rounded text-xs font-specs font-bold uppercase transition-all ${
                                  selectedUpsellKegSize === 50
                                    ? "bg-brand-yellow text-brand-black"
                                    : "bg-[#252525] text-[#AAA]"
                                }`}
                              >
                                50L (R$ {upsellBeer.price50L},00)
                              </button>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                            <span className="text-xs text-[#A8A39E]">
                              Valor do 2º Barril: <strong className="text-brand-yellow">R$ {price},00</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                handleAddSecondBeer({
                                  beerId: upsellBeer.id,
                                  beerName: upsellBeer.name,
                                  kegSize: selectedUpsellKegSize,
                                  price,
                                  quantity: 1,
                                });
                              }}
                              className="bg-brand-yellow text-brand-black px-4 py-1.5 rounded font-heading font-black text-xs uppercase tracking-wider hover:bg-brand-amber transition-all flex items-center gap-1.5 shadow"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Adicionar ao Pedido (+ R$ {price},00)</span>
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Opção de Recusar */}
                <div className="text-center pt-1">
                  <span className="text-xs text-[#777]">
                    Não deseja segunda cerveja? Você pode continuar normalmente para o resumo final.
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      // 7. Resumo & Confirmação (Checklist & Ficha de Locação)
      case 6:
        return (
          <div className="space-y-3">
            <div>
              <span className="font-specs font-bold text-xs uppercase text-brand-yellow tracking-wider">Passo 7 de 7</span>
              <h3 className="font-heading font-black text-lg sm:text-xl text-brand-cream uppercase">Ficha de Reserva & Resumo Final</h3>
              <p className="font-body text-xs text-[#A8A39E]">Conferência final antes de enviar a confirmação por e-mail.</p>
            </div>

            {submissionError && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-2 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{submissionError}</span>
              </div>
            )}

            {/* STRUCTURED GOLDEN HEADER BLOCKS & CHECKLIST */}
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
                      <span>
                        <strong>Data & Horário:</strong> {bookingData.eventDate ? new Date(bookingData.eventDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'A definir'} às {bookingData.eventTime || "14:00"}
                      </span>
                    </div>
                    <span className="font-specs text-[#A8A39E]">{bookingData.guestCount} convidados</span>
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
                <ul className="py-2.5 px-3 space-y-2 text-xs font-body text-brand-cream">
                  <li className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5">
                      <span className="text-brand-yellow font-bold">✓</span>
                      <span>Chopeira Elétrica 2 Vias (Chassis Preto Fosco / Torneiras Inox Italianas)</span>
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
                  <li className="flex items-start justify-between gap-2 bg-[#171717] p-2 rounded border border-[#2A2A2A]">
                    <div className="flex items-start gap-1.5">
                      <span className="text-brand-yellow font-bold">✓</span>
                      <div>
                        <div><strong>Válvula / Extratora Selecionada:</strong></div>
                        <div className="text-brand-yellow text-[11px] font-specs mt-0.5">
                          {bookingData.extractorOption || "Válvula Extratora Padrão Slink / Euro Sankey (S)"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-specs font-bold text-brand-yellow block">
                        {extractorFee === 0 ? "Incluso" : `+ R$ ${extractorFee},00`}
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* BLOCO 3: BARRIS DE CHOPP (PRINCIPAL + SEGUNDA CERVEJA SE ADICIONADA) */}
              <div className="bg-[#111] border border-[#262626] rounded overflow-hidden">
                <div className="bg-brand-yellow text-brand-black px-3 py-1 flex items-center justify-between font-heading font-black text-xs uppercase tracking-wider">
                  <span>🟡 03. BARRIS DE CHOPP ARTESANAL SELECIONADOS</span>
                  <span className="font-specs font-bold text-[10px] bg-brand-black/10 px-1.5 py-0.5 rounded">
                    {((bookingData.kegSize || 50) * (bookingData.quantity || 1)) + (bookingData.secondBeerAdded && bookingData.secondBeer ? bookingData.secondBeer.kegSize : 0)} LITROS TOTAIS
                  </span>
                </div>
                <ul className="py-2 px-3 space-y-1.5 text-xs font-body text-brand-cream">
                  {/* Cerveja 1 */}
                  <li className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5">
                      <span className="text-brand-yellow font-bold">✓</span>
                      <span>
                        <strong>1ª Cerveja:</strong> {bookingData.quantity}x Barril {bookingData.beerName} ({bookingData.kegSize} Litros)
                      </span>
                    </div>
                    <span className="font-specs font-bold text-brand-cream">R$ {subtotal1.toLocaleString('pt-BR')},00</span>
                  </li>

                  {/* Segunda Cerveja (Upsell) */}
                  {bookingData.secondBeerAdded && bookingData.secondBeer ? (
                    <li className="flex items-start justify-between gap-2 bg-brand-yellow/10 p-1.5 rounded border border-brand-yellow/30">
                      <div className="flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-brand-yellow font-bold block">
                            2ª Cerveja (Upsell): Barril {bookingData.secondBeer.beerName} ({bookingData.secondBeer.kegSize} Litros)
                          </span>
                          <span className="text-[10px] text-[#AAA]">Adicionada ao mesmo pedido</span>
                        </div>
                      </div>
                      <span className="font-specs font-bold text-brand-yellow">
                        + R$ {bookingData.secondBeer.price?.toLocaleString('pt-BR')},00
                      </span>
                    </li>
                  ) : (
                    <li className="flex items-center justify-between text-[#777] text-[11px] pt-1">
                      <span>Segunda Cerveja: Não adicionada</span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(5)}
                        className="text-brand-yellow underline hover:text-brand-amber font-specs text-[11px]"
                      >
                        + Adicionar 2ª Cerveja
                      </button>
                    </li>
                  )}
                </ul>
              </div>

              {/* BLOCO 4: CONDIÇÕES GERAIS & VALOR TOTAL */}
              <div className="bg-[#111] border border-[#262626] rounded overflow-hidden">
                <div className="bg-brand-yellow text-brand-black px-3 py-1 flex items-center justify-between font-heading font-black text-xs uppercase tracking-wider">
                  <span>🟡 04. CONDIÇÕES GERAIS & VALOR TOTAL</span>
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
                      <span>Condição de pagamento: 50% na reserva + 50% na montagem</span>
                    </div>
                    <span className="font-specs text-[#C5BFB8]">PIX / Cartão</span>
                  </li>

                  <li className="pt-2 border-t border-[#262626] flex items-center justify-between">
                    <div>
                      <div className="font-heading font-black text-xs text-brand-cream uppercase">Total da Reserva</div>
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

              {/* Aviso de Envio por E-mail (Sem WhatsApp) */}
              <div className="p-2.5 bg-[#171717] border border-[#2A2A2A] rounded flex items-center gap-2 text-xs text-[#A8A39E]">
                <Mail className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                <span>
                  Ao confirmar, os detalhes serão enviados para <strong>{bookingData.customerEmail || "seu e-mail"}</strong> e para a administração.
                </span>
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
      {/* Stepper Tabs */}
      <div className="grid grid-cols-7 gap-1 mb-3.5 pb-2.5 border-b border-[#222]">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;
          return (
            <div 
              key={step.id} 
              className={`flex items-center justify-center gap-1 py-1 px-0.5 rounded text-center transition-colors ${
                isActive ? "bg-brand-yellow text-brand-black" : isDone ? "text-brand-yellow/80" : "text-[#555]"
              }`}
            >
              <span className="font-specs font-black text-[11px] sm:text-xs truncate">{step.title}</span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[280px]">
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
          disabled={currentStep === 0 || isSubmitting}
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
            disabled={isSubmitting || !bookingData.customerName || !bookingData.customerWhatsApp || !bookingData.customerEmail}
            className="bg-brand-yellow text-brand-black px-6 py-2.5 rounded font-heading font-black text-xs uppercase tracking-wider hover:bg-brand-amber transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-brand-black border-t-transparent rounded-full animate-spin" />
                <span>Registrando e Enviando E-mail...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>Confirmar Reserva por E-mail</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={nextStep}
            className="flex items-center gap-1.5 bg-brand-yellow text-brand-black px-5 py-2 rounded font-heading font-black text-xs uppercase tracking-wider hover:bg-brand-amber transition-colors"
          >
            <span>{currentStep === 5 ? (bookingData.secondBeerAdded ? "Avançar com 2ª Cerveja" : "Continuar sem 2ª Cerveja") : "Continuar"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Extractor / Post-Sale Options Modal */}
      <ExtractorOptionsModal
        isOpen={isExtractorModalOpen}
        onClose={() => setIsExtractorModalOpen(false)}
        selectedId={selectedExtractorId}
        onSelectOption={(opt) => {
          setSelectedExtractorId(opt.id);
          setBookingData((prev) => ({
            ...prev,
            extractorOption: opt.name,
            extractorFee: opt.price,
          }));
        }}
      />

      {/* Second Beer Upsell Modal (can be triggered from Summary if desired) */}
      <SecondBeerUpsellModal
        isOpen={isSecondBeerModalOpen}
        onClose={() => setIsSecondBeerModalOpen(false)}
        firstBeerName={bookingData.beerName || "Pilsen"}
        firstBeerId={bookingData.beerId || "pilsen"}
        currentSecondBeer={bookingData.secondBeer || null}
        onAddSecondBeer={handleAddSecondBeer}
        onDeclineSecondBeer={handleRemoveSecondBeer}
      />
    </div>
  );
}
