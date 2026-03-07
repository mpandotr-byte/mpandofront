import React, { useState, useEffect } from 'react';
import { X, Save, Building2, Zap, Droplets, Flame, ArrowRight, Info, Plus, Sparkles, FileSearch, Loader2, BrainCircuit, ChevronDown } from 'lucide-react';
import { api } from '../../api/client';

const BlockModal = ({ isOpen, onClose, onSave, projectId, blockData = null }) => {
    const isEdit = !!blockData;
    const [recipes, setRecipes] = useState([]);
    const [loadingRecipes, setLoadingRecipes] = useState(false);
    const [constructionFiles, setConstructionFiles] = useState([]);
    const [selectedDwgId, setSelectedDwgId] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        floor_count: '',
        building_type: 'Konut',
        foundation_area_m2: '',
        total_facade_m2: '',
        elevator_count: '',
        elec_points: '',
        waste_water_mt: '',
        fresh_water_mt: '',
        gas_line_mt: '',
        fire_system_mt: '',
        roof_area_m2: '',
        elevator_recipe_id: '',
        foundation_recipe_id: '',
        facade_recipe_id: '',
        roof_recipe_id: '',
        plumbing_recipe_id: '',
        basement_recipe_id: ''
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!isOpen) return;

            setLoadingRecipes(true);
            try {
                // Paralel veri çekimi: Reçeteler ve Proje Dosyaları
                const [recipeData, fileData] = await Promise.all([
                    api.get('/recipes'),
                    api.get(`/construction/files/${projectId}`)
                ]);

                setRecipes(recipeData || []);
                // Sadece DWG dosyalarını filtrele
                setConstructionFiles((fileData || []).filter(f => f.file_type?.toLowerCase() === 'dwg'));
            } catch (err) {
                console.error("Fetch initial data error:", err);
            } finally {
                setLoadingRecipes(false);
            }
        };

        if (isOpen) {
            fetchInitialData();
            if (blockData) {
                setFormData({
                    name: blockData.name ?? '',
                    floor_count: blockData.floor_count ?? '',
                    building_type: blockData.building_type ?? 'Konut',
                    foundation_area_m2: blockData.foundation_area_m2 ?? '',
                    total_facade_m2: blockData.total_facade_m2 ?? '',
                    elevator_count: blockData.elevator_count ?? '',
                    elec_points: blockData.elec_points ?? '',
                    waste_water_mt: blockData.waste_water_mt ?? '',
                    fresh_water_mt: blockData.fresh_water_mt ?? '',
                    gas_line_mt: blockData.gas_line_mt ?? '',
                    fire_system_mt: blockData.fire_system_mt ?? '',
                    roof_area_m2: blockData.roof_area_m2 ?? '',
                    elevator_recipe_id: blockData.elevator_recipe_id ?? '',
                    foundation_recipe_id: blockData.foundation_recipe_id ?? '',
                    facade_recipe_id: blockData.facade_recipe_id ?? '',
                    roof_recipe_id: blockData.roof_recipe_id ?? '',
                    plumbing_recipe_id: blockData.plumbing_recipe_id ?? '',
                    basement_recipe_id: blockData.basement_recipe_id ?? ''
                });
            } else {
                setFormData({
                    name: '',
                    floor_count: '',
                    building_type: 'Konut',
                    foundation_area_m2: '',
                    total_facade_m2: '',
                    elevator_count: '',
                    elec_points: '',
                    waste_water_mt: '',
                    fresh_water_mt: '',
                    gas_line_mt: '',
                    fire_system_mt: '',
                    roof_area_m2: '',
                    elevator_recipe_id: '',
                    foundation_recipe_id: '',
                    facade_recipe_id: '',
                    roof_recipe_id: '',
                    plumbing_recipe_id: '',
                    basement_recipe_id: ''
                });
            }
            setSelectedDwgId('');
        }
    }, [isOpen, blockData, projectId]);

    const handleAIAnalysis = async () => {
        if (!selectedDwgId) {
            alert("Lütfen önce analiz edilecek bir DWG dosyası seçiniz.");
            return;
        }

        setIsAnalyzing(true);
        try {
            const selectedFile = constructionFiles.find(f => f.id.toString() === selectedDwgId);

            // AI artık sadece teknik metrajlara odaklanıyor
            const response = await api.post('/ai/test-ai', {
                prompt: `Sen profesyonel bir inşaat mühendisi ve mimarsın. Ekteki DWG dosyasındaki verileri analiz et. 
                        Blok ismi: "${formData.name}" ve Kat Sayısı: ${formData.floor_count} olan bu yapı için;
                        Sadece temel alanını (m2), dış cephe alanını (m2) ve çatı alanını (m2) hesapla. 
                        Yanıtı sadece JSON formatında ver: { foundation_area, total_facade, roof_area }`,
                context: {
                    dwg_id: selectedDwgId,
                    file_url: selectedFile?.file_url,
                    analysis_type: "block_metrics_only",
                    project_id: projectId,
                    user_input: {
                        name: formData.name,
                        floor_count: formData.floor_count
                    }
                }
            });

            const result = response.ai_response || response;

            if (result) {
                setFormData(prev => ({
                    ...prev,
                    // name ve floor_count korunuyor, sadece metrajlar güncelleniyor
                    foundation_area_m2: result.foundation_area || prev.foundation_area_m2,
                    total_facade_m2: result.total_facade || prev.total_facade_m2,
                    roof_area_m2: result.roof_area || prev.roof_area_m2
                }));
                alert("AI Analizi Başarılı: Teknik metrajlar otomatik olarak hesaplandı.");
            }
        } catch (error) {
            console.error("AI Analysis Error:", error);
            const errorMsg = error.message || "";
            if (errorMsg.includes("API key not valid") || errorMsg.includes("403") || errorMsg.includes("400")) {
                alert("AI Hatası: Backend sunucusundaki Gemini API Anahtarı (API Key) geçersiz veya süresi dolmuş. Lütfen backend (.env) ayarlarını kontrol edin.");
            } else {
                alert("AI Analizi sırasında bir hata oluştu: " + errorMsg);
            }
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
        onSave({
            ...formData,
            id: blockData?.id,
            project_id: projectId,
            floor_count: parseInt(formData.floor_count || 0),
            foundation_area_m2: formData.foundation_area_m2 !== '' ? parseFloat(formData.foundation_area_m2) : null,
            total_facade_m2: formData.total_facade_m2 !== '' ? parseFloat(formData.total_facade_m2) : null,
            elevator_count: formData.elevator_count !== '' ? parseInt(formData.elevator_count) : 0,
            elec_points: parseInt(formData.elec_points || 0),
            waste_water_mt: parseFloat(formData.waste_water_mt || 0),
            fresh_water_mt: parseFloat(formData.fresh_water_mt || 0),
            gas_line_mt: parseFloat(formData.gas_line_mt || 0),
            fire_system_mt: parseFloat(formData.fire_system_mt || 0),
            roof_area_m2: parseFloat(formData.roof_area_m2 || 0)
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1128]/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#0A1128] flex items-center justify-center text-white shadow-lg">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                                {isEdit ? 'Blok Yapı Paneli' : 'Yeni Blok Oluşturma'}
                            </h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">GENEL YAPI VE TEKNİK PARAMETRELER</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-400 hover:text-[#D36A47] transition-all"><X size={24} /></button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {/* ═════════════════ AI DWG ANALYZER SECTION ═════════════════ */}
                    {!isEdit && (
                        <div className="mb-10 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2rem] p-6 border border-blue-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-blue-600 border border-blue-100">
                                        <BrainCircuit size={28} className={isAnalyzing ? 'animate-pulse' : ''} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">AI DESTEKLİ BLOK ANALİZİ (BETA)</h3>
                                        <p className="text-[10px] text-blue-600/70 font-bold uppercase tracking-widest">DWG dosyasını seçerek teknik verileri AI ile doldurun</p>
                                    </div>
                                </div>

                                <div className="flex flex-1 w-full max-w-md gap-3">
                                    <div className="relative flex-1">
                                        <FileSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
                                        <select
                                            value={selectedDwgId}
                                            onChange={(e) => setSelectedDwgId(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-blue-100 rounded-2xl text-[11px] font-black uppercase text-blue-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all appearance-none shadow-sm"
                                        >
                                            <option value="">Analiz İçin DWG Seçin</option>
                                            {constructionFiles.map(file => (
                                                <option key={file.id} value={file.id}>{file.file_name.toUpperCase()}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none" size={16} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAIAnalysis}
                                        disabled={!selectedDwgId || isAnalyzing}
                                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95 whitespace-nowrap"
                                    >
                                        {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                        {isAnalyzing ? 'ANALİZ EDİLİYOR...' : 'ASİSTANI ÇALIŞTIR'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <form id="block-form" onSubmit={handleSubmit} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-3">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3"><span className="w-8 h-px bg-slate-200" /> BLOK KİMLİĞİ VE ANA ÖLÇÜLER</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Blok Adı / Tanımı</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Örn: A Blok" required className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-[#D36A47]/10 focus:border-[#D36A47] outline-none transition-all text-sm font-bold" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Yapı Tipi</label>
                                        <select name="building_type" value={formData.building_type} onChange={handleChange} className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-[#D36A47]/10 focus:border-[#D36A47] outline-none transition-all text-sm font-bold">
                                            <option value="Konut">Konut</option>
                                            <option value="Ticari">Ticari</option>
                                            <option value="Karma">Karma</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Kat Sayısı</label>
                                        <input type="number" name="floor_count" value={formData.floor_count} onChange={handleChange} placeholder="0" required className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-[#D36A47]/10 focus:border-[#D36A47] outline-none transition-all text-sm font-bold" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-[#D36A47] uppercase tracking-wider ml-1 flex items-center gap-1.5">TEMEL ALANI <span className="bg-[#D36A47]/10 text-[9px] px-1.5 py-0.5 rounded text-[#D36A47]">AI STATİK</span></label>
                                        <div className="relative">
                                            <input type="number" name="foundation_area_m2" value={formData.foundation_area_m2} onChange={handleChange} className="block w-full px-4 py-3 bg-orange-50/30 border border-orange-100 rounded-[1.25rem] focus:ring-4 focus:ring-[#D36A47]/10 focus:border-[#D36A47] outline-none transition-all text-sm font-bold text-orange-900" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-orange-400">m²</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-blue-600 uppercase tracking-wider ml-1 flex items-center gap-1.5">DIŞ CEPHE <span className="bg-blue-50 text-[9px] px-1.5 py-0.5 rounded text-blue-600">AI MİMARİ</span></label>
                                        <div className="relative">
                                            <input type="number" name="total_facade_m2" value={formData.total_facade_m2} onChange={handleChange} className="block w-full px-4 py-3 bg-blue-50/30 border border-blue-100 rounded-[1.25rem] focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm font-bold text-blue-900" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-blue-400">m²</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-emerald-600 uppercase tracking-wider ml-1 flex items-center gap-1.5">ÇATI ALANI <span className="bg-emerald-50 text-[9px] px-1.5 py-0.5 rounded text-emerald-600">AI MİMARİ</span></label>
                                        <div className="relative">
                                            <input type="number" name="roof_area_m2" value={formData.roof_area_m2} onChange={handleChange} className="block w-full px-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-[1.25rem] focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all text-sm font-bold text-emerald-900" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-400">m²</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-3">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3"><span className="w-8 h-px bg-slate-200" /> TESİSAT METRAJ VE ÜNİTE VERİLERİ</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 space-y-3">
                                        <div className="flex items-center gap-2 text-amber-600"><Zap size={16} /> <span className="text-[10px] font-black uppercase">Elektrik (Priz/Sorti)</span></div>
                                        <div className="relative">
                                            <input type="number" name="elec_points" value={formData.elec_points} onChange={handleChange} placeholder="0" className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">ADET</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 space-y-3">
                                        <div className="flex items-center gap-2 text-blue-600"><Droplets size={16} /> <span className="text-[10px] font-black uppercase">Pis/Temiz Su (PİMAŞ/PPRC)</span></div>
                                        <div className="flex gap-2">
                                            <input type="number" name="waste_water_mt" value={formData.waste_water_mt} onChange={handleChange} placeholder="PİMAŞ MT" className="w-1/2 bg-white px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none" />
                                            <input type="number" name="fresh_water_mt" value={formData.fresh_water_mt} onChange={handleChange} placeholder="PPRC MT" className="w-1/2 bg-white px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 space-y-3">
                                        <div className="flex items-center gap-2 text-rose-600"><Flame size={16} /> <span className="text-[10px] font-black uppercase">Doğalgaz (HAT MT)</span></div>
                                        <div className="relative">
                                            <input type="number" name="gas_line_mt" value={formData.gas_line_mt} onChange={handleChange} placeholder="0" className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">METRE</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 space-y-3">
                                        <div className="flex items-center gap-2 text-red-600"><Flame size={16} /> <span className="text-[10px] font-black uppercase">Yangın Tesisatı (MT)</span></div>
                                        <div className="relative">
                                            <input type="number" name="fire_system_mt" value={formData.fire_system_mt} onChange={handleChange} placeholder="0" className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">METRE</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 space-y-3">
                                        <div className="flex items-center gap-2 text-slate-700"><ArrowRight size={16} /> <span className="text-[10px] font-black uppercase">Asansör</span></div>
                                        <div className="flex gap-2">
                                            <input type="number" name="elevator_count" value={formData.elevator_count} onChange={handleChange} placeholder="ADET" className="w-1/3 bg-white px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none" />
                                            <select name="elevator_recipe_id" value={formData.elevator_recipe_id} onChange={handleChange} className="w-2/3 bg-white px-3 py-2 rounded-xl border border-slate-200 text-[10px] font-black outline-none"><option value="">REÇETE SEÇ</option>{recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-3">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3"><span className="w-8 h-px bg-slate-200" /> BLOK GENELİ REÇETE ATAMALARI</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-4">
                                        <RecipeSelector label="TEMEL REÇETESİ" name="foundation_recipe_id" value={formData.foundation_recipe_id} recipes={recipes} onChange={handleChange} />
                                        <RecipeSelector label="DIŞ CEPHE REÇETESİ" name="facade_recipe_id" value={formData.facade_recipe_id} recipes={recipes} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-4">
                                        <RecipeSelector label="ÇATI REÇETESİ" name="roof_recipe_id" value={formData.roof_recipe_id} recipes={recipes} onChange={handleChange} />
                                        <RecipeSelector label="TESİSAT REÇETELERİ" name="plumbing_recipe_id" value={formData.plumbing_recipe_id} recipes={recipes} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-4">
                                        <RecipeSelector label="BODRUM REÇETESİ" name="basement_recipe_id" value={formData.basement_recipe_id} recipes={recipes} onChange={handleChange} />
                                        <div className="flex h-full items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300"><Plus size={32} /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400"><Info size={18} /><span className="text-[10px] font-black uppercase tracking-widest text-[#0A1128]">Veriler Yapı Maliyetini Etkiler</span></div>
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={onClose} className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-all">İptal</button>
                        <button type="submit" form="block-form" className="inline-flex items-center gap-3 px-10 py-4 text-xs font-black uppercase tracking-widest text-white bg-[#D36A47] hover:bg-[#C25936] rounded-2xl transition-all shadow-xl shadow-[#D36A47]/20 hover:scale-105 active:scale-95"><Save size={18} /> {isEdit ? 'DEĞİŞİKLİKLERİ KAYDET' : 'BLOK OLUŞTUR'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RecipeSelector = ({ label, name, value, recipes, onChange }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <select name={name} value={value} onChange={onChange} className="w-full bg-white px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold outline-none focus:border-[#D36A47] focus:ring-4 focus:ring-[#D36A47]/5 transition-all"><option value="">REÇETE SEÇİMİ BEKLENİYOR...</option>{recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
    </div>
);

export default BlockModal;

