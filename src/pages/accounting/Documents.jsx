import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import {
    Folder,
    FileText,
    Search,
    Upload,
    Plus,
    Building2,
    User,
    Users,
    Truck,
    Hammer,
    ShieldCheck,
    BadgeCheck,
    ChevronRight,
    ArrowRight,
    ArrowLeft,
    Filter,
    Clock,
    Download,
    Eye,
    LayoutGrid,
    LayoutList,
    MoreVertical,
    CheckCircle2
} from 'lucide-react';

export default function Documents() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [activeSection, setActiveSection] = useState('project'); // project, party, corporate
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const documentCategories = {
        project: [
            { id: 1, name: 'Ruhsat & Belediye Evrakları', count: 12, icon: <Building2 />, color: 'bg-blue-500' },
            { id: 2, name: 'Kat Karşılığı Sözleşmeleri', count: 4, icon: <BadgeCheck />, color: 'bg-emerald-500' },
            { id: 3, name: 'Satış Sözleşmeleri / Tapu', count: 42, icon: <User />, color: 'bg-indigo-500' },
            { id: 4, name: 'Tedarikçi Anlaşmaları', count: 18, icon: <Truck />, color: 'bg-amber-500' },
            { id: 5, name: 'Taşeron Sözleşmeleri', count: 24, icon: <Hammer />, color: 'bg-rose-500' }
        ],
        corporate: [
            { id: 1, name: 'Sicil Gazetesi & İmza Sirküleri', count: 5, icon: <ShieldCheck />, color: 'bg-slate-700' },
            { id: 2, name: 'Vergi Levhaları', count: 3, icon: <FileText />, color: 'bg-red-500' },
            { id: 3, name: 'Kira & Hizmet Sözleşmeleri', count: 15, icon: <FileText />, color: 'bg-teal-500' }
        ]
    };

    const [files, setFiles] = useState([]);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await api.get('/projects');
                setProjects(Array.isArray(data) ? data : []);
            } catch (err) { console.error(err); }
        };
        fetchProjects();
    }, []);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                let data = [];
                if (activeSection === 'project' && selectedProject) {
                    const proj = projects.find(p => p.name === selectedProject || p.id === selectedProject);
                    if (proj) data = await api.get(`/documents/project/${proj.id}${selectedFolder ? `?category=${encodeURIComponent(selectedFolder.name)}` : ''}`);
                } else if (activeSection === 'corporate') {
                    data = await api.get('/documents/corporate');
                } else if (activeSection === 'party' && selectedFolder) {
                    data = await api.get(`/documents/party/${selectedFolder.id}`);
                }
                setFiles(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setFiles([]);
            }
        };
        fetchDocuments();
    }, [activeSection, selectedProject, selectedFolder, projects]);

    const handleUploadDocument = async (docData) => {
        try {
            await api.post('/documents', docData);
            setSelectedFolder({...selectedFolder});
        } catch (err) { console.error(err); }
    };

    const handleSearch = async (term) => {
        if (term.length < 3) return;
        try {
            const data = await api.get(`/documents/search?query=${encodeURIComponent(term)}`);
            setFiles(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
    };

    const renderFolderContent = () => {
        const folder = selectedFolder;
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSelectedFolder(null)}
                        className="flex items-center gap-2 text-slate-400 hover:text-[#0A1128] transition-all font-black text-[10px] uppercase tracking-widest group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Geri Dön
                    </button>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${folder.color} flex items-center justify-center text-white shadow-lg`}>
                            {React.cloneElement(folder.icon, { size: 20 })}
                        </div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{folder.name}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(files.length > 0 ? files : []).map(file => (
                        <div key={file.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group cursor-pointer text-left">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                    <FileText size={24} />
                                </div>
                                <div className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded-lg text-slate-400 uppercase tracking-widest">
                                    {file.type}
                                </div>
                            </div>
                            <h3 className="text-sm font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors truncate">{file.title || file.name || 'Belge'}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{file.size || ''} {file.created_at ? new Date(file.created_at).toLocaleDateString('tr-TR') : file.date || ''}</p>
                            <div className="mt-6 flex items-center gap-2">
                                <button className="flex-1 py-3 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all scale-95 hover:scale-100 uppercase">Görüntüle</button>
                                <button className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all scale-95 hover:scale-100"><Download size={16} /></button>
                            </div>
                        </div>
                    ))}
                    <div className="bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-slate-300 hover:text-[#D36A47] hover:border-[#D36A47]/30 transition-all cursor-pointer group">
                        <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Belge Ekle</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Dijital Arşiv Merkezi" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8 text-left">

                    {/* Header Banner */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1128] via-[#0A1128] to-[#1E293B] rounded-[40px] p-10 text-white shadow-2xl">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px]" />
                        <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="text-left w-full">
                                <h1 className="text-3xl font-black uppercase tracking-tight mb-2 leading-none">Dijital Arşiv Merkezi</h1>
                                <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.3em]">Tüm resmi belgeler, sözleşmeler ve çek görselleri</p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button className="flex-1 md:flex-none px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">ARAMA FİLTRELERİ</button>
                                <button className="flex-1 md:flex-none px-10 py-5 bg-[#D36A47] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                                    <Upload size={20} /> YENİ BELGE YÜKLE
                                </button>
                            </div>
                        </div>
                    </div>

                    {!selectedFolder ? (
                        <>
                            {/* Section Switcher */}
                            <div className="flex flex-col md:flex-row justify-between items-stretch gap-6">
                                <div className="bg-white p-1.5 rounded-[28px] border border-slate-100 shadow-sm flex grow max-w-2xl">
                                    <button
                                        onClick={() => { setActiveSection('project'); }}
                                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'project' ? 'bg-[#0A1128] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <Building2 size={18} /> PROJE BAZLI
                                    </button>
                                    <button
                                        onClick={() => { setActiveSection('party'); }}
                                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'party' ? 'bg-[#0A1128] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <Users size={18} /> TARAF BAZLI
                                    </button>
                                    <button
                                        onClick={() => { setActiveSection('corporate'); }}
                                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'corporate' ? 'bg-[#0A1128] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <ShieldCheck size={18} /> ŞİRKET GENELİ
                                    </button>
                                </div>
                                <div className="flex p-1 bg-white border border-slate-200 rounded-2xl h-fit self-end">
                                    <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl ${viewMode === 'grid' ? 'bg-slate-100 text-[#0A1128]' : 'text-slate-300'}`}><LayoutGrid size={20} /></button>
                                    <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl ${viewMode === 'list' ? 'bg-slate-100 text-[#0A1128]' : 'text-slate-300'}`}><LayoutList size={20} /></button>
                                </div>
                            </div>

                            {/* Content View */}
                            {activeSection === 'project' && (
                                <div className="space-y-8 text-left">
                                    <div className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">PROJE SEÇİN:</span>
                                        {(projects.length > 0 ? projects.map(p => p.name || p.project_name) : ['Proje bulunamadi']).map((p, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedProject(p)}
                                                className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${selectedProject === p ? 'bg-[#0A1128] text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>

                                    {selectedProject ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                            {documentCategories.project.map(cat => (
                                                <FolderCard key={cat.id} category={cat} onClick={() => setSelectedFolder(cat)} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-40 flex flex-col items-center justify-center opacity-30 text-center">
                                            <Folder size={64} className="mb-6" />
                                            <h3 className="text-xl font-black uppercase tracking-widest text-[#0A1128]">Klasör Yapısı Hazır</h3>
                                            <p className="text-xs uppercase tracking-widest mt-2 font-bold italic">Belgeleri görüntülemek için lütfen bir proje seçin</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeSection === 'corporate' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {documentCategories.corporate.map(cat => (
                                        <FolderCard key={cat.id} category={cat} onClick={() => setSelectedFolder(cat)} />
                                    ))}
                                </div>
                            )}

                            {activeSection === 'party' && (
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                    {/* Sidebar Filter */}
                                    <div className="lg:col-span-1 bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-8 h-fit lg:sticky top-6">
                                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Taraf Filtrele</h3>
                                        <div className="space-y-4">
                                            {['Müşteriler', 'Tedarikçiler', 'Taşeronlar', 'Personel'].map(t => (
                                                <button key={t} className="w-full p-4 bg-slate-50 hover:bg-white hover:border-[#D36A47]/30 border border-slate-100 rounded-2xl text-left flex items-center justify-between group transition-all">
                                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover:text-[#D36A47] transition-colors">{t}</span>
                                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-[#D36A47] transition-colors" />
                                                </button>
                                            ))}
                                        </div>
                                        <div className="pt-8 border-t border-slate-50">
                                            <div className="relative">
                                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                <input type="text" placeholder="İsim ile ara..." className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold outline-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-3 space-y-8 text-left">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {['Mustafa Dağlı', 'Ahmet Yılmaz', 'Mehmet Aksoy', 'Zeynep Güneş', 'Ali Vural', 'Ece Doğan'].map((name, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => setSelectedFolder({ id: 100 + i, name: `${name} Belgeleri`, count: 12, icon: <User />, color: 'bg-indigo-500' })}
                                                    className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col gap-6 cursor-pointer"
                                                >
                                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#0A1128] group-hover:text-white transition-all border border-slate-100">
                                                        <User size={28} />
                                                    </div>
                                                    <div>
                                                        <div className="text-lg font-black text-slate-800 uppercase tracking-tight">{name}</div>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">12 Belge</span>
                                                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Güncel</span>
                                                        </div>
                                                    </div>
                                                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                                        <button className="text-[10px] font-black text-slate-300 group-hover:text-[#D36A47] uppercase tracking-widest flex items-center gap-2">BELGELERİ GÖR <ArrowRight size={14} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        renderFolderContent()
                    )}
                </div>
            </main>
        </div>
    );
}

function FolderCard({ category, onClick }) {
    return (
        <div
            onClick={onClick}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col gap-6 cursor-pointer text-left"
        >
            <div className={`w-16 h-16 rounded-[24px] ${category.color} flex items-center justify-center text-white transition-all border border-white group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-3 shadow-lg`}>
                {React.cloneElement(category.icon, { size: 28 })}
            </div>
            <div>
                <h4 className="text-[15px] font-black text-slate-800 uppercase tracking-tight leading-tight mb-2">{category.name}</h4>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <FileText size={12} className="text-slate-300" /> {category.count} Belge
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="text-[10px] font-black text-slate-300 group-hover:text-slate-800 uppercase tracking-widest">Klasörü Aç</div>
                <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-[#0A1128] group-hover:bg-slate-100 transition-all">
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
