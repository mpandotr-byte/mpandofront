import React, { useState, useEffect } from 'react';
import { X, User, ShieldCheck, Briefcase, Building2, Save, Star } from 'lucide-react';
import { api } from '../../api/client';

const branches = ['Demirci', 'Kalıpçı', 'Alçıcı', 'Elektrikçi', 'Sıvacı', 'Boyacı', 'Mekanikçi', 'Seramikçi'];

export default function EmployeeModal({ isOpen, onClose, onSave, subcontractors }) {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        identity_number: '',
        branch: '',
        company_id: '',
        rating: 3
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await api.post('/hr/employees', {
                ...formData,
                company_id: formData.company_id ? parseInt(formData.company_id) : null,
                rating: parseInt(formData.rating)
            });
            onSave(result);
            onClose();
        } catch (error) {
            console.error("Save employee error:", error);
            alert("Hata: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in border border-white">
                {/* Header */}
                <div className="bg-[#0A1128] p-10 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[24px] bg-[#D36A47] flex items-center justify-center shadow-lg shadow-[#D36A47]/30 border border-white/10">
                            <User size={32} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Yeni İşçi Kaydı</h2>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Dijital kimlik ve personel veri girişi</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">İsim</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Örn: Ahmet"
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold focus:bg-white focus:border-[#D36A47] outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Soyisim</label>
                            <input
                                required
                                type="text"
                                value={formData.surname}
                                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                                placeholder="Örn: Yılmaz"
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold focus:bg-white focus:border-[#D36A47] outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Kimlik No (TC/Pasaport)</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    required
                                    type="text"
                                    value={formData.identity_number}
                                    onChange={(e) => setFormData({ ...formData, identity_number: e.target.value })}
                                    placeholder="00000000000"
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold focus:bg-white outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Branş / Uzmanlık</label>
                            <select
                                required
                                value={formData.branch}
                                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold appearance-none focus:bg-white outline-none"
                            >
                                <option value="">Branş Seçin</option>
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Bağlı Olduğu Taşeron</label>
                        <div className="relative">
                            <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <select
                                value={formData.company_id}
                                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold appearance-none focus:bg-white outline-none"
                            >
                                <option value="">Direkt Personel (Mpando)</option>
                                {subcontractors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Başlangıç Performans Puanı</label>
                        <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                            {[1, 2, 3, 4, 5].map(num => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating: num })}
                                    className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${formData.rating === num ? 'bg-white shadow-xl shadow-slate-200/50 text-[#D36A47]' : 'text-slate-300 hover:text-slate-400'}`}
                                >
                                    <Star size={24} className={formData.rating >= num ? "fill-current" : ""} />
                                    <span className="text-[10px] font-black">{num}.0</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-[#D36A47] text-white rounded-[32px] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#D36A47]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                        PERSONELİ KAYDET
                    </button>
                </form>
            </div>
        </div>
    );
}
