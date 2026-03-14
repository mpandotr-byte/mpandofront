import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import {
    Search,
    Truck,
    CheckCircle2,
    Clock,
    Navigation,
    ShoppingBag,
    Building2,
    Calendar,
    ArrowRight,
    MapPin,
    Package,
    AlertCircle,
    MoreHorizontal
} from 'lucide-react';

export default function SuppOrders() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [orders, setOrders] = useState([
        { id: 1, date: '05.03.2026', client: 'Aksu İnşaat', project: 'Aksu Lüks Konutları', material: 'C30 Beton', qty: 150, unit: 'm3', status: 'ON_THE_WAY', deliveryDate: 'bugün, 14:00' },
        { id: 2, date: '04.03.2026', client: 'Ege Yapı', project: 'Batı Vista', material: 'Q12 Demir', qty: 25, unit: 'ton', status: 'DELIVERED', deliveryDate: 'dün, 16:30' },
        { id: 3, date: '06.03.2026', client: 'Sinpaş GYO', project: 'Sancaktar Villaları', material: 'Panel Çit', qty: 200, unit: 'adet', status: 'WAITING', deliveryDate: 'yarın, 09:00' }
    ]);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'DELIVERED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'ON_THE_WAY': return 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse';
            case 'WAITING': return 'bg-orange-50 text-orange-600 border-orange-100';
            default: return 'bg-slate-50 text-slate-400';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'DELIVERED': return 'TESLİM EDİLDİ';
            case 'ON_THE_WAY': return 'YOLDA / SEVK EDİLDİ';
            case 'WAITING': return 'BEKLİYOR';
            default: return status;
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Gelen Siparişler & Sevkiyat Takibi" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Filter Summary */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="relative w-full max-w-lg">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input
                                type="text"
                                placeholder="Sipariş no, firma veya proje ara..."
                                className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[32px] text-sm font-bold shadow-sm focus:border-orange-400 focus:bg-white outline-none transition-all"
                            />
                        </div>
                        <div className="flex gap-4">
                            {['HEPSİ', 'BEKLİYOR', 'YOLDA', 'TESLİM'].map((t, i) => (
                                <button key={i} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-[#0A1128] text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}>{t}</button>
                            ))}
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-[40px] p-8 md:p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                                <div className="flex flex-col lg:flex-row justify-between items-stretch gap-10">
                                    <div className="flex flex-1 items-center gap-8">
                                        <div className={`w-20 h-20 rounded-[28px] bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 group-hover:bg-[#0A1128] group-hover:text-white transition-all`}>
                                            <ShoppingBag size={36} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">{order.material}</h3>
                                                <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black border uppercase tracking-widest ${getStatusStyles(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                                <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                    <Building2 size={14} className="text-slate-300" /> {order.client}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest text-orange-500">
                                                    <MapPin size={14} className="text-orange-300" /> {order.project}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest italic">
                                                    <Calendar size={14} className="text-slate-300" /> {order.date}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-8 lg:gap-14 bg-slate-50 p-8 rounded-[32px] border border-slate-100 min-w-fit">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Miktar</div>
                                            <div className="text-lg font-black text-slate-800">{order.qty.toLocaleString('tr-TR')} {order.unit}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Teslimat Zamanı</div>
                                            <div className="text-sm font-black text-slate-800 uppercase italic">{order.deliveryDate}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="px-8 py-4 bg-[#0A1128] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                                                {order.status === 'WAITING' ? <Navigation size={14} /> : <CheckCircle2 size={14} />}
                                                {order.status === 'WAITING' ? 'SEVKE BAŞLA' : 'DETAYLARI GÖR'}
                                            </button>
                                            <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-300 hover:text-slate-800 transition-all"><MoreHorizontal size={20} /></button>
                                        </div>
                                    </div>
                                </div>

                                {order.status === 'ON_THE_WAY' && (
                                    <div className="mt-8 p-5 bg-blue-50/50 border border-blue-100 rounded-[32px] flex items-center justify-between animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <Navigation size={20} className="text-blue-500" />
                                            <div className="text-[10px] font-black text-blue-800 uppercase tracking-widest italic">Araç Yolda: Plaka 34 ABC 123 | Şoför: Ahmet Y.</div>
                                        </div>
                                        <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-blue-200 hover:border-blue-600 transition-all">CANLI TAKİP ET</button>
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
