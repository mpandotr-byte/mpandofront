import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
    CheckCircle2,
    XCircle,
    Eye,
    DollarSign,
    User,
    Building2,
    Clock,
    ArrowRight,
    ShieldCheck,
    Save
} from 'lucide-react';

function Offers() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [approvalData, setApprovalData] = useState({
        final_price: '',
        manager_note: '',
        status: 'Satıldı' // Onaylandığında varsayılan durum
    });

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const data = await api.get('/sales');
            // Sadece onay bekleyenleri filtrele
            const pendingOffers = (data || []).filter(item => item.approval_status === 'Onay Bekliyor');
            setOffers(pendingOffers);
        } catch (err) {
            console.error('Teklifler yüklenirken hata:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (user) fetchOffers(); }, [user]);

    const openApprovalModal = (offer) => {
        setSelectedOffer(offer);
        setApprovalData({
            final_price: offer.offered_price || '',
            manager_note: '',
            status: 'Satıldı'
        });
        setIsApprovalModalOpen(true);
    };

    const handleApprove = async () => {
        if (!approvalData.final_price) {
            alert("Lütfen onaylanan satış fiyatını giriniz.");
            return;
        }

        try {
            await api.put(`/sales/${selectedOffer.id}`, {
                approval_status: 'Onaylandı',
                sale_status: approvalData.status,
                offered_price: Number(approvalData.final_price),
                notes: selectedOffer.notes + `\n\nYönetici Notu: ${approvalData.manager_note}`
            });
            alert("Teklif onaylandı ve satış kaydı güncellendi.");
            setIsApprovalModalOpen(false);
            fetchOffers();
        } catch (err) {
            console.error("Onaylama hatası:", err);
            alert("İşlem sırasında bir hata oluştu.");
        }
    };

    const handleReject = async () => {
        if (!window.confirm("Bu teklifi reddetmek istediğinize emin misiniz?")) return;
        try {
            await api.put(`/sales/${selectedOffer.id}`, {
                approval_status: 'Reddedildi',
                sale_status: 'Reddedildi'
            });
            alert("Teklif reddedildi.");
            setIsApprovalModalOpen(false);
            fetchOffers();
        } catch (err) {
            console.error("Reddetme hatası:", err);
            alert("İşlem sırasında bir hata oluştu.");
        }
    };

    const tableColumns = [
        {
            header: "Müşteri",
            key: "musteri_id",
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {row.customers?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{row.customers?.full_name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{row.customers?.phone}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Proje / Ünite",
            key: "proje",
            render: (_, row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-700 text-xs">{row.projects?.name || row.projects?.project_name}</span>
                    <span className="text-[11px] text-slate-500">{row.interested_product || 'Ünite Seçilmemiş'}</span>
                </div>
            )
        },
        {
            header: "Liste Fiyatı",
            key: "list_price",
            render: (val) => val ? (
                <span className="font-semibold text-slate-500 text-xs">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val)}
                </span>
            ) : '-'
        },
        {
            header: "Teklif Edilen",
            key: "offered_price",
            render: (val) => (
                <span className="font-black text-orange-600 text-xs text-center block">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val || 0)}
                </span>
            )
        },
        {
            header: "Tarih",
            key: "created_at",
            render: (val) => <span className="text-[11px] text-slate-500">{new Date(val).toLocaleDateString('tr-TR')}</span>
        },
        {
            header: "İşlemler",
            key: "actions",
            align: "center",
            render: (_, row) => (
                <button
                    onClick={() => openApprovalModal(row)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
                >
                    <ShieldCheck size={14} /> İncele & Onayla
                </button>
            )
        }
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 overflow-y-auto h-screen relative">
                <Navbar title="Müşteri Teklifleri Onay Paneli" toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

                <div className="px-6 py-8 space-y-6">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Onay Bekleyen Teklifler</h1>
                                <p className="text-blue-100 text-sm">Satış danışmanları tarafından yönetici onayına gönderilen teklifleri buradan yönetebilirsiniz.</p>
                            </div>
                        </div>
                    </div>

                    <DataTable
                        columns={tableColumns}
                        data={offers}
                        loading={loading}
                        searchPlaceholder="Tekliflerde ara..."
                        emptyMessage="Onay bekleyen herhangi bir teklif bulunmuyor."
                    />
                </div>

                {/* Onay Modal */}
                {isApprovalModalOpen && selectedOffer && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-500">
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                        <DollarSign size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Teklif Onayla</h2>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SATIŞ SÜRECİ SONLANDIRMA</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsApprovalModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"><XCircle size={20} /></button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Müşteri:</span>
                                        <span className="font-bold text-slate-800">{selectedOffer.customers?.full_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Ünite:</span>
                                        <span className="font-bold text-slate-800">{selectedOffer.interested_product}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Satış Danışmanı:</span>
                                        <span className="font-bold text-slate-800">{selectedOffer.employees?.full_name || 'Bilinmiyor'}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Liste</p>
                                        <p className="text-xs font-black text-slate-600">
                                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(selectedOffer.list_price || 0)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-center">
                                        <p className="text-[9px] font-bold text-blue-400 uppercase mb-1">Danışman</p>
                                        <p className="text-xs font-black text-blue-600">
                                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(selectedOffer.offered_price || 0)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-orange-50 border border-orange-100 rounded-2xl text-center shadow-sm">
                                        <p className="text-[9px] font-bold text-orange-400 uppercase mb-1">Müşteri</p>
                                        <p className="text-xs font-black text-orange-600">
                                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(selectedOffer.customer_offer || 0)}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Onaylanan Satış Fiyatı</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-500">
                                                <Banknote size={18} />
                                            </div>
                                            <input
                                                type="number"
                                                value={approvalData.final_price}
                                                onChange={(e) => setApprovalData({ ...approvalData, final_price: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 focus:border-emerald-500 outline-none rounded-2xl text-lg font-black text-slate-800 transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Yönetici Notu</label>
                                        <textarea
                                            value={approvalData.manager_note}
                                            onChange={(e) => setApprovalData({ ...approvalData, manager_note: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border-2 border-slate-100 focus:border-blue-500 outline-none rounded-2xl text-sm min-h-[100px] transition-all"
                                            placeholder="Teklif hakkında görüşünüz veya ek notunuz..."
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">İşlem Sonucu Durumu</label>
                                        <select
                                            value={approvalData.status}
                                            onChange={(e) => setApprovalData({ ...approvalData, status: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border-2 border-slate-100 focus:border-blue-500 outline-none rounded-2xl text-sm transition-all"
                                        >
                                            <option value="Satıldı">Satıldı (Kesinleşti)</option>
                                            <option value="Rezerv">Rezerv (Beklemeye Al)</option>
                                            <option value="Barter">Barter</option>
                                            <option value="Arsa Sahibi">Arsa Sahibi</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={handleReject}
                                    className="flex items-center justify-center gap-2 py-3.5 bg-white border border-red-200 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all"
                                >
                                    <XCircle size={18} /> Teklifi Reddet
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApprove}
                                    className="flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                                >
                                    <CheckCircle2 size={18} /> Onayla ve Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// Eksik iconları lucide-react'tan ekle
import { Banknote } from 'lucide-react';

export default Offers;
