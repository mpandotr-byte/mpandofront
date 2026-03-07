import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import {
    User,
    IdCard,
    Building2,
    Star,
    Calendar,
    History,
    MapPin,
    ArrowLeft,
    Clock,
    Briefcase,
    ShieldCheck,
    MoreHorizontal,
    Plus,
    X
} from 'lucide-react';

const branches = ['Demirci', 'Kalıpçı', 'Alçıcı', 'Elektrikçi', 'Sıvacı', 'Boyacı', 'Mekanikçi', 'Seramikçi'];

export default function EmployeeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [assignData, setAssignData] = useState({
        project_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
    });

    useEffect(() => {
        fetchEmployee();
        fetchProjects();
    }, [id]);

    const fetchEmployee = async () => {
        try {
            const data = await api.get(`/hr/employees/${id}`);
            setEmployee(data);
        } catch (error) {
            console.error("Fetch employee error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const data = await api.get('/projects');
            setProjects(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/hr/assignments', {
                employee_id: parseInt(id),
                ...assignData,
                project_id: parseInt(assignData.project_id)
            });
            setIsAssignModalOpen(false);
            fetchEmployee();
            alert("Görevlendirme başarıyla yapıldı.");
        } catch (err) {
            console.error(err);
            alert("Hata: " + err.message);
        }
    };

    if (loading) return null;
    if (!employee) return <div className="p-10 text-center text-slate-400">İşçi bulunamadı.</div>;

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="İşçi Kartı (Dijital Kimlik)" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-6">
                    {/* Header with Back Button */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/employees')}
                            className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-[#D36A47] hover:border-[#D36A47] rounded-2xl transition-all shadow-sm group"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <h1 className="text-xl font-black uppercase tracking-tight text-slate-700">Personel Detayları</h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT COLUMN: Profile & Key Info */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden group">
                                <div className="p-10 bg-gradient-to-br from-[#0A1128] to-[#1E293B] text-white relative">
                                    <div className="absolute top-6 right-6 p-3 bg-white/10 rounded-2xl">
                                        <ShieldCheck size={20} className="text-emerald-400" />
                                    </div>
                                    <div className="w-24 h-24 rounded-[32px] bg-[#D36A47] flex items-center justify-center shadow-2xl shadow-[#D36A47]/30 border-4 border-white/10 mb-8 mx-auto -translate-y-2 group-hover:scale-110 transition-transform">
                                        <User size={48} className="text-white" />
                                    </div>
                                    <div className="text-center group-hover:translate-z-10 transition-all">
                                        <h2 className="text-2xl font-black tracking-tight uppercase mb-2">{employee.name} {employee.surname}</h2>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest text-white/80 backdrop-blur-md">
                                            {employee.branch}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#D36A47]">
                                                <Star size={20} className="fill-[#D36A47]" />
                                            </div>
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Performans</span>
                                        </div>
                                        <div className="text-2xl font-black text-slate-800">{employee.rating || 0}.0</div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 text-slate-600">
                                            <IdCard size={18} className="text-slate-300" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TC / Pasaport</span>
                                                <span className="text-sm font-bold">{employee.identity_number || 'Bilinmiyor'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-600">
                                            <Building2 size={18} className="text-slate-300" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bağlı Taşeron</span>
                                                <span className="text-sm font-bold">{employee.subcontractor_name || 'Direkt Personel'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-600">
                                            <Calendar size={18} className="text-slate-300" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kayıt Tarihi</span>
                                                <span className="text-sm font-bold">{new Date(employee.created_at).toLocaleDateString('tr-TR')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsAssignModalOpen(true)}
                                className="w-full py-5 bg-[#D36A47] text-white rounded-[32px] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#D36A47]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <Plus size={20} />
                                ŞANTİYEYE GÖREVLENDİR
                            </button>
                        </div>

                        {/* RIGHT COLUMN: Performance & History */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Current Status Card */}
                            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[#D36A47]/10 flex items-center justify-center text-[#D36A47]">
                                            <Briefcase size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Aktif Görev Durumu</h3>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Şantiye ve Lokasyon Bilgisi</p>
                                        </div>
                                    </div>
                                    {employee.active_project ? (
                                        <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" /> Aktif Görevde
                                        </div>
                                    ) : (
                                        <div className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                            Saha Ataması Yok
                                        </div>
                                    )}
                                </div>

                                {employee.active_project ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ring-1 ring-slate-100 p-6 rounded-[32px] bg-slate-50/30">
                                        <div className="space-y-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Şantiye Adı</span>
                                                <span className="text-lg font-black text-[#0A1128]">{employee.active_project}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                                                <MapPin size={14} className="text-[#D36A47]" />
                                                <span>{employee.project_location || 'İlgili Şantiye Sahası'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Görev Başlangıcı</span>
                                                <span className="text-lg font-bold text-slate-700">{new Date(employee.assignment_start).toLocaleDateString('tr-TR')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                                <Clock size={14} />
                                                <span>Varyant: Gece / Gündüz</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center text-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                                            <MapPin size={32} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">İşçi Herhangi Bir Şantiyede Görevli Değil</p>
                                            <p className="text-xs text-slate-300 mt-1 font-medium italic">Lütfen "Görevlendir" butonu ile atama yapın.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Work History */}
                            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 rounded-2xl bg-[#0A1128]/5 flex items-center justify-center text-[#0A1128]">
                                        <History size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Geçmiş Şantiye Kayıtları</h3>
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Çalışma Geçmişi ve Proje Listesi</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {(employee.work_history || []).length > 0 ? (
                                        employee.work_history.map((h, i) => (
                                            <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 hover:bg-white border border-slate-100 rounded-3xl transition-all hover:shadow-lg hover:shadow-slate-100">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                        <Plus size={18} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] font-black text-slate-700 uppercase tracking-tight">{h.project_name}</span>
                                                        <span className="text-[11px] text-slate-400 font-bold">{h.branch}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[12px] font-bold text-slate-600">{new Date(h.start_date).toLocaleDateString('tr-TR')} - {h.end_date ? new Date(h.end_date).toLocaleDateString('tr-TR') : 'Halen'}</div>
                                                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Görev Süresi: {h.duration || '?'} Gün</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-slate-300 italic font-medium">Henüz geçmiş çalışma kaydı bulunmuyor.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assignment Modal */}
                {isAssignModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                        <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in">
                            <div className="bg-[#0A1128] p-10 text-white relative">
                                <button onClick={() => setIsAssignModalOpen(false)} className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-[#D36A47] flex items-center justify-center shadow-lg"><Plus size={32} /></div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">Sahaya Görevlendir</h2>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Personel saha atama formu</p>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleAssignSubmit} className="p-10 space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Proje / Şantiye Seçin</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <select
                                            required
                                            value={assignData.project_id}
                                            onChange={(e) => setAssignData({ ...assignData, project_id: e.target.value })}
                                            className="w-full pl-12 pr-10 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold appearance-none focus:bg-white outline-none"
                                        >
                                            <option value="">Proje Seçin</option>
                                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Başlangıç Tarihi</label>
                                        <input
                                            type="date"
                                            required
                                            value={assignData.start_date}
                                            onChange={(e) => setAssignData({ ...assignData, start_date: e.target.value })}
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold focus:bg-white outline-none"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Bitiş Tarihi (Ops.)</label>
                                        <input
                                            type="date"
                                            value={assignData.end_date}
                                            onChange={(e) => setAssignData({ ...assignData, end_date: e.target.value })}
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold focus:bg-white outline-none"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-5 bg-[#D36A47] text-white rounded-[32px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">
                                    GÖREVLENDİRMEYİ ONAYLA
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
