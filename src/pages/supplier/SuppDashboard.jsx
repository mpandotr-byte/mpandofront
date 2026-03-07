import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import {
    Package,
    Truck,
    CheckCircle2,
    Clock,
    Wallet,
    TrendingUp,
    AlertTriangle,
    ArrowUpRight,
    ArrowRight,
    Search,
    Filter,
    Navigation,
    ShoppingBag
} from 'lucide-react';

export default function SuppDashboard() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const stats = [
        { label: 'Aktif Sipariş', value: '12', icon: <ShoppingBag />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Yoldaki Malzeme', value: '8 Sevk', icon: <Truck />, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Teslim Edilen', value: '450 Ton', icon: <CheckCircle2 />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Bekleyen Fatura', value: '125K ₺', icon: <Wallet />, color: 'text-rose-600', bg: 'bg-rose-50' },
        { label: 'Toplam Alacak', value: '1.2M ₺', icon: <TrendingUp />, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Düşük Stok', value: '3 Kalem', icon: <AlertTriangle />, color: 'text-rose-500', bg: 'bg-rose-50' }
    ];

    const alerts = [
        { id: 1, title: 'Gecikmiş Sipariş Tespit Edildi!', desc: 'Ege Yapı - Aksu Projesi C30 Beton sevkiyatı 2 saat gecikti.', type: 'error' },
        { id: 2, title: 'Kritik Stok Uyarısı', desc: 'Panel Çit stoklarınız 50 adetin altına düştü. (Kritik Seviye: 100)', type: 'warning' },
        { id: 3, title: 'Yeni İhale Fırsatı', desc: 'Sinpaş GYO - Batı Vista projesi için 5000 m2 dış cephe boyası ihalesi açıldı.', type: 'info' }
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Tedarikçi & Malzemeci Paneli" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Welcome Banner */}
                    <div className="bg-[#0A1128] rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                            <div>
                                <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-2">Hoş Geldiniz, <span className="text-emerald-400">Üstaş Yapı Market</span></h1>
                                <p className="text-white/40 text-[10px] md:text-sm font-black uppercase tracking-[0.3em]">Malzeme Sevkiyat & Sipariş Finans Özeti</p>
                            </div>
                            <div className="flex gap-4 shrink-0">
                                <div className="p-4 bg-white/10 rounded-2xl text-center border border-white/5 backdrop-blur-md">
                                    <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Müşteri Puanı</div>
                                    <div className="text-xl font-black text-emerald-400">4.9 / 5.0</div>
                                </div>
                            </div>
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
                        {/* Critical Alerts */}
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Kritik Bildirimler</h2>
                            <div className="space-y-4">
                                {alerts.map(alert => (
                                    <div key={alert.id} className={`p-6 rounded-[32px] border flex items-start gap-6 transition-all hover:translate-x-1 ${alert.type === 'error' ? 'bg-rose-50 border-rose-100' : alert.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-indigo-50 border-indigo-100'}`}>
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${alert.type === 'error' ? 'bg-rose-200 text-rose-700' : alert.type === 'warning' ? 'bg-amber-200 text-amber-700' : 'bg-indigo-200 text-indigo-700'}`}>
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`text-sm font-black uppercase tracking-tight mb-1 ${alert.type === 'error' ? 'text-rose-900' : alert.type === 'warning' ? 'text-amber-900' : 'text-indigo-900'}`}>{alert.title}</h4>
                                            <p className={`text-[11px] font-medium leading-relaxed ${alert.type === 'error' ? 'text-rose-700/70' : alert.type === 'warning' ? 'text-amber-700/70' : 'text-indigo-700/70'}`}>{alert.desc}</p>
                                        </div>
                                        <button className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
                                            <ArrowRight size={16} className="text-slate-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Orders Sidepanel */}
                        <div className="bg-white rounded-[40px] p-8 md:p-10 border border-slate-100 shadow-sm space-y-8">
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Bekleyen Sevkler</h3>
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4 items-center group cursor-pointer">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#0A1128] group-hover:text-white transition-all shadow-sm group-hover:scale-105">
                                            <Package size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-black text-slate-800 uppercase truncate">Panel Çit Sevkiyatı</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Batı Vista Rezidans</div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">BEKLİYOR</div>
                                            <div className="text-[9px] font-bold text-slate-300 mt-0.5 italic">14:30 Teslim</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-5 bg-[#0A1128] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">SİPARİŞLERİ YÖNET</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
