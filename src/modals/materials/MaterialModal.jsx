import React, { useState, useEffect } from 'react';
import { X, Save, Package, Ruler, Truck, Info, Building2, Clock, Weight, Box, Layers, MoveRight } from 'lucide-react';

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

    useEffect(() => {
        if (material) {
            setFormData({
                ...material,
                supplier_id: material.supplier_id || '',
                lead_time_days: material.lead_time_days || '7'
            });
        } else {
            setFormData(initialFormState);
        }
    }, [material, isOpen]);

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
        { id: 'logistics', label: 'Lojistik & Ambalaj', icon: <Truck size={16} />, color: 'bg-emerald-500' }
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
                            {activeTab !== 'logistics' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const nextTab = activeTab === 'general' ? 'technical' : 'logistics';
                                        setActiveTab(nextTab);
                                    }}
                                    className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-[#0A1128] rounded-2xl text-xs font-black shadow-sm transition-all hover:bg-slate-50 active:scale-95 uppercase tracking-wider"
                                >
                                    Sonraki Adım <MoveRight size={14} />
                                </button>
                            )}
                            {activeTab === 'logistics' && (
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
        </div>
    );
}
