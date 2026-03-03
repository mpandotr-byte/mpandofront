import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ProjectEditModal from '../modals/projects/ProjectEditModal';
import BlockModal from '../modals/blocks/NewBlockModal';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
    Plus,
    ArrowLeft,
    MapPin,
    Calendar,
    Users,
    Hash,
    Briefcase,
    FileText,
    Clock,
    AlertCircle,
    Building2,
    Layers,
    Home,
    Maximize,
    ChevronDown,
    ChevronUp,
    Pencil,
    Trash2
} from 'lucide-react';

const getStatusClasses = (status) => {
    switch (status) {
        case 'IN_PROGRESS':
        case 'Devam Ediyor': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'PLANNING':
        case 'Planlanıyor': return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'DELAYED':
        case 'Gecikmede': return 'bg-red-50 text-red-700 border-red-200';
        case 'FINISHING':
        case 'Bitiyor': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        case 'COMPLETED':
        case 'Tamamlandı': return 'bg-green-50 text-green-700 border-green-200';
        default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
};

const mapStatusToTurkish = (status) => {
    switch (status) {
        case 'IN_PROGRESS': return 'Devam Ediyor';
        case 'PLANNING': return 'Planlanıyor';
        case 'DELAYED': return 'Gecikmede';
        case 'FINISHING': return 'Bitiyor';
        case 'COMPLETED': return 'Tamamlandı';
        default: return status || 'Belirsiz';
    }
};

const getProgressBarColor = (status) => {
    switch (status) {
        case 'IN_PROGRESS':
        case 'Devam Ediyor': return 'bg-blue-600';
        case 'PLANNING':
        case 'Planlanıyor': return 'bg-purple-500';
        case 'DELAYED':
        case 'Gecikmede': return 'bg-red-500';
        case 'FINISHING':
        case 'Bitiyor': return 'bg-yellow-500';
        case 'COMPLETED':
        case 'Tamamlandı': return 'bg-green-600';
        default: return 'bg-slate-500';
    }
};

const ProjectStructure = ({ blocks, projectId, navigate, onAddBlock, onEditBlock, onDeleteBlock }) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 mt-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Building2 size={20} className="text-blue-600" />
                    Proje Yapısı (Bloklar ve Üniteler)
                </h2>
                <button
                    onClick={() => onAddBlock()}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={14} /> Yeni Blok
                </button>
            </div>
            {(!blocks || blocks.length === 0) ? (
                <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
                    <p className="text-sm text-slate-400 font-medium">Bu projeye henüz blok eklenmemiş.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {blocks.map(block => (
                        <div
                            key={block.id}
                            onClick={() => navigate(`/projects/${projectId}/blocks/${block.id}`)}
                            className="bg-slate-50 border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-white transition-all cursor-pointer group relative"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                                    <Building2 size={24} className="text-blue-500" />
                                    {block.name}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditBlock(block);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Bloku Düzenle"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteBlock(block.id);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Bloku Sil"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-end text-sm">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-semibold text-slate-500">
                                        {block.floor_count} Kat
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {block.building_type && (
                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                                                {block.building_type}
                                            </span>
                                        )}
                                        {block.foundation_area_m2 > 0 && (
                                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">
                                                {block.foundation_area_m2} m²
                                            </span>
                                        )}
                                        {block.elevator_count > 0 && (
                                            <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-bold">
                                                {block.elevator_count} Asansör
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <ArrowLeft size={16} className="rotate-180" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

function ProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [siteEngineers, setSiteEngineers] = useState([]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState(null);
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState(null);

    const fetchProjectDetails = async () => {
        setLoading(true);
        try {
            // Müteahhitleri (Site Engineers) Çekme
            try {
                const usersData = await api.get('/users');
                const engineers = (usersData || []).filter(u =>
                    String(u.company_id) === String(user.company_id) &&
                    u.role === 'SITE_ENGINEER'
                );
                setSiteEngineers(engineers);
            } catch (uErr) {
                console.error("Kullanıcılar çekilemedi:", uErr);
            }

            const data = await api.get(`/projects/${id}`);
            setProject(data);
        } catch (err) {
            console.error("Proje detayları alınırken hata:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && id) {
            fetchProjectDetails();
        }
    }, [id, user]);

    const openEditModal = () => {
        // Modalın beklediği formatta veriyi hazırla
        const initialData = {
            company: project.name || project.project_name || '',
            address: project.address || '',
            description: project.description || '',
            contractor_id: project.created_by?.id ?? project.created_by ?? '',
            startDate: (() => {
                const raw = project.start_date || project.created_at;
                if (!raw) return '';
                if (String(raw).includes('.')) {
                    const parts = raw.split('.');
                    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
                return String(raw).split('T')[0];
            })(),
            endDate: (() => {
                const raw = project.end_date;
                if (!raw) return '';
                if (String(raw).includes('.')) {
                    const parts = raw.split('.');
                    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
                return String(raw).split('T')[0];
            })(),
            status: mapStatusToTurkish(project.status),
            location_lat: project.location_lat || '',
            location_lng: project.location_lng || '',
        };
        setEditFormData(initialData);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditFormData(null);
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateProject = async () => {
        if (!editFormData.company) { alert('Proje Adı boş bırakılamaz.'); return; }
        try {
            const status = editFormData.status;

            const updateData = {
                name: editFormData.company,
                address: editFormData.address,
                status: status === 'Devam Ediyor' ? 'IN_PROGRESS' :
                    status === 'Tamamlandı' ? 'COMPLETED' :
                        status === 'Planlanıyor' ? 'PLANNING' :
                            status === 'Gecikmede' ? 'DELAYED' :
                                status === 'Bitiyor' ? 'FINISHING' : 'PLANNING',
                description: editFormData.description,
                start_date: (editFormData.startDate && editFormData.startDate !== '') ? editFormData.startDate : null,
                end_date: editFormData.endDate || null,
                location_lat: editFormData.location_lat || null,
                location_lng: editFormData.location_lng || null,
                created_by: editFormData.contractor_id || null
            };

            await api.put(`/projects/${id}`, updateData);
            await fetchProjectDetails(); // Sayfayı yenile
            closeEditModal();
        } catch (err) {
            console.error("Proje güncelleme hatası:", err);
            alert("Proje güncellenirken bir hata oluştu: " + err.message);
        }
    };

    const handleSaveBlock = async (blockData) => {
        try {
            if (blockData.id) {
                // Update
                await api.put(`/projects/blocks/${blockData.id}`, blockData);
            } else {
                // Create
                await api.post(`/projects/blocks`, blockData);
            }
            await fetchProjectDetails();
            setIsBlockModalOpen(false);
            setEditingBlock(null);
        } catch (err) {
            console.error("Blok kaydetme hatası:", err);
            alert("Blok kaydedilirken bir hata oluştu.");
        }
    };

    const handleDeleteBlock = async (blockId) => {
        if (!window.confirm("Bu bloku silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve bloka ait tüm kat ve üniteler silinecektir.")) return;
        try {
            await api.delete(`/projects/blocks/${blockId}`);
            await fetchProjectDetails();
        } catch (err) {
            console.error("Blok silme hatası:", err);
            alert("Blok silinirken bir hata oluştu.");
        }
    };

    const handleEditBlock = async (block) => {
        try {
            // Fetch detailed block data as requested
            const response = await api.get(`/projects/blocks/${block.id}`);
            console.log("Detailed block response:", response);
            // Handle both wrapped and unwrapped responses
            const detailedBlock = response.block || response.data || response;
            setEditingBlock(detailedBlock);
            setIsBlockModalOpen(true);
        } catch (err) {
            console.error("Blok detayları yüklenemedi:", err);
            // Fallback to existing data if fetch fails
            setEditingBlock(block);
            setIsBlockModalOpen(true);
        }
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const displayStatus = mapStatusToTurkish(project?.status);

    // Progress Logic
    let progress = project?.progress;
    if (typeof progress === 'undefined' || progress === null) {
        if (displayStatus === 'Tamamlandı') progress = 100;
        else if (displayStatus === 'Planlanıyor') progress = 0;
        else progress = 50; // default for unknown
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={closeMobileMenu} />

            <main className="flex-1 overflow-y-auto h-screen md:pt-0">
                <Navbar title="Proje Detayları" toggleMobileMenu={toggleMobileMenu} />

                <div className="px-4 sm:px-8 pb-12 pt-3">
                    {/* Geri Butonu */}
                    <button
                        onClick={() => navigate('/projects')}
                        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 font-medium text-sm"
                    >
                        <ArrowLeft size={16} /> Projelere Dön
                    </button>

                    {loading ? (
                        <div className="animate-pulse space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-100 p-8 h-48"></div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-8 h-64"></div>
                                <div className="bg-white rounded-2xl border border-slate-100 p-8 h-64"></div>
                            </div>
                        </div>
                    ) : !project ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                            <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-700 mb-2">Proje Bulunamadı</h3>
                            <p className="text-slate-500 mb-6">Aradığınız proje silinmiş veya erişim yetkiniz olmayabilir.</p>
                            <button onClick={() => navigate('/projects')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">
                                Listeye Dön
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

                            {/* Header Card */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
                                {/* Status bar top */}
                                <div className={`h-2 w-full ${getProgressBarColor(displayStatus)}`}></div>

                                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                            <h1 className="text-2xl md:text-3xl font-black text-slate-900">{project.name || project.project_name || 'İsimsiz Proje'}</h1>
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center border rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(displayStatus)}`}>
                                                    {displayStatus}
                                                </span>
                                                <button
                                                    onClick={openEditModal}
                                                    className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                    title="Projeyi Düzenle"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm mt-3 font-medium">
                                            <MapPin size={16} className="text-slate-400" />
                                            {project.address || project.location || 'Adres belirtilmemiş'}
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-100 w-full md:w-64">
                                        <div className="flex justify-between text-sm font-semibold mb-2">
                                            <span className="text-slate-600">İlerleme Durumu</span>
                                            <span className="text-blue-600">%{progress}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${getProgressBarColor(displayStatus)}`}
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <ProjectStructure
                                    blocks={project.blocks}
                                    projectId={id}
                                    navigate={navigate}
                                    onAddBlock={() => {
                                        setEditingBlock(null);
                                        setIsBlockModalOpen(true);
                                    }}
                                    onEditBlock={handleEditBlock}
                                    onDeleteBlock={handleDeleteBlock}
                                />
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* Main Info */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                            <FileText size={20} className="text-blue-600" />
                                            Proje Detayları
                                        </h2>

                                        <div className="prose prose-sm md:prose-base text-slate-600 max-w-none">
                                            {project.description ? (
                                                <p className="whitespace-pre-wrap">{project.description}</p>
                                            ) : (
                                                <p className="italic text-slate-400">Açıklama bulunmuyor.</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-slate-100">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Başlangıç Tarihi</p>
                                                    <p className="font-semibold text-slate-800">
                                                        {project.start_date || project.created_at ? new Date(project.start_date || project.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belirtilmedi'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bitiş Tarihi</p>
                                                    <p className="font-semibold text-slate-800">
                                                        {project.end_date ? new Date(project.end_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belirtilmedi'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Info */}
                                <div className="space-y-6">
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                        <h3 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
                                            <Briefcase size={18} className="text-blue-600" />
                                            Genel Bakış
                                        </h3>

                                        <ul className="space-y-4">
                                            {/* Ünite Sayısı kaldırıldı */}
                                            <li className="flex flex-col gap-2 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                                <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                                                    <Users size={16} /> <span>Proje Sorumlusu</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                                                        {(project.creator_name || project.users?.full_name || project.users?.name || 'A').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-slate-800">
                                                        {project.creator_name || project.users?.full_name || project.users?.name || 'Sistem Yöneticisi'}
                                                    </span>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>

                                    {project.dwg_file_url && (
                                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-sm p-6 text-white text-center">
                                            <FileText size={32} className="mx-auto mb-3 opacity-90" />
                                            <h3 className="font-bold text-lg mb-1">Teknik Çizimler</h3>
                                            <p className="text-blue-100 text-sm mb-4">Bu projenin DWG/CAD dosyalarını indirebilirsiniz.</p>
                                            <a
                                                href={project.dwg_file_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-block w-full py-2.5 bg-white text-blue-700 font-bold rounded-xl shadow-sm hover:shadow-md transition-all text-sm"
                                            >
                                                Dosyayı Görüntüle / İndir
                                            </a>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <ProjectEditModal
                    isOpen={isEditModalOpen}
                    projectData={editFormData}
                    contractors={siteEngineers}
                    onClose={closeEditModal}
                    onChange={handleEditFormChange}
                    onSave={handleUpdateProject}
                />

                <BlockModal
                    isOpen={isBlockModalOpen}
                    onClose={() => {
                        setIsBlockModalOpen(false);
                        setEditingBlock(null);
                    }}
                    onSave={handleSaveBlock}
                    projectId={id}
                    blockData={editingBlock}
                />
            </main>
        </div>
    );
}

export default ProjectDetails;
