/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { collection, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { useFirebase } from "../../contexts/FirebaseContext";
import { Lead } from "../../types";
import { Search, Filter, MoreHorizontal, MessageSquare, Mail, Phone, Trash2, CheckCircle, Clock, XCircle, Send, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_CONFIG = {
  novo: { label: "Novo", color: "bg-blue-500/10 border-blue-500/20 text-blue-500", icon: Clock },
  em_contato: { label: "Em Contato", color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500", icon: MessageSquare },
  orcamento_enviado: { label: "Orçamento Enviado", color: "bg-brand-amber/10 border-brand-amber/20 text-brand-amber", icon: Send },
  confirmado: { label: "Confirmado", color: "bg-brand-green/10 border-brand-green/20 text-brand-green", icon: CheckCircle },
  concluido: { label: "Concluído", color: "bg-white/5 border-white/10 text-white/40", icon: CheckCircle },
  cancelado: { label: "Cancelado", color: "bg-red-500/10 border-red-500/20 text-red-500", icon: XCircle },
};

export default function AdminLeads() {
  const { isAdmin } = useFirebase();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = onSnapshot(
      collection(db, "leads"), 
      (snapshot) => {
        const leadsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Lead));
        setLeads(leadsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      },
      (error) => {
        console.error("Leads listener error:", error);
      }
    );
    return () => unsubscribe();
  }, [isAdmin]);

  const updateLeadStatus = async (id: string, status: Lead["status"]) => {
    try {
      await updateDoc(doc(db, "leads", id), { status, updatedAt: new Date() });
      if (selectedLead?.id === id) {
        setSelectedLead({ ...selectedLead, status });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `leads/${id}`);
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta solicitação?")) return;
    try {
      await deleteDoc(doc(db, "leads", id));
      setSelectedLead(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `leads/${id}`);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === "todos" || lead.status === filter;
    const matchesSearch = lead.customerName.toLowerCase().includes(search.toLowerCase()) || 
                          lead.customerWhatsApp.includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col gap-8">
      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white/5 border border-white/10 p-4">
        <div className="relative flex-grow max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-black border border-white/10 pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-yellow transition-colors"
          />
        </div>
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          {["todos", ...Object.keys(STATUS_CONFIG)].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 font-display text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${
                filter === s ? "bg-brand-yellow text-brand-black border-brand-yellow" : "bg-white/5 text-white/40 border-white/5 hover:border-white/20"
              }`}
            >
              {s === "todos" ? "Todos" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        {/* Leads Table */}
        <div className="lg:col-span-8 bg-white/5 border border-white/10 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-6 font-display text-[10px] font-black uppercase text-white/40 tracking-widest">Cliente</th>
                  <th className="p-6 font-display text-[10px] font-black uppercase text-white/40 tracking-widest">Evento</th>
                  <th className="p-6 font-display text-[10px] font-black uppercase text-white/40 tracking-widest">Data</th>
                  <th className="p-6 font-display text-[10px] font-black uppercase text-white/40 tracking-widest">Status</th>
                  <th className="p-6 font-display text-[10px] font-black uppercase text-white/40 tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className={`hover:bg-white/5 transition-colors cursor-pointer group ${selectedLead?.id === lead.id ? "bg-white/10" : ""}`}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td className="p-6">
                      <div className="font-display text-sm font-black uppercase text-white group-hover:text-brand-yellow">{lead.customerName}</div>
                      <div className="font-body text-[10px] text-white/30 uppercase tracking-tight">{lead.customerWhatsApp}</div>
                    </td>
                    <td className="p-6">
                      <span className="font-display text-[10px] font-black uppercase text-white/60 bg-white/5 px-2 py-1">{lead.eventType}</span>
                    </td>
                    <td className="p-6">
                      <div className="font-display text-sm font-black text-white">{format(new Date(lead.eventDate), "dd/MM/yy")}</div>
                    </td>
                    <td className="p-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 text-[9px] font-black uppercase border ${STATUS_CONFIG[lead.status].color}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {STATUS_CONFIG[lead.status].label}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <MoreHorizontal className="w-4 h-4 text-white/10 group-hover:text-white" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredLeads.length === 0 && (
            <div className="p-20 text-center text-white/20 font-display text-xs uppercase tracking-widest">
              Nenhum lead encontrado para este filtro.
            </div>
          )}
        </div>

        {/* Lead Detail Panel */}
        <div className="lg:col-span-4 bg-brand-black border border-white/10 flex flex-col min-h-[600px]">
          {selectedLead ? (
            <div className="flex flex-col h-full">
              <div className="p-8 border-b border-white/5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center font-display font-black text-brand-black text-2xl">
                    {selectedLead.customerName.charAt(0)}
                  </div>
                  <button onClick={() => deleteLead(selectedLead.id!)} className="text-white/20 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-2xl font-black uppercase text-white">{selectedLead.customerName}</h3>
                  <p className="font-body text-xs text-white/40 uppercase tracking-widest">Recebido em {format(new Date(selectedLead.createdAt.seconds * 1000), "dd/MM/yyyy HH:mm")}</p>
                </div>
              </div>

              <div className="p-8 flex-grow space-y-8 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <a href={`https://wa.me/${selectedLead.customerWhatsApp.replace(/\D/g, '')}`} target="_blank" className="flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 py-4 text-[#25D366] font-display text-[10px] font-black uppercase tracking-widest hover:bg-[#25D366]/20 transition-all">
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </a>
                  <a href={`mailto:${selectedLead.customerEmail}`} className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-4 text-white/60 font-display text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    <Mail className="w-4 h-4" /> E-mail
                  </a>
                </div>

                <div className="space-y-4">
                  <h4 className="font-display text-[10px] font-black uppercase text-brand-yellow tracking-[0.2em] border-b border-white/5 pb-2">Detalhes do Evento</h4>
                  <div className="space-y-3 font-display text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/30 uppercase">Tipo:</span>
                      <span className="text-white font-black uppercase">{selectedLead.eventType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/30 uppercase">Data:</span>
                      <span className="text-white font-black">{format(new Date(selectedLead.eventDate), "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/30 uppercase">Local:</span>
                      <span className="text-white font-black">{selectedLead.location.neighborhood}, {selectedLead.location.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/30 uppercase">Convidados:</span>
                      <span className="text-white font-black">{selectedLead.guestCount}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-display text-[10px] font-black uppercase text-brand-yellow tracking-[0.2em] border-b border-white/5 pb-2">Serviços Solicitados</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.services.map((s, i) => (
                      <span key={i} className="bg-white/5 border border-white/10 px-2 py-1 font-display text-[10px] font-black uppercase text-white/60">{s}</span>
                    ))}
                  </div>
                </div>

                {selectedLead.additionalInfo && (
                  <div className="space-y-4">
                    <h4 className="font-display text-[10px] font-black uppercase text-brand-yellow tracking-[0.2em] border-b border-white/5 pb-2">Observações</h4>
                    <p className="font-body text-xs text-white/40 leading-relaxed italic">"{selectedLead.additionalInfo}"</p>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-white/5 space-y-4 bg-white/5">
                <h4 className="font-display text-[10px] font-black uppercase text-white tracking-widest">Alterar Status</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(STATUS_CONFIG) as Lead["status"][]).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateLeadStatus(selectedLead.id!, s)}
                      className={`flex items-center gap-2 px-3 py-2 text-[9px] font-black uppercase border transition-all ${
                        selectedLead.status === s 
                          ? STATUS_CONFIG[s].color 
                          : "bg-brand-black text-white/30 border-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
              <Users className="w-12 h-12 text-white/5" />
              <div className="font-display text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">Selecione um lead para ver os detalhes</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
