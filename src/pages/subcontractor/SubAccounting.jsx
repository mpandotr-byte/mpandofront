import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Receipt,
    Box,
    Users,
    Info,
    Calendar,
    ArrowRight
} from 'lucide-react';

export default function SubAccounting() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const summary = {
        income: 2450000,
        expenses: {
            personnel: 840000,
            material: 320000,
            other: 125000
        }
    };

    const totalExpense = summary.expenses.personnel + summary.expenses.material + summary.expenses.other;
    const netProfit = summary.income - totalExpense;

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Taşeron Finansal Özet (Özel)" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Profit Summary Section */}
                    <div className="bg-[#0A1128] rounded-[48px] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] -mr-64 -mt-64" />
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                            <div className="space-y-4 text-center md:text-left">
                                <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">Net Kârlılık Durumu</span>
                                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">{netProfit.toLocaleString('tr-TR')} ₺</h2>
                                <p className="text-white/40 text-[10px] md:text-xs font-black uppercase tracking-widest italic pt-2">Toplam Gelir - Toplam Gider Baz Alınmıştır.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-md flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2"><ArrowUpRight size={28} /></div>
                                    <span className="text-[10px] font-black text-white/40 uppercase">GELİR</span>
                                    <span className="text-xl font-bold">{summary.income.toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-md flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mb-2"><ArrowDownRight size={28} /></div>
                                    <span className="text-[10px] font-black text-white/40 uppercase">GİDER</span>
                                    <span className="text-xl font-bold">{totalExpense.toLocaleString('tr-TR')} ₺</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Income Details */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Gelir Kalemleri</h2>
                                <button className="text-[10px] font-black text-orange-600 hover:underline uppercase tracking-widest">DETAYLI RAPOR</button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { title: 'Onaylı Hakedişler', amount: 1850000, icon: <Receipt />, color: 'emerald' },
                                    { title: 'Alınan Ödemeler', amount: 600000, icon: <Wallet />, color: 'blue' }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center border border-transparent group-hover:bg-[#0A1128] group-hover:text-white transition-all shadow-sm`}>
                                                {React.cloneElement(item.icon, { size: 28 })}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-1">{item.title}</h4>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Toplam Kayıtlı Veri</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-slate-800">{item.amount.toLocaleString('tr-TR')} ₺</div>
                                            <div className="flex items-center justify-end gap-1 text-[9px] font-black text-emerald-500 uppercase mt-1">
                                                <ArrowUpRight size={10} /> %12 ARTIŞ
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Expense Details */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Gider Kalemleri</h2>
                                <button className="text-[10px] font-black text-orange-600 hover:underline uppercase tracking-widest">GİDER ANALİZİ</button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { title: 'Personel Giderleri', amount: summary.expenses.personnel, icon: <Users />, color: 'amber' },
                                    { title: 'Malzeme Giderleri', amount: summary.expenses.material, icon: <Box />, color: 'rose' },
                                    { title: 'Diğer Genel Giderler', amount: summary.expenses.other, icon: <PieChart />, color: 'slate' }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center border border-transparent group-hover:bg-[#0A1128] group-hover:text-white transition-all shadow-sm`}>
                                                {React.cloneElement(item.icon, { size: 28 })}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-1">{item.title}</h4>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-left">Cari Dönem Harcaması</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-slate-800">{item.amount.toLocaleString('tr-TR')} ₺</div>
                                            <div className="flex items-center justify-end gap-1 text-[9px] font-black text-red-500 uppercase mt-1">
                                                <ArrowDownRight size={10} /> %5 TASARRUF
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
