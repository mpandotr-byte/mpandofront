import React, { useState, useRef, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import NewCostumerModal from '../../modals/customers/NewCostumerModal';
import CustomerEditModal from '../../modals/customers/CostumerEditModal';
import { useAuth } from "../../context/AuthContext";
import { api } from '../../api/client';
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
  Search,
  Home
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
  const [customerUnits, setCustomerUnits] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user && user.company_id) {
        const [customersData, companiesData, usersData] = await Promise.all([
          api.get('/customers'),
          api.get('/companies'),
          api.get('/users')
        ]);
        // ... (rest of fetchData logic is fine)

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
      const [salesData, customerDetailData] = await Promise.all([
        api.get('/sales').catch(() => []),
        api.get(`/customers/${customer.id}`).catch(() => null)
      ]);

      const filteredSales = (salesData || []).filter(s => String(s.customer_id) === String(customer.id) || String(s.musteri_id) === String(customer.id));
      setCustomerSales(filteredSales);

      // Sahip olunan mülklerin tespiti — iki kaynaktan birleştir:
      // 1) units tablosunda customer_id doğrudan eşleşen daireler
      // 2) sales_leads tablosundaki satış kayıtları üzerinden
      const ownedUnits = [];
      const addedUnitIds = new Set();

      // Kaynak 1: GET /customers/:id — units ilişkisi (customer_id FK)
      if (customerDetailData?.units && Array.isArray(customerDetailData.units)) {
        customerDetailData.units.forEach(unit => {
          if (!addedUnitIds.has(String(unit.id))) {
            addedUnitIds.add(String(unit.id));
            const floorInfo = unit.floors || {};
            const blockInfo = floorInfo.blocks || {};
            const projectInfo = blockInfo.projects || {};
            ownedUnits.push({
              id: unit.id,
              unit_number: unit.unit_number || `No: ${unit.id}`,
              project_name: projectInfo.name || 'Proje',
              block_name: blockInfo.name || '',
              floor_number: floorInfo.floor_number || '',
              unit_type: unit.unit_type || '',
              facade: unit.facade || '',
              brut_m2: unit.brut_m2,
              net_m2: unit.net_m2,
              manzara: unit.manzara || '',
              sales_status: unit.sales_status || 'Satıldı',
              sale_date: unit.updated_at,
              contract_no: unit.contract_no || '',
              list_price: unit.list_price,
              campaign_price: unit.campaign_price
            });
          }
        });
      }

      // Kaynak 2: sales_leads tablosu — satış kayıtları üzerinden
      filteredSales.forEach(sale => {
        if (sale.sale_status === 'Satıldı' || sale.status === 'Satıldı' || sale.approval_status === 'Onaylandı') {
          const unit = sale.units || sale.unit;
          const uId = sale.unit_id || sale.unite_id || (unit?.id);

          if (uId && !addedUnitIds.has(String(uId))) {
            addedUnitIds.add(String(uId));
            ownedUnits.push({
              id: uId,
              unit_number: unit?.unit_number || unit?.unite_no || sale.interested_product || `No: ${uId}`,
              project_name: sale.projects?.name || 'Bilinmeyen Proje',
              unit_type: unit?.unit_type || unit?.type || '',
              sales_status: sale.sale_status || sale.status || 'Satıldı',
              sale_date: sale.sale_date,
              contract_no: sale.contract_no || unit?.contract_no,
              list_price: unit?.list_price,
              campaign_price: unit?.campaign_price
            });
          }
        }
      });

      setCustomerUnits(ownedUnits);

    } catch (err) {
      console.error("Detaylar yüklenemedi:", err);
    }
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setTimeout(() => {
      setSelectedCustomerForDetails(null);
      setCustomerSales([]);
      setCustomerUnits([]);
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
                <div>
                  {/* Sahip Olunan Gayrimenkuller */}
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Home size={16} className="text-orange-500" /> Sahip Olduğu Gayrimenkuller
                    {customerUnits.length > 0 && (
                      <span className="ml-auto text-xs font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">{customerUnits.length} Adet</span>
                    )}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customerUnits.length > 0 ? customerUnits.map((unit, idx) => {
                      const statusLabel = String(unit.sales_status || '').toUpperCase();
                      const isSold = ['SOLD', 'SATILDI'].includes(statusLabel);
                      const isReserved = ['RESERVED', 'REZERVE', 'REZERV'].includes(statusLabel);
                      const isBarter = statusLabel === 'BARTER';
                      const isLandowner = statusLabel === 'LANDOWNER';
                      const badgeClass = isSold ? 'bg-emerald-50 text-emerald-600' : isReserved ? 'bg-amber-50 text-amber-600' : isBarter ? 'bg-purple-50 text-purple-600' : isLandowner ? 'bg-sky-50 text-sky-600' : 'bg-blue-50 text-blue-600';
                      const badgeText = isSold ? 'TAPULU' : isReserved ? 'REZERVE' : isBarter ? 'BARTER' : isLandowner ? 'ARSA SAHİBİ' : 'ATANMIŞ';

                      return (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                          {/* Proje & Blok Başlığı */}
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-black text-slate-800 text-sm">{unit.project_name}</p>
                              <p className="text-[11px] text-slate-400 font-bold">
                                {unit.block_name ? `Blok ${unit.block_name}` : ''}{unit.floor_number ? ` • ${unit.floor_number}. Kat` : ''}
                              </p>
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase ${badgeClass}`}>
                              {badgeText}
                            </span>
                          </div>

                          {/* Daire Bilgileri */}
                          <div className="bg-slate-50 rounded-xl p-3 mb-3">
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Daire No</p>
                                <p className="text-sm font-black text-slate-700">{unit.unit_number || '-'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Tip</p>
                                <p className="text-sm font-black text-slate-700">{unit.unit_type || '-'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Cephe</p>
                                <p className="text-sm font-black text-slate-700">{unit.facade || '-'}</p>
                              </div>
                            </div>
                            {(unit.brut_m2 || unit.net_m2) && (
                              <div className="grid grid-cols-2 gap-2 text-center mt-2 pt-2 border-t border-slate-200/50">
                                <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase">Brüt m²</p>
                                  <p className="text-sm font-black text-slate-700">{unit.brut_m2 || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase">Net m²</p>
                                  <p className="text-sm font-black text-slate-700">{unit.net_m2 || '-'}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Fiyat Bilgileri */}
                          {(unit.list_price || unit.campaign_price) && (
                            <div className="flex items-center justify-between">
                              {unit.list_price && (
                                <span className="text-xs font-bold text-slate-500">
                                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(unit.list_price)}
                                </span>
                              )}
                              {unit.campaign_price && (
                                <span className="text-xs font-black text-emerald-600">
                                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(unit.campaign_price)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }) : (
                      <div className="col-span-2 text-center py-8 bg-white rounded-2xl border border-slate-100 border-dashed">
                        <Home size={32} className="mx-auto mb-2 text-slate-200" />
                        <p className="text-[10px] font-black text-slate-300 uppercase">Gayrimenkul Kaydı Bulunmuyor</p>
                      </div>
                    )}
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
