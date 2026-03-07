import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import {
    Hammer,
    Building2,
    ChevronRight,
    Activity,
    Users,
    FileText,
    Box,
    TrendingUp,
    PieChart,
    Search,
    Filter,
    ArrowRight
} from 'lucide-react';

export default function SubJobs() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [jobs, setJobs] = useState([
        { id: 1, name: 'Kalıp & Betonarmé', project: 'Aksu Lüks Konutları', totalAmount: 15000, doneAmount: 8450, unit: 'm2', price: 850, status: 'DEVAM EDİYOR', color: 'indigo' },
        { id: 2, name: 'Dış Cephe Mantolama', project: 'Batı Vista', totalAmount: 12000, doneAmount: 12000, unit: 'm2', price: 450, status: 'TAMAMLANDI', color: 'emerald' },
        { id: 3, name: 'Seramik Kaplama', project: 'Aksu Lüks Konutları', totalAmount: 4500, doneAmount: 1200, unit: 'm2', price: 210, status: 'DEVAM EDİYOR', color: 'amber' }
    ]);

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Aktif İşlerim & Şantiyeler" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="relative w-full max-w-lg">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input
                                type="text"
                                placeholder="İş ismi veya proje ile ara..."
                                className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[32px] text-sm font-bold shadow-sm focus:border-indigo-400 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>
                        <button className="px-8 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 hover:bg-white transition-all"><Filter size={16} /> TÜMÜNÜ FİLTRELE</button>
                    </div>

                    {/* Jobs Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {jobs.map(job => (
                            <div key={job.id} className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-16 h-16 rounded-[24px] bg-${job.color}-50 text-${job.color}-600 flex items-center justify-center border border-transparent group-hover:bg-[#0A1128] group-hover:text-white transition-all`}>
                                            <Hammer size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none mb-2">{job.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <Building2 size={12} className="text-slate-300" />
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{job.project}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black border uppercase tracking-widest ${job.status === 'TAMAMLANDI' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse'}`}>
                                            {job.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-3 mb-10">
                                    <div className="flex justify-between items-end">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">İlerleme Durumu</div>
                                        <div className="text-sm font-black text-slate-800">%{Math.round((job.doneAmount / job.totalAmount) * 100)}</div>
                                    </div>
                                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${job.color === 'emerald' ? 'from-emerald-400 to-teal-500' : 'from-indigo-400 to-blue-500'} transition-all duration-1000 shadow-lg`}
                                            style={{ width: `${(job.doneAmount / job.totalAmount) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest italic pt-1">
                                        <span>Tamamlanan: {job.doneAmount.toLocaleString('tr-TR')} {job.unit}</span>
                                        <span>Toplam: {job.totalAmount.toLocaleString('tr-TR')} {job.unit}</span>
                                    </div>
                                </div>

                                {/* Action Buttons - Grid */}
                                <div className="grid grid-cols-3 gap-4 border-t border-slate-50 pt-10">
                                    <button className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[32px] border border-transparent hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all group/btn">
                                        <Users size={20} className="text-slate-300 group-hover/btn:text-indigo-600 mb-2" />
                                        <span className="text-[9px] font-black text-slate-400 group-hover/btn:text-slate-800 uppercase tracking-widest">Puantaj Gir</span>
                                    </button>
                                    <button className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[32px] border border-transparent hover:bg-white hover:border-emerald-100 hover:shadow-xl transition-all group/btn">
                                        <TrendingUp size={20} className="text-slate-300 group-hover/btn:text-emerald-600 mb-2" />
                                        <span className="text-[9px] font-black text-slate-400 group-hover/btn:text-slate-800 uppercase tracking-widest">Hakediş Yap</span>
                                    </button>
                                    <button className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[32px] border border-transparent hover:bg-white hover:border-amber-100 hover:shadow-xl transition-all group/btn">
                                        <Box size={20} className="text-slate-300 group-hover/btn:text-amber-600 mb-2" />
                                        <span className="text-[9px] font-black text-slate-400 group-hover/btn:text-slate-800 uppercase tracking-widest">Stok Ata</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
