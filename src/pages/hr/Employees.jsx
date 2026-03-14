import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import { api } from '../../api/client';
import {
    Plus,
    Filter,
    Search,
    UserPlus,
    Building2,
    Star,
    Briefcase,
    ChevronRight,
    SearchCheck,
    MapPin,
    Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmployeeModal from '../../modals/hr/EmployeeModal';

const branches = ['Demirci', 'Kalıpçı', 'Alçıcı', 'Elektrikçi', 'Sıvacı', 'Boyacı', 'Mekanikçi', 'Seramikçi'];

export default function Employees() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [subcontractors, setSubcontractors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('Tümü');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const filterRef = useRef(null);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [empData, subData] = await Promise.all([
                api.get('/hr/employees'),
                api.get('/subcontractors')
            ]);
            setEmployees(empData || []);
            setSubcontractors(subData || []);
        } catch (error) {
            console.error("HR fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = (newEmployee) => {
        fetchData();
        setIsModalOpen(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredEmployees = useMemo(() => {
        if (selectedFilter === 'Tümü') return employees;
        return employees.filter(e => e.branch === selectedFilter);
    }, [employees, selectedFilter]);

    const columns = [
        {
            key: 'name',
            label: 'İşçi Adı Soyadı',
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                        {val ? val.charAt(0) : '?'}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-[14px]">{val} {row.surname}</span>
                        <span className="text-[11px] text-slate-400 font-medium">TC: {row.identity_number || 'Belirtilmedi'}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'branch',
            label: 'Branş',
            render: (val) => (
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-black uppercase tracking-wider">
                        {val}
                    </div>
                </div>
            )
        },
        {
            key: 'subcontractor',
            label: 'Bağlı Taşeron',
            render: (_, row) => {
                const sub = subcontractors.find(s => s.id === row.company_id);
                return (
                    <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-slate-300" />
                        <span className="text-[13px] font-medium text-slate-600">{sub?.name || 'Direkt Personel'}</span>
                    </div>
                );
            }
        },
        {
            key: 'active_project',
            label: 'Aktif Şantiye',
            render: (val) => (
                <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#D36A47]" />
                    <span className="text-[12px] font-bold text-slate-700">{val || 'Boşta'}</span>
                </div>
            )
        },
        {
            key: 'rating',
            label: 'Puan',
            render: (val) => (
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star
                            key={star}
                            size={12}
                            className={star <= (val || 0) ? "fill-orange-400 text-orange-400" : "text-slate-200"}
                        />
                    ))}
                    <span className="ml-1 text-[11px] font-black text-slate-400">{val || 0}.0</span>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'İşlemler',
            align: 'right',
            render: (_, row) => (
                <button
                    onClick={() => navigate(`/employees/${row.id}`)}
                    className="p-2 hover:bg-[#D36A47]/10 text-slate-400 hover:text-[#D36A47] rounded-xl transition-all group"
                >
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
            )
        }
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="İK & Personel Yönetimi" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-6">
                    {/* Header Banner */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#0A1128] via-[#1E293B] to-[#0A1128] rounded-[40px] p-8 md:p-12 text-white shadow-2xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D36A47]/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-[100px]" />

                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-[#D36A47] flex items-center justify-center shadow-xl shadow-[#D36A47]/30 border border-white/10">
                                        <Users size={32} className="text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black tracking-tight uppercase">İşçi Havuzu</h1>
                                        <p className="text-white/50 text-sm font-medium tracking-wide">Dijital Kimlik ve Performans Takip Sistemi</p>
                                    </div>
                                </div>
                                <div className="flex gap-10">
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-black">{employees.length}</span>
                                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Toplam Personel</span>
                                    </div>
                                    <div className="w-px h-12 bg-white/10" />
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-black text-[#D36A47]">{employees.filter(e => e.active_project).length}</span>
                                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Aktif Sahada</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="group relative flex items-center gap-4 px-10 py-5 bg-white text-[#0A1128] rounded-3xl font-black uppercase tracking-wider text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all"
                            >
                                <UserPlus size={20} />
                                YENİ İŞÇİ KAYDI
                            </button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="relative" ref={filterRef}>
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="flex items-center gap-3 text-sm font-black text-slate-600 bg-white border border-slate-200 px-6 py-4 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    <Filter size={18} />
                                    <span>BRANŞ: {selectedFilter}</span>
                                </button>
                                {isFilterOpen && (
                                    <div className="absolute top-full left-0 mt-3 w-64 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 p-2 animate-scale-in">
                                        <button
                                            onClick={() => { setSelectedFilter('Tümü'); setIsFilterOpen(false); }}
                                            className="w-full text-left px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 text-slate-500"
                                        >
                                            Tümü
                                        </button>
                                        {branches.map(b => (
                                            <button
                                                key={b}
                                                onClick={() => { setSelectedFilter(b); setIsFilterOpen(false); }}
                                                className={`w-full text-left px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedFilter === b ? 'bg-[#D36A47] text-white shadow-lg' : 'hover:bg-slate-50 text-slate-500'}`}
                                            >
                                                {b}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-2 bg-[#D36A47]/10 px-6 py-4 rounded-2xl border border-[#D36A47]/20">
                            <SearchCheck size={18} className="text-[#D36A47]" />
                            <span className="text-[11px] font-black text-[#D36A47] uppercase tracking-[0.1em]">Gelişmiş Filtreleme Aktif</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                        <DataTable
                            columns={columns}
                            data={filteredEmployees}
                            loading={loading}
                            pageSize={10}
                            rowKey="id"
                            searchPlaceholder="İsim veya Kimlik No ile ara..."
                        />
                    </div>
                </div>

                <EmployeeModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    subcontractors={subcontractors}
                />
            </main>
        </div>
    );
}
