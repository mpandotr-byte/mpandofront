import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import {
    Box,
    Plus,
    Search,
    ArrowRight,
    ShieldCheck,
    History,
    MoreHorizontal,
    FileText,
    TrendingDown,
    LayoutGrid,
    LayoutList,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Package
} from 'lucide-react';

export default function SuppStock() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('general'); // general, entryHistory

    const stocks = [
        { id: 1, name: 'C30 Beton', current: 12500, reservoir: 1200, available: 11300, unit: 'm3', status: 'SAFE' },
        { id: 2, name: 'Q12 İnşaat Demiri', current: 150, reservoir: 85, available: 65, unit: 'ton', status: 'CRITICAL' },
        { id: 3, name: 'Panel Çit', current: 42, reservoir: 10, available: 32, unit: 'adet', status: 'WARNING' },
        { id: 4, name: 'Bağ Teli', current: 500, reservoir: 150, available: 350, unit: 'rulo', status: 'SAFE' }
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Stok Takibi & Depo Yönetimi" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-stretch gap-6">
                        <div className="bg-white p-1.5 rounded-[28px] border border-slate-100 shadow-sm flex grow max-w-lg text-left">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'general' ? 'bg-[#0A1128] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Package size={18} /> GENEL STOK DURUMU
                            </button>
                            <button
                                onClick={() => setActiveTab('entryHistory')}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'entryHistory' ? 'bg-[#0A1128] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <History size={18} /> STOK GİRİŞİ / ARŞİV
                            </button>
                        </div>
                        <button className="px-10 py-5 bg-[#00875A] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3">
                            <Plus size={20} /> YENİ STOK GİRİŞİ
                        </button>
                    </div>

                    {/* Content Section */}
                    {activeTab === 'general' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                            {stocks.map(mat => (
                                <div key={mat.id} className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col justify-between h-[420px]">
                                    {mat.status === 'CRITICAL' && (
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-16 -mt-16 flex items-center justify-center pt-8 pl-8">
                                            <AlertTriangle size={24} className="text-red-500 animate-bounce" />
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <div className="w-16 h-16 rounded-[24px] bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 group-hover:bg-[#0A1128] group-hover:text-white transition-all shadow-inner">
                                            <Box size={32} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2 leading-none">{mat.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${mat.status === 'SAFE' ? 'bg-emerald-50 text-emerald-600' : mat.status === 'WARNING' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                                                    {mat.status === 'SAFE' ? 'GÜVENLİ' : mat.status === 'WARNING' ? 'YAKIN TAKİP' : 'KRİTİK SEVİYE'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Toplam</div>
                                                <div className="text-lg font-black text-slate-800">{mat.current.toLocaleString('tr-TR')}</div>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rezerv</div>
                                                <div className="text-lg font-black text-red-500">{mat.reservoir.toLocaleString('tr-TR')}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-slate-50">
                                        <div className="flex justify-between items-end mb-4">
                                            <div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kullanılabilir</div>
                                                <div className="text-3xl font-black text-[#0A1128]">{mat.available.toLocaleString('tr-TR')} <span className="text-sm text-slate-400">{mat.unit}</span></div>
                                            </div>
                                            <button className="p-4 bg-slate-50 rounded-2xl text-slate-300 hover:text-slate-800 hover:bg-white hover:shadow-xl transition-all border border-transparent"><ArrowRight size={20} /></button>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${mat.status === 'SAFE' ? 'bg-emerald-500' : mat.status === 'WARNING' ? 'bg-orange-500' : 'bg-red-500'}`}
                                                style={{ width: `${(mat.available / mat.current) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-40 flex flex-col items-center justify-center opacity-30 text-center grayscale">
                            <History size={64} className="mb-6" />
                            <h3 className="text-xl font-black uppercase tracking-widest text-[#0A1128]">Stok Hareketleri Hazırlanıyor</h3>
                            <p className="text-xs uppercase tracking-widest mt-2 font-bold italic text-slate-500">Geçmişe dönük giriş/çıkış verileri yakında burada olacak</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
