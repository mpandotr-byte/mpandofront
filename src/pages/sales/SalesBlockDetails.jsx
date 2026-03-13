import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import SaleDetailsModal from '../../modals/sales/SaleDetailsModal';
import {
  ArrowLeft,
  Building2,
  Home,
  CheckCircle,
  Clock,
  Search,
  Banknote,
  User,
  Plus,
  Eye,
  TrendingUp,
  Compass,
  LayoutGrid,
  List,
  X,
  Percent,
  ChevronDown
} from 'lucide-react';

const formatCurrency = (val) => {
  if (!val) return '-';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);
};

const getUnitStatusDetails = (status) => {
  switch (String(status).toUpperCase()) {
    case 'SOLD':
    case 'SATILDI':
      return { label: 'Satildi', classes: 'bg-rose-50 text-rose-700 border-rose-100', dotColor: 'bg-rose-500' };
    case 'RESERVED':
    case 'REZERVE':
    case 'REZERV':
      return { label: 'Rezerve', classes: 'bg-amber-50 text-amber-700 border-amber-100', dotColor: 'bg-amber-500' };
    case 'BARTER':
      return { label: 'Barter', classes: 'bg-purple-50 text-purple-700 border-purple-100', dotColor: 'bg-purple-500' };
    case 'ARSA SAHIBI':
    case 'ARSA SAHİBİ':
      return { label: 'Arsa Sahibi', classes: 'bg-indigo-50 text-indigo-700 border-indigo-100', dotColor: 'bg-indigo-500' };
    case 'AVAILABLE':
    case 'SATILIK':
    case 'MÜSAİT':
    case 'BOŞ':
    default:
      return { label: 'Satilik', classes: 'bg-emerald-50 text-emerald-700 border-emerald-100', dotColor: 'bg-emerald-500' };
  }
};

function SalesBlockDetails() {
  const { projectId, blockId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [block, setBlock] = useState(null);
  const [project, setProject] = useState(null);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('CARD'); // 'CARD' or 'TABLE'

  const [selectedSaleForDetails, setSelectedSaleForDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Toplu islem
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState({
    type: 'CAMPAIGN', // 'CAMPAIGN' or 'RAISE'
    method: 'PERCENTAGE', // 'PERCENTAGE' or 'AMOUNT'
    value: '',
    field: 'campaign_price' // 'list_price' or 'campaign_price'
  });

  useEffect(() => {
    fetchData();
  }, [blockId, projectId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectData, blockResponse, salesData, customersData] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/blocks/${blockId}`),
        api.get('/sales').catch(() => []),
        api.get('/customers').catch(() => [])
      ]);

      setProject(projectData.project || projectData.data || projectData);
      setSales(salesData || []);
      setCustomers(customersData || []);

      let blockData = blockResponse.block || blockResponse.data || blockResponse;

      if (blockData.units && blockData.floors) {
        blockData.floors = blockData.floors.map(f => ({
          ...f,
          units: blockData.units.filter(u => Number(u.floor_id) === Number(f.id))
        }));
      }

      setBlock(blockData);
    } catch (err) {
      console.error('Blok detayi yuklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  const allUnits = (block?.floors || []).flatMap(f =>
    (f.units || []).map(u => ({ ...u, floorNumber: f.floor_number }))
  );

  const filteredUnits = allUnits.filter(u => {
    const status = String(u.sales_status || 'AVAILABLE').toUpperCase();
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'AVAILABLE' && !['AVAILABLE', 'SATILIK', 'MÜSAİT', 'BOŞ'].includes(status)) return false;
      if (statusFilter === 'SOLD' && !['SOLD', 'SATILDI'].includes(status)) return false;
      if (statusFilter === 'RESERVED' && !['RESERVED', 'REZERVE', 'REZERV'].includes(status)) return false;
      if (statusFilter === 'BARTER' && status !== 'BARTER') return false;
      if (statusFilter === 'OWNER' && !['ARSA SAHIBI', 'ARSA SAHİBİ'].includes(status)) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const sale = sales.find(s => String(s.unit_id) === String(u.id));
      const customerName = sale?.customers?.full_name || '';
      return (
        String(u.unit_number).toLowerCase().includes(q) ||
        String(u.unit_type).toLowerCase().includes(q) ||
        customerName.toLowerCase().includes(q) ||
        String(u.facade || '').toLowerCase().includes(q)
      );
    }
    return true;
  }).sort((a, b) => {
    const fa = Number(a.floorNumber) || 0;
    const fb = Number(b.floorNumber) || 0;
    if (fa !== fb) return fa - fb;
    return String(a.unit_number).localeCompare(String(b.unit_number), undefined, { numeric: true });
  });

  const stats = {
    total: allUnits.length,
    available: allUnits.filter(u => ['AVAILABLE', 'SATILIK', 'MÜSAİT', 'BOŞ', ''].includes(String(u.sales_status || 'AVAILABLE').toUpperCase())).length,
    sold: allUnits.filter(u => ['SOLD', 'SATILDI'].includes(String(u.sales_status || '').toUpperCase())).length,
    reserved: allUnits.filter(u => ['RESERVED', 'REZERVE', 'REZERV'].includes(String(u.sales_status || '').toUpperCase())).length,
  };

  const totalListPrice = allUnits.reduce((a, u) => a + Number(u.list_price || u.price || 0), 0);
  const totalSoldPrice = allUnits
    .filter(u => ['SOLD', 'SATILDI'].includes(String(u.sales_status || '').toUpperCase()))
    .reduce((a, u) => a + Number(u.campaign_price || u.list_price || u.price || 0), 0);

  const handlePriceUpdate = async (unitId, field, value) => {
    try {
      const unit = allUnits.find(u => u.id === unitId);
      if (!unit) return;
      await api.put(`/projects/units/${unitId}`, { ...unit, [field]: Number(value) });
    } catch (err) {
      console.error('Fiyat guncelleme hatasi:', err);
    }
  };

  const toggleUnitSelection = (id) => {
    setSelectedUnits(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    const allIds = filteredUnits.map(u => u.id);
    setSelectedUnits(prev => prev.length === allIds.length ? [] : allIds);
  };

  const handleBulkAction = async () => {
    if (!bulkAction.value || Number(bulkAction.value) <= 0) {
      alert('Lutfen gecerli bir deger giriniz.');
      return;
    }
    if (selectedUnits.length === 0) {
      alert('Lutfen islem yapilacak daireleri seciniz.');
      return;
    }

    try {
      const updates = selectedUnits.map(unitId => {
        const unit = allUnits.find(u => u.id === unitId);
        if (!unit) return null;

        const field = bulkAction.type === 'CAMPAIGN' ? 'campaign_price' : 'list_price';
        let currentPrice = Number(unit[field] || unit.list_price || unit.price || 0);
        let newValue = currentPrice;

        if (bulkAction.method === 'PERCENTAGE') {
          const factor = Number(bulkAction.value) / 100;
          if (bulkAction.type === 'RAISE') {
            newValue = currentPrice * (1 + factor);
          } else {
            // Kampanya: liste fiyatindan yuzde indirim
            const basePrice = Number(unit.list_price || unit.price || 0);
            newValue = basePrice * (1 - factor);
          }
        } else {
          const amount = Number(bulkAction.value);
          if (bulkAction.type === 'RAISE') {
            newValue = currentPrice + amount;
          } else {
            const basePrice = Number(unit.list_price || unit.price || 0);
            newValue = basePrice - amount;
          }
        }

        return api.put(`/projects/units/${unitId}`, {
          ...unit,
          [field]: Math.round(newValue)
        });
      }).filter(Boolean);

      await Promise.all(updates);
      alert(`${selectedUnits.length} daire basariyla guncellendi.`);
      setIsBulkModalOpen(false);
      setSelectedUnits([]);
      setBulkAction({ type: 'CAMPAIGN', method: 'PERCENTAGE', value: '', field: 'campaign_price' });
      await fetchData();
    } catch (err) {
      console.error('Toplu guncelleme hatasi:', err);
      alert('Guncelleme sirasinda hata olustu.');
    }
  };

  const statusFilters = [
    { key: 'ALL', label: 'Hepsi' },
    { key: 'AVAILABLE', label: 'Satilik' },
    { key: 'SOLD', label: 'Satilan' },
    { key: 'RESERVED', label: 'Rezerve' },
    { key: 'BARTER', label: 'Barter' },
    { key: 'OWNER', label: 'Arsa Sahibi' }
  ];

  const renderUnitCard = (unit) => {
    const statusDetails = getUnitStatusDetails(unit.sales_status || 'AVAILABLE');
    const sale = sales.find(s => String(s.unit_id) === String(unit.id));
    const customer = sale?.customers || null;
    const isSelected = selectedUnits.includes(unit.id);
    const isAvailable = ['AVAILABLE', 'SATILIK', 'MÜSAİT', 'BOŞ', ''].includes(String(unit.sales_status || 'AVAILABLE').toUpperCase());
    const netM2 = unit.net_m2 || (unit.rooms || unit.unit_rooms || []).reduce((acc, r) => acc + (Number(r.area_m2 || r.area) || 0), 0) || null;
    const brutM2 = unit.brut_m2 || null;

    return (
      <div
        key={unit.id}
        className={`bg-white rounded-2xl border p-4 hover:shadow-lg transition-all relative overflow-hidden ${isSelected ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-emerald-200'}`}
      >
        {/* Selection Checkbox */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => toggleUnitSelection(unit.id)}
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300 hover:border-emerald-400'}`}
          >
            {isSelected && <CheckCircle size={12} />}
          </button>
        </div>

        {/* Status Dot + Unit Number */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
            <Home size={20} className="text-slate-500" />
          </div>
          <div>
            <h4 className="text-base font-black text-slate-800">Daire {unit.unit_number}</h4>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{unit.unit_type}</span>
              <span className={`w-2 h-2 rounded-full ${statusDetails.dotColor}`} />
              <span className="text-[10px] font-bold text-slate-400">{statusDetails.label}</span>
            </div>
          </div>
        </div>

        {/* Info Grid: Kat, Cephe, Brut m2, Net m2 */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
            <p className="text-[8px] font-bold text-slate-400 uppercase">Kat</p>
            <p className="text-xs font-black text-slate-700">{unit.floorNumber}. Kat</p>
          </div>
          <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
            <p className="text-[8px] font-bold text-slate-400 uppercase">Cephe</p>
            <p className="text-xs font-black text-slate-700 flex items-center gap-1">
              <Compass size={10} className="text-slate-400" />
              {unit.facade || '-'}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
            <p className="text-[8px] font-bold text-slate-400 uppercase">Brut m2</p>
            <p className="text-xs font-black text-slate-700">{brutM2 ? `${brutM2} m2` : '-'}</p>
          </div>
          <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
            <p className="text-[8px] font-bold text-slate-400 uppercase">Net m2</p>
            <p className="text-xs font-black text-slate-700">{netM2 ? `${Number(netM2).toFixed(1)} m2` : '-'}</p>
          </div>
        </div>

        {/* Prices */}
        <div className="flex items-center justify-between mb-3 bg-emerald-50/50 rounded-lg px-2.5 py-2">
          <div>
            <p className="text-[8px] font-bold text-slate-400 uppercase">Liste Fiyati</p>
            <p className="text-sm font-black text-slate-800">{formatCurrency(unit.list_price || unit.price)}</p>
          </div>
          {unit.campaign_price && (
            <div className="text-right">
              <p className="text-[8px] font-bold text-emerald-500 uppercase">Kampanya</p>
              <p className="text-sm font-black text-emerald-600">{formatCurrency(unit.campaign_price)}</p>
            </div>
          )}
        </div>

        {/* Status Badge + Customer */}
        <div className="flex items-center justify-between">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${statusDetails.classes}`}>
            {statusDetails.label}
          </span>
          {customer ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[8px] font-black">
                {customer.full_name?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="text-[10px] font-bold text-slate-500 truncate max-w-[80px]">{customer.full_name}</span>
            </div>
          ) : isAvailable ? (
            <button
              onClick={() => navigate('/sales')}
              className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition-colors"
            >
              <Plus size={10} /> Satis
            </button>
          ) : null}
        </div>

        {/* Sale Detail Button */}
        {sale && (
          <button
            onClick={() => { setSelectedSaleForDetails(sale); setIsDetailsModalOpen(true); }}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-colors"
          >
            <Eye size={12} /> Satis Detayi
          </button>
        )}
      </div>
    );
  };

  const renderTableRow = (unit) => {
    const statusDetails = getUnitStatusDetails(unit.sales_status || 'AVAILABLE');
    const sale = sales.find(s => String(s.unit_id) === String(unit.id));
    const customer = sale?.customers || null;
    const isAvailable = ['AVAILABLE', 'SATILIK', 'MÜSAİT', 'BOŞ', ''].includes(String(unit.sales_status || 'AVAILABLE').toUpperCase());
    const isSelected = selectedUnits.includes(unit.id);
    const netM2 = unit.net_m2 || (unit.rooms || unit.unit_rooms || []).reduce((acc, r) => acc + (Number(r.area_m2 || r.area) || 0), 0) || null;
    const brutM2 = unit.brut_m2 || null;

    return (
      <tr key={unit.id} className={`hover:bg-slate-50/50 transition-colors group ${isSelected ? 'bg-emerald-50/30' : ''}`}>
        <td className="px-3 py-2.5">
          <button
            onClick={() => toggleUnitSelection(unit.id)}
            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300'}`}
          >
            {isSelected && <CheckCircle size={10} />}
          </button>
        </td>
        <td className="px-3 py-2.5"><span className="text-[10px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{unit.floorNumber}</span></td>
        <td className="px-3 py-2.5"><span className="text-sm font-black text-slate-800">{unit.unit_number}</span></td>
        <td className="px-3 py-2.5"><span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{unit.unit_type}</span></td>
        <td className="px-3 py-2.5"><span className="text-[10px] font-bold text-slate-500">{unit.facade || '-'}</span></td>
        <td className="px-3 py-2.5"><span className="text-xs font-bold text-slate-600">{brutM2 ? `${brutM2}` : '-'}</span></td>
        <td className="px-3 py-2.5"><span className="text-xs font-bold text-slate-600">{netM2 ? `${Number(netM2).toFixed(1)}` : '-'}</span></td>
        <td className="px-3 py-2.5">
          <input type="number" defaultValue={unit.list_price || unit.price || ''} onBlur={(e) => handlePriceUpdate(unit.id, 'list_price', e.target.value)}
            className="w-28 px-2 py-1 bg-slate-50 border border-transparent rounded text-xs font-black text-slate-700 focus:bg-white focus:border-blue-400 outline-none transition-all" />
        </td>
        <td className="px-3 py-2.5">
          <input type="number" defaultValue={unit.campaign_price || ''} onBlur={(e) => handlePriceUpdate(unit.id, 'campaign_price', e.target.value)}
            className="w-28 px-2 py-1 bg-emerald-50/50 border border-transparent rounded text-xs font-black text-emerald-700 focus:bg-white focus:border-emerald-400 outline-none transition-all" />
        </td>
        <td className="px-3 py-2.5">
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${statusDetails.classes}`}>{statusDetails.label}</span>
        </td>
        <td className="px-3 py-2.5">
          {customer ? (
            <span className="text-[10px] font-bold text-slate-600 truncate">{customer.full_name}</span>
          ) : <span className="text-slate-300 text-xs">-</span>}
        </td>
        <td className="px-3 py-2.5">
          {sale ? (
            <button onClick={() => { setSelectedSaleForDetails(sale); setIsDetailsModalOpen(true); }} className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Eye size={12} /></button>
          ) : isAvailable ? (
            <button onClick={() => navigate('/sales')} className="p-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100"><Plus size={12} /></button>
          ) : null}
        </td>
      </tr>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fb]">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-5">
            <button onClick={() => navigate(`/sales/projects/${projectId}`)} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors mb-2">
              <ArrowLeft size={16} /> Bloklara Don
            </button>
            {!loading && (
              <>
                <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                  {project?.name || project?.project_name} - {block?.name || `Blok ${blockId}`}
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">Satis Tablosu</p>
              </>
            )}
          </div>

          {!loading && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
                  <p className="text-xl font-black text-slate-700">{stats.total}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Toplam</p>
                </div>
                <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-3 text-center">
                  <p className="text-xl font-black text-emerald-600">{stats.available}</p>
                  <p className="text-[9px] font-bold text-emerald-500 uppercase">Satilik</p>
                </div>
                <div className="bg-rose-50 rounded-xl border border-rose-100 p-3 text-center">
                  <p className="text-xl font-black text-rose-600">{stats.sold}</p>
                  <p className="text-[9px] font-bold text-rose-500 uppercase">Satilan</p>
                </div>
                <div className="bg-amber-50 rounded-xl border border-amber-100 p-3 text-center">
                  <p className="text-xl font-black text-amber-600">{stats.reserved}</p>
                  <p className="text-[9px] font-bold text-amber-500 uppercase">Rezerve</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
                  <p className="text-sm font-black text-slate-700">{formatCurrency(totalListPrice)}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Liste Toplam</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
                  <p className="text-sm font-black text-emerald-600">{formatCurrency(totalSoldPrice)}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Satis Geliri</p>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {/* Status Filters */}
                <div className="flex p-0.5 bg-slate-100/80 rounded-lg">
                  {statusFilters.map(sf => (
                    <button key={sf.key} onClick={() => setStatusFilter(sf.key)}
                      className={`px-2.5 py-1.5 text-[10px] font-black rounded-md transition-all ${statusFilter === sf.key ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                      {sf.label}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all w-48" />
                </div>

                {/* View Toggle */}
                <div className="flex p-0.5 bg-slate-100/80 rounded-lg">
                  <button onClick={() => setViewMode('CARD')} className={`p-1.5 rounded-md transition-all ${viewMode === 'CARD' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}>
                    <LayoutGrid size={14} />
                  </button>
                  <button onClick={() => setViewMode('TABLE')} className={`p-1.5 rounded-md transition-all ${viewMode === 'TABLE' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}>
                    <List size={14} />
                  </button>
                </div>

                <span className="text-[10px] font-bold text-slate-400 ml-auto">{filteredUnits.length} / {allUnits.length} daire</span>
              </div>

              {/* Bulk Actions Bar */}
              {selectedUnits.length > 0 && (
                <div className="mb-4 flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-600 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black">{selectedUnits.length}</span>
                    <span className="text-sm font-bold text-emerald-800">Daire Secildi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleSelectAll} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-50">
                      {selectedUnits.length === filteredUnits.length ? 'Secimi Kaldir' : 'Tumunu Sec'}
                    </button>
                    <button onClick={() => { setBulkAction({ type: 'CAMPAIGN', method: 'PERCENTAGE', value: '', field: 'campaign_price' }); setIsBulkModalOpen(true); }}
                      className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-[10px] font-bold hover:bg-orange-600 flex items-center gap-1.5">
                      <Percent size={12} /> Toplu Kampanya
                    </button>
                    <button onClick={() => { setBulkAction({ type: 'RAISE', method: 'PERCENTAGE', value: '', field: 'list_price' }); setIsBulkModalOpen(true); }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 flex items-center gap-1.5">
                      <TrendingUp size={12} /> Toplu Zam
                    </button>
                  </div>
                </div>
              )}

              {/* Content */}
              {viewMode === 'CARD' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredUnits.map(renderUnitCard)}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-3 py-2.5"><button onClick={handleSelectAll} className={`w-4 h-4 rounded border flex items-center justify-center ${selectedUnits.length === filteredUnits.length && filteredUnits.length > 0 ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300'}`}>{selectedUnits.length > 0 && <CheckCircle size={10} />}</button></th>
                          <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 uppercase">Kat</th>
                          <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 uppercase">No</th>
                          <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 uppercase">Tip</th>
                          <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 uppercase">Cephe</th>
                          <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 uppercase">Brut m2</th>
                          <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 uppercase">Net m2</th>
                          <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 uppercase">Liste Fiyati</th>
                          <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 uppercase">Kampanya</th>
                          <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 uppercase">Durum</th>
                          <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 uppercase">Musteri</th>
                          <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 uppercase">Islem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredUnits.map(renderTableRow)}
                      </tbody>
                    </table>
                  </div>
                  {filteredUnits.length === 0 && (
                    <div className="text-center py-12 text-slate-400"><Home size={36} className="mx-auto mb-3 text-slate-300" /><p className="font-bold text-sm">Daire bulunamadi</p></div>
                  )}
                </div>
              )}
            </>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          )}
        </main>
      </div>

      {/* Sale Details Modal */}
      {isDetailsModalOpen && selectedSaleForDetails && (
        <SaleDetailsModal sale={selectedSaleForDetails} onClose={() => { setIsDetailsModalOpen(false); setSelectedSaleForDetails(null); }} />
      )}

      {/* Bulk Action Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-slate-800">
                {bulkAction.type === 'CAMPAIGN' ? 'Toplu Kampanya Uygula' : 'Toplu Zam Uygula'}
              </h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X size={18} className="text-slate-400" /></button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              <span className="font-bold text-emerald-600">{selectedUnits.length}</span> daire secildi.
              {bulkAction.type === 'CAMPAIGN' ? ' Kampanyali fiyat belirlenecek.' : ' Liste fiyatina zam yapilacak.'}
            </p>

            {/* Method Toggle */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
              <button onClick={() => setBulkAction(prev => ({ ...prev, method: 'PERCENTAGE' }))}
                className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${bulkAction.method === 'PERCENTAGE' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}>
                Yuzde (%)
              </button>
              <button onClick={() => setBulkAction(prev => ({ ...prev, method: 'AMOUNT' }))}
                className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${bulkAction.method === 'AMOUNT' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}>
                Tutar (TL)
              </button>
            </div>

            {/* Value Input */}
            <div className="relative mb-5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                {bulkAction.method === 'PERCENTAGE' ? '%' : 'TL'}
              </span>
              <input
                type="number"
                value={bulkAction.value}
                onChange={(e) => setBulkAction(prev => ({ ...prev, value: e.target.value }))}
                placeholder={bulkAction.type === 'CAMPAIGN' ? 'Indirim miktari' : 'Zam miktari'}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button onClick={() => setIsBulkModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                Iptal
              </button>
              <button onClick={handleBulkAction}
                className={`flex-1 py-2.5 text-white rounded-xl text-sm font-bold transition-colors ${bulkAction.type === 'CAMPAIGN' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {bulkAction.type === 'CAMPAIGN' ? 'Kampanya Uygula' : 'Zam Uygula'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesBlockDetails;
