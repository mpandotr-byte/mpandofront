import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import {
    Users,
    Hammer,
    Wallet,
    Briefcase,
    Plus,
    Search,
    ChevronRight,
    TrendingUp,
    Activity,
    Star
} from 'lucide-react';
import NewSubcontractorModal from '../../modals/subcontractors/NewSubcontractorModal';

const Subcontractors = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [subcontractors, setSubcontractors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    useEffect(() => {
        fetchSubcontractors();
    }, []);

    const fetchSubcontractors = async () => {
        setLoading(true);
        try {
            // In MPANDO companies table holds subcontractors
            const data = await api.get('/companies');
            // Mock enrichment only for fields that might not be in the backend yet but are UI placeholders
            const enrichedData = (data || []).map(item => ({
                ...item,
                expertise: item.expertise || 'Genel Taşeron',
                activeJobs: item.activeJobs || 0,
                balance: item.balance || 0,
                rating: item.rating || '5.0'
            }));
            setSubcontractors(enrichedData);
        } catch (err) {
            console.error("Subcontractors fetch error:", err);
            setSubcontractors([]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = subcontractors.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.expertise?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={closeMobileMenu} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Taşeron Yönetimi" toggleMobileMenu={toggleMobileMenu} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-6">

                    {/* Header Section */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1128] via-[#0A1128] to-[#1E293B] rounded-[32px] p-6 md:p-10 text-white animate-fade-in shadow-2xl shadow-[#0A1128]/20">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D36A47]/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-[100px]" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-[80px]" />

                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="animate-slide-up">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-[#D36A47] flex items-center justify-center shadow-lg shadow-[#D36A47]/30 border border-white/10">
                                        <Users size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Taşeron & Usta Yönetimi</h1>
                                        <p className="text-white/50 text-sm font-medium">Birlikte çalıştığınız çözüm ortaklarını ve iş süreçlerini yönetin</p>
                                    </div>
                                </div>
                                <div className="flex gap-8">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-white">{subcontractors.length}</span>
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Kayıtlı Taşeron</span>
                                    </div>
                                    <div className="w-px h-10 bg-white/10" />
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-white">
                                            {subcontractors.reduce((acc, curr) => acc + (curr.activeJobs || 0), 0)}
                                        </span>
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Aktif Görev</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 animate-slide-up">
                                <button
                                    onClick={() => navigate('/labors')}
                                    className="flex items-center gap-3 text-xs font-black text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95"
                                >
                                    <Hammer size={18} />
                                    <span>İŞÇİLİK KARTLARI</span>
                                </button>
                                <button
                                    onClick={() => navigate('/employees')}
                                    className="flex items-center gap-3 text-xs font-black text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95"
                                >
                                    <Users size={18} />
                                    <span>İŞÇİ HAVUZU</span>
                                </button>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flex items-center gap-3 text-sm font-black text-white bg-[#D36A47] hover:bg-[#E37A57] shadow-xl shadow-[#D36A47]/20 px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95"
                                >
                                    <Plus size={20} />
                                    <span>YENİ TAŞERON EKLE</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D36A47] transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Taşeron adı veya uzmanlık alanı ara..."
                                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D36A47]/20 focus:border-[#D36A47] transition-all text-sm shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Subcontractors Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-[32px] p-6 h-64 animate-pulse border border-slate-100" />
                            ))
                        ) : filtered.length > 0 ? (
                            filtered.map((s) => (
                                <div
                                    key={s.id}
                                    onClick={() => navigate(`/subcontractors/${s.id}`)}
                                    className="bg-white rounded-[32px] p-7 border border-white shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#D36A47] border border-slate-100 group-hover:bg-[#D36A47] group-hover:text-white transition-all duration-300">
                                            <Briefcase size={24} />
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-xl text-amber-600">
                                            <Star size={12} fill="currentColor" />
                                            <span className="text-xs font-black">{s.rating || '0.0'}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase mb-1 truncate">{s.name}</h3>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">{s.expertise}</p>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                            <div className="flex items-center gap-2 mb-1 text-slate-400">
                                                <Activity size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Aktif İş</span>
                                            </div>
                                            <span className="text-sm font-black text-slate-900">{s.activeJobs} Görev</span>
                                        </div>
                                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                            <div className="flex items-center gap-2 mb-1 text-slate-400">
                                                <Wallet size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Bakiye</span>
                                            </div>
                                            <span className="text-sm font-black text-indigo-600">
                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(s.balance)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <span className="text-[10px] font-black text-[#D36A47] uppercase tracking-widest">Detayı Görüntüle</span>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-[#D36A47] group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <Users size={32} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 uppercase">Hiç Taşeron Bulunamadı</h3>
                                <p className="text-slate-400 text-sm">Arama kriterlerinizi değiştirmeyi veya yeni bir taşeron eklemeyi deneyin.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>

            <NewSubcontractorModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={(newSub) => {
                    setSubcontractors(prev => [{
                        ...newSub,
                        expertise: newSub.expertise || 'İnce Yapı / Dekorasyon',
                        activeJobs: 0,
                        balance: 0,
                        rating: '5.0'
                    }, ...prev]);
                }}
            />
        </div>
    );
};

export default Subcontractors;
