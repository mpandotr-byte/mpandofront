import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import {
    Camera,
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
    Plus,
    X,
    Image as ImageIcon,
    MoreHorizontal,
    Search,
    Filter,
    Calendar,
    Bell,
    MapPin
} from 'lucide-react';

export default function SiteLogs() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'NOTE', // 'NOTE', 'ERROR', 'CHECK'
        location: '',
        is_reminder: false,
        reminder_date: ''
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const data = await api.get('/construction/site-logs');
            setLogs(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLog = async (e) => {
        e.preventDefault();
        try {
            await api.post('/construction/site-logs', formData);
            setIsCreateModalOpen(false);
            fetchLogs();
            alert("Saha günlüğü kaydedildi.");
        } catch (error) {
            alert("Hata: " + error.message);
        }
    };

    const getTypeStyles = (type) => {
        switch (type) {
            case 'ERROR': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'CHECK': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-blue-50 text-blue-600 border-blue-100';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'ERROR': return <AlertTriangle size={18} />;
            case 'CHECK': return <CheckCircle2 size={18} />;
            default: return <MessageSquare size={18} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Saha Günlüğü & Tespitler" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Header Layout */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">Şantiye Tespitleri</h1>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Hatalı İmalat, Önemli Notlar ve Hatırlatıcılar</p>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-full md:w-auto px-8 py-5 bg-[#D36A47] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <Camera size={20} /> YENİ TESPİT EKLE
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar: Calendar & Reminders */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Bell size={14} className="text-[#D36A47]" /> Aktif Hatırlatıcılar
                                </h3>
                                <div className="space-y-4">
                                    {logs.filter(l => l.is_reminder).length > 0 ? (
                                        logs.filter(l => l.is_reminder).map(rem => (
                                            <div key={rem.id} className="p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
                                                <div className="text-[10px] font-black text-amber-600 uppercase tracking-tighter mb-1">{new Date(rem.reminder_date).toLocaleDateString()}</div>
                                                <div className="text-sm font-bold text-slate-700 leading-tight">{rem.title}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-10 text-center text-slate-300 italic text-sm">Bekleyen görev yok</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Feed */}
                        <div className="lg:col-span-3 space-y-6">
                            {loading ? (
                                <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest animate-pulse">Tespitler Getiriliyor...</div>
                            ) : logs.length > 0 ? (
                                logs.map(log => (
                                    <div key={log.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
                                        <div className="p-8">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${getTypeStyles(log.type)}`}>
                                                        {getTypeIcon(log.type)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-slate-800 text-[17px] uppercase tracking-tight">{log.title}</h3>
                                                        <div className="flex items-center gap-3 mt-1 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(log.created_at).toLocaleDateString()}</span>
                                                            <span className="flex items-center gap-1"><MapPin size={12} /> {log.location || 'Genel Şantiye'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><MoreHorizontal size={20} /></button>
                                            </div>

                                            <div className="space-y-6">
                                                <p className="text-slate-600 font-medium leading-relaxed">
                                                    {log.content}
                                                </p>

                                                {/* Simulated Photo Gallery */}
                                                <div className="grid grid-cols-4 gap-4">
                                                    {[1, 2].map(img => (
                                                        <div key={img} className="aspect-square bg-slate-100 rounded-3xl border border-slate-200 flex items-center justify-center text-slate-300 hover:border-[#D36A47]/30 hover:bg-[#D36A47]/5 transition-all cursor-zoom-in">
                                                            <ImageIcon size={24} />
                                                        </div>
                                                    ))}
                                                    <div className="aspect-square bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-1">
                                                        <Plus size={14} />
                                                        <span className="text-[9px] font-black uppercase tracking-tighter">FOTO EKLE</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-40 flex flex-col items-center justify-center text-center opacity-20">
                                    <Camera size={64} className="mb-4" />
                                    <h3 className="text-lg font-black uppercase tracking-widest">Saha Günlüğü Boş</h3>
                                    <p className="text-xs uppercase tracking-widest mt-2 font-bold italic">Bugün henüz bir tespit yapılmadı</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Create Modal */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in">
                            <div className="bg-[#0A1128] p-10 text-white relative">
                                <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">KAPAT</button>
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-[#D36A47] flex items-center justify-center shadow-lg"><Camera size={32} /></div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Yeni Saha Tespit Formu</h2>
                                </div>
                            </div>
                            <form onSubmit={handleSaveLog} className="p-10 space-y-6">
                                <div className="flex gap-4 mb-4">
                                    {['NOTE', 'ERROR', 'CHECK'].map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: t })}
                                            className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === t ? 'bg-[#0A1128] text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            {t === 'NOTE' ? 'NOT' : t === 'ERROR' ? 'HATA' : 'KONTROL'}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kısa Başlık</label>
                                    <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white outline-none" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tespit Detayı</label>
                                    <textarea rows="4" required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white outline-none resize-none"></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Konum / Blok-Kat</label>
                                        <input type="text" placeholder="B Blok 4. Kat" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white outline-none" />
                                    </div>
                                    <div className="flex items-end pb-1 px-2">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" checked={formData.is_reminder} onChange={e => setFormData({ ...formData, is_reminder: e.target.checked })} className="w-6 h-6 border-2 border-slate-300 rounded-lg checked:bg-[#D36A47] focus:ring-0 transition-all" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-[#D36A47] transition-all">Hatırlatıcı Ekle</span>
                                        </label>
                                    </div>
                                </div>

                                {formData.is_reminder && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hatırlatma Tarihi</label>
                                        <input type="date" value={formData.reminder_date} onChange={e => setFormData({ ...formData, reminder_date: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white outline-none" />
                                    </div>
                                )}

                                <button type="submit" className="w-full py-5 bg-[#D36A47] text-white rounded-[32px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all mt-6">
                                    SAHA TESPİTİNİ KAYDET
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
