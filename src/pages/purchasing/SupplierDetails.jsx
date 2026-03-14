import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import {
    Building2,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Package,
    Plus,
    Search,
    ChevronRight,
    ArrowLeft,
    CheckCircle2,
    Clock,
    DollarSign,
    Layers,
    Tag,
    History,
    FileText,
    TrendingUp,
    User,
    ClipboardCheck,
    Truck,
    AlertCircle,
    LayoutGrid
} from 'lucide-react';

const SupplierDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [supplier, setSupplier] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [assignedMaterials, setAssignedMaterials] = useState([]);
    const [isAssigning, setIsAssigning] = useState(false);

    // Assignment form state
    const [assignmentForm, setAssignmentForm] = useState({
        material_id: '',
        unit_price: '',
        lead_time_days: '',
        min_order_quantity: ''
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch supplier info
            const response = await api.get(`/suppliers/${id}`);

            // Extract from nested identity object if present, otherwise handle array/direct object
            let supplierData = response;
            let assignedMaterialsData = [];

            if (response && response.identity) {
                supplierData = response.identity;
                assignedMaterialsData = response.assigned_materials || [];
            } else if (Array.isArray(response)) {
                supplierData = response[0];
            }

            setSupplier({
                ...supplierData,
                code: supplierData.code || `TED-${supplierData.name?.substring(0, 3).toUpperCase() || 'XXX'}-${id.toString().padStart(3, '0')}`,
                category_tags: supplierData.category_tags || [],
                authorized_person: supplierData.authorized_person || '-',
                phone: supplierData.phone || '-',
                email: supplierData.email || '-',
                factory_address: supplierData.factory_address || (supplierData.address ? supplierData.address : '-')
            });

            // Fetch all materials for the assignment dropdown
            const materialsData = await api.get('/materials');
            setMaterials(materialsData || []);

            // Set assigned materials from the supplier details result
            setAssignedMaterials(assignedMaterialsData);

        } catch (err) {
            console.error("Supplier details fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignmentChange = (e) => {
        const { name, value } = e.target;
        setAssignmentForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAssignMaterial = async (e) => {
        e.preventDefault();
        setIsAssigning(true);
        try {
            await api.post('/suppliers/assign-material', {
                company_id: parseInt(id),
                material_id: parseInt(assignmentForm.material_id),
                unit_price: parseFloat(assignmentForm.unit_price),
                lead_time_days: parseInt(assignmentForm.lead_time_days),
                min_order_quantity: parseFloat(assignmentForm.min_order_quantity)
            });

            // Re-fetch assigned materials or update local state
            fetchData();

            // Reset form
            setAssignmentForm({
                material_id: '',
                unit_price: '',
                lead_time_days: '',
                min_order_quantity: ''
            });

            alert("Malzeme başarıyla atandı!");
        } catch (err) {
            console.error("Assignment error:", err);
            alert("Atama sırasında bir hata oluştu: " + err.message);
        } finally {
            setIsAssigning(false);
        }
    };

    if (loading || !supplier) {
        return (
            <div className="flex min-h-screen bg-slate-50">
                <Sidebar />
                <main className="flex-1 p-8 flex items-center justify-center">
                    <div className="animate-spin text-[#D36A47]"><Building2 size={40} /></div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0">
                <Navbar title="Tedarikçi Kartı" toggleMobileMenu={() => setIsMobileMenuOpen(true)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8 animate-fade-in relative z-10 text-left">

                    {/* Back and Breadcrumb */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/suppliers')}
                            className="flex items-center gap-2 text-slate-400 hover:text-[#D36A47] transition-all font-black text-[10px] uppercase tracking-[0.2em] group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Tedarikçi Listesine Dön
                        </button>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest hidden md:block text-right">
                            Satın Alma / Tedarikçiler / {supplier.name}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                        {/* 1. PANEL: Firma Kimlik Bilgileri (Sol Üst) */}
                        <div className="xl:col-span-4 space-y-6">
                            <div className="bg-white rounded-[40px] border border-white shadow-2xl shadow-slate-200/60 overflow-hidden relative">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D36A47]/5 rounded-bl-[80px]" />

                                <div className="p-10 relative z-10">
                                    {/* Company Identity Header */}
                                    <div className="flex flex-col items-center text-center mb-10 text-left">
                                        <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-[#0A1128] to-[#1E293B] flex items-center justify-center text-white shadow-2xl shadow-[#0A1128]/30 mb-6 group-hover:scale-110 transition-transform">
                                            <Building2 size={42} />
                                        </div>
                                        <h2 className="text-2xl font-black tracking-tight leading-tight uppercase mb-2 text-slate-900">{supplier.name}</h2>
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-[#D36A47]">
                                            <Tag size={12} className="text-[#D36A47]" />
                                            {supplier.code}
                                        </div>
                                    </div>

                                    {/* Panels and Info */}
                                    <div className="space-y-10">
                                        {/* Categories Panel */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                                <Layers size={14} className="text-orange-500" />
                                                KATEGORİ & ETİKETLER
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-left">
                                                {typeof supplier.category_tags === 'string'
                                                    ? supplier.category_tags.split(',').map(tag => (
                                                        <span key={tag} className="px-4 py-2 bg-orange-50 text-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-orange-100 shadow-sm transition-all hover:bg-orange-600 hover:text-white cursor-default">
                                                            {tag.trim()}
                                                        </span>
                                                    ))
                                                    : supplier.category_tags.map(tag => (
                                                        <span key={tag} className="px-4 py-2 bg-orange-50 text-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-orange-100 shadow-sm transition-all hover:bg-orange-600 hover:text-white cursor-default">
                                                            {tag}
                                                        </span>
                                                    ))
                                                }
                                            </div>
                                        </div>

                                        {/* Contact Panel */}
                                        <div className="space-y-6 pt-6 border-t border-slate-50">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                                <User size={14} className="text-[#D36A47]" />
                                                İLETİŞİM BİLGİLERİ
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl transition-all group">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#D36A47] group-hover:text-white transition-all">
                                                        <ClipboardCheck size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Yetkili Adı</p>
                                                        <p className="text-sm font-black text-slate-900">{supplier.authorized_person}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl transition-all group">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                                        <Phone size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Telefon Numarası</p>
                                                        <p className="text-sm font-black text-slate-900 font-mono tracking-wider">{supplier.phone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl transition-all group">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                        <Mail size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Kurumsal E-posta</p>
                                                        <p className="text-sm font-black text-slate-900 border-b border-dashed border-slate-200">{supplier.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Adress Panel */}
                                        <div className="space-y-6 pt-6 border-t border-slate-50">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                                <MapPin size={14} className="text-emerald-500" />
                                                FABRİKA / DEPO ADRESİ
                                            </div>
                                            <div className="p-6 bg-slate-50/80 rounded-[32px] border border-slate-100 text-sm font-bold text-slate-600 leading-relaxed shadow-inner">
                                                {supplier.factory_address}
                                                <div className="mt-4 flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-black text-[#D36A47] uppercase tracking-widest shadow-sm">
                                                    <Truck size={14} /> LOJİSTİK MESAFE: 42 KM
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. PANEL: Malzeme Atama ve Fiyat Listesi (Orta Alan) */}
                        <div className="xl:col-span-8 space-y-8 text-left">

                            {/* Malzeme Atama Bölümü */}
                            <div className="bg-white rounded-[40px] border border-white shadow-2xl shadow-slate-200/60 overflow-hidden group">
                                <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#D36A47] group-hover:rotate-6 transition-all duration-500">
                                            <Package size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Malzeme Atama Paneli</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tedarikçi fiyat ve termin sözleşmesi</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#D36A47]/10 p-4 rounded-2xl">
                                        <AlertCircle size={20} className="text-[#D36A47]" />
                                    </div>
                                </div>

                                <form onSubmit={handleAssignMaterial} className="p-10 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Malzeme Seçimi</label>
                                            <div className="relative">
                                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                                <select
                                                    required
                                                    name="material_id"
                                                    value={assignmentForm.material_id}
                                                    onChange={handleAssignmentChange}
                                                    className="w-full pl-12 pr-4 py-5 bg-slate-50/50 border border-slate-100 rounded-[24px] text-sm font-black focus:bg-white focus:border-[#D36A47] focus:shadow-xl focus:shadow-[#D36A47]/5 outline-none transition-all appearance-none"
                                                >
                                                    <option value="">Malzeme Kataloğundan Seçin</option>
                                                    {materials.map(m => (
                                                        <option key={m.id} value={m.id}>({m.code}) {m.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Birim Fiyat</label>
                                                <div className="relative">
                                                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D36A47]" />
                                                    <input
                                                        required
                                                        type="number"
                                                        step="0.01"
                                                        name="unit_price"
                                                        value={assignmentForm.unit_price}
                                                        onChange={handleAssignmentChange}
                                                        placeholder="0.00 TL"
                                                        className="w-full pl-12 pr-4 py-5 bg-slate-50/50 border border-slate-100 rounded-[24px] text-sm font-black focus:bg-white focus:border-[#D36A47] outline-none transition-all text-left"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Termin (Gün)</label>
                                                <div className="relative">
                                                    <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
                                                    <input
                                                        required
                                                        type="number"
                                                        name="lead_time_days"
                                                        value={assignmentForm.lead_time_days}
                                                        onChange={handleAssignmentChange}
                                                        placeholder="7 İş Günü"
                                                        className="w-full pl-12 pr-4 py-5 bg-slate-50/50 border border-slate-100 rounded-[24px] text-sm font-black focus:bg-white focus:border-[#D36A47] outline-none transition-all text-left"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Min. Sipariş</label>
                                                <div className="relative">
                                                    <LayoutGrid size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                                    <input
                                                        required
                                                        type="number"
                                                        name="min_order_quantity"
                                                        value={assignmentForm.min_order_quantity}
                                                        onChange={handleAssignmentChange}
                                                        placeholder="Miktar"
                                                        className="w-full pl-12 pr-4 py-5 bg-slate-50/50 border border-slate-100 rounded-[24px] text-sm font-black focus:bg-white focus:border-[#D36A47] outline-none transition-all text-left"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        <button
                                            type="submit"
                                            disabled={isAssigning}
                                            className="px-14 py-5 bg-[#0A1128] text-white rounded-[24px] text-xs font-black shadow-2xl shadow-[#0A1128]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 uppercase tracking-[0.3em] flex items-center gap-4"
                                        >
                                            {isAssigning ? <Clock className="animate-spin" size={18} /> : <CheckCircle2 size={18} className="text-emerald-400" />}
                                            Tedariği Onayla
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Fiyat Listesi & Malzeme Kartı Bağlantıları */}
                            <div className="bg-white rounded-[40px] border border-white shadow-2xl shadow-slate-200/60 overflow-hidden">
                                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                                            <FileText size={22} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Tedarik Edilen Malzemeler</h3>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Kayıtlı aktif sözleşmeler</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Toplam Malzeme</p>
                                            <p className="text-xl font-black text-slate-900 leading-none">{assignedMaterials.length}</p>
                                        </div>
                                        <div className="w-px h-10 bg-slate-100" />
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Bakiye Durumu</p>
                                            <p className="text-xl font-black text-orange-600 leading-none">AKTİF</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 z-20 bg-slate-50">
                                            <tr>
                                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-2/5 text-left">Malzeme & Malzeme Kartı</th>
                                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Birim Fiyat</th>
                                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Termin</th>
                                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Min. Sipariş</th>
                                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Analiz</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {assignedMaterials.length > 0 ? (
                                                assignedMaterials.map((item) => (
                                                    <tr key={item.id} className="group hover:bg-slate-50 transition-all duration-300">
                                                        <td className="px-10 py-8 text-left">
                                                            <div className="flex items-center gap-6">
                                                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover:bg-[#0A1128] group-hover:text-white transition-all transform group-hover:scale-105 duration-500">
                                                                    <Package size={24} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[14px] font-black text-slate-900 uppercase tracking-tight mb-1 group-hover:text-[#D36A47] transition-colors">{item.material_name}</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-black text-slate-400 tracking-wider">KOD: {item.material_code}</span>
                                                                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                                        <button className="text-[9px] font-black text-orange-500 uppercase tracking-widest hover:underline decoration-orange-300 underline-offset-4 decoration-2">MALZEME KARTINI AÇ</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-8 text-center">
                                                            <div className="inline-flex flex-col items-center p-3 rounded-2xl bg-slate-50/50 group-hover:bg-white group-hover:shadow-lg transition-all border border-transparent group-hover:border-slate-100 leading-tight">
                                                                <span className="text-md font-black text-[#0A1128]">
                                                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.unit_price)}
                                                                </span>
                                                                <span className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-widest">GÜNCEL FİYAT</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-8 text-center">
                                                            <div className="flex flex-col items-center leading-tight">
                                                                <span className="text-sm font-black text-slate-800">{item.lead_time_days} İŞ GÜNÜ</span>
                                                                <div className="w-12 h-1 bg-orange-50 rounded-full mt-2 overflow-hidden shadow-inner">
                                                                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, (item.lead_time_days / 15) * 100)}%` }}></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-8 text-center text-sm font-black text-slate-800">
                                                            {item.min_order_quantity} <span className="text-slate-400 text-[10px]">ADET</span>
                                                        </td>
                                                        <td className="px-10 py-8 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-orange-600 hover:shadow-lg transition-all" title="Fiyat Geçmişi Analizi">
                                                                    <TrendingUp size={18} />
                                                                </button>
                                                                <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-[#D36A47] hover:shadow-lg transition-all" title="İhale Geçmişi">
                                                                    <History size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="py-32 text-center grayscale opacity-60">
                                                        <div className="flex flex-col items-center gap-4">
                                                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 border-4 border-dashed border-slate-200">
                                                                <Package size={32} />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[12px] font-black text-slate-800 uppercase tracking-widest">Henüz Malzeme Atanmadı</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic">Üst panelden malzeme seçip onayla butonuna basın.</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SupplierDetails;
