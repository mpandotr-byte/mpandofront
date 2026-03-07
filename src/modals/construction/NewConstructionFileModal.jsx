import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Layout, Info, Check, Save } from 'lucide-react';
import { api } from '../../api/client';

const categories = ['Mimari', 'Statik', 'Hakediş', 'Mekanik', 'Elektrik', 'Ruhsat/İzin', 'Sözleşme', 'Diğer'];

const NewConstructionFileModal = ({ isOpen, onClose, projects, onUpload, initialProjectId }) => {
    const [formData, setFormData] = useState({
        projectId: initialProjectId || '',
        fileName: '',
        category: 'Mimari',
        notes: '',
        file: null
    });

    useEffect(() => {
        if (initialProjectId) {
            setFormData(prev => ({ ...prev, projectId: initialProjectId }));
        }
    }, [initialProjectId, isOpen]);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                file,
                fileName: prev.fileName || file.name
            }));
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                file,
                fileName: prev.fileName || file.name
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.projectId || !formData.file) {
            alert('Lütfen proje seçiniz ve bir dosya ekleyiniz.');
            return;
        }

        setLoading(true);
        try {
            // FormData hazırlığı (Dosya yükleme için gerekli)
            const uploadData = new FormData();
            uploadData.append('projectId', formData.projectId);
            uploadData.append('fileName', formData.fileName || formData.file.name);
            uploadData.append('category', formData.category);
            uploadData.append('notes', formData.notes);
            uploadData.append('file', formData.file);

            // Gerçek API isteği: POST /construction/files
            const response = await api.post('/construction/files', uploadData);

            // Başarılı olursa listeye ekle ve kapat
            onUpload(response);
            onClose();
            setFormData({ projectId: '', fileName: '', category: 'Mimari', notes: '', file: null });
        } catch (error) {
            console.error("Yükleme hatası:", error);
            alert('Dosya yüklenirken bir hata oluştu: ' + (error.message || 'Sunucu hatası'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1128]/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl shadow-blue-900/40 overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0A1128] via-[#1E293B] to-[#0A1128] p-8 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                            <Upload className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Yeni Dosya Yükle</h2>
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Teknik Arşive Belge Ekle</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white/60 hover:text-white transition-all">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Project Selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">İlgili Proje</label>
                            <div className="relative">
                                <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <select
                                    name="projectId"
                                    value={formData.projectId}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all appearance-none"
                                >
                                    <option value="">Proje Seçiniz</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Category Selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Belge Kategorisi</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all appearance-none"
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* File Upload Zone */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosya Yükleme</label>
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-[32px] p-8 text-center transition-all ${dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'}`}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer space-y-4 inline-block w-full">
                                <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto text-blue-600 group-hover:scale-110 transition-transform">
                                    <Upload size={28} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                        {formData.file ? formData.file.name : 'Dosyayı Sürükleyin veya Seçin'}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        PDF, DWG, XLSX VEYA GÖRSEL (MAX. 50MB)
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* File Identity Name */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosya İsimlendirme (Opsiyonel)</label>
                        <input
                            type="text"
                            name="fileName"
                            value={formData.fileName}
                            onChange={handleChange}
                            placeholder="Dosyaya özel bir isim verin..."
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosya Notları</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Dosya hakkında özet detaylar..."
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none"
                        ></textarea>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl">
                            <Info size={16} />
                            <span className="text-[10px] font-black uppercase tracking-tight">Tüm yetkili mühendisler erişebilecektir.</span>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-4 text-xs font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors"
                            >
                                Vazgeç
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-3 px-10 py-4 bg-[#0A1128] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-900/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? 'YÜKLENİYOR...' : (
                                    <>
                                        <Save size={18} className="text-blue-400" />
                                        KAYDET VE YÜKLE
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewConstructionFileModal;
