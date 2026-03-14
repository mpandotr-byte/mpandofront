import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  X,
  Save,
  Building2,
  User,
  Home,
  Banknote,
  Calendar,
  FileText,
  Tag,
  Link,
  ChevronDown,
  Layers,
  Upload,
  FileCheck,
  Eye,
  Search,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';
import NewCostumerModal from './customers/NewCostumerModal';

const initialCustomerData = {
  full_name: '', identity_number: '', phone: '', email: '', address: ''
};

export default function NewSaleModal({
  isOpen,
  formData,
  onClose,
  onChange,
  onAdd,
  customers = [],
  projects = [],
  onCustomerAdded
}) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [contractFile, setContractFile] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isApprovalSent, setIsApprovalSent] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState(initialCustomerData);
  const [customerSaving, setCustomerSaving] = useState(false);

  // Proje değiştiğinde detayları çek
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!formData.proje_id) {
        setSelectedProject(null);
        setBlocks([]);
        return;
      }

      setLoadingDetails(true);
      try {
        const data = await api.get(`/projects/${formData.proje_id}`);
        setSelectedProject(data);
        setBlocks(data.blocks || []);
      } catch (err) {
        console.error("Proje detayları çekilirken hata:", err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchProjectDetails();
  }, [formData.proje_id]);

  // Blok değiştiğinde daireleri güncelle
  useEffect(() => {
    if (selectedBlockId) {
      const block = blocks.find(b => String(b.id) === String(selectedBlockId));
      if (block && block.floors) {
        const allUnits = [];
        block.floors.forEach(floor => {
          if (floor.units) {
            const availableUnits = floor.units.filter(u => {
              const status = String(u.sales_status || 'AVAILABLE').toUpperCase();
              return ['AVAILABLE', 'SATILIK', 'MÜSAİT', 'BOŞ', ''].includes(status);
            });
            allUnits.push(...availableUnits);
          }
        });
        setUnits(allUnits.sort((a, b) => String(a.unit_number).localeCompare(String(b.unit_number), undefined, { numeric: true })));
      } else {
        setUnits([]);
      }
    } else {
      setUnits([]);
    }
  }, [selectedBlockId, blocks]);

  // Birim seçildiğinde interested_product'ı güncelle
  const handleUnitSelect = (unitId) => {
    setSelectedUnitId(unitId);

    if (!unitId) {
      onChange({ unit_id: '', interested_product: '', list_price: '', offered_price: '' });
      return;
    }

    const unit = units.find(u => String(u.id) === String(unitId));
    const block = blocks.find(b => String(b.id) === String(selectedBlockId));

    if (unit && block) {
      const value = `${block.name}, No: ${unit.unit_number} (${unit.unit_type || ''})`;
      // Birim seçildiğinde fiyatları ve cepheyi de otomatik doldur
      onChange({
        unit_id: unitId,
        interested_product: value,
        list_price: unit.list_price || unit.price || '',
        offered_price: unit.campaign_price || unit.list_price || unit.price || '',
        direction: unit.facade || '',
        unit_type: unit.unit_type || ''
      });
    }
  };

  const handleSendToApproval = () => {
    // Gerçek uygulamada burada API çağrısı yapılır
    setIsApprovalSent(true);
    onChange({ approval_status: 'Onay Bekliyor' });
    alert("Teklif yönetici onayına gönderildi.");
  };

  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    setNewCustomerData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewCustomer = async () => {
    if (!newCustomerData.full_name || !newCustomerData.phone) {
      alert('Müşteri adı ve telefon numarası zorunludur.');
      return;
    }
    setCustomerSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const createData = {
        ...newCustomerData,
        company_id: user.company_id,
        employee_id: user.id,
        contractor_id: user.company_id,
        is_deleted: false
      };
      const created = await api.post('/customers', createData);
      setIsNewCustomerModalOpen(false);
      setNewCustomerData(initialCustomerData);
      // Yeni müşteriyi otomatik seç
      if (created?.id) {
        onChange({ musteri_id: String(created.id) });
      }
      // Üst bileşendeki müşteri listesini yenile
      if (onCustomerAdded) {
        onCustomerAdded(created);
      }
    } catch (err) {
      console.error('Müşteri eklenirken hata:', err);
      alert('Müşteri eklenirken bir hata oluştu.');
    } finally {
      setCustomerSaving(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.full_name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch) ||
    String(c.id).includes(customerSearch)
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setContractFile(file);
      onChange({ contract_file: file });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">

        {/* --- Header --- */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Yeni Satış Ekle</h2>
            <p className="text-xs text-slate-500 mt-0.5">Sisteme yeni bir satış veya teklif kaydı oluşturun.</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- Form Body (Scrollable) --- */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form
            id="new-sale-form"
            onSubmit={(e) => { e.preventDefault(); onAdd(); }}
            className="space-y-6"
          >

            {/* Bölüm 1: Müşteri & Proje Bilgileri */}
            <div>
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <User size={14} /> Müşteri & Proje Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Müşteri Seçimi */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">Müşteri Seçimi <span className="text-red-500">*</span></label>
                    <button
                      type="button"
                      onClick={() => setIsNewCustomerModalOpen(true)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <PlusCircle size={12} /> Yeni Müşteri
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Search size={14} />
                      </div>
                      <input
                        type="text"
                        placeholder="Müşteri ara (ad, tel, id)..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="block w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User size={16} />
                      </div>
                      <select
                        name="musteri_id"
                        value={formData.musteri_id || ''}
                        onChange={onChange}
                        required
                        className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm text-slate-700 appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Seçiniz</option>
                        {filteredCustomers.map(c => (
                          <option key={c.id} value={c.id}>ID: ({c.id}) - {c.full_name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Proje Seçimi */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Proje Seçimi <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building2 size={16} />
                    </div>
                    <select
                      name="proje_id"
                      value={formData.proje_id || ''}
                      onChange={onChange}
                      required
                      className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm text-slate-700 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Seçiniz</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>ID: ({p.id}) - {p.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Blok ve Daire Seçimi (Dinamik) */}
                {formData.proje_id && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Blok Seçimi</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Layers size={16} />
                        </div>
                        <select
                          value={selectedBlockId}
                          onChange={(e) => {
                            setSelectedBlockId(e.target.value);
                            setSelectedUnitId('');
                          }}
                          className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm text-slate-700 appearance-none cursor-pointer"
                        >
                          <option value="">Blok Seçiniz</option>
                          {blocks.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Daire Seçimi</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Home size={16} />
                        </div>
                        <select
                          value={selectedUnitId}
                          onChange={(e) => handleUnitSelect(e.target.value)}
                          disabled={!selectedBlockId}
                          className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm text-slate-700 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">Daire Seçiniz</option>
                          {units.map(u => (
                            <option key={u.id} value={u.id}>No: {u.unit_number} ({u.unit_type})</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </>
                )}

                {/* İlgilenilen Daire / Blok (Manuel Düzenleme/Görünüm) */}
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">İlgilenilen Daire / Blok</label>
                    {loadingDetails && <span className="text-[10px] text-blue-500 animate-pulse font-bold">Veriler yükleniyor...</span>}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Home size={16} />
                    </div>
                    <input
                      type="text"
                      name="interested_product"
                      value={formData.interested_product || ''}
                      onChange={onChange}
                      placeholder="Örn: A Blok, Daire 12"
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 italic">Yukarıdaki seçimlerden otomatik doldurulur veya manuel yazılabilir.</p>
                </div>

                {/* Bütçe Aralığı */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Bütçe Aralığı</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Banknote size={16} />
                    </div>
                    <input
                      type="text"
                      name="budget_range"
                      value={formData.budget_range || ''}
                      onChange={onChange}
                      placeholder="Örn: 3M - 5M TL"
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Yön / Cephe */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Yön / Cephe</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Tag size={16} />
                    </div>
                    <input
                      type="text"
                      name="direction"
                      value={formData.direction || ''}
                      onChange={onChange}
                      placeholder="Örn: Güney-Doğu"
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Mülk Tipi */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Mülk Tipi</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building2 size={16} />
                    </div>
                    <input
                      type="text"
                      name="unit_type"
                      value={formData.unit_type || ''}
                      onChange={onChange}
                      placeholder="Örn: Daire (2+1)"
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Fiyatlandırma Bölümü */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {/* Liste Fiyatı */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Liste Fiyatı (₺)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Banknote size={14} />
                      </div>
                      <input
                        type="number"
                        name="list_price"
                        value={formData.list_price || ''}
                        onChange={onChange}
                        placeholder="0"
                        className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm font-semibold"
                      />
                    </div>
                  </div>

                  {/* Verilen Fiyat (Bizim Teklifimiz) */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Verilen Fiyat (₺)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Banknote size={14} />
                      </div>
                      <input
                        type="number"
                        name="offered_price"
                        value={formData.offered_price || ''}
                        onChange={onChange}
                        placeholder="0"
                        className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm font-semibold text-blue-600"
                      />
                    </div>
                  </div>

                  {/* Müşteri Teklifi */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Müşteri Teklifi (₺)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Banknote size={14} />
                      </div>
                      <input
                        type="number"
                        name="customer_offer"
                        value={formData.customer_offer || ''}
                        onChange={onChange}
                        placeholder="0"
                        className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm font-semibold text-orange-600"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
            <hr className="border-slate-100" />

            {/* Bölüm 2: Satış & Sözleşme Detayları */}
            <div>
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText size={14} /> Satış & Sözleşme Detayları
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Satış Tarihi */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Satış Tarihi</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Calendar size={16} />
                    </div>
                    <input
                      type="date"
                      name="sale_date"
                      value={formData.sale_date || ''}
                      onChange={onChange}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Satış Durumu */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Satış Durumu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Tag size={16} />
                    </div>
                    <select
                      name="sale_status"
                      value={formData.sale_status || 'Beklemede'}
                      onChange={onChange}
                      className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm text-slate-700 appearance-none cursor-pointer"
                    >
                      <option value="Beklemede">Beklemede</option>
                      <option value="Satıldı">Satıldı</option>
                      <option value="Rezerv">Rezerv</option>
                      <option value="Barter">Barter</option>
                      <option value="Arsa Sahibi">Arsa Sahibi</option>
                      <option value="İptal">İptal</option>
                      <option value="Reddedildi">Reddedildi</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Sözleşme No */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Sözleşme No</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <FileText size={16} />
                    </div>
                    <input
                      type="text"
                      name="contract_no"
                      value={formData.contract_no || ''}
                      onChange={onChange}
                      placeholder="Örn: S-2023-001"
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Sözleşme Dosya Yükleme */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Sözleşme Dosyası (PDF)</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer group">
                      <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-all ${contractFile ? 'border-green-300 bg-green-50/50' : 'border-slate-200 bg-slate-50 group-hover:border-blue-400 group-hover:bg-blue-50/30'}`}>
                        {contractFile ? (
                          <div className="flex items-center gap-2 text-green-700">
                            <FileCheck size={24} />
                            <div className="text-left flex-1 min-w-0">
                              <p className="text-sm font-bold truncate">{contractFile.name}</p>
                              <p className="text-[10px] opacity-70">{(contractFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <a
                              href={URL.createObjectURL(contractFile)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                              title="Dosyayı Gör"
                            >
                              <Eye size={16} />
                            </a>
                          </div>
                        ) : (
                          <>
                            <Upload size={24} className="text-slate-400 mb-2 group-hover:text-blue-500 group-hover:scale-110 transition-transform" />
                            <p className="text-xs font-semibold text-slate-600">
                              {formData.contract_file ? 'Dosyayı Güncelle' : 'Dosya Yüklemek İçin Tıklayın'}
                            </p>
                            {formData.contract_file && <p className="text-[10px] text-blue-500 mt-1">Mevcut bir dosya var</p>}
                          </>
                        )}
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    </label>
                    {contractFile && (
                      <button
                        type="button"
                        onClick={() => { setContractFile(null); onChange({ contract_file: null }); }}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Dosyayı Kaldır"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Bölüm 3: Notlar */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Notlar / Açıklama</label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={onChange}
                rows="3"
                placeholder="Satış veya görüşme ile ilgili eklemek istedikleriniz..."
                className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400 resize-none"
              ></textarea>
            </div>

            {/* Bölüm 4: Yönetici Onayı */}
            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-orange-800 flex items-center gap-2">
                  <ShieldCheck size={16} /> Yönetici Onayı
                </h4>
                <p className="text-[11px] text-orange-700 mt-1">Özel indirim veya kampanya dışı fiyatlar için onay gerekebilir.</p>
              </div>
              <button
                type="button"
                onClick={handleSendToApproval}
                disabled={isApprovalSent}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${isApprovalSent ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
              >
                {isApprovalSent ? <><FileCheck size={14} /> Onaya Gönderildi</> : 'Onaya Gönder'}
              </button>
            </div>

          </form>
        </div>

        {/* --- Footer --- */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
          >
            İptal
          </button>
          <button
            type="submit"
            form="new-sale-form"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            <Save size={16} />
            Satışı Ekle
          </button>
        </div>

        {/* Yeni Müşteri Ekleme Modalı */}
        <NewCostumerModal
          isOpen={isNewCustomerModalOpen}
          onClose={() => {
            setIsNewCustomerModalOpen(false);
            setNewCustomerData(initialCustomerData);
          }}
          newCustomerData={newCustomerData}
          onChange={handleNewCustomerChange}
          onAdd={handleAddNewCustomer}
        />
      </div >
    </div >
  );
}