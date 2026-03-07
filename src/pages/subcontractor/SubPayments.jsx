import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import {
    Receipt,
    Plus,
    Search,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileText,
    ArrowRight,
    TrendingUp,
    BarChart3,
    ArrowDownRight,
    Info,
    Calendar,
    ChevronRight
} from 'lucide-react';

export default function SubPayments() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [payments, setPayments] = useState([
        { id: 1, job: 'Kalıp & Betonarmé', project: 'Aksu Lüks Konutları', amount: 12500, doneValue: 1450000, status: 'APPROVED', date: '01.03.2026', comparison: 'MATCHED' },
        { id: 2, job: 'İnce Sıva İşleri', project: 'Batı Vista', amount: 8000, doneValue: 960000, status: 'UNDER_REVIEW', date: '05.03.2026', comparison: 'DISCREPANCY' },
        { id: 3, job: 'Elektrik Tesisat', project: 'Aksu Lüks Konutları', amount: 4500, doneValue: 325000, status: 'PAID', date: '15.02.2026', comparison: 'MATCHED' }
    ]);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'PAID': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'UNDER_REVIEW': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-slate-50 text-slate-400';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'APPROVED': return 'ONAYLANDI';
            case 'PAID': return 'ÖDENDİ';
            case 'UNDER_REVIEW': return 'İNCELEMEDE';
            default: return status;
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Hakediş Talepleri & Ödeme Takibi" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="relative w-full max-w-lg">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input
                                type="text"
                                placeholder="Hakediş no, iş ismi veya proje ile ara..."
                                className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[32px] text-sm font-bold shadow-sm focus:border-indigo-400 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>
                        <button className="w-full md:w-auto px-10 py-5 bg-[#0A1128] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                            <Plus size={20} /> YENİ HAKEDİŞ TALEBİ
                        </button>
                    </div>

                    {/* Progress Reports List */}
                    <div className="space-y-6">
                        {payments.map(payment => (
                            <div key={payment.id} className="bg-white rounded-[40px] p-8 md:p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                                {payment.comparison === 'DISCREPANCY' && (
                                    <div className="absolute top-0 right-0 p-6">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl text-[10px] font-black text-rose-600 uppercase tracking-widest animate-pulse">
                                            <AlertCircle size={14} /> ÖLÇÜM FARKI VAR
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col lg:flex-row justify-between items-stretch gap-10">
                                    <div className="flex items-center gap-8">
                                        <div className="w-20 h-20 rounded-[28px] bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 group-hover:bg-[#0A1128] group-hover:text-white transition-all shadow-inner">
                                            <Receipt size={36} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none mb-2">{payment.job}</h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                    <Calendar size={14} className="text-slate-300" /> {payment.date}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                    <Info size={14} className="text-slate-300" /> {payment.project}
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black border uppercase tracking-widest ${getStatusStyles(payment.status)}`}>
                                                    {getStatusLabel(payment.status)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-8 lg:gap-14 bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beyan Edilen</div>
                                            <div className="text-lg font-black text-slate-800">{payment.amount.toLocaleString('tr-TR')} m2</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-indigo-500">Tutar</div>
                                            <div className="text-xl font-black text-indigo-600">{payment.doneValue.toLocaleString('tr-TR')} ₺</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-slate-800 transition-all shadow-sm"><FileText size={20} /></button>
                                            <button className="px-8 py-4 bg-[#0A1128] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2">DETAYLAR <ChevronRight size={14} /></button>
                                        </div>
                                    </div>
                                </div>

                                {payment.comparison === 'DISCREPANCY' && (
                                    <div className="mt-8 p-6 bg-rose-50 border border-rose-100 rounded-[32px] flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest italic">Şirket Ölçümü: 7.250 m2</div>
                                            <div className="w-px h-4 bg-rose-200"></div>
                                            <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest italic">Fark: -750 m2</div>
                                        </div>
                                        <button className="text-[10px] font-black text-rose-600 uppercase tracking-widest border-b border-rose-200 hover:border-rose-600 transition-all">İtiraz Et / Revize Gönder</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
