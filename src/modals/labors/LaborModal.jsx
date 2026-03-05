import React, { useState, useEffect } from 'react';
import { X, Save, Hammer, Info, Layers, Ruler, Hash, Clock, CircleDollarSign } from 'lucide-react';

const initialFormState = {
    code: '',
    name: '',
    category_id: '',
    unit: 'm²',
    unit_price: '',
    currency: 'TRY',
    notes: ''
};

export default function LaborModal({ isOpen, onClose, labor, onSave, categories, units }) {
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (labor) {
            setFormData({
                ...labor,
                category_id: labor.category_id || '',
                unit: labor.unit || 'm²',
                unit_price: labor.unit_price || '',
                currency: labor.currency || 'TRY',
                notes: labor.notes || ''
            });
        } else {
            setFormData(initialFormState);
        }
    }, [labor, isOpen]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        let processedValue = value;
        if (type === 'number') {
            processedValue = value === '' ? '' : parseFloat(value);
        } else if (name === 'category_id') {
            processedValue = value === '' ? '' : parseInt(value);
        }
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1128]/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-scale-in">

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
                            <Hammer size={28} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight uppercase">
                                {labor ? 'İşçilik Düzenle' : 'Yeni İşçilik Tanımla'}
                            </h2>
                            <p className="text-white/50 text-xs font-bold tracking-widest uppercase mt-1">
                                {labor ? `KOD: ${labor.code}` : 'Yeni Hizmet Kalemi Oluşturuluyor'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto outline-none">
                    <div className="p-6 md:p-8 space-y-6">

                        <div className="grid grid-cols-1 gap-6">
                            {/* Labor Name */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">İşçilik Adı</label>
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
                                        placeholder="Örn: Seramik Döşeme İşçiliği - 60x120"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-[#D36A47] focus:ring-4 focus:ring-[#D36A47]/5 transition-all outline-none font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Work Group (Category) */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">İş Grubu</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                        <Layers size={18} />
                                    </div>
                                    <select
                                        required
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm appearance-none focus:bg-white focus:border-[#D36A47] transition-all outline-none font-medium"
                                    >
                                        <option value="">İş Grubu Seçin</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Unit */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Uygulama Birimi</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                        <Ruler size={18} />
                                    </div>
                                    <select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm appearance-none focus:bg-white focus:border-[#D36A47] transition-all outline-none font-medium"
                                    >
                                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Unit Price */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Birim Fiyat</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                        <CircleDollarSign size={18} />
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="unit_price"
                                        value={formData.unit_price}
                                        onChange={handleChange}
                                        placeholder="Örn: 250"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-[#D36A47] transition-all outline-none font-medium"
                                    />
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                        <span className="text-xs font-bold text-slate-400">TRY</span>
                                    </div>
                                </div>
                            </div>

                            {/* Code (Display Only or Preview) */}
                            <div className="space-y-2 opacity-60">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">İşçilik Kodu</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                        <Hash size={18} />
                                    </div>
                                    <div className="w-full pl-12 pr-4 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600">
                                        {formData.code || 'Sistem Tarafından Atanacak'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Notlar / Açıklama</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="İşçilik detayları ve özel notlar..."
                                rows="3"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-[#D36A47] transition-all outline-none font-medium resize-none"
                            />
                        </div>

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
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-10 py-4 bg-[#D36A47] text-white rounded-2xl text-xs font-black shadow-xl shadow-[#D36A47]/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-wider"
                        >
                            <Save size={16} />
                            <span>KAYDET</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
