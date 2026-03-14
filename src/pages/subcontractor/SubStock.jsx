import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import {
    Box,
    ArrowRightLeft,
    Truck,
    Plus,
    Search,
    ArrowRight,
    ShieldCheck,
    History,
    MoreHorizontal,
    FileText,
    TrendingDown,
    LayoutGrid,
    LayoutList
} from 'lucide-react';

export default function SubStock() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('assignment'); // assignment (zimmet), myOwnStock

    const assignedMaterials = [
        { id: 1, name: 'Hilti TE-70 Kırıcı', received: 2, used: 0, balance: 2, date: '12.01.2026', type: 'Ekipman' },
        { id: 2, name: 'İskele Panosu', received: 50, used: 20, balance: 30, date: '05.02.2026', type: 'Sarf' },
        { id: 3, name: 'Lazer Metre', received: 5, used: 1, balance: 4, date: '20.02.2026', type: 'Ekipman' }
    ];

    const myStock = [
        { id: 1, name: 'İnşaat Çivisi (10cm)', qty: 250, unit: 'kg', price: 42.50 },
        { id: 2, name: 'Bağ Teli', qty: 15, unit: 'rulo', price: 185.00 }
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Stok & Zimmet Yönetimi" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Tab Switcher */}
                    <div className="flex flex-col md:flex-row justify-between items-stretch gap-6">
                        <div className="bg-white p-1.5 rounded-[28px] border border-slate-100 shadow-sm flex grow max-w-lg">
                            <button
                                onClick={() => setActiveTab('assignment')}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'assignment' ? 'bg-[#0A1128] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <ShieldCheck size={18} /> ZİMMET (ŞİRKETTEN)
                            </button>
                            <button
                                onClick={() => setActiveTab('myOwnStock')}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'myOwnStock' ? 'bg-[#0A1128] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Box size={18} /> KENDİ STOĞUM
                            </button>
                        </div>
                        <button className="px-10 py-5 bg-[#D36A47] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3">
                            <Plus size={20} /> STOK GİRİŞİ YAP
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className="grid grid-cols-1 gap-8">
                        {activeTab === 'assignment' ? (
                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-10 border-b border-slate-50 flex flex-wrap items-center justify-between gap-6">
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">Şirket Tarafından Verilen Ekipman & Malzeme</h3>
                                    <div className="relative w-full max-w-xs">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input type="text" placeholder="Zimmet ara..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none" />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Malzeme / Ekipman</th>
                                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Veriliş Tarihi</th>
                                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Verilen</th>
                                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Kullanılan</th>
                                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Kalan</th>
                                                <th className="px-10 py-6"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {assignedMaterials.map(mat => (
                                                <tr key={mat.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-all">
                                                                {mat.type === 'Ekipman' ? <ArrowRightLeft size={20} /> : <Box size={20} />}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{mat.name}</div>
                                                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{mat.type}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-8 text-xs font-bold text-slate-500 italic uppercase">{mat.date}</td>
                                                    <td className="px-6 py-8 text-center text-sm font-black text-slate-800">{mat.received}</td>
                                                    <td className="px-6 py-8 text-center text-sm font-black text-slate-800">{mat.used}</td>
                                                    <td className="px-6 py-8 text-center">
                                                        <span className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest ${mat.balance > 0 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-300'}`}>
                                                            {mat.balance}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <button className="p-3 text-slate-300 hover:text-slate-800 transition-colors"><MoreHorizontal size={20} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {myStock.map(mat => (
                                    <div key={mat.id} className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 group-hover:bg-[#0A1128] group-hover:text-white transition-all">
                                                <Box size={28} />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Stok Miktarı</div>
                                                <div className="text-xl font-black text-slate-800">{mat.qty} {mat.unit}</div>
                                            </div>
                                        </div>
                                        <h4 className="text-[15px] font-black text-slate-800 uppercase tracking-tight mb-2 leading-none">{mat.name}</h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic pb-8">Alış: {mat.price.toLocaleString('tr-TR')} ₺ / {mat.unit}</p>

                                        <div className="pt-8 border-t border-slate-50 flex gap-2">
                                            <button className="flex-1 py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">
                                                <ArrowRight size={14} /> İŞE ATA
                                            </button>
                                            <button className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-slate-800 transition-all border border-transparent">
                                                <History size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="border-4 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center p-8 opacity-40 hover:opacity-100 transition-all cursor-pointer group hover:bg-white hover:border-orange-100">
                                    <Plus size={32} className="text-slate-300 group-hover:text-orange-600 mb-4" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">YENİ STOK KALEMİ</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
