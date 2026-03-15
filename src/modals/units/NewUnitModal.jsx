import React, { useState, useEffect } from 'react';
import { X, Save, Home, LayoutGrid, Compass, Maximize2, DoorOpen, DoorClosed, Sparkles } from 'lucide-react';

// Ünite tipine göre varsayılan kapı/pencere sayıları
const UNIT_DEFAULTS = {
    '1+0': { exterior_door_count: 1, interior_door_count: 2, window_count: 2 },
    '1+1': { exterior_door_count: 1, interior_door_count: 3, window_count: 3 },
    '2+1': { exterior_door_count: 1, interior_door_count: 5, window_count: 5 },
    '3+1': { exterior_door_count: 1, interior_door_count: 6, window_count: 6 },
    '4+1': { exterior_door_count: 1, interior_door_count: 7, window_count: 8 },
    'Penthouse': { exterior_door_count: 1, interior_door_count: 8, window_count: 12 },
    'Dükkan': { exterior_door_count: 2, interior_door_count: 1, window_count: 3 },
    'Ofis': { exterior_door_count: 1, interior_door_count: 3, window_count: 4 },
};

const NewUnitModal = ({ isOpen, onClose, onAdd, floorId, unitData = null }) => {
    const isEdit = !!unitData;

    const [formData, setFormData] = useState({
        unit_number: '',
        unit_type: '2+1',
        facade: '',
        gross_area: '',
        net_area: '',
        exterior_door_count: 1,
        interior_door_count: 5,
        window_count: 5
    });

    useEffect(() => {
        if (isOpen) {
            if (unitData) {
                const defaults = UNIT_DEFAULTS[unitData.unit_type] || UNIT_DEFAULTS['2+1'];
                setFormData({
                    unit_number: unitData.unit_number ?? '',
                    unit_type: unitData.unit_type ?? '2+1',
                    facade: unitData.facade ?? '',
                    gross_area: unitData.gross_area ?? '',
                    net_area: unitData.net_area ?? '',
                    exterior_door_count: unitData.exterior_door_count ?? defaults.exterior_door_count,
                    interior_door_count: unitData.interior_door_count ?? defaults.interior_door_count,
                    window_count: unitData.window_count ?? defaults.window_count
                });
            } else {
                const defaults = UNIT_DEFAULTS['2+1'];
                setFormData({
                    unit_number: '',
                    unit_type: '2+1',
                    facade: '',
                    gross_area: '',
                    net_area: '',
                    exterior_door_count: defaults.exterior_door_count,
                    interior_door_count: defaults.interior_door_count,
                    window_count: defaults.window_count
                });
            }
        }
    }, [isOpen, unitData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'unit_type') {
            const defaults = UNIT_DEFAULTS[value] || UNIT_DEFAULTS['2+1'];
            setFormData(prev => ({
                ...prev,
                unit_type: value,
                exterior_door_count: defaults.exterior_door_count,
                interior_door_count: defaults.interior_door_count,
                window_count: defaults.window_count
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            ...formData,
            floor_id: floorId,
            id: unitData?.id
        });
    };

    const totalDoors = (parseInt(formData.exterior_door_count) || 0) + (parseInt(formData.interior_door_count) || 0);

    return (
        <div className="fixed inset-0 z-[10000] flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto pt-20">
            <div className="bg-white rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.3)] w-full max-w-2xl overflow-hidden border border-white/20 flex flex-col animate-in slide-in-from-top-10 duration-500 cubic-bezier(0.16, 1, 0.3, 1)">

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
                    <form id="new-unit-form" onSubmit={handleSubmit} className="space-y-5">

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

                            {/* Brüt Alan */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Brüt Alan (m²)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Maximize2 size={16} />
                                    </div>
                                    <input
                                        type="number"
                                        name="gross_area"
                                        value={formData.gross_area}
                                        onChange={handleChange}
                                        placeholder="Örn: 120"
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Net Alan */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Net Alan (m²)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Maximize2 size={16} />
                                    </div>
                                    <input
                                        type="number"
                                        name="net_area"
                                        value={formData.net_area}
                                        onChange={handleChange}
                                        placeholder="Örn: 100"
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Kapı ve Pencere Bölümü */}
                        <div className="mt-2 p-4 bg-gradient-to-br from-orange-50/80 to-amber-50/50 rounded-2xl border border-orange-100">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles size={14} className="text-orange-500" />
                                <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest">Kapı & Pencere Bilgileri</span>
                                <span className="text-[9px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">OTOMATİK</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {/* Dış Kapı */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-orange-600 uppercase tracking-wide flex items-center gap-1">
                                        <DoorClosed size={12} /> Dış Kapı
                                    </label>
                                    <input
                                        type="number"
                                        name="exterior_door_count"
                                        value={formData.exterior_door_count}
                                        onChange={handleChange}
                                        min="0"
                                        className="block w-full px-3 py-2.5 bg-white border border-orange-200 rounded-xl text-sm font-bold text-orange-900 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all text-center"
                                    />
                                </div>
                                {/* İç Kapı */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-orange-600 uppercase tracking-wide flex items-center gap-1">
                                        <DoorOpen size={12} /> İç Kapı
                                    </label>
                                    <input
                                        type="number"
                                        name="interior_door_count"
                                        value={formData.interior_door_count}
                                        onChange={handleChange}
                                        min="0"
                                        className="block w-full px-3 py-2.5 bg-white border border-orange-200 rounded-xl text-sm font-bold text-orange-900 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all text-center"
                                    />
                                </div>
                                {/* Pencere */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wide flex items-center gap-1">
                                        <Maximize2 size={12} /> Pencere
                                    </label>
                                    <input
                                        type="number"
                                        name="window_count"
                                        value={formData.window_count}
                                        onChange={handleChange}
                                        min="0"
                                        className="block w-full px-3 py-2.5 bg-white border border-blue-200 rounded-xl text-sm font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all text-center"
                                    />
                                </div>
                            </div>
                            <p className="text-[9px] text-orange-500/70 mt-2 text-center font-medium">
                                Toplam {totalDoors} kapı ({formData.exterior_door_count} dış + {formData.interior_door_count} iç) ve {formData.window_count} pencere
                            </p>
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
