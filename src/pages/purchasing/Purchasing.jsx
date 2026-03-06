import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import { api } from '../../api/client';
import {
    ShoppingBag,
    Calculator,
    ClipboardList,
    FileText,
    Plus,
    Search,
    Filter,
    ArrowRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    Building2,
    Layers,
    Layout,
    Package,
    TrendingUp,
    FileUp,
    Check,
    Truck,
    CircleDollarSign,
    Info,
    ChevronRight,
    Maximize2
} from 'lucide-react';
import MaterialOfferModal from '../../modals/purchasing/MaterialOfferModal';

export default function Purchasing() {
    const [activeTab, setActiveTab] = useState('analysis'); // 'analysis', 'requests', 'rfq'
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Data states
    const [projects, setProjects] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [floors, setFloors] = useState([]);
    const [units, setUnits] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    // Analysis Form State
    const [selection, setSelection] = useState({
        projectId: '',
        blockId: '',
        floorId: '',
        unitId: '',
        category: 'İnce Yapı',
        materialId: ''
    });

    const [calculationResult, setCalculationResult] = useState(null);
    const [requestedAmount, setRequestedAmount] = useState('');
    const [selectedRequestForRfq, setSelectedRequestForRfq] = useState(null);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [stockWarningInfo, setStockWarningInfo] = useState(null);

    // Initial Fetch
    useEffect(() => {
        fetchInitialData();
        fetchPurchaseRequests();
    }, []);

    const fetchPurchaseRequests = async () => {
        try {
            const data = await api.get('/inventory/purchase-requests');
            // Backend'den gelen status'leri frontend etiketlerine eşle
            const mappedData = (data || []).map(req => ({
                id: req.id,
                project: req.projects?.name || req.project_name || 'Bilinmeyen Proje',
                item: req.materials?.name || req.material_name || 'Bilinmeyen Malzeme',
                material_id: req.material_id,
                quantity: req.quantity,
                unit: req.materials?.unit || 'm²',
                status: req.status === 'ORDERED' ? 'Malzeme Bekleniyor' : 'Teklif Toplanıyor',
                date: req.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                requester: req.requester || 'Sistem',
                offers: req.offers || []
            }));
            setRequests(mappedData);
        } catch (error) {
            console.error("Fetch requests error:", error);
        }
    };

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [pData, mData, rData] = await Promise.all([
                api.get('/projects'),
                api.get('/materials/catalog'),
                api.get('/recipes')
            ]);
            setProjects(pData || []);
            setMaterials(mData || []);
            setRecipes(rData || []);
        } catch (error) {
            console.error("Initial fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBlocks = async (projectId) => {
        if (!projectId) return;
        try {
            const data = await api.get(`/projects/${projectId}/blocks`);
            setBlocks(data || []);
        } catch (err) {
            console.error("Fetch blocks error:", err);
        }
    };

    const fetchFloors = async (blockId) => {
        if (!blockId) return;
        try {
            const response = await api.get(`/projects/blocks/${blockId}`);
            const blockData = response.block || response.data || response;
            setFloors(blockData.floors || []);
        } catch (err) {
            console.error("Fetch floors error:", err);
            setFloors([
                { id: 1, floor_number: 1, name: '1. Kat', units: [{ id: 101, unit_number: 'D1' }, { id: 102, unit_number: 'D2' }] },
                { id: 2, floor_number: 2, name: '2. Kat', units: [{ id: 201, unit_number: 'D3' }] }
            ]);
        }
    };

    const checkStock = async (materialId) => {
        try {
            const data = await api.get(`/inventory/check-stock/${materialId}`);
            setStockWarningInfo(data.total_stock || 0);
        } catch (err) {
            console.error("Stock check error:", err);
            setStockWarningInfo(null);
        }
    };

    const handleSelectionChange = (e) => {
        const { name, value } = e.target;
        setSelection(prev => ({ ...prev, [name]: value }));

        if (name === 'projectId') {
            fetchBlocks(value);
            setSelection(prev => ({ ...prev, blockId: '', floorId: '', unitId: '' }));
            setFloors([]);
            setUnits([]);
        } else if (name === 'blockId') {
            fetchFloors(value);
            setSelection(prev => ({ ...prev, floorId: '', unitId: '' }));
            setUnits([]);
        } else if (name === 'floorId') {
            const selectedFloor = floors.find(f => String(f.id) === String(value));
            setUnits(selectedFloor?.units || []);
            setSelection(prev => ({ ...prev, unitId: '' }));
        } else if (name === 'materialId') {
            if (value) checkStock(value);
        }
    };

    const runAnalysis = () => {
        if (!selection.materialId) return;
        const selectedMat = materials.find(m => m.id === parseInt(selection.materialId));

        // Mocked logic: (Gerçek sistemde backend'den analize göre gelecek)
        const analysisInfo = "12 Adet Banyo + 4 Adet Mutfak";
        const requirementInfo = "1 Banyo (15m2) + 1 Mutfak (10m2)";
        const totalNeed = 220;

        setCalculationResult({
            item: selectedMat?.name || 'Seçili Malzeme',
            analysisArea: analysisInfo,
            requirement: requirementInfo,
            totalNeed: totalNeed,
            unit: selectedMat?.unit || 'm²',
            stockRecommendation: stockWarningInfo || 0
        });
        setRequestedAmount(totalNeed);
    };

    const createPurchaseRequest = async () => {
        try {
            const res = await api.post('/inventory/purchase-requests', {
                project_id: parseInt(selection.projectId),
                material_id: parseInt(selection.materialId),
                quantity: parseFloat(requestedAmount || calculationResult.totalNeed),
                status: 'OPEN'
            });

            await fetchPurchaseRequests();
            setActiveTab('requests');
            setCalculationResult(null);
            setSelection({
                projectId: '', blockId: '', floorId: '', unitId: '', category: 'İnce Yapı', materialId: ''
            });
        } catch (err) {
            console.error("Create request error:", err);
            alert("Talep oluşturulurken hata oluştu.");
        }
    };

    const handleSaveOffer = async (offerData) => {
        try {
            await api.post('/inventory/material-offers', offerData);
            await fetchPurchaseRequests(); // Listeyi güncelle
            setIsOfferModalOpen(false);

            // Eğer teklif eklenen talep RFQ panelinde seçiliyse onu da güncelle
            if (selectedRequestForRfq) {
                const updatedReq = requests.find(r => r.id === selectedRequestForRfq.id);
                setSelectedRequestForRfq(updatedReq);
            }
        } catch (err) {
            console.error("Offer save error:", err);
            alert("Teklif kaydedilirken hata oluştu.");
        }
    };

    const acceptOffer = async (requestId, offerId) => {
        try {
            await api.put(`/inventory/material-offers/${offerId}`, { status: 'ACCEPTED' });
            await fetchPurchaseRequests();
            alert("Anlaşma sağlandı! Durum: Malzeme Bekleniyor.");

            // UI güncelle
            if (selectedRequestForRfq) {
                setSelectedRequestForRfq(prev => ({ ...prev, status: 'Malzeme Bekleniyor', acceptedOfferId: offerId }));
            }
        } catch (err) {
            console.error("Accept offer error:", err);
            alert("Teklif kabul edilirken hata oluştu.");
        }
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B]">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={closeMobileMenu} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Satın Alma & Lojistik Yönetimi" toggleMobileMenu={toggleMobileMenu} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-6">

                    {/* ═════════════════ HEADER BANNER ═════════════════ */}
                    <div className="relative overflow-hidden bg-[#0A1128] rounded-[32px] p-8 md:p-12 text-white shadow-2xl animate-fade-in">
                        {/* Animated background highlights */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D36A47]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] animate-pulse" />
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]" />

                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-[#D36A47] to-[#B2593C] flex items-center justify-center shadow-2xl shadow-[#D36A47]/30 border border-white/10 transform hover:rotate-6 transition-transform">
                                        <ShoppingBag size={32} className="text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-tight">Satın Alma <br /><span className="text-[#D36A47]">Merkezi</span></h1>
                                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Stratejik Tedarik ve Maliyet Kontrolü</p>
                                    </div>
                                </div>
                                <div className="flex gap-10">
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-black text-white">{requests.length}</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Aktif Talep</span>
                                    </div>
                                    <div className="w-px h-12 bg-white/10" />
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-black text-[#D36A47]">{requests.filter(r => r.status === 'Malzeme Bekleniyor').length}</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Beklenen Sevkiyat</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex p-1.5 bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 shadow-inner">
                                <button
                                    onClick={() => setActiveTab('analysis')}
                                    className={`flex items-center gap-3 px-8 py-4 rounded-[20px] text-xs font-black transition-all duration-300 ${activeTab === 'analysis' ? 'bg-white text-[#0A1128] shadow-lg scale-100' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Calculator size={18} />
                                    İHTİYAÇ ANALİZİ
                                </button>
                                <button
                                    onClick={() => setActiveTab('requests')}
                                    className={`flex items-center gap-3 px-8 py-4 rounded-[20px] text-xs font-black transition-all duration-300 ${activeTab === 'requests' ? 'bg-white text-[#0A1128] shadow-lg scale-100' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <ClipboardList size={18} />
                                    TALEPLERİM
                                </button>
                                <button
                                    onClick={() => setActiveTab('rfq')}
                                    className={`flex items-center gap-3 px-8 py-4 rounded-[20px] text-xs font-black transition-all duration-300 ${activeTab === 'rfq' ? 'bg-white text-[#0A1128] shadow-lg scale-100' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <TrendingUp size={18} />
                                    RFQ PANELİ
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ═════════════════ CONTENT AREA ═════════════════ */}
                    <div className="min-h-[600px] animate-in slide-in-from-bottom-4 duration-500">

                        {/* TAB 1: İHTİYAÇ ANALİZİ */}
                        {activeTab === 'analysis' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Selection Panel */}
                                <div className="lg:col-span-5 space-y-6">
                                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-8">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm">01</div>
                                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">LOKASYON & MALZEME SEÇİMİ</h2>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proje</label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                    <select name="projectId" value={selection.projectId} onChange={handleSelectionChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all appearance-none">
                                                        <option value="">Proje Seçiniz</option>
                                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blok</label>
                                                    <div className="relative">
                                                        <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                        <select name="blockId" value={selection.blockId} onChange={handleSelectionChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-bold outline-none appearance-none disabled:opacity-50" disabled={!selection.projectId}>
                                                            <option value="">Blok</option>
                                                            {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kat</label>
                                                    <div className="relative">
                                                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                        <select name="floorId" value={selection.floorId} onChange={handleSelectionChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-bold outline-none appearance-none disabled:opacity-50" disabled={!selection.blockId}>
                                                            <option value="">Tüm Katlar</option>
                                                            {floors.map(f => <option key={f.id} value={f.id}>{f.floor_number}. Kat</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Daire / Bölüm Seçimi</label>
                                                <div className="relative">
                                                    <Maximize2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                    <select name="unitId" value={selection.unitId} onChange={handleSelectionChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-bold outline-none appearance-none disabled:opacity-50" disabled={!selection.floorId}>
                                                        <option value="">Tüm Daireler / Bölümler</option>
                                                        {units.map(u => <option key={u.id} value={u.id}>No: {u.unit_number || u.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                                                <select name="category" value={selection.category} onChange={handleSelectionChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-bold outline-none">
                                                    <option>İnce Yapı</option>
                                                    <option>Kaba Yapı</option>
                                                    <option>Elektrik</option>
                                                    <option>Mekanik</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Malzeme Seçimi</label>
                                                <div className="relative">
                                                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                    <select name="materialId" value={selection.materialId} onChange={handleSelectionChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-bold outline-none appearance-none">
                                                        <option value="">Malzeme Seçiniz</option>
                                                        {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <button
                                                onClick={runAnalysis}
                                                disabled={!selection.materialId}
                                                className="w-full py-5 bg-[#D36A47] text-white rounded-[24px] text-sm font-black uppercase tracking-wider shadow-xl shadow-[#D36A47]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:grayscale disabled:opacity-50"
                                            >
                                                <Calculator size={20} />
                                                HESAPLA VE ANALİZ ET
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Results & Conversion Panel */}
                                <div className="lg:col-span-7 space-y-6">
                                    {calculationResult ? (
                                        <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
                                            {/* Automatic Calculation Card */}
                                            <div className="bg-[#0A1128] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden border border-white/5">
                                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                                    <TrendingUp size={120} />
                                                </div>
                                                <div className="flex items-center gap-3 mb-8">
                                                    <div className="w-10 h-10 rounded-xl bg-[#D36A47] flex items-center justify-center text-white font-black text-sm">02</div>
                                                    <h2 className="text-lg font-black uppercase tracking-tight">SİSTEM OTOMATİK HESAPLAMASI</h2>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                                                            <Maximize2 size={14} className="text-[#D36A47]" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Analiz Edilen Alan</span>
                                                        </div>
                                                        <p className="text-lg font-black">{calculationResult.analysisArea}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                                                            <FileText size={14} className="text-blue-400" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Reçete Gereksinimi</span>
                                                        </div>
                                                        <p className="text-lg font-black">{calculationResult.requirement}</p>
                                                    </div>
                                                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 shadow-inner">
                                                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                                                            <TrendingUp size={14} className="text-emerald-400" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Toplam Saf İhtiyaç</span>
                                                        </div>
                                                        <p className="text-3xl font-black text-[#D36A47]">{calculationResult.totalNeed} <span className="text-sm uppercase">{calculationResult.unit}</span></p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Conversion Form */}
                                            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#D36A47] font-black text-sm">03</div>
                                                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">TALEP OLUŞTURMA & DÜZENLEME</h2>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Önerilen Miktar (Sistem)</label>
                                                        <div className="py-4 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-black text-slate-400">
                                                            {calculationResult.totalNeed} {calculationResult.unit}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Talep Edilen Miktar</label>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                value={requestedAmount}
                                                                onChange={(e) => setRequestedAmount(e.target.value)}
                                                                className="w-full px-6 py-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl text-lg font-black text-emerald-700 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                                                            />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-emerald-300 text-sm">{calculationResult.unit}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stock Warning */}
                                                <div className="flex items-start gap-4 p-6 bg-amber-50 rounded-3xl border border-amber-100 text-amber-900">
                                                    <AlertCircle className="shrink-0 mt-1" size={20} />
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-black uppercase tracking-tight">Mevcut Stok Durumu</p>
                                                        <p className="text-sm font-medium">Depoda halihazırda <span className="font-black underline">{calculationResult.stockRecommendation} {calculationResult.unit}</span> bulunuyor. Talep miktarından düşülsün mü?</p>
                                                        <button className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1 mt-2 hover:underline">
                                                            EVET, STOKTAN DÜŞÜLSÜN <ChevronRight size={12} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={createPurchaseRequest}
                                                    className="w-full py-6 bg-[#0A1128] text-white rounded-[24px] text-sm font-black uppercase tracking-wider shadow-2xl shadow-blue-900/10 hover:bg-slate-900 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                                                >
                                                    <ShoppingBag size={20} className="text-[#D36A47]" />
                                                    SATIN ALMA TALEBİ OLUŞTUR
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-[32px] bg-white/40 text-slate-400 space-y-4">
                                            <div className="p-6 bg-slate-100 rounded-full animate-bounce">
                                                <Calculator size={48} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-black uppercase tracking-tight">Hesaplama Bekleniyor</p>
                                                <p className="text-sm font-medium">Soldaki panelden lokasyon ve malzeme seçimi yapabilirsiniz.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 2: TALEPLERİM */}
                        {activeTab === 'requests' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-black text-[#0A1128] uppercase tracking-tight">AKTİF TALEPLERİM</h2>
                                    <div className="flex gap-2">
                                        <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#0A1128] transition-colors shadow-sm"><Filter size={18} /></button>
                                        <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#0A1128] transition-colors shadow-sm"><Search size={18} /></button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {requests.map(req => (
                                        <div key={req.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all group relative">
                                            <div className="absolute top-6 right-6">
                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${req.status === 'Teklif Toplanıyor' ? 'bg-orange-50 text-[#D36A47]' :
                                                    req.status === 'Malzeme Bekleniyor' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{req.project}</p>
                                                    <h3 className="text-lg font-black text-slate-900 group-hover:text-[#D36A47] transition-colors">{req.item}</h3>
                                                </div>

                                                <div className="flex gap-8 py-4 border-y border-slate-50">
                                                    <div className="flex flex-col">
                                                        <span className="text-2xl font-black text-slate-800">{req.quantity}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{req.unit}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-2xl font-black text-indigo-600">{req.offers?.length || 0}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Teklif</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                                                    <div className="flex items-center gap-1.5"><Clock size={14} /> {req.date}</div>
                                                    <div className="flex items-center gap-1.5"><ArrowRight size={14} /> {req.requester}</div>
                                                </div>

                                                <button
                                                    onClick={() => { setSelectedRequestForRfq(req); setActiveTab('rfq'); }}
                                                    className="w-full py-4 mt-2 bg-slate-50 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest group-hover:bg-[#0A1128] group-hover:text-white transition-all shadow-sm"
                                                >
                                                    {req.status === 'Teklif Toplanıyor' ? 'TEKLİFLERİ YÖNET' : 'DETAYLARI GÖR'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 3: RFQ / TEKLİF YÖNETİMİ */}
                        {activeTab === 'rfq' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                {selectedRequestForRfq ? (
                                    <>
                                        {/* Back Navigation */}
                                        <button
                                            onClick={() => setSelectedRequestForRfq(null)}
                                            className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
                                        >
                                            <ArrowRight size={16} className="rotate-180" /> Taleplere Geri Dön
                                        </button>

                                        {/* Selected Request Summary */}
                                        <div className="bg-[#0A1128] rounded-[32px] p-8 text-white relative shadow-2xl">
                                            <div className="flex justify-between items-center">
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black text-[#D36A47] uppercase tracking-widest">{selectedRequestForRfq.project}</p>
                                                    <h2 className="text-3xl font-black">{selectedRequestForRfq.item}</h2>
                                                    <div className="flex items-center gap-4 text-slate-400 text-sm font-bold">
                                                        <span>Miktar: {selectedRequestForRfq.quantity} {selectedRequestForRfq.unit}</span>
                                                        <span>•</span>
                                                        <span>Tarih: {selectedRequestForRfq.date}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setIsOfferModalOpen(true)}
                                                    className="px-8 py-4 bg-[#D36A47] text-white rounded-[20px] text-xs font-black shadow-xl shadow-[#D36A47]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest"
                                                >
                                                    <Plus size={20} /> TEKLİF EKLE
                                                </button>
                                            </div>
                                        </div>

                                        {/* Offers Comparison */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {selectedRequestForRfq.offers?.length > 0 ? (
                                                selectedRequestForRfq.offers.map((offer, idx) => (
                                                    <div key={offer.id} className={`bg-white rounded-[32px] p-8 transition-all relative border ${selectedRequestForRfq.acceptedOfferId === offer.id ? 'border-emerald-500 shadow-emerald-500/10' : 'border-slate-100 shadow-sm'}`}>
                                                        <div className="flex items-center justify-between mb-8">
                                                            <h3 className="text-lg font-black text-slate-900 uppercase">{offer.supplier}</h3>
                                                            {selectedRequestForRfq.acceptedOfferId === offer.id ? (
                                                                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white"><Check size={18} strokeWidth={3} /></div>
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300"><Layout size={18} /></div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-6 mb-10">
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Birim Fiyat</p>
                                                                <p className="text-4xl font-black text-slate-900">{offer.price} <span className="text-lg text-slate-400">{offer.currency || 'TL'}</span></p>
                                                            </div>
                                                            <div className="flex gap-8">
                                                                <div className="space-y-1 flex-1">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vade / Şartlar</p>
                                                                    <p className="text-sm font-bold text-indigo-600">{offer.payment_terms || 'Belirtilmedi'}</p>
                                                                </div>
                                                                <div className="space-y-1 flex-1">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Doküman</p>
                                                                    {offer.file_url ? (
                                                                        <a href={offer.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-[#D36A47] hover:underline">
                                                                            <FileUp size={16} /> GÖRÜNTÜLE
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-sm font-bold text-slate-300">YOK</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {selectedRequestForRfq.status === 'Teklif Toplanıyor' && (
                                                            <button
                                                                onClick={() => acceptOffer(selectedRequestForRfq.id, offer.id)}
                                                                className="w-full py-5 bg-slate-50 text-slate-900 rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 group"
                                                            >
                                                                ANLAŞMA SAĞLA <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                            </button>
                                                        )}

                                                        {selectedRequestForRfq.acceptedOfferId === offer.id && (
                                                            <div className="flex items-center justify-center gap-3 py-5 bg-emerald-50 rounded-[20px] text-emerald-700 text-xs font-black uppercase tracking-widest">
                                                                <Truck size={20} /> SEVKİYAT BEKLENİYOR
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="lg:col-span-3 h-64 flex flex-col items-center justify-center bg-white rounded-[32px] border-2 border-dashed border-slate-200 text-slate-400 gap-4">
                                                    <TrendingUp size={48} className="opacity-20" />
                                                    <p className="font-bold uppercase tracking-widest">Henüz teklif girilmedi</p>
                                                    <button onClick={() => setIsOfferModalOpen(true)} className="text-xs font-black text-[#D36A47] hover:underline uppercase tracking-widest">+ TEKLİF EKLE</button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl font-black text-[#0A1128] uppercase tracking-tight tracking-tight">TEKLİF YÖNETİM PANELİ (RFQ)</h2>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">LÜTFEN TEKLİF YÖNETMEK İÇİN BİR TALEP SEÇİNİZ</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                                            {requests.filter(r => r.status === 'Teklif Toplanıyor').map(req => (
                                                <div key={req.id} onClick={() => setSelectedRequestForRfq(req)} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 cursor-pointer hover:opacity-100 hover:scale-[1.02] transition-all">
                                                    <p className="text-[10px] font-black text-[#D36A47] uppercase tracking-widest mb-1">{req.project}</p>
                                                    <h3 className="text-lg font-black text-slate-900 line-clamp-1 mb-4">{req.item}</h3>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] font-bold text-slate-400">{(req.offers || []).length} Teklif Bulunuyor</span>
                                                        <span className="text-xs font-black text-[#0A1128] flex items-center gap-1">SEÇ <ChevronRight size={14} /></span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </main>

            <MaterialOfferModal
                isOpen={isOfferModalOpen}
                onClose={() => setIsOfferModalOpen(false)}
                requestId={selectedRequestForRfq?.id}
                itemName={selectedRequestForRfq?.item}
                onSave={handleSaveOffer}
            />
        </div>
    );
}
