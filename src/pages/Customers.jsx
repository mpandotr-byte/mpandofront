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
  MapPin
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
    if (!newCustomerData.company_id || !newCustomerData.employee_id) { alert('Şirket Adı ve Sorumlu Çalışan alanları zorunludur.'); return; }
    try {
      const createData = { ...newCustomerData, contractor_id: user.company_id, is_deleted: false };
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
    if (!editFormData.company_id || !editFormData.employee_id) { alert('Şirket Adı ve Sorumlu Çalışan alanları boş bırakılamaz.'); return; }
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
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {val?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-[13px]">{val}</p>
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
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
      <main className="flex-1 overflow-y-auto h-screen pt-16 md:pt-0 relative">
        <Navbar title="Müşteriler" toggleMobileMenu={toggleMobileMenu} />

        <div className="px-4 sm:px-6 md:px-8 pb-12 pt-6 space-y-6">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Toplam Müşteri</p>
                  <p className="text-2xl font-bold text-slate-800">{totalCustomers}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Users size={22} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Aktif Müşteri</p>
                  <p className="text-2xl font-bold text-emerald-600">{activeCustomers}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <UserPlus size={22} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Silinmiş Kayıt</p>
                  <p className="text-2xl font-bold text-red-500">{deletedCustomers}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                  <UserX size={22} />
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
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm px-3.5 py-2 rounded-xl transition-all"
                >
                  <Filter size={14} />
                  {selectedFilterOption !== 'Tümü' && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
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
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all ${selectedFilterOption === option ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          <span>{option}</span>
                          {selectedFilterOption === option && <CheckCircle size={16} className="text-indigo-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={openAddModal} className="btn-primary">
                <Plus size={15} /> Yeni Müşteri
              </button>
            </div>
          </div>

          {/* Selection Action Bar */}
          {selectedCustomers.length > 0 && (
            <div className="flex flex-wrap items-center justify-between bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl animate-fade-in">
              <div className="flex items-center gap-3 mb-2 sm:mb-0">
                <span className="flex items-center justify-center bg-indigo-600 text-white w-7 h-7 rounded-lg text-xs font-bold">
                  {selectedCustomers.length}
                </span>
                <span className="text-sm font-semibold text-indigo-800">müşteri seçildi</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={handleSelectAll} className="flex items-center gap-1.5 text-sm font-semibold text-indigo-700 bg-white hover:bg-indigo-100 transition-colors px-3 py-1.5 rounded-lg border border-indigo-200">
                  <CheckSquare size={15} />
                  <span className="hidden sm:inline">{selectedCustomers.length === filteredCustomers.length ? 'Seçimi Temizle' : 'Tümünü Seç'}</span>
                </button>
                <button onClick={handleDeleteSelected} className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors">
                  <Trash2 size={15} /> <span>Silinmiş Yap</span>
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
      </main>
    </div>
  );
}

export default Customers;