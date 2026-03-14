import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
    Plus, Trash2, CheckSquare, Pencil, Filter, Gavel, FileText,
    Building2, Calendar, DollarSign, CheckCircle2, Clock, XCircle,
    Send, ArrowRight
} from 'lucide-react';

const getStatusClasses = (status) => {
    switch (status) {
        case 'OPEN': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'CLOSED': return 'bg-slate-100 text-slate-600 border-slate-200';
        case 'AWARDED': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'PENDING': return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'ACCEPTED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'REJECTED': return 'bg-red-50 text-red-600 border-red-200';
        default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
};

export default function Tenders() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('tenders');
    const [tenders, setTenders] = useState([]);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const { user } = useAuth();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tenderData, bidData] = await Promise.all([
                api.get('/tenders/job-tenders'),
                api.get('/tenders/subcontractor-bids')
            ]);
            setTenders(Array.isArray(tenderData) ? tenderData : []);
            setBids(Array.isArray(bidData) ? bidData : []);
        } catch (err) {
            console.error('Ihale verileri cekilemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (user) fetchData(); }, [user]);

    const handleAdd = async (formData) => {
        try {
            const endpoint = activeTab === 'tenders' ? '/tenders/job-tenders' : '/tenders/subcontractor-bids';
            await api.post(endpoint, formData);
            fetchData();
            setIsAddModalOpen(false);
        } catch (err) { console.error(err); }
    };

    const handleUpdate = async (id, formData) => {
        try {
            const endpoint = activeTab === 'tenders' ? `/tenders/job-tenders/${id}` : `/tenders/subcontractor-bids/${id}`;
            await api.put(endpoint, formData);
            fetchData();
            setEditItem(null);
        } catch (err) { console.error(err); }
    };

    const handleDeleteSelected = async () => {
        if (!window.confirm(`${selectedItems.length} kaydi silmek istediginize emin misiniz?`)) return;
        try {
            const endpoint = activeTab === 'tenders' ? '/tenders/job-tenders' : '/tenders/subcontractor-bids';
            await Promise.all(selectedItems.map(id => api.delete(`${endpoint}/${id}`)));
            fetchData();
            setSelectedItems([]);
        } catch (err) { console.error(err); }
    };

    const tenderColumns = [
        { key: 'title', label: 'Ihale Basligi', render: (val, row) => (
            <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-slate-800 text-[13px]">{val || row.job_type || '-'}</span>
                <span className="text-[11px] text-slate-400">{row.scope || ''}</span>
            </div>
        )},
        { key: 'project_name', label: 'Proje', render: val => <span className="text-[13px] text-slate-600">{val || '-'}</span> },
        { key: 'budget', label: 'Butce', render: val => <span className="font-bold text-slate-800 text-[13px]">{val ? Number(val).toLocaleString('tr-TR') + ' TL' : '-'}</span> },
        { key: 'deadline', label: 'Son Tarih', render: val => <span className="text-[13px] text-slate-600">{val ? new Date(val).toLocaleDateString('tr-TR') : '-'}</span> },
        { key: 'status', label: 'Durum', render: val => (
            <span className={`inline-flex items-center gap-1 border rounded-full text-[11px] font-bold px-2.5 py-1 ${getStatusClasses(val)}`}>
                {val || 'OPEN'}
            </span>
        )},
        { key: 'actions', label: 'Islemler', sortable: false, align: 'center', stopPropagation: true, render: (_, row) => (
            <button onClick={(e) => { e.stopPropagation(); setEditItem(row); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-slate-600 bg-white border border-slate-200 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 rounded-lg transition-all shadow-sm">
                <Pencil size={13} /> Duzenle
            </button>
        )},
    ];

    const bidColumns = [
        { key: 'company_name', label: 'Taseron', render: (val, row) => (
            <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-slate-800 text-[13px]">{val || row.subcontractor_name || '-'}</span>
            </div>
        )},
        { key: 'tender_title', label: 'Ihale', render: val => <span className="text-[13px] text-slate-600">{val || '-'}</span> },
        { key: 'bid_amount', label: 'Teklif Tutari', render: val => <span className="font-bold text-slate-800 text-[13px]">{val ? Number(val).toLocaleString('tr-TR') + ' TL' : '-'}</span> },
        { key: 'submitted_at', label: 'Teklif Tarihi', render: val => <span className="text-[13px] text-slate-600">{val ? new Date(val).toLocaleDateString('tr-TR') : '-'}</span> },
        { key: 'status', label: 'Durum', render: val => (
            <span className={`inline-flex items-center gap-1 border rounded-full text-[11px] font-bold px-2.5 py-1 ${getStatusClasses(val)}`}>
                {val || 'PENDING'}
            </span>
        )},
    ];

    const data = activeTab === 'tenders' ? tenders : bids;
    const columns = activeTab === 'tenders' ? tenderColumns : bidColumns;

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Ihale Yonetimi" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center"><Gavel size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toplam Ihale</p>
                                <h3 className="text-xl font-black text-slate-800">{tenders.length}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><CheckCircle2 size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acik Ihaleler</p>
                                <h3 className="text-xl font-black text-slate-800">{tenders.filter(t => t.status === 'OPEN').length}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center"><Send size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toplam Teklif</p>
                                <h3 className="text-xl font-black text-slate-800">{bids.length}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center"><DollarSign size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toplam Butce</p>
                                <h3 className="text-xl font-black text-slate-800">{tenders.reduce((sum, t) => sum + (Number(t.budget) || 0), 0).toLocaleString('tr-TR')} TL</h3>
                            </div>
                        </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="bg-white p-1.5 rounded-[28px] border border-slate-100 shadow-sm flex max-w-lg">
                        <button onClick={() => { setActiveTab('tenders'); setSelectedItems([]); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'tenders' ? 'bg-[#0A1128] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
                            <Gavel size={16} /> Is Ihaleleri
                        </button>
                        <button onClick={() => { setActiveTab('bids'); setSelectedItems([]); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'bids' ? 'bg-[#0A1128] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
                            <Send size={16} /> Taseron Teklifleri
                        </button>
                    </div>

                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-bold text-slate-800">{activeTab === 'tenders' ? 'Is Ihaleleri' : 'Taseron Teklifleri'}</h2>
                        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
                            <Plus size={15} /> {activeTab === 'tenders' ? 'Ihale Ekle' : 'Teklif Ekle'}
                        </button>
                    </div>

                    {/* Selection Bar */}
                    {selectedItems.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between bg-orange-50 border border-orange-200 p-3.5 rounded-xl animate-fade-in">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center bg-orange-600 text-white w-7 h-7 rounded-lg text-xs font-bold">{selectedItems.length}</span>
                                <span className="text-sm font-semibold text-orange-800">kayit secildi</span>
                            </div>
                            <button onClick={handleDeleteSelected} className="flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors">
                                <Trash2 size={15} /> Sil
                            </button>
                        </div>
                    )}

                    <DataTable
                        columns={columns}
                        data={data}
                        loading={loading}
                        selectable={true}
                        selectedRows={selectedItems}
                        onSelect={(id) => setSelectedItems(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])}
                        rowKey="id"
                        searchPlaceholder={activeTab === 'tenders' ? 'Ihalelerde ara...' : 'Tekliflerde ara...'}
                        pageSize={10}
                        emptyMessage="Kayit bulunamadi."
                    />

                    {/* Add Modal */}
                    {isAddModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                            <div className="bg-white rounded-[40px] w-full max-w-lg p-8 shadow-2xl space-y-6">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{activeTab === 'tenders' ? 'Yeni Ihale' : 'Yeni Teklif'}</h3>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const fd = new FormData(e.target);
                                    const obj = Object.fromEntries(fd.entries());
                                    handleAdd(obj);
                                }} className="space-y-4">
                                    {activeTab === 'tenders' ? (
                                        <>
                                            <input name="title" placeholder="Ihale Basligi" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                            <input name="job_type" placeholder="Is Tipi" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                            <input name="scope" placeholder="Kapsam" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                            <input name="budget" type="number" placeholder="Butce (TL)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                            <input name="deadline" type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                        </>
                                    ) : (
                                        <>
                                            <input name="company_name" placeholder="Taseron Adi" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                            <input name="tender_title" placeholder="Ihale Basligi" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                            <input name="bid_amount" type="number" placeholder="Teklif Tutari (TL)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                            <textarea name="notes" placeholder="Notlar" rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none resize-none" />
                                        </>
                                    )}
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold">Iptal</button>
                                        <button type="submit" className="flex-1 py-3 bg-[#0A1128] text-white rounded-2xl text-sm font-bold">Kaydet</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Edit Modal */}
                    {editItem && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                            <div className="bg-white rounded-[40px] w-full max-w-lg p-8 shadow-2xl space-y-6">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Duzenle</h3>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const fd = new FormData(e.target);
                                    const obj = Object.fromEntries(fd.entries());
                                    handleUpdate(editItem.id, obj);
                                }} className="space-y-4">
                                    {activeTab === 'tenders' ? (
                                        <>
                                            <input name="title" defaultValue={editItem.title} placeholder="Ihale Basligi" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                            <input name="job_type" defaultValue={editItem.job_type} placeholder="Is Tipi" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                            <input name="budget" type="number" defaultValue={editItem.budget} placeholder="Butce" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                            <select name="status" defaultValue={editItem.status || 'OPEN'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none">
                                                <option value="OPEN">Acik</option>
                                                <option value="CLOSED">Kapali</option>
                                                <option value="AWARDED">Verildi</option>
                                            </select>
                                        </>
                                    ) : (
                                        <>
                                            <input name="bid_amount" type="number" defaultValue={editItem.bid_amount} placeholder="Teklif Tutari" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                            <select name="status" defaultValue={editItem.status || 'PENDING'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none">
                                                <option value="PENDING">Beklemede</option>
                                                <option value="ACCEPTED">Kabul Edildi</option>
                                                <option value="REJECTED">Reddedildi</option>
                                            </select>
                                            <textarea name="notes" defaultValue={editItem.notes} placeholder="Notlar" rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none resize-none" />
                                        </>
                                    )}
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => setEditItem(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold">Iptal</button>
                                        <button type="submit" className="flex-1 py-3 bg-[#0A1128] text-white rounded-2xl text-sm font-bold">Guncelle</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
