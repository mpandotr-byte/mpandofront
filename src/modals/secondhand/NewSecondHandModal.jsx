import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Building,
  Users,
  Wallet,
  Info,
  ChevronDown,
  User,
  FileText,
  Upload,
  Search,
  PlusCircle
} from 'lucide-react';
import { api } from '../../api/client';
import NewCostumerModal from '../customers/NewCostumerModal';

// loggedInAgentName prop'u eklendi
export default function NewSecondHandModal({ isOpen, onClose, onAdd, loggedInAgentName, agents = [] }) {
  const [projects, setProjects] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [units, setUnits] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [ownerSource, setOwnerSource] = useState('auto'); // 'auto' | 'manual'
  const [ownerSearch, setOwnerSearch] = useState('');
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({ full_name: '', identity_number: '', phone: '', email: '', address: '' });
  const [customerSaving, setCustomerSaving] = useState(false);

  const defaultBlocks = ['A Blok', 'B Blok', 'C Blok', 'Bağımsız', 'Diğer'];
  // availableAgents artık bu modalda kullanılmadığı için sadeleştirilebilir
  // veya sadece display amaçlı tutulabilir. Ancak input disabled olacağı için listeden bağımsızdır.

  const initialData = {
    projectName: '',
    customProjectName: '',
    blockInfo: '',
    customBlockInfo: '',
    flat: '', // Daire No
    ownerName: '',
    ownerPhone: '',
    buyerName: '',
    buyerPhone: '',
    type: '',
    status: 'Aktif',
    price: '',
    deposit: '',
    commission: '',
    notes: '',
    agentName: loggedInAgentName || '', // Giriş yapmış danışman adı varsayılan olarak gelir
    contractStartDate: '',
    contractEndDate: '',
    contract_no: '',
    dask_no: '',
    water_meter_no: '',
    electricity_meter_no: '',
    direction: '', // Yön/Cephe bilgisini tutar
  };

  const [formData, setFormData] = useState(initialData);

  // Modal açıldığında form verilerini sıfırlar ve loggedInAgentName'i ayarlar
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...initialData,
        agentName: loggedInAgentName || '',
      });
      setOwnerSource('auto');
      setOwnerSearch('');
      fetchProjects();
      fetchSales();
      fetchCustomers();
    }
  }, [isOpen, loggedInAgentName]);

  const fetchProjects = async () => {
    try {
      const data = await api.get('/projects');
      setProjects(data || []);
    } catch (err) {
      console.error("Projeler çekilemedi:", err);
    }
  };

  const fetchSales = async () => {
    try {
      const data = await api.get('/sales');
      setSales(data || []);
    } catch (err) {
      console.error("Satışlar çekilemedi:", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await api.get('/customers');
      setCustomers(Array.isArray(data) ? data.filter(c => !c.is_deleted) : []);
    } catch (err) {
      console.error("Müşteriler çekilemedi:", err);
    }
  };

  const fetchProjectDetails = async (projectId) => {
    try {
      setLoadingDetails(true);
      const data = await api.get(`/projects/${projectId}`);
      setBlocks(data.blocks || []);
      setUnits([]);
    } catch (err) {
      console.error("Bloklar çekilemedi:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchBlockDetails = async (blockId) => {
    try {
      setLoadingDetails(true);
      const data = await api.get(`/projects/blocks/${blockId}`);
      const blockUnits = [];
      (data.floors || []).forEach(f => {
        (f.units || []).forEach(u => {
          // Sadece satılmış, barter veya arsa sahibi olan daireleri göster
          const status = String(u.sales_status || '').toUpperCase();
          const isSoldOrOwned = ['SOLD', 'SATILDI', 'BARTER', 'ARSA SAHIBI', 'ARSA SAHİBİ'].includes(status);
          // Ayrıca satış kaydı üzerinden de kontrol et
          const hasSale = sales.some(s =>
            String(s.unit_id) === String(u.id) &&
            ['Satıldı', 'Barter', 'Arsa Sahibi'].includes(s.sale_status)
          );
          if (isSoldOrOwned || hasSale) {
            blockUnits.push({ ...u, floor_number: f.floor_number });
          }
        });
      });
      setUnits(blockUnits);
    } catch (err) {
      console.error("Üniteler çekilemedi:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === 'projectName') {
        if (value === 'Diğer' || !value) {
          setBlocks([]);
          setUnits([]);
          newData.blockInfo = '';
          newData.flat = '';
        } else {
          const selectedProj = projects.find(p => (p.name || p.project_name) === value);
          if (selectedProj) {
            fetchProjectDetails(selectedProj.id);
            newData.ownerName = selectedProj.owner_name || 'Şirket Envanteri';
          }
        }
      }

      if (name === 'blockInfo') {
        if (value === 'Diğer' || value === 'Bağımsız' || !value) {
          setUnits([]);
          newData.flat = '';
        } else {
          const selectedBlock = blocks.find(b => b.name === value);
          if (selectedBlock) {
            fetchBlockDetails(selectedBlock.id);
          }
        }
      }

      if (name === 'flat') {
        const selectedUnit = units.find(u => u.unit_number === value || String(u.id) === value);
        if (selectedUnit) {
          const sale = sales.find(s =>
            String(s.unit_id) === String(selectedUnit.id) &&
            ['Satıldı', 'Barter', 'Arsa Sahibi'].includes(s.sale_status)
          );

          if (sale?.customers?.full_name) {
            newData.ownerName = sale.customers.full_name;
            newData.ownerPhone = sale.customers.phone || '';
            setOwnerSource('auto');
          } else {
            // Daireye bağlı müşteri yok - manuel seçim gerekli
            newData.ownerName = '';
            newData.ownerPhone = '';
            setOwnerSource('manual');
          }

          // Mülk Tipi'ni (Daire/Villa vb.) akıllıca seç
          if (selectedUnit.unit_type) {
            const uType = String(selectedUnit.unit_type).toLowerCase();
            if (uType.includes('+') || uType.includes('oda') || uType.includes('daire')) {
              newData.type = 'Daire';
            } else if (uType.includes('dükkan') || uType.includes('shop')) {
              newData.type = 'Dükkan';
            } else if (uType.includes('villa')) {
              newData.type = 'Villa';
            } else if (uType.includes('ofis')) {
              newData.type = 'Ofis';
            }
          }

          // Yön / Cephe bilgisini eşleştir (Hubndaki "-" işaretlerini boşlukla değiştir)
          if (selectedUnit.facade) {
            const normalizedFacade = selectedUnit.facade.replace('-', ' ').trim();
            // Mevcut seçeneklerden biriyle eşleşiyorsa onu kullan
            const options = ["Kuzey", "Güney", "Doğu", "Batı", "Kuzey Doğu", "Kuzey Batı", "Güney Doğu", "Güney Batı"];
            const foundOption = options.find(opt => opt.toLowerCase() === normalizedFacade.toLowerCase());
            if (foundOption) {
              newData.direction = foundOption;
            } else {
              newData.direction = selectedUnit.facade;
            }
          }

          newData.price = selectedUnit.list_price || selectedUnit.price || prev.price || '';
        }
      }

      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalProjectName = formData.projectName === 'Diğer' ? formData.customProjectName : formData.projectName;
    const finalBlock = formData.blockInfo === 'Diğer' ? formData.customBlockInfo : formData.blockInfo;

    // agentName zaten loggedInAgentName'den geldiği ve değiştirilemediği için
    // customAgentName mantığına gerek kalmaz, direkt formData.agentName kullanılır.
    const finalAgentName = formData.agentName;

    if (!finalProjectName || !formData.ownerName || !formData.type || !formData.price || !finalAgentName) {
      alert("Lütfen zorunlu (*) alanları doldurunuz (Proje, Ev Sahibi, Mülk Tipi, Fiyat, Danışman).");
      return;
    }

    // Seçilen dairenin unit ID'sini bul
    const selectedUnit = units.find(u => u.unit_number === formData.flat || String(u.id) === formData.flat);

    // Seçilen müşteriyi bul (seller olarak)
    const selectedCustomer = customers.find(c => c.full_name === formData.ownerName);

    const newListing = {
      property_title: `${finalProjectName}${finalBlock ? ' - ' + finalBlock : ''}${formData.flat ? ' No:' + formData.flat : ''} (${formData.type})`,
      unit_id: selectedUnit?.id || null,
      seller_id: selectedCustomer?.id || null,
      listing_price: formData.price ? Number(formData.price) : 0,
      sold_price: null,
      seller_commission: formData.commission ? Number(formData.commission) : 0,
      buyer_commission: 0,
      status: formData.status || 'Aktif',
    };

    onAdd(newListing);
    onClose();
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
      setNewCustomerData({ full_name: '', identity_number: '', phone: '', email: '', address: '' });
      if (created) {
        setCustomers(prev => [...prev, created]);
        setFormData(prev => ({
          ...prev,
          ownerName: created.full_name,
          ownerPhone: created.phone || ''
        }));
        setOwnerSource('auto');
      }
    } catch (err) {
      console.error('Müşteri eklenirken hata:', err);
      alert('Müşteri eklenirken bir hata oluştu.');
    } finally {
      setCustomerSaving(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    setFormData(prev => ({
      ...prev,
      ownerName: customer.full_name,
      ownerPhone: customer.phone || ''
    }));
    setOwnerSource('auto');
    setOwnerSearch('');
  };

  const filteredOwnerCustomers = customers.filter(c =>
    c.full_name?.toLowerCase().includes(ownerSearch.toLowerCase()) ||
    c.phone?.includes(ownerSearch) ||
    String(c.id).includes(ownerSearch)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Yeni EMLAK Kaydı Ekle</h2>
            <p className="text-xs text-slate-500 mt-0.5">Portföye yeni bir emlak kaydı ekleyin.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="new-listing-form" onSubmit={handleSubmit} className="space-y-8">

            <section className="bg-slate-50/50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4 text-blue-700 font-semibold border-b border-slate-200 pb-2">
                <Building size={18} />
                <h3>Mülk Bilgileri</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Proje <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select name="projectName" value={formData.projectName} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer" required>
                      <option value="">Seçiniz</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.name || p.project_name}>{p.name || p.project_name}</option>
                      ))}
                      <option value="Diğer">Diğer</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                  {formData.projectName === 'Diğer' && (
                    <input type="text" name="customProjectName" value={formData.customProjectName} onChange={handleChange} placeholder="Proje Adı Giriniz" className="w-full mt-2 px-3 py-2 border border-blue-300 bg-blue-50/30 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" required />
                  )}
                </div>
                {formData.projectName !== 'Diğer' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 flex justify-between items-center">
                      <span>Blok / Yapı</span>
                      {loadingDetails && <span className="text-[10px] text-blue-500 animate-pulse">Yükleniyor...</span>}
                    </label>
                    <div className="relative">
                      <select
                        name="blockInfo"
                        value={formData.blockInfo}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer"
                        disabled={!formData.projectName}
                      >
                        <option value="">Seçiniz</option>
                        {blocks.length > 0 ? (
                          blocks.map(b => <option key={b.id} value={b.name}>{b.name}</option>)
                        ) : (
                          defaultBlocks.map(b => <option key={b} value={b}>{b}</option>)
                        )}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    {formData.blockInfo === 'Diğer' && (
                      <input type="text" name="customBlockInfo" value={formData.customBlockInfo} onChange={handleChange} placeholder="Blok Adı Giriniz" className="w-full mt-2 px-3 py-2 border border-blue-300 bg-blue-50/30 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" required />
                    )}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex justify-between items-center">
                    <span>Daire / No {formData.projectName !== 'Diğer' && <span className="text-red-500">*</span>}</span>
                    {loadingDetails && <span className="text-[10px] text-blue-500 animate-pulse">Yükleniyor...</span>}
                  </label>
                  <div className="relative">
                    {units.length > 0 ? (
                      <>
                        <select
                          name="flat"
                          value={formData.flat}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer"
                          required={formData.projectName !== 'Diğer'}
                        >
                          <option value="">Seçiniz</option>
                          {units.map(u => (
                            <option key={u.id} value={u.unit_number}>
                              {u.unit_number} ({u.unit_type || 'N/A'})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </>
                    ) : (
                      <input
                        type="text"
                        name="flat"
                        value={formData.flat}
                        onChange={handleChange}
                        placeholder="Örn: No 4"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required={formData.projectName !== 'Diğer'}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Mülk Tipi <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer" required>
                      <option value="">Mülk Tipi Seçiniz</option>
                      <option value="Daire">Daire</option>
                      <option value="Villa">Villa</option>
                      <option value="Dükkan">Dükkan</option>
                      <option value="Arsa">Arsa</option>
                      <option value="Ofis">Ofis</option>
                      <option value="Depo">Depo</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Durum</label>
                  <div className="relative">
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer">
                      <option value="Aktif">Aktif</option>
                      <option value="Pasif">Pasif</option>
                      <option value="Kiralandı">Kiralandı</option>
                      <option value="Satıldı">Satıldı</option>
                      <option value="Rezerv">Rezerv</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-slate-50/50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4 text-orange-700 font-semibold border-b border-slate-200 pb-2">
                <Users size={18} />
                <h3>Taraf Bilgileri</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider">Ev Sahibi</h4>
                    {ownerSource === 'auto' && formData.ownerName && formData.ownerName !== 'Şirket Envanteri' && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Otomatik dolduruldu</span>
                    )}
                  </div>

                  {/* Ev sahibi otomatik doldurulduysa sadece göster */}
                  {ownerSource === 'auto' && formData.ownerName && formData.ownerName !== 'Şirket Envanteri' ? (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Ad Soyad <span className="text-red-500">*</span></label>
                        <input type="text" name="ownerName" value={formData.ownerName} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Telefon</label>
                        <input type="tel" name="ownerPhone" value={formData.ownerPhone} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 outline-none" />
                      </div>
                      <button type="button" onClick={() => setOwnerSource('manual')} className="text-[11px] text-blue-600 hover:text-blue-700 font-medium">
                        Farklı müşteri seç
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Müşteri arama ve seçme */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-slate-700">Müşteri Seç <span className="text-red-500">*</span></label>
                          <button
                            type="button"
                            onClick={() => setIsNewCustomerModalOpen(true)}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <PlusCircle size={12} /> Yeni Müşteri Ekle
                          </button>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search size={14} />
                          </div>
                          <input
                            type="text"
                            placeholder="Müşteri ara (ad, tel, id)..."
                            value={ownerSearch}
                            onChange={(e) => setOwnerSearch(e.target.value)}
                            className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-200"
                          />
                        </div>
                        {ownerSearch && (
                          <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg bg-white shadow-sm">
                            {filteredOwnerCustomers.length > 0 ? (
                              filteredOwnerCustomers.slice(0, 8).map(c => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => handleSelectCustomer(c)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 border-b border-slate-100 last:border-0 flex justify-between items-center"
                                >
                                  <span className="font-medium text-slate-700">{c.full_name}</span>
                                  <span className="text-xs text-slate-400">{c.phone}</span>
                                </button>
                              ))
                            ) : (
                              <p className="px-3 py-2 text-xs text-slate-400">Sonuç bulunamadı</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Seçilen Ev Sahibi</label>
                        <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Yukarıdan müşteri seçin veya manuel girin" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Telefon</label>
                        <input type="tel" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} placeholder="+90" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                      </div>
                    </>
                  )}
                </div>
                <div className="space-y-4 md:border-l md:border-slate-300 md:pl-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kiracı / Alıcı</h4>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Ad Soyad</label>
                    <input type="text" name="buyerName" value={formData.buyerName} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Telefon</label>
                    <input type="tel" name="buyerPhone" value={formData.buyerPhone} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none" />
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t border-slate-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <User size={14} /> Kaydı Giren Danışman <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder='varsayılan kullanıcı'
                    type="text"
                    name="agentName"
                    value={formData.agentName}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed text-slate-600 outline-none"
                    readOnly
                    disabled
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Info size={14} /> Yön / Cephe
                  </label>
                  <select
                    name="direction"
                    value={formData.direction}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Kuzey">Kuzey</option>
                    <option value="Güney">Güney</option>
                    <option value="Doğu">Doğu</option>
                    <option value="Batı">Batı</option>
                    <option value="Kuzey Doğu">Kuzey Doğu</option>
                    <option value="Kuzey Batı">Kuzey Batı</option>
                    <option value="Güney Doğu">Güney Doğu</option>
                    <option value="Güney Batı">Güney Batı</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="bg-slate-50/50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4 text-cyan-700 font-semibold border-b border-slate-200 pb-2">
                <FileText size={18} />
                <h3>Sözleşme ve Teknik Bilgiler</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Sözleşme No</label>
                  <input
                    type="text"
                    name="contract_no"
                    value={formData.contract_no}
                    onChange={handleChange}
                    placeholder="Sözleşme No"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">DASK No</label>
                  <input
                    type="text"
                    name="dask_no"
                    value={formData.dask_no}
                    onChange={handleChange}
                    placeholder="DASK No"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5 text-cyan-700">
                  <label className="text-sm font-medium text-slate-700">Su Sayacı No</label>
                  <input
                    type="text"
                    name="water_meter_no"
                    value={formData.water_meter_no}
                    onChange={handleChange}
                    placeholder="Su Sayacı No"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5 text-cyan-700">
                  <label className="text-sm font-medium text-slate-700">Elektrik Sayacı No</label>
                  <input
                    type="text"
                    name="electricity_meter_no"
                    value={formData.electricity_meter_no}
                    onChange={handleChange}
                    placeholder="Elektrik Sayacı No"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Sözleşme Başlangıç Tarihi</label>
                  <input
                    type="date"
                    name="contractStartDate"
                    value={formData.contractStartDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Sözleşme Bitiş Tarihi</label>
                  <input
                    type="date"
                    name="contractEndDate"
                    value={formData.contractEndDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
              </div>
            </section>

            <section className="bg-slate-50/50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4 text-emerald-700 font-semibold border-b border-slate-200 pb-2">
                <Wallet size={18} />
                <h3>Finansal Bilgiler</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Fiyat <span className="text-red-500">*</span></label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Depozito</label>
                  <input type="number" name="deposit" value={formData.deposit} onChange={handleChange} placeholder="0.00" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Komisyon Oranı (%)</label>
                  <input type="number" name="commission" value={formData.commission} onChange={handleChange} placeholder="Örn: 3" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
            </section>

            <section className="bg-slate-50/50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4 text-orange-700 font-semibold border-b border-slate-200 pb-2">
                <Info size={18} />
                <h3>Ek Notlar</h3>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Açıklama / Notlar</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" placeholder="İlan ile ilgili ek notlar veya açıklamalar..." className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-y"></textarea>
              </div>
            </section>
          </form>
        </div >

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
            İptal
          </button>
          <button type="submit" form="new-listing-form" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
            <Save size={16} />
            Kaydet
          </button>
        </div>
        {/* Yeni Müşteri Ekleme Modalı */}
        <NewCostumerModal
          isOpen={isNewCustomerModalOpen}
          onClose={() => {
            setIsNewCustomerModalOpen(false);
            setNewCustomerData({ full_name: '', identity_number: '', phone: '', email: '', address: '' });
          }}
          newCustomerData={newCustomerData}
          onChange={handleNewCustomerChange}
          onAdd={handleAddNewCustomer}
        />
      </div >
    </div >
  );
}