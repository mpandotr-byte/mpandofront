import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import { api } from '../../api/client';
import * as XLSX from 'xlsx';
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
    CheckCircle2,
    Plus,
    History,
    Activity,
    User,
    ClipboardList,
    AlertTriangle,
    FileDown,
    Download
} from 'lucide-react';
import MaterialEntryModal from '../../modals/materials/MaterialEntryModal';

export default function Stock() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'entry', 'consumption'

    const [stockSummary, setStockSummary] = useState([]);
    const [movements, setMovements] = useState([]);
    const [consumptionReport, setConsumptionReport] = useState([]);
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

    // Filtering states for Harcananlar
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'summary') {
                const data = await api.get('/inventory/status/summary');
                setStockSummary(data || []);
            } else if (activeTab === 'entry') {
                const data = await api.get('/inventory/movements?type=ENTRY');
                setMovements(data || []);
            } else if (activeTab === 'consumption') {
                const data = await api.get('/inventory/reports/consumption');
                setConsumptionReport(data || []);
            }
        } catch (error) {
            console.error("Stock data fetch error:", error);
            if (activeTab === 'summary') setStockSummary([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtered summary data
    const filteredSummary = useMemo(() => {
        return stockSummary.filter(item => {
            const name = item.name || item.material_name || '';
            const code = item.code || '';
            return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                code.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [stockSummary, searchQuery]);

    // Filtered consumption data
    const filteredConsumption = useMemo(() => {
        return consumptionReport.filter(item => {
            const matchesMaterial = (item.material_name || item.name || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSub = (item.subcontractor_name || '').toLowerCase().includes(searchQuery.toLowerCase());

            const itemDate = new Date(item.date);
            const matchesStart = !dateRange.start || itemDate >= new Date(dateRange.start);
            const matchesEnd = !dateRange.end || itemDate <= new Date(dateRange.end);

            return matchesMaterial && matchesSub && matchesStart && matchesEnd;
        });
    }, [consumptionReport, searchQuery, dateRange]);

    const handleExportExcel = () => {
        if (filteredConsumption.length === 0) {
            alert("Dışa aktarılacak veri bulunamadı.");
            return;
        }

        const exportData = filteredConsumption.map(item => ({
            'Malzeme Adı': item.material_name || item.name,
            'Miktar': item.quantity,
            'Birim': item.unit,
            'Lokasyon': item.location || 'Bina Geneli',
            'Taşeron': item.subcontractor_name,
            'Tarih': new Date(item.date).toLocaleDateString('tr-TR'),
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Harcanan Malzemeler");

        // Finalize export
        XLSX.writeFile(workbook, `Mpando_Harcanan_Malzemeler_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={closeMobileMenu} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Stok ve Envanter Yönetimi" toggleMobileMenu={toggleMobileMenu} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-6">

                    {/* Dashboard Header */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1128] via-[#111A35] to-[#0A1128] rounded-[40px] p-8 md:p-10 text-white shadow-2xl animate-fade-in border border-white/5">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D36A47]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px]" />

                        <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-3xl bg-[#D36A47] flex items-center justify-center shadow-2xl shadow-[#D36A47]/30 border border-white/10">
                                    <Box size={32} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black tracking-tight uppercase">Saha <span className="text-[#D36A47]">Envanter</span></h1>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Stok Girişi, Zimmet ve Tüketim Takibi</p>
                                </div>
                            </div>

                            <div className="flex p-1.5 bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 shadow-inner">
                                <button
                                    onClick={() => setActiveTab('summary')}
                                    className={`flex items-center gap-2 px-6 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'summary' ? 'bg-white text-[#0A1128] shadow-2xl' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <Activity size={16} /> MEVCUT ENVANTER
                                </button>
                                <button
                                    onClick={() => setActiveTab('entry')}
                                    className={`flex items-center gap-2 px-6 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'entry' ? 'bg-white text-[#0A1128] shadow-2xl' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <Truck size={16} /> MALZEME GİRİŞİ
                                </button>
                                <button
                                    onClick={() => setActiveTab('consumption')}
                                    className={`flex items-center gap-2 px-6 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'consumption' ? 'bg-white text-[#0A1128] shadow-2xl' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <History size={16} /> HARCANANLAR
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tab Content: Summary */}
                    {activeTab === 'summary' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Depo Mevcudu</p>
                                        <h3 className="text-3xl font-black text-slate-900">{stockSummary.length} <span className="text-xs text-slate-400 font-bold ml-1">KALEM</span></h3>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <Package size={28} />
                                    </div>
                                </div>
                                <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Taşeron Zimmeti</p>
                                        <h3 className="text-3xl font-black text-slate-900">
                                            {stockSummary.filter(s => (s.subcontractor_quantity || s.assigned_qty) > 0).length} <span className="text-xs text-slate-400 font-bold ml-1">SAHADA</span>
                                        </h3>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                                        <ClipboardList size={28} />
                                    </div>
                                </div>
                                <div className="bg-[#D36A47]/10 p-7 rounded-[32px] border border-[#D36A47]/20 flex items-center justify-between animate-pulse">
                                    <div>
                                        <p className="text-[10px] font-black text-[#D36A47] uppercase tracking-widest mb-2">Kritik Seviye</p>
                                        <h3 className="text-3xl font-black text-[#D36A47]">
                                            {stockSummary.filter(s => s.is_critical).length} <span className="text-xs font-bold ml-1 uppercase">UYARI</span>
                                        </h3>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-[#D36A47] text-white flex items-center justify-center shadow-lg shadow-[#D36A47]/20">
                                        <AlertTriangle size={28} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[40px] p-8 border border-white shadow-xl shadow-slate-200/40">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Vidalı & Depo Durumu</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tüm malzemelerin şantiye ve depo dağılımı</p>
                                    </div>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D36A47]" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Malzeme adı veya kod ara..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white outline-none ring-[#D36A47]/20 focus:ring-2 transition-all w-72"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredSummary.map((item, i) => (
                                        <div key={i} className={`p-6 rounded-[32px] border transition-all ${item.is_critical ? 'bg-red-50/30 border-red-100 shadow-red-100/50' : 'bg-slate-50/50 border-slate-100'} hover:bg-white hover:shadow-2xl group`}>
                                            <div className="flex justify-between items-start mb-5">
                                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:text-[#D36A47] shadow-sm transition-colors">
                                                    <Package size={24} />
                                                </div>
                                                {item.is_critical && (
                                                    <span className="px-3 py-1 bg-red-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest animate-bounce">
                                                        Kritik Stok
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-[13px] font-black text-slate-800 uppercase mb-1 leading-tight">{item.name || item.material_name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">{item.code || 'KODSUZ'}</p>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white/50 rounded-2xl p-4 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Depo Mevcut</p>
                                                    <p className="text-lg font-black text-slate-900">{(item.warehouse_quantity ?? item.warehouse_qty) ?? 0} <span className="text-[10px] text-slate-400">{item.unit}</span></p>
                                                </div>
                                                <div className="bg-white/50 rounded-2xl p-4 border border-slate-100 group-hover:bg-amber-50 group-hover:border-amber-100 transition-all">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Zimmetli</p>
                                                    <p className="text-lg font-black text-amber-600">{(item.subcontractor_quantity ?? item.assigned_qty) ?? 0} <span className="text-[10px] text-slate-300">{item.unit}</span></p>
                                                </div>
                                            </div>

                                            <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                <span>Alt Limit: {item.min_stock_level}</span>
                                                <span className="text-indigo-600">Toplam: {item.total_quantity || item.total_qty}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Content: Entry (Rapid Counter) */}
                    {activeTab === 'entry' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            {/* Entry Banner */}
                            <div className="bg-white rounded-[40px] p-10 border border-white shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="relative flex flex-col md:flex-row justify-between items-center gap-10">
                                    <div className="max-w-md">
                                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">Yeni Malzeme Kabulü</h2>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                            Sahada kamyon sevkiyatlarını karşıladığınızda hızlıca sisteme girin. İrsaliye fotoğrafıyla beraber stoğu anlık güncelleyin.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsEntryModalOpen(true)}
                                        className="w-full md:w-auto flex items-center justify-center gap-3 px-12 py-6 bg-emerald-600 text-white rounded-[24px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <Plus size={24} /> MALZEME GİRİŞİ YAP
                                    </button>
                                </div>
                            </div>

                            {/* Recent Movements */}
                            <div className="bg-white rounded-[40px] p-8 border border-white shadow-xl shadow-slate-200/40">
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8 px-2 flex items-center gap-3">
                                    <History className="text-emerald-500" size={24} /> Son Giriş Hareketleri
                                </h3>
                                <div className="space-y-4">
                                    {movements.map((move, i) => (
                                        <div key={i} className="flex items-center justify-between p-6 bg-slate-50 hover:bg-white border border-slate-50 hover:border-emerald-100 rounded-[28px] transition-all hover:shadow-lg group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                                                    <ArrowDownLeft size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-900 uppercase leading-none mb-1">{move.material_name}</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-2 uppercase tracking-widest">
                                                        <User size={12} /> {move.created_by_name} | <Calendar size={12} /> {new Date(move.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-12">
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-slate-900">+{move.quantity}</p>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Gelen Miktar ({move.unit})</p>
                                                </div>
                                                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${move.waybill_no ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    {move.waybill_no ? `IRS: ${move.waybill_no}` : 'İRSALİYESİZ'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {movements.length === 0 && (
                                        <div className="py-20 text-center opacity-30">
                                            <Truck size={48} className="mx-auto mb-4" />
                                            <p className="text-xs font-black uppercase tracking-widest">Henüz malzeme girişi bulunmuyor</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Content: Consumption (Spent Materials) */}
                    {activeTab === 'consumption' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            {/* Summary Card */}
                            <div className="p-8 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                                <div className="relative flex flex-col md:flex-row justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Harcanan Malzeme Raporu</h2>
                                        <p className="text-slate-400 text-sm font-medium">Binanın bir parçası olan, stoktan düşen tüm "tüketim" kayıtları.</p>
                                    </div>
                                    <button
                                        onClick={handleExportExcel}
                                        className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white text-white hover:text-[#0A1128] rounded-[22px] text-xs font-black uppercase tracking-widest border border-white/20 transition-all backdrop-blur-md"
                                    >
                                        <FileDown size={18} /> EXCEL RAPORU AL
                                    </button>
                                </div>
                            </div>

                            {/* Filters Section */}
                            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Malzeme veya Taşeron Ara..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-[#D36A47]/10"
                                    />
                                </div>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-[#D36A47]/10"
                                    />
                                </div>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-[#D36A47]/10"
                                    />
                                </div>
                            </div>

                            {/* Consumption List */}
                            <div className="bg-white rounded-[40px] p-8 border border-white shadow-xl shadow-slate-200/40">
                                <div className="space-y-4">
                                    {filteredConsumption.map((report, i) => (
                                        <div key={i} className="p-7 bg-slate-50 border border-slate-100 rounded-[32px] hover:bg-white hover:border-indigo-100 transition-all hover:shadow-xl group">
                                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-white text-indigo-600 flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        <History size={28} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-800 uppercase leading-none mb-2">{report.material_name}</h4>
                                                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            <span className="flex items-center gap-1.5"><Building2 size={12} /> {report.location || 'Bina Geneli'}</span>
                                                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                            <span className="flex items-center gap-1.5"><User size={12} /> {report.subcontractor_name}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                                                    <div className="text-center md:text-left">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tüketilen Miktar</p>
                                                        <p className="text-xl font-black text-slate-900">{report.quantity} <span className="text-xs text-slate-400">{report.unit}</span></p>
                                                    </div>
                                                    <div className="text-center md:text-left">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tüketim Tarihi</p>
                                                        <p className="text-lg font-black text-slate-700">{new Date(report.date).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="col-span-2 md:col-span-1 flex items-center justify-end">
                                                        <div className="flex -space-x-3">
                                                            {[1, 2].map(p => (
                                                                <div key={p} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm hover:z-10 transition-all cursor-pointer">
                                                                    <div className="w-full h-full flex items-center justify-center text-slate-400"><Camera size={16} /></div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredConsumption.length === 0 && (
                                        <div className="py-32 text-center opacity-30">
                                            <ClipboardList size={64} className="mx-auto mb-6" />
                                            <p className="text-sm font-black uppercase tracking-[0.3em]">Harcanan kaydı bulunamadı</p>
                                            <p className="text-[10px] mt-2 font-bold uppercase">Filtreleri değiştirin veya saha onayı bekleyin</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* Modals */}
            <MaterialEntryModal
                isOpen={isEntryModalOpen}
                onClose={() => setIsEntryModalOpen(false)}
                onEntry={() => {
                    setActiveTab('entry');
                    fetchData();
                }}
            />
        </div>
    );
}
