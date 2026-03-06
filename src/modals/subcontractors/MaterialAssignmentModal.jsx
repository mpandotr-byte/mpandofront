import React, { useState, useEffect } from 'react';
import {
    X,
    Package,
    Search,
    CheckCircle2,
    Trash2,
    Plus,
    ArrowRight,
    Info,
    AlertTriangle
} from 'lucide-react';
import { api } from '../../api/client';

const MaterialAssignmentModal = ({
    isOpen,
    onClose,
    onAssign,
    jobId,
    subcontractorName
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [materials, setMaterials] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMaterials();
        }
    }, [isOpen]);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const data = await api.get('/materials/catalog');
            const enriched = (data || []).map(m => ({
                ...m,
                stock_qty: m.quantity || 0, // using quantity from catalog or stock table if joined
                unit: m.unit || 'm2'
            }));
            setMaterials(enriched);
        } catch (err) {
            console.error("Materials fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMaterial = (material) => {
        if (selectedMaterials.find(m => m.id === material.id)) return;
        setSelectedMaterials([...selectedMaterials, { ...material, assign_qty: '' }]);
    };

    const updateQty = (id, qty) => {
        setSelectedMaterials(prev => prev.map(m => m.id === id ? { ...m, assign_qty: qty } : m));
    };

    const removeMaterial = (id) => {
        setSelectedMaterials(prev => prev.filter(m => m.id !== id));
    };

    const filtered = materials.filter(m =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-[#0A1128] text-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Malzeme Tahsis (Zimmet)</h2>
                        <p className="text-xs font-bold text-white/50 mt-1 uppercase tracking-widest">
                            Taşeron: <span className="text-[#D36A47]">{subcontractorName}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

                    {/* List / Search Column */}
                    <div className="w-full lg:w-1/2 p-6 border-b lg:border-b-0 lg:border-r border-slate-100 overflow-y-auto">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Depodan Malzeme Seç</h3>

                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Malzeme adı veya kategori ara..."
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#D36A47]/20 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            {filtered.map(m => (
                                <div
                                    key={m.id}
                                    onClick={() => handleSelectMaterial(m)}
                                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#D36A47] hover:shadow-lg transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#D36A47]/10 group-hover:text-[#D36A47] transition-all">
                                            <Package size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 uppercase leading-none mb-1">{m.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Stok: {m.stock_qty} {m.unit}</p>
                                        </div>
                                    </div>
                                    <Plus size={16} className="text-slate-300 group-hover:text-[#D36A47]" />
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <p className="text-center py-10 text-slate-300 text-[10px] font-black uppercase">Malzeme Bulunmadı</p>
                            )}
                        </div>
                    </div>

                    {/* Cart / Assignment Column */}
                    <div className="w-full lg:w-1/2 p-6 bg-slate-50/50 overflow-y-auto flex flex-col">
                        <h3 className="text-[10px] font-black text-[#D36A47] uppercase tracking-[0.2em] mb-4">Tahsİs Edİlecek Malzemeler</h3>

                        <div className="space-y-3 flex-1">
                            {selectedMaterials.map(m => (
                                <div key={m.id} className="bg-white p-4 rounded-2xl border border-white shadow-sm space-y-3 animate-in fade-in slide-in-from-right-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#D36A47]" />
                                            <p className="text-[11px] font-black text-slate-900 uppercase">{m.name}</p>
                                        </div>
                                        <button onClick={() => removeMaterial(m.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Tahsis Miktarı</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    className="w-full pl-3 pr-12 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-slate-700 focus:outline-none"
                                                    placeholder="Miktar"
                                                    value={m.assign_qty}
                                                    onChange={(e) => updateQty(m.id, e.target.value)}
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase">{m.unit}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-end pb-1 px-1">
                                            <p className="text-[9px] font-black text-slate-300 uppercase leading-none">Depo Durumu</p>
                                            <p className="text-[11px] font-bold text-slate-500">{m.stock_qty} {m.unit}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {selectedMaterials.length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-30">
                                    <Package size={48} className="mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Tahsis listesi boş</p>
                                </div>
                            )}
                        </div>

                        {selectedMaterials.length > 0 && (
                            <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3 text-orange-700">
                                <AlertTriangle size={20} className="flex-shrink-0" />
                                <p className="text-[10px] font-bold">Bu işlemle seçilen malzemeler ana stoktan düşecek ve taşeronun zimmetine eklenecektir.</p>
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-100 bg-white flex items-center justify-end gap-4 overflow-hidden">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={() => onAssign(selectedMaterials)}
                        disabled={selectedMaterials.length === 0}
                        className={`flex items-center gap-2 px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] shadow-xl transition-all ${selectedMaterials.length > 0 ? 'bg-emerald-600 text-white shadow-emerald-600/20 hover:scale-105 active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                    >
                        <CheckCircle2 size={18} />
                        MALZEMEYİ TAŞERONA ZİMMETLE
                    </button>
                </div>

            </div>
        </div>
    );
};

export default MaterialAssignmentModal;
