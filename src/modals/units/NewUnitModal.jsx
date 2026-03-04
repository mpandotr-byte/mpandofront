import React, { useState, useEffect } from 'react';
import { X, Save, Home, LayoutGrid, CheckCircle, Compass, Banknote } from 'lucide-react';

const NewUnitModal = ({ isOpen, onClose, onAdd, floorId, unitData = null }) => {
    const isEdit = !!unitData;

    const [formData, setFormData] = useState({
        unit_number: '',
        unit_type: '2+1',
        sales_status: 'AVAILABLE',
        facade: '',
        price: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (unitData) {
                setFormData({
                    unit_number: unitData.unit_number ?? '',
                    unit_type: unitData.unit_type ?? '2+1',
                    sales_status: unitData.sales_status ?? 'AVAILABLE',
                    facade: unitData.facade ?? '',
                    price: unitData.price ?? ''
                });
            } else {
                setFormData({
                    unit_number: '',
                    unit_type: '2+1',
                    sales_status: 'AVAILABLE',
                    facade: '',
                    price: ''
                });
            }
        }
    }, [isOpen, unitData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            ...formData,
            floor_id: floorId,
            id: unitData?.id
        });
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto pt-20">
            <div className="bg-white rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.3)] w-full max-w-lg overflow-hidden border border-white/20 flex flex-col animate-in slide-in-from-top-10 duration-500 cubic-bezier(0.16, 1, 0.3, 1)">

                {/* --- Header --- */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">{isEdit ? 'Üniteyi Düzenle' : 'Yeni Ünite Ekle'}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Daire / bağımsız bölüm detaylarını tanımlayın.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* --- Form Body --- */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    <form id="new-unit-form" onSubmit={handleSubmit} className="space-y-4">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Ünite Numarası */}
                            <div className="space-y-1.5 focus-within:z-10">
                                <label className="text-sm font-medium text-slate-700">Daire / Ünite No <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Home size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        name="unit_number"
                                        value={formData.unit_number}
                                        onChange={handleChange}
                                        placeholder="Örn: 201, 1A"
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Ünite Tipi */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Ünite Tipi</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <LayoutGrid size={16} />
                                    </div>
                                    <select
                                        name="unit_type"
                                        value={formData.unit_type}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                                    >
                                        <option value="1+0">1+0</option>
                                        <option value="1+1">1+1</option>
                                        <option value="2+1">2+1</option>
                                        <option value="3+1">3+1</option>
                                        <option value="4+1">4+1</option>
                                        <option value="Penthouse">Penthouse</option>
                                        <option value="Dükkan">Dükkan</option>
                                        <option value="Ofis">Ofis</option>
                                    </select>
                                </div>
                            </div>

                            {/* Satış Durumu */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Satış Durumu</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <CheckCircle size={16} />
                                    </div>
                                    <select
                                        name="sales_status"
                                        value={formData.sales_status}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm font-semibold"
                                    >
                                        <option value="AVAILABLE" className="text-green-600">Satılık (Müsait)</option>
                                        <option value="RESERVED" className="text-yellow-600">Rezerve</option>
                                        <option value="SOLD" className="text-red-600">Satıldı</option>
                                    </select>
                                </div>
                            </div>

                            {/* Cephe */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Cephe</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Compass size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        name="facade"
                                        value={formData.facade}
                                        onChange={handleChange}
                                        placeholder="Örn: Kuzey-Batı"
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Fiyat */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Fiyat (₺)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Banknote size={16} />
                                    </div>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="Satış Fiyatı"
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400 font-bold text-emerald-600"
                                    />
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* --- Footer --- */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        İptal
                    </button>
                    <button
                        type="submit"
                        form="new-unit-form"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                    >
                        <Save size={16} />
                        {isEdit ? 'Kaydet' : 'Üniteyi Ekle'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default NewUnitModal;
