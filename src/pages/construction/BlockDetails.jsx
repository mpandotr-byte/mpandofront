import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
    ArrowLeft, Building2, Layers, Home, Maximize, ChevronDown, ChevronUp,
    Edit2, Trash2, Plus, PlusCircle, MoreVertical, X, Zap, Droplets, Flame,
    DoorOpen, Layout, Ruler, Package
} from 'lucide-react';
import NewFloorModal from '../../modals/blocks/NewFloorModal';
import NewUnitModal from '../../modals/units/NewUnitModal';
import NewRoomModal from '../../modals/units/NewRoomModal';

const getUnitStatusDetails = (status) => {
    switch (String(status).toUpperCase()) {
        case 'SOLD':
        case 'SATILDI':
            return { label: 'Satıldı', classes: 'bg-red-50 text-red-700 border-red-100' };
        case 'RESERVED':
        case 'REZERVE':
        case 'REZERV':
            return { label: 'Rezerve', classes: 'bg-orange-50 text-orange-700 border-orange-100' };
        case 'BARTER':
            return { label: 'Barter', classes: 'bg-orange-50 text-orange-700 border-orange-100' };
        case 'ARSA SAHIBI':
        case 'ARSA SAHİBİ':
            return { label: 'Arsa Sahibi', classes: 'bg-orange-50 text-orange-700 border-orange-100' };
        case 'AVAILABLE':
        case 'SATILIK':
        case 'MÜSAİT':
        case 'BOŞ':
        default:
            return { label: 'Satılık', classes: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
    }
};


function BlockDetails() {
    const { projectId, blockId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [block, setBlock] = useState(null);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedFloors, setExpandedFloors] = useState({});
    const [expandedUnits, setExpandedUnits] = useState({});
    const [activeFloorMenu, setActiveFloorMenu] = useState(null);
    const [activeUnitMenu, setActiveUnitMenu] = useState(null);

    // Modaller
    const [isAddFloorModalOpen, setIsAddFloorModalOpen] = useState(false);
    const [editingFloor, setEditingFloor] = useState(null);
    const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [selectedFloorForUnit, setSelectedFloorForUnit] = useState(null);
    const [selectedUnitForRoom, setSelectedUnitForRoom] = useState(null);

    // Toplu kat reçete atama
    const [selectedFloors, setSelectedFloors] = useState([]);
    const [recipes, setRecipes] = useState([]);

    const fetchBlockDetails = async () => {
        setLoading(true);
        try {
            const [projectData, blockResponse] = await Promise.all([
                api.get(`/projects/${projectId}`),
                api.get(`/projects/blocks/${blockId}`)
            ]);
            setProject(projectData);
            setBlock(blockResponse);
            // Reçeteleri çek
            try {
                const recipeData = await api.get('/recipes');
                setRecipes(recipeData || []);
            } catch { }
        } catch (err) {
            console.error('Blok detayı çekilemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBlockDetails(); }, [blockId, projectId]);

    const toggleFloor = (floorId) => setExpandedFloors(prev => ({ ...prev, [floorId]: !prev[floorId] }));
    const toggleUnit = (unitId) => setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));

    // ─── CRUD İşlemleri ───
    const handleAddFloor = async (data) => {
        try {
            if (data.id) {
                await api.put(`/projects/floors/${data.id}`, data);
            } else {
                await api.post(`/projects/blocks/${blockId}/floors`, data);
            }
            setIsAddFloorModalOpen(false);
            setEditingFloor(null);
            fetchBlockDetails();
        } catch (err) {
            console.error('Kat eklenemedi:', err);
            alert('İşlem sırasında hata oluştu.');
        }
    };

    const handleDeleteFloor = async (floorId) => {
        if (!window.confirm('Bu katı silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/projects/floors/${floorId}`);
            fetchBlockDetails();
        } catch (err) { alert('Kat silinirken hata oluştu.'); }
    };

    const handleAddUnit = async (data) => {
        try {
            if (data.id) {
                await api.put(`/projects/units/${data.id}`, data);
            } else {
                await api.post(`/projects/floors/${selectedFloorForUnit}/units`, data);
            }
            setIsAddUnitModalOpen(false);
            setEditingUnit(null);
            fetchBlockDetails();
        } catch (err) {
            console.error('Daire eklenemedi:', err);
            alert('İşlem sırasında hata oluştu.');
        }
    };

    const handleDeleteUnit = async (unitId) => {
        if (!window.confirm('Bu daireyi silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/projects/units/${unitId}`);
            fetchBlockDetails();
        } catch (err) { alert('Daire silinirken hata oluştu.'); }
    };

    const handleAddRoom = async (data) => {
        try {
            if (data.id) {
                await api.put(`/projects/rooms/${data.id}`, data);
            } else {
                await api.post(`/projects/units/${selectedUnitForRoom}/rooms`, data);
            }
            setIsAddRoomModalOpen(false);
            setEditingRoom(null);
            fetchBlockDetails();
        } catch (err) {
            console.error('Oda eklenemedi:', err);
            alert('İşlem sırasında hata oluştu.');
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm('Bu odayı silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/projects/rooms/${roomId}`);
            fetchBlockDetails();
        } catch (err) { alert('Oda silinirken hata oluştu.'); }
    };

    const getRecipeName = (id) => {
        if (!id) return '—';
        const r = recipes.find(r => String(r.id) === String(id));
        return r?.name || '—';
    };

    const floors = (block?.floors || []).sort((a, b) => (a.floor_number || 0) - (b.floor_number || 0));
    const totalUnits = floors.reduce((acc, f) => acc + (f.units?.length || 0), 0);

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-50">
                <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
                <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0">
                    <Navbar title="Blok Detayı" toggleMobileMenu={() => setIsMobileMenuOpen(p => !p)} />
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin w-8 h-8 border-4 border-[#D36A47] border-t-transparent rounded-full" />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Blok Yapı Detayı" toggleMobileMenu={() => setIsMobileMenuOpen(p => !p)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-6">

                    {/* ═══ GERİ BUTONU ═══ */}
                    <button onClick={() => navigate(`/projects/${projectId}`)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#D36A47] transition-colors">
                        <ArrowLeft size={16} /> {project?.name || 'Proje'} &rsaquo; Bloklar
                    </button>

                    {/* ═══ BLOK BAŞLIK BANNER ═══ */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1128] via-[#0D1630] to-[#0A1128] rounded-3xl p-6 md:p-8 text-white shadow-2xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D36A47]/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-[100px]" />
                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                        <Building2 size={24} className="text-[#D36A47]" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-black tracking-tight uppercase">{block?.name || 'Blok'}</h1>
                                        <p className="text-white/50 text-xs font-bold uppercase tracking-widest">{block?.building_type || 'Konut'} • {project?.name}</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 mt-4">
                                    <Stat label="Kat" value={floors.length} />
                                    <Stat label="Daire" value={totalUnits} />
                                    <Stat label="Temel Alanı" value={block?.foundation_area_m2 ? `${block.foundation_area_m2} m²` : '—'} />
                                    <Stat label="Dış Cephe" value={block?.total_facade_m2 ? `${block.total_facade_m2} m²` : '—'} />
                                    <Stat label="Çatı" value={block?.roof_area_m2 ? `${block.roof_area_m2} m²` : '—'} />
                                </div>
                            </div>
                            <button
                                onClick={() => { setIsAddFloorModalOpen(true); setEditingFloor(null); }}
                                className="flex items-center gap-2 text-sm font-black text-white bg-[#D36A47] hover:bg-[#E37A57] px-6 py-3 rounded-2xl transition-all shadow-lg"
                            >
                                <Plus size={18} /> YENİ KAT EKLE
                            </button>
                        </div>
                    </div>

                    {/* ═══ BLOK TEKNİK BİLGİLER ═══ */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        <TechCard icon={<Zap size={14} />} label="Elektrik (Priz/Sorti)" value={block?.elec_points || 0} unit="Adet" color="amber" />
                        <TechCard icon={<Droplets size={14} />} label="Pis Su (Pimaş)" value={block?.waste_water_mt || 0} unit="mt" color="blue" />
                        <TechCard icon={<Droplets size={14} />} label="Temiz Su (PPRC)" value={block?.fresh_water_mt || 0} unit="mt" color="cyan" />
                        <TechCard icon={<Flame size={14} />} label="Doğalgaz Hattı" value={block?.gas_line_mt || 0} unit="mt" color="orange" />
                        <TechCard icon={<Flame size={14} />} label="Yangın Tesisatı" value={block?.fire_system_mt || 0} unit="mt" color="red" />
                        <TechCard icon={<Layers size={14} />} label="Asansör" value={block?.elevator_count || 0} unit="Adet" color="slate" />
                    </div>

                    {/* ═══ BLOK REÇETE ATAMALARI ═══ */}
                    {(block?.foundation_recipe_id || block?.facade_recipe_id || block?.roof_recipe_id || block?.plumbing_recipe_id || block?.basement_recipe_id) && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-5">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Blok Geneli Reçete Atamaları</h3>
                            <div className="flex flex-wrap gap-2">
                                {block?.foundation_recipe_id && <RecipeBadge label="Temel" name={getRecipeName(block.foundation_recipe_id)} />}
                                {block?.facade_recipe_id && <RecipeBadge label="Dış Cephe" name={getRecipeName(block.facade_recipe_id)} />}
                                {block?.roof_recipe_id && <RecipeBadge label="Çatı" name={getRecipeName(block.roof_recipe_id)} />}
                                {block?.plumbing_recipe_id && <RecipeBadge label="Tesisat" name={getRecipeName(block.plumbing_recipe_id)} />}
                                {block?.basement_recipe_id && <RecipeBadge label="Bodrum" name={getRecipeName(block.basement_recipe_id)} />}
                                {block?.elevator_recipe_id && <RecipeBadge label="Asansör" name={getRecipeName(block.elevator_recipe_id)} />}
                            </div>
                        </div>
                    )}

                    {/* ═══ KATLAR LİSTESİ ═══ */}
                    <div className="space-y-4">
                        {floors.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                                <Layers size={40} className="mx-auto text-slate-300 mb-3" />
                                <p className="text-sm font-bold text-slate-400">Henüz kat eklenmemiş</p>
                                <button onClick={() => { setIsAddFloorModalOpen(true); setEditingFloor(null); }} className="mt-4 text-sm font-bold text-[#D36A47] hover:underline">
                                    İlk katı ekle
                                </button>
                            </div>
                        ) : floors.map(floor => {
                            const isExpanded = expandedFloors[floor.id];
                            const floorUnits = (floor.units || []).sort((a, b) => String(a.unit_number).localeCompare(String(b.unit_number), undefined, { numeric: true }));

                            return (
                                <div key={floor.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                    {/* ── Kat Başlığı ── */}
                                    <div
                                        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => toggleFloor(floor.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#0A1128] text-white flex items-center justify-center font-black text-sm">
                                                {floor.floor_number}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-800">{floor.floor_number}. Kat</h3>
                                                <div className="flex gap-3 mt-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    <span>Brüt: {floor.gross_area_m2 || '—'} m²</span>
                                                    <span>•</span>
                                                    <span>Hol: {floor.common_area_m2 || '—'} m²</span>
                                                    <span>•</span>
                                                    <span>Yükseklik: {floor.height_cm || 300} cm</span>
                                                    <span>•</span>
                                                    <span>{floorUnits.length} Daire</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Kat İşlemleri */}
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActiveFloorMenu(activeFloorMenu === floor.id ? null : floor.id); }}
                                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {activeFloorMenu === floor.id && (
                                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                                                        <button onClick={(e) => { e.stopPropagation(); setSelectedFloorForUnit(floor.id); setEditingUnit(null); setIsAddUnitModalOpen(true); setActiveFloorMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-blue-50 text-blue-600 flex items-center gap-2"><PlusCircle size={14} /> Daire Ekle</button>
                                                        <button onClick={(e) => { e.stopPropagation(); setEditingFloor(floor); setIsAddFloorModalOpen(true); setActiveFloorMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-slate-50 flex items-center gap-2"><Edit2 size={14} /> Katı Düzenle</button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteFloor(floor.id); setActiveFloorMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-red-50 text-red-600 flex items-center gap-2"><Trash2 size={14} /> Katı Sil</button>
                                                    </div>
                                                )}
                                            </div>
                                            {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                                        </div>
                                    </div>

                                    {/* ── Kat AI Statik Verileri ── */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-100">
                                            {/* Strüktürel Veriler */}
                                            {(floor.column_count || floor.beam_mt || floor.slab_area_m2 || floor.stairs_m3) && (
                                                <div className="px-5 py-3 bg-violet-50/30 border-b border-slate-100">
                                                    <p className="text-[9px] font-black text-violet-500 uppercase tracking-widest mb-2">AI Statik Verileri</p>
                                                    <div className="flex flex-wrap gap-4 text-[11px] font-bold text-violet-700">
                                                        {floor.column_count && <span>Kolon: {floor.column_count} Adet ({floor.column_m3 || '—'} m³)</span>}
                                                        {floor.beam_mt && <span>Kiriş: {floor.beam_mt} mt ({floor.beam_m3 || '—'} m³)</span>}
                                                        {floor.slab_area_m2 && <span>Döşeme: {floor.slab_area_m2} m²</span>}
                                                        {floor.stairs_m3 && <span>Merdiven: {floor.stairs_m3} m³ / {floor.stairs_mt || '—'} mt / {floor.stairs_coating_m2 || '—'} m² kaplama</span>}
                                                        {floor.reinforcement_type && <span>Donatı: {floor.reinforcement_type}</span>}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Kat Reçeteleri */}
                                            {(floor.beton_recipe_id || floor.hall_floor_recipe_id) && (
                                                <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Kat Reçeteleri</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {floor.beton_recipe_id && <RecipeBadge label="Beton" name={getRecipeName(floor.beton_recipe_id)} small />}
                                                        {floor.kiris_recipe_id && <RecipeBadge label="Kiriş" name={getRecipeName(floor.kiris_recipe_id)} small />}
                                                        {floor.kolon_recipe_id && <RecipeBadge label="Kolon" name={getRecipeName(floor.kolon_recipe_id)} small />}
                                                        {floor.demir_recipe_id && <RecipeBadge label="Demir" name={getRecipeName(floor.demir_recipe_id)} small />}
                                                        {floor.hall_floor_recipe_id && <RecipeBadge label="Hol Zemin" name={getRecipeName(floor.hall_floor_recipe_id)} small />}
                                                        {floor.hall_wall_recipe_id && <RecipeBadge label="Hol Duvar" name={getRecipeName(floor.hall_wall_recipe_id)} small />}
                                                        {floor.hall_ceiling_recipe_id && <RecipeBadge label="Hol Tavan" name={getRecipeName(floor.hall_ceiling_recipe_id)} small />}
                                                        {floor.stairs_recipe_id && <RecipeBadge label="Merdiven" name={getRecipeName(floor.stairs_recipe_id)} small />}
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── Daireler ── */}
                                            <div className="px-5 py-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daireler ({floorUnits.length})</p>
                                                    <button
                                                        onClick={() => { setSelectedFloorForUnit(floor.id); setEditingUnit(null); setIsAddUnitModalOpen(true); }}
                                                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                    >
                                                        <PlusCircle size={12} /> Daire Ekle
                                                    </button>
                                                </div>

                                                {floorUnits.length === 0 ? (
                                                    <p className="text-xs text-slate-400 italic py-4 text-center">Henüz daire eklenmemiş</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {floorUnits.map(unit => {
                                                            const isUnitExpanded = expandedUnits[unit.id];
                                                            const rooms = unit.rooms || unit.unit_rooms || [];

                                                            return (
                                                                <div key={unit.id} className="border border-slate-100 rounded-xl overflow-hidden">
                                                                    {/* Daire Başlığı */}
                                                                    <div
                                                                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                                                                        onClick={() => toggleUnit(unit.id)}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                                                <Home size={14} />
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-sm font-bold text-slate-700">No: {unit.unit_number}</span>
                                                                                <span className="text-[11px] text-slate-400 ml-2">({unit.unit_type || '—'})</span>
                                                                                {unit.facade && <span className="text-[10px] text-slate-400 ml-2">• {unit.facade}</span>}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] font-bold text-slate-400">{rooms.length} Oda</span>
                                                                            <div className="relative">
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); setActiveUnitMenu(activeUnitMenu === unit.id ? null : unit.id); }}
                                                                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
                                                                                >
                                                                                    <MoreVertical size={14} />
                                                                                </button>
                                                                                {activeUnitMenu === unit.id && (
                                                                                    <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                                                                                        <button onClick={(e) => { e.stopPropagation(); setSelectedUnitForRoom(unit.id); setEditingRoom(null); setIsAddRoomModalOpen(true); setActiveUnitMenu(null); }} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-emerald-50 text-emerald-600 flex items-center gap-2"><PlusCircle size={12} /> Oda Ekle</button>
                                                                                        <button onClick={(e) => { e.stopPropagation(); setSelectedFloorForUnit(floor.id); setEditingUnit(unit); setIsAddUnitModalOpen(true); setActiveUnitMenu(null); }} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 flex items-center gap-2"><Edit2 size={12} /> Düzenle</button>
                                                                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteUnit(unit.id); setActiveUnitMenu(null); }} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-red-50 text-red-600 flex items-center gap-2"><Trash2 size={12} /> Sil</button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            {isUnitExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                                                                        </div>
                                                                    </div>

                                                                    {/* ── Odalar (Mahal) ── */}
                                                                    {isUnitExpanded && (
                                                                        <div className="border-t border-slate-100 bg-slate-50/30 px-4 py-3">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Odalar / Mahaller</p>
                                                                                <button
                                                                                    onClick={() => { setSelectedUnitForRoom(unit.id); setEditingRoom(null); setIsAddRoomModalOpen(true); }}
                                                                                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                                                                >
                                                                                    <PlusCircle size={10} /> Oda Ekle
                                                                                </button>
                                                                            </div>

                                                                            {rooms.length === 0 ? (
                                                                                <p className="text-[11px] text-slate-400 italic py-2 text-center">Henüz oda eklenmemiş</p>
                                                                            ) : (
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                                                    {rooms.map(room => (
                                                                                        <div key={room.id} className="bg-white rounded-lg border border-slate-100 p-3 group hover:border-[#D36A47]/30 transition-colors">
                                                                                            <div className="flex items-center justify-between mb-2">
                                                                                                <span className="text-xs font-bold text-slate-700">{room.name || room.room_type || 'Oda'}</span>
                                                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                                    <button onClick={() => { setSelectedUnitForRoom(unit.id); setEditingRoom(room); setIsAddRoomModalOpen(true); }} className="p-1 hover:bg-slate-100 rounded text-slate-400"><Edit2 size={10} /></button>
                                                                                                    <button onClick={() => handleDeleteRoom(room.id)} className="p-1 hover:bg-red-50 rounded text-red-400"><Trash2 size={10} /></button>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                                                                                                <span>Zemin: {room.area_m2 || '—'} m²</span>
                                                                                                <span>Duvar: {room.wall_area_m2 || '—'} m²</span>
                                                                                                <span>Kapı: {room.door_count || 0}</span>
                                                                                                <span>Pencere: {room.window_count || 0}</span>
                                                                                            </div>
                                                                                            {/* Oda Reçeteleri */}
                                                                                            {(room.wall_recipe_id || room.floor_recipe_id || room.ceiling_recipe_id) && (
                                                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                                                    {room.wall_recipe_id && <span className="text-[8px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Duvar: {getRecipeName(room.wall_recipe_id)}</span>}
                                                                                                    {room.floor_recipe_id && <span className="text-[8px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Zemin: {getRecipeName(room.floor_recipe_id)}</span>}
                                                                                                    {room.ceiling_recipe_id && <span className="text-[8px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Tavan: {getRecipeName(room.ceiling_recipe_id)}</span>}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ═══ MODALLAR ═══ */}
                <NewFloorModal
                    isOpen={isAddFloorModalOpen}
                    onClose={() => { setIsAddFloorModalOpen(false); setEditingFloor(null); }}
                    onAdd={handleAddFloor}
                    blockId={blockId}
                    projectId={projectId}
                    floorData={editingFloor}
                />
                <NewUnitModal
                    isOpen={isAddUnitModalOpen}
                    onClose={() => { setIsAddUnitModalOpen(false); setEditingUnit(null); }}
                    onAdd={handleAddUnit}
                    floorId={selectedFloorForUnit}
                    unitData={editingUnit}
                />
                <NewRoomModal
                    isOpen={isAddRoomModalOpen}
                    onClose={() => { setIsAddRoomModalOpen(false); setEditingRoom(null); }}
                    onAdd={handleAddRoom}
                    unitId={selectedUnitForRoom}
                    projectId={projectId}
                    roomData={editingRoom}
                />
            </main>
        </div>
    );
}

// ── Yardımcı Bileşenler ──

const Stat = ({ label, value }) => (
    <div className="flex flex-col">
        <span className="text-lg font-black text-white">{value}</span>
        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
    </div>
);

const TechCard = ({ icon, label, value, unit, color }) => (
    <div className={`bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3`}>
        <div className={`w-8 h-8 rounded-lg bg-${color}-50 text-${color}-500 flex items-center justify-center`}>{icon}</div>
        <div>
            <p className="text-xs font-black text-slate-700">{value} <span className="text-[10px] font-bold text-slate-400">{unit}</span></p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        </div>
    </div>
);

const RecipeBadge = ({ label, name, small }) => (
    <span className={`inline-flex items-center gap-1 ${small ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1'} font-bold bg-[#D36A47]/5 text-[#D36A47] border border-[#D36A47]/10 rounded-lg`}>
        <Package size={small ? 8 : 10} /> {label}: {name}
    </span>
);

const BulkFloorRecipeModal = ({ isOpen, onClose, onSave, recipes, formData, onChange, selectedCount }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0A1128]/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-10 animate-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                        <Layers size={28} />
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-8">
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Toplu Kat Reçete Atama</h3>
                    <p className="text-sm font-bold text-slate-500">Seçili {selectedCount} kata aynı anda malzeme/işçilik reçeteleri atayabilirsiniz.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 mb-8">
                    {[
                        { label: 'Beton Reçetesi', name: 'beton_recipe_id' },
                        { label: 'Demir Reçetesi', name: 'demir_recipe_id' },
                        { label: 'Koridor Zemin', name: 'hall_floor_recipe_id' },
                        { label: 'Koridor Duvar', name: 'hall_wall_recipe_id' },
                        { label: 'Koridor Tavan', name: 'hall_ceiling_recipe_id' },
                        { label: 'Merdiven', name: 'stairs_recipe_id' },
                        { label: 'Ekstra', name: 'extra_recipe_id' }
                    ].map((field) => (
                        <div key={field.name} className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{field.label}</label>
                            <select
                                name={field.name}
                                value={formData[field.name]}
                                onChange={onChange}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D36A47] transition-all appearance-none"
                            >
                                <option value="">Seçiniz...</option>
                                {recipes.map(recipe => (
                                    <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                        İPTAL
                    </button>
                    <button
                        onClick={onSave}
                        className="flex-1 bg-[#D36A47] hover:bg-[#B95839] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-200"
                    >
                        REÇETELERİ ATA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlockDetails;
