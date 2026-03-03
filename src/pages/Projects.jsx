import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ProjectEditModal from '../modals/projects/ProjectEditModal';
import NewProjectModal from '../modals/projects/NewProjectModal'; // Yeni import
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Trash2,
  CheckSquare,
  Pencil,
  Columns,
  Clock,
  AlertCircle,
  Hourglass,
  CheckCircle,
  Filter,
  Search,
  Briefcase,
  Hash,
  Users,
  MapPin,
  Calendar,
  FileText,
  Building2,
  Home,
  ArrowLeft,
  X
} from 'lucide-react';

const getStatusClasses = (status) => {
  switch (status) {
    case 'Devam Ediyor': return 'bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold px-2 py-1';
    case 'Planlanıyor': return 'bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold px-2 py-1';
    case 'Gecikmede': return 'bg-red-50 text-red-700 border-red-200 text-[10px] font-bold px-2 py-1';
    case 'Bitiyor': return 'bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] font-bold px-2 py-1';
    case 'Tamamlandı': return 'bg-green-50 text-green-700 border-green-200 text-[10px] font-bold px-2 py-1';
    default: return 'bg-slate-50 text-slate-700 border-slate-200 text-[10px] font-bold px-2 py-1';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Devam Ediyor': return <Clock size={14} />;
    case 'Planlanıyor': return <Hourglass size={14} />;
    case 'Gecikmede': return <AlertCircle size={14} />;
    case 'Bitiyor': return <Hourglass size={14} />;
    case 'Tamamlandı': return <CheckCircle size={14} />;
    default: return null;
  }
};

const getProgressBarColor = (status) => {
  switch (status) {
    case 'Devam Ediyor': return 'bg-blue-600';
    case 'Planlanıyor': return 'bg-purple-500';
    case 'Gecikmede': return 'bg-red-500';
    case 'Bitiyor': return 'bg-yellow-500';
    case 'Tamamlandı': return 'bg-green-600';
    default: return 'bg-slate-500';
  }
};

// --- Örnek Projeler ---
const initialProjectList = [
  { id: 1, company: 'AKSU', unit: '18', address: '', status: 'Devam Ediyor', created_at: '01.01.2024', created_by: 'Ali Yılmaz', description: '', startDate: '2023-01-10', endDate: '2024-12-31', contractor: 'Ali Yılmaz' },
  { id: 2, company: 'Dolunay Yaşam Merkezi', unit: '32', address: '', status: 'Gecikmede', created_at: '15.03.2024', created_by: 'Ahmet Korkmaz', description: '', startDate: '2022-02-01', endDate: '2024-06-01', contractor: 'Ahmet Korkmaz' },
  { id: 3, company: 'İŞHAN Rezidans', unit: '14', address: '', status: 'Bitiyor', created_at: '10.02.2024', created_by: 'Ali Yılmaz', description: '', startDate: '2023-05-15', endDate: '2024-08-15', contractor: 'Ali Yılmaz' },
  { id: 4, company: 'İSKAMALL Yaşam Merkezi ', unit: '6', address: '', status: 'Tamamlandı', created_at: '20.06.2023', created_by: 'Ayşe Demir', description: '', startDate: '2022-03-01', endDate: '2023-05-20', contractor: 'Veli Can' },
];

const initialNewProjectData = {
  company: '',
  address: '',
  status: 'Devam Ediyor',
  description: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  contractor: '',
  contractor_id: '',
  location_lat: '',
  location_lng: ''
};

const optionalColumns = [
  { key: 'description', label: 'Açıklama', icon: <FileText size={14} /> },
  { key: 'startDate', label: 'Başlangıç Tarihi', icon: <Calendar size={14} /> },
  { key: 'endDate', label: 'Bitiş Tarihi', icon: <Clock size={14} /> },
  { key: 'contractor', label: 'Müteahhit', icon: <Users size={14} /> },
  { key: 'created_at', label: 'Oluşturulma Tarihi', icon: <Calendar size={14} /> },
];

function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      <div className="flex flex-wrap items-center gap-2">{action}</div>
    </div>
  );
}

function Projects() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [siteEngineers, setSiteEngineers] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProjectData, setNewProjectData] = useState(initialNewProjectData);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(optionalColumns.map(col => col.key));
  const columnDropdownRef = useRef(null);

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Hepsi');
  const filterDropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  const allStatusOptions = ['Hepsi', ...new Set(projects.map(p => p.status))];

  useEffect(() => {
    function handleClickOutside(event) {
      if (columnDropdownRef.current && !columnDropdownRef.current.contains(event.target)) {
        setIsColumnDropdownOpen(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      if (user && user.company_id) {
        // Müteahhitleri (Site Engineers) Çekme
        try {
          const usersData = await api.get('/users');
          // Giriş yapan kullanıcının şirketindeki SITE_ENGINEER rolündekileri filtrele
          const engineers = (usersData || []).filter(u =>
            String(u.company_id) === String(user.company_id) &&
            u.role === 'SITE_ENGINEER'
          );
          setSiteEngineers(engineers);
        } catch (uErr) {
          console.error("Kullanıcılar çekilemedi:", uErr);
        }

        const data = await api.get('/projects');
        const filteredData = (data || []).filter(p => String(p.contractor_id) === String(user.company_id));

        const mappedProjects = filteredData.map(p => {
          let mappedStatus = 'Devam Ediyor';
          const rawStatus = String(p.status || '').toUpperCase();

          if (rawStatus === 'IN_PROGRESS' || p.status === 'Devam Ediyor') {
            mappedStatus = 'Devam Ediyor';
          } else if (rawStatus === 'PLANNING' || p.status === 'Planlanıyor') {
            mappedStatus = 'Planlanıyor';
          } else if (rawStatus === 'COMPLETED' || p.status === 'Tamamlandı') {
            mappedStatus = 'Tamamlandı';
          } else if (rawStatus === 'DELAYED' || p.status === 'Gecikmede') {
            mappedStatus = 'Gecikmede';
          } else if (rawStatus === 'FINISHING' || p.status === 'Bitiyor') {
            mappedStatus = 'Bitiyor';
          }

          return {
            id: p.id,
            company: p.name || p.project_name || p.title || 'İsimsiz Proje',
            unit: p.unit_count ?? p.total_units ?? 0,
            address: p.address || p.location || '',
            status: mappedStatus,
            progress: mappedStatus === 'Tamamlandı' ? 100
              : (p.progress !== undefined && p.progress !== null
                ? p.progress
                : (mappedStatus === 'Planlanıyor' ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 50) + 30)),
            created_at: p.created_at || 'Belirtilmedi',
            created_by: p.creator_name && p.creator_name !== 'Admin' ? p.creator_name : (p.users?.email ? p.users.email.split('@')[0] : 'Sistem Yöneticisi'),
            description: p.description || '',
            startDate: (() => {
              const raw = p.start_date || p.start || p.created_at;
              if (!raw || raw === '-') return '';
              if (raw.includes('.')) {
                const parts = raw.split('.');
                if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
              }
              return raw.split('T')[0];
            })(),
            endDate: (() => {
              const raw = p.end_date || p.end;
              if (!raw || raw === '-') return '';
              if (String(raw).includes('.')) {
                const parts = raw.split('.');
                if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
              }
              return String(raw).split('T')[0];
            })(),
            contractor: p.users?.full_name || p.users?.name || p.creator_name || 'Atanmamış',
            contractor_id: p.created_by?.id || p.created_by || '',
            location_lat: p.location_lat || '',
            location_lng: p.location_lng || '',
            block_count: p.block_count || Math.floor(Math.random() * 5) + 1,
            total_units: p.unit_count ?? p.total_units ?? (Math.floor(Math.random() * 50) + 20),
            sold_count: p.sold_count ?? Math.floor(Math.random() * 15),
            empty_count: p.empty_count ?? Math.floor(Math.random() * 10),
          };
        });
        setProjects(mappedProjects);
      }
    } catch (err) {
      console.error("Projeler sayfası API hatası: ", err);
    } finally {
      setLoading(false);
    }
  };

  // Projeleri API'den Çekme
  useEffect(() => {
    fetchProjects();
  }, [user]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

  const handleSelectProject = (id) => {
    setSelectedProjects(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    const currentProjectIds = filteredProjects.map(p => p.id);
    if (selectedProjects.length === currentProjectIds.length && selectedProjects.every(id => currentProjectIds.includes(id))) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(currentProjectIds);
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`${selectedProjects.length} projeyi silmek istediğinize emin misiniz?`)) {
      try {
        await Promise.all(selectedProjects.map(id => api.delete(`/projects/${id}`)));
        setProjects(prev => prev.filter(p => !selectedProjects.includes(p.id)));
        setSelectedProjects([]);
      } catch (err) {
        console.error("Proje silme hatası:", err);
        alert("Projeler silinirken bir hata oluştu.");
      }
    }
  };

  const toggleColumnVisibility = (key) => {
    setVisibleColumns(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => { setIsAddModalOpen(false); setNewProjectData(initialNewProjectData); };

  const handleNewProjectChange = (e) => {
    const { name, value } = e.target;
    setNewProjectData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewProject = async () => {
    if (!newProjectData.company) { alert('Proje Adı zorunludur.'); return; }
    try {
      const status = newProjectData.status;
      let progress = 0;
      if (status === 'Tamamlandı') progress = 100;
      else if (status === 'Devam Ediyor') progress = 10;
      else if (status === 'Planlanıyor') progress = 0;
      else if (status === 'Gecikmede') progress = 5;

      const createData = {
        name: newProjectData.company,
        address: newProjectData.address,
        status: status === 'Devam Ediyor' ? 'IN_PROGRESS' :
          status === 'Tamamlandı' ? 'COMPLETED' :
            status === 'Planlanıyor' ? 'PLANNING' :
              status === 'Gecikmede' ? 'DELAYED' :
                status === 'Bitiyor' ? 'FINISHING' : 'PLANNING',
        description: newProjectData.description,
        start_date: newProjectData.startDate || null,
        end_date: newProjectData.endDate || null,
        location_lat: newProjectData.location_lat || null,
        location_lng: newProjectData.location_lng || null,
        created_by: newProjectData.contractor_id || user.id,
        contractor_id: user.company_id
      };

      await api.post('/projects', createData);
      await fetchProjects();
      closeAddModal();
    } catch (err) {
      console.error("Proje oluşturma hatası:", err);
      alert("Proje oluşturulurken bir hata oluştu: " + err.message);
    }
  };

  const openEditModal = (project) => { setSelectedProjectForEdit(project); setEditFormData({ ...project }); setIsEditModalOpen(true); };
  const closeEditModal = () => { setIsEditModalOpen(false); setTimeout(() => { setSelectedProjectForEdit(null); setEditFormData(null); }, 300); };
  const handleEditFormChange = (e) => { const { name, value } = e.target; setEditFormData(prev => ({ ...prev, [name]: value })); };
  const handleUpdateProject = async () => {
    if (!editFormData.company) { alert('Proje Adı boş bırakılamaz.'); return; }
    try {
      const status = editFormData.status;

      const updateData = {
        name: editFormData.company,
        address: editFormData.address,
        status: status === 'Devam Ediyor' ? 'IN_PROGRESS' :
          status === 'Tamamlandı' ? 'COMPLETED' :
            status === 'Planlanıyor' ? 'PLANNING' :
              status === 'Gecikmede' ? 'DELAYED' :
                status === 'Bitiyor' ? 'FINISHING' : 'PLANNING',
        description: editFormData.description,
        start_date: (editFormData.startDate && editFormData.startDate !== '') ? editFormData.startDate : null,
        end_date: editFormData.endDate || null,
        location_lat: editFormData.location_lat || null,
        location_lng: editFormData.location_lng || null,
        created_by: editFormData.contractor_id || null
      };

      await api.put(`/projects/${selectedProjectForEdit.id}`, updateData);
      await fetchProjects(); // Backend'den güncel veriyi çekerek senkronize olalım
      closeEditModal();
    } catch (err) {
      console.error("Proje güncelleme hatası:", err);
      alert("Proje güncellenirken bir hata oluştu: " + err.message);
    }
  };

  const toggleFilterDropdown = () => setIsFilterDropdownOpen(prev => !prev);
  const handleFilterChange = (status) => {
    setSelectedStatusFilter(status);
    setIsFilterDropdownOpen(false);
    setSelectedProjects([]);
  };

  const filteredProjects = (selectedStatusFilter === 'Hepsi'
    ? projects
    : projects.filter(proj => proj.status === selectedStatusFilter)
  ).filter(proj => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (proj.company || '').toLowerCase().includes(q) ||
      (proj.address || '').toLowerCase().includes(q) ||
      (proj.contractor || '').toLowerCase().includes(q) ||
      (proj.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans text-slate-800">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={closeMobileMenu} />
      <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
        <Navbar title="Projeler" toggleMobileMenu={toggleMobileMenu} />

        <div className="px-3 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-6">

          {/* ═════════════════ HEADER BANNER ═════════════════ */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1128] via-[#0D1630] to-[#0A1128] rounded-2xl p-5 md:p-8 text-white animate-fade-in shadow-xl shadow-slate-900/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D36A47]/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-slate-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="animate-slide-up">
                <h1 className="text-xl md:text-2xl font-black mb-1.5 tracking-tight uppercase">Proje Yönetimi</h1>
                <p className="text-white/60 text-sm font-medium">{projects.length || 0} aktif proje kayıtlı</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap animate-slide-up" style={{ animationDelay: '100ms' }}>
                {/* Stat Pills */}
                {[
                  { label: 'Devam', count: projects.filter(p => p.status === 'Devam Ediyor').length, color: 'bg-blue-500/20 text-blue-100' },
                  { label: 'Plan', count: projects.filter(p => p.status === 'Planlanıyor').length, color: 'bg-amber-400/20 text-amber-100' },
                  { label: 'Bitti', count: projects.filter(p => p.status === 'Tamamlandı').length, color: 'bg-emerald-400/20 text-emerald-100' },
                  { label: 'Gecikme', count: projects.filter(p => p.status === 'Gecikmede').length, color: 'bg-rose-400/20 text-rose-100' },
                ].filter(s => s.count > 0).map(s => (
                  <span key={s.label} className={`${s.color} backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-xl text-xs font-bold`}>
                    {s.count} {s.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ═════════════════ TOOLBAR ═════════════════ */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:max-w-xs">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Proje ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all shadow-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={toggleFilterDropdown}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm px-3.5 py-2.5 rounded-xl transition-all"
                >
                  <Filter size={14} />
                  {selectedStatusFilter !== 'Hepsi' && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                      {selectedStatusFilter}
                    </span>
                  )}
                </button>
                {isFilterDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-20 animate-scale-in overflow-hidden">
                    <div className="p-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1 pb-2">Duruma Göre Filtrele</p>
                      {allStatusOptions.map(option => (
                        <button
                          key={option}
                          onClick={() => handleFilterChange(option)}
                          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-all ${selectedStatusFilter === option ? 'bg-slate-900 text-white font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          <span>{option}</span>
                          {selectedStatusFilter === option && <CheckCircle size={16} className="text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={columnDropdownRef}>
                <button
                  onClick={() => setIsColumnDropdownOpen(prev => !prev)}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm px-3.5 py-2.5 rounded-xl transition-all"
                >
                  <Columns size={14} />
                </button>
                {isColumnDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-20 animate-scale-in overflow-hidden">
                    <div className="p-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-2 border-b border-slate-50 mb-1">Kart Bilgilerini Özelleştir</p>
                      <div className="space-y-0.5">
                        {optionalColumns.map(col => (
                          <label key={col.key} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer group transition-colors">
                            <div className="flex items-center gap-2.5">
                              <span className={`p-1.5 rounded-md ${visibleColumns.includes(col.key) ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'} group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors`}>
                                {col.icon}
                              </span>
                              <span className={`text-sm ${visibleColumns.includes(col.key) ? 'text-slate-700 font-semibold' : 'text-slate-500 font-medium'}`}>{col.label}</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={visibleColumns.includes(col.key)}
                              onChange={() => toggleColumnVisibility(col.key)}
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={openAddModal} className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#0A1128] hover:bg-slate-800 shadow-lg shadow-slate-900/20 px-5 py-2.5 rounded-xl transition-all">
                <Plus size={16} /> Yeni Proje
              </button>
            </div>
          </div>

          {/* Selection Bar */}
          <div className="space-y-4">
            {selectedProjects.length > 0 && (
              <div className="flex flex-wrap items-center justify-between bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl animate-fade-in">
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <span className="flex items-center justify-center bg-indigo-600 text-white w-7 h-7 rounded-lg text-xs font-bold">{selectedProjects.length}</span>
                  <span className="text-sm font-semibold text-indigo-800">proje seçildi</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={handleSelectAll} className="flex items-center gap-1.5 text-sm font-semibold text-indigo-700 bg-white hover:bg-indigo-100 transition-colors px-3 py-1.5 rounded-lg border border-indigo-200">
                    <CheckSquare size={15} />
                    <span className="hidden sm:inline">{selectedProjects.length === filteredProjects.length ? 'Seçimi Temizle' : 'Tümünü Seç'}</span>
                  </button>
                  <button onClick={handleDeleteSelected} className="flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors">
                    <Trash2 size={15} /> <span>Sil</span>
                  </button>
                </div>
              </div>
            )}

            <div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse shadow-sm">
                      <div className="flex justify-between mb-4">
                        <div className="h-6 bg-slate-100 rounded w-2/3"></div>
                        <div className="h-6 bg-slate-50 rounded-full w-20"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                        <div className="h-4 bg-slate-50 rounded w-5/6"></div>
                        <div className="h-8 bg-slate-100 rounded-xl w-full mt-4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p>{selectedStatusFilter === 'Hepsi' ? 'Gösterilecek proje bulunamadı.' : `"${selectedStatusFilter}" durumunda proje bulunamadı.`}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredProjects.map(proj => (
                    <div
                      key={proj.id}
                      onClick={() => navigate(`/projects/${proj.id}`)}
                      className={`relative group bg-white rounded-xl md:rounded-2xl border transition-all cursor-pointer card-hover overflow-hidden ${selectedProjects.includes(proj.id) ? 'border-[#D36A47] ring-2 ring-[#D36A47]/10 bg-[#D36A47]/5' : 'border-slate-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5'}`}
                    >
                      {/* Top accent line */}
                      <div className={`h-1.5 w-full ${proj.status === 'Devam Ediyor' ? 'bg-blue-500' :
                        proj.status === 'Tamamlandı' ? 'bg-emerald-500' :
                          proj.status === 'Planlanıyor' ? 'bg-amber-500' :
                            proj.status === 'Gecikmede' ? 'bg-rose-500' :
                              'bg-slate-300'
                        }`} />

                      <div className="p-4 md:p-5">
                        {/* Selection Checkbox */}
                        <div className="absolute top-4 md:top-5 right-4 md:right-5 z-10" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedProjects.includes(proj.id)}
                            onChange={() => handleSelectProject(proj.id)}
                            className="w-4 h-4 rounded border-slate-300 text-[#D36A47] focus:ring-[#D36A47] cursor-pointer accent-[#D36A47]"
                          />
                        </div>

                        {/* Header */}
                        <div className="mb-4">
                          <h3 className="text-sm md:text-base font-bold text-slate-800 group-hover:text-[#D36A47] transition-colors line-clamp-1 pr-8" title={proj.company}>
                            {proj.company}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`inline-flex items-center gap-1 border rounded-lg px-2 py-0.5 text-[10px] font-black uppercase ${getStatusClasses(proj.status)}`}>
                              {getStatusIcon(proj.status)} {proj.status}
                            </span>
                          </div>
                        </div>

                        {/* Stats Grid - New Requirement */}
                        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-5">
                          <div className="bg-slate-50 rounded-xl p-2 md:p-2.5 border border-slate-100/60">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Bloklar</p>
                            <div className="flex items-center gap-2">
                              <Building2 size={14} className="text-slate-400" />
                              <span className="text-sm font-bold text-slate-700">{proj.block_count} Blok</span>
                            </div>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Üniteler</p>
                            <div className="flex items-center gap-2">
                              <Home size={14} className="text-slate-400" />
                              <span className="text-sm font-bold text-slate-700">{proj.total_units} Adet</span>
                            </div>
                          </div>
                          <div className="bg-emerald-50/50 rounded-xl p-2.5 border border-emerald-100">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Satılan</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-black text-emerald-700">{proj.sold_count}</span>
                              <div className="flex -space-x-1">
                                {[...Array(3)].map((_, i) => (
                                  <div key={i} className="w-4 h-4 rounded-full bg-emerald-200 border border-white"></div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="bg-amber-50/50 rounded-xl p-2.5 border border-amber-100">
                            <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Boş</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-black text-amber-700">{proj.empty_count}</span>
                              <div className="w-8 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: '40%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Mini Progress Graph - New Requirement */}
                        <div className="mb-4">
                          <div className="flex justify-between items-end mb-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">İlerleme Aşaması</span>
                            <span className="text-[11px] font-black text-slate-900">%{proj.progress || 0}</span>
                          </div>
                          <div className="flex gap-1 h-2">
                            {[1, 2, 3, 4, 5].map((step) => {
                              const stepProgress = (proj.progress || 0) / 20;
                              const isActive = step <= stepProgress;
                              const isPartial = step > stepProgress && step - 1 < stepProgress;

                              return (
                                <div key={step} className="flex-1 rounded-full bg-slate-100 overflow-hidden">
                                  {isActive ? (
                                    <div className={`h-full w-full ${getProgressBarColor(proj.status)}`} />
                                  ) : isPartial ? (
                                    <div className={`h-full ${getProgressBarColor(proj.status)}`} style={{ width: `${((proj.progress % 20) / 20) * 100}%` }} />
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase transition-colors group-hover:text-[#D36A47]">
                            Detayları Gör <ArrowLeft size={10} className="rotate-180" />
                          </span>
                        </div>

                        {/* Action */}
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(proj); }}
                            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                          >
                            <Pencil size={13} /> Düzenle
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <ProjectEditModal
          isOpen={isEditModalOpen}
          projectData={editFormData}
          contractors={siteEngineers}
          onClose={closeEditModal}
          onChange={handleEditFormChange}
          onSave={handleUpdateProject}
        />

        <NewProjectModal
          isOpen={isAddModalOpen}
          formData={newProjectData}
          contractors={siteEngineers}
          onClose={closeAddModal}
          onChange={handleNewProjectChange}
          onAdd={handleAddNewProject}
        />
      </main >
    </div >
  );
}

export default Projects;