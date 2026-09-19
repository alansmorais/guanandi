/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Lead, Reservation } from "../../types";
import { useFirebase } from "../../contexts/FirebaseContext";
import { Users, Calendar, TrendingUp, Clock, ChevronRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminDashboard() {
  const { isAdmin } = useFirebase();
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalReservations: 0,
    confirmedReservations: 0,
    pendingReservations: 0,
  });

  useEffect(() => {
    if (!isAdmin) return;

    // Leads listener
    const unsubLeads = onSnapshot(collection(db, "leads"), (snapshot) => {
      setStats(prev => ({ ...prev, totalLeads: snapshot.docs.length }));
    });

    // Reservations listener
    const unsubRes = onSnapshot(collection(db, "reservations"), (snapshot) => {
      const res = snapshot.docs.map(doc => doc.data() as Reservation);
      setStats(prev => ({
        ...prev,
        totalReservations: res.length,
        confirmedReservations: res.filter(r => r.status === "confirmada").length,
        pendingReservations: res.filter(r => r.status === "pendente").length,
      }));
      
      const sorted = res.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setRecentReservations(sorted.slice(0, 5));
    });

    return () => {
      unsubLeads();
      unsubRes();
    };
  }, [isAdmin]);

  const cards = [
    { label: "Reservas Pendentes", value: stats.pendingReservations, icon: Clock, color: "text-brand-yellow" },
    { label: "Reservas Confirmadas", value: stats.confirmedReservations, icon: Calendar, color: "text-brand-green" },
    { label: "Total de Reservas", value: stats.totalReservations, icon: ShoppingBag, color: "text-brand-amber" },
    { label: "Total de Orçamentos", value: stats.totalLeads, icon: Users, color: "text-white/40" },
  ];

  return (
    <div className="space-y-12">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-8 space-y-4">
            <div className="flex items-center justify-between">
              <card.icon className={`w-5 h-5 ${card.color}`} />
              <span className="font-display text-[10px] font-black uppercase text-white/20 tracking-widest">Guanandi Metric</span>
            </div>
            <div className="space-y-1">
              <div className="font-display text-4xl font-black text-white">{card.value}</div>
              <div className="font-display text-[10px] font-black uppercase text-white/40 tracking-widest">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Reservations */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-black uppercase text-white tracking-widest">Reservas Recentes</h2>
            <Link to="/admin/reservations" className="font-display text-[10px] font-black uppercase text-brand-yellow hover:underline">Ver Todas</Link>
          </div>

          <div className="bg-white/5 border border-white/10 overflow-hidden">
            {recentReservations.length === 0 ? (
              <div className="p-12 text-center text-white/20 font-display text-xs uppercase tracking-widest">
                Nenhuma reserva recebida ainda.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentReservations.map((res, idx) => (
                  <Link 
                    to={`/admin/reservations?id=${res.id}`} 
                    key={idx} 
                    className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center font-display font-black text-brand-yellow text-xs uppercase">
                        {res.customerName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-display text-sm font-black uppercase text-white group-hover:text-brand-yellow transition-colors">{res.customerName}</div>
                        <div className="font-body text-[10px] text-white/30 uppercase tracking-tight">
                          {res.beerName} ({res.kegSize}L) • {res.eventDate ? format(new Date(res.eventDate), "dd MMM yyyy", { locale: ptBR }) : "N/D"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <span className={`px-2 py-1 text-[9px] font-black uppercase border ${
                        res.status === 'pendente' ? 'bg-brand-yellow/20 border-brand-yellow/40 text-brand-yellow' : 'bg-white/5 border-white/10 text-white/40'
                      }`}>
                        {res.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-brand-yellow group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="font-display text-lg font-black uppercase text-white tracking-widest">Próximos Eventos</h2>
          <div className="bg-white/5 border border-white/10 p-8 space-y-6">
            <div className="space-y-4">
              {recentReservations.filter(r => r.status === 'confirmada').slice(0, 3).map((res, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-white/10 border border-white/10 text-white">
                    <span className="text-[10px] font-black uppercase">{res.eventDate ? format(new Date(res.eventDate), "MMM", { locale: ptBR }) : ""}</span>
                    <span className="text-xl font-black">{res.eventDate ? format(new Date(res.eventDate), "dd") : ""}</span>
                  </div>
                  <div>
                    <div className="font-display text-xs font-black uppercase text-white">{res.customerName}</div>
                    <div className="font-body text-[10px] text-white/30 uppercase">{res.beerName} • {res.kegSize}L</div>
                  </div>
                </div>
              ))}
              {recentReservations.filter(r => r.status === 'confirmada').length === 0 && (
                <div className="text-[10px] font-black uppercase text-white/20 text-center py-4">Nenhum evento confirmado em breve.</div>
              )}
            </div>
            <Link to="/admin/reservations" className="block w-full py-3 border border-white/10 font-display text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-white/30 transition-all text-center">
              Ver Todas Reservas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
