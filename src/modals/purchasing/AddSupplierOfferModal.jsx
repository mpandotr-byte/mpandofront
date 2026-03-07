import React, { useState, useEffect } from 'react';
import {
    X,
    Building2,
    DollarSign,
    Clock,
    Package,
    Save,
    Search
} from 'lucide-react';
import { api } from '../../api/client';

const AddSupplierOfferModal = ({ isOpen, onClose, onSave, materialId, materialName }) => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        supplier_id: '',
        unit_price: '',
        lead_time_days: '',
        min_order_quantity: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchSuppliers();
        }
    }, [isOpen]);

    const fetchSuppliers = async () => {
        try {
            const data = await api.get('/suppliers');
            setSuppliers(data || []);
        } catch (err) {
            console.error("Fetch suppliers error:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await api.post('/suppliers/assign-material', {
                company_id: parseInt(formData.supplier_id),
                material_id: parseInt(materialId),
                unit_price: parseFloat(formData.unit_price),
                lead_time_days: parseInt(formData.lead_time_days),
                min_order_quantity: parseFloat(formData.min_order_quantity)
            });
            onSave(result);
            onClose();
        } catch (err) {
            console.error("Assign error:", err);
            alert("Teklif kaydedilirken bir hata oluştu: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-white animate-scale-in">
                {/* Header */}
                <div className="p-8 bg-[#0A1128] text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#D36A47] flex items-center justify-center shadow-lg">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Yeni Tedarikçi Teklifi</h2>
                            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mt-0.5">{materialName}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tedarikçi Seçin</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                <Building2 size={18} />
                            </div>
                            <select
                                required
                                name="supplier_id"
                                value={formData.supplier_id}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm appearance-none focus:bg-white focus:border-[#D36A47] transition-all outline-none font-bold"
                            >
                                <option value="">Tedarikçi Seçin</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Birim Fiyat (TRY)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                    <DollarSign size={18} />
                                </div>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    name="unit_price"
                                    value={formData.unit_price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-[#D36A47] transition-all outline-none font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Termin (Gün)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                    <Clock size={18} />
                                </div>
                                <input
                                    required
                                    type="number"
                                    name="lead_time_days"
                                    value={formData.lead_time_days}
                                    onChange={handleChange}
                                    placeholder="7"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-[#D36A47] transition-all outline-none font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Minimum Sipariş Miktarı</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                <Package size={18} />
                            </div>
                            <input
                                required
                                type="number"
                                name="min_order_quantity"
                                value={formData.min_order_quantity}
                                onChange={handleChange}
                                placeholder="0"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-[#D36A47] transition-all outline-none font-bold"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                        >
                            Vazgeç
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-4 bg-[#D36A47] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#D36A47]/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                        >
                            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                            TEKLİFİ KAYDET
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSupplierOfferModal;
