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
    FileText
} from 'lucide-react';
import NewFloorModal from '../modals/blocks/NewFloorModal';
import NewUnitModal from '../modals/units/NewUnitModal';
import NewRoomModal from '../modals/units/NewRoomModal';

const getUnitStatusDetails = (status) => {
    switch (String(status).toUpperCase()) {
        case 'SOLD':
        case 'SATILDI':
            return { label: 'Satıldı', classes: 'bg-red-50 text-red-700 border-red-200' };
        case 'RESERVED':
        case 'REZERVE':
            return { label: 'Rezerve', classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
        case 'AVAILABLE':
        case 'SATILIK':
        case 'MÜSAİT':
        default:
            return { label: 'Satılık', classes: 'bg-green-50 text-green-700 border-green-200' };
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

    const fetchBlockDetails = async () => {
        setLoading(true);
        try {
            // Get project data for context (breadcrumbs etc)
            const projectData = await api.get(`/projects/${projectId}`);
            setProject(projectData);

            // Fetch detailed block data using the specific endpoint
            const response = await api.get(`/projects/blocks/${blockId}`);
            console.log("API'den gelen blok verisi:", response);

            let blockData = response.block || response.data || response;

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

    const toggleUnit = (unitId) => {
        setExpandedUnits(prev => ({
            ...prev,
            [unitId]: !prev[unitId]
        }));
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

            <main className="flex-1 overflow-y-auto h-screen md:pt-0">
                <Navbar title={block ? `${block.name} Detayı` : "Blok Detayı"} toggleMobileMenu={toggleMobileMenu} />

                <div className="px-4 sm:px-8 pb-12 pt-3">
                    <button
                        onClick={() => navigate(`/projects/${projectId}`)}
                        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 font-medium text-sm"
                    >
                        <ArrowLeft size={16} /> Proje Detayına Dön
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
                            {/* Header */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Building2 size={32} className="text-blue-600" />
                                        <h1 className="text-2xl md:text-3xl font-black text-slate-900">{block.name}</h1>
                                    </div>
                                    <p className="text-slate-500 font-medium">Proje: {project?.name || project?.project_name}</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl border border-blue-100 flex flex-col items-center justify-center min-w-[100px]">
                                        <span className="text-2xl font-bold">{block.floor_count}</span>
                                        <span className="text-xs font-semibold uppercase tracking-wider">Kat</span>
                                    </div>
                                </div>
                            </div>

                            {/* Floors & Units */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Layers size={20} className="text-blue-600" />
                                        Kat ve Daire Detayları
                                    </h2>

                                    <div className="flex flex-wrap items-center gap-3">
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
                                            className={`flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm order-last md:order-none ${(block.floors || []).length >= parseInt(block.floor_count || 0)
                                                ? 'bg-slate-400 cursor-not-allowed opacity-70'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                                }`}
                                            title={(block.floors || []).length >= parseInt(block.floor_count || 0) ? 'Maksimum kat sayısına ulaşıldı' : 'Yeni Kat Ekle'}
                                        >
                                            <Plus size={14} /> Yeni Kat
                                        </button>

                                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                                            <Filter size={14} className="text-slate-400" />
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
                                            >
                                                <option value="ALL">Tüm Durumlar</option>
                                                <option value="AVAILABLE">Satılık</option>
                                                <option value="SOLD">Satıldı</option>
                                                <option value="RESERVED">Rezerve</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                                            <LayoutGrid size={14} className="text-slate-400" />
                                            <select
                                                value={typeFilter}
                                                onChange={(e) => setTypeFilter(e.target.value)}
                                                className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
                                            >
                                                <option value="ALL">Tüm Tipler</option>
                                                {unitTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {(statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
                                            <button
                                                onClick={() => {
                                                    setStatusFilter('ALL');
                                                    setTypeFilter('ALL');
                                                }}
                                                className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                title="Filtreleri Temizle"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {filteredFloors.map((floor, index) => {
                                        const isExpanded = !!expandedFloors[floor.id];
                                        const isMenuOpen = activeFloorMenu === floor.id;
                                        const isLastItems = index >= filteredFloors.length - 2 && filteredFloors.length > 3;

                                        return (
                                            <div key={floor.id} className={`relative pl-6 md:pl-8 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-slate-100 before:rounded-full ${isMenuOpen ? 'z-50' : 'z-10'}`}>
                                                <div
                                                    className="font-bold text-slate-800 flex items-center justify-between mb-4 sticky top-0 bg-white py-2 cursor-pointer hover:bg-slate-50 transition-colors rounded-lg pr-4 group"
                                                >
                                                    <div className="flex items-center gap-3 flex-1" onClick={() => toggleFloor(floor.id)}>
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center absolute -left-[1.15rem] md:-left-[1.65rem] border-4 border-white shadow-sm">
                                                            {floor.floor_number}
                                                        </div>
                                                        <span className="text-sm font-bold ml-2">Kat {floor.floor_number}</span>
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
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                                        {(floor.units || []).sort((a, b) => String(a.unit_number).localeCompare(String(b.unit_number), undefined, { numeric: true })).map(unit => {
                                                            const statusDetails = getUnitStatusDetails(unit.sales_status || 'AVAILABLE');
                                                            const isUnitExpanded = !!expandedUnits[unit.id];
                                                            return (
                                                                <div key={unit.id} className="border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all h-fit relative">
                                                                    <div
                                                                        className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                                                                        onClick={() => toggleUnit(unit.id)}
                                                                    >
                                                                        <div className="font-bold text-base text-slate-800 flex items-center justify-between gap-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <Home size={18} className="text-orange-500" />
                                                                                <span className="truncate whitespace-nowrap">
                                                                                    {String(unit.unit_number).trim().match(/^Daire/i) ? unit.unit_number : `Daire ${unit.unit_number}`}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="relative unit-actions-container">
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setActiveUnitMenu(activeUnitMenu === unit.id ? null : unit.id);
                                                                                        }}
                                                                                        className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-all border border-transparent hover:border-slate-200 shadow-sm"
                                                                                        title="Daire İşlemleri"
                                                                                    >
                                                                                        <MoreVertical size={16} />
                                                                                    </button>

                                                                                    {activeUnitMenu === unit.id && (
                                                                                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 py-1.5 z-[9999] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-150 origin-bottom-right">
                                                                                            <div className="px-3 py-1.5 mb-1 text-center border-b border-slate-50">
                                                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Daire İşlemleri</p>
                                                                                            </div>
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setEditingRoom(null);
                                                                                                    setSelectedUnitForRoom(unit.id);
                                                                                                    setSelectedFloorForUnit(floor.id);
                                                                                                    setIsAddRoomModalOpen(true);
                                                                                                    setActiveUnitMenu(null);
                                                                                                }}
                                                                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                                                                                            >
                                                                                                <div className="bg-blue-100 p-1.5 rounded-lg">
                                                                                                    <PlusCircle size={14} />
                                                                                                </div>
                                                                                                Oda Ekle
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setEditingUnit(unit);
                                                                                                    setSelectedFloorForUnit(floor.id);
                                                                                                    setIsAddUnitModalOpen(true);
                                                                                                    setActiveUnitMenu(null);
                                                                                                }}
                                                                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                                                                            >
                                                                                                <div className="bg-slate-100 p-1.5 rounded-lg text-slate-500">
                                                                                                    <Edit2 size={13} />
                                                                                                </div>
                                                                                                Daireyi Düzenle
                                                                                            </button>
                                                                                            <div className="h-px bg-slate-100 my-1 mx-2"></div>
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    handleDeleteUnit(unit.id);
                                                                                                    setActiveUnitMenu(null);
                                                                                                }}
                                                                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                                                                                            >
                                                                                                <div className="bg-red-100 p-1.5 rounded-lg text-red-500">
                                                                                                    <Trash2 size={13} />
                                                                                                </div>
                                                                                                Daireyi Sil
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                {isUnitExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 mt-2">
                                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusDetails.classes}`}>
                                                                                {statusDetails.label}
                                                                            </span>
                                                                            <span className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-bold border border-orange-100">
                                                                                {unit.unit_type}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {isUnitExpanded && (
                                                                        <div className="p-4 pt-0 space-y-2 border-t border-slate-100 bg-slate-50/30 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                            <div className="pt-3 space-y-2">
                                                                                {/* Ek Detaylar */}
                                                                                <div className="flex flex-wrap gap-2 mb-3">
                                                                                    {unit.facade && (
                                                                                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200 font-medium">
                                                                                            <Compass size={10} className="inline mr-1 mb-0.5" />
                                                                                            {unit.facade}
                                                                                        </span>
                                                                                    )}
                                                                                    {unit.contract_no && (
                                                                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg border border-blue-100 font-medium">
                                                                                            <FileText size={10} className="inline mr-1 mb-0.5" />
                                                                                            {unit.contract_no}
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                {(unit.rooms || []).length === 0 ? (
                                                                                    <p className="text-xs text-slate-400 italic text-center py-2">Oda tanımlanmamış</p>
                                                                                ) : (
                                                                                    (unit.rooms || []).map(room => (
                                                                                        <div key={room.id} className="group/room flex items-center justify-between text-sm text-slate-600 bg-white rounded-lg px-3 py-2 border border-slate-100 shadow-sm transition-all hover:border-blue-100 hover:shadow-md">
                                                                                            <div className="flex items-center gap-2 font-medium">
                                                                                                <Maximize size={14} className="text-slate-400" />
                                                                                                <div className="flex flex-col">
                                                                                                    <span>{room.name || room.room_name || 'Oda'}</span>
                                                                                                    {room.room_type && <span className="text-[9px] text-slate-400 font-normal">{room.room_type}</span>}
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-3">
                                                                                                <div className="font-bold text-slate-700">
                                                                                                    {room.area_m2 || room.area || 0} m²
                                                                                                </div>
                                                                                                <div className="flex items-center gap-1 opacity-0 group-hover/room:opacity-100 transition-opacity">
                                                                                                    <button
                                                                                                        onClick={(e) => {
                                                                                                            e.stopPropagation();
                                                                                                            setEditingRoom(room);
                                                                                                            setSelectedUnitForRoom(unit.id);
                                                                                                            setSelectedFloorForUnit(floor.id);
                                                                                                            setIsAddRoomModalOpen(true);
                                                                                                        }}
                                                                                                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors"
                                                                                                        title="Odayı Düzenle"
                                                                                                    >
                                                                                                        <Edit2 size={12} />
                                                                                                    </button>
                                                                                                    <button
                                                                                                        onClick={(e) => {
                                                                                                            e.stopPropagation();
                                                                                                            handleDeleteRoom(room.id, floor.id);
                                                                                                        }}
                                                                                                        className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors"
                                                                                                        title="Odayı Sil"
                                                                                                    >
                                                                                                        <Trash2 size={12} />
                                                                                                    </button>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))
                                                                                )}
                                                                                {(unit.rooms || []).length > 0 && (
                                                                                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100 text-xs font-bold text-slate-800">
                                                                                        <span>Toplam Alan:</span>
                                                                                        <span className="text-blue-600">
                                                                                            {(unit.rooms || []).reduce((acc, curr) => acc + (Number(curr.area_m2 || curr.area) || 0), 0).toFixed(2)} m²
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
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
        </div>
    );
}

export default BlockDetails;
