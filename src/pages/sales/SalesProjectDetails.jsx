import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Building2,
  Home,
  CheckCircle,
  Clock,
  ArrowRight,
  Banknote,
  Plus,
  Pencil,
  Trash2,
  X
} from 'lucide-react';

const formatCurrency = (val) => {
  if (!val) return '-';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);
};

const getStatusCounts = (floors) => {
  let total = 0, sold = 0, reserved = 0, available = 0, barter = 0, owner = 0;
  let totalListPrice = 0, totalSoldPrice = 0;
  (floors || []).forEach(f => {
    (f.units || []).forEach(u => {
      total++;
      const status = String(u.sales_status || 'AVAILABLE').toUpperCase();
      if (status === 'SOLD' || status === 'SATILDI') {
        sold++;
        totalSoldPrice += Number(u.campaign_price || u.list_price || u.price || 0);
      } else if (status === 'RESERVED' || status === 'REZERVE' || status === 'REZERV') {
        reserved++;
      } else if (status === 'BARTER') {
        barter++;
      } else if (status === 'ARSA SAHIBI' || status === 'ARSA SAHİBİ') {
        owner++;
      } else {
        available++;
      }
      totalListPrice += Number(u.list_price || u.price || 0);
    });
  });
  return { total, sold, reserved, available, barter, owner, totalListPrice, totalSoldPrice, salesPercent: total > 0 ? Math.round((sold / total) * 100) : 0 };
};

function SalesProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [editBlock, setEditBlock] = useState(null);
  const [blockForm, setBlockForm] = useState({ name: '', floor_count: '', building_type: 'Konut' });

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/projects/${id}`);
      const proj = data.project || data.data || data;
      setProject(proj);
    } catch (err) {
      console.error('Proje detayi yuklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/blocks`, { ...blockForm, floor_count: Number(blockForm.floor_count) || 1 });
      setIsAddBlockOpen(false);
      setBlockForm({ name: '', floor_count: '', building_type: 'Konut' });
      fetchProject();
    } catch (err) {
      console.error(err);
      alert('Blok eklenemedi: ' + (err.message || ''));
    }
  };

  const handleEditBlock = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/blocks/${editBlock.id}`, blockForm);
      setEditBlock(null);
      setBlockForm({ name: '', floor_count: '', building_type: 'Konut' });
      fetchProject();
    } catch (err) {
      console.error(err);
      alert('Blok guncellenemedi: ' + (err.message || ''));
    }
  };

  const handleDeleteBlock = async (blockId, blockName, e) => {
    e.stopPropagation();
    if (!window.confirm(`"${blockName}" blogunu silmek istediginize emin misiniz?`)) return;
    try {
      await api.delete(`/projects/blocks/${blockId}`);
      fetchProject();
    } catch (err) {
      console.error(err);
      alert('Blok silinemedi: ' + (err.message || ''));
    }
  };

  const openEditBlock = (block, e) => {
    e.stopPropagation();
    setBlockForm({ name: block.name || '', floor_count: String((block.floors || []).length || block.floor_count || ''), building_type: block.building_type || 'Konut' });
    setEditBlock(block);
  };

  const blocks = project?.blocks || [];

  // Tum proje ozet istatistikleri
  const projectStats = getStatusCounts(blocks.flatMap(b => b.floors || []));

  return (
    <div className="flex min-h-screen bg-[#f8f9fb]">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Back + Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/sales/projects')}
              className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors mb-3"
            >
              <ArrowLeft size={16} /> Projelere Don
            </button>

            {loading ? (
              <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                    {project?.name || project?.project_name || 'Proje'}
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">{project?.location || project?.city || project?.address || ''}</p>
                </div>
                <button onClick={() => { setBlockForm({ name: '', floor_count: '', building_type: 'Konut' }); setIsAddBlockOpen(true); }}
                  className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                  <Plus size={18} /> Yeni Blok
                </button>
              </div>
            )}
          </div>

          {/* Project Summary */}
          {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
                <p className="text-2xl font-black text-slate-700">{projectStats.total}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Toplam Daire</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4 text-center">
                <p className="text-2xl font-black text-emerald-600">{projectStats.available}</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase mt-1">Satilik</p>
              </div>
              <div className="bg-rose-50 rounded-2xl border border-rose-100 p-4 text-center">
                <p className="text-2xl font-black text-rose-600">{projectStats.sold}</p>
                <p className="text-[10px] font-bold text-rose-500 uppercase mt-1">Satilan</p>
              </div>
              <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 text-center">
                <p className="text-2xl font-black text-amber-600">{projectStats.reserved}</p>
                <p className="text-[10px] font-bold text-amber-500 uppercase mt-1">Rezerve</p>
              </div>
              <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 text-center">
                <p className="text-lg font-black text-blue-700">%{projectStats.salesPercent}</p>
                <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">Satis Orani</p>
              </div>
            </div>
          )}

          {/* Blocks */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : blocks.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Building2 size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="font-bold">Bu projede blok bulunamadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {blocks.map(block => {
                const stats = getStatusCounts(block.floors || []);
                return (
                  <div
                    key={block.id}
                    onClick={() => navigate(`/sales/projects/${id}/blocks/${block.id}`)}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl hover:shadow-slate-200/50 hover:border-emerald-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all">
                          <Building2 size={24} />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-800 group-hover:text-emerald-700 transition-colors">
                            {block.name || `Blok ${block.id}`}
                          </h3>
                          <p className="text-xs text-slate-400">{(block.floors || []).length} Kat</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => openEditBlock(block, e)} className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100">
                          <Pencil size={14} />
                        </button>
                        <button onClick={(e) => handleDeleteBlock(block.id, block.name, e)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 size={14} />
                        </button>
                        <ArrowRight size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <div className="text-center bg-slate-50 rounded-xl p-2">
                        <p className="text-lg font-black text-slate-700">{stats.total}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Toplam</p>
                      </div>
                      <div className="text-center bg-emerald-50 rounded-xl p-2">
                        <p className="text-lg font-black text-emerald-600">{stats.available}</p>
                        <p className="text-[8px] font-bold text-emerald-500 uppercase">Satilik</p>
                      </div>
                      <div className="text-center bg-rose-50 rounded-xl p-2">
                        <p className="text-lg font-black text-rose-600">{stats.sold}</p>
                        <p className="text-[8px] font-bold text-rose-500 uppercase">Satilan</p>
                      </div>
                      <div className="text-center bg-amber-50 rounded-xl p-2">
                        <p className="text-lg font-black text-amber-600">{stats.reserved}</p>
                        <p className="text-[8px] font-bold text-amber-500 uppercase">Rezerve</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold text-slate-400">Satis</span>
                        <span className="text-[10px] font-black text-emerald-600">%{stats.salesPercent}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${stats.salesPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Liste Toplam</p>
                        <p className="text-xs font-black text-slate-700">{formatCurrency(stats.totalListPrice)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Satis Geliri</p>
                        <p className="text-xs font-black text-emerald-600">{formatCurrency(stats.totalSoldPrice)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Block Modal */}
      {(isAddBlockOpen || editBlock) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-slate-800">{editBlock ? 'Blok Duzenle' : 'Yeni Blok Ekle'}</h3>
              <button onClick={() => { setIsAddBlockOpen(false); setEditBlock(null); }} className="p-1 hover:bg-slate-100 rounded-lg"><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={editBlock ? handleEditBlock : handleAddBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Blok Adi *</label>
                <input value={blockForm.name} onChange={(e) => setBlockForm(p => ({ ...p, name: e.target.value }))} required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500" placeholder="Ornek: A Blok" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kat Sayisi</label>
                <input type="number" value={blockForm.floor_count} onChange={(e) => setBlockForm(p => ({ ...p, floor_count: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-emerald-500" placeholder="Ornek: 10" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Yapi Tipi</label>
                <select value={blockForm.building_type} onChange={(e) => setBlockForm(p => ({ ...p, building_type: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-emerald-500">
                  <option value="Konut">Konut</option>
                  <option value="Ticari">Ticari</option>
                  <option value="Karma">Karma</option>
                  <option value="Ofis">Ofis</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setIsAddBlockOpen(false); setEditBlock(null); }}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200">Iptal</button>
                <button type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700">{editBlock ? 'Guncelle' : 'Olustur'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesProjectDetails;
