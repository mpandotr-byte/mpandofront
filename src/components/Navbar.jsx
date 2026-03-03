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
        <div className="flex items-center justify-between px-6 py-3.5">

          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight hidden md:block">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">

            {/* Notifications */}
            <div className="relative" ref={notificationsDropdownRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2.5 rounded-xl transition-all ${isNotificationsOpen ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-[340px] bg-white rounded-2xl shadow-xl shadow-black/10 border border-slate-100 z-50 animate-scale-in overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                    <h3 className="text-sm font-bold text-slate-800">Bildirimler</h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                        {unreadCount} Yeni
                      </span>
                    )}
                  </div>

                  <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`px-4 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-none group ${notif.unread ? 'bg-indigo-50/30' : ''}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-start gap-2.5">
                              {notif.unread && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />}
                              <p className={`text-sm ${notif.unread ? 'text-slate-800 font-bold' : 'text-slate-700 font-medium'}`}>
                                {notif.title}
                              </p>
                            </div>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap pt-0.5">{notif.time}</span>
                          </div>
                          <p className={`text-xs mt-1 line-clamp-2 ${notif.unread ? 'ml-4' : ''} ${notif.unread ? 'text-slate-600' : 'text-slate-500'}`}>
                            {notif.text}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-sm text-slate-400">
                        Hiç bildiriminiz yok.
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/50">
                    <button
                      onClick={() => window.location.href = '/messages'}
                      className="w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      Tüm mesajları göster
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
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/20">
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
                    ? 'text-indigo-700 bg-indigo-50 border-indigo-100 hover:bg-indigo-100'
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