import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import {
    Calendar,
    Truck,
    Clock,
    Plus,
    ChevronRight,
    ChevronLeft,
    Users,
    Activity,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Save,
    LayoutGrid,
    LayoutList
} from 'lucide-react';

export default function Planning() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [view, setView] = useState('calendar'); // 'calendar', 'appointments'
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [isApptModalOpen, setIsApptModalOpen] = useState(false);

    // Form Stats
    const [apptForm, setApptForm] = useState({
        time: '',
        material: '',
        supplier: '',
        status: 'BEKLENİYOR'
    });

    useEffect(() => {
        fetchPlanningData();
    }, []);

    const fetchPlanningData = async () => {
        try {
            const [appts, schs] = await Promise.all([
                api.get('/construction/delivery-appointments'),
                api.get('/construction/work-schedules')
            ]);
            setAppointments(appts || []);
            setSchedules(schs || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAppt = async (e) => {
        e.preventDefault();
        try {
            await api.post('/construction/delivery-appointments', apptForm);
            setIsApptModalOpen(false);
            fetchPlanningData();
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="İş Programı & Planlama" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-stretch gap-6">
                        <div className="bg-white p-1.5 rounded-[28px] border border-slate-100 shadow-sm flex grow max-w-md">
                            <button
                                onClick={() => setView('calendar')}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${view === 'calendar' ? 'bg-[#0A1128] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <LayoutGrid size={18} /> İŞ PROGRAMI
                            </button>
                            <button
                                onClick={() => setView('appointments')}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${view === 'appointments' ? 'bg-[#0A1128] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Truck size={18} /> SEVKİYAT RANDEVU
                            </button>
                        </div>
                        <button
                            onClick={() => setIsApptModalOpen(true)}
                            className="px-10 py-5 bg-[#D36A47] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <Plus size={20} /> {view === 'calendar' ? 'VARYANT EKLE' : 'RANDEVU AL'}
                        </button>
                    </div>

                    {/* View: Work Schedule (Planning Grid) */}
                    {view === 'calendar' && (
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 min-h-[500px]">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Haftalık İmalat Takvimi</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ekipler ve Branş Dağılımı</p>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                    <button className="p-2 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm"><ChevronLeft size={20} /></button>
                                    <span className="text-sm font-black uppercase tracking-widest text-[#0A1128]">MART 1-7, 2026</span>
                                    <button className="p-2 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm"><ChevronRight size={20} /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-8 gap-4 mb-2">
                                <div className="col-span-1 border-b border-transparent"></div>
                                {['Paz', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, i) => (
                                    <div key={i} className="text-center py-2 text-[11px] font-black text-slate-300 uppercase tracking-widest bg-slate-50/50 rounded-xl">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                {[
                                    { branch: 'Kalıp Ekibi', project: 'Blok A', color: 'bg-orange-500' },
                                    { branch: 'Demir Ekibi', project: 'Blok A', color: 'bg-emerald-500' },
                                    { branch: 'Sıva Ekibi', project: 'Blok B', color: 'bg-orange-500' }
                                ].map((task, i) => (
                                    <div key={i} className="grid grid-cols-8 gap-4 items-center">
                                        <div className="col-span-1">
                                            <div className="text-[12px] font-black text-slate-800 uppercase leading-none mb-1">{task.branch}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase">{task.project}</div>
                                        </div>
                                        <div className="col-span-1 p-1">
                                            <div className={`h-12 rounded-2xl ${task.color} opacity-90 shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center text-white`}>
                                                <Activity size={16} />
                                            </div>
                                        </div>
                                        <div className="col-span-3 p-1">
                                            <div className={`h-12 rounded-2xl ${task.color} opacity-90 shadow-lg hover:scale-[1.02] transition-transform`}></div>
                                        </div>
                                        <div className="col-span-1 p-1">
                                            <div className={`h-12 rounded-2xl ${task.color} opacity-90 shadow-lg hover:scale-[1.02] transition-transform`}></div>
                                        </div>
                                        <div className="col-span-2"></div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-16 py-12 border-2 border-dashed border-slate-50 rounded-[40px] flex flex-col items-center justify-center text-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                                    <Plus size={32} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">İş Programını Şekillendirin</h4>
                                    <p className="text-xs text-slate-300 mt-1">Ekipleri sahalara sürükle-bırak yöntemiyle atayın (Yakında)</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View: Delivery Appointments */}
                    {view === 'appointments' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {appointments.length > 0 ? (
                                appointments.map(appt => (
                                    <div key={appt.id} className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm hover:shadow-2xl hover:border-[#D36A47]/30 transition-all group">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="w-14 h-14 rounded-2xl bg-[#0A1128] text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                                <Truck size={28} />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-slate-800">{appt.time}</div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{appt.status}</div>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{appt.material}</h3>
                                        <div className="space-y-4 pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <MapPin size={16} className="text-[#D36A47]" />
                                                <span className="text-[13px] font-bold text-slate-600 uppercase tracking-tight">{appt.supplier}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Users size={16} className="text-slate-300" />
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nakliye: Plaka Girilmedi</span>
                                            </div>
                                        </div>
                                        <button className="w-full mt-8 py-4 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:border-emerald-200 transition-all flex items-center justify-center gap-2">
                                            <CheckCircle2 size={16} /> VARDI ONAYLA
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-32 text-center opacity-30 flex flex-col items-center">
                                    <Clock size={64} className="mb-6" />
                                    <h3 className="text-lg font-black uppercase tracking-widest text-[#0A1128]">Sevkiyat Listesi Boş</h3>
                                    <p className="text-xs uppercase tracking-widest mt-2 font-bold">Yaklaşan beton, demir veya malzeme randevusu bulunmuyor</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Create Appointment Modal */}
                {isApptModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in">
                            <div className="bg-[#0A1128] p-10 text-white relative">
                                <button onClick={() => setIsApptModalOpen(false)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">KAPAT</button>
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-[#D36A47] flex items-center justify-center shadow-lg"><Truck size={32} /></div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Sevkiyat Randevu Sistemi</h2>
                                </div>
                            </div>
                            <form onSubmit={handleSaveAppt} className="p-10 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Varış Saati</label>
                                        <input required type="time" value={apptForm.time} onChange={e => setApptForm({ ...apptForm, time: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tarih</label>
                                        <input required type="date" value={new Date().toISOString().split('T')[0]} readOnly className="w-full px-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Malzeme (Beton, Demir, Tuğla...)</label>
                                    <input required type="text" value={apptForm.material} onChange={e => setApptForm({ ...apptForm, material: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tedarikçi / Lojistik Firma</label>
                                    <input required type="text" value={apptForm.supplier} onChange={e => setApptForm({ ...apptForm, supplier: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white outline-none" />
                                </div>

                                <button type="submit" className="w-full py-5 bg-[#D36A47] text-white rounded-[32px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all mt-6">
                                    SEVKİYATI RANDEVU LİSTESİNE EKLE
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
