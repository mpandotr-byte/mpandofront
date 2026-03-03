import React from 'react';
import {
  X,
  Building2,
  User,
  Phone,
  Tag,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Pencil,
  FileText,
  Banknote,
  Download,
  Eye
} from 'lucide-react'; 

const SaleDetailsModal = ({ isOpen, onClose, data, onEdit }) => {
  if (!isOpen || !data) return null;

  // Satış durumu için renk ve ikon belirleme
  const getStatusBadge = (status) => {
    let classes = 'bg-slate-100 text-slate-600 border-slate-200';
    let icon = null;

    if (status === 'Satıldı') {
      classes = 'bg-green-50 text-green-700 border-green-200';
      icon = <CheckCircle2 size={14} />;
    } else if (status === 'Beklemede') {
      classes = 'bg-yellow-50 text-yellow-700 border-yellow-200';
      icon = <Clock size={14} />;
    } else if (status === 'İptal' || status === 'Reddedildi') {
      classes = 'bg-red-50 text-red-700 border-red-200';
      icon = <XCircle size={14} />;
    }

    return (
      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${classes}`}>
        {icon} {status}
      </span>
    );
  };

  // Tarih formatlama
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; 
      return date.toLocaleDateString('tr-TR');
    } catch (e) {
      return dateString;
    }
  };

  // Para birimi formatlama
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === '') return '-';
    if (typeof amount === 'string' && amount.includes('₺')) return amount;
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Backend ilişkisel verilerini eşleştirme (Fallback'ler ile birlikte)
  const projectName = data.projects?.name || data.projectName || '-';
  const customerName = data.customers?.full_name || data.customerName || '-';
  const customerPhone = data.customers?.phone || data.customerPhone || '-';
  const contractFile = data.contract_file || data.units?.contract_file;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">

        {/* --- Header --- */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Satış Detayları</h2>
            <p className="text-xs text-slate-500 mt-0.5">Kayıt ID: #{data.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- İçerik --- */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">

          {/* Özet Kartı */}
          <div className="flex justify-between items-start bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div>
              <h3 className="text-lg font-bold text-blue-900">{projectName}</h3>
              <div className="flex items-center gap-2 text-blue-700/70 text-sm mt-1 font-medium">
                <Tag size={14} /> {data.interested_product || '-'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-slate-800 mb-1">
                {formatCurrency(data.offered_price || data.offerAmount)}
              </div>
              <div className="flex justify-end">
                {getStatusBadge(data.sale_status || data.status)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sol Kolon: Müşteri Bilgileri */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                <User size={14} /> Müşteri Bilgileri
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-2"><User size={14} /> Ad Soyad</span>
                  <span className="font-medium text-slate-800 text-right">{customerName}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-2"><Phone size={14} /> Telefon</span>
                  <span className="font-medium text-slate-800 text-right">{customerPhone}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-2"><Banknote size={14} /> Bütçe Aralığı</span>
                  <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-100">
                    {data.budget_range || data.budgetRange || '-'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Sağ Kolon: Satış & Sözleşme Bilgileri */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                <Building2 size={14} /> Satış & Sözleşme
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-2"><Calendar size={14} /> Satış Tarihi</span>
                  <span className="font-medium text-slate-800 text-right">{formatDate(data.sale_date || data.saleDate)}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-2"><FileText size={14} /> Sözleşme No</span>
                  <span className="font-medium text-slate-800 text-right">{data.contract_no || data.units?.contract_no || data.contractNo || '-'}</span>
                </li>
                {/* Sözleşme Dosyası Varsa Göster */}
                {contractFile && (
                  <li className="flex justify-between items-center pt-1">
                    <span className="text-slate-500 flex items-center gap-2"><FileText size={14} /> Sözleşme Dosyası</span>
                    <div className="flex gap-2">
                      <a href={contractFile} target="_blank" rel="noopener noreferrer" className="text-blue-600 bg-blue-50 p-1.5 rounded hover:bg-blue-100 transition" title="Görüntüle">
                        <Eye size={16} />
                      </a>
                      <a href={contractFile} download className="text-slate-600 bg-white border border-slate-200 p-1.5 rounded hover:bg-slate-50 transition" title="İndir">
                        <Download size={16} />
                      </a>
                    </div>
                  </li>
                )}
              </ul>
            </div>
            
          </div>

          {/* Notlar */}
          {data.notes && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notlar / Açıklama</h4>
              <p className="text-sm text-slate-600 bg-yellow-50/50 p-3 rounded-lg border border-yellow-100 whitespace-pre-wrap">
                {data.notes}
              </p>
            </div>
          )}
        </div>

        {/* --- Footer --- */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Kapat
          </button>
          <button
            onClick={() => { onClose(); onEdit(data); }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            <Pencil size={14} /> Düzenle
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default SaleDetailsModal;