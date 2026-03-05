import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import {
    Search,
    Filter,
    Download,
    Calculator,
    ArrowUpRight,
    Box,
    Hammer,
    ArrowRight,
    Loader2,
    PieChart,
    ChevronDown,
    Building2,
    CheckCircle2,
    Calendar,
    User,
    CheckSquare,
    Layers,
    ClipboardList,
    FileSpreadsheet,
    Maximize
} from 'lucide-react';

function QuantitySummary({ isSubPage = false }) {
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [assignments, setAssignments] = useState([]);

    // Filters
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [activeTab, setActiveTab] = useState('HISTORY'); // HISTORY or ANALYTICS
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Initial Projects
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await api.get('/projects');
                setProjects(data || []);
            } catch (err) {
                console.error("Projects fetch error:", err);
            }
        };
        fetchProjects();
    }, []);

    // Fetch Assignments based on Project
    const fetchAssignments = async () => {
        if (!selectedProjectId) return;
        setLoading(true);
        try {
            // User provided endpoint: /recipes/assignments
            const data = await api.get(`/recipes/assignments?project_id=${selectedProjectId}`);
            setAssignments(data || []);
        } catch (err) {
            console.error("Assignments fetch error:", err);
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedProjectId) {
            fetchAssignments();
        }
    }, [selectedProjectId]);

    const filteredAssignments = useMemo(() => {
        return assignments.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            return (
                item.recipe_name?.toLowerCase().includes(searchLower) ||
                item.room_name?.toLowerCase().includes(searchLower) ||
                item.block_name?.toLowerCase().includes(searchLower) ||
                item.unit_no?.toLowerCase().includes(searchLower)
            );
        });
    }, [assignments, searchTerm]);

    const stats = useMemo(() => {
        return {
            totalAssignments: assignments.length,
            totalArea: assignments.reduce((acc, curr) => acc + (parseFloat(curr.target_area) || 0), 0),
            totalCalculations: assignments.reduce((acc, curr) => acc + (parseInt(curr.calc_count) || 0), 0)
        };
    }, [assignments]);

    const renderEmptyState = () => (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-60">
            <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 mb-6 shadow-inner">
                <ClipboardList size={48} />
            </div>
            <h4 className="text-slate-800 font-black text-lg mb-2 uppercase tracking-tight">Atama Kaydı Bulunamadı</h4>
            <p className="text-slate-400 text-xs font-bold max-w-[280px] leading-relaxed uppercase tracking-wider">
                Lütfen proje bazlı atama geçmişini görmek için yukarıdan bir proje seçin.
            </p>
        </div>
    );

    return (
        <div className={`flex flex-col gap-6 ${isSubPage ? 'h-[calc(100vh-280px)]' : 'h-full'}`}>

            {/* Header / Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                <div className="md:col-span-2 bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#D36A47]/10 flex items-center justify-center text-[#D36A47]">
                            <Filter size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Aktif Proje Raporu</span>
                            <select
                                className="bg-transparent border-none text-lg font-black text-slate-800 focus:ring-0 outline-none cursor-pointer p-0"
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                            >
                                <option value="">Proje Seçiniz</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>
                    {selectedProjectId && (
                        <button
                            onClick={fetchAssignments}
                            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#D36A47] transition-colors"
                            title="Yenile"
                        >
                            <Loader2 size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    )}
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <Calculator size={20} />
                    </div>
                    <div>
                        <p className="text-lg font-black text-slate-800 leading-none">{stats.totalAssignments}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Toplam Atama</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <Maximize size={20} />
                    </div>
                    <div>
                        <p className="text-lg font-black text-slate-800 leading-none">{stats.totalArea.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} m²</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Toplam Metraj</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">

                {/* Main Table Area */}
                <div className="flex-1 bg-white rounded-[32px] border border-slate-200/60 shadow-2xl shadow-slate-200/10 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
                        <div className="flex items-center gap-4">
                            <div className="flex p-1 bg-slate-100 rounded-2xl">
                                <button
                                    onClick={() => setActiveTab('HISTORY')}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black transition-all ${activeTab === 'HISTORY' ? 'bg-white text-[#D36A47] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <FileSpreadsheet size={14} /> ATAMA GEÇMİŞİ
                                </button>
                                <button
                                    disabled
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black text-slate-300 cursor-not-allowed"
                                >
                                    <PieChart size={14} /> ANALİTİK ÖZET (YAKINDA)
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Listede ara..."
                                    className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-slate-700 w-64 focus:ring-2 focus:ring-[#D36A47]/10 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="flex items-center gap-2 bg-[#0A1128] text-white px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-[#1E293B] transition-all shadow-lg">
                                <Download size={14} /> EXCEL
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {!selectedProjectId ? renderEmptyState() : loading ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-4">
                                <div className="w-12 h-12 border-4 border-[#D36A47]/10 border-t-[#D36A47] rounded-full animate-spin" />
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Rapor Hazırlanıyor</p>
                            </div>
                        ) : filteredAssignments.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-60">
                                <Calculator size={48} className="text-slate-200 mb-4" />
                                <p className="text-xs font-bold text-slate-400 uppercase">Seçili kriterlere uygun kayıt bulunamadı.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                                    <tr className="border-b border-slate-100">
                                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Atama Künyesi</th>
                                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lokasyon</th>
                                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Hesaplanan Kalem</th>
                                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Alan</th>
                                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tarih & Yapan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredAssignments.map((record) => (
                                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-1.5 h-10 rounded-full ${record.layer === 'Zemin' ? 'bg-orange-500' : record.layer === 'Duvar' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="text-[10px] font-black text-[#D36A47] uppercase tracking-tighter bg-[#D36A47]/5 px-1.5 py-0.5 rounded">{record.recipe_code}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{record.layer}</span>
                                                        </div>
                                                        <span className="text-xs font-black text-slate-800 uppercase line-clamp-1">{record.recipe_name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 text-[10px] font-bold text-slate-500 uppercase">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-slate-800 font-black">{record.block_name} | Kat {record.floor_no}</span>
                                                    <span>No: {record.unit_no} - {record.room_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl font-black text-[11px] text-slate-700">
                                                    <Layers size={12} className="text-[#D36A47]" />
                                                    {record.calc_count}
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-black text-slate-800">{Number(record.target_area || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">m²</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-center gap-1.5 text-slate-600 font-black text-[11px]">
                                                        <User size={12} className="text-slate-300" />
                                                        {record.assigned_by}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[9px] uppercase tracking-tighter">
                                                        <Calendar size={11} className="text-slate-300" />
                                                        {new Date(record.assigned_at).toLocaleDateString('tr-TR')}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Legend / Info Panel */}
                <div className="w-80 flex flex-col gap-6 shrink-0">
                    <div className="bg-gradient-to-br from-[#0A1128] to-[#1E293B] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-[#0A1128]/30">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#D36A47] rounded-full blur-[60px] opacity-20 translate-y-1/2 translate-x-1/3" />
                        <h4 className="text-[10px] font-black text-[#D36A47] uppercase tracking-[0.3em] mb-8">Rapor Bilgisi</h4>

                        <div className="space-y-6">
                            <p className="text-[11px] font-medium text-white/60 leading-relaxed uppercase tracking-wide">
                                Bu ekran, projedeki tüm oda-reçete eşleşmelerini ve bu eşleşmelerden doğan metraj kalemlerini takip etmek için kullanılır.
                            </p>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-center justify-between text-[11px] font-black">
                                    <span className="text-white/40 uppercase tracking-widest">Hesaplanan Kalem</span>
                                    <span className="text-white">{stats.totalCalculations}</span>
                                </div>
                                <div className="h-px bg-white/10" />
                                <div className="flex items-center justify-between text-[11px] font-black">
                                    <span className="text-white/40 uppercase tracking-widest">Ort. M² / Oda</span>
                                    <span className="text-white">{(stats.totalAssignments > 0 ? stats.totalArea / stats.totalAssignments : 0).toFixed(1)} m²</span>
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-10 bg-[#D36A47] hover:bg-[#B95839] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-[#D36A47]/20 flex items-center justify-center gap-3">
                            DETAYLI RAPOR AL <ArrowUpRight size={14} />
                        </button>
                    </div>

                    <div className="bg-white rounded-[32px] border border-slate-200/60 p-7 flex-1 shadow-xl shadow-slate-200/10">
                        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4 flex items-center gap-2">
                            <Box size={14} className="text-[#D36A47]" /> Katman Renkleri
                        </h4>
                        <div className="space-y-5">
                            {[
                                { label: 'Zemin Katmanı', color: 'bg-orange-500', desc: 'Seramik, Parke vb.' },
                                { label: 'Duvar Katmanı', color: 'bg-blue-500', desc: 'Boya, Kağıt, Alçı Söve' },
                                { label: 'Tavan Katmanı', color: 'bg-emerald-500', desc: 'Asma Tavan, Boya' }
                            ].map((l, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${l.color} shadow-lg`} />
                                    <div>
                                        <p className="text-[11px] font-black text-slate-700 leading-none">{l.label}</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{l.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuantitySummary;
