/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Gestão de Reservas — Painel Administrativo Cervejaria Guanandi
 * - Visualização detalhada de primeira e segunda cerveja (upsell)
 * - Exibição de horário, quantidade de convidados e endereço
 * - Atualização e cancelamento de reservas via API backend segura
 * - Busca por cliente, telefone, e-mail, código e filtros por status e data
 */

import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Calendar, 
  CreditCard, 
  Mail, 
  Phone, 
  Trash2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Sparkles, 
  Users, 
  MapPin, 
  AlertCircle,
  RefreshCw,
  FileText,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Reservation } from "../../types";
import { 
  fetchAdminReservations, 
  updateReservationStatusApi, 
  deleteReservationApi 
} from "../../lib/api";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pendente: { label: "Pendente", color: "bg-amber-500/10 border-amber-500/30 text-amber-400", icon: Clock },
  confirmada: { label: "Confirmada", color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400", icon: CheckCircle },
  concluida: { label: "Concluída", color: "bg-blue-500/10 border-blue-500/30 text-blue-400", icon: Check },
  cancelada: { label: "Cancelada", color: "bg-red-500/10 border-red-500/30 text-red-400", icon: XCircle },
};

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Carrega reservas do backend
  const loadReservations = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminReservations();
      if (res.reservations) {
        setReservations(res.reservations);
        if (selectedRes) {
          const updatedSelected = res.reservations.find(r => r.id === selectedRes.id);
          if (updatedSelected) setSelectedRes(updatedSelected);
        }
      }
    } catch (e) {
      console.warn("Falha ao buscar reservas via API, tentando sincronização local:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();

    // Sincronização em tempo real caso o Firestore esteja configurado
    try {
      const unsubscribe = onSnapshot(collection(db, "reservations"), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Reservation));
        if (data.length > 0) {
          setReservations(data.sort((a, b) => {
            const dateA = a.createdAt?.seconds || new Date(a.createdAt || 0).getTime();
            const dateB = b.createdAt?.seconds || new Date(b.createdAt || 0).getTime();
            return Number(dateB) - Number(dateA);
          }));
        }
      }, (err) => {
        // Ignora caso offline ou regras restrinjam
      });
      return () => unsubscribe();
    } catch (e) {
      // noop
    }
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: Reservation["status"]) => {
    setIsUpdating(true);
    setFeedbackMsg(null);
    try {
      const res = await updateReservationStatusApi(id, newStatus);
      if (res.success && res.reservation) {
        setReservations(prev => prev.map(r => r.id === id ? res.reservation! : r));
        setSelectedRes(res.reservation);
        setFeedbackMsg({ type: "success", text: `Status alterado para "${STATUS_CONFIG[newStatus].label}" com sucesso!` });
      } else {
        throw new Error(res.error || "Erro ao atualizar status.");
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Não foi possível atualizar o status." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelReservation = async (id: string) => {
    if (!window.confirm("Deseja realmente marcar esta reserva como CANCELADA?")) return;
    await handleUpdateStatus(id, "cancelada");
  };

  const handleDeletePermanent = async (id: string) => {
    if (!window.confirm("Atenção: Deseja EXCLUIR permanentemente esta reserva do banco de dados?")) return;
    try {
      await deleteReservationApi(id);
      setReservations(prev => prev.filter(r => r.id !== id));
      if (selectedRes?.id === id) setSelectedRes(null);
      setFeedbackMsg({ type: "success", text: "Reserva excluída com sucesso." });
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Erro ao excluir reserva." });
    }
  };

  // Filtros combinados: Status, Data e Busca textual
  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      const matchesStatus = statusFilter === "todos" || res.status === statusFilter;
      const matchesDate = !dateFilter || res.eventDate === dateFilter;

      const q = search.toLowerCase();
      const matchesSearch = 
        !search ||
        res.customerName?.toLowerCase().includes(q) ||
        res.customerWhatsApp?.toLowerCase().includes(q) ||
        res.customerEmail?.toLowerCase().includes(q) ||
        res.beerName?.toLowerCase().includes(q) ||
        (res.secondBeer && res.secondBeer.beerName?.toLowerCase().includes(q)) ||
        (res.reservationCode && res.reservationCode.toLowerCase().includes(q));

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [reservations, statusFilter, dateFilter, search]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <h1 className="font-heading font-black text-2xl uppercase tracking-wider text-white">
            Gestão de Reservas
          </h1>
          <p className="text-xs text-[#888] font-body">
            Acompanhe pedidos, barris, opções de pós-venda (2ª cerveja) e status de confirmação.
          </p>
        </div>

        <button
          onClick={loadReservations}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 bg-[#181818] border border-[#2D2D2D] text-xs font-heading font-bold uppercase text-[#CCC] hover:text-white hover:border-[#444] rounded transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-brand-yellow" : ""}`} />
          <span>Atualizar Lista</span>
        </button>
      </div>

      {/* Notifications feedback */}
      {feedbackMsg && (
        <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
          feedbackMsg.type === "success" 
            ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300" 
            : "bg-red-950/40 border-red-800/60 text-red-300"
        }`}>
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-bold underline ml-2">Fechar</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-[#121212] border border-[#242424] rounded-lg p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Text Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            <input
              type="text"
              placeholder="Buscar por cliente, e-mail, telefone, chopp ou código (#GN-)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#2E2E2E] rounded pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-yellow font-body transition-colors"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-specs text-[#888] whitespace-nowrap">Data do Evento:</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[#0A0A0A] border border-[#2E2E2E] rounded px-2.5 py-1.5 text-xs text-brand-cream focus:outline-none focus:border-brand-yellow font-specs"
            />
            {dateFilter && (
              <button 
                onClick={() => setDateFilter("")}
                className="text-[11px] text-brand-yellow underline font-specs"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <button
            onClick={() => setStatusFilter("todos")}
            className={`px-3 py-1 rounded text-xs font-heading font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              statusFilter === "todos"
                ? "bg-brand-yellow text-brand-black"
                : "bg-[#181818] text-[#888] hover:text-white"
            }`}
          >
            Todas ({reservations.length})
          </button>

          {Object.keys(STATUS_CONFIG).map((st) => {
            const count = reservations.filter(r => r.status === st).length;
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded text-xs font-heading font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-brand-yellow text-brand-black"
                    : "bg-[#181818] text-[#888] hover:text-white"
                }`}
              >
                <span>{STATUS_CONFIG[st].label}</span>
                <span className="text-[10px] font-specs opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Reservations Table + Selected Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table List (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-[#121212] border border-[#242424] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#181818] border-b border-[#262626] text-[10px] font-specs font-bold uppercase text-[#888] tracking-wider">
                  <th className="py-3 px-4">Código / Cliente</th>
                  <th className="py-3 px-3">Chopes Escolhidos</th>
                  <th className="py-3 px-3">Data / Hora</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F] text-xs font-body">
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#666]">
                      Nenhuma reserva encontrada para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((res) => {
                    const isSelected = selectedRes?.id === res.id;
                    const stConfig = STATUS_CONFIG[res.status] || STATUS_CONFIG.pendente;
                    const StatusIcon = stConfig.icon;

                    return (
                      <tr
                        key={res.id}
                        onClick={() => setSelectedRes(res)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-brand-yellow/10" : "hover:bg-[#181818]"
                        }`}
                      >
                        {/* Cliente */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-specs font-black text-brand-yellow text-[11px]">
                              {res.reservationCode || `#GN-${res.id?.slice(-4)}`}
                            </span>
                          </div>
                          <div className="font-heading font-black text-brand-cream text-xs uppercase">
                            {res.customerName}
                          </div>
                          <div className="text-[11px] text-[#777] font-specs">
                            {res.customerWhatsApp}
                          </div>
                        </td>

                        {/* Chopes & 2ª Cerveja */}
                        <td className="py-3 px-3">
                          <div className="font-heading font-bold text-white text-xs">
                            {res.beerName} ({res.kegSize}L)
                          </div>
                          {res.secondBeerAdded && res.secondBeer ? (
                            <div className="flex items-center gap-1 text-[11px] text-brand-yellow font-specs mt-0.5">
                              <Sparkles className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">2ª: {res.secondBeer.beerName} ({res.secondBeer.kegSize}L)</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-[#555] italic">Única cerveja</div>
                          )}
                        </td>

                        {/* Data / Hora */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="text-white font-specs font-bold text-xs">
                            {res.eventDate ? format(new Date(res.eventDate + 'T00:00:00'), "dd/MM/yyyy") : "A definir"}
                          </div>
                          <div className="text-[11px] text-[#888] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#666]" />
                            <span>{res.eventTime || "14:00"}</span>
                          </div>
                        </td>

                        {/* Total */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-specs font-black text-brand-yellow text-xs">
                            R$ {res.totalPrice?.toLocaleString('pt-BR')},00
                          </div>
                          <div className="text-[10px] text-[#666]">
                            {res.guestCount || 40} pessoas
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-specs font-bold uppercase border ${stConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{stConfig.label}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Reservation Detail Card (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-[#141414] border border-[#242424] rounded-lg p-5 flex flex-col space-y-4">
          {selectedRes ? (
            <div className="space-y-4 flex-1">
              {/* Header card */}
              <div className="border-b border-[#262626] pb-3 flex items-start justify-between">
                <div>
                  <span className="font-specs font-black text-brand-yellow text-sm bg-brand-yellow/10 px-2 py-0.5 rounded border border-brand-yellow/20">
                    {selectedRes.reservationCode || `#GN-${selectedRes.id?.slice(-4)}`}
                  </span>
                  <h3 className="font-heading font-black text-lg text-white uppercase mt-1.5">
                    {selectedRes.customerName}
                  </h3>
                </div>

                <button
                  onClick={() => handleDeletePermanent(selectedRes.id!)}
                  title="Excluir do banco de dados"
                  className="text-[#666] hover:text-red-400 p-1 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Status Update Control */}
              <div className="bg-[#191919] border border-[#2D2D2D] rounded-lg p-3 space-y-2">
                <span className="text-[11px] font-heading font-bold uppercase text-[#888] block">
                  Status Atual & Ações
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus(selectedRes.id!, "confirmada")}
                    disabled={isUpdating || selectedRes.status === "confirmada"}
                    className={`py-1.5 px-2 rounded text-[10px] font-heading font-black uppercase flex items-center justify-center gap-1 transition-all ${
                      selectedRes.status === "confirmada"
                        ? "bg-emerald-600 text-white"
                        : "bg-[#252525] text-[#AAA] hover:text-emerald-300 hover:bg-emerald-950/40"
                    }`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>Confirmar</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedRes.id!, "concluida")}
                    disabled={isUpdating || selectedRes.status === "concluida"}
                    className={`py-1.5 px-2 rounded text-[10px] font-heading font-black uppercase flex items-center justify-center gap-1 transition-all ${
                      selectedRes.status === "concluida"
                        ? "bg-blue-600 text-white"
                        : "bg-[#252525] text-[#AAA] hover:text-blue-300 hover:bg-blue-950/40"
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>Concluir</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedRes.id!, "pendente")}
                    disabled={isUpdating || selectedRes.status === "pendente"}
                    className={`py-1.5 px-2 rounded text-[10px] font-heading font-black uppercase flex items-center justify-center gap-1 transition-all ${
                      selectedRes.status === "pendente"
                        ? "bg-amber-600 text-white"
                        : "bg-[#252525] text-[#AAA] hover:text-amber-300 hover:bg-amber-950/40"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Pendente</span>
                  </button>

                  <button
                    onClick={() => handleCancelReservation(selectedRes.id!)}
                    disabled={isUpdating || selectedRes.status === "cancelada"}
                    className={`py-1.5 px-2 rounded text-[10px] font-heading font-black uppercase flex items-center justify-center gap-1 transition-all ${
                      selectedRes.status === "cancelada"
                        ? "bg-red-600 text-white"
                        : "bg-[#252525] text-[#AAA] hover:text-red-400 hover:bg-red-950/40"
                    }`}
                  >
                    <XCircle className="w-3 h-3" />
                    <span>Cancelar</span>
                  </button>
                </div>
              </div>

              {/* Data & Horário & Convidados */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-specs font-bold uppercase text-[#888] block">
                  Informações do Evento
                </span>
                <div className="bg-[#181818] p-2.5 rounded border border-[#282828] space-y-1 text-brand-cream">
                  <div className="flex justify-between">
                    <span className="text-[#888]">Data:</span>
                    <strong className="text-white">
                      {selectedRes.eventDate ? format(new Date(selectedRes.eventDate + 'T00:00:00'), "dd/MM/yyyy (EEEE)", { locale: ptBR }) : "A definir"}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Horário:</span>
                    <strong className="text-white">{selectedRes.eventTime || "14:00"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Estimativa de Convidados:</span>
                    <strong className="text-brand-yellow">{selectedRes.guestCount || 40} pessoas</strong>
                  </div>
                </div>
              </div>

              {/* Chopes / Produtos */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-specs font-bold uppercase text-[#888] block">
                  Chopes & Barris
                </span>
                <div className="bg-[#181818] p-2.5 rounded border border-[#282828] space-y-2">
                  {/* Cerveja 1 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-bold block">{selectedRes.beerName}</span>
                      <span className="text-[11px] text-[#888]">Barril {selectedRes.kegSize}L (Qtd: {selectedRes.quantity || 1})</span>
                    </div>
                    <span className="text-[10px] bg-brand-yellow/10 text-brand-yellow px-1.5 py-0.5 rounded font-specs">
                      1ª Cerveja
                    </span>
                  </div>

                  {/* Cerveja 2 (Upsell) */}
                  {selectedRes.secondBeerAdded && selectedRes.secondBeer ? (
                    <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-brand-yellow font-bold">
                          <Sparkles className="w-3 h-3" />
                          <span>{selectedRes.secondBeer.beerName}</span>
                        </div>
                        <span className="text-[11px] text-[#888]">
                          Barril {selectedRes.secondBeer.kegSize}L (Upsell Pós-Venda)
                        </span>
                      </div>
                      <span className="font-specs font-bold text-brand-yellow">
                        + R$ {selectedRes.secondBeer.price?.toLocaleString('pt-BR')},00
                      </span>
                    </div>
                  ) : (
                    <div className="pt-1 text-[11px] text-[#666] italic">
                      Segunda cerveja não selecionada
                    </div>
                  )}
                </div>
              </div>

              {/* Localização & Contatos */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-specs font-bold uppercase text-[#888] block">
                  Contato & Local de Entrega
                </span>
                <div className="bg-[#181818] p-2.5 rounded border border-[#282828] space-y-1.5 text-brand-cream">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0" />
                    <span>{selectedRes.customerWhatsApp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0" />
                    <span className="break-all">{selectedRes.customerEmail || "Não informado"}</span>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-[#262626]">
                    <MapPin className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0 mt-0.5" />
                    <div>
                      <div>{selectedRes.location?.address}</div>
                      <div className="text-[11px] text-[#888]">{selectedRes.location?.neighborhood} — {selectedRes.location?.city}</div>
                    </div>
                  </div>
                  {selectedRes.notes && (
                    <div className="pt-1 text-[11px] text-[#AAA] border-t border-[#262626]">
                      <strong>Obs:</strong> {selectedRes.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Total Financeiro */}
              <div className="bg-[#191919] p-3 rounded-lg border border-[#2D2D2D] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-specs uppercase text-[#888] block">Valor Total</span>
                  <span className="text-[11px] text-[#AAA]">
                    Sinal 50%: R$ {Math.round((selectedRes.totalPrice || 0) * 0.5).toLocaleString('pt-BR')},00
                  </span>
                </div>
                <span className="font-specs font-black text-xl text-brand-yellow">
                  R$ {selectedRes.totalPrice?.toLocaleString('pt-BR')},00
                </span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#666] space-y-2">
              <FileText className="w-10 h-10 text-[#444]" />
              <p className="text-xs">Selecione uma reserva ao lado para visualizar os detalhes completos e gerenciar o status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
