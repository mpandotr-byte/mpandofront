import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import { useAuth } from '../../context/AuthContext';
import NewSecondHandModal from '../../modals/secondhand/NewSecondHandModal';
import SecondHandEditModal from '../../modals/secondhand/SecondHandEditModal';
import SecondHandDetailsModal from '../../modals/secondhand/SecondHandDetailsModal';

import {
  Plus,
  Trash2,
  CheckSquare,
  Pencil,
  Filter,
  CheckCircle2,
  XCircle,
  Phone,
  Building2,
  Home,
  MapPin,
  User,
  Tag,
  House,
  LayoutList,
  ToggleLeft
} from 'lucide-react';

const getStatusClasses = (status) => {
  switch (status) {
    case 'Aktif': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Pasif': return 'bg-red-50 text-red-600 border-red-200';
    case 'Satıldı/Kiralandı': return 'bg-slate-100 text-slate-600 border-slate-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Aktif': return <CheckCircle2 size={13} />;
    case 'Pasif': return <XCircle size={13} />;
    case 'Satıldı/Kiralandı': return <Tag size={13} />;
    default: return null;
  }
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'Daire': return <Building2 size={13} className="text-blue-500" />;
    case 'Villa': return <Home size={13} className="text-purple-500" />;
    case 'Arsa': return <MapPin size={13} className="text-emerald-500" />;
    default: return <Tag size={13} className="text-slate-500" />;
  }
};

const initialListings = [
  {
    id: 1, projectName: 'Güneş Sitesi 3. Etap', location: 'Kadıköy, İstanbul',
    agentName: 'Canan Yılmaz', block: 'C Blok', flat: 'No: 4',
    ownerName: 'Ali Vural', ownerPhone: '+90 532 111 22 33',
    status: 'Aktif', type: 'Daire', price: '5.250.000₺', createdAt: '01.03.2024',
    notes: 'Krediye uygun, hemen taşınılabilir.'
  },
  {
    id: 2, projectName: 'Deniz Manzaralı Müstakil', location: 'Bodrum, Muğla',
    agentName: 'Burak Demir', block: '-', flat: 'No: 12',
    ownerName: 'Ayşe Kaya', ownerPhone: '+90 555 444 55 66',
    status: 'Pasif', type: 'Villa', price: '18.000.000₺', createdAt: '15.02.2024',
    notes: 'Tadilat masrafı fiyattan düşülecek.'
  },
  {
    id: 3, projectName: 'Merkezde Ticari İmarlı', location: 'Çankaya, Ankara',
    agentName: 'Mehmet Öztürk', block: 'Ada 101', flat: 'Parsel 5',
    ownerName: 'Şirket Envanteri', ownerPhone: '-',
    status: 'Pasif', type: 'Arsa', price: '9.500.000₺', createdAt: '10.01.2024'
  },
];

const allStatusOptions = ['Hepsi', 'Aktif', 'Pasif', 'Satıldı/Kiralandı'];

function SecondHandListings() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [listings, setListings] = useState(initialListings);
  const [selectedListings, setSelectedListings] = useState([]);
  const { user } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedListingForEdit, setSelectedListingForEdit] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedListingForDetails, setSelectedListingForDetails] = useState(null);

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

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

  const handleAddListing = (formData) => {
    const newListing = { id: Date.now(), createdAt: new Date().toLocaleDateString('tr-TR'), ...formData };
    setListings([newListing, ...listings]);
    setIsAddModalOpen(false);
  };

  const handleUpdateListing = (updatedData) => {
    setListings((prev) => prev.map((item) => item.id === updatedData.id ? { ...item, ...updatedData } : item));
    setIsEditModalOpen(false);
    setSelectedListingForEdit(null);
    if (selectedListingForDetails && selectedListingForDetails.id === updatedData.id) {
      setSelectedListingForDetails(updatedData);
    }
  };

  const handleSelectListing = (id) => {
    setSelectedListings(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const filteredListings = selectedStatusFilter === 'Hepsi'
    ? listings
    : listings.filter(listing => listing.status === selectedStatusFilter);

  const handleSelectAll = () => {
    const currentIds = filteredListings.map(s => s.id);
    if (selectedListings.length === currentIds.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(currentIds);
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`${selectedListings.length} ilanı silmek istediğinize emin misiniz?`)) {
      setListings(prev => prev.filter(s => !selectedListings.includes(s.id)));
      setSelectedListings([]);
    }
  };

  const toggleFilterDropdown = () => setIsFilterDropdownOpen(prev => !prev);
  const handleFilterChange = (status) => { setSelectedStatusFilter(status); setIsFilterDropdownOpen(false); setSelectedListings([]); };

  const openAddModal = () => setIsAddModalOpen(true);
  const openEditModal = (listing) => { setSelectedListingForEdit(listing); setIsEditModalOpen(true); };
  const openDetailsModal = (listing) => { setSelectedListingForDetails(listing); setIsDetailsModalOpen(true); };

  // Stats
  const activeCount = listings.filter(l => l.status === 'Aktif').length;
  const passiveCount = listings.filter(l => l.status === 'Pasif').length;

  // DataTable columns
  const tableColumns = [
    {
      key: 'projectName',
      label: 'Proje',
      render: (val, row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-slate-800 text-[13px] group-hover:text-indigo-600 transition-colors">{val}</span>
          <span className="text-[11px] text-slate-400">İlan No: #{1000 + row.id}</span>
        </div>
      )
    },
    {
      key: 'agentName',
      label: 'Ekleyen',
      render: (val) => (
        <span className="flex items-center gap-1.5 text-slate-700 text-[13px]">
          <User size={13} className="text-slate-400" /> {val}
        </span>
      )
    },
    {
      key: 'block',
      label: 'Blok / No',
      render: (_, row) => (
        <span className="text-[12px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg inline-block w-max border border-slate-200 font-medium">
          {row.block} / {row.flat}
        </span>
      )
    },
    {
      key: 'ownerName',
      label: 'Ev Sahibi',
      render: (val, row) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-700 font-medium text-[13px]">{val}</span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Phone size={11} /> {row.ownerPhone}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Durum',
      render: (val) => (
        <span className={`inline-flex items-center gap-1 border rounded-full text-[11px] font-bold px-2.5 py-1 ${getStatusClasses(val)}`}>
          {getStatusIcon(val)} {val}
        </span>
      )
    },
    {
      key: 'type',
      label: 'Tip',
      render: (val) => (
        <span className="flex items-center gap-1.5 text-slate-600 font-medium text-[13px]">
          {getTypeIcon(val)} {val}
        </span>
      )
    },
    {
      key: 'price',
      label: 'Fiyat',
      render: (val) => <span className="font-bold text-slate-800 text-[13px]">{val || '-'}</span>
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
        <Navbar title="2. El İlanlar" toggleMobileMenu={toggleMobileMenu} />

        <div className="px-4 sm:px-6 md:px-8 pb-12 pt-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Toplam İlan</p>
                  <p className="text-2xl font-bold text-slate-800">{listings.length}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <LayoutList size={22} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Aktif İlan</p>
                  <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Pasif İlan</p>
                  <p className="text-2xl font-bold text-red-500">{passiveCount}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                  <ToggleLeft size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-800">2. El İlan Listesi</h2>
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
                <Plus size={15} /> İlan Ekle
              </button>
            </div>
          </div>

          {/* Selection */}
          {selectedListings.length > 0 && (
            <div className="flex flex-wrap items-center justify-between bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl animate-fade-in">
              <div className="flex items-center gap-3 mb-2 sm:mb-0">
                <span className="flex items-center justify-center bg-indigo-600 text-white w-7 h-7 rounded-lg text-xs font-bold">{selectedListings.length}</span>
                <span className="text-sm font-semibold text-indigo-800">ilan seçildi</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={handleSelectAll} className="flex items-center gap-1.5 text-sm font-semibold text-indigo-700 bg-white hover:bg-indigo-100 transition-colors px-3 py-1.5 rounded-lg border border-indigo-200">
                  <CheckSquare size={15} />
                  <span className="hidden sm:inline">{selectedListings.length === filteredListings.length ? 'Seçimi Temizle' : 'Tümünü Seç'}</span>
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
            data={filteredListings}
            loading={false}
            onRowClick={openDetailsModal}
            selectable={true}
            selectedRows={selectedListings}
            onSelect={handleSelectListing}
            rowKey="id"
            searchPlaceholder="İlanlarda ara..."
            pageSize={10}
            emptyMessage="Kayıt bulunamadı."
          />
        </div>

        <NewSecondHandModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddListing} />
        <SecondHandEditModal isOpen={isEditModalOpen} data={selectedListingForEdit} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdateListing} />
        <SecondHandDetailsModal
          isOpen={isDetailsModalOpen}
          data={selectedListingForDetails}
          onClose={() => setIsDetailsModalOpen(false)}
          onEdit={(listing) => { setIsDetailsModalOpen(false); openEditModal(listing); }}
        />
      </main>
    </div>
  );
}

export default SecondHandListings;
