import React, { useState, useEffect } from 'react';
import { X, Save, Maximize, Ruler, DoorOpen, Layout, Info, Plus, ChevronRight, PenTool } from 'lucide-react';
import { api } from '../../api/client';

const NewRoomModal = ({ isOpen, onClose, onAdd, unitId, roomData = null }) => {
    const isEdit = !!roomData;
    const [recipes, setRecipes] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        room_type: '',
        area_m2: '',
        wall_area_m2: '', // Net Duvar Yüzeyi
        door_count: 0,
        window_count: 0,
        perimeter_m: '',
        ceiling_area_m2: '',
        floor_height_m: '',
        notes: '',
        wall_recipe_id: '',
        floor_recipe_id: '',
        ceiling_recipe_id: '',
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
            if (roomData) {
                setFormData({
                    name: roomData.name || '',
                    room_type: roomData.room_type || '',
                    area_m2: roomData.area_m2 || '',
                    wall_area_m2: roomData.wall_area_m2 || '',
                    door_count: roomData.door_count || 0,
                    window_count: roomData.window_count || 0,
                    perimeter_m: roomData.perimeter_m || '',
                    ceiling_area_m2: roomData.ceiling_area_m2 || '',
                    floor_height_m: roomData.floor_height_m || '',
                    notes: roomData.notes || '',
                    wall_recipe_id: roomData.wall_recipe_id || '',
                    floor_recipe_id: roomData.floor_recipe_id || '',
                    ceiling_recipe_id: roomData.ceiling_recipe_id || '',
                    extra_recipe_id: roomData.extra_recipe_id || ''
                });
            } else {
                setFormData(prev => ({ ...prev, name: '' }));
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
        onAdd({ ...formData, unit_id: unitId, id: roomData?.id });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1128]/60 backdrop-blur-md animate-in fade-in duration-300 font-sans text-slate-900">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between px-10 py-8 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[1.25rem] bg-[#D36A47] flex items-center justify-center text-white shadow-lg"><PenTool size={28} /></div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{isEdit ? 'Mahal Düzenleme' : 'Oda (Mahal) Oluşturma'}</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2"><ChevronRight size={14} className="text-[#D36A47]" /> DETAYLI ÜRETİM VE METRAJ NOKTASI</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 rounded-full text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"><X size={24} /></button>
                </div>

                <div className="p-10 overflow-y-auto custom-scrollbar">
                    <form id="new-room-form" onSubmit={handleSubmit} className="space-y-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                            <div className="md:col-span-2 lg:col-span-4 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Oda İsmi</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Örn: Salon" required className="block w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#D36A47]/10 outline-none font-bold text-sm" />
                            </div>
                            <div className="md:col-span-2 lg:col-span-3 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mahal Tipi</label>
                                <select name="room_type" value={formData.room_type} onChange={handleChange} className="block w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm">
                                    <option value="">SEÇİNİZ</option>
                                    <option value="Salon">Salon</option>
                                    <option value="Mutfak">Mutfak</option>
                                    <option value="Banyo">Banyo</option>
                                    <option value="YatakOdasi">Yatak Odası</option>
                                    <option value="Balkon">Balkon</option>
                                </select>
                            </div>
                            <div className="lg:col-span-12"><hr className="border-white" /></div>
                            <div className="md:col-span-1 lg:col-span-3 space-y-2">
                                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] ml-1">ZEMİN ALANI <span className="text-[9px] bg-indigo-50 px-1.5 py-0.5 rounded uppercase">AI</span></label>
                                <div className="relative"><input type="number" name="area_m2" value={formData.area_m2} onChange={handleChange} className="block w-full px-5 py-4 bg-indigo-50/20 border border-indigo-100 rounded-2xl font-black text-indigo-900 outline-none focus:ring-4 transition-all" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-indigo-300">m²</span></div>
                            </div>
                            <div className="md:col-span-1 lg:col-span-3 space-y-2">
                                <label className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] ml-1">DUVAR YÜZEYİ <span className="text-[9px] bg-teal-50 px-1.5 py-0.5 rounded uppercase">NET AI</span></label>
                                <div className="relative"><input type="number" name="wall_area_m2" value={formData.wall_area_m2} onChange={handleChange} className="block w-full px-5 py-4 bg-teal-50/20 border border-teal-100 rounded-2xl font-black text-teal-900 outline-none focus:ring-4 transition-all" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-teal-300">m²</span></div>
                            </div>
                            <div className="md:col-span-1 lg:col-span-3 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">KAPI ADET</label>
                                <div className="relative"><input type="number" name="door_count" value={formData.door_count} onChange={handleChange} className="block w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-black outline-none transition-all" /><DoorOpen size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" /></div>
                            </div>
                            <div className="md:col-span-1 lg:col-span-3 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">PENCERE ADET</label>
                                <div className="relative"><input type="number" name="window_count" value={formData.window_count} onChange={handleChange} className="block w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-black outline-none transition-all" /><Layout size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" /></div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-4"><span className="w-10 h-px bg-slate-200" /> REÇETE ATAMALARI (İÇ MEKAN)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <RecipeSelector label="DUVAR REÇETESİ" name="wall_recipe_id" value={formData.wall_recipe_id} recipes={recipes} onChange={handleChange} />
                                <RecipeSelector label="ZEMİN REÇETESİ" name="floor_recipe_id" value={formData.floor_recipe_id} recipes={recipes} onChange={handleChange} />
                                <RecipeSelector label="TAVAN REÇETESİ" name="ceiling_recipe_id" value={formData.ceiling_recipe_id} recipes={recipes} onChange={handleChange} />
                                <RecipeSelector label="EK REÇETE" name="extra_recipe_id" value={formData.extra_recipe_id} recipes={recipes} onChange={handleChange} />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400 font-bold"><Info size={20} /> <span className="text-[10px] uppercase tracking-widest text-[#0A1128]">TEKNİK VERİLER OTOMATİK METRAJ MOTORUNU BESLER</span></div>
                    <div className="flex gap-4">
                        <button type="button" onClick={onClose} className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-all">VAZGEÇ</button>
                        <button type="submit" form="new-room-form" className="inline-flex items-center gap-4 px-12 py-5 text-xs font-black uppercase tracking-widest text-white bg-[#D36A47] hover:bg-[#C25936] rounded-[1.5rem] transition-all shadow-xl shadow-[#D36A47]/20 hover:scale-105 active:scale-95"><Save size={20} /> {isEdit ? 'DEĞİŞİKLİKLERİ KAYDET' : 'MAHAL KAYDET'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RecipeSelector = ({ label, name, value, recipes, onChange }) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <select name={name} value={value} onChange={onChange} className="w-full bg-white px-5 py-4 rounded-2xl border border-slate-200 text-xs font-black outline-none focus:border-[#D36A47] focus:ring-4 focus:ring-[#D36A47]/5 transition-all appearance-none cursor-pointer"><option value="">SEÇİM BEKLENİYOR</option>{recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
    </div>
);

export default NewRoomModal;
