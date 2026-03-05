import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import { useAuth } from "../context/AuthContext";
import { api } from '../api/client';
import {
    Plus,
    Filter,
    CheckCircle,
    CheckSquare,
    Hammer,
    Layers,
    Clock,
    Pencil,
    Trash2,
    Search,
    Hash,
    CircleDollarSign,
    Ruler
} from 'lucide-react';
import LaborModal from '../modals/labors/LaborModal';

const unitOptions = ['m²', 'mt', 'm³', 'Saat', 'Adet'];

function Labors() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [labors, setLabors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('Tümü');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLabor, setSelectedLabor] = useState(null);
    const [selectedLabors, setSelectedLabors] = useState([]);

    const { user } = useAuth();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [laborsData, categoriesResponse] = await Promise.all([
                api.get('/labor'),
                api.get('/labor/categories')
            ]);
            setLabors(laborsData || []);
            setCategories(categoriesResponse?.categories || []);
        } catch (error) {
            console.error("Labors fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const filteredLabors = useMemo(() => {
        if (selectedFilter === 'Tümü') return labors;
        const categoryId = categories.find(c => c.name === selectedFilter)?.id;
        return labors.filter(l => l.category_id === categoryId);
    }, [labors, selectedFilter, categories]);

    const openAddModal = () => {
        setSelectedLabor(null);
        setIsModalOpen(true);
    };

    const openEditModal = (labor) => {
        setSelectedLabor(labor);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu işçilik kartını silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/labor/${id}`);
                await fetchData();
                setSelectedLabors(prev => prev.filter(lid => lid !== id));
            } catch (err) {
                console.error("Silme hatası:", err);
                alert("Silme işlemi sırasında hata oluştu.");
            }
        }
    };

    const handleSelectLabor = (id) => {
        setSelectedLabors(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        const currentLaborIds = filteredLabors.map(l => l.id);
        if (selectedLabors.length === currentLaborIds.length && selectedLabors.every(id => currentLaborIds.includes(id))) {
            setSelectedLabors([]);
        } else {
            setSelectedLabors(currentLaborIds);
        }
    };

    const handleDeleteSelected = async () => {
        if (window.confirm(`${selectedLabors.length} işçilik kartını silmek istediğinize emin misiniz?`)) {
            try {
                await Promise.all(selectedLabors.map(id => api.delete(`/labor/${id}`)));
                await fetchData();
                setSelectedLabors([]);
            } catch (err) {
                console.error("Toplu silme hatası:", err);
                alert("Bazı kayıtlar silinirken hata oluştu.");
            }
        }
    };

    const handleSave = async (formData) => {
        try {
            if (selectedLabor) {
                await api.put(`/labor/${selectedLabor.id}`, formData);
            } else {
                await api.post('/labor', formData);
            }
            await fetchData();
            setIsModalOpen(false);
        } catch (err) {
            console.error("Kaydetme hatası:", err);
            alert("İşlem sırasında hata oluştu: " + err.message);
        }
    };

    const columns = [
        {
            key: 'code',
            label: 'Kod',
            render: (val) => <span className="font-mono text-[11px] font-bold text-[#D36A47] bg-[#D36A47]/10 px-2 py-1 rounded-md">{val}</span>
        },
        {
            key: 'name',
            label: 'İşçilik Tanımı',
            render: (val, row) => {
                const category = categories.find(c => c.id === row.category_id);
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-[13px]">{val}</span>
                        <span className="text-[11px] text-slate-400 font-medium lowercase tracking-tight">{category?.name || '-'}</span>
                    </div>
                );
            }
        },
        {
            key: 'unit',
            label: 'Birim',
            render: (val) => (
                <div className="flex items-center gap-1.5 text-slate-500 text-[12px] font-medium">
                    <Ruler size={12} className="text-slate-400" />
                    <span>{val}</span>
                </div>
            )
        },
        {
            key: 'unit_price',
            label: 'Birim Fiyat',
            render: (val, row) => (
                <div className="flex items-center gap-1.5 font-bold text-slate-700 text-[13px]">
                    <CircleDollarSign size={14} className="text-emerald-500" />
                    <span>{new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2 }).format(val || 0)} {row.currency}</span>
                </div>
            )
        },
        {
            key: 'created_at',
            label: 'Oluşturulma',
            render: (val) => (
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Clock size={12} />
                    <span>{new Date(val).toLocaleDateString('tr-TR')}</span>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'İşlemler',
            sortable: false,
            align: 'center',
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => openEditModal(row)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Düzenle"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Sil"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const filterOptions = ['Tümü', ...categories.map(c => c.name)];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={closeMobileMenu} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="İşçilik Tanımlama" toggleMobileMenu={toggleMobileMenu} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-6">

                    {/* ═════════════════ HEADER BANNER ═════════════════ */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1128] via-[#0A1128] to-[#1E293B] rounded-[32px] p-6 md:p-10 text-white animate-fade-in shadow-2xl shadow-[#0A1128]/20">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D36A47]/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-[100px]" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-[80px]" />

                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="animate-slide-up">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-[#D36A47] flex items-center justify-center shadow-lg shadow-[#D36A47]/30 border border-white/10">
                                        <Hammer size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">İşçilik Kütüphanesi</h1>
                                        <p className="text-white/50 text-sm font-medium">Birim fiyat ve hizmet maliyet yönetimi</p>
                                    </div>
                                </div>
                                <div className="flex gap-8">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-white">{labors.length}</span>
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Kayıtlı İşçilik</span>
                                    </div>
                                    <div className="w-px h-10 bg-white/10" />
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-white">{categories.length}</span>
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">İş Grubu</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={openAddModal}
                                className="flex items-center gap-3 text-sm font-black text-white bg-[#D36A47] hover:bg-[#E37A57] shadow-xl shadow-[#D36A47]/20 px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 animate-slide-up"
                                style={{ animationDelay: '100ms' }}
                            >
                                <Plus size={20} />
                                <span>YENİ İŞÇİLİK TANIMLA</span>
                            </button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="relative" ref={filterRef}>
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 px-5 py-3 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <Filter size={16} />
                                <span>İş Grubu: {selectedFilter}</span>
                            </button>
                            {isFilterOpen && (
                                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden animate-scale-in">
                                    <div className="p-2">
                                        {filterOptions.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { setSelectedFilter(opt); setIsFilterOpen(false); }}
                                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedFilter === opt ? 'bg-[#0A1128] text-white font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Selection Action Bar */}
                    {selectedLabors.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#D36A47]/5 border border-[#D36A47]/20 p-4 rounded-xl animate-fade-in gap-3">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center bg-[#D36A47] text-white w-7 h-7 rounded-lg text-xs font-bold shadow-lg shadow-[#D36A47]/30">
                                    {selectedLabors.length}
                                </span>
                                <span className="text-sm font-bold text-[#D36A47]">kayıt seçildi</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                <button onClick={handleSelectAll} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-all px-4 py-2 rounded-lg border border-slate-200">
                                    <CheckSquare size={14} />
                                    <span>{selectedLabors.length === filteredLabors.length ? 'Seçimi Temizle' : 'Tümünü Seç'}</span>
                                </button>
                                <button onClick={handleDeleteSelected} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 px-4 py-2 rounded-lg border border-red-100 transition-all">
                                    <Trash2 size={14} /> <span>Seçilenleri Sil</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Data Table */}
                    <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <DataTable
                            columns={columns}
                            data={filteredLabors}
                            loading={loading}
                            selectable={true}
                            selectedRows={selectedLabors}
                            onSelect={handleSelectLabor}
                            pageSize={10}
                            searchPlaceholder="İşçilik adı veya kodu ile ara..."
                            rowKey="id"
                            emptyMessage="Henüz işçilik kartı tanımlanmamış."
                        />
                    </div>
                </div>

                <LaborModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    labor={selectedLabor}
                    onSave={handleSave}
                    categories={categories}
                    units={unitOptions}
                />
            </main>
        </div>
    );
}

export default Labors;
