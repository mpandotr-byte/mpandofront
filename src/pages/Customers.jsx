import React, { useState, useRef, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import NewCostumerModal from '../modals/customers/NewCostumerModal';
import CustomerEditModal from '../modals/customers/CostumerEditModal';
import { useAuth } from "../context/AuthContext";
import { api } from '../api/client';
import {
  Plus,
  Trash2,
  CheckSquare,
  Pencil,
  Filter,
  CheckCircle,
  Users,
  UserPlus,
  UserX,
  Phone,
  Mail,
  MapPin,
  X,
  ShoppingCart,
  Search
} from 'lucide-react';

const getCompanyNameById = (companyId, companies) => {
  const company = (companies || []).find(c => String(c.id) === String(companyId));
  return company ? company.name : 'Bilinmiyor';
};

const getEmployeeNameById = (employeeId, employees) => {
  const employee = (employees || []).find(e => String(e.id) === String(employeeId));
  return employee ? (employee.full_name || employee.name) : 'Bilinmiyor';
};

const initialNewCustomerData = {
  company_id: '',
  employee_id: '',
  full_name: '',
  identity_number: '',
  phone: '',
  email: '',
  address: '',
  is_deleted: false,
};

const customerFilterOptions = ['Tümü', 'Varolan Kayıtlar', 'Silinmiş Kayıtlar'];

function Customers() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const { user } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState(initialNewCustomerData);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedFilterOption, setSelectedFilterOption] = useState('Varolan Kayıtlar');
  const [loading, setLoading] = useState(true);
  const filterDropdownRef = useRef(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCustomerForDetails, setSelectedCustomerForDetails] = useState(null);
  const [customerSales, setCustomerSales] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user && user.company_id) {
        const [customersData, companiesData, usersData] = await Promise.all([
          api.get('/customers'),
          api.get('/companies'),
          api.get('/users')
        ]);

        const filteredCompanies = (companiesData || []).filter(c => String(c.contractor_id) === String(user.company_id) || String(c.id) === String(user.company_id));
        const filteredEmployees = (usersData || []).filter(u => String(u.company_id) === String(user.company_id));

        setCompanies(filteredCompanies);
        setEmployees(filteredEmployees);

        const mappedCustomers = (customersData || [])
          .filter(c => String(c.contractor_id) === String(user.company_id) || String(c.company_id) === String(user.company_id))
          .map(c => ({
            id: c.id,
            company_id: c.company_id,
            employee_id: c.employee_id,
            company_name: c.companies?.name || getCompanyNameById(c.company_id, filteredCompanies),
            employee_name: c.users?.full_name || c.users?.name || getEmployeeNameById(c.employee_id, filteredEmployees),
            full_name: c.full_name || c.customer_full_name || 'Bilinmiyor',
            identity_number: c.identity_number || '-',
            phone: c.phone || '-',
            email: c.email || '-',
            address: [c.district, c.city, c.address].filter(Boolean).join(', ') || '-',
            created_at: c.created_at ? new Date(c.created_at).toLocaleDateString('tr-TR') : '-',
            is_deleted: !!c.deleted_at || c.is_deleted || false
          }));

        setCustomers(mappedCustomers);
      }
    } catch (error) {
      console.error("Customers data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleSelectCustomer = (id) => {
    setSelectedCustomers(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const filteredCustomers = useMemo(() => {
    switch (selectedFilterOption) {
      case 'Tümü': return customers;
      case 'Varolan Kayıtlar': return customers.filter(c => !c.is_deleted);
      case 'Silinmiş Kayıtlar': return customers.filter(c => c.is_deleted);
      default: return customers.filter(c => !c.is_deleted);
    }
  }, [customers, selectedFilterOption]);

  const handleSelectAll = () => {
    const currentCustomerIds = filteredCustomers.map(c => c.id);
    if (selectedCustomers.length === currentCustomerIds.length && selectedCustomers.every(id => currentCustomerIds.includes(id))) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(currentCustomerIds);
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`${selectedCustomers.length} müşteriyi silinmiş olarak işaretlemek istediğinize emin misiniz?`)) {
      try {
        await Promise.all(selectedCustomers.map(id =>
          api.put(`/customers/${id}`, { is_deleted: true })
        ));
        await fetchData();
        setSelectedCustomers([]);
      } catch (err) {
        console.error("Silme hatası:", err);
        alert("Silme işlemi sırasında hata oluştu.");
      }
    }
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => { setIsAddModalOpen(false); setNewCustomerData(initialNewCustomerData); };

  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    const processedValue = (name === 'company_id' || name === 'employee_id') ? (value ? parseInt(value) : '') : value;
    setNewCustomerData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleAddNewCustomer = async () => {
    if (!newCustomerData.full_name || !newCustomerData.phone) { alert('Müşteri Adı Soyadı ve Telefon alanları zorunludur.'); return; }
    try {
      const createData = {
        ...newCustomerData,
        company_id: user.company_id, // Auto-assign company
        employee_id: user.id, // Auto-assign current user as responsible employee
        contractor_id: user.company_id,
        is_deleted: false
      };
      await api.post('/customers', createData);
      await fetchData();
      closeAddModal();
    } catch (err) {
      console.error("Müşteri ekleme hatası:", err);
      alert("Müşteri eklenirken hata oluştu.");
    }
  };

  const openEditModal = (customer) => { setSelectedCustomerForEdit(customer); setEditFormData({ ...customer }); setIsEditModalOpen(true); };
  const closeEditModal = () => { setIsEditModalOpen(false); setTimeout(() => { setSelectedCustomerForEdit(null); setEditFormData(null); }, 300); };
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    const processedValue = (name === 'company_id' || name === 'employee_id') ? (value ? parseInt(value) : '') : value;
    setEditFormData(prev => ({ ...prev, [name]: processedValue }));
  };
  const handleUpdateCustomer = async () => {
    if (!editFormData.full_name || !editFormData.phone) { alert('Müşteri Adı Soyadı ve Telefon alanları boş bırakılamaz.'); return; }
    try {
      const updateData = {
        company_id: editFormData.company_id, employee_id: editFormData.employee_id,
        full_name: editFormData.full_name, identity_number: editFormData.identity_number,
        phone: editFormData.phone, email: editFormData.email, address: editFormData.address
      };
      await api.put(`/customers/${selectedCustomerForEdit.id}`, updateData);
      await fetchData();
      closeEditModal();
    } catch (err) {
      console.error("Müşteri güncelleme hatası:", err); alert("Güncelleme sırasında hata oluştu.");
    }
  };

  const openDetailsModal = async (customer) => {
    setSelectedCustomerForDetails(customer);
    setIsDetailsModalOpen(true);
    try {
      const salesData = await api.get(`/sales`);
      const filteredSales = (salesData || []).filter(s => String(s.musteri_id) === String(customer.id));
      setCustomerSales(filteredSales);
    } catch (err) {
      console.error("Satışlar yüklenemedi:", err);
    }
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setTimeout(() => {
      setSelectedCustomerForDetails(null);
      setCustomerSales([]);
    }, 300);
  };

  const toggleFilterDropdown = () => setIsFilterDropdownOpen(prev => !prev);
  const handleFilterChange = (option) => { setSelectedFilterOption(option); setIsFilterDropdownOpen(false); setSelectedCustomers([]); };

  // Stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => !c.is_deleted).length;
  const deletedCustomers = customers.filter(c => c.is_deleted).length;

  // DataTable columns
  const tableColumns = [
    {
      key: 'company_name',
      label: 'Şirket',
      render: (val) => <span className="font-semibold text-slate-700">{val}</span>
    },
    {
      key: 'employee_name',
      label: 'Sorumlu',
      render: (val) => <span className="text-slate-600">{val}</span>
    },
    {
      key: 'full_name',
      label: 'Müşteri',
      render: (val, row) => (
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => openDetailsModal(row)}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0A1128] to-[#1E293B] flex items-center justify-center text-white text-xs font-black shadow-lg shadow-black/10 group-hover:scale-110 transition-transform">
            {val?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-[13px] group-hover:text-indigo-600 transition-colors">{val}</p>
            {row.email !== '-' && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Mail size={10} />{row.email}
              </p>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Telefon',
      render: (val) => (
        <span className="flex items-center gap-1.5 text-slate-600 text-[13px]">
          <Phone size={13} className="text-slate-400" />
          {val}
        </span>
      )
    },
    {
      key: 'identity_number',
      label: 'Kimlik No',
      render: (val) => <span className="text-slate-500 text-[12px] font-mono">{val}</span>
    },
    {
      key: 'created_at',
      label: 'Kayıt Tarihi',
      render: (val) => <span className="text-slate-500 text-[12px]">{val}</span>
    },
    {
      key: 'actions',
      label: 'İşlemler',
      sortable: false,
      align: 'center',
      stopPropagation: true,
      render: (_, row) => (
        <button
          onClick={() => openEditModal(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-slate-600 bg-white border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-lg transition-all shadow-sm"
        >
          <Pencil size={13} /> Düzenle
        </button>
      )
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans text-slate-800">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={closeMobileMenu} />
      <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
        <Navbar title="Müşteriler" toggleMobileMenu={toggleMobileMenu} />

        <div className="px-3 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-6">

          {/* ═════════════════ HEADER BANNER ═════════════════ */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1128] via-[#0D1630] to-[#0A1128] rounded-2xl p-5 md:p-8 text-white animate-fade-in shadow-xl shadow-slate-900/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D36A47]/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-slate-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="animate-slide-up">
                <h1 className="text-xl md:text-2xl font-black mb-1.5 tracking-tight uppercase">Müşteri Portföyü</h1>
                <p className="text-white/60 text-sm font-medium">{customers.length || 0} aktif müşteri kaydı</p>
              </div>
              <div className="flex items-center gap-2 md:gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 md:py-3 rounded-2xl border border-white/10 shadow-lg min-w-[80px] md:min-w-[100px] text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#D36A47] mb-0.5">Aktif</p>
                  <p className="text-lg md:text-xl font-black leading-none">{activeCustomers}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 md:py-3 rounded-2xl border border-white/10 shadow-lg min-w-[80px] md:min-w-[100px] text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5">Toplam</p>
                  <p className="text-lg md:text-xl font-black leading-none">{totalCustomers}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-800">Müşteri Listesi</h2>
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter */}
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={toggleFilterDropdown}
                  className="flex items-center gap-1.5 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm px-4 py-2.5 rounded-xl transition-all"
                >
                  <Filter size={14} />
                  {selectedFilterOption !== 'Tümü' && (
                    <span className="ml-1 px-2.5 py-0.5 rounded-full bg-[#D36A47]/10 text-[#D36A47] text-[10px] font-black uppercase">
                      {selectedFilterOption}
                    </span>
                  )}
                </button>
                {isFilterDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-20 animate-scale-in overflow-hidden">
                    <div className="p-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1 pb-2">Duruma Göre Filtrele</p>
                      {customerFilterOptions.map(option => (
                        <button
                          key={option}
                          onClick={() => handleFilterChange(option)}
                          className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm transition-all ${selectedFilterOption === option ? 'bg-slate-900 text-white font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          <span>{option}</span>
                          {selectedFilterOption === option && <CheckCircle size={16} className="text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={openAddModal} className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#0A1128] hover:bg-[#1E293B] shadow-lg shadow-[#0A1128]/20 px-5 py-2.5 rounded-xl transition-all">
                <Plus size={16} /> <span className="hidden sm:inline">Yeni Müşteri Ekle</span><span className="sm:hidden">Yeni Ekle</span>
              </button>
            </div>
          </div>

          {/* Selection Action Bar */}
          {selectedCustomers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#D36A47]/5 border border-[#D36A47]/20 p-4 rounded-xl animate-fade-in gap-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center bg-[#D36A47] text-white w-7 h-7 rounded-lg text-xs font-bold shadow-lg shadow-[#D36A47]/30">
                  {selectedCustomers.length}
                </span>
                <span className="text-sm font-bold text-[#D36A47]">müşteri seçildi</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button onClick={handleSelectAll} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-all px-4 py-2 rounded-lg border border-slate-200">
                  <CheckSquare size={14} />
                  <span>{selectedCustomers.length === filteredCustomers.length ? 'Seçimi Temizle' : 'Tümünü Seç'}</span>
                </button>
                <button onClick={handleDeleteSelected} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 px-4 py-2 rounded-lg border border-red-100 transition-all">
                  <UserX size={14} /> <span>Silinmiş Yap</span>
                </button>
              </div>
            </div>
          )}

          {/* DataTable */}
          <DataTable
            columns={tableColumns}
            data={filteredCustomers}
            loading={loading}
            selectable={true}
            selectedRows={selectedCustomers}
            onSelect={handleSelectCustomer}
            rowKey="id"
            searchPlaceholder="Müşteri ara... (isim, telefon, e-posta)"
            pageSize={10}
            emptyMessage={selectedFilterOption === 'Tümü' ? 'Gösterilecek müşteri bulunamadı.' : `"${selectedFilterOption}" kayıtlarda müşteri bulunamadı.`}
            rowClassName={(row) => row.is_deleted ? 'opacity-50' : ''}
          />
        </div>

        <CustomerEditModal
          isOpen={isEditModalOpen}
          customerData={editFormData}
          onClose={closeEditModal}
          onChange={handleEditFormChange}
          onSave={handleUpdateCustomer}
          companies={companies}
          employees={employees}
        />

        <NewCostumerModal
          isOpen={isAddModalOpen}
          onClose={closeAddModal}
          newCustomerData={newCustomerData}
          onChange={handleNewCustomerChange}
          onAdd={handleAddNewCustomer}
          companies={companies}
          employees={employees}
        />

        {/* --- Customer Details Modal --- */}
        {isDetailsModalOpen && selectedCustomerForDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
              <div className="relative p-6 md:p-8 bg-gradient-to-br from-[#0A1128] to-[#1E293B] text-white">
                <button onClick={closeDetailsModal} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <X size={20} />
                </button>
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl font-black border border-white/20 shadow-inner">
                    {selectedCustomerForDetails.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight">{selectedCustomerForDetails.full_name}</h2>
                    <div className="flex flex-wrap gap-4 mt-2 text-white/70 text-sm font-medium">
                      <span className="flex items-center gap-1.5"><Phone size={14} className="text-[#D36A47]" /> {selectedCustomerForDetails.phone}</span>
                      <span className="flex items-center gap-1.5"><Mail size={14} className="text-[#D36A47]" /> {selectedCustomerForDetails.email}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#D36A47]" /> {selectedCustomerForDetails.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Purchase History */}
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <ShoppingCart size={16} className="text-indigo-500" /> Satın Alma Geçmişi
                    </h3>
                    <div className="space-y-3">
                      {customerSales.length > 0 ? customerSales.map((sale, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{sale.projects?.name || 'Proje'}</p>
                              <p className="text-xs text-slate-500 font-medium">{sale.interested_product || 'Ünite Detayı'}</p>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${sale.sale_status === 'Satıldı' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                              {sale.sale_status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                            <span className="text-xs font-bold text-slate-400">{new Date(sale.created_at).toLocaleDateString('tr-TR')}</span>
                            <span className="text-sm font-black text-slate-800">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(sale.offered_price || 0)}</span>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 border-dashed">
                          <p className="text-xs font-bold text-slate-400 uppercase">Kayıt Bulunmuyor</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Activity & Performance */}
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-500" /> Müşteri Etkileşimi
                    </h3>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-600">Toplam Teklif</span>
                        <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">{customerSales.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-600">Kazanılan Satış</span>
                        <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">{customerSales.filter(s => s.sale_status === 'Satıldı').length}</span>
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Müşteri Puanı</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 w-[85%]" />
                          </div>
                          <span className="text-xs font-black text-slate-700">%85</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={closeDetailsModal} className="px-6 py-2.5 bg-[#0A1128] text-white rounded-xl text-xs font-black shadow-lg shadow-[#0A1128]/20 hover:scale-105 transition-transform uppercase tracking-wider">Kapat</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Customers;