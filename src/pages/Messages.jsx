import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import {
  Search,
  Trash2,
  CheckCircle,
  User,
  Clock,
  Mail,
  MailOpen,
  ArrowLeft,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Örnek Mesaj Verileri
const initialMessages = [
  {
    id: 1,
    title: "Yeni Ödeme Alındı",
    text: "Ahmet Yılmaz tarafından AKSU Rezidans A Blok 12 Nolu daire için 50.000₺ tutarında peşinat ödemesi sisteme girildi. Finans departmanı onayı beklenmektedir.",
    sender: "Finans Departmanı",
    time: "5 dk önce",
    date: "12 Eki 2023, 14:30",
    unread: true,
    type: "finance"
  },
  {
    id: 2,
    title: "Satış Onayı",
    text: "A Blok 12 Nolu dairenin satışı yönetici tarafından onaylanmıştır. Sözleşme sürecine geçebilirsiniz. Lütfen gerekli evrakları hazırlayarak müşteriye iletin.",
    sender: "Sistem",
    time: "1 saat önce",
    date: "12 Eki 2023, 13:45",
    unread: true,
    type: "system"
  },
  {
    id: 3,
    title: "Yeni Stok Talebi: Çimento",
    text: "Şantiye alanından yeni bir malzeme talebi oluşturuldu: Çimento (100 Torba). Lütfen satın alma birimini bilgilendirin ve tedarik sürecini başlatın.",
    sender: "Şantiye Şefi",
    time: "3 saat önce",
    date: "12 Eki 2023, 11:20",
    unread: false,
    type: "stock"
  },
  {
    id: 4,
    title: "Proje Güncellemesi: Dolunay Yaşam Merkezi",
    text: "Dolunay Yaşam Merkezi projesinin teslim tarihi hava koşulları sebebiyle 15 gün güncellenmiştir. Detayları proje sayfasından inceleyebilirsiniz. İlgili müşterilere otomatik bilgilendirme e-postası gönderilecektir.",
    sender: "Proje Yöneticisi",
    time: "1 gün önce",
    date: "11 Eki 2023, 09:15",
    unread: false,
    type: "project"
  },
  {
    id: 5,
    title: "Aylık Rapor Özeti",
    text: "Eylül ayı satış ve pazarlama performans raporunuz hazırlandı. İncelemek için dokümanlar sekmesini ziyaret edebilirsiniz.",
    sender: "Yönetim",
    time: "3 gün önce",
    date: "09 Eki 2023, 16:00",
    unread: false,
    type: "system"
  }
];

// Tip ikonları belirleme
const getTypeIcon = (type) => {
  switch (type) {
    case 'finance': return <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={20} /></div>;
    case 'stock': return <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><AlertCircle size={20} /></div>;
    default: return <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Mail size={20} /></div>;
  }
}

function Messages() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Arama ve Filtreleme
  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.sender.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'unread' ? msg.unread : true;
    return matchesSearch && matchesFilter;
  });

  // Mesaja Tıklama
  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    // Tıklandığında otomatik okundu yap
    if (msg.unread) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, unread: false } : m));
    }
  };

  // Silme İşlemi
  const handleDelete = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
    }
  };

  // Tümünü Okundu İşaretle
  const markAllAsRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, unread: false })));
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />

      <main className="flex-1 flex flex-col h-screen">
        <Navbar title="İletişim & Bildirimler" toggleMobileMenu={toggleMobileMenu} />

        <div className="flex-1 p-4 md:p-8 overflow-hidden">
          <div className="h-full flex flex-col gap-6">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Mesaj Merkezi</h1>
                <p className="text-sm text-slate-500 font-medium">Tüm sistem bildirimlerini ve mesajlarını buradan yönetebilirsiniz.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group flex-1 md:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Gönderen veya konu ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl text-sm transition-all outline-none shadow-sm"
                  />
                </div>
                <button
                  onClick={markAllAsRead}
                  className="hidden md:flex items-center gap-2 whitespace-nowrap px-4 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-2xl font-bold text-sm transition-all duration-300 shadow-sm"
                >
                  <CheckCircle size={18} />
                  Tümünü Okundu İşaretle
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex overflow-hidden border-b-8 border-b-indigo-500/10">

              {/* SOL PANEL: MESAJ LİSTESİ */}
              <div className={`w-full md:w-[380px] lg:w-[420px] flex flex-col border-r border-slate-100 bg-slate-50/10 ${selectedMessage ? 'hidden md:flex' : 'flex'}`}>

                {/* Filtre Tabları */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex gap-2 p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-2xl">
                    <button
                      onClick={() => setFilter('all')}
                      className={`flex-1 text-sm font-bold py-2 rounded-xl transition-all duration-300 ${filter === 'all' ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Tümü
                    </button>
                    <button
                      onClick={() => setFilter('unread')}
                      className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold py-2 rounded-xl transition-all duration-300 ${filter === 'unread' ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Okunmamış
                      {messages.filter(m => m.unread).length > 0 && (
                        <span className="min-w-[20px] h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black px-1 animate-pulse">
                          {messages.filter(m => m.unread).length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {filteredMessages.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                      {filteredMessages.map((msg) => (
                        <div
                          key={msg.id}
                          onClick={() => handleSelectMessage(msg)}
                          className={`group relative p-5 cursor-pointer transition-all duration-300 hover:bg-white border-l-4 ${selectedMessage?.id === msg.id
                              ? 'bg-white border-l-indigo-500 shadow-sm z-10'
                              : 'border-l-transparent hover:border-l-slate-200'
                            } ${msg.unread ? 'bg-indigo-50/10' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${msg.type === 'finance' ? 'bg-emerald-50 text-emerald-600' :
                                msg.type === 'stock' ? 'bg-amber-50 text-amber-600' :
                                  'bg-indigo-50 text-indigo-600'
                              }`}>
                              {msg.sender}
                            </span>
                            <span className={`text-[10px] font-bold ${msg.unread ? 'text-indigo-600' : 'text-slate-400'}`}>
                              {msg.time}
                            </span>
                          </div>
                          <h4 className={`text-sm mb-1.5 truncate group-hover:text-indigo-600 transition-colors ${msg.unread ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                            {msg.title}
                          </h4>
                          <p className={`text-xs line-clamp-2 leading-relaxed ${msg.unread ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                            {msg.text}
                          </p>

                          {msg.unread && (
                            <div className="absolute top-1/2 right-4 -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full shadow-lg shadow-indigo-200" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mb-4 transform rotate-12 transition-transform hover:rotate-0">
                        <MailOpen size={36} className="text-slate-200" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">Sonuç Bulunamadı</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Arama kriterlerinize uygun mesaj bulunmuyor.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* SAĞ PANEL: MESAJ DETAYLARI */}
              <div className={`flex-1 flex flex-col bg-white ${!selectedMessage ? 'hidden md:flex' : 'flex'}`}>

                {selectedMessage ? (
                  <>
                    <div className="flex items-center justify-between p-5 border-b border-slate-100">
                      <button
                        onClick={() => setSelectedMessage(null)}
                        className="md:hidden flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl transition-all hover:bg-slate-200"
                      >
                        <ArrowLeft size={18} /> Geri Dön
                      </button>

                      <div className="flex items-center gap-2 ml-auto">
                        <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                          <Mail size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(selectedMessage.id)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300"
                        >
                          <Trash2 size={18} /> Bu Mesajı Sil
                        </button>
                      </div>
                    </div>

                    {/* Mesaj İçeriği */}
                    <div className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar">
                      <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
                          <div className="transform transition-transform hover:scale-110">
                            {getTypeIcon(selectedMessage.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className="text-[10px] font-black tracking-widest uppercase bg-slate-900 text-white px-2 py-1 rounded-md shadow-lg shadow-slate-200">
                                {selectedMessage.type}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 italic">
                                {selectedMessage.date}
                              </span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-800 leading-tight mb-3">
                              {selectedMessage.title}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-slate-500 font-bold bg-indigo-50/30 self-start px-4 py-2 rounded-2xl border border-indigo-100/50">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white">
                                  {selectedMessage.sender.charAt(0)}
                                </div>
                                <span className="text-slate-700">{selectedMessage.sender}</span>
                              </div>
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-200"></span>
                              <div className="flex items-center gap-2">
                                <Clock size={16} className="text-indigo-400" />
                                <span>{selectedMessage.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-indigo-500 rounded-full opacity-20"></div>
                          <div className="bg-white rounded-[32px] p-8 text-base text-slate-700 leading-relaxed shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] border border-slate-100/60 relative overflow-hidden group">
                            {/* Süsleme Arka Plan */}
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 group-hover:opacity-60 transition-opacity"></div>

                            <p className="relative z-10 whitespace-pre-wrap">
                              {selectedMessage.text}
                            </p>
                          </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-100">
                          <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Önerilen Aksiyonlar</h5>
                          <div className="flex flex-wrap gap-4">
                            <button className="group flex items-center gap-3 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-200 hover:bg-slate-900 hover:shadow-slate-200 transition-all duration-500 border border-transparent">
                              İlgili Bölüme Giderek İncele
                              <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="flex items-center gap-3 px-6 py-3.5 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-extrabold text-sm hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all duration-300">
                              Mesajı Arşivle
                            </button>
                            <button className="flex items-center gap-3 px-6 py-3.5 bg-slate-50 text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all">
                              Yöneticiye Bildir
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/20 p-10 text-center">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
                      <div className="relative w-32 h-32 bg-white rounded-[40px] shadow-2xl shadow-indigo-100 flex items-center justify-center transform hover:rotate-6 transition-transform duration-500 border border-slate-100">
                        <Mail size={60} className="text-indigo-500" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Seçili Mesaj Yok</h3>
                    <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                      Okumak istediğiniz bildirimi sol listeden seçerek detaylarına ulaşabilir, hızlı aksiyonlar alabilirsiniz.
                    </p>
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default Messages;