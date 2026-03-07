import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import {
    Plus,
    Search,
    Building2,
    Briefcase,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowRight,
    FileText,
    TrendingUp,
    Filter
} from 'lucide-react';

export default function SubBids() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [bids, setBids] = useState([
        { id: 1, company: 'Ege Yapı', project: 'Aksu Lüks Konutları', task: 'Kalıp & Beton', amount: 5000, unit: 'm2', price: 850, status: 'WAITING', date: '01.03.2026' },
        { id: 2, company: 'Sinpaş GYO', project: 'Batı Vista', task: 'İnce Sıva', amount: 12000, unit: 'm2', price: 120, status: 'APPROVED', date: '15.02.2026' },
        { id: 3, company: 'Aksu Grup', project: 'Sancaktar Villaları', task: 'Demir İşçiliği', amount: 850, unit: 'ton', price: 4200, status: 'REJECTED', date: '21.02.2026' }
    ]);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'WAITING': return 'bg-amber-50 text-amber-600 border-amber-100';
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
                <Navbar title="Tekliflerim & İhaleler" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="relative w-full max-w-lg">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input
                                type="text"
                                placeholder="Proje, iş ismi veya firma ile ara..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[32px] text-sm font-bold shadow-sm focus:border-indigo-400 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <button className="flex-1 md:flex-none px-8 py-5 bg-white text-slate-400 border border-slate-100 rounded-[24px] text-xs font-black uppercase tracking-widest hover:border-indigo-200 transition-all flex items-center justify-center gap-2">
                                <Filter size={18} /> FİLTRELE
                            </button>
                            <button className="flex-1 md:flex-none px-10 py-5 bg-[#D36A47] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                                <Plus size={20} /> YENİ TEKLİF VER
                            </button>
                        </div>
                    </div>

                    {/* Bids Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {bids.map(bid => (
                            <div key={bid.id} className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                                {bid.status === 'APPROVED' && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 group-hover:bg-emerald-100 transition-colors" />}

                                <div className="flex justify-between items-start mb-10 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#0A1128] group-hover:text-white transition-all border border-slate-100">
                                            <Briefcase size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none mb-2">{bid.task}</h3>
                                            <div className="flex items-center gap-2">
                                                <Building2 size={12} className="text-slate-300" />
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{bid.company} | {bid.project}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black border uppercase tracking-widest ${getStatusStyles(bid.status)}`}>
                                            {getStatusLabel(bid.status)}
                                        </div>
                                        <div className="mt-2 text-[10px] font-black text-slate-300 uppercase italic">{bid.date}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-8 p-8 bg-slate-50 rounded-[32px] border border-slate-100 mb-8">
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Miktar</div>
                                        <div className="text-sm font-black text-slate-800">{bid.amount.toLocaleString('tr-TR')} {bid.unit}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Birim Fiyat</div>
                                        <div className="text-sm font-black text-slate-800">{bid.price.toLocaleString('tr-TR')} ₺</div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-indigo-500">Toplam Tutarı</div>
                                        <div className="text-base font-black text-indigo-600">{(bid.amount * bid.price).toLocaleString('tr-TR')} ₺</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2">
                                        <button className="p-3 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-indigo-600 transition-all"><FileText size={18} /></button>
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Sözleşme & Teknik Şartname</span>
                                    </div>
                                    <button className="flex items-center gap-2 text-[10px] font-black text-slate-800 hover:text-indigo-600 uppercase tracking-widest transition-all">DETAYLI İNCELE <ArrowRight size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
