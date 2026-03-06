import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
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
  AlertCircle,
  Send,
  MoreVertical,
  Paperclip,
  Plus,
  Users,
  Megaphone
} from 'lucide-react';

// Örnek Kullanıcılar / Konuşmalar
const initialConversations = [
  {
    id: 1,
    user: {
      id: 101,
      name: "Ahmet Yılmaz",
      role: "Şantiye Şefi",
      avatar: null,
      online: true
    },
    lastMessage: "Çimento sevkiyatı yola çıktı mı?",
    time: "5 dk önce",
    unreadCount: 2,
    messages: [
      { id: 1, text: "Selam Ahmet, şantiyedeki son durum nedir?", senderId: "me", time: "10:30" },
      { id: 2, text: "Selamlar. Temel betonu döküldü, kurumasını bekliyoruz.", senderId: 101, time: "10:35" },
      { id: 3, text: "Eline sağlık. Yarınki çimento sevkiyatı için onay verdim.", senderId: "me", time: "10:40" },
      { id: 4, text: "Çimento sevkiyatı yola çıktı mı?", senderId: 101, time: "14:30" },
    ]
  },
  {
    id: 2,
    user: {
      id: 102,
      name: "Mehmet Demir",
      role: "Muhasebe",
      avatar: null,
      online: false
    },
    lastMessage: "Ödeme makbuzu ektedir.",
    time: "1 saat önce",
    unreadCount: 0,
    messages: [
      { id: 1, text: "Mehmet Bey, AKSU projesinin hakkediş raporunu gönderiyorum.", senderId: "me", time: "09:00" },
      { id: 2, text: "Aldım, kontrol edip ödemeyi geçeceğim.", senderId: 102, time: "09:15" },
      { id: 3, text: "Ödeme makbuzu ektedir.", senderId: 102, time: "13:45" },
    ]
  },
  {
    id: 3,
    user: {
      id: 103,
      name: "Zeynep Kaya",
      role: "Proje Müdürü",
      avatar: null,
      online: true
    },
    lastMessage: "Toplantı saat 15:00'e alındı.",
    time: "3 saat önce",
    unreadCount: 1,
    messages: [
      { id: 1, text: "Yeni revizeler geldi mi?", senderId: "me", time: "11:00" },
      { id: 2, text: "Evet, sisteme yükledim kontrol edebilirsin.", senderId: 103, time: "11:10" },
      { id: 3, text: "Toplantı saat 15:00'e alındı.", senderId: 103, time: "11:20" },
    ]
  }
];

function Messages() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConv, setSelectedConv] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  // Sayfa yüklendiğinde veya sohbet değiştiğinde en alta kaydır
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Arama
  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mesaj Gönderme
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    const msg = {
      id: Date.now(),
      text: newMessage,
      senderId: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => prev.map(c => {
      if (c.id === selectedConv.id) {
        return {
          ...c,
          messages: [...c.messages, msg],
          lastMessage: newMessage,
          time: "Az önce"
        };
      }
      return c;
    }));

    // Seçili sohbeti de güncelle (ekrana anlık yansıması için)
    setSelectedConv(prev => ({
      ...prev,
      messages: [...prev.messages, msg]
    }));

    setNewMessage('');
  };

  const handleSelectConversation = (conv) => {
    setSelectedConv(conv);
    // Okunmamışları sıfırla
    setConversations(prev => prev.map(c =>
      c.id === conv.id ? { ...c, unreadCount: 0 } : c
    ));
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />

      <main className="flex-1 flex flex-col h-screen">
        <Navbar title="İletişim & Mesajlar" toggleMobileMenu={toggleMobileMenu} />

        <div className="flex-1 p-0 lg:p-6 xl:p-8 overflow-hidden">
          <div className="h-full flex flex-col gap-6">

            {/* Page Header */}
            <div className="hidden lg:flex flex-col md:flex-row md:items-center justify-between gap-5 px-4 md:px-0">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-black text-[#0A1128] tracking-tight">Mesaj Merkezi</h1>
                <p className="text-sm text-slate-500 font-medium">Ekibinizle anlık iletişim kurun ve süreçleri yönetin.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center justify-center gap-2 px-5 py-3 bg-[#0A1128] text-white rounded-2xl font-bold text-sm transition-all hover:bg-slate-900 shadow-lg shadow-slate-200">
                  <Megaphone size={18} />
                  <span className="hidden sm:inline">Tümüne Duyuru Yap</span>
                </button>
                <button className="flex items-center justify-center w-12 h-12 bg-[#D36A47] text-white rounded-2xl font-bold transition-all hover:bg-[#C25936] shadow-lg shadow-[#D36A47]/20">
                  <Plus size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white lg:rounded-[32px] lg:border border-slate-200/60 lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex overflow-hidden lg:border-b-8 lg:border-b-[#0A1128]/5 shadow-inner">

              {/* SOL PANEL: KONUŞMA LİSTESİ */}
              <div className={`w-full lg:w-[320px] xl:w-[380px] flex flex-col border-r border-slate-100 bg-white ${selectedConv ? 'hidden lg:flex' : 'flex'}`}>

                {/* Arama Barı */}
                <div className="p-5 border-b border-slate-50">
                  <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D36A47] transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="Kullanıcı veya departman ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm transition-all outline-none focus:ring-2 focus:ring-[#D36A47]/10"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {filteredConversations.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                      {filteredConversations.map((conv) => (
                        <div
                          key={conv.id}
                          onClick={() => handleSelectConversation(conv)}
                          className={`group relative p-5 cursor-pointer transition-all duration-300 hover:bg-slate-50 ${selectedConv?.id === conv.id ? 'bg-slate-50' : ''}`}
                        >
                          <div className="flex gap-4">
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 rounded-2xl bg-[#0A1128] text-white flex items-center justify-center font-bold text-lg shadow-inner">
                                {conv.user.name.charAt(0)}
                              </div>
                              {conv.user.online && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="text-sm font-black text-[#0A1128] truncate">{conv.user.name}</h4>
                                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">{conv.time}</span>
                              </div>
                              <p className="text-[10px] text-[#D36A47] font-black uppercase tracking-widest mb-1">{conv.user.role}</p>
                              <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-[#0A1128] font-black' : 'text-slate-400 font-medium'}`}>
                                {conv.lastMessage}
                              </p>
                            </div>
                            {conv.unreadCount > 0 && (
                              <div className="flex-shrink-0 flex items-center">
                                <div className="w-5 h-5 rounded-full bg-[#D36A47] text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-[#D36A47]/20">
                                  {conv.unreadCount}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                      <Users size={40} className="text-slate-100 mb-4" />
                      <h4 className="text-sm font-bold text-slate-400">Sonuç Bulunamadı</h4>
                    </div>
                  )}
                </div>
              </div>

              {/* SAĞ PANEL: SOHBET EKRANI */}
              <div className={`flex-1 flex flex-col bg-slate-50/30 ${!selectedConv ? 'hidden lg:flex' : 'flex'}`}>
                {selectedConv ? (
                  <>
                    <div className="flex items-center justify-between p-4 md:p-6 border-b border-white bg-white/60 backdrop-blur-md">
                      <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedConv(null)} className="lg:hidden p-2 text-slate-500 hover:text-[#0A1128]">
                          <ArrowLeft size={20} />
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-[#0A1128] text-white flex items-center justify-center font-bold">
                          {selectedConv.user.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-[#0A1128] leading-tight">{selectedConv.user.name}</h3>
                          <p className="text-[10px] font-bold text-[#D36A47] uppercase tracking-wider">{selectedConv.user.role}</p>
                        </div>
                      </div>
                      <button className="p-2.5 text-slate-400 hover:text-[#0A1128] hover:bg-white rounded-xl transition-all">
                        <MoreVertical size={20} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-90">
                      {selectedConv.messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[80%] md:max-w-[70%] space-y-1">
                            <div className={`px-5 py-3.5 rounded-3xl text-sm font-medium shadow-sm ${msg.senderId === 'me' ? 'bg-[#0A1128] text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                              }`}>
                              {msg.text}
                            </div>
                            <div className={`flex items-center gap-2 px-1 ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{msg.time}</span>
                              {msg.senderId === 'me' && <CheckCircle2 size={12} className="text-emerald-500" />}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 md:p-6 bg-white border-t border-slate-100">
                      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <button type="button" className="p-3 text-slate-400 hover:text-[#D36A47] hover:bg-slate-50 rounded-2xl transition-all">
                          <Paperclip size={20} />
                        </button>
                        <div className="flex-1 relative flex items-center">
                          <input
                            type="text"
                            placeholder="Mesajınızı yazın..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="w-full pl-5 pr-14 py-4 bg-slate-50 border-none rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-[#D36A47]/5 focus:bg-white transition-all outline-none"
                          />
                          <button type="submit" disabled={!newMessage.trim()} className="absolute right-2 p-3 bg-[#D36A47] text-white rounded-full shadow-lg hover:bg-[#C25936] disabled:bg-slate-200 transition-all active:scale-90">
                            <Send size={18} />
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white/40 backdrop-blur-sm">
                    <div className="relative mb-10">
                      <div className="absolute inset-0 bg-[#D36A47]/5 rounded-full blur-[80px] animate-pulse"></div>
                      <div className="relative w-32 h-32 bg-white rounded-[40px] shadow-2xl flex items-center justify-center border border-slate-50">
                        <MailOpen size={56} className="text-[#D36A47]/20" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-[#0A1128] mb-2">Ekibinizle Sohbet Edin</h3>
                    <p className="text-sm text-slate-500 max-w-[280px] mx-auto font-medium">Soldaki listeden bir ekip arkadaşınızı seçerek yazışmaya başlayabilirsiniz.</p>
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
