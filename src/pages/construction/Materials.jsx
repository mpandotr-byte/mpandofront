import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import { useAuth } from "../../context/AuthContext";
import { api } from '../../api/client';
import {
    Plus,
    Filter,
    CheckCircle,
    CheckSquare,
    Package,
    Layers,
    Truck,
    Box,
    Pencil,
    Trash2,
    ChevronRight,
    Info,
    Ruler,
    Weight,
    Clock,
    Building2,
    Search
} from 'lucide-react';
import MaterialModal from '../../modals/materials/MaterialModal';

const materialCategories = ['Kaba', 'İnce', 'Elektrik', 'Mekanik', 'Mobilya'];
const unitOptions = ['m²', 'm³', 'kg', 'mt', 'Adet', 'Set'];

const filterOptions = ['Tümü', ...materialCategories];

function Materials() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('Tümü');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    const { user } = useAuth();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [materialsData, suppliersData] = await Promise.all([
                api.get('/materials/catalog'),
                api.get('/suppliers')
            ]);
            setMaterials(materialsData || []);
            setSuppliers(suppliersData || []);
        } catch (error) {
            console.error("Materials fetch error:", error);
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

    const filteredMaterials = useMemo(() => {
        if (selectedFilter === 'Tümü') return materials;
        return materials.filter(m => m.category === selectedFilter);
    }, [materials, selectedFilter]);

    const openAddModal = () => {
        setSelectedMaterial(null);
        setIsModalOpen(true);
    };

    const openEditModal = (material) => {
        setSelectedMaterial(material);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu malzemeyi silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/materials/catalog/${id}`);
                await fetchData();
                setSelectedMaterials(prev => prev.filter(mid => mid !== id));
            } catch (err) {
                console.error("Silme hatası:", err);
                alert("Silme işlemi sırasında hata oluştu.");
            }
        }
    };

    const handleSelectMaterial = (id) => {
        setSelectedMaterials(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        const currentMaterialIds = filteredMaterials.map(m => m.id);
        if (selectedMaterials.length === currentMaterialIds.length && selectedMaterials.every(id => currentMaterialIds.includes(id))) {
            setSelectedMaterials([]);
        } else {
            setSelectedMaterials(currentMaterialIds);
        }
    };

    const handleDeleteSelected = async () => {
        if (window.confirm(`${selectedMaterials.length} malzemeyi silmek istediğinize emin misiniz?`)) {
            try {
                await Promise.all(selectedMaterials.map(id => api.delete(`/materials/catalog/${id}`)));
                await fetchData();
                setSelectedMaterials([]);
            } catch (err) {
                console.error("Toplu silme hatası:", err);
                alert("Bazı malzemeler silinirken hata oluştu.");
            }
        }
    };

    const handleSave = async (formData) => {
        try {
            if (selectedMaterial) {
                await api.put(`/materials/catalog/${selectedMaterial.id}`, formData);
            } else {
                await api.post('/materials/catalog', formData);
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
            label: 'Malzeme Adı',
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-[13px]">{val}</span>
                    <span className="text-[11px] text-slate-400 font-medium lowercase tracking-tight">{row.category}</span>
                </div>
            )
        },
        {
            key: 'supplier_id',
            label: 'Tedarikçi',
            render: (val) => {
                const supplier = suppliers.find(s => s.id === val);
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                            <Building2 size={14} />
                        </div>
                        <span className="text-slate-600 text-[13px] font-medium">{supplier?.name || '-'}</span>
                    </div>
                );
            }
        },
        {
            key: 'dimensions',
            label: 'Boyutlar (cm)',
            render: (_, row) => (
                <span className="text-slate-500 text-[12px]">
                    {row.width_cm}x{row.length_cm} / {row.thickness_mm}mm
                </span>
            )
        },
        {
            key: 'weight_per_unit',
            label: 'Ağırlık (Birim)',
            render: (val, row) => (
                <span className="text-slate-600 text-[12px] font-semibold">
                    {val} kg/{row.unit}
                </span>
            )
        },
        {
            key: 'pallet_info',
            label: 'Palet Kapasitesi',
            render: (_, row) => (
                <div className="flex flex-col">
                    <span className="text-slate-700 text-[12px] font-bold">{row.pallet_content_m2} {row.unit}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{row.pallet_box_count} Kutu</span>
                </div>
            )
        },
        {
            key: 'lead_time_days',
            label: 'Termin',
            render: (val) => (
                <div className="flex items-center gap-1.5 text-slate-500 text-[12px]">
                    <Clock size={12} className="text-[#D36A47]" />
                    <span>{val} Gün</span>
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

    const activeMaterialsCount = materials.length;
    const categoriesCount = new Set(materials.map(m => m.category)).size;

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={closeMobileMenu} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Malzeme Tanımlama" toggleMobileMenu={toggleMobileMenu} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-6">

                    {/* ═════════════════ HEADER BANNER ═════════════════ */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1128] via-[#0D1630] to-[#0A1128] rounded-3xl p-6 md:p-10 text-white animate-fade-in shadow-2xl shadow-slate-900/20">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D36A47]/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-[100px]" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-[80px]" />

                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="animate-slide-up">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                                        <Package size={24} className="text-[#D36A47]" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Malzeme Kütüphanesi</h1>
                                        <p className="text-white/50 text-sm font-medium">Firma lojistik ve teknik malzeme genetiği</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-white">{activeMaterialsCount}</span>
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Kayıtlı Malzeme</span>
                                    </div>
                                    <div className="w-px h-10 bg-white/10" />
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-white">{categoriesCount}</span>
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Kategori</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
                                <button
                                    onClick={openAddModal}
                                    className="flex items-center gap-2 text-sm font-black text-white bg-[#D36A47] hover:bg-[#E37A57] shadow-xl shadow-[#D36A47]/20 px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95"
                                >
                                    <Plus size={20} />
                                    <span>YENİ MALZEME TANIMLA</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filtering & Search Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="relative" ref={filterRef}>
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 px-5 py-3 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    <Filter size={16} />
                                    <span>Kategori: {selectedFilter}</span>
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
                    </div>

                    {/* Selection Action Bar */}
                    {selectedMaterials.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#D36A47]/5 border border-[#D36A47]/20 p-4 rounded-xl animate-fade-in gap-3">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center bg-[#D36A47] text-white w-7 h-7 rounded-lg text-xs font-bold shadow-lg shadow-[#D36A47]/30">
                                    {selectedMaterials.length}
                                </span>
                                <span className="text-sm font-bold text-[#D36A47]">malzeme seçildi</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                <button onClick={handleSelectAll} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-all px-4 py-2 rounded-lg border border-slate-200">
                                    <CheckSquare size={14} />
                                    <span>{selectedMaterials.length === filteredMaterials.length ? 'Seçimi Temizle' : 'Tümünü Seç'}</span>
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
                            data={filteredMaterials}
                            loading={loading}
                            selectable={true}
                            selectedRows={selectedMaterials}
                            onSelect={handleSelectMaterial}
                            pageSize={10}
                            searchPlaceholder="Malzeme adı veya kodu ile ara..."
                            rowKey="id"
                            emptyMessage="Henüz malzeme tanımlanmamış."
                        />
                    </div>
                </div>

                <MaterialModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    material={selectedMaterial}
                    onSave={handleSave}
                    suppliers={suppliers}
                    categories={materialCategories}
                    units={unitOptions}
                />
            </main>
        </div>
    );
}

export default Materials;
