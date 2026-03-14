import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Receipt,
    Clock,
    CheckCircle2,
    FileText,
    TrendingUp,
    ShoppingBag,
    Truck,
    CreditCard,
    ArrowRight,
    Search,
    Filter,
    Calendar,
    AlertCircle
} from 'lucide-react';

export default function SuppAccounting() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const summary = {
        totalIncome: 12450000,
        totalExpense: 8120000,
        pendingReceivables: 1850000,
        cheques: 3200000
    };

    const netProfit = summary.totalIncome - summary.totalExpense;

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Muhasebe / Ödeme & Finansal Rapor" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Financial Dashboard Header */}
                    <div className="bg-[#0A1128] rounded-[48px] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -mr-64 -mt-64" />
                        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12">
                            <div className="space-y-4 text-center xl:text-left">
                                <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">Cari Dönem Net Kar</span>
                                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">{netProfit.toLocaleString('tr-TR')} ₺</h2>
                                <div className="flex items-center justify-center xl:justify-start gap-4 pt-4">
                                    <div className="flex items-center gap-2 text-[11px] font-black text-emerald-400 border border-emerald-400/20 px-4 py-2 rounded-xl uppercase tracking-widest"><ArrowUpRight size={14} /> %18.5 ARTIŞ</div>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-none">Vergiler Öncesi Tahmini Kâr</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full xl:w-auto">
                                {[
                                    { label: 'TOPLAM GELİR', val: summary.totalIncome, icon: <TrendingUp />, color: 'emerald' },
                                    { label: 'TOPLAM GİDER', val: summary.totalExpense, icon: <TrendingDown />, color: 'rose' },
                                    { label: 'BEKLEYEN ALACAK', val: summary.pendingReceivables, icon: <Receipt />, color: 'amber' },
                                    { label: 'TAHSİL EDİLECEK ÇEK', val: summary.cheques, icon: <CreditCard />, color: 'blue' }
                                ].map((item, i) => (
                                    <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-md flex flex-col gap-2 min-w-[200px]">
                                        <div className={`w-10 h-10 rounded-xl bg-${item.color}-500/20 text-${item.color}-400 flex items-center justify-center mb-1`}>{item.icon}</div>
                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">{item.label}</span>
                                        <span className="text-lg font-black">{item.val.toLocaleString('tr-TR')} ₺</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                        {/* Cheque & Payment Alerts */}
                        <div className="lg:col-span-1 space-y-6">
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Finansal Takvim & Uyarılar</h3>
                            <div className="space-y-4">
                                {[
                                    { title: 'Vadesi Gelen Çek', desc: 'Sinpaş GYO - 800.000 ₺ tutarında çek bugün vadededir.', type: 'urgent', date: 'BUGÜN' },
                                    { title: 'Bekleyen Ödeme', desc: 'Ege Yapı’ya kesilen 12 numaralı fatura gecikmede.', type: 'alert', date: '3 GÜN' },
                                    { title: 'Vergi Ödemesi', desc: 'KDV beyannamesi ödeme günü yaklaşıyor.', type: 'info', date: '12 MAR' }
                                ].map((alert, i) => (
                                    <div key={i} className={`p-6 rounded-[32px] border flex items-center gap-6 group cursor-pointer transition-all hover:bg-white overflow-hidden relative ${alert.type === 'urgent' ? 'bg-red-50/50 border-red-100 shadow-red-100 hover:shadow-xl' : alert.type === 'alert' ? 'bg-orange-50/50 border-orange-100 shadow-orange-100 hover:shadow-xl' : 'bg-slate-50 border-slate-100 shadow-slate-100 hover:shadow-xl'}`}>
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${alert.type === 'urgent' ? 'bg-red-200 text-red-700' : alert.type === 'alert' ? 'bg-orange-200 text-orange-700' : 'bg-slate-200 text-slate-700'}`}>
                                            <Calendar size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-[11px] font-black uppercase text-slate-800 tracking-tight">{alert.title}</h4>
                                            <p className="text-[10px] font-medium text-slate-400 mt-0.5 leading-relaxed truncate">{alert.desc}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-[10px] font-black text-slate-800">{alert.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Income List */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Son Tahsilatlar & Faturalar</h3>
                                <div className="flex gap-2">
                                    <button className="px-6 py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-all">EKSTRE İNDİR</button>
                                    <button className="px-6 py-3 bg-[#0A1128] rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:scale-105 transition-all">FATURA EKLE</button>
                                </div>
                            </div>
                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Firma / Evrak</th>
                                            <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tür</th>
                                            <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Vade / Tarih</th>
                                            <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center text-orange-500">Tutar</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {[
                                            { client: 'Aksu İnşaat', type: 'ÇEK', date: '15.06.2026', amount: 850000, status: 'PORTFÖY' },
                                            { client: 'Ege Yapı', type: 'HAVALE', date: '01.03.2026', amount: 320000, status: 'TAHSİL' },
                                            { client: 'Sinpaş GYO', type: 'FATURA', date: '12.03.2026', amount: 1250000, status: 'BEKLEYEN' }
                                        ].map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-7">
                                                    <div>
                                                        <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.client}</div>
                                                        <div className="text-[10px] font-black text-slate-300 uppercase italic">Ref: MPN-2026-{idx + 1}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-7 text-center">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-1.5 px-3 bg-slate-50 rounded-lg">{item.type}</span>
                                                </td>
                                                <td className="px-6 py-7 text-center text-xs font-bold text-slate-400">{item.date}</td>
                                                <td className="px-6 py-7 text-center text-sm font-black text-orange-600">{item.amount.toLocaleString('tr-TR')} ₺</td>
                                                <td className="px-8 py-7 text-center">
                                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${item.status === 'TAHSİL' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
