/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { useFirebase } from "../../contexts/FirebaseContext";
import { Beer as BeerType, Equipment } from "../../types";
import { Beer, Package, Plus, Trash2, Edit2, Save, X, Check, Globe } from "lucide-react";

export default function AdminInventory() {
  const { isAdmin } = useFirebase();
  const [activeTab, setActiveTab] = useState<"beers" | "tents">("beers");
  const [beers, setBeers] = useState<BeerType[]>([]);
  const [tents, setTents] = useState<Equipment[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const unsubBeers = onSnapshot(collection(db, "beers"), (snapshot) => {
      setBeers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as BeerType)));
    }, (error) => {
      console.error("Inventory beers listener error:", error);
    });
    const unsubTents = onSnapshot(collection(db, "tents"), (snapshot) => {
      setTents(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Equipment)));
    }, (error) => {
      console.error("Inventory tents listener error:", error);
    });
    return () => { unsubBeers(); unsubTents(); };
  }, [isAdmin]);

  const addBeer = async () => {
    const newBeer: Partial<BeerType> = {
      name: "Novo Chopp",
      style: "Pilsen",
      description: "Descrição aqui...",
      abv: "4.5%",
      ibu: 15,
      price30L: 420,
      price50L: 650,
      image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80",
    };
    try {
      await addDoc(collection(db, "beers"), newBeer);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "beers");
    }
  };

  const deleteItem = async (collectionName: string, id: string) => {
    if (!confirm("Excluir item permanentemente?")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab("beers")}
            className={`flex items-center gap-2 px-6 py-4 font-display text-xs font-black uppercase tracking-widest border transition-all ${
              activeTab === "beers" ? "bg-brand-yellow text-brand-black border-brand-yellow" : "text-white/40 border-white/5 hover:border-white/20"
            }`}
          >
            <Beer className="w-4 h-4" />
            <span>Chopes</span>
          </button>
          <button 
            onClick={() => setActiveTab("tents")}
            className={`flex items-center gap-2 px-6 py-4 font-display text-xs font-black uppercase tracking-widest border transition-all ${
              activeTab === "tents" ? "bg-brand-yellow text-brand-black border-brand-yellow" : "text-white/40 border-white/5 hover:border-white/20"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Tendas & Estruturas</span>
          </button>
        </div>
        <button 
          onClick={addBeer}
          className="flex items-center gap-2 bg-brand-yellow text-brand-black px-6 py-4 font-display text-xs font-black uppercase tracking-widest hover:bg-brand-amber transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Item</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {activeTab === "beers" ? (
          beers.map((beer) => (
            <div key={beer.id} className="bg-white/5 border border-white/10 group">
              <div className="relative h-48">
                <img src={beer.image} alt={beer.name} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-brand-yellow text-brand-black px-2 py-0.5 font-display text-[9px] font-black uppercase tracking-widest">{beer.style}</span>
                  <h3 className="font-display text-xl font-black uppercase text-white mt-1">{beer.name}</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="font-display text-[9px] font-black uppercase text-white/30 tracking-widest block">Preço 30L</span>
                    <div className="font-display text-sm font-black text-white">R$ {beer.price30L}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-display text-[9px] font-black uppercase text-white/30 tracking-widest block">Preço 50L</span>
                    <div className="font-display text-sm font-black text-white">R$ {beer.price50L}</div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-white/5">
                  <button className="flex-grow flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 py-3 text-white/60 font-display text-[9px] font-black uppercase tracking-widest transition-all">
                    <Edit2 className="w-3 h-3" /> Editar
                  </button>
                  <button 
                    onClick={() => deleteItem("beers", beer.id)}
                    className="px-4 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 py-3 text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white/5 border border-dashed border-white/10">
            <Package className="w-12 h-12 text-white/5 mx-auto mb-4" />
            <span className="font-display text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">Funcionalidade de Gestão de Tendas em Breve</span>
          </div>
        )}
      </div>
    </div>
  );
}
