import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from "../../context/AuthContext";
import { api } from '../../api/client';
import {
    FileText,
    Plus,
    Filter,
    Search,
    Download,
    Trash2,
    Pencil,
    Layout,
    Building2,
    FolderOpen,
    FileCode,
    FileJson,
    Files,
    MoreVertical,
    Calendar,
    User,
    ChevronDown,
    ExternalLink
} from 'lucide-react';
import NewConstructionFileModal from '../../modals/construction/NewConstructionFileModal';

const fileCategories = [
    { name: 'Mimari', color: 'bg-blue-500' },
    { name: 'Statik', color: 'bg-orange-500' },
    { name: 'Hakediş', color: 'bg-emerald-500' },
    { name: 'Mekanik', color: 'bg-orange-500' },
    { name: 'Elektrik', color: 'bg-orange-500' },
    { name: 'Ruhsat/İzin', color: 'bg-red-500' },
    { name: 'Sözleşme', color: 'bg-slate-600' },
    { name: 'Diğer', color: 'bg-slate-400' }
];

const ConstructionFiles = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const { user } = useAuth();
    const canManageFiles = ['CORP_ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER'].includes(user?.role);

    const fetchFiles = async () => {
        if (selectedProject === 'all') {
            setFiles([]);
            return;
        }

        setLoading(true);
        try {
            const query = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
            const data = await api.get(`/construction/files/${selectedProject}${query}`);
            setFiles(data || []);
        } catch (error) {
            console.error("Fetch files error:", error);
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const data = await api.get('/projects');
            setProjects(data || []);
            if (data?.length > 0 && selectedProject === 'all') {
                setSelectedProject(data[0].id.toString());
            }
        } catch (error) {
            console.error("Fetch projects error:", error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [selectedProject, selectedCategory]);

    const handleDelete = async (id) => {
        if (!window.confirm('Bu dosyayı kalıcı olarak silmek istediğinize emin misiniz?')) return;

        try {
            await api.delete(`/construction/files/${id}`);
            setFiles(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            alert('Silme işlemi başarısız: ' + error.message);
        }
    };

    const handleUpdate = async (id, updateData) => {
        try {
            const updatedFile = await api.put(`/construction/files/${id}`, updateData);
            setFiles(prev => prev.map(f => f.id === id ? updatedFile : f));
        } catch (error) {
            alert('Güncelleme başarısız: ' + error.message);
        }
    };

    const getFileIcon = (type) => {
        if (!type) return <Files className="text-slate-400" size={24} />;
        switch (type.toLowerCase()) {
            case 'dwg': return <FileCode className="text-blue-500" size={24} />;
            case 'pdf': return <FileText className="text-red-500" size={24} />;
            case 'xlsx':
            case 'xls': return <FileJson className="text-emerald-500" size={24} />;
            default: return <Files className="text-slate-400" size={24} />;
        }
    };

    const filteredFiles = useMemo(() => {
        return files.filter(f =>
            f.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [files, searchTerm]);

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="İnşaat Dosyalarım & Teknik Arşiv" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-6">

                    {/* ═════════════════ HEADER BANNER ═════════════════ */}
                    <div className="relative overflow-hidden bg-[#0A1128] rounded-[32px] p-8 md:p-12 text-white shadow-2xl animate-fade-in border border-white/5">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] animate-pulse" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]" />

                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-blue-600 to-orange-700 flex items-center justify-center shadow-2xl shadow-blue-900/40 border border-white/10 group hover:rotate-6 transition-transform">
                                        <FolderOpen size={32} className="text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-tight">İnşaat <br /><span className="text-blue-400">Dosyalarım</span></h1>
                                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] mt-1">Teknik Proje ve Belge Arşivi</p>
                                    </div>
                                </div>
                                <div className="flex gap-10 pt-2">
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-black text-white">{files.length}</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Listelenen Dosya</span>
                                    </div>
                                    <div className="w-px h-10 bg-white/10" />
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-black text-blue-400">{projects.length}</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aktif Proje</span>
                                    </div>
                                </div>
                            </div>

                            {canManageFiles && (
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flex items-center gap-3 text-sm font-black text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/20 px-8 py-5 rounded-3xl transition-all hover:scale-105 active:scale-95"
                                >
                                    <Plus size={20} />
                                    <span>YENİ DOSYA YÜKLE</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ═════════════════ FILTERS & SEARCH ═════════════════ */}
                    <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="flex-1 w-full space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Filtrele</label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${selectedCategory === 'all' ? 'bg-[#0A1128] text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 uppercase'}`}
                                >
                                    TÜMÜ
                                </button>
                                {fileCategories.map(cat => (
                                    <button
                                        key={cat.name}
                                        onClick={() => setSelectedCategory(cat.name)}
                                        className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${selectedCategory === cat.name ? `${cat.color} text-white shadow-lg` : 'bg-slate-50 text-slate-500 hover:bg-slate-100 uppercase'}`}
                                    >
                                        {cat.name.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="w-full lg:w-64 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proje Değiştir</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <select
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none appearance-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="all">Sadece Proje Seçiniz</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div className="w-full lg:w-72 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosya Ara (Anlık)</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    type="text"
                                    placeholder="Dosya adı veya not..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ═════════════════ FILES GRID ═════════════════ */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => <div key={i} className="bg-white h-48 rounded-[32px] animate-pulse border border-slate-100" />)}
                        </div>
                    ) : filteredFiles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {filteredFiles.map((file) => (
                                <div key={file.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 hover:shadow-2xl hover:scale-[1.02] transition-all group overflow-hidden relative">
                                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${fileCategories.find(c => c.name === file.category)?.color || 'bg-slate-400'}`} />

                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-slate-100 transition-colors">
                                            {getFileIcon(file.file_type)}
                                        </div>
                                        <div className="flex gap-1">
                                            <a href={file.file_url} target="_blank" rel="noreferrer" className="p-2 text-slate-300 hover:text-blue-500 transition-colors">
                                                <Download size={18} />
                                            </a>
                                            {canManageFiles && (
                                                <button onClick={() => handleDelete(file.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate uppercase tracking-tight">{file.file_name}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                {projects.find(p => p.id === file.project_id)?.name || 'Proje Belirtilmedi'}
                                            </p>
                                        </div>

                                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed h-8">
                                            {file.notes || 'Not eklenmemiş.'}
                                        </p>

                                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                                    <Calendar size={12} />
                                                    {file.created_at ? new Date(file.created_at).toLocaleDateString() : '-'}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase text-white ${fileCategories.find(c => c.name === file.category)?.color || 'bg-slate-400'}`}>
                                                {file.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-blue-600/[0.02] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <FolderOpen size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase">Dosya Bulunamadı</h3>
                            <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2">Bu proje veya kategoride henüz teknik belge bulunmuyor.</p>
                        </div>
                    )}
                </div>

                <NewConstructionFileModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    projects={projects}
                    initialProjectId={selectedProject !== 'all' ? selectedProject : ''}
                    onUpload={(newFile) => setFiles(prev => [newFile, ...prev])}
                />
            </main>
        </div>
    );
};

export default ConstructionFiles;
