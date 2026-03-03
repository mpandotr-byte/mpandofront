import React from 'react';
import {
  X,
  Building,
  MapPin,
  User,
  Phone,
  Tag,
  Calendar,
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  Pencil,
  Users,
  FileText
} from 'lucide-react';

const SecondHandDetailsModal = ({ isOpen, onClose, data, onEdit }) => {
  if (!isOpen || !data) return null;
  const getStatusBadge = (status) => {
    let classes = 'bg-slate-100 text-slate-600 border-slate-200';
    let icon = null;

    if (status === 'Aktif') {
      classes = 'bg-green-50 text-green-700 border-green-200';
      icon = <CheckCircle2 size={14} />;
    } else if (status === 'Opsiyonlu') {
      classes = 'bg-yellow-50 text-yellow-700 border-yellow-200';
      icon = <Clock size={14} />;
    } else if (status === 'Pasif' || status === 'Satıldı' || status === 'Kiralandı') {
      classes = 'bg-red-50 text-red-700 border-red-200';
      icon = <XCircle size={14} />;
    }

    return (
      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${classes}`}>
        {icon} {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}.${month}.${year}`;
    } catch (e) {
      console.error("Tarih formatlama hatası:", dateString, e);
      return dateString;
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">İlan Detayları</h2>
            <p className="text-xs text-slate-500 mt-0.5">Kayıt ID: #{data.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* İçerik */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">

          {/* Özet Kartı */}
          <div className="flex justify-between items-start bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div>
              <h3 className="text-lg font-bold text-blue-900">{data.projectName}</h3>
              <div className="flex items-center gap-2 text-blue-700/70 text-sm mt-1">
                <MapPin size={14} /> {data.location || 'Konum bilgisi yok'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-slate-800 mb-1">{data.price}</div>
              {getStatusBadge(data.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sol Kolon: Mülk Bilgileri */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                <Building size={14} /> Mülk Bilgileri
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-2"><Tag size={14} /> Tip</span>
                  <span className="font-medium text-slate-800">{data.type}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-2"><Building size={14} /> Blok/Daire</span>
                  <span className="font-medium text-slate-800">{data.block} / {data.flat}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-2"><Calendar size={14} /> Tarih</span>
                  <span className="font-medium text-slate-800">{formatDate(data.createdAt)}</span>
                </li>
              </ul>
            </div>

            {/* Sağ Kolon: Taraf Bilgileri */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                <Users size={14} /> Taraf Bilgileri
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-2"><User size={14} /> Ev Sahibi</span>
                  <span className="font-medium text-slate-800">{data.ownerName}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-2"><Phone size={14} /> Ev Sahibi Telefon</span>
                  <span className="font-medium text-slate-800">{data.ownerPhone || '-'}</span>
                </li>

                {/* Kiracı/Alıcı Bilgileri (Koşullu Render) */}
                {data.buyerName && (
                  <>
                    <div className="border-t border-slate-200 !my-2"></div>
                    <li className="flex justify-between">
                      <span className="text-slate-500 flex items-center gap-2"><User size={14} /> Kiracı/Alıcı</span>
                      <span className="font-medium text-slate-800">{data.buyerName}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-500 flex items-center gap-2"><Phone size={14} /> Kiracı/Alıcı Telefon</span>
                      <span className="font-medium text-slate-800">{data.buyerPhone || '-'}</span>
                    </li>
                  </>
                )}

                <div className="border-t border-slate-200 !my-2"></div>
                <li className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-2"><User size={14} /> Danışman</span>
                  <span className="font-medium text-slate-800">{data.agentName}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Yeni Bölüm: Sözleşme Bilgileri */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText size={14} /> Sözleşme Bilgileri
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div className="bg-white p-2 rounded border border-slate-100">
                <span className="text-xs text-slate-500 block">Başlangıç Tarihi</span>
                <span className="font-bold text-slate-800">{formatDate(data.contractStartDate)}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-100">
                <span className="text-xs text-slate-500 block">Bitiş Tarihi</span>
                <span className="font-bold text-slate-800">{formatDate(data.contractEndDate)}</span>
              </div>
            </div>
          </div>


          {/* Finansal Bilgiler */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Wallet size={14} /> Finansal Detaylar
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white p-2 rounded border border-slate-100">
                <span className="text-xs text-slate-500 block">Fiyat</span>
                <span className="font-bold text-slate-800">{data.price}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-100">
                <span className="text-xs text-slate-500 block">Depozito</span>
                <span className="font-bold text-slate-800">{data.deposit || '-'}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-100">
                <span className="text-xs text-slate-500 block">Komisyon</span>
                <span className="font-bold text-slate-800">{data.commission || '-'}</span>
              </div>
            </div>
          </div>

          {/* Notlar */}
          {data.notes && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notlar</h4>
              <p className="text-sm text-slate-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                {data.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Kapat
          </button>
          <button
            onClick={() => { onClose(); onEdit(data); }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
          >
            <Pencil size={14} /> Düzenle
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecondHandDetailsModal;