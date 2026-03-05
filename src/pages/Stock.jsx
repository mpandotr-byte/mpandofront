import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import { api } from '../api/client';
import {
    Box,
    Truck,
    Package,
    Clock,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownLeft,
    ChevronRight,
    Building2,
    Calendar,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

export default function Stock() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'expected'

    const [inventory, setInventory] = useState([]);
    const [expectedMaterials, setExpectedMaterials] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch expected materials from API
                const purchaseRequests = await api.get('/inventory/purchase-requests?status=ORDERED');

                const expected = (purchaseRequests || []).map(r => ({
                    id: r.id,
                    name: r.materials?.name || r.material_name,
                    project: r.projects?.name || r.project_name,
                    quantity: r.quantity,
                    unit: r.materials?.unit || 'm²',
                    date: r.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                    supplier: r.offers?.find(o => o.status === 'ACCEPTED')?.supplier_id || 'Belli Değil',
                    status: 'Yolda / Hazırlanıyor'
                }));
                setExpectedMaterials(expected);

                // Mock current inventory (Actual endpoint not specified yet)
                setInventory([
                    { id: 1, name: '60x120 Seramik - Antrasit', category: 'İnce Yapı', quantity: 1540, unit: 'm²', warehouse: 'Merkez Depo' },
                    { id: 2, name: 'Hazır Beton C30', category: 'Kaba Yapı', quantity: 240, unit: 'm³', warehouse: 'Şantiye-1' },
                    { id: 3, name: 'Sıva Filesi 145gr/m2', category: 'İnce Yapı', quantity: 4500, unit: 'mt', warehouse: 'Merkez Depo' },
                    { id: 4, name: 'Elektrik Kablosu 3x2.5', category: 'Elektrik', quantity: 12000, unit: 'mt', warehouse: 'Merkez Depo' }
                ]);
            } catch (error) {
                console.error("Stock data fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={closeMobileMenu} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Stok ve Depo Yönetimi" toggleMobileMenu={toggleMobileMenu} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-6">

                    {/* Header Banner */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1128] via-[#111A35] to-[#0A1128] rounded-[32px] p-8 md:p-12 text-white shadow-2xl animate-fade-in border border-white/5">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#D36A47]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />

                        <div className="relative flex flex-col md:flex-row justify-between items-end gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-[#D36A47] flex items-center justify-center shadow-lg shadow-[#D36A47]/20 border border-white/10">
                                        <Box size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black tracking-tight uppercase">Stok <span className="text-[#D36A47]">Kütüphanesi</span></h1>
                                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-0.5">Gerçek Zamanlı Envanter Takibi</p>
                                    </div>
                                </div>
                                <div className="flex gap-10">
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-black text-white">{inventory.length}</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kritik Stok</span>
                                    </div>
                                    <div className="w-px h-10 bg-white/10" />
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-black text-[#D36A47]">{expectedMaterials.length}</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Beklenen Sevkiyat</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                                <button
                                    onClick={() => setActiveTab('inventory')}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'inventory' ? 'bg-white text-[#0A1128] shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <Package size={16} /> MEVCUT STOK
                                </button>
                                <button
                                    onClick={() => setActiveTab('expected')}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'expected' ? 'bg-white text-[#0A1128] shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <Truck size={16} /> BEKLENEN MALZEMELER
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    {activeTab === 'inventory' ? (
                        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 animate-in fade-in duration-500">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">ENVANTER LİSTESİ</h3>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input type="text" placeholder="Malzeme ara..." className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none transition-all w-64" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {inventory.map(item => (
                                    <div key={item.id} className="p-6 rounded-[28px] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <Package size={20} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.warehouse}</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black text-[#D36A47] uppercase tracking-widest">{item.category}</p>
                                                <h4 className="font-black text-slate-900 line-clamp-1">{item.name}</h4>
                                            </div>
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <p className="text-2xl font-black text-slate-900">{item.quantity}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mevcut Miktar ({item.unit})</p>
                                                </div>
                                                <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><ArrowUpRight size={20} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight px-2">BEKLENEN SEVKİYATLAR</h3>
                            <div className="space-y-4">
                                {expectedMaterials.length > 0 ? (
                                    expectedMaterials.map(item => (
                                        <div key={item.id} className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all border-l-4 border-l-emerald-500">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-[20px] bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                                    <Truck size={32} />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-black uppercase tracking-widest">YOLDA</span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.project}</span>
                                                    </div>
                                                    <h4 className="text-xl font-black text-slate-900">{item.name}</h4>
                                                    <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                                        <Building2 size={14} /> Tedarikçi: {item.supplier}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-12">
                                                <div className="text-center">
                                                    <p className="text-2xl font-black text-slate-800">{item.quantity}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Miktar ({item.unit})</p>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-slate-600">
                                                        <Calendar size={14} /> {item.date}
                                                    </div>
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Planlanan Teslimat</p>
                                                </div>
                                                <button className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:bg-[#D36A47] hover:text-white transition-all">
                                                    <ChevronRight size={24} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 bg-white rounded-[32px] border-2 border-dashed border-slate-200 text-center space-y-4">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                            <Truck size={40} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-slate-400 uppercase tracking-tight">Beklenen Malzeme Yok</p>
                                            <p className="text-sm text-slate-300 font-medium">Satın alma anlaşılan talepler burada listelenir.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Stock Summary Alerts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-amber-50 rounded-[28px] border border-amber-100 flex items-center gap-4 text-amber-900 animate-slide-up">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight">Kritik Stok Uyarısı</p>
                                        <p className="text-xs font-semibold opacity-70">5 Kalem malzemenin stok seviyesi belirlenen limitin altında.</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-emerald-50 rounded-[28px] border border-emerald-100 flex items-center gap-4 text-emerald-900 animate-slide-up" style={{ animationDelay: '100ms' }}>
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight">Sevkiyat Tamamlandı</p>
                                        <p className="text-xs font-semibold opacity-70">Bugün 2 farklı şantiyeye malzeme girişi onaylandı.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
