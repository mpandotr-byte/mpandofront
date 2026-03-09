import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import { api } from '../../api/client';
import {
    Plus,
    FileText,
    Layers,
    Clock,
    Pencil,
    Trash2,
    Search,
    ChevronRight,
    Package,
    Hammer,
    Box,
    Layout,
    BarChart3,
    CheckCircle2
} from 'lucide-react';
import RecipeModal from '../../modals/recipes/RecipeModal';

import RecipeConsole from './RecipeConsole';
import QuantitySummary from './QuantitySummary';

function Recipes() {
    const [activeTab, setActiveTab] = useState('library'); // 'library', 'console', 'summary', or 'progress'
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [recipes, setRecipes] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [labors, setLabors] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);


    const fetchData = async () => {
        setLoading(true);
        try {
            const [recipesData, materialsData, laborsData] = await Promise.all([
                api.get('/recipes'),
                api.get('/materials/catalog'),
                api.get('/labor')
            ]);
            setRecipes(recipesData || []);
            setMaterials(materialsData || []);
            setLabors(laborsData || []);
        } catch (error) {
            console.error("Recipes fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const handleDelete = async (id) => {
        if (window.confirm('Bu reçeteyi silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/recipes/${id}`);
                await fetchData();
            } catch (err) {
                console.error("Silme hatası:", err);
                alert("Silme işlemi sırasında hata oluştu.");
            }
        }
    };

    const handleSave = async (formData) => {
        try {
            if (selectedRecipe) {
                await api.put(`/recipes/${selectedRecipe.id}`, formData);
            } else {
                await api.post('/recipes', formData);
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
            label: 'Reçete Adı',
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-[13px]">{val}</span>
                    <span className="text-[11px] text-slate-400 font-medium line-clamp-1">{row.description || '-'}</span>
                </div>
            )
        },
        {
            key: 'base_unit',
            label: 'Birim',
            render: (val) => <span className="text-[12px] font-bold text-slate-600">1 {val}</span>
        },
        {
            key: 'components',
            label: 'Bileşenler',
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                        <Package size={12} /> {row.recipe_materials?.length || 0} Malzeme
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                        <Hammer size={12} /> {row.recipe_labors?.length || 0} İşçilik
                    </div>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'İşlemler',
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <button onClick={() => { setSelectedRecipe(row); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={closeMobileMenu} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Reçete & İmalat Analizi" toggleMobileMenu={toggleMobileMenu} />

                <div className="px-4 sm:px-6 md:px-8 pb-8 pt-4 md:pt-6 space-y-6 h-[calc(100vh-80px)] overflow-y-auto">

                    {/* Tab Navigation */}
                    <div className="flex p-1 bg-white border border-slate-200 rounded-2xl w-full md:w-fit shadow-sm overflow-x-auto no-scrollbar">
                        <div className="flex flex-nowrap min-w-max">
                            <button
                                onClick={() => setActiveTab('library')}
                                className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${activeTab === 'library' ? 'bg-[#0A1128] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <FileText size={16} /> REÇETE KÜTÜPHANESİ
                            </button>
                            <button
                                onClick={() => setActiveTab('console')}
                                className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${activeTab === 'console' ? 'bg-[#0A1128] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Layout size={16} /> METRAJ ATAMA KONSOLU
                            </button>
                            <button
                                onClick={() => setActiveTab('summary')}
                                className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${activeTab === 'summary' ? 'bg-[#0A1128] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <BarChart3 size={16} /> METRAJ ÖZETİ
                            </button>
                            <button
                                onClick={() => setActiveTab('progress')}
                                className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${activeTab === 'progress' ? 'bg-[#D36A47] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <CheckCircle2 size={16} /> İMALAT ONAY
                            </button>
                        </div>
                    </div>

                    {activeTab === 'library' && (
                        <>
                            {/* Header Banner */}
                            <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1128] via-[#0A1128] to-[#1E293B] rounded-[32px] p-6 md:p-10 text-white animate-fade-in shadow-2xl shadow-[#0A1128]/20">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-[#D36A47]/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-[100px]" />
                                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                    <div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-14 h-14 rounded-2xl bg-[#D36A47] flex items-center justify-center shadow-lg shadow-[#D36A47]/30 border border-white/10">
                                                <FileText size={28} className="text-white" />
                                            </div>
                                            <div>
                                                <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Reçete Kütüphanesi</h1>
                                                <p className="text-white/50 text-sm font-medium">Birim imalat analizleri ve metraj motoru</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-8">
                                            <div className="flex flex-col">
                                                <span className="text-2xl font-black text-white">{recipes.length}</span>
                                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Kayıtlı Reçete</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-3 animate-slide-up" style={{ animationDelay: '100ms' }}>

                                        <button onClick={() => { setSelectedRecipe(null); setIsModalOpen(true); }} className="w-full md:w-auto flex items-center justify-center gap-3 text-sm font-black text-white bg-[#D36A47] hover:bg-[#E37A57] shadow-xl shadow-[#D36A47]/20 px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 uppercase tracking-wider">
                                            <Plus size={20} /> YENİ ANALİZ OLUŞTUR
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                                <DataTable
                                    columns={columns}
                                    data={recipes}
                                    loading={loading}
                                    pageSize={10}
                                    searchPlaceholder="Reçete adı veya kodu ile ara..."
                                    rowKey="id"
                                    emptyMessage="Henüz reçete tanımlanmamış."
                                />
                            </div>
                        </>
                    )}

                    {activeTab === 'console' && (
                        <div className="animate-fade-in">
                            <RecipeConsole isSubPage={true} />
                        </div>
                    )}

                    {activeTab === 'summary' && (
                        <div className="animate-fade-in">
                            <QuantitySummary isSubPage={true} />
                        </div>
                    )}

                    {activeTab === 'progress' && (
                        <div className="animate-fade-in bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm min-h-[500px] flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 rounded-[32px] bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Saha İmalat Onay Sistemi</h2>
                            <p className="max-w-md text-slate-400 text-sm font-medium mt-4 leading-relaxed italic">
                                Bu ekrandan biten oda, kat veya bloğu onaylayarak; <br />atandığı reçeteye göre malzemelerin stoktan <br />otomatik düşmesini sağlayabilirsiniz.
                            </p>
                            <button className="mt-10 px-10 py-5 bg-[#0A1128] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">
                                ONAY LİSTESİNİ GÖRÜNTÜLE
                            </button>
                        </div>
                    )}
                </div>

                <RecipeModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    recipe={selectedRecipe}
                    onSave={handleSave}
                    materials={materials}
                    labors={labors}
                />
            </main>
        </div>
    );
}

export default Recipes;
