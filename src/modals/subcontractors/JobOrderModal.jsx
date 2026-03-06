import React, { useState, useEffect } from 'react';
import {
    X,
    Save,
    Hammer,
    MapPin,
    Ruler,
    Calendar,
    FileText,
    DollarSign,
    ChevronDown,
    Info
} from 'lucide-react';
import { api } from '../../api/client';

const JobOrderModal = ({
    isOpen,
    onClose,
    onAdd,
    subcontractorId
}) => {
    const [formData, setFormData] = useState({
        job_type: '',
        project_id: '',
        block_id: '',
        floor_id: '',
        unit_id: '',
        room_id: '',
        quantity: '',
        unit: 'm2',
        unit_price: '',
        total_price: 0,
        deadline: '',
        description: ''
    });

    const [laborTypes, setLaborTypes] = useState([]);
    const [projects, setProjects] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [floors, setFloors] = useState([]);
    const [units, setUnits] = useState([]);
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        try {
            const [laborsData, projectsData] = await Promise.all([
                api.get('/labor'),
                api.get('/projects')
            ]);
            setLaborTypes(laborsData || []);
            setProjects(projectsData || []);
        } catch (err) {
            console.error("Initial data fetch error:", err);
        }
    };

    useEffect(() => {
        if (formData.project_id) {
            api.get(`/blocks?project_id=${formData.project_id}`).then(setBlocks).catch(() => setBlocks([]));
        }
    }, [formData.project_id]);

    useEffect(() => {
        if (formData.block_id) {
            api.get(`/floors?block_id=${formData.block_id}`).then(setFloors).catch(() => setFloors([]));
        }
    }, [formData.block_id]);

    useEffect(() => {
        if (formData.floor_id) {
            api.get(`/projects/units?floor_id=${formData.floor_id}`).then(setUnits).catch(() => setUnits([]));
        }
    }, [formData.floor_id]);

    useEffect(() => {
        const qty = parseFloat(formData.quantity) || 0;
        const price = parseFloat(formData.unit_price) || 0;
        setFormData(prev => ({ ...prev, total_price: (qty * price).toFixed(2) }));
    }, [formData.quantity, formData.unit_price]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Yeni İş Emri Oluştur</h2>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Taşerona görev ve fiyat tanımlaması yapın.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">

                    {/* Bölüm 1: İş Tanımı */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-[#D36A47] uppercase tracking-[0.2em] flex items-center gap-2">
                            <Hammer size={14} /> İş ve Tanım Bilgileri
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">İşin Tanımı</label>
                                <div className="relative">
                                    <select
                                        className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#D36A47]/20 focus:border-[#D36A47] transition-all"
                                        value={formData.job_type}
                                        onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                                    >
                                        <option value="">Seçiniz...</option>
                                        {laborTypes.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                                        <option value="DİĞER">DİĞER...</option>
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bölüm 2: Uygulama Alanı */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-[#D36A47] uppercase tracking-[0.2em] flex items-center gap-2">
                            <MapPin size={14} /> Uygulama Alanı (Proje Ağacı)
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Proje</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none"
                                    value={formData.project_id}
                                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                >
                                    <option value="">Proje Seç...</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Blok</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700"
                                    value={formData.block_id}
                                    disabled={!formData.project_id}
                                    onChange={(e) => setFormData({ ...formData, block_id: e.target.value })}
                                >
                                    <option value="">Blok Seç...</option>
                                    {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Kat</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700"
                                    value={formData.floor_id}
                                    disabled={!formData.block_id}
                                    onChange={(e) => setFormData({ ...formData, floor_id: e.target.value })}
                                >
                                    <option value="">Kat Seç...</option>
                                    {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ünite / Mahal</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700"
                                    value={formData.unit_id}
                                    disabled={!formData.floor_id}
                                    onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                                >
                                    <option value="">Tümü / Ünite Seç...</option>
                                    {units.map(u => <option key={u.id} value={u.id}>{u.unit_number}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Bölüm 3: Metraj ve Birim Fiyat */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-[#D36A47] uppercase tracking-[0.2em] flex items-center gap-2">
                            <Ruler size={14} /> Metraj ve Maliyet Bilgileri
                        </h3>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Miktar</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700"
                                        placeholder="0.00"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">{formData.unit}</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Birim Fiyat</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full pl-8 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700"
                                        placeholder="0.00"
                                        value={formData.unit_price}
                                        onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                                    />
                                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>
                            <div className="col-span-2 lg:col-span-1 space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Toplam Bedel</label>
                                <div className="w-full px-4 py-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-sm font-black text-indigo-700">
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(formData.total_price)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Hedef Bitiş Tarihi</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Sözleşme (PDF)</label>
                            <button className="w-full flex items-center justify-center gap-3 py-3.5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 hover:bg-slate-100 hover:border-slate-300 transition-all uppercase tracking-widest">
                                <FileText size={18} /> Belge Yükle
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">İş Notu / Detaylar</label>
                        <textarea
                            rows="3"
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 resize-none"
                            placeholder="İş ile ilgili teknik detaylar veya özel talimatlar..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={() => onAdd(formData)}
                        className="flex items-center gap-2 px-10 py-4 bg-[#0A1128] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] shadow-xl shadow-[#0A1128]/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Save size={18} />
                        İş Emrini Oluştur
                    </button>
                </div>

            </div>
        </div>
    );
};

export default JobOrderModal;
