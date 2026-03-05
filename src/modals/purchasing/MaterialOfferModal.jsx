import React, { useState } from 'react';
import { X, Save, Building2, CreditCard, FileUp, Hash } from 'lucide-react';

export default function MaterialOfferModal({ isOpen, onClose, onSave, requestId, itemName }) {
    const [formData, setFormData] = useState({
        supplier_id: '',
        price: '',
        currency: 'TL',
        payment_terms: '',
        file_url: '',
        notes: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            purchase_request_id: requestId,
            price: parseFloat(formData.price)
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-xl bg-white rounded-[32px] overflow-hidden shadow-2xl animate-scale-in">
                {/* Header */}
                <div className="bg-[#0A1128] p-8 text-white relative">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#D36A47] flex items-center justify-center shadow-lg">
                            <Save size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Yeni Teklif Ekle</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">{itemName}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Supplier */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tedarikçi Firma</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    required
                                    type="text"
                                    placeholder="Firma Adı"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white outline-none transition-all"
                                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Birim Fiyat (TL)</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white outline-none transition-all"
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Terms */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ödeme Koşulları (Vade)</label>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                required
                                type="text"
                                placeholder="Örn: 30 Gün Vade, Peşin"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white outline-none transition-all"
                                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* File / Link */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teklif Dosyası / Link</label>
                        <div className="relative">
                            <FileUp className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                placeholder="Dosya URL veya PDF yolu"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white outline-none transition-all"
                                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full py-5 bg-[#D36A47] text-white rounded-2xl text-sm font-black uppercase tracking-wider shadow-xl shadow-[#D36A47]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <Save size={20} />
                            TEKLİFİ KAYDET
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
