import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import {
    Package,
    ShoppingCart,
    ClipboardCheck,
    FileText,
    Camera,
    Calendar,
    AlertTriangle,
    Plus,
    CheckCircle2,
    Truck,
    ArrowRight,
    Users,
    Clock,
    CloudSun
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EngineerConsole() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [stats, setStats] = useState({
        criticalStock: 0,
        pendingApprovals: 0,
        todaySchedule: 0,
        activeWorkers: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardStats();
        fetchDeliveries();
    }, []);

    const [deliveries, setDeliveries] = useState([]);

    const fetchDashboardStats = async () => {
        try {
            const results = await Promise.allSettled([
                api.get('/inventory/status/summary'),
                api.get('/users/active-count'),
                api.get('/construction/work-schedules/all'),
            ]);

            const stockData = results[0].status === 'fulfilled' ? results[0].value : null;
            const activeData = results[1].status === 'fulfilled' ? results[1].value : null;
            const schedData = results[2].status === 'fulfilled' ? results[2].value : [];

            setStats({
                criticalStock: stockData?.critical_count || 0,
                pendingApprovals: stockData?.pending_count || 0,
                todaySchedule: Array.isArray(schedData) ? schedData.length : 0,
                activeWorkers: activeData?.count || activeData?.active_count || 0
            });
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDeliveries = async () => {
        try {
            const data = await api.get('/construction/delivery-appointments/all');
            setDeliveries(Array.isArray(data) ? data.slice(0, 5) : []);
        } catch (error) {
            console.error(error);
        }
    };

    const actionCards = [
        {
            id: 'material',
            title: 'Malzeme Girişi',
            desc: 'İrsaliye kaydı ve stok girişi yapın',
            icon: <Package size={24} />,
            color: 'bg-blue-500',
            actionText: 'Stok İşle',
            path: '/stock'
        },
        {
            id: 'purchase',
            title: 'Satın Alma Talebi',
            desc: 'Acil malzeme ihtiyacı bildirin',
            icon: <ShoppingCart size={24} />,
            color: 'bg-amber-500',
            actionText: 'Talep Oluştur',
            path: '/purchasing'
        },
        {
            id: 'approval',
            title: 'İmalat Onay & Düşüm',
            desc: 'Biten işleri onaylayın, stoktan düşün',
            icon: <ClipboardCheck size={24} />,
            color: 'bg-emerald-500',
            actionText: 'Onay Ekranı',
            path: '/recipes'
        },
        {
            id: 'daily',
            title: 'Günlük Saha Raporu',
            desc: 'İş özeti ve kadro takibi girin',
            icon: <FileText size={24} />,
            color: 'bg-indigo-500',
            actionText: 'Rapor Yaz',
            path: '/daily-reports'
        },
        {
            id: 'log',
            title: 'Saha Günlüğü',
            desc: 'Hatalı imalat ve notları fotoğraflayın',
            icon: <Camera size={24} />,
            color: 'bg-rose-500',
            actionText: 'Tespit Ekle',
            path: '/site-logs'
        },
        {
            id: 'planning',
            title: 'İş Programı & Takvim',
            desc: 'İmalat ve ekip planlaması yapın',
            icon: <Calendar size={24} />,
            color: 'bg-slate-700',
            actionText: 'Planla',
            path: '/planning'
        }
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Mühendis Kontrol Paneli" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Top Stats Banner */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kritik Stok</p>
                                <h3 className="text-xl font-black text-slate-800">{stats.criticalStock} Malzeme</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Onay Bekleyen</p>
                                <h3 className="text-xl font-black text-slate-800">{stats.pendingApprovals} İmalat</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bugünkü Plan</p>
                                <h3 className="text-xl font-black text-slate-800">{stats.todaySchedule} Görev</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saha Kadrosu</p>
                                <h3 className="text-xl font-black text-slate-800">{stats.activeWorkers} Personel</h3>
                            </div>
                        </div>
                    </div>

                    {/* Main Actions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {actionCards.map((card) => (
                            <div
                                key={card.id}
                                className="group relative bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1 transition-all"
                            >
                                <div className={`w-16 h-16 ${card.color} rounded-[24px] flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                                    {card.icon}
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">{card.title}</h3>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">{card.desc}</p>

                                <button
                                    onClick={() => navigate(card.path)}
                                    className="w-full py-4 bg-slate-50 group-hover:bg-[#0A1128] group-hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                                >
                                    {card.actionText}
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Section: Delivery & Weather */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Delivery Appointments */}
                        <div className="lg:col-span-2 bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#D36A47]/10 text-[#D36A47] flex items-center justify-center">
                                        <Truck size={24} />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Kritik Sevkiyat Randevuları</h3>
                                </div>
                                <button className="text-[10px] font-black text-[#D36A47] uppercase tracking-widest hover:underline">+ RANDEVU EKLE</button>
                            </div>

                            <div className="space-y-4">
                                {(deliveries.length > 0 ? deliveries : [
                                    { id: 1, time: '--:--', material: 'Henuz randevu yok', supplier: '-', status: 'Bekleniyor' }
                                ]).map((del, idx) => (
                                    <div key={del.id || idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="text-lg font-black text-slate-800">{del.expected_at ? new Date(del.expected_at).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'}) : del.time || '--:--'}</div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-slate-700">{del.material_name || del.material || '-'}</span>
                                                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter">{del.supplier_name || del.supplier || '-'}</span>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${(del.status === 'Yolda' || del.status === 'DELIVERED') ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {del.status || 'Bekleniyor'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weather Widget */}
                        <div className="bg-gradient-to-br from-[#0A1128] to-[#1E293B] rounded-[40px] p-8 text-white flex flex-col items-center justify-center text-center shadow-xl">
                            <CloudSun size={64} className="text-amber-400 mb-6 animate-pulse" />
                            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">İstanbul, Pendik</h4>
                            <div className="text-5xl font-black mb-4">12°C</div>
                            <p className="text-sm font-medium text-white/70 mb-8 leading-relaxed">Parçalı bulutlu, öğleden sonra <br />hafif yağış bekleniyor.</p>
                            <div className="w-full p-4 bg-white/10 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest">
                                Beton dökümü için uygun değil
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
