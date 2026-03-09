import React, { useState, useEffect } from 'react';
import {
    X,
    Building2,
    User,
    Mail,
    Phone,
    MapPin,
    Tag,
    FileText,
    Save,
    Scale,
    Factory,
    Info,
    MoveRight
} from 'lucide-react';
import { api } from '../../api/client';

const SupplierModal = ({ isOpen, onClose, onSave, supplier = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        category_tags: '',
        authorized_person: '',
        email: '',
        phone: '',
        tax_office: '',
        factory_address: ''
    });

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [availableCategories, setAvailableCategories] = useState([]);

    const fetchCategories = async () => {
        try {
            const materials = await api.get('/materials/catalog');
            const cats = [...new Set(materials.map(m => m.category).filter(Boolean))];
            if (cats.length > 0) {
                setAvailableCategories(prev => [...new Set([...prev, ...cats])]);
            }
        } catch (err) {
            console.error("Categories fetch error:", err);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name || '',
                category_tags: Array.isArray(supplier.category_tags) ? supplier.category_tags.join(', ') : (supplier.category_tags || ''),
                authorized_person: supplier.authorized_person || '',
                email: supplier.email || '',
                phone: supplier.phone || '',
                tax_office: supplier.tax_office || '',
                factory_address: supplier.factory_address || ''
            });
        } else {
            setFormData({
                name: '',
                category_tags: '',
                authorized_person: '',
                email: '',
                phone: '',
                tax_office: '',
                factory_address: ''
            });
        }
    }, [supplier, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleCategory = (cat) => {
        const currentTags = formData.category_tags.split(',').map(t => t.trim()).filter(Boolean);
        let newTags;
        if (currentTags.includes(cat)) {
            newTags = currentTags.filter(t => t !== cat);
        } else {
            newTags = [...currentTags, cat];
        }
        setFormData(prev => ({ ...prev, category_tags: newTags.join(', ') }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Process tags
            const processedData = {
                ...formData,
                category_tags: formData.category_tags.split(',').map(tag => tag.trim()).filter(Boolean)
            };

            if (supplier?.id) {
                const result = await api.put(`/suppliers/${supplier.id}`, processedData);
                onSave(result);
            } else {
                const result = await api.post('/suppliers', processedData);
                onSave(result);
            }
            onClose();
        } catch (err) {
            console.error("Supplier save error:", err);
            alert("Tedarikçi kaydedilirken bir hata oluştu: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto pt-20 pb-20">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-white animate-scale-in my-auto flex flex-col max-h-full">
                {/* Header */}
                <div className="p-8 bg-gradient-to-br from-[#0A1128] to-[#1E293B] text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-[#D36A47] flex items-center justify-center shadow-lg shadow-[#D36A47]/30">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">
                                {supplier ? 'TEDARİKÇİ DÜZENLE' : 'YENİ TEDARİKÇİ EKLE'}
                            </h2>
                            <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mt-1 italic">
                                {supplier ? 'FİRMA BİLGİLERİNİ GÜNCELLEYİN' : 'FİRMA KİMLİK BİLGİLERİNİ TANIMLAYIN'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-8 flex border-b border-slate-100 bg-slate-50 mt-4 mx-4 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'general' ? 'text-[#D36A47]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Genel Bilgiler
                        {activeTab === 'general' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D36A47] rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('contact')}
                        className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'contact' ? 'text-[#D36A47]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        İletişim & Adres
                        {activeTab === 'contact' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D36A47] rounded-full" />}
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
                    <div className="p-8 space-y-8 flex-1">
                        {activeTab === 'general' && (
                            <div className="space-y-6 animate-slide-up">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Firma Adı</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                            <Building2 size={18} />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Örn: Kütahya Seramik A.Ş."
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-[#D36A47] transition-all outline-none font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tedarik Edilen Kategoriler</label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableCategories.map(cat => {
                                            const isSelected = formData.category_tags.split(',').map(t => t.trim()).includes(cat);
                                            return (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => toggleCategory(cat)}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${isSelected
                                                        ? 'bg-[#D36A47] border-[#D36A47] text-white shadow-lg shadow-[#D36A47]/20 scale-105'
                                                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            );
                                        })}
                                    </div>

                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Vergi Dairesi</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                            <Scale size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            name="tax_office"
                                            value={formData.tax_office}
                                            onChange={handleChange}
                                            placeholder="Örn: Kütahya Vergi Dairesi"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-[#D36A47] transition-all outline-none font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'contact' && (
                            <div className="space-y-6 animate-slide-up">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Yetkili Adı</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                name="authorized_person"
                                                value={formData.authorized_person}
                                                onChange={handleChange}
                                                placeholder="Örn: Ali Yılmaz"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-[#D36A47] transition-all outline-none font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefon</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                                <Phone size={18} />
                                            </div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+90 5XX XXX XX XX"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-[#D36A47] transition-all outline-none font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">E-posta</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="info@sirket.com"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-[#D36A47] transition-all outline-none font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Fabrika / Depo Adresi</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 pt-4 pointer-events-none text-slate-300">
                                            <Factory size={18} />
                                        </div>
                                        <textarea
                                            name="factory_address"
                                            value={formData.factory_address}
                                            onChange={handleChange}
                                            rows="3"
                                            placeholder="Lojistik mesafe hesabı için tam adres girin..."
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-[#D36A47] transition-all outline-none font-medium resize-none"
                                        />
                                    </div>
                                    <p className="text-[9px] text-amber-500 font-bold italic ml-1">* Bu bilgi nakliye maliyetlerinin hesaplanmasında kritik öneme sahiptir.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                        >
                            Vazgeç
                        </button>
                        <div className="flex gap-4">
                            {activeTab === 'general' ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('contact')}
                                    className="flex items-center gap-2 px-10 py-5 bg-white border border-slate-200 text-[#0A1128] rounded-2xl text-[10px] font-black shadow-sm transition-all hover:bg-slate-50 active:scale-95 uppercase tracking-wider"
                                >
                                    Sonraki Adım <MoveRight size={14} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-3 px-10 py-5 bg-[#D36A47] text-white rounded-2xl text-[10px] font-black shadow-xl shadow-[#D36A47]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                                >
                                    {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                                    {supplier ? 'GÜNCELLE' : 'TEDARİKÇİ KAYDI OLUŞTUR'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupplierModal;
