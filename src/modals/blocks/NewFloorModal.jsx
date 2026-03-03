import React, { useState, useEffect } from 'react';
import { X, Save, Layers, Ruler, Maximize, Grid3X3, Pi, Hash } from 'lucide-react';

const NewFloorModal = ({ isOpen, onClose, onAdd, blockId, floorData = null, maxFloors = null }) => {
    const isEdit = !!floorData;

    const [formData, setFormData] = useState({
        floor_number: '',
        height_cm: '300',
        gross_area_m2: '',
        common_area_m2: '',
        column_count: '',
        beam_count: '',
        slab_area_m2: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (floorData) {
                setFormData({
                    floor_number: floorData.floor_number ?? '',
                    height_cm: floorData.height_cm ?? '300',
                    gross_area_m2: floorData.gross_area_m2 ?? floorData.gross_area ?? '',
                    common_area_m2: floorData.common_area_m2 ?? floorData.common_area ?? '',
                    column_count: floorData.column_count ?? '',
                    beam_count: floorData.beam_count ?? '',
                    slab_area_m2: floorData.slab_area_m2 ?? floorData.slab_area ?? ''
                });
            } else {
                setFormData({
                    floor_number: '',
                    height_cm: '300',
                    gross_area_m2: '',
                    common_area_m2: '',
                    column_count: '',
                    beam_count: '',
                    slab_area_m2: ''
                });
            }
        }
    }, [isOpen, floorData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            ...formData,
            block_id: blockId,
            id: floorData?.id,
            floor_number: parseInt(formData.floor_number),
            height_cm: parseFloat(formData.height_cm || 300),
            gross_area_m2: formData.gross_area_m2 !== '' ? parseFloat(formData.gross_area_m2) : null,
            common_area_m2: formData.common_area_m2 !== '' ? parseFloat(formData.common_area_m2) : null,
            column_count: formData.column_count !== '' ? parseInt(formData.column_count) : null,
            beam_count: formData.beam_count !== '' ? parseInt(formData.beam_count) : null,
            slab_area_m2: formData.slab_area_m2 !== '' ? parseFloat(formData.slab_area_m2) : null
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col">

                {/* --- Header --- */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">{isEdit ? 'Katı Düzenle' : 'Yeni Kat Ekle'}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Blok içine kat detaylarını tanımlayın.</p>
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
                    <form id="new-floor-form" onSubmit={handleSubmit} className="space-y-4">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Kat Numarası */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Kat Numarası <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Layers size={16} />
                                    </div>
                                    <input
                                        type="number"
                                        name="floor_number"
                                        value={formData.floor_number}
                                        onChange={handleChange}
                                        placeholder={maxFloors ? `Maks: ${maxFloors}` : "Örn: 1, 0, -1"}
                                        required
                                        max={maxFloors}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Kat Yüksekliği */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Kat Yüksekliği (cm)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Ruler size={16} />
                                    </div>
                                    <input
                                        type="number"
                                        name="height_cm"
                                        value={formData.height_cm}
                                        onChange={handleChange}
                                        placeholder="300"
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Brüt Alan */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Brüt Alan (m²)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Maximize size={16} />
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="gross_area_m2"
                                        value={formData.gross_area_m2}
                                        onChange={handleChange}
                                        placeholder="Örn: 500.25"
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Ortak Alan */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Ortak Alan (m²)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Pi size={16} />
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="common_area_m2"
                                        value={formData.common_area_m2}
                                        onChange={handleChange}
                                        placeholder="Örn: 50.00"
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Döşeme Alanı */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Beton Döşeme Alanı (m²)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Grid3X3 size={16} />
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="slab_area_m2"
                                        value={formData.slab_area_m2}
                                        onChange={handleChange}
                                        placeholder="Örn: 420.00"
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Kolon Sayısı */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Kolon Sayısı</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Hash size={16} />
                                    </div>
                                    <input
                                        type="number"
                                        name="column_count"
                                        value={formData.column_count}
                                        onChange={handleChange}
                                        placeholder="Örn: 24"
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Kiriş Sayısı */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Kiriş Sayısı</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Hash size={16} />
                                    </div>
                                    <input
                                        type="number"
                                        name="beam_count"
                                        value={formData.beam_count}
                                        onChange={handleChange}
                                        placeholder="Örn: 32"
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
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
                        form="new-floor-form"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                    >
                        <Save size={16} />
                        {isEdit ? 'Kaydet' : 'Katı Ekle'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default NewFloorModal;
