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
                item: req.materials_catalog?.name || req.materials?.name || req.material_name || 'Bilinmeyen Malzeme',
                material_id: req.material_id,
                quantity: req.required_quantity || req.quantity || 0,
                unit: req.materials_catalog?.unit || req.materials?.unit || 'm²',
                status: req.status === 'ORDERED' ? 'Malzeme Bekleniyor' : 'Teklif Toplanıyor',
                date: req.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                requester: req.requested_by_user?.full_name || req.requester || 'Sistem',
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
            const data = await api.get(`/projects/${projectId}`);
            setBlocks(data.blocks || []);
        } catch (err) {
            console.error("Fetch blocks error:", err);
        }
    };

    const fetchFloors = async (blockId) => {
        if (!blockId) return;
        try {
            const response = await api.get(`/projects/blocks/${blockId}`);
            const blockData = response.block || response.data || response;
            const floorsList = blockData.floors || [];
            setFloors(floorsList);

            // Başlangıçta o bloktaki tüm üniteleri göster
            const allUnits = [];
            floorsList.forEach(f => {
                if (f.units) {
                    f.units.forEach(u => {
                        allUnits.push({ ...u, floor_number: f.floor_number });
                    });
                }
            });
            setUnits(allUnits);
        } catch (err) {
            console.error("Fetch floors error:", err);
            setFloors([]);
            setUnits([]);
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

        if (name === 'projectId') {
            setSelection(prev => ({ ...prev, projectId: value, blockId: '', floorId: '', unitId: '' }));
            setFloors([]);
            setUnits([]);
            if (value) fetchBlocks(value);
        } else if (name === 'blockId') {
            setSelection(prev => ({ ...prev, blockId: value, floorId: '', unitId: '' }));
            setUnits([]);
            if (value) fetchFloors(value);
        } else if (name === 'floorId') {
            setSelection(prev => ({ ...prev, floorId: value, unitId: '' }));
            if (value === '') {
                const allUnits = [];
                floors.forEach(f => {
                    if (f.units) {
                        f.units.forEach(u => {
                            allUnits.push({ ...u, floor_number: f.floor_number });
                        });
                    }
                });
                setUnits(allUnits);
            } else {
                const selectedFloor = floors.find(f => String(f.id) === String(value));
                setUnits(selectedFloor?.units || []);
            }
        } else {
            setSelection(prev => ({ ...prev, [name]: value }));
            if (name === 'materialId' && value) {
                checkStock(value);
            }
        }
    };

    // Malzeme lojistik hesaplama (paket/torba/palet)
    const calculateLogistics = (material, totalNeed) => {
        if (!material) return null;
        const unit = (material.unit || '').toLowerCase();
        const name = (material.name || '').toLowerCase();
        const cat = (material.category || '').toLowerCase();

        // Malzeme tipine göre lojistik birim belirleme
        let items = [];

        if (name.includes('çimento') || name.includes('cimento')) {
            const bagWeight = 50; // kg
            const bags = Math.ceil(totalNeed * 1000 / bagWeight); // Ton -> kg -> torba
            const palletsOf40 = Math.ceil(bags / 40);
            items = [
                { label: 'Torba (50kg)', value: bags, icon: '🏷️' },
                { label: 'Palet (40 torba)', value: palletsOf40, icon: '📦' }
            ];
        } else if (name.includes('seramik') || name.includes('fayans') || name.includes('karo')) {
            const boxM2 = material.box_content_m2 || 1.44;
            const boxes = Math.ceil(totalNeed / boxM2);
            const palletBoxes = material.pallet_box_count || 48;
            const pallets = Math.ceil(boxes / palletBoxes);
            items = [
                { label: `Kutu (${boxM2} m²)`, value: boxes, icon: '📦' },
                { label: `Palet (${palletBoxes} kutu)`, value: pallets, icon: '🏗️' }
            ];
        } else if (name.includes('boya') || name.includes('astar')) {
            const coverage = 12; // m²/lt
            const liters = Math.ceil(totalNeed / coverage);
            const buckets = Math.ceil(liters / 15); // 15lt kova
            items = [
                { label: 'Litre', value: liters, icon: '💧' },
                { label: 'Kova (15lt)', value: buckets, icon: '🪣' }
            ];
        } else if (name.includes('alçı') || name.includes('sıva') || name.includes('macun')) {
            const bagWeight = 25;
            const bags = Math.ceil(totalNeed * (unit.includes('ton') ? 1000 : 1) / bagWeight);
            const pallets = Math.ceil(bags / 56);
            items = [
                { label: 'Torba (25kg)', value: bags, icon: '🏷️' },
                { label: 'Palet (56 torba)', value: pallets, icon: '📦' }
            ];
        } else if (name.includes('demir') || name.includes('nervür')) {
            const barWeight = unit.includes('ton') ? 1 : 0.00089; // 12mm demir ~0.89 kg/m
            const totalKg = totalNeed * (unit.includes('ton') ? 1000 : barWeight * 1000);
            const bundles = Math.ceil(totalKg / 2000); // ~2 ton demet
            items = [
                { label: 'Toplam (kg)', value: Math.round(totalKg), icon: '⚖️' },
                { label: 'Demet (~2 ton)', value: bundles, icon: '🔩' }
            ];
        } else if (unit.includes('m²') || unit.includes('m2')) {
            const boxM2 = material.box_content_m2 || 2.0;
            const boxes = Math.ceil(totalNeed / boxM2);
            items = [
                { label: `Paket (${boxM2} m²)`, value: boxes, icon: '📦' }
            ];
        } else if (unit.includes('m3') || unit.includes('m³')) {
            const trucks = Math.ceil(totalNeed / 10); // 10 m3 kamyon
            items = [
                { label: 'Kamyon (10 m³)', value: trucks, icon: '🚛' }
            ];
        } else if (unit.includes('ton')) {
            const trucks = Math.ceil(totalNeed / 25); // 25 ton TIR
            items = [
                { label: 'TIR (25 ton)', value: trucks, icon: '🚛' }
            ];
        } else {
            // Genel: adet bazlı
            const packages = Math.ceil(totalNeed / 10);
            items = [
                { label: 'Paket (10 adet)', value: packages, icon: '📦' }
            ];
        }

        // Tahmini ağırlık
        const weightPerUnit = material.weight_per_unit || null;
        const estimatedWeight = weightPerUnit ? Math.round(totalNeed * weightPerUnit) : null;

        return { items, estimatedWeight };
    };

    const runAnalysis = async () => {
        if (!selection.materialId) return;
        const selectedMat = materials.find(m => m.id === parseInt(selection.materialId));
        setLoading(true);

        try {
            // Akıllı hesaplama API'sini çağır
            const smartResult = await api.post('/inventory/smart-calculate', {
                material_id: parseInt(selection.materialId),
                block_id: selection.blockId ? parseInt(selection.blockId) : null,
                floor_id: selection.floorId ? parseInt(selection.floorId) : null,
                unit_id: selection.unitId ? parseInt(selection.unitId) : null
            });

            // Analiz alanı bilgisi
            let info = "Tüm Blok / Kat Geneli";
            if (selection.unitId) {
                const unit = units.find(u => String(u.id) === String(selection.unitId));
                info = `No: ${unit?.unit_number || unit?.name}`;
            } else if (selection.floorId) {
                const floor = floors.find(f => String(f.id) === String(selection.floorId));
                info = `${floor?.floor_number}. Kat Toplam`;
            }

            // Katman kırılımı bilgisi
            const layerInfo = smartResult.layer_breakdown
                ? Object.entries(smartResult.layer_breakdown).map(([k, v]) => `${k}: ${v.total_m2} m²`).join(' | ')
                : '';

            // Lojistik items oluştur
            const logisticsItems = [];
            const pkg = smartResult.packaging || {};
            if (pkg.bucket_count) logisticsItems.push({ label: pkg.bucket_label || 'Kova', value: pkg.bucket_count, icon: '🪣' });
            if (pkg.liter_count) logisticsItems.push({ label: 'Litre', value: pkg.liter_count, icon: '💧' });
            if (pkg.bag_count) logisticsItems.push({ label: pkg.bag_label || 'Torba', value: pkg.bag_count, icon: '🏷️' });
            if (pkg.box_count) logisticsItems.push({ label: pkg.box_label || 'Kutu', value: pkg.box_count, icon: '📦' });
            if (pkg.pallet_count) logisticsItems.push({ label: pkg.pallet_label || 'Palet', value: pkg.pallet_count, icon: '🏗️' });
            if (pkg.total_units && !pkg.bucket_count && !pkg.bag_count && !pkg.box_count) {
                logisticsItems.push({ label: pkg.unit_label || 'Birim', value: pkg.total_units, icon: '📦' });
            }

            const totalNeed = smartResult.calculation?.gross_need || 0;

            setCalculationResult({
                item: smartResult.material?.name || selectedMat?.name || 'Seçili Malzeme',
                analysisArea: `${info} (${smartResult.total_target_area_m2} m²)`,
                requirement: smartResult.recipe
                    ? `${smartResult.recipe.name}: ${smartResult.recipe.description}`
                    : "Reçete atanmamış – brüt alan hesabı",
                totalNeed: totalNeed,
                unit: smartResult.material?.unit || selectedMat?.unit || 'm²',
                stockRecommendation: smartResult.stock?.current || 0,
                stockDeficit: smartResult.stock?.deficit || 0,
                logistics: { items: logisticsItems, estimatedWeight: null },
                // Akıllı detaylar
                applicationAreas: smartResult.application_areas || [],
                layerBreakdown: smartResult.layer_breakdown || {},
                layerInfo,
                recipe: smartResult.recipe,
                calculation: smartResult.calculation,
                roomCount: smartResult.scope?.room_count || 0
            });
            setRequestedAmount(Math.ceil(totalNeed));
        } catch (err) {
            console.error('Smart calculate error:', err);
            // Fallback: eski hesaplama yöntemi
            let area = 0;
            let info = "Tüm Blok / Kat Geneli";
            if (selection.unitId) {
                const unit = units.find(u => String(u.id) === String(selection.unitId));
                area = unit?.gross_m2 || unit?.area_m2 || 85;
                info = `No: ${unit?.unit_number || unit?.name} (${area} m2)`;
            } else if (selection.floorId) {
                const floor = floors.find(f => String(f.id) === String(selection.floorId));
                area = (floor?.units || []).reduce((acc, u) => acc + (u.gross_m2 || u.area_m2 || 85), 0);
                info = `${floor?.floor_number}. Kat Toplam (${area} m2)`;
            } else {
                area = units.reduce((acc, u) => acc + (u.gross_m2 || u.area_m2 || 85), 0);
            }
            const coefficient = 1.1;
            const totalNeed = Math.round(area * coefficient);
            const logistics = calculateLogistics(selectedMat, totalNeed);
            setCalculationResult({
                item: selectedMat?.name || 'Seçili Malzeme',
                analysisArea: info,
                requirement: "Genel Saha Sarfiyat Hesabı (fallback)",
                totalNeed, unit: selectedMat?.unit || 'm²',
                stockRecommendation: stockWarningInfo || 0,
                logistics
            });
            setRequestedAmount(totalNeed);
        } finally {
            setLoading(false);
        }
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
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]" />

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
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-10 h-10 rounded-xl bg-[#D36A47] flex items-center justify-center text-white font-black text-sm">02</div>
                                                    <h2 className="text-lg font-black uppercase tracking-tight">AKILLI HESAPLAMA SONUCU</h2>
                                                    {calculationResult.roomCount > 0 && (
                                                        <span className="text-[9px] bg-white/10 text-slate-300 px-2 py-1 rounded-full font-bold">{calculationResult.roomCount} oda analiz edildi</span>
                                                    )}
                                                </div>

                                                {/* Uygulama Alanları */}
                                                {calculationResult.applicationAreas && calculationResult.applicationAreas.length > 0 && (
                                                    <div className="mb-6">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Uygulama Alanları</span>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {calculationResult.applicationAreas.map(area => (
                                                                <span key={area} className="px-3 py-1 bg-[#D36A47]/20 text-[#D36A47] rounded-full text-xs font-bold border border-[#D36A47]/30">{area}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Katman Kırılımı */}
                                                {calculationResult.layerBreakdown && Object.keys(calculationResult.layerBreakdown).length > 0 && (
                                                    <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        {Object.entries(calculationResult.layerBreakdown).map(([layer, data]) => (
                                                            <div key={layer} className="bg-white/5 rounded-2xl p-3 border border-white/10">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{layer}</span>
                                                                <p className="text-lg font-black text-white">{data.total_m2} <span className="text-xs text-slate-400">m²</span></p>
                                                                <span className="text-[9px] text-slate-500">{data.room_count} oda</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
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
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Reçete / Tüketim</span>
                                                        </div>
                                                        <p className="text-sm font-bold">{calculationResult.requirement}</p>
                                                        {calculationResult.calculation && (
                                                            <p className="text-[10px] text-slate-500 mt-1">Net: {calculationResult.calculation.net_need} | Fire: %{calculationResult.calculation.waste_pct}</p>
                                                        )}
                                                    </div>
                                                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 shadow-inner">
                                                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                                                            <TrendingUp size={14} className="text-emerald-400" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Brüt İhtiyaç (Fire Dahil)</span>
                                                        </div>
                                                        <p className="text-3xl font-black text-[#D36A47]">{calculationResult.totalNeed} <span className="text-sm uppercase">{calculationResult.unit}</span></p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Lojistik Detay Kartı */}
                                            {calculationResult.logistics && calculationResult.logistics.items.length > 0 && (
                                                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[32px] p-8 shadow-sm border border-indigo-100 space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                            <Truck size={20} />
                                                        </div>
                                                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">LOJİSTİK HESAPLAMA</h2>
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {calculationResult.logistics.items.map((item, idx) => (
                                                            <div key={idx} className="bg-white rounded-2xl p-5 border border-indigo-100 text-center shadow-sm">
                                                                <span className="text-2xl">{item.icon}</span>
                                                                <p className="text-2xl font-black text-indigo-700 mt-2">{item.value.toLocaleString('tr-TR')}</p>
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{item.label}</p>
                                                            </div>
                                                        ))}
                                                        {calculationResult.logistics.estimatedWeight && (
                                                            <div className="bg-white rounded-2xl p-5 border border-indigo-100 text-center shadow-sm">
                                                                <span className="text-2xl">⚖️</span>
                                                                <p className="text-2xl font-black text-indigo-700 mt-2">{calculationResult.logistics.estimatedWeight.toLocaleString('tr-TR')} kg</p>
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Tahmini Ağırlık</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

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
                                                <div className="flex items-start gap-4 p-6 bg-orange-50 rounded-3xl border border-orange-100 text-orange-900">
                                                    <AlertCircle className="shrink-0 mt-1" size={20} />
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-black uppercase tracking-tight">Mevcut Stok Durumu</p>
                                                        <p className="text-sm font-medium">
                                                            Depoda halihazırda <span className="font-black underline">{calculationResult.stockRecommendation} {calculationResult.unit}</span> bulunuyor.
                                                            {calculationResult.stockDeficit > 0 && (
                                                                <> Eksik: <span className="font-black text-red-600">{calculationResult.stockDeficit} {calculationResult.unit}</span></>
                                                            )}
                                                            {calculationResult.stockRecommendation >= calculationResult.totalNeed && (
                                                                <span className="ml-2 text-emerald-600 font-black">Stok yeterli!</span>
                                                            )}
                                                        </p>
                                                        {calculationResult.stockRecommendation > 0 && calculationResult.stockRecommendation < calculationResult.totalNeed && (
                                                            <button
                                                                onClick={() => setRequestedAmount(Math.ceil(calculationResult.stockDeficit || calculationResult.totalNeed - calculationResult.stockRecommendation))}
                                                                className="text-[10px] font-black text-orange-700 uppercase tracking-widest flex items-center gap-1 mt-2 hover:underline"
                                                            >
                                                                STOKTAN DÜŞ ({Math.ceil(calculationResult.totalNeed - calculationResult.stockRecommendation)} {calculationResult.unit} TALEP ET) <ChevronRight size={12} />
                                                            </button>
                                                        )}
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
                                                        <span className="text-2xl font-black text-orange-600">{req.offers?.length || 0}</span>
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
                                                                    <p className="text-sm font-bold text-orange-600">{offer.payment_terms || 'Belirtilmedi'}</p>
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
