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
  FileText
} from 'lucide-react';

// loggedInAgentName prop'u eklendi
export default function NewSecondHandModal({ isOpen, onClose, onAdd, loggedInAgentName, agents = [] }) {
  const defaultProjects = ['Güneş Sitesi 3. Etap', 'Deniz Manzaralı Müstakil', 'Merkez Plaza', 'Diğer'];
  const defaultBlocks = ['A Blok', 'B Blok', 'C Blok', 'Bağımsız', 'Diğer'];
  // availableAgents artık bu modalda kullanılmadığı için sadeleştirilebilir
  // veya sadece display amaçlı tutulabilir. Ancak input disabled olacağı için listeden bağımsızdır.

  const initialData = {
    projectName: '',
    customProjectName: '',
    blockInfo: '',
    customBlockInfo: '',
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
  };

  const [formData, setFormData] = useState(initialData);
  
  // Modal açıldığında form verilerini sıfırlar ve loggedInAgentName'i ayarlar
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...initialData,
        agentName: loggedInAgentName || '', // Her açılışta güncel loggedInAgentName'i kullan
      });
    }
  }, [isOpen, loggedInAgentName]); // loggedInAgentName değişirse de effect çalışsın

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalProjectName = formData.projectName === 'Diğer' ? formData.customProjectName : formData.projectName;
    const finalBlock = formData.blockInfo === 'Diğer' ? formData.customBlockInfo : formData.blockInfo;
    
    // agentName zaten loggedInAgentName'den geldiği ve değiştirilemediği için
    // customAgentName mantığına gerek kalmaz, direkt formData.agentName kullanılır.
    const finalAgentName = formData.agentName; 

    if (!finalProjectName || !finalBlock || !formData.ownerName || !formData.type || !formData.price || !finalAgentName) {
      alert("Lütfen zorunlu (*) alanları doldurunuz.");
      return;
    }
    
    const newListing = {
      projectName: finalProjectName,
      block: finalBlock,
      ownerName: formData.ownerName,
      ownerPhone: formData.ownerPhone,
      buyerName: formData.buyerName,
      buyerPhone: formData.buyerPhone,
      type: formData.type,
      status: formData.status,
      price: formData.price,
      deposit: formData.deposit,
      commission: formData.commission,
      notes: formData.notes,
      agentName: finalAgentName,
      contractStartDate: formData.contractStartDate,
      contractEndDate: formData.contractEndDate,
    };

    onAdd(newListing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Yeni İlan Ekle</h2>
            <p className="text-xs text-slate-500 mt-0.5">Portföye yeni bir gayrimenkul ekleyin.</p>
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
                      {defaultProjects.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                  {formData.projectName === 'Diğer' && (
                    <input type="text" name="customProjectName" value={formData.customProjectName} onChange={handleChange} placeholder="Proje Adı Giriniz" className="w-full mt-2 px-3 py-2 border border-blue-300 bg-blue-50/30 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" required/>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Blok / Daire <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select name="blockInfo" value={formData.blockInfo} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer" required>
                      <option value="">Seçiniz</option>
                      {defaultBlocks.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                  {formData.blockInfo === 'Diğer' && (
                    <input type="text" name="customBlockInfo" value={formData.customBlockInfo} onChange={handleChange} placeholder="Blok ve Daire No" className="w-full mt-2 px-3 py-2 border border-blue-300 bg-blue-50/30 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" required/>
                  )}
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
             <div className="flex items-center gap-2 mb-4 text-purple-700 font-semibold border-b border-slate-200 pb-2">
                <Users size={18} />
                <h3>Taraf Bilgileri</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider">Ev Sahibi</h4>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Ad Soyad <span className="text-red-500">*</span></label>
                    <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Ad Soyad Giriniz" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Telefon</label>
                    <input type="tel" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} placeholder="+90" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
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
              <div className="mt-6 border-t border-slate-200 pt-4">
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
              </div>
            </section>

            <section className="bg-slate-50/50 p-4 rounded-xl border border-slate-200">
               <div className="flex items-center gap-2 mb-4 text-cyan-700 font-semibold border-b border-slate-200 pb-2">
                <FileText size={18} />
                <h3>Sözleşme Bilgileri</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
            İptal
          </button>
          <button type="submit" form="new-listing-form" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
            <Save size={16} />
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}