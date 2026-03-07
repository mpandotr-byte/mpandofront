import React, { useState, useEffect } from 'react';
import { X, Save, Package, Ruler, Truck, Info, Building2, Clock, Weight, Box, Layers, MoveRight, History } from 'lucide-react';
import { api } from '../../api/client';
import AddSupplierOfferModal from '../purchasing/AddSupplierOfferModal';

const initialFormState = {
    code: '', // Handle automatically on backend but maybe show if editing
    name: '',
    category: 'Kaba',
    supplier_id: '',
    unit: 'm²',
    width_cm: '',
    length_cm: '',
    thickness_mm: '',
    weight_per_unit: '',
    box_content_m2: '',
    box_piece_count: '',
    pallet_box_count: '',
    pallet_content_m2: '',
    pallet_gross_kg: '', // Auto calculated on backend but maybe show
    lead_time_days: '7'
};

export default function MaterialModal({ isOpen, onClose, material, onSave, suppliers, categories, units }) {
    const [formData, setFormData] = useState(initialFormState);
    const [activeTab, setActiveTab] = useState('general');
    const [fullMaterial, setFullMaterial] = useState(null);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        if (material) {
            setFormData({
                ...material,
                supplier_id: material.supplier_id || '',
                lead_time_days: material.lead_time_days || '7'
            });
            fetchMaterialDetails(material.id);
        } else {
            setFormData(initialFormState);
            setFullMaterial(null);
        }
    }, [material, isOpen]);

    const fetchMaterialDetails = async (id) => {
        setLoadingDetails(true);
        try {
            const data = await api.get(`/materials/catalog/${id}`);
            setFullMaterial(data);
        } catch (err) {
            console.error("Fetch material details error:", err);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleOfferSave = (newOffer) => {
        if (material?.id) {
            fetchMaterialDetails(material.id);
        }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        let processedValue = value;
        if (type === 'number') {
            processedValue = value === '' ? '' : parseFloat(value);
        } else if (name === 'supplier_id') {
            processedValue = value === '' ? '' : parseInt(value);
        }
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'general', label: 'Genel Bilgiler', icon: <Package size={16} />, color: 'bg-blue-500' },
        { id: 'technical', label: 'Teknik & Geometrik', icon: <Ruler size={16} />, color: 'bg-amber-500' },
        { id: 'logistics', label: 'Lojistik & Ambalaj', icon: <Truck size={16} />, color: 'bg-emerald-500' },
        { id: 'suppliers', label: 'Tedarikçiler & Fiyatlar', icon: <Building2 size={16} />, color: 'bg-purple-500' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1128]/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-scale-in">

                {/* Header */}
                <div className="relative p-6 md:p-8 bg-gradient-to-br from-[#0A1128] via-[#1E293B] to-[#0A1128] text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all hover:rotate-90"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#D36A47] flex items-center justify-center shadow-lg shadow-[#D36A47]/30">
                            <Package size={28} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight uppercase">
                                {material ? 'Malzeme Düzenle' : 'Yeni Malzeme Tanımla'}
                            </h2>
                            <p className="text-white/50 text-xs font-bold tracking-widest uppercase mt-1">
                                {material ? `KOD: ${material.code}` : 'Yeni Kayıt Oluşturuluyor'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-[13px] font-bold transition-all
                ${activeTab === tab.id
                                    ? 'bg-white text-[#0A1128] shadow-sm shadow-slate-200'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                        >
                            <span className={`${activeTab === tab.id ? 'text-[#D36A47]' : 'text-slate-300'}`}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto outline-none">
                    <div className="p-6 md:p-8 space-y-8">

                        {/* General Info Tab */}
                        {activeTab === 'general' && (
                            <div className="space-y-6 animate-slide-up">
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Malzeme Adı</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                                <Info size={18} />
                                            </div>
                                            <input
                                                required
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Örn: 60x120 Rektifiyeli Mat Porselen Seramik"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-[#D36A47] focus:ring-4 focus:ring-[#D36A47]/5 transition-all outline-none font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                                <Layers size={18} />
                                            </div>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm appearance-none focus:bg-white focus:border-[#D36A47] transition-all outline-none font-medium"
                                            >
                                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tedarikçi</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                                <Building2 size={18} />
                                            </div>
                                            <select
                                                name="supplier_id"
                                                value={formData.supplier_id}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm appearance-none focus:bg-white focus:border-[#D36A47] transition-all outline-none font-medium"
                                            >
                                                <option value="">Tedarikçi Seçin</option>
                                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Technical Tab */}
                        {activeTab === 'technical' && (
                            <div className="space-y-6 animate-slide-up">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Uygulama Birimi</label>
                                        <select
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm appearance-none focus:bg-white focus:border-[#D36A47] transition-all outline-none font-medium"
                                        >
                                            {units.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Yoğunluk / Özgül Ağırlık (kg/{formData.unit})</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                                <Weight size={18} />
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="weight_per_unit"
                                                value={formData.weight_per_unit}
                                                onChange={handleChange}
                                                placeholder="Örn: 22"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-[#D36A47] transition-all outline-none font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 space-y-4">
                                    <p className="text-[10px] font-black text-[#D36A47] uppercase tracking-[0.2em]">Birim Boyutlar (cm / mm)</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500">Genişlik (cm)</label>
                                            <input
                                                type="number"
                                                name="width_cm"
                                                value={formData.width_cm}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#D36A47]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500">Uzunluk (cm)</label>
                                            <input
                                                type="number"
                                                name="length_cm"
                                                value={formData.length_cm}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#D36A47]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500">Kalınlık (mm)</label>
                                            <input
                                                type="number"
                                                name="thickness_mm"
                                                value={formData.thickness_mm}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#D36A47]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Logistics Tab */}
                        {activeTab === 'logistics' && (
                            <div className="space-y-6 animate-slide-up">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-blue-50/30 rounded-[24px] border border-blue-100/50 space-y-4">
                                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                                            <Box size={16} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Kutu Özellikleri</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500">Kutu İçeriği ({formData.unit})</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="box_content_m2"
                                                    value={formData.box_content_m2}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500">Kutu Adet Sayısı</label>
                                                <input
                                                    type="number"
                                                    name="box_piece_count"
                                                    value={formData.box_piece_count}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-emerald-50/30 rounded-[24px] border border-emerald-100/50 space-y-4">
                                        <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                            <Layers size={16} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Palet Özellikleri</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500">Palet Kutu Sayısı</label>
                                                <input
                                                    type="number"
                                                    name="pallet_box_count"
                                                    value={formData.pallet_box_count}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500">Palet Toplam İçerik ({formData.unit})</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="pallet_content_m2"
                                                    value={formData.pallet_content_m2}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tedarik Termin Süresi (Gün)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                                <Clock size={18} />
                                            </div>
                                            <input
                                                type="number"
                                                name="lead_time_days"
                                                value={formData.lead_time_days}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-[#D36A47] transition-all outline-none font-medium"
                                            />
                                        </div>
                                    </div>
                                    {material && (
                                        <div className="space-y-2 opacity-60">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Palet Brüt Ağırlık (kg)</label>
                                            <div className="w-full px-4 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600">
                                                {formData.pallet_gross_kg || 'Hesaplanıyor...'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Suppliers Tab */}
                        {activeTab === 'suppliers' && (
                            <div className="space-y-6 animate-slide-up">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                            <Building2 size={16} />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Aktif Tedarikçi Teklifleri</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsOfferModalOpen(true)}
                                        className="text-[10px] font-black text-[#D36A47] uppercase tracking-[0.1em] hover:opacity-80 transition-opacity"
                                    >
                                        + YENİ TEKLİF EKLE
                                    </button>
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/30">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100/50">
                                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tedarikçi</th>
                                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Birim Fiyat</th>
                                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Termin</th>
                                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Son Güncelleme</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {(fullMaterial?.available_suppliers || []).length > 0 ? (
                                                (fullMaterial?.available_suppliers || []).map((item, index) => (
                                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#D36A47]/10 group-hover:text-[#D36A47] transition-all">
                                                                    <Building2 size={14} />
                                                                </div>
                                                                <span className="text-[12px] font-bold text-slate-700">{item.supplier_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-[12px] font-black text-[#0A1128]">
                                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.unit_price)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Clock size={12} className="text-slate-300" />
                                                                <span className="text-[12px] font-semibold text-slate-500">{item.lead_time_days} Gün</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-[11px] font-medium text-slate-400">
                                                                {new Date(item.last_updated).toLocaleDateString('tr-TR')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className="text-slate-300 hover:text-[#D36A47] p-2 transition-all">
                                                                <History size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                                <Building2 size={20} />
                                                            </div>
                                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Henüz teklif bulunmuyor</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Price History Chart */}
                                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-slate-400" />
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Geçmiş Fiyat Analizi</p>
                                        </div>
                                        {material?.price_history?.length > 1 && (
                                            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                                Fiyat Hareketliliği Aktif
                                            </span>
                                        )}
                                    </div>
                                    <div className="h-24 flex items-end gap-1 px-2">
                                        {material?.price_history?.length > 0 ? (
                                            material.price_history.slice(-10).map((offer, i) => (
                                                <div
                                                    key={i}
                                                    title={`${offer.unit_price} TRY - ${new Date(offer.created_at).toLocaleDateString()}`}
                                                    className="flex-1 bg-slate-200 rounded-t-sm hover:bg-[#D36A47] transition-all cursor-pointer"
                                                    style={{ height: `${Math.min(100, (offer.unit_price / (Math.max(...material.price_history.map(o => o.unit_price)) || 1)) * 100)}%` }}
                                                ></div>
                                            ))
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300 uppercase font-black">Yeterli veri bulunmuyor</div>
                                        )}
                                    </div>
                                    <div className="flex justify-between px-1 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                        <span>Giriş</span>
                                        <span>Gelişim</span>
                                        <span>Güncel</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                        >
                            Vazgeç
                        </button>
                        <div className="flex gap-3">
                            {activeTab !== 'suppliers' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const tabOrder = ['general', 'technical', 'logistics', 'suppliers'];
                                        const currentIndex = tabOrder.indexOf(activeTab);
                                        setActiveTab(tabOrder[currentIndex + 1]);
                                    }}
                                    className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-[#0A1128] rounded-2xl text-xs font-black shadow-sm transition-all hover:bg-slate-50 active:scale-95 uppercase tracking-wider"
                                >
                                    Sonraki Adım <MoveRight size={14} />
                                </button>
                            )}
                            {activeTab === 'suppliers' && (
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-10 py-4 bg-[#D36A47] text-white rounded-2xl text-xs font-black shadow-xl shadow-[#D36A47]/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-wider"
                                >
                                    <Save size={16} />
                                    <span>KAYDET</span>
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* Add Offer Modal */}
            <AddSupplierOfferModal
                isOpen={isOfferModalOpen}
                onClose={() => setIsOfferModalOpen(false)}
                onSave={handleOfferSave}
                materialId={material?.id}
                materialName={formData.name}
            />
        </div>
    );
}
