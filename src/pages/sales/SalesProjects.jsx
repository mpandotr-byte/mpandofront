import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Search,
  Home,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Filter,
  Banknote,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  MapPin,
  Calendar
} from 'lucide-react';

const formatCurrency = (val) => {
  if (!val) return '-';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);
};

function SalesProjects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', address: '', start_date: '', end_date: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await api.get('/projects');
      const projectList = Array.isArray(data) ? data : data.projects || data.data || [];

      // Her proje icin detaylari cek
      const enriched = await Promise.all(
        projectList.map(async (p) => {
          try {
            const detail = await api.get(`/projects/${p.id}`);
            const proj = detail.project || detail.data || detail;
            const blocks = proj.blocks || [];
            let totalUnits = 0, sold = 0, reserved = 0, available = 0, barter = 0, owner = 0;
            let totalListPrice = 0, totalSoldPrice = 0;

            blocks.forEach(b => {
              const floors = b.floors || [];
              floors.forEach(f => {
                const units = f.units || [];
                units.forEach(u => {
                  totalUnits++;
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
            });

            return {
              ...p,
              ...proj,
              blockCount: blocks.length,
              totalUnits,
              sold,
              reserved,
              available,
              barter,
              owner,
              totalListPrice,
              totalSoldPrice,
              salesPercent: totalUnits > 0 ? Math.round((sold / totalUnits) * 100) : 0
            };
          } catch {
            return { ...p, blockCount: 0, totalUnits: 0, sold: 0, reserved: 0, available: 0, barter: 0, owner: 0, totalListPrice: 0, totalSoldPrice: 0, salesPercent: 0 };
          }
        })
      );

      setProjects(enriched);
    } catch (err) {
      console.error('Projeler yuklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', formData);
      setIsAddModalOpen(false);
      setFormData({ name: '', description: '', address: '', start_date: '', end_date: '' });
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert('Proje eklenemedi: ' + (err.message || ''));
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${editProject.id}`, formData);
      setEditProject(null);
      setFormData({ name: '', description: '', address: '', start_date: '', end_date: '' });
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert('Proje guncellenemedi: ' + (err.message || ''));
    }
  };

  const handleDeleteProject = async (id, name) => {
    if (!window.confirm(`"${name}" projesini silmek istediginize emin misiniz?`)) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert('Proje silinemedi: ' + (err.message || ''));
    }
  };

  const openEditModal = (project, e) => {
    e.stopPropagation();
    setFormData({
      name: project.name || project.project_name || '',
      description: project.description || '',
      address: project.address || project.location || '',
      start_date: project.start_date ? project.start_date.split('T')[0] : '',
      end_date: project.end_date ? project.end_date.split('T')[0] : ''
    });
    setEditProject(project);
  };

  const filtered = projects.filter(p =>
    (p.name || p.project_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.location || p.city || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f8f9fb]">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Satis Projeleri</h1>
              <p className="text-sm text-slate-400 mt-1">Projelerin satis durumunu takip edin</p>
            </div>
            <button onClick={() => { setFormData({ name: '', description: '', address: '', start_date: '', end_date: '' }); setIsAddModalOpen(true); }}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
              <Plus size={18} /> Yeni Proje
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center"><Building2 size={16} className="text-blue-600" /></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Toplam Proje</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{projects.length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center"><Home size={16} className="text-emerald-600" /></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Toplam Daire</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{projects.reduce((a, p) => a + (p.totalUnits || 0), 0)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center"><CheckCircle size={16} className="text-red-600" /></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Satilan</span>
              </div>
              <p className="text-2xl font-black text-red-600">{projects.reduce((a, p) => a + (p.sold || 0), 0)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center"><Clock size={16} className="text-orange-600" /></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Rezerve</span>
              </div>
              <p className="text-2xl font-black text-orange-600">{projects.reduce((a, p) => a + (p.reserved || 0), 0)}</p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Proje ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              />
            </div>
          </div>

          {/* Project Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Building2 size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="font-bold">Proje bulunamadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(project => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/sales/projects/${project.id}`)}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl hover:shadow-slate-200/50 hover:border-emerald-300 transition-all cursor-pointer group"
                >
                  {/* Project Name */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-base font-black text-slate-800 group-hover:text-emerald-700 transition-colors">
                        {project.name || project.project_name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{project.location || project.city || project.address || '-'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => openEditModal(project, e)} className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100">
                        <Pencil size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id, project.name || project.project_name); }} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={14} />
                      </button>
                      <ArrowRight size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center bg-slate-50 rounded-xl p-2">
                      <p className="text-lg font-black text-slate-700">{project.totalUnits}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Toplam</p>
                    </div>
                    <div className="text-center bg-emerald-50 rounded-xl p-2">
                      <p className="text-lg font-black text-emerald-600">{project.available}</p>
                      <p className="text-[9px] font-bold text-emerald-500 uppercase">Satilik</p>
                    </div>
                    <div className="text-center bg-red-50 rounded-xl p-2">
                      <p className="text-lg font-black text-red-600">{project.sold}</p>
                      <p className="text-[9px] font-bold text-red-500 uppercase">Satilan</p>
                    </div>
                    <div className="text-center bg-orange-50 rounded-xl p-2">
                      <p className="text-lg font-black text-orange-600">{project.reserved}</p>
                      <p className="text-[9px] font-bold text-orange-500 uppercase">Rezerve</p>
                    </div>
                  </div>

                  {/* Sales Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Satis Ilerleme</span>
                      <span className="text-xs font-black text-emerald-600">%{project.salesPercent}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${project.salesPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Price Info */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Toplam Deger</p>
                      <p className="text-sm font-black text-slate-700">{formatCurrency(project.totalListPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Satis Geliri</p>
                      <p className="text-sm font-black text-emerald-600">{formatCurrency(project.totalSoldPrice)}</p>
                    </div>
                  </div>

                  {/* Block Count */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {project.blockCount} Blok
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Project Modal */}
      {(isAddModalOpen || editProject) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-slate-800">{editProject ? 'Proje Duzenle' : 'Yeni Proje Ekle'}</h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditProject(null); }} className="p-1 hover:bg-slate-100 rounded-lg"><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={editProject ? handleEditProject : handleAddProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Proje Adi *</label>
                <input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500" placeholder="Ornek: Dolunay Yasam Merkezi" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aciklama</label>
                <textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={2}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-emerald-500 resize-none" placeholder="Proje aciklamasi" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Adres</label>
                <input value={formData.address} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-emerald-500" placeholder="Proje adresi" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Baslangic Tarihi</label>
                  <input type="date" value={formData.start_date} onChange={(e) => setFormData(p => ({ ...p, start_date: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bitis Tarihi</label>
                  <input type="date" value={formData.end_date} onChange={(e) => setFormData(p => ({ ...p, end_date: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setIsAddModalOpen(false); setEditProject(null); }}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200">Iptal</button>
                <button type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700">{editProject ? 'Guncelle' : 'Olustur'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesProjects;
