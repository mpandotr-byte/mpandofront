import React, { useState, useEffect } from 'react';
import { X, Save, Layers, Maximize, Grid3X3, Pi, Hash, Info, FileSearch, Loader2, BrainCircuit, Sparkles, ChevronDown } from 'lucide-react';
import { api } from '../../api/client';

const NewFloorModal = ({ isOpen, onClose, onAdd, blockId, projectId, floorData = null }) => {
    const isEdit = !!floorData;
    const [recipes, setRecipes] = useState([]);
    const [constructionFiles, setConstructionFiles] = useState([]);
    const [selectedDwgId, setSelectedDwgId] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [formData, setFormData] = useState({
        floor_number: '',
        height_cm: '300',
        gross_area_m2: '',
        common_area_m2: '',
        common_wall_area_m2: '',
        common_ceiling_area_m2: '',
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
        const fetchInitialData = async () => {
            try {
                const [recipeData, fileData] = await Promise.all([
                    api.get('/recipes'),
                    projectId ? api.get(`/construction/files/${projectId}`) : Promise.resolve([])
                ]);
                setRecipes(recipeData || []);
                setConstructionFiles((fileData || []).filter(f => f.file_type?.toLowerCase() === 'dwg'));
            } catch (err) {
                console.error("Fetch initial data error:", err);
            }
        };

        if (isOpen) {
            fetchInitialData();
            setSelectedDwgId('');
            if (floorData) {
                setFormData({
                    floor_number: floorData.floor_number ?? '',
                    height_cm: floorData.height_cm ?? '300',
                    gross_area_m2: floorData.gross_area_m2 ?? '',
                    common_area_m2: floorData.common_area_m2 ?? '',
                    common_wall_area_m2: floorData.common_wall_area_m2 ?? '',
                    common_ceiling_area_m2: floorData.common_ceiling_area_m2 ?? '',
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
    }, [isOpen, floorData, projectId]);

    const handleAIAnalysis = async () => {
        if (!selectedDwgId) {
            alert("Lütfen önce analiz edilecek bir DWG dosyası seçiniz.");
            return;
        }

        setIsAnalyzing(true);
        try {
            const selectedFile = constructionFiles.find(f => f.id.toString() === selectedDwgId);

            const response = await api.post('/ai/floors/analyze', {
                dwg_id: selectedDwgId,
                file_url: selectedFile?.file_url,
                project_id: projectId,
                block_id: blockId,
                floor_number: formData.floor_number,
                analysis_type: "floor_metrics"
            });

            const result = response.ai_response || response;

            if (result) {
                setFormData(prev => ({
                    ...prev,
                    gross_area_m2: result.gross_area_m2 ?? result.gross_area ?? prev.gross_area_m2,
                    wall_area_m2: result.wall_area_m2 ?? result.wall_area ?? prev.wall_area_m2,
                    slab_area_m2: result.slab_area_m2 ?? result.slab_area ?? prev.slab_area_m2,
                    column_count: result.column_count ?? prev.column_count,
                    column_m3: result.column_m3 ?? prev.column_m3,
                    beam_mt: result.beam_mt ?? prev.beam_mt,
                    beam_m3: result.beam_m3 ?? prev.beam_m3,
                    stairs_m3: result.stairs_m3 ?? prev.stairs_m3,
                    stairs_mt: result.stairs_mt ?? prev.stairs_mt,
                    stairs_coating_m2: result.stairs_coating_m2 ?? prev.stairs_coating_m2,
                    common_area_m2: result.common_area_m2 ?? prev.common_area_m2,
                    common_wall_area_m2: result.common_wall_area_m2 ?? prev.common_wall_area_m2,
                    common_ceiling_area_m2: result.common_ceiling_area_m2 ?? prev.common_ceiling_area_m2,
                }));
                alert("AI Analizi Başarılı: Kat metrajları otomatik olarak hesaplandı.");
            }
        } catch (error) {
            console.error("AI Floor Analysis Error:", error);
            const errorMsg = error.message || "";
            alert("AI Analizi sırasında bir hata oluştu: " + errorMsg);
        } finally {
            setIsAnalyzing(false);
        }
    };

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
            common_wall_area_m2: parseFloat(formData.common_wall_area_m2 || 0),
            common_ceiling_area_m2: parseFloat(formData.common_ceiling_area_m2 || 0)
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
                    {/* ═════════════════ AI DWG ANALYZER SECTION ═════════════════ */}
                    {!isEdit && (
                        <div className="mb-10 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-[2rem] p-6 border border-violet-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-violet-500/10 transition-colors" />
                            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-violet-600 border border-violet-100">
                                        <BrainCircuit size={28} className={isAnalyzing ? 'animate-pulse' : ''} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-black text-violet-900 uppercase tracking-tight">AI DESTEKLİ KAT ANALİZİ (BETA)</h3>
                                        <p className="text-[10px] text-violet-600/70 font-bold uppercase tracking-widest">DWG dosyasını seçerek kat metrajlarını AI ile doldurun</p>
                                    </div>
                                </div>

                                <div className="flex flex-1 w-full max-w-md gap-3">
                                    <div className="relative flex-1">
                                        <FileSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" size={16} />
                                        <select
                                            value={selectedDwgId}
                                            onChange={(e) => setSelectedDwgId(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-violet-100 rounded-2xl text-[11px] font-black uppercase text-violet-900 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all appearance-none shadow-sm"
                                        >
                                            <option value="">Analiz İçin DWG Seçin</option>
                                            {constructionFiles.map(file => (
                                                <option key={file.id} value={file.id}>{file.file_name.toUpperCase()}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-300 pointer-events-none" size={16} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAIAnalysis}
                                        disabled={!selectedDwgId || isAnalyzing}
                                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-violet-600/20 active:scale-95 whitespace-nowrap"
                                    >
                                        {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                        {isAnalyzing ? 'ANALİZ EDİLİYOR...' : 'ASİSTANI ÇALIŞTIR'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <form id="new-floor-form" onSubmit={handleSubmit} className="space-y-10">
                        {/* ── Bölüm 1: Manuel Girişler ── */}
                        <div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-8 h-px bg-slate-200" /> KAT KİMLİĞİ VE YÜKSEKLİK
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                <FormInput label="Kat Numarası" name="floor_number" value={formData.floor_number} onChange={handleChange} required type="number" placeholder="0" />
                                <FormInput label="Kat Yüksekliği (m)" name="height_cm" value={formData.height_cm} onChange={handleChange} placeholder="3.00" />
                                <FormInput label="Kat Holü Zemin (m²)" name="common_area_m2" value={formData.common_area_m2} onChange={handleChange} color="indigo" unit="m²" />
                                <FormInput label="Kat Holü Duvar (m²)" name="common_wall_area_m2" value={formData.common_wall_area_m2} onChange={handleChange} color="indigo" unit="m²" />
                                <FormInput label="Kat Holü Tavan (m²)" name="common_ceiling_area_m2" value={formData.common_ceiling_area_m2} onChange={handleChange} color="indigo" unit="m²" />
                            </div>
                        </div>

                        {/* ── Bölüm 2: AI Metraj Alanları ── */}
                        <div>
                            <h3 className="text-sm font-black text-violet-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-3">
                                <span className="w-8 h-px bg-violet-200" />
                                <BrainCircuit size={16} className={isAnalyzing ? 'animate-pulse' : ''} />
                                AI MİMARİ METRAJLAR
                                <span className="text-[9px] bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-black tracking-widest">OTOMATİK</span>
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6 ml-1">
                                Yukarıdan DWG seçip asistanı çalıştırın — bu alanlar otomatik dolacak
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <AIField label="Kat Brüt Alanı" value={formData.gross_area_m2} unit="m²" isAnalyzing={isAnalyzing} />
                                <AIField label="Tüm Kat Duvarları" value={formData.wall_area_m2} unit="m²" isAnalyzing={isAnalyzing} />
                                <AIField label="Döşeme (Net Beton)" value={formData.slab_area_m2} unit="m²" isAnalyzing={isAnalyzing} />
                            </div>
                        </div>

                        {/* ── Bölüm 3: AI Strüktürel Veriler ── */}
                        <div>
                            <h3 className="text-sm font-black text-violet-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-3">
                                <span className="w-8 h-px bg-violet-200" />
                                <BrainCircuit size={16} className={isAnalyzing ? 'animate-pulse' : ''} />
                                AI STATİK VERİLERİ (STRÜKTÜREL)
                                <span className="text-[9px] bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-black tracking-widest">OTOMATİK</span>
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6 ml-1">
                                DWG analizinden kolon / kiriş / merdiven / donatı verileri çekilecek
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* KOLONLAR */}
                                <div className="p-5 rounded-[2rem] border border-violet-100/70 bg-violet-50/20 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-violet-600">
                                            <Grid3X3 size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Kolonlar</span>
                                        </div>
                                        <AIBadge isAnalyzing={isAnalyzing} />
                                    </div>
                                    <div className="space-y-2">
                                        <AIReadonlyInput value={formData.column_count} placeholder="ADET" isAnalyzing={isAnalyzing} />
                                        <AIReadonlyInput value={formData.column_m3} placeholder="m³" isAnalyzing={isAnalyzing} />
                                    </div>
                                </div>
                                {/* KİRİŞLER */}
                                <div className="p-5 rounded-[2rem] border border-violet-100/70 bg-violet-50/20 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-violet-600">
                                            <Hash size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Kirişler</span>
                                        </div>
                                        <AIBadge isAnalyzing={isAnalyzing} />
                                    </div>
                                    <div className="space-y-2">
                                        <AIReadonlyInput value={formData.beam_mt} placeholder="METRE" isAnalyzing={isAnalyzing} />
                                        <AIReadonlyInput value={formData.beam_m3} placeholder="m³" isAnalyzing={isAnalyzing} />
                                    </div>
                                </div>
                                {/* MERDİVEN */}
                                <div className="p-5 rounded-[2rem] border border-violet-100/70 bg-violet-50/20 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-violet-600">
                                            <Maximize size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Merdiven</span>
                                        </div>
                                        <AIBadge isAnalyzing={isAnalyzing} />
                                    </div>
                                    <div className="space-y-2">
                                        <AIReadonlyInput value={formData.stairs_m3} placeholder="TOPLAM m³" isAnalyzing={isAnalyzing} />
                                        <AIReadonlyInput value={formData.stairs_mt} placeholder="TOPLAM METRE" isAnalyzing={isAnalyzing} />
                                        <AIReadonlyInput value={formData.stairs_coating_m2} placeholder="KAPLAMA m²" isAnalyzing={isAnalyzing} />
                                    </div>
                                </div>
                                {/* DONATI */}
                                <div className="p-5 rounded-[2rem] border border-violet-100/70 bg-violet-50/20 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-violet-600">
                                            <Pi size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Donatı</span>
                                        </div>
                                        <AIBadge isAnalyzing={isAnalyzing} />
                                    </div>
                                    <div className="space-y-2">
                                        <AIReadonlyInput value={formData.reinforcement_type} placeholder="DEMİR TİPİ" isAnalyzing={isAnalyzing} />
                                    </div>
                                </div>
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

/* AI readonly input — gösterim amaçlı, formData'dan değer alır */
const AIReadonlyInput = ({ value, placeholder, isAnalyzing }) => (
    <div className="relative">
        <input
            readOnly
            value={value || ''}
            placeholder={isAnalyzing ? '' : `— ${placeholder} —`}
            className={`w-full bg-white/80 px-4 py-2.5 rounded-xl border border-violet-100 text-xs font-black outline-none text-violet-700 placeholder:text-slate-300 placeholder:font-normal cursor-default select-none transition-all ${isAnalyzing ? 'animate-pulse' : ''}`}
        />
        {isAnalyzing && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-100/0 via-violet-200/60 to-violet-100/0 animate-[shimmer_1.5s_infinite]" />
        )}
    </div>
);

/* AI değer kutucuğu — büyük tek değer gösterimi */
const AIField = ({ label, value, unit, isAnalyzing }) => (
    <div className={`relative p-5 rounded-[2rem] border transition-all overflow-hidden ${value ? 'bg-violet-50 border-violet-200' : 'bg-violet-50/20 border-violet-100/70'}`}>
        {isAnalyzing && (
            <div className="absolute inset-0 bg-gradient-to-r from-violet-100/0 via-violet-100/80 to-violet-100/0 animate-pulse" />
        )}
        <div className="relative">
            <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2">{label}</p>
            {value ? (
                <p className="text-2xl font-black text-violet-700 tracking-tight">
                    {value} <span className="text-sm font-bold text-violet-400">{unit}</span>
                </p>
            ) : (
                <p className={`text-sm font-bold text-slate-300 italic ${isAnalyzing ? 'animate-pulse' : ''}`}>
                    {isAnalyzing ? 'Hesaplanıyor...' : 'AI Dolduracak'}
                </p>
            )}
        </div>
    </div>
);

/* Küçük AI rozeti */
const AIBadge = ({ isAnalyzing }) => (
    <span className={`inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border transition-all ${isAnalyzing ? 'bg-violet-200 text-violet-700 border-violet-300 animate-pulse' : 'bg-violet-50 text-violet-400 border-violet-100'}`}>
        {isAnalyzing ? '⟳ İŞLENİYOR' : '✦ AI'}
    </span>
);

const RecipeSelector = ({ label, name, value, recipes, onChange }) => (
    <div className="space-y-2">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <select name={name} value={value} onChange={onChange} className="w-full bg-white px-3 py-3 rounded-xl border border-slate-200 text-[10px] font-black outline-none focus:border-[#D36A47] transition-all"><option value="">SEÇİNİZ</option>{recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
    </div>
);

export default NewFloorModal;

