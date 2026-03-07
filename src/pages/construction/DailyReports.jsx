import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import {
    FileText,
    Users,
    CloudSun,
    Plus,
    Calendar,
    CheckCircle2,
    Save,
    Clock,
    MapPin,
    ArrowRight,
    Search,
    AlertCircle
} from 'lucide-react';

export default function DailyReports() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        weather: 'Güneşli',
        temp: '22',
        work_summary: '',
        personnel_count: 0,
        subcontractor_stats: []
    });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const data = await api.get('/construction/daily-reports');
            setReports(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveReport = async (e) => {
        e.preventDefault();
        try {
            await api.post('/construction/daily-reports', formData);
            setIsCreateModalOpen(false);
            fetchReports();
            alert("Rapor kaydedildi.");
        } catch (error) {
            alert("Hata: " + error.message);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Günlük Saha Raporları" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-6">

                    {/* Header Banner */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#0A1128] to-[#1E293B] rounded-[40px] p-10 text-white shadow-2xl">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px]" />
                        <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Şantiye Günlüğü</h1>
                                <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.3em]">Resmi Günlük Faaliyet Raporları</p>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-10 py-5 bg-[#D36A47] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                            >
                                <Plus size={20} /> YENİ RAPOR OLUŞTUR
                            </button>
                        </div>
                    </div>

                    {/* Report List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest">Yükleniyor...</div>
                        ) : reports.length > 0 ? (
                            reports.map(report => (
                                <div key={report.id} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#D36A47] group-hover:bg-[#D36A47]/10 transition-all">
                                                <Calendar size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-800 text-[15px]">{new Date(report.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.day_name || 'Hafta İçi'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black">
                                            <CloudSun size={14} /> {report.temp}°C
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <p className="text-sm font-medium text-slate-500 line-clamp-3 leading-relaxed">
                                            {report.work_summary}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-slate-300" />
                                            <span className="text-xs font-black text-slate-500">{report.personnel_count} PERSONEL</span>
                                        </div>
                                        <button className="text-[10px] font-black text-[#D36A47] uppercase tracking-widest flex items-center gap-2 hover:underline">
                                            DETAYLAR <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-20">
                                <FileText size={64} className="mb-4" />
                                <p className="text-sm font-black uppercase tracking-widest">Henüz rapor girilmemiş</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Modal */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
                            <div className="bg-[#0A1128] p-10 text-white relative">
                                <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">KAPAT</button>
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-[#D36A47] flex items-center justify-center shadow-lg"><Plus size={32} /></div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">Günlük Rapor Yaz</h2>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Saha faaliyetleri ve kadro dökümü</p>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleSaveReport} className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tarih</label>
                                        <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold focus:bg-white outline-none transition-all" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Hava Durumu / Sicaklik</label>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="Güneşli" value={formData.weather} onChange={e => setFormData({ ...formData, weather: e.target.value })} className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold focus:bg-white outline-none" />
                                            <input type="number" placeholder="22" value={formData.temp} onChange={e => setFormData({ ...formData, temp: e.target.value })} className="w-24 px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold focus:bg-white outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Yapılan İmalatlar (Özet)</label>
                                    <textarea
                                        rows="4"
                                        required
                                        placeholder="Bugün sahada hangi işler tamamlandı?"
                                        value={formData.work_summary}
                                        onChange={e => setFormData({ ...formData, work_summary: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold focus:bg-white outline-none resize-none"
                                    ></textarea>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Toplam Personel Sayısı</label>
                                    <div className="relative">
                                        <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input type="number" value={formData.personnel_count} onChange={e => setFormData({ ...formData, personnel_count: e.target.value })} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold focus:bg-white outline-none" />
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-5 bg-[#D36A47] text-white rounded-[32px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">
                                    RAPORU YAYINLA
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
