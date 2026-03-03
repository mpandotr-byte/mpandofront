import React, { useState, useEffect } from 'react';
import { X, Save, Maximize, Ruler, Type, Hash, AlignLeft, DoorOpen, Layout } from 'lucide-react';

const NewRoomModal = ({ isOpen, onClose, onAdd, unitId, roomData = null }) => {
    const isEdit = !!roomData;

    const [formData, setFormData] = useState({
        name: '',
        room_type: '',
        area_m2: '',
        perimeter_m: '',
        wall_area_m2: '',
        ceiling_area_m2: '',
        door_count: 0,
        window_count: 0,
        floor_height_m: '',
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (roomData) {
                setFormData({
                    name: roomData.name || '',
                    room_type: roomData.room_type || '',
                    area_m2: roomData.area_m2 || roomData.area || '',
                    perimeter_m: roomData.perimeter_m || '',
                    wall_area_m2: roomData.wall_area_m2 || '',
                    ceiling_area_m2: roomData.ceiling_area_m2 || '',
                    door_count: roomData.door_count || 0,
                    window_count: roomData.window_count || 0,
                    floor_height_m: roomData.floor_height_m || '',
                    notes: roomData.notes || ''
                });
            } else {
                setFormData({
                    name: '',
                    room_type: '',
                    area_m2: '',
                    perimeter_m: '',
                    wall_area_m2: '',
                    ceiling_area_m2: '',
                    door_count: 0,
                    window_count: 0,
                    floor_height_m: '',
                    notes: ''
                });
            }
        }
    }, [isOpen, roomData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            ...formData,
            unit_id: unitId,
            id: roomData?.id,
            area_m2: formData.area_m2 !== '' ? parseFloat(formData.area_m2) : null,
            perimeter_m: formData.perimeter_m !== '' ? parseFloat(formData.perimeter_m) : null,
            wall_area_m2: formData.wall_area_m2 !== '' ? parseFloat(formData.wall_area_m2) : null,
            ceiling_area_m2: formData.ceiling_area_m2 !== '' ? parseFloat(formData.ceiling_area_m2) : null,
            floor_height_m: formData.floor_height_m !== '' ? parseFloat(formData.floor_height_m) : null,
            door_count: parseInt(formData.door_count) || 0,
            window_count: parseInt(formData.window_count) || 0
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">{isEdit ? 'Odayı Düzenle' : 'Yeni Oda Ekle'}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Daireye oda veya mekan detaylarını ekleyin.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 overflow-y-auto">
                    <form id="new-room-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Oda Bilgileri */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Type size={14} /> Temel Bilgiler
                                </h3>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Oda Adı <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Type size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Örn: Salon, Yatak Odası"
                                            required
                                            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {['Salon', 'Yatak Odası', 'Mutfak', 'Banyo', 'Antre', 'Balkon'].map(preset => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, name: preset, room_type: preset }))}
                                                className="text-[10px] bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 px-2 py-1 rounded transition-colors"
                                            >
                                                + {preset}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Oda Tipi</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Layout size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            name="room_type"
                                            value={formData.room_type}
                                            onChange={handleChange}
                                            placeholder="Örn: Islak Hacim, Kuru Hacim"
                                            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Ölçüler */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Maximize size={14} /> Ölçüler ve Teknik Detaylar
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Zemin Alanı (m²)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="area_m2"
                                            value={formData.area_m2}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Tavan Alanı (m²)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="ceiling_area_m2"
                                            value={formData.ceiling_area_m2}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Duvar Alanı (m²)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="wall_area_m2"
                                            value={formData.wall_area_m2}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Kat Yüksekliği (m)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="floor_height_m"
                                            value={formData.floor_height_m}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Kapı Sayısı</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                <X size={14} />
                                            </div>
                                            <input
                                                type="number"
                                                name="door_count"
                                                value={formData.door_count}
                                                onChange={handleChange}
                                                className="block w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Pencere Sayısı</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                <Layout size={14} />
                                            </div>
                                            <input
                                                type="number"
                                                name="window_count"
                                                value={formData.window_count}
                                                onChange={handleChange}
                                                className="block w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notlar */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <AlignLeft size={16} /> Notlar
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Oda hakkında ek bilgiler..."
                                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400 resize-none"
                            ></textarea>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 sticky bottom-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        İptal
                    </button>
                    <button
                        type="submit"
                        form="new-room-form"
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-100"
                    >
                        <Save size={18} />
                        {isEdit ? 'Değişiklikleri Kaydet' : 'Odayı Kaydet'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewRoomModal;
