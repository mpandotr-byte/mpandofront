import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import {
    Plus,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowRight,
    FileText,
    TrendingUp,
    Building2,
    ShoppingBag,
    Users,
    ChevronRight,
    MessageCircle,
    Calendar
} from 'lucide-react';

export default function SuppOffers() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [offers, setOffers] = useState([
        { id: 1, company: 'Ege Yapı', project: 'Aksu Lüks Konutları', material: 'C30 Beton', qty: 5000, unit: 'm3', amount: 7250000, status: 'WAITING', date: '01.03.2026' },
        { id: 2, company: 'Sinpaş GYO', project: 'Batı Vista', material: 'Dış Cephe Boyası', qty: 1200, unit: 'kova', amount: 840000, status: 'APPROVED', date: '15.02.2026' },
        { id: 3, company: 'Aksu Grup', project: 'Sancaktar Villaları', material: 'Panel Çit', qty: 850, unit: 'adet', amount: 357000, status: 'REJECTED', date: '21.02.2026' }
    ]);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
            case 'WAITING': return 'bg-orange-50 text-orange-600 border-orange-100';
            default: return 'bg-slate-50 text-slate-400';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'APPROVED': return 'ONAYLANDI';
            case 'REJECTED': return 'REDDEDİLDİ';
            case 'WAITING': return 'BEKLİYOR';
            default: return status;
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Tekliflerim & Yeni İhaleler" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="relative w-full max-w-lg">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input
                                type="text"
                                placeholder="Proje, firma veya malzeme ile ara..."
                                className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[32px] text-sm font-bold shadow-sm focus:border-orange-400 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>
                        <button className="w-full md:w-auto px-10 py-5 bg-[#0A1128] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                            <Plus size={20} /> YENİ TEKLİF OLUŞTUR
                        </button>
                    </div>

                    {/* Offers Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {offers.map(offer => (
                            <div key={offer.id} className="bg-white rounded-[40px] p-8 md:p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#0A1128] group-hover:text-white transition-all border border-slate-100 shadow-inner">
                                            <ShoppingBag size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-tight mb-2">{offer.material}</h3>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <Building2 size={12} className="text-slate-300" /> {offer.company}
                                                </div>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-orange-500 uppercase tracking-widest italic">
                                                    {offer.project}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black border uppercase tracking-widest ${getStatusStyles(offer.status)}`}>
                                            {getStatusLabel(offer.status)}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                            <Calendar size={12} /> {offer.date}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-8 bg-slate-50 rounded-[32px] border border-slate-100 mb-10">
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Miktar</div>
                                        <div className="text-sm font-black text-slate-800">{offer.qty.toLocaleString('tr-TR')} {offer.unit}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-orange-500">Teklif Tutarı</div>
                                        <div className="text-lg font-black text-orange-600">{offer.amount.toLocaleString('tr-TR')} ₺</div>
                                    </div>
                                    <div className="col-span-2 md:col-span-1 flex items-center justify-end">
                                        <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-orange-600 uppercase tracking-[0.2em] transition-all">DETAYLI ANALİZ <ArrowRight size={14} /></button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <button className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-[#0A1128] hover:border-[#0A1128] transition-all shadow-sm"><FileText size={20} /></button>
                                        <button className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-orange-600 hover:border-orange-600 transition-all shadow-sm"><MessageCircle size={20} /></button>
                                        <span className="text-[10px] font-black text-slate-400 uppercase ml-2">Teknik Evrak & Mesajlar</span>
                                    </div>
                                    <button className={`px-10 py-5 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all ${offer.status === 'APPROVED' ? 'bg-[#00875A] text-white shadow-xl shadow-emerald-100' : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'}`}>
                                        SİPARİŞE DÖNÜŞTÜR
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
