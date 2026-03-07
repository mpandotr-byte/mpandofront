import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import SaleEditModal from '../../modals/sales/SaleEditModal';
import NewSaleModal from '../../modals/NewSaleModal';
import SaleDetailsModal from '../../modals/sales/SaleDetailsModal';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  Plus,
  Trash2,
  CheckSquare,
  Pencil,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  Building2,
  Banknote,
  FileText,
  Eye,
  Download,
  TrendingUp,
  ShoppingCart,
  DollarSign
} from 'lucide-react';

const getStatusClasses = (status) => {
  switch (status) {
    case 'Satıldı': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Rezerv': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Barter': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Arsa Sahibi': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Beklemede': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'İptal':
    case 'Reddedildi': return 'bg-red-50 text-red-600 border-red-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Satıldı': return <CheckCircle2 size={13} />;
    case 'Rezerv': return <Clock size={13} />;
    case 'Barter': return <Banknote size={13} />;
    case 'Arsa Sahibi': return <Building2 size={13} />;
    case 'Beklemede': return <Clock size={13} />;
    case 'İptal':
    case 'Reddedildi': return <XCircle size={13} />;
    default: return null;
  }
};

const initialNewSaleData = {
  proje_id: '', musteri_id: '', unit_id: '', interested_product: '',
  sale_status: 'Beklemede', budget_range: '', notes: '', offered_price: '', sale_date: '', contract_no: '',
  source: 'Seçiniz', current_meeting_status: 'Yeni', discount_requested: 'Hayır', discount_amount: 0, approval_status: 'Beklemede', contract_file: null
};

const allStatusOptions = ['Hepsi', 'Satıldı', 'Rezerv', 'Barter', 'Arsa Sahibi', 'Beklemede', 'İptal', 'Reddedildi'];

function Sales() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSales, setSelectedSales] = useState([]);
  const { user } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSaleData, setNewSaleData] = useState(initialNewSaleData);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSaleForEdit, setSelectedSaleForEdit] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSaleForDetails, setSelectedSaleForDetails] = useState(null);

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Hepsi');
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const [salesData, customersData, projectsData] = await Promise.all([
        api.get('/sales'),
        api.get('/customers').catch(() => []),
        api.get('/projects').catch(() => [])
      ]);
      setSales(Array.isArray(salesData) ? salesData : []);
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (err) {
      console.error('Veriler yüklenirken hata oluştu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchSales(); }, [user]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

  const handleSelectSale = (id) => {
    setSelectedSales(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const filteredSales = selectedStatusFilter === 'Hepsi'
    ? sales
    : sales.filter(sale => sale.sale_status === selectedStatusFilter);

  const handleSelectAll = () => {
    const currentSalesIds = filteredSales.map(s => s.id);
    if (selectedSales.length === currentSalesIds.length && selectedSales.every(id => currentSalesIds.includes(id))) {
      setSelectedSales([]);
    } else {
      setSelectedSales(currentSalesIds);
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`${selectedSales.length} satış kaydını silmek istediğinize emin misiniz?`)) {
      try {
        await Promise.all(selectedSales.map(id => api.delete(`/sales/${id}`)));
        setSales(prev => prev.filter(s => !selectedSales.includes(s.id)));
        setSelectedSales([]);
      } catch (err) {
        console.error('Silme işleminde hata oluştu:', err);
        alert('Bazı kayıtlar silinemedi.');
      }
    }
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => { setIsAddModalOpen(false); setNewSaleData(initialNewSaleData); };

  const handleNewSaleChange = (e) => {
    if (e.target) {
      const { name, value, files } = e.target;
      setNewSaleData(prev => ({ ...prev, [name]: files ? files[0] : value }));
    } else {
      setNewSaleData(prev => ({ ...prev, ...e }));
    }
  };

  const handleAddNewSale = async () => {
    if (!newSaleData.musteri_id || !newSaleData.proje_id) { alert('Müşteri ve Proje alanları zorunludur.'); return; }
    try {
      const dataToSend = {
        ...newSaleData,
        project_id: Number(newSaleData.proje_id),
        customer_id: Number(newSaleData.musteri_id),
        unit_id: newSaleData.unit_id ? Number(newSaleData.unit_id) : null,
        offered_price: newSaleData.offered_price ? Number(newSaleData.offered_price) : 0,
        company_id: user.company_id,
        employee_id: user.id
      };

      // Remove the old names before sending
      delete dataToSend.proje_id;
      delete dataToSend.musteri_id;

      let addedSale;
      if (newSaleData.contract_file) {
        const formData = new FormData();
        Object.keys(dataToSend).forEach(key => {
          if (dataToSend[key] !== null && dataToSend[key] !== undefined) {
            formData.append(key, dataToSend[key]);
          }
        });
        addedSale = await api.upload('/sales', formData);
      } else {
        addedSale = await api.post('/sales', dataToSend);
      }

      if (addedSale) {
        setSales([addedSale, ...sales]);
        closeAddModal();
        fetchSales();
      }
    } catch (err) {
      console.error('Yeni satış eklenirken hata:', err);
      alert('Satış eklenemedi.');
    }
  };

  const openEditModal = (sale) => { setSelectedSaleForEdit(sale); setEditFormData({ ...sale }); setIsEditModalOpen(true); };
  const closeEditModal = () => { setIsEditModalOpen(false); setTimeout(() => { setSelectedSaleForEdit(null); setEditFormData(null); }, 300); };

  const handleEditFormChange = (e) => {
    if (e.target) {
      const { name, value, files } = e.target;
      setEditFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
    } else {
      setEditFormData(prev => ({ ...prev, ...e }));
    }
  };

  const handleUpdateSale = async () => {
    if (!editFormData.musteri_id || !editFormData.id) { alert('Hatalı veri gönderimi.'); return; }
    try {
      const dataToSend = {
        ...editFormData,
        project_id: Number(editFormData.proje_id),
        customer_id: Number(editFormData.musteri_id),
        unit_id: editFormData.unit_id ? Number(editFormData.unit_id) : null,
        offered_price: editFormData.offered_price ? Number(editFormData.offered_price) : 0
      };

      delete dataToSend.proje_id;
      delete dataToSend.musteri_id;

      if (editFormData.contract_file) {
        const formData = new FormData();
        Object.keys(dataToSend).forEach(key => {
          if (dataToSend[key] !== null && dataToSend[key] !== undefined) {
            formData.append(key, dataToSend[key]);
          }
        });
        await api.put(`/sales/${selectedSaleForEdit.id}`, formData);
      } else {
        await api.put(`/sales/${selectedSaleForEdit.id}`, dataToSend);
      }
      closeEditModal();
      fetchSales();
    } catch (err) {
      console.error('Güncelleme sırasında hata:', err);
      alert('Güncellenemedi.');
    }
  };

  const openDetailsModal = (sale) => { setSelectedSaleForDetails(sale); setIsDetailsModalOpen(true); };
  const closeDetailsModal = () => { setIsDetailsModalOpen(false); setTimeout(() => setSelectedSaleForDetails(null), 300); };

  const toggleFilterDropdown = () => setIsFilterDropdownOpen(prev => !prev);
  const handleFilterChange = (status) => { setSelectedStatusFilter(status); setIsFilterDropdownOpen(false); setSelectedSales([]); };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === '') return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  // Stats
  const soldCount = sales.filter(s => s.sale_status === 'Satıldı').length;
  const pendingCount = sales.filter(s => s.sale_status === 'Beklemede').length;

  // DataTable columns
  const tableColumns = [
    {
      key: 'customer_name',
      label: 'Müşteri',
      render: (_, row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-slate-800 text-[13px]">{row.customers?.full_name || '-'}</span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Phone size={11} /> {row.customers?.phone || '-'}
          </span>
        </div>
      )
    },
    {
      key: 'project_name',
      label: 'Proje / Daire',
      render: (_, row) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-slate-700 flex items-center gap-1.5 text-[13px]">
            <Building2 size={13} className="text-indigo-500" /> {row.projects?.name || '-'}
          </span>
          {row.interested_product && (
            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block w-max font-medium">
              {row.interested_product}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'sale_status',
      label: 'Durum',
      render: (val) => (
        <span className={`inline-flex items-center gap-1 border rounded-full text-[11px] font-bold px-2.5 py-1 ${getStatusClasses(val)}`}>
          {getStatusIcon(val)} {val || '-'}
        </span>
      )
    },
    {
      key: 'budget_range',
      label: 'Bütçe',
      render: (val) => (
        <span className="flex items-center gap-1.5 text-slate-600 font-medium bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg text-[11px] w-max">
          <Banknote size={13} className="text-emerald-500" /> {val || '-'}
        </span>
      )
    },
    {
      header: "Liste Fiyatı",
      key: "list_price",
      render: (val) => val ? (
        <span className="font-semibold text-slate-500">
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val)}
        </span>
      ) : '-'
    },
    {
      header: "Verilen Fiyat",
      key: "offered_price",
      render: (val) => val ? (
        <span className="font-bold text-blue-600">
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val)}
        </span>
      ) : '-'
    },
    {
      header: "Müşteri Teklifi",
      key: "customer_offer",
      render: (val) => val ? (
        <span className="font-bold text-orange-600">
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val)}
        </span>
      ) : '-'
    },
    {
      key: 'notes',
      label: 'Notlar',
      render: (val) => (
        <span className="text-slate-500 text-[12px] max-w-[180px] truncate block" title={val}>
          {val || '-'}
        </span>
      )
    },
    {
      key: 'contract_no',
      label: 'Sözleşme',
      render: (_, row) => (
        <div className="flex items-center gap-2 text-[12px]">
          <span className="text-slate-500">{row.contract_no || row.units?.contract_no || '-'}</span>
          {(row.contract_file || row.units?.contract_file) && (
            <div className="flex items-center gap-1">
              <a href={row.contract_file || row.units?.contract_file} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()} className="p-1 text-indigo-500 hover:bg-indigo-50 rounded transition-all" title="Görüntüle">
                <Eye size={13} />
              </a>
              <a href={row.contract_file || row.units?.contract_file} download
                onClick={(e) => e.stopPropagation()} className="p-1 text-slate-400 hover:bg-slate-50 rounded transition-all" title="İndir">
                <Download size={13} />
              </a>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'İşlemler',
      sortable: false,
      align: 'center',
      stopPropagation: true,
      render: (_, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); openEditModal(row); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-slate-600 bg-white border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-lg transition-all shadow-sm"
        >
          <Pencil size={13} /> Düzenle
        </button>
      )
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans text-slate-800">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
      <main className="flex-1 overflow-y-auto h-screen pt-16 md:pt-0 relative">
        <Navbar title="Satışlar" toggleMobileMenu={toggleMobileMenu} />

        <div className="px-4 sm:px-6 md:px-8 pb-12 pt-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Toplam Satış</p>
                  <p className="text-2xl font-bold text-slate-800">{sales.length}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <ShoppingCart size={22} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tamamlanan</p>
                  <p className="text-2xl font-bold text-emerald-600">{soldCount}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <TrendingUp size={22} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Beklemede</p>
                  <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Clock size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-800">Satış Kayıtları</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={toggleFilterDropdown}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm px-3.5 py-2 rounded-xl transition-all"
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
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all ${selectedStatusFilter === option ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          <span>{option}</span>
                          {selectedStatusFilter === option && <CheckCircle2 size={16} className="text-indigo-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={openAddModal} className="btn-primary">
                <Plus size={15} /> Yeni Satış
              </button>
            </div>
          </div>

          {/* Selection */}
          {selectedSales.length > 0 && (
            <div className="flex flex-wrap items-center justify-between bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl animate-fade-in">
              <div className="flex items-center gap-3 mb-2 sm:mb-0">
                <span className="flex items-center justify-center bg-indigo-600 text-white w-7 h-7 rounded-lg text-xs font-bold">{selectedSales.length}</span>
                <span className="text-sm font-semibold text-indigo-800">kayıt seçildi</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={handleSelectAll} className="flex items-center gap-1.5 text-sm font-semibold text-indigo-700 bg-white hover:bg-indigo-100 transition-colors px-3 py-1.5 rounded-lg border border-indigo-200">
                  <CheckSquare size={15} />
                  <span className="hidden sm:inline">{selectedSales.length === filteredSales.length ? 'Seçimi Temizle' : 'Tümünü Seç'}</span>
                </button>
                <button onClick={handleDeleteSelected} className="flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors">
                  <Trash2 size={15} /> Sil
                </button>
              </div>
            </div>
          )}

          {/* DataTable */}
          <DataTable
            columns={tableColumns}
            data={filteredSales}
            loading={loading}
            onRowClick={openDetailsModal}
            selectable={true}
            selectedRows={selectedSales}
            onSelect={handleSelectSale}
            rowKey="id"
            searchPlaceholder="Satış kayıtlarında ara..."
            pageSize={10}
            emptyMessage={selectedStatusFilter === 'Hepsi' ? 'Gösterilecek satış kaydı bulunamadı.' : `"${selectedStatusFilter}" durumunda kayıt bulunamadı.`}
          />
        </div>

        <SaleDetailsModal isOpen={isDetailsModalOpen} data={selectedSaleForDetails} onClose={closeDetailsModal} onEdit={openEditModal} />
        <SaleEditModal isOpen={isEditModalOpen} saleData={editFormData} onClose={closeEditModal} onChange={handleEditFormChange} onSave={handleUpdateSale}
          customers={customers.filter(c => String(c.company_id) === String(user?.company_id))}
          projects={projects.filter(p => String(p.contractor_id) === String(user?.company_id))} />
        <NewSaleModal isOpen={isAddModalOpen} formData={newSaleData} onClose={closeAddModal} onChange={handleNewSaleChange} onAdd={handleAddNewSale}
          customers={customers.filter(c => String(c.company_id) === String(user?.company_id))}
          projects={projects.filter(p => String(p.contractor_id) === String(user?.company_id))} />
      </main>
    </div>
  );
}

export default Sales;
