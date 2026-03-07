import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import {
    Calendar,
    CheckCircle,
    XCircle,
    Filter,
    Search,
    MapPin,
    Users,
    ChevronDown,
    Save,
    Clock,
    AlertCircle,
    Building2,
    Briefcase
} from 'lucide-react';

const branches = ['Demirci', 'Kalıpçı', 'Alçıcı', 'Elektrikçi', 'Sıvacı', 'Boyacı', 'Mekanikçi', 'Seramikçi'];

export default function Attendance() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('Tümü');
    const [isBranchFilterOpen, setIsBranchFilterOpen] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            fetchAttendancePool();
        }
    }, [selectedProject, selectedBranch, selectedDate]);

    const fetchProjects = async () => {
        try {
            const data = await api.get('/projects');
            setProjects(data || []);
            if (data?.length > 0) setSelectedProject(data[0].id);
        } catch (error) {
            console.error("Fetch projects error:", error);
        }
    };

    const fetchAttendancePool = async () => {
        setLoading(true);
        try {
            const params = {
                project_id: selectedProject,
                date: selectedDate
            };
            if (selectedBranch !== 'Tümü') params.branch = selectedBranch;

            const data = await api.get('/hr/attendance/pool', params);
            setEmployees(data || []);

            // Re-map attendance data for the current view
            const newAttendance = {};
            data.forEach(emp => {
                newAttendance[emp.id] = emp.status || null; // 'present' or 'absent'
            });
            setAttendanceData(newAttendance);
        } catch (error) {
            console.error("Fetch attendance pool error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = (id, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [id]: status
        }));
    };

    const handleBulkSave = async () => {
        setSaving(true);
        try {
            const payload = Object.entries(attendanceData)
                .filter(([_, status]) => status !== null)
                .map(([id, status]) => ({
                    employee_id: parseInt(id),
                    project_id: parseInt(selectedProject),
                    date: selectedDate,
                    status: status
                }));

            if (payload.length === 0) {
                alert("Lütfen en az bir işçi için yoklama yapın.");
                return;
            }

            await api.post('/hr/attendance/bulk', { attendance: payload });
            alert("Yoklama başarıyla kaydedildi.");
        } catch (error) {
            console.error("Save attendance error:", error);
            alert("Hata: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Günlük Puantaj (Yoklama)" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-6">
                    {/* Header Layout */}
                    <div className="flex flex-col xl:flex-row items-stretch gap-6">
                        {/* Control Panel */}
                        <div className="flex-1 bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
                            <div className="w-full md:w-auto">
                                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1 mb-2 block">Şantiye Seçimi</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <select
                                        value={selectedProject}
                                        onChange={(e) => setSelectedProject(e.target.value)}
                                        className="w-full md:w-72 pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold appearance-none focus:bg-white focus:border-[#D36A47] outline-none transition-all"
                                    >
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div className="w-full md:w-auto">
                                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1 mb-2 block">Puantaj Tarihi</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full md:w-56 pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold focus:bg-white focus:border-[#D36A47] outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="w-full md:w-auto relative" onMouseLeave={() => setIsBranchFilterOpen(false)}>
                                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1 mb-2 block">Branş Filtresi</label>
                                <button
                                    onClick={() => setIsBranchFilterOpen(!isBranchFilterOpen)}
                                    className="w-full md:w-56 flex items-center justify-between pl-5 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-600 hover:bg-slate-100 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <Filter size={18} className="text-slate-400" />
                                        <span>{selectedBranch}</span>
                                    </div>
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${isBranchFilterOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isBranchFilterOpen && (
                                    <div className="absolute top-full left-0 mt-3 w-64 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 p-2 animate-scale-in">
                                        <button
                                            onClick={() => { setSelectedBranch('Tümü'); setIsBranchFilterOpen(false); }}
                                            className="w-full text-left px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 text-slate-500"
                                        >
                                            Tümü
                                        </button>
                                        {branches.map(b => (
                                            <button
                                                key={b}
                                                onClick={() => { setSelectedBranch(b); setIsBranchFilterOpen(false); }}
                                                className={`w-full text-left px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedBranch === b ? 'bg-[#D36A47] text-white shadow-lg' : 'hover:bg-slate-50 text-slate-500'}`}
                                            >
                                                {b}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Save Trigger */}
                        <div className="bg-[#D36A47] rounded-[32px] p-6 shadow-lg shadow-[#D36A47]/20 flex flex-col justify-center gap-4 text-white min-w-[240px]">
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-white/60 mb-1">Toplam Liste</h4>
                                <div className="text-2xl font-black">{employees.length} İşçi</div>
                            </div>
                            <button
                                onClick={handleBulkSave}
                                disabled={saving || employees.length === 0}
                                className="w-full py-4 bg-white text-[#D36A47] rounded-[24px] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:scale-100"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-[#D36A47]/20 border-t-[#D36A47] rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save size={18} />
                                        YOKLAMAYI ONAYLA
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Team View */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 min-h-[400px]">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400 py-32">
                                <div className="w-12 h-12 border-4 border-slate-100 border-t-[#D36A47] rounded-full animate-spin" />
                                <p className="text-xs font-black uppercase tracking-widest">Ekipler Listeleniyor...</p>
                            </div>
                        ) : employees.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {employees.map((emp) => (
                                    <div key={emp.id} className="group p-6 bg-white border border-slate-200 rounded-[32px] hover:border-[#D36A47] transition-all shadow-sm hover:shadow-xl hover:shadow-slate-200/50">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 font-bold border border-slate-100 group-hover:bg-[#D36A47]/10 group-hover:text-[#D36A47] transition-all">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-800 text-[15px] uppercase tracking-tight">{emp.name} {emp.surname}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{emp.branch}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                {attendanceData[emp.id] === 'present' && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />}
                                                {attendanceData[emp.id] === 'absent' && <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleMarkAttendance(emp.id, 'present')}
                                                className={`flex items-center justify-center gap-2 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${attendanceData[emp.id] === 'present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-100'}`}
                                            >
                                                <CheckCircle size={16} />
                                                GELDİ
                                            </button>
                                            <button
                                                onClick={() => handleMarkAttendance(emp.id, 'absent')}
                                                className={`flex items-center justify-center gap-2 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${attendanceData[emp.id] === 'absent' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 border border-slate-100'}`}
                                            >
                                                <XCircle size={16} />
                                                GELMEDİ
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-6 py-32">
                                <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-200">
                                    <Users size={40} />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">İşçi Bulunamadı</h3>
                                    <p className="text-slate-300 text-sm mt-2">Bu şantiye ve branş için atanmış aktif bir personel bulunmuyor.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
