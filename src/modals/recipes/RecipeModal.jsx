import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Info, Layers, Ruler, Plus, Trash2, Package, Hammer, Hash, ChevronRight } from 'lucide-react';

const initialFormState = {
    name: '',
    code: '',
    description: '',
    base_unit: 'm2',
    materials: [],
    labors: []
};

export default function RecipeModal({ isOpen, onClose, recipe, onSave, materials, labors }) {
    const [formData, setFormData] = useState(initialFormState);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        if (recipe) {
            setFormData({
                ...recipe,
                materials: recipe.recipe_materials || [],
                labors: recipe.recipe_labors || []
            });
        } else {
            setFormData(initialFormState);
        }
    }, [recipe, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addMaterial = () => {
        setFormData(prev => ({
            ...prev,
            materials: [...prev.materials, { material_id: '', quantity: 1, unit: 'm2', notes: '' }]
        }));
    };

    const updateMaterial = (index, field, value) => {
        const newMaterials = [...formData.materials];
        newMaterials[index] = { ...newMaterials[index], [field]: value };

        // Auto-fill unit if material selected
        if (field === 'material_id') {
            const selectedMat = materials.find(m => m.id === parseInt(value));
            if (selectedMat) {
                newMaterials[index].unit = selectedMat.unit;
            }
        }

        setFormData(prev => ({ ...prev, materials: newMaterials }));
    };

    const removeMaterial = (index) => {
        setFormData(prev => ({
            ...prev,
            materials: prev.materials.filter((_, i) => i !== index)
        }));
    };

    const addLabor = () => {
        setFormData(prev => ({
            ...prev,
            labors: [...prev.labors, { labor_id: '', quantity: 1, unit: 'm2', notes: '' }]
        }));
    };

    const updateLabor = (index, field, value) => {
        const newLabors = [...formData.labors];
        newLabors[index] = { ...newLabors[index], [field]: value };

        // Auto-fill unit if labor selected
        if (field === 'labor_id') {
            const selectedLabor = labors.find(l => l.id === parseInt(value));
            if (selectedLabor) {
                newLabors[index].unit = selectedLabor.unit;
            }
        }

        setFormData(prev => ({ ...prev, labors: newLabors }));
    };

    const removeLabor = (index) => {
        setFormData(prev => ({
            ...prev,
            labors: prev.labors.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1128]/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-scale-in">

                {/* Header */}
                <div className="relative p-6 md:p-8 bg-gradient-to-br from-[#0A1128] via-[#1E293B] to-[#0A1128] text-white">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#D36A47] flex items-center justify-center shadow-lg shadow-[#D36A47]/30">
                            <FileText size={28} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight uppercase">
                                {recipe ? 'Reçete Düzenle' : 'Yeni Reçete (Analiz) Oluştur'}
                            </h2>
                            <p className="text-white/50 text-xs font-bold tracking-widest uppercase mt-1">
                                {recipe ? `KOD: ${recipe.code}` : 'İmalat Analizi ve BOM Girişi'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1">
                    <button onClick={() => setActiveTab('general')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-[13px] font-bold transition-all ${activeTab === 'general' ? 'bg-white text-[#0A1128] shadow-sm' : 'text-slate-400'}`}>
                        <Info size={16} /> Künye Bilgileri
                    </button>
                    <button onClick={() => setActiveTab('bom')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-[13px] font-bold transition-all ${activeTab === 'bom' ? 'bg-white text-[#0A1128] shadow-sm' : 'text-slate-400'}`}>
                        <Layers size={16} /> Malzeme ve İşçilik (BOM)
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 md:p-8 space-y-8">

                        {activeTab === 'general' && (
                            <div className="space-y-6 animate-slide-up">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Reçete Adı</label>
                                        <input required name="name" value={formData.name} onChange={handleChange} placeholder="Örn: Lüks Banyo Zemin Paketi" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-[#D36A47] outline-none font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Reçete Kodu</label>
                                        <input name="code" value={formData.code} onChange={handleChange} placeholder="Örn: RCT-BNY-001" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-[#D36A47] outline-none font-medium" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ana Uygulama Birimi</label>
                                        <select name="base_unit" value={formData.base_unit} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none font-medium">
                                            <option value="m2">1 m2 (Metrekare)</option>
                                            <option value="mt">1 mt (Metretül)</option>
                                            <option value="m3">1 m3 (Metreküp)</option>
                                            <option value="Adet">1 Adet</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Açıklama</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Reçete detayları..." rows="3" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-[#D36A47] outline-none font-medium resize-none" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'bom' && (
                            <div className="space-y-8 animate-slide-up">
                                {/* Materials Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 text-sm font-black text-[#0A1128] uppercase tracking-wider">
                                            <Package size={18} className="text-[#D36A47]" /> Gerekli Malzemeler
                                        </h3>
                                        <button type="button" onClick={addMaterial} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D36A47]/10 text-[#D36A47] text-[11px] font-black rounded-lg hover:bg-[#D36A47] hover:text-white transition-all">
                                            <Plus size={14} /> MALZEME EKLE
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.materials.map((item, index) => (
                                            <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                                                <div className="flex-1 min-w-[200px]">
                                                    <select
                                                        value={item.material_id}
                                                        onChange={(e) => updateMaterial(index, 'material_id', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#D36A47]"
                                                    >
                                                        <option value="">Malzeme Seçin</option>
                                                        {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
                                                    </select>
                                                </div>
                                                <div className="w-24">
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        value={item.quantity}
                                                        onChange={(e) => updateMaterial(index, 'quantity', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#D36A47]"
                                                        placeholder="Çarpan"
                                                    />
                                                </div>
                                                <div className="w-20 text-center">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.unit}</span>
                                                </div>
                                                <button type="button" onClick={() => removeMaterial(index)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Labors Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 text-sm font-black text-[#0A1128] uppercase tracking-wider">
                                            <Hammer size={18} className="text-[#D36A47]" /> Gerekli İşçilikler
                                        </h3>
                                        <button type="button" onClick={addLabor} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[11px] font-black rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                                            <Plus size={14} /> İŞÇİLİK EKLE
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.labors.map((item, index) => (
                                            <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                                                <div className="flex-1 min-w-[200px]">
                                                    <select
                                                        value={item.labor_id}
                                                        onChange={(e) => updateLabor(index, 'labor_id', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-600"
                                                    >
                                                        <option value="">İşçilik Seçin</option>
                                                        {labors.map(l => <option key={l.id} value={l.id}>{l.name} ({l.code})</option>)}
                                                    </select>
                                                </div>
                                                <div className="w-24">
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        value={item.quantity}
                                                        onChange={(e) => updateLabor(index, 'quantity', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-600"
                                                        placeholder="Çarpan"
                                                    />
                                                </div>
                                                <div className="w-20 text-center">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.unit}</span>
                                                </div>
                                                <button type="button" onClick={() => removeLabor(index)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer */}
                    <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <button type="button" onClick={onClose} className="text-xs font-black text-slate-400 uppercase tracking-widest">İptal</button>
                        <button type="submit" className="flex items-center gap-2 px-10 py-4 bg-[#D36A47] text-white rounded-2xl text-xs font-black shadow-xl shadow-[#D36A47]/20 transition-all hover:scale-105 active:scale-95">
                            <Save size={16} /> KAYDET
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
