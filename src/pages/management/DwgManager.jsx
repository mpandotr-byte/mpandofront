import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
    Plus, Trash2, Pencil, FileText, Upload, Download, Eye,
    Layers, Calendar, User, Building2, Sparkles, Loader2, X, CheckCircle
} from 'lucide-react';

export default function DwgManager() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [dwgFiles, setDwgFiles] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [aiAnalyzing, setAiAnalyzing] = useState(null); // dwg id being analyzed
    const [aiResult, setAiResult] = useState(null);
    const [aiPrompt, setAiPrompt] = useState('');
    const [showAiModal, setShowAiModal] = useState(null); // dwg object for AI
    const { user } = useAuth();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await api.get('/projects');
                setProjects(Array.isArray(data) ? data : []);
                if (data && data.length > 0) setSelectedProject(data[0]);
            } catch (err) { console.error(err); }
        };
        if (user) fetchProjects();
    }, [user]);

    const fetchDwgFiles = async (projectId) => {
        if (!projectId) return;
        setLoading(true);
        try {
            const data = await api.get(`/dwg/${projectId}`);
            setDwgFiles(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('DWG dosyalari cekilemedi:', err);
            setDwgFiles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedProject) fetchDwgFiles(selectedProject.id);
    }, [selectedProject]);

    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!uploadFile || !selectedProject?.id) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', uploadFile);
            fd.append('project_id', selectedProject.id);
            fd.append('version', e.target.version?.value || 'v1');
            fd.append('description', e.target.description?.value || '');
            await api.upload('/dwg/upload', fd);
            fetchDwgFiles(selectedProject.id);
            setIsAddModalOpen(false);
            setUploadFile(null);
        } catch (err) {
            console.error(err);
            alert('Dosya yuklenemedi: ' + (err.message || 'Bilinmeyen hata'));
        } finally {
            setUploading(false);
        }
    };

    const handleUpdate = async (id, formData) => {
        try {
            await api.put(`/dwg/${id}`, formData);
            fetchDwgFiles(selectedProject?.id);
            setEditItem(null);
        } catch (err) { console.error(err); }
    };

    const handleDeleteSelected = async () => {
        if (!window.confirm(`${selectedFiles.length} dosyayi silmek istediginize emin misiniz?`)) return;
        try {
            await Promise.all(selectedFiles.map(id => api.delete(`/dwg/${id}`)));
            fetchDwgFiles(selectedProject?.id);
            setSelectedFiles([]);
        } catch (err) { console.error(err); }
    };

    const handleAiAnalyze = async (directPrompt) => {
        if (!showAiModal) return;
        setAiAnalyzing(showAiModal.id);
        setAiResult(null);
        try {
            const prompt = (directPrompt || aiPrompt).trim() || 'Bu teknik çizimi analiz et. Kat yapısını, kolon sayısını, kiriş uzunluklarını, döşeme alanını ve donatı tipini belirle.';
            const res = await api.post('/ai/test-ai', {
                prompt,
                context: `Proje: ${selectedProject?.name || 'Bilinmiyor'}, DWG: ${showAiModal.file_name}`,
                dwgId: showAiModal.id
            });
            setAiResult(res.result || res.response || JSON.stringify(res, null, 2));
        } catch (err) {
            setAiResult('Analiz sırasında hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
        } finally {
            setAiAnalyzing(null);
        }
    };

    const handleFloorAnalyze = async (dwgItem) => {
        setAiAnalyzing(dwgItem.id);
        setShowAiModal(dwgItem);
        setAiResult(null);
        try {
            const res = await api.post('/ai/floors/analyze', {
                file_url: dwgItem.file_url,
                floor_number: 1,
                project_id: selectedProject?.id
            });
            setAiResult(res.result || res.analysis || JSON.stringify(res, null, 2));
        } catch (err) {
            setAiResult('Kat analizi sırasında hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
        } finally {
            setAiAnalyzing(null);
        }
    };

    const columns = [
        { key: 'file_name', label: 'Dosya Adi', render: (val, row) => (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500"><Layers size={18} /></div>
                <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-800 text-[13px]">{val || '-'}</span>
                    <span className="text-[11px] text-slate-400">{row.description || ''}</span>
                </div>
            </div>
        )},
        { key: 'version', label: 'Versiyon', render: val => <span className="text-[12px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">{val || 'v1'}</span> },
        { key: 'full_name', label: 'Yukleyen', render: val => (
            <span className="flex items-center gap-1.5 text-slate-700 text-[13px]"><User size={13} className="text-slate-400" /> {val || '-'}</span>
        )},
        { key: 'uploaded_at', label: 'Tarih', render: val => <span className="text-[13px] text-slate-600">{val ? new Date(val).toLocaleDateString('tr-TR') : '-'}</span> },
        { key: 'actions', label: 'Islemler', sortable: false, align: 'center', stopPropagation: true, render: (_, row) => (
            <div className="flex items-center gap-2">
                {row.file_url && (
                    <a href={row.file_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-all">
                        <Eye size={13} /> Gor
                    </a>
                )}
                <button onClick={(e) => { e.stopPropagation(); setShowAiModal(row); setAiResult(null); setAiPrompt(''); }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 rounded-lg transition-all">
                    {aiAnalyzing === row.id ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} AI
                </button>
                <button onClick={(e) => { e.stopPropagation(); setEditItem(row); }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-semibold text-slate-600 bg-white border border-slate-200 hover:text-orange-600 hover:border-orange-200 rounded-lg transition-all">
                    <Pencil size={13} />
                </button>
            </div>
        )},
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="DWG Dosya Yonetimi" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">
                    {/* Header Banner */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1128] via-[#0A1128] to-[#1E293B] rounded-[40px] p-10 text-white shadow-2xl">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[80px]" />
                        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-tight mb-2">CAD / DWG Arsivi</h1>
                                <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.3em]">Proje bazli teknik cizim yonetimi</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(true)} className="px-10 py-5 bg-[#D36A47] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                                <Upload size={20} /> DWG YUKLE
                            </button>
                        </div>
                    </div>

                    {/* Project Selector */}
                    <div className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">PROJE:</span>
                        {projects.map(p => (
                            <button key={p.id} onClick={() => { setSelectedProject(p); setSelectedFiles([]); }}
                                className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${selectedProject?.id === p.id ? 'bg-[#0A1128] text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                                {p.name || p.project_name}
                            </button>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-2xl border border-slate-200 p-5">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Toplam DWG</p>
                            <p className="text-2xl font-bold text-slate-800">{dwgFiles.length}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 p-5">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Secili Proje</p>
                            <p className="text-2xl font-bold text-orange-600">{selectedProject?.name || '-'}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 p-5">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Son Yukleme</p>
                            <p className="text-2xl font-bold text-slate-800">{dwgFiles[0]?.uploaded_at ? new Date(dwgFiles[0].uploaded_at).toLocaleDateString('tr-TR') : '-'}</p>
                        </div>
                    </div>

                    {/* Selection Bar */}
                    {selectedFiles.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between bg-orange-50 border border-orange-200 p-3.5 rounded-xl">
                            <span className="text-sm font-semibold text-orange-800">{selectedFiles.length} dosya secildi</span>
                            <button onClick={handleDeleteSelected} className="flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200">
                                <Trash2 size={15} /> Sil
                            </button>
                        </div>
                    )}

                    <DataTable
                        columns={columns}
                        data={dwgFiles}
                        loading={loading}
                        selectable={true}
                        selectedRows={selectedFiles}
                        onSelect={(id) => setSelectedFiles(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])}
                        rowKey="id"
                        searchPlaceholder="DWG dosyalarinda ara..."
                        pageSize={10}
                        emptyMessage="Bu projede DWG dosyasi bulunamadi."
                    />

                    {/* Add Modal */}
                    {isAddModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                            <div className="bg-white rounded-[40px] w-full max-w-lg p-8 shadow-2xl space-y-6">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Yeni DWG Yukle</h3>
                                <form onSubmit={handleAdd} className="space-y-4">
                                    {/* Dosya Secici */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Dosya Sec *</label>
                                        <div
                                            className={`relative w-full border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${uploadFile ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-orange-50'}`}
                                            onClick={() => document.getElementById('dwg-file-input').click()}
                                        >
                                            <input
                                                id="dwg-file-input"
                                                type="file"
                                                accept=".dwg,.pdf,.png,.jpg,.jpeg,.webp"
                                                className="hidden"
                                                onChange={(e) => setUploadFile(e.target.files[0])}
                                            />
                                            {uploadFile ? (
                                                <div className="flex items-center justify-center gap-3">
                                                    <CheckCircle size={20} className="text-emerald-500" />
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-slate-800">{uploadFile.name}</p>
                                                        <p className="text-xs text-slate-400">{(uploadFile.size / 1024).toFixed(0)} KB</p>
                                                    </div>
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); setUploadFile(null); }} className="ml-2 p-1 hover:bg-red-50 rounded-full text-red-400">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Upload size={28} className="mx-auto text-slate-300 mb-2" />
                                                    <p className="text-sm font-semibold text-slate-500">Dosya secmek icin tiklayin</p>
                                                    <p className="text-[10px] text-slate-400 mt-1">DWG, PDF, PNG, JPG (Maks 50MB)</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <input name="version" placeholder="Versiyon (ornek: v1)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                    <textarea name="description" placeholder="Aciklama" rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none resize-none" />
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => { setIsAddModalOpen(false); setUploadFile(null); }} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold">Iptal</button>
                                        <button type="submit" disabled={!uploadFile || uploading} className={`flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 ${!uploadFile || uploading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#0A1128] text-white hover:bg-[#1a2540]'}`}>
                                            {uploading ? <><Loader2 size={16} className="animate-spin" /> Yukleniyor...</> : <><Upload size={16} /> Yukle</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Edit Modal */}
                    {editItem && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                            <div className="bg-white rounded-[40px] w-full max-w-lg p-8 shadow-2xl space-y-6">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">DWG Duzenle</h3>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const fd = new FormData(e.target);
                                    handleUpdate(editItem.id, Object.fromEntries(fd.entries()));
                                }} className="space-y-4">
                                    <input name="file_name" defaultValue={editItem.file_name} placeholder="Dosya Adi" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                    <input name="file_url" defaultValue={editItem.file_url} placeholder="Dosya URL" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                    <input name="version" defaultValue={editItem.version} placeholder="Versiyon" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                    <textarea name="description" defaultValue={editItem.description} placeholder="Aciklama" rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none resize-none" />
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => setEditItem(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold">Iptal</button>
                                        <button type="submit" className="flex-1 py-3 bg-[#0A1128] text-white rounded-2xl text-sm font-bold">Guncelle</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                    {/* AI Analysis Modal */}
                    {showAiModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                            <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
                                {/* Modal Header */}
                                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-orange-100 text-orange-700 rounded-2xl">
                                            <Sparkles size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">AI Analiz</h3>
                                            <p className="text-xs text-slate-500">{showAiModal.file_name}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => { setShowAiModal(null); setAiResult(null); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                    {/* DWG Format Warning */}
                                    {showAiModal.file_name?.toLowerCase().endsWith('.dwg') && (
                                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3">
                                            <div className="p-2 bg-orange-100 rounded-xl text-orange-600 mt-0.5">
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-orange-800">DWG Dosyasi Tespit Edildi</p>
                                                <p className="text-xs text-orange-700 mt-1">
                                                    AI, DWG binary formatini dogrudan okuyamaz. Analiz verilen parametreler uzerinden tahmin ile yapilacaktir.
                                                    <strong> Daha dogru sonuc icin dosyanizi PDF veya PNG formatina cevirip tekrar yukleyin.</strong>
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Actions */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleFloorAnalyze(showAiModal)}
                                            disabled={!!aiAnalyzing}
                                            className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-left hover:bg-blue-100 transition-all disabled:opacity-50"
                                        >
                                            <Layers size={20} className="text-blue-600 mb-2" />
                                            <p className="text-sm font-black text-blue-800">Kat Yapisi Analizi</p>
                                            <p className="text-[10px] text-blue-600 mt-1">Kolon, kiris, doseme, donati</p>
                                        </button>
                                        <button
                                            onClick={() => {
                                                const roomPrompt = 'Bu DWG dosyasındaki tüm odaları tespit et. Her oda için alan (m²), duvar alanı, tavan alanı, kapı ve pencere sayısını belirle.';
                                                setAiPrompt(roomPrompt);
                                                handleAiAnalyze(roomPrompt);
                                            }}
                                            disabled={!!aiAnalyzing}
                                            className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left hover:bg-emerald-100 transition-all disabled:opacity-50"
                                        >
                                            <Building2 size={20} className="text-emerald-600 mb-2" />
                                            <p className="text-sm font-black text-emerald-800">Oda Tespiti</p>
                                            <p className="text-[10px] text-emerald-600 mt-1">Alan, duvar, tavan, kapi/pencere</p>
                                        </button>
                                    </div>

                                    {/* Custom Prompt */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ozel Soru Sor</p>
                                        <div className="flex gap-3">
                                            <input
                                                value={aiPrompt}
                                                onChange={(e) => setAiPrompt(e.target.value)}
                                                placeholder="Ornegin: Toplam insaat alani nedir?"
                                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-orange-300"
                                                onKeyDown={(e) => e.key === 'Enter' && handleAiAnalyze()}
                                            />
                                            <button
                                                onClick={handleAiAnalyze}
                                                disabled={!!aiAnalyzing}
                                                className="px-6 py-3 bg-orange-600 text-white rounded-2xl text-sm font-bold hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {aiAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                                Analiz Et
                                            </button>
                                        </div>
                                    </div>

                                    {/* Result */}
                                    {aiAnalyzing && (
                                        <div className="flex items-center justify-center p-8 bg-orange-50 rounded-2xl border border-orange-100">
                                            <Loader2 size={24} className="animate-spin text-orange-500 mr-3" />
                                            <span className="text-sm font-semibold text-orange-700">AI analiz ediyor...</span>
                                        </div>
                                    )}

                                    {aiResult && !aiAnalyzing && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle size={16} className="text-emerald-500" />
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Analiz Sonucu</p>
                                            </div>
                                            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                                                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">{typeof aiResult === 'string' ? aiResult : JSON.stringify(aiResult, null, 2)}</pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
