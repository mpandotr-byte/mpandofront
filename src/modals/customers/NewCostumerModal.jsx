import React from 'react';
import {
  X,
  Save,
  User,
  Phone,
  Mail,
  Building2,
  Briefcase,
  MapPin,
  IdCard,
  ChevronDown
} from 'lucide-react';

export default function NewCustomerModal({
  isOpen,
  onClose,
  newCustomerData,
  onChange,
  onAdd,
  companies = [],
  employees = []
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">

        {/* --- Header --- */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Yeni Müşteri Ekle</h2>
            <p className="text-xs text-slate-500 mt-0.5">Sisteme yeni bir müşteri kaydı oluşturun.</p>
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
            id="new-customer-form"
            onSubmit={(e) => { e.preventDefault(); onAdd(); }}
            className="space-y-6"
          >

            {/* Bölüm 1: Kişisel ve İletişim Bilgileri */}
            <div>
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <User size={14} /> Kişisel ve İletişim Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Müşteri Adı Soyadı */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Müşteri Adı Soyadı <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      name="full_name"
                      value={newCustomerData.full_name || ''}
                      onChange={onChange}
                      placeholder="Örn: Ahmet Yılmaz"
                      required
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* TC Kimlik No */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">TC Kimlik No</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <IdCard size={16} />
                    </div>
                    <input
                      type="text"
                      name="identity_number"
                      value={newCustomerData.identity_number || ''}
                      onChange={onChange}
                      placeholder="11 Haneli TC Kimlik"
                      maxLength={11}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Telefon Numarası */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Telefon Numarası <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={newCustomerData.phone || ''}
                      onChange={onChange}
                      placeholder="05XX XXX XX XX"
                      required
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* E-posta */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">E-posta</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={newCustomerData.email || ''}
                      onChange={onChange}
                      placeholder="ornek@email.com"
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Bölüm 2: Adres Bilgileri */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" /> Adres Detayı
              </label>
              <textarea
                name="address"
                value={newCustomerData.address || ''}
                onChange={onChange}
                rows="3"
                placeholder="Müşteriye ait açık adres bilgisi..."
                className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400 resize-none"
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
            form="new-customer-form"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            <Save size={16} />
            Müşteriyi Ekle
          </button>
        </div>

      </div>
    </div>
  );
}