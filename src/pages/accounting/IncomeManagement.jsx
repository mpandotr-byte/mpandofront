import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import {
    User,
    Building2,
    CreditCard,
    Receipt,
    Plus,
    Search,
    FileText,
    CheckCircle2,
    ArrowRight,
    MapPin,
    AlertCircle,
    Calendar,
    ChevronRight,
    Car,
    Home,
    Upload
} from 'lucide-react';

export default function IncomeManagement() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState([
        { id: 1, name: 'Ahmet Yılmaz', project: 'Aksu Lüks Konutları', block: 'A', unit: '12', totalPrice: 4500000, balance: 1250000, phone: '0532 123 45 67' },
        { id: 2, name: 'Selin Arıkan', project: 'Batı Vista Rezidans', block: 'B', unit: '45', totalPrice: 8200000, balance: 3400000, phone: '0544 987 65 43' }
    ]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [activeTab, setActiveTab] = useState('paymentPlan'); // paymentPlan, collection, documents

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Gelir Yönetimi (Müşteri Kartları)" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="relative w-full max-w-lg">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input
                                type="text"
                                placeholder="Müşteri adı, proje veya daire numarası ile ara..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[32px] text-sm font-bold shadow-sm focus:border-orange-400 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>
                        <button className="w-full md:w-auto px-10 py-5 bg-[#0A1128] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                            <Plus size={20} /> YENİ SATIŞ KAYDI
                        </button>
                    </div>

                    {/* Customer Cards Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {customers.map(customer => (
                            <div
                                key={customer.id}
                                onClick={() => setSelectedCustomer(customer)}
                                className={`group relative bg-white rounded-[40px] p-10 border shadow-sm transition-all cursor-pointer hover:shadow-2xl ${selectedCustomer?.id === customer.id ? 'border-orange-500 ring-4 ring-orange-50' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className="flex justify-between items-start mb-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors border border-slate-100">
                                            <User size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{customer.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Building2 size={12} className="text-slate-300" />
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{customer.project} - {customer.block} Blok / No: {customer.unit}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kalan Borç</div>
                                        <div className="text-2xl font-black text-red-500">{customer.balance.toLocaleString('tr-TR')} ₺</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-10 border-t border-slate-50">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Satış Bedeli</span>
                                        <span className="text-sm font-black text-slate-800">{customer.totalPrice.toLocaleString('tr-TR')} ₺</span>
                                    </div>
                                    <div className="flex -space-x-2">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 border-4 border-white flex items-center justify-center text-emerald-600 shadow-sm"><CheckCircle2 size={16} /></div>
                                        <div className="w-10 h-10 rounded-full bg-blue-50 border-4 border-white flex items-center justify-center text-blue-600 shadow-sm"><FileText size={16} /></div>
                                        <div className="w-10 h-10 rounded-full bg-slate-50 border-4 border-white flex items-center justify-center text-slate-300 shadow-sm font-black text-[10px] uppercase">+4</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Customer Detail Drawer / Section */}
                    {selectedCustomer && (
                        <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden animate-scale-in">
                            <div className="bg-[#0A1128] p-10 text-white flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 rounded-[28px] bg-white/10 flex items-center justify-center backdrop-blur-md">
                                        <User size={40} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black uppercase tracking-tight">{selectedCustomer.name}</h2>
                                        <p className="text-white/40 text-[11px] font-black uppercase tracking-widest mt-1">Kart No: CST-2026-00{selectedCustomer.id}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setSelectedCustomer(null)} className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">PANELİ KAPAT</button>
                                    <button className="px-8 py-4 bg-[#D36A47] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">MÜŞTERİYİ DÜZENLE</button>
                                </div>
                            </div>

                            {/* Details Tabs */}
                            <div className="flex bg-slate-50 p-2 border-b border-slate-200">
                                <button onClick={() => setActiveTab('paymentPlan')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'paymentPlan' ? 'bg-white text-[#0A1128] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <Calendar size={18} /> Ödeme Planı
                                </button>
                                <button onClick={() => setActiveTab('collection')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'collection' ? 'bg-white text-[#0A1128] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <CreditCard size={18} /> Tahsilat Girişi
                                </button>
                                <button onClick={() => setActiveTab('documents')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'documents' ? 'bg-white text-[#0A1128] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <FileText size={18} /> Evraklar (Arşiv)
                                </button>
                            </div>

                            <div className="p-10">
                                {activeTab === 'paymentPlan' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-8">
                                            <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Sözleşme Ödeme Takvimi</h4>
                                            <button className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-4 py-2 rounded-xl">+ TAKSİT EKLE</button>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Peşinat', date: '15.01.2026', amount: 1500000, status: 'PAID' },
                                                { label: 'Taksit 1/12', date: '15.02.2026', amount: 250000, status: 'PAID' },
                                                { label: 'Taksit 2/12', date: '15.03.2026', amount: 250000, status: 'WAITING' },
                                                { label: 'Ara Ödeme', date: '15.06.2026', amount: 1000000, status: 'WAITING' }
                                            ].map((inst, i) => (
                                                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                                    <div className="flex items-center gap-10">
                                                        <div className="text-sm font-black text-slate-800">{inst.label}</div>
                                                        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{inst.date}</div>
                                                        <div className="text-sm font-black text-slate-800">{inst.amount.toLocaleString('tr-TR')} ₺</div>
                                                    </div>
                                                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${inst.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                                        {inst.status === 'PAID' ? 'ÖDENDİ' : 'BEKLİYOR'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'collection' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-8">
                                            <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Tahsilat Metodu</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {['Nakit / Havale', 'Çek', 'Senet', 'Takas (Barter)'].map(m => (
                                                    <button key={m} className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] text-center hover:bg-white hover:shadow-xl hover:border-orange-400 transition-all">
                                                        {m === 'Nakit / Havale' && <Receipt size={24} className="mx-auto mb-3 text-emerald-500" />}
                                                        {m === 'Çek' && <CreditCard size={24} className="mx-auto mb-3 text-blue-500" />}
                                                        {m === 'Senet' && <FileText size={24} className="mx-auto mb-3 text-orange-500" />}
                                                        {m === 'Takas (Barter)' && <Car size={24} className="mx-auto mb-3 text-red-500" />}
                                                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{m}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Barter (Takas) Bilgileri</h4>
                                            <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-6">
                                                <div className="flex gap-4">
                                                    <button className="flex-1 py-4 bg-white border-2 border-orange-400 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-orange-600 shadow-sm"><Car size={16} /> Araç Takası</button>
                                                    <button className="flex-1 py-4 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-400"><Home size={16} /> Gayrimenkul</button>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plaka / Motor No</label>
                                                        <input type="text" placeholder="34 MP 2026" className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold outline-none" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rayiç Değer</label>
                                                            <input type="number" placeholder="1.250.000" className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold outline-none" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mahsup Edilecek</label>
                                                            <input type="number" placeholder="1.000.000" className="w-full px-6 py-4 bg-white border-2 border-emerald-100 rounded-2xl text-sm font-black text-emerald-600 outline-none" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="w-full py-5 bg-[#0A1128] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">TAKAS GİRİŞİNİ ONAYLA</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'documents' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {[
                                                { name: 'Satış Sözleşmesi.pdf', size: '1.2 MB', date: '12.01.2026' },
                                                { name: 'Noter Muvafakat.pdf', size: '0.8 MB', date: '14.01.2026' },
                                                { name: 'Kimlik Fotokobisi.jpg', size: '2.1 MB', date: '11.01.2026' }
                                            ].map((doc, i) => (
                                                <div key={i} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col gap-4 group hover:bg-white hover:shadow-xl transition-all cursor-pointer">
                                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all"><FileText size={24} /></div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{doc.name}</div>
                                                        <div className="flex justify-between items-center mt-1">
                                                            <span className="text-[10px] font-bold text-slate-400">{doc.size}</span>
                                                            <span className="text-[10px] font-bold text-slate-400">{doc.date}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="p-6 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-slate-100 transition-all">
                                                <Upload size={24} className="text-slate-300 group-hover:text-orange-500" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-orange-600">BELGE YÜKLE</span>
                                            </div>
                                        </div>
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
