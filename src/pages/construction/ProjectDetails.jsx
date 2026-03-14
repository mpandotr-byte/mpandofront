import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import ProjectEditModal from '../../modals/projects/ProjectEditModal';
import BlockModal from '../../modals/blocks/NewBlockModal';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
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
    Trash2,
    Upload,
    Sparkles,
    Loader2,
    X,
    Save,
    File
} from 'lucide-react';

const getStatusClasses = (status) => {
    switch (status) {
        case 'IN_PROGRESS':
        case 'Devam Ediyor': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'PLANNING':
        case 'Planlanıyor': return 'bg-orange-50 text-orange-700 border-orange-200';
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
        case 'Planlanıyor': return 'bg-orange-500';
        case 'DELAYED':
        case 'Gecikmede': return 'bg-red-500';
        case 'FINISHING':
        case 'Bitiyor': return 'bg-yellow-500';
        case 'COMPLETED':
        case 'Tamamlandı': return 'bg-green-600';
        default: return 'bg-slate-500';
    }
};

const ProjectStructure = ({ blocks, projectId, navigate, onAddBlock, onEditBlock, onDeleteBlock, selectedBlocks, onSelectBlock, onSelectAll, onBulkAssign }) => {
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

            {selectedBlocks?.length > 0 && (
                <div className="mb-6 flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <span className="bg-blue-600 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black">{selectedBlocks.length}</span>
                        <span className="text-sm font-bold text-blue-900">Blok Seçildi</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onSelectAll()}
                            className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors"
                        >
                            {selectedBlocks.length === (blocks?.length || 0) ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                        </button>
                        <button
                            onClick={() => onBulkAssign()}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                        >
                            <Layers size={14} /> Reçete Ata
                        </button>
                    </div>
                </div>
            )}
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
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="ml-2 flex items-center"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedBlocks?.includes(block.id)}
                                            onChange={() => onSelectBlock(block.id)}
                                            className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 bg-white"
                                        />
                                    </div>
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
    const [selectedBlocks, setSelectedBlocks] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [isBulkRecipeModalOpen, setIsBulkRecipeModalOpen] = useState(false);
    const [bulkRecipeData, setBulkRecipeData] = useState({
        foundation_recipe_id: '',
        facade_recipe_id: '',
        roof_recipe_id: '',
        plumbing_recipe_id: '',
        basement_recipe_id: ''
    });

    // DWG/PDF Upload
    const [dwgFiles, setDwgFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const fileInputRef = React.useRef(null);

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

            // Reçeteleri de çek (bulk atama için)
            const recipesData = await api.get('/recipes');
            setRecipes(recipesData || []);

            // DWG dosyalarını çek
            try {
                const dwgData = await api.get(`/dwg/${id}`);
                setDwgFiles(dwgData || []);
            } catch (e) { console.log('DWG dosyaları çekilemedi'); }
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

    const handleSelectBlock = (blockId) => {
        setSelectedBlocks(prev =>
            prev.includes(blockId) ? prev.filter(id => id !== blockId) : [...prev, blockId]
        );
    };

    const handleSelectAllBlocks = () => {
        if (selectedBlocks.length === (project?.blocks?.length || 0)) {
            setSelectedBlocks([]);
        } else {
            setSelectedBlocks(project?.blocks?.map(b => b.id) || []);
        }
    };

    const handleBulkRecipeAssign = async () => {
        if (selectedBlocks.length === 0) return;
        try {
            // Her seçili blok için güncelleme gönder
            await Promise.all(selectedBlocks.map(blockId =>
                api.put(`/projects/blocks/${blockId}`, {
                    ...bulkRecipeData
                })
            ));
            alert(`${selectedBlocks.length} bloka reçeteler başarıyla atandı.`);
            setIsBulkRecipeModalOpen(false);
            setSelectedBlocks([]);
            await fetchProjectDetails();
        } catch (err) {
            console.error("Toplu reçete atama hatası:", err);
            alert("Reçeteler atanırken bir hata oluştu.");
        }
    };

    // DWG/PDF Dosya Yükleme
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['.dwg', '.pdf', '.png', '.jpg', '.jpeg'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(ext)) {
            alert('Desteklenen dosya türleri: DWG, PDF, PNG, JPG');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('project_id', id);
            const result = await api.upload(`/dwg/upload`, formData);
            setDwgFiles(prev => [...prev, result.file || result]);
            alert('Dosya başarıyla yüklendi!');
        } catch (err) {
            console.error('Dosya yükleme hatası:', err);
            alert('Dosya yüklenirken hata oluştu: ' + err.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // AI Otomatik Doldurma
    const handleAiAutoFill = async () => {
        if (!project) return;

        setIsAiAnalyzing(true);
        setAiResult(null);
        try {
            // AI'dan proje analizi iste
            const prompt = `Bu bir inşaat projesi. Proje adı: "${project.name}". Açıklama: "${project.description || 'Yok'}". Mevcut bloklar: ${project.blocks?.map(b => b.name + ' (' + b.floor_count + ' kat)').join(', ') || 'Yok'}. Lütfen bu proje için eksik bilgileri tahmin et ve JSON formatında döndür: {"blocks": [{"name": "Blok adı", "floor_count": sayı, "building_type": "Konut/Ticari", "foundation_area_m2": sayı, "elevator_count": sayı}], "floors": [{"block_name": "Blok adı", "floor_number": sayı, "height_cm": sayı, "gross_area_m2": sayı}], "units": [{"block_name": "Blok adı", "floor_number": sayı, "unit_number": "no", "unit_type": "1+1/2+1/3+1", "facade": "yön"}]}. Sadece JSON döndür, açıklama yapma.`;

            const response = await api.post('/ai/test-ai', { prompt, model: 'claude' });

            // AI yanıtını parse et
            let parsed = null;
            const text = response.analysis || response.result || response.message || '';

            try {
                // JSON bloğunu bul
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[0]);
                }
            } catch (parseErr) {
                console.log('JSON parse hatası, metin olarak gösteriliyor');
            }

            setAiResult({ text, parsed });

            if (parsed) {
                const confirmApply = window.confirm('AI analiz tamamlandı! Sonuçları projeye uygulamak ister misiniz?');
                if (confirmApply) {
                    await applyAiResults(parsed);
                }
            }
        } catch (err) {
            console.error('AI analiz hatası:', err);
            alert('AI analiz sırasında hata: ' + err.message);
        } finally {
            setIsAiAnalyzing(false);
        }
    };

    const applyAiResults = async (parsed) => {
        try {
            let updatedCount = 0;

            // Mevcut blokları güncelle
            if (parsed.blocks && project.blocks) {
                for (const aiBlock of parsed.blocks) {
                    const existingBlock = project.blocks.find(b =>
                        b.name.toLowerCase() === aiBlock.name?.toLowerCase()
                    );
                    if (existingBlock) {
                        const updateData = {};
                        if (aiBlock.building_type && !existingBlock.building_type) updateData.building_type = aiBlock.building_type;
                        if (aiBlock.foundation_area_m2 && !existingBlock.foundation_area_m2) updateData.foundation_area_m2 = aiBlock.foundation_area_m2;
                        if (aiBlock.elevator_count && !existingBlock.elevator_count) updateData.elevator_count = aiBlock.elevator_count;

                        if (Object.keys(updateData).length > 0) {
                            await api.put(`/projects/blocks/${existingBlock.id}`, updateData);
                            updatedCount++;
                        }
                    }
                }
            }

            alert(`AI sonuçları uygulandı! ${updatedCount} blok güncellendi.`);
            await fetchProjectDetails();
        } catch (err) {
            console.error('AI sonuçları uygulama hatası:', err);
            alert('Sonuçlar uygulanırken hata: ' + err.message);
        }
    };

    // AI ile DWG/PDF Dosyası Analizi
    const handleAiFileAnalysis = async (fileUrl, fileName) => {
        setIsAiAnalyzing(true);
        try {
            const response = await api.post('/ai/test-ai', {
                prompt: `Bu dosya bir inşaat projesi teknik çizimidir: "${fileName}". Dosya URL: ${fileUrl}. Bu dosyayı analiz et ve proje yapısını (blok sayısı, kat sayısı, daire tipleri, m² bilgileri) çıkar. JSON formatında döndür.`,
                model: 'claude'
            });

            const text = response.analysis || response.result || response.message || '';
            setAiResult({ text, parsed: null });
            alert('AI dosya analizi tamamlandı! Sonuçları aşağıda görebilirsiniz.');
        } catch (err) {
            alert('AI dosya analizi hatası: ' + err.message);
        } finally {
            setIsAiAnalyzing(false);
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
                                    selectedBlocks={selectedBlocks}
                                    onSelectBlock={handleSelectBlock}
                                    onSelectAll={handleSelectAllBlocks}
                                    onBulkAssign={() => setIsBulkRecipeModalOpen(true)}
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

                                        {/* DWG/PDF Dosya Yükleme */}
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <File size={18} className="text-blue-600" />
                                            Proje Dosyaları
                                        </h3>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".dwg,.pdf,.png,.jpg,.jpeg"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />

                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/50 hover:bg-blue-50 rounded-xl text-sm font-bold text-blue-600 transition-all mb-3"
                                        >
                                            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                            {isUploading ? 'Yükleniyor...' : 'DWG / PDF Yükle'}
                                        </button>

                                        {dwgFiles.length > 0 && (
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {dwgFiles.map((f, idx) => (
                                                    <div key={f.id || idx} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <FileText size={14} className="text-blue-500 shrink-0" />
                                                            <span className="text-xs font-medium text-slate-700 truncate">{f.file_name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            {f.file_url && (
                                                                <a href={f.file_url} target="_blank" rel="noreferrer"
                                                                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors" title="Görüntüle">
                                                                    <ArrowLeft size={12} className="rotate-180" />
                                                                </a>
                                                            )}
                                                            <button
                                                                onClick={() => handleAiFileAnalysis(f.file_url, f.file_name)}
                                                                disabled={isAiAnalyzing}
                                                                className="p-1 text-slate-400 hover:text-orange-600 transition-colors" title="AI Analiz">
                                                                <Sparkles size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {project.dwg_file_url && !dwgFiles.find(f => f.file_url === project.dwg_file_url) && (
                                            <a href={project.dwg_file_url} target="_blank" rel="noreferrer"
                                                className="mt-2 block text-center text-xs text-blue-600 font-bold hover:underline">
                                                Mevcut DWG Dosyasını Görüntüle
                                            </a>
                                        )}
                                    </div>

                                    {/* AI Otomatik Doldurma */}
                                    <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl shadow-sm p-6 text-white">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Sparkles size={20} />
                                            <h3 className="font-bold text-lg">AI Otomatik Doldurma</h3>
                                        </div>
                                        <p className="text-orange-100 text-xs mb-4">
                                            AI, proje bilgilerini analiz ederek blok, kat ve daire detaylarını otomatik doldurur.
                                        </p>
                                        <button
                                            onClick={handleAiAutoFill}
                                            disabled={isAiAnalyzing}
                                            className="w-full py-3 bg-white text-orange-700 font-bold rounded-xl shadow-sm hover:shadow-md transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isAiAnalyzing ? (
                                                <><Loader2 size={16} className="animate-spin" /> Analiz Ediliyor...</>
                                            ) : (
                                                <><Sparkles size={16} /> Projeyi Analiz Et</>
                                            )}
                                        </button>

                                        {aiResult && (
                                            <div className="mt-3 p-3 bg-white/10 rounded-lg max-h-32 overflow-y-auto">
                                                <p className="text-[10px] font-bold text-white/60 uppercase mb-1">AI Sonucu</p>
                                                <p className="text-xs text-white/90 whitespace-pre-wrap">
                                                    {aiResult.parsed ? `${JSON.stringify(aiResult.parsed, null, 2).substring(0, 300)}...` : aiResult.text?.substring(0, 300)}
                                                </p>
                                            </div>
                                        )}
                                    </div>

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

                <BulkRecipeModal
                    isOpen={isBulkRecipeModalOpen}
                    onClose={() => setIsBulkRecipeModalOpen(false)}
                    onSave={handleBulkRecipeAssign}
                    recipes={recipes}
                    formData={bulkRecipeData}
                    onChange={(e) => {
                        const { name, value } = e.target;
                        setBulkRecipeData(prev => ({ ...prev, [name]: value }));
                    }}
                    selectedCount={selectedBlocks.length}
                />
            </main>
        </div>
    );
}

const BulkRecipeModal = ({ isOpen, onClose, onSave, recipes, formData, onChange, selectedCount }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1128]/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                            <Layers size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Toplu Reçete Atama</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">{selectedCount} BLOK SEÇİLDİ</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-400 hover:text-blue-600 transition-all"><X size={24} /></button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RecipeSelector label="TEMEL REÇETESİ" name="foundation_recipe_id" value={formData.foundation_recipe_id} recipes={recipes} onChange={onChange} />
                        <RecipeSelector label="DIŞ CEPHE REÇETESİ" name="facade_recipe_id" value={formData.facade_recipe_id} recipes={recipes} onChange={onChange} />
                        <RecipeSelector label="ÇATI REÇETESİ" name="roof_recipe_id" value={formData.roof_recipe_id} recipes={recipes} onChange={onChange} />
                        <RecipeSelector label="TESİSAT REÇETELERİ" name="plumbing_recipe_id" value={formData.plumbing_recipe_id} recipes={recipes} onChange={onChange} />
                        <RecipeSelector label="BODRUM REÇETESİ" name="basement_recipe_id" value={formData.basement_recipe_id} recipes={recipes} onChange={onChange} />
                    </div>
                </div>
                <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-all">İptal</button>
                    <button onClick={onSave} className="inline-flex items-center gap-3 px-10 py-4 text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95"><Save size={18} /> SEÇİLİ BLOKLARA ATAYIN</button>
                </div>
            </div>
        </div>
    );
};

const RecipeSelector = ({ label, name, value, recipes, onChange }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <select name={name} value={value} onChange={onChange} className="w-full bg-white px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all"><option value="">SEÇİM YAPINIZ...</option>{recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
    </div>
);

export default ProjectDetails;
