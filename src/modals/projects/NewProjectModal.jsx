import React, { useState, useRef } from 'react';
import {
  X,
  Save,
  Building2,
  Info,
  Calendar,
  CalendarCheck,
  MapPin,
  ChevronDown,
  AlignLeft,
  Upload,
  FileText,
  Trash2
} from 'lucide-react';
import { api } from '../../api/client';

const NewProjectModal = ({
  isOpen,
  formData,
  contractors,
  onClose,
  onChange,
  onAdd
}) => {
  // Dosya yükleme state'leri
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const isValidFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    return ['dwg', 'pdf'].includes(ext);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(isValidFile);
    if (validFiles.length < files.length) {
      alert('Sadece DWG ve PDF dosyaları kabul edilir.');
    }
    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    const validFiles = files.filter(isValidFile);
    if (validFiles.length < files.length) {
      alert('Sadece DWG ve PDF dosyaları kabul edilir.');
    }
    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setUploadedFiles([]);
    setIsDragging(false);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  // Proje oluşturulduktan sonra dosyaları yüklemek için parent'a dosyaları ilet
  const handleSubmit = async () => {
    setIsUploading(true);
    try {
      // Önce projeyi oluştur (parent'ın onAdd'i çağrılacak)
      await onAdd(uploadedFiles);
    } catch (err) {
      console.error("Proje oluşturma hatası:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">

        {/* --- Header --- */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Yeni Proje Ekle</h2>
            <p className="text-xs text-slate-500 mt-0.5">Sisteme yeni bir proje veya şantiye kaydı oluşturun.</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- Form Body (Scrollable) --- */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form
            id="new-project-form"
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
            className="space-y-6"
          >

            {/* Bölüm 1: Proje Temel Bilgileri */}
            <div>
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Building2 size={14} /> Proje Temel Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Proje Adı */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Proje Adı <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building2 size={16} />
                    </div>
                    <input
                      type="text"
                      name="company"
                      value={formData.company || ''}
                      onChange={onChange}
                      placeholder="Örn: Güneş Evleri Projesi"
                      required
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Durumu */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Proje Durumu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Info size={16} />
                    </div>
                    <select
                      name="status"
                      value={formData.status || 'Devam Ediyor'}
                      onChange={onChange}
                      className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm text-slate-700 appearance-none cursor-pointer"
                    >
                      <option value="Devam Ediyor">Devam Ediyor</option>
                      <option value="Planlanıyor">Planlanıyor</option>
                      <option value="Gecikmede">Gecikmede</option>
                      <option value="Bitiyor">Bitiyor</option>
                      <option value="Tamamlandı">Tamamlandı</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Bölüm 2: Tarih & Lokasyon */}
            <div>
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar size={14} /> Tarih & Konum
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Başlangıç Tarihi */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Başlangıç Tarihi</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Calendar size={16} />
                    </div>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate || ''}
                      onChange={onChange}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400 text-slate-700"
                    />
                  </div>
                </div>

                {/* Bitiş Tarihi (Sadece Tamamlandı ise) */}
                {formData.status === 'Tamamlandı' ? (
                  <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
                    <label className="text-sm font-medium text-slate-700">Bitiş Tarihi</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <CalendarCheck size={16} />
                      </div>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate || ''}
                        onChange={onChange}
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400 text-slate-700"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="hidden md:block"></div>
                )}

                {/* Adres */}
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700">Proje Adresi</label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!formData.address) return alert("Lütfen önce bir adres girin.");
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}`, {
                            headers: { 'User-Agent': 'MpandoApp/1.0' }
                          });
                          const data = await res.json();
                          if (data && data.length > 0) {
                            onChange({ target: { name: 'location_lat', value: data[0].lat } });
                            onChange({ target: { name: 'location_lng', value: data[0].lon } });
                          } else {
                            alert("Adres bulunamadı. Lütfen daha genel bir adres (İl, İlçe) girmeyi deneyin.");
                          }
                        } catch (err) {
                          console.error("Geocoding hatası:", err);
                          alert("Konum servisine bağlanılamadı.");
                        }
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                    >
                      <MapPin size={12} /> Koordinatları Bul
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <MapPin size={16} />
                    </div>
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ''}
                      onChange={onChange}
                      placeholder="Örn: Merkez Mah. Atatürk Cad. No:1"
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Koordinatlar */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Enlem (Latitude)</label>
                  <input
                    type="text"
                    name="location_lat"
                    value={formData.location_lat || ''}
                    onChange={onChange}
                    placeholder="Örn: 41.0082"
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Boylam (Longitude)</label>
                  <input
                    type="text"
                    name="location_lng"
                    value={formData.location_lng || ''}
                    onChange={onChange}
                    placeholder="Örn: 28.9784"
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                  />
                </div>

              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Bölüm 3: Açıklama */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <AlignLeft size={16} className="text-slate-400" /> Açıklama / Notlar
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={onChange}
                rows="3"
                placeholder="Proje hakkında eklemek istediğiniz detaylar..."
                className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400 resize-none"
              ></textarea>
            </div>

            <hr className="border-slate-100" />

            {/* ═══ Bölüm 4: DWG/PDF Dosya Yükleme ═══ */}
            <div>
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Upload size={14} /> Proje Dosyaları (DWG / PDF)
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Yüklediğiniz dosyalar Blok, Kat ve Oda oluşturma ekranlarında AI analizi için kullanılacaktır.
              </p>

              {/* Sürükle-Bırak Alanı */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                  isDragging
                    ? 'border-blue-400 bg-blue-50/80 scale-[1.01]'
                    : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".dwg,.pdf"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload size={24} className={`mx-auto mb-1.5 ${isDragging ? 'text-blue-500' : 'text-slate-300'}`} />
                <p className="text-sm font-semibold text-slate-600">
                  {isDragging ? 'Dosyaları bırakın...' : 'DWG veya PDF dosyalarınızı sürükleyin'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  veya tıklayarak dosya seçin (birden fazla dosya yüklenebilir)
                </p>
              </div>

              {/* Yüklenen Dosya Listesi */}
              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700 truncate max-w-[280px]">{file.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {formatFileSize(file.size)} · {file.name.split('.').pop().toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveFile(index); }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Dosyayı kaldır"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </form>
        </div>

        {/* --- Footer --- */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
          >
            İptal
          </button>
          <button
            type="submit"
            form="new-project-form"
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-lg transition-colors shadow-sm"
          >
            <Save size={16} />
            {isUploading ? 'Oluşturuluyor...' : 'Projeyi Ekle'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default NewProjectModal;
