import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import {
    Truck,
    FileText,
    CreditCard,
    CheckCircle2,
    Plus,
    Search,
    AlertTriangle,
    ArrowRight,
    Calendar,
    Receipt,
    Home,
    Upload,
    MoreHorizontal
} from 'lucide-react';

export default function ExpenseManagement() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [suppliers, setSuppliers] = useState([
        { id: 1, name: 'Kütahya Seramik A.Ş.', category: 'İnce Yapı', totalDebt: 4500000, overdue: 1250000, activeContracts: 3 },
        { id: 2, name: 'Oyak Beton', category: 'Kaba Yapı', totalDebt: 8200000, overdue: 0, activeContracts: 5 }
    ]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [activeTab, setActiveTab] = useState('agreements'); // agreements, invoices, paymentPlan, barter

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Gider Yönetimi (Tedarikçi Kartları)" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="relative w-full max-w-lg">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input
                                type="text"
                                placeholder="Tedarikçi adı veya kategori ile ara..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[32px] text-sm font-bold shadow-sm focus:border-rose-400 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>
                        <button className="w-full md:w-auto px-10 py-5 bg-rose-600 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                            <Plus size={20} /> YENİ TEDARİKÇİ EKLE
                        </button>
                    </div>

                    {/* Supplier Cards Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {suppliers.map(supplier => (
                            <div
                                key={supplier.id}
                                onClick={() => setSelectedSupplier(supplier)}
                                className={`group relative bg-white rounded-[40px] p-10 border shadow-sm transition-all cursor-pointer hover:shadow-2xl ${selectedSupplier?.id === supplier.id ? 'border-rose-500 ring-4 ring-rose-50' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className="flex justify-between items-start mb-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors border border-slate-100">
                                            <Truck size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{supplier.name}</h3>
                                            <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-slate-50 rounded-lg w-fit border border-slate-100">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{supplier.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Toplam Borç</div>
                                        <div className="text-2xl font-black text-slate-800">{supplier.totalDebt.toLocaleString('tr-TR')} ₺</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-10 border-t border-slate-50">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Vadesi Geçen</span>
                                        <span className={`text-sm font-black ${supplier.overdue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {supplier.overdue > 0 ? `${supplier.overdue.toLocaleString('tr-TR')} ₺` : 'BORÇ YOK'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Aktif Sözleşme</span>
                                        <span className="text-sm font-black text-slate-800">{supplier.activeContracts} ADET</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Supplier Detail Section */}
                    {selectedSupplier && (
                        <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden animate-scale-in">
                            <div className="bg-rose-600 p-10 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl shadow-rose-600/20">
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 rounded-[28px] bg-white/10 flex items-center justify-center backdrop-blur-md">
                                        <Truck size={40} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black uppercase tracking-tight">{selectedSupplier.name}</h2>
                                        <p className="text-white/40 text-[11px] font-black uppercase tracking-widest mt-1">Sektör: {selectedSupplier.category} | Vergi No: 1234567890</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setSelectedSupplier(null)} className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">PANELİ KAPAT</button>
                                    <button className="px-8 py-4 bg-white text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">EKSTRE AL</button>
                                </div>
                            </div>

                            {/* Details Tabs */}
                            <div className="flex bg-slate-50 p-2 border-b border-slate-200">
                                <button onClick={() => setActiveTab('agreements')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'agreements' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <FileText size={18} /> Anlaşmalar
                                </button>
                                <button onClick={() => setActiveTab('invoices')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'invoices' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <Receipt size={18} /> Fatura & İrsaliye
                                </button>
                                <button onClick={() => setActiveTab('paymentPlan')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'paymentPlan' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <Calendar size={18} /> Ödeme Takvimi
                                </button>
                                <button onClick={() => setActiveTab('barter')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'barter' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <Home size={18} /> Barter (Mahsup)
                                </button>
                            </div>

                            <div className="p-10">
                                {activeTab === 'agreements' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-8">
                                            <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Aktif Birim Fiyat Anlaşmaları</h4>
                                            <button className="flex items-center gap-2 text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-xl">+ YENİ PROTOKOL</button>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { material: 'Seramik (60x120)', unit: 'm2', price: 420.0, term: '45 Gün Vade' },
                                                { material: 'Epoksi Yapıştırıcı', unit: 'kg', price: 125.0, term: '60 Gün Vade' }
                                            ].map((agr, i) => (
                                                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                                    <div className="flex items-center gap-10">
                                                        <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{agr.material}</div>
                                                        <div className="text-sm font-black text-slate-800">{agr.price.toLocaleString('tr-TR')} ₺ / {agr.unit}</div>
                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{agr.term}</div>
                                                    </div>
                                                    <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">AKTİF</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'invoices' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Saha Girişi & Fatura Eşleştirme</h4>
                                            <button className="flex items-center gap-2 text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-xl">FATURA YÜKLE</button>
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                { id: 'IRS-9821', date: '01.03.2026', quantity: 450, amount: 189000, mismatch: false },
                                                { id: 'IRS-9822', date: '04.03.2026', quantity: 200, amount: 84000, mismatch: true }
                                            ].map((inv, i) => (
                                                <div key={i} className={`p-8 rounded-[32px] border ${inv.mismatch ? 'bg-rose-50 border-rose-100 shadow-sm' : 'bg-slate-50 border-slate-100'} transition-all`}>
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className="flex items-center gap-6">
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${inv.mismatch ? 'bg-rose-100 text-rose-600' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                                                <Receipt size={24} />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-black text-slate-800 uppercase tracking-tight">İrsaliye: {inv.id}</div>
                                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{inv.date}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm font-black text-slate-800">{inv.amount.toLocaleString('tr-TR')} ₺</div>
                                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{inv.quantity} m2</div>
                                                        </div>
                                                    </div>
                                                    {inv.mismatch && (
                                                        <div className="flex items-center gap-3 p-4 bg-white/60 border border-rose-200 rounded-2xl">
                                                            <AlertTriangle size={18} className="text-rose-500" />
                                                            <div className="text-[11px] font-black text-rose-600 uppercase tracking-tighter">FİYAT UYUMSUZLUĞU: Sözleşme (420 ₺) - Fatura (445 ₺)</div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'paymentPlan' && (
                                    <div className="space-y-6">
                                        <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Tedarikçi Ödeme Planı</h4>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Ocak Ayı Hak. Ödemesi', date: '25.02.2026', amount: 450000, status: 'PAID' },
                                                { label: 'Şubat Ayı Hak. Ödemesi', date: '25.03.2026', amount: 825000, status: 'WAITING' },
                                                { label: 'Geciken Ödeme', date: '15.02.2026', amount: 1250000, status: 'OVERDUE' }
                                            ].map((pay, i) => (
                                                <div key={i} className={`flex items-center justify-between p-6 rounded-3xl border border-slate-100 ${pay.status === 'OVERDUE' ? 'bg-rose-50 border-rose-100 shadow-sm animate-pulse' : 'bg-slate-50'}`}>
                                                    <div className="flex items-center gap-10">
                                                        <div className="text-sm font-black text-slate-800 truncate w-48">{pay.label}</div>
                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{pay.date}</div>
                                                        <div className="text-sm font-black text-slate-800">{pay.amount.toLocaleString('tr-TR')} ₺</div>
                                                    </div>
                                                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${pay.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : pay.status === 'OVERDUE' ? 'bg-rose-100 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        {pay.status === 'PAID' ? 'ÖDENDİ' : pay.status === 'OVERDUE' ? 'GECİKTİ' : 'BEKLİYOR'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'barter' && (
                                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-[40px]">
                                        <div className="w-20 h-20 rounded-[32px] bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                                            <Home size={40} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Barter (Daire ile Ödeme)</h3>
                                        <p className="max-w-md text-slate-400 text-sm font-medium mt-4 leading-relaxed text-center italic">
                                            Tedarikçiye olan borcu nakit çıkışı yapmadan proje içi dairelerle mahsup edebilirsiniz.
                                        </p>
                                        <button className="mt-10 px-10 py-5 bg-rose-600 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">
                                            DAİRE İLE MAHSUP ET
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
