import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
    Plus, Trash2, Pencil, Megaphone, Calendar, User,
    CheckCircle2, Clock, AlertCircle, Eye
} from 'lucide-react';

const getStatusClasses = (status) => {
    switch (status) {
        case 'ACTIVE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'DRAFT': return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'ARCHIVED': return 'bg-slate-100 text-slate-600 border-slate-200';
        default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
};

export default function Announcements() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [detailItem, setDetailItem] = useState(null);
    const { user } = useAuth();

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const data = await api.get('/announcements');
            setAnnouncements(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Duyurular cekilemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (user) fetchAnnouncements(); }, [user]);

    const handleAdd = async (formData) => {
        try {
            await api.post('/announcements', formData);
            fetchAnnouncements();
            setIsAddModalOpen(false);
        } catch (err) { console.error(err); }
    };

    const handleUpdate = async (id, formData) => {
        try {
            await api.put(`/announcements/${id}`, formData);
            fetchAnnouncements();
            setEditItem(null);
        } catch (err) { console.error(err); }
    };

    const handleDeleteSelected = async () => {
        if (!window.confirm(`${selectedItems.length} duyuruyu silmek istediginize emin misiniz?`)) return;
        try {
            await Promise.all(selectedItems.map(id => api.delete(`/announcements/${id}`)));
            fetchAnnouncements();
            setSelectedItems([]);
        } catch (err) { console.error(err); }
    };

    const columns = [
        { key: 'title', label: 'Baslik', render: (val, row) => (
            <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-slate-800 text-[13px]">{val || row.transaction_type || '-'}</span>
                <span className="text-[11px] text-slate-400 line-clamp-1">{row.description || row.notes || ''}</span>
            </div>
        )},
        { key: 'project_name', label: 'Proje', render: val => <span className="text-[13px] text-slate-600">{val || '-'}</span> },
        { key: 'customer_name', label: 'Musteri', render: val => <span className="text-[13px] text-slate-600">{val || '-'}</span> },
        { key: 'created_at', label: 'Tarih', render: val => <span className="text-[13px] text-slate-600">{val ? new Date(val).toLocaleDateString('tr-TR') : '-'}</span> },
        { key: 'status', label: 'Durum', render: val => (
            <span className={`inline-flex items-center gap-1 border rounded-full text-[11px] font-bold px-2.5 py-1 ${getStatusClasses(val)}`}>
                {val || 'ACTIVE'}
            </span>
        )},
        { key: 'actions', label: 'Islemler', sortable: false, align: 'center', stopPropagation: true, render: (_, row) => (
            <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); setDetailItem(row); }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-all">
                    <Eye size={13} />
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
                <Navbar title="Duyurular" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center"><Megaphone size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toplam Duyuru</p>
                                <h3 className="text-xl font-black text-slate-800">{announcements.length}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><CheckCircle2 size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktif</p>
                                <h3 className="text-xl font-black text-slate-800">{announcements.filter(a => a.status === 'ACTIVE' || !a.status).length}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center"><Clock size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bu Ay</p>
                                <h3 className="text-xl font-black text-slate-800">{announcements.filter(a => { const d = new Date(a.created_at); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).length}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-bold text-slate-800">Duyuru Listesi</h2>
                        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
                            <Plus size={15} /> Duyuru Ekle
                        </button>
                    </div>

                    {selectedItems.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between bg-orange-50 border border-orange-200 p-3.5 rounded-xl">
                            <span className="text-sm font-semibold text-orange-800">{selectedItems.length} kayit secildi</span>
                            <button onClick={handleDeleteSelected} className="flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200">
                                <Trash2 size={15} /> Sil
                            </button>
                        </div>
                    )}

                    <DataTable
                        columns={columns}
                        data={announcements}
                        loading={loading}
                        onRowClick={setDetailItem}
                        selectable={true}
                        selectedRows={selectedItems}
                        onSelect={(id) => setSelectedItems(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])}
                        rowKey="id"
                        searchPlaceholder="Duyurularda ara..."
                        pageSize={10}
                        emptyMessage="Duyuru bulunamadi."
                    />

                    {/* Add Modal */}
                    {isAddModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                            <div className="bg-white rounded-[40px] w-full max-w-lg p-8 shadow-2xl space-y-6">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Yeni Duyuru</h3>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const fd = new FormData(e.target);
                                    handleAdd(Object.fromEntries(fd.entries()));
                                }} className="space-y-4">
                                    <input name="title" placeholder="Duyuru Basligi" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                    <select name="transaction_type" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none">
                                        <option value="">Islem Tipi Secin</option>
                                        <option value="SATIS">Satis</option>
                                        <option value="TAHSILAT">Tahsilat</option>
                                        <option value="GENEL">Genel</option>
                                    </select>
                                    <textarea name="description" placeholder="Duyuru Icerigi" rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none resize-none" />
                                    <textarea name="notes" placeholder="Notlar" rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none resize-none" />
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
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Duyuru Duzenle</h3>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const fd = new FormData(e.target);
                                    handleUpdate(editItem.id, Object.fromEntries(fd.entries()));
                                }} className="space-y-4">
                                    <input name="title" defaultValue={editItem.title} placeholder="Baslik" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                    <select name="status" defaultValue={editItem.status || 'ACTIVE'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none">
                                        <option value="ACTIVE">Aktif</option>
                                        <option value="DRAFT">Taslak</option>
                                        <option value="ARCHIVED">Arsivlendi</option>
                                    </select>
                                    <textarea name="description" defaultValue={editItem.description} placeholder="Icerik" rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none resize-none" />
                                    <textarea name="notes" defaultValue={editItem.notes} placeholder="Notlar" rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none resize-none" />
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => setEditItem(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold">Iptal</button>
                                        <button type="submit" className="flex-1 py-3 bg-[#0A1128] text-white rounded-2xl text-sm font-bold">Guncelle</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Detail Modal */}
                    {detailItem && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                            <div className="bg-white rounded-[40px] w-full max-w-lg p-8 shadow-2xl space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Duyuru Detay</h3>
                                    <span className={`inline-flex items-center gap-1 border rounded-full text-[11px] font-bold px-2.5 py-1 ${getStatusClasses(detailItem.status)}`}>
                                        {detailItem.status || 'ACTIVE'}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Baslik</p><p className="text-sm font-bold text-slate-800">{detailItem.title || detailItem.transaction_type || '-'}</p></div>
                                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Icerik</p><p className="text-sm text-slate-600">{detailItem.description || '-'}</p></div>
                                    {detailItem.notes && <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notlar</p><p className="text-sm text-slate-600">{detailItem.notes}</p></div>}
                                    <div className="flex gap-6">
                                        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Proje</p><p className="text-sm text-slate-600">{detailItem.project_name || '-'}</p></div>
                                        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Musteri</p><p className="text-sm text-slate-600">{detailItem.customer_name || '-'}</p></div>
                                    </div>
                                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tarih</p><p className="text-sm text-slate-600">{detailItem.created_at ? new Date(detailItem.created_at).toLocaleString('tr-TR') : '-'}</p></div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button onClick={() => setDetailItem(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold">Kapat</button>
                                    <button onClick={() => { setDetailItem(null); setEditItem(detailItem); }} className="flex-1 py-3 bg-[#0A1128] text-white rounded-2xl text-sm font-bold">Duzenle</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
