import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import {
    Wallet,
    CreditCard,
    ArrowRightLeft,
    Download,
    Plus,
    Search,
    Calendar,
    CheckCircle2,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Camera,
    Info,
    ChevronRight,
    Filter
} from 'lucide-react';

export default function CashFlowCentre() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('received'); // received, given, projection
    const [cheques, setCheques] = useState([
        { id: 1, customer: 'Ahmet Yılmaz', bank: 'Garanti BBVA', date: '15.04.2026', amount: 1500000, status: 'PORTFOLIO', photo: true },
        { id: 2, customer: 'Selin Arıkan', bank: 'İş Bankası', date: '20.05.2026', amount: 2500000, status: 'COLLECTED', photo: true },
        { id: 3, customer: 'Mert Akın', bank: 'Akbank', date: '10.03.2026', amount: 1250000, status: 'ENDORSED', supplier: 'Kütahya Seramik', photo: false }
    ]);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'PORTFOLIO': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'COLLECTED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'ENDORSED': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'OVERDUE': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-400';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PORTFOLIO': return 'PORTFÖYDE';
            case 'COLLECTED': return 'TAHSİL EDİLDİ';
            case 'ENDORSED': return 'CİRO EDİLDİ';
            case 'OVERDUE': return 'GECİKME';
            default: return status;
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Çek & Nakit Akış Merkezi" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Header Tabs & Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-stretch gap-6">
                        <div className="bg-white p-1.5 rounded-[28px] border border-slate-100 shadow-sm flex grow max-w-lg">
                            <button
                                onClick={() => setActiveTab('received')}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'received' ? 'bg-[#0A1128] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <ArrowDownRight size={18} /> ALINAN ÇEKLER
                            </button>
                            <button
                                onClick={() => setActiveTab('given')}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'given' ? 'bg-[#0A1128] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <ArrowUpRight size={18} /> VERİLEN ÇEKLER
                            </button>
                            <button
                                onClick={() => setActiveTab('projection')}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'projection' ? 'bg-[#0A1128] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Wallet size={18} /> PROJEKSİYON
                            </button>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-10 py-5 bg-[#D36A47] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                                <Plus size={20} /> ÇEK GİRİŞİ YAP
                            </button>
                        </div>
                    </div>

                    {/* Filters Strip */}
                    <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="relative flex-1 min-w-[300px]">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                placeholder="Banka, vade veya müşteri ile ara..."
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
                            />
                        </div>
                        <button className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-400 hover:bg-slate-100 transition-all"><Filter size={14} /> FİLTRELE</button>
                        <button className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-400 hover:bg-slate-100 transition-all"><Download size={14} /> EXCEL</button>
                    </div>

                    {/* Content Area */}
                    {(activeTab === 'received' || activeTab === 'given') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {cheques.map(cheque => (
                                <div key={cheque.id} className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                                    {cheque.status === 'ENDORSED' && <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-12 -mt-12 group-hover:bg-orange-100 transition-colors" />}

                                    <div className="flex items-start justify-between mb-8 relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-[#0A1128] group-hover:text-white transition-all">
                                            <CreditCard size={28} />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-slate-800 leading-none mb-1">{cheque.amount.toLocaleString('tr-TR')} ₺</div>
                                            <div className={`px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-wider ${getStatusStyles(cheque.status)}`}>
                                                {getStatusLabel(cheque.status)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 mb-8">
                                        <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{activeTab === 'received' ? 'Keşideci / Müşteri' : 'Verilen Taraf'}</div>
                                            <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{cheque.customer}</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Banka / Şube</div>
                                                <div className="text-[12px] font-bold text-slate-600 truncate">{cheque.bank}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vade Tarihi</div>
                                                <div className="text-[12px] font-black text-orange-600 uppercase italic tracking-tighter">{cheque.date}</div>
                                            </div>
                                        </div>
                                        {cheque.status === 'ENDORSED' && (
                                            <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100 flex items-center gap-3">
                                                <ArrowRightLeft size={14} className="text-orange-500" />
                                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-tighter italic">Ciro Edildi: {cheque.supplier}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 pt-6 border-t border-slate-50">
                                        {cheque.status === 'PORTFOLIO' && (
                                            <button className="flex-1 py-4 bg-[#0A1128] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                                                CİRO ET (ÖDE)
                                            </button>
                                        )}
                                        {cheque.status === 'PORTFOLIO' && (
                                            <button className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                                                TAHSİLE VER
                                            </button>
                                        )}
                                        {cheque.status !== 'PORTFOLIO' && (
                                            <button className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:border-slate-100 transition-all flex items-center justify-center gap-2">
                                                DETAYLARI GÖR <ChevronRight size={14} />
                                            </button>
                                        )}
                                        <button className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-white hover:text-orange-500 hover:border-orange-100 border border-transparent transition-all">
                                            <Camera size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'projection' && (
                        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center py-32 space-y-8">
                            <div className="w-24 h-24 rounded-[36px] bg-orange-50 text-orange-500 flex items-center justify-center animate-bounce shadow-xl border-4 border-white">
                                <Activity size={48} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-[#0A1128] uppercase tracking-tight">Finansal Projeksiyon</h3>
                                <p className="max-w-xl text-slate-400 text-sm font-medium mt-4 leading-relaxed italic">
                                    Vadesi yaklaşan çekler, bekleyen taksitler ve planlanan ödemelerden oluşan <br />30-60-90 günlük nakit akış diyagramı hazırlanıyor.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl pt-10">
                                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">30 GÜNLÜK GİRİŞ</span>
                                    <span className="text-2xl font-black text-emerald-600">4.200.000 ₺</span>
                                </div>
                                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">30 GÜNLÜK ÇIKIŞ</span>
                                    <span className="text-2xl font-black text-red-600">2.850.000 ₺</span>
                                </div>
                                <div className="p-8 bg-[#0A1128] rounded-[32px] flex flex-col items-center shadow-xl">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">TAHMİNİ KASA (NET)</span>
                                    <span className="text-2xl font-black text-white">+1.350.000 ₺</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
