import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import {
    LayoutDashboard,
    Briefcase,
    Hammer,
    Box,
    Users,
    Receipt,
    Wallet,
    TrendingUp,
    AlertTriangle,
    ArrowUpRight,
    ArrowRight,
    Clock,
    CheckCircle2
} from 'lucide-react';

export default function SubDashboard() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const stats = [
        { label: 'Aktif İş Sayısı', value: '4', icon: <Hammer />, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Toplam Sözleşme', value: '12.5M ₺', icon: <Receipt />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Bu Ay Yapılan İş', value: '1.2M ₺', icon: <TrendingUp />, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Bekleyen Hakediş', value: '450K ₺', icon: <Clock />, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Bekleyen Ödeme', value: '280K ₺', icon: <Wallet />, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Zimmetli Malzeme', value: '12 Kalem', icon: <Box />, color: 'text-slate-600', bg: 'bg-slate-50' }
    ];

    const alerts = [
        { id: 1, title: 'Puantaj Farkı Tespit Edildi', desc: 'Aksu Projesi 05.03.2026 tarihinde şirket verisi ile 2 personel farkı var.', type: 'warning' },
        { id: 2, title: 'Hakediş Revizyonu Gerekli', desc: 'Blok B kaba inşaat hakedişinde metraj farkı nedeniyle inceleme bekliyor.', type: 'error' },
        { id: 3, title: 'Zimmet İadesi Gecikti', desc: 'Hilti Kırıcı ve 2 adet iskele panosu teslim tarihi geçti.', type: 'info' }
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Taşeron Yönetim Paneli" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Welcome Banner */}
                    <div className="bg-[#0A1128] rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px] -mr-32 -mt-32" />
                        <div className="relative z-10">
                            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-2">Hoş Geldiniz, <span className="text-orange-400">Aras İnşaat</span></h1>
                            <p className="text-white/40 text-[10px] md:text-sm font-black uppercase tracking-[0.3em]">Taşeron Operasyonel Özet & Finansal Durum</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-4 group hover:shadow-xl transition-all">
                                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                                    {React.cloneElement(stat.icon, { size: 24 })}
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</div>
                                    <div className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Alerts & Notifications */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Kritik Uyarılar</h2>
                                <button className="text-[10px] font-black text-orange-600 hover:underline uppercase tracking-widest">TÜMÜNÜ GÖR</button>
                            </div>
                            <div className="space-y-4">
                                {alerts.map(alert => (
                                    <div key={alert.id} className={`p-6 rounded-[32px] border flex items-start gap-6 transition-all hover:translate-x-1 ${alert.type === 'warning' ? 'bg-orange-50 border-orange-100' : alert.type === 'error' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${alert.type === 'warning' ? 'bg-orange-200 text-orange-700' : alert.type === 'error' ? 'bg-red-200 text-red-700' : 'bg-blue-200 text-blue-700'}`}>
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`text-sm font-black uppercase tracking-tight mb-1 ${alert.type === 'warning' ? 'text-orange-900' : alert.type === 'error' ? 'text-red-900' : 'text-blue-900'}`}>{alert.title}</h4>
                                            <p className={`text-[11px] font-medium leading-relaxed ${alert.type === 'warning' ? 'text-orange-700/70' : alert.type === 'error' ? 'text-red-700/70' : 'text-blue-700/70'}`}>{alert.desc}</p>
                                        </div>
                                        <button className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
                                            <ArrowRight size={16} className="text-slate-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick View - Hakediş Özeti */}
                        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Hakediş Durumu</h3>
                                </div>
                                <div className="space-y-4 pt-4">
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-slate-400 uppercase text-[10px]">Onaylanan</span>
                                        <span className="text-slate-800">8.450.000 ₺</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }}></div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold pt-4">
                                        <span className="text-slate-400 uppercase text-[10px]">Ödenen</span>
                                        <span className="text-slate-800 text-orange-600 font-black">6.200.000 ₺</span>
                                    </div>
                                    <div className="w-full h-8 bg-orange-50 rounded-xl relative overflow-hidden flex items-center px-4">
                                        <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest">%73 TAMAMLANDI</div>
                                    </div>
                                </div>
                            </div>
                            <button className="mt-10 w-full py-5 bg-[#0A1128] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">TAHSİLAT DETAYLARI</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
