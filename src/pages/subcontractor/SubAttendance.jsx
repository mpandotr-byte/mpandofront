import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import {
    Users,
    Plus,
    Calendar,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    Clock,
    UserCircle
} from 'lucide-react';

export default function SubAttendance() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState('Aksu Projesi - Kalıp İşleri');
    const [personnel, setPersonnel] = useState([
        { id: 1, name: 'Ali Kahraman', role: 'Ekipbaşı', status: 'PRESENT' },
        { id: 2, name: 'Murat Can', role: 'Kalıp Ustası', status: 'PRESENT' },
        { id: 3, name: 'Sinan Ak', role: 'Kalıp Ustası', status: 'ABSENT' },
        { id: 4, name: 'Veli Gök', role: 'Yardımcı', status: 'PRESENT' }
    ]);

    const toggleStatus = (id, status) => {
        setPersonnel(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Günlük Puantaj & Personel Takibi" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Attendance Header */}
                    <div className="bg-[#0A1128] rounded-[40px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px]" />
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="w-20 h-20 rounded-[28px] bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-xl">
                                    <Calendar size={40} className="text-white" />
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Seçili Şantiye & İş</div>
                                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{selectedJob}</h2>
                                    <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 border border-emerald-400/20 px-3 py-1 rounded-lg uppercase tracking-widest"><CheckCircle2 size={12} /> 3 VAR</div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-red-400 border border-red-400/20 px-3 py-1 rounded-lg uppercase tracking-widest"><XCircle size={12} /> 1 YOK</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">TARİH DEĞİŞTİR</button>
                                <button className="px-10 py-5 bg-orange-500 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                                    <UserPlus size={20} /> PERSONEL EKLE
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Alert */}
                    <div className="bg-orange-50 border border-orange-100 p-6 rounded-[32px] flex items-center gap-6 shadow-sm animate-pulse">
                        <div className="w-12 h-12 rounded-2xl bg-orange-200 text-orange-700 flex items-center justify-center shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-[12px] font-black uppercase tracking-tight text-orange-900 leading-tight">ŞİRKET PUANTAJI İLE FARK TESPİT EDİLDİ</h4>
                            <p className="text-[11px] font-medium text-orange-700/70 mt-1 uppercase tracking-tighter italic">Şirket kayıtlarına göre bugün şantiyede 3 değil 5 personel görünüyor. Lütfen verilerinizi kontrol edin.</p>
                        </div>
                        <button className="px-6 py-3 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-orange-700 shadow-sm">UYUŞMAZLIĞA BAK</button>
                    </div>

                    {/* Attendance List */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Günlük Yoklama Listesi</h3>
                            <div className="flex gap-2">
                                <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition-all"><ChevronLeft size={20} /></button>
                                <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition-all"><ChevronRight size={20} /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-slate-50/50">
                            {personnel.map(p => (
                                <div key={p.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center group">
                                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4 group-hover:bg-[#0A1128] group-hover:text-white transition-all shadow-inner border-2 border-transparent group-hover:border-orange-100 ring-4 ring-transparent group-hover:ring-orange-50">
                                        <UserCircle size={40} />
                                    </div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase leading-none mb-1">{p.name}</h4>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{p.role}</span>

                                    <div className="flex gap-3 w-full">
                                        <button
                                            onClick={() => toggleStatus(p.id, 'PRESENT')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${p.status === 'PRESENT' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}
                                        >
                                            <CheckCircle2 size={14} /> VAR
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(p.id, 'ABSENT')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${p.status === 'ABSENT' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}
                                        >
                                            <XCircle size={14} /> YOK
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-8 bg-white border-t border-slate-50 flex justify-end">
                            <button className="px-12 py-5 bg-[#0A1128] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">GÜNÜN PUANTAJINI GÖNDER</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
