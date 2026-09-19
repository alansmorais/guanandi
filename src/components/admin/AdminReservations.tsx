/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { collection, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { useFirebase } from "../../contexts/FirebaseContext";
import { Reservation } from "../../types";
import { Search, Filter, MoreHorizontal, Calendar, CreditCard, Mail, Phone, Trash2, CheckCircle, Clock, XCircle, Send } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_CONFIG = {
  pendente: { label: "Pendente", color: "bg-blue-500/10 border-blue-500/20 text-blue-500", icon: Clock },
  confirmada: { label: "Confirmada", color: "bg-brand-green/10 border-brand-green/20 text-brand-green", icon: CheckCircle },
  concluida: { label: "Concluída", color: "bg-white/5 border-white/10 text-white/40", icon: CheckCircle },
  cancelada: { label: "Cancelada", color: "bg-red-500/10 border-red-500/20 text-red-500", icon: XCircle },
};

export default function AdminReservations() {
  const { isAdmin } = useFirebase();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = onSnapshot(
      collection(db, "reservations"), 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Reservation));
        setReservations(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      },
      (error) => {
        console.error("Reservations listener error:", error);
      }
    );
    return () => unsubscribe();
  }, [isAdmin]);

  const updateStatus = async (id: string, status: Reservation["status"]) => {
    try {
      await updateDoc(doc(db, "reservations", id), { status, updatedAt: new Date() });
      if (selectedRes?.id === id) {
        setSelectedRes({ ...selectedRes, status });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reservations/${id}`);
    }
  };

  const deleteReservation = async (id: string) => {
    if (!confirm("Excluir esta reserva permanentemente?")) return;
    try {
      await deleteDoc(doc(db, "reservations", id));
      setSelectedRes(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reservations/${id}`);
    }
  };

  const filtered = reservations.filter(res => {
    const matchesFilter = filter === "todos" || res.status === filter;
    const matchesSearch = res.customerName.toLowerCase().includes(search.toLowerCase()) || 
                          res.beerName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col gap-8">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white/5 border border-white/10 p-4">
        <div className="relative flex-grow max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou chopp..."
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
              {s === "todos" ? "Todas" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        <div className="lg:col-span-8 bg-white/5 border border-white/10 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-6 font-display text-[10px] font-black uppercase text-white/40 tracking-widest">Cliente</th>
                  <th className="p-6 font-display text-[10px] font-black uppercase text-white/40 tracking-widest">Chopp / Barril</th>
                  <th className="p-6 font-display text-[10px] font-black uppercase text-white/40 tracking-widest">Data</th>
                  <th className="p-6 font-display text-[10px] font-black uppercase text-white/40 tracking-widest">Total</th>
                  <th className="p-6 font-display text-[10px] font-black uppercase text-white/40 tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((res) => (
                  <tr 
                    key={res.id} 
                    className={`hover:bg-white/5 transition-colors cursor-pointer group ${selectedRes?.id === res.id ? "bg-white/10" : ""}`}
                    onClick={() => setSelectedRes(res)}
                  >
                    <td className="p-6">
                      <div className="font-display text-sm font-black uppercase text-white group-hover:text-brand-yellow">{res.customerName}</div>
                      <div className="font-body text-[10px] text-white/30 uppercase tracking-tight">{res.customerWhatsApp}</div>
                    </td>
                    <td className="p-6">
                      <div className="font-display text-xs font-black uppercase text-white">{res.beerName}</div>
                      <div className="font-display text-[10px] text-white/40 uppercase">{res.kegSize}L (x{res.quantity})</div>
                    </td>
                    <td className="p-6 text-white font-display text-sm font-black">
                      {res.eventDate ? format(new Date(res.eventDate), "dd/MM/yy") : "N/D"}
                    </td>
                    <td className="p-6 text-brand-yellow font-display text-sm font-black">
                      R$ {res.totalPrice?.toLocaleString('pt-BR')},00
                    </td>
                    <td className="p-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 text-[9px] font-black uppercase border ${STATUS_CONFIG[res.status].color}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {STATUS_CONFIG[res.status].label}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 bg-brand-black border border-white/10 flex flex-col min-h-[600px]">
          {selectedRes ? (
            <div className="flex flex-col h-full">
              <div className="p-8 border-b border-white/5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center font-display font-black text-brand-black text-2xl">
                    {selectedRes.customerName.charAt(0)}
                  </div>
                  <button onClick={() => deleteReservation(selectedRes.id!)} className="text-white/20 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="font-display text-2xl font-black uppercase text-white">{selectedRes.customerName}</h3>
              </div>

              <div className="p-8 flex-grow space-y-8 overflow-y-auto">
                <div className="space-y-4">
                  <h4 className="font-display text-[10px] font-black uppercase text-brand-yellow tracking-[0.2em] border-b border-white/5 pb-2">Itens da Reserva</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between font-display text-xs">
                      <span className="text-white/30 uppercase">Produto:</span>
                      <span className="text-white font-black uppercase">{selectedRes.beerName}</span>
                    </div>
                    <div className="flex justify-between font-display text-xs">
                      <span className="text-white/30 uppercase">Configuração:</span>
                      <span className="text-white font-black">{selectedRes.kegSize}L (x{selectedRes.quantity})</span>
                    </div>
                    <div className="flex justify-between font-display text-xs">
                      <span className="text-white/30 uppercase">Valor dos Itens:</span>
                      <span className="text-white font-black">R$ {(selectedRes.totalPrice - (selectedRes.logisticsFee || 0)).toLocaleString('pt-BR')},00</span>
                    </div>
                    <div className="flex justify-between font-display text-xs">
                      <span className="text-white/30 uppercase">Taxa Logística:</span>
                      <span className="text-white font-black">R$ {selectedRes.logisticsFee?.toLocaleString('pt-BR')},00</span>
                    </div>
                    <div className="flex justify-between font-display text-sm pt-2 border-t border-white/5">
                      <span className="text-white/60 uppercase font-black">Total:</span>
                      <span className="text-brand-yellow font-black">R$ {selectedRes.totalPrice?.toLocaleString('pt-BR')},00</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-display text-[10px] font-black uppercase text-brand-yellow tracking-[0.2em] border-b border-white/5 pb-2">Logística & Entrega</h4>
                  <div className="space-y-3 font-display text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/30 uppercase">Data:</span>
                      <span className="text-white font-black">{selectedRes.eventDate ? format(new Date(selectedRes.eventDate), "EEEE, dd 'de' MMMM", { locale: ptBR }) : "N/D"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-white/30 uppercase">Endereço:</span>
                      <span className="text-white font-black">{selectedRes.location.address}</span>
                      <span className="text-white/60 text-[10px]">{selectedRes.location.neighborhood}, {selectedRes.location.city}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <a href={`https://wa.me/${selectedRes.customerWhatsApp.replace(/\D/g, '')}`} target="_blank" className="flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 py-4 text-[#25D366] font-display text-[10px] font-black uppercase tracking-widest hover:bg-[#25D366]/20 transition-all">
                    <Phone className="w-4 h-4" /> WhatsApp
                  </a>
                  <a href={`mailto:${selectedRes.customerEmail}`} className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-4 text-white/60 font-display text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    <Mail className="w-4 h-4" /> E-mail
                  </a>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 space-y-4 bg-white/5">
                <h4 className="font-display text-[10px] font-black uppercase text-white tracking-widest">Gestão de Status</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(STATUS_CONFIG) as Reservation["status"][]).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedRes.id!, s)}
                      className={`flex items-center gap-2 px-3 py-2 text-[9px] font-black uppercase border transition-all ${
                        selectedRes.status === s 
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
              <Calendar className="w-12 h-12 text-white/5" />
              <div className="font-display text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">Selecione uma reserva para ver os detalhes</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
