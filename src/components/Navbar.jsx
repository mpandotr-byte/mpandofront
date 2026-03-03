import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  ChevronDown,
  Menu,
  X,
  Trash2,
  CheckCircle,
  User,
  LogOut,
  Settings,
  UserCircle
} from 'lucide-react';

const initialMockNotifications = [
  {
    id: 1,
    title: "Yeni Ödeme Alındı",
    text: "Ahmet Yılmaz tarafından AKSU Rezidans A Blok 12 Nolu daire için 50.000₺ tutarında peşinat ödemesi sisteme girildi.",
    sender: "Finans Departmanı",
    time: "5 dk önce",
    unread: true
  },
  {
    id: 2,
    title: "Satış Onayı",
    text: "A Blok 12 Nolu dairenin satışı yönetici tarafından onaylanmıştır.",
    sender: "Sistem",
    time: "1 saat önce",
    unread: true
  },
  {
    id: 3,
    title: "Yeni Stok Talebi",
    text: "Şantiye alanından yeni bir malzeme talebi oluşturuldu: Çimento (100 Torba).",
    sender: "Şantiye Şefi",
    time: "3 saat önce",
    unread: false
  },
  {
    id: 4,
    title: "Proje Güncellemesi",
    text: "Dolunay Yaşam Merkezi projesinin teslim tarihi güncellenmiştir.",
    sender: "Proje Yöneticisi",
    time: "1 gün önce",
    unread: false
  },
];

function Navbar({ title = "Genel Bakış", toggleMobileMenu }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialMockNotifications);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const profileDropdownRef = useRef(null);
  const notificationsDropdownRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    setSelectedNotification(notif);
    setIsModalOpen(true);
    setIsNotificationsOpen(false);
  };

  const handleDeleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <>
      <nav className="fixed top-0 left-0 w-full md:sticky md:left-auto z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 transition-all duration-300">
        <div className="flex items-center justify-between px-4 md:px-6 py-3.5">

          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-slate-500 hover:text-[#D36A47] hover:bg-[#D36A47]/10 rounded-xl transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex flex-col">
              <h1 className="text-base md:text-lg font-extrabold text-[#0A1128] tracking-tight">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">

            {/* Notifications */}
            <div className="relative" ref={notificationsDropdownRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2.5 rounded-xl transition-all duration-300 group ${isNotificationsOpen
                  ? 'bg-[#0A1128] text-white shadow-lg shadow-black/20'
                  : 'text-slate-500 hover:text-[#D36A47] hover:bg-slate-100'
                  }`}
              >
                <Bell className={`w-[19px] h-[19px] transition-transform duration-300 ${isNotificationsOpen ? 'scale-110' : 'group-hover:rotate-12'}`} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D36A47] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D36A47] border-2 border-white"></span>
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-[calc(100vw-32px)] sm:w-[360px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-50 animate-in fade-in zoom-in duration-200 origin-top-right overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100/60 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-10">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Bildirim Merkezi</h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Toplam {notifications.length} bildirim bulunmaktadır</p>
                    </div>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-black tracking-wider uppercase bg-[#D36A47] text-white px-2 py-1 rounded-md shadow-sm shadow-[#D36A47]/20">
                        {unreadCount} Yeni
                      </span>
                    )}
                  </div>

                  <div className="max-h-[380px] overflow-y-auto custom-scrollbar bg-slate-50/20">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-slate-50">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`group relative px-5 py-4 hover:bg-white transition-all cursor-pointer border-l-4 ${notif.unread ? 'border-l-[#D36A47] bg-[#D36A47]/5' : 'border-l-transparent'
                              }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm ${notif.unread ? 'text-slate-900 font-bold' : 'text-slate-700 font-semibold'} group-hover:text-indigo-600 transition-colors`}>
                                {notif.title}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded-md group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
                                {notif.time}
                              </span>
                            </div>
                            <p className={`text-xs leading-relaxed line-clamp-2 ${notif.unread ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                              {notif.text}
                            </p>
                            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 text-[10px] font-bold text-indigo-500">
                              Detayı Gör <ChevronDown className="w-3 h-3 rotate-270" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                          <Bell className="w-8 h-8 text-slate-200" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">Harika Haber!</h4>
                        <p className="text-xs text-slate-500 mt-1">Şu anda yeni bir bildirim bulunmuyor. Her şey yolunda!</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100/60 p-3 bg-white">
                    <button
                      onClick={() => window.location.href = '/messages'}
                      className="group w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-all"
                    >
                      Tüm Bildirimleri Yönet
                      <Settings className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1" />

            {/* Profile */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 pl-2 pr-2 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0A1128] to-[#1E293B] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-black/20">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <span className="hidden md:block text-sm font-semibold text-slate-700">{user?.full_name}</span>
                <ChevronDown className={`hidden md:block w-4 h-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl shadow-black/10 border border-slate-100 z-50 animate-scale-in overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <p className="text-sm font-bold text-slate-900">{user?.full_name || 'Kullanıcı'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors font-medium">
                      <UserCircle size={16} className="text-slate-400" /> Profil
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors font-medium">
                      <Settings size={16} className="text-slate-400" /> Ayarlar
                    </button>
                  </div>

                  <div className="border-t border-slate-100">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors font-medium"
                    >
                      <LogOut size={16} /> Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Notification Detail Modal */}
      {isModalOpen && selectedNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-scale-in">

            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h2 className="text-lg font-bold text-slate-800">{selectedNotification.title}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/50">
                {selectedNotification.text}
              </p>

              <div className="mt-5 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1.5">
                  <User size={14} className="text-slate-400" />
                  <span className="font-semibold text-slate-700">{selectedNotification.sender}</span>
                </div>
                <span>{selectedNotification.time}</span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
              <button
                onClick={() => handleDeleteNotification(selectedNotification.id)}
                className="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors"
              >
                <Trash2 size={15} /> Sil
              </button>

              <button
                onClick={() => handleMarkAsRead(selectedNotification.id)}
                disabled={!selectedNotification.unread}
                className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border transition-colors ${selectedNotification.unread
                  ? 'text-white bg-[#D36A47] border-[#D36A47] hover:bg-[#B95839]'
                  : 'text-slate-400 bg-slate-50 border-slate-200 cursor-not-allowed'
                  }`}
              >
                <CheckCircle size={15} />
                {selectedNotification.unread ? 'Okundu İşaretle' : 'Okundu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;