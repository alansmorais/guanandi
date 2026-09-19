/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft, Calendar, MapPin, Users, Package, FileText, User as UserIcon, CheckCircle, MessageSquare } from "lucide-react";
import { Lead } from "../types";
import { db, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType } from "../lib/firebase";

const STEPS = [
  { id: "event-type", title: "Tipo de Evento", icon: Package },
  { id: "date", title: "Data do Evento", icon: Calendar },
  { id: "location", title: "Localização", icon: MapPin },
  { id: "guests", title: "Convidados", icon: Users },
  { id: "services", title: "Serviços", icon: Package },
  { id: "info", title: "Informações", icon: FileText },
  { id: "customer", title: "Contato", icon: UserIcon },
  { id: "summary", title: "Resumo", icon: CheckCircle },
];

const EVENT_TYPES = [
  { value: "casamento", label: "Casamento" },
  { value: "aniversário", label: "Aniversário" },
  { value: "corporativo", label: "Evento Corporativo" },
  { value: "particular", label: "Festa Particular" },
  { value: "formatura", label: "Formatura" },
  { value: "festival", label: "Festival" },
  { value: "outro", label: "Outro" },
];

const SERVICES = [
  { id: "beertruck", label: "Beer Truck" },
  { id: "chopp", label: "Chopp Artesanal" },
  { id: "tenda", label: "Tenda / Estrutura" },
  { id: "garcons", label: "Atendimento / Garçons" },
  { id: "ponto-fixo", label: "Ponto Fixo de Chopp" },
];

export default function QuoteWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Lead>>({
    eventType: "casamento",
    eventDate: "",
    location: { city: "", neighborhood: "", address: "", cep: "" },
    guestCount: 50,
    services: [],
    additionalInfo: "",
    customerName: "",
    customerEmail: "",
    customerWhatsApp: "",
    contactPreference: "whatsapp",
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => {
      const services = prev.services || [];
      if (services.includes(serviceId)) {
        return { ...prev, services: services.filter((s) => s !== serviceId) };
      }
      return { ...prev, services: [...services, serviceId] };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const leadData = {
        ...formData,
        status: "novo",
        createdAt: serverTimestamp(),
      } as Lead;
      
      const docRef = await addDoc(collection(db, "leads"), leadData);
      console.log("Lead submitted with ID:", docRef.id);
      setIsSuccess(true);

      // Prepare WhatsApp message
      const message = `Olá! Gostaria de solicitar um orçamento para meu evento.
*Evento:* ${formData.eventType}
*Data:* ${formData.eventDate}
*Convidados:* ${formData.guestCount}
*Local:* ${formData.location?.neighborhood}, ${formData.location?.city}
*Serviços:* ${formData.services?.join(", ")}
*Nome:* ${formData.customerName}`;
      
      const whatsappUrl = `https://wa.me/5567999990000?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");

    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "leads");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white/5 border border-white/10 p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-brand-green" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-3xl font-black uppercase text-white">Solicitação Recebida!</h3>
          <p className="font-body text-white/50 max-w-sm mx-auto">
            A equipe da Cervejaria Guanandi entrará em contato para confirmar os detalhes e preparar seu orçamento.
          </p>
        </div>
        <a 
          href="https://wa.me/5567999990000"
          className="inline-flex items-center gap-3 bg-brand-yellow text-brand-black px-8 py-4 font-display font-black uppercase tracking-tight hover:bg-brand-amber transition-all"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Falar no WhatsApp Agora</span>
        </a>
      </div>
    );
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const minDateString = minDate.toISOString().split("T")[0];

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-black uppercase text-white">Qual o tipo do seu evento?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setFormData({ ...formData, eventType: type.value as any });
                    nextStep();
                  }}
                  className={`p-6 text-left border transition-all ${
                    formData.eventType === type.value
                      ? "bg-brand-yellow text-brand-black border-brand-yellow"
                      : "bg-white/5 text-white border-white/10 hover:border-white/30"
                  }`}
                >
                  <span className="font-display text-lg font-black uppercase">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-black uppercase text-white">Quando será o evento?</h3>
            <p className="font-body text-xs text-white/40 uppercase tracking-widest mb-4">Mínimo de 7 dias de antecedência para reservas</p>
            <input 
              type="date"
              min={minDateString}
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              className="w-full bg-brand-black border border-white/10 p-6 text-white font-display text-2xl focus:outline-none focus:border-brand-yellow"
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-black uppercase text-white">Onde será realizado?</h3>
            <div className="grid grid-cols-2 gap-4">
              <input 
                placeholder="Cidade"
                value={formData.location?.city}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location!, city: e.target.value } })}
                className="col-span-2 sm:col-span-1 bg-brand-black border border-white/10 p-4 text-white"
              />
              <input 
                placeholder="Bairro"
                value={formData.location?.neighborhood}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location!, neighborhood: e.target.value } })}
                className="col-span-2 sm:col-span-1 bg-brand-black border border-white/10 p-4 text-white"
              />
              <input 
                placeholder="Endereço Completo"
                value={formData.location?.address}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location!, address: e.target.value } })}
                className="col-span-2 bg-brand-black border border-white/10 p-4 text-white"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-black uppercase text-white">Número estimado de convidados?</h3>
            <div className="flex items-center gap-8 py-8">
              <input 
                type="range"
                min="20"
                max="500"
                step="10"
                value={formData.guestCount}
                onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
                className="flex-grow accent-brand-yellow"
              />
              <span className="font-display text-4xl font-black text-brand-yellow w-32 text-right">
                {formData.guestCount}
              </span>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-black uppercase text-white">Quais serviços você precisa?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERVICES.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceToggle(service.label)}
                  className={`p-6 text-left border transition-all ${
                    formData.services?.includes(service.label)
                      ? "bg-brand-yellow text-brand-black border-brand-yellow"
                      : "bg-white/5 text-white border-white/10 hover:border-white/30"
                  }`}
                >
                  <span className="font-display text-lg font-black uppercase">{service.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-black uppercase text-white">Conte-nos um pouco sobre o evento</h3>
            <textarea 
              rows={5}
              placeholder="Ex: Local de difícil acesso, necessidade de montagem de madrugada..."
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              className="w-full bg-brand-black border border-white/10 p-4 text-white resize-none"
            />
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-black uppercase text-white">Como podemos te contatar?</h3>
            <div className="space-y-4">
              <input 
                placeholder="Seu Nome"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full bg-brand-black border border-white/10 p-4 text-white"
              />
              <input 
                placeholder="WhatsApp"
                value={formData.customerWhatsApp}
                onChange={(e) => setFormData({ ...formData, customerWhatsApp: e.target.value })}
                className="w-full bg-brand-black border border-white/10 p-4 text-white"
              />
              <input 
                placeholder="E-mail"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="w-full bg-brand-black border border-white/10 p-4 text-white"
              />
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-black uppercase text-white">Resumo da Solicitação</h3>
            <div className="bg-white/5 border border-white/10 p-6 space-y-4 font-display text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40 uppercase">Evento:</span>
                <span className="text-white font-black uppercase">{formData.eventType}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40 uppercase">Data:</span>
                <span className="text-white font-black">{formData.eventDate}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40 uppercase">Local:</span>
                <span className="text-white font-black">{formData.location?.city}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40 uppercase">Serviços:</span>
                <span className="text-white font-black">{formData.services?.join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 uppercase">Contato:</span>
                <span className="text-white font-black">{formData.customerWhatsApp}</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="flex gap-1 mb-8">
        {STEPS.map((step, idx) => (
          <div 
            key={step.id} 
            className={`h-1.5 flex-grow transition-all duration-500 ${
              idx <= currentStep ? "bg-brand-yellow" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 p-8 md:p-12 relative overflow-hidden min-h-[500px] flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-grow"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-12 pt-8 border-t border-white/10">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 font-display text-xs font-black uppercase tracking-widest ${
              currentStep === 0 ? "text-white/10 cursor-not-allowed" : "text-white/60 hover:text-white"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          {currentStep === STEPS.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-brand-yellow text-brand-black px-8 py-4 font-display font-black uppercase tracking-tight hover:bg-brand-amber transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 bg-white/5 border border-white/10 px-8 py-4 font-display font-black uppercase tracking-tight hover:bg-white/10 transition-all text-white"
            >
              <span>Próximo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
