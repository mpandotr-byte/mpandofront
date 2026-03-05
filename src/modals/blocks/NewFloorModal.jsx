import React, { useState, useEffect } from 'react';
import { X, Save, Layers, Maximize, Grid3X3, Pi, Hash, Info } from 'lucide-react';
import { api } from '../../api/client';

const NewFloorModal = ({ isOpen, onClose, onAdd, blockId, floorData = null }) => {
    const isEdit = !!floorData;
    const [recipes, setRecipes] = useState([]);

    const [formData, setFormData] = useState({
        floor_number: '',
        height_cm: '300',
        gross_area_m2: '',
        common_area_m2: '',
        wall_area_m2: '',
        stairs_m3: '',
        stairs_mt: '',
        stairs_coating_m2: '',
        column_count: '',
        column_m3: '',
        beam_mt: '',
        beam_m3: '',
        slab_area_m2: '',
        reinforcement_type: '',
        // Reçete Atamaları (Kaba)
        beton_recipe_id: '',
        kiris_recipe_id: '',
        kolon_recipe_id: '',
        demir_recipe_id: '',
        // İnce Yapı (Ortak)
        hall_floor_recipe_id: '',
        hall_wall_recipe_id: '',
        hall_ceiling_recipe_id: '',
        stairs_recipe_id: '',
        extra_recipe_id: ''
    });

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const data = await api.get('/recipes');
                setRecipes(data || []);
            } catch (err) {
                console.error("Recipe fetch error:", err);
            }
        };

        if (isOpen) {
            fetchRecipes();
            if (floorData) {
                setFormData({
                    floor_number: floorData.floor_number ?? '',
                    height_cm: floorData.height_cm ?? '300',
                    gross_area_m2: floorData.gross_area_m2 ?? '',
                    common_area_m2: floorData.common_area_m2 ?? '',
                    wall_area_m2: floorData.wall_area_m2 ?? '',
                    stairs_m3: floorData.stairs_m3 ?? '',
                    stairs_mt: floorData.stairs_mt ?? '',
                    stairs_coating_m2: floorData.stairs_coating_m2 ?? '',
                    column_count: floorData.column_count ?? '',
                    column_m3: floorData.column_m3 ?? '',
                    beam_mt: floorData.beam_mt ?? '',
                    beam_m3: floorData.beam_m3 ?? '',
                    slab_area_m2: floorData.slab_area_m2 ?? '',
                    reinforcement_type: floorData.reinforcement_type ?? '',
                    beton_recipe_id: floorData.beton_recipe_id ?? '',
                    kiris_recipe_id: floorData.kiris_recipe_id ?? '',
                    kolon_recipe_id: floorData.kolon_recipe_id ?? '',
                    demir_recipe_id: floorData.demir_recipe_id ?? '',
                    hall_floor_recipe_id: floorData.hall_floor_recipe_id ?? '',
                    hall_wall_recipe_id: floorData.hall_wall_recipe_id ?? '',
                    hall_ceiling_recipe_id: floorData.hall_ceiling_recipe_id ?? '',
                    stairs_recipe_id: floorData.stairs_recipe_id ?? '',
                    extra_recipe_id: floorData.extra_recipe_id ?? ''
                });
            } else {
                setFormData(prev => ({ ...prev, floor_number: '' }));
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
            height_cm: parseFloat(formData.height_cm || 300)
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1128]/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#0A1128] flex items-center justify-center text-white shadow-lg"><Layers size={24} /></div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{isEdit ? 'Kat Düzenleme Paneli' : 'Yeni Kat Oluşturma'}</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">TİP VE KATMAN KONFİGÜRASYONU</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-400 hover:text-[#D36A47] transition-all"><X size={24} /></button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <form id="new-floor-form" onSubmit={handleSubmit} className="space-y-10">
                        <div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3"><span className="w-8 h-px bg-slate-200" /> KAT PARAMETRELERİ VE MİMARİ VERİLER</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                <FormInput label="Kat Numarası" name="floor_number" value={formData.floor_number} onChange={handleChange} required type="number" />
                                <FormInput label="Kat Brüt Alanı (AI)" name="gross_area_m2" value={formData.gross_area_m2} onChange={handleChange} color="blue" unit="m²" />
                                <FormInput label="Kat Holü (Ortak)" name="common_area_m2" value={formData.common_area_m2} onChange={handleChange} color="indigo" unit="m²" />
                                <FormInput label="Kat Duvarları (AI)" name="wall_area_m2" value={formData.wall_area_m2} onChange={handleChange} color="teal" unit="m²" />
                                <div className="space-y-1.5 font-bold md:col-span-2">
                                    <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1">KAT MERDİVEN [m3 / mt / m2]</label>
                                    <div className="flex gap-2">
                                        <input type="number" name="stairs_m3" value={formData.stairs_m3} onChange={handleChange} placeholder="TOPLAM m³" className="w-1/3 px-3 py-3 bg-rose-50/10 border border-rose-100 rounded-xl outline-none text-xs" />
                                        <input type="number" name="stairs_mt" value={formData.stairs_mt} onChange={handleChange} placeholder="TOPLAM METRE" className="w-1/3 px-3 py-3 bg-rose-50/10 border border-rose-100 rounded-xl outline-none text-xs" />
                                        <input type="number" name="stairs_coating_m2" value={formData.stairs_coating_m2} onChange={handleChange} placeholder="KAPLAMA m²" className="w-1/3 px-3 py-3 bg-rose-50/10 border border-rose-100 rounded-xl outline-none text-xs" />
                                    </div>
                                </div>
                                <FormInput label="Kat Yüksekliği (m)" name="height_cm" value={formData.height_cm} onChange={handleChange} placeholder="3.00" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-black text-[#D36A47] uppercase tracking-[0.2em] mb-6 flex items-center gap-3"><span className="w-8 h-px bg-[#D36A47]/20" /> AI STATİK VERİLERİ (STRÜKTÜREL)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatikBox label="KOLONLAR" icon={<Grid3X3 size={16} />} color="orange" fields={[{ name: 'column_count', placeholder: 'ADET' }, { name: 'column_m3', placeholder: 'm³' }]} formData={formData} onChange={handleChange} />
                                <StatikBox label="KİRİŞLER" icon={<Hash size={16} />} color="indigo" fields={[{ name: 'beam_mt', placeholder: 'METRE' }, { name: 'beam_m3', placeholder: 'm³' }]} formData={formData} onChange={handleChange} />
                                <StatikBox label="DÖŞEME" icon={<Maximize size={16} />} color="blue" fields={[{ name: 'slab_area_m2', placeholder: 'NET BETON m²' }]} formData={formData} onChange={handleChange} />
                                <StatikBox label="DONATI" icon={<Pi size={16} />} color="slate" fields={[{ name: 'reinforcement_type', placeholder: 'DEMİR TİPİ' }]} formData={formData} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3"><span className="w-8 h-px bg-slate-200" /> KABA YAPI REÇETE ATAMALARI</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <RecipeSelector label="BETON REÇETESİ" name="beton_recipe_id" value={formData.beton_recipe_id} recipes={recipes} onChange={handleChange} />
                                <RecipeSelector label="KİRİŞ REÇETESİ" name="kiris_recipe_id" value={formData.kiris_recipe_id} recipes={recipes} onChange={handleChange} />
                                <RecipeSelector label="KOLON REÇETESİ" name="kolon_recipe_id" value={formData.kolon_recipe_id} recipes={recipes} onChange={handleChange} />
                                <RecipeSelector label="DEMİR REÇETESİ" name="demir_recipe_id" value={formData.demir_recipe_id} recipes={recipes} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3"><span className="w-8 h-px bg-slate-200" /> İNCE YAPI & ORTAK ALAN REÇETELERİ</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                <RecipeSelector label="KAT HOLÜ ZEMİN" name="hall_floor_recipe_id" value={formData.hall_floor_recipe_id} recipes={recipes} onChange={handleChange} />
                                <RecipeSelector label="KAT HOLÜ DUVAR" name="hall_wall_recipe_id" value={formData.hall_wall_recipe_id} recipes={recipes} onChange={handleChange} />
                                <RecipeSelector label="KAT HOLÜ TAVAN" name="hall_ceiling_recipe_id" value={formData.hall_ceiling_recipe_id} recipes={recipes} onChange={handleChange} />
                                <RecipeSelector label="MERDİVEN REÇETESİ" name="stairs_recipe_id" value={formData.stairs_recipe_id} recipes={recipes} onChange={handleChange} />
                                <RecipeSelector label="EK (KORKULUK VB)" name="extra_recipe_id" value={formData.extra_recipe_id} recipes={recipes} onChange={handleChange} />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400 font-bold"><Info size={18} /> <span className="text-[10px] uppercase tracking-widest text-[#0A1128]">STRÜKTÜREL VERİLER KAT MALİYET ANALİZİNE ESAS TEŞKİL EDER</span></div>
                    <div className="flex gap-4">
                        <button type="button" onClick={onClose} className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-all">İPTAL</button>
                        <button type="submit" form="new-floor-form" className="inline-flex items-center gap-3 px-10 py-4 text-xs font-black uppercase tracking-widest text-white bg-[#0A1128] hover:bg-slate-900 rounded-2xl transition-all shadow-xl shadow-slate-200 hover:scale-105 active:scale-95"><Save size={18} /> {isEdit ? 'DEĞİŞİKLİKLERİ KAYDET' : 'KATI OLUŞTUR'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormInput = ({ label, name, value, onChange, color = "slate", unit, ...props }) => (
    <div className={`space-y-1.5 font-bold text-${color}-600`}>
        <label className="text-[10px] font-black uppercase tracking-widest ml-1">{label}</label>
        <div className="relative">
            <input name={name} value={value} onChange={onChange} className={`block w-full px-4 py-3 bg-${color}-50/20 border border-${color}-100 rounded-2xl focus:ring-4 outline-none text-sm`} {...props} />
            {unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-40">{unit}</span>}
        </div>
    </div>
);

const StatikBox = ({ label, icon, color, fields, formData, onChange }) => (
    <div className={`p-5 rounded-[2rem] border transition-all bg-${color}-50/10 border-${color}-100/50 space-y-4`}>
        <div className={`flex items-center gap-2 text-${color}-600`}>{icon} <span className="text-[10px] font-black uppercase tracking-widest">{label}</span></div>
        <div className="space-y-2">
            {fields.map(f => <input key={f.name} type="text" name={f.name} value={formData[f.name]} onChange={onChange} placeholder={f.placeholder} className="w-full bg-white px-4 py-2.5 rounded-xl border border-slate-100 text-xs font-bold outline-none placeholder:text-slate-300" />)}
        </div>
    </div>
);

const RecipeSelector = ({ label, name, value, recipes, onChange }) => (
    <div className="space-y-2">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <select name={name} value={value} onChange={onChange} className="w-full bg-white px-3 py-3 rounded-xl border border-slate-200 text-[10px] font-black outline-none focus:border-[#D36A47] transition-all"><option value="">SEÇİNİZ</option>{recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
    </div>
);

export default NewFloorModal;
