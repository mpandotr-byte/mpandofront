import React, { useState, useEffect } from 'react';
import { X, Save, Building2, Layers } from 'lucide-react';

const BlockModal = ({ isOpen, onClose, onSave, projectId, blockData = null }) => {
    const isEdit = !!blockData;

    const [formData, setFormData] = useState({
        name: '',
        floor_count: '',
        building_type: 'Konut',
        foundation_area_m2: '',
        total_facade_m2: '',
        elevator_count: ''
    });

    useEffect(() => {
        if (isOpen) {
            console.log("Modal opened with blockData:", blockData);
            if (blockData) {
                setFormData({
                    name: blockData.name ?? '',
                    floor_count: blockData.floor_count ?? '',
                    building_type: blockData.building_type ?? 'Konut',
                    foundation_area_m2: blockData.foundation_area_m2 ?? blockData.foundation_area ?? '',
                    total_facade_m2: blockData.total_facade_m2 ?? blockData.total_facade ?? '',
                    elevator_count: blockData.elevator_count ?? ''
                });
            } else {
                setFormData({
                    name: '',
                    floor_count: '',
                    building_type: 'Konut',
                    foundation_area_m2: '',
                    total_facade_m2: '',
                    elevator_count: ''
                });
            }
        }
    }, [isOpen, blockData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: blockData?.id,
            project_id: projectId,
            floor_count: parseInt(formData.floor_count || 0),
            foundation_area_m2: formData.foundation_area_m2 !== '' ? parseFloat(formData.foundation_area_m2) : null,
            total_facade_m2: formData.total_facade_m2 !== '' ? parseFloat(formData.total_facade_m2) : null,
            elevator_count: formData.elevator_count !== '' ? parseInt(formData.elevator_count) : 0
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col">

                {/* --- Header --- */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">{isEdit ? 'Bloku Düzenle' : 'Yeni Blok Ekle'}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {isEdit ? 'Blok bilgilerini güncelleyin.' : 'Projeye yeni bir yapı bloğu tanımlayın.'}
                        </p>
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
                    <form id="block-form" onSubmit={handleSubmit} className="space-y-4">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Blok Adı */}
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Blok Adı / Tanımı <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Building2 size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Örn: A Blok, Ana Bina"
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Yapı Tipi */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Yapı Tipi</label>
                                <select
                                    name="building_type"
                                    value={formData.building_type}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                                >
                                    <option value="Konut">Konut</option>
                                    <option value="Ticari">Ticari</option>
                                    <option value="Karma">Karma</option>
                                    <option value="Endüstriyel">Endüstriyel</option>
                                </select>
                            </div>

                            {/* Kat Sayısı */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Kat Sayısı <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Layers size={16} />
                                    </div>
                                    <input
                                        type="number"
                                        name="floor_count"
                                        value={formData.floor_count}
                                        onChange={handleChange}
                                        placeholder="Örn: 5"
                                        required
                                        min="1"
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Temel Alanı */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Temel Alanı (m²)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="foundation_area_m2"
                                    value={formData.foundation_area_m2}
                                    onChange={handleChange}
                                    placeholder="Örn: 450.50"
                                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                                />
                            </div>

                            {/* Dış Cephe Alanı */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Dış Cephe Alanı (m²)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="total_facade_m2"
                                    value={formData.total_facade_m2}
                                    onChange={handleChange}
                                    placeholder="Örn: 2200.00"
                                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                                />
                            </div>

                            {/* Asansör Sayısı */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Asansör Sayısı</label>
                                <input
                                    type="number"
                                    name="elevator_count"
                                    value={formData.elevator_count}
                                    onChange={handleChange}
                                    placeholder="Örn: 2"
                                    min="0"
                                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                                />
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
                        form="block-form"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                    >
                        <Save size={16} />
                        {isEdit ? 'Değişiklikleri Kaydet' : 'Bloku Ekle'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default BlockModal;

