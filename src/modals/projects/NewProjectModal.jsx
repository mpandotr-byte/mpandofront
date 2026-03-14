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
  Sparkles,
  Loader2,
  BrainCircuit,
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
  // Dosya yükleme ve AI analiz state'leri
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const acceptedTypes = ['.dwg', '.pdf', '.DWG', '.PDF'];
  const acceptedMimeTypes = ['application/pdf', 'application/acad', 'application/x-acad', 'application/dwg', 'image/vnd.dwg'];

  const isValidFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    return acceptedTypes.map(t => t.toLowerCase()).includes(ext);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      setUploadedFile(file);
      setAiResult(null);
    } else if (file) {
      alert('Lütfen DWG veya PDF formatında bir dosya seçiniz.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && isValidFile(file)) {
      setUploadedFile(file);
      setAiResult(null);
    } else if (file) {
      alert('Lütfen DWG veya PDF formatında bir dosya seçiniz.');
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadedFileUrl(null);
    setAiResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAIAnalysis = async () => {
    if (!uploadedFile) {
      alert('Lütfen önce bir DWG veya PDF dosyası yükleyiniz.');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Önce dosyayı yükle
      let fileUrl = uploadedFileUrl;
      if (!fileUrl) {
        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', uploadedFile);
        uploadFormData.append('file_type', uploadedFile.name.split('.').pop().toUpperCase());
        uploadFormData.append('file_name', uploadedFile.name);

        try {
          const uploadRes = await api.upload('/construction/files/upload', uploadFormData);
          fileUrl = uploadRes?.file_url || uploadRes?.url || null;
          setUploadedFileUrl(fileUrl);
        } catch (uploadErr) {
          console.error("Dosya yükleme hatası:", uploadErr);
          // Dosya yüklenemese bile AI'a dosya adıyla devam et
          fileUrl = null;
        } finally {
          setIsUploading(false);
        }
      }

      // AI analiz çağrısı
      const response = await api.post('/ai/test-ai', {
        prompt: `Sen profesyonel bir inşaat mühendisi ve mimarsın. Ekteki ${uploadedFile.name.split('.').pop().toUpperCase()} dosyasını analiz et.
                Bu bir inşaat projesi dosyasıdır. Dosyadan aşağıdaki bilgileri çıkar ve hesapla:
                - Proje adı (varsa başlık bloğundan)
                - Toplam inşaat alanı (m²)
                - Tahmini blok sayısı
                - Tahmini kat sayısı (her blok için ortalama)
                - Tahmini daire/ünite sayısı
                - Proje açıklaması (kısa teknik özet)
                - Proje adresi (varsa)

                Yanıtı sadece JSON formatında ver:
                {
                  "project_name": "...",
                  "total_area_m2": 0,
                  "block_count": 0,
                  "floor_count": 0,
                  "unit_count": 0,
                  "description": "...",
                  "address": "..."
                }`,
        context: {
          file_url: fileUrl,
          file_name: uploadedFile.name,
          file_type: uploadedFile.name.split('.').pop().toUpperCase(),
          analysis_type: "project_overview"
        }
      });

      const result = response.ai_response || response;

      if (result) {
        setAiResult(result);

        // Form alanlarını AI sonuçlarıyla doldur
        if (result.project_name) {
          onChange({ target: { name: 'company', value: result.project_name } });
        }
        if (result.description) {
          onChange({ target: { name: 'description', value: result.description } });
        }
        if (result.address) {
          onChange({ target: { name: 'address', value: result.address } });
        }

        alert('AI Analizi Başarılı! Proje bilgileri otomatik olarak dolduruldu.');
      }
    } catch (error) {
      console.error("AI Analiz Hatası:", error);
      const errorMsg = error.message || "";
      if (errorMsg.includes("API key") || errorMsg.includes("403") || errorMsg.includes("400")) {
        alert("AI Hatası: Backend sunucusundaki API Anahtarı geçersiz veya süresi dolmuş. Lütfen backend ayarlarını kontrol edin.");
      } else {
        alert("AI Analizi sırasında bir hata oluştu: " + errorMsg);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClose = () => {
    setUploadedFile(null);
    setUploadedFileUrl(null);
    setAiResult(null);
    setIsDragging(false);
    setIsAnalyzing(false);
    setIsUploading(false);
    onClose();
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
            onSubmit={(e) => { e.preventDefault(); onAdd(); }}
            className="space-y-6"
          >

            {/* ═══ DWG/PDF Dosya Yükleme ve AI Analiz ═══ */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-5 border border-blue-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center text-blue-600 border border-blue-100">
                    <BrainCircuit size={20} className={isAnalyzing ? 'animate-pulse' : ''} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">AI DESTEKLİ PROJE ANALİZİ</h3>
                    <p className="text-[10px] text-blue-600/70 font-bold uppercase tracking-widest">DWG veya PDF dosyası yükleyerek proje verilerini otomatik doldurun</p>
                  </div>
                </div>

                {/* Dosya Yükleme Alanı */}
                {!uploadedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      isDragging
                        ? 'border-blue-400 bg-blue-50/80 scale-[1.02]'
                        : 'border-blue-200 bg-white/60 hover:border-blue-300 hover:bg-white/80'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".dwg,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload size={28} className={`mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-blue-300'}`} />
                    <p className="text-sm font-bold text-blue-700">
                      {isDragging ? 'Dosyayı bırakın...' : 'DWG veya PDF dosyanızı sürükleyin'}
                    </p>
                    <p className="text-[11px] text-blue-400 mt-1 font-medium">
                      veya tıklayarak dosya seçin
                    </p>
                    <p className="text-[10px] text-blue-300 mt-2 font-bold uppercase tracking-wider">
                      Desteklenen formatlar: DWG, PDF
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Yüklenen Dosya Bilgisi */}
                    <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-blue-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 truncate max-w-[250px]">{uploadedFile.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{formatFileSize(uploadedFile.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Dosyayı kaldır"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* AI Analiz Butonu */}
                    <button
                      type="button"
                      onClick={handleAIAnalysis}
                      disabled={isAnalyzing || isUploading}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                    >
                      {isAnalyzing || isUploading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          {isUploading ? 'Dosya Yükleniyor...' : 'AI Analiz Ediliyor...'}
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          AI ile Analiz Et ve Doldur
                        </>
                      )}
                    </button>

                    {/* AI Sonuç Kartı */}
                    {aiResult && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-in fade-in duration-300">
                        <p className="text-[11px] font-black text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <Sparkles size={12} /> AI ANALİZ SONUÇLARI
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {aiResult.total_area_m2 && (
                            <div className="bg-white rounded-lg p-2.5 border border-emerald-100">
                              <p className="text-[9px] font-bold text-emerald-500 uppercase">Toplam Alan</p>
                              <p className="text-sm font-black text-slate-800">{aiResult.total_area_m2} m²</p>
                            </div>
                          )}
                          {aiResult.block_count && (
                            <div className="bg-white rounded-lg p-2.5 border border-emerald-100">
                              <p className="text-[9px] font-bold text-emerald-500 uppercase">Blok Sayısı</p>
                              <p className="text-sm font-black text-slate-800">{aiResult.block_count}</p>
                            </div>
                          )}
                          {aiResult.floor_count && (
                            <div className="bg-white rounded-lg p-2.5 border border-emerald-100">
                              <p className="text-[9px] font-bold text-emerald-500 uppercase">Kat Sayısı</p>
                              <p className="text-sm font-black text-slate-800">{aiResult.floor_count}</p>
                            </div>
                          )}
                          {aiResult.unit_count && (
                            <div className="bg-white rounded-lg p-2.5 border border-emerald-100">
                              <p className="text-[9px] font-bold text-emerald-500 uppercase">Daire Sayısı</p>
                              <p className="text-sm font-black text-slate-800">{aiResult.unit_count}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <hr className="border-slate-100" />

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
                            headers: {
                              'User-Agent': 'MpandoApp/1.0'
                            }
                          });
                          const data = await res.json();
                          if (data && data.length > 0) {
                            const lat = data[0].lat;
                            const lon = data[0].lon;
                            onChange({ target: { name: 'location_lat', value: lat } });
                            onChange({ target: { name: 'location_lng', value: lon } });
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
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            <Save size={16} />
            Projeyi Ekle
          </button>
        </div>

      </div>
    </div>
  );
};

export default NewProjectModal;
