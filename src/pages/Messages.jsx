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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans text-slate-800">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />

      <main className="flex-1 flex flex-col h-screen md:pt-0">
        <Navbar title="Mesajlar ve Bildirimler" toggleMobileMenu={toggleMobileMenu} />

        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-hidden flex flex-col">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-1 overflow-hidden h-full">

            {/* SOL PANEL: MESAJ LİSTESİ */}
            <div className={`w-full md:w-[350px] lg:w-[400px] flex-col border-r border-slate-200 bg-slate-50/30 ${selectedMessage ? 'hidden md:flex' : 'flex'}`}>

              {/* Liste Başlığı ve Arama */}
              <div className="p-4 border-b border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-800">Gelen Kutusu</h2>
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    Tümünü Okundu İşaretle
                  </button>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Mesajlarda ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none"
                  />
                </div>

                {/* Filtre Tabları */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                  <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all ${filter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Tümü
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-md transition-all ${filter === 'unread' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Okunmamış
                    {messages.filter(m => m.unread).length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">{messages.filter(m => m.unread).length}</span>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg)}
                      className={`p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-white ${selectedMessage?.id === msg.id ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                        } ${msg.unread ? 'bg-slate-50/80' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm truncate pr-2 ${msg.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                          {msg.sender}
                        </span>
                        <span className={`text-xs whitespace-nowrap ${msg.unread ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                          {msg.time}
                        </span>
                      </div>
                      <h4 className={`text-sm mb-1 truncate ${msg.unread ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                        {msg.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center flex flex-col items-center justify-center h-full text-slate-400">
                    <MailOpen size={40} className="mb-3 opacity-20" />
                    <p className="text-sm font-medium">Mesaj bulunamadı.</p>
                  </div>
                )}
              </div>
            </div>
            <div className={`flex-1 flex-col bg-white ${!selectedMessage ? 'hidden md:flex' : 'flex'}`}>

              {selectedMessage ? (
                <>
                  <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="md:hidden flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg"
                    >
                      <ArrowLeft size={16} /> Geri
                    </button>

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => handleDelete(selectedMessage.id)}
                        className="flex items-center gap-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} /> Sil
                      </button>
                    </div>
                  </div>

                  {/* Mesaj İçeriği */}
                  <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    <div className="flex items-start gap-4 mb-8">
                      {getTypeIcon(selectedMessage.type)}
                      <div className="flex-1">
                        <h1 className="text-xl font-bold text-slate-800 mb-1">
                          {selectedMessage.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><User size={14} /> {selectedMessage.sender}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="flex items-center gap-1"><Clock size={14} /> {selectedMessage.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 text-sm text-slate-700 leading-relaxed shadow-sm">
                      {selectedMessage.text}
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Hızlı Aksiyonlar</p>
                      <div className="flex gap-3">
                        <button className="text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors">
                          İlgili Sayfaya Git
                        </button>
                        <button className="text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors">
                          Arşive Taşı
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                    <Mail size={40} className="text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-600 mb-1">Gelen Kutusu</h3>
                  <p className="text-sm text-slate-400">Okumak için sol taraftan bir mesaj seçin.</p>
                </div>
              )}

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default Messages;