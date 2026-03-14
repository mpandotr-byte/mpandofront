import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/client';
import {
    Search,
    Building2,
    Layers,
    CheckSquare,
    Square,
    Info,
    Layout,
    Hammer,
    ArrowRight,
    Loader2,
    Hash,
    Maximize,
    Box,
    ChevronDown,
    ChevronRight,
    MapPin,
    Grid3X3,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react';

function RecipeConsole({ isSubPage = false }) {
    const [loading, setLoading] = useState(false);

    // Data States
    const [projects, setProjects] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [blocks, setBlocks] = useState([]);
    const [selectedBlockId, setSelectedBlockId] = useState('');
    const [floors, setFloors] = useState([]);
    const [selectedFloorId, setSelectedFloorId] = useState('ALL');
    const [allRooms, setAllRooms] = useState([]);

    // UI States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRoomIds, setSelectedRoomIds] = useState([]);
    const [quickGroup, setQuickGroup] = useState('ALL');

    // Assignment Panel States
    const [assignmentData, setAssignmentData] = useState({
        Zemin: '',
        Duvar: '',
        Tavan: ''
    });
    const [isAssigning, setIsAssigning] = useState(false);

    // Initial Fetch
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const [projData, recipeData] = await Promise.all([
                    api.get('/projects'),
                    api.get('/recipes')
                ]);
                setProjects(projData || []);
                setRecipes(recipeData || []);
            } catch (err) {
                console.error("Initial load error:", err);
            }
        };
        fetchInitial();
    }, []);

    // Fetch Blocks when Project changes
    useEffect(() => {
        if (!selectedProjectId) {
            setBlocks([]);
            setAllRooms([]);
            return;
        }
        const fetchProjectDetails = async () => {
            try {
                const data = await api.get(`/projects/${selectedProjectId}`);
                setBlocks(data.blocks || []);
                setSelectedBlockId('');
                setAllRooms([]);
            } catch (err) {
                console.error("Project blocks fetch error:", err);
            }
        };
        fetchProjectDetails();
    }, [selectedProjectId]);

    const fetchRooms = async () => {
        if (!selectedBlockId || !selectedProjectId) return;
        setLoading(true);
        try {
            // Blok verileri + O projedeki tüm atamalar
            const [blockDataResponse, assignmentsResponse] = await Promise.all([
                api.get(`/projects/blocks/${selectedBlockId}`),
                api.get(`/recipes/assignments?project_id=${selectedProjectId}`).catch(() => [])
            ]);

            const blockData = blockDataResponse.block || blockDataResponse.data || blockDataResponse;
            setFloors(blockData.floors || []);

            // Atamaları room_id bazında grupla
            const roomAssignmentsMap = {};
            (assignmentsResponse || []).forEach(a => {
                // Backend'den gelen room_id'yi kullanıyoruz
                const rid = a.room_id || a.rooms?.id;
                if (!rid) {
                    // Eğer id gelmiyorsa room_name üzerinden eşleştirmeye çalış (geçici çözüm)
                    const fallbackKey = `${a.block_name}-${a.floor_no}-${a.unit_no}-${a.room_name}`;
                    if (!roomAssignmentsMap[fallbackKey]) roomAssignmentsMap[fallbackKey] = [];
                    roomAssignmentsMap[fallbackKey].push(a);
                    return;
                }
                if (!roomAssignmentsMap[rid]) roomAssignmentsMap[rid] = [];
                roomAssignmentsMap[rid].push(a);
            });

            let rooms = [];
            (blockData.floors || []).forEach(f => {
                (f.units || []).forEach(u => {
                    const unitRooms = (u.rooms || u.unit_rooms || []).map(r => {
                        // ID ile veya Fallback ile atamayı bul
                        let assignments = roomAssignmentsMap[r.id] || [];
                        if (assignments.length === 0) {
                            const fallbackKey = `${selectedBlockId}-${f.floor_number}-${u.unit_number}-${r.name || r.room_name}`;
                            // Not: selectedBlockId ile backend'den gelen block_name eşleşmeyebilir,
                            // bu yüzden backend'e room_id eklemek kesin çözüm.
                            assignments = roomAssignmentsMap[fallbackKey] || [];
                        }

                        const isAssigned = assignments.length > 0;
                        let summary = '-- Boş --';
                        if (isAssigned) {
                            summary = assignments.map(a => `${a.layer}: ${a.recipe_name || 'Paket'}`).join(', ');
                        }

                        return {
                            ...r,
                            floor_id: f.id,
                            floor_number: f.floor_number,
                            unit_number: u.unit_number,
                            full_name: `${u.unit_number} - ${r.name || r.room_name}`,
                            unit_type: u.unit_type,
                            is_assigned: isAssigned,
                            recipe_summary: summary
                        };
                    });
                    rooms = [...rooms, ...unitRooms];
                });
            });
            setAllRooms(rooms);
            setSelectedFloorId('ALL');
        } catch (err) {
            console.error("Rooms fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Rooms when Block changes
    useEffect(() => {
        if (!selectedBlockId) {
            setFloors([]);
            setAllRooms([]);
            return;
        }
        fetchRooms();
    }, [selectedBlockId]);

    const filteredRooms = useMemo(() => {
        return allRooms.filter(room => {
            const matchesSearch = room.full_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFloor = selectedFloorId === 'ALL' || String(room.floor_id) === String(selectedFloorId);
            let matchesGroup = true;
            if (quickGroup === 'BANYO') matchesGroup = room.full_name.toLowerCase().includes('banyo');
            else if (quickGroup === 'MUTFAK') matchesGroup = room.full_name.toLowerCase().includes('mutfak');
            else if (quickGroup === 'SALON') matchesGroup = room.full_name.toLowerCase().includes('salon');

            return matchesSearch && matchesFloor && matchesGroup;
        });
    }, [allRooms, searchTerm, selectedFloorId, quickGroup]);

    const handleSelectRoom = (id) => {
        setSelectedRoomIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        if (selectedRoomIds.length === filteredRooms.length) setSelectedRoomIds([]);
        else setSelectedRoomIds(filteredRooms.map(r => r.id));
    };

    const handleAssign = async () => {
        if (selectedRoomIds.length === 0) return;
        setIsAssigning(true);
        try {
            const layersToAssign = Object.entries(assignmentData).filter(([_, recipeId]) => recipeId !== '');
            if (selectedRoomIds.length > 1) {
                // Bulk assign for multiple rooms
                for (const [layer, recipeId] of layersToAssign) {
                    await api.post('/recipes/bulk-assign', {
                        recipe_id: parseInt(recipeId),
                        room_ids: selectedRoomIds,
                        layer: layer
                    });
                }
            } else {
                // Single room assign
                for (const [layer, recipeId] of layersToAssign) {
                    await api.post('/recipes/assign', {
                        recipe_id: parseInt(recipeId),
                        room_id: selectedRoomIds[0],
                        layer: layer
                    });
                }
            }
            // Başarı durumunda local state'i anlık güncelle (beklemeden yansıması için)
            setAllRooms(prev => prev.map(room => {
                if (selectedRoomIds.includes(room.id)) {
                    const layers = Object.entries(assignmentData).filter(([_, rid]) => rid !== '');
                    const newSummary = layers.map(([layer, rid]) => {
                        const rName = recipes.find(rec => String(rec.id) === String(rid))?.name || layer;
                        return `${layer}: ${rName}`;
                    }).join(', ');

                    return {
                        ...room,
                        is_assigned: true,
                        recipe_summary: newSummary
                    };
                }
                return room;
            }));

            alert("Atama işlemi başarıyla tamamlandı!");
            setSelectedRoomIds([]);
            setAssignmentData({ Zemin: '', Duvar: '', Tavan: '' });

            // Backend ile tam senkronizasyon için tekrar çek (opsiyonel ama sağlıklı)
            setTimeout(() => fetchRooms(), 500);
        } catch (err) {
            console.error("Assignment error:", err);
            alert("İşlem sırasında hata oluştu.");
        } finally {
            setIsAssigning(false);
        }
    };

    const content = (
        <div className={`flex gap-6 ${isSubPage ? 'h-[calc(100vh-280px)]' : 'h-full'}`}>

            {/* SÜTUN 1: FİLTRE VE NAVİGASYON */}
            <div className="w-80 flex flex-col bg-white rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden shrink-0">
                <div className="p-6 border-b border-slate-100 bg-slate-50/10">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Nereyi Bul?</h3>

                    <div className="space-y-4">
                        <div className="space-y-1.5 font-sans">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Proje & Blok</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D36A47] transition-all"
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                            >
                                <option value="">Proje Seçiniz</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <select
                                disabled={!selectedProjectId}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D36A47] disabled:opacity-40 transition-all mt-2"
                                value={selectedBlockId}
                                onChange={(e) => setSelectedBlockId(e.target.value)}
                            >
                                <option value="">Blok Seçiniz</option>
                                {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Kat</label>
                            <select
                                disabled={!selectedBlockId}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D36A47] disabled:opacity-40 transition-all"
                                value={selectedFloorId}
                                onChange={(e) => setSelectedFloorId(e.target.value)}
                            >
                                <option value="ALL">Tüm Katlar</option>
                                {floors.map(f => <option key={f.id} value={f.id}>{f.floor_number}. Kat</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto bg-white">
                    <div className="space-y-4">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Hızlı Gruplar</p>
                        <div className="grid grid-cols-1 gap-1.5">
                            {[
                                { id: 'ALL', label: 'Tüm Odalar', icon: <Layout size={14} /> },
                                { id: 'BANYO', label: 'Tüm Banyolar', icon: <Hash size={14} /> },
                                { id: 'MUTFAK', label: 'Tüm Mutfaklar', icon: <Hash size={14} /> },
                                { id: 'SALON', label: 'Tüm Salonlar', icon: <Hash size={14} /> }
                            ].map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => setQuickGroup(g.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[12px] font-bold transition-all ${quickGroup === g.id ? 'bg-[#0A1128] text-white shadow-lg shadow-[#0A1128]/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                >
                                    {g.icon} {g.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D36A47] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Mekan ara... (örn: Banyo 101)"
                            className="w-full bg-white border border-slate-200 rounded-[20px] pl-11 pr-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#D36A47]/10 focus:border-[#D36A47] transition-all font-sans"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* SÜTUN 2: MEKAN LİSTESİ */}
            <div className="flex-1 flex flex-col bg-white rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#D36A47]/10 flex items-center justify-center text-[#D36A47]">
                            <Grid3X3 size={24} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-800 tracking-tight uppercase">Mekan Listesi̇</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                <span className="text-[#D36A47]">{filteredRooms.length}</span> Kayıt Mevcut
                            </p>
                        </div>
                    </div>

                    {filteredRooms.length > 0 && (
                        <button
                            onClick={handleSelectAll}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black transition-all border-2 ${selectedRoomIds.length === filteredRooms.length ? 'bg-[#0A1128] text-white border-[#0A1128]' : 'bg-white text-slate-600 border-slate-100 hover:border-[#D36A47]'}`}
                        >
                            {selectedRoomIds.length === filteredRooms.length ? <CheckSquare size={14} /> : <Square size={14} />}
                            <span>{selectedRoomIds.length === filteredRooms.length ? 'SEÇİMİ SIFIRLA' : 'TÜMÜNÜ SEÇ'}</span>
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="animate-spin text-[#D36A47]" size={32} />
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Veriler Yükleniyor...</p>
                        </div>
                    ) : filteredRooms.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-70">
                            <div className="w-20 h-20 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 mb-6">
                                <MapPin size={40} />
                            </div>
                            <h4 className="text-slate-800 font-black text-base uppercase mb-1">Mekan Bulunamadı</h4>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">Lütfen sol panelden bir proje ve blok seçin.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                                <tr className="border-b border-slate-100">
                                    <th className="p-5 w-16 text-center">
                                        <div className="w-4 h-4 mx-auto" />
                                    </th>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mekan Adı</th>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Alan (m²)</th>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mevcut Reçete</th>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredRooms.map(room => (
                                    <tr
                                        key={room.id}
                                        onClick={() => handleSelectRoom(room.id)}
                                        className={`group hover:bg-[#D36A47]/5 transition-all cursor-pointer ${selectedRoomIds.includes(room.id) ? 'bg-[#D36A47]/5' : ''}`}
                                    >
                                        <td className="p-5 text-center">
                                            <div className={`w-5 h-5 rounded-md mx-auto flex items-center justify-center transition-all ${selectedRoomIds.includes(room.id) ? 'bg-[#D36A47] text-white shadow-lg' : 'border-2 border-slate-200 group-hover:border-[#D36A47]/30'}`}>
                                                {selectedRoomIds.includes(room.id) && <CheckSquare size={14} />}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{room.full_name}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{room.floor_number}. Kat</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="text-xs font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                                                {room.area_m2 || room.area || '0.00'} m²
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`text-[10px] font-bold uppercase tracking-tight ${room.is_assigned ? 'text-[#0A1128]' : 'text-slate-300'}`}>
                                                {room.recipe_summary}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="flex items-center justify-center">
                                                {room.is_assigned ? (
                                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Atandı" />
                                                ) : (
                                                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" title="Atama Bekliyor" />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* SÜTUN 3: REÇETE ATAMA PANELİ */}
            <div className={`w-80 flex flex-col bg-white rounded-[32px] border border-slate-200/60 shadow-2xl overflow-hidden shrink-0 transition-all duration-500 ${selectedRoomIds.length > 0 ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                <div className="p-8 bg-gradient-to-br from-[#0A1128] via-[#1E293B] to-[#0A1128] text-white relative">
                    <h3 className="text-xs font-black text-[#D36A47] uppercase tracking-[0.2em] mb-4">Atama Paneli</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                            <Hammer size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-black">{selectedRoomIds.length}</p>
                            <p className="text-[10px] font-bold uppercase opacity-50 tracking-widest">Seçili Mekan</p>
                        </div>
                    </div>
                    {selectedRoomIds.length > 0 && (
                        <div className="mt-4 p-3 bg-white/10 rounded-xl border border-white/10">
                            <p className="text-[11px] font-bold uppercase tracking-tight">"Şu an <span className="text-[#D36A47]">{selectedRoomIds.length}</span> adet Mekan işlem bekliyor."</p>
                        </div>
                    )}
                </div>

                <div className="p-7 flex-1 space-y-7 bg-white">
                    <div className="space-y-6">
                        {[
                            { id: 'Zemin', label: 'Zemin Katmanı', color: 'bg-orange-500' },
                            { id: 'Duvar', label: 'Duvar Katmanı', color: 'bg-blue-500' },
                            { id: 'Tavan', label: 'Tavan Katmanı', color: 'bg-emerald-500' }
                        ].map(layer => (
                            <div key={layer.id} className="space-y-2">
                                <div className="flex items-center justify-between mx-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{layer.label}</label>
                                    <div className={`w-1.5 h-1.5 rounded-full ${layer.color}`} />
                                </div>
                                <select
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-black text-slate-700 focus:bg-white focus:border-[#D36A47] outline-none transition-all appearance-none cursor-pointer"
                                    value={assignmentData[layer.id]}
                                    onChange={(e) => setAssignmentData(prev => ({ ...prev, [layer.id]: e.target.value }))}
                                >
                                    <option value="">Reçete Seçiniz</option>
                                    {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                        <Info className="text-blue-500 shrink-0" size={18} />
                        <p className="text-[10px] font-bold text-blue-700/70 leading-relaxed uppercase">
                            Seçilen mekanlara belirlenen paketler ve metrajlar otomatik olarak atanacaktır.
                        </p>
                    </div>
                </div>

                <div className="p-7 bg-white border-t border-slate-50">
                    <button
                        onClick={handleAssign}
                        disabled={isAssigning || Object.values(assignmentData).every(v => v === '')}
                        className="w-full relative flex items-center justify-center gap-3 bg-[#0A1128] hover:bg-[#D36A47] text-white py-5 rounded-2xl text-[11px] font-black shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:grayscale disabled:opacity-30 disabled:scale-100 uppercase tracking-widest"
                    >
                        {isAssigning ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>İŞLENİYOR...</span>
                            </>
                        ) : (
                            <>
                                <ArrowRight size={16} />
                                <span>ATAMAYI TAMAMLA</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

        </div>
    );

    if (isSubPage) return content;

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans selection:bg-[#D36A47]/20 overflow-hidden">
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {content}
            </main>
        </div>
    );
}

export default RecipeConsole;
