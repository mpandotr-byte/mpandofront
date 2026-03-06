import React, { useState } from 'react';
import { X, Save, Building2, Hammer, Phone, Mail, MapPin, Hash, Star } from 'lucide-react';
import { api } from '../../api/client';

const NewSubcontractorModal = ({ isOpen, onClose, onAdd }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        expertise: '',
        tax_office: '',
        tax_id: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // In MPANDO, subcontractors are stored in companies table
            // We set the type as 'SUBCONTRACTOR' if the backend supports it, 
            // or just save it as a company.
            const response = await api.post('/companies', {
                ...formData,
                type: 'SUBCONTRACTOR' // assuming this type exists or is handled
            });
            onAdd(response);
            onClose();
        } catch (err) {
            console.error("New subcontractor error:", err);
            alert("Taşeron eklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-[#0A1128] text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#D36A47] flex items-center justify-center shadow-lg">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Yeni Taşeron Kaydı</h2>
                            <p className="text-xs font-bold text-white/50 mt-0.5 uppercase tracking-widest leading-none">Çözüm Ortağı Tanımlama</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-8">

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Firma Adı / Ticari Ünvan</label>
                            <input
                                type="text" name="name" required value={formData.name} onChange={handleChange}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#D36A47]/20 focus:border-[#D36A47] transition-all"
                                placeholder="Örn: Özyılmaz Dekorasyon Ltd. Şti."
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Uzmanlık Alanı</label>
                            <div className="relative">
                                <Hammer className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    type="text" name="expertise" required value={formData.expertise} onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#D36A47]/20 transition-all font-sans"
                                    placeholder="Örn: İnce Yapı / Seramik"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vergi Dairesi / No</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    type="text" name="tax_id" value={formData.tax_id} onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#D36A47]/20 transition-all"
                                    placeholder="1234567890"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xs font-black text-[#D36A47] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            İletişim Bilgileri
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Yetkili Kişi</label>
                                <input
                                    type="text" name="contact_person" value={formData.contact_person} onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#D36A47]/20 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefon</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#D36A47]/20 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-Posta</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        type="email" name="email" value={formData.email} onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#D36A47]/20 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adres</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        type="text" name="address" value={formData.address} onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#D36A47]/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </form>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-4 overflow-hidden">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                        Vazgeç
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-3 px-10 py-4 bg-[#D36A47] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] shadow-xl shadow-[#D36A47]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? 'KAYDEDİLİYOR...' : (
                            <>
                                <Save size={18} />
                                TAŞERONU KAYDET
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewSubcontractorModal;
