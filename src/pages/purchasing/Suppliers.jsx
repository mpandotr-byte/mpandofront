import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import {
    Users,
    Truck,
    Wallet,
    Building2,
    Plus,
    Search,
    ChevronRight,
    Star,
    Activity
} from 'lucide-react';

import SupplierModal from '../../modals/purchasing/SupplierModal';

const Suppliers = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            // New endpoint specifically for suppliers
            const data = await api.get('/suppliers');

            const enrichedData = (data || []).map(item => ({
                ...item,
                category: Array.isArray(item.category_tags) ? item.category_tags.join(', ') : (item.category || 'Genel Tedarikçi'),
                activeOrders: item.activeOrders || 0,
                balance: item.balance || 0,
                rating: item.rating || '5.0'
            }));
            setSuppliers(enrichedData);
        } catch (err) {
            console.error("Suppliers fetch error:", err);
            setSuppliers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSupplier = (newSupplier) => {
        fetchSuppliers();
        setIsAddModalOpen(false);
    };

    const filtered = suppliers.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={closeMobileMenu} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Tedarikçi Yönetimi" toggleMobileMenu={toggleMobileMenu} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-6">

                    {/* Header Section */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1128] via-[#0A1128] to-[#1E293B] rounded-[32px] p-6 md:p-10 text-white animate-fade-in shadow-2xl shadow-[#0A1128]/20">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D36A47]/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-[100px]" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-[80px]" />

                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="animate-slide-up">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-[#D36A47] flex items-center justify-center shadow-lg shadow-[#D36A47]/30 border border-white/10">
                                        <Truck size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Tedarikçi Yönetimi</h1>
                                        <p className="text-white/50 text-sm font-medium">Malzeme tedarik ettiğiniz çözüm ortaklarını yönetin</p>
                                    </div>
                                </div>
                                <div className="flex gap-8">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-white">{suppliers.length}</span>
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Kayıtlı Tedarikçi</span>
                                    </div>
                                    <div className="w-px h-10 bg-white/10" />
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-white">
                                            {suppliers.reduce((acc, curr) => acc + (curr.activeOrders || 0), 0)}
                                        </span>
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Aktif Sipariş</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center gap-3 text-sm font-black text-white bg-[#D36A47] hover:bg-[#E37A57] shadow-xl shadow-[#D36A47]/20 px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 animate-slide-up"
                            >
                                <Plus size={20} />
                                <span>YENİ TEDARİKÇİ EKLE</span>
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D36A47] transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Tedarikçi adı veya kategori ara..."
                                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D36A47]/20 focus:border-[#D36A47] transition-all text-sm shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Suppliers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-[32px] p-6 h-64 animate-pulse border border-slate-100" />
                            ))
                        ) : filtered.length > 0 ? (
                            filtered.map((s) => (
                                <div
                                    key={s.id}
                                    onClick={() => navigate(`/suppliers/${s.id}`)}
                                    className="bg-white rounded-[32px] p-7 border border-white shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#D36A47] border border-slate-100 group-hover:bg-[#D36A47] group-hover:text-white transition-all duration-300">
                                            <Building2 size={24} />
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-xl text-amber-600">
                                            <Star size={12} fill="currentColor" />
                                            <span className="text-xs font-black">{s.rating || '5.0'}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase mb-1 truncate">{s.name}</h3>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">{s.category}</p>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                            <div className="flex items-center gap-2 mb-1 text-slate-400">
                                                <Activity size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Aktif Sipariş</span>
                                            </div>
                                            <span className="text-sm font-black text-slate-900">{s.activeOrders} Sipariş</span>
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
                                        <span className="text-[10px] font-black text-[#D36A47] uppercase tracking-widest">Kartı Görüntüle</span>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-[#D36A47] group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <Building2 size={32} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 uppercase">Hiç Tedarikçi Bulunamadı</h3>
                                <p className="text-slate-400 text-sm">Arama kriterlerinizi değiştirmeyi veya yeni bir tedarikçi eklemeyi deneyin.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>

            {/* New Supplier Modal */}
            <SupplierModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveSupplier}
            />
        </div>
    );
};

export default Suppliers;
