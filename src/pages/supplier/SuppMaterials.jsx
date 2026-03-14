import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import {
    Plus,
    Search,
    Filter,
    Package,
    Edit2,
    Trash2,
    ArrowRight,
    Info,
    LayoutGrid,
    LayoutList,
    Boxes
} from 'lucide-react';

export default function SuppMaterials() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [materials, setMaterials] = useState([
        { id: 1, name: 'C30 Beton', code: 'BT-30', stock: 1200, unit: 'm3', price: 1450, leadTime: 1 },
        { id: 2, name: 'Q12 İnşaat Demiri', code: 'DM-12', stock: 450, unit: 'ton', price: 21500, leadTime: 3 },
        { id: 3, name: 'Panel Çit 100x200', code: 'CT-1020', stock: 85, unit: 'adet', price: 420, leadTime: 5 }
    ]);

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Malzeme Kartlarım & Katalog" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="relative w-full max-w-lg">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input
                                type="text"
                                placeholder="Malzeme adı veya kod ile ara..."
                                className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[32px] text-sm font-bold shadow-sm focus:border-orange-400 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="flex p-1 bg-white border border-slate-200 rounded-2xl">
                                <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#0A1128] text-white shadow-lg' : 'text-slate-300'}`}><LayoutGrid size={20} /></button>
                                <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-[#0A1128] text-white shadow-lg' : 'text-slate-300'}`}><LayoutList size={20} /></button>
                            </div>
                            <button className="flex-1 md:flex-none px-10 py-5 bg-[#D36A47] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                                <Plus size={20} /> YENİ MALZEME EKLE
                            </button>
                        </div>
                    </div>

                    {/* Materials Grid/List */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {materials.map(mat => (
                                <div key={mat.id} className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col items-start gap-6 cursor-pointer">
                                    <div className="w-16 h-16 rounded-[28px] bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-[#0A1128] group-hover:text-white transition-all shadow-inner group-hover:rotate-6 group-hover:scale-110">
                                        <Package size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">{mat.code}</div>
                                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none mb-3">{mat.name}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${mat.stock < 100 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                STOK: {mat.stock.toLocaleString('tr-TR')} {mat.unit}
                                            </span>
                                            <span className="text-[9px] font-black text-slate-300 uppercase italic whitespace-nowrap">{mat.leadTime} GÜN TERMİN</span>
                                        </div>
                                    </div>
                                    <div className="w-full pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="text-xl font-black text-slate-800">{mat.price.toLocaleString('tr-TR')} ₺ <span className="text-[10px] text-slate-400 font-bold uppercase">/ {mat.unit}</span></div>
                                        <div className="flex gap-2">
                                            <button className="p-3 bg-slate-50 rounded-xl text-slate-300 hover:text-orange-600 hover:bg-orange-50 transition-all shadow-sm"><Edit2 size={16} /></button>
                                            <button className="p-3 bg-slate-50 rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="border-4 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center p-8 opacity-40 hover:opacity-100 transition-all cursor-pointer group hover:bg-white hover:border-orange-100 min-h-[300px]">
                                <Plus size={40} className="text-slate-300 group-hover:text-orange-600 mb-4" />
                                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center">KATALOĞA YENİ<br />ÜRÜN EKLE</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Malzeme & Kod</th>
                                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stok Durumu</th>
                                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Birim Fiyat</th>
                                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tedarik Süresi</th>
                                        <th className="px-10 py-6"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {materials.map(mat => (
                                        <tr key={mat.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 group-hover:bg-[#0A1128] group-hover:text-white transition-all">
                                                        <Package size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{mat.name}</div>
                                                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{mat.code}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8 text-center">
                                                <span className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border ${mat.stock < 100 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                    {mat.stock.toLocaleString('tr-TR')} {mat.unit}
                                                </span>
                                            </td>
                                            <td className="px-6 py-8 text-center text-sm font-black text-slate-800">{mat.price.toLocaleString('tr-TR')} ₺</td>
                                            <td className="px-6 py-8 text-center text-xs font-bold text-slate-400 uppercase italic">{mat.leadTime} Gün</td>
                                            <td className="px-10 py-8 text-right">
                                                <button className="p-3 text-slate-300 hover:text-orange-600 transition-colors"><ArrowRight size={20} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
