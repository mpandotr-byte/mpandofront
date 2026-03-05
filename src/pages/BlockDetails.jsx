import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft,
    Building2,
    Layers,
    Home,
    Maximize,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    MoreVertical,
    Edit2,
    Trash2,
    Filter,
    Search,
    X,
    LayoutGrid,
    Plus,
    PlusCircle,
    Compass,
    FileText,
    User,
    Banknote
} from 'lucide-react';
import NewFloorModal from '../modals/blocks/NewFloorModal';
import NewUnitModal from '../modals/units/NewUnitModal';
import NewRoomModal from '../modals/units/NewRoomModal';

const getUnitStatusDetails = (status) => {
    switch (String(status).toUpperCase()) {
        case 'SOLD':
        case 'SATILDI':
            return { label: 'Satıldı', classes: 'bg-rose-50 text-rose-700 border-rose-100' };
        case 'RESERVED':
        case 'REZERVE':
            return { label: 'Rezerve', classes: 'bg-amber-50 text-amber-700 border-amber-100' };
        case 'AVAILABLE':
        case 'SATILIK':
        case 'MÜSAİT':
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
    const [sales, setSales] = useState([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedFloors, setExpandedFloors] = useState({});
    const [expandedUnits, setExpandedUnits] = useState({});
    const [activeFloorMenu, setActiveFloorMenu] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');

    const [isAddFloorModalOpen, setIsAddFloorModalOpen] = useState(false);
    const [editingFloor, setEditingFloor] = useState(null);
    const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
    const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null);
    const [selectedFloorForUnit, setSelectedFloorForUnit] = useState(null);
    const [selectedUnitForRoom, setSelectedUnitForRoom] = useState(null);
    const [activeUnitMenu, setActiveUnitMenu] = useState(null);
    const [isUnitDetailsModalOpen, setIsUnitDetailsModalOpen] = useState(false);
    const [selectedUnitForDetails, setSelectedUnitForDetails] = useState(null);

    const fetchBlockDetails = async () => {
        setLoading(true);
        try {
            // Fetch project, block and sales data
            const [projectData, blockResponse, salesData] = await Promise.all([
                api.get(`/projects/${projectId}`),
                api.get(`/projects/blocks/${blockId}`),
                api.get(`/sales`).catch(() => [])
            ]);

            setProject(projectData);
            setSales(salesData || []);

            let blockData = blockResponse.block || blockResponse.data || blockResponse;

            // Verileri normalize et
            const normalizeUnit = (u) => ({
                ...u,
                rooms: u.rooms || u.unit_rooms || [],
                rooms_normalized: (u.rooms || u.unit_rooms || []).map(r => ({
                    ...r,
                    name: r.name || r.room_name || 'Oda',
                    area_m2: r.area_m2 || r.area || 0
                }))
            });

            if (blockData.units) {
                blockData.units = blockData.units.map(normalizeUnit);
            }

            // Eğer üniteler katların içinde değil de düz liste (block.units) olarak geldiyse grupla
            // Ancak katın içinde zaten üniteler varsa ve bu üniteler detaylıysa (örn: odalar varsa) üzerine yazma
            if (blockData.units && blockData.floors) {
                console.log("Üniteler düz liste olarak geldi, katlara dağıtılıyor...");
                blockData.floors = blockData.floors.map(f => {
                    const existingUnits = (f.units || []).map(normalizeUnit);

                    const hasDetails = existingUnits.length > 0 && existingUnits.some(u => u.rooms.length > 0);

                    if (hasDetails) {
                        return { ...f, units: existingUnits };
                    }

                    return {
                        ...f,
                        units: blockData.units.filter(u => Number(u.floor_id) === Number(f.id))
                    };
                });
            }

            setBlock(blockData);
        } catch (err) {
            console.error("Blok detayları alınırken hata:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveFloor = async (floorData) => {
        try {
            if (floorData.id) {
                await api.put(`/projects/floors/${floorData.id}`, floorData);
            } else {
                await api.post('/projects/floors', floorData);
            }
            await fetchBlockDetails();
            setIsAddFloorModalOpen(false);
            setEditingFloor(null);
        } catch (err) {
            console.error("Kat kaydetme hatası:", err);
            alert("Kat kaydedilirken bir hata oluştu.");
        }
    };

    const handleDeleteFloor = async (floorId) => {
        if (!window.confirm("Bu katı silmek istediğinize emin misiniz? Katın içindeki tüm üniteler de silinecektir.")) return;
        try {
            await api.delete(`/projects/floors/${floorId}`);
            await fetchBlockDetails();
        } catch (err) {
            console.error("Kat silme hatası:", err);
            alert("Kat silinirken bir hata oluştu.");
        }
    };

    const handleSaveUnit = async (unitData) => {
        try {
            if (unitData.id) {
                await api.put(`/projects/units/${unitData.id}`, unitData);
            } else {
                await api.post('/projects/units', unitData);
            }
            await fetchBlockDetails();
            setIsAddUnitModalOpen(false);
            setEditingUnit(null);
            setSelectedFloorForUnit(null);
        } catch (err) {
            console.error("Ünite kaydetme hatası:", err);
            alert("Ünite kaydedilirken bir hata oluştu.");
        }
    };

    const handleDeleteUnit = async (unitId) => {
        if (!window.confirm("Bu üniteyi silmek istediğinize emin misiniz?")) return;
        try {
            await api.delete(`/projects/units/${unitId}`);
            await fetchBlockDetails();
        } catch (err) {
            console.error("Ünite silme hatası:", err);
            alert("Ünite silinirken bir hata oluştu.");
        }
    };

    const handleSaveRoom = async (roomData) => {
        try {
            if (editingRoom) {
                await api.put(`/projects/rooms/${editingRoom.id}`, roomData);
            } else {
                await api.post(`/projects/rooms`, roomData);
            }
            setIsAddRoomModalOpen(false);
            setEditingRoom(null);

            // Katı yenile
            if (selectedFloorForUnit) {
                const refreshedFloor = await api.get(`/projects/floors/${selectedFloorForUnit}`);
                const normalizedUnits = (refreshedFloor.units || []).map(u => ({
                    ...u,
                    rooms: u.rooms || u.unit_rooms || [],
                    rooms_normalized: (u.rooms || u.unit_rooms || []).map(r => ({
                        ...r,
                        name: r.name || r.room_name || 'Oda',
                        area_m2: r.area_m2 || r.area || 0
                    }))
                }));

                const detailedFloor = { ...refreshedFloor, units: normalizedUnits };

                setBlock(prev => ({
                    ...prev,
                    floors: prev.floors.map(f =>
                        Number(f.id) === Number(selectedFloorForUnit)
                            ? { ...f, ...detailedFloor }
                            : f
                    )
                }));
            }
        } catch (err) {
            console.error("Oda kaydedilirken hata:", err);
            alert("Oda kaydedilemedi: " + err.message);
        }
    };

    const handleDeleteRoom = async (roomId, floorId) => {
        if (!window.confirm("Bu odayı silmek istediğinizden emin misiniz?")) return;
        try {
            await api.delete(`/projects/rooms/${roomId}`);

            const refreshedFloor = await api.get(`/projects/floors/${floorId}`);
            const normalizedUnits = (refreshedFloor.units || []).map(u => ({
                ...u,
                rooms: u.rooms || u.unit_rooms || [],
                rooms_normalized: (u.rooms || u.unit_rooms || []).map(r => ({
                    ...r,
                    name: r.name || r.room_name || 'Oda',
                    area_m2: r.area_m2 || r.area || 0
                }))
            }));

            const detailedFloor = { ...refreshedFloor, units: normalizedUnits };

            setBlock(prev => ({
                ...prev,
                floors: prev.floors.map(f =>
                    Number(f.id) === Number(floorId)
                        ? { ...f, ...detailedFloor }
                        : f
                )
            }));
        } catch (err) {
            console.error("Oda silinirken hata:", err);
            alert("Oda silinemedi.");
        }
    };

    // Dropdown dışında bir yere tıklandığında menüyü kapat
    useEffect(() => {
        const handleClickOutside = (e) => {
            // Eğer tıklanan yer bir menü butonu veya menü içi değilse kapat
            if (!e.target.closest('.floor-menu-container')) {
                setActiveFloorMenu(null);
            }
            if (!e.target.closest('.unit-actions-container')) {
                setActiveUnitMenu(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleFloor = async (floorId) => {
        const isOpening = !expandedFloors[floorId];

        if (isOpening) {
            try {
                const refreshedFloor = await api.get(`/projects/floors/${floorId}`);

                // Normalizasyon (Oda verilerini 'rooms' anahtarı altında topla)
                const normalizedUnits = (refreshedFloor.units || []).map(u => ({
                    ...u,
                    rooms: u.rooms || u.unit_rooms || [],
                    rooms_normalized: (u.rooms || u.unit_rooms || []).map(r => ({
                        ...r,
                        name: r.name || r.room_name || 'Oda',
                        area_m2: r.area_m2 || r.area || 0
                    }))
                }));

                const detailedFloor = { ...refreshedFloor, units: normalizedUnits };

                setBlock(prev => {
                    if (!prev || !prev.floors) return prev;
                    return {
                        ...prev,
                        floors: prev.floors.map(f =>
                            Number(f.id) === Number(floorId)
                                ? { ...f, ...detailedFloor }
                                : f
                        )
                    };
                });
            } catch (err) {
                console.error("Kat detayları yüklenemedi:", err);
            }
        }

        setExpandedFloors(prev => ({
            ...prev,
            [floorId]: !prev[floorId]
        }));
    };

    const toggleUnit = (unit) => {
        setSelectedUnitForDetails(unit);
        setIsUnitDetailsModalOpen(true);
    };

    useEffect(() => {
        if (user && projectId && blockId) {
            fetchBlockDetails();
        }
    }, [projectId, blockId, user]);

    // Benzersiz ünite tiplerini al
    const unitTypes = React.useMemo(() => {
        if (!block?.floors) return [];
        const types = new Set();
        (block.floors || []).forEach(floor => {
            (floor.units || []).forEach(unit => {
                if (unit.unit_type) types.add(unit.unit_type);
            });
        });
        return Array.from(types).sort();
    }, [block]);

    // Filtrelenmiş katlar ve üniteler
    const filteredFloors = React.useMemo(() => {
        if (!block?.floors) return [];

        console.log("Filtreleme yapılıyor. Katlar:", block.floors);

        return block.floors
            .map(floor => {
                const floorUnits = floor.units || [];
                const filtered = floorUnits.filter(unit => {
                    const status = String(unit.sales_status || 'AVAILABLE').toUpperCase();
                    const currentFilter = statusFilter.toUpperCase();

                    const matchesStatus = currentFilter === 'ALL' ||
                        (currentFilter === 'SOLD' && (status === 'SOLD' || status === 'SATILDI')) ||
                        (currentFilter === 'AVAILABLE' && (status === 'AVAILABLE' || status === 'SATILIK' || status === 'MÜSAİT')) ||
                        (currentFilter === 'RESERVED' && (status === 'RESERVED' || status === 'REZERVE'));

                    const matchesType = typeFilter === 'ALL' || unit.unit_type === typeFilter;

                    return matchesStatus && matchesType;
                });

                return { ...floor, units: filtered };
            })
            .sort((a, b) => a.floor_number - b.floor_number);
    }, [block, statusFilter, typeFilter]);

    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={closeMobileMenu} />

            <main className="flex-1 overflow-y-auto h-screen pt-16 md:pt-0 relative">
                <Navbar title={block ? `${block.name} Detayı` : "Blok Detayı"} toggleMobileMenu={toggleMobileMenu} />

                <div className="px-3 sm:px-8 pb-12 pt-3 md:pt-6 space-y-6">
                    <button
                        onClick={() => navigate(`/projects/${projectId}`)}
                        className="group flex items-center gap-2 text-slate-500 hover:text-[#D36A47] transition-all mb-2 font-bold text-xs uppercase tracking-wider"
                    >
                        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Geri Dön
                    </button>

                    {loading ? (
                        <div className="animate-pulse space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-100 p-8 h-32"></div>
                            <div className="bg-white rounded-2xl border border-slate-100 p-8 h-64"></div>
                        </div>
                    ) : !block ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                            <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-700 mb-2">Blok Bulunamadı</h3>
                            <p className="text-slate-500 mb-6">Aradığınız blok silinmiş veya bulunamıyor olabilir.</p>
                            <button onClick={() => navigate(`/projects/${projectId}`)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">
                                Projeye Dön
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* Header Banner - Updated to match Projects.jsx style */}
                            <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1128] via-[#0D1630] to-[#0A1128] rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-slate-900/10">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D36A47]/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-slate-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

                                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#D36A47] shadow-inner">
                                            <Building2 size={32} />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl md:text-3xl font-black tracking-tight">{block.name}</h1>
                                            <p className="text-white/60 text-sm font-medium mt-1">
                                                Proje: <span className="text-white">{project?.name || project?.project_name}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="bg-white/10 backdrop-blur-md text-white px-5 py-3 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-w-[100px] shadow-lg">
                                            <span className="text-2xl font-black leading-none">{block.floor_count}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">Toplam Kat</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floors & Units */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                                    <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Layers size={20} className="text-[#D36A47]" />
                                        Kat ve Ünite Listesi
                                    </h2>

                                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                        {/* Status Filter Pills */}
                                        <div className="flex p-1 bg-slate-100/80 rounded-xl">
                                            {['ALL', 'AVAILABLE', 'SOLD', 'RESERVED'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => setStatusFilter(status)}
                                                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${statusFilter === status
                                                        ? 'bg-white text-[#D36A47] shadow-sm'
                                                        : 'text-slate-400 hover:text-slate-600'
                                                        }`}
                                                >
                                                    {status === 'ALL' ? 'HEPSİ' :
                                                        status === 'AVAILABLE' ? 'SATILIK' :
                                                            status === 'SOLD' ? 'SATILDI' : 'REZERVE'}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Unit Type Dropdown */}
                                        <div className="relative">
                                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                                                <LayoutGrid size={14} className="text-[#0A1128]" />
                                                <select
                                                    value={typeFilter}
                                                    onChange={(e) => setTypeFilter(e.target.value)}
                                                    className="bg-transparent text-[11px] font-black text-slate-700 focus:outline-none cursor-pointer appearance-none pr-4 uppercase tracking-tight"
                                                >
                                                    <option value="ALL">Tüm Tipler</option>
                                                    {unitTypes.map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={12} className="absolute right-3 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                const currentFloorCount = (block.floors || []).length;
                                                const maxFloorCount = parseInt(block.floor_count || 0);

                                                if (currentFloorCount >= maxFloorCount) {
                                                    alert(`Bu blok için belirlenen maksimum kat sayısına (${maxFloorCount}) ulaşıldı.`);
                                                    return;
                                                }
                                                setIsAddFloorModalOpen(true);
                                            }}
                                            disabled={(block.floors || []).length >= parseInt(block.floor_count || 0)}
                                            className={`flex items-center gap-1.5 text-[10px] font-black text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-[#D36A47]/10 ml-auto ${(block.floors || []).length >= parseInt(block.floor_count || 0)
                                                ? 'bg-slate-400 cursor-not-allowed opacity-70'
                                                : 'bg-[#D36A47] hover:bg-[#B95839] hover:scale-105 active:scale-95'
                                                }`}
                                        >
                                            <Plus size={14} /> <span>YENİ KAT EKLE</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {filteredFloors.map((floor, index) => {
                                        const isExpanded = !!expandedFloors[floor.id];
                                        const isMenuOpen = activeFloorMenu === floor.id;
                                        const isLastItems = index >= filteredFloors.length - 2 && filteredFloors.length > 3;

                                        return (
                                            <div key={floor.id} className={`relative pl-2 sm:pl-8 before:absolute before:inset-y-0 before:left-0 sm:before:left-0 before:w-1 sm:before:w-1 before:bg-slate-100 before:rounded-full ${isMenuOpen ? 'z-50' : 'z-10'}`}>
                                                <div
                                                    className="font-bold text-slate-800 flex items-center justify-between mb-4 sticky top-[64px] md:top-0 bg-white/95 backdrop-blur-sm px-2 py-3 cursor-pointer hover:bg-slate-50 transition-all rounded-xl border border-transparent hover:border-slate-100 group shadow-sm sm:shadow-none"
                                                >
                                                    <div className="flex items-center gap-3 flex-1" onClick={() => toggleFloor(floor.id)}>
                                                        <div className="w-8 h-8 rounded-full bg-[#0A1128] text-white flex items-center justify-center sm:absolute sm:-left-[1.65rem] border-4 border-white shadow-md text-xs font-black">
                                                            {floor.floor_number}
                                                        </div>
                                                        <span className="text-sm font-black ml-0 sm:ml-2 uppercase tracking-tight">Kat {floor.floor_number}</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                                                {(floor.units || []).length} Ünite
                                                            </span>
                                                            {floor.gross_area_m2 > 0 && (
                                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                                                                    {floor.gross_area_m2} m² Brüt
                                                                </span>
                                                            )}
                                                            {(floor.column_count > 0 || floor.beam_count > 0) && (
                                                                <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                                                                    {floor.column_count || 0}K / {floor.beam_count || 0}Ki
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {/* Kat İşlem Dropdown */}
                                                        <div className="relative floor-menu-container">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveFloorMenu(isMenuOpen ? null : floor.id);
                                                                }}
                                                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                                            >
                                                                <MoreVertical size={18} />
                                                            </button>

                                                            {isMenuOpen && (
                                                                <div className={`absolute right-0 ${isLastItems ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'} w-44 bg-white border border-slate-200 rounded-xl shadow-2xl z-[999] py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100`}>
                                                                    <div className="px-3 py-1.5 border-b border-slate-50 mb-1">
                                                                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Kat İşlemleri</span>
                                                                    </div>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedFloorForUnit(floor.id);
                                                                            setIsAddUnitModalOpen(true);
                                                                            setTimeout(() => setActiveFloorMenu(null), 100);
                                                                        }}
                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                                    >
                                                                        <div className="w-6 h-6 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-600">
                                                                            <Plus size={14} />
                                                                        </div>
                                                                        Yeni Ünite Ekle
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            console.log("Düzenle tıklandı, kat:", floor);
                                                                            setEditingFloor(floor);
                                                                            setIsAddFloorModalOpen(true);
                                                                            setTimeout(() => setActiveFloorMenu(null), 100);
                                                                        }}
                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                                                    >
                                                                        <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 text-center">
                                                                            <Edit2 size={14} />
                                                                        </div>
                                                                        Katı Düzenle
                                                                    </button>
                                                                    <div className="h-px bg-slate-100 my-1"></div>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            console.log("Silme tıklandı, kat ID:", floor.id);
                                                                            handleDeleteFloor(floor.id);
                                                                            // Menüyü biraz gecikmeli kapatarak işlemin tetiklenmesini garanti ediyoruz
                                                                            setTimeout(() => setActiveFloorMenu(null), 100);
                                                                        }}
                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                                                    >
                                                                        <div className="w-6 h-6 rounded-lg bg-red-100/50 flex items-center justify-center text-red-600">
                                                                            <Trash2 size={14} />
                                                                        </div>
                                                                        Katı Sil
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="text-slate-300 w-px h-4 bg-slate-200 mx-1"></div>

                                                        <div className="text-slate-400" onClick={() => toggleFloor(floor.id)}>
                                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                        </div>
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pb-6 animate-in fade-in slide-in-from-top-2 duration-200 px-1 sm:px-0">
                                                        {(floor.units || []).sort((a, b) => String(a.unit_number).localeCompare(String(b.unit_number), undefined, { numeric: true })).map(unit => {
                                                            const statusDetails = getUnitStatusDetails(unit.sales_status || 'AVAILABLE');
                                                            const isSold = unit.sales_status === 'SOLD' || unit.sales_status === 'SATILDI';

                                                            return (
                                                                <div
                                                                    key={unit.id}
                                                                    onClick={() => toggleUnit(unit)}
                                                                    className="group bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-xl hover:shadow-slate-200/50 hover:border-[#D36A47]/30 transition-all cursor-pointer relative overflow-hidden"
                                                                >
                                                                    {/* Status Accent */}
                                                                    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-10 transition-colors ${statusDetails.classes.split(' ')[0]}`} />

                                                                    <div className="relative flex flex-col h-full">
                                                                        <div className="flex items-start justify-between mb-4">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#D36A47] group-hover:bg-[#D36A47] group-hover:text-white transition-all shadow-inner">
                                                                                    <Home size={24} />
                                                                                </div>
                                                                                <div>
                                                                                    <h4 className="text-lg font-black text-slate-800 tracking-tight">
                                                                                        {String(unit.unit_number).trim().match(/^Daire/i) ? unit.unit_number : `Daire ${unit.unit_number}`}
                                                                                    </h4>
                                                                                    <span className="text-[10px] font-bold text-slate-400 border border-slate-100 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                                                                                        {unit.unit_type}
                                                                                    </span>
                                                                                </div>
                                                                            </div>

                                                                            <div className="relative unit-actions-container" onClick={e => e.stopPropagation()}>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setActiveUnitMenu(activeUnitMenu === unit.id ? null : unit.id);
                                                                                    }}
                                                                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                                                                >
                                                                                    <MoreVertical size={18} />
                                                                                </button>

                                                                                {activeUnitMenu === unit.id && (
                                                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setEditingRoom(null);
                                                                                                setSelectedUnitForRoom(unit.id);
                                                                                                setSelectedFloorForUnit(floor.id);
                                                                                                setIsAddRoomModalOpen(true);
                                                                                                setActiveUnitMenu(null);
                                                                                            }}
                                                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                                                                        >
                                                                                            <PlusCircle size={14} /> Oda Ekle
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setEditingUnit(unit);
                                                                                                setSelectedFloorForUnit(floor.id);
                                                                                                setIsAddUnitModalOpen(true);
                                                                                                setActiveUnitMenu(null);
                                                                                            }}
                                                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                                                                        >
                                                                                            <Edit2 size={14} /> Düzenle
                                                                                        </button>
                                                                                        <div className="h-px bg-slate-50 my-1 mx-2" />
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleDeleteUnit(unit.id);
                                                                                                setActiveUnitMenu(null);
                                                                                            }}
                                                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                                                                        >
                                                                                            <Trash2 size={14} /> Sil
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                                                            <div className="bg-slate-50 rounded-xl p-2 border border-slate-100/50">
                                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Alan</p>
                                                                                <p className="text-xs font-black text-slate-700">
                                                                                    {(unit.rooms || []).reduce((acc, curr) => acc + (Number(curr.area_m2 || curr.area) || 0), 0).toFixed(1)} m²
                                                                                </p>
                                                                            </div>
                                                                            <div className="bg-slate-50 rounded-xl p-2 border border-slate-100/50">
                                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Cephe</p>
                                                                                <p className="text-xs font-black text-slate-700 truncate">{unit.facade || '-'}</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="mt-auto flex items-center justify-between">
                                                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${statusDetails.classes}`}>
                                                                                {statusDetails.label}
                                                                            </span>
                                                                            {unit.price && (
                                                                                <span className="text-xs font-black text-emerald-600">
                                                                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(unit.price)}
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {isSold && (() => {
                                                                            const sale = sales.find(s => String(s.unit_id) === String(unit.id));
                                                                            return sale ? (
                                                                                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                                                                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-black ring-2 ring-white">
                                                                                        {sale.customers?.full_name?.charAt(0).toUpperCase()}
                                                                                    </div>
                                                                                    <span className="text-[11px] font-bold text-slate-600 truncate">{sale.customers?.full_name}</span>
                                                                                </div>
                                                                            ) : null;
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                    {filteredFloors.length === 0 && (
                                        <div className="bg-slate-50 border border-slate-100 border-dashed rounded-xl p-8 text-center text-slate-500">
                                            {(statusFilter !== 'ALL' || typeFilter !== 'ALL') ? "Filtreye uygun daire bulunamadı." : "Bu blokta henüz kat ve daire tanımlanmamış."}
                                        </div>
                                    )}
                                    {(block.floors || []).length === 0 && (
                                        <div className="bg-slate-50 border border-slate-100 border-dashed rounded-xl p-8 text-center text-slate-500">
                                            Bu blokta henüz kat tanımlanmamış.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <NewFloorModal
                isOpen={isAddFloorModalOpen}
                onClose={() => {
                    setIsAddFloorModalOpen(false);
                    setEditingFloor(null);
                }}
                onAdd={handleSaveFloor}
                blockId={blockId}
                floorData={editingFloor}
                maxFloors={block?.floor_count}
            />

            <NewUnitModal
                isOpen={isAddUnitModalOpen}
                onClose={() => {
                    setIsAddUnitModalOpen(false);
                    setEditingUnit(null);
                    setSelectedFloorForUnit(null);
                }}
                onAdd={handleSaveUnit}
                floorId={selectedFloorForUnit}
                unitData={editingUnit}
            />

            <NewRoomModal
                isOpen={isAddRoomModalOpen}
                onClose={() => {
                    setIsAddRoomModalOpen(false);
                    setEditingRoom(null);
                    setSelectedUnitForRoom(null);
                }}
                onAdd={handleSaveRoom}
                unitId={selectedUnitForRoom}
                roomData={editingRoom}
            />
            <UnitDetailsModal
                isOpen={isUnitDetailsModalOpen}
                unit={selectedUnitForDetails}
                sales={sales}
                onClose={() => {
                    setIsUnitDetailsModalOpen(false);
                    setSelectedUnitForDetails(null);
                }}
            />
        </div>
    );
}

const UnitDetailsModal = ({ isOpen, unit, sales, onClose }) => {
    if (!isOpen || !unit) return null;

    const sale = sales.find(s => String(s.unit_id) === String(unit.id));
    const customer = sale?.customers;
    const statusDetails = getUnitStatusDetails(unit.sales_status || 'AVAILABLE');
    const totalArea = (unit.rooms || []).reduce((acc, curr) => acc + (Number(curr.area_m2 || curr.area) || 0), 0);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0A1128]/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 relative flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#D36A47] hover:text-white transition-all z-10 shadow-sm"
                >
                    <X size={20} />
                </button>

                <div className="overflow-y-auto custom-scrollbar p-6 md:p-10">
                    {/* Header */}
                    <div className="flex items-center gap-5 mb-10">
                        <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#0A1128] to-[#1e2a4a] flex items-center justify-center text-white shadow-xl shadow-slate-200">
                            <Home size={32} />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                    {String(unit.unit_number).trim().match(/^Daire/i) ? unit.unit_number : `Daire ${unit.unit_number}`}
                                </h2>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusDetails.classes}`}>
                                    {statusDetails.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                <span className="flex items-center gap-1.5"><LayoutGrid size={14} className="text-[#D36A47]" /> {unit.unit_type}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <span className="flex items-center gap-1.5"><Maximize size={14} className="text-[#D36A47]" /> {totalArea.toFixed(2)} m² Toplam Alan</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Info Section */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Building2 size={16} className="text-[#D36A47]" /> Genel Bilgiler
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-sm font-bold text-slate-500">Ünite No</span>
                                        <span className="text-sm font-black text-slate-800">{unit.unit_number}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-sm font-bold text-slate-500">Cephe</span>
                                        <span className="text-sm font-black text-slate-800">{unit.facade || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-sm font-bold text-slate-500">Liste Fiyatı</span>
                                        <span className="text-sm font-black text-emerald-600">
                                            {unit.price ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(unit.price) : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Owner Section if Sold */}
                            {customer && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <User size={16} className="text-blue-500" /> Mal Sahibi Bilgileri
                                    </h3>
                                    <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm font-black text-xl">
                                            {customer.full_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-slate-800">{customer.full_name}</p>
                                            <p className="text-xs font-bold text-slate-500">{customer.phone || 'Telefon Yok'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Rooms Section */}
                        <div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Maximize size={16} className="text-[#D36A47]" /> Oda Detayları
                            </h3>
                            <div className="bg-slate-50 rounded-[2rem] p-4 border border-slate-100 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {(unit.rooms || []).length === 0 ? (
                                    <div className="py-10 text-center">
                                        <p className="text-sm font-bold text-slate-400 italic">Oda tanımlanmamış</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {(unit.rooms || []).map((room, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-50 shadow-sm transition-all hover:scale-[1.02]">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                                        <Maximize size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800">{room.name || room.room_name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{room.room_type || 'Genel'}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-black text-[#D36A47] bg-orange-50 px-3 py-1 rounded-full">{room.area_m2 || room.area} m²</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MPANDO EMLAK YÖNETİM SİSTEMİ</p>
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-[#0A1128] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-800 hover:scale-105 active:scale-95 shadow-xl shadow-slate-200"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlockDetails;
