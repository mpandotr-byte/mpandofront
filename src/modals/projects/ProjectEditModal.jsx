import React from 'react';
import {
  X,
  Save,
  Building2,
  Briefcase,
  Home,
  Info,
  Calendar,
  CalendarCheck,
  MapPin,
  ChevronDown,
  AlignLeft
} from 'lucide-react';

const ProjectEditModal = ({
  isOpen,
  projectData,
  contractors,
  onClose,
  onChange,
  onSave
}) => {
  // Modal açık değilse veya veri yoksa hiçbir şey render etme
  if (!isOpen || !projectData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">

        {/* --- Header --- */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Projeyi Düzenle</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {projectData.id ? `#${projectData.id} numaralı` : 'Seçili'} proje kaydını güncelliyorsunuz.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- Form Body (Scrollable) --- */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form
            id="edit-project-form"
            onSubmit={(e) => { e.preventDefault(); onSave(); }}
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
                  <label className="text-sm font-medium text-slate-700">Proje Adı</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building2 size={16} />
                    </div>
                    <input
                      type="text"
                      name="company" // Kodunuzdaki name alanı
                      value={projectData.company || ''}
                      onChange={onChange}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Müteahhit */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Müteahhit / Firma</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Briefcase size={16} />
                    </div>
                    <select
                      name="contractor_id"
                      value={projectData.contractor_id ?? ''}
                      onChange={onChange}
                      className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm text-slate-700 appearance-none cursor-pointer"
                    >
                      <option value="">Seçiniz</option>
                      {(contractors || []).map(c => (
                        <option key={c.id} value={c.id}>
                          {c.full_name || c.name || c.email}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
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
                      value={projectData.status || 'Devam Ediyor'}
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
                      value={projectData.startDate || ''}
                      onChange={onChange}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm text-slate-700"
                    />
                  </div>
                </div>

                {/* Bitiş Tarihi (Sadece Tamamlandı ise görünür) */}
                {projectData.status === 'Tamamlandı' ? (
                  <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
                    <label className="text-sm font-medium text-slate-700">Bitiş Tarihi</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <CalendarCheck size={16} />
                      </div>
                      <input
                        type="date"
                        name="endDate"
                        value={projectData.endDate || ''}
                        onChange={onChange}
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm text-slate-700"
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
                        if (!projectData.address) return alert("Lütfen önce bir adres girin.");
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(projectData.address)}`, {
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
                      value={projectData.address || ''}
                      onChange={onChange}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Koordinatlar */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Enlem (Latitude)</label>
                  <input
                    type="text"
                    name="location_lat"
                    value={projectData.location_lat || ''}
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
                    value={projectData.location_lng || ''}
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
                value={projectData.description || ''}
                onChange={onChange}
                rows="3"
                className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm resize-none"
              ></textarea>
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
            form="edit-project-form"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            <Save size={16} />
            Değişiklikleri Kaydet
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProjectEditModal;