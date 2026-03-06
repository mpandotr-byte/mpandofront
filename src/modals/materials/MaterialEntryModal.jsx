import React, { useState, useEffect } from 'react';
import { X, Save, Package, Truck, Camera, Search, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';

const MaterialEntryModal = ({ isOpen, onClose, onEntry }) => {
    const [loading, setLoading] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [purchaseRequests, setPurchaseRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [selectedPR, setSelectedPR] = useState(null); // Associated purchase request
    const [quantity, setQuantity] = useState('');
    const [waybillNumber, setWaybillNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [photo, setPhoto] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        try {
            const [catalogData, prData] = await Promise.all([
                api.get('/materials/catalog'),
                api.get('/inventory/purchase-requests?status=ORDERED')
            ]);
            setMaterials(catalogData || []);
            setPurchaseRequests(prData || []);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMaterial || !quantity) return;

        setLoading(true);
        try {
            const payload = {
                material_id: selectedMaterial.id,
                quantity: parseFloat(quantity),
                waybill_no: waybillNumber,
                purchase_request_id: selectedPR?.id,
                notes: notes,
                type: 'ENTRY',
                // photo field would handle upload logic in real app, sending a placeholder for now
                photo_url: photo ? 'uploaded_url' : null
            };

            const response = await api.post('/inventory/movements/entry', payload);
            alert("Malzeme Girişi Başarıyla Onaylandı!");
            onEntry(response);
            onClose();
            // Reset form
            setSelectedMaterial(null);
            setSelectedPR(null);
            setQuantity('');
            setWaybillNumber('');
            setNotes('');
            setPhoto(null);
        } catch (err) {
            console.error("Entry error:", err);
            alert("Kayıt sırasında bir hata oluştu: " + (err.message || 'Bilinmeyen hata'));
        } finally {
            setLoading(false);
        }
    };

    const filteredMaterials = materials.filter(m =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.code?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-7 border-b border-slate-100 bg-[#0A1128] text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#D36A47] flex items-center justify-center shadow-lg border border-white/10">
                            <Truck size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Hızlı Malzeme Girişi</h2>
                            <p className="text-xs font-bold text-white/50 mt-0.5 uppercase tracking-widest leading-none">Saha İrsaliye Onayı</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">

                    {/* 1. Malzeme Seçimi */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-[#D36A47] uppercase tracking-[0.2em] flex items-center gap-2">
                            1. MALZEME SEÇİMİ
                        </h3>

                        {!selectedMaterial ? (
                            <div className="space-y-3">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D36A47] transition-colors" size={18} />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#D36A47]/20 transition-all font-sans"
                                        placeholder="Katalogdan malzeme ara (Örn: C30 Beton...)"
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {filteredMaterials.map(m => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => { setSelectedMaterial(m); setSearchTerm(''); }}
                                            className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#D36A47] hover:bg-slate-50 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#D36A47]">
                                                    <Package size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-black text-slate-900 uppercase">{m.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.unit} | {m.code}</p>
                                                </div>
                                            </div>
                                            <CheckCircle2 size={18} className="text-slate-200 group-hover:text-[#D36A47]" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-5 bg-[#D36A47]/5 border border-[#D36A47]/20 rounded-3xl animate-in zoom-in-95">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#D36A47] flex items-center justify-center text-white">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 uppercase">{selectedMaterial.name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Birim: {selectedMaterial.unit}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedMaterial(null)}
                                    className="text-[10px] font-black text-[#D36A47] hover:underline uppercase tracking-widest"
                                >
                                    DEĞİŞTİR
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 2. Miktar ve İrsaliye */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-[#D36A47] uppercase tracking-[0.2em]">
                                2. GELEN MİKTAR
                            </h3>
                            <div className="relative">
                                <input
                                    type="number" required
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black text-slate-700 outline-none focus:ring-2 focus:ring-[#D36A47]/20 transition-all font-mono"
                                    placeholder="0.00"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                    {selectedMaterial?.unit || 'BİRİM'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-[#D36A47] uppercase tracking-[0.2em]">
                                3. İRSALİYE NO
                            </h3>
                            <div className="relative">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={waybillNumber}
                                    onChange={(e) => setWaybillNumber(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#D36A47]/20 transition-all"
                                    placeholder="Örn: IRS-2024-001"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 4. Fotoğraf ve Notlar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-[#D36A47] uppercase tracking-[0.2em]">
                                4. İRSALİYE FOTOĞRAFI
                            </h3>
                            <div className="relative aspect-video rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-400 hover:bg-slate-100 hover:border-[#D36A47]/30 transition-all cursor-pointer group overflow-hidden">
                                {photo ? (
                                    <img src={URL.createObjectURL(photo)} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <Camera size={24} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest">FOTOĞRAF ÇEK / YÜKLE</p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setPhoto(e.target.files[0])}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-[#D36A47] uppercase tracking-[0.2em]">
                                5. NOTLAR
                            </h3>
                            <textarea
                                rows="4"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#D36A47]/20 transition-all resize-none"
                                placeholder="Eksik teslimat, hasarlı ürün vb. varsa not düşün..."
                            />
                        </div>
                    </div>

                </form>

                {/* Footer */}
                <div className="px-8 py-7 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
                    >
                        Vazgeç
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !selectedMaterial || !quantity}
                        className="flex items-center gap-3 px-12 py-4 bg-[#D36A47] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#D36A47]/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    >
                        {loading ? 'STOĞA İŞLENİYOR...' : (
                            <>
                                <CheckCircle2 size={18} />
                                STOĞA EKLE VE ONAYLA
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MaterialEntryModal;
